"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import { useTranslation } from "react-i18next";

import styles from "../../styles/pages/AdminDashboard.module.css";

// 앱에서 사용하던 컴포넌트/오버레이 (웹에서도 동일하게 임포트)
import ProfileWithFlag from "../../components/ProfileWithFlag";
import WebFooter from "../../components/WebFooter";
import Licenses from "../../components/Licenses";
import HobbiesSelectionOverlay from "../../overlays/HobbiesSelectionOverlay";
import SkillsSelectionOverlay from "../../overlays/SkillsSelectionOverlay";

// 국가 및 언어 플래그 (앱과 동일한 데이터)
import countryFlags from "../../constants/countryFlags";
import languageFlags from "../../constants/languageFlags";

// Chart.js 컴포넌트 등록
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

// ------------------------ 타입 정의 ------------------------
export interface UserResponse {
  userId: string | null;
  profileImage: string | null;
  profileThumbnail: string | null;
  nickname: string | null;
  isAccountPublic: boolean;
  newMessageEnabled: boolean;
  originCountry: string | null;
  mainLanguage: string | null;
  learningLanguage: string[] | null;
  currentCountry: string | null;
  currentCity: string | null;
  hobbies: string[] | null;
  skills: string[] | null;
  description: string | null;
  trustBadge: boolean;
}

type CombinedStats = {
  users: {
    total: number;
    dau: number;
    mau: number;
    newUsers: { _id: string; count: number }[];
  };
  reports: {
    total: number;
    inquiries: number;
  };
  notifications: {
    total: number;
    recent: number;
  };
  posts: {
    total: number;
    withComments: number;
    withLikes: number;
    perCategory: { _id: string; count: number }[];
  };
  chats: {
    total: number;
    active: number;
  };
  buddy: {
    groups: number;
    posts: number;
    chats: number;
  };
  districtsChat: {
    total: number;
  };
};

type RegionStats = {
  region: string;
  stats: {
    users: {
      total: number;
      dau: number;
      mau: number;
      newUsers: { _id: string; count: number }[];
    };
    reports: {
      total: number;
      inquiries: number;
    };
    notifications: {
      total: number;
      recent: number;
    };
    posts: {
      total: number;
      withComments: number;
      withLikes: number;
      perCategory: { _id: string; count: number }[];
    };
    chats: {
      total: number;
      active: number;
    };
    buddy: {
      groups: number;
      posts: number;
      chats: number;
    };
    districtsChat: {
      total: number;
    };
  };
};

type DailyStats = {
  _id?: string;
  date: string; // "YYYY-MM-DD" format
  combined: CombinedStats;
  byRegion: RegionStats[];
  retentionRateD7: number;
  retentionRateD30: number;
  viralCoefficient: number;
  networkEffect: number;
  organicGrowthRate: number;
};

// Quick Menu Item (Reports 페이지에서 사용할 수 있음)
interface QuickMenuItem {
  title: string;
  route: string;
}

// ------------------------ 상태 및 효과 ------------------------

