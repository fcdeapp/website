"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLearning } from "./Workspace";
import { Heading, Field } from "./UI";
import { exams, findExam, examTitle } from "../_lib/exams";
import { createSession } from "../_lib/sessions";
import SessionRunner from "./SessionRunner";
import s from "../mdeet.module.css";
export default function Exams({ examId }: { examId?: string }) {
  const { questions, store, update } = useLearning();
  const router = useRouter();
  const params = useSearchParams();
  const [minutes, setMinutes] = useState(
    examId ? (findExam(examId)?.durationMinutes ?? 0) : 0,
  );
  if (examId) {
    if (!findExam(examId))
      return (
        <Heading title="시험을 찾을 수 없습니다.">
          <Link href="/mdeet/exams">시험 목록</Link>
        </Heading>
      );
    const session = params.get("session");
    if (session) {
      const found = store.sessions.find((s) => s.id === session);
      if (!found?.examId || findExam(found.examId)?.id !== findExam(examId)?.id)
        return (
          <Heading title="이 시험의 세션이 아닙니다.">
            <Link href={`/mdeet/exams/${examId}`}>시험으로 돌아가기</Link>
          </Heading>
        );
      return <SessionRunner sessionId={session} />;
    }
    const exam = findExam(examId)!;
    const items = exam.questionIds
      .map((id) => questions.find((q) => q.id === id)!)
      .filter(Boolean);
    const start = () => {
      const x = createSession(
        items.map((q) => q.id),
        store.settings,
        { mode: "exam", examId, minutes },
      );
      update((st) => ({ ...st, sessions: [...st.sessions, x] }));
      router.push(`/mdeet/exams/${examId}?session=${x.id}`);
    };
    return (
      <>
        <Heading
          title={examTitle(exam)}
          description={`${items.length}문항 · ${exam.pointsTotal == null ? "배점 미확인" : `${exam.pointsTotal}점 만점`} · ${exam.answerKeyStatus === "complete" ? "정답 수록" : "정답 미전사 문항 포함"}`}
        />
        <section className={s.section}>
          <h2>응시 설정</h2>
          <p>
            시험이 끝날 때까지 정답은 표시하지 않습니다. 답안 변경과 다시 볼
            문제 표시가 가능합니다.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              start();
            }}
          >
            <Field label="사용자 설정 시간 (분, 0은 제한 없음)">
              <input
                type="number"
                min={0}
                max={1440}
                required
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </Field>
            <p className={s.muted}>
              인덱스의 시험 시간을 기본값으로 사용합니다. 필요하면 변경할 수
              있습니다. 제한 시간은 새로고침하거나 다른 화면으로 이동해도
              계속됩니다.
            </p>
            <button type="submit" className={s.primary}>
              시험 시작
            </button>
          </form>
        </section>
        <section className={s.section}>
          <h2>응시 이력</h2>
          <ul className={s.rows}>
            {store.sessions
              .filter(
                (x) =>
                  x.examId && findExam(x.examId)?.id === findExam(examId)?.id,
              )
              .slice()
              .reverse()
              .map((x) => (
                <li key={x.id}>
                  <Link href={`/mdeet/exams/${examId}?session=${x.id}`}>
                    {new Date(x.startedAt).toLocaleString("ko-KR")}
                  </Link>
                  <span>{x.finishedAt ? "결과 보기" : "이어서 응시"}</span>
                </li>
              ))}
          </ul>
          {!store.sessions.some(
            (x) => x.examId && findExam(x.examId)?.id === findExam(examId)?.id,
          ) && <p className={s.muted}>응시 기록이 없습니다.</p>}
        </section>
      </>
    );
  }
  return (
    <>
      <Heading
        title="실전 모의고사"
        description="학년도·과목별 원본 문항으로 구성된 시험입니다."
      />
      <div className={s.tableScroll}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>시험</th>
              <th>문항 수</th>
              <th>총점</th>
              <th>응시 횟수</th>
              <th>최근 / 최고 점수</th>
              <th>진행</th>
            </tr>
          </thead>
          <tbody>
            {[...exams].reverse().map((exam) => {
              const id = exam.id;
              const sessions = store.sessions.filter(
                (x) => x.examId && findExam(x.examId)?.id === id,
              );
              const completed = sessions.filter((x) => x.finishedAt);
              const scores = completed.map((x) =>
                store.attempts
                  .filter((a) => a.sessionId === x.id)
                  .reduce((n, a) => n + a.pointsEarned, 0),
              );
              const active = sessions.find((x) => !x.finishedAt);
              return (
                <tr key={id}>
                  <td>
                    <Link href={`/mdeet/exams/${id}`}>
                      <strong>{examTitle(exam)}</strong>
                    </Link>
                  </td>
                  <td>{exam.questionCount}</td>
                  <td>
                    {exam.pointsTotal == null
                      ? "미확인"
                      : `${exam.pointsTotal}점`}
                  </td>
                  <td>{completed.length}회</td>
                  <td>
                    {exam.pointsTotal == null ||
                    exam.answerKeyStatus !== "complete"
                      ? "채점 자료 미완료"
                      : scores.length
                        ? `${scores.at(-1)} / ${Math.max(...scores)}점`
                        : "미응시"}
                  </td>
                  <td>
                    <Link
                      className={s.button}
                      href={`/mdeet/exams/${id}${active ? `?session=${active.id}` : ""}`}
                    >
                      {active ? "이어 응시" : "시험 열기"}
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
