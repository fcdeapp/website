"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/pages/Canopy.module.css";

type CanopySize = 10 | 20 | 40 | 100;

type CanopyOption = {
  diameter: CanopySize;
  name: string;
  subtitle: string;
  area: number;
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
};

type LeafletWindow = Window & {
  L?: any;
};

const ORIGIN_NAME = "서울대학교 39동";
const ORIGIN_LAT = 37.4591;
const ORIGIN_LNG = 126.9515;

const DEFAULT_SITE_LAT = 37.5665;
const DEFAULT_SITE_LNG = 126.978;

const CANOPY_OPTIONS: Record<CanopySize, CanopyOption> = {
  10: {
    diameter: 10,
    name: "10m",
    subtitle: "소형 장비 방음",
    area: Math.round(Math.PI * 5 * 5),
    installDays: 1,
    removalDays: 1,
    installCost: 900_000,
    removalCost: 500_000,
    dailyRental: 390_000,
    crew: "3~5명",
    noiseReduction: "8~12dB",
  },
  20: {
    diameter: 20,
    name: "20m",
    subtitle: "굴삭기 1대 구역",
    area: Math.round(Math.PI * 10 * 10),
    installDays: 3,
    removalDays: 1,
    installCost: 2_400_000,
    removalCost: 1_300_000,
    dailyRental: 950_000,
    crew: "5~8명",
    noiseReduction: "12~18dB",
  },
  40: {
    diameter: 40,
    name: "40m",
    subtitle: "중형 터파기 구역",
    area: Math.round(Math.PI * 20 * 20),
    installDays: 7,
    removalDays: 3,
    installCost: 8_200_000,
    removalCost: 4_600_000,
    dailyRental: 2_800_000,
    crew: "8~15명",
    noiseReduction: "15~23dB",
  },
  100: {
    diameter: 100,
    name: "100m",
    subtitle: "대형 장기 현장",
    area: Math.round(Math.PI * 50 * 50),
    installDays: 24,
    removalDays: 8,
    installCost: 45_000_000,
    removalCost: 28_000_000,
    dailyRental: 14_000_000,
    crew: "20명 이상",
    noiseReduction: "20~30dB",
  },
};

const formatKRW = (value: number) => {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1).replace(".0", "")}억 원`;
  }

  return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만 원`;
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

