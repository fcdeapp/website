"use client";

import { useMemo, useState } from "react";
import styles from "../../styles/pages/Diary.module.css";
import type { DiaryEntry, DiaryImage } from "./page";

type MonthGroup = {
  key: string;
  year: number;
  month: number;
  label: string;
  entryByDay: Map<number, DiaryEntry>;
};

function parseDate(value: string) {
  const normalized = value.trim();

  if (/^\d{4}$/.test(normalized)) {
    return new Date(Number(normalized), 0, 1);
  }

  if (/^\d{4}-\d{2}$/.test(normalized)) {
    const [year, month] = normalized.split("-").map(Number);
    return new Date(year, month - 1, 1);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    const [year, month, day] = normalized.split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const fallback = new Date(normalized);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function formatFullDate(value: string) {
  const date = parseDate(value);
  if (!date) return value;

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);
}

function formatMonthLabel(year: number, month: number) {
  return `${year}년 ${month}월`;
}

function getExcerpt(text: string, maxLength = 160) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return normalized.slice(0, maxLength).trim() + "...";
}

function buildMonthGroups(entries: DiaryEntry[]): MonthGroup[] {
  const monthMap = new Map<string, MonthGroup>();

  for (const entry of entries) {
    const date = parseDate(entry.date);
    if (!date) continue;

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const key = `${year}-${String(month).padStart(2, "0")}`;

    if (!monthMap.has(key)) {
      monthMap.set(key, {
        key,
        year,
        month,
        label: formatMonthLabel(year, month),
        entryByDay: new Map<number, DiaryEntry>(),
      });
    }

    monthMap.get(key)!.entryByDay.set(day, entry);
  }

  return Array.from(monthMap.values()).sort((a, b) => b.key.localeCompare(a.key));
}

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function ImageStack({
  images,
  title,
  size = "large",
  clickable = false,
  onOpen,
}: {
  images: DiaryImage[];
  title: string;
  size?: "large" | "small";
  clickable?: boolean;
  onOpen?: () => void;
}) {
  const previewImages = images.slice(0, 4);
  const center = (previewImages.length - 1) / 2;

  const inner = (
    <div
      className={`${styles.imageStack} ${
        size === "small" ? styles.imageStackSmall : styles.imageStackLarge
      }`}
    >
      {previewImages.map((image, index) => {
        const stackY = index * 3;
        const stackRotate = (index - center) * 1.8;
        const fanX = (index - center) * 22;
        const fanRotate = (index - center) * 8;

        return (
          <div
            key={image.fileName}
            className={styles.imageStackLayer}
            style={
              {
                "--stack-y": `${stackY}px`,
                "--stack-rotate": `${stackRotate}deg`,
                "--fan-x": `${fanX}px`,
                "--fan-rotate": `${fanRotate}deg`,
                zIndex: previewImages.length - index,
              } as React.CSSProperties
            }
          >
            <img
              src={image.dataUrl}
              alt={`${title} 이미지 ${index + 1}`}
              className={styles.imageStackImg}
            />
          </div>
        );
      })}

      {images.length > 1 ? (
        <span className={styles.imageCountChip}>{images.length}장</span>
      ) : null}
    </div>
  );

  if (clickable) {
    return (
      <button
        type="button"
        className={`${styles.imageStackButton} ${
          size === "small" ? styles.imageStackButtonSmall : styles.imageStackButtonLarge
        }`}
        onClick={onOpen}
      >
        {inner}
      </button>
    );
  }

  return (
    <div
      className={`${styles.imageStackDisplay} ${
        size === "small" ? styles.imageStackDisplaySmall : styles.imageStackDisplayLarge
      }`}
    >
      {inner}
    </div>
  );
}

