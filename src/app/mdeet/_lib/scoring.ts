import type { Attempt, Confidence, Question, Session, Store } from "./types";
import { blankLearning, due, nextReview } from "./scheduler";
export function makeAttempt(
  q: Question,
  selectedOption: number,
  confidence: Confidence,
  durationMs: number,
  mode: Attempt["mode"],
  id: string,
  now: number,
  sessionId?: string,
  wasDue = false,
): Attempt {
  const answers = q.acceptedAnswers ?? (q.answer == null ? [] : [q.answer]);
  const correct = answers.some((n) => n === selectedOption);
  return {
    id,
    questionId: q.id,
    selectedOption,
    confidence,
    durationMs: Math.max(0, durationMs),
    mode,
    sessionId,
    correct,
    pointsEarned: correct ? (q.points ?? 0) : 0,
    ungraded: answers.length === 0,
    pointsUnknown: q.points === null,
    attemptedAt: new Date(now).toISOString(),
    wasDue,
  };
}
export function recordAttempt(store: Store, attempt: Attempt): Store {
  if (store.attempts.some((a) => a.id === attempt.id)) return store;
  const previous = store.learning[attempt.questionId] || blankLearning();
  const at = Date.parse(attempt.attemptedAt);
  const saved = { ...attempt, wasDue: due(previous, at) };
  return {
    ...store,
    attempts: [...store.attempts, saved],
    learning: {
      ...store.learning,
      [attempt.questionId]: attempt.ungraded
        ? { ...previous, lastAttemptAt: attempt.attemptedAt }
        : nextReview(previous, attempt.correct, attempt.confidence, at),
    },
    lastQuestionId: attempt.questionId,
  };
}
export function remaining(session: Session, now = Date.now()) {
  return session.endsAt ? Math.max(0, Date.parse(session.endsAt) - now) : null;
}
export function summary(attempts: Attempt[]) {
  const first = new Map<string, Attempt>();
  const latest = new Map<string, Attempt>();
  const repeats: Attempt[] = [];
  for (const a of attempts
    .filter((a) => !a.ungraded)
    .sort((a, b) => a.attemptedAt.localeCompare(b.attemptedAt))) {
    if (!first.has(a.questionId)) first.set(a.questionId, a);
    else repeats.push(a);
    latest.set(a.questionId, a);
  }
  return {
    first: [...first.values()],
    latest: [...latest.values()],
    repeats,
    totalMs: attempts.reduce((n, a) => n + a.durationMs, 0),
    correct: attempts.filter((a) => a.correct).length,
  };
}
