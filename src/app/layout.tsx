// src/app/layout.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { ConfigProvider } from "../context/ConfigContext";
import { I18nextProvider } from "react-i18next";
import i18n from "../config/i18n";
import ErrorBoundary from "../components/ErrorBoundary";
import MaintenanceModal from "../components/MaintenanceModal";
import PasswordExpiredModal from "../components/PasswordExpiredModal";
import axios from "axios";
import { getDistrictNameFromCoordinates } from "../utils/locationUtils";
import { useRouter } from "next/navigation";
import "./globals.css";

// Next.js 폰트 설정 (예시)
import localFont from "next/font/local";
const pretendard = localFont({
  src: [
    { path: "../../public/assets/fonts/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-pretendard",
});

// StartPage 컴포넌트 (래퍼로 onFinish 전달)
import StartPage from "./startPage/page";

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  // 앱 전역 상태
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceVisible, setMaintenanceVisible] = useState(false);
  const [passwordExpired, setPasswordExpired] = useState(false);
  const [showPasswordExpiredModal, setShowPasswordExpiredModal] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const healthDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // localStorage는 클라이언트 전용이므로, useEffect 내에서 사용
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://yourserver.com";

  // 서버 상태 체크 (건강 체크)
  const checkServerHealth = async () => {
    try {
      await fetch(`${SERVER_URL}/health`);
      setMaintenanceVisible(false);
    } catch (err) {
      setMaintenanceVisible(true);
    }
  };

  const debouncedCheckServerHealth = () => {
    if (healthDebounceRef.current) clearTimeout(healthDebounceRef.current);
    healthDebounceRef.current = setTimeout(() => {
      checkServerHealth();
      healthDebounceRef.current = null;
    }, 5000);
  };

  // 앱 버전 및 업데이트 체크
  const checkAppVersion = async () => {
    try {
      const buildNumber = process.env.NEXT_PUBLIC_APP_BUILD || "1.0.0";
      const userId = localStorage.getItem("userId") || "anonymous";
      const res = await axios.post(`${SERVER_URL}/api/version/check`, {
        buildNumber,
        userId,
      });
      if (res.data.deactivationInfo && res.data.deactivationInfo.isDeactivated) {
        window.location.href = "/deactivatedUser";
        return;
      }
      if (res.data.passwordExpired) {
        setPasswordExpired(true);
        setShowPasswordExpiredModal(true);
      }
    } catch (err) {
      console.error("Version check error:", err);
    }
  };

  // 디바이스 정보 수집 (웹 대체 코드)
  const getDeviceInfo = async () => {
    const country = localStorage.getItem("currentCountry") || "Unknown";
    const region = (() => {
      switch (country) {
        case "Canada":
          return "ca-central-1";
        case "Australia":
          return "ap-southeast-2";
        case "United Kingdom":
          return "eu-west-2";
        default:
          return "ap-northeast-2";
      }
    })();
    return {
      userId: localStorage.getItem("userId") || "anonymous",
      deviceInfo: {
        deviceType: navigator.userAgent,
        os: navigator.platform,
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      },
      networkStatus: {
        isConnected: navigator.onLine,
        networkType: "Unknown",
      },
      locationData: {
        country,
        region,
      },
      additionalContext: {
        sessionId: localStorage.getItem("sessionId") || "Unknown",
      },
    };
  };

  // 에러 전송 함수
  const sendErrorLog = async (errorDetails: any) => {
    try {
      const deviceInfo = await getDeviceInfo();
      await axios.post(`${SERVER_URL}/api/logs/error`, {
        ...deviceInfo,
        errorDetails,
      });
    } catch (error) {
      console.error("Failed to send error log:", error);
    }
  };

  // 전역 에러 핸들러 설정 (브라우저 전역 에러 이벤트)
  useEffect(() => {
    const globalErrorHandler = (event: ErrorEvent) => {
      sendErrorLog({
        message: event.message,
        stack: event.error ? event.error.stack?.slice(0, 200) : "No stack trace",
        source: "Global",
        timestamp: new Date().toISOString(),
        isFatal: false,
      });
    };
    window.addEventListener("error", globalErrorHandler);
    return () => window.removeEventListener("error", globalErrorHandler);
  }, []);

  // axios 인터셉터: x-region 헤더 설정
  useEffect(() => {
    const setupAxiosInterceptors = async () => {
      let cachedRegion = localStorage.getItem("region");
      if (!cachedRegion) {
        try {
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
              async (position) => {
                const { latitude, longitude } = position.coords;
                const districtData = await getDistrictNameFromCoordinates(
                  latitude,
                  longitude,
                  SERVER_URL
                );
                const country = districtData ? districtData.country : "Unknown";
                cachedRegion =
                  country === "Canada"
                    ? "ca-central-1"
                    : country === "Australia"
                    ? "ap-southeast-2"
                    : country === "United Kingdom"
                    ? "eu-west-2"
                    : "ap-northeast-2";
                localStorage.setItem("region", cachedRegion);
              },
              (error) => {
                console.error("Geolocation error:", error);
                cachedRegion = "ap-northeast-2";
                localStorage.setItem("region", cachedRegion);
              }
            );
          } else {
            cachedRegion = "ap-northeast-2";
            localStorage.setItem("region", cachedRegion);
          }
        } catch (error) {
          console.error("Error determining region:", error);
          cachedRegion = "ap-northeast-2";
          localStorage.setItem("region", cachedRegion);
        }
      }
      axios.interceptors.request.use((config) => {
        config.headers["x-region"] = cachedRegion;
        return config;
      });
    };
    setupAxiosInterceptors();
  }, []);

  // 앱 초기화: 서버 상태 및 앱 버전 체크
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Promise.all([checkServerHealth(), checkAppVersion()]);
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    initializeApp();
  }, []);

  // 스플래시 화면 제거 (3초 후 제거하는 로직이 App.tsx와 유사할 수 있음)
  useEffect(() => {
    const splashTimer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(splashTimer);
  }, []);

  // 네트워크 상태 변화 감지
  useEffect(() => {
    const handleOnline = () => {
      if (healthDebounceRef.current) clearTimeout(healthDebounceRef.current);
      healthDebounceRef.current = setTimeout(() => {
        checkServerHealth();
        healthDebounceRef.current = null;
      }, 5000);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", () => setMaintenanceVisible(true));
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", () => setMaintenanceVisible(true));
    };
  }, []);

  // 기존의 /startPage로 이동하는 로직은 App.tsx와 로직을 맞추기 위해 제거합니다.
  // (localStorage 체크 등은 StartPage 내부에서 처리)

  return (
    <html lang="en" className={pretendard.className}>
      <body>
        <ConfigProvider>
          <ErrorBoundary>
            <I18nextProvider i18n={i18n}>
              {maintenanceVisible && (
                <MaintenanceModal
                  visible={maintenanceVisible}
                  onRetry={debouncedCheckServerHealth}
                />
              )}
              {showPasswordExpiredModal && (
                <PasswordExpiredModal
                  visible={showPasswordExpiredModal}
                  onPressChange={() => {
                    setShowPasswordExpiredModal(false);
                    window.location.href = "/signInLogIn?showChangePasswordModal=true";
                  }}
                  onClose={() => setShowPasswordExpiredModal(false)}
                />
              )}
              {/* 실제 콘텐츠 영역 */}
              <main>{children}</main>
              {/* splash overlay: 래퍼 컴포넌트로 StartPage에 onFinish 전달 */}
              {showSplash && (
                <div
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9999,
                  }}
                >
                  <StartPage onFinish={() => setShowSplash(false)} />
                </div>
              )}
            </I18nextProvider>
          </ErrorBoundary>
        </ConfigProvider>
      </body>
    </html>
  );
};

export default RootLayout;
