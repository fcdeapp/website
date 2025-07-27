"use client";

import React, { useState, useEffect } from "react";
import classNames from "classnames";
import { FiCheck, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/MultipleChoiceOptions.module.css";

export interface Choice {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

interface Props {
  choices: Choice[];
  /** 사용자가 항목을 고르면 바로 호출 (전송 등) */
  onSelect: (choice: Choice) => void;
  /** “퀴즈 끄기” 클릭 */
  onDisable: () => void;
  /** 애니메이션 종료 후 오버레이 닫기 */
  onClose: () => void;
}

const MultipleChoiceOptions: React.FC<Props> = ({
  choices,
  onSelect,
  onDisable,
  onClose,
}) => {
  const { t } = useTranslation();
  const [picked, setPicked] = useState<string | null>(null);
  const [bouncing, setBouncing] = useState(false);

  // 애니메이션 길이(모바일과 동일: 0.12+0.12 ≈ 0.24s 한 번 *15 ≈ 3.6s)
  const CLOSE_DELAY = 3600;

  /** 선택 처리 */
  const handlePick = (c: Choice) => {
    if (picked) return; // 이미 고른 뒤엔 무시
    setPicked(c.text);
    setBouncing(true);
    onSelect(c);

    // 애니메이션(3.6 초) 후 오버레이 닫기
    setTimeout(() => {
      onClose();
    }, CLOSE_DELAY);
  };

  // bounce 애니메이션 한 번만 실행
  useEffect(() => {
    if (!bouncing) return;
    const t = setTimeout(() => setBouncing(false), 240); // 단‑발
    return () => clearTimeout(t);
  }, [bouncing]);

  return (
    <div className={styles.container}>
      {/* ───────── 헤더 ───────── */}
      <div className={styles.headerRow}>
        <span className={styles.headerText}>
          {t("mcq_prompt", "Pick the grammatically correct sentence")}
        </span>
        <button className={styles.disableBtn} onClick={onDisable}>
          {t("disable_quiz", "Turn off")}
        </button>
      </div>

      {/* ───────── 선택지 ───────── */}
      {choices.map((c, idx) => {
        const selected = picked === c.text;
        const correct  = selected && c.isCorrect;
        const wrong    = selected && !c.isCorrect;

        return (
          <React.Fragment key={`opt-${idx}`}>
            {wrong && c.explanation && (
              <p className={styles.explanation}>{c.explanation}</p>
            )}

            <button
              className={classNames(
                styles.option,
                selected && (correct ? styles.correct : styles.wrong),
                selected && bouncing && styles.bounce
              )}
              disabled={!!picked}
              onClick={() => handlePick(c)}
            >
              <span
                className={classNames(
                  styles.optionText,
                  selected && styles.optionTextSelected
                )}
              >
                {c.text}
              </span>

              {/* 결과 아이콘 */}
              {selected && (
                <span className={styles.resultIcon}>
                  {correct ? (
                    <FiCheck size={18} color="#31A24C" />
                  ) : (
                    <FiX size={18} color="#D8315B" />
                  )}
                </span>
              )}
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default MultipleChoiceOptions;
