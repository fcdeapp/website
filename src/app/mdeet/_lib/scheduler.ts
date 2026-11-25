import type { CardRating, Confidence, Learning } from "./types";
export const INTERVALS = [1, 3, 7, 14, 30];
export const blankLearning = (): Learning => ({
  bookmarked: false,
  markedForReview: false,
  notes: "",
  mistakeTypes: [],
  reviewStep: 0,
});
export const due = (
  state: Pick<Learning, "nextReviewAt"> | undefined,
  now = Date.now(),
) => !!state?.nextReviewAt && Date.parse(state.nextReviewAt) <= now;
export function nextReview(
  previous: Learning,
  correct: boolean,
  confidence: Confidence,
  now = Date.now(),
): Learning {
  const step =
    correct && confidence === "high"
      ? Math.min(previous.reviewStep + (previous.lastAttemptAt ? 1 : 0), 4)
      : 0;
  return {
    ...previous,
    reviewStep: step,
    markedForReview: !correct || confidence !== "high",
    lastAttemptAt: new Date(now).toISOString(),
    nextReviewAt: new Date(now + INTERVALS[step] * 86400000).toISOString(),
  };
}
export function scheduleCard(
  step: number,
  rating: CardRating,
  now = Date.now(),
) {
  const next =
    rating === "again"
      ? 0
      : Math.min(
          4,
          Math.max(
            0,
            step + (rating === "hard" ? 0 : rating === "easy" ? 2 : 1),
          ),
        );
  return {
    step: next,
    nextReviewAt: new Date(
      now + (rating === "again" ? 600000 : INTERVALS[next] * 86400000),
    ).toISOString(),
  };
}
