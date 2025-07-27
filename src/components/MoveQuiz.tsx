"use client";

import React, {
  useState,
  useRef,
  useEffect,
  DragEvent,
  MouseEvent,
  useCallback,
} from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import {
  ensureIndexedIssues,
  buildCorrectTokens,
  applyIssues,
} from "../utils/grammarUtils";

import styles from "../styles/components/MoveQuiz.module.css";

/* ------------------------------------------------------------------ */
/* types                                                              */
/* ------------------------------------------------------------------ */
export interface Issue {
  error: string;
  suggestion: string;
  explanation: string;
  index?: number;
}
interface Props {
  sentence: string;
  issues: Issue[];
  started: boolean;
  learnLanguage: string;
  onSubmit: (correctSentence: string) => void;
}

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */
const EMOJI_REGEX = /\p{Emoji_Presentation}/gu;
const sanitize = (raw: string) =>
  raw.replace(EMOJI_REGEX, "").trim() || null;

const splitWords = (line: string) =>
  line
    .split(" ")
    .map(sanitize)
    .filter((w): w is string => !!w);

const formatTime = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(
    2,
    "0",
  )}`;

/* ------------------------------------------------------------------ */
/* component                                                          */
/* ------------------------------------------------------------------ */
const MoveQuiz: React.FC<Props> = ({
  sentence,
  issues,
  started,
  learnLanguage,
  onSubmit,
}) => {
  const { t } = useTranslation();

  /* -------------------------------- state ------------------------- */
  const originWords = splitWords(sentence);
  const [words, setWords] = useState<string[]>(originWords);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(3);
  const [hintCount, setHintCount] = useState(0);
  const [incorrectHint, setIncorrectHint] = useState<Set<number>>(new Set());
  const [elapsed, setElapsed] = useState(0);
  const [showAnswer, setShowAnswer] = useState<string | null>(null);
  const [correct, setCorrect] = useState(false);

  /* -------------------------------- timer ------------------------- */
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (started && !startRef.current) startRef.current = Date.now();
    const id = window.setInterval(() => {
      if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current) / 1e3));
    }, 1e3);
    return () => window.clearInterval(id);
  }, [started]);

  /* -------- init suggestion list (all “fix” tokens minus errors) -- */
  useEffect(() => {
    const sugg = issues.flatMap((it) => {
      const wrong = splitWords(it.error);
      return splitWords(it.suggestion).filter((tok) => !wrong.includes(tok));
    });
    setSuggested(sugg);
  }, [issues]);

  /* -------------------------------- drag utils -------------------- */
  const dragData = (src: "sentence" | "suggested", idx: number, word: string) =>
    JSON.stringify({ src, idx, word });

  const handleDragStart = (src: "sentence" | "suggested", idx: number, word: string) =>
    (e: DragEvent) => {
      e.dataTransfer.setData("text/plain", dragData(src, idx, word));
      e.dataTransfer.effectAllowed = "move";
      setDraggingId(`${src}-${idx}-${word}`);
    };

  const handleDragEnd = () => setDraggingId(null);

  /* droppable gap builder */
  const makeGap =
    (target: "sentence" | "suggested", idx: number) =>
    (e: DragEvent) => {
      e.preventDefault(); // allow drop
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw) return;
      const { src, idx: fromIdx, word } = JSON.parse(raw) as {
        src: "sentence" | "suggested";
        idx: number;
        word: string;
      };

      /* nothing changes */
      if (src === target && fromIdx === idx) return;

      let nextSentence = [...words];
      let nextSugg = [...suggested];

      /* remove item from its source list */
      if (src === "sentence") nextSentence.splice(fromIdx, 1);
      else nextSugg.splice(fromIdx, 1);

      /* insert into target list at index */
      if (target === "sentence") nextSentence.splice(idx, 0, word);
      else nextSugg.splice(idx, 0, word);

      setWords(nextSentence);
      setSuggested(nextSugg);
      setDraggingId(null);
    };

  const allowDrop = (e: DragEvent) => e.preventDefault();

  /* -------------------------------- answer check ------------------ */
  const correctTokens = applyIssues(sentence, ensureIndexedIssues(sentence, issues));
  const handleCheck = () => {
    if (attempts <= 0) return;
    const candidate = words.join(" ");
    const isOK = candidate === correctTokens.join(" ");
    setCorrect(isOK);

    if (!isOK) {
      alert(t("try_again"));
      if (attempts - 1 === 0) {
        setShowAnswer(correctTokens.join(" "));
      }
    } else {
      onSubmit(candidate);
    }
    setAttempts((a) => a - 1);
  };

  /* -------------------------------- hint -------------------------- */
  const getIncorrectHintIndices = useCallback((): Set<number> => {
    const wrong = new Set<number>();
    correctTokens.forEach((tok, i) => {
      if (words[i] !== tok) wrong.add(i);
    });
    return wrong;
  }, [words, correctTokens]);

  const handleHint = () => {
    setHintCount((h) => h + 1);
    setIncorrectHint(getIncorrectHintIndices());
  };

  /* ------------------------------------------------------------------ */
  /* render word chip                                                   */
  /* ------------------------------------------------------------------ */
  const Word = ({
    w,
    src,
    idx,
  }: {
    w: string;
    src: "sentence" | "suggested";
    idx: number;
  }) => (
    <span
      draggable
      onDragStart={handleDragStart(src, idx, w)}
      onDragEnd={handleDragEnd}
      className={classNames(styles.word, {
        [styles.wordSentence]: src === "sentence",
        [styles.wordSuggestion]: src === "suggested",
        [styles.dragging]:
          draggingId === `${src}-${idx}-${w}`,
      })}
    >
      {w}
      {incorrectHint.has(idx) && src === "sentence" && (
        <span className={styles.hintMark}>?</span>
      )}
    </span>
  );

  /* ------------------------------------------------------------------ */
  /* main JSX                                                           */
  /* ------------------------------------------------------------------ */
  return (
    <div className={styles.wrapper}>
      {/* attempts / timer */}
      <div className={styles.attemptRow}>
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className={classNames(styles.attemptDot, {
              [styles.activeDot]: i < attempts,
            })}
          />
        ))}
        <span className={styles.timer}>{formatTime(elapsed)}</span>
      </div>

      {/* sentence line */}
      <div
        className={styles.line}
        onDragOver={allowDrop}
      >
        {/* gaps BEFORE each word */}
        {words.map((_, i) => (
          <React.Fragment key={`gap-s-${i}`}>
            <span
              className={classNames(styles.gap, {
                [styles.gapActive]:
                  draggingId &&
                  draggingId.startsWith("sentence") &&
                  incorrectHint.has(i),
              })}
              onDragOver={allowDrop}
              onDrop={makeGap("sentence", i)}
            />
            <Word w={words[i]} src="sentence" idx={i} />
          </React.Fragment>
        ))}
        {/* trailing gap */}
        <span
          className={styles.gap}
          onDragOver={allowDrop}
          onDrop={makeGap("sentence", words.length)}
        />
      </div>

      {/* suggestion chips */}
      <div
        className={styles.suggestionLine}
        onDragOver={allowDrop}
      >
        {suggested.map((w, i) => (
          <React.Fragment key={`gap-t-${i}`}>
            <span
              className={styles.gapSmall}
              onDragOver={allowDrop}
              onDrop={makeGap("suggested", i)}
            />
            <Word w={w} src="suggested" idx={i} />
          </React.Fragment>
        ))}
        <span
          className={styles.gapSmall}
          onDragOver={allowDrop}
          onDrop={makeGap("suggested", suggested.length)}
        />
      </div>

      {/* buttons */}
      <div className={styles.btnRow}>
        <button className={styles.hintBtn} onClick={handleHint}>
          {t("hint_button")}
        </button>
        <button className={styles.checkBtn} onClick={handleCheck}>
          {t("check_answer_button")}
        </button>
      </div>

      {/* result */}
      {showAnswer && (
        <p className={styles.reveal}>
          {t("reveal_answer", { answer: showAnswer })}
        </p>
      )}
      {correct && (
        <p className={styles.correct}>{t("correct_answer")}</p>
      )}
    </div>
  );
};

export default MoveQuiz;
