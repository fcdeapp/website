export function safePath(path: string): string {
  if (
    !path ||
    path.length > 512 ||
    /[\\\x00?#%:]/.test(path) ||
    path.startsWith("/") ||
    path.split("/").some((p) => p === ".." || p === "." || !p)
  )
    throw new Error("허용되지 않은 콘텐츠 경로입니다.");
  return path;
}
export interface Adapter {
  readText(path: string): Promise<string>;
}
export class ContentRepository {
  private cache = new Map<string, unknown>();
  private pending = new Map<string, Promise<unknown>>();
  constructor(
    private adapter: Adapter,
    private limit = 24,
  ) {}
  read<T>(path: string): Promise<T> {
    safePath(path);
    if (this.cache.has(path)) {
      const v = this.cache.get(path);
      this.cache.delete(path);
      this.cache.set(path, v);
      return Promise.resolve(v as T);
    }
    const pending = this.pending.get(path);
    if (pending) return pending as Promise<T>;
    const task = this.adapter
      .readText(path)
      .then((text) => {
        const v: unknown = JSON.parse(text);
        this.cache.set(path, v);
        while (this.cache.size > this.limit)
          this.cache.delete(this.cache.keys().next().value!);
        return v;
      })
      .finally(() => this.pending.delete(path));
    this.pending.set(path, task);
    return task as Promise<T>;
  }
  clear() {
    this.cache.clear();
  }
}
export function searchIndex(
  index: import("./types").SearchIndex,
  query: string,
  limit = 80,
) {
  const q = query.toLocaleLowerCase().trim();
  if (!q) return [];
  const terms = q.split(/\s+/);
  let candidates: Set<number> | undefined;
  for (const term of terms)
    for (let i = 0; i <= term.length - 3; i++) {
      const ids = index.postings[term.slice(i, i + 3)] || [];
      candidates = candidates
        ? new Set(ids.filter((id) => candidates!.has(id)))
        : new Set(ids);
      if (!candidates.size) return [];
    }
  return [...(candidates || index.documents.map((_, i) => i))]
    .map((i) => index.documents[i])
    .filter((d) =>
      terms.every((t) =>
        (d.title + " " + d.text).toLocaleLowerCase().includes(t),
      ),
    )
    .sort(
      (a, b) =>
        Number(b.title.toLocaleLowerCase().includes(q)) -
        Number(a.title.toLocaleLowerCase().includes(q)),
    )
    .slice(0, limit);
}
