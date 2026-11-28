"use client";
import Link from "next/link";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { getCatalog } from "../_lib/content";
import { useLoad } from "../_lib/hooks";
import { recordsOf, useRecords } from "../_lib/store";
import { Heading, Row, Select, State, url } from "../_components/UI";
import s from "../daewanggorae.module.css";
import SceneViewer from "../_components/SceneViewer";
export function Home() {
  const r = useLoad(getCatalog, "catalog");
  const records = useRecords();
  const last = recordsOf(records, "progress").sort(
    (a, b) => b.updatedAt - a.updatedAt,
  )[0];
  const lesson = r.data?.lessons.find((l) => l.id === last?.data.lessonId);
  const resumeScenes = r.data?.scenes.filter(s => s.lessonId === lesson?.id) || [];
  const resumeScene = resumeScenes.find(s=>s.triggerBlockId===last?.data.lastBlockId) || resumeScenes[0];
  const goals = recordsOf(records, "goal").filter((x) => !x.data.completed);
  const due = recordsOf(records, "review").filter(
    (x) => Number(x.data.due) <= Date.now(),
  );
  return (
    <>
      <Heading title={lesson ? "이어서 학습하기" : "교과서에서 시작하기"} />
      <div className={s.columns}>
        <div>
          <section className={`${s.intro} ${s.homeIntro}`}>
            {lesson ? (
              <>
                <p>마지막으로 읽은 단원</p>
                <h2>{lesson.title}</h2>
                <p>
                  {
                    r.data?.subjects.find((x) => x.id === lesson.subjectId)
                      ?.title
                  }
                </p>
                <Link
                  className={`${s.button} ${s.primary}`}
                  href={
                    url("lesson", lesson.id) +
                    (last.data.lastBlockId
                      ? "#" + encodeURIComponent(String(last.data.lastBlockId))
                      : "")
                  }
                >
                  이어서 읽기
                </Link>
              </>
            ) : (
              <>
                <h2>공부할 과목을 선택하세요.</h2>
                <p>교과서에서 개념을 익히고, 해부학과 문제로 연결해 보세요.</p>
                <div className={s.actions}>
                  <Link
                    className={`${s.button} ${s.primary}`}
                    href={url("textbook")}
                  >
                    교과서 펼치기
                  </Link>
                  <Link className={s.button} href={url("anatomy")}>
                    3D 해부학
                  </Link>
                </div>
              </>
            )}
          </section>
          {resumeScene && <section className={s.section}><h2>{resumeScene.title}</h2><SceneViewer sceneId={resumeScene.id} /></section>}
          <section className={s.section}>
            <h2>의학 전 분야</h2>
            {r.data ? (
              r.data.domains.map((d, i) => (
                <Row
                  key={d.id}
                  number={String(i + 1).padStart(2, "0")}
                  title={d.title.ko}
                  detail={`${r.data!.subjects.filter((x) => x.domainId === d.id).length}개 과목`}
                  href={url("textbook") + "?domain=" + d.id}
                />
              ))
            ) : (
              <State error={r.error} retry={r.retry} />
            )}
          </section>
        </div>
        <aside>
          <section className={s.section}>
            <h2>오늘의 학습</h2>
            {goals.length ? (
              goals
                .slice(0, 4)
                .map((g) => (
                  <Row
                    key={g.id}
                    title={String(g.data.title)}
                    detail={String(g.data.date || "")}
                    href={url("plan")}
                  />
                ))
            ) : (
              <Row
                title="학습 계획 세우기"
                detail="오늘 읽을 단원과 목표를 정해 보세요."
                href={url("plan")}
              />
            )}
            <Row
              title="예정된 복습"
              meta={`${due.length}개`}
              href={url("review")}
            />
            <Row title="북마크와 필기" href={url("bookmarks")} />
            <Row title="주간 학습 기록" href={url("statistics")} />
          </section>
          <p className={s.notice}>
            로그인 없이도 학습할 수 있습니다. 학습 기록은 이 브라우저에
            저장됩니다.
          </p>
          <p className={s.notice}>현재 교과서는 전문의 검수 전 초안입니다.</p>
        </aside>
      </div>
    </>
  );
}
export function Textbook() {
  const r = useLoad(getCatalog, "catalog");
  const params = useSearchParams();
  const [domain, setDomain] = useState(params.get("domain") || "");
  return (
    <>
      <Heading
        title="의학 교과서"
        detail="기초의학부터 임상의학까지, 과목별로 읽는 교과서"
      />
      {r.data ? (
        <>
          <div className={s.filters}>
            <Select
              label="분야"
              value={domain}
              onChange={setDomain}
              options={[
                { id: "", title: "전체 분야" },
                ...r.data.domains.map((d) => ({ id: d.id, title: d.title.ko })),
              ]}
            />
          </div>
          <div className={s.catalog}>
            {r.data.subjects
              .filter((x) => !domain || x.domainId === domain)
              .map((x, i) => (
                <Row
                  key={x.id}
                  number={String(i + 1).padStart(2, "0")}
                  title={x.title}
                  detail={`${r.data!.lessons.filter((l) => l.subjectId === x.id).length}개 작성 단원 · 초안`}
                  href={url("subject", x.id)}
                />
              ))}
          </div>
          <p className={s.notice}>전체 교육과정의 일부만 작성되어 있습니다.</p>
        </>
      ) : (
        <State error={r.error} retry={r.retry} />
      )}
    </>
  );
}
export function Subject() {
  const id = useSearchParams().get("id") || "";
  const r = useLoad(getCatalog, "catalog");
  const records = useRecords();
  if (!r.data) return <State error={r.error} retry={r.retry} />;
  const c = r.data,
    subject = c.subjects.find((x) => x.id === id);
  if (!subject) return <State empty="과목을 찾을 수 없습니다." />;
  return (
    <>
      <div className={s.breadcrumb}>
        <Link href={url("textbook")}>교과서</Link>
        <span>
          {" "}
          / {c.domains.find((d) => d.id === subject.domainId)?.title.ko}
        </span>
      </div>
      <Heading title={subject.title} />
      {c.chapters
        .filter((x) => x.subjectId === id)
        .map((x, i) => {
          const ls = c.lessons.filter((l) => l.chapterId === x.id);
          return (
            <Row
              key={x.id}
              number={String(i + 1).padStart(2, "0")}
              title={x.title}
              detail={`${ls.length}개 단원 · ${ls.filter((l) => records["progress:" + l.id]?.data.completed).length}개 완료`}
              href={url("chapter", x.id)}
            />
          );
        })}
      {c.planned.some(
        (x) => x.subjectId === id && x.status === "unwritten",
      ) && (
        <section className={s.section}>
          <h2>준비 중인 학습 범위</h2>
          {c.planned
            .filter((x) => x.subjectId === id && x.status === "unwritten")
            .map((x) => (
              <Row key={x.id} title={x.title} meta="준비 중" />
            ))}
        </section>
      )}
    </>
  );
}
export function Chapter() {
  const id = useSearchParams().get("id") || "";
  const r = useLoad(getCatalog, "catalog");
  const records = useRecords();
  if (!r.data) return <State error={r.error} retry={r.retry} />;
  const c = r.data,
    ch = c.chapters.find((x) => x.id === id),
    sub = c.subjects.find((x) => x.id === ch?.subjectId);
  if (!ch) return <State empty="단원을 찾을 수 없습니다." />;
  return (
    <>
      <div className={s.breadcrumb}>
        <Link href={url("textbook")}>교과서</Link>
        <span>/</span>
        <Link href={url("subject", sub?.id)}>{sub?.title}</Link>
      </div>
      <div className={s.chapterHead}>
        <span className={s.chapterNumber}>
          {String(
            c.chapters
              .filter((x) => x.subjectId === ch.subjectId)
              .findIndex((x) => x.id === ch.id) + 1,
          ).padStart(2, "0")}
        </span>
        <div>
          <h1>{ch.title}</h1>
          <p className={s.muted}>
            {c.lessons.filter((x) => x.chapterId === id).length}개 학습 절
          </p>
        </div>
      </div>
      {c.lessons
        .filter((x) => x.chapterId === id)
        .map((x, i) => (
          <Row
            key={x.id}
            number={String(i + 1).padStart(2, "0")}
            title={x.title}
            detail={x.titleEn}
            meta={
              records["progress:" + x.id]?.data.completed
                ? "학습 완료"
                : undefined
            }
            href={url("lesson", x.id)}
          />
        ))}
      <p className={s.notice}>전문의 검수 전 초안</p>
    </>
  );
}
