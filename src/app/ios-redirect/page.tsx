// pages/ios-redirect.tsx
"use client";

import { useEffect } from "react";
import styles from "../../styles/pages/Redirect.module.css";

export default function IosRedirect() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      // 즉시 App Store로 이동
      window.location.href = "https://apps.apple.com/kr/app/id6743047157";
    }
  }, []);

  return (
    <div className={styles.transit} role="status">
      잠시만 기다려 주세요…
      <br />
      앱스토어로 이동 중입니다.
    </div>
  );
}
