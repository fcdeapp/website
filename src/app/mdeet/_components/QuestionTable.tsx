"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useLearning } from "./Workspace";
import type { Attempt, QuestionIndexItem } from "../_lib/types";
import { SUBJECTS, questionHref, titleOf } from "../_lib/constants";
import { blankLearning } from "../_lib/scheduler";
import { createSession } from "../_lib/sessions";
import { Empty } from "./UI";
import s from "../mdeet.module.css";
export default function QuestionTable({
  items,
}: {
  items: QuestionIndexItem[];
}) {
  const { store, update } = useLearning();
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [limit, setLimit] = useState(30);
  const histories = useMemo(() => {
    const map = new Map<string, Attempt[]>();
    for (const attempt of store.attempts) {
      const list = map.get(attempt.questionId) || [];
      list.push(attempt);
      map.set(attempt.questionId, list);
    }
    return map;
  }, [store.attempts]);
  const visibleIds = new Set(items.map((q) => q.id));
  const chosen = [...selected].filter((id) => visibleIds.has(id));
  function start() {
    if (!chosen.length) return;
    const session = createSession(chosen, store.settings);
    update((st) => ({ ...st, sessions: [...st.sessions, session] }));
    router.push(`/mdeet/practice?session=${session.id}`);
  }
  if (!items.length)
    return (
      <Empty title="해당하는 문항이 없습니다.">
        <p>검색어나 필터 조건을 바꿔 보세요.</p>
      </Empty>
    );
  return (
    <>
      <div className={s.tableActions}>
        <span>
          {items.length}문항 · {chosen.length}개 선택
        </span>
        <button disabled={!chosen.length} onClick={start}>
          선택 문항 풀기
        </button>
      </div>
      <div className={s.tableScroll}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>
                <input
                  aria-label="현재 검색 결과 모두 선택"
                  type="checkbox"
                  checked={chosen.length === items.length}
                  onChange={(e) =>
                    setSelected(
                      e.target.checked
                        ? new Set(items.map((q) => q.id))
                        : new Set(),
                    )
                  }
                />
              </th>
              <th>문항</th>
              <th>과목</th>
              <th>단원 / 출제 주제</th>
              <th>배점</th>
              <th>풀이 상태</th>
              <th>최근 결과</th>
              <th>북마크</th>
            </tr>
          </thead>
          <tbody>
            {items.slice(0, limit).map((q) => {
              const attempts = histories.get(q.id) || [];
              const last = attempts[attempts.length - 1];
              return (
                <tr key={q.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`${titleOf(q)} 선택`}
                      checked={selected.has(q.id)}
                      onChange={(e) =>
                        setSelected((prev) => {
                          const set = new Set(prev);
                          if (e.target.checked) set.add(q.id);
                          else set.delete(q.id);
                          return set;
                        })
                      }
                    />
                  </td>
                  <td>
                    <Link href={questionHref(q.id)}>
                      {q.year}학년도 <strong>{q.number}번</strong>
                    </Link>
                  </td>
                  <td>{SUBJECTS[q.subject]}</td>
                  <td>
                    <Link href={`/mdeet/library/${q.unitId}`}>
                      {q.unitLabel}
                    </Link>
                    <small>{q.topic}</small>
                  </td>
                  <td>{q.points}점</td>
                  <td>
                    {attempts.length ? `${attempts.length}회 풀이` : "미풀이"}
                  </td>
                  <td
                    className={
                      last?.correct ? s.goodText : last ? s.badText : undefined
                    }
                  >
                    {last ? (last.correct ? "정답" : "오답") : "—"}
                  </td>
                  <td>
                    <button
                      className={s.bookmarkButton}
                      aria-label={`${titleOf(q)} 북마크`}
                      aria-pressed={!!store.learning[q.id]?.bookmarked}
                      onClick={() =>
                        update((st) => ({
                          ...st,
                          learning: {
                            ...st.learning,
                            [q.id]: {
                              ...(st.learning[q.id] || blankLearning()),
                              bookmarked: !st.learning[q.id]?.bookmarked,
                            },
                          },
                        }))
                      }
                    >
                      {store.learning[q.id]?.bookmarked ? "저장됨" : "저장"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {limit < items.length && (
        <button className={s.more} onClick={() => setLimit((n) => n + 30)}>
          문항 더 보기 ({Math.min(limit, items.length)}/{items.length})
        </button>
      )}
    </>
  );
}
