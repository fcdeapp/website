"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLearning } from "./Workspace";
import {
  books,
  chapters,
  sections,
  bookEnglish,
  blankTextbook,
  sectionHref,
  chapterHref,
  chapterNumber,
  number,
  loadSection,
  type TextbookSection,
} from "../_lib/textbook";
import references from "../../../../public/mdeet/textbook/sources.json";
import {
  BookCover,
  LinePattern,
  RunningHeader,
} from "./editorial/BookElements";
import { Progress } from "./UI";
import s from "../mdeet.module.css";
import e from "../editorial.module.css";
export function TextbookShelf() {
  return (
    <>
      <div className={e.catalogTitle}>
        <div>
          <p className={e.eyebrow}>MDEET · 교과서</p>
          <h1>교과서</h1>
        </div>
        <p>
          {sections.length}개 학습 절 ·{" "}
          {
            books.filter((b) => !["physics", "statistics"].includes(b.id))
              .length
          }
          개 주요 과목
          <br />
          개념 학습에서 지식 복습, 기출문제까지.
        </p>
      </div>
      <div className={e.shelf}>
        {books
          .filter((b) => !["physics", "statistics"].includes(b.id))
          .map((b, i) => (
            <BookCover key={b.id} book={b} index={i} />
          ))}
      </div>
      <section className={e.supplement}>
        <div>
          <p className={e.eyebrow}>보충 자료</p>
          <h2>과거 시험 범위</h2>
          <p className={s.muted}>현재 주요 과목과 구분해 열람합니다.</p>
        </div>
        <div>
          {books
            .filter((b) => ["physics", "statistics"].includes(b.id))
            .map((b) => (
              <Link key={b.id} href={`/mdeet/textbook/${b.id}`}>
                <strong>{b.title}</strong>
                <span>{b.sectionCount}학습 절</span>
              </Link>
            ))}
        </div>
      </section>
      <p className={e.statusNote}>
        수록 이론은 독립 검수가 완료되지 않은 초안입니다. 전체 출제 범위의
        완전한 수록을 보장하지 않으며, 각 절의 참고 자료와 검수 상태를 함께
        제공합니다.
      </p>
    </>
  );
}
function SectionList({ ids }: { ids: string[] }) {
  const { store } = useLearning();
  return (
    <ol className={e.sectionList}>
      {ids.map((id, i) => {
        const sec = sections.find((x) => x.id === id);
        return (
          sec && (
            <li key={id}>
              <Link href={sectionHref(id)}>
                <span>{number(i + 1)}</span>
                <span>{sec.title}</span>
                <small>
                  {store.textbook?.sections[id]?.completed
                    ? "학습 완료"
                    : `${sec.knowledgeCount}개 지식`}
                </small>
              </Link>
            </li>
          )
        );
      })}
    </ol>
  );
}
export function BookContents({ id }: { id: string }) {
  const { store } = useLearning();
  const book = books.find((b) => b.id === id);
  if (!book) return <p>교과서를 찾을 수 없습니다.</p>;
  const done = sections.filter(
    (x) => x.book === id && store.textbook?.sections[x.id]?.completed,
  ).length;
  return (
    <div className={e.contentsLayout}>
      <header className={e.contentsIntro}>
        <p className={e.eyebrow}>{bookEnglish[id]}</p>
        <h1>{book.title}</h1>
        <p>
          {book.chapterIds.length}단원
          <br />
          {book.sectionCount}학습 절 · {book.knowledgeCount}개 지식
        </p>
        <p>
          학습 완료 {done}/{book.sectionCount}
        </p>
        <Progress label="교과서 진도" value={done} total={book.sectionCount} />
        <div className={e.chapterLinks}>
          <Link href="/mdeet/textbook">전체 서가</Link>
        </div>
      </header>
      <ol className={e.contentsList}>
        {book.chapterIds.map((cid, i) => {
          const c = chapters.find((x) => x.id === cid)!;
          return (
            <li className={e.chapterRow} key={cid}>
              <div className={e.partNumber}>
                <small>PART</small>
                {number(i + 1)}
              </div>
              <div>
                <h2>
                  <Link href={chapterHref(cid)}>{c.title}</Link>
                </h2>
                <SectionList ids={c.sections} />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
export function ChapterOpening({ id }: { id: string }) {
  const { store } = useLearning();
  const c = chapters.find((x) => x.id === id);
  if (!c) return <p>단원을 찾을 수 없습니다.</p>;
  const n = chapterNumber(id);
  const resume =
    c.sections.find((x) => !store.textbook?.sections[x]?.completed) ||
    c.sections[0];
  return (
    <>
      <div className={e.chapterCover}>
        <div className={e.partNumber}>
          <small>PART</small>
          {number(n)}
        </div>
        <div>
          <p className={e.eyebrow}>{bookEnglish[c.book]}</p>
          <h1>{c.title}</h1>
          <p>
            {c.sections.length}학습 절 · {c.knowledgeCount}개 지식
          </p>
        </div>
        <LinePattern variant={n % 3} />
      </div>
      <div className={e.contentsLayout}>
        <div>
          <p className={e.eyebrow}>단원 구성</p>
          <div className={e.chapterLinks}>
            <Link className={s.primary} href={sectionHref(resume)}>
              본문 읽기
            </Link>
            <Link href={`/mdeet/textbook/${c.book}`}>전체 목차</Link>
          </div>
          <p className={e.statusNote}>
            관련 기출문제는 단원·키워드에 따른 연결 후보입니다.
          </p>
        </div>
        <SectionList ids={c.sections} />
      </div>
    </>
  );
}
function ContentsRail({ section }: { section: TextbookSection }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1025px)");
    const sync = () => setExpanded(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return (
    <aside className={e.toc}>
      <details
        open={expanded}
        onToggle={(ev) => setExpanded(ev.currentTarget.open)}
      >
        <summary>교과서 목차</summary>
        <select
          aria-label="교과서 선택"
          value={section.book}
          onChange={(ev) => router.push(`/mdeet/textbook/${ev.target.value}`)}
        >
          {books.map((b) => (
            <option key={b.id} value={b.id}>
              {b.title}
            </option>
          ))}
        </select>
        {chapters
          .filter((c) => c.book === section.book)
          .map((c) => (
            <details key={c.id} open={c.id === section.unitId}>
              <summary>
                <span className={e.tocPart}>
                  <span>{number(chapterNumber(c.id))}</span>
                  {c.title}
                </span>
              </summary>
              <Link href={chapterHref(c.id)}>단원 도입</Link>
              {c.sections.map((id, i) => (
                <Link
                  key={id}
                  href={sectionHref(id)}
                  aria-current={id === section.id ? "page" : undefined}
                >
                  {number(i + 1)}　{sections.find((x) => x.id === id)?.title}
                </Link>
              ))}
            </details>
          ))}
      </details>
    </aside>
  );
}
export function TextbookReader({ id }: { id: string }) {
  const { store, update, questions } = useLearning();
  const [section, setSection] = useState<TextbookSection | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true;
    setSection(null);
    setError("");
    loadSection(id)
      .then((data) => {
        if (live) setSection(data);
      })
      .catch((err) => {
        if (live) setError(err.message);
      });
    return () => {
      live = false;
    };
  }, [id, retry]);
  useEffect(() => {
    if (!section) return;
    update((st) => {
      const t = st.textbook || blankTextbook();
      return {
        ...st,
        textbook: {
          ...t,
          lastSectionId: id,
          sections: {
            ...t.sections,
            [id]: {
              ...(t.sections[id] || { notes: "", completed: false }),
              lastReadAt: new Date().toISOString(),
            },
          },
        },
      };
    });
  }, [id, section, update]);
  const edit = (patch: Partial<{ notes: string; completed: boolean }>) =>
    update((st) => {
      const t = st.textbook || blankTextbook();
      return {
        ...st,
        textbook: {
          ...t,
          sections: {
            ...t.sections,
            [id]: {
              ...(t.sections[id] || { notes: "", completed: false }),
              ...patch,
            },
          },
        },
      };
    });
  if (error)
    return (
      <div role="alert">
        <p>{error}</p>
        <button onClick={() => setRetry((n) => n + 1)}>다시 불러오기</button>
      </div>
    );
  if (!section) return <p role="status">교과서 본문을 불러오고 있습니다…</p>;
  const chapter = chapters.find((c) => c.id === section.unitId)!;
  const book = books.find((b) => b.id === section.book)!;
  const pos = chapter.sections.indexOf(id);
  const bookSections = sections.filter((x) => x.book === book.id);
  const bookPos = bookSections.findIndex((x) => x.id === id);
  const saved = store.textbook?.sections[id];
  return (
    <div className={e.readerGrid}>
      <ContentsRail section={section} />
      <article className={e.reading}>
        <RunningHeader
          part={chapterNumber(chapter.id)}
          title={chapter.title}
          book={book.title}
        />
        <header className={e.sectionTitle}>
          <span>{number(pos + 1)}</span>
          <div>
            <h1>{section.title}</h1>
            <p>{section.keywords.join(" · ")}</p>
          </div>
        </header>
        <div className={e.prose}>
          {section.blocks.map((block, i) =>
            block.type === "paragraph" ? (
              <p key={i}>{block.text}</p>
            ) : block.type === "keyFacts" ? (
              <aside key={i} className={e.definition}>
                <h2>핵심 개념</h2>
                <ul>
                  {block.items.map((text, j) => (
                    <li key={j}>{text}</li>
                  ))}
                </ul>
              </aside>
            ) : (
              <figure key={i} className={e.editorialTable}>
                <figcaption>{block.title}</figcaption>
                <div
                  className={e.tableViewport}
                  tabIndex={0}
                  aria-label={`${block.title}, 가로 스크롤 가능`}
                >
                  <table>
                    <thead>
                      <tr>
                        {block.headers.map((h, j) => (
                          <th key={j} scope="col">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {block.rows.map((row, j) => (
                        <tr key={j}>
                          {row.map((cell, k) => (
                            <td key={k}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </figure>
            ),
          )}
        </div>
        <section className={e.readingSection}>
          <h2>확인 문제</h2>
          {section.reviewQuestions.map((q, i) => (
            <div key={i} className={e.reviewQuestion}>
              <p>
                <strong>{number(i + 1)}</strong>
                {q.prompt}
              </p>
              <details>
                <summary>정답 확인</summary>
                <p>{q.answer}</p>
              </details>
            </div>
          ))}
        </section>
        <section className={e.readingSection}>
          <h2>지식과 연결하기</h2>
          <div className={e.chapterLinks}>
            <Link
              className={s.button}
              href={`/mdeet/knowledge?section=${encodeURIComponent(id)}`}
            >
              전체 지식 {section.knowledgeIds.length}개
            </Link>
            <Link
              className={s.button}
              href={`/mdeet/knowledge?section=${encodeURIComponent(id)}&review=1`}
            >
              이 절 복습하기
            </Link>
          </div>
        </section>
        <section className={e.readingSection}>
          <h2>관련 기출문제</h2>
          <p className={e.statusNote}>
            단원·키워드 기반 연결 후보이며, 직접적인 출제 연관성은 검수
            전입니다.
          </p>
          <ol className={e.sectionList}>
            {section.relatedQuestionIds.map((qid) => {
              const q = questions.find((x) => x.id === qid);
              return (
                q && (
                  <li key={qid}>
                    <Link href={`/mdeet/questions/${qid}`}>
                      <span>{number(q.number)}</span>
                      <span>{q.topic}</span>
                      <small>{q.year}학년도</small>
                    </Link>
                  </li>
                )
              );
            })}
          </ol>
          {!section.relatedQuestionIds.length && (
            <p>연결된 기출문제가 없습니다.</p>
          )}
        </section>
        <section className={e.readingSection}>
          <h2>참고 자료</h2>
          <ul>
            {section.referenceIds.map((ref) => {
              const source = references.references.find((x) => x.id === ref);
              return (
                <li key={ref}>
                  {source ? (
                    <>
                      <a href={source.url} target="_blank" rel="noreferrer">
                        {source.title}
                      </a>
                      <p className={s.muted}>{source.access}</p>
                    </>
                  ) : (
                    ref
                  )}
                </li>
              );
            })}
          </ul>
          <p className={e.statusNote}>
            독립 검수 전 초안 ·{" "}
            {section.scope.includes("historical")
              ? "과거 시험 범위"
              : "출제 범위 후보"}
            <br />
            {references.note}
          </p>
        </section>
        <footer className={e.readingFooter}>
          {bookSections[bookPos - 1] ? (
            <Link href={sectionHref(bookSections[bookPos - 1].id)}>
              이전 절 · {bookSections[bookPos - 1].title}
            </Link>
          ) : (
            <Link href={`/mdeet/textbook/${book.id}`}>목차</Link>
          )}
          <span>
            {number(bookPos + 1)} / {number(bookSections.length)}
          </span>
          {bookSections[bookPos + 1] && (
            <Link href={sectionHref(bookSections[bookPos + 1].id)}>
              다음 절 · {bookSections[bookPos + 1].title}
            </Link>
          )}
        </footer>
      </article>
      <aside className={e.margin}>
        <details open>
          <summary>학습 기록 · NOTE</summary>
          <button
            className={saved?.completed ? s.button : s.primary}
            aria-pressed={!!saved?.completed}
            onClick={() => edit({ completed: !saved?.completed })}
          >
            {saved?.completed ? "학습 완료 표시됨" : "학습 완료 표시"}
          </button>
          <label htmlFor="section-notes">이 절의 개인 메모</label>
          <textarea
            id="section-notes"
            maxLength={20000}
            placeholder="이해한 내용과 다시 볼 개념을 적으세요."
            value={saved?.notes || ""}
            onChange={(ev) => edit({ notes: ev.target.value })}
          />
          <p>현재 브라우저에 자동 저장됩니다.</p>
          <Link href={chapterHref(chapter.id)}>단원 도입부</Link>
          <Link href={`/mdeet/textbook/${book.id}`}>교과서 전체 목차</Link>
        </details>
      </aside>
    </div>
  );
}
