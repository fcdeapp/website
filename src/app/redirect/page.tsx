// pages/redirect.tsx
"use client";

import React, { useEffect, useState } from "react";

const IOS_APP_URL = "https://apps.apple.com/kr/app/id6743047157";
const ANDROID_APP_URL = "https://play.google.com/store/apps/details?id=com.fcdeapp.facade";
const FALLBACK_URL = "https://website.fcde.app/about-kr";

function detectOS(): "ios" | "android" | "other" {
  if (typeof navigator === "undefined") return "other";

  const ua = navigator.userAgent || "";
  // userAgentData (새 브라우저에서 지원하면 더 정확하게 플랫폼을 얻을 수 있음)
  // @ts-ignore
  const uaDataPlatform = (navigator as any).userAgentData?.platform || "";

  // iPadOS 13+는 플랫폼이 MacIntel로 나오는 경우가 있어 터치포인트로 보완
  const isIPadOnMac =
    (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1) ||
    /iPad/.test(ua);

  const isIOS =
    /iPhone|iPod/.test(ua) ||
    isIPadOnMac ||
    /iPad/.test(ua) ||
    /iPhone|iPad|iPod/.test(uaDataPlatform);

  const isAndroid = /Android/.test(ua) || /Android/.test(uaDataPlatform);

  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "other";
}

export default function IosRedirect() {
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const os = detectOS();
      let url: string;
      if (os === "ios") {
        url = IOS_APP_URL;
      } else if (os === "android") {
        url = ANDROID_APP_URL;
      } else {
        url = FALLBACK_URL;
      }

      // 상태 업데이트(화면에 어떤 링크로 이동했는지 보여주기 위해)
      setTarget(url);

      // 실제 리디렉션 (replace로 뒤로가기 시 이 페이지가 남지 않게 함)
      // 약간의 지연을 두어 UX(메시지 표시) 확보
      const t = setTimeout(() => {
        try {
          window.location.replace(url);
        } catch (e) {
          // 만약 브라우저가 replace를 막으면 href로 시도
          window.location.href = url;
        }
      }, 200); // 200ms 지연(필요시 0으로 변경 가능)

      return () => clearTimeout(t);
    } catch (err) {
      // 예외 발생 시 fallback으로 이동
      setTarget(FALLBACK_URL);
      window.location.replace(FALLBACK_URL);
    }
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={{ marginBottom: 8 }}>잠시만 기다려 주세요…</h1>
      <p style={{ margin: 0 }}>앱 스토어로 이동 중입니다.</p>

      <div style={{ marginTop: 18 }}>
        <SmallText>자동 이동이 안 될 경우 아래 버튼을 눌러주세요.</SmallText>
        <div style={{ marginTop: 12, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          <a style={buttonStyle} href={IOS_APP_URL} onClick={() => {}} >
            iOS 앱스토어로 이동
          </a>
          <a style={buttonStyle} href={ANDROID_APP_URL}>
            안드로이드 플레이로 이동
          </a>
          <a style={secondaryButtonStyle} href={FALLBACK_URL}>
            웹페이지로 이동
          </a>
        </div>

        <div style={{ marginTop: 12 }}>
          <SmallText>
            현재 리디렉션 대상:{" "}
            <strong>{target ?? "확인 중…"}</strong>
          </SmallText>
        </div>
      </div>
    </div>
  );
}

/* 스타일 */
const containerStyle: React.CSSProperties = {
  padding: "4rem 1rem",
  textAlign: "center",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
  color: "#111",
};

const SmallText: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div style={{ fontSize: 14, color: "#444" }}>{children}</div>
);

const buttonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 16px",
  background: "#1a1045",
  color: "#fff",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
};

const secondaryButtonStyle: React.CSSProperties = {
  display: "inline-block",
  padding: "10px 16px",
  background: "#fff",
  color: "#1a1045",
  borderRadius: 8,
  textDecoration: "none",
  fontWeight: 600,
  border: "1px solid #1a1045",
};
