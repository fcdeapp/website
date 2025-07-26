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

// components/FlipNumber.tsx  (전체 파일 중 아래 Digit 컴포넌트 부분을 교체)

function Digit({
    finalChar,
    duration,
    loops,
  }: {
    finalChar: string;
    duration: number;
    loops: number;
  }) {
    /* 0–9 두세 바퀴 + 최종 숫자 → 세로 스택 만들기 */
    const stack: string[] = [];
    for (let i = 0; i < loops; i++) stack.push(...Array.from({ length: 10 }, (_, n) => String(n)));
    stack.push(finalChar);                       // 마지막은 목표 숫자
  
    const steps = stack.length - 1;              // 총 스텝 수
    const keyframes = stack.map((_, i) => `-${i * 100}%`);
  
    /* 속도‑변화를 위한 times 배열 (처음 빨라지고 끝에 느려짐)  */
    //   t = (idx / steps)^2  형태로 만들면 앞부분 촘촘, 뒷부분 느슨
    const times = stack.map((_, i) => Math.pow(i / steps, 2));
  
    return (
      <span className="digit">
        <motion.span
          initial={{ y: "0%" }}
          animate={{ y: keyframes }}          // keyframes 배열
          transition={{
            duration: duration / 1000,        // ms → s
            times,                            // 가속/감속 제어
            ease: "linear",                   // 프레임 간은 linear
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
  