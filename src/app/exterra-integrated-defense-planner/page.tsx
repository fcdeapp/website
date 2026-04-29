"use client";

import React, {
  CSSProperties,
  PointerEvent,
  ChangeEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../../styles/pages/ExterraIntegratedDefensePlannerPage.module.css";

type Scenario = "external" | "internal" | "seismic";
type ModuleType = "C4I" | "MEP" | "Habitat" | "Storage" | "Core";
type JointType =
  | "boltedPlate"
  | "weldedFrame"
  | "springDamper"
  | "shearKey"
  | "slidingFuse";
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

type GraphicStaticsNode = {
  id: string;
  label?: string;
  x: number;
  y: number;
};

type GraphicStaticsMember = {
  id: string;
  label?: string;
  startNodeId: string;
  endNodeId: string;
  force?: number;
  forceType?: "tension" | "compression" | "zero";
};

type GraphicStaticsSupport = {
  nodeId: string;
  type?: string;
  reactionAngleDeg?: number;
};

type GraphicStaticsLoad = {
  nodeId: string;
  fx?: number;
  fy?: number;
};

type GraphicStaticsModel = {
  canvasWidth?: number;
  canvasHeight?: number;
  nodes: GraphicStaticsNode[];
  members: GraphicStaticsMember[];
  supports?: GraphicStaticsSupport[];
  loads?: GraphicStaticsLoad[];
};

type VaultSegment = {
  id: string;
  x: number;
  y: number;
  z: number;
  length: number;
  angleDeg: number;
  type: "tension" | "compression" | "zero" | "unknown";
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

  deadLoadKpa: number;
  liveLoadKpa: number;
  equipmentLoadKpa: number;
  storageLoadKpa: number;
  c4iLoadKpa: number;
  mepLoadKpa: number;

  totalConstructionMonths: number;
  mobilizationMonths: number;
  excavationMonths: number;
  liningMonths: number;
  moduleInstallMonths: number;
  mepMonths: number;
  commissioningMonths: number;

  workersPeak: number;
  dailyExcavationM3: number;
  dailyModuleInstallCount: number;
  procurementLeadArmoxDays: number;
  procurementLeadSpringDays: number;
  procurementLeadMepDays: number;

  occupancy: number;
  ventilationAch: number;
  freshAirPerPerson: number;
  ductVelocity: number;
  pipeVelocity: number;
  shaftCount: number;
  shaftAreaEach: number;
  mechRoomRatio: number;
  waterPerPersonDay: number;

  internalHeatWm2: number;
  peopleHeatW: number;
  lightingWm2: number;
  coolingSafetyFactor: number;
  targetTempC: number;
  targetRhMin: number;
  targetRhMax: number;

  criticalPowerWm2: number;
  c4iPowerWm2: number;
  mepPowerWm2: number;
  backupHours: number;
  generatorRedundancy: number;
  fuelConsumptionLPerKwh: number;

  targetIlluminanceLux: number;
  lightingEfficacyLmW: number;
  ncTarget: number;
  equipmentNoiseDb: number;
  wallStc: number;
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

  deadLoadKpa: 4.5,
  liveLoadKpa: 3.0,
  equipmentLoadKpa: 5.5,
  storageLoadKpa: 7.0,
  c4iLoadKpa: 6.5,
  mepLoadKpa: 8.0,

  totalConstructionMonths: 30,
  mobilizationMonths: 2,
  excavationMonths: 9,
  liningMonths: 5,
  moduleInstallMonths: 6,
  mepMonths: 5,
  commissioningMonths: 3,

  workersPeak: 180,
  dailyExcavationM3: 680,
  dailyModuleInstallCount: 2.5,
  procurementLeadArmoxDays: 90,
  procurementLeadSpringDays: 75,
  procurementLeadMepDays: 120,

  occupancy: 260,
  ventilationAch: 6,
  freshAirPerPerson: 45,
  ductVelocity: 7,
  pipeVelocity: 1.6,
  shaftCount: 8,
  shaftAreaEach: 3.2,
  mechRoomRatio: 0.08,
  waterPerPersonDay: 180,

  internalHeatWm2: 45,
  peopleHeatW: 120,
  lightingWm2: 10,
  coolingSafetyFactor: 1.25,
  targetTempC: 22,
  targetRhMin: 40,
  targetRhMax: 60,

  criticalPowerWm2: 95,
  c4iPowerWm2: 180,
  mepPowerWm2: 55,
  backupHours: 72,
  generatorRedundancy: 1.5,
  fuelConsumptionLPerKwh: 0.27,

  targetIlluminanceLux: 500,
  lightingEfficacyLmW: 120,
  ncTarget: 35,
  equipmentNoiseDb: 78,
  wallStc: 45,
};

const jointNames: Record<JointType, string> = {
  boltedPlate: "Bolted plate",
  weldedFrame: "Welded frame",
  springDamper: "Spring-damper",
  shearKey: "Shear key",
  slidingFuse: "Sliding fuse",
};

const jointFactor: Record<
  JointType,
  { cap: number; cost: number; duct: number; note: string }
> = {
  boltedPlate: {
    cap: 1,
    cost: 1,
    duct: 0.95,
    note: "일반 모듈 접합. 시공성은 좋지만 반복 충격에는 보강 검토가 필요합니다.",
  },
  weldedFrame: {
    cap: 1.18,
    cost: 1.22,
    duct: 0.9,
    note: "강성이 높아 직접 접촉부에 유리하지만 변형 흡수 여유는 작습니다.",
  },
  springDamper: {
    cap: 0.82,
    cost: 1.55,
    duct: 1.35,
    note: "진동·충격 전달을 낮추는 절연 접합입니다. 장비실이나 C4I 주변에 적합합니다.",
  },
  shearKey: {
    cap: 1.32,
    cost: 1.28,
    duct: 0.86,
    note: "전단 전달이 큰 면접촉부에 유리한 키 접합입니다.",
  },
  slidingFuse: {
    cap: 0.92,
    cost: 1.42,
    duct: 1.5,
    note: "큰 충격 때 일부 미끄러짐을 허용해 주구조 손상을 줄이는 fuse형 접합입니다.",
  },
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
  return Number.isFinite(v)
    ? v.toLocaleString("ko-KR", { maximumFractionDigits: digits })
    : "-";
}

function scoreLabel(score: number) {
  if (score >= 82) return "PASS";
  if (score >= 62) return "CHECK";
  return "FAIL";
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

function normalizeGraphicStaticsModel(raw: unknown): GraphicStaticsModel | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Partial<GraphicStaticsModel> & {
    truss?: Partial<GraphicStaticsModel>;
    model?: Partial<GraphicStaticsModel>;
  };
  const source = obj.nodes && obj.members ? obj : obj.truss ?? obj.model;
  if (!source?.nodes || !source?.members) return null;

  const nodes = source.nodes
    .filter((n): n is GraphicStaticsNode =>
      Boolean(n && typeof n.id === "string" && Number.isFinite(n.x) && Number.isFinite(n.y))
    )
    .map((n) => ({ id: n.id, label: n.label, x: n.x, y: n.y }));

  const nodeIds = new Set(nodes.map((n) => n.id));
  const members = source.members
    .filter((m): m is GraphicStaticsMember =>
      Boolean(
        m &&
          typeof m.id === "string" &&
          typeof m.startNodeId === "string" &&
          typeof m.endNodeId === "string" &&
          nodeIds.has(m.startNodeId) &&
          nodeIds.has(m.endNodeId)
      )
    )
    .map((m) => ({
      id: m.id,
      label: m.label,
      startNodeId: m.startNodeId,
      endNodeId: m.endNodeId,
      force: typeof m.force === "number" ? m.force : undefined,
      forceType: m.forceType,
    }));

  if (!nodes.length || !members.length) return null;

  return {
    canvasWidth: source.canvasWidth,
    canvasHeight: source.canvasHeight,
    nodes,
    members,
    supports: source.supports ?? [],
    loads: source.loads ?? [],
  };
}

function makeVaultSegments(
  input: Inputs,
  graphicModel: GraphicStaticsModel | null,
  ribY: number
): VaultSegment[] {
  const sideClearance = Math.max(2.4, input.aisle * 0.8);
  const availableWidth = Math.max(6, input.cavernWidth - sideClearance * 2);
  const springLineZ = Math.max(input.moduleH + 1.4, input.cavernHeight * 0.34);
  const crownZ = Math.max(springLineZ + 2, input.cavernHeight - 1.2);

  if (graphicModel?.nodes.length && graphicModel.members.length) {
    const xs = graphicModel.nodes.map((n) => n.x);
    const ys = graphicModel.nodes.map((n) => n.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const widthDenom = Math.max(maxX - minX, 1);
    const heightDenom = Math.max(maxY - minY, 1);
    const nodeMap = new Map(graphicModel.nodes.map((n) => [n.id, n]));

    return graphicModel.members.slice(0, 180).flatMap((m) => {
      const a = nodeMap.get(m.startNodeId);
      const b = nodeMap.get(m.endNodeId);
      if (!a || !b) return [];

      const ax = sideClearance + ((a.x - minX) / widthDenom) * availableWidth;
      const bx = sideClearance + ((b.x - minX) / widthDenom) * availableWidth;
      const az = crownZ - ((a.y - minY) / heightDenom) * (crownZ - springLineZ);
      const bz = crownZ - ((b.y - minY) / heightDenom) * (crownZ - springLineZ);
      const dx = bx - ax;
      const dz = bz - az;
      const length = Math.sqrt(dx * dx + dz * dz);
      if (length < 0.6) return [];

      const inferredType =
        m.forceType ??
        (typeof m.force === "number"
          ? m.force > 0
            ? "tension"
            : m.force < 0
              ? "compression"
              : "zero"
          : "unknown");

      return [
        {
          id: m.id,
          x: ax,
          y: ribY,
          z: az,
          length,
          angleDeg: (-Math.atan2(dz, dx) * 180) / Math.PI,
          type: inferredType,
        },
      ];
    });
  }

  const ribs = 15;
  const segments: VaultSegment[] = [];
  const cx = input.cavernWidth / 2;
  const radiusX = availableWidth / 2;
  const radiusZ = crownZ - springLineZ;

  for (let i = 0; i < ribs - 1; i++) {
    const t1 = Math.PI - (Math.PI * i) / (ribs - 1);
    const t2 = Math.PI - (Math.PI * (i + 1)) / (ribs - 1);
    const ax = cx + Math.cos(t1) * radiusX;
    const bx = cx + Math.cos(t2) * radiusX;
    const az = springLineZ + Math.sin(t1) * radiusZ;
    const bz = springLineZ + Math.sin(t2) * radiusZ;
    const dx = bx - ax;
    const dz = bz - az;
    segments.push({
      id: `default-vault-${i}`,
      x: ax,
      y: ribY,
      z: az,
      length: Math.sqrt(dx * dx + dz * dz),
      angleDeg: (-Math.atan2(dz, dx) * 180) / Math.PI,
      type: "unknown",
    });
  }

  return segments;
}

function aabb(m: Module) {
  const dim = moduleDims(m);
  return {
    x1: m.x,
    x2: m.x + dim.w,
    y1: m.y,
    y2: m.y + dim.d,
    z1: m.z,
    z2: m.z + dim.h,
  };
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

        const rot: 0 | 90 =
          (r * 7 + c * 5 + z * 3) % 100 < input.rotationRatio * 100 ? 90 : 0;

        const sx =
          (z % 2 ? input.stagger * input.moduleW : 0) +
          (r % 2 ? input.stagger * input.moduleW * 0.38 : 0);

        const sy =
          (z % 2 ? input.stagger * input.moduleD * 0.45 : 0) +
          (c % 2 ? input.stagger * input.moduleD * 0.25 : 0);

        const x = input.aisle + c * stepX + sx;
        const y = input.aisle + r * stepY + sy;
        const dim = rot === 90 ? { w: input.moduleD, d: input.moduleW } : { w: input.moduleW, d: input.moduleD };

        if (
          x + dim.w > input.cavernWidth - input.aisle ||
          y + dim.d > input.cavernLength - input.aisle
        ) {
          continue;
        }

        out.push({
          id,
          x,
          y,
          z: z * stepZ,
          w: input.moduleW,
          d: input.moduleD,
          h: input.moduleH,
          rot,
          type: typeFor(id, c, r, z),
        });

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
  const auxeticFactor = clamp(
    1 - input.auxeticThickness * 0.38 - (70 - Math.abs(input.reentrantAngle - 55)) / 360,
    0.48,
    0.92
  );
  const gapFactor = clamp(1 - input.airGap * 0.18, 0.62, 0.96);
  const linerFactor = clamp(1 - input.armoxThickness * 4.5, 0.58, 0.93);
  const springFactor = clamp(input.springFreq / (8 + input.springFreq) + input.damping * 0.9, 0.22, 0.72);
  const cavernKpa = input.extPeakKpa * rockTransmit;
  const panelKpa = cavernKpa * auxeticFactor * gapFactor * linerFactor;
  const moduleKpa = panelKpa * springFactor;

  return {
    rockTransmit,
    auxeticFactor,
    gapFactor,
    linerFactor,
    springFactor,
    cavernKpa,
    panelKpa,
    moduleKpa,
  };
}

function attenuationInternal(input: Inputs) {
  const auxeticFactor = clamp(
    1 - input.auxeticThickness * 0.3 - (70 - Math.abs(input.reentrantAngle - 55)) / 420,
    0.54,
    0.95
  );
  const gapFactor = clamp(1 - input.airGap * 0.15, 0.66, 0.98);
  const linerFactor = clamp(1 - input.armoxThickness * 4, 0.6, 0.94);
  const springFactor = clamp(input.springFreq / (7 + input.springFreq) + input.damping * 0.75, 0.24, 0.74);
  const panelKpa = input.internalPeakKpa * auxeticFactor * gapFactor * linerFactor;
  const moduleKpa = panelKpa * springFactor;

  return {
    auxeticFactor,
    gapFactor,
    linerFactor,
    springFactor,
    panelKpa,
    moduleKpa,
  };
}

function seismicResponse(input: Inputs) {
  const forcingHz = 3;
  const r = forcingHz / Math.max(input.springFreq, 0.1);
  const z = input.damping;
  const t = Math.sqrt(
    (1 + (2 * z * r) ** 2) / ((1 - r * r) ** 2 + (2 * z * r) ** 2)
  );
  const transmissibility = clamp(t, 0.18, 2.2);
  const moduleAccG = input.seismicPga * transmissibility;
  const omega = 2 * Math.PI * input.springFreq;
  const dispM = (moduleAccG * 9.81) / Math.max(omega * omega, 0.01);

  return {
    transmissibility,
    moduleAccG,
    dispM,
    dispRatio: dispM / Math.max(input.springStroke, 0.01),
  };
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

function detectContacts(
  modules: Module[],
  input: Inputs,
  scenario: Scenario,
  overrides: Record<string, JointType>
): Contact[] {
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

      if (gapX <= eps && oy > 1 && oz > 1) {
        axis = "x";
        area = oy * oz;
      } else if (gapY <= eps && ox > 1 && oz > 1) {
        axis = "y";
        area = ox * oz;
      } else if (gapZ <= eps && ox > 1 && oy > 1) {
        axis = "z";
        area = ox * oy;
      }

      if (!axis) continue;

      const id = `${modules[i].id}-${modules[j].id}-${axis}`;
      const type = overrides[id] ?? defaultJoint(axis, area, modules[i], modules[j]);
      const axisFactor = axis === "z" ? 1.2 : 0.82;
      const demand = (base * area * axisFactor) / 1000;
      const capacity = input.connectionCapacity * jointFactor[type].cap * jointFactor[type].duct;

      contacts.push({
        id,
        a: modules[i].id,
        b: modules[j].id,
        axis,
        area,
        type,
        demand,
        utilization: demand / capacity,
      });
    }
  }

  return contacts.sort((p, q) => q.utilization - p.utilization);
}

function estimateCost(input: Inputs, modules: Module[], contacts: Contact[]) {
  const moduleM2 = modules.reduce((s, m) => s + m.w * m.d, 0);
  const cavernM3 = input.cavernLength * input.cavernWidth * input.cavernHeight;
  const shellArea =
    2 *
    (input.cavernLength * input.cavernWidth +
      input.cavernLength * input.cavernHeight +
      input.cavernWidth * input.cavernHeight);

  const moduleCost = (moduleM2 / 100) * input.unitModuleCost;
  const excavationCost = (cavernM3 * input.cavernCost) / 100;
  const panelCost = (shellArea * input.panelCost) / 100;
  const jointCostTotal = contacts.reduce(
    (s, c) => s + input.jointCost * jointFactor[c.type].cost * Math.max(1, c.area / 10),
    0
  );

  const missionScale = Math.pow(Math.max(moduleM2, 1) / 10000, 0.85);
  const c4iSystemCost = input.c4iSystemCost * missionScale;
  const lifeSupportCost = input.lifeSupportCost * missionScale;
  const commsElectronicsCost = input.commsElectronicsCost * missionScale;
  const specialProtectionCost = input.specialProtectionCost * missionScale;

  const directCost =
    moduleCost +
    excavationCost +
    panelCost +
    jointCostTotal +
    c4iSystemCost +
    lifeSupportCost +
    commsElectronicsCost +
    specialProtectionCost;

  const riskPremium = (input.rockQuality < 55 ? 0.2 : 0.1) * directCost;
  const total = directCost + riskPremium;

  return {
    moduleCost,
    excavationCost,
    panelCost,
    jointCostTotal,
    c4iSystemCost,
    lifeSupportCost,
    commsElectronicsCost,
    specialProtectionCost,
    riskPremium,
    total,
  };
}

function calcLoads(input: Inputs, modules: Module[]) {
  const moduleArea = modules.reduce((s, m) => s + m.w * m.d, 0);
  const shellArea =
    2 *
    (input.cavernLength * input.cavernWidth +
      input.cavernLength * input.cavernHeight +
      input.cavernWidth * input.cavernHeight);

  const armoxDensity = 7850;
  const auxeticDensity = 2500;
  const steelFrameKpa = input.deadLoadKpa;

  const armoxMassT = shellArea * input.armoxThickness * armoxDensity / 1000;
  const auxeticMassT = shellArea * input.auxeticThickness * auxeticDensity / 1000;
  const moduleDeadT = moduleArea * steelFrameKpa * 0.10197;
  const liveT = moduleArea * input.liveLoadKpa * 0.10197;

  const typeArea = modules.reduce<Record<ModuleType, number>>(
    (acc, m) => {
      acc[m.type] += m.w * m.d;
      return acc;
    },
    { C4I: 0, MEP: 0, Habitat: 0, Storage: 0, Core: 0 }
  );

  const equipmentT =
    typeArea.C4I * input.c4iLoadKpa * 0.10197 +
    typeArea.MEP * input.mepLoadKpa * 0.10197 +
    typeArea.Storage * input.storageLoadKpa * 0.10197 +
    (typeArea.Habitat + typeArea.Core) * input.equipmentLoadKpa * 0.10197;

  const totalStructuralT = armoxMassT + auxeticMassT + moduleDeadT + liveT + equipmentT;

  return {
    moduleArea,
    shellArea,
    typeArea,
    armoxMassT,
    auxeticMassT,
    moduleDeadT,
    liveT,
    equipmentT,
    totalStructuralT,
    avgLoadKpa: totalStructuralT / Math.max(moduleArea, 1) / 0.10197,
  };
}

function calcSchedule(input: Inputs, modules: Module[]) {
  const cavernM3 = input.cavernLength * input.cavernWidth * input.cavernHeight;
  const excavationDaysByProductivity = Math.ceil(cavernM3 / input.dailyExcavationM3);
  const moduleDaysByProductivity = Math.ceil(modules.length / input.dailyModuleInstallCount);

  const phases = [
    {
      phase: "Mobilization / 지반조사 / 가설",
      startMonth: 0,
      durationMonth: input.mobilizationMonths,
      preparation: "측량, 지질조사, 진입로, 임시전력, 환기 가설설비, 안전계획 승인",
    },
    {
      phase: "Rock excavation / 공동 굴착",
      startMonth: input.mobilizationMonths,
      durationMonth: input.excavationMonths,
      preparation: `일평균 굴착 ${nfmt(input.dailyExcavationM3, 0)}㎥ 기준 생산성 검토. 계산상 ${excavationDaysByProductivity}일 필요.`,
    },
    {
      phase: "Primary support + lining / 보강·내피",
      startMonth: input.mobilizationMonths + input.excavationMonths,
      durationMonth: input.liningMonths,
      preparation: "록볼트, 숏크리트, 배수, 오세틱 패널, Armox 내피, 공동-철제 레이어 air gap 확보",
    },
    {
      phase: "Module stacking / 철제 모듈 반입·적층",
      startMonth: input.mobilizationMonths + input.excavationMonths + input.liningMonths,
      durationMonth: input.moduleInstallMonths,
      preparation: `일평균 ${nfmt(input.dailyModuleInstallCount, 1)}개 설치 기준 계산상 ${moduleDaysByProductivity}일 필요.`,
    },
    {
      phase: "MEP / 환기·배관·전력·샤프트",
      startMonth:
        input.mobilizationMonths +
        input.excavationMonths +
        input.liningMonths +
        input.moduleInstallMonths,
      durationMonth: input.mepMonths,
      preparation: "기계실, 발전기실, 급배기 샤프트, 냉각수/급수/배수, UPS, 통신랙 설치",
    },
    {
      phase: "Commissioning / 시험운전",
      startMonth:
        input.mobilizationMonths +
        input.excavationMonths +
        input.liningMonths +
        input.moduleInstallMonths +
        input.mepMonths,
      durationMonth: input.commissioningMonths,
      preparation: "기밀성, 연기제어, 비상전력, 냉방부하, 통신 이중화, 피난·운영 시나리오 검증",
    },
  ];

  return {
    cavernM3,
    excavationDaysByProductivity,
    moduleDaysByProductivity,
    phases,
    totalMonths: phases.reduce((max, p) => Math.max(max, p.startMonth + p.durationMonth), 0),
  };
}

function calcMep(input: Inputs, area: number) {
  const volume = input.cavernLength * input.cavernWidth * input.cavernHeight;
  const achAirM3h = volume * input.ventilationAch;
  const freshAirM3h = input.occupancy * input.freshAirPerPerson;
  const designAirM3h = Math.max(achAirM3h, freshAirM3h);
  const ductAreaM2 = designAirM3h / 3600 / input.ductVelocity;
  const totalShaftArea = input.shaftCount * input.shaftAreaEach;
  const shaftUtilization = ductAreaM2 / Math.max(totalShaftArea, 0.1);
  const mechRoomArea = area * input.mechRoomRatio;
  const waterM3Day = (input.occupancy * input.waterPerPersonDay) / 1000;
  const pipeDiameterM = Math.sqrt((4 * waterM3Day / 86400) / (Math.PI * input.pipeVelocity));

  return {
    volume,
    achAirM3h,
    freshAirM3h,
    designAirM3h,
    ductAreaM2,
    totalShaftArea,
    shaftUtilization,
    mechRoomArea,
    waterM3Day,
    pipeDiameterM,
  };
}

function calcCooling(input: Inputs, area: number) {
  const peopleKw = (input.occupancy * input.peopleHeatW) / 1000;
  const equipmentKw = (area * input.internalHeatWm2) / 1000;
  const lightingKw = (area * input.lightingWm2) / 1000;
  const envelopeKw = area * 0.012;
  const rawKw = peopleKw + equipmentKw + lightingKw + envelopeKw;
  const designKw = rawKw * input.coolingSafetyFactor;
  const rt = designKw / 3.517;

  return {
    peopleKw,
    equipmentKw,
    lightingKw,
    envelopeKw,
    rawKw,
    designKw,
    rt,
  };
}

function calcPower(input: Inputs, modules: Module[], area: number) {
  const c4iArea = modules.filter((m) => m.type === "C4I").reduce((s, m) => s + m.w * m.d, 0);
  const mepArea = modules.filter((m) => m.type === "MEP").reduce((s, m) => s + m.w * m.d, 0);

  const baseKw = (area * input.criticalPowerWm2) / 1000;
  const c4iKw = (c4iArea * input.c4iPowerWm2) / 1000;
  const mepKw = (mepArea * input.mepPowerWm2) / 1000;
  const totalCriticalKw = baseKw + c4iKw + mepKw;
  const generatorKw = totalCriticalKw * input.generatorRedundancy;
  const backupKwh = totalCriticalKw * input.backupHours;
  const fuelL = backupKwh * input.fuelConsumptionLPerKwh;

  return {
    c4iArea,
    mepArea,
    baseKw,
    c4iKw,
    mepKw,
    totalCriticalKw,
    generatorKw,
    backupKwh,
    fuelL,
  };
}

function calcEnvironment(input: Inputs, area: number, coolingKw: number, mepAirM3h: number) {
  const thermalLoadIndex = coolingKw / Math.max(area, 1);
  const thermalScore = clamp(100 - Math.abs(input.targetTempC - 22) * 4 - thermalLoadIndex * 0.8, 0, 100);

  const co2SteadyPpm = 420 + (input.occupancy * 0.005 * 1_000_000) / Math.max(mepAirM3h, 1);
  const airScore = clamp(100 - relu(co2SteadyPpm - 1000) * 0.08, 0, 100);

  const lightingPowerNeededKw = (area * input.targetIlluminanceLux) / input.lightingEfficacyLmW / 1000;
  const lightScore = clamp(100 - relu(input.targetIlluminanceLux - 500) * 0.02, 0, 100);

  const roomNoiseDb = input.equipmentNoiseDb - input.wallStc + 10 * Math.log10(Math.max(input.mechRoomRatio * 100, 1));
  const acousticScore = clamp(100 - relu(roomNoiseDb - input.ncTarget) * 4, 0, 100);

  return {
    thermalLoadIndex,
    thermalScore,
    co2SteadyPpm,
    airScore,
    lightingPowerNeededKw,
    lightScore,
    roomNoiseDb,
    acousticScore,
    overallEnvScore: (thermalScore + airScore + lightScore + acousticScore) / 4,
  };
}

function calcMaterials(input: Inputs, modules: Module[], contacts: Contact[]) {
  const loads = calcLoads(input, modules);
  const schedule = calcSchedule(input, modules);

  const armoxPlateArea = 2.5 * 6;
  const armoxPlateCount = Math.ceil(loads.shellArea / armoxPlateArea);
  const auxeticPanelArea = 1.2 * 2.4;
  const auxeticPanelCount = Math.ceil(loads.shellArea / auxeticPanelArea);
  const springCount = Math.ceil(modules.length * 8);
  const jointKitCount = contacts.length;
  const moduleSteelT = loads.moduleDeadT * 0.72;

  const liningStartDay = Math.round(
    (input.mobilizationMonths + input.excavationMonths) * 30.4
  );
  const moduleStartDay = Math.round(
    (input.mobilizationMonths + input.excavationMonths + input.liningMonths) * 30.4
  );
  const mepStartDay = Math.round(
    (input.mobilizationMonths +
      input.excavationMonths +
      input.liningMonths +
      input.moduleInstallMonths) *
      30.4
  );

  const items = [
    {
      item: "Armox 500T inner liner plate",
      quantity: armoxPlateCount,
      unit: `plates ${armoxPlateArea.toFixed(1)}㎡/ea`,
      requiredByDay: Math.max(0, liningStartDay - input.procurementLeadArmoxDays),
      note: `${nfmt(loads.shellArea, 0)}㎡ shell area 기준`,
    },
    {
      item: "Auxetic re-entrant panel",
      quantity: auxeticPanelCount,
      unit: `panels ${auxeticPanelArea.toFixed(2)}㎡/ea`,
      requiredByDay: Math.max(0, liningStartDay - 60),
      note: `${input.reentrantAngle}° cell, thickness ${input.auxeticThickness}m`,
    },
    {
      item: "Containerized steel modules",
      quantity: modules.length,
      unit: "modules",
      requiredByDay: Math.max(0, moduleStartDay - 45),
      note: `추정 모듈 철골량 ${nfmt(moduleSteelT, 0)}t`,
    },
    {
      item: "Spring-damper / isolation supports",
      quantity: springCount,
      unit: "sets",
      requiredByDay: Math.max(0, moduleStartDay - input.procurementLeadSpringDays),
      note: `모듈당 8개 기준, stroke ${input.springStroke}m`,
    },
    {
      item: "Joint kits / plates / shear keys",
      quantity: jointKitCount,
      unit: "sets",
      requiredByDay: Math.max(0, moduleStartDay - 30),
      note: `detected contacts ${contacts.length}개 기준`,
    },
    {
      item: "Ventilation / MEP major equipment",
      quantity: 1,
      unit: "lot",
      requiredByDay: Math.max(0, mepStartDay - input.procurementLeadMepDays),
      note: "AHU, fan, chiller, pump, pipe, duct, control panel",
    },
  ];

  return {
    armoxPlateCount,
    auxeticPanelCount,
    springCount,
    jointKitCount,
    moduleSteelT,
    items,
    schedule,
  };
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

  const transmitted =
    scenario === "external"
      ? ext.moduleKpa
      : scenario === "internal"
        ? internal.moduleKpa
        : seis.moduleAccG * 100;

  const maxUtil = contacts.length ? Math.max(...contacts.map((c) => c.utilization)) : 0;
  const avgUtil = contacts.length
    ? contacts.reduce((s, c) => s + c.utilization, 0) / contacts.length
    : 0;

  const blastScore =
    scenario === "seismic"
      ? clamp(100 - seis.moduleAccG * 70 - relu(seis.dispRatio - 0.8) * 90 - maxUtil * 8, 0, 100)
      : clamp(100 - transmitted * 1.05 - maxUtil * 16 + input.connectionDuctility * 1.4, 0, 100);

  const layoutScore = clamp(
    45 + density * 42 + voidRatio * 16 + Math.min(contacts.length, 90) * 0.08 - relu(modules.length - 180) * 0.04,
    0,
    100
  );

  const constructScore = clamp(
    96 - modules.length * 0.07 - input.floors * 2.5 - input.auxeticThickness * 5 - contacts.length * 0.025,
    0,
    100
  );

  const jointReserve = clamp(100 - maxUtil * 100, 0, 100);
  const cost = estimateCost(input, modules, contacts);
  const loads = calcLoads(input, modules);
  const schedule = calcSchedule(input, modules);
  const mep = calcMep(input, areaBuilt);
  const cooling = calcCooling(input, areaBuilt);
  const power = calcPower(input, modules, areaBuilt);
  const env = calcEnvironment(input, areaBuilt, cooling.designKw, mep.designAirM3h);
  const materials = calcMaterials(input, modules, contacts);

  const overall = clamp(
    blastScore * 0.34 +
      layoutScore * 0.14 +
      constructScore * 0.1 +
      jointReserve * 0.16 +
      env.overallEnvScore * 0.12 +
      clamp(100 - mep.shaftUtilization * 20, 0, 100) * 0.07 +
      clamp(100 - cost.total / 250, 0, 100) * 0.07,
    0,
    100
  );

  return {
    areaBuilt,
    volumeUse,
    cavernVolume,
    density,
    voidRatio,
    ext,
    internal,
    seis,
    transmitted,
    maxUtil,
    avgUtil,
    blastScore,
    layoutScore,
    constructScore,
    jointReserve,
    overall,
    cost,
    loads,
    schedule,
    mep,
    cooling,
    power,
    env,
    materials,
  };
}

function runReluOptimization(input: Inputs, scenario: Scenario) {
  const candidates: Array<{
    input: Inputs;
    score: number;
    objective: number;
    modules: number;
    cost: number;
    maxUtil: number;
  }> = [];

  const floorsSet = [Math.max(1, input.floors - 1), input.floors, Math.min(5, input.floors + 1)];
  const auxSet = [input.auxeticThickness, input.auxeticThickness + 0.15, input.auxeticThickness + 0.3];
  const gapSet = [input.airGap, input.airGap + 0.3, input.airGap + 0.6];
  const staggerSet = [0.15, 0.35, 0.55];
  const rotationSet = [0.25, 0.5, 0.7];
  const springSet = [1.6, 2.2, 3.4];

  for (const floors of floorsSet)
    for (const auxeticThickness of auxSet)
      for (const airGap of gapSet)
        for (const stagger of staggerSet)
          for (const rotationRatio of rotationSet)
            for (const springFreq of springSet) {
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
              const responsePenalty =
                relu((scenario === "seismic" ? ev.seis.moduleAccG / 0.55 : ev.transmitted / 45) - 1) * 38;
              const costPenalty = ev.cost.total / 10000;
              const envPenalty = relu(82 - ev.env.overallEnvScore) * 0.25;
              const objective =
                areaPenalty +
                jointPenalty +
                responsePenalty +
                costPenalty +
                envPenalty -
                ev.overall * 0.18;

              candidates.push({
                input: trial,
                score: ev.overall,
                objective,
                modules: modules.length,
                cost: ev.cost.total,
                maxUtil: ev.maxUtil,
              });
            }

  return candidates.sort((a, b) => a.objective - b.objective)[0];
}

function downloadText(filename: string, text: string, mime = "text/plain") {
  const blob = new Blob([text], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function makeRhinoPython(modules: Module[], input: Inputs) {
  const rows = modules
    .map((m) => {
      const d = moduleDims(m);
      return `make_box(${m.x.toFixed(3)}, ${m.y.toFixed(3)}, ${m.z.toFixed(3)}, ${d.w.toFixed(3)}, ${d.d.toFixed(3)}, ${d.h.toFixed(3)}, "${m.type}", "M${m.id}")`;
    })
    .join("\n");

  return `import rhinoscriptsyntax as rs

def make_box(x, y, z, w, d, h, layer, name):
    if not rs.IsLayer(layer):
        rs.AddLayer(layer)
    pts = [
        (x,y,z), (x+w,y,z), (x+w,y+d,z), (x,y+d,z),
        (x,y,z+h), (x+w,y,z+h), (x+w,y+d,z+h), (x,y+d,z+h)
    ]
    box = rs.AddBox(pts)
    rs.ObjectLayer(box, layer)
    rs.ObjectName(box, name)
    return box

if not rs.IsLayer("Cavern"):
    rs.AddLayer("Cavern")

cavern = make_box(0, 0, 0, ${input.cavernWidth}, ${input.cavernLength}, ${input.cavernHeight}, "Cavern", "Cavern Envelope")
rs.ObjectColor(cavern, (160,160,160))

${rows}

rs.ZoomExtents()
`;
}

function makeRevitManifest(input: Inputs, modules: Module[], contacts: Contact[]) {
  return JSON.stringify(
    {
      format: "Exterra-RVT-Manifest",
      note:
        "이 JSON은 Revit Add-in, Dynamo, Design Automation에서 읽어 FamilyInstance/DirectShape를 생성하기 위한 중간 포맷입니다. 클라이언트 TSX만으로 네이티브 .rvt 파일을 직접 생성할 수는 없습니다.",
      units: "meters",
      inputs: input,
      cavern: {
        length: input.cavernLength,
        width: input.cavernWidth,
        height: input.cavernHeight,
      },
      modules: modules.map((m) => ({
        id: `M${m.id}`,
        type: m.type,
        x: m.x,
        y: m.y,
        z: m.z,
        width: moduleDims(m).w,
        depth: moduleDims(m).d,
        height: moduleDims(m).h,
        rotationDeg: m.rot,
      })),
      contacts,
    },
    null,
    2
  );
}

function makeReportHtml(
  input: Inputs,
  modules: Module[],
  contacts: Contact[],
  evals: ReturnType<typeof evaluate>,
  scenario: Scenario
) {
  const phaseRows = evals.schedule.phases
    .map(
      (p) =>
        `<tr><td>${p.phase}</td><td>${p.startMonth}</td><td>${p.durationMonth}</td><td>${p.preparation}</td></tr>`
    )
    .join("");

  const materialRows = evals.materials.items
    .map(
      (m) =>
        `<tr><td>${m.item}</td><td>${nfmt(m.quantity, 0)}</td><td>${m.unit}</td><td>D+${m.requiredByDay}</td><td>${m.note}</td></tr>`
    )
    .join("");

  const contactRows = contacts
    .slice(0, 20)
    .map(
      (c) =>
        `<tr><td>M${c.a}-M${c.b}</td><td>${c.axis}</td><td>${jointNames[c.type]}</td><td>${nfmt(c.area, 1)}㎡</td><td>${nfmt(c.utilization * 100, 1)}%</td></tr>`
    )
    .join("");

  return `
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8" />
<title>EXTERRA Parametric Defense Report</title>
<style>
  body { font-family: Arial, sans-serif; margin: 36px; color: #111827; }
  h1 { font-size: 32px; margin: 0 0 8px; letter-spacing: -0.04em; }
  h2 { margin-top: 30px; border-top: 2px solid #111827; padding-top: 12px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
  th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
  th { background: #f3f4f6; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 18px 0; }
  .card { border: 1px solid #d1d5db; border-radius: 12px; padding: 12px; }
  .card span { display: block; color: #6b7280; font-size: 11px; }
  .card b { display: block; font-size: 20px; margin-top: 6px; }
  @media print { body { margin: 20mm; } }
</style>
</head>
<body>
  <h1>EXTERRA Parametric Defense Report</h1>
  <p>Scenario: ${scenario} / Generated from parametric planning model</p>

  <div class="grid">
    <div class="card"><span>Overall score</span><b>${Math.round(evals.overall)} / 100</b></div>
    <div class="card"><span>Built area</span><b>${nfmt(evals.areaBuilt, 0)}㎡</b></div>
    <div class="card"><span>Modules / Contacts</span><b>${modules.length} / ${contacts.length}</b></div>
    <div class="card"><span>Cost</span><b>${nfmt(evals.cost.total, 0)} 억원</b></div>
  </div>

  <h2>1. Structural Load Summary</h2>
  <table>
    <tr><th>Item</th><th>Value</th></tr>
    <tr><td>Total structural weight</td><td>${nfmt(evals.loads.totalStructuralT, 0)} t</td></tr>
    <tr><td>Armox mass</td><td>${nfmt(evals.loads.armoxMassT, 0)} t</td></tr>
    <tr><td>Auxetic panel mass</td><td>${nfmt(evals.loads.auxeticMassT, 0)} t</td></tr>
    <tr><td>Module dead load</td><td>${nfmt(evals.loads.moduleDeadT, 0)} t</td></tr>
    <tr><td>Live + equipment load</td><td>${nfmt(evals.loads.liveT + evals.loads.equipmentT, 0)} t</td></tr>
    <tr><td>Average floor load</td><td>${nfmt(evals.loads.avgLoadKpa, 1)} kPa</td></tr>
  </table>

  <h2>2. Construction Schedule</h2>
  <table>
    <tr><th>Phase</th><th>Start month</th><th>Duration</th><th>Preparation</th></tr>
    ${phaseRows}
  </table>

  <h2>3. Ventilation / Piping / Mechanical Room / Shaft</h2>
  <table>
    <tr><th>Item</th><th>Value</th></tr>
    <tr><td>Design air volume</td><td>${nfmt(evals.mep.designAirM3h, 0)} ㎥/h</td></tr>
    <tr><td>Required duct area</td><td>${nfmt(evals.mep.ductAreaM2, 2)} ㎡</td></tr>
    <tr><td>Total shaft area</td><td>${nfmt(evals.mep.totalShaftArea, 2)} ㎡</td></tr>
    <tr><td>Shaft utilization</td><td>${nfmt(evals.mep.shaftUtilization * 100, 1)}%</td></tr>
    <tr><td>Mechanical room area</td><td>${nfmt(evals.mep.mechRoomArea, 0)} ㎡</td></tr>
    <tr><td>Water demand</td><td>${nfmt(evals.mep.waterM3Day, 1)} ㎥/day</td></tr>
  </table>

  <h2>4. Cooling Load / Power</h2>
  <table>
    <tr><th>Item</th><th>Value</th></tr>
    <tr><td>Design cooling load</td><td>${nfmt(evals.cooling.designKw, 0)} kW / ${nfmt(evals.cooling.rt, 0)} RT</td></tr>
    <tr><td>Critical power</td><td>${nfmt(evals.power.totalCriticalKw, 0)} kW</td></tr>
    <tr><td>Generator capacity</td><td>${nfmt(evals.power.generatorKw, 0)} kW</td></tr>
    <tr><td>Backup energy</td><td>${nfmt(evals.power.backupKwh, 0)} kWh</td></tr>
    <tr><td>Fuel storage</td><td>${nfmt(evals.power.fuelL, 0)} L</td></tr>
  </table>

  <h2>5. Environmental Simulation</h2>
  <table>
    <tr><th>Environment</th><th>Result</th><th>Score</th></tr>
    <tr><td>Thermal</td><td>${nfmt(evals.env.thermalLoadIndex, 2)} kW/㎡ load index</td><td>${nfmt(evals.env.thermalScore, 0)}</td></tr>
    <tr><td>Air</td><td>CO₂ approx. ${nfmt(evals.env.co2SteadyPpm, 0)} ppm</td><td>${nfmt(evals.env.airScore, 0)}</td></tr>
    <tr><td>Light</td><td>Lighting power ${nfmt(evals.env.lightingPowerNeededKw, 0)} kW</td><td>${nfmt(evals.env.lightScore, 0)}</td></tr>
    <tr><td>Acoustic</td><td>Room noise approx. ${nfmt(evals.env.roomNoiseDb, 1)} dB</td><td>${nfmt(evals.env.acousticScore, 0)}</td></tr>
  </table>

  <h2>6. Material Procurement Plan</h2>
  <table>
    <tr><th>Item</th><th>Quantity</th><th>Unit</th><th>Required by</th><th>Note</th></tr>
    ${materialRows}
  </table>

  <h2>7. Critical Contacts</h2>
  <table>
    <tr><th>Contact</th><th>Axis</th><th>Joint</th><th>Area</th><th>Utilization</th></tr>
    ${contactRows}
  </table>

  <h2>8. Scope Note</h2>
  <p>
    This report is a concept-stage surrogate model for academic design planning.
    Final verification requires geotechnical investigation, non-linear dynamic analysis,
    fire/smoke simulation, detailed MEP sizing, construction sequencing, and discipline-level BIM coordination.
  </p>
</body>
</html>`;
}

function NumberInput({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className={styles.control}>
      <span>
        {label}
        <b>
          {nfmt(value, step < 1 ? 2 : 0)} {unit}
        </b>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </label>
  );
}

function Cuboid({
  m,
  selected,
  onClick,
}: {
  m: Module;
  selected: boolean;
  onClick: () => void;
}) {
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
    <button
      className={`${styles.cuboid} ${styles[moduleClass[m.type]]} ${
        selected ? styles.selectedCuboid : ""
      }`}
      style={style}
      onClick={onClick}
      title={`M${m.id} / ${m.type}`}
    >
      <span className={`${styles.face} ${styles.front}`}>
        {m.type}
        <i>M{m.id}</i>
      </span>
      <span className={`${styles.face} ${styles.back}`} />
      <span className={`${styles.face} ${styles.right}`} />
      <span className={`${styles.face} ${styles.left}`} />
      <span className={`${styles.face} ${styles.top}`} />
      <span className={`${styles.face} ${styles.bottom}`} />
    </button>
  );
}

function StackingScene({
  input,
  modules,
  contacts,
  selectedModule,
  setSelectedModule,
  view,
  setView,
  graphicModel,
}: {
  input: Inputs;
  modules: Module[];
  contacts: Contact[];
  selectedModule: number | null;
  setSelectedModule: (id: number | null) => void;
  view: { rx: number; ry: number; zoom: number };
  setView: (v: { rx: number; ry: number; zoom: number }) => void;
  graphicModel: GraphicStaticsModel | null;
}) {
  const [drag, setDrag] = useState<{ x: number; y: number; rx: number; ry: number } | null>(
    null
  );

  const scale = Math.min(3.2, Math.max(1.4, 360 / Math.max(input.cavernLength, input.cavernWidth)));
  const selectedContacts = contacts
    .filter((c) => c.a === selectedModule || c.b === selectedModule)
    .slice(0, 18);
  const vaultRibYs = [0.12, 0.32, 0.52, 0.72, 0.92].map((t) => input.cavernLength * t);
  const circulationSegments = [
    { id: "main", x: input.cavernWidth / 2 - input.aisle * 0.45, y: input.aisle, w: input.aisle * 0.9, h: input.cavernLength - input.aisle * 2 },
    { id: "cross-a", x: input.aisle, y: input.cavernLength * 0.34, w: input.cavernWidth - input.aisle * 2, h: input.aisle * 0.7 },
    { id: "cross-b", x: input.aisle, y: input.cavernLength * 0.66, w: input.cavernWidth - input.aisle * 2, h: input.aisle * 0.7 },
  ];

  const pointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setView({
      ...view,
      ry: drag.ry + (e.clientX - drag.x) * 0.35,
      rx: clamp(drag.rx - (e.clientY - drag.y) * 0.28, -80, 90),
    });
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
        onPointerDown={(e) =>
          setDrag({ x: e.clientX, y: e.clientY, rx: view.rx, ry: view.ry })
        }
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
          <div className={styles.cavernBox}>
            <span />
          </div>
          <div className={styles.circulationLayer} aria-hidden="true">
            {circulationSegments.map((seg) => (
              <span
                key={seg.id}
                className={styles.circulationPath}
                style={{
                  left: seg.x,
                  top: seg.y,
                  width: seg.w,
                  height: seg.h,
                }}
              />
            ))}
          </div>
          <div className={styles.vaultLayer} aria-hidden="true">
            {vaultRibYs.map((ribY, ribIndex) =>
              makeVaultSegments(input, graphicModel, ribY).map((seg) => (
                <span
                  key={`${ribIndex}-${seg.id}`}
                  className={`${styles.vaultMember} ${
                    seg.type === "tension"
                      ? styles.vaultTension
                      : seg.type === "compression"
                        ? styles.vaultCompression
                        : seg.type === "zero"
                          ? styles.vaultZero
                          : ""
                  }`}
                  style={{
                    width: seg.length,
                    transform: `translate3d(${seg.x}px, ${seg.y}px, ${seg.z}px) rotateY(${seg.angleDeg}deg)`,
                  }}
                />
              ))
            )}
            {vaultRibYs.map((ribY) => (
              <span
                key={`arch-shadow-${ribY}`}
                className={styles.vaultRibShadow}
                style={{
                  left: input.aisle,
                  top: ribY,
                  width: input.cavernWidth - input.aisle * 2,
                }}
              />
            ))}
          </div>
          {modules.map((m) => (
            <Cuboid
              key={m.id}
              m={m}
              selected={selectedModule === m.id}
              onClick={() => setSelectedModule(m.id)}
            />
          ))}
        </div>
      </div>

      <div className={styles.viewControls}>
        <NumberInput
          label="Rotate X"
          value={view.rx}
          min={-80}
          max={90}
          step={1}
          unit="°"
          onChange={(v) => setView({ ...view, rx: v })}
        />
        <NumberInput
          label="Rotate Z"
          value={view.ry}
          min={-180}
          max={180}
          step={1}
          unit="°"
          onChange={(v) => setView({ ...view, ry: v })}
        />
        <NumberInput
          label="Zoom"
          value={view.zoom}
          min={0.65}
          max={1.8}
          step={0.05}
          unit="x"
          onChange={(v) => setView({ ...view, zoom: v })}
        />
      </div>

      <div className={styles.contactStrip}>
        <b>{selectedModule ? `M${selectedModule} 접촉부 ${selectedContacts.length}개` : `전체 접촉부 ${contacts.length}개`}</b>
        <span>Max utilization {nfmt((contacts[0]?.utilization ?? 0) * 100, 1)}%</span>
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
        out.push(
          `${x},${y} ${x + w * 0.32},${y} ${x + w * 0.5 - notch},${y + h * 0.5} ${x + w * 0.32},${y + h} ${x},${y + h} ${x + w * 0.18},${y + h * 0.5}`
        );
      }
    }

    return out;
  }, [input.reentrantAngle]);

  return (
    <svg className={styles.auxeticSvg} viewBox="0 0 370 210" role="img">
      <rect x="6" y="8" width="358" height="194" rx="14" className={styles.svgFrame} />
      {cells.map((p, i) => (
        <polygon key={i} points={p} className={styles.auxCell} />
      ))}
    </svg>
  );
}

