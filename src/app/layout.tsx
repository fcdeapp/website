// src/app/layout.tsx
import React from "react";
import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

// Metadata object for SEO, etc.
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
      <body className={`${(inter as any).variable} ${(robotoMono as any).variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
