"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useConfig } from "../context/ConfigContext";
import styles from "../styles/components/ErrorLogList.module.css";

export interface ErrorLog {
  _id: string;
  errorDetails: {
    message: string;
    stack?: string;
    source: string;
    timestamp: string;
  };
  deviceInfo: {
    deviceType: string;
    os: string;
  };
  locationData?: { region: string };
}

interface ErrorLogListProps {
  errorLogs: ErrorLog[];
}

const MAX_LENGTH = 100;
const PAGE_SIZE = 20;

interface ErrorLogItemProps {
  errorLog: ErrorLog;
  onDelete: (id: string) => void;
}

const ErrorLogItem: React.FC<ErrorLogItemProps> = ({ errorLog, onDelete }) => {
  const { SERVER_URL } = useConfig();
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  const renderContent = (content: string) => {
    if (expanded || content.length <= MAX_LENGTH) {
      return content;
    }
    return `${content.substring(0, MAX_LENGTH)}...`;
  };

  const deleteErrorLog = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this log?");
    if (!confirmed) return;

    try {
      setDeleting(true);
      const token = localStorage.getItem("token");
      const region = errorLog.locationData?.region || "default-region";
      await axios.delete(`${SERVER_URL}/api/logs/delete/${errorLog._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: { region },
      });
      window.alert("Error log deleted successfully.");
      onDelete(errorLog._id);
    } catch (error: any) {
      console.error("Error deleting log:", error);
      window.alert("Failed to delete the error log.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.card}>
      <div>
        <span className={styles.title}>Error Message:</span>
        <p className={styles.text}>{renderContent(errorLog.errorDetails.message)}</p>
      </div>
      {errorLog.errorDetails.stack && (
        <div>
          <span className={styles.title}>Stack Trace:</span>
          <p className={styles.text}>{renderContent(errorLog.errorDetails.stack)}</p>
        </div>
      )}
      <div>
        <span className={styles.title}>Source:</span>
        <p className={styles.text}>{errorLog.errorDetails.source}</p>
      </div>
      <div>
        <span className={styles.title}>Device Info:</span>
        <p className={styles.text}>
          {`${errorLog.deviceInfo.deviceType} - ${errorLog.deviceInfo.os}`}
        </p>
      </div>
      <div>
        <span className={styles.title}>Timestamp:</span>
        <p className={styles.text}>
          {new Date(errorLog.errorDetails.timestamp).toLocaleString()}
        </p>
      </div>
      <button className={styles.toggleButton} onClick={toggleExpand}>
        {expanded ? "Show Less" : "Show More"}
      </button>
      <button
        className={`${styles.deleteButton} ${deleting ? styles.disabledButton : ""}`}
        onClick={deleteErrorLog}
        disabled={deleting}
      >
        {deleting ? "Deleting..." : "Delete Log"}
      </button>
    </div>
  );
};

const ErrorLogList: React.FC<ErrorLogListProps> = ({ errorLogs }) => {
  const [page, setPage] = useState(1);
  const [logs, setLogs] = useState<ErrorLog[]>(errorLogs);

  useEffect(() => {
    setLogs(errorLogs);
    setPage(1);
  }, [errorLogs]);

  const paginatedLogs = logs.slice(0, page * PAGE_SIZE);

  const handleLoadMore = () => {
    if (paginatedLogs.length < logs.length) {
      setPage((prev) => prev + 1);
    }
  };

  const handleDelete = (id: string) => {
    setLogs((prevLogs) => prevLogs.filter((log) => log._id !== id));
  };

  return (
    <div className={styles.container}>
      {paginatedLogs.map((log) => (
        <ErrorLogItem key={log._id} errorLog={log} onDelete={handleDelete} />
      ))}
      {paginatedLogs.length < logs.length && (
        <button className={styles.loadMoreButton} onClick={handleLoadMore}>
          Load More
        </button>
      )}
    </div>
  );
};

export default ErrorLogList;
