// components/FlipNumber.tsx
"use client";

import { useEffect, useState } from "react";

interface Props {
  /** 최종값(문자열 OK) – 예: "54 %" */
  target: string | number;
  /** 애니메이션 길이(ms) */
  duration?: number;
}

export default function FlipNumber({ target, duration = 1200 }: Props) {
  const chars = String(target).split("");

  return (
    <span className="flipWrap">
      {chars.map((ch, i) => (
        <Roll key={i} char={ch} duration={duration} />
      ))}

      <style jsx>{`
        .flipWrap {
          display: inline-flex;
          font-weight: 700;
          font-size: 3rem;      /* 숫자 크기 */
          color: #d8315b;
          line-height: 1;
        }
      `}</style>
    </span>
  );
}

function Roll({ char, duration }: { char: string; duration?: number }) {
  // 숫자가 아니면 그냥 고정 출력
  if (isNaN(Number(char))) return <span>{char}</span>;

  // 0‒9 를 두 번 돌고 마지막에 목표 숫자
  const sequence = [...Array(20).keys()].map(v => String(v % 10)).concat(char);

  // keyframe 길이 = sequence.length
  const keyName = `roll${char}`;
  const stepCount = sequence.length - 1;

  return (
    <>
      <span className={keyName}>{sequence.join("")}</span>

      <style jsx>{`
        @keyframes ${keyName} {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-${stepCount}em);
          }
        }
        .${keyName} {
          display: inline-block;
          height: 1em;
          overflow: hidden;
          animation: ${keyName} ${duration}ms steps(${stepCount}) forwards;
        }
      `}</style>
    </>
  );
}
