import type { Attempt } from "./types";
export function mastery(attempts: Attempt[], total: number, now = Date.now()) {
  attempts = attempts.filter((a) => !a.ungraded);
  if (attempts.length < 3) return null;
  const latest = new Map<string, Attempt>();
  [...attempts]
    .sort((a, b) => a.attemptedAt.localeCompare(b.attemptedAt))
    .forEach((a) => latest.set(a.questionId, a));
  let value = 0;
  latest.forEach((a) => {
    const age = Math.max(0, (now - Date.parse(a.attemptedAt)) / 86400000);
    value +=
      (a.correct ? 1 : 0) *
      { high: 1, medium: 0.7, low: 0.4 }[a.confidence] *
      Math.max(0.5, 1 - age / 120);
  });
  return Math.round((100 * value) / Math.max(1, total));
}
