// src/app/layout.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import Script from "next/script";
import { ConfigProvider } from "../context/ConfigContext";
import { I18nextProvider } from "react-i18next";
import i18n from "../config/i18n";
import ErrorBoundary from "../components/ErrorBoundary";
import MaintenanceModal from "../components/MaintenanceModal";
import PasswordExpiredModal from "../components/PasswordExpiredModal";
import axios from "axios";
import { getDistrictNameFromCoordinates } from "../utils/locationUtils";
import { useRouter, usePathname } from "next/navigation";
import Header from "../components/Header";
import "./globals.css";
import '../styles/react-calendar-overrides.css';
import Document, { Html, Head, Main, NextScript } from 'next/document';

// Next.js 폰트 설정 (예시)
import localFont from "next/font/local";
const pretendard = localFont({
  src: [
    { path: "../../public/assets/fonts/Pretendard-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/assets/fonts/Pretendard-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-pretendard",
});

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [maintenanceVisible, setMaintenanceVisible] = useState(false);
  const [passwordExpired, setPasswordExpired] = useState(false);
  const [showPasswordExpiredModal, setShowPasswordExpiredModal] = useState(false);

  const healthDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // localStorage는 클라이언트 전용이므로, useEffect 내에서 사용
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "https://beta.fcde.app";

  // 서버 상태 체크 (건강 체크)
  const checkServerHealth = async () => {
    try {
      await fetch(`${SERVER_URL}/healthWeb`);
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
        config.withCredentials = true;
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

  return (
    <html lang="en" className={pretendard.className}>
      <Head>
        {/* Basic */}
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="Personalized quizzes generated from your own conversations." />

        {/* Open Graph */}
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content="Abrody – AI Conversational Language Learning" />
        <meta property="og:description" content="Personalized quizzes generated from your own conversations." />
        <meta property="og:image"       content="https://website.fcde.app/og-image.png" />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url"         content="https://website.fcde.app/" />

        {/* Twitter Card */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Abrody – AI Conversational Language Learning" />
        <meta name="twitter:description" content="Personalized quizzes generated from your own conversations." />
        <meta name="twitter:image"       content="https://website.fcde.app/og-image.png" />
        <meta name="twitter:image:alt"   content="Abrody – AI Conversational Language Learning" />
      </Head>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=AW-17197212587"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'AW-17197212587');
        `}
      </Script>

      <Script id="gtag-conversion-snippet" strategy="afterInteractive">
        {`
          function gtag_report_conversion(url) {
            var callback = function() {
              if (typeof(url) !== 'undefined') {
                window.location = url;
              }
            };
            gtag('event', 'conversion', {
              'send_to': 'AW-17197212587/ejXLCPi7ptsaEKvHoohA',
              'value': 1.0,
              'currency': 'KRW',
              'event_callback': callback
            });
            return false;
          }
        `}
      </Script>

      <Script id="gtag-ios-conversion-snippet" strategy="afterInteractive">
        {`
          function gtag_report_conversion_ios(url) {
            var callback = function() {
              if (typeof(url) !== 'undefined') {
                window.location = url;
              }
            };
            gtag('event', 'conversion', {
              'send_to': 'AW-17197212587/YPrICMaop9saEKvHoohA',
              'value': 1.0,
              'currency': 'KRW',
              'event_callback': callback
            });
            return false;
          }
        `}
      </Script>

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
              {pathname !== "/posts" && <Header />}
              {/* 실제 콘텐츠 영역 */}
              <main>{children}</main>
            </I18nextProvider>
          </ErrorBoundary>
        </ConfigProvider>
      </body>
    </html>
  );
};

export default RootLayout;
