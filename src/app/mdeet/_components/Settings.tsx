"use client";
import { useState } from "react";
import { useLearning } from "./Workspace";
import { Heading, Field } from "./UI";
import { emptyStore, parseStore } from "../_lib/storage";
import { STORAGE_KEY, localDate } from "../_lib/constants";
import type { Store } from "../_lib/types";
import s from "../mdeet.module.css";
function download(content: string, name: string) {
  const url = URL.createObjectURL(
    new Blob([content], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function Settings() {
  const { store, update, replace, questions, units, storageError } =
    useLearning();
  const [imported, setImported] = useState<Store | null>(null);
  const [message, setMessage] = useState("");
  const [reset, setReset] = useState(false);
  async function read(file?: File) {
    if (!file) return;
    setImported(null);
    try {
      if (file.size > 15_000_000)
        throw new Error("15MB 이하 파일을 선택하세요.");
      const parsed = parseStore(
        await file.text(),
        new Set(questions.map((q) => q.id)),
        new Set(units.map((u) => u.id)),
      );
      setImported(parsed);
      setMessage("파일을 검증했습니다. 아래에서 교체 여부를 확인하세요.");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "기록 파일을 읽을 수 없습니다.",
      );
    }
  }
  return (
    <>
      <Heading
        title="설정"
        description="화면 표시와 이 브라우저의 학습 기록을 관리합니다."
      />
      <section className={s.section}>
        <h2>학습 환경</h2>
        <div className={s.formGrid}>
          <Field label="UI 글자 크기">
            <select
              value={store.settings.fontSize}
              onChange={(e) =>
                update((st) => ({
                  ...st,
                  settings: {
                    ...st.settings,
                    fontSize: Number(e.target.value),
                  },
                }))
              }
            >
              {[12, 13, 14, 15, 16, 18, 20].map((n) => (
                <option key={n} value={n}>
                  {n}px
                </option>
              ))}
            </select>
          </Field>
          <Field label="문제 기본 확대 비율">
            <select
              value={store.settings.zoom}
              onChange={(e) =>
                update((st) => ({
                  ...st,
                  settings: { ...st.settings, zoom: Number(e.target.value) },
                }))
              }
            >
              {[75, 100, 125, 150, 175, 200].map((n) => (
                <option key={n} value={n}>
                  {n}%
                </option>
              ))}
            </select>
          </Field>
          <Field label="맞춤 풀이 기본 채점">
            <select
              value={store.settings.grading}
              onChange={(e) =>
                update((st) => ({
                  ...st,
                  settings: {
                    ...st.settings,
                    grading: e.target.value as "end" | "immediate",
                  },
                }))
              }
            >
              <option value="end">종료 후 채점</option>
              <option value="immediate">즉시 채점</option>
            </select>
          </Field>
        </div>
      </section>
      <section className={s.section}>
        <h2>기록 백업</h2>
        <p>
          기록은 계정 서버가 아닌 현재 브라우저에 저장됩니다. 다른 기기로
          옮기거나 브라우저 데이터를 지우기 전에 JSON 파일로 내보내세요.
        </p>
        <p className={s.muted}>
          풀이 {store.attempts.length}회 · 세션 {store.sessions.length}개 · 암기
          카드 {store.cards.length}개 · 일정 {store.plans.length}개
        </p>
        <div className={s.actions}>
          <button
            onClick={() =>
              download(
                JSON.stringify(store, null, 2),
                `mdeet-learning-${localDate()}.json`,
              )
            }
          >
            학습 기록 내보내기
          </button>
          {storageError && (
            <button
              onClick={() => {
                try {
                  download(
                    localStorage.getItem(STORAGE_KEY) || "{}",
                    `mdeet-original-${localDate()}.json`,
                  );
                } catch {
                  setMessage("브라우저 저장소에 접근할 수 없습니다.");
                }
              }}
            >
              저장소 원본 내보내기
            </button>
          )}
        </div>
        <Field label="학습 기록 가져오기 (JSON)">
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => void read(e.target.files?.[0])}
          />
        </Field>
        <p role="status">{message}</p>
        {imported && (
          <div className={s.confirmBox}>
            <h3>현재 기록을 가져온 기록으로 교체할까요?</h3>
            <p>
              가져올 기록: 풀이 {imported.attempts.length}회, 카드{" "}
              {imported.cards.length}개. 기존 기록과 병합하지 않습니다.
            </p>
            <div className={s.actions}>
              <button onClick={() => setImported(null)}>취소</button>
              <button
                className={s.primary}
                onClick={() => {
                  replace(imported);
                  setImported(null);
                  setMessage(
                    "가져온 기록을 적용했습니다. 저장 오류가 표시되면 현재 기록을 내보내세요.",
                  );
                }}
              >
                기록 교체
              </button>
            </div>
          </div>
        )}
      </section>
      <section className={s.section}>
        <h2>학습 기록 초기화</h2>
        <p>기출문제 원본과 기존 Abrody 데이터에는 영향을 주지 않습니다.</p>
        {!reset ? (
          <button className={s.dangerButton} onClick={() => setReset(true)}>
            초기화
          </button>
        ) : (
          <div className={s.confirmBox} role="alert">
            <p>
              MDEET 풀이 기록, 메모, 카드, 일정과 설정을 모두 지울까요?
              되돌리려면 백업 파일이 필요합니다.
            </p>
            <div className={s.actions}>
              <button onClick={() => setReset(false)}>취소</button>
              <button
                className={s.dangerButton}
                onClick={() => {
                  replace(emptyStore());
                  setReset(false);
                  setMessage("학습 기록을 초기화했습니다.");
                }}
              >
                모든 학습 기록 초기화
              </button>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
