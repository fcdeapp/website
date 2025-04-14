"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import { useConfig } from "../../context/ConfigContext";
import WebFooter from "../../components/WebFooter";
import ScheduleModal from "../../components/ScheduleModal";
import styles from "../../styles/pages/AdminPlan.module.css";

// 일정 인터페이스
interface Schedule {
  _id: string;
  eventDate: string; // 서버에서 받은 날짜 문자열
  location: string;
  title: string;
  description?: string;
  fileUrl?: string;
}

export default function AdminPlan() {
  const { SERVER_URL } = useConfig();
  const [date, setDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get<Schedule[]>(
        `${SERVER_URL}/api/adminPlan/schedules?region=ap-northeast-2`,
        { withCredentials: true }
      );
      setSchedules(res.data);
    } catch (error) {
      console.error("Error fetching schedules", error);
    }
  };

  // 일정들을 일별로 그룹화
  const groupSchedulesByDay = () => {
    const grouped: { [key: string]: Schedule[] } = {};
    schedules.forEach((schedule) => {
      const dayKey = new Date(schedule.eventDate).toLocaleDateString();
      if (!grouped[dayKey]) {
        grouped[dayKey] = [];
      }
      grouped[dayKey].push(schedule);
    });
    return grouped;
  };

  // 일정들을 주별로 그룹화 (해당 주의 일요일 기준)
  const groupSchedulesByWeek = () => {
    const grouped: { [key: string]: Schedule[] } = {};
    schedules.forEach((schedule) => {
      const dateObj = new Date(schedule.eventDate);
      const dayOfWeek = dateObj.getDay(); // 0(일) ~ 6(토)
      const startOfWeek = new Date(dateObj);
      startOfWeek.setDate(dateObj.getDate() - dayOfWeek);
      const weekKey = startOfWeek.toLocaleDateString();
      if (!grouped[weekKey]) {
        grouped[weekKey] = [];
      }
      grouped[weekKey].push(schedule);
    });
    return grouped;
  };

  const groupedSchedules = viewMode === "daily" ? groupSchedulesByDay() : groupSchedulesByWeek();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Admin Calendar - Schedule Manager</h1>
      </header>
      <main className={styles.main}>
        <div className={styles.topControls}>
          <div className={styles.controlRow}>
            <Calendar
              onChange={(value) => {
                if (value instanceof Date) {
                  setDate(value);
                }
              }}
              value={date}
              className={styles.calendar}
            />
            <div className={styles.viewToggle}>
              <button
                onClick={() => setViewMode("daily")}
                className={`${styles.toggleButton} ${viewMode === "daily" ? styles.active : ""}`}
              >
                Daily View
              </button>
              <button
                onClick={() => setViewMode("weekly")}
                className={`${styles.toggleButton} ${viewMode === "weekly" ? styles.active : ""}`}
              >
                Weekly View
              </button>
            </div>
          </div>
          <div className={styles.addButtonRow}>
            <button
              onClick={() => setModalOpen(true)}
              className={styles.addScheduleButton}
            >
              Add New Schedule
            </button>
          </div>
        </div>
        <div className={styles.scheduleListContainer}>
          <h2 className={styles.sectionTitle}>
            {viewMode === "daily" ? "Schedules by Day" : "Schedules by Week"}
          </h2>
          {Object.keys(groupedSchedules).length === 0 && (
            <p className={styles.noSchedule}>No schedules available.</p>
          )}
          {Object.keys(groupedSchedules).map((groupKey) => (
            <div key={groupKey} className={styles.scheduleGroup}>
              <h3 className={styles.groupTitle}>
                {viewMode === "daily"
                  ? `Date: ${groupKey}`
                  : `Week Starting: ${groupKey}`}
              </h3>
              <ul className={styles.scheduleList}>
                {groupedSchedules[groupKey].map((schedule) => (
                  <li key={schedule._id} className={styles.scheduleItem}>
                    <div className={styles.scheduleHeader}>
                      <span className={styles.scheduleTitle}>{schedule.title}</span>
                      <span className={styles.scheduleLocation}>{schedule.location}</span>
                    </div>
                    {schedule.description && (
                      <p className={styles.scheduleDescription}>{schedule.description}</p>
                    )}
                    {schedule.fileUrl && (
                      <p className={styles.scheduleFile}>
                        <a href={schedule.fileUrl} target="_blank" rel="noopener noreferrer">
                          View File
                        </a>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>
      {modalOpen && (
        <ScheduleModal
          onClose={() => setModalOpen(false)}
          onScheduleAdded={fetchSchedules}
        />
      )}
      <WebFooter />
    </div>
  );
}
