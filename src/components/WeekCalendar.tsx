"use client";

import React, { useState, useEffect } from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/WeekCalendar.module.css";

interface Schedule {
  title: string;
  eventDate: string;
}

interface WeekCalendarProps {
  onDayPress: (day: { dateString: string }) => void;
  selectedDate: string;
  schedules: Schedule[];
}

const WeekCalendar: React.FC<WeekCalendarProps> = ({ onDayPress, selectedDate, schedules }) => {
  const { t } = useTranslation();
  const [currentWeek, setCurrentWeek] = useState<moment.Moment[]>([]);

  useEffect(() => {
    const initialDate = selectedDate ? moment(selectedDate) : moment();
    setWeekDays(initialDate);
  }, [selectedDate]);

  const setWeekDays = (date: moment.Moment) => {
    const startOfWeek = date.clone().startOf("week");
    const days = Array.from({ length: 7 }, (_, i) => startOfWeek.clone().add(i, "days"));
    setCurrentWeek(days);
  };

  const handlePreviousWeek = () => {
    if (currentWeek[0]) {
      setWeekDays(currentWeek[0].clone().subtract(1, "week"));
    }
  };

  const handleNextWeek = () => {
    if (currentWeek[0]) {
      setWeekDays(currentWeek[0].clone().add(1, "week"));
    }
  };

  const getSchedulesForDate = (date: moment.Moment) => {
    return schedules.filter((schedule) =>
      moment(schedule.eventDate).isSame(date, "day")
    );
  };

  return (
    <div className={styles.container}>
      {/* Week Navigation */}
      <div className={styles.navigationContainer}>
        <button className={styles.navButton} onClick={handlePreviousWeek}>
          <span className={styles.navButtonText}>‹</span>
        </button>
        <span className={styles.weekTitle}>
          {currentWeek.length > 0 &&
            `${currentWeek[0].format("MMM D")} - ${currentWeek[6].format("MMM D")}`}
        </span>
        <button className={styles.navButton} onClick={handleNextWeek}>
          <span className={styles.navButtonText}>›</span>
        </button>
      </div>

      {/* Week Days and Schedules */}
      <div className={styles.daysContainer}>
        {currentWeek.map((day) => {
          const dayKey = day.format("YYYY-MM-DD");
          const isSelected = selectedDate === dayKey;
          const daySchedules = getSchedulesForDate(day);

          return (
            <div key={dayKey} className={styles.dayContainer}>
              {/* Day Column */}
              <button
                className={`${styles.dayButton} ${isSelected ? styles.selectedDayButton : ""}`}
                onClick={() => onDayPress({ dateString: dayKey })}
              >
                <span className={styles.dayText}>{day.format("ddd")}</span>
                <span className={`${styles.dateText} ${isSelected ? styles.selectedDateText : ""}`}>
                  {day.format("D")}
                </span>
              </button>

              {/* Schedules for the Day */}
              <div className={styles.schedulesContainer}>
                {daySchedules.length > 0 ? (
                  daySchedules.map((schedule, index) => (
                    <div key={index} className={styles.scheduleItem}>
                      <span className={styles.scheduleTitle}>{schedule.title}</span>
                      <span className={styles.scheduleTime}>
                        {moment(schedule.eventDate).format("hh:mm A")}
                      </span>
                    </div>
                  ))
                ) : (
                  <span className={styles.noScheduleText}>
                    {t("weekCalendar.noSchedule")}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeekCalendar;
