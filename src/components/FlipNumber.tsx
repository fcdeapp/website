// components/FlipNumber.tsx
"use client";

import React, { useEffect, useState } from "react";

interface Props {
  /** 최종 표시할 문자열 (예: "54 %") */
  target: string | number;
  /** 전체 애니메이션 시간(ms) – 기본 1200 */
  duration?: number;
  /** 숫자 0–9 몇 바퀴 돌릴지 – 기본 2 */
  loops?: number;
}

export default function FlipNumber({
  target,
  duration = 1200,
  loops = 2,
}: Props) {
  const chars = String(target).split("");

  return (
    <span className="flipWrap">
      {chars.map((ch, idx) =>
        /\d/.test(ch) ? (
          <Digit
            key={idx}
            finalChar={ch}
            duration={duration}
            loops={loops}
          />
        ) : (
          <span key={idx} className="unit">
            {ch}
          </span>
        )
      )}

      {/* component‑scoped CSS */}
      <style jsx>{`
        .flipWrap {
          display: inline-flex;
          font-size: 3rem;
          font-weight: 300;
          color: #d8315b;
          line-height: 1;
        }
        .unit {
          display: inline-block;
          font-size: 0.6em;     /* % 기호 작게 */
          transform: translateY(-0.1em);
        }
      `}</style>
    </span>
  );
}

/* ───────────────────────── Digit ───────────────────────── */

interface DigitProps {
  finalChar: string; // '0'‑'9'
  duration: number;
  loops: number;
}

function Digit({ finalChar, duration, loops }: DigitProps) {
  /* 0–9를 loops회 반복 후 최종 숫자 추가 */
  const sequence: string[] = [];
  for (let i = 0; i < loops; i++) {
    sequence.push(...Array.from({ length: 10 }, (_, n) => String(n)));
  }
  sequence.push(finalChar);

  /* 현재 스텝(index) */
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (sequence.length < 2) return; // nothing to animate

    const stepMs = duration / (sequence.length - 1);
    const timer = setInterval(() => {
      setIdx((prev) => {
        if (prev === sequence.length - 1) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, stepMs);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** translateY 퍼센트 (한 줄 높이 = 100%) */
  const translateY = -idx * 100;

  return (
    <span className="digit">
      <span
        className="stack"
        style={{ transform: `translateY(${translateY}%)` }}
      >
        {sequence.map((c, i) => (
          <span className="line" key={i}>
            {c}
          </span>
        ))}
      </span>

      {/* scoped CSS */}
      <style jsx>{`
        .digit {
          display: inline-block;
          width: 0.75em;
          height: 1em;
          overflow: hidden;
        }
        .stack {
          display: block;
          transition: transform ${duration / 1000}s linear;
        }
        .line {
          display: block;
          height: 1em;
          line-height: 1em;
          text-align: center;
        }
      `}</style>
    </span>
  );
}
