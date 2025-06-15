// pages/android-beta-redirect.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AndroidBetaRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).gtag("event", "conversion", {
        send_to: "AW-17197212587/VtpkCPCfmdsaEKvHoohA",
        value: 1.0,
        currency: "KRW",
        event_callback: () => {
          window.location.href =
            "https://docs.google.com/forms/d/e/1FAIpQLSegOW7ihlRB7tOnMGwJtJXE_dqPvro0gdhw_W5cOItTSWySYg/viewform?usp=dialog";
        },
        event_timeout: 2000,
      });
      setTimeout(() => {
        window.location.href =
          "https://docs.google.com/forms/d/e/1FAIpQLSegOW7ihlRB7tOnMGwJtJXE_dqPvro0gdhw_W5cOItTSWySYg/viewform?usp=dialog";
      }, 3000);
    }
  }, [router]);

  return (
    <p style={{ padding: "4rem", textAlign: "center" }}>
      잠시만 기다려 주세요…<br />
      베타테스터 지원 페이지로 이동 중입니다.
    </p>
  );
}
