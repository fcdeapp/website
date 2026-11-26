import { Suspense } from "react";
import type { Metadata } from "next";
import Shell from "./_components/Shell";
export const metadata: Metadata = {
  title: { default: "대왕고래 · 의학 학습", template: "%s · 대왕고래" },
  description: "의학 교과서, 3D 해부학과 문제 풀이를 함께. 대왕고래 의학 학습.",
  icons: { icon: "/daewanggorae/runtime/Daewanggorae.png" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Shell>
      <Suspense fallback={<p role="status">학습 화면을 불러오고 있습니다.</p>}>
        {children}
      </Suspense>
    </Shell>
  );
}
