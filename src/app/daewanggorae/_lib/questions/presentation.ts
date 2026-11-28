export type QuestionNote = {
  kind: string;
  text: string;
  links?: { label: string; href: string }[];
};
export type QuestionPresentation = {
  displayStem: string;
  notes: QuestionNote[];
  evidenceMarkup: string[];
};
// Identical UTF-16 change detector to the source sidecar. Not a security hash.
export function presentationFingerprint(value: unknown): string {
  function canonical(v: unknown): string {
    if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']';
    if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canonical((v as Record<string, unknown>)[k])).join(',') + '}';
    return JSON.stringify(v) ?? 'null';
  }
  const text = canonical(value);
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) hash = Math.imul(hash ^ text.charCodeAt(i), 16777619) >>> 0;
  return `fnv1a32:${text.length}:${hash.toString(16).padStart(8, '0')}`;
}
export function safeNoteLink(href: string): boolean {
  if (!/^https:\/\//.test(href) || /[\u0000-\u0020<>"']/.test(href)) return false;
  try { const url = new URL(href); return !!url.hostname && !url.username && !url.password; } catch { return false; }
}

export async function questionPresentation(raw: unknown): Promise<QuestionPresentation | undefined> {
  if (!raw || typeof raw !== 'object') return;
  const q = raw as { id: string; revision: string; evidence: unknown[] };
  const { content } = await import('../content');
  const entries = await content.read<Record<string, {revision:string; fingerprint:string; index:number}>>('compiled/question-presentation-index.json');
  const entry = entries[q.id];
  if (!entry) return;
  if (entry.revision !== q.revision || entry.fingerprint !== presentationFingerprint(raw)) {
    console.warn('[question-presentation] Source mismatch; retaining original notices', q.id);
    return;
  }
  const record = await content.read<QuestionPresentation>('compiled/question-presentation/' + entry.index + '.json');
  if (!record.notes?.length || record.evidenceMarkup.length !== q.evidence.length) return;
  const { resolveImages } = await import('./compiledEvidence');
  return {...record, notes:record.notes.map(note => ({...note,links:note.links?.filter(l => safeNoteLink(l.href))})), evidenceMarkup:await Promise.all(record.evidenceMarkup.map(resolveImages))};
}