function SectionStack({ input, scenario }: { input: Inputs; scenario: Scenario }) {
  const ext = attenuationExternal(input);
  const internal = attenuationInternal(input);
  const seis = seismicResponse(input);

  const values =
    scenario === "external"
      ? [input.extPeakKpa, ext.cavernKpa, ext.cavernKpa * ext.auxeticFactor, ext.panelKpa, ext.moduleKpa]
      : scenario === "internal"
        ? [input.internalPeakKpa, input.internalPeakKpa * internal.auxeticFactor, internal.panelKpa, internal.moduleKpa]
        : [input.seismicPga, input.seismicPga * seis.transmissibility, seis.moduleAccG];

  const labels =
    scenario === "external"
      ? ["산체 외부 입력", "암반 통과 후", "오세틱 패널 후", "공동+내피 후", "모듈 전달값"]
      : scenario === "internal"
        ? ["공동 내부 입력", "오세틱 패널 후", "공동+내피 후", "모듈 전달값"]
        : ["지반 PGA", "절연계 응답", "모듈 가속도"];

  return (
    <div className={styles.stackCard}>
      {values.map((v, i) => (
        <div key={labels[i]} className={styles.stackRow}>
          <span>{labels[i]}</span>
          <b>
            {nfmt(v, scenario === "seismic" ? 2 : 1)}
            {scenario === "seismic" ? " g" : " kPa"}
          </b>
          <i style={{ width: `${clamp((v / Math.max(...values)) * 100, 4, 100)}%` }} />
        </div>
      ))}
    </div>
  );
}

