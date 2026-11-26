"use client";
import Link from "next/link";
import { useState, useDeferredValue } from "react";
import { useSearchParams } from "next/navigation";
import { getCatalog, getConcepts } from "../_lib/content";
import { useLoad } from "../_lib/hooks";
import { Heading, Row, State, url } from "../_components/UI";
import SceneViewer from "../_components/SceneViewer";
import s from "../daewanggorae.module.css";
export default function Anatomy() {
  const params = useSearchParams(),
    sceneId = params.get("scene") || undefined,
    conceptId = params.get("concept") || undefined;
  const r = useLoad(
    async () => ({
      catalog: await getCatalog(),
      concepts: await getConcepts(),
    }),
    "anatomy",
  );
  const [query, setQuery] = useState(""),
    [limit, setLimit] = useState(50),
    [tab, setTab] = useState("scene");
  const q = useDeferredValue(query.trim().toLowerCase());
  if (!r.data) return <State error={r.error} retry={r.retry} />;
  const { catalog, concepts } = r.data,
    c = conceptId ? concepts[conceptId] : undefined;
  const list = Object.values(concepts).filter((x) =>
    [x.nameKo, x.nameEn, x.fmaId, ...x.synonyms]
      .join(" ")
      .toLowerCase()
      .includes(q),
  );
  return (
    <>
      <Heading
        title={
          c?.nameKo ||
          c?.nameEn ||
          (sceneId
            ? catalog.scenes.find((x) => x.id === sceneId)?.title
            : "3D 해부학") ||
          "해부학 학습 장면"
        }
      />
      {sceneId || conceptId ? (
        <>
          <Link className={s.button} href={url("anatomy")}>
            전체 해부학 탐색
          </Link>
          <div className={s.anatomyGrid} style={{ marginTop: 24 }}>
            <SceneViewer
              key={sceneId || conceptId}
              sceneId={sceneId}
              conceptId={conceptId}
            />
            <aside>
              <h2>함께 살펴보기</h2>
              {c && (
                <>
                  <p>{c.nameEn}</p>
                  <p className={s.muted}>
                    {c.fmaId} ·{" "}
                    {c.laterality === "left"
                      ? "왼쪽"
                      : c.laterality === "right"
                        ? "오른쪽"
                        : "좌우 구분 없음"}
                  </p>
                  {(["partof", "isa"] as const).map((tree) => (
                    <details key={tree}>
                      <summary>
                        {tree === "partof" ? "포함 관계" : "분류 관계"}
                      </summary>
                      {[
                        ...new Set([
                          ...(c.parents[tree] || []),
                          ...(c.children[tree] || []),
                        ]),
                      ].map((id) => (
                        <Row
                          key={id}
                          title={
                            concepts[id]?.nameKo || concepts[id]?.nameEn || id
                          }
                          href={
                            url("anatomy") +
                            "?concept=" +
                            encodeURIComponent(id)
                          }
                        />
                      ))}
                    </details>
                  ))}
                </>
              )}
              {sceneId &&
                catalog.scenes.find((x) => x.id === sceneId)?.lessonId && (
                  <Row
                    title="연결된 교과서"
                    href={url(
                      "lesson",
                      catalog.scenes.find((x) => x.id === sceneId)!.lessonId,
                    )}
                  />
                )}
              <p className={s.notice}>
                구조를 선택하면 한국어·영어 명칭과 관련 교과서를 확인할 수
                있습니다.
              </p>
            </aside>
          </div>
        </>
      ) : (
        <>
          <div className={s.tabs} role="tablist" aria-label="해부학 탐색 방식">
            {[
              ["scene", "학습 장면"],
              ["concept", "해부학 구조"],
            ].map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => {
                  setTab(id);
                  setLimit(50);
                }}
              >
                {label}
              </button>
            ))}
          </div>
          <label className={s.field}>
            해부학 검색
            <input
              type="search"
              placeholder="한국어 · 영어 · FMA ID"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setLimit(50);
              }}
            />
          </label>
          {tab === "scene" ? (
            catalog.scenes
              .filter((x) => x.title.toLowerCase().includes(q))
              .map((x, i) => (
                <Row
                  key={x.id}
                  title={x.title}
                  number={String(i + 1).padStart(2, "0")}
                  detail={
                    catalog.lessons.find((l) => l.id === x.lessonId)?.title
                  }
                  href={url("anatomy") + "?scene=" + encodeURIComponent(x.id)}
                />
              ))
          ) : (
            <>
              <p className={s.notice}>{list.length}개 구조</p>
              {list.slice(0, limit).map((x) => (
                <Row
                  key={x.id}
                  title={x.nameKo || x.nameEn}
                  detail={[x.nameEn, x.fmaId].join(" · ")}
                  href={url("anatomy") + "?concept=" + encodeURIComponent(x.id)}
                />
              ))}
              {list.length > limit && (
                <button onClick={() => setLimit((n) => n + 50)}>
                  구조 더 보기
                </button>
              )}
              {!list.length && <State empty="검색 결과가 없습니다." />}
            </>
          )}
        </>
      )}
    </>
  );
}
