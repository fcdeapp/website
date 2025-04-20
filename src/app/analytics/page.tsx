"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { useConfig } from "../../context/ConfigContext";
import styles from "../../styles/pages/AdminAnalytics.module.css";

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// 리전 상수
const REGIONS = [
  "ap-northeast-2",
  "ap-southeast-2",
  "ca-central-1",
  "eu-west-2",
];

// 타입 정의
interface AnalyticsRow {
  region: string;
  date: string; // ISO date string
  totalUsers: number;
  emailOptInUsers: number;
  dailyActiveUsers: number;
  avgAppLoadCount: number;
  avgMapSearchCount: number;
  avgAiPostCount: number;
  avgBannerAdViewCount: number;
  avgInterstitialAdViewCount: number;
  avgBuddyGroups: number;
  trustBadgeRatio: number;
  pushNotificationEnabledRatio: number;
  newMessageEnabledRatio: number;
  isAccountPublicRatio: number;
  isEmailVerifiedRatio: number;
  isGoogleAccountRatio: number;
  usersBySchool: Record<string, number>;
}

export default function AdminAnalyticsPage() {
  const { SERVER_URL } = useConfig();

  // 필터 상태
  const [region, setRegion] = useState<string>(REGIONS[0]);
  const [start, setStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState<string>(new Date().toISOString().slice(0, 10));

  // 데이터 & 로딩
  const [data, setData] = useState<AnalyticsRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // 기간별 데이터 fetch
  useEffect(() => {
    if (!region || !start || !end) return;
    setLoading(true);
    setError("");
    axios
      .get<{ analytics: AnalyticsRow[] }>(
        `${SERVER_URL}/api/admin/analytics/range?region=${region}&start=${start}&end=${end}`,
        { withCredentials: true }
      )
      .then((res) => setData(res.data.analytics))
      .catch((e) => {
        console.error(e);
        setError("데이터를 불러오는 중 오류가 발생했습니다.");
      })
      .finally(() => setLoading(false));
  }, [SERVER_URL, region, start, end]);

  // 공통 함수: 날짜 레이블
  const labels = data.map((row) => row.date.slice(0, 10));

  // 차트 데이터 생성 헬퍼
  const makeLineDataset = (label: string, values: number[], color: string) => ({
    label,
    data: values,
    borderColor: color,
    backgroundColor: "transparent",
    tension: 0.3,
  });

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>📊 User Analytics Dashboard</h1>

      <div className={styles.filters}>
        <div className={styles.filterItem}>
          <label>Region</label>
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.filterItem}>
          <label>Start Date</label>
          <input
            type="date"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </div>
        <div className={styles.filterItem}>
          <label>End Date</label>
          <input
            type="date"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.loader}>Loading analytics…</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <>
          {/* 표 */}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Users</th>
                  <th>Email Opt‑Ins</th>
                  <th>Daily Active</th>
                  <th>Avg App Load</th>
                  <th>Avg Map Search</th>
                  <th>Avg AI Posts</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.date}>
                    <td>{row.date.slice(0, 10)}</td>
                    <td>{row.totalUsers}</td>
                    <td>{row.emailOptInUsers}</td>
                    <td>{row.dailyActiveUsers}</td>
                    <td>{row.avgAppLoadCount.toFixed(1)}</td>
                    <td>{row.avgMapSearchCount.toFixed(1)}</td>
                    <td>{row.avgAiPostCount.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 그래프 그리드 */}
          <div className={styles.chartGrid}>
            {/* 1) Users & Active */}
            <div className={styles.chartCard}>
              <h3>Total vs Daily Active Users</h3>
              <Line
                data={{
                  labels,
                  datasets: [
                    makeLineDataset(
                      "Total Users",
                      data.map((r) => r.totalUsers),
                      "#6C63FF"
                    ),
                    makeLineDataset(
                      "Daily Active",
                      data.map((r) => r.dailyActiveUsers),
                      "#FF6B6B"
                    ),
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>

            {/* 2) Avg Counts */}
            <div className={styles.chartCard}>
              <h3>Average Usage Counts</h3>
              <Line
                data={{
                  labels,
                  datasets: [
                    makeLineDataset(
                      "App Load",
                      data.map((r) => r.avgAppLoadCount),
                      "#1A1045"
                    ),
                    makeLineDataset(
                      "Map Search",
                      data.map((r) => r.avgMapSearchCount),
                      "#6C63FF"
                    ),
                    makeLineDataset(
                      "AI Posts",
                      data.map((r) => r.avgAiPostCount),
                      "#FF6B6B"
                    ),
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>

            {/* 3) Ratios */}
            <div className={styles.chartCardFull}>
              <h3>Feature Ratios (%)</h3>
              <Line
                data={{
                  labels,
                  datasets: [
                    makeLineDataset(
                      "Trust Badge",
                      data.map((r) => r.trustBadgeRatio * 100),
                      "#6C63FF"
                    ),
                    makeLineDataset(
                      "Push Notif",
                      data.map((r) => r.pushNotificationEnabledRatio * 100),
                      "#FF6B6B"
                    ),
                    makeLineDataset(
                      "New Msg",
                      data.map((r) => r.newMessageEnabledRatio * 100),
                      "#1A1045"
                    ),
                    makeLineDataset(
                      "Email Verified",
                      data.map((r) => r.isEmailVerifiedRatio * 100),
                      "#00A86B"
                    ),
                  ],
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { position: "bottom" } },
                  scales: { y: { ticks: { callback: (v) => `${v}%` } } },
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
