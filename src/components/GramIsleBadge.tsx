"use client";

import React, { useEffect, useRef, useState, CSSProperties } from "react";
import * as Icons from "lucide-react";
import styles from "../styles/components/GramIsleBadge.module.css";

/* -------------------------------------------------------------
 *  GramIsleBadge — a miniature “dynamic‑island”‑style counter
 * ------------------------------------------------------------- */
export interface GramIsleBadgeProps {
  /** 표시할 숫자 */
  count: number;
  /** 강조 색상 – 기본 #6366F1 (indigo‑500) */
  accent?: string;
  /** lucide‑react 아이콘 이름(케밥/스네이크/카멜 모두 OK) */
  icon?: string;
  /** 높이(px) – 기본 28 */
  size?: number;
}

/** kebab / snake / camel → PascalCase */
const toPascal = (s: string) =>
  s
    .replace(/[_-]+/g, " ")
    .replace(/\w+/g, w => w[0].toUpperCase() + w.slice(1))
    .replace(/\s+/g, "");

const GramIsleBadge: React.FC<GramIsleBadgeProps> = ({
  count,
  accent = "#6366F1",
  icon = "bookmark",
  size = 28,
}) => {
  /* ───────── scale‑bounce 애니메이션 ───────── */
  const [pulse, setPulse] = useState(false);
  const prev = useRef(count);

  useEffect(() => {
    if (count > prev.current) {
      setPulse(true);
      /* 애니메이션 한 사이클(≈600 ms) 후 class 제거 */
      const t = setTimeout(() => setPulse(false), 600);
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count]);

  /* 아이콘 동적 선택 (lucide‑react) */
  const IconCmp =
    // @ts‑expect-error — 런타임에 확인
    (Icons as any)[toPascal(icon)] || Icons.Bookmark;

  /* 동적 style */
  const h = size;
  const pillStyle: CSSProperties = {
    height: h,
    paddingLeft: h * 0.5,
    paddingRight: h * 0.5,
    borderRadius: h / 2,
    color: accent,
    boxShadow: `0 2px 4px ${accent}33`,
  };

  return (
    <span
      className={`${styles.container} ${pulse ? styles.pulse : ""}`}
      style={pillStyle}
    >
      <IconCmp
        size={h * 0.55}
        color={accent}
        style={{ marginRight: 6, flexShrink: 0 }}
      />
      <span
        className={styles.count}
        style={{ fontSize: h * 0.5 + 2, color: accent }}
      >
        {count}
      </span>
    </span>
  );
};

export default GramIsleBadge;
