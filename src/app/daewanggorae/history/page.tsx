"use client";
import { useState } from "react";
import { useRecords } from "../_lib/store";
import type { attemptSnapshot } from "../_lib/questions/model";
import { optionLabel } from "../_lib/questions/model";
import { Text } from "../_components/Text";
import Evidence from "../_components/Evidence";
import QuestionMedia from "../_components/QuestionMedia";
import { Heading, State } from "../_components/UI";
import s from "../daewanggorae.module.css";
type Snapshot = ReturnType<typeof attemptSnapshot>;
export default function History() {
  const records = useRecords();
  const [selected, setSelected] = useState("");
  const attempts = Object.values(records).filter(r => r.kind === "attempt" && !r.deleted).sort((a,b) => b.updatedAt-a.updatedAt);
  const chosen = attempts.find(r => r.id === selected);
  const snapshot = chosen?.data.snapshot as Snapshot | undefined;
  if (chosen) return <>
    <button onClick={() => setSelected("")}>학습 기록 목록</button>
    <Heading title="문제풀이 기록" detail={new Date(chosen.updatedAt).toLocaleString("ko-KR")} />
    <p>{chosen.data.correct ? "정답" : "오답"} · 선택: {snapshot ? optionLabel(snapshot.question.options.findIndex(o => o.id === chosen.data.selected)) : String(chosen.data.selected)}</p>
    {snapshot?.schemaVersion === 1 ? <>
      <Text text={snapshot.question.prompt} />
      <QuestionMedia media={snapshot.question.media} stage="question" />
      <Evidence items={snapshot.question.evidence} />
      {snapshot.question.leadIn && <Text text={snapshot.question.leadIn} />}
      {snapshot.question.options.map((o,i) => <div key={o.id} className={s.section}><p>{optionLabel(i)} {o.text}</p></div>)}
      <h2>해설</h2>
      <p>정답: {optionLabel(snapshot.question.options.findIndex(o=>o.id===snapshot.grading.answer))}</p>
      <Text text={snapshot.grading.explanation} />
      {snapshot.question.options.map((o,i) => <div key={o.id}><h3>{optionLabel(i)}</h3><Text text={snapshot.grading.optionRationales[o.id] || "별도의 선지 해설이 없습니다."} /></div>)}
      <QuestionMedia media={snapshot.grading.media} stage="explanation" />
    </> : <p>이전에 저장한 풀이 결과입니다. 당시 지문과 해설이 저장되어 있지 않아 현재 문항으로 다시 채점하지 않습니다.</p>}
  </>;
  return <><Heading title="학습 기록" detail="제출 당시의 문제와 해설을 다시 읽어보세요." />
    {!attempts.length && <State empty="아직 제출한 답안이 없습니다." />}
    {attempts.map(r => <button className={s.row} key={r.id} onClick={() => setSelected(r.id)}><span>{(r.data.snapshot as Snapshot | undefined)?.question.prompt || "문제풀이 기록"}</span><span>{new Date(r.updatedAt).toLocaleDateString("ko-KR")} · {r.data.correct ? "정답" : "오답"}</span></button>)}
  </>;
}
