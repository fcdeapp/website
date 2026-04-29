"use client";

import React, { useMemo, useState } from "react";
import styles from "../../styles/pages/ExterraParametricDefensePage.module.css";

type Scenario = "external" | "internal" | "seismic";
type ModuleType = "C4I" | "MEP" | "Habitat" | "Storage" | "Core";
type Module = { id: number; x: number; y: number; z: number; w: number; d: number; h: number; type: ModuleType };
type Vec3 = { x: number; y: number; z: number };

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
  scaledDistance: number;
  internalPeakKpa: number;
  seismicPga: number;
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
  scaledDistance: 4.5,
  internalPeakKpa: 80,
  seismicPga: 0.3,
};

const modulePalette: Record<ModuleType, string> = {
  C4I: "C4I",
  MEP: "MEP",
  Habitat: "HAB",
  Storage: "STO",
  Core: "CORE",
};

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function nfmt(v: number, digits = 1) {
  return Number.isFinite(v) ? v.toLocaleString("ko-KR", { maximumFractionDigits: digits }) : "-";
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
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

function moduleType(i: number, x: number, y: number, z: number): ModuleType {
  if (i % 17 === 0) return "Core";
  if (z === 0 && (x + y) % 5 === 0) return "MEP";
  if (i % 7 === 0) return "Storage";
  if (i % 3 === 0) return "C4I";
  return "Habitat";
}

function generateModules(input: Inputs): Module[] {
  const usableW = input.cavernWidth - input.aisle * 2;
  const usableL = input.cavernLength - input.aisle * 2;
  const cols = Math.max(1, Math.floor(usableW / (input.moduleW + input.aisle)));
  const rows = Math.max(1, Math.floor(usableL / (input.moduleD + input.aisle)));
  const maxFloorsByHeight = Math.max(1, Math.floor(input.cavernHeight / (input.moduleH + 1.2)));
  const floors = Math.min(input.floors, maxFloorsByHeight);
  const perFloor = rows * cols;
  const needed = Math.ceil(input.targetArea / (input.moduleW * input.moduleD));
  const total = Math.min(needed, perFloor * floors);

  const out: Module[] = [];
  let id = 1;
  for (let z = 0; z < floors; z++) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (out.length >= total) return out;
        // Tetris/Jenga 느낌: 일부 슬롯을 비워 공동, 피난축, 설비축을 확보한다.
        if ((r + c + z) % 11 === 0 && out.length < total - 5) continue;
        out.push({
          id: id++,
          x: input.aisle + c * (input.moduleW + input.aisle),
          y: input.aisle + r * (input.moduleD + input.aisle),
          z: z * (input.moduleH + 1.2),
          w: input.moduleW,
          d: input.moduleD,
          h: input.moduleH,
          type: moduleType(id, c, r, z),
        });
      }
    }
  }
  return out;
}

function attenuationExternal(input: Inputs) {
  // 개념설계용 screening surrogate. 실제 산체-공동 동역학은 3D rock mechanics + explicit dynamics가 필요하다.
  const coverFactor = Math.exp(-input.rockCover / 135);
  const rqdFactor = lerp(1.15, 0.42, input.rockQuality / 100);
  const jointFactor = clamp(1.15 - input.jointSpacing / 3.5, 0.55, 1.05);
  const impedanceScatter = clamp(coverFactor * rqdFactor * jointFactor, 0.015, 0.55);

  const auxeticFactor = clamp(1 - input.auxeticThickness * 0.38 - (70 - Math.abs(input.reentrantAngle - 55)) / 360, 0.48, 0.92);
  const gapFactor = clamp(1 - input.airGap * 0.18, 0.62, 0.96);
  const linerFactor = clamp(1 - input.armoxThickness * 4.5, 0.58, 0.93);
  const springFactor = clamp(input.springFreq / (8 + input.springFreq) + input.damping * 0.9, 0.22, 0.72);

  const cavernKpa = input.extPeakKpa * impedanceScatter;
  const panelKpa = cavernKpa * auxeticFactor * gapFactor * linerFactor;
  const moduleKpa = panelKpa * springFactor;
  return { impedanceScatter, auxeticFactor, gapFactor, linerFactor, springFactor, cavernKpa, panelKpa, moduleKpa };
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
  const omega = 2 * Math.PI * input.springFreq;
  const forcingHz = 3.0;
  const r = forcingHz / Math.max(input.springFreq, 0.1);
  const z = input.damping;
  const transmissibility = Math.sqrt((1 + (2 * z * r) ** 2) / ((1 - r * r) ** 2 + (2 * z * r) ** 2));
  const moduleAccG = input.seismicPga * clamp(transmissibility, 0.18, 2.2);
  const dispM = (moduleAccG * 9.81) / Math.max(omega * omega, 0.01);
  return { transmissibility: clamp(transmissibility, 0.18, 2.2), moduleAccG, dispM, dispRatio: dispM / input.springStroke };
}

