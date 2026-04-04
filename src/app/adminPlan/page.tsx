"use client";

import { useState, useEffect, useMemo } from "react";
import Calendar from "react-calendar";
import axios from "axios";
import { useConfig } from "../../context/ConfigContext";
import WebFooter from "../../components/WebFooter";
import ScheduleModal from "../../components/ScheduleModal";
import styles from "../../styles/pages/AdminPlan.module.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export interface Schedule {
  _id: string;
  eventDate: string;
  location: string;
  title: string;
  description?: string;
  fileUrl?: string;
  tag?: string;
  amount?: string;
  supportFiles?: {
    fileUrl: string;
    fileKey: string;
  }[];
}

type ViewMode = "daily" | "weekly" | "monthly" | "analysis";
type AnalysisRangeMode = "monthly" | "cumulative";

const categories = [
  "Cloud Infrastructure",
  "AI Services",
  "Advertising & Marketing",
  "Software Licenses & Tools",
  "Office & Administrative",
  "Legal & Compliance",
  "Domain & Certificates",
  "Miscellaneous",
] as const;

type Category = (typeof categories)[number];

const colorMap: Record<Category, string> = {
  "Cloud Infrastructure": "#1f77b4",
  "AI Services": "#ff7f0e",
  "Advertising & Marketing": "#2ca02c",
  "Software Licenses & Tools": "#d62728",
  "Office & Administrative": "#9467bd",
  "Legal & Compliance": "#8c564b",
  "Domain & Certificates": "#e377c2",
  "Miscellaneous": "#7f7f7f",
};

const logoMap: Record<string, string> = {
  "Facebook Ads": "/logos/facebook-ads.png",
  "TikTok Promote": "/logos/tiktok-promote.png",
  "OpenAI ChatGPT": "/logos/openai-chatgpt.png",
  "M Studio AI": "/logos/m-studio-ai.png",
  "AIMLAPI": "/logos/aimlapi.png",
  "Anthropic": "/logos/anthropic.png",
  "Stability AI": "/logos/stability-ai.png",
  "Resemble AI": "/logos/resemble-ai.png",
  "Replicate": "/logos/replicate.png",

  "Amazon AWS": "/logos/amazon-aws.png",
  "Google Ads": "/logos/google-ads.png",
  "Google": "/logos/google-cloud.png",
  "MongoDB Cloud": "/logos/mongodb-cloud.png",

  "Dynadot": "/logos/dynadot.png",

  "Registration License Tax": "/logos/registration-license-tax.png",
  "Corporate 공동인증서": "/logos/corporate-certificate.png",
  "Court Administration Office": "/logos/court-administration-office.png",
  "Law Firm / Legal Service": "/logos/legal-service.png",

  "Office Lease": "/logos/office-lease.png",
  "Daiso": "/logos/daiso.png",
  "Printing & Scanning": "/logos/printing-scanning.png",

  "Microsoft": "/logos/microsoft.png",
  "Adobe": "/logos/adobe.png",
  "Expo": "/logos/expo.png",
  "Replit": "/logos/replit.png",
  "Parallels Desktop for Mac": "/logos/parallels.png",
  "Apple": "/logos/apple.png",
  "GitHub": "/logos/github.png",

  /* 현재 표에 raw 문자열로 남아 있는 것들 대응 */
  "애플코리아유한회사": "/logos/apple.png",
  "법원행정처": "/logos/court-administration-office.png",
  "아성다이소": "/logos/daiso.png",
  "구글애드워즈": "/logos/google-ads.png",
  "사무실계약": "/logos/office-lease.png",
  "법무법인미션": "/logos/legal-service.png",
  "용인시등록면허세": "/logos/registration-license-tax.png",
  "CLAUDE.AI": "/logos/anthropic.png",
  "REPLICATE": "/logos/replicate.png",
  "GITHUB, INC.": "/logos/github.png",
  "(주)더싼(인쇄/스캔)": "/logos/printing-scanning.png",
  "(주)더싼(인쇄/스캔) - 이미지 세 개 포함": "/logos/printing-scanning.png",
};

