"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Store, QuestionIndexItem, Unit } from "../_lib/types";
import { loadCatalog } from "../_lib/data";
import { emptyStore, parseStore } from "../_lib/storage";
import { STORAGE_KEY } from "../_lib/constants";
import s from "../mdeet.module.css";
import e from "../editorial.module.css";
type Context = {
  store: Store;
  update: (fn: (store: Store) => Store) => void;
  replace: (store: Store) => void;
  questions: QuestionIndexItem[];
  units: Unit[];
  storageError: string;
  clearStorageError: () => void;
};
const LearningContext = createContext<Context | null>(null);
export function useLearning() {
  const c = useContext(LearningContext);
  if (!c) throw new Error("학습 화면 밖에서 호출되었습니다.");
  return c;
}
const nav = [
  ["textbook", "교과서"],
  ["knowledge", "지식"],
  ["questions", "기출문제"],
  ["review", "복습"],
  ["analytics", "학습 관리"],
];
const subnav: Record<string, [string, string][]> = {
  questions: [
    ["questions", "문제 은행"],
    ["library", "단원별 문제"],
    ["practice", "맞춤 풀이"],
    ["exams", "모의고사"],
  ],
  review: [
    ["review", "오답 노트"],
    ["flashcards", "암기 카드"],
    ["knowledge?review=1", "지식 복습"],
  ],
  analytics: [
    ["", "학습 기록부"],
    ["analytics", "학습 분석"],
    ["calendar", "학습 계획"],
    ["settings", "설정"],
  ],
};
export default function Workspace({ children }: { children: React.ReactNode }) {
  const [catalog, setCatalog] = useState<{
    questions: QuestionIndexItem[];
    units: Unit[];
  } | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [store, setStore] = useState<Store>(emptyStore);
  const ref = useRef(store);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState("");
  const blocked = useRef(false);
  const [mobile, setMobile] = useState(false);
  const [search, setSearch] = useState("");
  const path = usePathname();
  const router = useRouter();
  useEffect(() => {
    let live = true;
    setError("");
    loadCatalog()
      .then((c) => {
        if (live) setCatalog(c);
      })
      .catch((e) => {
        if (live) setError(String(e.message));
      });
    return () => {
      live = false;
    };
  }, [retry]);
  useEffect(() => {
    if (!catalog) return;
    const ids = new Set(catalog.questions.map((q) => q.id));
    const units = new Set(catalog.units.map((u) => u.id));
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const saved = raw ? parseStore(raw, ids, units) : emptyStore();
      ref.current = saved;
      setStore(saved);
    } catch {
      blocked.current = true;
      setStorageError(
        "저장된 기록을 읽지 못했습니다. 원본은 보존했습니다. 설정에서 원본을 내보낸 뒤 정상 기록을 가져오거나 초기화하세요. 현재 변경은 메모리에만 유지됩니다.",
      );
    }
    setReady(true);
    const sync = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try {
        const saved = e.newValue
          ? parseStore(e.newValue, ids, units)
          : emptyStore();
        ref.current = saved;
        setStore(saved);
        blocked.current = false;
        setStorageError("");
      } catch {
        setStorageError(
          "다른 탭의 기록을 읽을 수 없습니다. 현재 기록을 먼저 내보내세요.",
        );
      }
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [catalog]);
  const replace = useCallback((next: Store) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      blocked.current = false;
      setStorageError("");
    } catch {
      blocked.current = true;
      setStorageError(
        "기록을 저장하지 못했습니다. 저장 공간을 확인하고 설정에서 현재 기록을 내보내세요.",
      );
    }
    ref.current = next;
    setStore(next);
  }, []);
  const update = useCallback((fn: (value: Store) => Store) => {
    let current = ref.current;
    if (!blocked.current) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) current = parseStore(raw);
      } catch {
        blocked.current = true;
        setStorageError(
          "저장 기록을 읽지 못했습니다. 현재 변경은 메모리에만 유지됩니다.",
        );
      }
    }
    const next = fn(current);
    ref.current = next;
    setStore(next);
    if (!blocked.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        blocked.current = true;
        setStorageError(
          "저장 공간이 부족하거나 접근이 차단됐습니다. 설정에서 현재 기록을 내보내세요.",
        );
      }
    }
  }, []);
  const group = path.includes("textbook")
    ? "textbook"
    : path.includes("knowledge")
      ? "knowledge"
      : /\/(questions|library|practice|exams)/.test(path)
        ? "questions"
        : /\/(review|flashcards)/.test(path)
          ? "review"
          : "analytics";
  const links = subnav[group];
  return (
    <div
      className={s.workspace}
      style={
        { "--ui-size": `${store.settings.fontSize}px` } as React.CSSProperties
      }
      lang="ko"
    >
      <a className={s.skip} href="#mdeet-content">
        학습 본문으로 이동
      </a>
      <header className={e.globalHeader}>
        <Link href="/mdeet" className={e.wordmark}>
          MDEET<span>.</span>
        </Link>
        <button
          className={e.menuToggle}
          aria-expanded={mobile}
          onClick={() => setMobile(!mobile)}
        >
          메뉴
        </button>
        <nav
          aria-label="주 메뉴"
          className={`${e.globalNav} ${mobile ? e.menuOpen : ""}`}
        >
          {nav.map(([slug, label]) => (
            <Link
              key={slug}
              href={`/mdeet/${slug}`}
              aria-current={group === slug ? "page" : undefined}
              onClick={() => setMobile(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
        <form
          className={e.search}
          role="search"
          onSubmit={(ev) => {
            ev.preventDefault();
            router.push(`/mdeet/knowledge?q=${encodeURIComponent(search)}`);
          }}
        >
          <input
            aria-label="지식 검색"
            placeholder="지식 검색"
            value={search}
            onChange={(ev) => setSearch(ev.target.value)}
          />
          <button type="submit">검색</button>
        </form>
      </header>
      {links && (
        <nav className={e.subnav} aria-label="학습 메뉴">
          {links.map(([slug, label]) => (
            <Link
              key={slug}
              href={`/mdeet${slug ? `/${slug}` : ""}`}
              aria-current={
                path === `/mdeet${slug ? `/${slug}` : ""}` ? "page" : undefined
              }
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
      <div className={s.mainColumn}>
        <main className={s.content} id="mdeet-content" tabIndex={-1}>
          {error ? (
            <div className={s.empty} role="alert">
              <h1>학습 자료를 불러오지 못했습니다.</h1>
              <p>{error}</p>
              <button onClick={() => setRetry((x) => x + 1)}>다시 시도</button>
            </div>
          ) : !catalog || !ready ? (
            <div className={s.empty} role="status">
              학습 자료를 준비하고 있습니다…
            </div>
          ) : (
            <LearningContext.Provider
              value={{
                store,
                update,
                replace,
                ...catalog,
                storageError,
                clearStorageError: () => setStorageError(""),
              }}
            >
              {storageError && (
                <div className={s.notice} role="alert">
                  {storageError} <Link href="/mdeet/settings">설정 열기</Link>
                </div>
              )}
              {children}
            </LearningContext.Provider>
          )}
        </main>
      </div>
      <footer className={e.siteFooter}>
        <Link href="/mdeet">MDEET.</Link>
        <span>교과서 · 지식 · 기출문제</span>
        <Link href="/mdeet/settings">학습 기록 및 설정</Link>
      </footer>
    </div>
  );
}
