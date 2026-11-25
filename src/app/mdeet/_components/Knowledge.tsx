"use client";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLearning } from "./Workspace";
import {
  books,
  chapters,
  sections,
  loadKnowledge,
  loadFlashcards,
  blankTextbook,
  sectionHref,
  type KnowledgeItem,
  type Flashcard,
} from "../_lib/textbook";
import { scheduleCard } from "../_lib/scheduler";
import type { CardRating } from "../_lib/types";
import { Heading } from "./UI";
import s from "../mdeet.module.css";
import e from "../editorial.module.css";
const kinds: Record<string, string> = {
  "body-derived": "본문 지식",
  highlight: "핵심 개념",
  "table-row": "표의 지식",
  "review-answer": "확인 문제 정답",
};
export default function Knowledge() {
  const { store, update } = useLearning();
  const params = useSearchParams();
  const router = useRouter();
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [query, setQuery] = useState(params.get("q") || "");
  const [page, setPage] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [seen, setSeen] = useState<string[]>([]);
  const [kind, setKind] = useState("");
  const [notice, setNotice] = useState("");
  const book = params.get("book") || "";
  const unit = params.get("unit") || "";
  const section = params.get("section") || "";
  const state = params.get("state") || "";
  const review = params.get("review") === "1";
  useEffect(() => {
    let live = true;
    setLoading(true);
    setError("");
    Promise.all([loadKnowledge(), loadFlashcards()])
      .then(([k, c]) => {
        if (live) {
          setItems(k);
          setCards(c);
        }
      })
      .catch((err) => {
        if (live) setError(err.message);
      })
      .finally(() => {
        if (live) setLoading(false);
      });
    return () => {
      live = false;
    };
  }, [retry]);
  useEffect(() => {
    setQuery(params.get("q") || "");
    setPage(0);
    setRevealed(false);
    setSeen([]);
    setNotice("");
  }, [params]);
  const filter = (key: string, value: string) => {
    const p = new URLSearchParams(params.toString());
    if (value) p.set(key, value);
    else p.delete(key);
    if (key === "book") {
      p.delete("unit");
      p.delete("section");
    }
    if (key === "unit") p.delete("section");
    router.replace(`/mdeet/knowledge?${p}`, { scroll: false });
  };
  const match = (x: KnowledgeItem) => {
    const meta = sections.find((sec) => sec.id === x.sectionId);
    const saved = store.textbook?.knowledge[x.id];
    return (
      (!book || meta?.book === book) &&
      (!unit || x.unitId === unit) &&
      (!section || x.sectionId === section) &&
      (!kind || kind === x.kind) &&
      (!state ||
        (state === "understood"
          ? saved?.understood
          : state === "memorized"
            ? saved?.memorized
            : state === "new"
              ? !saved?.understood
              : !saved?.memorized)) &&
      (!params.get("q") ||
        `${x.text} ${meta?.title}`
          .toLowerCase()
          .includes(params.get("q")!.toLowerCase()))
    );
  };
  const filtered = items.filter(match);
  const maxPage = Math.max(0, Math.ceil(filtered.length / 30) - 1);
  const currentPage = Math.min(page, maxPage);
  const mark = (
    id: string,
    patch: Partial<{ understood: boolean; memorized: boolean }>,
  ) =>
    update((st) => {
      const t = st.textbook || blankTextbook();
      return {
        ...st,
        textbook: {
          ...t,
          knowledge: {
            ...t.knowledge,
            [id]: {
              ...(t.knowledge[id] || { understood: false, memorized: false }),
              ...patch,
            },
          },
        },
      };
    });
  const candidateIds = new Set(filtered.map((x) => x.id));
  const deck = [
    ...filtered.map((x) => ({
      id: `knowledge:${x.id}`,
      knowledgeId: x.id,
      sectionId: x.sectionId,
      front: `${sections.find((sec) => sec.id === x.sectionId)?.title} · ${kinds[x.kind]}`,
      back: x.text,
      isFact: true,
    })),
    ...cards
      .filter((c) => candidateIds.has(c.knowledgeId))
      .map((c) => ({ ...c, id: `source:${c.id}`, isFact: false })),
  ];
  const dueDeck = deck.filter(
    (c) =>
      !seen.includes(c.id) &&
      (!store.textbook?.reviews[c.id] ||
        Date.parse(store.textbook.reviews[c.id].nextReviewAt) <= Date.now()),
  );
  const current = dueDeck[0];
  const rate = (rating: CardRating) => {
    if (!current) return;
    const at = new Date().toISOString();
    update((st) => {
      const t = st.textbook || blankTextbook();
      const prev = t.reviews[current.id];
      return {
        ...st,
        textbook: {
          ...t,
          reviews: {
            ...t.reviews,
            [current.id]: {
              ...scheduleCard(prev?.step || 0, rating),
              history: [...(prev?.history || []), { at, rating }],
            },
          },
          knowledge: {
            ...t.knowledge,
            [current.knowledgeId]: {
              ...t.knowledge[current.knowledgeId],
              understood: rating !== "again",
              memorized: rating === "good" || rating === "easy",
            },
          },
        },
      };
    });
    setSeen((v) => [...v, current.id]);
    setRevealed(false);
    setNotice("복습 평가를 저장했습니다.");
  };
  return (
    <>
      <Heading
        title={review ? "지식 복습" : "지식 라이브러리"}
        description={
          review
            ? "본문 지식과 질문·정답형 카드를 함께 복습합니다."
            : "본문, 비교표, 핵심 개념, 확인 문제의 지식을 원래 학습 절과 함께 읽습니다."
        }
      >
        <button onClick={() => filter("review", review ? "" : "1")}>
          {review ? "지식 목록" : "복습 시작"}
        </button>
        <Link href="/mdeet/flashcards">직접 만든 카드</Link>
      </Heading>
      <form
        className={e.knowledgeFilters}
        onSubmit={(ev) => {
          ev.preventDefault();
          filter("q", query);
        }}
      >
        <label>
          검색
          <input
            value={query}
            onChange={(ev) => setQuery(ev.target.value)}
            placeholder="용어 또는 내용"
          />
        </label>
        <label>
          교과서
          <select
            value={book}
            onChange={(ev) => filter("book", ev.target.value)}
          >
            <option value="">전체 과목</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          단원
          <select
            value={unit}
            onChange={(ev) => filter("unit", ev.target.value)}
          >
            <option value="">전체 단원</option>
            {chapters
              .filter((c) => !book || c.book === book)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
          </select>
        </label>
        <label>
          지식 유형
          <select
            value={kind}
            onChange={(ev) => {
              setKind(ev.target.value);
              setPage(0);
              setRevealed(false);
              setSeen([]);
            }}
          >
            <option value="">모든 지식</option>
            {Object.entries(kinds).map(([id, label]) => (
              <option key={id} value={id}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label>
          학습 상태
          <select
            value={state}
            onChange={(ev) => filter("state", ev.target.value)}
          >
            <option value="">전체</option>
            <option value="new">이해 전</option>
            <option value="understood">이해함</option>
            <option value="unmemorized">암기 전</option>
            <option value="memorized">암기함</option>
          </select>
        </label>
        <button type="submit">검색</button>
        {section && (
          <button type="button" onClick={() => filter("section", "")}>
            학습 절 제한 해제
          </button>
        )}
      </form>
      {error ? (
        <div role="alert" className={s.empty}>
          <p>{error}</p>
          <button onClick={() => setRetry((n) => n + 1)}>다시 불러오기</button>
        </div>
      ) : loading ? (
        <p role="status" className={s.empty}>
          전체 지식 자료를 불러오고 있습니다…
        </p>
      ) : review ? (
        <>
          {current ? (
            <section className={e.memorySheet} key={current.id}>
              <div className={e.runningHeader}>
                <span>
                  {
                    books.find(
                      (b) =>
                        b.id ===
                        sections.find((sec) => sec.id === current.sectionId)
                          ?.book,
                    )?.title
                  }
                </span>
                <span>
                  {sections.find((sec) => sec.id === current.sectionId)?.title}
                </span>
              </div>
              <div className={e.memoryNumber}>
                {String(seen.length + 1).padStart(3, "0")}
              </div>
              <h2>{current.front}</h2>
              {current.isFact && (
                <p className={e.statusNote}>
                  이 절에서 학습한 내용을 떠올린 뒤 지식을 확인하세요.
                </p>
              )}
              {revealed && (
                <div className={e.memoryAnswer}>
                  <p>{current.back}</p>
                  <Link href={sectionHref(current.sectionId)}>
                    교과서 본문 확인
                  </Link>
                  <p className={e.statusNote}>독립 검수 전 학습 자료</p>
                </div>
              )}
              <div className={e.memoryActions}>
                {!revealed ? (
                  <button
                    className={s.primary}
                    onClick={() => setRevealed(true)}
                  >
                    {current.isFact ? "지식 확인" : "정답 확인"}
                  </button>
                ) : (
                  (
                    [
                      ["again", "다시"],
                      ["hard", "어려움"],
                      ["good", "기억함"],
                      ["easy", "쉬움"],
                    ] as [CardRating, string][]
                  ).map(([key, label]) => (
                    <button key={key} onClick={() => rate(key)}>
                      {label}
                    </button>
                  ))
                )}
              </div>
              <p className={s.muted}>
                남은 복습 {dueDeck.length} · 이번 학습 {seen.length}
              </p>
            </section>
          ) : (
            <div className={s.empty}>
              <h2>현재 조건에서 예정된 복습을 마쳤습니다.</h2>
              <p>{deck.length}개 항목의 복습 일정을 관리하고 있습니다.</p>
              <button onClick={() => filter("review", "")}>
                지식 목록으로
              </button>
            </div>
          )}
          <p role="status" aria-live="polite">
            {notice}
          </p>
        </>
      ) : (
        <>
          <p className={e.statusNote}>
            {filtered.length}개 지식 · 모든 항목은 원본 학습 절로 연결됩니다.
            수록 내용은 독립 검수 전 초안입니다.
          </p>
          <ol className={e.knowledgeRows}>
            {filtered
              .slice(currentPage * 30, (currentPage + 1) * 30)
              .map((item, i) => {
                const saved = store.textbook?.knowledge[item.id];
                const sec = sections.find((x) => x.id === item.sectionId);
                return (
                  <li key={item.id} className={e.knowledgeRow}>
                    <span>
                      {String(currentPage * 30 + i + 1).padStart(3, "0")}
                    </span>
                    <div>
                      <p>{item.text}</p>
                      <small>
                        {sec?.title} · {kinds[item.kind]}
                      </small>
                    </div>
                    <div className={e.knowledgeState}>
                      <label>
                        <input
                          type="checkbox"
                          checked={!!saved?.understood}
                          onChange={(ev) =>
                            mark(item.id, { understood: ev.target.checked })
                          }
                        />
                        이해함
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          checked={!!saved?.memorized}
                          onChange={(ev) =>
                            mark(item.id, { memorized: ev.target.checked })
                          }
                        />
                        암기함
                      </label>
                      <Link href={sectionHref(item.sectionId)}>본문 읽기</Link>
                    </div>
                  </li>
                );
              })}
          </ol>
          {!filtered.length && (
            <p className={s.empty}>
              조건에 맞는 지식이 없습니다. 검색어나 학습 상태를 바꿔보세요.
            </p>
          )}
          <div className={e.readingFooter}>
            <button
              disabled={!currentPage}
              onClick={() => setPage(currentPage - 1)}
            >
              이전
            </button>
            <span>
              {currentPage + 1} / {maxPage + 1}
            </span>
            <button
              disabled={currentPage === maxPage}
              onClick={() => setPage(currentPage + 1)}
            >
              다음
            </button>
          </div>
        </>
      )}
    </>
  );
}
