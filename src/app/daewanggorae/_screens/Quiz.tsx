"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getQuestion } from "../_lib/content";
import { useLoad } from "../_lib/hooks";
import { saveRecord, createRecord, useRecords } from "../_lib/store";
import { gradeQuestion, nextReview } from "../_lib/records";
import { verificationLabel } from "../_lib/labels";
import { Text } from "../_components/Text";
import QuestionMedia from "../_components/QuestionMedia";
import { State, url } from "../_components/UI";
import s from "../daewanggorae.module.css";
export default function Quiz() {
  const params = useSearchParams();
  const ids = (params.get("ids") || "").split(",").filter(Boolean);
  const [index, setIndex] = useState(0);
  const [last, setLast] = useState(params.get("ids"));
  if (last !== params.get("ids")) {
    setLast(params.get("ids"));
    setIndex(0);
  }
  return ids[index] ? (
    <Question
      key={ids[index]}
      id={ids[index]}
      position={index}
      total={ids.length}
      next={() => {
        setIndex((i) => i + 1);
        window.scrollTo({ top: 0 });
      }}
    />
  ) : (
    <>
      <State empty="풀 문항을 선택해 주세요." />
      <Link className={s.button} href={url("questions")}>
        문제은행
      </Link>
    </>
  );
}
function Question({
  id,
  position,
  total,
  next,
}: {
  id: string;
  position: number;
  total: number;
  next: () => void;
}) {
  const r = useLoad(() => getQuestion(id), "question:" + id),
    records = useRecords();
  const [selected, setSelected] = useState(""),
    [submitted, setSubmitted] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [started] = useState(Date.now());
  if (!r.data) return <State error={r.error} retry={r.retry} />;
  const q = r.data;
  async function submit() {
    if (!selected || busy) return;
    setBusy(true);
    try {
      const correct = gradeQuestion(q, selected);
      await createRecord("attempt", {
        questionId: q.id,
        lessonId: q.lessonId,
        selected,
        correct,
        seconds: Math.round((Date.now() - started) / 1000),
      });
      await saveRecord("review", q.id, {
        questionId: q.id,
        lessonId: q.lessonId,
        ...nextReview(
          records["review:" + q.id]?.data || {},
          correct ? "good" : "again",
        ),
      });
      setSubmitted(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={s.question}>
      <div className={s.questionHeader}>
        <h1>{position + 1}번</h1>
        {total > 1 && <span className={s.muted}>전체 {total}문항</span>}
      </div>
      <div className={s.questionPrompt}>
        <Text text={q.prompt} />
      </div>
      <QuestionMedia media={q.media} stage="question" />
      <fieldset
        style={{ border: 0, padding: 0, margin: 0 }}
        disabled={submitted || busy}
      >
        <legend className={s.muted}>답안을 선택하세요</legend>
        <div className={s.options}>
          {q.options.map((o, i) => (
            <label
              key={o.id}
              className={s.option}
              data-selected={selected === o.id}
              data-correct={submitted && o.id === q.answer}
            >
              <input
                type="radio"
                name={"answer-" + q.id}
                value={o.id}
                checked={selected === o.id}
                onChange={() => setSelected(o.id)}
              />
              <span className={s.optionNumber}>{i + 1}</span>
              <div className={s.optionCopy}>
                <Text text={o.text} />
                {submitted && q.optionRationales?.[o.id] && (
                  <small>{q.optionRationales[o.id]}</small>
                )}
              </div>
            </label>
          ))}
        </div>
      </fieldset>
      {submitted ? (
        <section className={s.section}>
          <h2 className={selected === q.answer ? s.correct : s.incorrect}>
            {selected === q.answer ? "정답입니다" : "다시 확인해 보세요"}
          </h2>
          <p>정답: {q.options.findIndex((o) => o.id === q.answer) + 1}번</p>
          <Text text={q.explanation} />
          <QuestionMedia media={q.media} stage="explanation" />
          <div className={s.actions}>
            {position < total - 1 ? (
              <button className={s.primary} onClick={next}>
                다음 문항
              </button>
            ) : (
              <Link
                className={`${s.button} ${s.primary}`}
                href={url("statistics")}
              >
                풀이 완료 · 학습 기록
              </Link>
            )}
            <Link className={s.button} href={url("lesson", q.lessonId)}>
              관련 교과서 읽기
            </Link>
          </div>
        </section>
      ) : (
        <button
          disabled={!selected || busy}
          className={s.primary}
          onClick={() => void submit()}
        >
          {busy ? "기록 저장 중" : "답안 제출"}
        </button>
      )}
      <div className={s.actions}>
        <button
          onClick={() => {
            const prev = records["bookmark:question:" + q.id];
            void saveRecord(
              "bookmark",
              "question:" + q.id,
              { questionId: q.id, title: q.prompt },
              !!prev && !prev.deleted,
            ).catch((e) => setError(String(e)));
          }}
        >
          {records["bookmark:question:" + q.id] &&
          !records["bookmark:question:" + q.id].deleted
            ? "북마크 해제"
            : "문항 북마크"}
        </button>
      </div>
      {error && (
        <p className={s.error} role="alert">
          {error}
        </p>
      )}
      <p className={s.notice}>
        자체 제작 문항 · {verificationLabel(q.verificationStatus)}
      </p>
    </div>
  );
}
