"use client";

import { motion } from "framer-motion";

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
  /* 0‑9 를 loops바퀴 돌리고 마지막에 목표 숫자 삽입 */
  const stack: string[] = [];
  for (let i = 0; i < loops; i++)
    stack.push(...Array.from({ length: 10 }, (_, n) => String(n)));
  stack.push(finalChar);

  const steps = stack.length - 1;        // 이동해야 할 단계 수
  const keyframes = stack.map((_, i) => `${-i * 100}%`);  // "0%" → "-100%" …

  /* 처음엔 촘촘, 끝으로 갈수록 느려지는 가속 커브 */
  const times = stack.map((_, i) => (i / steps) ** 2);

  return (
    <span className="digit">
      <motion.span
        initial={{ translateY: "0%" }}
        whileInView={{ translateY: keyframes }}   /* 뷰포트에 들어올 때 시작 */
        viewport={{ once: true, amount: 0.6 }}
        transition={{
          duration: duration / 1000,              // ms → s
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
          width: 0.75em;     /* 숫자 간격 */
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
