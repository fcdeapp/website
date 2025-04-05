// src/app/layout.tsx
import React from "react";
import type { Metadata } from "next";
import localFont from "next/font/local";
import Header from "../components/Header";
import ClientEffects from "../components/ClientEffects";
import "./globals.css";

const pretendard = localFont({
  src: [
    { path: "/assets/fonts/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "/assets/fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-pretendard",
});

export const metadata: Metadata = {
  title: "Facade",
  description: "Connecting people and cultures abroad.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${pretendard.className} antialiased`}>
        <Header />
        <ClientEffects />
        <main>{children}</main>
      </body>
    </html>
  );
}
