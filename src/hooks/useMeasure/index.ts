"use client";

// src/hooks/useMeasure.ts
import { useRef, useState, useEffect } from 'react';
import { findNodeHandle, UIManager } from 'react-native';

export default function useMeasure() {
  const ref = useRef<any>(null);
  const [layout, setLayout] = useState<{ x: number; y: number; radius: number } | null>(null);

  useEffect(() => {
    if (!ref.current) return;

    const handle = findNodeHandle(ref.current);
    if (!handle) return;
    UIManager.measure(handle, (_x, _y, w, h, pageX, pageY) => {
      const r = Math.max(w, h) / 2 + 8; // 여유 8px
      setLayout({ x: pageX + w / 2, y: pageY + h / 2, radius: r });
    });
  }, [ref.current]);

  return [ref, layout] as const;
}
