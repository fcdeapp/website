import { BASE, getManifest, getCatalog, content } from "./content";
export const CACHE = "daewanggorae-web-v2";
export async function downloadSubject(
  subjectId: string,
  signal: AbortSignal,
  onProgress: (done: number, total: number) => void,
) {
  const [manifest, catalog] = await Promise.all([getManifest(), getCatalog()]);
  const subject = catalog.subjects.find((s) => s.id === subjectId);
  if (!subject) throw new Error("과목을 선택해 주세요.");
  const lessons = catalog.lessons.filter((l) => l.subjectId === subjectId);
  const paths = new Set([
    "compiled/catalog.json",
    ...lessons.map((l) => l.path),
    ...catalog.questions
      .filter((q) => q.subjectId === subjectId)
      .map((q) => q.path),
    ...Object.keys(manifest.files).filter(
      (p) => p.startsWith("diagrams/") || p === "references/references.json",
    ),
  ]);
  const revisions = await content.read<{candidates:{id:string;path:string}[]}>("compiled/question-revisions.json");
  const presentations = await content.read<Record<string,{index:number}>>("compiled/question-presentation-index.json");
  const questionIds=new Set(catalog.questions.filter(q=>q.subjectId===subjectId).map(q=>q.id));
  paths.add("compiled/question-revisions.json"); paths.add("compiled/question-presentation-index.json");
  for(const q of revisions.candidates) if(questionIds.has(q.id)) {
    paths.add(q.path);
    if(presentations[q.id])paths.add("compiled/question-presentation/"+presentations[q.id].index+".json");
  }
  // Evidence resources are small vectors and three shared source photos; answer-free.
  for(const path of Object.keys(manifest.files)) if(path.startsWith("compiled/question-evidence/") || path.startsWith("reader/")) paths.add(path);
  const cache = await caches.open(CACHE);
  let done = 0;
  onProgress(0, paths.size);
  for (const path of paths) {
    if (signal.aborted) throw new Error("다운로드를 취소했습니다.");
    const file = manifest.files[path];
    if (!file) throw new Error("콘텐츠 정보를 확인할 수 없습니다.");
    const url = BASE + "/content/" + file.file;
    const cached = await cache.match(url);
    if (!cached) {
      const r = await fetch(url, { signal });
      if (!r.ok) throw new Error("다운로드 실패. 저장된 자료는 유지됩니다.");
      const bytes = await r.arrayBuffer();
      const sha = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      )
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      if (bytes.byteLength !== file.bytes || sha !== file.sha256)
        throw new Error("콘텐츠 파일이 손상되었습니다.");
      await cache.put(
        url,
        new Response(bytes, {
          headers: {
            "Content-Type":
              file.kind === ".json" ? "application/json" : "text/plain",
          },
        }),
      );
    }
    onProgress(++done, paths.size);
  }
}

// Next client navigation requests RSC rather than a full document. Keep the
// visited document and already loaded chunks so a later offline reload works.
export async function cacheVisitedPage(signal: AbortSignal) {
  const cache = await caches.open(CACHE);
  const page = location.pathname + location.search;
  if (!page.startsWith("/daewanggorae/")) return;
  const response = await fetch(page, {
    headers: { Accept: "text/html" },
    signal,
  });
  if (
    response.ok &&
    response.headers.get("content-type")?.includes("text/html")
  )
    await cache.put(page, response);
  const urls = new Set(
    performance
      .getEntriesByType("resource")
      .map((entry) => entry.name)
      .filter((name) => {
        const url = new URL(name);
        return (
          url.origin === location.origin &&
          url.pathname.startsWith("/_next/static/")
        );
      }),
  );
  for (const url of urls) {
    if (signal.aborted) return;
    if (await cache.match(url)) continue;
    const r = await fetch(url, { signal });
    if (r.ok) await cache.put(url, r);
  }
}
