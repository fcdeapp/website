"use client";
import { useState } from "react";
import Link from "next/link";
import { useLearning } from "./Workspace";
import QuestionTable from "./QuestionTable";
import { Heading, Field } from "./UI";
import { blankLearning, due } from "../_lib/scheduler";
import { MISTAKES, SUBJECTS, titleOf } from "../_lib/constants";
import s from "../mdeet.module.css";
export default function Review() {
  const { questions, store, update } = useLearning();
  const [tab, setTab] = useState("wrong");
  const [subject, setSubject] = useState("");
  const items = questions.filter((q) => {
    if (subject && q.subject !== subject) return false;
    const attempts = store.attempts.filter((a) => a.questionId === q.id);
    const last = attempts.at(-1);
    const learning = store.learning[q.id];
    return tab === "wrong"
      ? last && !last.ungraded && !last.correct
      : tab === "uncertain"
        ? last?.correct && last.confidence !== "high"
        : tab === "repeat"
          ? attempts.filter((a) => !a.ungraded && !a.correct).length >= 2
          : tab === "due"
            ? due(learning) || learning?.markedForReview
            : !!learning?.bookmarked;
  });
  return (
    <>
      <Heading
        title="오답 노트"
        description="다시 볼 문항과 오답 원인을 정리합니다."
      />
      <div className={s.segmented}>
        {[
          ["wrong", "최근 오답"],
          ["uncertain", "확신이 낮은 정답"],
          ["repeat", "반복 오답"],
          ["due", "복습 예정"],
          ["bookmark", "북마크"],
        ].map(([id, label]) => (
          <button key={id} aria-pressed={tab === id} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      <Field label="과목">
        <select value={subject} onChange={(e) => setSubject(e.target.value)}>
          <option value="">전체</option>
          {Object.entries(SUBJECTS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </Field>
      <QuestionTable items={items} />
      <section className={s.section}>
        <h2>복습 메모</h2>
        <p className={s.muted}>
          복습은 초기 휴리스틱으로 1·3·7·14·30일 간격을 사용합니다. 오답이거나
          확신이 낮으면 간격을 1일로 되돌립니다.
        </p>
        {items.map((q) => {
          const l = store.learning[q.id] || blankLearning();
          const edit = (patch: Partial<typeof l>) =>
            update((st) => ({
              ...st,
              learning: {
                ...st.learning,
                [q.id]: { ...(st.learning[q.id] || blankLearning()), ...patch },
              },
            }));
          return (
            <details key={q.id} className={s.reviewNote}>
              <summary>
                {titleOf(q)} · {q.topic}
                {l.nextReviewAt
                  ? ` · 다음 복습 ${new Date(l.nextReviewAt).toLocaleDateString("ko-KR")}`
                  : ""}
              </summary>
              <Field label="오답 원인">
                <select
                  value={l.mistakeTypes[0] || ""}
                  onChange={(e) =>
                    edit({
                      mistakeTypes: e.target.value ? [e.target.value] : [],
                    })
                  }
                >
                  <option value="">선택 안 함</option>
                  {MISTAKES.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </Field>
              <Field label="메모">
                <textarea
                  value={l.notes}
                  maxLength={20000}
                  onChange={(e) => edit({ notes: e.target.value })}
                />
              </Field>
              <Link
                className={s.button}
                href={`/mdeet/flashcards?question=${q.id}`}
              >
                연결된 암기 카드 만들기
              </Link>
            </details>
          );
        })}
      </section>
    </>
  );
}
