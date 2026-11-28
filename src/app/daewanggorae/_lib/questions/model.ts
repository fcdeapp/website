import { compiledEvidenceIndex } from "./compiledEvidence";
import type { Question } from "../types";
import { parseQuestionMedia } from "../questionMedia";
export type Option = { id: string; text: string };
export type TableData = {
  headers: string[];
  rows: (string | number | null)[][];
};
export type GraphData = {
  xLabel: string;
  yLabel: string;
  scale: "linear" | "log";
  domain: number[];
  series: { label: string; samples: number[][] }[];
};
export type Evidence = {
  id: string;
  type: string;
  templateId: string;
  templateVersion: string;
  assessmentRole: "required";
  data: unknown;
};
export type DisplayQuestion = {
  presentation?: import("./presentation").QuestionPresentation;
  id: string;
  revision: string;
  fingerprint: string;
  format: "legacy" | "v2";
  lessonId: string;
  prompt: string;
  leadIn: string;
  options: Option[];
  media?: Question["media"];
  evidence: Evidence[];
  profile: string;
  shell: string;
  responseType: string;
  classification: "source" | "unclassified";
  learningObjective?: string;
  review: { status: string; medicalExpertReviewed: boolean };
  verificationStatus: string;
};
export type Answer = {
  answer: string;
  explanation: string;
  optionRationales: Record<string, string>;
  media?: Question["media"];
};
export type Grade = Answer & {
  id: string;
  revision: string;
  fingerprint: string;
  selected: string;
  correct: boolean;
  source: "server" | "offline";
};
export const templates = Object.freeze({
  "F-T01@1.0.0": "관찰 및 검사 결과",
  "F-T02@1.0.0": "조건 비교",
  "F-T03@1.0.0": "시간에 따른 변화",
  "F-T04@1.0.0": "교차표",
  "F-E01@1.0.0": "실험 조건과 결과",
  "F-G01@1.0.0": "농도와 반응",
  "F-G05@1.0.0": "압력–용적 고리",
  "F-G04@1.0.0": "용적 비교",
  "F-D01@1.0.0": "교육용 조직 모식도",
  "F-D02@1.0.0": "경로 모식도",
});
function fail(message: string): never {
  console.warn("[question-contract]", message);
  throw new Error("문항 자료를 불러오지 못했습니다. 다시 시도해 주세요.");
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return fail("객체 형식");
  return value as Record<string, unknown>;
}
function text(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return fail("텍스트 형식");
  return value;
}
function options(raw: unknown): Option[] {
  if (!Array.isArray(raw) || raw.length < 2 || raw.length > 10)
    return fail("선지 수");
  const result = raw.map((x) => {
    const o = object(x);
    return { id: text(o.id), text: text(o.text) };
  });
  if (new Set(result.map((o) => o.id)).size !== result.length)
    fail("중복 선지 ID");
  return result;
}
export function validateEvidence(raw: unknown): Evidence {
  const e = object(raw);
  text(e.id);
  if (e.templateId !== e.type) {
    if (e.assessmentRole !== "required" || compiledEvidenceIndex(e as Evidence) === undefined)
      fail("지원하지 않는 자료 계약 또는 버전");
    return e as Evidence;
  }
  if (
    e.type !== e.templateId ||
    !Object.hasOwn(templates, `${e.templateId}@${e.templateVersion}`)
  )
    fail("지원하지 않는 자료 유형 또는 버전");
  if (e.assessmentRole !== "required") fail("지원하지 않는 자료 표시 단계");
  const d = object(e.data),
    type = String(e.type);
  if (["F-T01", "F-T02", "F-T03", "F-T04", "F-E01", "F-G04"].includes(type)) {
    if (
      !Array.isArray(d.headers) ||
      d.headers.length < 2 ||
      d.headers.length > 12 ||
      !d.headers.every((x) => typeof x === "string" && x.trim())
    )
      fail("표 머리행");
    const headers = d.headers as string[];
    if (!Array.isArray(d.rows) || !d.rows.length || d.rows.length > 100)
      fail("표 행");
    for (const row of d.rows as unknown[])
      if (
        !Array.isArray(row) ||
        row.length !== headers.length ||
        !row.every(
          (x) =>
            x === null ||
            typeof x === "string" ||
            (typeof x === "number" && Number.isFinite(x)),
        )
      )
        fail("표 열 대응 또는 값");
    if (type === "F-G04") {
      if (
        (!["환자", "시점"].includes(headers[0]) ||
        JSON.stringify(headers.slice(1)) !== JSON.stringify(["EDV (mL)", "ESV (mL)"]))
      )
        fail("막대그래프 축 프리셋");
      if (
        (d.rows as unknown[][]).length > 4 ||
        !(d.rows as unknown[][]).every((r) =>
          r.slice(1).every((v) => typeof v === "number" && v >= 0 && v <= 200),
        )
      )
        fail("막대그래프 범위");
    }
  } else if (type === "F-G01" || type === "F-G05") {
    const expected =
      type === "F-G01" ? [0.01, 10000, 0, 100] : [0, 150, 0, 160];
    if (
      JSON.stringify(d.domain) !== JSON.stringify(expected) ||
      d.scale !== (type === "F-G01" ? "log" : "linear")
    )
      fail("그래프 축 프리셋");
    const labels = type === "F-G01" ? ["A 농도 (상대단위, 로그)", "반응 (%)"] : ["좌심실 용적 (mL)", "좌심실 압력 (mmHg)"];
    if (d.xLabel !== labels[0] || d.yLabel !== labels[1]) fail("그래프 단위 프리셋");
    if (!Array.isArray(d.series) || !d.series.length || d.series.length > 4)
      fail("그래프 계열");
    for (const rawSeries of d.series as unknown[]) {
      const s = object(rawSeries);
      text(s.label);
      if (
        !Array.isArray(s.samples) ||
        s.samples.length < 2 ||
        s.samples.length > 2000
      )
        fail("그래프 좌표");
      for (const p of s.samples as unknown[])
        if (
          !Array.isArray(p) ||
          p.length !== 2 ||
          !p.every((x) => typeof x === "number" && Number.isFinite(x)) ||
          p[0] < expected[0] ||
          p[0] > expected[1] ||
          p[1] < expected[2] ||
          p[1] > expected[3] ||
          (d.scale === "log" && p[0] <= 0)
        )
          fail("그래프 좌표 범위");
    }
  } else if (type === "F-D01") {
    if (d.preset !== "follicle" || d.target !== "X") fail("조직 모식도 프리셋");
  } else if (type === "F-D02") {
    if (
      !Array.isArray(d.nodes) ||
      d.nodes.length < 2 ||
      d.nodes.length > 12 ||
      !d.nodes.every((x) => typeof x === "string" && x.length <= 120)
    )
      fail("경로 노드");
    const count = (d.nodes as unknown[]).length;
    if (
      !Array.isArray(d.edges) ||
      !d.edges.length ||
      !(d.edges as unknown[]).every(
        (e) =>
          Array.isArray(e) &&
          e.length === 2 &&
          e.every((n) => Number.isInteger(n) && n >= 0 && n < count) &&
          e[0] !== e[1],
      )
    )
      fail("경로 연결");
  }
  return e as unknown as Evidence;
}
export function LegacyQuestionAdapter(
  raw: unknown,
  revision: string,
  fingerprint: string,
): DisplayQuestion {
  const q = object(raw);
  if (q.kind !== "original_concept_question") fail("지원하지 않는 기존 문항 형식");
  const media = parseQuestionMedia(q.media);
  return {
    id: text(q.id),
    revision,
    fingerprint,
    format: "legacy",
    lessonId: text(q.lessonId),
    prompt: text(q.prompt),
    leadIn: "",
    options: options(q.options),
    media: media
      ? { ...media, items: media.items.filter((m) => m.stage === "question") }
      : undefined,
    evidence: [],
    profile: "unclassified",
    shell: "unclassified",
    responseType: "unclassified",
    classification: "unclassified",
    review: {
      status: String(q.verificationStatus || "draft"),
      medicalExpertReviewed: false,
    },
    verificationStatus: String(q.verificationStatus || "draft"),
  };
}
export function V2QuestionAdapter(
  raw: unknown,
  lessonId: string,
  fingerprint: string,
): DisplayQuestion {
  const q = object(raw),
    response = object(q.response),
    review = object(q.review);
  if (q.schemaVersion !== "2.0.0") fail("문항 스키마 버전");
  if (
    !["kmle", "basic-school", "clinical-school"].includes(String(q.profile)) ||
    !["SH01", "SH02", "SH03", "SH04"].includes(String(q.shell))
  )
    fail("출제 형식");
  // Only these response contracts occur in the reviewed release; do not guess A04/A05 semantics.
  if (!["A01", "A02", "A03"].includes(String(response.type)))
    fail("미지원 응답 형식");
  const choices = options(response.options);
  if (
    choices.length !== 5 ||
    choices.some((x, i) => x.id !== String.fromCharCode(65 + i))
  )
    fail("v2 선지 ID");
  if (
    review.status !== "candidate_awaiting_user_review" ||
    review.medicalExpertReviewed !== false
  )
    fail("후보 승인 상태 변경에는 별도 검토가 필요합니다");
  if (!Array.isArray(q.evidence) || !q.evidence.length) fail("자료 누락");
  const evidence = q.evidence.map(validateEvidence);
  if (new Set(evidence.map((e) => e.id)).size !== evidence.length)
    fail("중복 자료 ID");
  return {
    id: text(q.id),
    revision: text(q.revision),
    fingerprint,
    format: "v2",
    lessonId,
    prompt: text(q.stem),
    leadIn: text(q.leadIn),
    options: choices,
    evidence,
    profile: String(q.profile),
    shell: String(q.shell),
    responseType: String(response.type),
    classification: "source",
    learningObjective: text(q.learningObjective),
    review: { status: String(review.status), medicalExpertReviewed: false },
    verificationStatus: "editorial_draft_not_exam_validated",
  };
}
export function validateGrade(
  q: DisplayQuestion,
  selected: string,
  raw: unknown,
): Grade {
  const g = object(raw);
  if (
    g.id !== q.id ||
    g.revision !== q.revision ||
    g.fingerprint !== q.fingerprint ||
    g.selected !== selected ||
    !q.options.some((o) => o.id === g.answer) ||
    !q.options.some((o) => o.id === selected) ||
    g.correct !== (selected === g.answer)
  )
    fail("채점 버전 불일치");
  text(g.explanation);
  object(g.optionRationales);
  if (
    q.format === "v2" &&
    q.options.some(
      (o) =>
        typeof (g.optionRationales as Record<string, unknown>)[o.id] !==
        "string",
    )
  )
    fail("선지별 해설 누락");
  if (g.source !== "server" && g.source !== "offline") fail("채점 출처");
  parseQuestionMedia(g.media);
  return g as unknown as Grade;
}
export function attemptSnapshot(q: DisplayQuestion, g: Grade) {
  // Store original source, never generated image indices or mutable presentation.
  const source = {...q};
  delete source.presentation;
  return JSON.parse(
    JSON.stringify({ schemaVersion: 1, question: source, grading: g }),
  ) as { schemaVersion: 1; question: DisplayQuestion; grading: Grade };
}

export function profileLabel(profile: string): string {
  return ({kmle: "국시형", "basic-school": "기초의학 내신형", "clinical-school": "임상의학 내신형"} as Record<string,string>)[profile] || "";
}
export const optionLabel = (index: number) => ["①", "②", "③", "④", "⑤"][index] || String(index + 1);
