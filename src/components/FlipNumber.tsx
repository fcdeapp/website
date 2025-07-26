// components/FlipNumber.tsx
"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Props {
  target: string | number;   // 예: "54 %"
  duration?: number;         // 총 재생 시간(ms) – 기본 1200
  loops?: number;            // 0‑9 몇 바퀴 돌릴지 – 기본 2
}

export default function FlipNumber({
  target,
  duration = 1200,
  loops = 2,
}: Props) {
  // 1) 전체 래퍼를 감시
  const wrapRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(wrapRef, { once: true, amount: 0.5 });

  const chars = String(target).split("");

  return (
    <span ref={wrapRef} className="flipWrap">
      {chars.map((ch, idx) =>
        /\d/.test(ch) ? (
          <Digit
            key={idx}
            finalChar={ch}
            duration={duration}
            loops={loops}
            play={inView}
          />
        ) : (
          <span key={idx} className="unit">{ch}</span>
        )
      )}
      <style jsx>{`
        .flipWrap {
          display: inline-flex;
          font-size: 3rem;        /* 숫자 크기 */
          font-weight: 700;
          color: #d8315b;
          line-height: 1;
        }
        .unit {
          display: inline-block;
          font-size: 0.6em;       /* % 기호 작게 */
          transform: translateY(-0.1em);
        }
      `}</style>
    </span>
  );
}

function Digit({
  finalChar,
  duration,
  loops,
  play,
}: {
  finalChar: string;
  duration: number;
  loops: number;
  play: boolean;
}) {
  // 2) 0–9 를 loops 회 + finalChar 스택
  const stack: string[] = [];
  for (let i = 0; i < loops; i++) {
    stack.push(...Array.from({ length: 10 }, (_, n) => String(n)));
  }
  stack.push(finalChar);

  const steps = stack.length - 1;
  const keyframes = stack.map((_, i) => `-${i * 100}%`);
  const times = stack.map((_, i) => Math.pow(i / steps, 2));

  return (
    <span className="digit">
      <motion.span
        initial={{ y: "0%" }}
        animate={play ? { y: keyframes } : { y: "0%" }}
        transition={{
          duration: duration / 1000,
          times,
          ease: "linear",
        }}
      >
        {stack.map((c, i) => (
          <span className="line" key={i}>
            {c}
          </span>
        ))}
      </motion.span>

      <style jsx>{`
        .digit {
          display: inline-block;
          width: 0.75em;
          height: 1em;
          overflow: hidden;
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