function evaluate(input: Inputs, modules: Module[], scenario: Scenario) {
  const areaBuilt = modules.reduce((s, m) => s + m.w * m.d, 0);
  const volumeUse = modules.reduce((s, m) => s + m.w * m.d * m.h, 0);
  const cavernVolume = input.cavernLength * input.cavernWidth * input.cavernHeight;
  const density = areaBuilt / input.targetArea;
  const voidRatio = 1 - volumeUse / Math.max(cavernVolume, 1);
  const connDemand = scenario === "external"
    ? attenuationExternal(input).panelKpa * (input.moduleW * input.moduleH) / 1000
    : scenario === "internal"
      ? attenuationInternal(input).panelKpa * (input.moduleW * input.moduleH) / 1000
      : input.seismicPga * 9.81 * input.moduleW * input.moduleD * 0.85;
  const connUtil = connDemand / input.connectionCapacity;

  const ext = attenuationExternal(input);
  const internal = attenuationInternal(input);
  const seis = seismicResponse(input);
  const transmittedKpa = scenario === "external" ? ext.moduleKpa : scenario === "internal" ? internal.moduleKpa : seis.moduleAccG * 100;

  const blastScore = scenario === "seismic"
    ? clamp(100 - seis.moduleAccG * 70 - Math.max(0, seis.dispRatio - 0.8) * 90, 0, 100)
    : clamp(100 - transmittedKpa * 1.1 - connUtil * 18 + input.connectionDuctility * 1.5, 0, 100);
  const layoutScore = clamp(45 + density * 42 + voidRatio * 16 - Math.max(0, modules.length - 160) * 0.04, 0, 100);
  const constructScore = clamp(96 - modules.length * 0.09 - input.floors * 3 - input.auxeticThickness * 5, 0, 100);
  const overall = clamp(blastScore * 0.52 + layoutScore * 0.23 + constructScore * 0.15 + (100 - connUtil * 100) * 0.10, 0, 100);

  return { areaBuilt, volumeUse, cavernVolume, density, voidRatio, connDemand, connUtil, ext, internal, seis, transmittedKpa, blastScore, layoutScore, constructScore, overall };
}

function rangeColor(v: number, min: number, max: number) {
  const t = clamp((v - min) / (max - min), 0, 1);
  return `rgba(${Math.round(30 + t * 170)}, ${Math.round(50 + (1 - t) * 130)}, ${Math.round(90 + (1 - t) * 70)}, 0.88)`;
}

function AuxeticPreview({ input }: { input: Inputs }) {
  const cells = useMemo(() => {
    const list: string[] = [];
    const cols = 8;
    const rows = 5;
    const w = 42;
    const h = 34;
    const notch = clamp((70 - input.reentrantAngle) * 0.35 + 11, 8, 24);
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 12 + c * w;
        const y = 14 + r * h;
        const p = [
          `${x},${y}`,
          `${x + w * 0.32},${y}`,
          `${x + w * 0.5 - notch},${y + h * 0.5}`,
          `${x + w * 0.32},${y + h}`,
          `${x},${y + h}`,
          `${x + w * 0.18},${y + h * 0.5}`,
        ].join(" ");
        list.push(p);
      }
    }
    return list;
  }, [input.reentrantAngle]);
  return (
    <svg className={styles.auxeticSvg} viewBox="0 0 370 210" role="img" aria-label="Auxetic re-entrant panel preview">
      <rect x="6" y="8" width="358" height="194" rx="14" className={styles.svgFrame} />
      {cells.map((p, i) => <polygon key={i} points={p} className={styles.auxCell} />)}
    </svg>
  );
}

