import { ContentRepository, safePath } from "./repository";
import type {
  Catalog,
  Lesson,
  Question,
  Scene,
  Concept,
  SearchIndex,
} from "./types";
import { parseQuestionMedia } from "./questionMedia";
export const BASE = "/daewanggorae/runtime";
export type Manifest = {
  version: string;
  fingerprint: string;
  files: Record<
    string,
    { file: string; sha256: string; bytes: number; kind: string }
  >;
};
let manifestTask: Promise<Manifest> | undefined;
export function getManifest() {
  return (manifestTask ||= fetch(BASE + "/manifest.json")
    .then((r) => {
      if (!r.ok) throw new Error("콘텐츠 목록을 불러오지 못했습니다.");
      return r.json() as Promise<Manifest>;
    })
    .catch((e) => {
      manifestTask = undefined;
      throw e;
    }));
}
export async function fileURL(path: string) {
  safePath(path);
  const file = (await getManifest()).files[path];
  if (!file) throw new Error("아직 준비되지 않은 자료입니다.");
  return BASE + "/content/" + safePath(file.file);
}
export async function readText(path: string) {
  const response = await fetch(await fileURL(path));
  if (!response.ok)
    throw new Error("자료를 불러오지 못했습니다. 다시 시도해 주세요.");
  return response.text();
}
export const content = new ContentRepository({ readText }, 32);
export const getCatalog = () => content.read<Catalog>("compiled/catalog.json");
export const getSearchIndex = () =>
  content.read<SearchIndex>("compiled/search.json");
export const getConcepts = () =>
  content.read<Record<string, Concept>>("anatomy/concepts.json");
export async function getLesson(id: string) {
  const e = (await getCatalog()).lessons.find((x) => x.id === id);
  if (!e) throw new Error("학습 단원을 찾을 수 없습니다.");
  return content.read<Lesson>(e.path);
}
export async function getQuestion(id: string) {
  const e = (await getCatalog()).questions.find((x) => x.id === id);
  if (!e) throw new Error("문항을 찾을 수 없습니다.");
  const q = await content.read<Question>(e.path);
  parseQuestionMedia(q.media);
  return q;
}
export async function getScene(id: string) {
  const e = (await getCatalog()).scenes.find((x) => x.id === id);
  if (!e) throw new Error("학습 장면을 찾을 수 없습니다.");
  return content.read<Scene>(e.path);
}
export type ModelIndex = Record<
  string,
  {
    id: string;
    file: string;
    sha256: string;
    elementId: string;
    conceptIds: string[];
    bytes: number;
    bounds: { min: number[]; max: number[] };
    originalPath: string;
  }
>;
export const getModels = () => content.read<ModelIndex>("compiled/models.json");
