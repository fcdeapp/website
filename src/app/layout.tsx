"use client";

import React, { useEffect } from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "../components/Header";
import "./globals.css";
import axios from "axios";

const pretendard = localFont({
  src: [
    { path: "../../public/fonts/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "Facade",
  description: "Connecting people and cultures abroad.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // localStorage에서 region 값을 불러오거나 기본값 설정
    const region = localStorage.getItem('region') || 'ap-northeast-2';
    const interceptor = axios.interceptors.request.use((config) => {
      config.headers['x-region'] = region;
      return config;
    });
    // 컴포넌트 언마운트 시 인터셉터 해제
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  return (
    <html lang="en">
      <body className={`${pretendard.className} antialiased`}>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
