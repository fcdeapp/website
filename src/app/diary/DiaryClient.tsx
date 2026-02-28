"use client";

import { useMemo, useState } from "react";
import styles from "../../styles/pages/Diary.module.css";
import type { DiaryEntry } from "./page";

type MonthGroup = {
  key: string;
  year: number;
  month: number;
  label: string;
  entryByDay: Map<number, DiaryEntry>;
};

function parseDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
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

export default function DiaryClient({ entries }: { entries: DiaryEntry[] }) {
  const [showIntro, setShowIntro] = useState(false);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

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
    setIsImageExpanded(false);
  };

  return (
    <main className={styles.wrapper}>
      <section className={styles.heroSection}>
        <div className={styles.heroBgMesh} aria-hidden />
        <div className={styles.heroBgGlow} aria-hidden />

        <div className={styles.heroInner}>
          <div className={styles.heroTopBar}>
            <div />
            <button
              type="button"
              className={styles.hiddenToggleButtonSecondary}
              onClick={() => setShowIntro((prev) => !prev)}
              aria-expanded={showIntro}
            >
              {showIntro ? "설명 숨기기" : "설명 보기"}
            </button>
          </div>

          {showIntro && (
            <div className={styles.heroReveal}>
              <span className={styles.sectionKicker}>Diary</span>

              <h1 className={styles.heroTitle}>
                조용히 남겨 둔 마음들,
                <br />
                날짜 위의 기록
              </h1>

              <p className={styles.heroLead}>
                이곳에는 지나간 생각과 고민, 흔들리던 날의 감정들을 차분히 모아두었습니다.
                원하는 날짜를 누르면 그날의 기록을 바로 펼쳐볼 수 있습니다.
              </p>

              <div className={styles.heroMeta}>
                <span className={styles.metaChip}>총 {entries.length}개의 기록</span>
                <span className={styles.metaChip}>src/app/diary/content</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.headerBlock}>
          <div className={styles.archiveTopRow}>
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
              이 페이지는 단순한 메모 보관함이 아니라, 그날그날의 고민과 마음을 다시 들여다보는 작은 아카이브입니다.
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

                    {selectedEntry.imageDataUrl ? (
                      <>
                        <div className={styles.selectedImageWrapSmall}>
                          <button
                            type="button"
                            className={styles.selectedImageButton}
                            onClick={() => setIsImageExpanded(true)}
                          >
                            <img
                              src={selectedEntry.imageDataUrl}
                              alt={`${selectedEntry.title} 관련 이미지`}
                              className={styles.selectedImageSmall}
                            />
                          </button>
                        </div>

                        <p className={styles.imageHint}>이미지를 누르면 크게 볼 수 있습니다.</p>
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

                      {entry.imageDataUrl ? (
                        <div className={styles.cardThumbWrap}>
                          <img
                            src={entry.imageDataUrl}
                            alt={`${entry.title} 썸네일`}
                            className={styles.cardThumb}
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

      {selectedEntry?.imageDataUrl && isImageExpanded ? (
        <div
          className={styles.imageModalBackdrop}
          onClick={() => setIsImageExpanded(false)}
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
              onClick={() => setIsImageExpanded(false)}
            >
              닫기
            </button>
            <img
              src={selectedEntry.imageDataUrl}
              alt={`${selectedEntry.title} 크게 보기`}
              className={styles.imageModalImage}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}