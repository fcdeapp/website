"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useConfig } from "../../context/ConfigContext";
import styles from "../../styles/pages/AdminDashboard.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type NewUserItem = { _id: string; count: number };
type CategoryItem = { _id: string; count: number };

interface CombinedStats {
  users: { total: number; dau: number; mau: number; newUsers: NewUserItem[] };
  reports: { total: number; inquiries: number };
  notifications: { total: number; recent: number };
  buddy: { groups: number; posts: number; chats: number };
  districtsChat: { total: number };
}

interface RegionStats {
  region: string;
  stats: {
    users: { total: number; dau: number; mau: number };
    reports: { total: number; inquiries: number };
    notifications: { total: number; recent: number };
    buddy: { groups: number; posts: number; chats: number };
    districtsChat: { total: number };
  };
}

interface DailyStats {
  date: string; // YYYY-MM-DD
  combined: CombinedStats;
  byRegion: RegionStats[];
  retentionRateD7: number;
  retentionRateD30: number;
  viralCoefficient: number;
  networkEffect: number;
  organicGrowthRate: number;
}

const sanitize = (n?: number) => (isNaN(n as number) || n == null ? 0 : n);
const pct = (n: number) => (isNaN(n) ? "N/A" : `${(n * 100).toFixed(1)}%`);

