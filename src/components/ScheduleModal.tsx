"use client";

import React, { useState, ChangeEvent, FormEvent, useEffect } from "react";
import axios from "axios";
import { useConfig } from "../context/ConfigContext";
import styles from "../styles/components/ScheduleModal.module.css";

interface NewSchedule {
  eventDate: string;
  location: string;
  title: string;
  description: string;
  tag: string;
  amount: string; // 금액 (KRW 기준)
}

interface ScheduleModalProps {
  onClose: () => void;
  onScheduleAdded: () => void;
  initialData?: NewSchedule & { _id?: string };
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  onClose,
  onScheduleAdded,
  initialData,
}) => {
  const { SERVER_URL } = useConfig();
  const [scheduleData, setScheduleData] = useState<NewSchedule>({
    eventDate: initialData?.eventDate || "",
    location: initialData?.location || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    tag: initialData?.tag || "",
    amount: initialData?.amount || "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [supportFiles, setSupportFiles] = useState<File[]>([]);
  const [error, setError] = useState("");

  // 만약 initialData가 변경되었을 경우 폼 데이터 업데이트
  useEffect(() => {
    if (initialData) {
      setScheduleData({
        eventDate: initialData.eventDate,
        location: initialData.location,
        title: initialData.title,
        description: initialData.description,
        tag: initialData.tag,
        amount: initialData.amount,
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("eventDate", scheduleData.eventDate);
      formData.append("location", scheduleData.location);
      formData.append("title", scheduleData.title);
      formData.append("description", scheduleData.description);
      formData.append("tag", scheduleData.tag);
      formData.append("amount", scheduleData.amount);
      formData.append("region", "beta");

      // 기본 파일 추가
      if (file) {
        formData.append("file", file);
      }
      // 보조 파일 추가 (최대 두 개)
      if (supportFiles && supportFiles.length > 0) {
        // supportFiles 배열의 각 파일을 FormData에 추가
        supportFiles.forEach((supportFile) =>
          formData.append("supportFiles", supportFile)
        );
      }

      if (initialData && initialData._id) {
        // 수정 모드: 기존 일정 업데이트 (PUT 요청)
        await axios.put(
          `${SERVER_URL}/api/adminPlan/schedules/${initialData._id}?region=beta`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        // 신규 생성 모드: POST 요청
        await axios.post(`${SERVER_URL}/api/adminPlan/schedules?region=beta`, formData, {
          withCredentials: true,
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      // 폼 초기화 및 상위 컴포넌트에 알림
      setScheduleData({
        eventDate: "",
        location: "",
        title: "",
        description: "",
        tag: "",
        amount: "",
      });
      setFile(null);
      setSupportFiles([]);
      onScheduleAdded();
      onClose();
    } catch (err) {
      console.error("Error submitting schedule", err);
      setError("일정 전송에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>{initialData ? "Edit Schedule" : "Add New Schedule"}</h2>
        {error && <p className={styles.error}>{error}</p>}
        <form onSubmit={handleSubmit} className={styles.scheduleForm}>
          <div className={styles.formGroup}>
            <label>Date:</label>
            <input
              type="date"
              value={scheduleData.eventDate}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setScheduleData({ ...scheduleData, eventDate: e.target.value })
              }
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Location:</label>
            <input
              type="text"
              value={scheduleData.location}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setScheduleData({ ...scheduleData, location: e.target.value })
              }
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Title:</label>
            <input
              type="text"
              value={scheduleData.title}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setScheduleData({ ...scheduleData, title: e.target.value })
              }
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Description:</label>
            <textarea
              value={scheduleData.description}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                setScheduleData({
                  ...scheduleData,
                  description: e.target.value,
                })
              }
            />
          </div>
          <div className={styles.formGroup}>
            <label>Tag:</label>
            <input
              type="text"
              value={scheduleData.tag}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setScheduleData({ ...scheduleData, tag: e.target.value })
              }
              placeholder="예: 결제증명, 인보이스 등"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Amount (KRW):</label>
            <input
              type="number"
              value={scheduleData.amount}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setScheduleData({ ...scheduleData, amount: e.target.value })
              }
              placeholder="예: 10000"
            />
          </div>
          <div className={styles.formGroup}>
            <label>File (jpeg, jpg, png, pdf, zip, eml):</label>
            <input
              type="file"
              accept=".jpeg,.jpg,.png,.pdf,.zip,.eml"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files && e.target.files.length > 0) {
                  setFile(e.target.files[0]);
                }
              }}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Support Files (최대 2개):</label>
            <input
              type="file"
              multiple
              accept=".jpeg,.jpg,.png,.pdf,.zip,.eml"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                if (e.target.files) {
                  // Array.from()으로 FileList를 배열로 변환 후 최대 2개 제한
                  const selectedFiles = Array.from(e.target.files).slice(0, 2);
                  setSupportFiles(selectedFiles);
                }
              }}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              {initialData ? "Update Schedule" : "Add Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
