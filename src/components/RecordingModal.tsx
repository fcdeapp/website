// components/RecordingModal.tsx
"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from "react";
import styles from "../styles/components/RecordingModal.module.css";
import { useConfig } from "../context/ConfigContext";
import Vosk from "vosk-browser";

// -----------------------------------------------------------------------------
// We don’t have built-in TS types for some Web Audio API nodes,
// so we’ll let TypeScript treat Vosk imports as `any` to silence errors.
// -----------------------------------------------------------------------------
type Issue = {
  error: string;
  suggestion: string;
  explanation: string;
};

type RecordingModalProps = {
  visible: boolean;
  onClose: () => void;
  languageCode: string; // e.g. 'en'
};

// The model directory under `public/` (e.g. public/models/vosk-model-small-en-us-0.15)
const MODEL_PATH = "/models/vosk-model-small-en-us-0.15";

const RecordingModal: React.FC<RecordingModalProps> = ({
  visible,
  onClose,
  languageCode,
}) => {
  const { SERVER_URL } = useConfig();

  // Treat Vosk as any so TS won't complain that Model/Recognizer don't exist
  const VoskAny = Vosk as any;

  // Vosk model & recognizer refs
  const [modelReady, setModelReady] = useState(false);
  const modelRef = useRef<any>(null);
  const recognizerRef = useRef<any>(null);

  // Recording flags
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoMode, setAutoMode] = useState(false);

  // 1) Finalized sentences
  const [sentences, setSentences] = useState<string[]>([]);
  // 2) Current partial transcript
  const [currentPartial, setCurrentPartial] = useState<string>("");

  // 3) Grammar issues per sentence index
  const [grammarIssues, setGrammarIssues] = useState<Record<number, Issue[]>>(
    {}
  );
  // 4) Loading flags for grammar check
  const [loadingCheck, setLoadingCheck] = useState<Record<number, boolean>>({});

  // 5) Timer for recording length
  const [recordSeconds, setRecordSeconds] = useState(0);
  const timerRef = useRef<number | null>(null);

  // 6) AudioContext & nodes for PCM capture
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 7) MediaRecorder for saving audio
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  // ----------------------------------------------------
  // Load Vosk model once when component mounts (visible === true)
  // ----------------------------------------------------
  useEffect(() => {
    if (!visible) return;
    let canceled = false;

    (async () => {
      try {
        // Construct the model; no explicit `init()` call needed in recent vosk-browser versions
        const model = new VoskAny.Model(MODEL_PATH);
        // If vosk-browser provided a `ready` promise, you could `await model.ready()`
        // but in many versions simply constructing the Model is sufficient.
        if (canceled) return;
        modelRef.current = model;

        // Create a Recognizer with the model at 16kHz
        const recognizer = new VoskAny.Recognizer(model, 16000);
        recognizerRef.current = recognizer;

        setModelReady(true);
      } catch (e) {
        console.error("Failed to load Vosk model:", e);
        setError("Failed to load speech recognition model.");
      }
    })();

    return () => {
      canceled = true;
      recognizerRef.current = null;
      modelRef.current = null;
      setModelReady(false);
    };
  }, [visible]);

  // ----------------------------------------------------
  // Timer helpers
  // ----------------------------------------------------
  const startTimer = () => {
    if (timerRef.current !== null) return;
    setRecordSeconds(0);
    timerRef.current = window.setInterval(() => {
      setRecordSeconds((prev) => prev + 1);
    }, 1000);
  };
  const stopTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const formatTime = (sec: number) => {
    const mm = String(Math.floor(sec / 60)).padStart(2, "0");
    const ss = String(sec % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // ----------------------------------------------------
  // Audio processing callback (ScriptProcessorNode)
  // ----------------------------------------------------
  const handleAudioProcess = (event: AudioProcessingEvent) => {
    const inputBuffer = event.inputBuffer.getChannelData(0);
    // Convert Float32Array[-1..1] to Int16Array
    const int16Buffer = new Int16Array(inputBuffer.length);
    for (let i = 0; i < inputBuffer.length; i++) {
      let s = inputBuffer[i];
      if (s > 1.0) s = 1.0;
      if (s < -1.0) s = -1.0;
      int16Buffer[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    const recognizer = recognizerRef.current;
    if (!recognizer) return;
    const isFinal = recognizer.acceptWaveform(int16Buffer);
    if (isFinal) {
      const res = recognizer.result();
      if (res && res.text) {
        setSentences((prev) => [...prev, res.text]);
      }
    } else {
      const partial = recognizer.partialResult();
      if (partial && partial.partial) {
        setCurrentPartial(partial.partial);
      }
    }
  };

  // ----------------------------------------------------
  // Start recording: set up AudioContext, ScriptProcessor, and MediaRecorder
  // ----------------------------------------------------
  const handleStart = async () => {
    if (!modelReady) {
      setError("Model is not ready yet.");
      return;
    }
    setError(null);
    setSentences([]);
    setCurrentPartial("");
    setGrammarIssues({});
    setLoadingCheck({});
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // --- AudioContext setup at 16kHz ---
      const audioCtx = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioCtx;
      const sourceNode = audioCtx.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      // ScriptProcessor buffer size 4096, mono in/out
      const scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
      scriptNode.onaudioprocess = handleAudioProcess;
      sourceNode.connect(scriptNode);
      scriptNode.connect(audioCtx.destination);
      scriptNodeRef.current = scriptNode;

      // --- MediaRecorder for saving audio ---
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };
      mediaRecorder.start(250);
      mediaRecorderRef.current = mediaRecorder;

      startTimer();
      setIsRecording(true);
    } catch (e) {
      console.error("getUserMedia error:", e);
      setError("Microphone access denied.");
    }
  };

  // ----------------------------------------------------
  // Stop recording: tear down audio nodes and stop MediaRecorder
  // ----------------------------------------------------
  const handleStop = () => {
    if (scriptNodeRef.current) {
      scriptNodeRef.current.disconnect();
      scriptNodeRef.current.onaudioprocess = null;
      scriptNodeRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }

    const recognizer = recognizerRef.current;
    if (recognizer) {
      const res = recognizer.finalResult();
      if (res && res.text) {
        setSentences((prev) => [...prev, res.text]);
      }
    }

    stopTimer();
    setIsRecording(false);
  };

  // ----------------------------------------------------
  // Auto grammar check when a new sentence ≥ 10 words arrives
  // ----------------------------------------------------
  useEffect(() => {
    if (!autoMode) return;
    const idx = sentences.length - 1;
    if (idx < 0) return;
    const wordCount = sentences[idx].trim().split(/\s+/).length;
    if (wordCount >= 10 && !loadingCheck[idx]) {
      checkGrammar(idx, sentences[idx]);
    }
  }, [sentences, autoMode, loadingCheck]);

  // ----------------------------------------------------
  // Grammar check API call
  // ----------------------------------------------------
  const checkGrammar = async (index: number, sentence: string) => {
    if (!sentence || loadingCheck[index]) return;
    setLoadingCheck((prev) => ({ ...prev, [index]: true }));
    try {
      const response = await fetch(`${SERVER_URL}/api/grammar-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sentence,
          languageCode: "en",
          uiLanguage: "en",
        }),
      });
      if (!response.ok) {
        setError("Server error during grammar check.");
        setGrammarIssues((prev) => ({ ...prev, [index]: [] }));
      } else {
        const result = await response.json();
        if (Array.isArray(result.errors)) {
          setGrammarIssues((prev) => ({
            ...prev,
            [index]: result.errors,
          }));
        } else {
          setGrammarIssues((prev) => ({ ...prev, [index]: [] }));
        }
      }
    } catch (e) {
      console.error("Grammar check failed:", e);
      setGrammarIssues((prev) => ({ ...prev, [index]: [] }));
    } finally {
      setLoadingCheck((prev) => ({ ...prev, [index]: false }));
    }
  };

  // ----------------------------------------------------
  // Highlight errors within a sentence
  // ----------------------------------------------------
  const renderHighlightedText = (sentence: string, issues: Issue[]) => {
    if (!issues || issues.length === 0) {
      return <span className={styles.bubbleText}>{sentence}</span>;
    }
    type SpanType = { text: string; isError: boolean; key: string };
    const spans: SpanType[] = [];
    let cursor = 0;
    const lowerSentence = sentence.toLowerCase();
    const sortedIssues = issues
      .map((issue) => {
        const errLower = issue.error.trim().toLowerCase();
        const pos = lowerSentence.indexOf(errLower, cursor);
        return pos >= 0 ? { ...issue, position: pos } : null;
      })
      .filter((x) => x !== null) as (Issue & { position: number })[];
    sortedIssues.sort((a, b) => a.position - b.position);

    sortedIssues.forEach((iss, idx) => {
      const { position, error: errText } = iss;
      if (cursor < position) {
        spans.push({
          text: sentence.slice(cursor, position),
          isError: false,
          key: `n-${idx}-${cursor}`,
        });
      }
      spans.push({
        text: sentence.slice(position, position + errText.length),
        isError: true,
        key: `e-${idx}-${position}`,
      });
      cursor = position + errText.length;
    });
    if (cursor < sentence.length) {
      spans.push({
        text: sentence.slice(cursor),
        isError: false,
        key: `last-${cursor}`,
      });
    }

    return (
      <span className={styles.bubbleText}>
        {spans.map((span) =>
          span.isError ? (
            <span key={span.key} className={styles.errorTextHighlight}>
              {span.text}
            </span>
          ) : (
            <span key={span.key}>{span.text}</span>
          )
        )}
      </span>
    );
  };

  // ----------------------------------------------------
  // Save all data (JSON + audio) and trigger downloads
  // ----------------------------------------------------
  const onSaveAll = useCallback(() => {
    const timestamp = new Date().toISOString();
    const payload = {
      date: timestamp,
      sentences,
      corrections: grammarIssues,
      audioUrl,
    };
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const safeName = `recording-${timestamp}`.replace(/[:]/g, "-");
    a.download = `${safeName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (audioUrl) {
      const b = document.createElement("a");
      b.href = audioUrl;
      b.download = `${safeName}.webm`;
      document.body.appendChild(b);
      b.click();
      document.body.removeChild(b);
    }
  }, [sentences, grammarIssues, audioUrl]);

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h2 className={styles.title}>Real-time Conversation Checker</h2>

        {!modelReady && (
          <div className={styles.loadingText}>Loading model...</div>
        )}

        <button
          className={`${styles.autoToggleButton} ${
            autoMode ? styles.autoToggleButtonActive : ""
          }`}
          onClick={() => setAutoMode((prev) => !prev)}
          disabled={!modelReady || isRecording}
        >
          {autoMode ? "Auto Check: ON" : "Auto Check: OFF"}
        </button>

        {!isRecording && audioUrl && (
          <button className={styles.saveButton} onClick={onSaveAll}>
            Save All
          </button>
        )}

        <div className={styles.infoRow}>
          <span className={styles.infoText}>{formatTime(recordSeconds)}</span>
          <span className={styles.infoText}>
            {sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) +
              (currentPartial.trim()
                ? currentPartial.trim().split(/\s+/).length
                : 0)}{" "}
            words
          </span>
        </div>

        <div className={styles.transcriptContainer}>
          {error && <div className={styles.errorText}>{error}</div>}

          {!error && sentences.length === 0 && !isRecording && (
            <div className={styles.placeholderText}>
              Click "Record" to start speaking...
            </div>
          )}

          {(!error && (sentences.length > 0 || isRecording)) && (
            <>
              {sentences.map((sent, idx) => (
                <div key={idx} className={styles.bubbleWithCheckRow}>
                  <div className={styles.bubbleContainer}>
                    {renderHighlightedText(sent, grammarIssues[idx] || [])}
                  </div>
                  <div className={styles.checkButtonWrapper}>
                    {!autoMode &&
                      !(grammarIssues[idx] && grammarIssues[idx].length > 0) &&
                      sent
                        .trim()
                        .split(/\s+/)
                        .filter((w) => w.length > 0).length >= 10 && (
                        <button
                          className={styles.checkButton}
                          onClick={() => checkGrammar(idx, sent)}
                        >
                          {loadingCheck[idx] ? (
                            <span className={styles.loader}></span>
                          ) : (
                            "Check"
                          )}
                        </button>
                      )}
                  </div>
                  {(grammarIssues[idx] || []).map((iss, i) => (
                    <div
                      key={`ex-${idx}-${i}`}
                      className={styles.errorExplanation}
                    >
                      • {iss.error} → {iss.suggestion} <br />
                      <span className={styles.errorParenText}>
                        ({iss.explanation})
                      </span>
                    </div>
                  ))}
                </div>
              ))}

              {isRecording && currentPartial !== "" && (
                <div className={styles.partialContainer}>
                  <span className={styles.partialText}>
                    {currentPartial}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.buttonsRow}>
          {isRecording ? (
            <button
              className={`${styles.button} ${styles.stopButton}`}
              onClick={handleStop}
            >
              Stop
            </button>
          ) : (
            <button
              className={`${styles.button} ${styles.recordButton}`}
              onClick={handleStart}
              disabled={!modelReady}
            >
              Record
            </button>
          )}

          <button
            className={`${styles.button} ${styles.closeButton}`}
            onClick={() => {
              if (isRecording) handleStop();
              onClose();
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingModal;
