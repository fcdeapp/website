export type {
  Lesson,
  ContentBlock,
  Scene,
  Model,
  Concept,
  Question,
  LearnerProgress,
} from "./schemas/medicine";
export type { DomainIndex, DomainManifest } from "./schemas/domain";
export type Entry = {
  id: string;
  title: string;
  path: string;
  subjectId?: string;
  chapterId?: string;
  domainId?: string;
  titleEn?: string;
};
export type LessonEntry = Entry & {
  subjectId: string;
  chapterId: string;
  domainId: string;
  verification: { status: string };
};
export type Catalog = {
  version: string;
  domains: { id: string; title: { ko: string }; path: string }[];
  subjects: Entry[];
  chapters: Entry[];
  lessons: LessonEntry[];
  questions: (Entry & { lessonId: string; profile?: string })[];
  scenes: (Entry & {
    lessonId: string;
    triggerBlockId: string;
    structures: string[];
  })[];
  conceptLessons: Record<string, { lessonId: string; blockId: string }[]>;
  planned: { id: string; subjectId: string; title: string; status: string }[];
};
export type SearchDocument = {
  kind:
    | "domain"
    | "subject"
    | "chapter"
    | "lesson"
    | "block"
    | "term"
    | "question"
    | "anatomy";
  id: string;
  title: string;
  text: string;
  lessonId?: string;
  subjectId?: string;
};
export type SearchIndex = {
  documents: SearchDocument[];
  postings: Record<string, number[]>;
};
