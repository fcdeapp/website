import type { Store } from "./types";
export const emptyStore = (): Store => ({
  version: 1,
  attempts: [],
  learning: {},
  sessions: [],
  cards: [],
  plans: [],
  settings: { fontSize: 14, zoom: 100, grading: "end" },
});
const obj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown, max = 20000): v is string =>
  typeof v === "string" && v.length <= max;
const num = (v: unknown, min = 0, max = 1e12): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
const int = (v: unknown, min = 0, max = 1e12) =>
  num(v, min, max) && Number.isInteger(v);
const bool = (v: unknown) => typeof v === "boolean";
const date = (v: unknown) => str(v, 40) && Number.isFinite(Date.parse(v));
const optionalDate = (v: unknown) => v === undefined || date(v);
const qid = (v: unknown) =>
  str(v, 80) && /^mdeet-\d{4}-(biology|chemistry)-\d{2}$/.test(v);
const uid = (v: unknown) => str(v, 100) && v.length > 0;
const choice = (v: unknown) => int(v, 1, 5);
const confidence = (v: unknown) =>
  ["high", "medium", "low"].includes(String(v));
const grading = (v: unknown) => v === "immediate" || v === "end";
const array = (
  v: unknown,
  max: number,
  predicate: (x: unknown) => boolean,
): v is unknown[] => Array.isArray(v) && v.length <= max && v.every(predicate);
const record = (
  v: unknown,
  key: (s: string) => boolean,
  value: (x: unknown) => boolean,
) => obj(v) && Object.entries(v).every(([k, x]) => key(k) && value(x));
const unique = (items: { id: string }[]) =>
  new Set(items.map((x) => x.id)).size === items.length;
export function parseStore(
  raw: string,
  validIds?: Set<string>,
  validUnits?: Set<string>,
): Store {
  if (raw.length > 15_000_000)
    throw new Error("기록 파일은 15MB 이하만 가져올 수 있습니다.");
  let s: unknown;
  try {
    s = JSON.parse(raw);
  } catch {
    throw new Error("JSON 형식이 올바르지 않습니다.");
  }
  const validQ = (v: unknown) =>
    qid(v) && (!validIds || validIds.has(v as string));
  const validUnit = (v: unknown) =>
    str(v, 100) && (!validUnits || v === "" || validUnits.has(v));
  const fail = () => {
    throw new Error(
      "기록 구조 또는 값이 올바르지 않습니다. 버전 1의 MDEET 내보내기 파일을 사용하세요.",
    );
  };
  if (!obj(s) || s.version !== 1 || !obj(s.settings)) return fail();
  if (
    !int(s.settings.fontSize, 12, 20) ||
    !int(s.settings.zoom, 75, 200) ||
    !grading(s.settings.grading)
  )
    return fail();
  if (
    !array(
      s.attempts,
      50000,
      (a) =>
        obj(a) &&
        uid(a.id) &&
        validQ(a.questionId) &&
        (a.sessionId === undefined || uid(a.sessionId)) &&
        int(a.selectedOption, 0, 5) &&
        bool(a.correct) &&
        (a.correct
          ? choice(a.selectedOption) && int(a.pointsEarned, 3, 5)
          : a.pointsEarned === 0) &&
        num(a.durationMs, 0, 604800000) &&
        confidence(a.confidence) &&
        date(a.attemptedAt) &&
        ["study", "practice", "exam", "review"].includes(String(a.mode)) &&
        bool(a.wasDue),
    )
  )
    return fail();
  if (
    !record(
      s.learning,
      (k) => validQ(k),
      (v) =>
        obj(v) &&
        bool(v.bookmarked) &&
        bool(v.markedForReview) &&
        str(v.notes) &&
        array(v.mistakeTypes, 7, (x) => str(x, 100)) &&
        optionalDate(v.nextReviewAt) &&
        optionalDate(v.lastAttemptAt) &&
        int(v.reviewStep, 0, 4),
    )
  )
    return fail();
  if (
    !array(s.sessions, 1000, (x) => {
      if (
        !obj(x) ||
        !uid(x.id) ||
        (x.mode !== "practice" && x.mode !== "exam") ||
        !array(x.questionIds, 300, validQ) ||
        x.questionIds.length === 0 ||
        new Set(x.questionIds).size !== x.questionIds.length ||
        !int(x.current, 0, x.questionIds.length - 1) ||
        !date(x.startedAt) ||
        !optionalDate(x.endsAt) ||
        !optionalDate(x.finishedAt) ||
        !grading(x.grading)
      )
        return false;
      const member = (k: string) =>
        Array.isArray(x.questionIds) && x.questionIds.includes(k);
      return (
        (x.examId === undefined ||
          (str(x.examId, 80) &&
            /^\d{4}-(biology|chemistry)$/.test(x.examId))) &&
        record(x.answers, member, choice) &&
        record(x.confidence, member, confidence) &&
        record(x.durations, member, (v) => num(v, 0, 604800000)) &&
        array(x.flagged, 300, (v) => str(v) && member(v)) &&
        array(x.gradedIds, 300, (v) => str(v) && member(v)) &&
        (x.mode !== "exam" || x.grading === "end") &&
        (!x.endsAt ||
          Date.parse(x.endsAt as string) >= Date.parse(x.startedAt as string))
      );
    })
  )
    return fail();
  if (
    !array(
      s.cards,
      5000,
      (c) =>
        obj(c) &&
        uid(c.id) &&
        str(c.front) &&
        str(c.back) &&
        str(c.notes) &&
        ["biology", "chemistry"].includes(String(c.subject)) &&
        validUnit(c.unitId) &&
        (c.questionId === undefined || validQ(c.questionId)) &&
        date(c.nextReviewAt) &&
        optionalDate(c.lastReviewAt) &&
        int(c.step, 0, 4) &&
        array(
          c.history,
          10000,
          (h) =>
            obj(h) &&
            date(h.at) &&
            ["again", "hard", "good", "easy"].includes(String(h.rating)),
        ),
    )
  )
    return fail();
  if (
    !array(
      s.plans,
      10000,
      (p) =>
        obj(p) &&
        uid(p.id) &&
        str(p.date, 10) &&
        /^\d{4}-\d{2}-\d{2}$/.test(p.date) &&
        date(p.date) &&
        new Date(p.date).toISOString().slice(0, 10) === p.date &&
        str(p.title, 500) &&
        (p.kind === "study" || p.kind === "exam") &&
        validUnit(p.unitId) &&
        int(p.target, 0, 300) &&
        int(p.minutes, 0, 1440) &&
        bool(p.done),
    )
  )
    return fail();
  if (s.lastQuestionId !== undefined && !validQ(s.lastQuestionId))
    return fail();
  const store = s as unknown as Store;
  if (
    !unique(store.attempts) ||
    !unique(store.cards) ||
    !unique(store.sessions) ||
    !unique(store.plans)
  )
    return fail();
  return store;
}