export default function CanopyPage() {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const selectedDiameterRef = useRef<CanopySize>(20);

  const [selectedDiameter, setSelectedDiameter] = useState<CanopySize>(20);
  const [rentalDays, setRentalDays] = useState(7);
  const [placedCanopies, setPlacedCanopies] = useState<PlacedCanopy[]>([]);
  const [siteCenter, setSiteCenter] = useState({
    lat: DEFAULT_SITE_LAT,
    lng: DEFAULT_SITE_LNG,
  });
  const [mapReady, setMapReady] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  selectedDiameterRef.current = selectedDiameter;

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
        script.onerror = () => reject();
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
        html: `<span>출발</span>`,
        iconSize: [54, 32],
        iconAnchor: [27, 16],
      });

      L.marker([ORIGIN_LAT, ORIGIN_LNG], { icon: originIcon })
        .addTo(map)
        .bindPopup(`${ORIGIN_NAME}<br/>운송 출발 기준점`);

      map.on("click", (event: any) => {
        const diameter = selectedDiameterRef.current;

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

      const circle = L.circle([canopy.lat, canopy.lng], {
        radius: canopy.diameter / 2,
        color:
          canopy.diameter === 100
            ? "#111827"
            : canopy.diameter === 40
              ? "#f2542d"
              : canopy.diameter === 20
                ? "#d8315b"
                : "#475569",
        weight: 2,
        fillColor:
          canopy.diameter === 100
            ? "#111827"
            : canopy.diameter === 40
              ? "#f2542d"
              : canopy.diameter === 20
                ? "#d8315b"
                : "#475569",
        fillOpacity: 0.22,
      }).addTo(layerRef.current);

      circle.bindPopup(`
        <b>${option.name} Air Canopy</b><br/>
        직경 ${canopy.diameter}m · 커버 ${formatNumber(option.area)}㎡<br/>
        예상 저감 ${option.noiseReduction}<br/>
        클릭 목록에서 삭제 가능
      `);

      const labelIcon = L.divIcon({
        className: styles.canopyMarker,
        html: `<span>${index + 1}</span><strong>${canopy.diameter}m</strong>`,
        iconSize: [64, 34],
        iconAnchor: [32, 17],
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

    const transportBase = 520_000;
    const transportCost = Math.round(transportBase + distanceKm * 38_000);

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

    const transportHours = Math.max(
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
      largestOption,
      installDays,
      removalDays,
      transportHours,
      arrivalDate,
      installFinishDate,
      removalFinishDate,
    };
  }, [placedCanopies, rentalDays, siteCenter]);

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
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Air-supported acoustic canopy rental</p>
          <h1>
            야간 터파기 소음을 줄이는
            <br />
            임시 방음 에어돔 대여
          </h1>
          <p className={styles.heroText}>
            실제 지도 위에서 공사 영역을 클릭하고, 직경 10m·20m·40m·100m
            캐노피를 조합해 예상 견적과 설치 타임라인을 확인하세요.
          </p>

          <div className={styles.heroActions}>
            <a href="#estimate" className={styles.primaryLink}>
              견적 계산하기
            </a>
            <a href="#process" className={styles.secondaryLink}>
              설치 과정 보기
            </a>
          </div>
        </div>
      </section>

      <section className={styles.introSection}>
        <div className={styles.introText}>
          <span>Problem</span>
          <h2>소음 때문에 멈추는 야간 공사 시간을 다시 설계합니다.</h2>
        </div>

        <div className={styles.introCards}>
          <article>
            <strong>민원 저감</strong>
            <p>상부가 열린 기존 방음벽의 한계를 보완하는 임시 차폐 구조</p>
          </article>
          <article>
            <strong>빠른 설치</strong>
            <p>공기막 구조 기반으로 현장 상황에 맞춰 설치와 철거를 단축</p>
          </article>
          <article>
            <strong>견적 자동화</strong>
            <p>지도 배치, 규격 조합, 운송거리, 임대기간 기반 예상 비용 산정</p>
          </article>
        </div>
      </section>

      <section id="estimate" className={styles.estimateSection}>
        <div className={styles.sectionHead}>
          <span>Estimate</span>
          <h2>지도에서 현장을 클릭해 캐노피를 배치하세요.</h2>
          <p>
            현재 지도는 OpenStreetMap 타일을 사용합니다. 지도를 확대해 실제 현장
            위치를 찾은 뒤 클릭하면 선택한 직경의 캐노피가 미터 단위 원으로
            표시됩니다.
          </p>
        </div>

        <div className={styles.estimateLayout}>
          <aside className={styles.selectorPanel}>
            <div className={styles.panelBlock}>
              <p className={styles.panelLabel}>01. 캐노피 크기</p>

              <div className={styles.sizeList}>
                {(Object.keys(CANOPY_OPTIONS) as unknown as CanopySize[]).map(
                  (diameter) => {
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
                        <span>{option.name}</span>
                        <strong>{option.subtitle}</strong>
                      </button>
                    );
                  }
                )}
              </div>

              <div className={styles.selectedInfo}>
                <div>
                  <span>커버 면적</span>
                  <strong>{formatNumber(selectedOption.area)}㎡</strong>
                </div>
                <div>
                  <span>설치 기간</span>
                  <strong>{selectedOption.installDays}일</strong>
                </div>
                <div>
                  <span>저감 목표</span>
                  <strong>{selectedOption.noiseReduction}</strong>
                </div>
              </div>
            </div>

            <div className={styles.panelBlock}>
              <p className={styles.panelLabel}>02. 임대 기간</p>

              <div className={styles.rangeTop}>
                <span>대여 기간</span>
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

              <p className={styles.muted}>
                설치 완료 후 실제 사용일 기준으로 임대료가 계산됩니다.
              </p>
            </div>

            <div className={styles.panelBlock}>
              <p className={styles.panelLabel}>03. 배치 목록</p>

              {placedCanopies.length === 0 ? (
                <p className={styles.empty}>
                  아직 배치된 캐노피가 없습니다. 지도 위 원하는 위치를 클릭하세요.
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
                        <span>{index + 1}</span>
                        <div>
                          <strong>{item.diameter}m 캐노피</strong>
                          <small>
                            {formatNumber(option.area)}㎡ · {option.noiseReduction}
                          </small>
                        </div>
                        <em>삭제</em>
                      </button>
                    );
                  })}
                </div>
              )}

              <button
                type="button"
                className={styles.resetButton}
                onClick={resetPlan}
              >
                배치 초기화
              </button>
            </div>
          </aside>

          <div className={styles.mapPanel}>
            <div className={styles.mapTop}>
              <div>
                <strong>실제 지도 기반 배치</strong>
                <span>
                  선택 규격: {selectedDiameter}m · 클릭하면 캐노피 추가
                </span>
              </div>

              <div className={styles.originBadge}>
                출발지: {ORIGIN_NAME}
              </div>
            </div>

            <div ref={mapElRef} className={styles.map} />

            {!mapReady && (
              <div className={styles.mapLoading}>
                <span />
                지도를 불러오는 중입니다.
              </div>
            )}
          </div>

          <aside className={styles.quotePanel}>
            <div className={styles.priceBox}>
              <span>예상 견적</span>
              <strong>{formatKRW(quote.total)}</strong>
              <p>VAT 포함 · 현장 실측 전 임시 계산값</p>
            </div>

            <div className={styles.summaryGrid}>
              <div>
                <span>캐노피</span>
                <strong>{placedCanopies.length}개</strong>
              </div>
              <div>
                <span>커버</span>
                <strong>{formatNumber(quote.totalArea)}㎡</strong>
              </div>
              <div>
                <span>운송거리</span>
                <strong>{quote.distanceKm.toFixed(1)}km</strong>
              </div>
              <div>
                <span>설치</span>
                <strong>{quote.installDays}일</strong>
              </div>
            </div>

            <div className={styles.breakdown}>
              <div>
                <span>장비 임대·설치·철거</span>
                <strong>{formatKRW(quote.equipmentCost)}</strong>
              </div>
              <div>
                <span>운송비</span>
                <strong>{formatKRW(quote.transportCost)}</strong>
              </div>
              <div>
                <span>대형 하역 할증</span>
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

      <section id="process" className={styles.processSection}>
        <div className={styles.sectionHead}>
          <span>Timeline</span>
          <h2>서울대 39동 출발 기준 설치 타임라인</h2>
        </div>

        <div className={styles.timeline}>
          <div>
            <span>오늘</span>
            <strong>현장 위치와 캐노피 조합 확정</strong>
            <p>지도 배치, 임대 기간, 장비 동선, 방음 목표 확인</p>
          </div>

          <div>
            <span>{quote.transportHours}시간</span>
            <strong>{ORIGIN_NAME} 출발 및 현장 운송</strong>
            <p>
              예상 운송거리 {quote.distanceKm.toFixed(1)}km · 막재, 송풍기,
              하부 스커트, 소음계 운반
            </p>
          </div>

          <div>
            <span>{formatDate(quote.arrivalDate)}</span>
            <strong>막재 전개와 앵커링</strong>
            <p>하부 방음 스커트, 출입부, 송풍기, 전기 연결</p>
          </div>

          <div>
            <span>{formatDate(quote.installFinishDate)}</span>
            <strong>가압 안정화와 소음 테스트</strong>
            <p>내부 압력, 누음 지점, 비상동선, 야간 작업 가능성 확인</p>
          </div>

          <div>
            <span>{formatDate(quote.removalFinishDate)}</span>
            <strong>임대 종료 및 철거 완료</strong>
            <p>막재 회수, 현장 원상복구, 소음 리포트 정리</p>
          </div>
        </div>
      </section>

      <section className={styles.specSection}>
        <div className={styles.sectionHead}>
          <span>Line-up</span>
          <h2>대여 가능한 캐노피 규격</h2>
        </div>

        <div className={styles.specGrid}>
          {(Object.keys(CANOPY_OPTIONS) as unknown as CanopySize[]).map(
            (diameter) => {
              const option = CANOPY_OPTIONS[diameter];

              return (
                <article key={diameter} className={styles.specCard}>
                  <strong>{option.name}</strong>
                  <p>{option.subtitle}</p>

                  <dl>
                    <div>
                      <dt>커버 면적</dt>
                      <dd>{formatNumber(option.area)}㎡</dd>
                    </div>
                    <div>
                      <dt>설치 기간</dt>
                      <dd>{option.installDays}일</dd>
                    </div>
                    <div>
                      <dt>철거 기간</dt>
                      <dd>{option.removalDays}일</dd>
                    </div>
                    <div>
                      <dt>작업 인원</dt>
                      <dd>{option.crew}</dd>
                    </div>
                    <div>
                      <dt>소음 저감</dt>
                      <dd>{option.noiseReduction}</dd>
                    </div>
                  </dl>
                </article>
              );
            }
          )}
        </div>
      </section>

      {checkoutOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setCheckoutOpen(false)}
        >
          <div
            className={styles.checkoutModal}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className={styles.closeButton}
              onClick={() => setCheckoutOpen(false)}
            >
              ×
            </button>

            <span className={styles.modalKicker}>Checkout preview</span>
            <h2>결제페이지 미리보기</h2>
            <p>
              실제 결제 API는 아직 연결하지 않았습니다. 이후 Toss Payments,
              PortOne, Stripe 등으로 연결할 수 있습니다.
            </p>

            <div className={styles.paymentCard}>
              <div>
                <span>총 결제 예정 금액</span>
                <strong>{formatKRW(quote.total)}</strong>
              </div>
              <div>
                <span>예약금 10%</span>
                <strong>{formatKRW(Math.round(quote.total * 0.1))}</strong>
              </div>
              <div>
                <span>계약 방식</span>
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