"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLearning } from "./Workspace";
import { useQuestion } from "../_hooks/useQuestion";
import { loadQuestion, prefetchQuestion } from "../_lib/data";
import { makeAttempt, recordAttempt, remaining } from "../_lib/scoring";
import {
  CONFIDENCE,
  duration,
  percent,
  questionHref,
  titleOf,
} from "../_lib/constants";
import type { Confidence, Question, Session } from "../_lib/types";
import QuestionRenderer from "./QuestionRenderer";
import { Heading, Metric, Field, Check } from "./UI";
import s from "../mdeet.module.css";
export default function SessionRunner({ sessionId }: { sessionId: string }) {
  const { store, questions, update } = useLearning();
  const session = store.sessions.find((x) => x.id === sessionId);
  if (!session)
    return (
      <Heading
        title="세션을 찾을 수 없습니다."
        description="다른 브라우저에서 만든 세션이거나 기록이 초기화됐을 수 있습니다."
      >
        <Link href="/mdeet/practice">새 문제 풀이</Link>
      </Heading>
    );
  return (
    <Runner
      key={session.id}
      session={session}
      questions={questions}
      update={update}
      store={store}
    />
  );
}
function Runner({
  session,
  questions,
  update,
  store,
}: Pick<ReturnType<typeof useLearning>, "questions" | "update" | "store"> & {
  session: Session;
}) {
  const latest = useRef(session);
  latest.current = session;
  const busy = useRef(false);
  const autoTried = useRef(false);
  const [now, setNow] = useState(Date.now());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const id = session.questionIds[session.current];
  const { question, error: loadError, retry } = useQuestion(id);
  const pending = useRef({ id, last: Date.now(), visible: true });
  const flush = useCallback(() => {
    const at = Date.now();
    const clock = pending.current;
    const current = latest.current;
    const end = current.endsAt ? Math.min(at, Date.parse(current.endsAt)) : at;
    const delta =
      clock.visible && !current.finishedAt ? Math.max(0, end - clock.last) : 0;
    clock.last = at;
    if (delta > 0)
      update((st) => ({
        ...st,
        sessions: st.sessions.map((x) =>
          x.id === current.id && !x.finishedAt
            ? {
                ...x,
                durations: {
                  ...x.durations,
                  [clock.id]: (x.durations[clock.id] || 0) + delta,
                },
              }
            : x,
        ),
      }));
  }, [update]);
  useEffect(() => {
    pending.current = {
      id,
      last: Date.now(),
      visible: document.visibilityState === "visible",
    };
    const visibility = () => {
      flush();
      pending.current.visible = document.visibilityState === "visible";
    };
    const interval = setInterval(flush, 5000);
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", flush);
    return () => {
      flush();
      clearInterval(interval);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", flush);
    };
  }, [id, flush]);
  const finish = useCallback(async () => {
    if (busy.current || latest.current.finishedAt) return;
    busy.current = true;
    setSaving(true);
    setError("");
    flush();
    try {
      const current = latest.current;
      const loaded = new Map<string, Question>();
      let next = 0;
      await Promise.all(
        Array.from({ length: 4 }, async () => {
          while (next < current.questionIds.length) {
            const q = await loadQuestion(current.questionIds[next++]);
            loaded.set(q.id, q);
          }
        }),
      );
      update((st) => {
        const current = st.sessions.find((x) => x.id === session.id);
        if (!current || current.finishedAt) return st;
        let nextStore = st;
        const ended = Date.now();
        for (const qid of current.questionIds) {
          const q = loaded.get(qid)!;
          nextStore = recordAttempt(
            nextStore,
            makeAttempt(
              q,
              current.answers[qid] || 0,
              current.confidence[qid] || "medium",
              current.durations[qid] || 0,
              current.mode,
              `${current.id}:${qid}`,
              ended,
              current.id,
            ),
          );
        }
        return {
          ...nextStore,
          sessions: nextStore.sessions.map((x) =>
            x.id === current.id
              ? {
                  ...x,
                  finishedAt: new Date(ended).toISOString(),
                  gradedIds: [...x.questionIds],
                }
              : x,
          ),
        };
      });
      setConfirm(false);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "제출에 실패했습니다. 답안은 저장돼 있습니다.",
      );
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }, [flush, session.id, update]);
  useEffect(() => {
    const tick = () => {
      const time = Date.now();
      setNow(time);
      if (
        !latest.current.finishedAt &&
        remaining(latest.current, time) === 0 &&
        !autoTried.current
      ) {
        autoTried.current = true;
        void finish();
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [finish]);
  const nextQuestionId = session.questionIds[session.current + 1];
  useEffect(() => {
    prefetchQuestion(nextQuestionId);
  }, [nextQuestionId]);
  const timeLeft = remaining(session, now);
  const locked = !!session.finishedAt || saving || timeLeft === 0;
  const graded = session.gradedIds.includes(id);
  const patch = (patch: Partial<Session>) =>
    update((st) => ({
      ...st,
      sessions: st.sessions.map((x) =>
        x.id === session.id && !x.finishedAt ? { ...x, ...patch } : x,
      ),
    }));
  function choose(value: number) {
    if (locked || graded) return;
    update((st) => ({
      ...st,
      sessions: st.sessions.map((x) =>
        x.id === session.id && !x.finishedAt && remaining(x) !== 0
          ? { ...x, answers: { ...x.answers, [id]: value } }
          : x,
      ),
    }));
  }
  function confidence(value: Confidence) {
    if (locked || graded) return;
    update((st) => ({
      ...st,
      sessions: st.sessions.map((x) =>
        x.id === session.id
          ? { ...x, confidence: { ...x.confidence, [id]: value } }
          : x,
      ),
    }));
  }
  function grade() {
    if (!question || !session.answers[id] || graded || locked) return;
    flush();
    update((st) => {
      const current = st.sessions.find((x) => x.id === session.id)!;
      const next = recordAttempt(
        st,
        makeAttempt(
          question,
          current.answers[id],
          current.confidence[id] || "medium",
          current.durations[id] || 0,
          "practice",
          `${session.id}:${id}`,
          Date.now(),
          session.id,
        ),
      );
      return {
        ...next,
        sessions: next.sessions.map((x) =>
          x.id === session.id ? { ...x, gradedIds: [...x.gradedIds, id] } : x,
        ),
      };
    });
  }
  if (session.finishedAt) {
    const attempts = store.attempts.filter((a) => a.sessionId === session.id);
    const total = questions
      .filter((q) => session.questionIds.includes(q.id))
      .reduce((n, q) => n + (q.points ?? 0), 0);
    const incomplete = attempts.some((a) => a.ungraded || a.pointsUnknown);
    const earned = attempts.reduce((n, a) => n + a.pointsEarned, 0);
    const totalMs = Object.values(session.durations).reduce((n, x) => n + x, 0);
    const units = [
      ...new Set(
        session.questionIds
          .map((id) => questions.find((q) => q.id === id)?.unitId)
          .filter(Boolean),
      ),
    ];
    return (
      <>
        <Heading
          title="풀이 결과"
          description={`${new Date(session.finishedAt).toLocaleString("ko-KR")} · ${session.mode === "exam" ? "실전 모의고사" : "맞춤 문제 풀이"}`}
        >
          <Link
            className={s.button}
            href={session.mode === "exam" ? "/mdeet/exams" : "/mdeet/practice"}
          >
            목록으로
          </Link>
        </Heading>
        <div className={s.metrics}>
          <Metric
            label="원점수"
            value={incomplete ? "채점 자료 미완료" : `${earned} / ${total}`}
          />
          <Metric
            label="정답률"
            value={percent(
              attempts.filter((a) => a.correct).length,
              attempts.filter((a) => !a.ungraded).length,
            )}
          />
          <Metric label="학습 시간" value={duration(totalMs)} />
          <Metric
            label="문항당 평균"
            value={duration(totalMs / session.questionIds.length)}
          />
        </div>
        <p className={s.muted}>
          배점과 정답이 모두 확인된 세션에만 원점수를 표시합니다. 정답 미전사
          문항은 정답률에서 제외합니다. 표준점수·백분위는 제공하지 않습니다.
          학습 시간은 화면을 보고 풀이한 시간입니다.
        </p>
        <section className={s.section}>
          <h2>단원별 결과</h2>
          <ul className={s.rows}>
            {units.map((unit) => {
              const ids = questions
                .filter((q) => q.unitId === unit)
                .map((q) => q.id);
              const a = attempts.filter(
                (a) => !a.ungraded && ids.includes(a.questionId),
              );
              return (
                <li key={unit}>
                  <Link href={`/mdeet/library/${unit}`}>
                    {questions.find((q) => q.unitId === unit)?.unitLabel}
                  </Link>
                  <span>
                    {a.filter((x) => x.correct).length}/{a.length} 정답
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
        <section className={s.section}>
          <h2>문항별 결과</h2>
          <div className={s.tableScroll}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>문항</th>
                  <th>선택 / 정답</th>
                  <th>결과</th>
                  <th>배점</th>
                  <th>확신도</th>
                  <th>시간</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => {
                  const q = questions.find((q) => q.id === a.questionId)!;
                  return (
                    <tr key={a.id}>
                      <td>
                        <Link href={questionHref(a.questionId)}>
                          {titleOf(q)}
                        </Link>
                      </td>
                      <td>
                        {a.selectedOption || "미응답"} / <Answer id={q.id} />
                      </td>
                      <td
                        className={
                          a.ungraded
                            ? undefined
                            : a.correct
                              ? s.goodText
                              : s.badText
                        }
                      >
                        {a.ungraded ? "채점 보류" : a.correct ? "정답" : "오답"}
                      </td>
                      <td>
                        {a.ungraded
                          ? "—"
                          : q.points == null
                            ? "배점 미확인"
                            : `${a.pointsEarned}/${q.points}`}
                      </td>
                      <td>
                        {CONFIDENCE[a.confidence]}
                        {a.correct && a.confidence !== "high"
                          ? " · 복습 권장"
                          : ""}
                      </td>
                      <td>{duration(a.durationMs)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <Link className={s.button} href="/mdeet/review">
          오답 및 확신이 낮은 정답 복습
        </Link>
      </>
    );
  }
  return (
    <>
      <Heading
        title={session.mode === "exam" ? "실전 모의고사" : "맞춤 문제 풀이"}
        description={`${session.current + 1} / ${session.questionIds.length}문항 · ${session.grading === "end" ? "종료 후 채점" : "즉시 채점"}`}
      >
        <span className={s.timer} role="timer">
          {timeLeft === null
            ? "시간 제한 없음"
            : `남은 시간 ${duration(timeLeft)}`}
        </span>
        <button onClick={() => setConfirm(true)} disabled={saving}>
          풀이 종료·제출
        </button>
      </Heading>
      {error && (
        <div className={s.notice} role="alert">
          {error}{" "}
          <button disabled={saving} onClick={() => void finish()}>
            제출 다시 시도
          </button>
        </div>
      )}
      {confirm && (
        <section className={s.confirmBox} role="alert">
          <h2>답안을 제출할까요?</h2>
          <p>
            미응답{" "}
            {session.questionIds.filter((q) => !session.answers[q]).length}
            문항은 0점 처리됩니다. 제출 후 답안을 변경할 수 없습니다.
          </p>
          <div className={s.actions}>
            <button onClick={() => setConfirm(false)}>계속 풀기</button>
            <button
              className={s.primary}
              disabled={saving}
              onClick={() => void finish()}
            >
              {saving ? "채점 중…" : "최종 제출"}
            </button>
          </div>
        </section>
      )}
      {saving && <p role="status">답안을 제출하고 있습니다…</p>}
      <div className={s.questionLayout}>
        <div>
          {loadError ? (
            <div className={s.empty} role="alert">
              {loadError}
              <button onClick={retry}>다시 시도</button>
            </div>
          ) : question ? (
            <QuestionRenderer
              key={id}
              question={question}
              defaultZoom={store.settings.zoom}
            />
          ) : (
            <p role="status">문항을 불러오는 중입니다…</p>
          )}
        </div>
        <aside className={s.answerPanel}>
          <section>
            <h2>
              {questions.find((q) => q.id === id)
                ? titleOf(questions.find((q) => q.id === id)!)
                : "문항"}
            </h2>
            <div className={s.choices}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  disabled={locked || graded}
                  aria-label={`${n}번 선택`}
                  aria-pressed={session.answers[id] === n}
                  onClick={() => choose(n)}
                >
                  {["①", "②", "③", "④", "⑤"][n - 1]}
                </button>
              ))}
            </div>
            <Field label="확신도">
              <select
                disabled={locked || graded}
                value={session.confidence[id] || "medium"}
                onChange={(e) => confidence(e.target.value as Confidence)}
              >
                {Object.entries(CONFIDENCE).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Check
              label="다시 볼 문제"
              checked={session.flagged.includes(id)}
              onChange={(checked) =>
                patch({
                  flagged: checked
                    ? [...session.flagged, id]
                    : session.flagged.filter((q) => q !== id),
                })
              }
            />
            {session.grading === "immediate" && (
              <button
                className={s.primary}
                disabled={locked || graded || !question || !session.answers[id]}
                onClick={grade}
              >
                이 문항 채점
              </button>
            )}
            {graded && session.grading === "immediate" && question && (
              <p
                role="status"
                className={
                  !(
                    question.acceptedAnswers ??
                    (question.answer == null ? [] : [question.answer])
                  ).length
                    ? s.notice
                    : (
                          question.acceptedAnswers ??
                          (question.answer == null ? [] : [question.answer])
                        ).some((n) => n === session.answers[id])
                      ? s.correct
                      : s.incorrect
                }
              >
                {!(
                  question.acceptedAnswers ??
                  (question.answer == null ? [] : [question.answer])
                ).length
                  ? "채점 보류"
                  : (
                        question.acceptedAnswers ??
                        (question.answer == null ? [] : [question.answer])
                      ).some((n) => n === session.answers[id])
                    ? "정답"
                    : "오답"}{" "}
                · 정답{" "}
                {(
                  question.acceptedAnswers ??
                  (question.answer == null ? [] : [question.answer])
                ).join(", ") || "미전사 · 채점 보류"}
              </p>
            )}
          </section>
          <section>
            <h2>문항 이동</h2>
            <p className={s.muted}>채운 번호: 응답 완료 · *: 다시 볼 문제</p>
            <div className={s.questionNav}>
              {session.questionIds.map((qid, i) => (
                <button
                  key={qid}
                  aria-label={`${i + 1}번째 문항${session.answers[qid] ? ", 응답 완료" : ", 미응답"}${session.flagged.includes(qid) ? ", 다시 볼 문제" : ""}`}
                  aria-current={i === session.current ? "step" : undefined}
                  data-answered={!!session.answers[qid]}
                  onClick={() => {
                    flush();
                    patch({ current: i });
                  }}
                >
                  {i + 1}
                  {session.flagged.includes(qid) ? "*" : ""}
                </button>
              ))}
            </div>
          </section>
          <p className={s.muted}>
            답안은 이 브라우저에 자동 저장됩니다. 시간 제한은 화면을 벗어나도
            계속됩니다.
          </p>
        </aside>
      </div>
      <div className={s.pager}>
        <button
          disabled={session.current === 0}
          onClick={() => {
            flush();
            patch({ current: session.current - 1 });
          }}
        >
          이전 문항
        </button>
        <span>
          {session.current + 1}/{session.questionIds.length}
        </span>
        <button
          disabled={session.current === session.questionIds.length - 1}
          onClick={() => {
            flush();
            patch({ current: session.current + 1 });
          }}
        >
          다음 문항
        </button>
      </div>
    </>
  );
}
function Answer({ id }: { id: string }) {
  const { question } = useQuestion(id);
  return (
    <>
      {question
        ? (
            question.acceptedAnswers ??
            (question.answer == null ? [] : [question.answer])
          ).join(", ") || "미전사"
        : "…"}
    </>
  );
}
