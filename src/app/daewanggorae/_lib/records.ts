export type RecordKind =
  | "progress"
  | "attempt"
  | "bookmark"
  | "highlight"
  | "note"
  | "review"
  | "goal"
  | "reading"
  | "preference";
export type LearningRecord = {
  id: string;
  kind: RecordKind;
  updatedAt: number;
  deleted?: boolean;
  data: Record<string, unknown>;
};
export type Records = Record<string, LearningRecord>;
export type StorageDriver = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
};
export function mergeRecords(a: Records, b: Records): Records {
  const merged = { ...a };
  for (const [key, record] of Object.entries(b)) {
    if (key !== record.id) continue;
    const prev = merged[key];
    if (
      !prev ||
      record.updatedAt > prev.updatedAt ||
      (record.updatedAt === prev.updatedAt &&
        JSON.stringify(record) > JSON.stringify(prev))
    )
      merged[key] = record;
  }
  return merged;
}
export class LearningStore {
  private records: Records = {};
  private listeners = new Set<() => void>();
  private queue: Promise<void> = Promise.resolve();
  private scope = "guest";
  private generation = 0;
  constructor(
    private driver: StorageDriver,
    private prefix = "com.fcde.daewanggorae.v1",
  ) {}
  snapshot = () => this.records;
  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };
  private notify() {
    this.listeners.forEach((f) => f());
  }
  async switchAccount(scope: string) {
    const generation = ++this.generation;
    await this.queue;
    this.scope = scope;
    const raw = await this.driver.getItem(this.prefix + ":" + scope);
    if (generation !== this.generation) return;
    this.records = raw ? JSON.parse(raw) : {};
    this.notify();
  }
  async put(record: LearningRecord) {
    return this.merge({ [record.id]: record });
  }
  async merge(incoming: Records) {
    const scope = this.scope;
    const generation = this.generation;
    const job = this.queue
      .catch(() => {})
      .then(async () => {
        if (generation !== this.generation)
          throw new Error("학습 계정이 변경되었습니다. 다시 시도해 주세요.");
        const merged = mergeRecords(this.records, incoming);
        await this.driver.setItem(
          this.prefix + ":" + scope,
          JSON.stringify(merged),
        );
        this.records = merged;
        this.notify();
      });
    this.queue = job.catch(() => {});
    return job;
  }
  async guestRecords(): Promise<Records> {
    return JSON.parse(
      (await this.driver.getItem(this.prefix + ":guest")) || "{}",
    );
  }
  async erase() {
    await this.queue;
    await this.driver.setItem(this.prefix + ":" + this.scope, "{}");
    this.records = {};
    this.notify();
  }
}
export function gradeQuestion(
  q: { answer: string; options: { id: string }[] },
  selected: string,
): boolean {
  if (!q.options.some((o) => o.id === selected))
    throw new Error("유효한 선지를 선택해 주세요.");
  return q.answer === selected;
}
export function nextReview(
  previous: { interval?: number; repetitions?: number },
  quality: "again" | "hard" | "good",
  now = Date.now(),
) {
  const repetitions = quality === "again" ? 0 : (previous.repetitions || 0) + 1;
  const interval =
    quality === "again"
      ? 1
      : quality === "hard"
        ? Math.max(1, Math.round((previous.interval || 1) * 1.2))
        : repetitions === 1
          ? 1
          : repetitions === 2
            ? 3
            : Math.round((previous.interval || 3) * 2.3);
  return { interval, repetitions, due: now + interval * 86400000 };
}
export function latestAttempts(records: Records) {
  const result: Record<string, LearningRecord> = {};
  for (const r of Object.values(records))
    if (r.kind === "attempt" && !r.deleted) {
      const id = String(r.data.questionId);
      if (!result[id] || result[id].updatedAt < r.updatedAt) result[id] = r;
    }
  return result;
}