function FacilityPlan({ input, modules, scenario }: { input: Inputs; modules: Module[]; scenario: Scenario }) {
  const scaleX = 100 / input.cavernLength;
  const scaleY = 100 / input.cavernWidth;
  return (
    <div className={styles.planBox}>
      <div className={styles.planRock}>
        <div className={styles.cavern}>
          {modules.map((m) => (
            <div
              key={m.id}
              className={`${styles.moduleBlock} ${styles[`zone${m.type}`] || ""}`}
              style={{
                left: `${m.y * scaleY}%`,
                top: `${m.x * scaleX}%`,
                width: `${Math.max(1.6, m.d * scaleY)}%`,
                height: `${Math.max(1.6, m.w * scaleX)}%`,
                opacity: 0.62 + m.z / Math.max(input.cavernHeight, 1) * 0.25,
              }}
              title={`${m.id} / ${m.type} / z=${m.z.toFixed(1)}m`}
            >
              {m.id % 9 === 0 ? modulePalette[m.type] : ""}
            </div>
          ))}
          <div className={styles.aisleLine} />
          {scenario === "external" && <div className={styles.externalWave} />}
          {scenario === "internal" && <div className={styles.internalWave} />}
          {scenario === "seismic" && <div className={styles.seismicWave} />}
        </div>
      </div>
    </div>
  );
}

