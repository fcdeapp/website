import { authenticated, currentUser } from "./auth";
import { study } from "./store";
import type { LearningRecord, Records } from "./records";
let pending: Promise<void> | null = null;
const acknowledged = new Map<string, Map<string, string>>();
export function sync() {
  if (pending) return pending;
  const user = currentUser();
  if (!user) return Promise.reject(new Error("로그인이 필요합니다."));
  pending = (async () => {
    const known = acknowledged.get(user.id) || new Map<string, string>();
    const local = Object.values(study.snapshot()).filter(
      (r) => known.get(r.id) !== JSON.stringify(r),
    );
    for (let i = 0; i < local.length; i += 20) {
      if (currentUser()?.id !== user.id)
        throw new Error("계정이 변경되었습니다.");
      const batch = local.slice(i, i + 20);
      await authenticated<{ records: LearningRecord[] }>(
        "/v1/records",
        { records: batch },
        "PUT",
      );
    }
    const remote = (
      await authenticated<{ records: LearningRecord[] }>("/v1/records")
    ).records;
    if (currentUser()?.id !== user.id)
      throw new Error("계정이 변경되었습니다.");
    const incoming: Records = {};
    for (const r of remote) incoming[r.id] = r;
    await study.merge(incoming);
    // A write made during this request is not acknowledged until the next successful sync.
    for (const r of remote) known.set(r.id, JSON.stringify(r));
    acknowledged.set(user.id, known);
  })().finally(() => {
    pending = null;
  });
  return pending;
}
// Only called from the explicit merge action in Account. Guest records remain intact.
export async function importGuest() {
  if (!currentUser()) throw new Error("먼저 로그인해 주세요.");
  await study.merge(await study.guestRecords());
  await sync();
}
