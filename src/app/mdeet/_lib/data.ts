import type { Question, QuestionIndexItem, Unit } from "./types";
const cache = new Map<string, Promise<Question>>();
export async function json<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`자료를 불러오지 못했습니다 (${res.status}).`);
    return await res.json();
  } finally {
    clearTimeout(timeout);
  }
}
export async function loadCatalog() {
  const [index, units] = await Promise.all([
    json<{ schemaVersion: number; questions: QuestionIndexItem[] }>(
      "/mdeet/index.json",
    ),
    json<{ units: Unit[] }>("/mdeet/units.json"),
  ]);
  if (
    index.schemaVersion !== 2 ||
    !Array.isArray(index.questions) ||
    !Array.isArray(units.units)
  )
    throw new Error("지원하지 않는 문항 데이터 형식입니다.");
  return { questions: index.questions, units: units.units };
}
export function loadQuestion(id: string): Promise<Question> {
  if (!/^[a-z][a-z0-9-]{1,100}$/.test(id))
    return Promise.reject(new Error("올바르지 않은 문항 ID입니다."));
  if (cache.has(id)) return cache.get(id)!;
  const promise = json<Question>(`/mdeet/questions/${id}.json`)
    .then((q) => {
      if (
        q.id !== id ||
        q.schemaVersion !== 2 ||
        !q.layout?.length ||
        !q.options?.length ||
        (q.answer !== null && (q.answer < 1 || q.answer > 5))
      )
        throw new Error("문항 형식을 확인할 수 없습니다.");
      return q;
    })
    .catch((e) => {
      cache.delete(id);
      throw e;
    });
  cache.set(id, promise);
  if (cache.size > 40) cache.delete(cache.keys().next().value!);
  return promise;
}
export function prefetchQuestion(id?: string) {
  if (id) void loadQuestion(id).catch(() => {});
}
let textIndex: Map<string, string> | undefined;
export async function loadTextIndex(
  questions: QuestionIndexItem[],
  progress: (n: number) => void,
) {
  if (textIndex) return textIndex;
  const result = new Map<string, string>();
  let next = 0;
  // Only requested by an explicit full-text search. Images are never requested here.
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < questions.length) {
        const q = await loadQuestion(questions[next++].id);
        result.set(
          q.id,
          `${q.stem} ${q.options.map((o) => o.text).join(" ")}`.toLocaleLowerCase(),
        );
        progress(result.size);
      }
    }),
  );
  textIndex = result;
  return result;
}
