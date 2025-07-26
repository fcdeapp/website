// components/FlipNumber.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

interface Props {
  target: string | number;   // 최종 표시할 문자열 (예: "54 %")
  duration?: number;         // 전체 애니메이션 시간(ms) – 기본 1200
  loops?: number;            // 0–9 몇 바퀴 돌릴지 – 기본 2
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
          <Digit key={idx} finalChar={ch} duration={duration} loops={loops} />
        ) : (
          <span key={idx} className="unit">{ch}</span>
        )
      )}

      <style jsx>{`
        .flipWrap {
          display: inline-flex;
          font-size: 3rem;      /* 숫자 크기 */
          font-weight: 400;
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

interface DigitProps {
  finalChar: string;
  duration: number;
  loops: number;
}

function Digit({ finalChar, duration, loops }: DigitProps) {
  // 0–9를 loops회 반복한 뒤 최종 문자 스택 생성
  const stack: string[] = [];
  for (let i = 0; i < loops; i++) {
    stack.push(...Array.from({ length: 10 }, (_, n) => String(n)));
  }
  stack.push(finalChar);

  const steps = stack.length - 1;
  const keyframes = stack.map((_, i) => `-${i * 100}%`);
  // 앞은 빠르게, 뒤는 느리게: (i/steps)^2
  const times = stack.map((_, i) => Math.pow(i / steps, 2));

  return (
    <span className="digit">
      <motion.span
        initial={{ y: "0%" }}
        whileInView={{ y: keyframes }}
        viewport={{ once: true, amount: 0.5 }}
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