export default function DiaryClient({ entries }: { entries: DiaryEntry[] }) {
  const [showIntro, setShowIntro] = useState(false);
  const [modalState, setModalState] = useState<{
    images: DiaryImage[];
    index: number;
    title: string;
  } | null>(null);

  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => {
      const aDate = parseDate(a.date);
      const bDate = parseDate(b.date);

      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;

      return bDate.getTime() - aDate.getTime();
    });
  }, [entries]);

  const [selectedSlug, setSelectedSlug] = useState<string>(sortedEntries[0]?.slug ?? "");

  const selectedEntry =
    sortedEntries.find((entry) => entry.slug === selectedSlug) ?? sortedEntries[0] ?? null;

  const monthGroups = useMemo(() => buildMonthGroups(sortedEntries), [sortedEntries]);

  const handleSelectEntry = (slug: string) => {
    setSelectedSlug(slug);
    setModalState(null);
  };

  const openModal = (images: DiaryImage[], title: string, index = 0) => {
    setModalState({ images, title, index });
  };

  const closeModal = () => setModalState(null);

  const goPrevImage = () => {
    setModalState((prev) => {
      if (!prev) return prev;
      const nextIndex = (prev.index - 1 + prev.images.length) % prev.images.length;
      return { ...prev, index: nextIndex };
    });
  };

  const goNextImage = () => {
    setModalState((prev) => {
      if (!prev) return prev;
      const nextIndex = (prev.index + 1) % prev.images.length;
      return { ...prev, index: nextIndex };
    });
  };

  return (
    <main className={styles.wrapper}>
      <section className={styles.heroSection}>
        <div className={styles.heroBgMesh} aria-hidden />
        <div className={styles.heroBgGlow} aria-hidden />

        <div className={styles.heroInner}>
          {showIntro && (
            <div className={styles.heroReveal}>
              <span className={styles.sectionKicker}>Diary</span>

              <h1 className={styles.heroTitle}>
                경험,
                <br />
                기록
              </h1>

              <p className={styles.heroLead}>
                {`가지 않은 길을 되돌아보는 나쁜 습관이 있습니다
저는 다만 빛나는 삶들이 부러웠습니다
돌리지 못할 그 선택들이
그것이 모든 것을 바꾸었다고`}
              </p>

              <div className={styles.heroMeta}>
                <span className={styles.metaChip}>총 {entries.length}개의 기록</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.headerBlock}>
          <div className={styles.archiveTopRow}>
            <div className={styles.archiveTopSpacer} aria-hidden />
            <span className={styles.sectionKicker}>Archive</span>
            <button
              type="button"
              className={styles.hiddenToggleButtonSecondary}
              onClick={() => setShowIntro((prev) => !prev)}
              aria-expanded={showIntro}
            >
              {showIntro ? "설명 숨기기" : "설명 보기"}
            </button>
          </div>

          <h2 className={styles.sectionTitle}>날짜별 기록 보기</h2>

          {showIntro && (
            <p className={styles.sectionLead}>
              아래 달력에서 날짜를 누르면 해당 기록만 바로 확인할 수 있습니다.
            </p>
          )}
        </div>

        {entries.length === 0 ? (
          <div className={styles.emptyCard}>
            <h3 className={styles.emptyTitle}>아직 표시할 기록이 없습니다</h3>
            <p className={styles.emptyText}>
              <code>src/app/diary/content</code> 폴더에 <code>.txt</code> 파일을 추가한 뒤 다시 빌드하면 이 페이지에 반영됩니다.
            </p>
          </div>
        ) : (
          <div className={styles.diaryInteractiveWrap}>
            <div className={styles.diaryTopLayout}>
              <aside className={styles.calendarPanel}>
                <div className={styles.panelHead}>
                  <h3 className={styles.panelTitle}>달력에서 날짜 선택</h3>
                  <p className={styles.panelText}>
                    기록이 있는 날짜만 진하게 표시됩니다.
                  </p>
                </div>

                <div className={styles.calendarMonthList}>
                  {monthGroups.map((group) => {
                    const firstDay = new Date(group.year, group.month - 1, 1).getDay();
                    const daysInMonth = new Date(group.year, group.month, 0).getDate();
                    const cells = [];

                    for (let i = 0; i < firstDay; i += 1) {
                      cells.push(
                        <div
                          key={`${group.key}-empty-${i}`}
                          className={`${styles.calendarCell} ${styles.calendarCellEmpty}`}
                          aria-hidden
                        />
                      );
                    }

                    for (let day = 1; day <= daysInMonth; day += 1) {
                      const entry = group.entryByDay.get(day);
                      const isActive = entry?.slug === selectedEntry?.slug;

                      cells.push(
                        entry ? (
                          <button
                            key={`${group.key}-${day}`}
                            type="button"
                            className={`${styles.calendarCell} ${styles.calendarDateButton} ${
                              isActive ? styles.calendarDateButtonActive : ""
                            }`}
                            onClick={() => handleSelectEntry(entry.slug)}
                            aria-pressed={isActive}
                            title={`${group.label} ${day}일 기록 보기`}
                          >
                            {day}
                          </button>
                        ) : (
                          <div
                            key={`${group.key}-${day}`}
                            className={`${styles.calendarCell} ${styles.calendarCellMuted}`}
                          >
                            {day}
                          </div>
                        )
                      );
                    }

                    return (
                      <section key={group.key} className={styles.monthBlock}>
                        <div className={styles.monthHeader}>{group.label}</div>

                        <div className={styles.weekHeader}>
                          {WEEK_LABELS.map((label) => (
                            <div key={`${group.key}-${label}`} className={styles.weekCell}>
                              {label}
                            </div>
                          ))}
                        </div>

                        <div className={styles.calendarGrid}>{cells}</div>
                      </section>
                    );
                  })}
                </div>
              </aside>

              <section className={styles.selectedPanel}>
                {selectedEntry ? (
                  <>
                    <div className={styles.selectedTop}>
                      <span className={styles.selectedDatePill}>
                        {formatFullDate(selectedEntry.date)}
                      </span>
                    </div>

                    <h3 className={styles.selectedTitle}>{selectedEntry.title}</h3>

                    {selectedEntry.images.length > 0 ? (
                      <>
                        <div className={styles.selectedImageWrapSmall}>
                          <ImageStack
                            images={selectedEntry.images}
                            title={selectedEntry.title}
                            size="large"
                            clickable
                            onOpen={() => openModal(selectedEntry.images, selectedEntry.title, 0)}
                          />
                        </div>

                        <p className={styles.imageHint}>
                          이미지를 누르면 크게 볼 수 있습니다.
                          {selectedEntry.images.length > 1
                            ? ` 총 ${selectedEntry.images.length}장입니다.`
                            : ""}
                        </p>
                      </>
                    ) : null}

                    <div className={styles.selectedDivider} />

                    <pre className={styles.selectedContent}>{selectedEntry.content}</pre>
                  </>
                ) : (
                  <div className={styles.emptyCard}>
                    <h3 className={styles.emptyTitle}>선택된 기록이 없습니다</h3>
                    <p className={styles.emptyText}>왼쪽 달력에서 날짜를 선택해 주세요.</p>
                  </div>
                )}
              </section>
            </div>

            <section className={styles.archiveSection}>
              <div className={styles.archiveHead}>
                <h3 className={styles.archiveTitle}>전체 기록 한눈에 보기</h3>
                <p className={styles.archiveText}>
                  카드 목록에서도 원하는 날짜를 눌러 바로 해당 기록으로 이동할 수 있습니다.
                </p>
              </div>

              <div className={styles.diaryGrid}>
                {sortedEntries.map((entry) => {
                  const isActive = entry.slug === selectedEntry?.slug;

                  return (
                    <button
                      key={entry.slug}
                      type="button"
                      className={`${styles.diaryCard} ${styles.diaryCardButton} ${
                        isActive ? styles.diaryCardActive : ""
                      }`}
                      onClick={() => handleSelectEntry(entry.slug)}
                    >
                      <div className={styles.cardTop}>
                        <span className={styles.datePill}>{formatFullDate(entry.date)}</span>
                      </div>

                      <h3 className={styles.cardTitle}>{entry.title}</h3>

                      {entry.images.length > 0 ? (
                        <div className={styles.cardThumbWrap}>
                          <ImageStack
                            images={entry.images}
                            title={entry.title}
                            size="small"
                          />
                        </div>
                      ) : null}

                      <p className={styles.cardExcerpt}>{getExcerpt(entry.content)}</p>

                      <div className={styles.divider} />

                      <div className={styles.cardHint}>
                        {isActive ? "현재 보고 있는 기록" : "눌러서 이 날짜의 기록 보기"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </section>

      {modalState ? (
        <div
          className={styles.imageModalBackdrop}
          onClick={closeModal}
          role="button"
          tabIndex={0}
        >
          <div
            className={styles.imageModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className={styles.imageModalClose}
              onClick={closeModal}
            >
              닫기
            </button>

            {modalState.images.length > 1 ? (
              <>
                <button
                  type="button"
                  className={`${styles.imageModalNav} ${styles.imageModalPrev}`}
                  onClick={goPrevImage}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className={`${styles.imageModalNav} ${styles.imageModalNext}`}
                  onClick={goNextImage}
                >
                  ›
                </button>
              </>
            ) : null}

            <img
              src={modalState.images[modalState.index].dataUrl}
              alt={`${modalState.title} 크게 보기 ${modalState.index + 1}`}
              className={styles.imageModalImage}
            />

            {modalState.images.length > 1 ? (
              <div className={styles.imageModalThumbRow}>
                {modalState.images.map((image, index) => (
                  <button
                    key={image.fileName}
                    type="button"
                    className={`${styles.imageModalThumbButton} ${
                      index === modalState.index ? styles.imageModalThumbButtonActive : ""
                    }`}
                    onClick={() =>
                      setModalState((prev) =>
                        prev ? { ...prev, index } : prev
                      )
                    }
                  >
                    <img
                      src={image.dataUrl}
                      alt={`${modalState.title} 썸네일 ${index + 1}`}
                      className={styles.imageModalThumb}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </main>
  );
}