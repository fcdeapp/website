"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Bookmark } from "lucide-react";
import { useLearning } from "./Workspace";
import { useQuestion } from "../_hooks/useQuestion";
import QuestionRenderer from "./QuestionRenderer";
import { Heading, Field, Check } from "./UI";
import {
  CONFIDENCE,
  MISTAKES,
  questionHref,
  titleOf,
  duration,
  uid,
} from "../_lib/constants";
import { blankLearning } from "../_lib/scheduler";
import { makeAttempt, recordAttempt } from "../_lib/scoring";
import { prefetchQuestion } from "../_lib/data";
import type { Attempt, Confidence, Learning } from "../_lib/types";
import s from "../mdeet.module.css";
import { sections, sectionHref } from "../_lib/textbook";
export default function QuestionStudy({ id }: { id: string }) {
  const { questions, store, update } = useLearning();
  const router = useRouter();
  const { question, error, retry } = useQuestion(id);
  const [selected, setSelected] = useState<number | null>(null);
  const [confidence, setConfidence] = useState<Confidence>("medium");
  const [result, setResult] = useState<Attempt | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const timer = useRef(0);
  const last = useRef(0);
  const submitted = useRef(false);
  const learning = store.learning[id] || blankLearning();
  const idx = questions.findIndex((q) => q.id === id);
  const previous = questions[idx - 1];
  const next = questions[idx + 1];
  const edit = useCallback(
    (patch: Partial<Learning>) =>
      update((st) => ({
        ...st,
        learning: {
          ...st.learning,
          [id]: { ...(st.learning[id] || blankLearning()), ...patch },
        },
      })),
    [id, update],
  );
  useEffect(() => {
    setSelected(null);
    setResult(null);
    setElapsed(0);
    timer.current = 0;
    submitted.current = false;
    last.current = Date.now();
    setConfidence("medium");
    update((st) => ({ ...st, lastQuestionId: id }));
  }, [id, update]);
  useEffect(() => {
    if (!question || result) return;
    last.current = Date.now();
    const tick = () => {
      const now = Date.now();
      if (document.visibilityState === "visible")
        timer.current += Math.min(now - last.current, 2000);
      last.current = now;
      setElapsed(timer.current);
    };
    const interval = setInterval(tick, 500);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [question, result]);
  useEffect(() => {
    prefetchQuestion(next?.id);
  }, [next?.id]);
  const submit = useCallback(() => {
    if (!question || selected === null || submitted.current) return;
    submitted.current = true;
    const a = makeAttempt(
      question,
      selected,
      confidence,
      timer.current,
      "study",
      uid(),
      Date.now(),
    );
    update((st) => recordAttempt(st, a));
    setResult(a);
  }, [question, selected, confidence, update]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement;
      if (
        el.closest('input,textarea,select,[contenteditable="true"]') ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      )
        return;
      if (/^[1-5]$/.test(e.key) && !result) {
        e.preventDefault();
        setSelected(Number(e.key));
      } else if (e.key === "Enter" && !el.closest("button,a,summary")) {
        e.preventDefault();
        submit();
      } else if (e.key === "ArrowLeft" && previous) {
        e.preventDefault();
        router.push(questionHref(previous.id));
      } else if (e.key === "ArrowRight" && next) {
        e.preventDefault();
        router.push(questionHref(next.id));
      } else if (e.key.toLowerCase() === "b") {
        e.preventDefault();
        edit({ bookmarked: !learning.bookmarked });
      } else if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        edit({
          markedForReview: !learning.markedForReview,
          nextReviewAt: !learning.markedForReview
            ? new Date().toISOString()
            : undefined,
        });
      }
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [result, submit, previous, next, router, learning, edit]);
  if (idx < 0)
    return (
      <Heading
        title="문항을 찾을 수 없습니다."
        description="문제 은행에서 문항을 다시 선택하세요."
      >
        <Link href="/mdeet/questions">문제 은행</Link>
      </Heading>
    );
  if (error)
    return (
      <div role="alert" className={s.empty}>
        <p>{error}</p>
        <button onClick={retry}>다시 시도</button>
      </div>
    );
  if (!question) return <p role="status">문항을 불러오는 중입니다…</p>;
  const history = store.attempts
    .filter((a) => a.questionId === id)
    .slice()
    .reverse();
  return (
    <>
      <Heading
        title={titleOf(question)}
        description={`${question.unitLabel} · ${question.topic} · ${question.points == null ? "배점 미확인" : `${question.points}점`}`}
      >
        <button
          aria-pressed={learning.bookmarked}
          onClick={() => edit({ bookmarked: !learning.bookmarked })}
        >
          <Bookmark size={15} />
          {learning.bookmarked ? "북마크됨" : "북마크"}
        </button>
        <span className={s.timer}>
          {duration(result?.durationMs ?? elapsed)}
        </span>
      </Heading>
      <div className={s.questionLayout}>
        <QuestionRenderer
          key={id}
          question={question}
          defaultZoom={store.settings.zoom}
        />
        <aside className={s.answerPanel}>
          <section>
            <h2>답안 선택</h2>
            <div className={s.choices}>
              {question.options.map((o) => (
                <button
                  key={o.number}
                  aria-label={`${o.number}번 선택`}
                  aria-pressed={selected === o.number}
                  disabled={!!result}
                  onClick={() => setSelected(o.number)}
                >
                  {["①", "②", "③", "④", "⑤"][o.number - 1]}
                </button>
              ))}
            </div>
            <Field label="답변 확신도">
              <select
                value={confidence}
                disabled={!!result}
                onChange={(e) => setConfidence(e.target.value as Confidence)}
              >
                {Object.entries(CONFIDENCE).map(([k, v]) => (
                  <option value={k} key={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            {!result ? (
              <button
                className={s.primary}
                disabled={selected === null}
                onClick={submit}
              >
                답안 제출
              </button>
            ) : (
              <div
                className={
                  result.ungraded
                    ? s.notice
                    : result.correct
                      ? s.correct
                      : s.incorrect
                }
                role="status"
              >
                <strong>
                  {result.ungraded
                    ? "답안 저장 · 정답 미전사로 채점 보류"
                    : result.correct
                      ? "정답"
                      : "오답"}{" "}
                  ·{" "}
                  {question.points == null
                    ? "배점 미확인"
                    : `${result.pointsEarned}/${question.points}점`}
                </strong>
                <p>
                  선택 {result.selectedOption}번 · 정답{" "}
                  {(
                    question.acceptedAnswers ??
                    (question.answer == null ? [] : [question.answer])
                  ).join(", ") || "미전사"}
                </p>
                <p>
                  {duration(result.durationMs)} ·{" "}
                  {CONFIDENCE[result.confidence]}
                </p>
                <button
                  onClick={() => {
                    submitted.current = false;
                    timer.current = 0;
                    setElapsed(0);
                    setResult(null);
                    setSelected(null);
                  }}
                >
                  다시 풀기
                </button>
              </div>
            )}
          </section>
          <section>
            <Check
              label="복습할 문항"
              checked={learning.markedForReview}
              onChange={(checked) =>
                edit({
                  markedForReview: checked,
                  nextReviewAt: checked ? new Date().toISOString() : undefined,
                })
              }
            />
            <Field label="개인 메모">
              <textarea
                rows={4}
                maxLength={20000}
                placeholder="헷갈린 개념이나 풀이 과정을 기록하세요."
                value={learning.notes}
                onChange={(e) => edit({ notes: e.target.value })}
              />
            </Field>
            <Field label="오답 원인">
              <select
                value={learning.mistakeTypes[0] || ""}
                onChange={(e) =>
                  edit({ mistakeTypes: e.target.value ? [e.target.value] : [] })
                }
              >
                <option value="">선택 안 함</option>
                {MISTAKES.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
            </Field>
            <Link
              href={`/mdeet/flashcards?question=${id}`}
              className={s.button}
            >
              이 문항으로 암기 카드 만들기
            </Link>
          </section>
          <section>
            <h2>관련 개념</h2>
            {sections
              .filter((sec) => sec.unitId === question.unitId)
              .map((sec) => (
                <p key={sec.id}>
                  <Link href={sectionHref(sec.id)}>{sec.title}</Link>
                </p>
              ))}
            <p className={s.muted}>
              같은 단원의 학습 절입니다. 출제 연관성은 검수 전입니다.
            </p>
          </section>
          <details>
            <summary>문항 정보 및 검수 상태</summary>
            <p>{question.id}</p>
            <p>
              출처: {question.source.questionPdf} · {question.source.page}쪽
            </p>
            <p>분류: 편집 분류 (공식 영역 코드 아님)</p>
            <p>검수 표시: {question.reviewFlags.join(", ") || "없음"}</p>
            <p>
              자동 추출 자료로, 모든 문항의 수동 원본 대조가 완료된 것은
              아닙니다.
            </p>
          </details>
        </aside>
      </div>
      <div className={s.pager}>
        {previous ? (
          <Link className={s.button} href={questionHref(previous.id)}>
            이전 문항
          </Link>
        ) : (
          <span />
        )}
        <Link href="/mdeet/questions">문제 은행</Link>
        {next ? (
          <Link className={s.button} href={questionHref(next.id)}>
            다음 문항
          </Link>
        ) : (
          <span />
        )}
      </div>
      <p className={s.muted}>
        단축키: 1–5 선택 · Enter 제출 · ← → 이동 · B 북마크 · R 복습
      </p>
      {result && (
        <div className={s.twoColumns}>
          <section className={s.section}>
            <h2>풀이 기록</h2>
            <p className={s.muted}>검수된 해설은 제공되지 않았습니다.</p>
            <ul className={s.rows}>
              {history.map((a) => (
                <li key={a.id}>
                  <span>{new Date(a.attemptedAt).toLocaleString("ko-KR")}</span>
                  <span>
                    {a.ungraded ? "채점 보류" : a.correct ? "정답" : "오답"} ·{" "}
                    {duration(a.durationMs)} · {CONFIDENCE[a.confidence]}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section className={s.section}>
            <h2>같은 단원의 기출문제</h2>
            <ul className={s.rows}>
              {questions
                .filter((q) => q.unitId === question.unitId && q.id !== id)
                .slice(0, 5)
                .map((q) => (
                  <li key={q.id}>
                    <Link href={questionHref(q.id)}>{titleOf(q)}</Link>
                    <span>{q.topic}</span>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}
