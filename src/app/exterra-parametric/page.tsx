"use client";

import React, { CSSProperties, PointerEvent, useMemo, useState } from "react";
import styles from "../../styles/pages/ExterraParametricDefensePage.module.css";

type Scenario = "external" | "internal" | "seismic";
type ModuleType = "C4I" | "MEP" | "Habitat" | "Storage" | "Core";
type JointType = "boltedPlate" | "weldedFrame" | "springDamper" | "shearKey" | "slidingFuse";
type Axis = "x" | "y" | "z";

type Module = {
  id: number;
  x: number;
  y: number;
  z: number;
  w: number;
  d: number;
  h: number;
  rot: 0 | 90;
  type: ModuleType;
};

type Contact = {
  id: string;
  a: number;
  b: number;
  axis: Axis;
  area: number;
  type: JointType;
  demand: number;
  utilization: number;
};

type Inputs = {
  targetArea: number;
  cavernLength: number;
  cavernWidth: number;
  cavernHeight: number;
  floors: number;
  moduleW: number;
  moduleD: number;
  moduleH: number;
  aisle: number;
  stagger: number;
  stackOverlap: number;
  rotationRatio: number;
  rockCover: number;
  rockQuality: number;
  jointSpacing: number;
  auxeticThickness: number;
  auxeticCellW: number;
  auxeticCellH: number;
  reentrantAngle: number;
  armoxThickness: number;
  airGap: number;
  springStroke: number;
  springFreq: number;
  damping: number;
  connectionCapacity: number;
  connectionDuctility: number;
  extPeakKpa: number;
  internalPeakKpa: number;
  seismicPga: number;
  unitModuleCost: number;
  cavernCost: number;
  panelCost: number;
  jointCost: number;
  c4iSystemCost: number;
  lifeSupportCost: number;
  commsElectronicsCost: number;
  specialProtectionCost: number;
};

const INITIAL: Inputs = {
  targetArea: 10000,
  cavernLength: 150,
  cavernWidth: 50,
  cavernHeight: 24,
  floors: 2,
  moduleW: 10,
  moduleD: 8,
  moduleH: 4,
  aisle: 2,
  stagger: 0.35,
  stackOverlap: 0.18,
  rotationRatio: 0.42,
  rockCover: 180,
  rockQuality: 72,
  jointSpacing: 1.8,
  auxeticThickness: 0.45,
  auxeticCellW: 0.18,
  auxeticCellH: 0.12,
  reentrantAngle: 60,
  armoxThickness: 0.035,
  airGap: 0.8,
  springStroke: 0.18,
  springFreq: 2.2,
  damping: 0.08,
  connectionCapacity: 850,
  connectionDuctility: 8,
  extPeakKpa: 207,
  internalPeakKpa: 80,
  seismicPga: 0.3,
  unitModuleCost: 6.2,
  cavernCost: 1.45,
  panelCost: 3.8,
  jointCost: 0.42,
  c4iSystemCost: 900,
  lifeSupportCost: 520,
  commsElectronicsCost: 680,
  specialProtectionCost: 740,
};

const jointNames: Record<JointType, string> = {
  boltedPlate: "Bolted plate",
  weldedFrame: "Welded frame",
  springDamper: "Spring-damper",
  shearKey: "Shear key",
  slidingFuse: "Sliding fuse",
};

const jointFactor: Record<JointType, { cap: number; cost: number; duct: number; note: string }> = {
  boltedPlate: { cap: 1.0, cost: 1.0, duct: 0.95, note: "일반 모듈 접합. 시공성은 좋지만 반복 충격에는 보강 검토가 필요합니다." },
  weldedFrame: { cap: 1.18, cost: 1.22, duct: 0.9, note: "강성이 높아 직접 접촉부에 유리하지만 변형 흡수 여유는 작습니다." },
  springDamper: { cap: 0.82, cost: 1.55, duct: 1.35, note: "진동·충격 전달을 낮추는 절연 접합입니다. 장비실이나 C4I 주변에 적합합니다." },
  shearKey: { cap: 1.32, cost: 1.28, duct: 0.86, note: "전단 전달이 큰 면접촉부에 유리한 키 접합입니다." },
  slidingFuse: { cap: 0.92, cost: 1.42, duct: 1.5, note: "큰 충격 때 일부 미끄러짐을 허용해 주구조 손상을 줄이는 fuse형 접합입니다." },
};

