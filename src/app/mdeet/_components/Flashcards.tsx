"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLearning } from "./Workspace";
import { Heading, Field, Empty } from "./UI";
import type { Card, CardRating, Subject } from "../_lib/types";
import { scheduleCard } from "../_lib/scheduler";
import { SUBJECTS, questionHref, uid } from "../_lib/constants";
import s from "../mdeet.module.css";
export default function Flashcards() {
  const { store, questions, units, update } = useLearning();
  const params = useSearchParams();
  const connected = questions.find((q) => q.id === params.get("question"));
  const [editor, setEditor] = useState(!!connected);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [notes, setNotes] = useState("");
  const [subject, setSubject] = useState<Subject>(
    connected?.subject || "biology",
  );
  const [unit, setUnit] = useState(connected?.unitId || "");
  const [questionId, setQuestionId] = useState(connected?.id || "");
  const [filter, setFilter] = useState<"due" | "all">("due");
  const [open, setOpen] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [message, setMessage] = useState("");
  const cards = store.cards.filter(
    (c) => filter === "all" || Date.parse(c.nextReviewAt) <= Date.now(),
  );
  const active = cards.find((c) => c.id === open);
  function reset() {
    setEditingId(null);
    setFront("");
    setBack("");
    setNotes("");
    setEditor(false);
  }
  function edit(c: Card) {
    setEditingId(c.id);
    setFront(c.front);
    setBack(c.back);
    setNotes(c.notes);
    setSubject(c.subject);
    setUnit(c.unitId);
    setQuestionId(c.questionId || "");
    setEditor(true);
  }
  function save() {
    if (!front.trim() || !back.trim()) return;
    const now = new Date().toISOString();
    update((st) => {
      const previous = st.cards.find((c) => c.id === editingId);
      const card: Card = {
        id: editingId || uid(),
        front: front.trim(),
        back: back.trim(),
        notes,
        subject,
        unitId: unit,
        questionId: questionId || undefined,
        nextReviewAt: previous?.nextReviewAt || now,
        lastReviewAt: previous?.lastReviewAt,
        step: previous?.step || 0,
        history: previous?.history || [],
      };
      return {
        ...st,
        cards: previous
          ? st.cards.map((c) => (c.id === editingId ? card : c))
          : [...st.cards, card],
      };
    });
    setMessage("카드를 저장했습니다.");
    reset();
  }
  function rate(rating: CardRating) {
    if (!active || !revealed) return;
    const id = active.id;
    update((st) => ({
      ...st,
      cards: st.cards.map((c) =>
        c.id === id
          ? {
              ...c,
              ...scheduleCard(c.step, rating),
              lastReviewAt: new Date().toISOString(),
              history: [...c.history, { at: new Date().toISOString(), rating }],
            }
          : c,
      ),
    }));
    setOpen(null);
    setRevealed(false);
    setMessage("복습 기록을 저장했습니다.");
  }
  return (
    <>
      <Heading
        title="암기 카드"
        description="직접 만든 질문과 답을 간격을 두고 복습합니다."
      >
        <button
          className={s.primary}
          onClick={() => {
            reset();
            setEditor(true);
          }}
        >
          카드 만들기
        </button>
      </Heading>
      <p role="status" className={s.muted}>
        {message}
      </p>
      {editor && (
        <form
          className={s.editor}
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <h2>{editingId ? "카드 수정" : "새 암기 카드"}</h2>
          <div className={s.formGrid}>
            <Field label="질문">
              <textarea
                required
                maxLength={20000}
                rows={4}
                value={front}
                onChange={(e) => setFront(e.target.value)}
              />
            </Field>
            <Field label="정답">
              <textarea
                required
                maxLength={20000}
                rows={4}
                value={back}
                onChange={(e) => setBack(e.target.value)}
              />
            </Field>
            <Field label="과목">
              <select
                value={subject}
                onChange={(e) => {
                  setSubject(e.target.value as Subject);
                  setUnit("");
                }}
              >
                {Object.entries(SUBJECTS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="단원">
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="">선택 안 함</option>
                {units
                  .filter((u) => u.subject === subject)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.label}
                    </option>
                  ))}
              </select>
            </Field>
            <Field label="연결 문항">
              <select
                value={questionId}
                onChange={(e) => setQuestionId(e.target.value)}
              >
                <option value="">연결 안 함</option>
                {questions.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.id} · {q.topic}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="추가 메모">
              <textarea
                maxLength={20000}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Field>
          </div>
          <div className={s.actions}>
            <button type="button" onClick={reset}>
              취소
            </button>
            <button className={s.primary} type="submit">
              저장
            </button>
          </div>
        </form>
      )}
      <div className={s.segmented}>
        <button
          aria-pressed={filter === "due"}
          onClick={() => setFilter("due")}
        >
          복습 예정
        </button>
        <button
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
        >
          전체 카드 ({store.cards.length})
        </button>
      </div>
      {active && (
        <section className={s.flashcard}>
          <p className={s.muted}>
            {SUBJECTS[active.subject]} ·{" "}
            {units.find((u) => u.id === active.unitId)?.label || "단원 미지정"}
          </p>
          <h2>{active.front}</h2>
          {revealed ? (
            <>
              <div className={s.cardAnswer}>{active.back}</div>
              <p>{active.notes}</p>
              <div className={s.actions}>
                {(
                  [
                    ["again", "다시"],
                    ["hard", "어려움"],
                    ["good", "보통"],
                    ["easy", "쉬움"],
                  ] as const
                ).map(([k, v]) => (
                  <button key={k} onClick={() => rate(k)}>
                    {v}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <button className={s.primary} onClick={() => setRevealed(true)}>
              정답 확인
            </button>
          )}
          <button
            onClick={() => {
              setOpen(null);
              setRevealed(false);
            }}
          >
            닫기
          </button>
        </section>
      )}
      {!cards.length ? (
        <Empty
          title={
            store.cards.length
              ? "지금 복습할 카드가 없습니다."
              : "아직 암기 카드가 없습니다."
          }
        >
          <p>
            {store.cards.length
              ? "전체 카드에서 먼저 복습할 수 있습니다."
              : "기억할 개념을 질문과 답으로 직접 등록하세요."}
          </p>
        </Empty>
      ) : (
        <div className={s.tableScroll}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>질문</th>
                <th>과목</th>
                <th>다음 복습</th>
                <th>최근 / 횟수</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((c) => (
                <tr key={c.id}>
                  <td>
                    <button
                      className={s.textButton}
                      onClick={() => {
                        setOpen(c.id);
                        setRevealed(false);
                      }}
                    >
                      {c.front}
                    </button>
                    {c.questionId && (
                      <small>
                        <Link href={questionHref(c.questionId)}>연결 문항</Link>
                      </small>
                    )}
                  </td>
                  <td>{SUBJECTS[c.subject]}</td>
                  <td>{new Date(c.nextReviewAt).toLocaleString("ko-KR")}</td>
                  <td>
                    {c.lastReviewAt
                      ? new Date(c.lastReviewAt).toLocaleDateString("ko-KR")
                      : "—"}{" "}
                    / {c.history.length}회
                  </td>
                  <td>
                    <div className={s.actions}>
                      <button onClick={() => edit(c)}>수정</button>
                      <button
                        onClick={() => {
                          if (window.confirm("이 암기 카드를 삭제할까요?"))
                            update((st) => ({
                              ...st,
                              cards: st.cards.filter((x) => x.id !== c.id),
                            }));
                        }}
                      >
                        삭제
                      </button>
                    </div>
                    <details>
                      <summary>복습 이력</summary>
                      {c.history.length ? (
                        c.history
                          .slice()
                          .reverse()
                          .map((h, i) => (
                            <p key={i}>
                              {new Date(h.at).toLocaleString("ko-KR")} ·{" "}
                              {
                                {
                                  again: "다시",
                                  hard: "어려움",
                                  good: "보통",
                                  easy: "쉬움",
                                }[h.rating]
                              }
                            </p>
                          ))
                      ) : (
                        <p>복습 기록 없음</p>
                      )}
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className={s.muted}>
        다시: 10분 후 · 나머지 평가는 1·3·7·14·30일 간격을 조정하는 초기
        휴리스틱입니다.
      </p>
    </>
  );
}