export default function AdminDashboard() {
  const { SERVER_URL } = useConfig();
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"combined" | "regional" | "history">("combined");

  useEffect(() => {
    axios
      .get<{ allStats: DailyStats[] }>(`${SERVER_URL}/api/admin/stats`, {
        withCredentials: true,
      })
      .then((res) => setStats(res.data.allStats || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [SERVER_URL]);

  if (loading) return <div className={styles.loader}>Loading dashboard…</div>;
  if (!stats.length) return <div className={styles.loader}>No data available</div>;

  const latest = stats[0];
  const dates = stats.map((d) => d.date);
  const dau = stats.map((d) => sanitize(d.combined.users.dau));
  const mau = stats.map((d) => sanitize(d.combined.users.mau));
  const d7 = stats.map((d) => sanitize(d.retentionRateD7 * 100));
  const d30 = stats.map((d) => sanitize(d.retentionRateD30 * 100));

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Admin Dashboard</h1>

      <nav className={styles.tabContainer}>
        {(["combined", "regional", "history"] as const).map((t) => (
          <button
            key={t}
            className={tab === t ? styles.activeTab : ""}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </nav>

      <section className={styles.content}>
        {tab === "combined" && (
          <>
            {/* Latest Summary Cards */}
            <div className={styles.cards}>
              <div className={styles.card}>
                <h2>User Stats</h2>
                <p>Total: {sanitize(latest.combined.users.total)}</p>
                <p>DAU: {sanitize(latest.combined.users.dau)}</p>
                <p>MAU: {sanitize(latest.combined.users.mau)}</p>
              </div>
              <div className={styles.card}>
                <h2>New Users (7d)</h2>
                {/* Inline small chart or value */}
                <p>
                  {latest.combined.users.newUsers
                    .map((u) => u.count)
                    .reduce((a, b) => a + b, 0)}
                </p>
              </div>
              <div className={styles.card}>
                <h2>Reports</h2>
                <p>Total: {sanitize(latest.combined.reports.total)}</p>
                <p>Inquiries: {sanitize(latest.combined.reports.inquiries)}</p>
              </div>
              <div className={styles.card}>
                <h2>Buddy & District</h2>
                <p>Groups: {sanitize(latest.combined.buddy.groups)}</p>
                <p>District Chats: {sanitize(latest.combined.districtsChat.total)}</p>
              </div>
            </div>

            {/* DAU / MAU Trends */}
            <div className={styles.chartCard}>
              <h3>DAU & MAU Trends</h3>
              <Line
                data={{
                  labels: dates,
                  datasets: [
                    { label: "DAU", data: dau, borderColor: "#6C63FF", fill: false },
                    { label: "MAU", data: mau, borderColor: "#FF6B6B", fill: false },
                  ],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>

            {/* Retention */}
            <div className={styles.chartCard}>
              <h3>Retention Rates</h3>
              <Line
                data={{
                  labels: dates,
                  datasets: [
                    {
                      label: "D7 Retention (%)",
                      data: d7,
                      borderColor: "#6C63FF",
                      fill: false,
                    },
                    {
                      label: "D30 Retention (%)",
                      data: d30,
                      borderColor: "#FF6B6B",
                      fill: false,
                    },
                  ],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>

            {/* New Users Chart */}
            <div className={styles.chartCard}>
              <h3>New Users Over Last 7 Days</h3>
              <Line
                data={{
                  labels: latest.combined.users.newUsers.map((u) => u._id),
                  datasets: [
                    {
                      label: "New Users",
                      data: latest.combined.users.newUsers.map((u) => sanitize(u.count)),
                      borderColor: "#120C3A",
                      fill: false,
                    },
                  ],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>

            {/* Reports / Inquiries Pie */}
            <div className={styles.chartCard}>
              <h3>Reports vs Inquiries</h3>
              <Pie
                data={{
                  labels: ["Reports", "Inquiries"],
                  datasets: [
                    {
                      data: [
                        sanitize(latest.combined.reports.total),
                        sanitize(latest.combined.reports.inquiries),
                      ],
                      backgroundColor: ["#FF6B6B", "#120C3A"],
                    },
                  ],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>

            {/* Additional Metrics */}
            <div className={styles.card}>
              <h3>Other Metrics</h3>
              <p>Viral Coefficient: {latest.viralCoefficient.toFixed(2)}</p>
              <p>Network Effect: {latest.networkEffect.toFixed(2)}</p>
              <p>Organic Growth: {pct(latest.organicGrowthRate)}</p>
            </div>
          </>
        )}

        {tab === "regional" && (
          <div className={styles.section}>
            {latest.byRegion.map((r) => (
              <div key={r.region} className={styles.card}>
                <h3>{r.region}</h3>
                <p>Users: {sanitize(r.stats.users.total)}</p>
                <p>DAU: {sanitize(r.stats.users.dau)}</p>
                <p>MAU: {sanitize(r.stats.users.mau)}</p>
                <p>Reports: {sanitize(r.stats.reports.total)}</p>
                <p>Inquiries: {sanitize(r.stats.reports.inquiries)}</p>
                <p>District Chats: {sanitize(r.stats.districtsChat.total)}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "history" && (
          <>
            {/* Total Users Over Time */}
            <div className={styles.chartCard}>
              <h3>Total Users Over Time</h3>
              <Line
                data={{
                  labels: dates,
                  datasets: [
                    {
                      label: "Total Users",
                      data: stats.map((d) => sanitize(d.combined.users.total)),
                      borderColor: "#120C3A",
                      fill: false,
                    },
                  ],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>

            {/* Viral & Network */}
            <div className={styles.chartCard}>
              <h3>Viral & Network Effect</h3>
              <Line
                data={{
                  labels: dates,
                  datasets: [
                    {
                      label: "Viral Coef",
                      data: stats.map((d) => sanitize(d.viralCoefficient)),
                      borderColor: "#6C63FF",
                      fill: false,
                    },
                    {
                      label: "Network Eff",
                      data: stats.map((d) => sanitize(d.networkEffect)),
                      borderColor: "#FF6B6B",
                      fill: false,
                    },
                  ],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>

            {/* Organic Growth */}
            <div className={styles.chartCard}>
              <h3>Organic Growth Over Time</h3>
              <Line
                data={{
                  labels: dates,
                  datasets: [
                    {
                      label: "Organic Growth (%)",
                      data: stats.map((d) => sanitize(d.organicGrowthRate * 100)),
                      borderColor: "#120C3A",
                      fill: false,
                    },
                  ],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
