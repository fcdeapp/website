"use client";
import { useState } from "react";
import Link from "next/link";
import { useLearning } from "./Workspace";
import { Heading, Field, Empty } from "./UI";
import type { Plan } from "../_lib/types";
import { duration, localDate, uid } from "../_lib/constants";
import s from "../mdeet.module.css";
export default function Calendar() {
  const { store, units, update } = useLearning();
  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );
  const [selected, setSelected] = useState(localDate());
  const [weekly, setWeekly] = useState(false);
  const [editing, setEditing] = useState<Plan | null>(null);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(selected);
  const [unit, setUnit] = useState("");
  const [kind, setKind] = useState<"study" | "exam">("study");
  const [target, setTarget] = useState(10);
  const [minutes, setMinutes] = useState(30);
  const first = new Date(month);
  first.setDate(1 - first.getDay());
  const dates = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(first);
    d.setDate(first.getDate() + i);
    return d;
  });
  const weekStart = new Date(`${selected}T12:00:00`);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });
  const dayAttempts = (day: string) =>
    store.attempts.filter((a) => localDate(new Date(a.attemptedAt)) === day);
  const reviews = (day: string) =>
    Object.values(store.learning).filter(
      (l) => l.nextReviewAt && localDate(new Date(l.nextReviewAt)) === day,
    ).length +
    store.cards.filter((c) => localDate(new Date(c.nextReviewAt)) === day)
      .length;
  const plans = store.plans.filter((p) => p.date === selected);
  function open(plan?: Plan) {
    setEditing(plan || null);
    setTitle(plan?.title || "");
    setDate(plan?.date || selected);
    setUnit(plan?.unitId || "");
    setKind(plan?.kind || "study");
    setTarget(plan?.target ?? 10);
    setMinutes(plan?.minutes ?? 30);
    setShow(true);
  }
  function save() {
    if (!title.trim()) return;
    const plan: Plan = {
      id: editing?.id || uid(),
      date,
      title: title.trim(),
      unitId: unit,
      kind,
      target,
      minutes,
      done: editing?.done || false,
    };
    update((st) => ({
      ...st,
      plans: editing
        ? st.plans.map((p) => (p.id === editing.id ? plan : p))
        : [...st.plans, plan],
    }));
    setShow(false);
    setSelected(date);
  }
  return (
    <>
      <Heading
        title="학습 캘린더"
        description="학습 계획과 실제 기록, 예정된 복습을 함께 확인합니다."
      >
        <button className={s.primary} onClick={() => open()}>
          일정 추가
        </button>
      </Heading>
      <div className={s.calendarControls}>
        <div className={s.actions}>
          <button
            aria-label="이전 기간"
            onClick={() => {
              if (weekly) {
                const d = new Date(`${selected}T12:00:00`);
                d.setDate(d.getDate() - 7);
                setSelected(localDate(d));
              } else
                setMonth(
                  new Date(month.getFullYear(), month.getMonth() - 1, 1),
                );
            }}
          >
            이전
          </button>
          <h2>
            {weekly
              ? `${selected} 주간`
              : month.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                })}
          </h2>
          <button
            aria-label="다음 기간"
            onClick={() => {
              if (weekly) {
                const d = new Date(`${selected}T12:00:00`);
                d.setDate(d.getDate() + 7);
                setSelected(localDate(d));
              } else
                setMonth(
                  new Date(month.getFullYear(), month.getMonth() + 1, 1),
                );
            }}
          >
            다음
          </button>
          <button
            onClick={() => {
              setMonth(
                new Date(new Date().getFullYear(), new Date().getMonth(), 1),
              );
              setSelected(localDate());
            }}
          >
            오늘
          </button>
        </div>
        <div className={s.segmented}>
          <button aria-pressed={!weekly} onClick={() => setWeekly(false)}>
            월간
          </button>
          <button aria-pressed={weekly} onClick={() => setWeekly(true)}>
            주간
          </button>
        </div>
      </div>
      <div className={s.calendarGrid}>
        {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
          <div className={s.weekday} key={d}>
            {d}
          </div>
        ))}
        {(weekly ? week : dates).map((d) => {
          const day = localDate(d);
          const a = dayAttempts(day);
          const p = store.plans.filter((p) => p.date === day);
          return (
            <button
              key={day}
              className={s.day}
              data-outside={!weekly && d.getMonth() !== month.getMonth()}
              aria-pressed={day === selected}
              aria-label={`${day}, 계획 ${p.length}개, 풀이 ${a.length}회, 복습 ${reviews(day)}개`}
              onClick={() => setSelected(day)}
            >
              <strong>
                {d.getDate()}
                {day === localDate() ? " · 오늘" : ""}
              </strong>
              {a.length > 0 && (
                <span>
                  {a.length}회 ·{" "}
                  {Math.round(a.reduce((n, x) => n + x.durationMs, 0) / 60000)}
                  분
                </span>
              )}
              {p.length > 0 && (
                <span>
                  계획 {p.filter((x) => x.done).length}/{p.length}
                </span>
              )}
              {reviews(day) > 0 && <span>복습 {reviews(day)}</span>}
            </button>
          );
        })}
      </div>
      <section className={s.section}>
        <h2>{selected} 학습 계획</h2>
        <p className={s.muted}>
          풀이 {dayAttempts(selected).length}회 · 학습 시간{" "}
          {duration(
            dayAttempts(selected).reduce((n, a) => n + a.durationMs, 0),
          )}{" "}
          · 예정된 복습 {reviews(selected)}개
        </p>
        {plans.length ? (
          <ul className={s.rows}>
            {plans.map((p) => (
              <li key={p.id}>
                <label className={s.check}>
                  <input
                    type="checkbox"
                    checked={p.done}
                    onChange={(e) =>
                      update((st) => ({
                        ...st,
                        plans: st.plans.map((x) =>
                          x.id === p.id ? { ...x, done: e.target.checked } : x,
                        ),
                      }))
                    }
                  />
                  <span>
                    {p.title}
                    <small>
                      {p.kind === "exam" ? "모의고사" : "학습"} ·{" "}
                      {units.find((u) => u.id === p.unitId)?.label || "전체"} ·{" "}
                      {p.target}문항 · {p.minutes}분
                    </small>
                  </span>
                </label>
                <div className={s.actions}>
                  <button onClick={() => open(p)}>수정</button>
                  <button
                    onClick={() => {
                      if (window.confirm("이 일정을 삭제할까요?"))
                        update((st) => ({
                          ...st,
                          plans: st.plans.filter((x) => x.id !== p.id),
                        }));
                    }}
                  >
                    삭제
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Empty title="등록된 계획이 없습니다." />
        )}
        <div className={s.actions}>
          <Link href="/mdeet/review">문항 복습</Link>
          <Link href="/mdeet/flashcards">카드 복습</Link>
          <Link href="/mdeet/exams">모의고사</Link>
        </div>
      </section>
      {show && (
        <form
          className={s.editor}
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <h2>{editing ? "일정 수정" : "새 일정"}</h2>
          <div className={s.formGrid}>
            <Field label="제목">
              <input
                required
                maxLength={500}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Field>
            <Field label="날짜">
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </Field>
            <Field label="유형">
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as typeof kind)}
              >
                <option value="study">단원 학습</option>
                <option value="exam">모의고사</option>
              </select>
            </Field>
            <Field label="단원">
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option value="">전체</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="목표 문항 수">
              <input
                type="number"
                min={0}
                max={300}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
              />
            </Field>
            <Field label="목표 시간 (분)">
              <input
                type="number"
                min={0}
                max={1440}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </Field>
          </div>
          <div className={s.actions}>
            <button type="button" onClick={() => setShow(false)}>
              취소
            </button>
            <button className={s.primary} type="submit">
              저장
            </button>
          </div>
        </form>
      )}
    </>
  );
}
