"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/pages/Canopy.module.css";

/**
 * 구글맵 API 키
 * - 클라이언트에서 로드되므로 .env 의 키를 NEXT_PUBLIC_ 로 노출해야 합니다.
 *   예) NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<GOOGLE_MAPS_API_KEY 값>
 */

type CanopySize = 10 | 20 | 40 | 100;

type CanopyOption = {
  diameter: CanopySize;
  name: string;
  label: string;
  area: number;
  membraneArea: number;
  unitAssetCost: number;
  installDays: number;
  removalDays: number;
  installCost: number;
  removalCost: number;
  dailyRental: number;
  crew: string;
  noiseReduction: string;
};

type LatLng = { lat: number; lng: number };

type PlacedCanopy = {
  id: string;
  diameter: CanopySize;
  lat: number;
  lng: number;
  rotation: number;
};

type MapMode = "place" | "boundary";
type MapViewMode = "roadmap" | "satellite" | "threeD";

type Recommendation = {
  id: string;
  label: string;
  note: string;
  sizeMix: string;
  count: number;
  placements: PlacedCanopy[];
  siteArea: number;
  coveragePct: number;
  cost: number;
  totalBenefit: number;
  netValue: number;
  roi: number;
  reluLoss: number;
};

const SIZE_KEYS: CanopySize[] = [10, 20, 40, 100];
const SIZES_DESC: CanopySize[] = [100, 40, 20, 10];

const ORIGIN_NAME = "서울대학교 39동";
const ORIGIN_LAT = 37.4591;
const ORIGIN_LNG = 126.9515;

const DEFAULT_SITE_LAT = 37.5665;
const DEFAULT_SITE_LNG = 126.978;

const METERS_PER_DEG_LAT = 111_320;

/**
 * ─────────────────────────────────────────────────────────────────────────
 * 단가 산정 근거 (사업성 검토용 추정치 — 실제 견적은 막재 등급·차음 사양에 따라 변동)
 *
 * 0) 정사각형 배치: 한 변 = 규격(m), 바닥면적 = 한 변²  (지도 위에서 각도 회전 가능)
 * 1) 막재 표면적(membraneArea) ≈ 바닥면적 × 2  (반구 근사. 차음용 높이 확보 가정)
 * 2) 자재·제작 원가(unitAssetCost) = 막 외피(가공 포함) + 송풍/앵커/에어록/제어
 * 3) 설치/철거비 = 현장 인건비 + 장비 — 운송 별도
 * 4) 일 임대료 ≈ 자산원가 ÷ 약 125회(유상 가동일) + 정비/마진
 * 5) 건설사 가치: 지체상금률 0.1%/일 + 현장 고정 간접비(추정) 0.02%/일
 * ─────────────────────────────────────────────────────────────────────────
 */
const CANOPY_OPTIONS: Record<CanopySize, CanopyOption> = {
  10: {
    diameter: 10,
    name: "10m",
    label: "소형 굴착 구역",
    area: 10 * 10,
    membraneArea: 10 * 10 * 2,
    unitAssetCost: 25_000_000,
    installDays: 1,
    removalDays: 1,
    installCost: 1_800_000,
    removalCost: 1_200_000,
    dailyRental: 200_000,
    crew: "3~5명",
    noiseReduction: "8~12dB",
  },
  20: {
    diameter: 20,
    name: "20m",
    label: "굴삭기 1대 작업 구역",
    area: 20 * 20,
    membraneArea: 20 * 20 * 2,
    unitAssetCost: 80_000_000,
    installDays: 3,
    removalDays: 1,
    installCost: 9_000_000,
    removalCost: 3_500_000,
    dailyRental: 650_000,
    crew: "5~8명",
    noiseReduction: "12~18dB",
  },
  40: {
    diameter: 40,
    name: "40m",
    label: "중형 터파기 구역",
    area: 40 * 40,
    membraneArea: 40 * 40 * 2,
    unitAssetCost: 280_000_000,
    installDays: 7,
    removalDays: 3,
    installCost: 26_000_000,
    removalCost: 12_000_000,
    dailyRental: 2_200_000,
    crew: "8~15명",
    noiseReduction: "15~23dB",
  },
  100: {
    diameter: 100,
    name: "100m",
    label: "대형 장기 현장",
    area: 100 * 100,
    membraneArea: 100 * 100 * 2,
    unitAssetCost: 1_500_000_000,
    installDays: 24,
    removalDays: 8,
    installCost: 85_000_000,
    removalCost: 35_000_000,
    dailyRental: 12_000_000,
    crew: "20명 이상",
    noiseReduction: "20~30dB",
  },
};

const CANOPY_HEIGHT_BY_SIZE: Record<CanopySize, number> = {
  10: 4,
  20: 8,
  40: 14,
  100: 28,
};

const getCanopyExtrudeHeight = (diameter: CanopySize) =>
  CANOPY_HEIGHT_BY_SIZE[diameter] ?? Math.max(4, diameter * 0.28);

// 건설사 가치 계산 상수
const DELAY_PENALTY_RATE = 0.001; // 지체상금률 0.1%/일 (국가계약 기준)
const OVERHEAD_RATE_PER_DAY = 0.0002; // 현장 고정 간접비 추정 0.02%/일

// ReLU 조합 최적화 손실 가중치 (KRW 단위로 정규화)
const PENALTY_PER_M2 = 120_000; // 미커버 면적 1㎡당 페널티 (커버 강제)
const OVERFLOW_PER_M2 = 8_000; // 현장 밖으로 넘친 막재 1㎡당 페널티 (낭비)
const NOISE_RISK_MARGIN = 40; // 민원 위험 버퍼(m)

const CONTRACT_PRESETS: { label: string; value: number }[] = [
  { label: "10억", value: 1_000_000_000 },
  { label: "50억", value: 5_000_000_000 },
  { label: "100억", value: 10_000_000_000 },
  { label: "500억", value: 50_000_000_000 },
  { label: "1,000억", value: 100_000_000_000 },
  { label: "3,000억", value: 300_000_000_000 },
  { label: "5,000억", value: 500_000_000_000 },
  { label: "1조", value: 1_000_000_000_000 },
];

const formatKRW = (value: number) => {
  if (value <= 0) return "0원";
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1).replace(".0", "")}억 원`;
  }
  if (value >= 10_000) {
    return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만 원`;
  }
  return `${value.toLocaleString("ko-KR")}원`;
};

const formatSignedKRW = (value: number) => {
  if (value === 0) return "0원";
  const sign = value > 0 ? "+" : "−";
  return `${sign}${formatKRW(Math.abs(value))}`;
};

const formatNumber = (value: number) => value.toLocaleString("ko-KR");


const formatContractEokInput = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return "";
  const eok = value / 100_000_000;
  return Number.isInteger(eok) ? String(eok) : eok.toFixed(1).replace(".0", "");
};

const parseContractEokInput = (raw: string) => {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return 0;
  const eok = Number(cleaned);
  if (!Number.isFinite(eok)) return 0;
  return Math.round(eok * 100_000_000);
};

const getBoundaryArea = (boundary: LatLng[]) => {
  if (boundary.length < 3) return 0;
  const c = centroidOf(boundary);
  const proj = makeProjector(c.lat, c.lng);
  return shoelaceArea(boundary.map((p) => proj.toLocal(p.lat, p.lng)));
};

const estimateInputsFromSiteArea = (siteArea: number) => {
  if (!Number.isFinite(siteArea) || siteArea <= 0) {
    return { contractValue: 10_000_000_000, daysSaved: 14 };
  }

  // 사업성 페이지용 자동 추정치입니다.
  // 도심 굴착·가설·소음관리 조건을 보수적으로 보고 ㎡당 약 320만원을 기준으로 둡니다.
  const rawContract = siteArea * 3_200_000;
  const roundedContract = Math.round(rawContract / 100_000_000) * 100_000_000;
  const contractValue = Math.min(
    1_000_000_000_000,
    Math.max(1_000_000_000, roundedContract)
  );

  // 현장이 커질수록 야간작업 허용 효과가 커진다고 보고 완만하게 증가시킵니다.
  const daysSaved = Math.min(
    90,
    Math.max(3, Math.round(4 + Math.sqrt(siteArea) / 4 + siteArea / 4500))
  );

  return { contractValue, daysSaved };
};

const addDays = (base: Date, days: number) => {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);

