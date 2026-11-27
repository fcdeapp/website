"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useLoad } from "../_lib/hooks";
import { content, getManifest, readText } from "../_lib/content";
import { policies } from "../_lib/auth";
import copyright from "../_lib/copyright.ko.json";
import bundledPolicies from "../_lib/policies.ko.json";
import { Text } from "../_components/Text";
import { Heading, State, url } from "../_components/UI";
import s from "../daewanggorae.module.css";
export function Terms() {
  const params = useSearchParams(),
    kind = params.get("kind") === "copyright" ? "copyright" : params.get("kind") === "privacy" ? "privacy" : "terms";
  const r = useLoad(policies, "policies"),
    current = kind === "copyright" ? copyright : r.data?.data[kind];
  const [previousVersion, setPreviousVersion] = useState<string>();
  const history = kind === "copyright" ? [] : (r.data?.data.previous || bundledPolicies.previous)
    .map((revision) => revision[kind]).filter((revision) => revision.version !== current?.version);
  const p = history.find((revision) => revision.version === previousVersion) || current;
  return (
    <div className={s.legal}>
      <Heading
        title={p?.title || (kind === "privacy" ? "개인정보 처리방침" : "이용약관")}
        detail={p ? (p !== current ? "이전 버전 · " : "") + "시행일 " + p.effectiveDate + " · " + p.version : undefined}
      />
      <div className={s.actions}>
        <Link className={s.button} href={url("terms")}>
          이용약관
        </Link>
        <Link className={s.button} href={url("terms") + "?kind=privacy"}>
          개인정보 처리방침
        </Link>
        <Link className={s.button} href={url("terms") + "?kind=copyright"}>저작권 및 이용 안내</Link>
      </div>
      {history.length > 0 && <div className={s.actions}>
        <button onClick={() => setPreviousVersion(undefined)}>현재 약관</button>
        {history.map((revision) => <button key={revision.version} onClick={() => setPreviousVersion(revision.version)}>이전 버전 {revision.version}</button>)}
      </div>}
      {kind !== "copyright" && r.data?.offline && (
        <div className={s.notice}>
          저장된 약관입니다. 연결 후 최신 내용을 확인해 주세요.{" "}
          <button onClick={r.retry}>최신 약관 확인</button>
        </div>
      )}
      <a href={kind === "privacy" ? "mailto:dpo@fcde.app" : "mailto:support@fcde.app"}>
        {kind === "privacy" ? "개인정보 문의" : "서비스·저작권 문의"}
      </a>
      {p ? (
        p.sections.map((x) => (
          <section key={x.title}>
            <h2>{x.title}</h2>
            <p>{x.body}</p>
          </section>
        ))
      ) : (
        <State error={r.error} retry={r.retry} />
      )}
    </div>
  );
}
type Reference = {
  id: string;
  title: string;
  url?: string;
  reuseLicense?: string;
};
export function Sources() {
  const params = useSearchParams(),
    id = params.get("id");
  const r = useLoad(async () => {
    const m = await getManifest();
    const paths = Object.keys(m.files).filter((p) =>
      p.endsWith("references.json"),
    );
    const refs: Reference[] = [];
    for (const p of paths) {
      const raw = await content.read<unknown>(p);
      const values = Array.isArray(raw)
        ? raw
        : (raw as { references?: unknown[] }).references ||
          Object.values(raw as object);
      for (const value of values)
        if (
          value &&
          typeof value === "object" &&
          "id" in value &&
          "title" in value
        )
          refs.push(value as Reference);
    }
    return [...new Map(refs.map((r) => [r.id, r])).values()];
  }, "references");
  const license = useLoad(() => readText("LICENSES.md"), "licenses");
  const kmle = useLoad(
    () =>
      content.read<{
        publicExams: { year: number; round: number }[];
        changes: {
          effectiveYear: number;
          totalQuestions: number;
          medicalGeneral: number;
          medicalSpecific: number;
          healthLaw: number;
        }[];
      }>("kmle/index.json"),
    "kmle",
  );
  const selected = r.data?.find((r) => r.id === id);
  return (
    <div className={s.legal}>
      <Heading title="출처와 이용 안내" />
      <Link className={s.button} href={url("terms") + "?kind=copyright"}>저작권 및 이용 안내</Link>
      <p>
        본 서비스는 의학 교육 및 학습을 목적으로 제공됩니다. 질병의 진단, 처치,
        치료 또는 예방을 위한 의료기기가 아니며, 실제 의료적 판단을 대체하지
        않습니다.
      </p>
      <h2>해부학 자료</h2>
      <p>
        BodyParts3D, © The Database Center for Life Science licensed under CC
        Attribution 4.0 International
      </p>
      <p>
        웹에서 볼 수 있도록 모델 형식을 변환했습니다. 원본 좌표와 구조 간 상대
        위치는 유지했습니다.
      </p>
      <a
        className={s.button}
        href="https://creativecommons.org/licenses/by/4.0/"
        target="_blank"
        rel="noreferrer"
      >
        CC BY 4.0 라이선스
      </a>
      <details>
        <summary>콘텐츠 라이선스 전문</summary>
        {license.data ? (
          <Text text={license.data} />
        ) : (
          <State error={license.error} retry={license.retry} />
        )}
      </details>
      {id && (
        <section className={s.section}>
          <h2>선택한 출처</h2>
          {selected ? (
            <ReferenceItem item={selected} />
          ) : (
            <p>
              {r.data
                ? "해당 출처의 상세 정보를 찾을 수 없습니다."
                : "출처를 불러오고 있습니다."}
            </p>
          )}
        </section>
      )}
      <h2>국시 연계 자료</h2>
      <p>
        시험 안내와 출제 범위를 제공하며 실제 기출문항과 정답은 국시원에서
        확인해 주세요.
      </p>
      {kmle.data?.publicExams.map((x) => (
        <p key={x.year}>
          {x.year}년 · 제{x.round}회 공식 공개 안내
        </p>
      ))}
      {kmle.data?.changes.map((x) => (
        <p key={x.effectiveYear}>
          {x.effectiveYear}년 적용 예정 · 총 {x.totalQuestions}문항 (총론{" "}
          {x.medicalGeneral} / 각론 {x.medicalSpecific} / 법규 {x.healthLaw})
        </p>
      ))}
      <a
        href="https://www.kuksiwon.or.kr"
        className={s.button}
        target="_blank"
        rel="noreferrer"
      >
        한국보건의료인국가시험원
      </a>
      <a
        className={s.button}
        href="/daewanggorae/runtime/THIRD_PARTY_LICENSES.txt"
        target="_blank"
        rel="noreferrer"
      >
        오픈소스 라이선스
      </a>
      <h2>참고문헌</h2>
      {r.data ? (
        r.data.map((ref) => <ReferenceItem key={ref.id} item={ref} />)
      ) : (
        <State error={r.error} retry={r.retry} />
      )}
    </div>
  );
}
function ReferenceItem({ item }: { item: Reference }) {
  return (
    <div className={s.row}>
      <div className={s.rowText}>
        <strong>{typeof item.title === "string" ? item.title : item.id}</strong>
        <small>{item.reuseLicense}</small>
      </div>
      {item.url && /^https?:\/\//.test(item.url) && (
        <a
          className={s.button}
          href={item.url}
          target="_blank"
          rel="noreferrer"
        >
          출처 열기
        </a>
      )}
    </div>
  );
}
