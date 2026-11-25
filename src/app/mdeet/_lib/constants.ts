export const SUBJECTS = { biology: "생물학", chemistry: "화학" } as const;
export const CONFIDENCE = {
  high: "확실함",
  medium: "애매함",
  low: "찍음",
} as const;
export const MISTAKES = [
  "개념 부족",
  "암기 부족",
  "계산 실수",
  "자료 해석 오류",
  "문제 이해 오류",
  "시간 부족",
  "기타",
];
export const STORAGE_KEY = "mdeet:learning:v1";
export const questionHref = (id: string) =>
  `/mdeet/questions/${encodeURIComponent(id)}`;
export const titleOf = (q: {
  year: number;
  subject: keyof typeof SUBJECTS;
  number: number;
}) => `${q.year}학년도 ${SUBJECTS[q.subject]} ${q.number}번`;
export const localDate = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export const duration = (ms: number) =>
  `${Math.floor(ms / 60000)}분 ${Math.floor(ms / 1000) % 60}초`;
export const percent = (correct: number, total: number) =>
  total ? `${Math.round((correct / total) * 100)}%` : "—";
export const uid = () => crypto.randomUUID();