const getDistanceKm = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) => {
  const R = 6371;
  const dLat = ((toLat - fromLat) * Math.PI) / 180;
  const dLng = ((toLng - fromLng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((fromLat * Math.PI) / 180) *
      Math.cos((toLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// 중심점·한 변(m)·회전각(도)으로 정사각형 네 꼭짓점 위경도 계산
const getSquareCorners = (
  lat: number,
  lng: number,
  side: number,
  rotationDeg: number
): [number, number][] => {
  const half = side / 2;
  const theta = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const metersPerDegLng = METERS_PER_DEG_LAT * Math.cos((lat * Math.PI) / 180);
  const base: [number, number][] = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];
  return base.map(([x, y]) => {
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return [lat + ry / METERS_PER_DEG_LAT, lng + rx / metersPerDegLng] as [
      number,
      number,
    ];
  });
};

// 로컬 평면 투영 (centroid 기준 동/북 미터)
const makeProjector = (cLat: number, cLng: number) => {
  const mpdLng = METERS_PER_DEG_LAT * Math.cos((cLat * Math.PI) / 180);
  return {
    toLocal: (lat: number, lng: number) => ({
      x: (lng - cLng) * mpdLng,
      y: (lat - cLat) * METERS_PER_DEG_LAT,
    }),
    toLatLng: (x: number, y: number) => ({
      lat: cLat + y / METERS_PER_DEG_LAT,
      lng: cLng + x / mpdLng,
    }),
  };
};

type Pt = { x: number; y: number };

const pointInPolyLocal = (pt: Pt, poly: Pt[]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect =
      yi > pt.y !== yj > pt.y &&
      pt.x < ((xj - xi) * (pt.y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};

const shoelaceArea = (poly: Pt[]) => {
  let s = 0;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    s += (poly[j].x + poly[i].x) * (poly[j].y - poly[i].y);
  }
  return Math.abs(s / 2);
};

const squareContainsLocal = (
  pt: Pt,
  center: Pt,
  side: number,
  theta: number
) => {
  const dx = pt.x - center.x;
  const dy = pt.y - center.y;
  const u = dx * Math.cos(theta) + dy * Math.sin(theta);
  const v = -dx * Math.sin(theta) + dy * Math.cos(theta);
  const h = side / 2;
  return Math.abs(u) <= h && Math.abs(v) <= h;
};

const centroidOf = (points: LatLng[]) => {
  const lat = points.reduce((s, p) => s + p.lat, 0) / points.length;
  const lng = points.reduce((s, p) => s + p.lng, 0) / points.length;
  return { lat, lng };
};

// ── 견적/가치 순수 계산 (메인 패널과 추천 카드가 공유) ──
const buildQuote = (
  placed: PlacedCanopy[],
  rentalDays: number,
  center: LatLng
) => {
  const distanceKm = getDistanceKm(ORIGIN_LAT, ORIGIN_LNG, center.lat, center.lng);

  const equipmentCost = placed.reduce((sum, item) => {
    const o = CANOPY_OPTIONS[item.diameter];
    return sum + o.installCost + o.removalCost + o.dailyRental * rentalDays;
  }, 0);

  const totalArea = placed.reduce(
    (sum, item) => sum + CANOPY_OPTIONS[item.diameter].area,
    0
  );

  const largestDiameter = placed.reduce<CanopySize>(
    (max, item) => (item.diameter > max ? item.diameter : max),
    10
  );
  const largestOption = CANOPY_OPTIONS[largestDiameter];

  const transportCost =
    placed.length === 0 ? 0 : Math.round(520_000 + distanceKm * 38_000);

  const largeEquipmentSurcharge =
    placed.filter((i) => i.diameter === 100).length * 4_800_000 +
    placed.filter((i) => i.diameter === 40).length * 1_600_000;

  const soundMonitoringCost = placed.length > 0 ? 1_300_000 : 0;
  const safetyPlanCost =
    placed.length > 0 ? 900_000 + largestDiameter * 42_000 : 0;

  const subtotal =
    equipmentCost +
    transportCost +
    largeEquipmentSurcharge +
    soundMonitoringCost +
    safetyPlanCost;

  const vat = Math.round(subtotal * 0.1);
  const total = subtotal + vat;

  const quantityDays = Math.max(0, placed.length - 1) * 0.4;
  const installDays =
    placed.length === 0
      ? 0
      : Math.ceil(largestOption.installDays + quantityDays);
  const removalDays =
    placed.length === 0 ? 0 : Math.ceil(largestOption.removalDays);

  const transportHours =
    placed.length === 0
      ? 0
      : Math.max(
          3,
          Math.ceil(distanceKm / 28 + (largestDiameter >= 100 ? 10 : 4))
        );

  const today = new Date();
  const arrivalDate = addDays(today, transportHours > 10 ? 1 : 0);
  const installFinishDate = addDays(arrivalDate, installDays);
  const removalFinishDate = addDays(installFinishDate, rentalDays + removalDays);

  return {
    distanceKm,
    equipmentCost,
    transportCost,
    largeEquipmentSurcharge,
    soundMonitoringCost,
    safetyPlanCost,
    subtotal,
    vat,
    total,
    totalArea,
    largestDiameter,
    installDays,
    removalDays,
    transportHours,
    arrivalDate,
    installFinishDate,
    removalFinishDate,
  };
};

const buildValue = (cost: number, contractValue: number, daysSaved: number) => {
  const dailyDelayPenalty = contractValue * DELAY_PENALTY_RATE;
  const dailyOverhead = contractValue * OVERHEAD_RATE_PER_DAY;
  const delayAvoidance = dailyDelayPenalty * daysSaved;
  const overheadSaving = dailyOverhead * daysSaved;
  const totalBenefit = delayAvoidance + overheadSaving;
  const netValue = totalBenefit - cost;
  const roiMultiple = cost > 0 ? totalBenefit / cost : 0;
  const paybackDays = dailyDelayPenalty > 0 ? cost / dailyDelayPenalty : 0;
  return {
    dailyDelayPenalty,
    dailyOverhead,
    delayAvoidance,
    overheadSaving,
    totalBenefit,
    netValue,
    roiMultiple,
    paybackDays,
  };
};

// ── 현장 경계 내부에만 들어가는 비중첩 캐노피 조합 추천 ──
type LocalCanopyCell = {
  center: Pt;
  S: CanopySize;
  theta: number;
  angleDeg: number;
  coverIdx: number[];
  corners: Pt[];
};

const getLocalSquareCorners = (center: Pt, side: number, theta: number): Pt[] => {
  const h = side / 2;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const local: Pt[] = [
    { x: -h, y: -h },
    { x: h, y: -h },
    { x: h, y: h },
    { x: -h, y: h },
  ];
  return local.map((p) => ({
    x: center.x + p.x * cos - p.y * sin,
    y: center.y + p.x * sin + p.y * cos,
  }));
};

const ccw = (a: Pt, b: Pt, c: Pt) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);

const segmentsIntersectLocal = (a: Pt, b: Pt, c: Pt, d: Pt) => {
  const ab1 = ccw(a, b, c);
  const ab2 = ccw(a, b, d);
  const cd1 = ccw(c, d, a);
  const cd2 = ccw(c, d, b);
  return ab1 * ab2 < 0 && cd1 * cd2 < 0;
};

const squareInsidePolyLocal = (
  center: Pt,
  side: number,
  theta: number,
  poly: Pt[]
) => {
  const corners = getLocalSquareCorners(center, side, theta);
  if (!corners.every((pt) => pointInPolyLocal(pt, poly))) return false;

  // 오목한 현장 경계에서는 네 꼭짓점이 내부여도 사각형 변이 경계 밖으로 튈 수 있어
  // 사각형 변과 현장 경계 변의 교차까지 막는다.
  for (let i = 0; i < 4; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % 4];
    for (let j = 0; j < poly.length; j++) {
      const c = poly[j];
      const d = poly[(j + 1) % poly.length];
      if (segmentsIntersectLocal(a, b, c, d)) return false;
    }
  }

  return true;
};

const projectAxis = (pts: Pt[], axis: Pt) => {
  let min = Infinity;
  let max = -Infinity;
  for (const p of pts) {
    const v = p.x * axis.x + p.y * axis.y;
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  return { min, max };
};

const rotatedRectsOverlap = (a: Pt[], b: Pt[], gap = 1.2) => {
  const axes: Pt[] = [];
  const pushAxes = (r: Pt[]) => {
    for (let i = 0; i < 4; i++) {
      const p1 = r[i];
      const p2 = r[(i + 1) % 4];
      const ex = p2.x - p1.x;
      const ey = p2.y - p1.y;
      const len = Math.hypot(ex, ey) || 1;
      axes.push({ x: -ey / len, y: ex / len });
    }
  };
  pushAxes(a);
  pushAxes(b);

  for (const axis of axes) {
    const pa = projectAxis(a, axis);
    const pb = projectAxis(b, axis);
    if (pa.max + gap < pb.min || pb.max + gap < pa.min) return false;
  }
  return true;
};

const createRefPoints = (polyLocal: Pt[], minX: number, maxX: number, minY: number, maxY: number, maxDim: number) => {
  const refStep = Math.min(10, Math.max(2.5, maxDim / 34));
  const refPoints: Pt[] = [];
  for (let x = minX + refStep / 2; x <= maxX; x += refStep) {
    for (let y = minY + refStep / 2; y <= maxY; y += refStep) {
      const pt = { x, y };
      if (pointInPolyLocal(pt, polyLocal)) refPoints.push(pt);
    }
  }
  return { refStep, refPoints };
};

const buildCellsForAngle = (
  polyLocal: Pt[],
  refPoints: Pt[],
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  angleDeg: number
): LocalCanopyCell[] => {
  const theta = (angleDeg * Math.PI) / 180;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const bboxCorners = [
    { x: bounds.minX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.minY },
    { x: bounds.maxX, y: bounds.maxY },
    { x: bounds.minX, y: bounds.maxY },
  ];
  const us = bboxCorners.map((p) => p.x * cos + p.y * sin);
  const vs = bboxCorners.map((p) => -p.x * sin + p.y * cos);
  const uMin = Math.min(...us);
  const uMax = Math.max(...us);
  const vMin = Math.min(...vs);
  const vMax = Math.max(...vs);

  const cells: LocalCanopyCell[] = [];
  for (const S of SIZES_DESC) {
    // 시공상 겹침을 줄이기 위해 격자는 규격보다 살짝 넓게 둔다.
    const stride = S * 1.04;
    for (let u = uMin + S / 2; u <= uMax - S / 2; u += stride) {
      for (let v = vMin + S / 2; v <= vMax - S / 2; v += stride) {
        const center = { x: u * cos - v * sin, y: u * sin + v * cos };
        if (!squareInsidePolyLocal(center, S, theta, polyLocal)) continue;
        const coverIdx: number[] = [];
        for (let i = 0; i < refPoints.length; i++) {
          if (squareContainsLocal(refPoints[i], center, S, theta)) coverIdx.push(i);
        }
        if (coverIdx.length === 0) continue;
        cells.push({
          center,
          S,
          theta,
          angleDeg,
          coverIdx,
          corners: getLocalSquareCorners(center, S, theta),
        });
      }
    }
  }
  return cells;
};

const greedyPackCells = (
  candidates: LocalCanopyCell[],
  refPoints: Pt[],
  targetCoverage: number,
  maxCoverage: number
) => {
  const covered = new Set<number>();
  const selected: LocalCanopyCell[] = [];
  const sorted = [...candidates].sort((a, b) => {
    // 큰 캐노피를 무조건 우선하지 않고, 새 커버 면적 대비 비용과 규격 균형을 본다.
    const ca = CANOPY_OPTIONS[a.S].installCost + CANOPY_OPTIONS[a.S].dailyRental * 7;
    const cb = CANOPY_OPTIONS[b.S].installCost + CANOPY_OPTIONS[b.S].dailyRental * 7;
    return b.coverIdx.length / cb - a.coverIdx.length / ca;
  });

  while (covered.size / refPoints.length < targetCoverage) {
    let best: LocalCanopyCell | null = null;
    let bestScore = -Infinity;

    for (const cell of sorted) {
      if (selected.some((s) => rotatedRectsOverlap(s.corners, cell.corners))) continue;
      let newCover = 0;
      for (const idx of cell.coverIdx) if (!covered.has(idx)) newCover++;
      if (newCover <= 0) continue;

      const projectedCoverage = (covered.size + newCover) / refPoints.length;
      if (projectedCoverage > maxCoverage + 0.08 && selected.length > 0) continue;

      const option = CANOPY_OPTIONS[cell.S];
      const roughCost = option.installCost + option.removalCost + option.dailyRental * 7;
      const oversizePenalty = Math.max(0, projectedCoverage - maxCoverage) * 2.2;
      const countPenalty = selected.length * 0.008;
      const score = newCover / Math.max(1, roughCost / 1_000_000) - oversizePenalty - countPenalty;
      if (score > bestScore) {
        bestScore = score;
        best = cell;
      }
    }

    if (!best) break;
    selected.push(best);
    best.coverIdx.forEach((idx) => covered.add(idx));
    if (selected.length > 80) break;
  }

  return { cells: selected, coveragePct: covered.size / refPoints.length };
};

const cellsToRecommendation = (
  cells: LocalCanopyCell[],
  coveragePct: number,
  label: string,
  note: string,
  id: string,
  proj: ReturnType<typeof makeProjector>,
  siteArea: number,
  rentalDays: number,
  contractValue: number,
  daysSaved: number,
  angleDeg: number
): Recommendation => {
  const placements: PlacedCanopy[] = cells.map((cl, i) => {
    const ll = proj.toLatLng(cl.center.x, cl.center.y);
    return {
      id: `${id}-${i}`,
      diameter: cl.S,
      lat: ll.lat,
      lng: ll.lng,
      rotation: angleDeg,
    };
  });
  const c = placements.length > 0
    ? {
        lat: placements.reduce((s, p) => s + p.lat, 0) / placements.length,
        lng: placements.reduce((s, p) => s + p.lng, 0) / placements.length,
      }
    : { lat: DEFAULT_SITE_LAT, lng: DEFAULT_SITE_LNG };
  const quote = buildQuote(placements, rentalDays, c);
  const value = buildValue(quote.total, contractValue, daysSaved);
  const coverArea = coveragePct * siteArea;
  const under = Math.max(0, siteArea * 0.68 - coverArea);
  const excessiveCover = Math.max(0, coverArea - siteArea * 0.9);
  const reluLoss = quote.total + under * PENALTY_PER_M2 + excessiveCover * OVERFLOW_PER_M2;

  const counts: Record<number, number> = {};
  placements.forEach((p) => (counts[p.diameter] = (counts[p.diameter] || 0) + 1));
  const sizeMix = Object.keys(counts)
    .map(Number)
    .sort((a, b) => b - a)
    .map((k) => `${k}m ×${counts[k]}`)
    .join(" + ");

  return {
    id,
    label,
    note,
    sizeMix,
    count: placements.length,
    placements,
    siteArea,
    coveragePct,
    cost: quote.total,
    totalBenefit: value.totalBenefit,
    netValue: value.netValue,
    roi: value.roiMultiple,
    reluLoss,
  };
};

const recommendCombinations = (
  boundary: LatLng[],
  _rotationDeg: number,
  rentalDays: number,
  contractValue: number,
  daysSaved: number
): Recommendation[] => {
  if (boundary.length < 3) return [];

  const c = centroidOf(boundary);
  const proj = makeProjector(c.lat, c.lng);
  const polyLocal = boundary.map((p) => proj.toLocal(p.lat, p.lng));
  const siteArea = shoelaceArea(polyLocal);
  if (siteArea < 1) return [];

  const xs = polyLocal.map((p) => p.x);
  const ys = polyLocal.map((p) => p.y);
  const bounds = {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
  const maxDim = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY);
  const { refPoints } = createRefPoints(polyLocal, bounds.minX, bounds.maxX, bounds.minY, bounds.maxY, maxDim);
  if (refPoints.length === 0) return [];

  const angleCandidates = Array.from({ length: 12 }, (_, i) => i * 15);
  const packed = angleCandidates
    .map((angle) => {
      const candidates = buildCellsForAngle(polyLocal, refPoints, bounds, angle);
      const result = greedyPackCells(candidates, refPoints, 0.72, 0.84);
      return { angle, ...result };
    })
    .filter((r) => r.cells.length > 0);

  if (packed.length === 0) return [];

  const recs = packed.map((r, i) =>
    cellsToRecommendation(
      r.cells,
      r.coveragePct,
      "",
      "",
      `rec-${i}`,
      proj,
      siteArea,
      rentalDays,
      contractValue,
      daysSaved,
      r.angle
    )
  );

  const chosen: Recommendation[] = [];
  const sig = (r: Recommendation) => `${r.sizeMix}|${Math.round(r.coveragePct * 100)}|${r.placements[0]?.rotation ?? 0}`;
  const push = (r: Recommendation | undefined, label: string, note: string) => {
    if (!r) return;
    if (chosen.some((x) => sig(x) === sig(r))) return;
    chosen.push({ ...r, label, note });
  };

  const balanced = [...recs].sort((a, b) => {
    const target = 0.76;
    const aScore = Math.abs(a.coveragePct - target) * 15 + a.cost / 1_000_000_000 + a.count * 0.08;
    const bScore = Math.abs(b.coveragePct - target) * 15 + b.cost / 1_000_000_000 + b.count * 0.08;
    return aScore - bScore;
  })[0];
  push(balanced, "현실 배치", "경계 밖 돌출과 캐노피 중첩을 막고 70%대 커버를 목표로 배치");

  const minCost = [...recs]
    .filter((r) => r.coveragePct >= 0.62)
    .sort((a, b) => a.cost - b.cost)[0];
  push(minCost, "최소 비용", "경계 내부·비중첩 조건을 지키는 후보 중 최저 견적");

  const maxCover = [...recs]
    .filter((r) => r.coveragePct <= 0.9)
    .sort((a, b) => b.coveragePct - a.coveragePct || a.cost - b.cost)[0];
  push(maxCover, "커버 강화", "현장 내부에서 돌출 없이 커버율을 더 높인 조합");

  return chosen.slice(0, 3);
};

const createCanopyWebGLOverlay = (
  g: any,
  canopies: PlacedCanopy[],
  extruded: boolean
) => {
  if (!g?.maps?.WebGLOverlayView || canopies.length === 0) return null;

  const overlay = new g.maps.WebGLOverlayView();
  let glRef: WebGLRenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let vertexBuffer: WebGLBuffer | null = null;
  let indexBuffer: WebGLBuffer | null = null;
  let aPosition = -1;
  let uMatrix: WebGLUniformLocation | null = null;
  let uColor: WebGLUniformLocation | null = null;
  const animationStart = performance.now();
  const animationDuration = 640;

  const vertices = new Float32Array([
    -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
  ]);
  const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 6, 5, 4, 7, 6,
    0, 4, 5, 0, 5, 1,
    1, 5, 6, 1, 6, 2,
    2, 6, 7, 2, 7, 3,
    3, 7, 4, 3, 4, 0,
  ]);

  const compile = (gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  overlay.onContextRestored = ({ gl }: { gl: WebGLRenderingContext }) => {
    glRef = gl;
    const vs = compile(
      gl,
      gl.VERTEX_SHADER,
      `
      attribute vec3 a_position;
      uniform mat4 u_matrix;
      void main() {
        gl_Position = u_matrix * vec4(a_position, 1.0);
      }
    `
    );
    const fs = compile(
      gl,
      gl.FRAGMENT_SHADER,
      `
      precision mediump float;
      uniform vec4 u_color;
      void main() {
        gl_FragColor = u_color;
      }
    `
    );
    if (!vs || !fs) return;
    program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      program = null;
      return;
    }

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    aPosition = gl.getAttribLocation(program, "a_position");
    uMatrix = gl.getUniformLocation(program, "u_matrix");
    uColor = gl.getUniformLocation(program, "u_color");
  };

  overlay.onDraw = ({ gl, transformer }: { gl: WebGLRenderingContext; transformer: any }) => {
    if (!program || !vertexBuffer || !indexBuffer || !uMatrix || !uColor) return;

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.CULL_FACE);

    const rawProgress = Math.min(
      1,
      Math.max(0, (performance.now() - animationStart) / animationDuration)
    );
    const ease = 1 - Math.pow(1 - rawProgress, 3);
    const extrudeProgress = extruded ? ease : 1 - ease;

    for (const canopy of canopies) {
      const targetHeight = getCanopyExtrudeHeight(canopy.diameter);
      const height = Math.max(0.08, targetHeight * extrudeProgress);
      const alpha = canopy.diameter >= 100 ? 0.5 : canopy.diameter >= 40 ? 0.56 : 0.62;

      const matrix = transformer.fromLatLngAltitude(
        { lat: canopy.lat, lng: canopy.lng, altitude: height / 2 },
        new Float32Array([0, 0, canopy.rotation]),
        new Float32Array([canopy.diameter, canopy.diameter, height])
      );

      gl.uniformMatrix4fv(uMatrix, false, matrix);
      gl.uniform4f(uColor, 0.08, 0.18, 0.34, alpha * Math.max(0.2, extrudeProgress));
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

      // 상단 엣지를 밝게 덧그려 지도 위에서 직육면체 높이가 더 잘 읽히게 한다.
      gl.uniform4f(uColor, 0.85, 0.92, 1.0, 0.48 * Math.max(0.25, extrudeProgress));
      gl.drawElements(gl.LINE_LOOP, 4, gl.UNSIGNED_SHORT, 12);
    }

    gl.disableVertexAttribArray(aPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.useProgram(null);
    overlay.requestRedraw();
  };

  overlay.onRemove = () => {
    const gl = glRef;
    if (gl) {
      if (vertexBuffer) gl.deleteBuffer(vertexBuffer);
      if (indexBuffer) gl.deleteBuffer(indexBuffer);
      if (program) gl.deleteProgram(program);
    }
    glRef = null;
    program = null;
    vertexBuffer = null;
    indexBuffer = null;
  };

  return overlay;
};
export default function CanopyPage() {
  const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";
  const mapsMapId = process.env.NEXT_PUBLIC_GOOGLE_MAP_ID ?? "";

  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  const squareShapesRef = useRef<any[]>([]);
  const markersRef = useRef<any[]>([]);
  const boundaryShapeRef = useRef<any>(null);
  const riskShapeRef = useRef<any>(null);
  const webglCanopyOverlayRef = useRef<any>(null);

  const selectedDiameterRef = useRef<CanopySize>(20);
  const rotationRef = useRef<number>(0);
  const modeRef = useRef<MapMode>("place");
  const boundaryClosedRef = useRef<boolean>(false);

  const [selectedDiameter, setSelectedDiameter] = useState<CanopySize>(20);
  const [rotation, setRotation] = useState(0);
  const [rentalDays, setRentalDays] = useState(7);
  const [placedCanopies, setPlacedCanopies] = useState<PlacedCanopy[]>([]);
  const [selectedCanopyId, setSelectedCanopyId] = useState<string | null>(null);
  const [siteCenter, setSiteCenter] = useState<LatLng>({
    lat: DEFAULT_SITE_LAT,
    lng: DEFAULT_SITE_LNG,
  });

  const [mode, setMode] = useState<MapMode>("place");
  const [mapView, setMapView] = useState<MapViewMode>("roadmap");
  const [showCanopyVolume, setShowCanopyVolume] = useState(false);
  const [boundaryPoints, setBoundaryPoints] = useState<LatLng[]>([]);
  const [boundaryClosed, setBoundaryClosed] = useState(false);

  const [contractValue, setContractValue] = useState(10_000_000_000);
  const [contractInput, setContractInput] = useState(formatContractEokInput(10_000_000_000));
  const [daysSaved, setDaysSaved] = useState(14);
  const [autoEstimateNote, setAutoEstimateNote] = useState<string | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  selectedDiameterRef.current = selectedDiameter;
  rotationRef.current = rotation;
  modeRef.current = mode;
  boundaryClosedRef.current = boundaryClosed;

  // 구글맵 로드 & 초기화
  useEffect(() => {
    if (!mapsKey) {
      setMapError("구글맵 API 키가 없습니다. .env 의 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 를 확인하세요.");
      return;
    }

    const loadGoogleMaps = () =>
      new Promise<void>((resolve, reject) => {
        const w = window as any;
        if (w.google?.maps) {
          resolve();
          return;
        }
        const existing = document.querySelector<HTMLScriptElement>(
          'script[data-gmaps="true"]'
        );
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject());
          return;
        }
        const s = document.createElement("script");
        s.src = `https://maps.googleapis.com/maps/api/js?key=${mapsKey}&v=weekly`;
        s.async = true;
        s.defer = true;
        s.dataset.gmaps = "true";
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("Google Maps load failed"));
        document.head.appendChild(s);
      });

    const init = async () => {
      try {
        await loadGoogleMaps();
        const g = (window as any).google;
        if (!mapElRef.current || mapRef.current || !g?.maps) return;

        const map = new g.maps.Map(mapElRef.current, {
          center: { lat: DEFAULT_SITE_LAT, lng: DEFAULT_SITE_LNG },
          zoom: 18,
          mapTypeId: "roadmap",
          mapId: mapsMapId || undefined,
          renderingType: g.maps.RenderingType?.VECTOR,
          tilt: 0,
          heading: 0,
          gestureHandling: "greedy",
          streetViewControl: false,
          fullscreenControl: false,
          mapTypeControl: false,
        });

        // 출발지 마커
        new g.maps.Marker({
          position: { lat: ORIGIN_LAT, lng: ORIGIN_LNG },
          map,
          title: `${ORIGIN_NAME} · 운송 출발 기준점`,
          icon: {
            path: g.maps.SymbolPath.CIRCLE,
            scale: 7,
            fillColor: "#2563eb",
            fillOpacity: 1,
            strokeColor: "#fff",
            strokeWeight: 2,
          },
        });

        map.addListener("click", (e: any) => {
          const ll = { lat: e.latLng.lat(), lng: e.latLng.lng() };

          if (modeRef.current === "boundary") {
            if (boundaryClosedRef.current) return;
            setBoundaryPoints((prev) => [...prev, ll]);
            return;
          }

          // place 모드
          setSiteCenter(ll);
          setSelectedCanopyId(null);
          setPlacedCanopies((prev) => [
            ...prev,
            {
              id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
              diameter: selectedDiameterRef.current,
              lat: ll.lat,
              lng: ll.lng,
              rotation: rotationRef.current,
            },
          ]);
        });

        mapRef.current = map;
        setMapReady(true);
      } catch (err) {
        setMapError("구글맵을 불러오지 못했습니다. API 키와 결제/도메인 설정을 확인하세요.");
      }
    };

    init();
  }, [mapsKey, mapsMapId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;

    if (mapView === "roadmap") {
      map.setMapTypeId("roadmap");
      map.setTilt(0);
      map.setHeading(0);
      return;
    }

    if (mapView === "satellite") {
      map.setMapTypeId("satellite");
      map.setTilt(0);
      map.setHeading(0);
      return;
    }

    // 3D 뷰는 단순 위성 이미지가 아니라 vector basemap tilt/heading을 켠 상태로 둔다.
    // Google Cloud에서 vector Map ID를 연결하면 건물 입체 형상과 WebGL 캐노피 매쉬가 같은 렌더링 컨텍스트에 올라간다.
    map.setMapTypeId("roadmap");
    map.setZoom(Math.max(map.getZoom() ?? 18, 18));
    map.setTilt(67.5);
    map.setHeading(35);
  }, [mapReady, mapView]);

  useEffect(() => {
    if (mapView !== "threeD") setShowCanopyVolume(false);
  }, [mapView]);

  // 위험 버퍼 (centroid 기준 확장)
  const riskZone = useMemo<LatLng[] | null>(() => {
    if (!boundaryClosed || boundaryPoints.length < 3) return null;
    const c = centroidOf(boundaryPoints);
    const proj = makeProjector(c.lat, c.lng);
    return boundaryPoints.map((p) => {
      const l = proj.toLocal(p.lat, p.lng);
      const len = Math.hypot(l.x, l.y) || 1;
      const ex = l.x + (l.x / len) * NOISE_RISK_MARGIN;
      const ey = l.y + (l.y / len) * NOISE_RISK_MARGIN;
      return proj.toLatLng(ex, ey);
    });
  }, [boundaryPoints, boundaryClosed]);

  const siteArea = useMemo(() => {
    if (!boundaryClosed || boundaryPoints.length < 3) return 0;
    return getBoundaryArea(boundaryPoints);
  }, [boundaryClosed, boundaryPoints]);

  // 추천 조합 (ReLU)
  const recommendations = useMemo<Recommendation[]>(() => {
    if (!boundaryClosed) return [];
    return recommendCombinations(
      boundaryPoints,
      rotation,
      rentalDays,
      contractValue,
      daysSaved
    );
  }, [boundaryClosed, boundaryPoints, rotation, rentalDays, contractValue, daysSaved]);

  // 오버레이 그리기
  useEffect(() => {
    const g = (window as any).google;
    if (!mapReady || !g?.maps || !mapRef.current) return;
    const map = mapRef.current;

    squareShapesRef.current.forEach((s) => s.setMap(null));
    squareShapesRef.current = [];
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
    if (webglCanopyOverlayRef.current) {
      webglCanopyOverlayRef.current.setMap(null);
      webglCanopyOverlayRef.current = null;
    }
    if (boundaryShapeRef.current) {
      boundaryShapeRef.current.setMap(null);
      boundaryShapeRef.current = null;
    }
    if (riskShapeRef.current) {
      riskShapeRef.current.setMap(null);
      riskShapeRef.current = null;
    }

    // 위험 버퍼 (가장 아래)
    if (riskZone) {
      riskShapeRef.current = new g.maps.Polygon({
        paths: riskZone,
        strokeColor: "#f59e0b",
        strokeOpacity: 0.9,
        strokeWeight: 2,
        fillColor: "#f59e0b",
        fillOpacity: 0.12,
        clickable: false,
        zIndex: 0,
        map,
      });
    }

    // 현장 경계
    if (boundaryPoints.length > 0) {
      boundaryShapeRef.current = new g.maps.Polygon({
        paths: boundaryPoints,
        strokeColor: "#dc2626",
        strokeOpacity: 0.95,
        strokeWeight: 2,
        fillColor: "#dc2626",
        fillOpacity: boundaryClosed ? 0.08 : 0.04,
        clickable: false,
        zIndex: 1,
        map,
      });
    }

    // 캐노피 정사각형
    placedCanopies.forEach((canopy, index) => {
      const selected = canopy.id === selectedCanopyId;
      const color =
        canopy.diameter === 100
          ? "#1f2937"
          : canopy.diameter === 40
            ? "#4b5563"
            : canopy.diameter === 20
              ? "#6b7280"
              : "#9ca3af";

      const path = getSquareCorners(
        canopy.lat,
        canopy.lng,
        canopy.diameter,
        canopy.rotation
      ).map(([lat, lng]) => ({ lat, lng }));

      const poly = new g.maps.Polygon({
        paths: path,
        strokeColor: selected ? "#2563eb" : color,
        strokeOpacity: 1,
        strokeWeight: selected ? 3 : 2,
        fillColor: selected ? "#3b82f6" : color,
        fillOpacity: mapView === "threeD" && showCanopyVolume ? 0.12 : 0.28,
        clickable: mode === "place",
        zIndex: selected ? 5 : 2,
        map,
      });
      poly.addListener("click", (e: any) => {
        if (e && typeof e.stop === "function") e.stop();
        setSelectedCanopyId(canopy.id);
      });
      squareShapesRef.current.push(poly);

      const marker = new g.maps.Marker({
        position: { lat: canopy.lat, lng: canopy.lng },
        map,
        label: { text: `${index + 1}`, color: "#fff", fontSize: "11px", fontWeight: "700" },
        icon: {
          path: g.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: selected ? "#2563eb" : "#191f28",
          fillOpacity: 1,
          strokeColor: "#fff",
          strokeWeight: 2,
        },
        clickable: mode === "place",
      });
      marker.addListener("click", () => setSelectedCanopyId(canopy.id));
      markersRef.current.push(marker);

    });

    if (mapView === "threeD" && showCanopyVolume && placedCanopies.length > 0) {
      const webglOverlay = createCanopyWebGLOverlay(g, placedCanopies, showCanopyVolume);
      if (webglOverlay) {
        webglOverlay.setMap(map);
        webglCanopyOverlayRef.current = webglOverlay;
      }
    }
  }, [
    mapReady,
    placedCanopies,
    selectedCanopyId,
    boundaryPoints,
    boundaryClosed,
    riskZone,
    mode,
    mapView,
    showCanopyVolume,
  ]);

  const quote = useMemo(
    () => buildQuote(placedCanopies, rentalDays, siteCenter),
    [placedCanopies, rentalDays, siteCenter]
  );

  const value = useMemo(
    () => buildValue(quote.total, contractValue, daysSaved),
    [quote.total, contractValue, daysSaved]
  );

  const selectedOption = CANOPY_OPTIONS[selectedDiameter];
  const selectedCanopy =
    placedCanopies.find((c) => c.id === selectedCanopyId) ?? null;

  // 각도 슬라이더: 선택된 캐노피가 있으면 그 캐노피를, 없으면 기본 배치 각도를 편집
  const angleValue = selectedCanopy ? selectedCanopy.rotation : rotation;

  const setContractFromValue = (value: number, options?: { syncInput?: boolean }) => {
    const safeValue = Math.max(0, Math.round(value || 0));
    setContractValue(safeValue);
    if (options?.syncInput !== false) {
      setContractInput(formatContractEokInput(safeValue));
    }
  };

  const handleContractInputChange = (raw: string) => {
    setContractInput(raw);
    setContractValue(parseContractEokInput(raw));
  };

  const handleContractInputBlur = () => {
    setContractInput(formatContractEokInput(contractValue));
  };

  const onAngleChange = (val: number) => {
    if (selectedCanopy) {
      setPlacedCanopies((prev) =>
        prev.map((c) =>
          c.id === selectedCanopy.id ? { ...c, rotation: val } : c
        )
      );
    } else {
      setRotation(val);
    }
  };

  const removeCanopy = (id: string) => {
    setPlacedCanopies((prev) => prev.filter((item) => item.id !== id));
    setSelectedCanopyId((cur) => (cur === id ? null : cur));
  };

  const resetPlan = () => {
    setPlacedCanopies([]);
    setSelectedCanopyId(null);
  };

  const startBoundary = () => {
    setMode("boundary");
    setBoundaryClosed(false);
    setBoundaryPoints([]);
    setSelectedCanopyId(null);
  };

  const finishBoundary = () => {
    if (boundaryPoints.length < 3) return;
    const area = getBoundaryArea(boundaryPoints);
    const estimated = estimateInputsFromSiteArea(area);
    setBoundaryClosed(true);
    setSiteCenter(centroidOf(boundaryPoints));
    setContractFromValue(estimated.contractValue);
    setDaysSaved(estimated.daysSaved);
    setAutoEstimateNote(
      `현장 경계 ${formatNumber(Math.round(area))}㎡ 기준으로 도급액 ${formatKRW(
        estimated.contractValue
      )}, 공기 단축 ${estimated.daysSaved}일을 자동 반영했습니다.`
    );
  };

  const clearBoundary = () => {
    setBoundaryPoints([]);
    setBoundaryClosed(false);
    setAutoEstimateNote(null);
    setMode("place");
  };

  const applyRecommendation = (rec: Recommendation) => {
    setPlacedCanopies(
      rec.placements.map((p, i) => ({
        ...p,
        id: `applied-${Date.now()}-${i}`,
      }))
    );
    setSelectedCanopyId(null);
    setMode("place");
    if (rec.placements.length > 0) {
      setSiteCenter({ lat: rec.placements[0].lat, lng: rec.placements[0].lng });
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Construction noise control platform</p>
          <h1>
            야간 공사를 멈추게 하는 소음,
            <br />
            에어돔으로 덮어 줄입니다.
          </h1>
          <p className={styles.heroText}>
            터파기 구역 위에 임시 방음 캐노피를 씌워 상부로 새는 굴착 소음을
            낮춥니다. 지도에서 현장 경계를 찍으면 민원 위험 범위와 캐노피
            조합 추천, 건설사 이득까지 한 번에 확인하세요.
          </p>
          <div className={styles.heroActions}>
            <a href="#estimate" className={styles.darkButton}>
              지도에서 시작하기
            </a>
            <a href="#how" className={styles.lightButton}>
              작동 방식 보기
            </a>
          </div>
        </div>

        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.visualFloor} />
          <img
            className={styles.airDomeImage}
            src="/Air_Dome.png"
            alt=""
            draggable={false}
          />
          <div className={styles.noiseChip}>-18dB 예상</div>
        </div>
      </section>

      <section className={styles.problemSection}>
        <div className={styles.sectionTitle}>
          <p className={styles.eyebrow}>Problem</p>
          <h2>방음벽을 세워도, 소리는 위로 빠져나갑니다.</h2>
        </div>
        <div className={styles.problemGrid}>
          <article>
            <span>01</span>
            <strong>야간 작업 제한</strong>
            <p>굴착, 상차, 장비 후진음, 암반 접촉음은 야간 민원으로 바로 이어집니다.</p>
          </article>
          <article>
            <span>02</span>
            <strong>상부 개방 문제</strong>
            <p>
              기존 가설 방음벽은 수평 방향 차폐에는 유리하지만, 터파기장에서
              위로 퍼지는 소음에는 한계가 있습니다.
            </p>
          </article>
          <article>
            <span>03</span>
            <strong>현장별 다른 조건</strong>
            <p>
              장비 종류, 굴착 깊이, 인접 주거지 거리, 작업 반경에 따라 필요한
              차폐 면적과 비용이 달라집니다.
            </p>
          </article>
        </div>
      </section>

      <section id="how" className={styles.solutionSection}>
        <div className={styles.solutionVisual} aria-hidden="true">
          <div className={styles.matteBlock} />
          <div className={styles.matteDomeMini} />
          <div className={styles.matteRing} />
        </div>
        <div className={styles.solutionCopy}>
          <p className={styles.eyebrow}>Solution</p>
          <h2>공사 구역을 덮는 임시 방음 캐노피 대여</h2>
          <p>
            Air-supported 구조는 막재와 송풍 압력을 이용해 넓은 공간을 빠르게
            덮을 수 있습니다. 현장 위에 임시 돔을 만들고, 하부 스커트와 출입부,
            송풍기, 소음 모니터링을 함께 구성해 야간 작업 가능성을 검토합니다.
          </p>
          <div className={styles.solutionList}>
            <div>
              <strong>현장 경계 드로잉</strong>
              <span>지도에 경계를 찍으면 민원 위험 범위를 즉시 표시</span>
            </div>
            <div>
              <strong>ReLU 조합 추천</strong>
              <span>커버·비용·낭비를 ReLU 손실로 최소화한 캐노피 조합 제안</span>
            </div>
            <div>
              <strong>건설사 이득 확인</strong>
              <span>조합별 지체상금 회피·간접비 절감을 바로 비교</span>
            </div>
          </div>
        </div>
      </section>

      {/* ───── 풀스크린 지도 + 떠 있는 섬 패널 ───── */}
      <section id="estimate" className={styles.mapStage}>
        <div ref={mapElRef} className={styles.mapFull} />

        <div className={styles.mapViewSwitch} aria-label="지도 보기 전환">
          <button
            type="button"
            className={mapView === "roadmap" ? styles.mapViewActive : ""}
            onClick={() => setMapView("roadmap")}
          >
            기본 지도
          </button>
          <button
            type="button"
            className={mapView === "satellite" ? styles.mapViewActive : ""}
            onClick={() => setMapView("satellite")}
          >
            위성뷰
          </button>
          {mapView === "threeD" && (
            <button
              type="button"
              className={showCanopyVolume ? styles.mapViewActive : styles.volumeViewButton}
              onClick={() => setShowCanopyVolume((prev) => !prev)}
              disabled={placedCanopies.length === 0}
              title={
                placedCanopies.length === 0
                  ? "지도에 캐노피를 먼저 배치하세요."
                  : "현재 지도 위 캐노피를 규격별 높이의 직육면체로 전환"
              }
            >
              입체로 보기
            </button>
          )}
          <button
            type="button"
            className={mapView === "threeD" ? styles.mapViewActive : ""}
            onClick={() => setMapView("threeD")}
          >
            3D 뷰
          </button>
        </div>

        {(!mapReady || mapError) && (
          <div className={styles.mapLoadingFull}>
            {mapError ? <p>{mapError}</p> : (
              <>
                <i />
                구글맵을 불러오는 중입니다.
              </>
            )}
          </div>
        )}

        {/* 왼쪽 섬: 도구 / 규격 / 각도 / 경계 / 추천 */}
        <aside className={`${styles.island} ${styles.islandLeft}`}>
          <p className={styles.islandTitle}>도구</p>
          <div className={styles.modeRow}>
            <button
              type="button"
              className={`${styles.toolButton} ${mode === "place" ? styles.toolButtonActive : ""}`}
              onClick={() => setMode("place")}
            >
              캐노피 배치
            </button>
            <button
              type="button"
              className={`${styles.toolButton} ${mode === "boundary" ? styles.toolButtonActive : ""}`}
              onClick={startBoundary}
            >
              현장 경계 그리기
            </button>
          </div>

          {mode === "boundary" && (
            <div className={styles.selectedBox}>
              <p className={styles.boundaryHelp}>
                지도를 클릭해 현장 경계 꼭짓점을 찍으세요. 3점 이상에서 완성할 수
                있습니다. 완성하면 면적 기준으로 예상 도급액과 공기 단축일이 자동 입력됩니다.
                (현재 {boundaryPoints.length}점)
              </p>
              <div className={styles.modeRow} style={{ marginTop: 10, marginBottom: 0 }}>
                <button
                  type="button"
                  className={styles.miniButton}
                  disabled={boundaryPoints.length < 3}
                  onClick={finishBoundary}
                >
                  경계 완성
                </button>
                <button
                  type="button"
                  className={`${styles.miniButton} ${styles.dangerButton}`}
                  onClick={clearBoundary}
                >
                  경계 지우기
                </button>
              </div>
            </div>
          )}

          <p className={styles.islandTitle} style={{ marginTop: 18 }}>
            캐노피 규격
          </p>
          <div className={styles.sizeGrid}>
            {SIZE_KEYS.map((diameter) => {
              const option = CANOPY_OPTIONS[diameter];
              const active = selectedDiameter === diameter;
              return (
                <button
                  key={diameter}
                  type="button"
                  className={`${styles.sizeButton} ${active ? styles.activeSizeButton : ""}`}
                  onClick={() => setSelectedDiameter(diameter)}
                >
                  <strong>{option.name}</strong>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 18 }}>
            <div className={styles.rangeHeader}>
              <p className={styles.panelLabel}>
                {selectedCanopy ? "선택 캐노피 각도" : "기본 배치 각도"}
              </p>
              <strong>{angleValue}°</strong>
            </div>
            <input
              className={styles.range}
              type="range"
              min={0}
              max={90}
              value={angleValue}
              onChange={(e) => onAngleChange(Number(e.target.value))}
            />
            <p className={styles.helpText}>
              {selectedCanopy
                ? `#${placedCanopies.findIndex((c) => c.id === selectedCanopy.id) + 1} 캐노피의 각도를 조절합니다.`
                : "새로 배치할 캐노피에 적용됩니다. 배치된 캐노피를 클릭하면 개별 각도를 수정할 수 있어요."}
            </p>

            {selectedCanopy && (
              <div className={styles.modeRow} style={{ marginTop: 10, marginBottom: 0 }}>
                <button
                  type="button"
                  className={styles.miniButton}
                  onClick={() => setSelectedCanopyId(null)}
                >
                  선택 해제
                </button>
                <button
                  type="button"
                  className={`${styles.miniButton} ${styles.dangerButton}`}
                  onClick={() => removeCanopy(selectedCanopy.id)}
                >
                  이 캐노피 삭제
                </button>
              </div>
            )}
          </div>

          {boundaryClosed && (
            <>
              <p className={styles.islandTitle} style={{ marginTop: 22 }}>
                ReLU 조합 추천 · 현장 {formatNumber(Math.round(siteArea))}㎡
              </p>
              {recommendations.length === 0 ? (
                <p className={styles.helpText}>
                  추천을 계산할 수 없습니다. 경계를 더 넓게 그려보세요.
                </p>
              ) : (
                recommendations.map((rec, i) => (
                  <div key={rec.id} className={styles.recCard}>
                    <div className={styles.recHead}>
                      <span className={`${styles.recBadge} ${i > 0 ? styles.recBadgeAlt : ""}`}>
                        {rec.label}
                      </span>
                      <span className={styles.recRoi}>ROI {rec.roi.toFixed(1)}배</span>
                    </div>
                    <p className={styles.recMix}>{rec.sizeMix || "—"}</p>
                    <p className={styles.helpText} style={{ marginTop: 4 }}>{rec.note}</p>
                    <div className={styles.recStats}>
                      <div>
                        <span>커버율</span>
                        <strong>{Math.round(rec.coveragePct * 100)}%</strong>
                      </div>
                      <div>
                        <span>견적</span>
                        <strong>{formatKRW(rec.cost)}</strong>
                      </div>
                      <div>
                        <span>건설사 순가치</span>
                        <strong className={rec.netValue >= 0 ? styles.recRoi : styles.netNegative}>
                          {formatSignedKRW(rec.netValue)}
                        </strong>
                      </div>
                      <div>
                        <span>총 가치</span>
                        <strong>{formatKRW(rec.totalBenefit)}</strong>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.recApply}
                      onClick={() => applyRecommendation(rec)}
                    >
                      이 조합 지도에 적용
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          <p className={styles.islandTitle} style={{ marginTop: 22 }}>
            배치된 캐노피 ({placedCanopies.length})
          </p>
          {placedCanopies.length === 0 ? (
            <p className={styles.emptyText}>
              지도를 클릭해 캐노피를 배치하거나 위 추천 조합을 적용하세요.
            </p>
          ) : (
            <div className={styles.placedList}>
              {placedCanopies.map((item, index) => {
                const option = CANOPY_OPTIONS[item.diameter];
                const selected = item.id === selectedCanopyId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`${styles.placedItem} ${selected ? styles.placedItemActive : ""}`}
                    onClick={() => setSelectedCanopyId(item.id)}
                  >
                    <em>{index + 1}</em>
                    <span>
                      <strong>{item.diameter}m 캐노피</strong>
                      <small>
                        {formatNumber(option.area)}㎡ · {option.noiseReduction} · {item.rotation}°
                      </small>
                    </span>
                    <b
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCanopy(item.id);
                      }}
                    >
                      삭제
                    </b>
                  </button>
                );
              })}
            </div>
          )}
          <button type="button" className={styles.resetButton} onClick={resetPlan}>
            전체 초기화
          </button>
        </aside>

        {/* 오른쪽 섬: 견적 + 건설사 가치 */}
        <aside className={`${styles.island} ${styles.islandRight}`}>
          <p className={styles.islandTitle}>예상 견적 (VAT 포함)</p>
          <div className={styles.islandQuoteTotal}>{formatKRW(quote.total)}</div>

          <div className={styles.quoteStats} style={{ marginTop: 14 }}>
            <div>
              <span>수량</span>
              <strong>{placedCanopies.length}개</strong>
            </div>
            <div>
              <span>커버</span>
              <strong>{formatNumber(quote.totalArea)}㎡</strong>
            </div>
            <div>
              <span>운송</span>
              <strong>{quote.distanceKm.toFixed(1)}km</strong>
            </div>
            <div>
              <span>설치</span>
              <strong>{quote.installDays}일</strong>
            </div>
          </div>

          <div className={styles.rangeHeader} style={{ marginTop: 18 }}>
            <p className={styles.panelLabel}>임대 기간</p>
            <strong>{rentalDays}일</strong>
          </div>
          <input
            className={styles.range}
            type="range"
            min={1}
            max={60}
            value={rentalDays}
            onChange={(e) => setRentalDays(Number(e.target.value))}
          />

          <p className={styles.islandTitle} style={{ marginTop: 20 }}>
            건설사 가치
          </p>
          <div className={styles.compactPreset}>
            {CONTRACT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                className={`${contractValue === preset.value ? styles.compactPresetActive : ""}`}
                onClick={() => setContractFromValue(preset.value)}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <label className={styles.contractInputLabel}>
            <span>직접 입력</span>
            <input
              type="text"
              inputMode="decimal"
              value={contractInput}
              onChange={(e) => handleContractInputChange(e.target.value)}
              onBlur={handleContractInputBlur}
              placeholder="예: 750"
            />
            <b>억원</b>
          </label>
          {autoEstimateNote && <p className={styles.autoEstimateNote}>{autoEstimateNote}</p>}
          <div className={styles.rangeHeader} style={{ marginTop: 14 }}>
            <p className={styles.panelLabel}>공기 단축</p>
            <strong>{daysSaved}일</strong>
          </div>
          <input
            className={styles.range}
            type="range"
            min={0}
            max={90}
            value={daysSaved}
            onChange={(e) => setDaysSaved(Number(e.target.value))}
          />

          <div className={styles.valueGrid} style={{ marginTop: 14 }}>
            <div>
              <span>순가치</span>
              <strong className={value.netValue >= 0 ? styles.netPositive : styles.netNegative}>
                {placedCanopies.length === 0 ? "견적 필요" : formatSignedKRW(value.netValue)}
              </strong>
            </div>
            <div>
              <span>견적 대비</span>
              <strong>{placedCanopies.length === 0 ? "—" : `${value.roiMultiple.toFixed(1)}배`}</strong>
            </div>
          </div>

          <button
            type="button"
            className={styles.checkoutButton}
            disabled={placedCanopies.length === 0}
            onClick={() => setCheckoutOpen(true)}
          >
            동의하고 결제페이지로 이동
          </button>
        </aside>

        {/* 범례 */}
        <div className={styles.legend}>
          <span><i style={{ background: "#6b7280" }} />캐노피</span>
          {mapView === "threeD" && showCanopyVolume && (
            <span><i style={{ background: "#2563eb" }} />입체 캐노피 형상</span>
          )}
          <span><i style={{ background: "#dc2626" }} />현장 경계</span>
          <span><i style={{ background: "#f59e0b" }} />민원 위험 범위</span>
        </div>
      </section>

      {/* 건설사 가치 상세 */}
      <section id="value" className={styles.valueSection}>
        <div className={styles.sectionTitle}>
          <p className={styles.eyebrow}>Value</p>
          <h2>이 견적이 현장에 만들어내는 가치.</h2>
          <p>
            야간 작업이 열리면 공기가 단축됩니다. 단축된 일수만큼 지체상금을
            피하고 현장 고정비를 아낍니다.
          </p>
        </div>

        <div className={styles.valueLayout}>
          <aside className={styles.valueControls}>
            <div className={styles.valueBlock}>
              <p className={styles.valueLabel}>공사 도급액</p>
              <div className={styles.presetGrid}>
                {CONTRACT_PRESETS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    className={`${styles.presetButton} ${contractValue === preset.value ? styles.activePreset : ""}`}
                    onClick={() => setContractFromValue(preset.value)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              <label className={`${styles.contractInputLabel} ${styles.contractInputLabelDark}`}>
                <span>직접 입력</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={contractInput}
                  onChange={(e) => handleContractInputChange(e.target.value)}
                  onBlur={handleContractInputBlur}
                  placeholder="예: 750"
                />
                <b>억원</b>
              </label>
              {autoEstimateNote && <p className={styles.valueHelp}>{autoEstimateNote}</p>}
              <p className={styles.valueHelp}>
                일 지체상금(0.1%): <b>{formatKRW(value.dailyDelayPenalty)}</b>
              </p>
            </div>

            <div className={styles.valueBlock}>
              <div className={styles.rangeHeader}>
                <p className={styles.valueLabel}>야간작업 공기 단축</p>
                <strong>{daysSaved}일</strong>
              </div>
              <input
                className={styles.range}
                type="range"
                min={0}
                max={30}
                value={daysSaved}
                onChange={(e) => setDaysSaved(Number(e.target.value))}
              />
              <p className={styles.valueHelp}>
                야간 굴착·상차가 가능해져 당길 수 있는 공정 일수입니다.
              </p>
            </div>

            <div className={styles.valueBlock}>
              <p className={styles.valueLabel}>가치 산정 근거</p>
              <ul className={styles.valueNotes}>
                <li>지체상금률 0.1%/일 (국가계약 기준)</li>
                <li>현장 고정 간접비 0.02%/일 (추정)</li>
                <li>견적·도급액·공기 단축일은 위 지도 결과와 실시간 연동</li>
              </ul>
            </div>
          </aside>

          <div className={styles.valueResult}>
            <div className={styles.valueHeadline}>
              <span>순가치 (가치 − 견적)</span>
              <strong className={value.netValue >= 0 ? styles.netPositive : styles.netNegative}>
                {placedCanopies.length === 0 ? "견적 필요" : formatSignedKRW(value.netValue)}
              </strong>
              <p>
                {placedCanopies.length === 0
                  ? "지도에서 캐노피를 먼저 배치하세요."
                  : `견적 대비 약 ${value.roiMultiple.toFixed(1)}배의 가치`}
              </p>
            </div>

            <div className={styles.valueGrid}>
              <div>
                <span>지체상금 회피</span>
                <strong>{formatKRW(value.delayAvoidance)}</strong>
              </div>
              <div>
                <span>간접비 절감</span>
                <strong>{formatKRW(value.overheadSaving)}</strong>
              </div>
              <div>
                <span>총 가치</span>
                <strong>{formatKRW(value.totalBenefit)}</strong>
              </div>
              <div>
                <span>CanopyShield 견적</span>
                <strong>{formatKRW(quote.total)}</strong>
              </div>
            </div>

            <div className={styles.valueFootnote}>
              {value.dailyDelayPenalty > 0 && placedCanopies.length > 0 ? (
                <p>
                  이 견적은 <b>하루 지체상금의 약 {value.paybackDays.toFixed(1)}일치</b>로,
                  야간작업으로 그만큼만 공기를 당겨도 회수됩니다.
                </p>
              ) : (
                <p>도급액과 단축 일수를 조정하면 회수 시점이 갱신됩니다.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.timelineSection}>
        <div className={styles.sectionTitle}>
          <p className={styles.eyebrow}>Timeline</p>
          <h2>운송부터 철거까지 한 번에 확인합니다.</h2>
        </div>
        <div className={styles.timeline}>
          <div>
            <span>01</span>
            <strong>현장 배치 확정</strong>
            <p>지도 기반으로 캐노피 조합, 임대기간, 작업 반경을 확정합니다.</p>
          </div>
          <div>
            <span>02</span>
            <strong>{quote.transportHours}시간 내외 운송</strong>
            <p>
              {ORIGIN_NAME}에서 출발해 약 {quote.distanceKm.toFixed(1)}km 이동하는
              것으로 계산했습니다.
            </p>
          </div>
          <div>
            <span>03</span>
            <strong>{formatDate(quote.installFinishDate)} 설치 완료 예상</strong>
            <p>막재 전개, 하부 고정, 송풍기 연결, 출입부 설치를 진행합니다.</p>
          </div>
          <div>
            <span>04</span>
            <strong>소음 측정 후 야간 운영 판단</strong>
            <p>내부·외부 소음계를 배치해 실제 저감량과 민원 리스크를 확인합니다.</p>
          </div>
          <div>
            <span>05</span>
            <strong>{formatDate(quote.removalFinishDate)} 철거 완료 예상</strong>
            <p>임대 종료 후 막재 회수, 장비 철수, 현장 원상복구를 진행합니다.</p>
          </div>
        </div>
      </section>

      <section className={styles.specSection}>
        <div className={styles.sectionTitle}>
          <p className={styles.eyebrow}>Line-up</p>
          <h2>현장 규모에 맞춰 조합합니다.</h2>
        </div>
        <div className={styles.specGrid}>
          {SIZE_KEYS.map((diameter) => {
            const option = CANOPY_OPTIONS[diameter];
            return (
              <article key={diameter} className={styles.specCard}>
                <div className={styles.specShape} />
                <strong>{option.name}</strong>
                <p>{option.label}</p>
                <dl>
                  <div>
                    <dt>커버 면적</dt>
                    <dd>{formatNumber(option.area)}㎡</dd>
                  </div>
                  <div>
                    <dt>설치 / 철거</dt>
                    <dd>{option.installDays}일 / {option.removalDays}일</dd>
                  </div>
                  <div>
                    <dt>일 임대료</dt>
                    <dd>{formatKRW(option.dailyRental)}</dd>
                  </div>
                  <div>
                    <dt>예상 저감</dt>
                    <dd>{option.noiseReduction}</dd>
                  </div>
                </dl>
              </article>
            );
          })}
        </div>
      </section>

      {checkoutOpen && (
        <div className={styles.modalBackdrop} onClick={() => setCheckoutOpen(false)}>
          <div className={styles.checkoutModal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setCheckoutOpen(false)}
            >
              ×
            </button>
            <p className={styles.eyebrow}>Checkout preview</p>
            <h2>결제페이지 미리보기</h2>
            <p>
              실제 결제 API는 아직 연결하지 않은 상태입니다. 이후 Toss Payments,
              PortOne, Stripe 등으로 연결할 수 있습니다.
            </p>
            <div className={styles.paymentCard}>
              <div>
                <span>총 예상 금액</span>
                <strong>{formatKRW(quote.total)}</strong>
              </div>
              <div>
                <span>예약금 10%</span>
                <strong>{formatKRW(Math.round(quote.total * 0.1))}</strong>
              </div>
              <div>
                <span>야간작업 가치(추정)</span>
                <strong>{formatKRW(value.totalBenefit)}</strong>
              </div>
              <div>
                <span>계약 확정</span>
                <strong>현장 실측 후 확정</strong>
              </div>
            </div>
            <button type="button" className={styles.payButton}>
              예약금 결제하기
            </button>
          </div>
        </div>
      )}
    </main>
  );
}