const moduleClass: Record<ModuleType, string> = {
  C4I: "c4i",
  MEP: "mep",
  Habitat: "habitat",
  Storage: "storage",
  Core: "core",
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function relu(v: number) {
  return Math.max(0, v);
}

function nfmt(v: number, digits = 1) {
  return Number.isFinite(v) ? v.toLocaleString("ko-KR", { maximumFractionDigits: digits }) : "-";
}

function scoreLabel(score: number) {
  if (score >= 82) return "PASS";
  if (score >= 62) return "CHECK";
  return "FAIL";
}

function scoreClass(score: number) {
  if (score >= 82) return styles.pass;
  if (score >= 62) return styles.warn;
  return styles.fail;
}

function typeFor(i: number, x: number, y: number, z: number): ModuleType {
  if (i % 19 === 0 || (x === 0 && y % 6 === 0)) return "Core";
  if (z === 0 && (x + y) % 5 === 0) return "MEP";
  if (i % 8 === 0) return "Storage";
  if (i % 4 === 0) return "C4I";
  return "Habitat";
}

function moduleDims(m: Module) {
  return m.rot === 90 ? { w: m.d, d: m.w, h: m.h } : { w: m.w, d: m.d, h: m.h };
}

function aabb(m: Module) {
  const dim = moduleDims(m);
  return { x1: m.x, x2: m.x + dim.w, y1: m.y, y2: m.y + dim.d, z1: m.z, z2: m.z + dim.h };
}

function overlapLength(a1: number, a2: number, b1: number, b2: number) {
  return Math.max(0, Math.min(a2, b2) - Math.max(a1, b1));
}

function generateModules(input: Inputs): Module[] {
  const stepX = Math.max(2, input.moduleW + input.aisle * (1 - input.stackOverlap));
  const stepY = Math.max(2, input.moduleD + input.aisle * (1 - input.stackOverlap));
  const stepZ = Math.max(1.2, input.moduleH * (1 - input.stackOverlap) + 0.85);
  const cols = Math.max(1, Math.floor((input.cavernWidth - input.aisle * 2) / stepX));
  const rows = Math.max(1, Math.floor((input.cavernLength - input.aisle * 2) / stepY));
  const floorsByHeight = Math.max(1, Math.floor((input.cavernHeight - 1) / stepZ));
  const floors = Math.min(input.floors, floorsByHeight);
  const needed = Math.ceil(input.targetArea / (input.moduleW * input.moduleD));
  const out: Module[] = [];
  let id = 1;

  for (let z = 0; z < floors; z++) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (out.length >= needed) return out;
        if ((r + c + z) % 13 === 0 && out.length < needed - 8) continue;
        const rot: 0 | 90 = ((r * 7 + c * 5 + z * 3) % 100 < input.rotationRatio * 100 ? 90 : 0);
        const sx = (z % 2 ? input.stagger * input.moduleW : 0) + (r % 2 ? input.stagger * input.moduleW * 0.38 : 0);
        const sy = (z % 2 ? input.stagger * input.moduleD * 0.45 : 0) + (c % 2 ? input.stagger * input.moduleD * 0.25 : 0);
        const x = input.aisle + c * stepX + sx;
        const y = input.aisle + r * stepY + sy;
        const dim = rot === 90 ? { w: input.moduleD, d: input.moduleW } : { w: input.moduleW, d: input.moduleD };
        if (x + dim.w > input.cavernWidth - input.aisle || y + dim.d > input.cavernLength - input.aisle) continue;
        out.push({ id, x, y, z: z * stepZ, w: input.moduleW, d: input.moduleD, h: input.moduleH, rot, type: typeFor(id, c, r, z) });
        id += 1;
      }
    }
  }
  return out;
}

function attenuationExternal(input: Inputs) {
  const coverFactor = Math.exp(-input.rockCover / 135);
  const rqdFactor = 1.15 - (input.rockQuality / 100) * 0.73;
  const jointFactorLocal = clamp(1.15 - input.jointSpacing / 3.5, 0.55, 1.05);
  const rockTransmit = clamp(coverFactor * rqdFactor * jointFactorLocal, 0.015, 0.55);
  const auxeticFactor = clamp(1 - input.auxeticThickness * 0.38 - (70 - Math.abs(input.reentrantAngle - 55)) / 360, 0.48, 0.92);
  const gapFactor = clamp(1 - input.airGap * 0.18, 0.62, 0.96);
  const linerFactor = clamp(1 - input.armoxThickness * 4.5, 0.58, 0.93);
  const springFactor = clamp(input.springFreq / (8 + input.springFreq) + input.damping * 0.9, 0.22, 0.72);
  const cavernKpa = input.extPeakKpa * rockTransmit;
  const panelKpa = cavernKpa * auxeticFactor * gapFactor * linerFactor;
  const moduleKpa = panelKpa * springFactor;
  return { rockTransmit, auxeticFactor, gapFactor, linerFactor, springFactor, cavernKpa, panelKpa, moduleKpa };
}

function attenuationInternal(input: Inputs) {
  const auxeticFactor = clamp(1 - input.auxeticThickness * 0.30 - (70 - Math.abs(input.reentrantAngle - 55)) / 420, 0.54, 0.95);
  const gapFactor = clamp(1 - input.airGap * 0.15, 0.66, 0.98);
  const linerFactor = clamp(1 - input.armoxThickness * 4.0, 0.60, 0.94);
  const springFactor = clamp(input.springFreq / (7 + input.springFreq) + input.damping * 0.75, 0.24, 0.74);
  const panelKpa = input.internalPeakKpa * auxeticFactor * gapFactor * linerFactor;
  const moduleKpa = panelKpa * springFactor;
  return { auxeticFactor, gapFactor, linerFactor, springFactor, panelKpa, moduleKpa };
}

function seismicResponse(input: Inputs) {
  const forcingHz = 3.0;
  const r = forcingHz / Math.max(input.springFreq, 0.1);
  const z = input.damping;
  const t = Math.sqrt((1 + (2 * z * r) ** 2) / ((1 - r * r) ** 2 + (2 * z * r) ** 2));
  const transmissibility = clamp(t, 0.18, 2.2);
  const moduleAccG = input.seismicPga * transmissibility;
  const omega = 2 * Math.PI * input.springFreq;
  const dispM = (moduleAccG * 9.81) / Math.max(omega * omega, 0.01);
  return { transmissibility, moduleAccG, dispM, dispRatio: dispM / Math.max(input.springStroke, 0.01) };
}

