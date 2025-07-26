// components/FlipNumber.tsx
"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  /** 최종 표시할 숫자 (정수 또는 퍼센트 문자열) */
  target: string | number;
  /** ms 단위 전체 애니메이션 시간 (기본 1200) */
  duration?: number;
}

export default function FlipNumber({ target, duration = 1200 }: Props) {
  // ‘65 %’ → ['6','5',' ','%']
  const chars = String(target).split("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setDone(true), duration);
    return () => clearTimeout(id);
  }, [duration]);

  return (
    <span className="flip-wrapper">
      {chars.map((c, i) => (
        <span key={i} className="flip-col">
          <AnimatePresence>
            {done ? (
              <motion.span
                key={c}
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: "0%", opacity: 1 }}
                exit={{ y: "-100%", opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              >
                {c}
              </motion.span>
            ) : (
              // 초반에는 0–9를 빠르게 두세 번 돌려준다
              Array.from({ length: 3 }).map((_, j) => (
                <motion.span
                  key={j}
                  initial={{ y: 0 }}
                  animate={{ y: "-100%" }}
                  transition={{
                    repeat: 1,
                    duration: duration / 3000,
                    repeatType: "loop",
                    ease: "easeIn",
                  }}
                >
                  {Math.floor(Math.random() * 10)}
                </motion.span>
              ))
            )}
          </AnimatePresence>
        </span>
      ))}
      <style jsx>{`
        .flip-wrapper {
          display: inline-flex;
          font-size: 3rem;
          font-weight: 700;
          color: #d8315b;
          line-height: 1;
          perspective: 400px;
        }
        .flip-col {
          position: relative;
          width: 1ch;
          overflow: hidden;
          height: 1em;
        }
        .flip-col span {
          position: absolute;
          left: 0;
          width: 100%;
          text-align: center;
        }
      `}</style>
    </span>
  );
}
