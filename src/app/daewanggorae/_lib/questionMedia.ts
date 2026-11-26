import type {
  QuestionMedia,
  QuestionMediaCollection,
} from "./schemas/question-media";

const fail = (): never => {
  throw new Error("문항 자료 형식을 읽을 수 없습니다. 콘텐츠를 확인해 주세요.");
};
const object = (v: unknown): Record<string, unknown> =>
  v !== null && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : fail();
const text = (v: unknown): v is string =>
  typeof v === "string" && v.trim().length > 0 && v.length <= 10000;
const id = (v: unknown): v is string =>
  text(v) && /^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(v) && v.length <= 240;
const list = (v: unknown, max: number): unknown[] =>
  Array.isArray(v) && v.length <= max ? v : fail();
function unique(items: unknown[], key: string) {
  const ids = items.map((item) => object(item)[key]);
  if (!ids.every(id) || new Set(ids).size !== ids.length) fail();
}
/** Unknown stages/types fail closed; never reveal explanation media by default. */
export function parseQuestionMedia(
  raw: unknown,
): QuestionMediaCollection | undefined {
  if (raw === undefined) return undefined;
  const media = object(raw);
  if (media.schemaVersion !== "1.0.0") fail();
  const items = list(media.items, 20);
  unique(items, "id");
  for (const item of items) {
    const m = object(item);
    if (m.stage !== "question" && m.stage !== "explanation") fail();
    if (m.caption !== undefined && !text(m.caption)) fail();
    if (m.sourceRefs !== undefined && !list(m.sourceRefs, 100).every(id))
      fail();
    if (m.type === "diagram") {
      if (!id(m.diagramRef)) fail();
    } else if (m.type === "anatomy3d") {
      if (!id(m.sceneRef) || !text(m.title)) fail();
    } else if (m.type === "table") {
      if (!text(m.title)) fail();
      const columns = list(m.columns, 12),
        rows = list(m.rows, 200);
      if (!columns.length || !rows.length) fail();
      unique(columns, "id");
      unique(rows, "id");
      for (const c of columns) {
        const column = object(c);
        if (
          !text(column.label) ||
          (column.unit !== undefined && !text(column.unit))
        )
          fail();
      }
      for (const r of rows) {
        const cells = list(object(r).cells, columns.length);
        if (
          cells.length !== columns.length ||
          !cells.every((v) =>
            typeof v === "string"
              ? v.length <= 10000
              : typeof v === "number" && Number.isFinite(v),
          )
        )
          fail();
      }
    } else fail();
  }
  return raw as QuestionMediaCollection;
}
export function mediaAtStage(
  media: QuestionMediaCollection | undefined,
  stage: QuestionMedia["stage"],
): QuestionMedia[] {
  return media?.items.filter((item) => item.stage === stage) || [];
}
