"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import classNames from "classnames";
import styles from "../styles/components/GuideOverlay.module.css";

export type GuideStep = {
  /** i18n key prefix → expects “.title” and “.desc” under it */
  key: string;
  /** spotlight centre + radius (already measured by `useMeasure`) */
  target: { x: number; y: number; radius: number };
};

interface Props {
  visible: boolean;
  steps: GuideStep[];
  /** localStorage key to remember “don’t show again” */
  storageKey: string;
  onClose: () => void;
  /** optional fixed‑camera walkthrough */
  onStepChange?: (index: number) => void;
}

const GuideOverlay: React.FC<Props> = ({
  visible,
  steps,
  storageKey,
  onClose,
  onStepChange,
}) => {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(0);
  useEffect(() => { onStepChange?.(idx); }, [idx, onStepChange]);

  // ✅ 훅 호출 "이후"에 가드
  const hidden =
    typeof window !== "undefined" &&
    localStorage.getItem(storageKey) === "hidden";
  if (!visible || hidden || !steps.length) return null;

  /** ----------------------------------------------------------------- */
  /** skip forever                                                      */
  /** ----------------------------------------------------------------- */
  const handleDontShow = useCallback(() => {
    localStorage.setItem(storageKey, "hidden");
    onClose();
  }, [onClose, storageKey]);

  /** prev / next navigation */
  const next = () => idx >= steps.length - 1 ? onClose() : setIdx(i => i + 1);
  const prev = () => setIdx(i => Math.max(0, i - 1));

  /* ------------------------------------------------------------------ */
  /* geometry helpers                                                   */
  /* ------------------------------------------------------------------ */
  const step = steps[idx];
  const { innerWidth: W, innerHeight: H } = globalThis.window ?? { innerWidth: 0, innerHeight: 0 };

  const MARGIN = 106;
  const CALLOUT_H = 150;

  const below = step.target.y + step.target.radius + MARGIN;          // default (below)
  const above = step.target.y - step.target.radius - CALLOUT_H;       // if below is out of view
  const calloutTop =
    below + CALLOUT_H + MARGIN > H
      ? Math.max(above, MARGIN)
      : below;

  /* ------------------------------------------------------------------ */
  /* portal root                                                        */
  /* ------------------------------------------------------------------ */
  const portalRoot =
    typeof document !== "undefined"
      ? (document.getElementById("__next") as HTMLElement)
      : undefined;

  if (!portalRoot) return null;

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  return createPortal(
    <div className={styles.overlay}>

      {/* --- SVG mask (spotlight) ------------------------------------ */}
      <svg
        className={styles.svgLayer}
        width={W}
        height={H}
        aria-hidden
        focusable="false"
      >
        <defs>
          <mask id="guide-mask">
            {/* full white rectangle */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* punch the hole */}
            <circle
              cx={step.target.x}
              cy={onStepChange ? MARGIN + step.target.radius : step.target.y}
              r={step.target.radius}
              fill="black"
            />
          </mask>
        </defs>

        {/* dimmed / blurred backdrop */}
        <rect
          className={styles.backdrop}
          x="0"
          y="0"
          width="100%"
          height="100%"
          mask="url(#guide-mask)"
        />
      </svg>

      {/* --- call‑out box -------------------------------------------- */}
      <div
        className={styles.callout}
        style={{ top: calloutTop }}
      >
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
