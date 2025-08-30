// pages/redirect.tsx
"use client";

import Head from "next/head";
import React, { useEffect, useMemo, useState } from "react";

const IOS_APP_URL = "https://apps.apple.com/kr/app/id6743047157";
const ANDROID_APP_URL =
  "https://play.google.com/store/apps/details?id=com.fcdeapp.facade";
const FALLBACK_URL = "https://website.fcde.app/about-kr";

/** 브라우저 UA 기반 간단 감지 (JS 미실행 환경에서도 페이지는 200으로 그대로 노출됨) */
function detectOS(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";
  const ua = (navigator.userAgent || "").toLowerCase();

  // iPadOS가 Macintosh로 나오는 케이스 보완: Mac + touch
  const isiPadOnMac =
    (navigator.platform === "MacIntel" &&
      // @ts-ignore
      (navigator.maxTouchPoints || 0) > 1) || /ipad/.test(ua);

  if (/iphone|ipod/.test(ua) || isiPadOnMac || /ipad/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
}

export default function RedirectLanding() {
  const [os, setOs] = useState<"ios" | "android" | "other">("other");

  // 추천 목적지 (자동 이동은 기본 비활성)
  const recommendedUrl = useMemo(() => {
    if (os === "ios") return IOS_APP_URL;
    if (os === "android") return ANDROID_APP_URL;
    return FALLBACK_URL;
  }, [os]);

  useEffect(() => {
    setOs(detectOS());

    // ⭐ 기본은 자동 이동하지 않음 → 광고/크롤러 모두 동일한 200 랜딩 페이지를 보게 함
    // 필요할 때만 ?auto=1 로 명시적으로 자동 이동을 허용
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const shouldAuto = params.get("auto") === "1";
      if (shouldAuto) {
        const t = setTimeout(() => {
          try {
            window.location.assign(recommendedUrl);
          } catch {
            window.location.href = recommendedUrl;
          }
        }, 150);
        return () => clearTimeout(t);
      }
    }
  }, [recommendedUrl]);

  return (
    <>
      <Head>
        {/* Final URL과 동일 페이지를 항상 200으로 제공 */}
        <title>앱으로 이동 | FACDE</title>
        <meta name="robots" content="all" />
        <link rel="canonical" href="https://website.fcde.app/redirect" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* JS 미실행 환경을 위한 안내 */}
        <noscript>
          {`자동 이동이 실행되지 않습니다. 아래 버튼을 눌러 이동해 주세요.`}
        </noscript>
      </Head>

      <main style={styles.container}>
        <section style={styles.card}>
          <h1 style={styles.title}>앱/웹으로 이동</h1>
          <p style={styles.lead}>
            이 페이지는 안전한 랜딩을 위해 자동 이동을 기본으로 사용하지 않습니다.
            아래에서 원하는 목적지를 선택해 주세요.
          </p>

          <div style={styles.buttons}>
            <a style={styles.primaryBtn} href={IOS_APP_URL} rel="noopener">
              iOS 앱스토어로 이동
            </a>
            <a style={styles.primaryBtn} href={ANDROID_APP_URL} rel="noopener">
              안드로이드 플레이스토어로 이동
            </a>
            <a style={styles.secondaryBtn} href={FALLBACK_URL} rel="noopener">
              웹페이지로 이동
            </a>
          </div>

          <div style={styles.recoWrap}>
            <span style={styles.badge}>권장</span>
            <span style={styles.recoText}>
              현재 기기 기준 추천 대상:{" "}
              <strong style={{ color: "#0b1220" }}>{labelFor(os)}</strong>{" "}
              → <code style={styles.code}>{recommendedUrl}</code>
            </span>
          </div>

          <details style={styles.details}>
            <summary style={styles.summary}>자동 이동이 필요하나요?</summary>
            <p style={styles.note}>
              URL에 <code style={styles.code}>?auto=1</code> 을 붙이면 자동 이동이
              실행됩니다. 예){" "}
              <code style={styles.code}>
                https://website.fcde.app/redirect?auto=1
              </code>
            </p>
          </details>
        </section>
      </main>
    </>
  );
}

function labelFor(os: "ios" | "android" | "other") {
  if (os === "ios") return "iOS 앱스토어";
  if (os === "android") return "안드로이드 플레이스토어";
  return "웹페이지";
}

/* ---------- 스타일 ---------- */
const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f8fb",
    padding: "32px 16px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans KR'",
    color: "#0f172a",
  },
  card: {
    maxWidth: 760,
    width: "100%",
    background: "#fff",
    borderRadius: 14,
    boxShadow: "0 10px 28px rgba(15,23,42,0.1)",
    padding: "28px",
  },
  title: { margin: 0, fontSize: 24, fontWeight: 800, color: "#0b1220" },
  lead: {
    marginTop: 10,
    marginBottom: 18,
    color: "#475569",
    lineHeight: 1.6,
  },
  buttons: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 18,
  },
  primaryBtn: {
    display: "inline-block",
    padding: "12px 18px",
    background: "#0b1220",
    color: "#fff",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 700,
    minWidth: 180,
    textAlign: "center",
  },
  secondaryBtn: {
    display: "inline-block",
    padding: "12px 18px",
    background: "#ffffff",
    color: "#0b1220",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 700,
    border: "1px solid #e6eef8",
    minWidth: 160,
    textAlign: "center",
  },
  recoWrap: {
    marginTop: 6,
    display: "flex",
    alignItems: "center",
    gap: 8,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  badge: {
    background: "#e8eefc",
    color: "#1a3cff",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
  },
  recoText: { fontSize: 14, color: "#334155" },
  code: {
    background: "#f1f5f9",
    borderRadius: 6,
    padding: "2px 6px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 12,
  },
  details: { marginTop: 14 },
  summary: { cursor: "pointer", color: "#0b1220", fontWeight: 700 },
  note: { color: "#64748b", marginTop: 8, lineHeight: 1.6 },
};
