"use client";
import Link from "next/link";
import { useLearning } from "./Workspace";
import { Heading, Progress } from "./UI";
import { books, sections, totalKnowledge, sectionHref } from "../_lib/textbook";
import { summary } from "../_lib/scoring";
import { due } from "../_lib/scheduler";
import {
  localDate,
  percent,
  duration,
  titleOf,
  questionHref,
} from "../_lib/constants";
import e from "../editorial.module.css";
import s from "../mdeet.module.css";
export default function Dashboard() {
  const { store, questions } = useLearning();
  const stats = summary(store.attempts);
  const last = sections.find((x) => x.id === store.textbook?.lastSectionId);
  const plans = store.plans.filter((p) => p.date === localDate());
  const dueQuestions = questions.filter((q) =>
    due(store.learning[q.id]),
  ).length;
  const dueCards = store.cards.filter(
    (c) => Date.parse(c.nextReviewAt) <= Date.now(),
  ).length;
  const knowledge = Object.values(store.textbook?.knowledge || {});
  const active = store.sessions.filter((x) => !x.finishedAt).at(-1);
  const lastQuestion = questions.find((q) => q.id === store.lastQuestionId);
  return (
    <>
      <Heading
        title="학습 기록부"
        description={new Date().toLocaleDateString("ko-KR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          weekday: "long",
        })}
      >
        <Link href="/mdeet/calendar">학습 계획</Link>
      </Heading>
      <div className={e.ledger}>
        <div className={e.ledgerMain}>
          <section className={e.resume}>
            <p className={e.eyebrow}>
              {last ? "마지막으로 읽은 절" : "교과서 학습"}
            </p>
            <h2>{last?.title || "첫 장을 펼쳐보세요."}</h2>
            <p>
              {last
                ? books.find((b) => b.id === last.book)?.title
                : `${books.length}개 교과서 · ${sections.length}개 학습 절`}
            </p>
            <div className={e.chapterLinks}>
              <Link
                className={s.primary}
                href={last ? sectionHref(last.id) : "/mdeet/textbook"}
              >
                {last ? "이어서 읽기" : "교과서 서가"}
              </Link>
              <Link href="/mdeet/knowledge">지식 라이브러리</Link>
            </div>
            {active && (
              <Link
                href={
                  active.mode === "exam"
                    ? `/mdeet/exams/${active.examId}?session=${active.id}`
                    : `/mdeet/practice?session=${active.id}`
                }
              >
                진행 중인 {active.mode === "exam" ? "모의고사" : "맞춤 풀이"}{" "}
                이어가기 · {Object.keys(active.answers).length}/
                {active.questionIds.length}문항
              </Link>
            )}
            {!active && lastQuestion && (
              <Link href={questionHref(lastQuestion.id)}>
                최근 문항 · {titleOf(lastQuestion)}
              </Link>
            )}
          </section>
          <section className={e.ledgerSection}>
            <div className={s.sectionHeading}>
              <h2>교과서 진도</h2>
              <Link href="/mdeet/textbook">전체 목차</Link>
            </div>
            {books.map((b) => {
              const done = sections.filter(
                (sec) =>
                  sec.book === b.id &&
                  store.textbook?.sections[sec.id]?.completed,
              ).length;
              return (
                <div className={e.progressRow} key={b.id}>
                  <Link href={`/mdeet/textbook/${b.id}`}>{b.title}</Link>
                  <Progress
                    label={`${b.title} 학습 진도`}
                    value={done}
                    total={b.sectionCount}
                  />
                  <span>
                    {done} / {b.sectionCount}절
                  </span>
                </div>
              );
            })}
          </section>
          <section className={e.ledgerSection}>
            <h2>최근 학습</h2>
            {Object.entries(store.textbook?.sections || {})
              .filter(([, v]) => v.lastReadAt)
              .sort((a, b) =>
                (b[1].lastReadAt || "").localeCompare(a[1].lastReadAt || ""),
              )
              .slice(0, 4)
              .map(([id, v]) => (
                <div className={e.planRow} key={id}>
                  <Link href={sectionHref(id)}>
                    {sections.find((sec) => sec.id === id)?.title || id}
                  </Link>
                  <span>{v.completed ? "학습 완료" : "읽는 중"}</span>
                </div>
              ))}
            {store.attempts
              .slice(-4)
              .reverse()
              .map((a) => {
                const q = questions.find((x) => x.id === a.questionId);
                return (
                  q && (
                    <div className={e.planRow} key={a.id}>
                      <Link href={questionHref(q.id)}>{titleOf(q)}</Link>
                      <span>
                        {a.ungraded ? "채점 보류" : a.correct ? "정답" : "오답"}
                      </span>
                    </div>
                  )
                );
              })}
            {!store.attempts.length &&
              !Object.keys(store.textbook?.sections || {}).length && (
                <p className={s.empty}>
                  읽은 절과 풀이한 문항이 여기에 기록됩니다.
                </p>
              )}
          </section>
        </div>
        <aside className={e.ledgerAside}>
          <section>
            <p className={e.eyebrow}>오늘의 학습</p>
            <h2>계획과 복습</h2>
            {plans.map((p) => (
              <div className={e.planRow} key={p.id}>
                <span>{p.title}</span>
                <span>{p.done ? "완료" : `${p.target}개`}</span>
              </div>
            ))}
            {!plans.length && (
              <p className={s.empty}>
                오늘 등록된 계획이 없습니다.
                <br />
                <Link href="/mdeet/calendar">학습 계획 작성</Link>
              </p>
            )}
            <div className={e.planRow}>
              <Link href="/mdeet/review">예정된 문항 복습</Link>
              <span>{dueQuestions}문항</span>
            </div>
            <div className={e.planRow}>
              <Link href="/mdeet/flashcards">개인 카드 복습</Link>
              <span>{dueCards}개</span>
            </div>
            <div className={e.chapterLinks}>
              <Link href="/mdeet/knowledge?review=1">교과서 지식 복습</Link>
            </div>
          </section>
          <section className={e.ledgerSection}>
            <h2>지식 학습 현황</h2>
            <dl className={e.ledgerNumbers}>
              <dt>이해한 지식</dt>
              <dd>
                {knowledge.filter((k) => k.understood).length} /{" "}
                {totalKnowledge}
              </dd>
              <dt>암기한 지식</dt>
              <dd>
                {knowledge.filter((k) => k.memorized).length} / {totalKnowledge}
              </dd>
            </dl>
          </section>
          <section className={e.ledgerSection}>
            <h2>기출문제 성취도</h2>
            <dl className={e.ledgerNumbers}>
              <dt>풀이한 문항</dt>
              <dd>
                {new Set(store.attempts.map((a) => a.questionId)).size} /{" "}
                {questions.length}
              </dd>
              <dt>최초 풀이 정답률</dt>
              <dd>
                {percent(
                  stats.first.filter((a) => a.correct).length,
                  stats.first.length,
                )}
              </dd>
              <dt>최근 풀이 정답률</dt>
              <dd>
                {percent(
                  stats.latest.filter((a) => a.correct).length,
                  stats.latest.length,
                )}
              </dd>
              <dt>누적 풀이 시간</dt>
              <dd>{duration(stats.totalMs)}</dd>
            </dl>
            <div className={e.chapterLinks}>
              <Link href="/mdeet/analytics">자세한 학습 분석</Link>
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}
