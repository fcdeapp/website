"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/pages/Canopy.module.css";

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

type PlacedCanopy = {
  id: string;
  diameter: CanopySize;
  lat: number;
  lng: number;
  rotation: number;
};

type LeafletWindow = Window & {
  L?: any;
};

const SIZE_KEYS: CanopySize[] = [10, 20, 40, 100];

const ORIGIN_NAME = "서울대학교 39동";
const ORIGIN_LAT = 37.4591;
const ORIGIN_LNG = 126.9515;

const DEFAULT_SITE_LAT = 37.5665;
const DEFAULT_SITE_LNG = 126.978;

/**
 * ─────────────────────────────────────────────────────────────────────────
 * 단가 산정 근거 (사업성 검토용 추정치 — 실제 견적은 막재 등급·차음 사양에 따라 변동)
 *
 * 0) 정사각형 배치: 한 변 = 규격(m), 바닥면적 = 한 변²  (지도 위에서 각도 회전 가능)
 *
 * 1) 막재 표면적(membraneArea) ≈ 바닥면적 × 2  (반구 근사. 차음용 높이 확보 가정)
 *
 * 2) 자재·제작 원가(unitAssetCost) = 막 외피(가공 포함) + 송풍/앵커/에어록/제어
 *    - 막 외피: ₩40,000~100,000/㎡ (단일막→이중막 / 차음 중량막 범위)
 *    - 국제 시세 참고: PVC 코팅 폴리에스터 $200~500/㎡, PTFE $400~1,000/㎡ (철골 포함가)
 *    - 국내 영구형 에어돔 턴키 ₩80~120만/㎡(바닥)보다 낮게 잡은 임대 자산 기준
 *
 * 3) 설치/철거비(installCost·removalCost) = 현장 인건비 + 장비(크레인 등) — 운송 별도
 *    - 숙련 노무 ₩25만/인·일 × 투입 인·일 + 장비비
 *
 * 4) 일 임대료(dailyRental) ≈ 자산원가 ÷ 약 125회(유상 가동일) + 정비/마진
 *    → 감가상각 + 막재 마모 + 운영 마진 반영
 *
 * 5) 건설사 가치(아래 VALUE 섹션):
 *    - 지체상금률 0.1%/일 (국가를 당사자로 하는 계약에 관한 법률 기준)
 *    - 현장 고정 간접비(추정) ≈ 도급액의 0.02%/일
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

// 건설사 가치 계산 상수
const DELAY_PENALTY_RATE = 0.001; // 지체상금률 0.1%/일 (국가계약 기준)
const OVERHEAD_RATE_PER_DAY = 0.0002; // 현장 고정 간접비 추정 0.02%/일

const CONTRACT_PRESETS: { label: string; value: number }[] = [
  { label: "10억", value: 1_000_000_000 },
  { label: "50억", value: 5_000_000_000 },
  { label: "100억", value: 10_000_000_000 },
  { label: "500억", value: 50_000_000_000 },
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

// 음수까지 부호와 함께 표기 (순가치용)
const formatSignedKRW = (value: number) => {
  if (value === 0) return "0원";
  const sign = value > 0 ? "+" : "−";
  return `${sign}${formatKRW(Math.abs(value))}`;
};

const formatNumber = (value: number) => value.toLocaleString("ko-KR");

const addDays = (base: Date, days: number) => {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
};

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

// 중심점·한 변 길이(m)·회전각(도)로 정사각형 네 꼭짓점의 위경도를 계산
const METERS_PER_DEG_LAT = 111_320;

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

  // 회전 전 로컬 오프셋 (동쪽 x, 북쪽 y)
  const base: [number, number][] = [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
  ];

  return base.map(([x, y]) => {
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    const dLat = ry / METERS_PER_DEG_LAT;
    const dLng = rx / metersPerDegLng;
    return [lat + dLat, lng + dLng] as [number, number];
  });
};

export default function CanopyPage() {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const selectedDiameterRef = useRef<CanopySize>(20);
  const rotationRef = useRef<number>(0);

  const [selectedDiameter, setSelectedDiameter] = useState<CanopySize>(20);
  const [rotation, setRotation] = useState(0); // 정사각형 배치 회전 각도(도)
  const [rentalDays, setRentalDays] = useState(7);
  const [placedCanopies, setPlacedCanopies] = useState<PlacedCanopy[]>([]);
  const [siteCenter, setSiteCenter] = useState({
    lat: DEFAULT_SITE_LAT,
    lng: DEFAULT_SITE_LNG,
  });
  const [mapReady, setMapReady] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  // 건설사 가치 계산 입력값
  const [contractValue, setContractValue] = useState(10_000_000_000); // 도급액 (기본 100억)
  const [daysSaved, setDaysSaved] = useState(14); // 야간작업으로 단축 가능한 공기(일)

  selectedDiameterRef.current = selectedDiameter;
  rotationRef.current = rotation;

  useEffect(() => {
    const leafletWindow = window as LeafletWindow;

    const ensureLeafletCss = () => {
      if (document.querySelector('link[data-leaflet="true"]')) return;

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      link.dataset.leaflet = "true";
      document.head.appendChild(link);
    };

    const loadLeafletScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (leafletWindow.L) {
          resolve();
          return;
        }

        const existing = document.querySelector<HTMLScriptElement>(
          'script[data-leaflet="true"]'
        );

        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject());
          return;
        }

        const script = document.createElement("script");
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
        script.async = true;
        script.dataset.leaflet = "true";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Leaflet load failed"));
        document.body.appendChild(script);
      });
    };

    const initMap = async () => {
      ensureLeafletCss();
      await loadLeafletScript();

      if (!mapElRef.current || mapRef.current || !leafletWindow.L) return;

      const L = leafletWindow.L;

      const map = L.map(mapElRef.current, {
        center: [DEFAULT_SITE_LAT, DEFAULT_SITE_LNG],
        zoom: 18,
        zoomControl: false,
        attributionControl: true,
      });

      L.control.zoom({ position: "bottomright" }).addTo(map);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 20,
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const layer = L.layerGroup().addTo(map);

      const originIcon = L.divIcon({
        className: styles.originMarker,
        html: `<span>출발지</span>`,
        iconSize: [64, 34],
        iconAnchor: [32, 17],
      });

      L.marker([ORIGIN_LAT, ORIGIN_LNG], { icon: originIcon })
        .addTo(map)
        .bindPopup(`${ORIGIN_NAME}<br/>운송 출발 기준점`);

      map.on("click", (event: any) => {
        const diameter = selectedDiameterRef.current;
        const angle = rotationRef.current;

        setSiteCenter({
          lat: event.latlng.lat,
          lng: event.latlng.lng,
        });

        setPlacedCanopies((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            diameter,
            lat: event.latlng.lat,
            lng: event.latlng.lng,
            rotation: angle,
          },
        ]);
      });

      mapRef.current = map;
      layerRef.current = layer;
      setMapReady(true);
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const leafletWindow = window as LeafletWindow;
    if (!mapReady || !leafletWindow.L || !layerRef.current) return;

    const L = leafletWindow.L;
    layerRef.current.clearLayers();

    placedCanopies.forEach((canopy, index) => {
      const option = CANOPY_OPTIONS[canopy.diameter];

      const color =
        canopy.diameter === 100
          ? "#1f2937"
          : canopy.diameter === 40
            ? "#4b5563"
            : canopy.diameter === 20
              ? "#6b7280"
              : "#9ca3af";

      const corners = getSquareCorners(
        canopy.lat,
        canopy.lng,
        canopy.diameter,
        canopy.rotation
      );

      const square = L.polygon(corners, {
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.22,
      }).addTo(layerRef.current);

      square.bindPopup(`
        <b>${option.name} 방음 캐노피</b><br/>
        한 변 ${canopy.diameter}m · 커버 ${formatNumber(option.area)}㎡<br/>
        회전 ${canopy.rotation}°<br/>
        예상 저감 ${option.noiseReduction}<br/>
        설치 ${option.installDays}일 · 철거 ${option.removalDays}일
      `);

      const labelIcon = L.divIcon({
        className: styles.canopyMarker,
        html: `<span>${index + 1}</span><strong>${canopy.diameter}m</strong>`,
        iconSize: [70, 36],
        iconAnchor: [35, 18],
      });

      L.marker([canopy.lat, canopy.lng], { icon: labelIcon }).addTo(
        layerRef.current
      );
    });
  }, [placedCanopies, mapReady]);

  const quote = useMemo(() => {
    const distanceKm = getDistanceKm(
      ORIGIN_LAT,
      ORIGIN_LNG,
      siteCenter.lat,
      siteCenter.lng
    );

    const equipmentCost = placedCanopies.reduce((sum, item) => {
      const option = CANOPY_OPTIONS[item.diameter];

      return (
        sum +
        option.installCost +
        option.removalCost +
        option.dailyRental * rentalDays
      );
    }, 0);

    const totalArea = placedCanopies.reduce((sum, item) => {
      return sum + CANOPY_OPTIONS[item.diameter].area;
    }, 0);

    const largestDiameter = placedCanopies.reduce<CanopySize>((max, item) => {
      return item.diameter > max ? item.diameter : max;
    }, 10);

    const largestOption = CANOPY_OPTIONS[largestDiameter];

    const transportCost =
      placedCanopies.length === 0
        ? 0
        : Math.round(520_000 + distanceKm * 38_000);

    const largeEquipmentSurcharge =
      placedCanopies.filter((item) => item.diameter === 100).length * 4_800_000 +
      placedCanopies.filter((item) => item.diameter === 40).length * 1_600_000;

    const soundMonitoringCost = placedCanopies.length > 0 ? 1_300_000 : 0;
    const safetyPlanCost =
      placedCanopies.length > 0 ? 900_000 + largestDiameter * 42_000 : 0;

    const subtotal =
      equipmentCost +
      transportCost +
      largeEquipmentSurcharge +
      soundMonitoringCost +
      safetyPlanCost;

    const vat = Math.round(subtotal * 0.1);
    const total = subtotal + vat;

    const quantityDays = Math.max(0, placedCanopies.length - 1) * 0.4;
    const installDays =
      placedCanopies.length === 0
        ? 0
        : Math.ceil(largestOption.installDays + quantityDays);

    const removalDays =
      placedCanopies.length === 0 ? 0 : Math.ceil(largestOption.removalDays);

    const transportHours =
      placedCanopies.length === 0
        ? 0
        : Math.max(3, Math.ceil(distanceKm / 28 + (largestDiameter >= 100 ? 10 : 4)));

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
      largestOption,
      installDays,
      removalDays,
      transportHours,
      arrivalDate,
      installFinishDate,
      removalFinishDate,
    };
  }, [placedCanopies, rentalDays, siteCenter]);

  // 건설사 입장의 가치(ROI) 계산
  const value = useMemo(() => {
    const dailyDelayPenalty = contractValue * DELAY_PENALTY_RATE; // 일 지체상금
    const dailyOverhead = contractValue * OVERHEAD_RATE_PER_DAY; // 일 현장 고정 간접비(추정)

    const delayAvoidance = dailyDelayPenalty * daysSaved; // 지체상금 회피 가능액
    const overheadSaving = dailyOverhead * daysSaved; // 간접비 절감액
    const totalBenefit = delayAvoidance + overheadSaving; // 총 가치

    const cost = quote.total; // CanopyShield 견적(VAT 포함)
    const netValue = totalBenefit - cost; // 순가치
    const roiMultiple = cost > 0 ? totalBenefit / cost : 0; // 견적 대비 가치 배수

    // 견적이 하루 지체상금으로 회수되는 데 걸리는 일수
    const paybackDays =
      dailyDelayPenalty > 0 ? cost / dailyDelayPenalty : 0;

    return {
      dailyDelayPenalty,
      dailyOverhead,
      delayAvoidance,
      overheadSaving,
      totalBenefit,
      cost,
      netValue,
      roiMultiple,
      paybackDays,
    };
  }, [contractValue, daysSaved, quote.total]);

  const selectedOption = CANOPY_OPTIONS[selectedDiameter];

  const removeCanopy = (id: string) => {
    setPlacedCanopies((prev) => prev.filter((item) => item.id !== id));
  };

  const resetPlan = () => {
    setPlacedCanopies([]);
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
            낮춥니다. 지도에서 현장을 지정하고, 필요한 캐노피 조합과 견적을
            바로 확인하세요.
          </p>

          <div className={styles.heroActions}>
            <a href="#estimate" className={styles.darkButton}>
              견적 계산하기
            </a>
            <a href="#how" className={styles.lightButton}>
              작동 방식 보기
            </a>
          </div>
        </div>

        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.visualFloor} />
          <div className={styles.domeShape}>
            <div className={styles.domeHighlight} />
            <div className={styles.domeDoor} />
          </div>
          <div className={styles.smallCylinder} />
          <div className={styles.soundWaveOne} />
          <div className={styles.soundWaveTwo} />
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
            <p>
              굴착, 상차, 장비 후진음, 암반 접촉음은 야간 민원으로 바로 이어집니다.
            </p>
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
              <strong>지도 기반 배치</strong>
              <span>직경별 캐노피를 현장 지도 위에 겹쳐 커버 범위 확인</span>
            </div>
            <div>
              <strong>즉시 견적</strong>
              <span>운송거리, 설치기간, 임대일수, 규격 조합으로 비용 계산</span>
            </div>
            <div>
              <strong>소음 테스트</strong>
              <span>설치 후 내외부 소음계 측정으로 야간 작업 가능성 판단</span>
            </div>
          </div>
        </div>
      </section>

      <section id="estimate" className={styles.estimateSection}>
        <div className={styles.sectionTitle}>
          <p className={styles.eyebrow}>Estimate</p>
          <h2>실제 지도 위에서 캐노피를 배치하세요.</h2>
          <p>
            지도를 확대해 현장 위치를 찾고 클릭하면 선택한 규격의 정사각형
            캐노피가 추가됩니다. 정사각형은 실제 미터 단위 한 변 길이로
            표시되며, 설정한 각도로 회전됩니다.
          </p>
        </div>

        <div className={styles.estimateLayout}>
          <aside className={styles.controlPanel}>
            <div className={styles.panelBlock}>
              <p className={styles.panelLabel}>캐노피 규격</p>

              <div className={styles.sizeGrid}>
                {SIZE_KEYS.map((diameter) => {
                  const option = CANOPY_OPTIONS[diameter];
                  const active = selectedDiameter === diameter;

                  return (
                    <button
                      key={diameter}
                      type="button"
                      className={`${styles.sizeButton} ${
                        active ? styles.activeSizeButton : ""
                      }`}
                      onClick={() => setSelectedDiameter(diameter)}
                    >
                      <strong>{option.name}</strong>
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.panelBlock}>
              <div className={styles.rangeHeader}>
                <p className={styles.panelLabel}>배치 회전 각도</p>
                <strong>{rotation}°</strong>
              </div>

              <input
                className={styles.range}
                type="range"
                min={0}
                max={90}
                value={rotation}
                onChange={(event) => setRotation(Number(event.target.value))}
              />

              <p className={styles.helpText}>
                지도를 클릭하면 이 각도로 정사각형 캐노피가 배치됩니다. 도로·현장
                경계선에 맞춰 회전하세요. (배치된 각 캐노피는 클릭 당시 각도를 유지)
              </p>
            </div>

            <div className={styles.panelBlock}>
              <p className={styles.panelLabel}>선택 규격 정보</p>

              <div className={styles.infoGrid}>
                <div>
                  <span>커버 면적</span>
                  <strong>{formatNumber(selectedOption.area)}㎡</strong>
                </div>
                <div>
                  <span>막재 표면적</span>
                  <strong>{formatNumber(selectedOption.membraneArea)}㎡</strong>
                </div>
                <div>
                  <span>설치 기간</span>
                  <strong>{selectedOption.installDays}일</strong>
                </div>
                <div>
                  <span>소음 저감</span>
                  <strong>{selectedOption.noiseReduction}</strong>
                </div>
                <div>
                  <span>작업 인원</span>
                  <strong>{selectedOption.crew}</strong>
                </div>
                <div>
                  <span>일 임대료</span>
                  <strong>{formatKRW(selectedOption.dailyRental)}</strong>
                </div>
              </div>
            </div>

            <div className={styles.panelBlock}>
              <div className={styles.rangeHeader}>
                <p className={styles.panelLabel}>임대 기간</p>
                <strong>{rentalDays}일</strong>
              </div>

              <input
                className={styles.range}
                type="range"
                min={1}
                max={60}
                value={rentalDays}
                onChange={(event) => setRentalDays(Number(event.target.value))}
              />

              <p className={styles.helpText}>
                설치 완료 후 실제 사용 기간 기준으로 계산됩니다.
              </p>
            </div>

            <div className={styles.panelBlock}>
              <p className={styles.panelLabel}>배치된 캐노피</p>

              {placedCanopies.length === 0 ? (
                <p className={styles.emptyText}>
                  아직 배치된 캐노피가 없습니다. 지도에서 공사 영역 중심을 클릭하세요.
                </p>
              ) : (
                <div className={styles.placedList}>
                  {placedCanopies.map((item, index) => {
                    const option = CANOPY_OPTIONS[item.diameter];

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={styles.placedItem}
                        onClick={() => removeCanopy(item.id)}
                      >
                        <em>{index + 1}</em>
                        <span>
                          <strong>{item.diameter}m 캐노피</strong>
                          <small>
                            {formatNumber(option.area)}㎡ · {option.noiseReduction} ·{" "}
                            {item.rotation}°
                          </small>
                        </span>
                        <b>삭제</b>
                      </button>
                    );
                  })}
                </div>
              )}

              <button type="button" className={styles.resetButton} onClick={resetPlan}>
                전체 초기화
              </button>
            </div>
          </aside>

          <section className={styles.mapCard}>
            <div className={styles.mapHeader}>
              <div>
                <strong>현장 지도</strong>
                <span>
                  선택 규격 {selectedDiameter}m · {rotation}° · 클릭해서 배치
                </span>
              </div>

              <div className={styles.originBadge}>{ORIGIN_NAME} 출발</div>
            </div>

            <div ref={mapElRef} className={styles.map} />

            {!mapReady && (
              <div className={styles.mapLoading}>
                <i />
                실제 지도를 불러오는 중입니다.
              </div>
            )}
          </section>

          <aside className={styles.quotePanel}>
            <div className={styles.quoteTop}>
              <span>예상 견적</span>
              <strong>{formatKRW(quote.total)}</strong>
              <p>VAT 포함 · 현장 실측 전 자동 산정값</p>
            </div>

            <div className={styles.quoteStats}>
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

            <div className={styles.breakdown}>
              <div>
                <span>장비·설치·철거</span>
                <strong>{formatKRW(quote.equipmentCost)}</strong>
              </div>
              <div>
                <span>운송비</span>
                <strong>{formatKRW(quote.transportCost)}</strong>
              </div>
              <div>
                <span>대형 장비 할증</span>
                <strong>{formatKRW(quote.largeEquipmentSurcharge)}</strong>
              </div>
              <div>
                <span>소음계·안전계획</span>
                <strong>
                  {formatKRW(quote.soundMonitoringCost + quote.safetyPlanCost)}
                </strong>
              </div>
              <div>
                <span>VAT</span>
                <strong>{formatKRW(quote.vat)}</strong>
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
        </div>
      </section>

      <section id="value" className={styles.valueSection}>
        <div className={styles.sectionTitle}>
          <p className={styles.eyebrow}>Value</p>
          <h2>이 견적이 현장에 만들어내는 가치.</h2>
          <p>
            야간 작업이 열리면 공기가 단축됩니다. 단축된 일수만큼 지체상금을
            피하고 현장 고정비를 아낍니다. 도급액과 단축 가능 일수를 넣어
            견적 대비 가치를 확인하세요.
          </p>
        </div>

        <div className={styles.valueLayout}>
          <aside className={styles.valueControls}>
            <div className={styles.valueBlock}>
              <p className={styles.valueLabel}>공사 도급액</p>

              <div className={styles.presetGrid}>
                {CONTRACT_PRESETS.map((preset) => {
                  const active = contractValue === preset.value;

                  return (
                    <button
                      key={preset.value}
                      type="button"
                      className={`${styles.presetButton} ${
                        active ? styles.activePreset : ""
                      }`}
                      onClick={() => setContractValue(preset.value)}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              <p className={styles.valueHelp}>
                선택 도급액 기준 일 지체상금(0.1%):{" "}
                <b>{formatKRW(value.dailyDelayPenalty)}</b>
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
                onChange={(event) => setDaysSaved(Number(event.target.value))}
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
                <li>견적은 위 Estimate 패널 결과 연동</li>
              </ul>
            </div>
          </aside>

          <div className={styles.valueResult}>
            <div className={styles.valueHeadline}>
              <span>순가치 (가치 − 견적)</span>
              <strong
                className={
                  value.netValue >= 0 ? styles.netPositive : styles.netNegative
                }
              >
                {placedCanopies.length === 0
                  ? "견적 필요"
                  : formatSignedKRW(value.netValue)}
              </strong>
              <p>
                {placedCanopies.length === 0
                  ? "Estimate에서 캐노피를 먼저 배치하세요."
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
                <strong>{formatKRW(value.cost)}</strong>
              </div>
            </div>

            <div className={styles.valueFootnote}>
              {value.dailyDelayPenalty > 0 && placedCanopies.length > 0 ? (
                <p>
                  이 견적은 <b>하루 지체상금의 약 {value.paybackDays.toFixed(1)}일치</b>
                  로, 야간작업으로 그만큼만 공기를 당겨도 회수됩니다.
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
                    <dd>
                      {option.installDays}일 / {option.removalDays}일
                    </dd>
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
          <div className={styles.checkoutModal} onClick={(event) => event.stopPropagation()}>
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