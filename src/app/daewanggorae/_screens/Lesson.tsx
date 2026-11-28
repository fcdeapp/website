"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { getCatalog, getLesson } from "../_lib/content";
import { useLoad } from "../_lib/hooks";
import { useRecords, saveRecord, study } from "../_lib/store";
import { verificationLabel } from "../_lib/labels";
import { Block, Structured } from "../_components/Blocks";
import { State, url } from "../_components/UI";
import SceneViewer from "../_components/SceneViewer";
import { ReaderContext } from "../_components/ReaderContext";
import { getReaderDocument } from "../_lib/reader";
import s from "../daewanggorae.module.css";
export default function LessonScreen() {
  const id = useSearchParams().get("id") || "";
  return <Reader key={id} id={id} />;
}
function Reader({ id }: { id: string }) {
  const r = useLoad(
      async () => ({
        catalog: await getCatalog(),
        lesson: await getLesson(id),
      }),
      "lesson:" + id,
    ),
    records = useRecords();
  const annotations = useLoad(() => getReaderDocument(id), "reader:" + id);
  const [error, setError] = useState(""),
    [find, setFind] = useState(""),
    [noteBlock, setNoteBlock] = useState(""),
    [note, setNote] = useState(""),
    [scene, setScene] = useState(""),
    [sceneBlock, setSceneBlock] = useState("");
  const lastBlock = useRef("");
  const initial = useRef(false);
  const [tocOpen, setTocOpen] = useState(false);
  useEffect(() => {
    const media = matchMedia("(min-width: 801px)");
    const update = () => setTocOpen(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const scale = Number(records["preference:settings"]?.data.fontScale) || 1;
  useEffect(() => {
    if (!r.data) return;
    const lesson = r.data.lesson;
    let seconds = 0;
    const sessionId = crypto.randomUUID();
    lastBlock.current = String(
      study.snapshot()["progress:" + id]?.data.lastBlockId || "",
    );
    const persist = () => {
      const previous = study.snapshot()["progress:" + id]?.data || {};
      void saveRecord("progress", id, {
        ...previous,
        lessonId: id,
        lastBlockId: lastBlock.current,
      }).catch((e) => setError(String(e)));
      if (seconds)
        void saveRecord("reading", sessionId, {
          lessonId: id,
          date: new Date().toLocaleDateString("sv-SE"),
          seconds,
        }).catch((e) => setError(String(e)));
    };
    if (!initial.current) {
      initial.current = true;
      const target =
        decodeURIComponent(location.hash.slice(1)) || lastBlock.current;
      setTimeout(() => {
        if (target)
          document.getElementById(target)?.scrollIntoView({ block: "start" });
      }, 250);
      persist();
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries)
          if (e.isIntersecting) lastBlock.current = e.target.id;
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    lesson.blocks.forEach((b) => {
      const el = document.getElementById(b.id);
      if (el) observer.observe(el);
    });
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") seconds += 5;
      if (seconds % 30 === 0) persist();
    }, 5000);
    const onHide = () => {
      if (document.visibilityState === "hidden") persist();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", persist);
    return () => {
      clearInterval(timer);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", persist);
      persist();
    };
  }, [r.data, id]);
  if (!r.data) return <State error={r.error} retry={r.retry} />;
  const { catalog: c, lesson: l } = r.data,
    entry = c.lessons.find((x) => x.id === id),
    chapterId = entry?.chapterId || l.chapterId,
    chapter = c.chapters.find((x) => x.id === chapterId),
    subject = c.subjects.find((x) => x.id === l.subjectId),
    siblings = c.lessons.filter((x) => x.subjectId === l.subjectId),
    position = siblings.findIndex((x) => x.id === id),
    completed = !!records["progress:" + id]?.data.completed;
  const save = async (
    kind: "bookmark" | "highlight",
    blockId: string,
    title: string,
  ) => {
    try {
      const key = blockId,
        prev = records[kind + ":" + key];
      await saveRecord(
        kind,
        key,
        { lessonId: id, blockId, title },
        !!prev && !prev.deleted,
      );
    } catch (e) {
      setError(String(e));
    }
  };
  const hits = find.trim()
    ? l.blocks.filter((b) =>
        ("markdown" in b
          ? b.markdown
          : "text" in b
            ? b.text
            : JSON.stringify(b)
        )
          .toLowerCase()
          .includes(find.toLowerCase()),
      )
    : [];
  return (
    <ReaderContext.Provider value={{data:annotations.data ?? null, enabled:records["preference:settings"]?.data.readerHighlights !== false}}>
      <div className={s.breadcrumb}>
        <Link href={url("textbook")}>교과서</Link>
        <span>/</span>
        <Link href={url("subject", l.subjectId)}>{subject?.title}</Link>
        <span>/</span>
        <Link href={url("chapter", chapterId)}>{chapter?.title}</Link>
      </div>
      <div className={s.reader}>
        <aside className={s.aside}>
          <details
            open={tocOpen}
            onToggle={(e) => setTocOpen(e.currentTarget.open)}
          >
            <summary>이 단원의 목차</summary>
            {l.blocks
              .filter((b) => b.type === "heading")
              .map((b) => (
                <a key={b.id} href={"#" + b.id}>
                  {b.type === "heading" ? b.text : ""}
                </a>
              ))}
          </details>
          <details>
            <summary>같은 챕터</summary>
            {c.lessons
              .filter((x) => x.chapterId === chapterId)
              .map((x) => (
                <Link
                  key={x.id}
                  aria-current={x.id === id ? "page" : undefined}
                  href={url("lesson", x.id)}
                >
                  {x.title}
                </Link>
              ))}
          </details>
        </aside>
        <article
          className={s.article}
          style={{ "--reader-scale": scale } as CSSProperties}
        >
          <div className={s.runningHeader}>
            <span>{subject?.title}</span>
            <span>{chapter?.title}</span>
          </div>
          <h1>{l.title.ko}</h1>
          <p className={s.muted}>{l.title.en}</p>
          <p className={s.notice}>{verificationLabel(l.verification.status)}</p>
          <details>
            <summary>학습 목표 · {l.learningObjectives.length}</summary>
            <ol>
              {l.learningObjectives.map((x) => (
                <li key={x.id}>
                  <label className={s.check}>
                    <input
                      type="checkbox"
                      checked={(
                        (records["progress:" + id]?.data
                          .completedObjectiveIds as string[]) || []
                      ).includes(x.id)}
                      onChange={() => {
                        const previous = records["progress:" + id]?.data || {};
                        const ids =
                          (previous.completedObjectiveIds as string[]) || [];
                        void saveRecord("progress", id, {
                          ...previous,
                          lessonId: id,
                          completedObjectiveIds: ids.includes(x.id)
                            ? ids.filter((v) => v !== x.id)
                            : [...ids, x.id],
                        }).catch((e) => setError(String(e)));
                      }}
                    />
                    <span>{x.text}</span>
                  </label>
                </li>
              ))}
            </ol>
          </details>
          {find && (
            <div className={s.notice}>
              {hits.length}개 문단에서 찾았습니다.
              {hits.map((b, i) => (
                <a key={b.id} href={"#" + b.id} className={s.button}>
                  결과 {i + 1}
                </a>
              ))}
            </div>
          )}
          {l.blocks.map((b, i) => (
            <section
              key={b.id}
              id={b.id}
              className={s.block}
              data-highlight={
                !!records["highlight:" + b.id] &&
                !records["highlight:" + b.id].deleted
              }
            >
              {b.type === "anatomy3d" ? (
                <>
                  <button
                    onClick={() => (
                      setSceneBlock(b.id),
                      setScene(
                        scene === b.sceneRef && sceneBlock === b.id
                          ? ""
                          : b.sceneRef,
                      )
                    )}
                  >
                    {scene === b.sceneRef && sceneBlock === b.id
                      ? "3D 닫기"
                      : "관련 구조를 3D로 보기"}
                  </button>
                  {scene === b.sceneRef && sceneBlock === b.id && (
                    <SceneViewer sceneId={scene} />
                  )}
                </>
              ) : (
                <Block block={b} />
              )}
              {c.scenes
                .filter(
                  (item) =>
                    item.lessonId === id &&
                    item.triggerBlockId === b.id &&
                    !(b.type === "anatomy3d" && b.sceneRef === item.id),
                )
                .map((item) => (
                  <div key={item.id} className={s.figure}>
                    <button
                      onClick={() => {
                        setSceneBlock(b.id);
                        setScene(
                          scene === item.id && sceneBlock === b.id
                            ? ""
                            : item.id,
                        );
                      }}
                    >
                      {scene === item.id && sceneBlock === b.id
                        ? "3D 닫기"
                        : item.title + " · 3D"}
                    </button>
                    {scene === item.id && sceneBlock === b.id && (
                      <SceneViewer sceneId={scene} />
                    )}
                  </div>
                ))}
              {!!records["note:" + b.id]?.data.text &&
                !records["note:" + b.id]?.deleted && (
                  <p className={s.notice}>
                    메모 · {String(records["note:" + b.id].data.text)}
                  </p>
                )}
              <div className={s.blockTools}>
                <button
                  onClick={() =>
                    void save("bookmark", b.id, l.title.ko + " · " + (i + 1))
                  }
                >
                  {records["bookmark:" + b.id] &&
                  !records["bookmark:" + b.id].deleted
                    ? "북마크 해제"
                    : "북마크"}
                </button>
                <button
                  onClick={() =>
                    void save("highlight", b.id, l.title.ko + " · " + (i + 1))
                  }
                >
                  강조
                </button>
                <button
                  onClick={() => {
                    setNoteBlock(b.id);
                    setNote(String(records["note:" + b.id]?.data.text || ""));
                  }}
                >
                  메모
                </button>
              </div>
              {noteBlock === b.id && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void saveRecord("note", b.id, {
                      lessonId: id,
                      blockId: b.id,
                      title: l.title.ko,
                      text: note,
                    })
                      .then(() => setNoteBlock(""))
                      .catch((e) => setError(String(e)));
                  }}
                >
                  <label className={s.field}>
                    이 문단의 메모
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      maxLength={20000}
                    />
                  </label>
                  <div className={s.actions}>
                    <button type="submit" className={s.primary}>
                      메모 저장
                    </button>
                    <button type="button" onClick={() => setNoteBlock("")}>
                      닫기
                    </button>
                  </div>
                </form>
              )}
            </section>
          ))}
          {!!l.keyFacts?.length && (
            <section className={s.section}>
              <h2>핵심 지식</h2>
              <ol>
                {l.keyFacts.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ol>
            </section>
          )}
          {!!l.glossary?.length && (
            <details>
              <summary>의학 용어</summary>
              <Structured data={l.glossary} />
            </details>
          )}
          {!!l.references?.length && (
            <details>
              <summary>참고문헌</summary>
              {l.references.map((ref, i) => (
                <p key={i}>
                  <Link
                    className={s.button}
                    href={
                      url("sources") +
                      "?id=" +
                      encodeURIComponent(ref.sourceRef)
                    }
                  >
                    출처 {i + 1}
                  </Link>{" "}
                  {ref.use}
                </p>
              ))}
            </details>
          )}
          <div className={s.actions}>
            <button
              className={s.primary}
              onClick={() =>
                void saveRecord("progress", id, {
                  ...records["progress:" + id]?.data,
                  lessonId: id,
                  lastBlockId: lastBlock.current,
                  completed: !completed,
                }).catch((e) => setError(String(e)))
              }
            >
              {completed ? "학습 완료 해제" : "학습 완료"}
            </button>
            <Link
              className={s.button}
              href={url("questions") + "?lesson=" + encodeURIComponent(id)}
            >
              관련 문항 풀기
            </Link>
          </div>
          {!!l.verification.unresolvedIssues.length && (
            <details>
              <summary>검수 범위</summary>
              <ul>
                {l.verification.unresolvedIssues.map((text, i) => (
                  <li key={i}>{text}</li>
                ))}
              </ul>
            </details>
          )}
          <div className={s.endLinks}>
            {siblings[position - 1] ? (
              <Link href={url("lesson", siblings[position - 1].id)}>
                이전 단원
                <br />
                {siblings[position - 1].title}
              </Link>
            ) : (
              <span />
            )}
            {siblings[position + 1] && (
              <Link href={url("lesson", siblings[position + 1].id)}>
                다음 단원
                <br />
                {siblings[position + 1].title}
              </Link>
            )}
          </div>
        </article>
        <aside className={s.aside}>
          <details open>
            <summary>읽기 도구</summary>
            <label className={s.field}>
              본문 검색
              <input
                type="search"
                value={find}
                onChange={(e) => setFind(e.target.value)}
                placeholder="단어 찾기"
              />
            </label>
            <label className={s.check}><input type="checkbox" checked={records["preference:settings"]?.data.readerHighlights !== false} onChange={e => void saveRecord("preference","settings",{...records["preference:settings"]?.data,readerHighlights:e.target.checked}).catch(e=>setError(String(e)))} />핵심 내용 강조</label>
            {annotations.error && <p className={s.notice}>어휘 링크를 불러오지 못했습니다. <button onClick={annotations.retry}>다시 시도</button></p>}
            <label className={s.field}>
              글자 크기
              <select
                value={scale}
                onChange={(e) =>
                  void saveRecord("preference", "settings", {
                    ...records["preference:settings"]?.data,
                    fontScale: Number(e.target.value),
                  }).catch((e) => setError(String(e)))
                }
              >
                {[0.9, 1, 1.1, 1.2, 1.35].map((n) => (
                  <option key={n} value={n}>
                    {Math.round(n * 100)}%
                  </option>
                ))}
              </select>
            </label>
          </details>
          {!!l.prerequisites?.length && (
            <details open>
              <summary>먼저 읽을 단원</summary>
              {l.prerequisites.map((x) => (
                <Link key={x} href={url("lesson", x)}>
                  {c.lessons.find((y) => y.id === x)?.title || x}
                </Link>
              ))}
            </details>
          )}
          {!!l.relatedLessons?.length && (
            <details open>
              <summary>함께 읽기</summary>
              {l.relatedLessons.map((x) => (
                <Link key={x} href={url("lesson", x)}>
                  {c.lessons.find((y) => y.id === x)?.title || x}
                </Link>
              ))}
            </details>
          )}
          <Link href={url("bookmarks")}>북마크와 필기</Link>
          {error && (
            <p role="alert" className={s.error}>
              {error}
            </p>
          )}
        </aside>
      </div>
    </ReaderContext.Provider>
  );
}
