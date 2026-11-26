"use client";
import { useDeferredValue, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getSearchIndex } from "../_lib/content";
import { searchIndex } from "../_lib/repository";
import { useLoad } from "../_lib/hooks";
import type { SearchDocument } from "../_lib/types";
import { Heading, Row, State, url } from "../_components/UI";
import s from "../daewanggorae.module.css";
const labels: Record<SearchDocument["kind"], string> = {
  domain: "분야",
  subject: "과목",
  chapter: "챕터",
  lesson: "학습 단원",
  block: "본문",
  term: "용어",
  question: "문항",
  anatomy: "해부학 구조",
};
function destination(d: SearchDocument) {
  switch (d.kind) {
    case "domain":
      return url("textbook") + "?domain=" + encodeURIComponent(d.id);
    case "subject":
    case "chapter":
    case "lesson":
      return url(d.kind, d.id);
    case "block":
      return url("lesson", d.lessonId) + "#" + encodeURIComponent(d.id);
    case "term":
      return url("lesson", d.lessonId);
    case "question":
      return url("quiz") + "?ids=" + encodeURIComponent(d.id);
    case "anatomy":
      return url("anatomy") + "?concept=" + encodeURIComponent(d.id);
  }
}
export default function Search() {
  const params = useSearchParams(),
    [query, setQuery] = useState(params.get("q") || "");
  const [kind, setKind] = useState("");
  const q = useDeferredValue(query);
  const r = useLoad(getSearchIndex, "search");
  const results = r.data ? searchIndex(r.data, q, 300) : [];
  const filtered = results.filter((d) => !kind || d.kind === kind);
  return (
    <>
      <Heading title="통합 검색" />
      <label className={s.field}>
        검색어
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="의학 용어, 교과서 내용, 해부학 구조"
        />
      </label>
      <div className={s.filters}>
        <label className={s.field}>
          자료 종류
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">전체</option>
            {Object.entries(labels).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!r.data ? (
        <State error={r.error} retry={r.retry} />
      ) : q.trim() ? (
        <>
          <p className={s.muted}>
            {filtered.length}개 결과
            {results.length === 300 ? " · 관련도순 최대 300개" : ""}
          </p>
          {filtered.map((d, i) => (
            <Row
              key={d.kind + d.id + i}
              title={d.title}
              detail={d.text.slice(0, 180)}
              meta={labels[d.kind]}
              href={destination(d)}
            />
          ))}
          {!filtered.length && (
            <State empty="검색 결과가 없습니다. 다른 용어로 찾아보세요." />
          )}
        </>
      ) : (
        <State empty="한국어·영어 의학 용어와 FMA ID를 검색할 수 있습니다." />
      )}
    </>
  );
}
