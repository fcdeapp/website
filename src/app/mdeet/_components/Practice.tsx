"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLearning } from "./Workspace";
import { Heading, Field, Check, Empty } from "./UI";
import { SUBJECTS } from "../_lib/constants";
import { due } from "../_lib/scheduler";
import { createSession, shuffle } from "../_lib/sessions";
import SessionRunner from "./SessionRunner";
import s from "../mdeet.module.css";
export default function Practice() {
  const { questions, units, store, update } = useLearning();
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("session");
  const [subject, setSubject] = useState("");
  const [unit, setUnit] = useState(params.get("unit") || "");
  const [year, setYear] = useState("");
  const [count, setCount] = useState(10);
  const [min, setMin] = useState(3);
  const [max, setMax] = useState(5);
  const [state, setState] = useState(
    ["unsolved", "wrong"].includes(params.get("state") || "")
      ? params.get("state")!
      : "",
  );
  const [bookmarked, setBookmarked] = useState(
    params.get("state") === "bookmark",
  );
  const [reviewDue, setReviewDue] = useState(params.get("state") === "due");
  const [random, setRandom] = useState(true);
  const [minutes, setMinutes] = useState(0);
  const [grading, setGrading] = useState(store.settings.grading);
  const latest = new Map(store.attempts.map((a) => [a.questionId, a]));
  const candidates = questions.filter(
    (q) =>
      (!subject || q.subject === subject) &&
      (!unit || q.unitId === unit) &&
      (!year || String(q.year) === year) &&
      (q.points == null
        ? min === 3 && max === 5
        : q.points >= min && q.points <= max) &&
      (!state ||
        (state === "unsolved" && !latest.has(q.id)) ||
        (state === "wrong" &&
          latest.has(q.id) &&
          !latest.get(q.id)!.correct &&
          !latest.get(q.id)!.ungraded)) &&
      (!bookmarked || store.learning[q.id]?.bookmarked) &&
      (!reviewDue || due(store.learning[q.id])),
  );
  const start = () => {
    if (!candidates.length) return;
    const ids = (random ? shuffle(candidates) : candidates)
      .slice(0, Math.max(1, count))
      .map((q) => q.id);
    const session = createSession(ids, store.settings, { minutes, grading });
    update((st) => ({ ...st, sessions: [...st.sessions, session] }));
    router.push(`/mdeet/practice?session=${session.id}`);
  };
  if (sessionId) return <SessionRunner sessionId={sessionId} />;
  return (
    <>
      <Heading
        title="맞춤 문제 풀이"
        description="학습할 범위와 풀이 방식을 정하세요."
      />
      <div className={s.twoColumns}>
        <form
          className={s.section}
          onSubmit={(e) => {
            e.preventDefault();
            start();
          }}
        >
          <div className={s.formGrid}>
            <Field label="과목">
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value);
                  setUnit("");
                }}
              >
                <option value="">전체</option>
                {Object.entries(SUBJECTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="단원">
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="">전체</option>
                {units
                  .filter((u) => !subject || u.subject === subject)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="학년도">
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option value="">전체</option>
                {[...new Set(questions.map((q) => q.year))].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </Field>
            <Field label="문항 수">
              <input
                type="number"
                min={1}
                max={300}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                required
              />
            </Field>
            <Field label="최소 배점">
              <select
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
              >
                {[3, 4, 5].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="최대 배점">
              <select
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
              >
                {[3, 4, 5].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="학습 상태">
              <select value={state} onChange={(e) => setState(e.target.value)}>
                <option value="">전체 문항</option>
                <option value="unsolved">미풀이만</option>
                <option value="wrong">최근 오답만</option>
              </select>
            </Field>
            <Field label="제한 시간 (분, 0은 제한 없음)">
              <input
                type="number"
                min={0}
                max={1440}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </Field>
            <Field label="채점 방식">
              <select
                value={grading}
                onChange={(e) => setGrading(e.target.value as typeof grading)}
              >
                <option value="end">종료 후 채점</option>
                <option value="immediate">즉시 채점</option>
              </select>
            </Field>
          </div>
          <Check
            label="북마크한 문항만"
            checked={bookmarked}
            onChange={setBookmarked}
          />
          <Check
            label="복습할 날짜가 된 문항만"
            checked={reviewDue}
            onChange={setReviewDue}
          />
          <Check label="무작위 순서" checked={random} onChange={setRandom} />
          <p className={s.muted}>
            배점 전체 범위에서는 배점 미확인 문항도 포함합니다. 조건에 맞는{" "}
            {candidates.length}문항 중 {Math.min(count, candidates.length)}
            문항을 풉니다.
          </p>
          <button
            type="submit"
            className={s.primary}
            disabled={
              !candidates.length || count < 1 || count > 300 || min > max
            }
          >
            문제 풀이 시작
          </button>
        </form>
        <section className={s.section}>
          <h2>이어 풀기 및 지난 결과</h2>
          {store.sessions.filter((x) => x.mode === "practice").length ? (
            <ul className={s.rows}>
              {store.sessions
                .filter((x) => x.mode === "practice")
                .slice()
                .reverse()
                .map((x) => (
                  <li key={x.id}>
                    <Link href={`/mdeet/practice?session=${x.id}`}>
                      {new Date(x.startedAt).toLocaleDateString("ko-KR")} ·{" "}
                      {x.questionIds.length}문항
                    </Link>
                    <span>
                      {x.finishedAt
                        ? "결과 보기"
                        : `${Object.keys(x.answers).length}문항 응답 · 이어 풀기`}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <Empty title="아직 진행한 세션이 없습니다." />
          )}
        </section>
      </div>
    </>
  );
}
