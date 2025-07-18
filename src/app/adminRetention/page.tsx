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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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
      .get<{ retentionData: RetentionData[] }>(`${SERVER_URL}/api/admin/stats/retention`, {
        withCredentials: true, // ✅ 인증 필요
      })
      .then((res) => setData(res.data.retentionData))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [SERVER_URL]);

  if (loading) return <div className={styles.loader}>Loading retention data...</div>;
  if (!data.length) return <div className={styles.loader}>No retention data available</div>;

  const dates = data.map(d => new Date(d.date).toISOString().split("T")[0]);
  const d7 = data.map(d => d.retentionRateD7 * 100);
  const d30 = data.map(d => d.retentionRateD30 * 100);

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Retention Analysis</h1>

      {/* 전체 리텐션 그래프 */}
      <div className={styles.chartCard}>
        <h3>Overall Retention (D7 & D30)</h3>
        <Line
          data={{
            labels: dates.reverse(),
            datasets: [
              { label: "D7 Retention (%)", data: d7.reverse(), borderColor: "#6C63FF", fill: false },
              { label: "D30 Retention (%)", data: d30.reverse(), borderColor: "#FF6B6B", fill: false },
            ],
          }}
          options={{ maintainAspectRatio: false }}
        />
      </div>

      {/* 리전별 리텐션 */}
      {data[0].byRegion.map((region, idx) => {
        const regionD7 = data.map(d => d.byRegion[idx]?.retentionRateD7 ? d.byRegion[idx].retentionRateD7 * 100 : 0);
        const regionD30 = data.map(d => d.byRegion[idx]?.retentionRateD30 ? d.byRegion[idx].retentionRateD30 * 100 : 0);
        return (
          <div key={region.region} className={styles.chartCard}>
            <h3>{region.region} Retention (D7 & D30)</h3>
            <Line
              data={{
                labels: dates.reverse(),
                datasets: [
                  { label: "D7 Retention (%)", data: regionD7.reverse(), borderColor: "#6C63FF", fill: false },
                  { label: "D30 Retention (%)", data: regionD30.reverse(), borderColor: "#FF6B6B", fill: false },
                ],
              }}
              options={{ maintainAspectRatio: false }}
            />
          </div>
        );
      })}
    </div>
  );
}
