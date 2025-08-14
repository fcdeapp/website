// src/context/ConfigContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import baseConfig, {
  getServerUrlAsync,
  getDefaultServerUrl,
} from "../config/config";

interface Config {
  SERVER_URL: string;
  APP_VERSION: string;
  FACEBOOK_INTERSTITIAL_PLACEMENT_ID: string;
  FACEBOOK_BANNER_PLACEMENT_ID: string;
  FEATURE_UNDER_DEV: boolean;
  TEST_AD_MODE?: boolean;
}

const ConfigContext = createContext<Config | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 초기엔 SSR 안전한 기본 URL, 클라이언트 마운트 후 async 확정
  const [serverUrl, setServerUrl] = useState<string>(getDefaultServerUrl());

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resolved = await getServerUrlAsync();
        if (mounted) setServerUrl(resolved);
      } catch {
        // 실패 시 기본값 유지
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const value: Config = {
    SERVER_URL: serverUrl,
    APP_VERSION: baseConfig.APP_VERSION,
    FACEBOOK_INTERSTITIAL_PLACEMENT_ID:
      baseConfig.FACEBOOK_INTERSTITIAL_PLACEMENT_ID,
    FACEBOOK_BANNER_PLACEMENT_ID: baseConfig.FACEBOOK_BANNER_PLACEMENT_ID,
    FEATURE_UNDER_DEV: baseConfig.FEATURE_UNDER_DEV,
    TEST_AD_MODE: baseConfig.TEST_AD_MODE,
  };

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
};

export const useConfig = (): Config => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
