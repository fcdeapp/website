// components/FlipNumber.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

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
      <style jsx>{`
        .flipWrap {
          display: inline-flex;
          font-size: 3rem;
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
  // 0–9를 loops회 반복 후 최종 숫자 스택 생성
  const stack: string[] = [];
  for (let i = 0; i < loops; i++) {
    stack.push(...Array.from({ length: 10 }, (_, n) => String(n)));
  }
  stack.push(finalChar);

  const steps = stack.length - 1;
  // 각 스텝마다 translateY 값 (퍼센트)
  const keyframes = stack.map((_, i) => `-${i * 100}%`);
  // 앞은 빠르게, 뒤는 느리게 (ease times)
  const times = stack.map((_, i) => Math.pow(i / steps, 2));

  return (
    <span className="digit">
      <motion.span
        initial={{ y: "0%" }}
        animate={{ y: keyframes }}
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
