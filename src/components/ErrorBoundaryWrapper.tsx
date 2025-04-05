"use client";

import React from "react";
import axios from "axios";
import { useConfig } from "../../context/ConfigContext";
import styles from "../styles/components/ErrorBoundaryWrapper.module.css";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const ErrorBoundaryWrapper: React.FC<ErrorBoundaryProps> = ({ children }) => {
  const { SERVER_URL } = useConfig();

  class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    private errorLogSent: boolean = false;

    constructor(props: ErrorBoundaryProps) {
      super(props);
      this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error("Captured Error:", error);

      // 에러 로깅은 한 번만 시도
      if (!this.errorLogSent) {
        this.errorLogSent = true;
        axios
          .post(`${SERVER_URL}/api/logs/error`, {
            errorDetails: {
              message: error.toString(),
              stack: errorInfo.componentStack?.slice(0, 150),
              source: "React Component",
              timestamp: new Date().toISOString(),
            },
          })
          .catch((err) => {
            console.error("Failed to send error log:", err);
          });
      }
    }

    render() {
      if (this.state.hasError) {
        return (
          <div className={styles.container}>
            <span className={styles.text}>Something went wrong.</span>
          </div>
        );
      }
      return this.props.children;
    }
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default ErrorBoundaryWrapper;
