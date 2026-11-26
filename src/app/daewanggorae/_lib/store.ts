"use client";
import { useSyncExternalStore } from "react";
import { LearningStore, type RecordKind, type Records } from "./records";
const empty: Records = {};
export const study = new LearningStore(
  {
    getItem: async (k) => localStorage.getItem(k),
    setItem: async (k, v) => localStorage.setItem(k, v),
  },
  "com.fcde.daewanggorae.web.v1",
);
export const useRecords = () =>
  useSyncExternalStore(study.subscribe, study.snapshot, () => empty);
export const recordsOf = (r: Records, kind: RecordKind) =>
  Object.values(r).filter((x) => x.kind === kind && !x.deleted);
export const saveRecord = (
  kind: RecordKind,
  id: string,
  data: Record<string, unknown>,
  deleted = false,
) =>
  study.put({
    id: kind + ":" + id,
    kind,
    data,
    deleted,
    updatedAt: Date.now(),
  });
export const createRecord = (kind: RecordKind, data: Record<string, unknown>) =>
  saveRecord(kind, crypto.randomUUID(), data);
