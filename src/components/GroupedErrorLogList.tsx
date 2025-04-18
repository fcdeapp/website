"use client";

import React, { useEffect, useState } from "react";
import { useConfig } from "../context/ConfigContext";
import axios from "axios";
import styles from "../styles/components/GroupedErrorLogList.module.css";

export interface GroupedLog {
  _id: string; // error message text
  count: number;
  logs: any[]; // array of error logs with the same error message
}

interface GroupedErrorLogListProps {
  region: string;
}

const PAGE_SIZE = 20;

const GroupedErrorLogList: React.FC<GroupedErrorLogListProps> = ({ region }) => {
  const { SERVER_URL } = useConfig();
  const [groupedLogs, setGroupedLogs] = useState<GroupedLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const paginatedLogs = groupedLogs.slice(0, page * PAGE_SIZE);

  const fetchGroupedLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${SERVER_URL}/api/logs/grouped?region=${region}`);
      setGroupedLogs(response.data);
    } catch (error) {
      console.error("Error fetching grouped logs:", error);
      window.alert("Failed to fetch grouped logs.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLogs = async (errorMessage: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete all logs for: "${errorMessage}"?`
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${SERVER_URL}/api/logs/deleteByMessage`, {
        headers: {
          "Content-Type": "application/json",
        },
        data: { region, errorMessage },
      });
      window.alert("Logs deleted successfully.");
      fetchGroupedLogs(); // refresh logs after deletion
    } catch (error) {
      console.error("Error deleting logs:", error);
      window.alert("Failed to delete logs.");
    }
  };

  useEffect(() => {
    fetchGroupedLogs();
  }, [SERVER_URL, region]);

  const handleLoadMore = () => {
    if (paginatedLogs.length < groupedLogs.length) {
      setPage((prev) => prev + 1);
    }
  };

  const toggleGroupExpand = (errorMessage: string) => {
    setExpandedGroup(expandedGroup === errorMessage ? null : errorMessage);
  };

  return (
    <div className={styles.container}>
      {loading ? (
        <div className={styles.loaderContainer}>
          <div className={styles.spinner}></div>
        </div>
      ) : paginatedLogs.length === 0 ? (
        <p className={styles.noDataText}>No logs available.</p>
      ) : (
        <>
          {paginatedLogs.map((item) => {
            const isExpanded = expandedGroup === item._id;
            return (
              <div key={item._id} className={styles.card}>
                <p className={styles.title}>Error Message:</p>
                <p className={styles.message}>{item._id}</p>
                <p className={styles.count}>Occurrences: {item.count}</p>
                <button
                  className={styles.toggleButton}
                  onClick={() => toggleGroupExpand(item._id)}
                >
                  {isExpanded ? "Hide Details" : "View Details"}
                </button>
                <button
                  className={styles.deleteButton}
                  onClick={() => handleDeleteLogs(item._id)}
                >
                  Delete All
                </button>
                {isExpanded && (
                  <div className={styles.innerList}>
                    {item.logs.map((log, index) => (
                      <div
                        key={log._id || `${log.errorDetails.timestamp}-${index}`}
                        className={styles.logItem}
                      >
                        <p className={styles.logText}>
                          Timestamp:{" "}
                          {new Date(log.errorDetails.timestamp).toLocaleString()}
                        </p>
                        <p className={styles.logText}>
                          Source: {log.errorDetails.source}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {paginatedLogs.length < groupedLogs.length && (
            <button className={styles.loadMoreButton} onClick={handleLoadMore}>
              Load More
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default GroupedErrorLogList;