function getLogoSrc(itemName: string): string {
  return logoMap[itemName] || "/logos/default.png";
}

const LOCAL_STORAGE_KEY = "tagCategories_v2";

function normalizeTag(tag?: string): string {
  if (!tag) return "";

  const raw = tag.trim();
  const lower = raw.toLowerCase();
  const normalized = raw.normalize("NFC");
  const normalizedLower = normalized.toLowerCase();

  if (
    lower.includes("google digital inc") ||
    lower.includes("google* google digital") ||
    lower.includes("mountain view usa")
  ) {
    return "Google";
  }

  if (
    lower.includes("amazon_aws") ||
    lower.includes("aws") ||
    normalizedLower.includes("amazon aws")
  ) {
    return "Amazon AWS";
  }

  if (
    lower.includes("openai *chatgpt") ||
    lower.includes("openai") ||
    normalizedLower.includes("chatgpt")
  ) {
    return "OpenAI ChatGPT";
  }

  if (lower.includes("adobe")) {
    return "Adobe";
  }

  if (lower.includes("replit")) {
    return "Replit";
  }

  if (lower.includes("mongodbcloud") || lower.includes("mongodb")) {
    return "MongoDB Cloud";
  }

  if (lower.includes("anthropic")) {
    return "Anthropic";
  }

  if (lower.includes("claude.ai") || normalizedLower.includes("claude")) {
    return "Anthropic";
  }

  if (lower.includes("stability")) {
    return "Stability AI";
  }

  if (lower.includes("aimlapi")) {
    return "AIMLAPI";
  }

  if (lower.includes("m studio ai")) {
    return "M Studio AI";
  }

  if (lower.includes("resemble")) {
    return "Resemble AI";
  }

  if (lower.includes("replicate")) {
    return "Replicate";
  }

  if (lower.includes("650 industries") || lower.includes("expo")) {
    return "Expo";
  }

  if (lower.includes("microso")) {
    return "Microsoft";
  }

  if (lower.includes("github")) {
    return "GitHub";
  }

  if (lower.includes("parallels")) {
    return "Parallels Desktop for Mac";
  }

  if (lower.includes("dynadot")) {
    return "Dynadot";
  }

  if (lower.includes("apple") || normalized.includes("애플")) {
    return "Apple";
  }

  if (lower.includes("facebook") || lower.includes("facebk")) {
    return "Facebook Ads";
  }

  if (lower.includes("tiktok")) {
    return "TikTok Promote";
  }

  if (
    normalized.includes("구글애드워즈") ||
    normalized.includes("구글 애드워즈") ||
    normalized.includes("구글애드") ||
    normalized.includes("구글 광고")
  ) {
    return "Google Ads";
  }

  if (normalized.includes("사무실계약")) {
    return "Office Lease";
  }

  if (normalized.includes("등록면허세")) {
    return "Registration License Tax";
  }

  if (normalized.includes("용인시등록면허세")) {
    return "Registration License Tax";
  }

  if (normalized.includes("법원행정처")) {
    return "Court Administration Office";
  }

  if (normalized.includes("법인공동인증서")) {
    return "Corporate 공동인증서";
  }

  if (
    normalized.includes("법무법인") ||
    normalized.includes("미션")
  ) {
    return "Law Firm / Legal Service";
  }

  if (normalized.includes("더싼") || normalized.includes("인쇄") || normalized.includes("스캔")) {
    return "Printing & Scanning";
  }

  if (normalized.includes("다이소")) {
    return "Daiso";
  }

  return normalized;
}