function contactDemandBase(input: Inputs, scenario: Scenario) {
  if (scenario === "external") return attenuationExternal(input).panelKpa;
  if (scenario === "internal") return attenuationInternal(input).panelKpa;
  return input.seismicPga * 9.81 * 42;
}

function defaultJoint(axis: Axis, area: number, a: Module, b: Module): JointType {
  if (axis === "z") return "shearKey";
  if (a.type === "C4I" || b.type === "C4I") return "springDamper";
  if (area > 28) return "weldedFrame";
  return "boltedPlate";
}

function detectContacts(modules: Module[], input: Inputs, scenario: Scenario, overrides: Record<string, JointType>): Contact[] {
  const contacts: Contact[] = [];
  const eps = Math.max(0.25, input.aisle * 0.55);
  const base = contactDemandBase(input, scenario);
  for (let i = 0; i < modules.length; i++) {
    for (let j = i + 1; j < modules.length; j++) {
      const a = aabb(modules[i]);
      const b = aabb(modules[j]);
      const ox = overlapLength(a.x1, a.x2, b.x1, b.x2);
      const oy = overlapLength(a.y1, a.y2, b.y1, b.y2);
      const oz = overlapLength(a.z1, a.z2, b.z1, b.z2);
      const gapX = Math.min(Math.abs(a.x2 - b.x1), Math.abs(b.x2 - a.x1));
      const gapY = Math.min(Math.abs(a.y2 - b.y1), Math.abs(b.y2 - a.y1));
      const gapZ = Math.min(Math.abs(a.z2 - b.z1), Math.abs(b.z2 - a.z1));
      let axis: Axis | null = null;
      let area = 0;
      if (gapX <= eps && oy > 1 && oz > 1) { axis = "x"; area = oy * oz; }
      else if (gapY <= eps && ox > 1 && oz > 1) { axis = "y"; area = ox * oz; }
      else if (gapZ <= eps && ox > 1 && oy > 1) { axis = "z"; area = ox * oy; }
      if (!axis) continue;
      const id = `${modules[i].id}-${modules[j].id}-${axis}`;
      const type = overrides[id] ?? defaultJoint(axis, area, modules[i], modules[j]);
      const axisFactor = axis === "z" ? 1.2 : 0.82;
      const demand = (base * area * axisFactor) / 1000;
      const capacity = input.connectionCapacity * jointFactor[type].cap * jointFactor[type].duct;
      contacts.push({ id, a: modules[i].id, b: modules[j].id, axis, area, type, demand, utilization: demand / capacity });
    }
  }
  return contacts.sort((p, q) => q.utilization - p.utilization);
}

function evaluate(input: Inputs, modules: Module[], scenario: Scenario, contacts: Contact[]) {
  const areaBuilt = modules.reduce((s, m) => s + m.w * m.d, 0);
  const volumeUse = modules.reduce((s, m) => s + m.w * m.d * m.h, 0);
  const cavernVolume = input.cavernLength * input.cavernWidth * input.cavernHeight;
  const density = areaBuilt / input.targetArea;
  const voidRatio = 1 - volumeUse / Math.max(cavernVolume, 1);
  const ext = attenuationExternal(input);
  const internal = attenuationInternal(input);
  const seis = seismicResponse(input);
  const transmitted = scenario === "external" ? ext.moduleKpa : scenario === "internal" ? internal.moduleKpa : seis.moduleAccG * 100;
  const maxUtil = contacts.length ? Math.max(...contacts.map((c) => c.utilization)) : 0;
  const avgUtil = contacts.length ? contacts.reduce((s, c) => s + c.utilization, 0) / contacts.length : 0;
  const blastScore = scenario === "seismic"
    ? clamp(100 - seis.moduleAccG * 70 - relu(seis.dispRatio - 0.8) * 90 - maxUtil * 8, 0, 100)
    : clamp(100 - transmitted * 1.05 - maxUtil * 16 + input.connectionDuctility * 1.4, 0, 100);
  const layoutScore = clamp(45 + density * 42 + voidRatio * 16 + Math.min(contacts.length, 90) * 0.08 - relu(modules.length - 180) * 0.04, 0, 100);
  const constructScore = clamp(96 - modules.length * 0.07 - input.floors * 2.5 - input.auxeticThickness * 5 - contacts.length * 0.025, 0, 100);
  const jointReserve = clamp(100 - maxUtil * 100, 0, 100);
  const overall = clamp(blastScore * 0.48 + layoutScore * 0.2 + constructScore * 0.12 + jointReserve * 0.2, 0, 100);
  const cost = estimateCost(input, modules, contacts);
  return { areaBuilt, volumeUse, cavernVolume, density, voidRatio, ext, internal, seis, transmitted, maxUtil, avgUtil, blastScore, layoutScore, constructScore, jointReserve, overall, cost };
}

