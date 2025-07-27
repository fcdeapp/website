"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import styles from "../styles/components/FillQuiz.module.css";

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
  learnLanguage: string;
  started: boolean;
  onSubmit: (fixedSentence: string) => void;
}

/* ------------------------------------------------------------------ */
/* helpers                                                            */
/* ------------------------------------------------------------------ */
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getCorrectTokens = (sentence: string, issues: Issue[]) => {
  let txt = sentence;
  for (const { error, suggestion } of issues) {
    const re = new RegExp(escapeRegExp(error), "g");
    txt = txt.replace(re, suggestion);
  }
  return txt.replace(/\s+/g, " ").trim().split(" ");
};

const buildTemplate = (sentence: string, issues: Issue[]) => {
  const orig = sentence.trim().split(" ");
  const suggestionWords: string[] = [];
  issues.forEach(({ suggestion }) =>
    suggestionWords.push(...suggestion.trim().split(" ")),
  );

  const initial: string[] = [];
  let i = 0;
  while (i < orig.length) {
    const hit = issues.find(({ error }) => {
      const errWords = error.split(" ");
      return (
        orig.slice(i, i + errWords.length).join(" ").toLowerCase() ===
        error.toLowerCase()
      );
    });

    if (hit) {
      const sugLen = hit.suggestion.trim().split(" ").length;
      for (let k = 0; k < sugLen; k++) initial.push("");
      i += hit.error.trim().split(" ").length;
    } else {
      initial.push(orig[i]);
      i += 1;
    }
  }

  const blanks = initial
    .map((w, idx) => (w === "" ? idx : -1))
    .filter((x) => x >= 0);

  return { initialWords: initial, blankIndices: blanks, suggestionWords };
};

const formatTime = (sec: number) =>
  `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(
    sec % 60,
  ).padStart(2, "0")}`;

/* ------------------------------------------------------------------ */
/* component                                                          */
/* ------------------------------------------------------------------ */
const FillQuiz: React.FC<Props> = ({
  sentence,
  issues,
  learnLanguage,
  started,
  onSubmit,
}) => {
  const { t } = useTranslation();

  /* -------------------------- template ---------------------------- */
  const { initialWords, blankIndices, suggestionWords } = useMemo(
    () => buildTemplate(sentence, issues),
    [sentence, issues],
  );

  /* --------------------------- state ------------------------------ */
  const [words, setWords] = useState<string[]>(initialWords);
  const [suggested, setSuggested] = useState<string[]>(() =>
    [...suggestionWords].sort(() => Math.random() - 0.5),
  );
  const [attempts, setAttempts] = useState(3);
  const [hintCount, setHintCount] = useState(0);
  const [incorrectBlanks, setIncorrectBlanks] = useState<Set<number>>(
    new Set(),
  );
  const [activeDrop, setActiveDrop] = useState<number | null>(null);
  const [reveal, setReveal] = useState<string | null>(null);

  /* --------------------------- timer ------------------------------ */
  const startRef = useRef<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (started && !startRef.current) startRef.current = Date.now();
    const id = window.setInterval(() => {
      if (startRef.current)
        setElapsed(Math.floor((Date.now() - startRef.current) / 1e3));
    }, 1000);
    return () => window.clearInterval(id);
  }, [started]);

  /* --------------------------- drag ------------------------------- */
  const dragData = (w: string, idx: number) => JSON.stringify({ w, idx });

  const onDragStart = (w: string, idx: number) => (e: React.DragEvent) => {
    e.dataTransfer.setData("text/plain", dragData(w, idx));
    e.dataTransfer.effectAllowed = "move";
  };

  const allowDrop = (e: React.DragEvent) => e.preventDefault();

  const handleDropBlank =
    (blankIdx: number) => (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const raw = e.dataTransfer.getData("text/plain");
      if (!raw) return;
      const { w, idx: fromIdx } = JSON.parse(raw) as {
        w: string;
        idx: number;
      };
      if (words[blankIdx]) return; // already filled

      setWords((prev) => {
        const next = [...prev];
        next[blankIdx] = w;
        return next;
      });
      setSuggested((prev) => prev.filter((_, i) => i !== fromIdx));
      setActiveDrop(null);
    };

  /* ----------------------- click handlers ------------------------- */
  const fillFirstEmpty = (word: string, sIdx: number) => {
    const target = blankIndices.find((i) => words[i] === "");
    if (target === undefined) return;
    setWords((prev) => {
      const next = [...prev];
      next[target] = word;
      return next;
    });
    setSuggested((prev) => prev.filter((_, i) => i !== sIdx));
  };

  const removeFromBlank = (bIdx: number) => {
    if (!blankIndices.includes(bIdx)) return;
    const word = words[bIdx];
    if (!word) return;
    setWords((prev) => {
      const next = [...prev];
      next[bIdx] = "";
      return next;
    });
    setSuggested((prev) => [...prev, word]);
  };

  /* ------------------------- hint logic --------------------------- */
  const correctTokens = useMemo(
    () => getCorrectTokens(sentence, issues),
    [sentence, issues],
  );

  const handleHint = () => {
    setHintCount((h) => h + 1);
    const bad = new Set<number>();
    blankIndices.forEach((i) => {
      if (words[i] && words[i] !== correctTokens[i]) bad.add(i);
    });
    setIncorrectBlanks(bad);
  };

  /* ----------------------- answer check --------------------------- */
  const handleCheck = () => {
    const ok =
      words.length === correctTokens.length &&
      words.every((w, i) => w === correctTokens[i]);

    setAttempts((a) => a - 1);

    if (ok) {
      alert(t("well_done"));
      onSubmit(words.join(" "));
    } else {
      alert(t("try_again"));
      if (attempts - 1 === 0) {
        setReveal(correctTokens.join(" "));
      }
    }
  };

  /* ------------------------------------------------------------------ */
  /* render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div className={styles.card}>
      {/* attempts & timer */}
      <div className={styles.attemptRow}>
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className={classNames(styles.dot, {
              [styles.activeDot]: i < attempts,
            })}
          />
        ))}
        <span className={styles.timer}>{formatTime(elapsed)}</span>
      </div>

      {/* sentence row */}
      <div className={styles.sentence}>
        {words.map((w, i) =>
          blankIndices.includes(i) ? (
            <div
              key={`blank-${i}`}
              className={classNames(styles.blank, {
                [styles.blankActive]: activeDrop === i,
                [styles.blankWrong]: incorrectBlanks.has(i),
              })}
              onClick={() => removeFromBlank(i)}
              onDragOver={allowDrop}
              onDragEnter={() => setActiveDrop(i)}
              onDragLeave={() => setActiveDrop(null)}
              onDrop={handleDropBlank(i)}
            >
              {w && <span className={styles.filled}>{w}</span>}
            </div>
          ) : (
            <span key={`fixed-${i}`} className={styles.fixed}>
              {w}
            </span>
          ),
        )}
      </div>

      {/* suggestion chips */}
      <div className={styles.suggestions}>
        {suggested.map((w, i) => (
          <span
            key={`sug-${i}`}
            draggable
            onDragStart={onDragStart(w, i)}
            onClick={() => fillFirstEmpty(w, i)}
            className={styles.chip}
          >
            {w}
          </span>
        ))}
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

      {/* reveal / result */}
      {reveal && (
        <p className={styles.reveal}>{t("reveal_answer", { answer: reveal })}</p>
      )}
    </div>
  );
};

export default FillQuiz;
