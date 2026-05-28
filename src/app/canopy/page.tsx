"use client";

import React, { useMemo, useState } from "react";
import styles from "../../styles/pages/Canopy.module.css";

type CanopySize = 10 | 20 | 40 | 100;

type CanopyOption = {
  diameter: CanopySize;
  label: string;
  area: number;
  installDays: number;
  installCost: number;
  removeCost: number;
  dailyRental: number;
  crew: string;
  noiseReduction: string;
  useCase: string;
};

type PlacedCanopy = {
  id: string;
  diameter: CanopySize;
  x: number;
  y: number;
};

const SNU_ORIGIN = "서울대학교 39동";
const DEFAULT_DISTANCE_KM = 18;

const CANOPY_OPTIONS: Record<CanopySize, CanopyOption> = {
  10: {
    diameter: 10,
    label: "10m Mini Dome",
    area: Math.round(Math.PI * 5 * 5),
    installDays: 1,
    installCost: 850_000,
    removeCost: 450_000,
    dailyRental: 380_000,
    crew: "3~5명",
    noiseReduction: "약 8~12dB",
    useCase: "발전기, 펌프, 소형 장비 방음",
  },
  20: {
    diameter: 20,
    label: "20m Field Canopy",
    area: Math.round(Math.PI * 10 * 10),
    installDays: 3,
    installCost: 2_200_000,
    removeCost: 1_200_000,
    dailyRental: 920_000,
    crew: "5~8명",
    noiseReduction: "약 12~18dB",
    useCase: "굴삭기 1대, 소형 상차 구역",
  },
  40: {
    diameter: 40,
    label: "40m Site Dome",
    area: Math.round(Math.PI * 20 * 20),
    installDays: 7,
    installCost: 7_500_000,
    removeCost: 4_300_000,
    dailyRental: 2_700_000,
    crew: "8~15명",
    noiseReduction: "약 15~23dB",
    useCase: "중형 터파기 구역, 임시 적치장",
  },
  100: {
    diameter: 100,
    label: "100m Mega Air Dome",
    area: Math.round(Math.PI * 50 * 50),
    installDays: 24,
    installCost: 42_000_000,
    removeCost: 27_000_000,
    dailyRental: 13_500_000,
    crew: "20명 이상",
    noiseReduction: "약 20~30dB",
    useCase: "대형 기초굴착장, 장기 임대 현장",
  },
};

const formatKRW = (value: number) => {
  if (value >= 100_000_000) {
    return `${(value / 100_000_000).toFixed(1).replace(".0", "")}억 원`;
  }

  if (value >= 10_000) {
    return `${Math.round(value / 10_000).toLocaleString("ko-KR")}만 원`;
  }

  return `${value.toLocaleString("ko-KR")}원`;
};

const formatNumber = (value: number) => value.toLocaleString("ko-KR");

const addDays = (date: Date, days: number) => {
  const copied = new Date(date);
  copied.setDate(copied.getDate() + days);
  return copied;
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
};

