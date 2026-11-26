"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getCatalog, getManifest } from "../_lib/content";
import { useLoad } from "../_lib/hooks";
import { saveRecord, useRecords } from "../_lib/store";
import { CACHE, downloadSubject } from "../_lib/offline";
import { Heading, Select, State, url } from "../_components/UI";
import s from "../daewanggorae.module.css";
export default function Settings() {
  const records = useRecords(),
    settings = records["preference:settings"]?.data || {};
  const r = useLoad(
    async () => ({
      catalog: await getCatalog(),
      manifest: await getManifest(),
    }),
    "settings",
  );
  const [subject, setSubject] = useState(""),
    [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState([0, 0]),
    [storage, setStorage] = useState(""),
    [clear, setClear] = useState(false);
  const abort = useRef<AbortController | null>(null);
  useEffect(() => {
    void navigator.storage
      ?.estimate()
      .then((x) =>
        setStorage(
          `${Math.round((x.usage || 0) / 1e6)} MB 사용 / 약 ${Math.round((x.quota || 0) / 1e6)} MB 사용 가능`,
        ),
      );
    return () => abort.current?.abort();
  }, []);
  const save = (data: Record<string, unknown>) =>
    void saveRecord("preference", "settings", { ...settings, ...data }).catch(
      (e) => setStatus(String(e)),
    );
  return (
    <>
      <Heading title="설정" />
      <div className={s.columns}>
        <section>
          <h2>화면</h2>
          <div className={s.filters}>
            <Select
              label="화면 모드"
              value={String(settings.theme || "system")}
              onChange={(theme) => save({ theme })}
              options={[
                { id: "system", title: "기기 설정 따르기" },
                { id: "light", title: "밝은 화면" },
                { id: "dark", title: "어두운 화면" },
              ]}
            />
            <Select
              label="본문 글자 크기"
              value={String(settings.fontScale || 1)}
              onChange={(v) => save({ fontScale: Number(v) })}
              options={[0.9, 1, 1.1, 1.2, 1.35].map((n) => ({
                id: String(n),
                title: Math.round(n * 100) + "%",
              }))}
            />
          </div>
          <h2>서비스 안내</h2>
          <p className={s.notice}>
            본 서비스는 의학 교육 및 학습을 목적으로 제공됩니다. 질병의 진단,
            처치, 치료 또는 예방을 위한 의료기기가 아니며, 실제 의료적 판단을
            대체하지 않습니다.
          </p>
          <div className={s.actions}>
            <Link className={s.button} href={url("sources")}>
              출처와 라이선스
            </Link>
            <Link className={s.button} href={url("terms")}>
              이용약관
            </Link>
            <Link className={s.button} href={url("terms") + "?kind=privacy"}>
              개인정보 처리방침
            </Link>
          </div>
        </section>
        <section>
          <h2>콘텐츠와 저장 공간</h2>
          {r.data ? (
            <>
              <p className={s.muted}>콘텐츠 {r.data.manifest.version}</p>
              <Select
                label="오프라인으로 보관할 과목"
                value={subject}
                onChange={setSubject}
                options={[
                  { id: "", title: "과목 선택" },
                  ...r.data.catalog.subjects,
                ]}
              />
              <div className={s.actions}>
                <button
                  disabled={!subject || busy}
                  onClick={() => {
                    const controller = new AbortController();
                    abort.current = controller;
                    setBusy(true);
                    setStatus("");
                    void downloadSubject(subject, controller.signal, (a, b) =>
                      setProgress([a, b]),
                    )
                      .then(() => setStatus("과목 자료를 저장했습니다."))
                      .catch((e) =>
                        setStatus(
                          controller.signal.aborted
                            ? "다운로드를 취소했습니다."
                            : String(e),
                        ),
                      )
                      .finally(() => setBusy(false));
                  }}
                >
                  과목 자료 저장
                </button>
                {busy && (
                  <button onClick={() => abort.current?.abort()}>
                    다운로드 취소
                  </button>
                )}
              </div>
              {progress[1] > 0 && (
                <p role="status">
                  {progress[0]} / {progress[1]} 파일
                </p>
              )}
              <p className={s.notice}>
                한 번 방문한 화면과 열어 본 자료는 오프라인에서 다시 볼 수
                있습니다. 처음 여는 화면이나 3D 모델에는 연결이 필요합니다.
                브라우저가 저장 공간을 정리하면 다시 다운로드해야 합니다.
              </p>
              <p className={s.muted}>{storage}</p>
              <button disabled={busy} onClick={() => setClear(!clear)}>
                콘텐츠 캐시 비우기
              </button>
              {clear && (
                <>
                  <p className={s.notice}>
                    저장한 교과서와 3D 자료를 지웁니다. 학습 기록·북마크·메모는
                    유지됩니다.
                  </p>
                  <button
                    onClick={() =>
                      void caches
                        .delete(CACHE)
                        .then(() => {
                          setClear(false);
                          setStatus("콘텐츠 캐시를 비웠습니다.");
                        })
                        .catch((e) => setStatus(String(e)))
                    }
                  >
                    확인하고 캐시 삭제
                  </button>
                </>
              )}
            </>
          ) : (
            <State error={r.error} retry={r.retry} />
          )}
        </section>
      </div>
      {status && (
        <p role="status" className={s.notice}>
          {status}
        </p>
      )}
    </>
  );
}