function estimateCost(input: Inputs, modules: Module[], contacts: Contact[]) {
  const moduleM2 = modules.reduce((s, m) => s + m.w * m.d, 0);
  const cavernM3 = input.cavernLength * input.cavernWidth * input.cavernHeight;
  const shellArea = 2 * (input.cavernLength * input.cavernWidth + input.cavernLength * input.cavernHeight + input.cavernWidth * input.cavernHeight);
  const moduleCost = (moduleM2 / 100) * input.unitModuleCost;
  const excavationCost = cavernM3 * input.cavernCost / 100;
  const panelCost = shellArea * input.panelCost / 100;
  const jointCostTotal = contacts.reduce((s, c) => s + input.jointCost * jointFactor[c.type].cost * Math.max(1, c.area / 10), 0);
  const missionScale = Math.pow(Math.max(moduleM2, 1) / 10000, 0.85);
  const c4iSystemCost = input.c4iSystemCost * missionScale;
  const lifeSupportCost = input.lifeSupportCost * missionScale;
  const commsElectronicsCost = input.commsElectronicsCost * missionScale;
  const specialProtectionCost = input.specialProtectionCost * missionScale;
  const directCost = moduleCost + excavationCost + panelCost + jointCostTotal + c4iSystemCost + lifeSupportCost + commsElectronicsCost + specialProtectionCost;
  const riskPremium = (input.rockQuality < 55 ? 0.20 : 0.10) * directCost;
  const total = directCost + riskPremium;
  return { moduleCost, excavationCost, panelCost, jointCostTotal, c4iSystemCost, lifeSupportCost, commsElectronicsCost, specialProtectionCost, riskPremium, total };
}

function runReluOptimization(input: Inputs, scenario: Scenario) {
  const candidates: Array<{ input: Inputs; score: number; objective: number; modules: number; cost: number; maxUtil: number }> = [];
  const floorsSet = [Math.max(1, input.floors - 1), input.floors, Math.min(5, input.floors + 1)];
  const auxSet = [input.auxeticThickness, input.auxeticThickness + 0.15, input.auxeticThickness + 0.3];
  const gapSet = [input.airGap, input.airGap + 0.3, input.airGap + 0.6];
  const staggerSet = [0.15, 0.35, 0.55];
  const rotationSet = [0.25, 0.5, 0.7];
  const springSet = [1.6, 2.2, 3.4];

  for (const floors of floorsSet) for (const auxeticThickness of auxSet) for (const airGap of gapSet) for (const stagger of staggerSet) for (const rotationRatio of rotationSet) for (const springFreq of springSet) {
    const trial: Inputs = {
      ...input,
      floors,
      auxeticThickness: clamp(auxeticThickness, 0.1, 1.2),
      airGap: clamp(airGap, 0.1, 2.5),
      stagger,
      rotationRatio,
      springFreq,
    };
    const modules = generateModules(trial);
    const contacts = detectContacts(modules, trial, scenario, {});
    const ev = evaluate(trial, modules, scenario, contacts);
    const areaPenalty = relu(0.96 - ev.density) * 48;
    const jointPenalty = relu(ev.maxUtil - 0.82) * 72;
    const responsePenalty = relu((scenario === "seismic" ? ev.seis.moduleAccG / 0.55 : ev.transmitted / 45) - 1) * 38;
    const costPenalty = ev.cost.total / 10000;
    const objective = areaPenalty + jointPenalty + responsePenalty + costPenalty - ev.overall * 0.18;
    candidates.push({ input: trial, score: ev.overall, objective, modules: modules.length, cost: ev.cost.total, maxUtil: ev.maxUtil });
  }
  return candidates.sort((a, b) => a.objective - b.objective)[0];
}

