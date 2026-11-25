// pages/redirect.tsx
"use client";

import Head from "next/head";
import styles from "../../styles/pages/Redirect.module.css";
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
      (navigator.maxTouchPoints || 0) > 1) ||
    /ipad/.test(ua);

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
        <title>앱으로 이동 | Abrody</title>
        <meta name="robots" content="all" />
        <link rel="canonical" href="https://website.fcde.app/redirect" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* JS 미실행 환경을 위한 안내 */}
        <noscript>
          {`자동 이동이 실행되지 않습니다. 아래 버튼을 눌러 이동해 주세요.`}
        </noscript>
      </Head>

      <main className={styles.container}>
        <section className={styles.card}>
          <h1 className={styles.title}>앱/웹으로 이동</h1>
          <p className={styles.lead}>
            사용 중인 기기의 앱스토어를 선택하거나 웹에서 Abrody를 살펴보세요.
          </p>

          <div className={styles.buttons}>
            <a className={styles.primaryBtn} href={IOS_APP_URL} rel="noopener">
              iOS 앱스토어로 이동
            </a>
            <a
              className={styles.primaryBtn}
              href={ANDROID_APP_URL}
              rel="noopener"
            >
              안드로이드 플레이스토어로 이동
            </a>
            <a
              className={styles.secondaryBtn}
              href={FALLBACK_URL}
              rel="noopener"
            >
              웹페이지로 이동
            </a>
          </div>

          <div className={styles.recoWrap}>
            <span className={styles.badge}>권장</span>
            <span className={styles.recoText}>
              현재 기기 기준 추천 대상:{" "}
              <strong style={{ color: "#0b1220" }}>{labelFor(os)}</strong> →{" "}
              <code className={styles.code}>{recommendedUrl}</code>
            </span>
          </div>

          <details className={styles.details}>
            <summary className={styles.summary}>
              자동 이동이 필요하나요?
            </summary>
            <p className={styles.note}>
              URL에 <code className={styles.code}>?auto=1</code> 을 붙이면 자동
              이동이 실행됩니다. 예){" "}
              <code className={styles.code}>
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