function getDefaultCategory(normalizedTag: string): Category {
  const key = normalizedTag.toLowerCase();

  if (
    key.includes("google ads") ||
    key.includes("facebook ads") ||
    key.includes("tiktok promote")
  ) {
    return "Advertising & Marketing";
  }

  if (
    key.includes("amazon aws") ||
    key === "google" ||
    key.includes("mongodb cloud")
  ) {
    return "Cloud Infrastructure";
  }

  if (
    key.includes("openai") ||
    key.includes("anthropic") ||
    key.includes("stability") ||
    key.includes("aimlapi") ||
    key.includes("m studio ai") ||
    key.includes("resemble") ||
    key.includes("replicate")
  ) {
    return "AI Services";
  }

  if (
    key.includes("adobe") ||
    key.includes("replit") ||
    key.includes("expo") ||
    key.includes("microsoft") ||
    key.includes("parallels") ||
    key.includes("apple") ||
    key.includes("github")
  ) {
    return "Software Licenses & Tools";
  }

  if (
    key.includes("office lease") ||
    key.includes("daiso") ||
    key.includes("printing & scanning")
  ) {
    return "Office & Administrative";
  }

  if (
    key.includes("registration license tax") ||
    key.includes("court administration office") ||
    key.includes("corporate 공동인증서") ||
    key.includes("law firm / legal service")
  ) {
    return "Legal & Compliance";
  }

  if (key.includes("dynadot")) {
    return "Domain & Certificates";
  }

  return "Miscellaneous";
}

