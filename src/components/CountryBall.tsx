// components/CountryBall.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import styles from "./CountryBall.module.css";

interface CountryBallProps {
  src: string;
  size?: number;
}

export default function CountryBall({ src, size = 60 }: CountryBallProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  // 위치와 속도
  const [pos, setPos] = useState({ x: Math.random() * 200, y: Math.random() * 200 });
  const [vel, setVel] = useState({
    vx: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1),
    vy: (Math.random() * 2 + 1) * (Math.random() < 0.5 ? -1 : 1),
  });
  const [dragging, setDragging] = useState(false);

  // 애니메이션 루프
  useEffect(() => {
    let frameId: number;
    function loop() {
      if (!dragging && imgRef.current) {
        const parent = imgRef.current.parentElement!;
        const maxX = parent.clientWidth - size;
        const maxY = parent.clientHeight - size;

        let { x, y } = pos;
        let { vx, vy } = vel;

        x += vx;
        y += vy;

        // 벽 충돌 체크
        if (x <= 0 || x >= maxX) {
          vx = -vx;
          x = Math.max(0, Math.min(x, maxX));
        }
        if (y <= 0 || y >= maxY) {
          vy = -vy;
          y = Math.max(0, Math.min(y, maxY));
        }

        setPos({ x, y });
        setVel({ vx, vy });
      }
      frameId = requestAnimationFrame(loop);
    }
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, [pos, vel, dragging, size]);

  // 드래그 핸들러
  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true);
    imgRef.current!.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !imgRef.current) return;
    const parent = imgRef.current.parentElement!;
    const rect = parent.getBoundingClientRect();

    let x = e.clientX - rect.left - size / 2;
    let y = e.clientY - rect.top - size / 2;
    x = Math.max(0, Math.min(x, rect.width - size));
    y = Math.max(0, Math.min(y, rect.height - size));

    setPos({ x, y });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    setDragging(false);
    imgRef.current!.releasePointerCapture(e.pointerId);
  };

  return (
    <img
      ref={imgRef}
      src={src}
      width={size}
      height={size}
      className={styles.ball}
      style={{ left: pos.x, top: pos.y, cursor: dragging ? "grabbing" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      alt=""
    />
  );
}
