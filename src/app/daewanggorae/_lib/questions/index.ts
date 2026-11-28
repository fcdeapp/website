import { prepareEvidence } from "./compiledEvidence";
import { questionPresentation } from "./presentation";
import { content, getQuestion } from "../content";
import { API as API_URL } from "../auth";
import {
  DisplayQuestion,
  LegacyQuestionAdapter,
  V2QuestionAdapter,
  validateGrade,
} from "./model";

export type CandidateEntry = {
  id: string;
  revision: string;
  fingerprint: string;
  path: string;
  title: string;
  lessonId: string;
};
type RevisionIndex = {
  version: string;
  legacy: Record<
    string,
    { revision: string; fingerprint: string; lessonId: string }
  >;
  candidates: CandidateEntry[];
  preferred: Record<string, string>;
};
export const getQuestionRevisions = () =>
  content.read<RevisionIndex>("compiled/question-revisions.json");
export async function loadQuestion(
  id: string,
  revision?: string,
): Promise<DisplayQuestion> {
  const index = await getQuestionRevisions();
  revision ||= index.preferred?.[id];
  if (revision && revision !== index.legacy[id]?.revision) {
    const candidate = index.candidates.find(
      (q) => q.id === id && q.revision === revision,
    );
    if (!candidate)
      throw new Error(
        "요청한 문항 버전이 없습니다. 문제은행에서 다시 선택해 주세요.",
      );
    const raw = await content.read(candidate.path);
    const q = V2QuestionAdapter(raw, candidate.lessonId, candidate.fingerprint);
    await prepareEvidence(q.evidence);
    return {...q, presentation: await questionPresentation(raw)};
  }
  const meta = index.legacy[id];
  if (!meta) throw new Error("문항 버전을 찾을 수 없습니다.");
  return LegacyQuestionAdapter(
    await getQuestion(id),
    meta.revision,
    meta.fingerprint,
  );
}
export async function submitQuestion(
  q: DisplayQuestion,
  selected: string,
  offline = false,
) {
  if (!q.options.some((o) => o.id === selected))
    throw new Error("선지를 선택해 주세요.");
  if (offline) throw new Error("채점과 해설을 보려면 인터넷에 연결해 주세요.");
  const controller = new AbortController(),
    timer = setTimeout(() => controller.abort(), 12000);
  try {
    const r = await fetch(API_URL + "/questions/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: q.id,
        revision: q.revision,
        fingerprint: q.fingerprint,
        selected,
      }),
      signal: controller.signal,
    });
    if (!r.ok)
      throw new Error(
        r.status === 409
          ? "서버와 문항 버전이 다릅니다. 콘텐츠를 업데이트한 뒤 다시 시도해 주세요."
          : "채점 서버에 연결하지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
      );
    return validateGrade(q, selected, await r.json());
  } catch (e) {
    if (e instanceof Error && e.message.includes("문항")) throw e;
    throw new Error(
      "채점 서버에 연결하지 못했습니다. 네트워크 연결을 확인한 뒤 다시 시도해 주세요.",
    );
  } finally {
    clearTimeout(timer);
  }
}
