import source from "../../../../public/mdeet/exams.json";
import type { Exam } from "../../../../public/mdeet/types";
export const exams = source.exams as Exam[];
export const legacyExamIds = exams
  .filter((x) => x.exam === "MDEET")
  .map((x) => `${x.year}-${x.paperSubject}`);
export const examIds = [
  ...new Set([...exams.map((x) => x.id), ...legacyExamIds]),
];
export const findExam = (id: string) =>
  exams.find(
    (x) =>
      x.id === id ||
      (x.exam === "MDEET" && `${x.year}-${x.paperSubject}` === id),
  );
export const examTitle = (x: Exam) =>
  `${x.year}학년도 ${x.isPreliminary ? "예비검사 " : ""}${x.exam === "MDEET" ? "MDEET" : x.track === "meet" ? "MEET" : x.track === "deet" ? "DEET" : "MEET·DEET"} · ${x.paperSubject === "biology" ? "자연과학 I" : x.paperSubject === "chemistry" ? "화학" : "자연과학 II"}`;
