"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useLearning } from "./Workspace";
import { Heading, Metric, Empty } from "./UI";
import { summary } from "../_lib/scoring";
import { mastery } from "../_lib/mastery";
import { due } from "../_lib/scheduler";
import {
  CONFIDENCE,
  SUBJECTS,
  duration,
  localDate,
  percent,
  titleOf,
  questionHref,
} from "../_lib/constants";
import s from "../mdeet.module.css";
export default function Analytics() {
  const { store, questions, units } = useLearning();
  const [period, setPeriod] = useState<"day" | "week">("day");
  const attempts = store.attempts;
  const stats = useMemo(() => summary(attempts), [attempts]);
  const recent = attempts.slice(-20);
  const byId = new Map(questions.map((q) => [q.id, q]));
  const repeatedIds = new Set(stats.repeats.map((a) => a.questionId));
  const repeatedWrong = [...repeatedIds].filter(
    (id) =>
      attempts.filter((a) => a.questionId === id && !a.correct).length >= 2,
  ).length;
  const reviewDone = attempts.filter((a) => a.wasDue).length;
  const reviewPending = Object.values(store.learning).filter((l) =>
    due(l),
  ).length;
  const days = Array.from({ length: 56 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 55 + i);
    return localDate(d);
  });
  const bins =
    period === "day"
      ? days.slice(-14).map((day) => ({
          label: day.slice(5),
          items: attempts.filter(
            (a) => localDate(new Date(a.attemptedAt)) === day,
          ),
        }))
      : Array.from({ length: 8 }, (_, i) => {
          const group = days.slice(i * 7, i * 7 + 7);
          return {
            label: `${group[0].slice(5)}–${group[6].slice(5)}`,
            items: attempts.filter((a) =>
              group.includes(localDate(new Date(a.attemptedAt))),
            ),
          };
        });
  const max = Math.max(1, ...bins.map((b) => b.items.length));
  const maxTime = Math.max(
    1,
    ...bins.map((b) => b.items.reduce((n, a) => n + a.durationMs, 0)),
  );
  return (
    <>
      <Heading
        title="학습 분석"
        description="이 브라우저에 저장된 실제 풀이 기록을 집계합니다."
      />
      <div className={s.metrics}>
        <Metric
          label="전체 문항 커버리지"
          value={percent(stats.first.length, questions.length)}
          note={`${stats.first.length}/${questions.length}문항`}
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
        <Metric
          label="재풀이 정답률"
          value={percent(
            stats.repeats.filter((a) => a.correct).length,
            stats.repeats.length,
          )}
          note={`${stats.repeats.length}회`}
        />
        <Metric
          label="평균 풀이 시간"
          value={duration(
            attempts.length ? stats.totalMs / attempts.length : 0,
          )}
        />
        <Metric label="누적 학습 시간" value={duration(stats.totalMs)} />
        <Metric
          label="반복 오답률"
          value={percent(repeatedWrong, repeatedIds.size)}
          note="2회 이상 푼 고유 문항 기준"
        />
        <Metric
          label="복습 완료 비율"
          value={percent(reviewDone, reviewDone + reviewPending)}
          note="예정 복습 완료 횟수 / (완료 + 현재 대기)"
        />
      </div>
      {!attempts.length && (
        <Empty title="아직 분석할 학습 기록이 없습니다.">
          <p>문제를 풀면 이 화면에 학습량과 정답률이 반영됩니다.</p>
          <Link className={s.button} href="/mdeet/library">
            단원별 학습 시작
          </Link>
        </Empty>
      )}
      <section className={s.section}>
        <div className={s.sectionHeading}>
          <h2>학습량과 학습 시간</h2>
          <div className={s.segmented}>
            <button
              aria-pressed={period === "day"}
              onClick={() => setPeriod("day")}
            >
              일별
            </button>
            <button
              aria-pressed={period === "week"}
              onClick={() => setPeriod("week")}
            >
              주별
            </button>
          </div>
        </div>
        <div className={s.twoColumns}>
          <div className={s.chart} aria-label="기간별 문제 풀이 횟수">
            {bins.map((b) => (
              <div className={s.chartColumn} key={b.label}>
                <span>{b.items.length}</span>
                <div className={s.chartTrack}>
                  <div style={{ height: `${(b.items.length / max) * 100}%` }} />
                </div>
                <small>{b.label}</small>
              </div>
            ))}
          </div>
          <div className={s.chart} aria-label="기간별 학습 시간, 분">
            {bins.map((b) => {
              const ms = b.items.reduce((n, a) => n + a.durationMs, 0);
              return (
                <div className={s.chartColumn} key={b.label}>
                  <span>{Math.round(ms / 60000)}분</span>
                  <div className={s.chartTrack}>
                    <div style={{ height: `${(ms / maxTime) * 100}%` }} />
                  </div>
                  <small>{b.label}</small>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className={s.section}>
        <h2>과목별 정답률 변화</h2>
        <div className={s.tableScroll}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>기간</th>
                {Object.values(SUBJECTS).map((t) => (
                  <th key={t}>{t} 정답률 (표본)</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bins.map((b) => (
                <tr key={b.label}>
                  <td>{b.label}</td>
                  {Object.keys(SUBJECTS).map((sub) => {
                    const a = b.items.filter(
                      (a) => byId.get(a.questionId)?.subject === sub,
                    );
                    return (
                      <td key={sub}>
                        {percent(a.filter((x) => x.correct).length, a.length)} (
                        {a.length}회){a.length < 3 ? " · 자료 부족" : ""}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <div className={s.twoColumns}>
        <section className={s.section}>
          <h2>과목별 커버리지</h2>
          <ul className={s.rows}>
            {Object.entries(SUBJECTS).map(([id, label]) => {
              const total = questions.filter((q) => q.subject === id).length;
              const solved = stats.first.filter(
                (a) => byId.get(a.questionId)?.subject === id,
              ).length;
              return (
                <li key={id}>
                  <span>{label}</span>
                  <strong>
                    {solved}/{total} · {percent(solved, total)}
                  </strong>
                </li>
              );
            })}
          </ul>
        </section>
        <section className={s.section}>
          <h2>확신도와 정답률</h2>
          <ul className={s.rows}>
            {Object.entries(CONFIDENCE).map(([key, label]) => {
              const a = attempts.filter((a) => a.confidence === key);
              return (
                <li key={key}>
                  <span>
                    {label} · {a.length}회
                  </span>
                  <strong>
                    {percent(a.filter((x) => x.correct).length, a.length)}
                    {a.length < 3 ? " · 자료 부족" : ""}
                  </strong>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
      <section className={s.section}>
        <h2>단원별 정답률 및 숙달도</h2>
        <p className={s.muted}>
          숙달도는 문항 커버리지·최근 결과·확신도·복습 경과일을 반영한 내부
          추정치입니다. 3회 미만은 자료 부족으로 표시하며, 공식 시험 성적이나
          실력 평가가 아닙니다.
        </p>
        <div className={s.heatmap}>
          {units.map((u) => {
            const a = attempts.filter((a) =>
              u.questionIds.includes(a.questionId),
            );
            const score = mastery(a, u.count);
            return (
              <Link
                key={u.id}
                href={`/mdeet/library/${u.id}`}
                style={
                  score === null
                    ? undefined
                    : {
                        background: `rgba(54,95,118,${0.05 + (score / 100) * 0.22})`,
                      }
                }
              >
                <span>{u.label}</span>
                <strong>{score === null ? "자료 부족" : `${score}%`}</strong>
              </Link>
            );
          })}
        </div>
        <div className={s.tableScroll}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>단원</th>
                <th>풀이 표본</th>
                <th>정답률</th>
                <th>숙달도</th>
              </tr>
            </thead>
            <tbody>
              {units.map((u) => {
                const a = attempts.filter((a) =>
                  u.questionIds.includes(a.questionId),
                );
                const score = mastery(a, u.count);
                const correct = a.filter((a) => a.correct).length;
                return (
                  <tr key={u.id}>
                    <td>
                      <Link href={`/mdeet/library/${u.id}`}>{u.label}</Link>
                    </td>
                    <td>{a.length}회</td>
                    <td>
                      <div className={s.barRow}>
                        <span
                          style={{
                            width: `${a.length ? (correct / a.length) * 100 : 0}%`,
                          }}
                        />
                        <b>{percent(correct, a.length)}</b>
                      </div>
                    </td>
                    <td>{score === null ? "자료 부족" : `${score}%`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
      <section className={s.section}>
        <h2>배점별 정답률</h2>
        <ul className={s.rows}>
          {[3, 4, 5].map((p) => {
            const a = attempts.filter(
              (a) => byId.get(a.questionId)?.points === p,
            );
            return (
              <li key={p}>
                <span>
                  {p}점 · {a.length}회
                </span>
                <strong>
                  {percent(a.filter((a) => a.correct).length, a.length)}
                </strong>
              </li>
            );
          })}
        </ul>
      </section>
      <section className={s.section}>
        <h2>최근 8주 학습 활동</h2>
        <div className={s.activity}>
          {days.map((day) => {
            const count = attempts.filter(
              (a) => localDate(new Date(a.attemptedAt)) === day,
            ).length;
            return (
              <div
                key={day}
                title={`${day}: ${count}회`}
                aria-label={`${day}: ${count}회`}
                style={{
                  background: count
                    ? `rgba(54,95,118,${Math.min(0.85, 0.2 + count / 30)})`
                    : undefined,
                }}
              />
            );
          })}
        </div>
        <p className={s.muted}>
          {days[0]}–{days.at(-1)} · 색이 진할수록 풀이 횟수가 많습니다.
        </p>
      </section>
      <section className={s.section}>
        <h2>전체 학습 기록</h2>
        <ul className={s.rows}>
          {attempts
            .slice()
            .reverse()
            .map((a) => (
              <li key={a.id}>
                <Link href={questionHref(a.questionId)}>
                  {titleOf(byId.get(a.questionId)!)}
                </Link>
                <span>
                  {new Date(a.attemptedAt).toLocaleString("ko-KR")} ·{" "}
                  {a.correct ? "정답" : "오답"} · {duration(a.durationMs)}
                </span>
              </li>
            ))}
        </ul>
      </section>
    </>
  );
}
