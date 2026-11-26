"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { cacheVisitedPage } from "../_lib/offline";
export default function OfflineVisit() {
  const path = usePathname(),
    query = useSearchParams().toString();
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("caches" in window)) return;
    const c = new AbortController();
    const timer = setTimeout(
      () => void cacheVisitedPage(c.signal).catch(() => {}),
      2000,
    );
    return () => {
      clearTimeout(timer);
      c.abort();
    };
  }, [path, query]);
  return null;
}