function SectionStack({ input, scenario }: { input: Inputs; scenario: Scenario }) {
  const ext = attenuationExternal(input);
  const internal = attenuationInternal(input);
  const values = scenario === "external"
    ? [input.extPeakKpa, ext.cavernKpa, ext.cavernKpa * ext.auxeticFactor, ext.panelKpa, ext.moduleKpa]
    : scenario === "internal"
      ? [input.internalPeakKpa, input.internalPeakKpa * internal.auxeticFactor, internal.panelKpa, internal.moduleKpa]
      : [input.seismicPga, input.seismicPga * seismicResponse(input).transmissibility, seismicResponse(input).moduleAccG];
  const labels = scenario === "external"
    ? ["External event", "Rock mass", "Auxetic", "Armox + gap", "Spring module"]
    : scenario === "internal"
      ? ["Cavern event", "Auxetic", "Armox + gap", "Spring module"]
      : ["PGA input", "Isolation", "Module acc."];
  return (
    <div className={styles.stackCard}>
      {values.map((v, i) => (
        <div key={labels[i]} className={styles.stackRow}>
          <span>{labels[i]}</span>
          <b>{nfmt(v, scenario === "seismic" ? 2 : 1)}{scenario === "seismic" ? " g" : " kPa"}</b>
          <i style={{ width: `${clamp((v / Math.max(...values)) * 100, 4, 100)}%` }} />
        </div>
      ))}
    </div>
  );
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

export default function ExterraParametricDefensePage() {
  const [input, setInput] = useState<Inputs>(INITIAL);
  const [scenario, setScenario] = useState<Scenario>("external");
  const modules = useMemo(() => generateModules(input), [input]);
  const evals = useMemo(() => evaluate(input, modules, scenario), [input, modules, scenario]);

  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) => setInput((p) => ({ ...p, [key]: value }));
  const maxModules = Math.floor((input.cavernLength - input.aisle * 2) / (input.moduleD + input.aisle)) * Math.floor((input.cavernWidth - input.aisle * 2) / (input.moduleW + input.aisle)) * input.floors;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>EXTERRA Parametric Facility Lab</span>
          <h1>산악 내부 군사시설 모듈·패널·접합부 개념검토 웹페이지</h1>
          <p>
            10,000㎡급 내부 시설을 기준으로 모듈 규격, 공동 스케일, 적층 배치, Auxetic 패널, Armox 내피,
            air gap, 스프링 절연, 접합부 성능을 한 화면에서 조정하고 폭압·지진 surrogate 응답을 비교한다.
          </p>
          <div className={styles.heroActions}>
            <button onClick={() => setInput(INITIAL)}>Reset baseline</button>
            <button className={styles.ghost} onClick={() => setScenario(scenario === "external" ? "internal" : scenario === "internal" ? "seismic" : "external")}>Cycle scenario</button>
          </div>
        </div>
        <div className={styles.heroPanel}>
          <div className={styles.scoreRing} style={{ background: `conic-gradient(#111 ${evals.overall * 3.6}deg, #e5e7eb 0deg)` }}>
            <div><b>{Math.round(evals.overall)}</b><span>{scoreLabel(evals.overall)}</span></div>
          </div>
          <div className={styles.miniStats}>
            <p><span>Built area</span><b>{nfmt(evals.areaBuilt, 0)}㎡</b></p>
            <p><span>Modules</span><b>{modules.length}/{maxModules}</b></p>
            <p><span>Void ratio</span><b>{nfmt(evals.voidRatio * 100, 1)}%</b></p>
          </div>
        </div>
      </section>

      <section className={styles.tabs}>
        {(["external", "internal", "seismic"] as Scenario[]).map((s) => (
          <button key={s} className={scenario === s ? styles.activeTab : ""} onClick={() => setScenario(s)}>
            {s === "external" ? "외부 산체 충격" : s === "internal" ? "공동 내부 폭압" : "지진 하중"}
          </button>
        ))}
      </section>

      <section className={styles.grid}>
        <aside className={styles.controlsPanel}>
          <h2>Parametric inputs</h2>
          <h3>01. Facility scale</h3>
          <NumberInput label="목표 연면적" value={input.targetArea} min={4000} max={16000} step={250} unit="㎡" onChange={(v) => set("targetArea", v)} />
          <NumberInput label="공동 길이" value={input.cavernLength} min={80} max={260} step={5} unit="m" onChange={(v) => set("cavernLength", v)} />
          <NumberInput label="공동 폭" value={input.cavernWidth} min={28} max={90} step={2} unit="m" onChange={(v) => set("cavernWidth", v)} />
          <NumberInput label="공동 높이" value={input.cavernHeight} min={12} max={48} step={2} unit="m" onChange={(v) => set("cavernHeight", v)} />
          <NumberInput label="층수" value={input.floors} min={1} max={5} step={1} unit="floors" onChange={(v) => set("floors", v)} />

          <h3>02. Module system</h3>
          <NumberInput label="모듈 폭" value={input.moduleW} min={6} max={18} step={1} unit="m" onChange={(v) => set("moduleW", v)} />
          <NumberInput label="모듈 깊이" value={input.moduleD} min={5} max={16} step={1} unit="m" onChange={(v) => set("moduleD", v)} />
          <NumberInput label="모듈 높이" value={input.moduleH} min={3} max={8} step={0.5} unit="m" onChange={(v) => set("moduleH", v)} />
          <NumberInput label="통로/완충 간격" value={input.aisle} min={1} max={6} step={0.5} unit="m" onChange={(v) => set("aisle", v)} />

          <h3>03. Rock + panel + joint</h3>
          <NumberInput label="상부 암반 피복" value={input.rockCover} min={40} max={420} step={10} unit="m" onChange={(v) => set("rockCover", v)} />
          <NumberInput label="암반 품질 RQD surrogate" value={input.rockQuality} min={25} max={95} step={1} unit="%" onChange={(v) => set("rockQuality", v)} />
          <NumberInput label="절리 간격" value={input.jointSpacing} min={0.3} max={4} step={0.1} unit="m" onChange={(v) => set("jointSpacing", v)} />
          <NumberInput label="Auxetic 두께" value={input.auxeticThickness} min={0.1} max={1.2} step={0.05} unit="m" onChange={(v) => set("auxeticThickness", v)} />
          <NumberInput label="Re-entrant angle" value={input.reentrantAngle} min={35} max={80} step={1} unit="°" onChange={(v) => set("reentrantAngle", v)} />
          <NumberInput label="Air gap" value={input.airGap} min={0.1} max={2.5} step={0.1} unit="m" onChange={(v) => set("airGap", v)} />
          <NumberInput label="Armox 내피" value={input.armoxThickness} min={0.01} max={0.08} step={0.005} unit="m" onChange={(v) => set("armoxThickness", v)} />
          <NumberInput label="접합부 전단용량" value={input.connectionCapacity} min={200} max={1800} step={25} unit="kN" onChange={(v) => set("connectionCapacity", v)} />

          <h3>04. Load surrogate</h3>
          <NumberInput label="외부 등가 폭압" value={input.extPeakKpa} min={50} max={600} step={5} unit="kPa" onChange={(v) => set("extPeakKpa", v)} />
          <NumberInput label="공동 내부 등가 폭압" value={input.internalPeakKpa} min={10} max={250} step={5} unit="kPa" onChange={(v) => set("internalPeakKpa", v)} />
          <NumberInput label="설계 PGA" value={input.seismicPga} min={0.05} max={0.8} step={0.01} unit="g" onChange={(v) => set("seismicPga", v)} />
          <NumberInput label="스프링 고유진동수" value={input.springFreq} min={0.8} max={6} step={0.1} unit="Hz" onChange={(v) => set("springFreq", v)} />
          <NumberInput label="감쇠비" value={input.damping} min={0.01} max={0.25} step={0.01} unit="ζ" onChange={(v) => set("damping", v)} />
          <NumberInput label="스프링 stroke" value={input.springStroke} min={0.05} max={0.5} step={0.01} unit="m" onChange={(v) => set("springStroke", v)} />
        </aside>

        <section className={styles.workspace}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.kicker}>3D stacking plan</span>
              <h2>공동 내부 모듈 배치</h2>
            </div>
            <b className={scoreClass(evals.overall)}>{scoreLabel(evals.overall)}</b>
          </div>
          <FacilityPlan input={input} modules={modules} scenario={scenario} />

          <div className={styles.cards3}>
            <article className={styles.metricCard}>
              <span>연면적 충족률</span>
              <b>{nfmt(evals.density * 100, 1)}%</b>
              <small>목표 {nfmt(input.targetArea, 0)}㎡ / 생성 {nfmt(evals.areaBuilt, 0)}㎡</small>
            </article>
            <article className={styles.metricCard}>
              <span>접합부 utilization</span>
              <b>{nfmt(evals.connUtil * 100, 1)}%</b>
              <small>Demand {nfmt(evals.connDemand, 1)} kN / Capacity {nfmt(input.connectionCapacity, 0)} kN</small>
            </article>
            <article className={styles.metricCard}>
              <span>전달 응답</span>
              <b>{scenario === "seismic" ? `${nfmt(evals.seis.moduleAccG, 2)} g` : `${nfmt(evals.transmittedKpa, 1)} kPa`}</b>
              <small>{scenario === "seismic" ? `Stroke ratio ${nfmt(evals.seis.dispRatio * 100, 1)}%` : "module-side equivalent pressure"}</small>
            </article>
          </div>

          <div className={styles.twoCol}>
            <article className={styles.panelCard}>
              <div className={styles.cardHeader}><h2>Auxetic panel preview</h2><span>{input.reentrantAngle}°</span></div>
              <AuxeticPreview input={input} />
              <p className={styles.note}>GhPython의 re-entrant cell generator와 같은 개념으로, angle·cell size·member thickness를 바꾸며 패널 형상과 shell/beam 이상화를 연결할 수 있게 설계했다.</p>
            </article>
            <article className={styles.panelCard}>
              <div className={styles.cardHeader}><h2>Load path attenuation</h2><span>{scenario}</span></div>
              <SectionStack input={input} scenario={scenario} />
              <p className={styles.note}>산체 → Auxetic → air gap → Armox 내피 → 스프링 모듈의 단계별 감쇠를 표시한다. 수치는 설계 확정값이 아니라 비교용 surrogate이다.</p>
            </article>
          </div>

          <article className={styles.panelCard}>
            <div className={styles.cardHeader}><h2>Performance dashboard</h2><span>concept-level</span></div>
            <div className={styles.barGrid}>
              {[
                ["Blast / seismic response", evals.blastScore],
                ["Layout efficiency", evals.layoutScore],
                ["Constructability", evals.constructScore],
                ["Joint reserve", clamp(100 - evals.connUtil * 100, 0, 100)],
              ].map(([label, value]) => (
                <div className={styles.barRow} key={label as string}>
                  <span>{label as string}</span>
                  <div><i style={{ width: `${value}%`, background: rangeColor(value as number, 0, 100) }} /></div>
                  <b>{Math.round(value as number)}</b>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.disclaimer}>
            <h2>정확한 방폭성능 검증으로 넘어가기 위한 다음 단계</h2>
            <p>
              이 페이지는 학부 개념설계와 발표용 설득력을 위한 parametric screening 도구다. 실제 특정 산체·무기·침투탄·드론 공격에 대한 정확한 방호성능 판정은
              지반조사, 절리망 모델, 3D 암반 동역학, 유체-구조 연성, 관통/파편, 접합부 비선형 파괴, 내부 장비 fragility curve를 포함하는 전문 해석으로 검증해야 한다.
              따라서 UI에는 “정확한 값”처럼 보이는 단일 판정보다, 하중 경로와 민감도, 성능 여유율, 해석 한계를 같이 보여주는 방식으로 구성했다.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
