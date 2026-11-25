"use client";
import Link from "next/link";
import { useLearning } from "./Workspace";
import { Heading, Metric, Progress, Empty } from "./UI";
import { summary } from "../_lib/scoring";
import { mastery } from "../_lib/mastery";
import { due } from "../_lib/scheduler";
import {
  duration,
  localDate,
  percent,
  questionHref,
  SUBJECTS,
  titleOf,
} from "../_lib/constants";
import s from "../mdeet.module.css";
export default function Dashboard() {
  const { store, questions, units } = useLearning();
  const stats = summary(store.attempts);
  const recent = store.attempts.slice(-20);
  const dueIds = questions.filter((q) => due(store.learning[q.id]));
  const dueCards = store.cards.filter(
    (c) => Date.parse(c.nextReviewAt) <= Date.now(),
  );
  const active = store.sessions.filter((x) => !x.finishedAt).at(-1);
  const last = questions.find((q) => q.id === store.lastQuestionId);
  const nextUnit =
    units.find((u) =>
      u.questionIds.some((id) => !stats.first.some((a) => a.questionId === id)),
    ) || units[0];
  const today = localDate();
  const activity = store.attempts.filter(
    (a) => localDate(new Date(a.attemptedAt)) === today,
  );
  const weak = units
    .map((u) => ({
      ...u,
      score: mastery(
        store.attempts.filter((a) => u.questionIds.includes(a.questionId)),
        u.count,
      ),
    }))
    .filter((u) => u.score !== null)
    .sort((a, b) => a.score! - b.score!)
    .slice(0, 5);
  const resume = active
    ? active.mode === "exam"
      ? `/mdeet/exams/${active.examId}?session=${active.id}`
      : `/mdeet/practice?session=${active.id}`
    : last
      ? questionHref(last.id)
      : "/mdeet/library";
  return (
    <>
      <Heading
        title="학습 홈"
        description={new Date().toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      >
        <Link className={s.primary} href={resume}>
          {active || last ? "학습 이어하기" : "학습 시작"}
        </Link>
      </Heading>
      <div className={s.metrics}>
        <Metric
          label="풀이한 고유 문항"
          value={`${stats.first.length} / ${questions.length}`}
          note="재풀이 중복 제외"
        />
        <Metric
          label="최초 풀이 정답률"
          value={percent(
            stats.first.filter((a) => a.correct).length,
            stats.first.length,
          )}
        />
        <Metric
          label="최근 20회 정답률"
          value={percent(recent.filter((a) => a.correct).length, recent.length)}
        />
        <Metric label="누적 학습 시간" value={duration(stats.totalMs)} />
      </div>
      <div className={s.dashboardLead}>
        <div>
          <h2>오늘의 학습</h2>
          <p>
            문항 복습 <strong>{dueIds.length}개</strong> · 카드 복습{" "}
            <strong>{dueCards.length}개</strong>
          </p>
          <p className={s.muted}>
            오늘 {activity.length}회 풀이 ·{" "}
            {duration(activity.reduce((n, a) => n + a.durationMs, 0))}
          </p>
        </div>
        <div className={s.actions}>
          <Link
            className={s.button}
            href={
              dueIds.length
                ? "/mdeet/practice?state=due"
                : `/mdeet/library/${nextUnit.id}`
            }
          >
            {dueIds.length ? "예정된 문항 복습" : `${nextUnit.label} 학습`}
          </Link>
          {dueCards.length > 0 && (
            <Link className={s.button} href="/mdeet/flashcards">
              카드 복습
            </Link>
          )}
        </div>
      </div>
      <div className={s.twoColumns}>
        <section className={s.section}>
          <div className={s.sectionHeading}>
            <h2>과목별 진도</h2>
            <Link href="/mdeet/library">단원 보기</Link>
          </div>
          {Object.entries(SUBJECTS).map(([id, label]) => {
            const total = questions.filter((q) => q.subject === id);
            const count = stats.first.filter((a) =>
              total.some((q) => q.id === a.questionId),
            ).length;
            return (
              <div className={s.subjectProgress} key={id}>
                <div>
                  <h3>{label}</h3>
                  <span>
                    {count}/{total.length}문항 · {percent(count, total.length)}
                  </span>
                </div>
                <Progress
                  label={`${label} 학습 진도`}
                  value={count}
                  total={total.length}
                />
              </div>
            );
          })}
        </section>
        <section className={s.section}>
          <div className={s.sectionHeading}>
            <h2>복습을 살펴볼 단원</h2>
            <Link href="/mdeet/analytics">전체 분석</Link>
          </div>
          {weak.length ? (
            <ul className={s.rows}>
              {weak.map((u) => (
                <li key={u.id}>
                  <Link href={`/mdeet/library/${u.id}`}>{u.label}</Link>
                  <span>숙달도 추정 {u.score}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty title="단원별 기록을 모으고 있습니다.">
              <p>3회 이상 풀이한 단원부터 참고 지표를 표시합니다.</p>
            </Empty>
          )}
        </section>
      </div>
      <div className={s.twoColumns}>
        <section className={s.section}>
          <div className={s.sectionHeading}>
            <h2>최근 학습 기록</h2>
            <Link href="/mdeet/analytics">전체 기록</Link>
          </div>
          {store.attempts.length ? (
            <ul className={s.rows}>
              {store.attempts
                .slice(-6)
                .reverse()
                .map((a) => {
                  const q = questions.find((q) => q.id === a.questionId)!;
                  return (
                    <li key={a.id}>
                      <Link href={questionHref(q.id)}>
                        {titleOf(q)}
                        <small>{q.topic}</small>
                      </Link>
                      <span className={a.correct ? s.goodText : s.badText}>
                        {a.correct ? "정답" : "오답"}
                        <small>{duration(a.durationMs)}</small>
                      </span>
                    </li>
                  );
                })}
            </ul>
          ) : (
            <Empty title="아직 풀이 기록이 없습니다.">
              <p>답안을 제출하면 기록이 쌓입니다.</p>
            </Empty>
          )}
        </section>
        <section className={s.section}>
          <h2>최근 모의고사 결과</h2>
          {store.sessions.some((x) => x.mode === "exam" && x.finishedAt) ? (
            <ul className={s.rows}>
              {store.sessions
                .filter((x) => x.mode === "exam" && x.finishedAt)
                .slice(-5)
                .reverse()
                .map((x) => (
                  <li key={x.id}>
                    <Link href={`/mdeet/exams/${x.examId}?session=${x.id}`}>
                      {x.examId
                        ?.replace("biology", "생물학")
                        .replace("chemistry", "화학")}
                    </Link>
                    <span>
                      {store.attempts
                        .filter((a) => a.sessionId === x.id)
                        .reduce((n, a) => n + a.pointsEarned, 0)}
                      점
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <Empty title="아직 응시한 시험이 없습니다.">
              <Link href="/mdeet/exams">시험 목록 보기</Link>
            </Empty>
          )}
        </section>
      </div>
      <div className={s.twoColumns}>
        <section className={s.section}>
          <h2>북마크한 문항</h2>
          {questions.some((q) => store.learning[q.id]?.bookmarked) ? (
            <ul className={s.rows}>
              {questions
                .filter((q) => store.learning[q.id]?.bookmarked)
                .slice(0, 8)
                .map((q) => (
                  <li key={q.id}>
                    <Link href={questionHref(q.id)}>{titleOf(q)}</Link>
                    <span>{q.topic}</span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className={s.muted}>다시 보고 싶은 문항을 북마크하세요.</p>
          )}
        </section>
        <section className={s.section}>
          <div className={s.sectionHeading}>
            <h2>오늘의 계획</h2>
            <Link href="/mdeet/calendar">캘린더</Link>
          </div>
          {store.plans.filter((p) => p.date === today).length ? (
            <ul className={s.rows}>
              {store.plans
                .filter((p) => p.date === today)
                .map((p) => (
                  <li key={p.id}>
                    <span>{p.title}</span>
                    <span>
                      {p.done ? "완료" : `${p.target}문항 · ${p.minutes}분`}
                    </span>
                  </li>
                ))}
            </ul>
          ) : (
            <p className={s.muted}>오늘 등록한 학습 계획이 없습니다.</p>
          )}
        </section>
      </div>
    </>
  );
}
