"use client";
import { useEffect, useRef, useState } from "react";
import type { LayoutRegion, Question } from "../_lib/types";
import { SUBJECTS } from "../_lib/constants";
import s from "../mdeet.module.css";
function Region({
  region,
  question,
  index,
}: {
  region: LayoutRegion;
  question: Question;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(index === 0);
  const [failed, setFailed] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (visible) return;
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "500px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible]);
  const assets = new Map(question.assets.map((a) => [a.id, a]));
  return (
    <div
      ref={ref}
      className={s.region}
      style={{ aspectRatio: `${region.width}/${region.height}` }}
    >
      {failed && (
        <div className={s.notice} role="alert">
          일부 그림을 불러오지 못했습니다.{" "}
          <button
            onClick={() => {
              setFailed(false);
              setRetry((n) => n + 1);
            }}
          >
            그림 다시 불러오기
          </button>
        </div>
      )}
      {visible ? (
        <svg
          viewBox={`0 0 ${region.width} ${region.height}`}
          aria-label={`문항 ${question.number}, 원본 배치 영역 ${index + 1}`}
          xmlns="http://www.w3.org/2000/svg"
        >
          {region.items
            .filter((i) => i.type === "image")
            .map((item, i) => {
              const asset = assets.get(item.assetId);
              return asset ? (
                <image
                  key={`${i}-${retry}`}
                  x={item.bbox[0]}
                  y={item.bbox[1]}
                  width={item.bbox[2]}
                  height={item.bbox[3]}
                  href={`${asset.src}${retry ? `?retry=${retry}` : ""}`}
                  preserveAspectRatio="none"
                  onError={() => setFailed(true)}
                />
              ) : (
                <text
                  key={i}
                  x={item.bbox[0]}
                  y={item.bbox[1] + 10}
                  fontSize={8}
                >
                  그림 연결 없음
                </text>
              );
            })}
          {region.items
            .filter((i) => i.type === "text")
            .flatMap((item) =>
              item.spans.map((span, i) =>
                span.text.trim() ? (
                  <text
                    key={`${item.id}-${i}`}
                    x={span.origin[0]}
                    y={span.origin[1]}
                    fontSize={span.size}
                    fontFamily={
                      /HyhwpEQ|Symbol/i.test(span.font)
                        ? "Times New Roman, Cambria Math, serif"
                        : "Batang, AppleMyungjo, Noto Serif KR, serif"
                    }
                    fill="#111"
                    xmlSpace="preserve"
                    fontStyle={span.flags & 2 ? "italic" : undefined}
                    fontWeight={span.flags & 16 ? "bold" : undefined}
                    textLength={span.bbox[2] > 0 ? span.bbox[2] : undefined}
                    lengthAdjust={
                      span.bbox[2] > 0 ? "spacingAndGlyphs" : undefined
                    }
                  >
                    {span.text}
                  </text>
                ) : null,
              ),
            )}
        </svg>
      ) : (
        <p role="status">다음 영역을 준비하고 있습니다…</p>
      )}
    </div>
  );
}
export default function QuestionRenderer({
  question,
  defaultZoom = 100,
}: {
  question: Question;
  defaultZoom?: number;
}) {
  const [mode, setMode] = useState<"layout" | "text">("layout");
  const [zoom, setZoom] = useState(defaultZoom);
  return (
    <div className={s.reader}>
      <div className={s.readerToolbar}>
        <div className={s.segmented} aria-label="문항 보기 방식">
          <button
            aria-pressed={mode === "layout"}
            onClick={() => setMode("layout")}
          >
            정밀 보기
          </button>
          <button
            aria-pressed={mode === "text"}
            onClick={() => setMode("text")}
          >
            텍스트 보기
          </button>
        </div>
        {mode === "layout" && (
          <div className={s.actions}>
            <button
              aria-label="문항 축소"
              disabled={zoom <= 75}
              onClick={() => setZoom((z) => z - 25)}
            >
              −
            </button>
            <button aria-label="확대 비율 초기화" onClick={() => setZoom(100)}>
              {zoom}%
            </button>
            <button
              aria-label="문항 확대"
              disabled={zoom >= 200}
              onClick={() => setZoom((z) => z + 25)}
            >
              ＋
            </button>
          </div>
        )}
      </div>
      {mode === "layout" ? (
        <div
          className={s.paperScroll}
          tabIndex={0}
          aria-label="문제 원본 배치. 확대 시 이 영역 안에서 이동할 수 있습니다."
        >
          <div className={s.paper} style={{ width: `${zoom}%` }}>
            <div className={s.paperMasthead}>
              <span>
                {question.year}학년도 · {SUBJECTS[question.subject]}
              </span>
              <strong>{question.unitLabel}</strong>
            </div>
            {question.layout.map((r, i) => (
              <Region key={i} region={r} question={question} index={i} />
            ))}
            <div className={s.paperFolio}>
              <span>
                원본 시험지 {question.source.page}쪽
                {question.layout.length > 1 ? "부터 · 이어지는 지면 포함" : ""}
              </span>
              <span>
                {question.points}점 · 문항{" "}
                {String(question.number).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className={s.plainText}>
          <p className={s.notice}>
            텍스트 보기는 검색·열람용입니다. 분수, 첨자, 도표 및 그림 선지는
            정밀 보기에서 확인하세요.
          </p>
          <p>{question.stem}</p>
          <ol>
            {question.options.map((o) => (
              <li key={o.number} value={o.number}>
                {o.text || "(그림 선지 — 정밀 보기에서 확인)"}
                {o.assetIds.length > 0 && o.text && " · 그림 포함"}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
