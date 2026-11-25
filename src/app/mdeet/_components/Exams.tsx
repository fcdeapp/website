"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useLearning } from "./Workspace";
import { Heading, Field } from "./UI";
import { SUBJECTS } from "../_lib/constants";
import { createSession } from "../_lib/sessions";
import SessionRunner from "./SessionRunner";
import s from "../mdeet.module.css";
export default function Exams({ examId }: { examId?: string }) {
  const { questions, store, update } = useLearning();
  const router = useRouter();
  const params = useSearchParams();
  const [minutes, setMinutes] = useState(0);
  const exams = [...new Set(questions.map((q) => `${q.year}-${q.subject}`))]
    .sort()
    .reverse();
  if (examId) {
    if (!exams.includes(examId))
      return (
        <Heading title="시험을 찾을 수 없습니다.">
          <Link href="/mdeet/exams">시험 목록</Link>
        </Heading>
      );
    const session = params.get("session");
    if (session) {
      const found = store.sessions.find((s) => s.id === session);
      if (found?.examId !== examId)
        return (
          <Heading title="이 시험의 세션이 아닙니다.">
            <Link href={`/mdeet/exams/${examId}`}>시험으로 돌아가기</Link>
          </Heading>
        );
      return <SessionRunner sessionId={session} />;
    }
    const items = questions
      .filter((q) => `${q.year}-${q.subject}` === examId)
      .sort((a, b) => a.number - b.number);
    const first = items[0];
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
          title={`${first.year}학년도 ${SUBJECTS[first.subject]}`}
          description={`${items.length}문항 · ${items.reduce((n, q) => n + q.points, 0)}점 만점`}
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
              자료에 공식 시험 시간이 포함되지 않아 직접 설정합니다. 제한 시간은
              새로고침하거나 다른 화면으로 이동해도 계속됩니다.
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
              .filter((x) => x.examId === examId)
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
          {!store.sessions.some((x) => x.examId === examId) && (
            <p className={s.muted}>응시 기록이 없습니다.</p>
          )}
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
            {exams.map((id) => {
              const items = questions.filter(
                (q) => `${q.year}-${q.subject}` === id,
              );
              const sessions = store.sessions.filter((x) => x.examId === id);
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
                      <strong>
                        {items[0].year}학년도 {SUBJECTS[items[0].subject]}
                      </strong>
                    </Link>
                  </td>
                  <td>{items.length}</td>
                  <td>{items.reduce((n, q) => n + q.points, 0)}점</td>
                  <td>{completed.length}회</td>
                  <td>
                    {scores.length
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
