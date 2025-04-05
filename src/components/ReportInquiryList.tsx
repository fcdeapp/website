"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/ReportInquiryList.module.css";

export interface ReportInquiryItem {
  _id: string;
  type: string;
  reason: string;
  reportedAt: string;
  userId: string;
  postId?: string;
  createdAt: string;
  updatedAt: string;
  notificationResponse?: {
    title: string;
    message: string;
    sentAt: string;
  };
}

export interface ReportInquiryListProps {
  data: ReportInquiryItem[];
  onRespond: (item: ReportInquiryItem) => void;
}

const ReportInquiryList: React.FC<ReportInquiryListProps> = ({ data, onRespond }) => {
  const { t } = useTranslation();
  const [expandedItems, setExpandedItems] = useState<{ [key: string]: boolean }>({});

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderItem = (item: ReportInquiryItem) => {
    const isExpanded = expandedItems[item._id] || false;

    return (
      <div key={item._id} className={styles.card}>
        <p className={styles.cardTitle}>Type: {item.type.toUpperCase()}</p>
        <p className={styles.cardText}>Reason: {item.reason}</p>
        <p className={styles.cardText}>
          Reported At: {new Date(item.reportedAt).toLocaleString()}
        </p>
        <p className={styles.cardText}>User ID: {item.userId}</p>
        {item.type === "report" && item.postId && (
          <p className={styles.cardText}>Post ID: {item.postId}</p>
        )}
        {isExpanded && (
          <div className={styles.expandedContent}>
            <p className={styles.cardText}>
              Created At: {new Date(item.createdAt).toLocaleString()}
            </p>
            <p className={styles.cardText}>
              Updated At: {new Date(item.updatedAt).toLocaleString()}
            </p>
          </div>
        )}
        <div className={styles.buttonRow}>
          <button
            className={styles.toggleButton}
            onClick={() => toggleExpand(item._id)}
          >
            {isExpanded ? "Collapse" : "Expand"}
          </button>
          {!item.notificationResponse && (
            <button
              className={styles.respondButton}
              onClick={() => onRespond(item)}
            >
              Respond
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.listContainer}>
      {data.length === 0 ? (
        <p className={styles.noDataText}>No logs available.</p>
      ) : (
        data.map((item) => renderItem(item))
      )}
    </div>
  );
};

export default ReportInquiryList;
