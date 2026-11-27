"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  BookOpen,
  House,
  Scan,
  NotebookPen,
  LibraryBig,
  Search,
  Settings,
} from "lucide-react";
import { study, useRecords } from "../_lib/store";
import OfflineVisit from "./OfflineVisit";
import { BRAND_LINE } from "../_lib/brand";
import s from "../daewanggorae.module.css";
const tabs = [
  ["", "홈", House],
  ["textbook", "교과서", BookOpen],
  ["anatomy", "해부학", Scan],
  ["questions", "문제은행", LibraryBig],
  ["study", "나의 학습", NotebookPen],
] as const;
export default function Shell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator)
      void navigator.serviceWorker
        .register("/daewanggorae/sw.js", { scope: "/daewanggorae/" })
        .catch(() => {});
  }, []);
  const path = usePathname(),
    records = useRecords();

  const [error, setError] = useState("");
  const [systemDark, setSystemDark] = useState(false);
  useEffect(() => {
    void study
      .switchAccount("guest")
      .catch(() =>
        setError(
          "이 브라우저에서 학습 기록을 불러오지 못했습니다. 저장소 설정을 확인해 주세요.",
        ),
      );
    const m = matchMedia("(prefers-color-scheme: dark)");
    const change = () => setSystemDark(m.matches);
    change();
    m.addEventListener("change", change);
    return () => m.removeEventListener("change", change);
  }, []);
  const theme = records["preference:settings"]?.data.theme || "system";
  const dark = theme === "dark" || (theme === "system" && systemDark);
  const active = (slug: string) =>
    slug
      ? path.startsWith("/daewanggorae/" + slug) ||
        (slug === "textbook" &&
          /\/(subject|chapter|lesson)(?:\/|$)/.test(path)) ||
        (slug === "questions" && path.includes("/quiz")) ||
        (slug === "study" &&
          /\/(review|bookmarks|statistics|plan|account|settings|terms|sources)$/.test(
            path,
          ))
      : path === "/daewanggorae";
  return (
    <div className={s.shell} data-theme={dark ? "dark" : "light"} lang="ko">
      <Suspense fallback={null}>
        <OfflineVisit />
      </Suspense>
      <a className={s.skip} href="#whale-content">
        본문으로 이동
      </a>
      <header className={s.header}>
        <Link href="/daewanggorae" className={s.brand}>
          대왕고래<span aria-hidden="true">.</span>
        </Link>
        <nav className={s.desktopNav} aria-label="주 메뉴">
          {tabs.map(([slug, label]) => (
            <Link
              key={slug}
              href={"/daewanggorae/" + slug}
              aria-current={active(slug) ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className={s.headerTools}>
          <Link href="/daewanggorae/search" aria-label="통합 검색">
            <Search size={20} />
          </Link>
          <Link href="/daewanggorae/settings" aria-label="설정">
            <Settings size={20} />
          </Link>
        </div>
      </header>
      <main id="whale-content" className={s.main}>
        {error && (
          <p role="alert" className={s.error}>
            {error}
          </p>
        )}
        {children}
      </main>
      <footer className={s.footer}>
        <span>{BRAND_LINE}</span>
        <div>
          <Link href="/daewanggorae/sources">출처와 이용 안내</Link>
          <Link href="/daewanggorae/terms">이용약관</Link>
          <Link href="/daewanggorae/terms?kind=privacy">개인정보 처리방침</Link>
          <Link href="/daewanggorae/account">계정</Link>
          <Link href="/daewanggorae/support/">고객지원</Link>
        </div>
      </footer>
      <nav className={s.mobileNav} aria-label="주 메뉴">
        {tabs.map(([slug, label, Icon]) => (
          <Link
            key={slug}
            href={"/daewanggorae/" + slug}
            aria-current={active(slug) ? "page" : undefined}
          >
            <Icon size={21} strokeWidth={1.6} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
