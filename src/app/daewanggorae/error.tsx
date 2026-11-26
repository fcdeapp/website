"use client";
export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <section role="alert">
      <h1>학습 화면을 불러오지 못했습니다.</h1>
      <p>저장된 기록은 유지됩니다. 다시 시도해 주세요.</p>
      <button onClick={reset}>다시 불러오기</button>
    </section>
  );
}
