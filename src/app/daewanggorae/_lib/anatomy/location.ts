import type { Concept, Scene } from "../types";
import type { ModelIndex } from "../content";
export type LocationOption = { id: string; title: string; modelIds: string[]; focusIds: string[]; bounds: Scene["bounds"] };
export function uniqueModels(ids: string[], models: ModelIndex): string[] {
  return [...new Map(ids.filter((id) => models[id]).map((id) => [models[id].elementId, id])).values()];
}
/** Real PART-OF model membership only. IS-A classification is not a spatial container. */
export function locationOptions(focus: string[], concepts: Record<string, Concept>, models: ModelIndex, baseIds: string[]): LocationOption[] {
  const base = uniqueModels(baseIds, models);
  const canonical = new Map(base.map((id) => [models[id].elementId, id]));
  const focusElements = new Set(focus.flatMap((id) => Object.values(concepts[id]?.meshes || {}).flat())
    .filter((id) => models[id]).map((id) => models[id].elementId));
  if (!focusElements.size) return [];
  const candidates: LocationOption[] = [];
  const signatures = new Set<string>();
  const ordered = Object.values(concepts).map((c) => ({ c, ids: uniqueModels(c.meshes.partof || [], models) }))
    .filter(({ ids }) => ids.length > focusElements.size && ids.length <= 600)
    .sort((a, b) => a.ids.length - b.ids.length || a.c.id.localeCompare(b.c.id));
  for (const { c, ids } of ordered) {
    const elements = new Set(ids.map((id) => models[id].elementId));
    if (![...focusElements].every((id) => elements.has(id))) continue;
    const modelIds = ids.map((id) => canonical.get(models[id].elementId) || id);
    const all = uniqueModels([...base, ...modelIds], models);
    if (all.length > 600 || all.reduce((n, id) => n + models[id].bytes, 0) > 80_000_000) continue;
    const signature = [...elements].sort().join(",");
    if (signatures.has(signature)) continue;
    signatures.add(signature);
    candidates.push({ id: c.id, title: c.nameKo || c.nameEn, modelIds,
      focusIds: modelIds.filter((id) => focusElements.has(models[id].elementId)),
      bounds: {
        min: [0, 1, 2].map((a) => Math.min(...modelIds.map((id) => models[id].bounds.min[a]))) as [number, number, number],
        max: [0, 1, 2].map((a) => Math.max(...modelIds.map((id) => models[id].bounds.max[a]))) as [number, number, number],
      },
    });
  }
  if (!candidates.length) return [];
  // Alternate anatomical groupings can overlap without containing one another.
  // A range control must walk nested containers, not jump between such groups.
  const anchor = initialLocation(candidates);
  const chain = [candidates[anchor]];
  let contained = new Set(chain[0].modelIds);
  for (let i = anchor - 1; i >= 0; i--) {
    if (candidates[i].modelIds.every((id) => contained.has(id))) {
      chain.unshift(candidates[i]);
      contained = new Set(candidates[i].modelIds);
    }
  }
  let previous = candidates[anchor];
  for (let i = anchor + 1; i < candidates.length; i++) {
    const larger = new Set(candidates[i].modelIds);
    if (previous.modelIds.every((id) => larger.has(id))) {
      chain.push(candidates[i]);
      previous = candidates[i];
    }
  }
  return chain;
}
export function initialLocation(options: LocationOption[]): number {
  // Prefer enough surrounding anatomy to make location legible, without jumping to the entire body.
  const n = options.findIndex((o) => o.modelIds.length - o.focusIds.length >= Math.max(8, Math.ceil(o.focusIds.length / 4)));
  return n < 0 ? 0 : n;
}
