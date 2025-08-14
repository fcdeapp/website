"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import styles from "../styles/components/GuideOverlay.module.css";

export type GuideStep = {
  key: string; // i18n prefix: .title / .desc
  target: { x: number; y: number; radius: number };
};

interface Props {
  visible: boolean;
  steps: GuideStep[];
  storageKey: string;         // localStorage key for "don't show again"
  onClose: () => void;
  onStepChange?: (index: number) => void; // optional fixed-camera mode
}

const GuideOverlay: React.FC<Props> = ({
  visible,
  steps,
  storageKey,
  onClose,
  onStepChange,
}) => {
  const { t } = useTranslation();

  // 1) 훅은 항상 호출
  const [idx, setIdx] = useState(0);

  // 2) 렌더 조건은 변수로
  const hiddenByPref =
    typeof window !== "undefined" &&
    localStorage.getItem(storageKey) === "hidden";
  const shouldRender = visible && !hiddenByPref && steps.length > 0;

  // 3) steps 변동 시 idx 보정 (Out-of-bounds 방지)
  useEffect(() => {
    if (idx > steps.length - 1) setIdx(0);
  }, [steps.length, idx]);

  // 4) 외부에 스텝 변경 알려주되, 오버레이 보일 때만
  useEffect(() => {
    if (shouldRender) onStepChange?.(idx);
  }, [idx, onStepChange, shouldRender]);

  // 5) 훅 호출 "이후"에 early return
  if (!shouldRender) return null;

  // 6) 이후부턴 안전하게 렌더 계산
  const step = steps[idx];
  const { innerWidth: W, innerHeight: H } =
    typeof window !== "undefined"
      ? window
      : ({ innerWidth: 0, innerHeight: 0 } as any);

  const MARGIN = 106;
  const CALLOUT_H = 150;

  const below = step.target.y + step.target.radius + MARGIN; // 기본: 아래
  const above = step.target.y - step.target.radius - CALLOUT_H; // 아래가 벗어나면 위
  const calloutTop =
    below + CALLOUT_H + MARGIN > H ? Math.max(above, MARGIN) : below;

  const portalRoot =
    typeof document !== "undefined"
      ? (document.getElementById("__next") as HTMLElement | null)
      : null;
  if (!portalRoot) return null;

  const handleDontShow = useCallback(() => {
    localStorage.setItem(storageKey, "hidden");
    onClose();
  }, [onClose, storageKey]);

  const next = () =>
    idx >= steps.length - 1 ? onClose() : setIdx((i) => i + 1);
  const prev = () => setIdx((i) => Math.max(0, i - 1));

  return createPortal(
    <div className={styles.overlay}>
      {/* spotlight mask */}
      <svg
        className={styles.svgLayer}
        width={W}
        height={H}
        aria-hidden
        focusable="false"
      >
        <defs>
          <mask id="guide-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            <circle
              cx={step.target.x}
              cy={onStepChange ? MARGIN + step.target.radius : step.target.y}
              r={step.target.radius}
              fill="black"
            />
          </mask>
        </defs>
        <rect
          className={styles.backdrop}
          x="0"
          y="0"
          width="100%"
          height="100%"
          mask="url(#guide-mask)"
        />
      </svg>

      {/* callout */}
      <div className={styles.callout} style={{ top: calloutTop }}>
        <h3 className={styles.title}>{t(`${step.key}.title`)}</h3>
        <p className={styles.desc}>{t(`${step.key}.desc`)}</p>

        <div className={styles.navRow}>
          <button
            className={classNames(styles.navBtn, idx === 0 && styles.disabled)}
            disabled={idx === 0}
            onClick={prev}
          >
            {t("guide.prev")}
          </button>
          <button className={styles.navBtn} onClick={next}>
            {idx === steps.length - 1 ? t("guide.finish") : t("guide.next")}
          </button>
        </div>

        <button className={styles.skip} onClick={handleDontShow}>
          {t("guide.dontShowAgain")}
        </button>
      </div>
    </div>,
    portalRoot
  );
};

export default GuideOverlay;