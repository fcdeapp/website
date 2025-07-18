"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
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
import { useConfig } from "../../context/ConfigContext";
import styles from "../../styles/pages/AdminRetention.module.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface RegionRetention {
  region: string;
  retentionRateD7: number | null;
  retentionRateD30: number | null;
}

interface RetentionData {
  date: string;
  retentionRateD7: number;
  retentionRateD30: number;
  byRegion: RegionRetention[];
}

export default function AdminRetention() {
  const { SERVER_URL } = useConfig();
  const [data, setData] = useState<RetentionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get<{ retentionData: RetentionData[] }>(
        `${SERVER_URL}/api/admin/stats/retention`,
        { withCredentials: true }
      )
      .then((res) => setData(res.data.retentionData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [SERVER_URL]);

  if (loading)
    return <div className={styles.loader}>Loading retention data…</div>;
  if (!data.length)
    return <div className={styles.loader}>No retention data available</div>;

  /* ---------- Helpers ---------- */
  const dateLabels = data
    .map((d) => new Date(d.date).toISOString().split("T")[0])
    .slice()
    .reverse(); // 원본 훼손 방지

  const overallD7 = data.map((d) => d.retentionRateD7 * 100).slice().reverse();
  const overallD30 = data
    .map((d) => d.retentionRateD30 * 100)
    .slice()
    .reverse();

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Retention Analysis</h1>

      {/* ----------- 전체 리텐션 ----------- */}
      <div className={styles.card}>
        <h3>Overall (D7 vs. D30)</h3>
        <Line
          data={{
            labels: dateLabels,
            datasets: [
              {
                label: "D7 Retention (%)",
                data: overallD7,
                borderColor: "#6C63FF",
                tension: 0.3,
                fill: false,
              },
              {
                label: "D30 Retention (%)",
                data: overallD30,
                borderColor: "#FF6B6B",
                tension: 0.3,
                fill: false,
              },
            ],
          }}
          options={{ maintainAspectRatio: false }}
        />
      </div>

      {/* ----------- 리전별 ----------- */}
      <section className={styles.grid}>
        {data[0].byRegion.map((region, idx) => {
          const regionD7 = data
            .map((d) =>
              d.byRegion[idx]?.retentionRateD7 != null
                ? d.byRegion[idx].retentionRateD7 * 100
                : 0
            )
            .slice()
            .reverse();
          const regionD30 = data
            .map((d) =>
              d.byRegion[idx]?.retentionRateD30 != null
                ? d.byRegion[idx].retentionRateD30 * 100
                : 0
            )
            .slice()
            .reverse();

          return (
            <div key={region.region} className={styles.card}>
              <h3>{region.region}</h3>
              <Line
                data={{
                  labels: dateLabels,
                  datasets: [
                    {
                      label: "D7 (%)",
                      data: regionD7,
                      borderColor: "#6C63FF",
                      tension: 0.3,
                      fill: false,
                    },
                    {
                      label: "D30 (%)",
                      data: regionD30,
                      borderColor: "#FF6B6B",
                      tension: 0.3,
                      fill: false,
                    },
                  ],
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          );
        })}
      </section>
    </div>
  );
}
