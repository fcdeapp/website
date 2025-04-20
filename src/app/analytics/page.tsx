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

// 리전 상수 + All 옵션
const REGIONS = [
  { label: "All Regions", value: "all" },
  { label: "ap-northeast-2", value: "ap-northeast-2" },
  { label: "ap-southeast-2", value: "ap-southeast-2" },
  { label: "ca-central-1", value: "ca-central-1" },
  { label: "eu-west-2", value: "eu-west-2" },
];

// AnalyticsRow 타입
interface AnalyticsRow {
  region?: string;
  date: string;
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

type RegionAnalytics = {
  region: string;
  analytics: AnalyticsRow[];
};

export default function AdminAnalyticsPage() {
  const { SERVER_URL } = useConfig();

  const [region, setRegion] = useState<string>("all");
  const [start, setStart] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  const [data, setData] = useState<AnalyticsRow[]>([]);
  const [allData, setAllData] = useState<RegionAnalytics[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch effect
  useEffect(() => {
    if (!start || !end) return;
    setLoading(true);
    setError("");
    if (region === "all") {
      axios
        .get<{ analytics: RegionAnalytics[] }>(
          `${SERVER_URL}/api/admin/analytics/all/range?start=${start}&end=${end}`,
          { withCredentials: true }
        )
        .then((res) => {
          setAllData(res.data.analytics);
          setData([]);
        })
        .catch((e) => {
          console.error(e);
          setError("전체 리전 데이터를 불러오는 중 오류가 발생했습니다.");
        })
        .finally(() => setLoading(false));
    } else {
      axios
        .get<{ analytics: AnalyticsRow[] }>(
          `${SERVER_URL}/api/admin/analytics/range?region=${region}&start=${start}&end=${end}`,
          { withCredentials: true }
        )
        .then((res) => {
          setData(res.data.analytics);
          setAllData([]);
        })
        .catch((e) => {
          console.error(e);
          setError("데이터를 불러오는 중 오류가 발생했습니다.");
        })
        .finally(() => setLoading(false));
    }
  }, [SERVER_URL, region, start, end]);

  // Download JSON (단일 리전)
  const handleDownload = () => {
    if (!data.length) return;
    const filename = `analytics_${region}_${start}_${end}.json`;
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 차트/테이블 렌더 함수
  const renderSection = (
    regionLabel: string,
    analytics: AnalyticsRow[]
  ) => {
    const labels = analytics.map((r) => r.date.slice(0, 10));

    const totalDataset = {
      labels,
      datasets: [
        {
          label: "Total Users",
          data: analytics.map((r) => r.totalUsers),
          borderColor: "#556cd6",
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "Daily Active",
          data: analytics.map((r) => r.dailyActiveUsers),
          borderColor: "#19857b",
          backgroundColor: "transparent",
          tension: 0.3,
        },
      ],
    };

    const usageDataset = {
      labels,
      datasets: [
        {
          label: "App Load",
          data: analytics.map((r) => r.avgAppLoadCount),
          borderColor: "#556cd6",
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "Map Search",
          data: analytics.map((r) => r.avgMapSearchCount),
          borderColor: "#19857b",
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "AI Posts",
          data: analytics.map((r) => r.avgAiPostCount),
          borderColor: "#ff8a65",
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "Banner Ads",
          data: analytics.map((r) => r.avgBannerAdViewCount),
          borderColor: "#9c27b0",
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "Interstitial Ads",
          data: analytics.map((r) => r.avgInterstitialAdViewCount),
          borderColor: "#ffca28",
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "Buddy Groups",
          data: analytics.map((r) => r.avgBuddyGroups),
          borderColor: "#00838f",
          backgroundColor: "transparent",
          tension: 0.3,
        },
      ],
    };

    const ratioDataset = {
      labels,
      datasets: [
        {
          label: "Trust Badge",
          data: analytics.map((r) => r.trustBadgeRatio * 100),
          borderColor: "#556cd6",
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "Push Notif",
          data: analytics.map((r) => r.pushNotificationEnabledRatio * 100),
          borderColor: "#19857b",
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "New Msg",
          data: analytics.map((r) => r.newMessageEnabledRatio * 100),
          borderColor: "#ff8a65",
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "Account Public",
          data: analytics.map((r) => r.isAccountPublicRatio * 100),
          borderColor: "#9c27b0",
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "Email Verified",
          data: analytics.map((r) => r.isEmailVerifiedRatio * 100),
          borderColor: "#ffca28",
          backgroundColor: "transparent",
          tension: 0.3,
        },
        {
          label: "Google Account",
          data: analytics.map((r) => r.isGoogleAccountRatio * 100),
          borderColor: "#00838f",
          backgroundColor: "transparent",
          tension: 0.3,
        },
      ],
    };

    return (
      <div key={regionLabel}>
        <h2 className={styles.regionHeader}>{regionLabel}</h2>
        {/* 1. Users & Daily Active */}
        <section className={styles.section}>
          <div className={styles.tableWrapper}>
            <h3 className={styles.sectionTitle}>Users & Daily Active</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Total Users</th>
                  <th>Daily Active</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((r) => (
                  <tr key={r.date}>
                    <td>{r.date.slice(0, 10)}</td>
                    <td>{r.totalUsers}</td>
                    <td>{r.dailyActiveUsers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.chartContainer}>
            <Line
              data={totalDataset}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </section>
        {/* 2. Usage Counts */}
        <section className={styles.section}>
          <div className={styles.tableWrapper}>
            <h3 className={styles.sectionTitle}>Usage Counts</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>App Load</th>
                  <th>Map Search</th>
                  <th>AI Posts</th>
                  <th>Banner Ads</th>
                  <th>Interstitial Ads</th>
                  <th>Buddy Groups</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((r) => (
                  <tr key={r.date}>
                    <td>{r.date.slice(0, 10)}</td>
                    <td>{r.avgAppLoadCount.toFixed(1)}</td>
                    <td>{r.avgMapSearchCount.toFixed(1)}</td>
                    <td>{r.avgAiPostCount.toFixed(1)}</td>
                    <td>{r.avgBannerAdViewCount.toFixed(1)}</td>
                    <td>{r.avgInterstitialAdViewCount.toFixed(1)}</td>
                    <td>{r.avgBuddyGroups.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.chartContainer}>
            <Line
              data={usageDataset}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
                scales: { y: { beginAtZero: true } },
              }}
            />
          </div>
        </section>
        {/* 3. Feature Ratios */}
        <section className={styles.section}>
          <div className={styles.tableWrapper}>
            <h3 className={styles.sectionTitle}>Feature Ratios (%)</h3>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Trust Badge</th>
                  <th>Push Notif</th>
                  <th>New Msg</th>
                  <th>Public Acc</th>
                  <th>Email Verified</th>
                  <th>Google Acc</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((r) => (
                  <tr key={r.date}>
                    <td>{r.date.slice(0, 10)}</td>
                    <td>{(r.trustBadgeRatio * 100).toFixed(1)}%</td>
                    <td>
                      {(r.pushNotificationEnabledRatio * 100).toFixed(1)}%
                    </td>
                    <td>
                      {(r.newMessageEnabledRatio * 100).toFixed(1)}%
                    </td>
                    <td>
                      {(r.isAccountPublicRatio * 100).toFixed(1)}%
                    </td>
                    <td>
                      {(r.isEmailVerifiedRatio * 100).toFixed(1)}%
                    </td>
                    <td>
                      {(r.isGoogleAccountRatio * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.chartContainer}>
            <Line
              data={ratioDataset}
              options={{
                responsive: true,
                plugins: { legend: { position: "bottom" } },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => `${v}%` },
                  },
                },
              }}
            />
          </div>
        </section>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>📊 User Analytics Dashboard</h1>
      <div className={styles.toolbar}>
        <div className={styles.filters}>
          <div className={styles.filterItem}>
            <label>Region</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              {REGIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
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
        {region !== "all" && (
          <button
            className={styles.downloadButton}
            onClick={handleDownload}
            disabled={!data.length}
          >
            Download JSON
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.loader}>Loading analytics…</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : region === "all" ? (
        // All Regions 모드
        allData.map(({ region, analytics }) =>
          renderSection(region, analytics)
        )
      ) : (
        // 단일 리전 모드
        renderSection(region, data)
      )}
    </div>
  );
}