// 헤더 스크롤에 따른 오프셋 상태 (헤더가 90px에서 점진적으로 위로 이동하며 스티키)
const AdminDashboard: React.FC = () => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();

  // 헤더 관련 상태
  const [headerOffset, setHeaderOffset] = useState(90);
  const [headerOpaque, setHeaderOpaque] = useState(false);
  const [showLicenses, setShowLicenses] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post(`${SERVER_URL}/authStatus/logout`, {}, { withCredentials: true });
      localStorage.removeItem("isLoggedIn");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };  

  useEffect(() => {
    const onScroll = () => {
      // 스크롤Y가 0 ~ 90px인 경우 90 - scrollY, 90px 이상이면 0
      setHeaderOffset(Math.max(90 - window.scrollY, 0));
      setHeaderOpaque(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 메인 탭 (Dashboard vs Reports)
  const [mainTab, setMainTab] = useState<"dashboard" | "reports">("dashboard");

  // Dashboard 데이터 상태 (DailyStats)
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [combinedData, setCombinedData] = useState<CombinedStats | null>(null);
  const [regionData, setRegionData] = useState<RegionStats[] | null>(null);
  const [retentionRateD7, setRetentionRateD7] = useState<number>(0);
  const [retentionRateD30, setRetentionRateD30] = useState<number>(0);
  const [viralCoefficient, setViralCoefficient] = useState<number>(0);
  const [networkEffect, setNetworkEffect] = useState<number>(0);
  const [organicGrowthRate, setOrganicGrowthRate] = useState<number>(0);

  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // Reports 관련 데이터 상태
  const [selectedCategory, setSelectedCategory] = useState("error");
  const defaultRegions = ["All Regions", "ap-northeast-2", "ap-southeast-2"];
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [reportsData, setReportsData] = useState<any[]>([]);
  const [disabledUsersData, setDisabledUsersData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(true);

  // 기타 Reports 관련 상태
  const [createNotificationModalVisible, setCreateNotificationModalVisible] = useState(false);
  const [responseModalVisible, setResponseModalVisible] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [currentResponseItem, setCurrentResponseItem] = useState<any>(null);

  // Dashboard sub 탭 (Combined / Regional / History)
  const [dashboardTab, setDashboardTab] = useState<"combined" | "regional" | "history">("combined");

  // 데이터 fetch: Dashboard (DailyStats)
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingDashboard(true);
      try {
        const res = await axios.get(`${SERVER_URL}/api/admin/stats`);
        const allStats: DailyStats[] = res.data.allStats || [];
        setDailyStats(allStats);
        if (allStats.length > 0) {
          const latest = allStats[0];
          setCombinedData(latest.combined);
          setRegionData(latest.byRegion);
          setRetentionRateD7(latest.retentionRateD7);
          setRetentionRateD30(latest.retentionRateD30);
          setViralCoefficient(latest.viralCoefficient);
          setNetworkEffect(latest.networkEffect);
          setOrganicGrowthRate(latest.organicGrowthRate);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingDashboard(false);
      }
    };
    if (mainTab === "dashboard") {
      fetchDashboardData();
    }
  }, [SERVER_URL, mainTab]);

  // 데이터 fetch: Reports
  useEffect(() => {
    const fetchReportsData = async () => {
      setLoadingReports(true);
      try {
        if (["error", "report", "inquiry"].includes(selectedCategory)) {
          const res = await axios.get(`${SERVER_URL}/api/admin/reports`);
          setReportsData(res.data.regions || []);
        } else if (selectedCategory === "notifications") {
          let url = `${SERVER_URL}/api/admin/nl/adminNotifications`;
          if (selectedRegion !== "All Regions") {
            url += `?region=${selectedRegion}`;
          }
          const res = await axios.get(url);
          setNotifications(res.data || []);
        } else if (selectedCategory === "disabledUsers") {
          let url = `${SERVER_URL}/api/admin/users/disabled`;
          if (selectedRegion !== "All Regions") {
            url += `?region=${selectedRegion}`;
          }
          const res = await axios.get(url);
          setDisabledUsersData(res.data.regions || []);
        }
      } catch (error) {
        console.error("Error fetching reports data:", error);
      } finally {
        setLoadingReports(false);
      }
    };
    if (mainTab === "reports") {
      fetchReportsData();
    }
  }, [SERVER_URL, selectedCategory, selectedRegion, mainTab]);

  // Helper: 숫자 확인 및 포맷
  const sanitizeNumber = (num: number | undefined | null): number => {
    return isNaN(num as number) || num == null ? 0 : num;
  };
  const formatPercentage = (num: number): string => {
    return isNaN(num) || num === Infinity ? "N/A" : `${num.toFixed(1)}%`;
  };

  // 메인 탭 전환 핸들러
  const switchMainTab = (tab: "dashboard" | "reports") => {
    setMainTab(tab);
  };

  // Dashboard 렌더링 함수
  const renderDashboard = () => {
    if (loadingDashboard) {
      return <div className={styles.loader}>Loading Dashboard...</div>;
    }
    if (!combinedData) {
      return <div className={styles.error}>No dashboard data available</div>;
    }

    // historyData: 최신 데이터부터 시작하여 오름차순으로 변환
    const historyData = dailyStats.length > 0 ? [...dailyStats].reverse() : [];
    const dateLabels = historyData.map(ds => ds.date.split("T")[0]);
    const dauData = historyData.map(ds => sanitizeNumber(ds.combined.users.dau));
    const mauData = historyData.map(ds => sanitizeNumber(ds.combined.users.mau));
    const d7Data = historyData.map(ds => (isNaN(ds.retentionRateD7 * 100) ? 0 : ds.retentionRateD7 * 100));
    const d30Data = historyData.map(ds => (isNaN(ds.retentionRateD30 * 100) ? 0 : ds.retentionRateD30 * 100));

    return (
      <div className={styles.dashboardSection}>
        <div className={styles.card}>
          <h2>User Statistics</h2>
          <p>Total Users: {sanitizeNumber(combinedData.users.total)}</p>
          <p>DAU: {sanitizeNumber(combinedData.users.dau)}</p>
          <p>MAU: {sanitizeNumber(combinedData.users.mau)}</p>
        </div>
        <div className={styles.chartCard}>
          <h3>DAU & MAU Trends</h3>
          <Line
            data={{
              labels: dateLabels,
              datasets: [
                { label: "DAU", data: dauData, borderColor: "#6C63FF", fill: false },
                { label: "MAU", data: mauData, borderColor: "#FF6B6B", fill: false }
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
        <div className={styles.chartCard}>
          <h3>Retention Rates</h3>
          <Line
            data={{
              labels: dateLabels,
              datasets: [
                { label: "D7 Retention (%)", data: d7Data, borderColor: "#6C63FF", fill: false },
                { label: "D30 Retention (%)", data: d30Data, borderColor: "#FF6B6B", fill: false }
              ],
            }}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
        <div className={styles.card}>
          <h3>Additional Metrics</h3>
          <p>D7 Retention Rate: {formatPercentage(retentionRateD7 * 100)}</p>
          <p>D30 Retention Rate: {formatPercentage(retentionRateD30 * 100)}</p>
          <p>Viral Coefficient: {isNaN(viralCoefficient) ? "N/A" : viralCoefficient.toFixed(2)}</p>
          <p>Network Effect: {isNaN(networkEffect) ? "N/A" : networkEffect.toFixed(2)}</p>
          <p>Organic Growth: {formatPercentage(organicGrowthRate * 100)}</p>
        </div>
      </div>
    );
  };

  // Reports 렌더링 함수
  const renderReports = () => {
    if (loadingReports) {
      return <div className={styles.loader}>Loading Reports...</div>;
    }

    if (selectedCategory === "error" || selectedCategory === "report" || selectedCategory === "inquiry") {
      let itemsToDisplay: any[] = [];
      if (selectedRegion === "All Regions") {
        reportsData.forEach(regionItem => {
          if (selectedCategory === "error") {
            itemsToDisplay = itemsToDisplay.concat(regionItem.errorLogs || []);
          } else if (selectedCategory === "report") {
            itemsToDisplay = itemsToDisplay.concat(
              (regionItem.reports || []).filter((r: any) => r.type === "report")
            );
          } else if (selectedCategory === "inquiry") {
            itemsToDisplay = itemsToDisplay.concat(
              (regionItem.reports || []).filter((r: any) => r.type === "inquiry")
            );
          }
        });
      } else {
        const currentRegionData = reportsData.find(item => item.region === selectedRegion);
        if (currentRegionData) {
          if (selectedCategory === "error") {
            itemsToDisplay = currentRegionData.errorLogs || [];
          } else if (selectedCategory === "report") {
            itemsToDisplay = (currentRegionData.reports || []).filter((r: any) => r.type === "report");
          } else if (selectedCategory === "inquiry") {
            itemsToDisplay = (currentRegionData.reports || []).filter((r: any) => r.type === "inquiry");
          }
        }
      }
      return (
        <div className={styles.reportsContainer}>
          {itemsToDisplay.length === 0 ? (
            <div className={styles.noDataText}>No data available for selected category and region.</div>
          ) : (
            itemsToDisplay.map((item, index) => (
              <div key={index} className={styles.reportItem}>
                <p>{item.message}</p>
                <button onClick={() => alert("Respond functionality here")}>Respond</button>
              </div>
            ))
          )}
        </div>
      );
    } else if (selectedCategory === "notifications") {
      return (
        <div className={styles.reportsContainer}>
          {notifications.length === 0 ? (
            <div className={styles.noDataText}>No notifications available.</div>
          ) : (
            notifications.map((notification, index) => (
              <div key={index} className={styles.reportItem}>
                <p>Title: {notification.title}</p>
                <p>Message: {notification.message}</p>
                <p>Type: {notification.type}</p>
              </div>
            ))
          )}
        </div>
      );
    } else if (selectedCategory === "disabledUsers") {
      let usersData: any[] = [];
      if (selectedRegion === "All Regions") {
        usersData = disabledUsersData.reduce(
          (acc: any[], regionItem: any) => acc.concat(regionItem.disabledUsers || []),
          []
        );
      } else {
        const current = disabledUsersData.find(item => item.region === selectedRegion);
        usersData = current?.disabledUsers || [];
      }
      return (
        <div className={styles.reportsContainer}>
          {usersData.length === 0 ? (
            <div className={styles.noDataText}>No disabled users found.</div>
          ) : (
            usersData.map((user, index) => (
              <div key={index} className={styles.reportItem}>
                <p>{user.nickname} ({user.email})</p>
              </div>
            ))
          )}
        </div>
      );
    }
    return null;
  };

  // 메인 뒤로 가기 핸들러
  const handleGoBack = () => {
    router.back();
  };

  // 계산된 지역 옵션 (보고서 드롭다운)
  const computedRegions =
    ["error", "report", "inquiry"].includes(selectedCategory)
      ? reportsData && reportsData.length > 0
        ? reportsData.map((item) => item.region)
        : defaultRegions
      : selectedCategory === "disabledUsers"
      ? disabledUsersData && disabledUsersData.length > 0
        ? disabledUsersData.map((item) => item.region)
        : defaultRegions
      : defaultRegions;
  const regionOptions = ["All Regions", ...Array.from(new Set(computedRegions))];

  return (
    <div className={styles.container}>
      {/* Header with sticky effect */}
      <header
        className={`${styles.header} ${headerOpaque ? styles.opaque : ""}`}
        style={{ top: `${headerOffset}px` }}
      >
        <button className={styles.backButton} onClick={handleGoBack}>
          <img src="/assets/back-light.png" alt="Back" width={24} height={24} />
        </button>
        <h1 className={styles.headerTitle}>{t("dashboard")}</h1>
        <button className={styles.logoutButton}>
          {t("more")}
        </button>
      </header>

      {/* Main tab navigation */}
      <div className={styles.mainTabContainer}>
        <button
          className={`${styles.mainTabButton} ${mainTab === "dashboard" ? styles.activeTab : ""}`}
          onClick={() => switchMainTab("dashboard")}
        >
          Dashboard
        </button>
        <button
          className={`${styles.mainTabButton} ${mainTab === "reports" ? styles.activeTab : ""}`}
          onClick={() => switchMainTab("reports")}
        >
          Reports
        </button>
      </div>

      {/* Content based on main tab */}
      {mainTab === "dashboard" ? (
        <div className={styles.dashboardContent}>{renderDashboard()}</div>
      ) : (
        <div className={styles.reportsContent}>
          <div className={styles.pickerContainer}>
            <select
              className={styles.picker}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="error">Error Logs</option>
              <option value="report">Reports</option>
              <option value="inquiry">Inquiries</option>
              <option value="notifications">Notifications</option>
              <option value="disabledUsers">Disabled Users</option>
            </select>
            <select
              className={styles.picker}
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {regionOptions.map(region => (
                <option key={region} value={region}>
                  {region === "All Regions" ? "All Regions" : region}
                </option>
              ))}
            </select>
          </div>
          {renderReports()}
        </div>
      )}

      <WebFooter />

      {/* Licenses Modal */}
      {showLicenses && (
        <div className={styles.modalOverlay} onClick={() => setShowLicenses(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <Licenses onClose={() => setShowLicenses(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
