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
  const wrapRef = useRef(null);
  const play = useInView(wrapRef, { once: true, margin: "-20% 0px" }); // 화면 중앙 근처에서 트리거
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
            play={play}
          />
        ) : (
          <span key={idx}>{ch}</span>
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
      `}</style>
    </span>
  );
}

/* ───────── Digit (한 글자) ───────── */
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
  /* 0‑9 → loops바퀴 → 최종 숫자 스택 */
  const stack: string[] = [];
  for (let i = 0; i < loops; i++)
    stack.push(...Array.from({ length: 10 }, (_, n) => String(n)));
  stack.push(finalChar);

  const steps = stack.length - 1;
  const keyframes = stack.map((_, i) => `${-i * 100}%`); // ← 첫 값은 "0%"

  /* 처음 빠르고 끝이 느린 가속 커브 */
  const times = stack.map((_, i) => (i / steps) ** 2);

  return (
    <span className="digit">
      <motion.span
        initial={{ translateY: "0%" }}
        animate={play ? { translateY: keyframes } : { translateY: "0%" }}
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