export default function AdminPlan() {
  const { SERVER_URL } = useConfig();

  const [date, setDate] = useState<Date>(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("daily");
  const [analysisRangeMode, setAnalysisRangeMode] = useState<AnalysisRangeMode>("monthly");
  const [openFileScheduleId, setOpenFileScheduleId] = useState<string | null>(null);

  const [tagCategories, setTagCategories] = useState<Record<string, Category>>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tagCategories));
    }
  }, [tagCategories]);

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

  const categorizedEntries = useMemo(() => {
    return schedules
      .filter((schedule) => schedule.amount && schedule.tag)
      .map((schedule) => {
        const normalizedTag = normalizeTag(schedule.tag);
        const defaultCategory = getDefaultCategory(normalizedTag);
        const selectedCategory = tagCategories[normalizedTag] || defaultCategory;
        const amountValue = parseFloat(schedule.amount || "0");

        return {
          ...schedule,
          normalizedTag,
          defaultCategory,
          category: selectedCategory,
          amountValue: isNaN(amountValue) ? 0 : amountValue,
        };
      })
      .filter((entry) => entry.amountValue > 0 && entry.normalizedTag);
  }, [schedules, tagCategories]);

  const tagAnalysisRows = useMemo(() => {
    const grouped: Record<string, { category: Category; item: string; total: number }> = {};

    categorizedEntries.forEach((entry) => {
      const groupKey = `${entry.category}__${entry.normalizedTag}`;

      if (!grouped[groupKey]) {
        grouped[groupKey] = {
          category: entry.category,
          item: entry.normalizedTag,
          total: 0,
        };
      }

      grouped[groupKey].total += entry.amountValue;
    });

    return Object.values(grouped).sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return b.total - a.total;
    });
  }, [categorizedEntries]);

  const uniqueNormalizedTags = useMemo(() => {
    return Array.from(
      new Set(
        schedules
          .filter((schedule) => schedule.tag)
          .map((schedule) => normalizeTag(schedule.tag))
          .filter(Boolean)
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [schedules]);

  const getCategoryForItem = (normalizedTag: string): Category => {
    return tagCategories[normalizedTag] || getDefaultCategory(normalizedTag);
  };

  const handleCategoryChange = (normalizedTag: string, category: Category) => {
    setTagCategories((prev) => ({
      ...prev,
      [normalizedTag]: category,
    }));
  };

  const groupSchedulesByDay = () => {
    const grouped: Record<string, Schedule[]> = {};
    schedules.forEach((schedule) => {
      const dayKey = new Date(schedule.eventDate).toLocaleDateString();
      if (!grouped[dayKey]) grouped[dayKey] = [];
      grouped[dayKey].push(schedule);
    });
    return grouped;
  };

  const groupSchedulesByWeek = () => {
    const grouped: Record<string, Schedule[]> = {};
    schedules.forEach((schedule) => {
      const dateObj = new Date(schedule.eventDate);
      const dayOfWeek = dateObj.getDay();
      const startOfWeek = new Date(dateObj);
      startOfWeek.setDate(dateObj.getDate() - dayOfWeek);
      const weekKey = startOfWeek.toLocaleDateString();

      if (!grouped[weekKey]) grouped[weekKey] = [];
      grouped[weekKey].push(schedule);
    });
    return grouped;
  };

  const groupSchedulesByMonth = () => {
    const grouped: Record<string, Schedule[]> = {};
    schedules.forEach((schedule) => {
      const dateObj = new Date(schedule.eventDate);
      const monthKey = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1)
        .toString()
        .padStart(2, "0")}`;

      if (!grouped[monthKey]) grouped[monthKey] = [];
      grouped[monthKey].push(schedule);
    });
    return grouped;
  };

  const getMonthlyAggregates = () => {
    const monthlyTotals: Record<string, number> = {};

    categorizedEntries.forEach((entry) => {
      const monthKey = new Date(entry.eventDate).toISOString().slice(0, 7);
      monthlyTotals[monthKey] = (monthlyTotals[monthKey] || 0) + entry.amountValue;
    });

    return monthlyTotals;
  };

  const getMonthlyCategoryAggregates = () => {
    const result: Record<string, Record<string, number>> = {};

    categorizedEntries.forEach((entry) => {
      const month = new Date(entry.eventDate).toISOString().slice(0, 7);

      if (!result[month]) result[month] = {};
      result[month][entry.category] = (result[month][entry.category] || 0) + entry.amountValue;
    });

    return result;
  };

  const getSortedMonthKeys = () => {
    return Array.from(
      new Set(
        categorizedEntries.map((entry) =>
          new Date(entry.eventDate).toISOString().slice(0, 7)
        )
      )
    ).sort((a, b) => a.localeCompare(b));
  };

  const getCumulativeMonthlyTotals = () => {
    const monthKeys = getSortedMonthKeys();
    const monthlyTotals = getMonthlyAggregates();

    let runningTotal = 0;
    const cumulative: Record<string, number> = {};

    monthKeys.forEach((month) => {
      runningTotal += monthlyTotals[month] || 0;
      cumulative[month] = runningTotal;
    });

    return cumulative;
  };

  const getCumulativeMonthlyCategoryAggregates = () => {
    const monthKeys = getSortedMonthKeys();
    const monthlyCategoryTotals = getMonthlyCategoryAggregates();

    const runningByCategory: Record<string, number> = {};
    const cumulative: Record<string, Record<string, number>> = {};

    monthKeys.forEach((month) => {
      cumulative[month] = {};

      categories.forEach((cat) => {
        runningByCategory[cat] =
          (runningByCategory[cat] || 0) + (monthlyCategoryTotals[month]?.[cat] || 0);
        cumulative[month][cat] = runningByCategory[cat];
      });
    });

    return cumulative;
  };

  const getAllTimeCategoryTotals = () => {
    const totals: Record<string, number> = {};

    categorizedEntries.forEach((entry) => {
      totals[entry.category] = (totals[entry.category] || 0) + entry.amountValue;
    });

    return totals;
  };

  let groupedSchedules: Record<string, Schedule[]> = {};
  if (viewMode === "daily") {
    groupedSchedules = groupSchedulesByDay();
  } else if (viewMode === "weekly") {
    groupedSchedules = groupSchedulesByWeek();
  } else if (viewMode === "monthly") {
    groupedSchedules = groupSchedulesByMonth();
  }

  const monthlyAggregates = getMonthlyAggregates();
  const monthlyCategoryAggregates = getMonthlyCategoryAggregates();
  const cumulativeMonthlyAggregates = getCumulativeMonthlyTotals();
  const cumulativeMonthlyCategoryAggregates = getCumulativeMonthlyCategoryAggregates();
  const allTimeCategoryTotals = getAllTimeCategoryTotals();

  const analysisMonthKeys = (
    analysisRangeMode === "monthly"
      ? Object.keys(monthlyAggregates)
      : Object.keys(cumulativeMonthlyAggregates)
  ).sort((a, b) => a.localeCompare(b));

  const analysisTotals =
    analysisRangeMode === "monthly"
      ? monthlyAggregates
      : cumulativeMonthlyAggregates;

  const analysisCategoryAggregates =
    analysisRangeMode === "monthly"
      ? monthlyCategoryAggregates
      : cumulativeMonthlyCategoryAggregates;

  const monthlyChartData = {
    labels: analysisMonthKeys,
    datasets: categories.map((cat) => ({
      label: cat,
      data: analysisMonthKeys.map(
        (month) => analysisCategoryAggregates[month]?.[cat] || 0
      ),
      backgroundColor: colorMap[cat],
    })),
  };

  const pieChartData = {
    labels: Array.from(categories),
    datasets: [
      {
        data: categories.map((cat) => allTimeCategoryTotals[cat] || 0),
        backgroundColor: categories.map((cat) => colorMap[cat]),
        borderWidth: 1,
        borderColor: "#ffffff",
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: { position: "right" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const label = ctx.label || "";
            const value = ctx.parsed || 0;
            return `${label}: ${value.toLocaleString()} KRW`;
          },
        },
      },
    },
  };

  const handleCloseModal = () => {
    setEditingSchedule(null);
    setModalOpen(false);
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setModalOpen(true);
  };

  const toggleFileView = (scheduleId: string) => {
    if (openFileScheduleId === scheduleId) {
      setOpenFileScheduleId(null);
    } else {
      setOpenFileScheduleId(scheduleId);
    }
  };

  const getTotalFileCount = (schedule: Schedule) => {
    let count = 0;

    if (schedule.fileUrl && schedule.fileUrl.trim() !== "") count++;

    if (schedule.supportFiles && schedule.supportFiles.length > 0) {
      count += schedule.supportFiles.filter(
        (sf) => sf.fileUrl && sf.fileUrl.trim() !== ""
      ).length;
    }

    return count;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitleWrap}>
          <h1 className={styles.headerTitleTop}>Admin Calendar</h1>
          <p className={styles.headerTitleBottom}>Schedule Manager</p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.topControls}>
          <div className={styles.controlRow}>
            <div className={styles.calendar}>
              <Calendar
                onChange={(value) => {
                  if (value instanceof Date) {
                    setDate(value);
                  }
                }}
                value={date}
              />
            </div>

            <div className={styles.viewToggleVertical}>
              <button
                onClick={() => setViewMode("daily")}
                className={`${styles.toggleButton} ${
                  viewMode === "daily" ? styles.active : ""
                }`}
              >
                Daily View
              </button>

              <button
                onClick={() => setViewMode("weekly")}
                className={`${styles.toggleButton} ${
                  viewMode === "weekly" ? styles.active : ""
                }`}
              >
                Weekly View
              </button>

              <button
                onClick={() => setViewMode("monthly")}
                className={`${styles.toggleButton} ${
                  viewMode === "monthly" ? styles.active : ""
                }`}
              >
                Monthly View
              </button>

              <button
                onClick={() => setViewMode("analysis")}
                className={`${styles.toggleButton} ${
                  viewMode === "analysis" ? styles.active : ""
                }`}
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

              {Object.keys(groupedSchedules)
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
                .map((groupKey) => (
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
                            <span className={styles.scheduleLocation}>
                              {schedule.location}
                            </span>
                          </div>

                          {schedule.description && (
                            <p className={styles.scheduleDescription}>
                              {schedule.description}
                            </p>
                          )}

                          {schedule.tag && (
                            <p className={styles.scheduleTag}>Tag: {schedule.tag}</p>
                          )}

                          {schedule.amount && parseFloat(schedule.amount) > 0 && (
                            <p className={styles.scheduleAmount}>
                              Amount: {parseFloat(schedule.amount).toLocaleString()} KRW
                            </p>
                          )}

                          {(schedule.fileUrl ||
                            (schedule.supportFiles &&
                              schedule.supportFiles.length > 0)) && (
                            <p className={styles.scheduleFile}>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  toggleFileView(schedule._id);
                                }}
                              >
                                View File ({getTotalFileCount(schedule)}{" "}
                                {getTotalFileCount(schedule) > 1 ? "files" : "file"})
                              </a>
                            </p>
                          )}

                          {openFileScheduleId === schedule._id && (
                            <div className={styles.inlineFileList}>
                              <ul>
                                {schedule.fileUrl && schedule.fileUrl.trim() !== "" && (
                                  <li>
                                    <a
                                      href={schedule.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      Main File
                                    </a>
                                  </li>
                                )}

                                {schedule.supportFiles &&
                                  schedule.supportFiles.map((file, index) =>
                                    file.fileUrl && file.fileUrl.trim() !== "" ? (
                                      <li key={index}>
                                        <a
                                          href={file.fileUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
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
            <div className={styles.analysisContainer}>
              <h2 className={styles.sectionTitle}>Monthly Payment Analysis</h2>

              <div className={styles.analysisModeToggle}>
                <button
                  type="button"
                  onClick={() => setAnalysisRangeMode("monthly")}
                  className={`${styles.toggleButton} ${
                    analysisRangeMode === "monthly" ? styles.active : ""
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setAnalysisRangeMode("cumulative")}
                  className={`${styles.toggleButton} ${
                    analysisRangeMode === "cumulative" ? styles.active : ""
                  }`}
                >
                  Cumulative
                </button>
              </div>

              <p className={styles.analysisSubtitle}>
                {analysisRangeMode === "monthly"
                  ? "Shows category totals for each individual month."
                  : "Shows cumulative category totals up to each month."}
              </p>

              {Object.entries(analysisTotals).filter(([, total]) => total > 0).length === 0 ? (
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
                      {Object.entries(analysisTotals)
                        .filter(([, total]) => total > 0)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([month, total]) => (
                          <tr key={month}>
                            <td>{month}</td>
                            <td>{total.toLocaleString()} KRW</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>

                  <div className={styles.chartContainer}>
                    <Bar
                      data={monthlyChartData}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: "top" },
                          title: {
                            display: true,
                            text:
                              analysisRangeMode === "monthly"
                                ? "Monthly Spend by Category"
                                : "Cumulative Spend by Category",
                          },
                        },
                        scales: {
                          x: { stacked: true },
                          y: { stacked: true },
                        },
                      }}
                    />
                  </div>
                </>
              )}

              <h2 className={styles.sectionTitle}>Grouped Payment Analysis</h2>
              <p className={styles.analysisSubtitle}>
                Same normalized item names are merged into one row in analysis mode.
              </p>

              {tagAnalysisRows.length === 0 ? (
                <p className={styles.noSchedule}>No grouped payment data available.</p>
              ) : (
                <table className={styles.analysisTable}>
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Logo</th>
                      <th>Item</th>
                      <th>Total Amount (KRW)</th>
                      <th>Change Category</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tagAnalysisRows.map((row) => (
                      <tr key={`${row.category}-${row.item}`}>
                        <td>
                          <span
                            className={styles.categoryBadge}
                            style={{ backgroundColor: colorMap[row.category] }}
                          >
                            {row.category}
                          </span>
                        </td>
                        <td>
                          <img
                            src={getLogoSrc(row.item)}
                            alt={row.item}
                            className={styles.itemLogo}
                          />
                        </td>
                        <td>
                          <div className={styles.itemWithLogo}>
                            <span className={styles.itemName}>{row.item}</span>
                          </div>
                        </td>
                        <td>{row.total.toLocaleString()} KRW</td>
                        <td>
                          <select
                            className={styles.categorySelect}
                            value={getCategoryForItem(row.item)}
                            onChange={(e) =>
                              handleCategoryChange(row.item, e.target.value as Category)
                            }
                          >
                            {categories.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              <h2 className={styles.sectionTitle}>Category Distribution</h2>

              {Object.values(allTimeCategoryTotals).every((value) => value === 0) ? (
                <p className={styles.noSchedule}>No category distribution data available.</p>
              ) : (
                <div className={styles.chartContainer}>
                  <Pie data={pieChartData} options={pieOptions} />
                </div>
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
                  amount: editingSchedule.amount ?? "",
                }
              : undefined
          }
        />
      )}

      <WebFooter />
    </div>
  );
}