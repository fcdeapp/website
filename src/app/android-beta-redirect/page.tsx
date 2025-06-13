// pages/android-beta-redirect.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AndroidBetaRedirect() {
  const router = useRouter();
  useEffect(() => {
    // 1. 전환 스크립트(gtag) 등 실행 후
    // 2. 구글 폼으로 리디렉트
    window.location.href = 
      "https://docs.google.com/forms/d/e/1FAIpQLSegOW7ihlRB7tOnMGwJtJXE_dqPvro0gdhw_W5cOItTSWySYg/viewform?usp=dialog";
  }, [router]);

  return (
    <p style={{ padding: "4rem", textAlign: "center" }}>
      잠시만 기다려 주세요…  
      <br />
      베타테스터 지원 페이지로 이동 중입니다.
    </p>
  );
}
