"use client";
import Link from "next/link";
import { useState } from "react";
import { getCatalog, getLesson } from "../_lib/content";
import { useLoad } from "../_lib/hooks";
import { useRecords, recordsOf, saveRecord, createRecord } from "../_lib/store";
import { latestAttempts, nextReview } from "../_lib/records";
import { Heading, Row, State, url } from "../_components/UI";
import { Text } from "../_components/Text";
import s from "../daewanggorae.module.css";
export function Study() {
  const records = useRecords();
  const due = recordsOf(records, "review").filter(
    (r) => Number(r.data.due) <= Date.now(),
  ).length;
  return (
    <>
      <Heading title="나의 학습" />
      {[
        ["review", "복습", `${due}개 예정`],
        ["bookmarks", "북마크와 필기", "표시해 둔 문단·문항·개인 메모"],
        ["plan", "학습 계획", "오늘 읽을 내용과 나의 목표"],
        ["statistics", "학습 기록", "열람 시간·진도·문제 풀이"],
        ["history", "문제풀이 기록", "당시 선택한 답과 해설 다시 보기"],
        ["account", "계정과 동기화", "게스트 학습 / 대왕고래 계정"],
        ["settings", "설정", "화면·콘텐츠·저장 공간"],
      ].map(([path, title, detail]) => (
        <Row key={path} title={title} detail={detail} href={url(path)} />
      ))}
    </>
  );
}
export function Bookmarks() {
  const records = useRecords();
  const catalog = useLoad(getCatalog, "catalog").data;
  const [kind, setKind] = useState<"bookmark" | "note" | "highlight">(
      "bookmark",
    ),
    [error, setError] = useState("");
  const items = recordsOf(records, kind).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
  return (
    <>
      <Heading title="북마크와 필기" />
      <div className={s.tabs} role="tablist" aria-label="보관 항목">
        {(["bookmark", "note", "highlight"] as const).map((k, i) => (
          <button
            key={k}
            role="tab"
            aria-selected={kind === k}
            onClick={() => setKind(k)}
          >
            {["북마크", "메모", "하이라이트"][i]}
          </button>
        ))}
      </div>
      {items.map((r) => (
        <div key={r.id}>
          <Row
            title={String(
              r.data.title ||
                catalog?.lessons.find((l) => l.id === r.data.lessonId)?.title ||
                "학습 기록",
            )}
            detail={r.kind === "note" ? String(r.data.text) : undefined}
            href={
              r.data.questionId
                ? url("quiz") +
                  "?ids=" +
                  encodeURIComponent(String(r.data.questionId))
                : url("lesson", String(r.data.lessonId)) +
                  "#" +
                  encodeURIComponent(String(r.data.blockId || ""))
            }
          />
          <button
            onClick={() =>
              void saveRecord(
                r.kind,
                r.id.slice(r.kind.length + 1),
                r.data,
                true,
              ).catch((e) => setError(String(e)))
            }
          >
            보관함에서 삭제
          </button>
        </div>
      ))}
      {!items.length && (
        <State empty="아직 저장한 항목이 없습니다. 본문에서 북마크와 메모를 남겨 보세요." />
      )}
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
    </>
  );
}
export function Plan() {
  const records = useRecords();
  const [title, setTitle] = useState(""),
    [date, setDate] = useState(new Date().toLocaleDateString("sv-SE")),
    [error, setError] = useState("");
  const goals = recordsOf(records, "goal").sort((a, b) =>
    String(a.data.date).localeCompare(String(b.data.date)),
  );
  return (
    <>
      <Heading title="학습 계획" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim() || !date) return;
          void createRecord("goal", {
            title: title.trim(),
            date,
            completed: false,
          })
            .then(() => {
              setTitle("");
              setError("");
            })
            .catch((e) => setError(String(e)));
        }}
      >
        <div className={s.filters}>
          <label className={s.field}>
            학습 목표
            <input
              required
              maxLength={500}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="심장 해부학 읽고 연결 문항 풀기"
            />
          </label>
          <label className={s.field}>
            목표 날짜
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </label>
        </div>
        <button type="submit" className={s.primary}>
          목표 추가
        </button>
      </form>
      <section className={s.section}>
        {goals.map((g) => (
          <div key={g.id}>
            <label className={s.row}>
              <input
                type="checkbox"
                checked={!!g.data.completed}
                onChange={() =>
                  void saveRecord("goal", g.id.slice(5), {
                    ...g.data,
                    completed: !g.data.completed,
                  }).catch((e) => setError(String(e)))
                }
              />
              <span className={s.rowText}>
                <strong>{String(g.data.title)}</strong>
                <small>{String(g.data.date)}</small>
              </span>
              <span className={s.muted}>
                {g.data.completed ? "완료" : "예정"}
              </span>
            </label>
            <button
              onClick={() =>
                void saveRecord("goal", g.id.slice(5), g.data, true).catch(
                  (e) => setError(String(e)),
                )
              }
            >
              목표 삭제
            </button>
          </div>
        ))}
        {!goals.length && <State empty="첫 학습 목표를 정해 보세요." />}
      </section>
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
    </>
  );
}
export function Statistics() {
  const records = useRecords(),
    r = useLoad(getCatalog, "catalog");
  const attempts = recordsOf(records, "attempt"),
    latest = Object.values(latestAttempts(records)),
    reading = recordsOf(records, "reading");
  const dates = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - 6 + i);
      return d.toLocaleDateString("sv-SE");
    }),
    times = dates.map((date) =>
      reading
        .filter((r) => r.data.date === date)
        .reduce((n, r) => n + Number(r.data.seconds || 0), 0),
    );
  return (
    <>
      <Heading title="학습 기록" />
      <div className={s.columns}>
        <section>
          <Row
            title="누적 열람"
            meta={`${Math.floor(reading.reduce((n, r) => n + Number(r.data.seconds || 0), 0) / 60)}분`}
          />
          <Row title="전체 풀이 횟수" meta={`${attempts.length}회`} />
          <Row
            title="최근 답안 기준 정답률"
            meta={
              latest.length
                ? `${Math.round((latest.filter((r) => r.data.correct).length / latest.length) * 100)}%`
                : "기록 없음"
            }
          />
        </section>
        <section>
          <h2>최근 7일</h2>
          {dates.map((d, i) => (
            <div key={d}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 13,
                }}
              >
                <span>{d.slice(5)}</span>
                <span>{Math.floor(times[i] / 60)}분</span>
              </div>
              <div className={s.progress}>
                <span
                  style={{
                    width: (times[i] / Math.max(1, ...times)) * 100 + "%",
                  }}
                />
              </div>
            </div>
          ))}
        </section>
      </div>
      <section className={s.section}>
        <h2>과목별 교과서 진도</h2>
        {r.data ? (
          r.data.subjects.map((sub) => {
            const lessons = r.data!.lessons.filter(
                (l) => l.subjectId === sub.id,
              ),
              done = lessons.filter(
                (l) => records["progress:" + l.id]?.data.completed,
              ).length;
            return (
              <Row
                key={sub.id}
                title={sub.title}
                meta={`${done} / ${lessons.length}`}
                href={url("subject", sub.id)}
              />
            );
          })
        ) : (
          <State error={r.error} retry={r.retry} />
        )}
        <p className={s.notice}>작성된 학습 단원만 진도에 포함합니다.</p>
      </section>
    </>
  );
}
export function Review() {
  const records = useRecords(),
    r = useLoad(getCatalog, "catalog");
  const [lessonId, setLessonId] = useState(""),
    [index, setIndex] = useState(0),
    [revealed, setRevealed] = useState(false),
    [error, setError] = useState("");
  const l = useLoad(
    () => (lessonId ? getLesson(lessonId) : Promise.resolve(null)),
    "review:" + lessonId,
  );
  const due = recordsOf(records, "review").filter(
      (x) => Number(x.data.due) <= Date.now(),
    ),
    questions = due.filter((x) => x.data.questionId),
    facts = due.filter(
      (x) => !x.data.questionId && Number.isInteger(x.data.factIndex),
    ),
    completed = recordsOf(records, "progress").filter((x) => x.data.completed);
  const fact = l.data?.keyFacts?.[index];
  return (
    <div className={s.review}>
      <Heading title="복습" />
      {questions.length > 0 && (
        <Link
          className={`${s.button} ${s.primary}`}
          href={
            url("quiz") +
            "?ids=" +
            encodeURIComponent(
              questions.map((x) => x.data.questionId).join(","),
            )
          }
        >
          복습 예정 문항 {questions.length}개 풀기
        </Link>
      )}
      {lessonId ? (
        <>
          <button onClick={() => setLessonId("")}>복습 목록으로</button>
          {l.data ? (
            fact ? (
              <>
                <div className={s.reviewHeading}><Link href={url("lesson",lessonId)}>{l.data.title.ko}</Link><span>{index + 1} / {l.data.keyFacts?.length}</span></div>
                <progress className={s.reviewProgress} value={index} max={l.data.keyFacts?.length || 1} aria-label="복습 진행" />
                <h2>이 단원의 핵심 개념을 떠올려 보세요.</h2>
                <div className={s.flashBody}>
                  {revealed ? (
                    <Text text={fact} />
                  ) : (
                    <button
                      className={s.button}
                      onClick={() => setRevealed(true)}
                    >
                      핵심 지식 확인
                    </button>
                  )}
                </div>
                {revealed && (
                  <div className={s.actions}>
                    {(["again", "hard", "good"] as const).map((quality, i) => (
                      <button
                        key={quality}
                        onClick={() => {
                          const id = lessonId + ":fact:" + index;
                          void saveRecord("review", id, {
                            lessonId,
                            factIndex: index,
                            ...nextReview(
                              records["review:" + id]?.data || {},
                              quality,
                            ),
                          })
                            .then(() => {
                              setRevealed(false);
                              setIndex((i) => i + 1);
                            })
                            .catch((e) => setError(String(e)));
                        }}
                      >
                        {["다시", "어려움", "기억함"][i]}
                      </button>
                    ))}
                  </div>
                )}
                <Link className={s.button} href={url("lesson", lessonId)}>
                  교과서 확인
                </Link>
              </>
            ) : (
              <State empty="이 단원의 핵심 지식을 모두 복습했습니다." />
            )
          ) : (
            <State error={l.error} retry={l.retry} />
          )}
        </>
      ) : (
        <>
          {facts.length > 0 && (
            <section className={s.section}>
              <h2>오늘 복습할 핵심 지식</h2>
              {facts.map((f) => (
                <div key={f.id}>
                  <Row
                    title={
                      r.data?.lessons.find((l) => l.id === f.data.lessonId)
                        ?.title || "학습한 단원"
                    }
                    detail={`핵심 지식 ${Number(f.data.factIndex) + 1}`}
                  >
                    <button
                      onClick={() => {
                        setLessonId(String(f.data.lessonId));
                        setIndex(Number(f.data.factIndex));
                        setRevealed(false);
                      }}
                    >
                      복습
                    </button>
                  </Row>
                </div>
              ))}
            </section>
          )}
          <section className={s.section}>
            <h2>학습한 단원의 핵심 지식</h2>
            {completed.map((x) => (
              <Row
                key={x.id}
                title={
                  r.data?.lessons.find((l) => l.id === x.data.lessonId)
                    ?.title || "학습한 단원"
                }
              >
                <button
                  onClick={() => {
                    setLessonId(String(x.data.lessonId));
                    setIndex(0);
                    setRevealed(false);
                  }}
                >
                  복습
                </button>
              </Row>
            ))}
            {!completed.length && (
              <State empty="본문에서 학습 완료를 표시하면 핵심 지식을 복습할 수 있습니다." />
            )}
          </section>
        </>
      )}
      {error && (
        <p role="alert" className={s.error}>
          {error}
        </p>
      )}
    </div>
  );
}
