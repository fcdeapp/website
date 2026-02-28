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

  return (
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
                      onClick={() => setSelectedSlug(entry.slug)}
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
            아래 카드에서도 원하는 날의 기록을 빠르게 골라볼 수 있습니다.
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
                onClick={() => setSelectedSlug(entry.slug)}
              >
                <div className={styles.cardTop}>
                  <span className={styles.datePill}>{formatFullDate(entry.date)}</span>
                </div>

                <h3 className={styles.cardTitle}>{entry.title}</h3>

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
  );
}