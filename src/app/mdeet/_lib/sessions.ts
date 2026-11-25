import type { Session, Store } from "./types";
import { uid } from "./constants";
export function createSession(
  ids: string[],
  settings: Store["settings"],
  options: Partial<Pick<Session, "examId" | "mode" | "grading">> & {
    minutes?: number;
  } = {},
): Session {
  const now = Date.now();
  return {
    id: uid(),
    mode: options.mode || "practice",
    examId: options.examId,
    grading:
      options.mode === "exam" ? "end" : options.grading || settings.grading,
    questionIds: ids,
    current: 0,
    answers: {},
    confidence: {},
    flagged: [],
    durations: {},
    startedAt: new Date(now).toISOString(),
    endsAt: options.minutes
      ? new Date(now + options.minutes * 60000).toISOString()
      : undefined,
    gradedIds: [],
  };
}
export function shuffle<T>(items: T[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
