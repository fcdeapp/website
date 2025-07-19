// pages/ios-redirect.tsx
"use client";

import { useEffect } from "react";

export default function IosRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 즉시 App Store로 이동
      window.location.href = "https://apps.apple.com/kr/app/id6743047157";
    }
  }, []);

  return (
    <div style={{ padding: "4rem", textAlign: "center" }}>
      잠시만 기다려 주세요…<br />
      앱스토어로 이동 중입니다.
    </div>
  );
}
