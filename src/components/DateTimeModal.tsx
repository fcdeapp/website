"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/DateTimeModal.module.css";

interface SelectedDate {
  year: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
}

interface DateTimeModalProps {
  visible: boolean;
  selectedDate: SelectedDate;
  setSelectedDate: (newDate: SelectedDate) => void;
  showTimePicker: boolean;
  setShowTimePicker: (show: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  years: string[];
  months: string[];
  days: string[];
  hours: string[];
  minutes: string[];
}

const DateTimeModal: React.FC<DateTimeModalProps> = ({
  visible,
  selectedDate,
  setSelectedDate,
  showTimePicker,
  setShowTimePicker,
  onSave,
  onCancel,
  years,
  months,
  days,
  hours,
  minutes,
}) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.modalTitle}>{t("modal.select_date_time")}</h2>
        {/* 날짜 선택 영역 */}
        <div className={styles.pickerRow}>
          <div className={styles.labeledPicker}>
            <label className={styles.label}>Year:</label>
            <select
              className={styles.picker}
              value={selectedDate.year}
              onChange={(e) =>
                setSelectedDate({ ...selectedDate, year: e.target.value })
              }
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.labeledPicker}>
            <label className={styles.label}>Month:</label>
            <select
              className={styles.picker}
              value={selectedDate.month}
              onChange={(e) =>
                setSelectedDate({ ...selectedDate, month: e.target.value })
              }
            >
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.labeledPicker}>
            <label className={styles.label}>Day:</label>
            <select
              className={styles.picker}
              value={selectedDate.day}
              onChange={(e) =>
                setSelectedDate({ ...selectedDate, day: e.target.value })
              }
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>
        {/* 시간 선택 영역 (선택 여부 토글) */}
        {showTimePicker && (
          <div className={styles.pickerRow}>
            <div className={styles.labeledPicker}>
              <label className={styles.label}>Hour:</label>
              <select
                className={styles.picker}
                value={selectedDate.hour}
                onChange={(e) =>
                  setSelectedDate({ ...selectedDate, hour: e.target.value })
                }
              >
                {hours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.labeledPicker}>
              <label className={styles.label}>Minute:</label>
              <select
                className={styles.picker}
                value={selectedDate.minute}
                onChange={(e) =>
                  setSelectedDate({ ...selectedDate, minute: e.target.value })
                }
              >
                {minutes.map((minute) => (
                  <option key={minute} value={minute}>
                    {minute}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
        <button
          className={styles.toggleButtonDate}
          onClick={() => setShowTimePicker(!showTimePicker)}
        >
          <span className={styles.toggleTextDate}>
            {showTimePicker
              ? t("buttons.exclude_time")
              : t("buttons.include_time")}
          </span>
        </button>
        <div className={styles.buttonRow}>
          <button className={styles.cancelButton} onClick={onCancel}>
            {t("cancel")}
          </button>
          <button className={styles.saveButton} onClick={onSave}>
            {t("save")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateTimeModal;
