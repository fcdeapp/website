"use client";
import Link from "next/link";
import Image from "next/image";
import type { ContentBlock } from "../_lib/types";
import { fileURL } from "../_lib/content";
import { useLoad } from "../_lib/hooks";
import { Text } from "./Text";
import Diagram from "./Diagram";
import { State, url } from "./UI";
import s from "../daewanggorae.module.css";
const labels: Record<string, string> = {
  definition: "정의",
  clinicalPearl: "임상 포인트",
  warning: "주의",
  memorization: "암기",
  misconception: "흔한 오해",
  explanation: "해설",
  presentation: "증례",
  history: "병력",
  result: "결과",
  question: "생각할 질문",
  discussion: "논의",
  steps: "단계",
  nodes: "과정",
  edges: "연결",
  from: "시작",
  to: "다음",
  condition: "조건",
  action: "수행",
  notes: "참고",
  assumptions: "전제",
  caseType: "자료 구분",
  title: "제목",
  description: "설명",
  label: "내용",
  id: "번호",
  term: "용어",
  ko: "한국어",
  en: "영어",
  definitionKo: "정의",
  name: "명칭",
  text: "내용",
  sourceRef: "출처",
};
export function Structured({ data }: { data: unknown }) {
  if (data == null) return null;
  if (typeof data !== "object") return <Text text={String(data)} />;
  if (Array.isArray(data))
    return (
      <ol>
        {data.map((v, i) => (
          <li key={i}>
            <Structured data={v} />
          </li>
        ))}
      </ol>
    );
  return (
    <dl className={s.structured}>
      {Object.entries(data).map(([key, value]) => (
        <div key={key}>
          <dt>{labels[key] || key}</dt>
          <dd>
            <Structured data={value} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
export function Table({ data }: { data: Record<string, unknown> }) {
  const cols: unknown[] = Array.isArray(data.columns) ? data.columns : [],
    rows: unknown[] = Array.isArray(data.rows) ? data.rows : [];
  return (
    <>
      {!!data.title && <h3>{String(data.title)}</h3>}
      <div
        className={s.tableWrap}
        tabIndex={0}
        role="region"
        aria-label={String(data.title || "학습 표")}
      >
        <table>
          <thead>
            <tr>
              {cols.map((c, i) => (
                <th key={i} scope="col">
                  {typeof c === "object" && c
                    ? String(
                        (c as Record<string, unknown>).label ||
                          (c as Record<string, unknown>).title ||
                          (c as Record<string, unknown>).key,
                      )
                    : String(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {(Array.isArray(r) ? r : Object.values(r as object)).map(
                  (c, j) => (
                    <td key={j}>
                      <Structured data={c} />
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!!data.notes && <Structured data={data.notes} />}
    </>
  );
}
function Figure({
  path,
  alt,
  license,
}: {
  path: string;
  alt: string;
  license: string;
}) {
  const r = useLoad(() => fileURL(path), path);
  return (
    <figure className={s.figure}>
      {r.data ? (
        <Image
          unoptimized
          width={900}
          height={600}
          src={r.data}
          alt={alt}
          style={{ width: "100%", height: "auto" }}
        />
      ) : (
        <State error={r.error} retry={r.retry} />
      )}
      <figcaption>
        {alt} · {license}
      </figcaption>
    </figure>
  );
}
export function Block({ block: b }: { block: ContentBlock }) {
  switch (b.type) {
    case "heading":
      return b.level <= 2 ? <h2>{b.text}</h2> : <h3>{b.text}</h3>;
    case "paragraph":
      return <Text text={b.markdown} blockId={b.id} />;
    case "definition":
    case "clinicalPearl":
    case "warning":
    case "memorization":
    case "misconception":
    case "explanation":
      return (
        <div className={s.callout}>
          <small>{labels[b.type]}</small>
          <Text text={b.markdown} />
        </div>
      );
    case "equation":
      return (
        <>
          <Text text={b.latex} formula />
          {Object.entries(b.variables).map(([k, v]) => (
            <p key={k}>
              {k} — {v}
            </p>
          ))}
          {b.assumptions.map((a, i) => (
            <p className={s.muted} key={i}>
              {a}
            </p>
          ))}
        </>
      );
    case "table":
    case "comparison":
      return <Table data={b.data} />;
    case "derivation":
    case "process":
    case "flowchart":
    case "clinicalCase":
    case "diagnosticAlgorithm":
    case "treatmentAlgorithm":
      return <Structured data={b.data} />;
    case "diagram":
      return <Diagram id={b.diagramRef} alt={b.alt} />;
    case "image":
      return (
        <>
          <Figure path={b.path} alt={b.alt} license={b.license} />
          <Link
            className={s.button}
            href={url("sources") + "?id=" + encodeURIComponent(b.sourceRef)}
          >
            이미지 출처
          </Link>
        </>
      );
    case "anatomy3d":
      return (
        <Link
          className={s.button}
          href={url("anatomy") + "?scene=" + encodeURIComponent(b.sceneRef)}
        >
          관련 구조를 3D로 보기
        </Link>
      );
    case "question":
      return (
        <Link
          className={s.button}
          href={url("quiz") + "?ids=" + encodeURIComponent(b.questionRef)}
        >
          확인 문제 풀기
        </Link>
      );
    case "reference":
      return (
        <Link
          className={s.button}
          href={url("sources") + "?id=" + encodeURIComponent(b.sourceRef)}
        >
          참고문헌 보기
        </Link>
      );
    default:
      return (
        <p className={s.notice}>
          이 형식의 자료는 아직 웹에서 표시할 수 없습니다.
        </p>
      );
  }
}