export default function CanopyPage() {
  const [selectedDiameter, setSelectedDiameter] = useState<CanopySize>(20);
  const [placedCanopies, setPlacedCanopies] = useState<PlacedCanopy[]>([
    { id: "sample-1", diameter: 20, x: 42, y: 46 },
    { id: "sample-2", diameter: 10, x: 58, y: 58 },
  ]);
  const [rentalDays, setRentalDays] = useState(7);
  const [distanceKm, setDistanceKm] = useState(DEFAULT_DISTANCE_KM);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const selectedOption = CANOPY_OPTIONS[selectedDiameter];

  const quote = useMemo(() => {
    const optionCounts = placedCanopies.reduce<Record<CanopySize, number>>(
      (acc, canopy) => {
        acc[canopy.diameter] += 1;
        return acc;
      },
      { 10: 0, 20: 0, 40: 0, 100: 0 }
    );

    const equipmentCost = placedCanopies.reduce((sum, canopy) => {
      const option = CANOPY_OPTIONS[canopy.diameter];
      return (
        sum +
        option.installCost +
        option.removeCost +
        option.dailyRental * rentalDays
      );
    }, 0);

    const totalArea = placedCanopies.reduce((sum, canopy) => {
      return sum + CANOPY_OPTIONS[canopy.diameter].area;
    }, 0);

    const largestDiameter = placedCanopies.reduce<CanopySize>((largest, canopy) => {
      return canopy.diameter > largest ? canopy.diameter : largest;
    }, 10);

    const mobilizationBase = 450_000;
    const distanceCost = Math.round(distanceKm * 28_000);
    const largeLoadSurcharge =
      optionCounts[100] > 0
        ? 4_800_000 * optionCounts[100]
        : optionCounts[40] > 0
          ? 1_600_000 * optionCounts[40]
          : 0;

    const monitoringCost = placedCanopies.length > 0 ? 1_200_000 : 0;
    const insuranceSafetyCost =
      placedCanopies.length > 0
        ? 700_000 + largestDiameter * 35_000
        : 0;

    const subtotal =
      equipmentCost +
      mobilizationBase +
      distanceCost +
      largeLoadSurcharge +
      monitoringCost +
      insuranceSafetyCost;

    const vat = Math.round(subtotal * 0.1);
    const total = subtotal + vat;

    const maxInstallDays =
      placedCanopies.length > 0
        ? Math.max(
            ...placedCanopies.map(
              (canopy) => CANOPY_OPTIONS[canopy.diameter].installDays
            )
          )
        : 0;

    const quantityFactor = Math.max(0, placedCanopies.length - 1) * 0.35;
    const installDays = Math.ceil(maxInstallDays + quantityFactor);

    const loadingHours = largestDiameter >= 100 ? 12 : largestDiameter >= 40 ? 6 : 3;
    const transportHours = Math.ceil(distanceKm / 35 + loadingHours);
    const today = new Date();
    const arrivalDate = addDays(today, transportHours > 12 ? 1 : 0);
    const installFinishDate = addDays(arrivalDate, installDays);
    const removeDays = largestDiameter >= 100 ? 8 : largestDiameter >= 40 ? 3 : 1;

    return {
      optionCounts,
      equipmentCost,
      mobilizationBase,
      distanceCost,
      largeLoadSurcharge,
      monitoringCost,
      insuranceSafetyCost,
      subtotal,
      vat,
      total,
      totalArea,
      installDays,
      removeDays,
      transportHours,
      arrivalDate,
      installFinishDate,
      largestDiameter,
    };
  }, [placedCanopies, rentalDays, distanceKm]);

  const estimatedNoise = useMemo(() => {
    if (placedCanopies.length === 0) return "예상 불가";

    const bestDiameter = quote.largestDiameter;
    const value =
      bestDiameter === 100
        ? "20~30dB"
        : bestDiameter === 40
          ? "15~23dB"
          : bestDiameter === 20
            ? "12~18dB"
            : "8~12dB";

    return value;
  }, [placedCanopies.length, quote.largestDiameter]);

  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPlacedCanopies((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        diameter: selectedDiameter,
        x: Math.min(94, Math.max(6, x)),
        y: Math.min(94, Math.max(6, y)),
      },
    ]);
  };

  const removeCanopy = (id: string) => {
    setPlacedCanopies((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCanopies = () => {
    setPlacedCanopies([]);
  };

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroGrid} />

        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>Air-supported Acoustic Canopy Rental</p>
          <h1>
            야간 터파기 소음 민원을 줄이는
            <span> 임시 방음 에어돔 대여</span>
          </h1>
          <p className={styles.heroText}>
            공사 영역을 지도 위에 지정하고, 직경 10m·20m·40m·100m 에어돔을
            조합해 예상 견적과 설치 타임라인을 바로 확인하세요. 서울대학교 39동
            기준 출발, 현장 설치형 임시 방음 캐노피 모델입니다.
          </p>

          <div className={styles.heroActions}>
            <a href="#quote" className={styles.primaryButton}>
              견적 시뮬레이션 시작
            </a>
            <a href="#spec" className={styles.secondaryButton}>
              규격 보기
            </a>
          </div>

          <div className={styles.heroStats}>
            <div>
              <strong>10m~100m</strong>
              <span>모듈형 에어돔</span>
            </div>
            <div>
              <strong>8~30dB</strong>
              <span>조건별 저감 목표</span>
            </div>
            <div>
              <strong>1일~4주</strong>
              <span>설치 소요 범위</span>
            </div>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.dome}>
            <div className={styles.domeTop} />
            <div className={styles.domeBase} />
            <div className={styles.domeDoor} />
          </div>
          <div className={styles.noiseRingOne} />
          <div className={styles.noiseRingTwo} />
          <div className={styles.floatingLabel}>
            <strong>Noise Shield</strong>
            <span>temporary acoustic enclosure</span>
          </div>
        </div>
      </section>

      <section className={styles.problemSection}>
        <div>
          <p className={styles.sectionLabel}>Why this matters</p>
          <h2>야간 공사의 핵심 제약은 소음입니다.</h2>
        </div>

        <div className={styles.problemCards}>
          <article>
            <span>01</span>
            <h3>민원 리스크</h3>
            <p>
              야간에는 배경소음이 낮아 굴삭기, 상차음, 후진 경고음이 더 크게
              체감됩니다.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>작업시간 제약</h3>
            <p>
              단순 방음벽만으로는 굴착장 상부와 출입구로 퍼지는 소음을 막기
              어렵습니다.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>빠른 설치 필요</h3>
            <p>
              공기막 구조는 철골 가설 지붕보다 빠르게 설치·해체할 수 있어
              임시공사에 적합합니다.
            </p>
          </article>
        </div>
      </section>

      <section id="quote" className={styles.quoteSection}>
        <div className={styles.quoteHeader}>
          <div>
            <p className={styles.sectionLabel}>Interactive Quote</p>
            <h2>지도 위에 캐노피를 배치해 견적을 확인하세요.</h2>
            <p>
              원하는 규격을 선택한 뒤 지도 영역을 클릭하면 해당 직경의 방음
              캐노피가 배치됩니다.
            </p>
          </div>

          <button className={styles.clearButton} onClick={clearCanopies}>
            전체 초기화
          </button>
        </div>

        <div className={styles.quoteGrid}>
          <div className={styles.controlPanel}>
            <div className={styles.panelBlock}>
              <h3>1. 에어돔 규격 선택</h3>
              <div className={styles.sizeGrid}>
                {(Object.keys(CANOPY_OPTIONS) as unknown as CanopySize[]).map(
                  (diameter) => {
                    const option = CANOPY_OPTIONS[diameter];
                    const isActive = selectedDiameter === diameter;

                    return (
                      <button
                        key={diameter}
                        className={`${styles.sizeButton} ${
                          isActive ? styles.sizeButtonActive : ""
                        }`}
                        onClick={() => setSelectedDiameter(diameter)}
                      >
                        <strong>{diameter}m</strong>
                        <span>{option.label}</span>
                      </button>
                    );
                  }
                )}
              </div>

              <div className={styles.selectedSpec}>
                <div>
                  <span>커버 면적</span>
                  <strong>{formatNumber(selectedOption.area)}㎡</strong>
                </div>
                <div>
                  <span>설치 기간</span>
                  <strong>{selectedOption.installDays}일</strong>
                </div>
                <div>
                  <span>예상 저감</span>
                  <strong>{selectedOption.noiseReduction}</strong>
                </div>
              </div>

              <p className={styles.hint}>
                현재 선택: <b>{selectedOption.label}</b> · 지도 클릭 시 배치
              </p>
            </div>

            <div className={styles.panelBlock}>
              <h3>2. 임대 조건</h3>

              <label className={styles.rangeLabel}>
                <span>임대 기간</span>
                <strong>{rentalDays}일</strong>
              </label>
              <input
                className={styles.range}
                type="range"
                min={1}
                max={60}
                value={rentalDays}
                onChange={(event) => setRentalDays(Number(event.target.value))}
              />

              <label className={styles.rangeLabel}>
                <span>{SNU_ORIGIN} → 현장 거리</span>
                <strong>{distanceKm}km</strong>
              </label>
              <input
                className={styles.range}
                type="range"
                min={1}
                max={80}
                value={distanceKm}
                onChange={(event) => setDistanceKm(Number(event.target.value))}
              />

              <div className={styles.routeBox}>
                <div className={styles.routeDot} />
                <div>
                  <strong>{SNU_ORIGIN}</strong>
                  <span>막재·송풍기·방음 패널 상차</span>
                </div>
                <div className={styles.routeLine} />
                <div className={styles.routePin} />
                <div>
                  <strong>현장 도착</strong>
                  <span>전개, 앵커링, 가압, 안전점검</span>
                </div>
              </div>
            </div>

            <div className={styles.panelBlock}>
              <h3>3. 배치된 캐노피</h3>

              {placedCanopies.length === 0 ? (
                <p className={styles.emptyText}>
                  아직 배치된 캐노피가 없습니다. 지도 위를 클릭해 추가하세요.
                </p>
              ) : (
                <div className={styles.placedList}>
                  {placedCanopies.map((canopy, index) => {
                    const option = CANOPY_OPTIONS[canopy.diameter];

                    return (
                      <button
                        key={canopy.id}
                        className={styles.placedItem}
                        onClick={() => removeCanopy(canopy.id)}
                      >
                        <span>#{index + 1}</span>
                        <strong>{canopy.diameter}m</strong>
                        <em>{option.useCase}</em>
                        <small>클릭 시 삭제</small>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={styles.mapPanel}>
            <div className={styles.mapToolbar}>
              <div>
                <strong>공사 영역 맵</strong>
                <span>클릭해서 캐노피 중심점 배치</span>
              </div>
              <div className={styles.mapScale}>
                <span /> 20m
              </div>
            </div>

            <div className={styles.mapCanvas} onClick={handleMapClick}>
              <div className={styles.fakeRoadOne} />
              <div className={styles.fakeRoadTwo} />
              <div className={styles.fakeBlockOne} />
              <div className={styles.fakeBlockTwo} />
              <div className={styles.fakeBlockThree} />
              <div className={styles.excavationArea}>
                <span>터파기 예정 구역</span>
              </div>

              {placedCanopies.map((canopy) => {
                const pixelSize =
                  canopy.diameter === 10
                    ? 42
                    : canopy.diameter === 20
                      ? 76
                      : canopy.diameter === 40
                        ? 138
                        : 260;

                return (
                  <button
                    key={canopy.id}
                    className={`${styles.canopyCircle} ${
                      styles[`diameter${canopy.diameter}`]
                    }`}
                    style={{
                      left: `${canopy.x}%`,
                      top: `${canopy.y}%`,
                      width: pixelSize,
                      height: pixelSize,
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      removeCanopy(canopy.id);
                    }}
                    title={`${canopy.diameter}m 캐노피 삭제`}
                  >
                    <span>{canopy.diameter}m</span>
                  </button>
                );
              })}

              <div className={styles.mapTip}>
                지도 클릭 → {selectedDiameter}m 캐노피 추가
              </div>
            </div>
          </div>

          <aside className={styles.resultPanel}>
            <div className={styles.resultTop}>
              <span>예상 견적</span>
              <strong>{formatKRW(quote.total)}</strong>
              <small>VAT 포함 · 실제 현장 실측 후 조정</small>
            </div>

            <div className={styles.resultMetrics}>
              <div>
                <span>배치 수량</span>
                <strong>{placedCanopies.length}개</strong>
              </div>
              <div>
                <span>총 커버 면적</span>
                <strong>{formatNumber(quote.totalArea)}㎡</strong>
              </div>
              <div>
                <span>예상 저감</span>
                <strong>{estimatedNoise}</strong>
              </div>
              <div>
                <span>설치 기간</span>
                <strong>{quote.installDays}일</strong>
              </div>
            </div>

            <div className={styles.costBreakdown}>
              <div>
                <span>장비 임대·설치·철거</span>
                <strong>{formatKRW(quote.equipmentCost)}</strong>
              </div>
              <div>
                <span>출동 기본비</span>
                <strong>{formatKRW(quote.mobilizationBase)}</strong>
              </div>
              <div>
                <span>운송비</span>
                <strong>{formatKRW(quote.distanceCost)}</strong>
              </div>
              <div>
                <span>대형 하역 할증</span>
                <strong>{formatKRW(quote.largeLoadSurcharge)}</strong>
              </div>
              <div>
                <span>소음계·안전관리</span>
                <strong>
                  {formatKRW(quote.monitoringCost + quote.insuranceSafetyCost)}
                </strong>
              </div>
              <div>
                <span>VAT</span>
                <strong>{formatKRW(quote.vat)}</strong>
              </div>
            </div>

            <div className={styles.timeline}>
              <h3>예상 설치 타임라인</h3>

              <div className={styles.timelineItem}>
                <span>오늘</span>
                <div>
                  <strong>예약 접수 및 도면 확인</strong>
                  <p>현장 출입구, 굴착 장비 반경, 방음 목표 확인</p>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <span>{quote.transportHours}h</span>
                <div>
                  <strong>{SNU_ORIGIN} 출발 · 현장 운송</strong>
                  <p>{distanceKm}km 기준 상차, 이동, 하역 포함</p>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <span>{formatDate(quote.arrivalDate)}</span>
                <div>
                  <strong>막재 전개 및 앵커링</strong>
                  <p>하부 방음 스커트, 송풍기, 출입 게이트 설치</p>
                </div>
              </div>

              <div className={styles.timelineItem}>
                <span>{formatDate(quote.installFinishDate)}</span>
                <div>
                  <strong>가압 안정화 · 소음계 테스트</strong>
                  <p>야간 작업 전 차음 성능과 비상동선 확인</p>
                </div>
              </div>
            </div>

            <button
              className={styles.checkoutButton}
              disabled={placedCanopies.length === 0}
              onClick={() => setIsPaymentOpen(true)}
            >
              동의하고 결제페이지로 이동
            </button>

            <p className={styles.disclaimer}>
              본 견적은 임시 계산값입니다. 실제 계약 전에는 풍하중, 소방, 환기,
              출입구, 장비 동선, 소음 예측 검토가 필요합니다.
            </p>
          </aside>
        </div>
      </section>

      <section id="spec" className={styles.specSection}>
        <div className={styles.specHeader}>
          <p className={styles.sectionLabel}>Rental Line-up</p>
          <h2>현장 규모별 대여 규격</h2>
        </div>

        <div className={styles.specGrid}>
          {(Object.keys(CANOPY_OPTIONS) as unknown as CanopySize[]).map(
            (diameter) => {
              const option = CANOPY_OPTIONS[diameter];

              return (
                <article key={diameter} className={styles.specCard}>
                  <div className={styles.specCircle}>
                    <span>{diameter}m</span>
                  </div>
                  <h3>{option.label}</h3>
                  <p>{option.useCase}</p>

                  <dl>
                    <div>
                      <dt>면적</dt>
                      <dd>{formatNumber(option.area)}㎡</dd>
                    </div>
                    <div>
                      <dt>설치</dt>
                      <dd>{option.installDays}일</dd>
                    </div>
                    <div>
                      <dt>인원</dt>
                      <dd>{option.crew}</dd>
                    </div>
                    <div>
                      <dt>저감 목표</dt>
                      <dd>{option.noiseReduction}</dd>
                    </div>
                  </dl>
                </article>
              );
            }
          )}
        </div>
      </section>

      {isPaymentOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsPaymentOpen(false)}
        >
          <div
            className={styles.paymentModal}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className={styles.modalClose}
              onClick={() => setIsPaymentOpen(false)}
            >
              ×
            </button>

            <p className={styles.sectionLabel}>Checkout Preview</p>
            <h2>결제페이지 미리보기</h2>
            <p>
              아직 실제 결제 API는 연결하지 않은 상태입니다. 이후 Toss Payments,
              PortOne, Stripe 등으로 연결할 수 있습니다.
            </p>

            <div className={styles.paymentSummary}>
              <div>
                <span>총 결제 예정 금액</span>
                <strong>{formatKRW(quote.total)}</strong>
              </div>
              <div>
                <span>임대 기간</span>
                <strong>{rentalDays}일</strong>
              </div>
              <div>
                <span>캐노피 수량</span>
                <strong>{placedCanopies.length}개</strong>
              </div>
            </div>

            <div className={styles.fakePaymentBox}>
              <div>
                <span>카드번호</span>
                <strong>•••• •••• •••• 1234</strong>
              </div>
              <div>
                <span>계약 방식</span>
                <strong>현장 실측 후 확정 결제</strong>
              </div>
              <div>
                <span>예약금</span>
                <strong>{formatKRW(Math.round(quote.total * 0.1))}</strong>
              </div>
            </div>

            <button className={styles.payButton}>예약금 결제하기</button>
          </div>
        </div>
      )}
    </main>
  );
}