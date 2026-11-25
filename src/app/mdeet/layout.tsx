import { Suspense } from "react";
import type { Metadata } from "next";
import Workspace from "./_components/Workspace";
export const metadata: Metadata = {
  title: { default: "MDEET 교과서와 학습 기록", template: "%s · MDEET" },
  description: "MDEET 교과서 열람, 지식 학습, 기출문제 풀이와 복습.",
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