function NumberInput({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <label className={styles.control}>
      <span>{label}<b>{nfmt(value, step < 1 ? 2 : 0)} {unit}</b></span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function Cuboid({ m, selected, onClick }: { m: Module; selected: boolean; onClick: () => void }) {
  const dim = moduleDims(m);
  const style = {
    "--x": `${m.x}px`,
    "--y": `${m.y}px`,
    "--z": `${m.z}px`,
    "--w": `${dim.w}px`,
    "--d": `${dim.d}px`,
    "--h": `${dim.h}px`,
  } as CSSProperties;
  return (
    <button className={`${styles.cuboid} ${styles[moduleClass[m.type]]} ${selected ? styles.selectedCuboid : ""}`} style={style} onClick={onClick} title={`M${m.id} / ${m.type} / (${m.x.toFixed(1)}, ${m.y.toFixed(1)}, ${m.z.toFixed(1)})`}>
      <span className={`${styles.face} ${styles.front}`}>{m.type}<i>M{m.id}</i></span>
      <span className={`${styles.face} ${styles.back}`} />
      <span className={`${styles.face} ${styles.right}`} />
      <span className={`${styles.face} ${styles.left}`} />
      <span className={`${styles.face} ${styles.top}`} />
      <span className={`${styles.face} ${styles.bottom}`} />
    </button>
  );
}

function StackingScene({ input, modules, contacts, selectedModule, setSelectedModule, view, setView }: {
  input: Inputs;
  modules: Module[];
  contacts: Contact[];
  selectedModule: number | null;
  setSelectedModule: (id: number | null) => void;
  view: { rx: number; ry: number; zoom: number };
  setView: (v: { rx: number; ry: number; zoom: number }) => void;
}) {
  const [drag, setDrag] = useState<{ x: number; y: number; rx: number; ry: number } | null>(null);
  const scale = Math.min(3.2, Math.max(1.4, 360 / Math.max(input.cavernLength, input.cavernWidth)));
  const selectedContacts = contacts.filter((c) => c.a === selectedModule || c.b === selectedModule).slice(0, 18);

  const pointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setView({ ...view, ry: drag.ry + (e.clientX - drag.x) * 0.35, rx: clamp(drag.rx - (e.clientY - drag.y) * 0.28, -80, 80) });
  };

  return (
    <div className={styles.sceneWrap}>
      <div className={styles.sceneToolbar}>
        <span>Drag to orbit · X/Y/Z free view</span>
        <button onClick={() => setView({ rx: 58, ry: -36, zoom: 1 })}>Iso</button>
        <button onClick={() => setView({ rx: 90, ry: 0, zoom: 1 })}>Top</button>
        <button onClick={() => setView({ rx: 12, ry: 0, zoom: 1 })}>Front</button>
      </div>
      <div
        className={styles.sceneViewport}
        onPointerDown={(e) => setDrag({ x: e.clientX, y: e.clientY, rx: view.rx, ry: view.ry })}
        onPointerMove={pointerMove}
        onPointerUp={() => setDrag(null)}
        onPointerLeave={() => setDrag(null)}
      >
        <div
          className={styles.world}
          style={{
            transform: `translate(-50%, -50%) scale(${view.zoom * scale}) rotateX(${view.rx}deg) rotateZ(${view.ry}deg)`,
            width: input.cavernWidth,
            height: input.cavernLength,
            ["--cavernH" as string]: `${input.cavernHeight}px`,
          }}
        >
          <div className={styles.floorGrid} />
          <div className={styles.cavernBox}><span /></div>
          {modules.map((m) => <Cuboid key={m.id} m={m} selected={selectedModule === m.id} onClick={() => setSelectedModule(m.id)} />)}
        </div>
      </div>
      <div className={styles.viewControls}>
        <NumberInput label="Rotate X" value={view.rx} min={-80} max={90} step={1} unit="°" onChange={(v) => setView({ ...view, rx: v })} />
        <NumberInput label="Rotate Z" value={view.ry} min={-180} max={180} step={1} unit="°" onChange={(v) => setView({ ...view, ry: v })} />
        <NumberInput label="Zoom" value={view.zoom} min={0.65} max={1.8} step={0.05} unit="x" onChange={(v) => setView({ ...view, zoom: v })} />
      </div>
      <div className={styles.contactStrip}>
        <b>{selectedModule ? `M${selectedModule} 접촉부 ${selectedContacts.length}개` : `전체 접촉부 ${contacts.length}개`}</b>
        <span>가장 큰 utilization {nfmt((contacts[0]?.utilization ?? 0) * 100, 1)}%</span>
      </div>
    </div>
  );
}

function AuxeticPreview({ input }: { input: Inputs }) {
  const cells = useMemo(() => {
    const out: string[] = [];
    const cols = 8;
    const rows = 5;
    const w = 42;
    const h = 34;
    const notch = clamp((70 - input.reentrantAngle) * 0.35 + 11, 8, 24);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 12 + c * w;
        const y = 14 + r * h;
        out.push(`${x},${y} ${x + w * 0.32},${y} ${x + w * 0.5 - notch},${y + h * 0.5} ${x + w * 0.32},${y + h} ${x},${y + h} ${x + w * 0.18},${y + h * 0.5}`);
      }
    }
    return out;
  }, [input.reentrantAngle]);
  return (
    <svg className={styles.auxeticSvg} viewBox="0 0 370 210" role="img" aria-label="Auxetic re-entrant panel preview">
      <rect x="6" y="8" width="358" height="194" rx="14" className={styles.svgFrame} />
      {cells.map((p, i) => <polygon key={i} points={p} className={styles.auxCell} />)}
    </svg>
  );
}

function SectionStack({ input, scenario }: { input: Inputs; scenario: Scenario }) {
  const ext = attenuationExternal(input);
  const internal = attenuationInternal(input);
  const seis = seismicResponse(input);
  const values = scenario === "external"
    ? [input.extPeakKpa, ext.cavernKpa, ext.cavernKpa * ext.auxeticFactor, ext.panelKpa, ext.moduleKpa]
    : scenario === "internal"
      ? [input.internalPeakKpa, input.internalPeakKpa * internal.auxeticFactor, internal.panelKpa, internal.moduleKpa]
      : [input.seismicPga, input.seismicPga * seis.transmissibility, seis.moduleAccG];
  const labels = scenario === "external"
    ? ["산체 외부 입력", "암반 통과 후", "오세틱 패널 후", "공동+내피 후", "모듈 전달값"]
    : scenario === "internal"
      ? ["공동 내부 입력", "오세틱 패널 후", "공동+내피 후", "모듈 전달값"]
      : ["지반 PGA", "절연계 응답", "모듈 가속도"];
  return <div className={styles.stackCard}>{values.map((v, i) => <div key={labels[i]} className={styles.stackRow}><span>{labels[i]}</span><b>{nfmt(v, scenario === "seismic" ? 2 : 1)}{scenario === "seismic" ? " g" : " kPa"}</b><i style={{ width: `${clamp((v / Math.max(...values)) * 100, 4, 100)}%` }} /></div>)}</div>;
}

