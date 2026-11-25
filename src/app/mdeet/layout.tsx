import { Suspense } from "react";
import type { Metadata } from "next";
import Workspace from "./_components/Workspace";
export const metadata: Metadata = {
  title: { default: "MDEET 기출 학습실", template: "%s · MDEET" },
  description: "2023–2027학년도 생물학·화학 기출문제 학습, 복습 및 모의고사.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Workspace>
      <Suspense fallback={<p role="status">학습 화면을 준비하고 있습니다…</p>}>
        {children}
      </Suspense>
    </Workspace>
  );
}
