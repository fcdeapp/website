"use client";
import Link from "next/link";
import { useState, useRef, useId } from "react";
import { useSearchParams } from "next/navigation";
import { loadQuestion, submitQuestion } from "../_lib/questions";
import { Grade, attemptSnapshot, profileLabel, optionLabel } from "../_lib/questions/model";
import { openQuestionPrint } from "../_lib/questions/print";
import { QuestionFootnotes } from "../_components/QuestionFootnotes";
import Evidence from "../_components/Evidence";
import { useLoad } from "../_lib/hooks";
import { saveRecord, createRecord, useRecords } from "../_lib/store";
import { nextReview } from "../_lib/records";

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
  const r = useLoad(() => loadQuestion(id), "question:" + id),
    records = useRecords();
  const [selected, setSelected] = useState(""),
    [grading, setGrading] = useState<Grade>(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [started] = useState(Date.now());
  const noteId = "notes-" + useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const submitting = useRef(false);
  const attemptSaved = useRef(false);
  const submitted = !!grading;
  if (!r.data) return <State error={r.error} retry={r.retry} />;
  const q = r.data;
  async function submit() {
    if (!selected || submitting.current || submitted) return;
    submitting.current = true;
    setBusy(true);
    try {
      const result = await submitQuestion(q, selected);
      const correct = result.correct;
      if (!attemptSaved.current) await createRecord("attempt", {
        questionId: q.id,
        lessonId: q.lessonId,
        selected,
        correct,
        revision: q.revision,
        format: q.format,
        candidate: false,
        snapshot: attemptSnapshot(q, result),
        seconds: Math.round((Date.now() - started) / 1000),
      });
      attemptSaved.current = true;
      setGrading(result);
      await saveRecord("review", q.id, {
        questionId: q.id,
        lessonId: q.lessonId,
        ...nextReview(
          records["review:" + q.id]?.data || {},
          correct ? "good" : "again",
        ),
      });

    } catch (e) {
      setError(String(e));
    } finally {
      setBusy(false);
      submitting.current = false;
    }
  }
  return (
    <div className={s.question}>
      <div className={s.questionHeader}>
        <h1>{position + 1}번{q.presentation?.notes.length ? <sup><a className={s.noteMarker} href={"#" + noteId} aria-label="출처와 자료 안내 보기">*</a></sup> : null}</h1>
        {total > 1 && <span className={s.muted}>전체 {total}문항</span>}
      </div>
      {!!profileLabel(q.profile) && <p className={s.muted}>{profileLabel(q.profile)}</p>}
      <div className={s.questionPrompt}>
        <Text text={q.presentation?.displayStem ?? q.prompt} />
      </div>
      <QuestionMedia media={q.media} stage="question" />
      <Evidence items={q.evidence} markup={q.presentation?.evidenceMarkup} />
      {!!q.leadIn && <div className={s.questionPrompt}><Text text={q.leadIn} /></div>}
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
              data-correct={submitted && o.id === grading?.answer}
              data-incorrect={submitted && selected === o.id && !grading?.correct}
            >
              <input
                type="radio"
                name={"answer-" + q.id}
                value={o.id}
                checked={selected === o.id}
                onChange={() => setSelected(o.id)}
              />
              <span className={s.optionNumber}>{optionLabel(i)}</span>
              <div className={s.optionCopy}>
                <Text text={o.text} />
                {(selected === o.id || (submitted && o.id === grading?.answer)) && <span className={s.optionStatus}>{submitted ? (o.id === grading?.answer ? "정답" : "선택한 답") : "선택됨"}</span>}
                {submitted && grading?.optionRationales?.[o.id] && (
                  <small>{grading?.optionRationales[o.id]}</small>
                )}
              </div>
            </label>
          ))}
        </div>
      </fieldset>
      <QuestionFootnotes notes={q.presentation?.notes} id={noteId} />
      {submitted ? (
        <section className={s.section}>
          <h2 className={selected === grading?.answer ? s.correct : s.incorrect}>
            {selected === grading?.answer ? "정답입니다" : "다시 확인해 보세요"}
          </h2>
          <p>정답: {q.options.findIndex((o) => o.id === grading?.answer) + 1}번</p>
          <Text text={grading!.explanation} />
          <QuestionMedia media={grading?.media} stage="explanation" />
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
          {busy ? "채점 중" : "답안 제출"}
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
      {q.format === "v2" && <button onClick={() => {try {openQuestionPrint([q]);} catch(e) {setError(String(e));}}}>문항 인쇄</button>}
      <p className={s.notice}>
        자체 제작 학습 문항
      </p>
    </div>
  );
}
