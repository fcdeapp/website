"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface Props {
  target: string | number;   // 예: "54 %"
  duration?: number;         // 전체 애니메이션(ms) – 기본 1200
  loops?: number;            // 0‑9 몇 바퀴? – 기본 2
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
          <Digit            /* 숫자일 때만 플립 */
            key={idx}
            finalChar={ch}
            duration={duration}
            loops={loops}
          />
        ) : (
          <span             /* % · 공백 등은 그대로 */
            key={idx}
            className={ch === "%" ? "unit" : undefined}
          >
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
        .unit {             /* % 기호는 더 작게 */
          font-size: 0.6em;
          transform: translateY(-0.1em);
        }
      `}</style>
    </span>
  );
}

/* ───────── Digit (단일 숫자) ───────── */
function Digit({
    finalChar,
    duration,
    loops,
  }: {
    finalChar: string;
    duration: number;
    loops: number;
  }) {
    /* 0‑9 → loops바퀴 → 최종 숫자 스택 */
    const stack: string[] = [];
    for (let i = 0; i < loops; i++)
      stack.push(...Array.from({ length: 10 }, (_, n) => String(n)));
    stack.push(finalChar);
  
    /* keyframes, times (앞부분 빠르고 끝에서 느려짐) */
    const steps = stack.length - 1;
    const keyframes = stack.map((_, i) => `${-i * 100}%`);
    const times = stack.map((_, i) => Math.pow(i / steps, 2));
  
    /* 👉 뷰포트 진입 감지 */
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  
    return (
      <span className="digit" ref={ref}>
        <motion.span
          initial={{ translateY: "0%" }}
          animate={inView ? { translateY: keyframes } : { translateY: "0%" }}
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