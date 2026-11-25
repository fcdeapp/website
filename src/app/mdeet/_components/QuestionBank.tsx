"use client";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useLearning } from "./Workspace";
import QuestionTable from "./QuestionTable";
import { Heading, Field } from "./UI";
import type { Attempt } from "../_lib/types";
import { SUBJECTS } from "../_lib/constants";
import { due } from "../_lib/scheduler";
import { loadTextIndex } from "../_lib/data";
import s from "../mdeet.module.css";
export default function QuestionBank({ unitId }: { unitId?: string }) {
  const { questions, units, store } = useLearning();
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [input, setInput] = useState(params.get("q") || "");
  const [text, setText] = useState<Map<string, string> | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  useEffect(() => setInput(params.get("q") || ""), [params]);
  const val = (key: string) => params.get(key) || "";
  const filter = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    router.replace(`${path}?${p}`, { scroll: false });
  };
  const base = questions.filter((q) => !unitId || q.unitId === unitId);
  const unit = units.find((u) => u.id === unitId);
  const histories = useMemo(() => {
    const map = new Map<string, Attempt[]>();
    store.attempts.forEach((a) =>
      map.set(a.questionId, [...(map.get(a.questionId) || []), a]),
    );
    return map;
  }, [store.attempts]);
  const query = val("q").toLocaleLowerCase();
  const items = base
    .filter((q) => {
      const a = histories.get(q.id) || [];
      const last = a[a.length - 1];
      const l = store.learning[q.id];
      return (
        (!val("subject") || q.subject === val("subject")) &&
        (!val("year") || String(q.year) === val("year")) &&
        (!val("unit") || q.unitId === val("unit")) &&
        (!val("topic") || q.topic === val("topic")) &&
        (!val("points") || String(q.points) === val("points")) &&
        (!val("solved") ||
          (val("solved") === "yes" ? a.length > 0 : a.length === 0)) &&
        (!val("result") ||
          (val("result") === "correct"
            ? last?.correct
            : last && !last.correct)) &&
        (!val("bookmark") || l?.bookmarked) &&
        (!val("due") || due(l)) &&
        (!val("review") || q.reviewFlags.length > 0) &&
        (!query ||
          `${q.id} ${q.year} ${q.unitLabel} ${q.topic}`
            .toLocaleLowerCase()
            .includes(query) ||
          !!text?.get(q.id)?.includes(query))
      );
    })
    .sort((a, b) => {
      const ah = histories.get(a.id) || [],
        bh = histories.get(b.id) || [];
      if (val("sort") === "recent")
        return (bh.at(-1)?.attemptedAt || "").localeCompare(
          ah.at(-1)?.attemptedAt || "",
        );
      if (val("sort") === "accuracy")
        return (
          (ah.length ? ah.filter((x) => x.correct).length / ah.length : -1) -
          (bh.length ? bh.filter((x) => x.correct).length / bh.length : -1)
        );
      if (val("sort") === "number")
        return a.number - b.number || a.year - b.year;
      return (
        b.year - a.year ||
        a.subject.localeCompare(b.subject) ||
        a.number - b.number
      );
    });
  async function fullText() {
    setError("");
    setProgress(0);
    try {
      setText(await loadTextIndex(questions, setProgress));
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "본문 검색 자료를 불러오지 못했습니다.",
      );
    } finally {
      setProgress(null);
    }
  }
  if (unitId && !unit)
    return (
      <Heading title="단원을 찾을 수 없습니다.">
        <Link href="/mdeet/library">단원 목록</Link>
      </Heading>
    );
  return (
    <>
      <Heading
        title={unit?.label || "문제 은행"}
        description={
          unit
            ? `${SUBJECTS[unit.subject]} · ${base.length}문항 · 출제 주제별 기출 학습`
            : "2023–2027학년도 생물학·화학 기출문제"
        }
      >
        {unit && (
          <Link className={s.primary} href={`/mdeet/practice?unit=${unit.id}`}>
            이 단원 문제 풀기
          </Link>
        )}
      </Heading>
      {unit && (
        <div className={s.quickLinks}>
          {[
            ["", "전체"],
            ["unsolved", "미풀이"],
            ["wrong", "오답"],
            ["bookmark", "북마크"],
          ].map(([state, label]) => (
            <Link
              key={label}
              href={`/mdeet/practice?unit=${unit.id}&state=${state}`}
            >
              {label} 문제 풀기
            </Link>
          ))}
        </div>
      )}
      <form
        className={s.searchLine}
        onSubmit={(e) => {
          e.preventDefault();
          filter("q", input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="문항 검색"
          placeholder="문항 ID, 단원, 주제 또는 학년도 검색"
        />
        <button type="submit">검색</button>
        <button
          type="button"
          disabled={progress !== null || !!text}
          onClick={fullText}
        >
          {text
            ? "본문 검색 포함"
            : progress !== null
              ? `본문 준비 ${progress}/${questions.length}`
              : "본문·선지도 검색"}
        </button>
      </form>
      {error && (
        <p role="alert">
          {error} <button onClick={fullText}>다시 시도</button>
        </p>
      )}
      <div className={s.filters}>
        {!unit && (
          <Field label="과목">
            <select
              value={val("subject")}
              onChange={(e) => filter("subject", e.target.value)}
            >
              <option value="">전체</option>
              {Object.entries(SUBJECTS).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        )}
        <Field label="학년도">
          <select
            value={val("year")}
            onChange={(e) => filter("year", e.target.value)}
          >
            <option value="">전체</option>
            {[...new Set(base.map((q) => q.year))].map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </Field>
        {!unit && (
          <Field label="단원">
            <select
              value={val("unit")}
              onChange={(e) => filter("unit", e.target.value)}
            >
              <option value="">전체</option>
              {units
                .filter((u) => !val("subject") || u.subject === val("subject"))
                .map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
            </select>
          </Field>
        )}
        <Field label="세부 주제">
          <select
            value={val("topic")}
            onChange={(e) => filter("topic", e.target.value)}
          >
            <option value="">전체</option>
            {[
              ...new Set(
                base
                  .filter((q) => !val("unit") || q.unitId === val("unit"))
                  .map((q) => q.topic),
              ),
            ]
              .sort()
              .map((t) => (
                <option key={t}>{t}</option>
              ))}
          </select>
        </Field>
        <Field label="배점">
          <select
            value={val("points")}
            onChange={(e) => filter("points", e.target.value)}
          >
            <option value="">전체</option>
            {[3, 4, 5].map((p) => (
              <option key={p} value={p}>
                {p}점
              </option>
            ))}
          </select>
        </Field>
        <Field label="풀이 여부">
          <select
            value={val("solved")}
            onChange={(e) => filter("solved", e.target.value)}
          >
            <option value="">전체</option>
            <option value="no">미풀이</option>
            <option value="yes">풀이함</option>
          </select>
        </Field>
        <Field label="최근 결과">
          <select
            value={val("result")}
            onChange={(e) => filter("result", e.target.value)}
          >
            <option value="">전체</option>
            <option value="correct">정답</option>
            <option value="wrong">오답</option>
          </select>
        </Field>
        <Field label="정렬">
          <select
            value={val("sort")}
            onChange={(e) => filter("sort", e.target.value)}
          >
            <option value="">최신 학년도</option>
            <option value="number">문항번호</option>
            <option value="recent">최근 풀이</option>
            <option value="accuracy">정답률 낮은 순</option>
          </select>
        </Field>
      </div>
      <div className={s.filterChecks}>
        {[
          ["bookmark", "북마크만"],
          ["due", "복습 예정만"],
          ["review", "검수 필요만"],
        ].map(([key, label]) => (
          <label className={s.check} key={key}>
            <input
              type="checkbox"
              checked={!!val(key)}
              onChange={(e) => filter(key, e.target.checked ? "1" : "")}
            />
            {label}
          </label>
        ))}
        <button onClick={() => router.replace(path, { scroll: false })}>
          필터 초기화
        </button>
      </div>
      <QuestionTable items={items} />
    </>
  );
}
