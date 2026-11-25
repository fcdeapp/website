export type {
  Subject,
  BBox,
  Span,
  TextItem,
  ImageItem,
  LayoutRegion,
  Asset,
  Option,
  Question,
  QuestionIndexItem,
} from "../../../../public/mdeet/types";
import type { Subject } from "../../../../public/mdeet/types";
export type Unit = {
  id: string;
  subject: Subject;
  label: string;
  count: number;
  questionIds: string[];
};
export type Confidence = "high" | "medium" | "low";
export type Mode = "study" | "practice" | "exam" | "review";
export type Attempt = {
  id: string;
  questionId: string;
  sessionId?: string;
  selectedOption: number;
  correct: boolean;
  ungraded?: boolean;
  pointsUnknown?: boolean;
  pointsEarned: number;
  durationMs: number;
  confidence: Confidence;
  attemptedAt: string;
  mode: Mode;
  wasDue: boolean;
};
export type Learning = {
  bookmarked: boolean;
  markedForReview: boolean;
  notes: string;
  mistakeTypes: string[];
  nextReviewAt?: string;
  lastAttemptAt?: string;
  reviewStep: number;
};
export type Session = {
  id: string;
  examId?: string;
  mode: "practice" | "exam";
  questionIds: string[];
  current: number;
  answers: Record<string, number>;
  confidence: Record<string, Confidence>;
  flagged: string[];
  durations: Record<string, number>;
  startedAt: string;
  endsAt?: string;
  finishedAt?: string;
  grading: "immediate" | "end";
  gradedIds: string[];
};
export type CardRating = "again" | "hard" | "good" | "easy";
export type Card = {
  id: string;
  front: string;
  back: string;
  notes: string;
  subject: Subject;
  unitId: string;
  questionId?: string;
  nextReviewAt: string;
  lastReviewAt?: string;
  step: number;
  history: { at: string; rating: CardRating }[];
};
export type Plan = {
  id: string;
  date: string;
  title: string;
  kind: "study" | "exam";
  unitId: string;
  target: number;
  minutes: number;
  done: boolean;
};
export type Settings = {
  fontSize: number;
  zoom: number;
  grading: "immediate" | "end";
};
export type Store = {
  version: 1;
  attempts: Attempt[];
  learning: Record<string, Learning>;
  sessions: Session[];
  cards: Card[];
  plans: Plan[];
  settings: Settings;
  lastQuestionId?: string;
  textbook?: TextbookLearning;
};

export type TextbookLearning = {
  lastSectionId?: string;
  sections: Record<
    string,
    { notes: string; completed: boolean; lastReadAt?: string }
  >;
  knowledge: Record<string, { understood: boolean; memorized: boolean }>;
  reviews: Record<
    string,
    {
      step: number;
      nextReviewAt: string;
      history: { at: string; rating: CardRating }[];
    }
  >;
};
