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
import {
  Menu,
  Search,
  ChevronLeft,
  BookOpen,
  LayoutDashboard,
  Library,
  ClipboardList,
  Timer,
  RotateCcw,
  Layers,
  ChartNoAxesCombined,
  CalendarDays,
  Settings,
} from "lucide-react";
import type { Store, QuestionIndexItem, Unit } from "../_lib/types";
import { loadCatalog } from "../_lib/data";
import { emptyStore, parseStore } from "../_lib/storage";
import { STORAGE_KEY } from "../_lib/constants";
import s from "../mdeet.module.css";
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
const nav: { group: string; items: [string, string, typeof Menu][] }[] = [
  {
    group: "학습",
    items: [
      ["", "학습 홈", LayoutDashboard],
      ["library", "단원별 학습", Library],
      ["questions", "문제 은행", BookOpen],
      ["practice", "맞춤 문제 풀이", ClipboardList],
      ["exams", "실전 모의고사", Timer],
    ],
  },
  {
    group: "복습",
    items: [
      ["review", "오답 노트", RotateCcw],
      ["flashcards", "암기 카드", Layers],
    ],
  },
  {
    group: "관리",
    items: [
      ["analytics", "학습 분석", ChartNoAxesCombined],
      ["calendar", "학습 캘린더", CalendarDays],
      ["settings", "설정", Settings],
    ],
  },
];
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
  const [collapsed, setCollapsed] = useState(false);
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
  const active = nav
    .flatMap((n) => n.items)
    .find(([slug]) =>
      slug ? path.startsWith(`/mdeet/${slug}`) : path === "/mdeet",
    );
  const label = active?.[1] || "학습 공간";
  return (
    <div
      className={`${s.workspace} ${collapsed ? s.collapsed : ""}`}
      style={
        { "--ui-size": `${store.settings.fontSize}px` } as React.CSSProperties
      }
      lang="ko"
    >
      <a className={s.skip} href="#mdeet-content">
        학습 본문으로 이동
      </a>
      {mobile && (
        <button
          className={s.scrim}
          aria-label="탐색 메뉴 닫기"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        className={`${s.sidebar} ${mobile ? s.mobileOpen : ""}`}
        aria-label="MDEET 탐색"
      >
        <div className={s.brand}>
          <Link href="/mdeet" onClick={() => setMobile(false)}>
            MDEET<span>기출 학습실</span>
          </Link>
          <button
            className={s.iconButton}
            title="사이드바 접기"
            aria-label="사이드바 접기"
            onClick={() => {
              setCollapsed(!collapsed);
              setMobile(false);
            }}
          >
            <ChevronLeft size={17} />
          </button>
        </div>
        <nav>
          {nav.map((group) => (
            <div className={s.navGroup} key={group.group}>
              <p>{group.group}</p>
              {group.items.map(([slug, title, Icon]) => (
                <Link
                  key={slug}
                  href={`/mdeet${slug ? `/${slug}` : ""}`}
                  aria-current={active?.[0] === slug ? "page" : undefined}
                  title={title}
                  onClick={() => setMobile(false)}
                >
                  <Icon size={17} aria-hidden="true" />
                  <span>{title}</span>
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className={s.sidebarFoot}>
          <span>2023–2027학년도</span>
          <span>
            {catalog?.questions.length ?? "…"}문항 · 이 브라우저에 저장
          </span>
        </div>
      </aside>
      <div className={s.mainColumn}>
        <header className={s.topbar}>
          <button
            className={s.iconButton}
            aria-label="탐색 메뉴 펼치기"
            onClick={() => {
              setCollapsed(false);
              setMobile(!mobile);
            }}
          >
            <Menu size={18} />
          </button>
          <nav aria-label="현재 위치">
            <Link href="/mdeet">학습실</Link>
            <span>/</span>
            <span>{label}</span>
            {path.split("/").filter(Boolean).length > 2 && <span>/ 상세</span>}
          </nav>
          <form
            className={s.globalSearch}
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              router.push(`/mdeet/questions?q=${encodeURIComponent(search)}`);
            }}
          >
            <Search size={15} aria-hidden="true" />
            <input
              aria-label="문항 통합 검색"
              placeholder="문항·단원 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">검색</button>
          </form>
          <Link className={s.historyLink} href="/mdeet/analytics">
            학습 기록
          </Link>
        </header>
        <div className={s.content} id="mdeet-content" tabIndex={-1}>
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
        </div>
      </div>
    </div>
  );
}
