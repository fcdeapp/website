"use client";
import Link from "next/link";
import { useState } from "react";
import { useLearning } from "./Workspace";
import { Heading, Progress } from "./UI";
import { SUBJECTS, percent } from "../_lib/constants";
import { due } from "../_lib/scheduler";
import s from "../mdeet.module.css";
export default function Library() {
  const { units, store } = useLearning();
  const [subject, setSubject] = useState("");
  return (
    <>
      <Heading
        title="단원별 학습"
        description="학년도에 관계없이 같은 주제의 기출문제를 모아 학습합니다."
      />
      <div className={s.subjectIndex}>
        {Object.entries(SUBJECTS).map(([key, label]) => {
          const group = units.filter((u) => u.subject === key);
          return (
            <button
              key={key}
              aria-pressed={subject === key}
              onClick={() => setSubject(subject === key ? "" : key)}
            >
              <strong>{label}</strong>
              <span>
                {group.length}개 단원 · {group.reduce((n, u) => n + u.count, 0)}
                문항
              </span>
            </button>
          );
        })}
      </div>
      <div className={s.segmented}>
        {[["", "전체"], ...Object.entries(SUBJECTS)].map(([key, label]) => (
          <button
            key={key}
            aria-pressed={subject === key}
            onClick={() => setSubject(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className={s.tableScroll}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>단원</th>
              <th>과목</th>
              <th>학습 진도</th>
              <th>미풀이</th>
              <th>최근 정답률</th>
              <th>오답</th>
              <th>복습 예정</th>
            </tr>
          </thead>
          <tbody>
            {units
              .filter((u) => !subject || u.subject === subject)
              .map((u) => {
                const ids = new Set(u.questionIds);
                const latest = new Map(
                  store.attempts
                    .filter((a) => ids.has(a.questionId))
                    .map((a) => [a.questionId, a]),
                );
                const answered = [...latest.values()];
                return (
                  <tr key={u.id}>
                    <td>
                      <Link href={`/mdeet/library/${u.id}`}>
                        <strong>{u.label}</strong>
                      </Link>
                    </td>
                    <td>{SUBJECTS[u.subject]}</td>
                    <td>
                      <span>
                        {latest.size} / {u.count}
                      </span>
                      <Progress
                        label={`${u.label} 진도`}
                        value={latest.size}
                        total={u.count}
                      />
                    </td>
                    <td>{u.count - latest.size}</td>
                    <td>
                      {percent(
                        answered.filter((a) => a.correct).length,
                        answered.length,
                      )}
                    </td>
                    <td>{answered.filter((a) => !a.correct).length}</td>
                    <td>
                      {
                        u.questionIds.filter((id) => due(store.learning[id]))
                          .length
                      }
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <p className={s.muted}>
        단원은 주 출제 주제를 기준으로 한 편집 분류입니다. 개념서와 검수된
        해설은 현재 제공되지 않습니다.
      </p>
    </>
  );
}
