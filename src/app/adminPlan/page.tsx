"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import axios from "axios";
import styles from "../../styles/pages/AdminPlan.module.css";
import WebFooter from "../../components/WebFooter";

// 인터페이스 정의
interface Schedule {
  _id: string;
  eventDate: string; // 서버에서 string으로 받을 경우
  location: string;
  title: string;
  description?: string;
}

interface NewSchedule {
  eventDate: string;
  location: string;
  title: string;
  description: string;
}

export default function AdminPlan() {
  const [date, setDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [newSchedule, setNewSchedule] = useState<NewSchedule>({
    eventDate: "",
    location: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get<Schedule[]>(
        "/api/adminPlan/schedules?region=ap-northeast-2"
      );
      setSchedules(res.data);
    } catch (error) {
      console.error("Error fetching schedules", error);
    }
  };

  const handleScheduleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await axios.post("/api/adminPlan/schedules", {
        ...newSchedule,
        region: "ap-northeast-2",
      });
      setNewSchedule({
        eventDate: "",
        location: "",
        title: "",
        description: "",
      });
      fetchSchedules();
    } catch (error) {
      console.error("Error creating schedule", error);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin Calendar - Schedule Manager</h1>
      <div className={styles.calendarWrapper}>
        <Calendar
          onChange={(
            value,
            event: React.MouseEvent<HTMLButtonElement, MouseEvent>
          ) => {
            // value는 Date 또는 Date[] 타입이 될 수 있으므로 Date 타입인지 확인합니다.
            if (value instanceof Date) {
              setDate(value);
            }
          }}
          value={date}
          className={styles.calendar}
        />
      </div>
      <div className={styles.formContainer}>
        <h2>Add New Schedule</h2>
        <form onSubmit={handleScheduleSubmit} className={styles.scheduleForm}>
          <div className={styles.formGroup}>
            <label>Date:</label>
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
            <label>Location:</label>
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
            <label>Title:</label>
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
            <label>Description:</label>
            <textarea
              value={newSchedule.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setNewSchedule({ ...newSchedule, description: e.target.value })
              }
              className={styles.textareaField}
            />
          </div>
          <button type="submit" className={styles.submitButton}>
            Add Schedule
          </button>
        </form>
      </div>
      <div className={styles.scheduleListContainer}>
        <h2>Current Schedules</h2>
        <ul className={styles.scheduleList}>
          {schedules.map((schedule) => (
            <li key={schedule._id} className={styles.scheduleItem}>
              <strong>{schedule.title}</strong> -{" "}
              {new Date(schedule.eventDate).toLocaleDateString()} at{" "}
              {schedule.location}
              {schedule.description && <p>{schedule.description}</p>}
            </li>
          ))}
        </ul>
      </div>
      <WebFooter />
    </div>
  );
}