function DataTable({
  rows,
}: {
  rows: Array<[string, React.ReactNode, React.ReactNode?]>;
}) {
  return (
    <div className={styles.dataTable}>
      {rows.map(([a, b, c]) => (
        <div key={a}>
          <span>{a}</span>
          <b>{b}</b>
          {c ? <em>{c}</em> : null}
        </div>
      ))}
    </div>
  );
}

export default function ExterraIntegratedDefensePlannerPage() {
  const [input, setInput] = useState<Inputs>(INITIAL);
  const [scenario, setScenario] = useState<Scenario>("external");
  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [jointOverrides, setJointOverrides] = useState<Record<string, JointType>>({});
  const [view, setView] = useState({ rx: 58, ry: -36, zoom: 1 });
  const [opt, setOpt] = useState<ReturnType<typeof runReluOptimization> | null>(null);
  const [graphicModel, setGraphicModel] = useState<GraphicStaticsModel | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const graphicFileInputRef = useRef<HTMLInputElement | null>(null);

  const modules = useMemo(() => generateModules(input), [input]);
  const contacts = useMemo(
    () => detectContacts(modules, input, scenario, jointOverrides),
    [modules, input, scenario, jointOverrides]
  );
  const evals = useMemo(() => evaluate(input, modules, scenario, contacts), [
    input,
    modules,
    scenario,
    contacts,
  ]);

  const selectedContactObj = contacts.find((c) => c.id === selectedContact) ?? contacts[0];
  const selectedModuleObj = modules.find((m) => m.id === selectedModule);
  const selectedModuleContacts = selectedModule
    ? contacts.filter((c) => c.a === selectedModule || c.b === selectedModule)
    : contacts;

  const set = <K extends keyof Inputs>(key: K, value: Inputs[K]) =>
    setInput((p) => ({ ...p, [key]: value }));

  const applyOptimization = () => {
    const best = runReluOptimization(input, scenario);
    setOpt(best);
    setInput(best.input);
    setJointOverrides({});
  };

  const exportJson = () => {
    downloadText(
      "exterra-parametric-values.json",
      JSON.stringify(
        {
          version: "1.0",
          page: "ExterraIntegratedDefensePlannerPage",
          scenario,
          inputs: input,
          jointOverrides,
        },
        null,
        2
      ),
      "application/json"
    );
  };

  const importJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const parsed = JSON.parse(text);

    if (parsed.inputs) {
      setInput({ ...INITIAL, ...parsed.inputs });
      setScenario(parsed.scenario ?? "external");
      setJointOverrides(parsed.jointOverrides ?? {});
    } else {
      setInput({ ...INITIAL, ...parsed });
      setJointOverrides({});
    }

    e.target.value = "";
  };

  const importGraphicStaticsJson = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const parsed = JSON.parse(await file.text());
      const normalized = normalizeGraphicStaticsModel(parsed);
      if (!normalized) {
        window.alert("Graphic statics JSON에서 nodes/members 구조를 찾지 못했습니다.");
        return;
      }
      setGraphicModel(normalized);
    } catch {
      window.alert("Graphic statics JSON을 읽는 중 오류가 발생했습니다.");
    } finally {
      e.target.value = "";
    }
  };

  const exportReportPdf = () => {
    const html = makeReportHtml(input, modules, contacts, evals, scenario);
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 350);
  };

  const exportRhino = () => {
    downloadText("exterra_modules_rhino_import.py", makeRhinoPython(modules, input), "text/x-python");
  };

  const exportRevitManifest = () => {
    downloadText(
      "exterra_revit_manifest.json",
      makeRevitManifest(input, modules, contacts),
      "application/json"
    );
  };

  const scoreClass =
    evals.overall >= 82 ? styles.pass : evals.overall >= 62 ? styles.warn : styles.fail;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>EXTERRA Integrated Parametric Defense Planner</span>
          <h1>산악 내부 방호시설 통합 계획 랩</h1>
          <p>
            3D 모듈 배치, 접합부, 오세틱 방호 패널, 예상 하중, 공사기간, 환기·배관·기계실·샤프트,
            냉방부하, 발전용량, 열·공기·빛·음환경, 재료 조달계획, 보고서/JSON/BIM 연계 Export까지
            하나의 파라메트릭 페이지에서 검토합니다.
          </p>

          <div className={styles.heroActions}>
            <button onClick={() => { setInput(INITIAL); setJointOverrides({}); setOpt(null); }}>
              Reset baseline
            </button>
            <button className={styles.ghost} onClick={applyOptimization}>
              ReLU optimizer
            </button>
            <button className={styles.ghost} onClick={exportReportPdf}>
              Report PDF
            </button>
            <button className={styles.ghost} onClick={exportJson}>
              Export JSON
            </button>
            <button className={styles.ghost} onClick={() => fileInputRef.current?.click()}>
              Import JSON
            </button>
            <button className={styles.ghost} onClick={() => graphicFileInputRef.current?.click()}>
              Import Graphic Statics
            </button>
            <button className={styles.ghost} onClick={() => setGraphicModel(null)}>
              Clear Vault Model
            </button>
            <button className={styles.ghost} onClick={exportRhino}>
              Rhino Script
            </button>
            <button className={styles.ghost} onClick={exportRevitManifest}>
              RVT Manifest
            </button>
            <input
              ref={fileInputRef}
              className={styles.hiddenInput}
              type="file"
              accept="application/json,.json"
              onChange={importJson}
            />
            <input
              ref={graphicFileInputRef}
              className={styles.hiddenInput}
              type="file"
              accept="application/json,.json"
              onChange={importGraphicStaticsJson}
            />
          </div>
        </div>

        <div className={styles.heroPanel}>
          <div
            className={styles.scoreRing}
            style={{
              background: `conic-gradient(#111827 ${evals.overall * 3.6}deg, #e5e7eb 0deg)`,
            }}
          >
            <div>
              <b>{Math.round(evals.overall)}</b>
              <span>{scoreLabel(evals.overall)}</span>
            </div>
          </div>

          <div className={styles.miniStats}>
            <p>
              <span>Built area</span>
              <b>{nfmt(evals.areaBuilt, 0)}㎡</b>
            </p>
            <p>
              <span>Modules / Contacts</span>
              <b>
                {modules.length} / {contacts.length}
              </b>
            </p>
            <p>
              <span>Estimated cost</span>
              <b>{nfmt(evals.cost.total, 0)} 억원</b>
            </p>
            <p>
              <span>Vault rib source</span>
              <b>{graphicModel ? `${graphicModel.members.length} members` : "default barrel"}</b>
            </p>
          </div>
        </div>
      </section>

      <section className={styles.tabs}>
        {(["external", "internal", "seismic"] as Scenario[]).map((s) => (
          <button
            key={s}
            className={scenario === s ? styles.activeTab : ""}
            onClick={() => setScenario(s)}
          >
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

          <h3>02. Module stacking</h3>
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
          <NumberInput label="Auxetic cell W" value={input.auxeticCellW} min={0.08} max={0.45} step={0.01} unit="m" onChange={(v) => set("auxeticCellW", v)} />
          <NumberInput label="Auxetic cell H" value={input.auxeticCellH} min={0.06} max={0.35} step={0.01} unit="m" onChange={(v) => set("auxeticCellH", v)} />
          <NumberInput label="Re-entrant angle" value={input.reentrantAngle} min={35} max={80} step={1} unit="°" onChange={(v) => set("reentrantAngle", v)} />
          <NumberInput label="Air gap" value={input.airGap} min={0.1} max={2.5} step={0.1} unit="m" onChange={(v) => set("airGap", v)} />
          <NumberInput label="Armox 내피" value={input.armoxThickness} min={0.01} max={0.08} step={0.005} unit="m" onChange={(v) => set("armoxThickness", v)} />

          <h3>04. Load + isolation</h3>
          <NumberInput label="외부 등가 폭압" value={input.extPeakKpa} min={50} max={600} step={5} unit="kPa" onChange={(v) => set("extPeakKpa", v)} />
          <NumberInput label="공동 내부 폭압" value={input.internalPeakKpa} min={10} max={250} step={5} unit="kPa" onChange={(v) => set("internalPeakKpa", v)} />
          <NumberInput label="설계 PGA" value={input.seismicPga} min={0.05} max={0.8} step={0.01} unit="g" onChange={(v) => set("seismicPga", v)} />
          <NumberInput label="스프링 stroke" value={input.springStroke} min={0.05} max={0.6} step={0.01} unit="m" onChange={(v) => set("springStroke", v)} />
          <NumberInput label="스프링 고유진동수" value={input.springFreq} min={0.8} max={6} step={0.1} unit="Hz" onChange={(v) => set("springFreq", v)} />
          <NumberInput label="감쇠비" value={input.damping} min={0.01} max={0.25} step={0.01} unit="ζ" onChange={(v) => set("damping", v)} />
          <NumberInput label="접합부 기본용량" value={input.connectionCapacity} min={200} max={1800} step={25} unit="kN" onChange={(v) => set("connectionCapacity", v)} />
          <NumberInput label="접합부 연성" value={input.connectionDuctility} min={2} max={14} step={0.5} unit="μ" onChange={(v) => set("connectionDuctility", v)} />

          <h3>05. Construction</h3>
          <NumberInput label="전체 공기" value={input.totalConstructionMonths} min={12} max={60} step={1} unit="개월" onChange={(v) => set("totalConstructionMonths", v)} />
          <NumberInput label="준비기간" value={input.mobilizationMonths} min={1} max={6} step={1} unit="개월" onChange={(v) => set("mobilizationMonths", v)} />
          <NumberInput label="굴착기간" value={input.excavationMonths} min={3} max={18} step={1} unit="개월" onChange={(v) => set("excavationMonths", v)} />
          <NumberInput label="라이닝/패널" value={input.liningMonths} min={2} max={12} step={1} unit="개월" onChange={(v) => set("liningMonths", v)} />
          <NumberInput label="모듈 설치" value={input.moduleInstallMonths} min={2} max={12} step={1} unit="개월" onChange={(v) => set("moduleInstallMonths", v)} />
          <NumberInput label="MEP 설치" value={input.mepMonths} min={2} max={12} step={1} unit="개월" onChange={(v) => set("mepMonths", v)} />
          <NumberInput label="시운전" value={input.commissioningMonths} min={1} max={8} step={1} unit="개월" onChange={(v) => set("commissioningMonths", v)} />
          <NumberInput label="일 굴착량" value={input.dailyExcavationM3} min={200} max={1400} step={20} unit="㎥/day" onChange={(v) => set("dailyExcavationM3", v)} />

          <h3>06. MEP + Environment</h3>
          <NumberInput label="상주 인원" value={input.occupancy} min={40} max={800} step={10} unit="명" onChange={(v) => set("occupancy", v)} />
          <NumberInput label="환기횟수" value={input.ventilationAch} min={2} max={14} step={0.5} unit="ACH" onChange={(v) => set("ventilationAch", v)} />
          <NumberInput label="1인 외기량" value={input.freshAirPerPerson} min={20} max={90} step={5} unit="㎥/h·p" onChange={(v) => set("freshAirPerPerson", v)} />
          <NumberInput label="샤프트 개수" value={input.shaftCount} min={2} max={18} step={1} unit="개" onChange={(v) => set("shaftCount", v)} />
          <NumberInput label="샤프트 1개 면적" value={input.shaftAreaEach} min={0.8} max={8} step={0.2} unit="㎡" onChange={(v) => set("shaftAreaEach", v)} />
          <NumberInput label="기계실 비율" value={input.mechRoomRatio} min={0.03} max={0.18} step={0.01} unit="ratio" onChange={(v) => set("mechRoomRatio", v)} />
          <NumberInput label="내부 발열" value={input.internalHeatWm2} min={15} max={130} step={5} unit="W/㎡" onChange={(v) => set("internalHeatWm2", v)} />
          <NumberInput label="조명 밀도" value={input.lightingWm2} min={4} max={24} step={1} unit="W/㎡" onChange={(v) => set("lightingWm2", v)} />
          <NumberInput label="목표 조도" value={input.targetIlluminanceLux} min={200} max={1000} step={50} unit="lux" onChange={(v) => set("targetIlluminanceLux", v)} />
          <NumberInput label="장비 소음" value={input.equipmentNoiseDb} min={60} max={100} step={1} unit="dB" onChange={(v) => set("equipmentNoiseDb", v)} />
          <NumberInput label="차음 성능" value={input.wallStc} min={25} max={70} step={1} unit="STC" onChange={(v) => set("wallStc", v)} />

          <h3>07. Power + cost</h3>
          <NumberInput label="중요부하" value={input.criticalPowerWm2} min={30} max={220} step={5} unit="W/㎡" onChange={(v) => set("criticalPowerWm2", v)} />
          <NumberInput label="C4I 전력" value={input.c4iPowerWm2} min={60} max={400} step={10} unit="W/㎡" onChange={(v) => set("c4iPowerWm2", v)} />
          <NumberInput label="백업 시간" value={input.backupHours} min={12} max={168} step={6} unit="h" onChange={(v) => set("backupHours", v)} />
          <NumberInput label="발전기 중복계수" value={input.generatorRedundancy} min={1} max={2.5} step={0.1} unit="N" onChange={(v) => set("generatorRedundancy", v)} />
          <NumberInput label="모듈 단가" value={input.unitModuleCost} min={2} max={12} step={0.2} unit="억원/100㎡" onChange={(v) => set("unitModuleCost", v)} />
          <NumberInput label="지휘통제 시스템" value={input.c4iSystemCost} min={200} max={2400} step={50} unit="억원/10,000㎡" onChange={(v) => set("c4iSystemCost", v)} />
          <NumberInput label="생존설비" value={input.lifeSupportCost} min={150} max={1600} step={50} unit="억원/10,000㎡" onChange={(v) => set("lifeSupportCost", v)} />
          <NumberInput label="통신·전자장비" value={input.commsElectronicsCost} min={150} max={2000} step={50} unit="억원/10,000㎡" onChange={(v) => set("commsElectronicsCost", v)} />
        </aside>

        <section className={styles.workspace}>
          <div className={styles.cardHeader}>
            <div>
              <span className={styles.kicker}>3D stacking plan</span>
              <h2>자유 회전 가능한 XYZ 모듈 배치</h2>
            </div>
            <b className={scoreClass}>{scoreLabel(evals.overall)}</b>
          </div>

            <StackingScene
            input={input}
            modules={modules}
            contacts={contacts}
            selectedModule={selectedModule}
            setSelectedModule={setSelectedModule}
            view={view}
            setView={setView}
            graphicModel={graphicModel}
            />

          <div className={styles.cards4}>
            <article className={styles.metricCard}>
              <span>연면적 충족률</span>
              <b>{nfmt(evals.density * 100, 1)}%</b>
              <small>{nfmt(evals.areaBuilt, 0)}㎡ / {nfmt(input.targetArea, 0)}㎡</small>
            </article>
            <article className={styles.metricCard}>
              <span>총 구조체 하중</span>
              <b>{nfmt(evals.loads.totalStructuralT, 0)}t</b>
              <small>Armox, auxetic, module, live/equipment load 포함</small>
            </article>
            <article className={styles.metricCard}>
              <span>냉방부하</span>
              <b>{nfmt(evals.cooling.designKw, 0)}kW</b>
              <small>{nfmt(evals.cooling.rt, 0)} RT</small>
            </article>
            <article className={styles.metricCard}>
              <span>발전용량</span>
              <b>{nfmt(evals.power.generatorKw, 0)}kW</b>
              <small>Backup {nfmt(input.backupHours, 0)}h 기준</small>
            </article>
          </div>

          <div className={styles.twoColWide}>
            <article className={styles.panelCard}>
              <div className={styles.cardHeader}>
                <h2>Contact & joint editor</h2>
                <span>{selectedModuleObj ? `M${selectedModuleObj.id} ${selectedModuleObj.type}` : "All modules"}</span>
              </div>

              <div className={styles.contactTable}>
                {selectedModuleContacts.slice(0, 12).map((c) => (
                  <button
                    key={c.id}
                    className={`${styles.contactRow} ${
                      selectedContactObj?.id === c.id ? styles.activeContact : ""
                    }`}
                    onClick={() => setSelectedContact(c.id)}
                  >
                    <span>M{c.a} ↔ M{c.b}</span>
                    <em>{c.axis.toUpperCase()} face · {nfmt(c.area, 1)}㎡</em>
                    <b>{nfmt(c.utilization * 100, 1)}%</b>
                  </button>
                ))}
              </div>

              {selectedContactObj && (
                <div className={styles.jointEditor}>
                  <h3>M{selectedContactObj.a} - M{selectedContactObj.b} 접합부 형식</h3>
                  <div className={styles.jointButtons}>
                    {(Object.keys(jointNames) as JointType[]).map((jt) => (
                      <button
                        key={jt}
                        className={selectedContactObj.type === jt ? styles.activeJoint : ""}
                        onClick={() =>
                          setJointOverrides((p) => ({ ...p, [selectedContactObj.id]: jt }))
                        }
                      >
                        {jointNames[jt]}
                      </button>
                    ))}
                  </div>
                  <p>{jointFactor[selectedContactObj.type].note}</p>
                </div>
              )}
            </article>

            <article className={styles.panelCard}>
              <div className={styles.cardHeader}>
                <h2>ReLU optimization result</h2>
                <span>penalty-based</span>
              </div>
              <p className={styles.note}>
                목표 연면적 부족, 접합부 초과 utilization, 전달응답 초과, 환경성능 부족분을 ReLU penalty로
                계산하고 비용과 종합점수를 함께 고려합니다.
              </p>
              <button className={styles.optimizeButton} onClick={applyOptimization}>최적 후보 적용</button>
              {opt ? (
                <div className={styles.optBox}>
                  <p><span>Objective</span><b>{nfmt(opt.objective, 2)}</b></p>
                  <p><span>Score</span><b>{nfmt(opt.score, 1)}</b></p>
                  <p><span>Modules</span><b>{opt.modules}</b></p>
                  <p><span>Cost</span><b>{nfmt(opt.cost, 0)} 억원</b></p>
                  <p><span>Max joint util.</span><b>{nfmt(opt.maxUtil * 100, 1)}%</b></p>
                </div>
              ) : (
                <div className={styles.emptyOpt}>아직 최적화를 실행하지 않았습니다.</div>
              )}
            </article>
          </div>

          <div className={styles.twoCol}>
            <article className={styles.panelCard}>
              <div className={styles.cardHeader}>
                <h2>Auxetic panel preview</h2>
                <span>{input.reentrantAngle}°</span>
              </div>
              <AuxeticPreview input={input} />
              <p className={styles.note}>
                Re-entrant cell 각도와 패널 두께가 바뀌면 전달응답, 패널 중량, 재료 수량, 비용이 함께 바뀝니다.
              </p>
            </article>

            <article className={styles.panelCard}>
              <div className={styles.cardHeader}>
                <h2>Load path attenuation</h2>
                <span>{scenario}</span>
              </div>
              <SectionStack input={input} scenario={scenario} />
              <p className={styles.note}>
                산체, 공동, 오세틱 패널, air gap, Armox 내피, 스프링 모듈을 순차 하중 경로로 표시합니다.
              </p>
            </article>
          </div>

          <div className={styles.twoCol}>
            <article className={styles.panelCard}>
              <div className={styles.cardHeader}>
                <h2>예상 하중</h2>
                <span>structural load</span>
              </div>
              <DataTable
                rows={[
                  ["Armox 내피 중량", `${nfmt(evals.loads.armoxMassT, 0)} t`],
                  ["오세틱 패널 중량", `${nfmt(evals.loads.auxeticMassT, 0)} t`],
                  ["모듈 고정하중", `${nfmt(evals.loads.moduleDeadT, 0)} t`],
                  ["활하중", `${nfmt(evals.loads.liveT, 0)} t`],
                  ["장비하중", `${nfmt(evals.loads.equipmentT, 0)} t`],
                  ["총 구조체 하중", `${nfmt(evals.loads.totalStructuralT, 0)} t`],
                  ["평균 등가하중", `${nfmt(evals.loads.avgLoadKpa, 1)} kPa`],
                ]}
              />
            </article>

            <article className={styles.panelCard}>
              <div className={styles.cardHeader}>
                <h2>환기·배관·기계실·샤프트</h2>
                <span>MEP planning</span>
              </div>
              <DataTable
                rows={[
                  ["설계 풍량", `${nfmt(evals.mep.designAirM3h, 0)} ㎥/h`],
                  ["필요 덕트 단면", `${nfmt(evals.mep.ductAreaM2, 2)} ㎡`],
                  ["샤프트 총면적", `${nfmt(evals.mep.totalShaftArea, 2)} ㎡`],
                  ["샤프트 사용률", `${nfmt(evals.mep.shaftUtilization * 100, 1)}%`],
                  ["기계실 면적", `${nfmt(evals.mep.mechRoomArea, 0)} ㎡`],
                  ["급수량", `${nfmt(evals.mep.waterM3Day, 1)} ㎥/day`],
                  ["주배관 등가직경", `${nfmt(evals.mep.pipeDiameterM * 1000, 0)} mm`],
                ]}
              />
            </article>
          </div>

          <div className={styles.twoCol}>
            <article className={styles.panelCard}>
              <div className={styles.cardHeader}>
                <h2>냉방부하 / 발전용량</h2>
                <span>cooling + power</span>
              </div>
              <DataTable
                rows={[
                  ["인체 발열", `${nfmt(evals.cooling.peopleKw, 0)} kW`],
                  ["장비 발열", `${nfmt(evals.cooling.equipmentKw, 0)} kW`],
                  ["조명 발열", `${nfmt(evals.cooling.lightingKw, 0)} kW`],
                  ["설계 냉방부하", `${nfmt(evals.cooling.designKw, 0)} kW`, `${nfmt(evals.cooling.rt, 0)} RT`],
                  ["중요부하", `${nfmt(evals.power.totalCriticalKw, 0)} kW`],
                  ["발전기 용량", `${nfmt(evals.power.generatorKw, 0)} kW`],
                  ["백업 에너지", `${nfmt(evals.power.backupKwh, 0)} kWh`],
                  ["연료 저장량", `${nfmt(evals.power.fuelL, 0)} L`],
                ]}
              />
            </article>

            <article className={styles.panelCard}>
              <div className={styles.cardHeader}>
                <h2>열·공기·빛·음환경 시뮬레이션</h2>
                <span>surrogate simulation</span>
              </div>
              <DataTable
                rows={[
                  ["열환경 점수", `${nfmt(evals.env.thermalScore, 0)} / 100`, `Target ${input.targetTempC}℃, RH ${input.targetRhMin}-${input.targetRhMax}%`],
                  ["공기환경 점수", `${nfmt(evals.env.airScore, 0)} / 100`, `CO₂ ${nfmt(evals.env.co2SteadyPpm, 0)} ppm`],
                  ["빛환경 점수", `${nfmt(evals.env.lightScore, 0)} / 100`, `${nfmt(input.targetIlluminanceLux, 0)} lux`],
                  ["음환경 점수", `${nfmt(evals.env.acousticScore, 0)} / 100`, `Room ${nfmt(evals.env.roomNoiseDb, 1)} dB / NC-${input.ncTarget}`],
                  ["종합 환경 점수", `${nfmt(evals.env.overallEnvScore, 0)} / 100`],
                ]}
              />
            </article>
          </div>

          <article className={styles.panelCard}>
            <div className={styles.cardHeader}>
              <h2>공사기간 계획</h2>
              <span>overall schedule + preparation</span>
            </div>

            <div className={styles.scheduleGrid}>
              {evals.schedule.phases.map((p) => (
                <div key={p.phase} className={styles.scheduleRow}>
                  <div>
                    <b>{p.phase}</b>
                    <span>Month {p.startMonth} → {p.startMonth + p.durationMonth}</span>
                    <p>{p.preparation}</p>
                  </div>
                  <i
                    style={{
                      left: `${(p.startMonth / Math.max(evals.schedule.totalMonths, 1)) * 100}%`,
                      width: `${(p.durationMonth / Math.max(evals.schedule.totalMonths, 1)) * 100}%`,
                    }}
                  />
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panelCard}>
            <div className={styles.cardHeader}>
              <h2>기간별 요구 재료 수</h2>
              <span>procurement schedule</span>
            </div>

            <div className={styles.materialTable}>
              <div className={styles.materialHead}>
                <span>Item</span>
                <span>Quantity</span>
                <span>Required by</span>
                <span>Note</span>
              </div>
              {evals.materials.items.map((m) => (
                <div key={m.item} className={styles.materialRow}>
                  <span>{m.item}</span>
                  <b>{nfmt(m.quantity, 0)} {m.unit}</b>
                  <em>D+{m.requiredByDay}</em>
                  <small>{m.note}</small>
                </div>
              ))}
            </div>
          </article>

          <article className={styles.panelCard}>
            <div className={styles.cardHeader}>
              <h2>Performance dashboard</h2>
              <span>brief interpretation</span>
            </div>

            <div className={styles.barGrid}>
              {[
                ["Blast / seismic response", evals.blastScore, "폭압 또는 지진 입력이 모듈 쪽으로 얼마나 낮아졌는지 보는 항목입니다."],
                ["Layout efficiency", evals.layoutScore, "목표 연면적, 공동 내 여유공간, 접촉부 연결성을 함께 봅니다."],
                ["Constructability", evals.constructScore, "모듈 수, 층수, 패널 두께, 접합부와 임무설비 증가에 따른 시공 부담을 반영합니다."],
                ["Joint reserve", evals.jointReserve, "가장 불리한 접합부의 demand/capacity 여유율입니다."],
                ["Environmental readiness", evals.env.overallEnvScore, "열·공기·빛·음환경 surrogate score입니다."],
              ].map(([label, value, desc]) => (
                <div className={styles.barRow} key={label as string}>
                  <span>
                    {label as string}
                    <small>{desc as string}</small>
                  </span>
                  <div>
                    <i style={{ width: `${value}%` }} />
                  </div>
                  <b>{Math.round(value as number)}</b>
                </div>
              ))}
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
            <p>
              이 페이지는 발표와 개념설계 단계에서 배치, 접합부, 방폭 패널, 공조·전력·환경 성능,
              공정·재료 조달계획을 비교하기 위한 surrogate 모델입니다. 실제 방호성능과 총사업비 확정에는
              현장 지반조사, 절리망 모델, 3D 암반 동역학, 비선형 접합부 해석, CFD/열환경/음향 전문 시뮬레이션,
              장비 배치계획, 전력·공조·통신 이중화, 운영인력·보급계획 검토가 별도로 필요합니다.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}