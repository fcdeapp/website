"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section role="alert">
      <h1>화면을 표시하지 못했습니다.</h1>
      <p>학습 기록은 이 브라우저에 저장됩니다.</p>
      <button onClick={reset}>다시 시도</button>{" "}
      <Link href="/mdeet">학습 홈</Link>
    </section>
  );
}
