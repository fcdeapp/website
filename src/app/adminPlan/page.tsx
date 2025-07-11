"use client";

import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import { useConfig } from "../../context/ConfigContext";
import WebFooter from "../../components/WebFooter";
import ScheduleModal from "../../components/ScheduleModal";
import styles from "../../styles/pages/AdminPlan.module.css";

// Chart.js 관련 import (npm install chart.js react-chartjs-2)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// ChartJS 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 일정 인터페이스 (보조파일(supportFiles) 추가)
export interface Schedule {
  _id: string;
  eventDate: string; // 서버에서 받은 날짜 문자열
  location: string;
  title: string;
  description?: string;
  fileUrl?: string;
  tag?: string;     // 추가: 태그
  amount?: string;  // 추가: 금액
  supportFiles?: {
    fileUrl: string;
    fileKey: string;
  }[];
}

export default function AdminPlan() {
  const { SERVER_URL } = useConfig();
  const [date, setDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  // 수정 시 선택한 스케줄 데이터를 저장 (null이면 새 일정 생성)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [viewMode, setViewMode] = useState<"daily" | "weekly" | "monthly" | "analysis">("daily");
  // 각 일정 항목의 파일 보기 상태 (현재 열려있는 파일 뷰의 스케줄 id)
  const [openFileScheduleId, setOpenFileScheduleId] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get<Schedule[]>(
        `${SERVER_URL}/api/adminPlan/schedules?region=beta`,
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

  // 일정들을 월별로 그룹화 (YYYY-MM 형식)
  const groupSchedulesByMonth = () => {
    const grouped: { [key: string]: Schedule[] } = {};
    schedules.forEach((schedule) => {
      const dateObj = new Date(schedule.eventDate);
      const monthKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(schedule);
    });
    return grouped;
  };

  // Analysis Mode: 월별 금액 합산, 태그별 금액 합산
  const getMonthlyAggregates = () => {
    const monthlyTotals: { [key: string]: number } = {};
    schedules.forEach((schedule) => {
      if (schedule.amount) {
        const dateObj = new Date(schedule.eventDate);
        const monthKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        const value = parseFloat(schedule.amount);
        if (!isNaN(value)) {
          monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + value;
        }
      }
    });
    return monthlyTotals;
  };

  const getTagAggregates = () => {
    const tagTotals: { [key: string]: number } = {};
    schedules.forEach((schedule) => {
      if (schedule.amount && schedule.tag) {
        const value = parseFloat(schedule.amount);
        if (!isNaN(value)) {
          tagTotals[schedule.tag] = (tagTotals[schedule.tag] || 0) + value;
        }
      }
    });
    return tagTotals;
  };

  // 선택한 뷰 모드에 따른 그룹 데이터
  let groupedSchedules: { [key: string]: Schedule[] } = {};
  if (viewMode === "daily") {
    groupedSchedules = groupSchedulesByDay();
  } else if (viewMode === "weekly") {
    groupedSchedules = groupSchedulesByWeek();
  } else if (viewMode === "monthly") {
    groupedSchedules = groupSchedulesByMonth();
  }

  // Analysis Mode 데이터
  const monthlyAggregates = getMonthlyAggregates();
  const tagAggregates = getTagAggregates();

  // 차트 데이터 준비 (월별)
  const monthlyChartData = {
    labels: Object.keys(monthlyAggregates),
    datasets: [
      {
        label: "Monthly Total Amount (KRW)",
        data: Object.values(monthlyAggregates),
        backgroundColor: "rgba(0, 112, 243, 0.6)",
      },
    ],
  };

  // 차트 데이터 준비 (태그별)
  const tagChartData = {
    labels: Object.keys(tagAggregates),
    datasets: [
      {
        label: "Tag Total Amount (KRW)",
        data: Object.values(tagAggregates),
        backgroundColor: "rgba(255, 102, 0, 0.6)",
      },
    ],
  };

  // 모달 닫기 시 새 일정 생성/수정 초기화
  const handleCloseModal = () => {
    setEditingSchedule(null);
    setModalOpen(false);
  };

  // 일정 항목 수정 버튼 핸들러
  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setModalOpen(true);
  };

  // 파일 보기 버튼 클릭 핸들러 (인라인 토글)
  const toggleFileView = (scheduleId: string) => {
    if (openFileScheduleId === scheduleId) {
      setOpenFileScheduleId(null);
    } else {
      setOpenFileScheduleId(scheduleId);
    }
  };

  // 계산: 전체 첨부 파일 개수 (기본 파일 + 보조파일)
  const getTotalFileCount = (schedule: Schedule) => {
    let count = 0;
    if (schedule.fileUrl && schedule.fileUrl.trim() !== "") count++;
    if (schedule.supportFiles && schedule.supportFiles.length > 0) {
      count += schedule.supportFiles.filter(sf => sf.fileUrl && sf.fileUrl.trim() !== "").length;
    }
    return count;
  };

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
            {/* 수직 버튼 그룹 */}
            <div className={styles.viewToggleVertical}>
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
              <button
                onClick={() => setViewMode("monthly")}
                className={`${styles.toggleButton} ${viewMode === "monthly" ? styles.active : ""}`}
              >
                Monthly View
              </button>
              <button
                onClick={() => setViewMode("analysis")}
                className={`${styles.toggleButton} ${viewMode === "analysis" ? styles.active : ""}`}
              >
                Analysis Mode
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
          {viewMode !== "analysis" ? (
            <>
              <h2 className={styles.sectionTitle}>
                {viewMode === "daily"
                  ? "Schedules by Day"
                  : viewMode === "weekly"
                  ? "Schedules by Week"
                  : "Schedules by Month"}
              </h2>
              {Object.keys(groupedSchedules).length === 0 && (
                <p className={styles.noSchedule}>No schedules available.</p>
              )}
              {Object.keys(groupedSchedules).map((groupKey) => (
                <div key={groupKey} className={styles.scheduleGroup}>
                  <h3 className={styles.groupTitle}>
                    {viewMode === "daily"
                      ? `Date: ${groupKey}`
                      : viewMode === "weekly"
                      ? `Week Starting: ${groupKey}`
                      : `Month: ${groupKey}`}
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
                        {schedule.tag && (
                          <p className={styles.scheduleTag}>Tag: {schedule.tag}</p>
                        )}
                        {/* 금액이 0보다 큰 경우에만 금액 정보를 표시 */}
                        {schedule.amount && parseFloat(schedule.amount) > 0 && (
                          <p className={styles.scheduleAmount}>Amount: {schedule.amount} KRW</p>
                        )}
                        {/* 파일 관련: 기본 파일 및 보조파일이 있을 경우 총 파일 수 표시 및 클릭 시 인라인 파일 목록 토글 */}
                        {(schedule.fileUrl ||
                          (schedule.supportFiles && schedule.supportFiles.length > 0)) && (
                          <p className={styles.scheduleFile}>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                toggleFileView(schedule._id);
                              }}
                            >
                              View File ({getTotalFileCount(schedule)} {getTotalFileCount(schedule) > 1 ? "files" : "file"})
                            </a>
                          </p>
                        )}
                        {/* 인라인 파일 보기 영역 */}
                        {openFileScheduleId === schedule._id && (
                          <div className={styles.inlineFileList}>
                            <ul>
                              {schedule.fileUrl && schedule.fileUrl.trim() !== "" && (
                                <li>
                                  <a href={schedule.fileUrl} target="_blank" rel="noopener noreferrer">
                                    Main File
                                  </a>
                                </li>
                              )}
                              {schedule.supportFiles &&
                                schedule.supportFiles.map((file, index) =>
                                  file.fileUrl && file.fileUrl.trim() !== "" ? (
                                    <li key={index}>
                                      <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
                                        Support File {index + 1}
                                      </a>
                                    </li>
                                  ) : null
                                )}
                              {getTotalFileCount(schedule) === 0 && (
                                <li>No attached files.</li>
                              )}
                            </ul>
                          </div>
                        )}
                        {/* 수정 버튼 */}
                        <button 
                          onClick={() => handleEdit(schedule)}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </>
          ) : (
            // Analysis Mode 화면: 월별/태그별 금액 합산 표와 차트
            <div className={styles.analysisContainer}>
              <h2 className={styles.sectionTitle}>Monthly Payment Analysis</h2>
              {Object.entries(monthlyAggregates).filter(([, total]) => total > 0).length === 0 ? (
                <p className={styles.noSchedule}>No payment data available.</p>
              ) : (
                <>
                  <table className={styles.analysisTable}>
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Total Amount (KRW)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(monthlyAggregates)
                        .filter(([, total]) => total > 0)
                        .map(([month, total]) => (
                          <tr key={month}>
                            <td>{month}</td>
                            <td>{total.toLocaleString()} KRW</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div className={styles.chartContainer}>
                    <Bar data={monthlyChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                  </div>
                </>
              )}

              <h2 className={styles.sectionTitle}>Tag Payment Analysis</h2>
              {Object.entries(tagAggregates).filter(([, total]) => total > 0).length === 0 ? (
                <p className={styles.noSchedule}>No tag data available.</p>
              ) : (
                <>
                  <table className={styles.analysisTable}>
                    <thead>
                      <tr>
                        <th>Tag</th>
                        <th>Total Amount (KRW)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(tagAggregates)
                        .filter(([, total]) => total > 0)
                        .map(([tag, total]) => (
                          <tr key={tag}>
                            <td>{tag}</td>
                            <td>{total.toLocaleString()} KRW</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                  <div className={styles.chartContainer}>
                    <Bar data={tagChartData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
      {modalOpen && (
        <ScheduleModal
          onClose={handleCloseModal}
          onScheduleAdded={fetchSchedules}
          initialData={
            editingSchedule
              ? {
                  ...editingSchedule,
                  description: editingSchedule.description ?? "",
                  tag: editingSchedule.tag ?? "",
                  amount: editingSchedule.amount ?? ""
                }
              : undefined
          }
        />
      )}
      <WebFooter />
    </div>
  );
}
