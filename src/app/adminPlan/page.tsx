"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Calendar from "react-calendar";
// react-calendar 기본 스타일 대신 custom 스타일이 우선 적용되도록 CSS 임포트 순서를 조정하거나 기본 임포트를 제거하세요.
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import { useConfig } from "../../context/ConfigContext";
import WebFooter from "../../components/WebFooter";
import styles from "../../styles/pages/AdminPlan.module.css";

// 인터페이스 정의
interface Schedule {
  _id: string;
  eventDate: string; // 서버에서 string으로 받음
  location: string;
  title: string;
  description?: string;
  fileUrl?: string; // 파일 URL (있을 경우)
}

interface NewSchedule {
  eventDate: string;
  location: string;
  title: string;
  description: string;
}

export default function AdminPlan() {
  const { SERVER_URL } = useConfig();
  const [date, setDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState<NewSchedule>({
    eventDate: "",
    location: "",
    title: "",
    description: "",
  });
  const [file, setFile] = useState<File | null>(null);

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

  const handleScheduleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("eventDate", newSchedule.eventDate);
      formData.append("location", newSchedule.location);
      formData.append("title", newSchedule.title);
      formData.append("description", newSchedule.description);
      formData.append("region", "ap-northeast-2");
      if (file) {
        formData.append("file", file);
      }
      await axios.post(
        `${SERVER_URL}/api/adminPlan/schedules`,
        formData,
        {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setNewSchedule({ eventDate: "", location: "", title: "", description: "" });
      setFile(null);
      fetchSchedules();
    } catch (error) {
      console.error("Error creating schedule", error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.headerTitle}>Admin Calendar - Schedule Manager</h1>
      </header>
      <main className={styles.main}>
        <div className={styles.calendarWrapper}>
          <Calendar
            onChange={(value) => {
              if (value instanceof Date) {
                setDate(value);
              }
            }}
            value={date}
            className={styles.calendar}
          />
        </div>
        <div className={styles.formContainer}>
          <h2 className={styles.sectionTitle}>Add New Schedule</h2>
          <form onSubmit={handleScheduleSubmit} className={styles.scheduleForm}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Date:</label>
              <input
                type="date"
                value={newSchedule.eventDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewSchedule({ ...newSchedule, eventDate: e.target.value })
                }
                required
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Location:</label>
              <input
                type="text"
                value={newSchedule.location}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewSchedule({ ...newSchedule, location: e.target.value })
                }
                required
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Title:</label>
              <input
                type="text"
                value={newSchedule.title}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewSchedule({ ...newSchedule, title: e.target.value })
                }
                required
                className={styles.inputField}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>Description:</label>
              <textarea
                value={newSchedule.description}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                  setNewSchedule({ ...newSchedule, description: e.target.value })
                }
                className={styles.textareaField}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label}>File (jpeg, png, pdf):</label>
              <input
                type="file"
                accept=".jpeg,.jpg,.png,.pdf"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  }
                }}
                className={styles.inputField}
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Add Schedule
            </button>
          </form>
        </div>
        <div className={styles.scheduleListContainer}>
          <h2 className={styles.sectionTitle}>Current Schedules</h2>
          <ul className={styles.scheduleList}>
            {schedules.map((schedule) => (
              <li key={schedule._id} className={styles.scheduleItem}>
                <strong>{schedule.title}</strong> -{" "}
                {new Date(schedule.eventDate).toLocaleDateString()} at{" "}
                {schedule.location}
                {schedule.description && <p>{schedule.description}</p>}
                {schedule.fileUrl && (
                  <p>
                    <a href={schedule.fileUrl} target="_blank" rel="noopener noreferrer">
                      View File
                    </a>
                  </p>
                )}
              </li>
            ))}
          </ul>
        </div>
      </main>
      <WebFooter />
    </div>
  );
}
