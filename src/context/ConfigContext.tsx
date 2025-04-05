// ConfigContext.tsx
import React, { createContext, useContext } from "react";
import config from "../config/config"; // config.json 대신 동적 config.ts를 불러옵니다.

interface Config {
  SERVER_URL: string;
  APP_VERSION: string;
  FACEBOOK_INTERSTITIAL_PLACEMENT_ID: string;
  FACEBOOK_BANNER_PLACEMENT_ID: string;
}

const ConfigContext = createContext<Config | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
