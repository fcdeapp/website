import contracts from './generated/question-evidence-contracts.json';
import { content } from '../content';
import type { Evidence } from './model';
function canonical(value: unknown): unknown {
  if (typeof value === 'number' && !Number.isFinite(value)) throw new Error('Non-finite evidence coordinate');
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical((value as Record<string, unknown>)[key])]));
  return value;
}
export function compiledEvidenceIndex(e: Evidence): number | undefined {
  const key = JSON.stringify(canonical({ type:e.type, templateId:e.templateId, templateVersion:e.templateVersion, data:e.data }));
  const registry: Record<string, number> = contracts;
  return Object.hasOwn(registry, key) ? registry[key] : undefined;
}
const fragments = new Map<number, string>();
export async function resolveImages(html: string): Promise<string> {
  for (const match of [...html.matchAll(/dwg-image:(\d+)/g)]) {
    const uri = await content.read<string>('compiled/question-evidence/image-' + match[1] + '.json');
    if (!/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(uri)) throw new Error('자료 이미지를 확인할 수 없습니다.');
    html = html.replaceAll(match[0], uri);
  }
  return html;
}
export async function prepareEvidence(items: Evidence[]) {
  await Promise.all(items.map(async e => {
    const index = compiledEvidenceIndex(e);
    if (index === undefined || fragments.has(index)) return;
    const html = await resolveImages(await content.read<string>('compiled/question-evidence/' + index + '.json'));
    fragments.set(index, html);
    // Only a bounded working set, not every question's image, stays in memory.
    if (fragments.size > 64) fragments.delete(fragments.keys().next().value!);
  }));
}
export function renderCompiledEvidence(e: Evidence): string {
  const index = compiledEvidenceIndex(e);
  const html = index === undefined ? undefined : fragments.get(index);
  if (html === undefined) throw new Error('문항 자료를 다시 불러와 주세요.');
  return html;
}
