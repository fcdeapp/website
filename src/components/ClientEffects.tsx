// src/components/ClientEffects.tsx
"use client";

import { useEffect } from "react";
import axios from "axios";

export default function ClientEffects() {
  useEffect(() => {
    const region = localStorage.getItem("region") || "ap-northeast-2";
    const interceptor = axios.interceptors.request.use((config) => {
      config.headers["x-region"] = region;
      return config;
    });
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  return null;
}
