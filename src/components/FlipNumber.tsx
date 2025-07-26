// components/FlipNumber.tsx
"use client";

import { motion } from "framer-motion";

interface Props {
  target: string | number;   // "54 %" 처럼 문자 포함 가능
  duration?: number;         // ms (기본 1200)
  loops?: number;            // 0‒9 몇 번 돌릴지 (기본 2바퀴)
}

export default function FlipNumber({ target, duration = 1200, loops = 2 }: Props) {
  const chars = String(target).split("");

  return (
    <span className="flipWrap">
      {chars.map((ch, idx) =>
        /\d/.test(ch) ? (
          <Digit key={idx} finalChar={ch} duration={duration} loops={loops} />
        ) : (
          <span key={idx}>{ch}</span>
        )
      )}

      <style jsx>{`
        .flipWrap {
          display: inline-flex;
          font-size: 3rem;        /* 숫자 크기 */
          font-weight: 400;
          color: #d8315b;
          line-height: 1;
        }
      `}</style>
    </span>
  );
}

function Digit({
  finalChar,
  duration,
  loops,
}: {
  finalChar: string;
  duration: number;
  loops: number;
}) {
  /* 스택 만들기 : 0‒9 를 loops 회 + 최종 숫자 */
  const roll: string[] = [];
  for (let i = 0; i < loops; i++) roll.push(...Array.from({ length: 10 }, (_, n) => String(n)));
  roll.push(finalChar);

  const stepCnt = roll.length - 1;

  return (
    <span className="digit">
      <motion.span
        initial={{ translateY: "0%" }}
        animate={{ translateY: `-${stepCnt * 100}%` }}
        transition={{
          duration: duration / 1000,
          ease: `steps(${stepCnt}, end)`,
        }}
      >
        {roll.map((c, i) => (
          <span className="line" key={i}>
            {c}
          </span>
        ))}
      </motion.span>

      <style jsx>{`
        .digit {
          display: inline-block;
          width: 0.75em;        /* 자간 비슷하게 */
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
