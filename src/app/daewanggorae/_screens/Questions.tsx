"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { profileLabel } from "../_lib/questions/model";
import { getCatalog } from "../_lib/content";
import { useLoad } from "../_lib/hooks";
import { useRecords } from "../_lib/store";
import { latestAttempts } from "../_lib/records";
import { Heading, Row, Select, State, url } from "../_components/UI";
import s from "../daewanggorae.module.css";
export default function Questions() {
  const router = useRouter(),
    params = useSearchParams();
  const r = useLoad(getCatalog, "catalog"),
    records = useRecords(),
    attempts = useMemo(() => latestAttempts(records), [records]);
  const [domain, setDomain] = useState(""),
    [subject, setSubject] = useState(params.get("subject") || ""),
    [lesson, setLesson] = useState(params.get("lesson") || ""),
    [status, setStatus] = useState("all"),
    [query, setQuery] = useState(""),
    [limit, setLimit] = useState(40);
  if (!r.data) return <State error={r.error} retry={r.retry} />;
  const c = r.data;
  const filtered = c.questions.filter(
    (q) =>
      (!domain || q.domainId === domain) &&
      (!subject || q.subjectId === subject) &&
      (!lesson || q.lessonId === lesson) &&
      q.title.toLowerCase().includes(query.toLowerCase()) &&
      (status === "all" ||
        (status === "new" && !attempts[q.id]) ||
        (status === "wrong" && attempts[q.id]?.data.correct === false)),
  );
  return (
    <>
      <Heading title="문제은행" detail="과목과 단원별로 풀어보는 자체 제작 학습 문항" />
      <Link className={s.button} href={url("history")}>학습 기록</Link>
      <label className={s.field}>
        문항 검색
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="출제 주제나 문항 내용"
        />
      </label>
      <div className={s.filters}>
        <Select
          label="분야"
          value={domain}
          onChange={(x) => {
            setDomain(x);
            setSubject("");
            setLesson("");
          }}
          options={[
            { id: "", title: "전체 분야" },
            ...c.domains.map((x) => ({ id: x.id, title: x.title.ko })),
          ]}
        />
        <Select
          label="과목"
          value={subject}
          onChange={(x) => {
            setSubject(x);
            setLesson("");
          }}
          options={[
            { id: "", title: "전체 과목" },
            ...c.subjects.filter((x) => !domain || x.domainId === domain),
          ]}
        />
        <Select
          label="단원"
          value={lesson}
          onChange={setLesson}
          options={[
            { id: "", title: "전체 단원" },
            ...c.lessons.filter(
              (x) =>
                (!domain || x.domainId === domain) &&
                (!subject || x.subjectId === subject),
            ),
          ]}
        />
        <Select
          label="풀이 상태"
          value={status}
          onChange={setStatus}
          options={[
            { id: "all", title: "전체" },
            { id: "new", title: "미풀이" },
            { id: "wrong", title: "오답" },
          ]}
        />
      </div>
      <div className={s.actions}>
        <span className={s.muted}>{filtered.length}문항</span>
        <button
          disabled={!filtered.length}
          className={s.primary}
          onClick={() => {
            const ids = filtered.map((x) => x.id);
            for (let i = ids.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [ids[i], ids[j]] = [ids[j], ids[i]];
            }
            router.push(
              url("quiz") +
                "?ids=" +
                encodeURIComponent(ids.slice(0, 10).join(",")),
            );
          }}
        >
          랜덤 10문항
        </button>
      </div>
      {filtered.slice(0, limit).map((q, i) => (
        <Row
          key={q.id}
          number={String(i + 1).padStart(2, "0")}
          title={q.title}
          detail={[c.lessons.find((l) => l.id === q.lessonId)?.title, profileLabel(q.profile || "")].filter(Boolean).join(" · ")}
          meta={
            !attempts[q.id]
              ? "미풀이"
              : attempts[q.id].data.correct
                ? "정답"
                : "오답"
          }
          href={url("quiz") + "?ids=" + encodeURIComponent(q.id)}
        />
      ))}
      {filtered.length > limit && (
        <button onClick={() => setLimit((n) => n + 40)}>문항 더 보기</button>
      )}
      {!filtered.length && <State empty="조건에 맞는 문항이 없습니다." />}
    </>
  );
}
