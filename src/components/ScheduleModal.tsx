"use client";

import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useConfig } from "../context/ConfigContext";
import styles from "../styles/components/ScheduleModal.module.css";

interface NewSchedule {
  eventDate: string;
  location: string;
  title: string;
  description: string;
  tag: string;
  amount: string; // 금액을 KRW 기준으로 입력 (필수 아님)
}

interface ScheduleModalProps {
  onClose: () => void;
  onScheduleAdded: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ onClose, onScheduleAdded }) => {
  const { SERVER_URL } = useConfig();
  const [newSchedule, setNewSchedule] = useState<NewSchedule>({
    eventDate: "",
    location: "",
    title: "",
    description: "",
    tag: "",
    amount: ""
  });
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("eventDate", newSchedule.eventDate);
      formData.append("location", newSchedule.location);
      formData.append("title", newSchedule.title);
      formData.append("description", newSchedule.description);
      formData.append("tag", newSchedule.tag);
      formData.append("amount", newSchedule.amount);
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
      // 폼 초기화 및 상위 컴포넌트에 알림
      setNewSchedule({
        eventDate: "",
        location: "",
        title: "",
        description: "",
        tag: "",
        amount: ""
      });
      setFile(null);
      onScheduleAdded();
      onClose();
    } catch (err) {
      console.error("Error creating schedule", err);
      setError("일정 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Add New Schedule</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.scheduleForm}>
          <div className={styles.formGroup}>
            <label>Date:</label>
            <input
              type="date"
              value={newSchedule.eventDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewSchedule({ ...newSchedule, eventDate: e.target.value })
              }
              required
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
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description:</label>
            <textarea
              value={newSchedule.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setNewSchedule({ ...newSchedule, description: e.target.value })
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>Tag:</label>
            <input
              type="text"
              value={newSchedule.tag}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewSchedule({ ...newSchedule, tag: e.target.value })
              }
              placeholder="예: 행사, 모임 등"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Amount (KRW):</label>
            <input
              type="number"
              value={newSchedule.amount}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setNewSchedule({ ...newSchedule, amount: e.target.value })
              }
              placeholder="예: 10000"
            />
          </div>
          <div className={styles.formGroup}>
            <label>File (jpeg, png, pdf):</label>
            <input
              type="file"
              accept=".jpeg,.jpg,.png,.pdf,.zip"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Add Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
