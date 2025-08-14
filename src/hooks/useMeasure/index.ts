"use client";

import { useRef, useState, useLayoutEffect, useEffect } from "react";

type Layout = { x: number; y: number; radius: number } | null;

/**
 * 웹용 useMeasure
 * - ref: 대상 DOM에 붙이세요 (ex. <div ref={ref} />)
 * - layout: { x, y, radius }에서 x,y는 페이지 좌표 (스크롤 포함), radius는 max(w,h)/2 + 8
 */
export default function useMeasure<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [layout, setLayout] = useState<Layout>(null);

  // rAF 쓰로틀용
  const frame = useRef<number | null>(null);
  const schedule = (fn: () => void) => {
    if (frame.current != null) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      frame.current = null;
      fn();
    });
  };

  const measure = () => {
    if (typeof window === "undefined") return; // SSR 안전
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const xCenter = rect.left + w / 2 + window.scrollX;
    const yCenter = rect.top + h / 2 + window.scrollY;
    const r = Math.max(w, h) / 2 + 8; // 여유 8px (원본 동일)

    setLayout({ x: xCenter, y: yCenter, radius: r });
  };

  // 최초 마운트/DOM 준비 후 한 번 측정 (레이아웃 플래시 방지 위해 useLayoutEffect)
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    // 첫 페인트 직후에 정확히 측정
    schedule(measure);
    // cleanup
    return () => {
      if (frame.current != null) cancelAnimationFrame(frame.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 요소 크기 변화 감지(ResizeObserver) + 스크롤/리사이즈 대응
  useEffect(() => {
    if (typeof window === "undefined") return;
    const el = ref.current;
    if (!el) return;

    const onScrollOrResize = () => schedule(measure);

    // 요소 자체 크기/레아이웃 변화
    const ro = new ResizeObserver(() => schedule(measure));
    ro.observe(el);

    // 뷰포트 변화
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    // 초기 1회 보장
    schedule(measure);

    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
    // ref.current가 바뀌면 다시 구독
  }, [ref.current]); // eslint-disable-line react-hooks/exhaustive-deps

  return [ref, layout] as const;
}

