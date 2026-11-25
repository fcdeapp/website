import index from "../../../../public/mdeet/textbook/index.json";
import knowledgeIndex from "../../../../public/mdeet/knowledge/index.json";
import flashIndex from "../../../../public/mdeet/flashcards/index.json";
import type {
  TextbookSectionIndex,
  TextbookChapter,
  TextbookSection,
  KnowledgeItem,
  Flashcard,
} from "../../../../public/mdeet/types";
import type { TextbookLearning } from "./types";
import { json } from "./data";
export type { TextbookSection, KnowledgeItem, Flashcard };
export const books = index.books;
export const chapters = index.chapters as TextbookChapter[];
export const sections = index.sections as TextbookSectionIndex[];
export const totalKnowledge = knowledgeIndex.count;
export const totalCards = flashIndex.count;
export const bookEnglish: Record<string, string> = {
  biology: "BIOLOGY",
  "general-chemistry": "GENERAL CHEMISTRY",
  "organic-chemistry": "ORGANIC CHEMISTRY",
  physics: "PHYSICS",
  statistics: "STATISTICS",
};
export const number = (n: number) => String(n).padStart(2, "0");
export const sectionHref = (id: string) =>
  `/mdeet/textbook/read/${id.replaceAll("/", "--")}`;
export const chapterHref = (id: string) => `/mdeet/textbook/chapter/${id}`;
export const blankTextbook = (): TextbookLearning => ({
  sections: {},
  knowledge: {},
  reviews: {},
});
export const chapterNumber = (id: string) => {
  const c = chapters.find((x) => x.id === id);
  return c
    ? (books.find((b) => b.id === c.book)?.chapterIds.indexOf(id) ?? -1) + 1
    : 0;
};
export function loadSection(id: string) {
  const item = sections.find((s) => s.id === id);
  if (!item) return Promise.reject(new Error("학습 절을 찾을 수 없습니다."));
  return json<TextbookSection>(item.url);
}
let knowledgePromise: Promise<KnowledgeItem[]> | undefined;
let flashPromise: Promise<Flashcard[]> | undefined;
async function collect<T>(
  sources: { url: string }[],
  key: string,
): Promise<T[]> {
  let next = 0;
  const result: T[][] = new Array(sources.length);
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < sources.length) {
        const i = next++;
        const data = await json<Record<string, T[]>>(sources[i].url);
        result[i] = data[key];
      }
    }),
  );
  return result.flat();
}
export function loadKnowledge() {
  return (knowledgePromise ??= collect<KnowledgeItem>(
    knowledgeIndex.sections,
    "items",
  ).catch((e) => {
    knowledgePromise = undefined;
    throw e;
  }));
}
export function loadFlashcards() {
  return (flashPromise ??= collect<Flashcard>(
    flashIndex.sections,
    "cards",
  ).catch((e) => {
    flashPromise = undefined;
    throw e;
  }));
}