export default function ExterraParametricDefensePage() {
  const [input, setInput] = useState<Inputs>(INITIAL);
  const [scenario, setScenario] = useState<Scenario>("external");
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [jointOverrides, setJointOverrides] = useState<Record<string, JointType>>({});
  const [view, setView] = useState({ rx: 58, ry: -36, zoom: 1 });
  const [opt, setOpt] = useState<ReturnType<typeof runReluOptimization> | null>(null);

  const modules = useMemo(() => generateModules(input), [input]);
  const contacts = useMemo(() => detectContacts(modules, input, scenario, jointOverrides), [modules, input, scenario, jointOverrides]);
  const evals = useMemo(() => evaluate(input, modules, scenario, contacts), [input, modules, scenario, contacts]);
  const selectedContactObj = contacts.find((c) => c.id === selectedContact) ?? contacts[0];
  const selectedModuleObj = modules.find((m) => m.id === selectedModule);
  const selectedModuleContacts = selectedModule ? contacts.filter((c) => c.a === selectedModule || c.b === selectedModule) : contacts;

  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) => setInput((p) => ({ ...p, [key]: value }));
  const applyOptimization = () => {
    const best = runReluOptimization(input, scenario);
    setOpt(best);
    setInput(best.input);
    setJointOverrides({});
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>EXTERRA Parametric Defense Lab</span>
          <h1>3D 모듈 방호 랩</h1>
          <p>10,000㎡급 산악 내부 시설을 컨테이너형 철제 모듈로 배치하고, 접촉부별 접합 형식, 오세틱 방호 패널, 암반 피복, 생존설비, 지휘통제·통신전자 시스템까지 함께 비교합니다.</p>
          <div className={styles.heroActions}>
            <button onClick={() => { setInput(INITIAL); setJointOverrides({}); setOpt(null); }}>Reset baseline</button>
            <button className={styles.ghost} onClick={applyOptimization}>ReLU optimizer</button>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.scoreRing} style={{ background: `conic-gradient(#111 ${evals.overall * 3.6}deg, #e5e7eb 0deg)` }}><div><b>{Math.round(evals.overall)}</b><span>{scoreLabel(evals.overall)}</span></div></div>
          <div className={styles.miniStats}>
            <p><span>Built area</span><b>{nfmt(evals.areaBuilt, 0)}㎡</b></p>
            <p><span>Modules / Contacts</span><b>{modules.length} / {contacts.length}</b></p>
            <p><span>Estimated cost</span><b>{nfmt(evals.cost.total, 0)} 억원</b></p>
          </div>
        </div>
      </section>

      <section className={styles.tabs}>{(["external", "internal", "seismic"] as Scenario[]).map((s) => <button key={s} className={scenario === s ? styles.activeTab : ""} onClick={() => setScenario(s)}>{s === "external" ? "외부 산체 충격" : s === "internal" ? "공동 내부 폭압" : "지진 하중"}</button>)}</section>

      <section className={styles.grid}>
        <aside className={styles.controlsPanel}>
          <h2>Parametric inputs</h2>
          <h3>01. Facility scale</h3>
          <NumberInput label="목표 연면적" value={input.targetArea} min={4000} max={16000} step={250} unit="㎡" onChange={(v) => set("targetArea", v)} />
          <NumberInput label="공동 길이" value={input.cavernLength} min={80} max={260} step={5} unit="m" onChange={(v) => set("cavernLength", v)} />
          <NumberInput label="공동 폭" value={input.cavernWidth} min={28} max={90} step={2} unit="m" onChange={(v) => set("cavernWidth", v)} />
          <NumberInput label="공동 높이" value={input.cavernHeight} min={12} max={48} step={2} unit="m" onChange={(v) => set("cavernHeight", v)} />
          <NumberInput label="층수" value={input.floors} min={1} max={5} step={1} unit="floors" onChange={(v) => set("floors", v)} />

          <h3>02. 3D stacking</h3>
          <NumberInput label="모듈 폭" value={input.moduleW} min={6} max={18} step={1} unit="m" onChange={(v) => set("moduleW", v)} />
          <NumberInput label="모듈 깊이" value={input.moduleD} min={5} max={16} step={1} unit="m" onChange={(v) => set("moduleD", v)} />
          <NumberInput label="모듈 높이" value={input.moduleH} min={3} max={8} step={0.5} unit="m" onChange={(v) => set("moduleH", v)} />
          <NumberInput label="통로/완충 간격" value={input.aisle} min={1} max={6} step={0.5} unit="m" onChange={(v) => set("aisle", v)} />
          <NumberInput label="교차 offset" value={input.stagger} min={0} max={0.8} step={0.05} unit="ratio" onChange={(v) => set("stagger", v)} />
          <NumberInput label="포개짐 정도" value={input.stackOverlap} min={0} max={0.38} step={0.02} unit="ratio" onChange={(v) => set("stackOverlap", v)} />
          <NumberInput label="90도 회전 비율" value={input.rotationRatio} min={0} max={0.85} step={0.05} unit="ratio" onChange={(v) => set("rotationRatio", v)} />

          <h3>03. Rock + panel</h3>
          <NumberInput label="상부 암반 피복" value={input.rockCover} min={40} max={420} step={10} unit="m" onChange={(v) => set("rockCover", v)} />
          <NumberInput label="암반 품질 RQD" value={input.rockQuality} min={25} max={95} step={1} unit="%" onChange={(v) => set("rockQuality", v)} />
          <NumberInput label="절리 간격" value={input.jointSpacing} min={0.3} max={4} step={0.1} unit="m" onChange={(v) => set("jointSpacing", v)} />
          <NumberInput label="Auxetic 두께" value={input.auxeticThickness} min={0.1} max={1.2} step={0.05} unit="m" onChange={(v) => set("auxeticThickness", v)} />
          <NumberInput label="Re-entrant angle" value={input.reentrantAngle} min={35} max={80} step={1} unit="°" onChange={(v) => set("reentrantAngle", v)} />
          <NumberInput label="Air gap" value={input.airGap} min={0.1} max={2.5} step={0.1} unit="m" onChange={(v) => set("airGap", v)} />
          <NumberInput label="Armox 내피" value={input.armoxThickness} min={0.01} max={0.08} step={0.005} unit="m" onChange={(v) => set("armoxThickness", v)} />
          <NumberInput label="접합부 기본용량" value={input.connectionCapacity} min={200} max={1800} step={25} unit="kN" onChange={(v) => set("connectionCapacity", v)} />

          <h3>04. Load + cost</h3>
          <NumberInput label="외부 등가 폭압" value={input.extPeakKpa} min={50} max={600} step={5} unit="kPa" onChange={(v) => set("extPeakKpa", v)} />
          <NumberInput label="공동 내부 폭압" value={input.internalPeakKpa} min={10} max={250} step={5} unit="kPa" onChange={(v) => set("internalPeakKpa", v)} />
          <NumberInput label="설계 PGA" value={input.seismicPga} min={0.05} max={0.8} step={0.01} unit="g" onChange={(v) => set("seismicPga", v)} />
          <NumberInput label="스프링 고유진동수" value={input.springFreq} min={0.8} max={6} step={0.1} unit="Hz" onChange={(v) => set("springFreq", v)} />
          <NumberInput label="감쇠비" value={input.damping} min={0.01} max={0.25} step={0.01} unit="ζ" onChange={(v) => set("damping", v)} />
          <NumberInput label="모듈 단가" value={input.unitModuleCost} min={2} max={12} step={0.2} unit="억원/100㎡" onChange={(v) => set("unitModuleCost", v)} />

          <h3>05. Mission systems</h3>
          <NumberInput label="지휘통제 시스템" value={input.c4iSystemCost} min={200} max={2400} step={50} unit="억원/10,000㎡" onChange={(v) => set("c4iSystemCost", v)} />
          <NumberInput label="생존설비" value={input.lifeSupportCost} min={150} max={1600} step={50} unit="억원/10,000㎡" onChange={(v) => set("lifeSupportCost", v)} />
          <NumberInput label="통신·전자장비" value={input.commsElectronicsCost} min={150} max={2000} step={50} unit="억원/10,000㎡" onChange={(v) => set("commsElectronicsCost", v)} />
          <NumberInput label="특수 방호설비" value={input.specialProtectionCost} min={200} max={2400} step={50} unit="억원/10,000㎡" onChange={(v) => set("specialProtectionCost", v)} />
        </aside>

        <section className={styles.workspace}>
          <div className={styles.cardHeader}><div><span className={styles.kicker}>3D stacking plan</span><h2>자유 회전 가능한 XYZ 모듈 배치</h2></div><b className={scoreClass(evals.overall)}>{scoreLabel(evals.overall)}</b></div>
          <StackingScene input={input} modules={modules} contacts={contacts} selectedModule={selectedModule} setSelectedModule={setSelectedModule} view={view} setView={setView} />

          <div className={styles.cards4}>
            <article className={styles.metricCard}><span>연면적 충족률</span><b>{nfmt(evals.density * 100, 1)}%</b><small>생성 {nfmt(evals.areaBuilt, 0)}㎡ / 목표 {nfmt(input.targetArea, 0)}㎡</small></article>
            <article className={styles.metricCard}><span>최대 접합 utilization</span><b>{nfmt(evals.maxUtil * 100, 1)}%</b><small>선택 접합부별 형식 변경 가능</small></article>
            <article className={styles.metricCard}><span>전달 응답</span><b>{scenario === "seismic" ? `${nfmt(evals.seis.moduleAccG, 2)} g` : `${nfmt(evals.transmitted, 1)} kPa`}</b><small>{scenario === "seismic" ? `Stroke ratio ${nfmt(evals.seis.dispRatio * 100, 1)}%` : "module-side equivalent pressure"}</small></article>
            <article className={styles.metricCard}><span>예상 건설비</span><b>{nfmt(evals.cost.total, 0)} 억원</b><small>구조체·접합부·생존·C4I·통신전자 포함</small></article>
          </div>

          <div className={styles.twoColWide}>
            <article className={styles.panelCard}>
              <div className={styles.cardHeader}><h2>Contact & joint editor</h2><span>{selectedModuleObj ? `M${selectedModuleObj.id} ${selectedModuleObj.type}` : "All modules"}</span></div>
              <div className={styles.contactTable}>
                {selectedModuleContacts.slice(0, 12).map((c) => (
                  <button key={c.id} className={`${styles.contactRow} ${selectedContactObj?.id === c.id ? styles.activeContact : ""}`} onClick={() => setSelectedContact(c.id)}>
                    <span>M{c.a} ↔ M{c.b}</span><em>{c.axis.toUpperCase()} face · {nfmt(c.area, 1)}㎡</em><b>{nfmt(c.utilization * 100, 1)}%</b>
                  </button>
                ))}
              </div>
              {selectedContactObj && (
                <div className={styles.jointEditor}>
                  <h3>M{selectedContactObj.a} - M{selectedContactObj.b} 접합부 형식</h3>
                  <div className={styles.jointButtons}>{(Object.keys(jointNames) as JointType[]).map((jt) => <button key={jt} className={selectedContactObj.type === jt ? styles.activeJoint : ""} onClick={() => setJointOverrides((p) => ({ ...p, [selectedContactObj.id]: jt }))}>{jointNames[jt]}</button>)}</div>
                  <p>{jointFactor[selectedContactObj.type].note}</p>
                </div>
              )}
            </article>

            <article className={styles.panelCard}>
              <div className={styles.cardHeader}><h2>ReLU optimization result</h2><span>penalty-based</span></div>
              <p className={styles.note}>ReLU optimizer는 목표 연면적 부족, 접합부 초과 utilization, 전달응답 초과분만 양수 penalty로 계산하고, 비용과 종합점수를 함께 고려해 후보안을 고릅니다.</p>
              <button className={styles.optimizeButton} onClick={applyOptimization}>최적 후보 적용</button>
              {opt ? <div className={styles.optBox}><p><span>Objective</span><b>{nfmt(opt.objective, 2)}</b></p><p><span>Score</span><b>{nfmt(opt.score, 1)}</b></p><p><span>Modules</span><b>{opt.modules}</b></p><p><span>Cost</span><b>{nfmt(opt.cost, 0)} 억원</b></p><p><span>Max joint util.</span><b>{nfmt(opt.maxUtil * 100, 1)}%</b></p></div> : <div className={styles.emptyOpt}>아직 최적화를 실행하지 않았습니다.</div>}
            </article>
          </div>

          <div className={styles.twoCol}>
            <article className={styles.panelCard}><div className={styles.cardHeader}><h2>Auxetic panel preview</h2><span>{input.reentrantAngle}°</span></div><AuxeticPreview input={input} /><p className={styles.note}>Re-entrant cell의 각도와 패널 두께가 바뀌면 내부 공동으로 전달되는 등가응답과 패널 비용이 함께 바뀌도록 연결했습니다.</p></article>
            <article className={styles.panelCard}><div className={styles.cardHeader}><h2>Load path attenuation</h2><span>{scenario}</span></div><SectionStack input={input} scenario={scenario} /><p className={styles.note}>산체, 공동, 오세틱 패널, air gap, 내피, 스프링 모듈을 순차적인 하중 전달 경로로 표시합니다.</p></article>
          </div>

          <article className={styles.panelCard}>
            <div className={styles.cardHeader}><h2>Performance dashboard</h2><span>brief interpretation</span></div>
            <div className={styles.barGrid}>
              {[
                ["Blast / seismic response", evals.blastScore, "폭압 또는 지진 입력이 모듈 쪽으로 얼마나 낮아졌는지 보는 항목입니다."],
                ["Layout efficiency", evals.layoutScore, "목표 연면적, 공동 내 여유공간, 접촉부 연결성을 함께 봅니다."],
                ["Constructability", evals.constructScore, "모듈 수, 층수, 패널 두께, 접합부와 임무설비 증가에 따른 시공 부담을 반영합니다."],
                ["Joint reserve", evals.jointReserve, "가장 불리한 접합부의 demand/capacity 여유율입니다."],
              ].map(([label, value, desc]) => <div className={styles.barRow} key={label as string}><span>{label as string}<small>{desc as string}</small></span><div><i style={{ width: `${value}%` }} /></div><b>{Math.round(value as number)}</b></div>)}
            </div>
            <div className={styles.costGrid}>
              <p><span>모듈 제작·설치</span><b>{nfmt(evals.cost.moduleCost, 0)} 억원</b></p>
              <p><span>암반 굴착·공동 형성</span><b>{nfmt(evals.cost.excavationCost, 0)} 억원</b></p>
              <p><span>오세틱+내피 패널</span><b>{nfmt(evals.cost.panelCost, 0)} 억원</b></p>
              <p><span>접합부·절연장치</span><b>{nfmt(evals.cost.jointCostTotal, 0)} 억원</b></p>
              <p><span>지휘통제 시스템</span><b>{nfmt(evals.cost.c4iSystemCost, 0)} 억원</b></p>
              <p><span>생존설비</span><b>{nfmt(evals.cost.lifeSupportCost, 0)} 억원</b></p>
              <p><span>통신·전자장비</span><b>{nfmt(evals.cost.commsElectronicsCost, 0)} 억원</b></p>
              <p><span>특수 방호설비</span><b>{nfmt(evals.cost.specialProtectionCost, 0)} 억원</b></p>
              <p><span>리스크 예비비</span><b>{nfmt(evals.cost.riskPremium, 0)} 억원</b></p>
            </div>
          </article>

          <article className={styles.disclaimer}>
            <h2>해석 범위</h2>
            <p>이 페이지는 발표와 개념설계 단계에서 배치, 접합부, 방폭 패널, 지진 절연의 설계 방향을 비교하기 위한 surrogate 모델입니다. 실제 방호성능과 총사업비 확정에는 현장 지반조사, 절리망 모델, 3D 암반 동역학, 비선형 접합부 해석, 장비 배치계획, 전력·공조·통신 이중화, 운영인력·보급계획 검토가 별도로 필요합니다.</p>
          </article>
        </section>
      </section>
    </main>
  );
}
