"use client";
import Link from "next/link";
import { useEffect, useRef, useState, useMemo } from "react";
import type { Concept, Scene } from "../_lib/types";
import {
  BASE,
  content,
  getScene,
  getModels,
  getConcepts,
  getCatalog,
  type ModelIndex,
} from "../_lib/content";
import { useLoad } from "../_lib/hooks";
import { State, url } from "./UI";
import { locationOptions } from "../_lib/anatomy/location";
import palette from "../_lib/anatomy/palette.json";
import { useRecords, saveRecord } from "../_lib/store";
import s from "../daewanggorae.module.css";
export function conceptScene(c: Concept, models: ModelIndex): Scene {
  const ids = (
    c.meshes[c.preferredTree || "partof"] ||
    c.meshes.isa ||
    []
  ).filter((id) => models[id]);
  if (!ids.length) throw new Error("이 구조에 연결된 3D 모델은 아직 없습니다.");
  const min = [0, 1, 2].map((a) =>
    Math.min(...ids.map((id) => models[id].bounds.min[a])),
  ) as [number, number, number];
  const max = [0, 1, 2].map((a) =>
    Math.max(...ids.map((id) => models[id].bounds.max[a])),
  ) as [number, number, number];
  const target = min.map((v, a) => (v + max[a]) / 2) as [
    number,
    number,
    number,
  ];
  return {
    schemaVersion: "1.0.0",
    id: "concept:" + c.id,
    sceneId: "concept:" + c.id,
    lessonId: "",
    triggerBlockId: "",
    primaryStructures: [c.id],
    contextStructures: [],
    highlightStructures: [c.id],
    modelIds: ids,
    modelPaths: ids.map((id) => models[id].originalPath),
    cameraPosition: [target[0], target[1] - 400, target[2] + 80],
    cameraTarget: target,
    cameraUp: [0, 0, 1],
    cameraFovDegrees: 35,
    autoFit: true,
    bounds: { min, max },
    opacity: { primary: 1, context: 0.2 },
    color: { primary: "#B8B4A5", context: "#BCC4CA" },
    transitionDuration: 400,
    easing: "easeInOut",
    educationalPurpose: c.nameKo || c.nameEn,
    verificationStatus: "metadata_checked",
    visualizationLimitations: [
      "정적 해부학 모델입니다. 실제 생리적 움직임이나 병변을 표현하지 않습니다.",
      "한국어 용어와 구조 매핑은 전문 검수 전입니다.",
    ],
    dynamicAnatomyIncluded: false,
  };
}
function encode(bytes: Uint8Array) {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(binary);
}
export default function SceneViewer({
  sceneId,
  conceptId,
}: {
  sceneId?: string;
  conceptId?: string;
}) {
  const r = useLoad(
    async () => {
      const [models, concepts, catalog] = await Promise.all([
        getModels(),
        getConcepts(),
        getCatalog(),
      ]);
      if (conceptId && !concepts[conceptId])
        throw new Error("해부학 구조를 찾을 수 없습니다.");
      const scene = conceptId
        ? conceptScene(concepts[conceptId], models)
        : await getScene(sceneId || "");
      return { scene, models, concepts, catalog };
    },
    "scene:" + (sceneId || conceptId),
  );
  return r.data ? (
    <Viewer key={r.data.scene.id} {...r.data} />
  ) : (
    <State error={r.error} retry={r.retry} />
  );
}
function Viewer({
  scene,
  models,
  concepts,
  catalog,
}: {
  scene: Scene;
  models: ModelIndex;
  concepts: Record<string, Concept>;
  catalog: Awaited<ReturnType<typeof getCatalog>>;
}) {
  const records = useRecords();
  const mode = records["preference:anatomy-rendering"]?.data.mode === "anatomical" ? "anatomical" : "default";
  const mapping = useLoad(() => content.read<Record<string,{materialKey:string;sourceSha256:string}>>("compiled/materials.json"), "materials");
  const materialKey = (id:string) => mapping.data?.[id]?.sourceSha256 === models[id]?.sourceSha256 ? mapping.data?.[id]?.materialKey : "unclassified";
  const [locationId,setLocationId] = useState("");
  const locations = useMemo(() => locationOptions(scene.primaryStructures,concepts,models,scene.modelIds),[scene,concepts,models]);
  const location = locations.find(l=>l.id===locationId);
  const frame = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false),
    [loaded, setLoaded] = useState(0),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0),
    [selected, setSelected] = useState(""),
    [selectedConcepts, setSelectedConcepts] = useState<string[]>([]),
    [hidden, setHidden] = useState<string[]>([]),
    [isolate, setIsolate] = useState(false),
    [opacity, setOpacity] = useState(1);
  const ids = [
    ...new Map(
      scene.modelIds.map((id) => [models[id]?.elementId || id, id]),
    ).values(),
  ];
  function send(data: unknown) {
    frame.current?.contentWindow?.postMessage(data, "*");
  }
  useEffect(() => {
    const receive = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data?.daewanggorae)
        return;
      const d = e.data.payload;
      if (d.type === "ready") setReady(true);
      if (d.type === "loaded" && !d.context) setLoaded((n) => n + 1);
      if (d.type === "selected") {
        setSelected(String(d.id));
        setSelectedConcepts(Array.isArray(d.conceptIds) ? d.conceptIds : []);
      }
      if (d.type === "error") setError(String(d.message));
    };
    window.addEventListener("message", receive);
    return () => window.removeEventListener("message", receive);
  }, []);
  useEffect(() => {
    if (!ready || !mapping.data) return;
    let active = true;
    const controller = new AbortController();
    setLoaded(0);
    setError("");
    send({ type: "scene", scene, background: "#E5EDF2" });
    void (async () => {
      if (
        ids.length > 600 ||
        ids.reduce((n, id) => n + (models[id]?.bytes || 0), 0) > 80_000_000
      )
        throw new Error("표시 범위가 큽니다. 더 작은 구조를 선택해 주세요.");
      const primary = new Set(
        scene.primaryStructures.flatMap((id) =>
          Object.values(concepts[id]?.meshes || {}).flat(),
        ),
      );
      const highlight = new Set(
        scene.highlightStructures.flatMap((id) =>
          Object.values(concepts[id]?.meshes || {}).flat(),
        ),
      );
      for (const id of ids) {
        const model = models[id];
        if (!model || !/^[a-f0-9]+\.glb$/.test(model.file))
          throw new Error("모델 정보를 확인할 수 없습니다.");
        const response = await fetch(BASE + "/models/" + model.file, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("모델을 불러오지 못했습니다.");
        const bytes = new Uint8Array(await response.arrayBuffer());
        const digest = Array.from(
          new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        )
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        if (bytes.length !== model.bytes || digest !== model.sha256)
          throw new Error("모델 파일이 손상되었습니다.");
        if (!active) return;
        send({
          type: "model",
          sceneId: scene.id,
          id,
          base64: encode(bytes),
          conceptIds: model.conceptIds,
          materialKey: materialKey(id),
          highlighted: highlight.has(id),
          color: highlight.has(id)
            ? "#467D9E"
            : primary.has(id)
              ? scene.color.primary
              : scene.color.context,
          opacity: primary.has(id)
            ? scene.opacity.primary
            : scene.opacity.context,
        });
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
    })().catch((e) => {
      if (active) setError(e.message);
    });
    const target = frame.current?.contentWindow;
    return () => {
      active = false;
      controller.abort();
      target?.postMessage(
        { type: "scene", scene: { ...scene, modelIds: [] } },
        "*",
      );
    };
    // The Viewer is keyed by scene ID; scene and model metadata are immutable for its lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, retry, mapping.data]);
  useEffect(() => { if (ready) send({type:"mode",mode}); },[ready,mode]);
  useEffect(() => {
    if (!ready || !mapping.data) return;
    const controller = new AbortController(); let active=true;
    send({type:"location",sceneId:scene.id,location:location ?? null});
    if (location) void (async()=>{
      for (const id of location.modelIds.filter(id=>!ids.includes(id))) {
        const model=models[id];
        if(!/^[a-f0-9]+\.glb$/.test(model.file))throw new Error("모델 경로를 확인할 수 없습니다.");
        const response=await fetch(BASE+"/models/"+model.file,{signal:controller.signal});
        if(!response.ok)throw new Error("주변 구조를 불러오지 못했습니다.");
        const bytes=new Uint8Array(await response.arrayBuffer());
        const digest=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",bytes))).map(b=>b.toString(16).padStart(2,"0")).join("");
        if(bytes.length!==model.bytes || digest!==model.sha256)throw new Error("모델 파일이 손상되었습니다.");
        if(!active)return;
        send({type:"model",sceneId:scene.id,context:true,id,base64:encode(bytes),conceptIds:model.conceptIds,materialKey:materialKey(id),color:scene.color.context,opacity:0.12});
      }
    })().catch(e=>{if(active)setError(String(e));});
    return ()=>{active=false;controller.abort();};
    // The scene and metadata stay immutable for this mounted viewer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[ready,locationId,mapping.data,retry]);
  useEffect(() => {
    send({ type: "style", selected, hidden, isolate, opacity });
  }, [selected, hidden, isolate, opacity, loaded]);
  useEffect(() => {
    const target = frame.current?.contentWindow;
    return () => {
      target?.postMessage({ type: "dispose" }, "*");
    };
  }, []);
  useEffect(() => {
    const node = frame.current?.closest("[data-theme]");
    if (!node) return;
    const update = () =>
      send({
        type: "background",
        color: getComputedStyle(node).getPropertyValue("--tint").trim(),
      });
    update();
    const watcher = new MutationObserver(update);
    watcher.observe(node, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => watcher.disconnect();
  }, [ready]);
  const related = [
    ...new Map(
      selectedConcepts
        .flatMap((id) => catalog.conceptLessons[id] || [])
        .map((x) => [x.lessonId + ":" + x.blockId, x]),
    ).values(),
  ];
  return (
    <div>
      <div className={s.viewer}>
        <iframe
          ref={frame}
          src={BASE + "/viewer.html"}
          sandbox="allow-scripts"
          title="대화형 3D 해부학 모델"
        />
      </div>
      <div className={s.actions} role="group" aria-label="해부학 색상">
        {(["default","anatomical"] as const).map(value=><button key={value} aria-pressed={mode===value} onClick={()=>void saveRecord("preference","anatomy-rendering",{mode:value}).catch(e=>setError(String(e)))}>{value==="default"?"기본":"해부학 색상"}</button>)}
        {!!locations.length && <label>주변 구조 <select aria-label="주변 구조 범위" value={locationId} onChange={e=>setLocationId(e.target.value)}><option value="">선택한 구조만</option>{locations.map(l=><option key={l.id} value={l.id}>{l.title}</option>)}</select></label>}
      </div>
      {mode==="anatomical" && <details><summary>색상 범례</summary><div className={s.legend}>{[...new Set((location?.modelIds ?? ids).map(materialKey))].map(key=>{const preset=palette.presets[key as keyof typeof palette.presets];return preset?<span key={key}><i style={{background:preset.baseColor}} />{preset.labelKo}</span>:null;})}</div></details>}
      {mapping.error && <State error={mapping.error} retry={mapping.retry} />}
      <div className={s.actions}>
        <span className={s.muted}>
          {loaded} / {ids.length} 구조
        </span>
        <button onClick={() => send({ type: "reset" })}>시점 초기화</button>
        <button
          onClick={() => {
            setHidden([]);
            setIsolate(false);
            setOpacity(1);
          }}
        >
          전체 보기
        </button>
      </div>
      <p className={s.muted}>
        드래그로 회전 · 휠로 확대 · 오른쪽 드래그로 이동
      </p>
      {error && <State error={error} retry={() => setRetry((n) => n + 1)} />}
      <div className={s.filters}>
        <label className={s.field}>
          구조 선택
          <select
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setSelectedConcepts(models[e.target.value]?.conceptIds || []);
            }}
          >
            <option value="">모델에서 구조를 선택하세요</option>
            {ids.map((id) => (
              <option key={id} value={id}>
                {models[id]?.conceptIds
                  .map((cid) => concepts[cid]?.nameKo || concepts[cid]?.nameEn)
                  .filter(Boolean)[0] || id}
              </option>
            ))}
          </select>
        </label>
        <label className={s.field}>
          선택 구조 투명도
          <input
            type="range"
            min="0.1"
            max="1"
            step=".05"
            value={opacity}
            disabled={!selected || !!location}
            onChange={(e) => setOpacity(Number(e.target.value))}
          />
        </label>
      </div>
      {selected && (
        <>
          <p>
            {selectedConcepts
              .slice(0, 5)
              .map((id) => [concepts[id]?.nameKo, concepts[id]?.nameEn].filter(Boolean).join(" · "))
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className={s.actions}>
            <button onClick={() => setIsolate(!isolate)}>
              {isolate ? "격리 해제" : "선택 구조만 보기"}
            </button>
            <button
              onClick={() =>
                setHidden((prev) =>
                  prev.includes(selected)
                    ? prev.filter((x) => x !== selected)
                    : [...prev, selected],
                )
              }
            >
              {hidden.includes(selected) ? "선택 구조 표시" : "선택 구조 숨김"}
            </button>
          </div>
        </>
      )}
      {!!related.length && (
        <details>
          <summary>관련 교과서</summary>
          {related.map((x) => (
            <Link
              className={s.row}
              key={x.lessonId + x.blockId}
              href={url("lesson", x.lessonId) + "#" + x.blockId}
            >
              {catalog.lessons.find((l) => l.id === x.lessonId)?.title}
            </Link>
          ))}
        </details>
      )}
      {scene.visualizationLimitations.map((text, i) => (
        <p key={i} className={s.notice}>
          {text}
        </p>
      ))}
      <p className={s.muted}>
        BodyParts3D, © The Database Center for Life Science licensed under CC
        Attribution 4.0 International
      </p>
    </div>
  );
}
