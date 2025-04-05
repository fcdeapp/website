"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/ReportOverlay.module.css";

interface ReportOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  postId?: string;
  targetUserId?: string;
}

const ReportOverlay: React.FC<ReportOverlayProps> = ({ visible, onClose, onSubmit, postId, targetUserId }) => {
  const { t } = useTranslation();
  const [reportReason, setReportReason] = useState("");

  // 아이디 마스킹 함수: 마지막 4자리 대신 **** 표시
  const maskId = (id: string): string => {
    if (id.length <= 4) return id;
    return id.slice(0, id.length - 4) + "****";
  };

  const submitReport = () => {
    if (!reportReason.trim()) {
      window.alert(t("error") + ": " + t("report_reason_required"));
      return;
    }
    onSubmit(reportReason);
    setReportReason("");
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.modalHeader}>{t("report_reason", "Report Reason")}</h2>
        {postId && (
          <div className={styles.infoContainer}>
            <span className={styles.infoLabel}>{t("post_id", "Post ID")}: </span>
            <span className={styles.infoText}>{maskId(postId)}</span>
          </div>
        )}
        {targetUserId && (
          <div className={styles.infoContainer}>
            <span className={styles.infoLabel}>{t("target_user_id", "Reported User ID")}: </span>
            <span className={styles.infoText}>{maskId(targetUserId)}</span>
          </div>
        )}
        <textarea
          className={styles.modalInput}
          placeholder={t("enter_report_reason", "Type your report reason here...")}
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
          rows={4}
        />
        <div className={styles.modalButtonContainer}>
          <button className={styles.primaryButton} onClick={submitReport}>
            <span className={styles.buttonText}>{t("submit", "Submit")}</span>
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            <span className={styles.buttonText}>{t("cancel", "Cancel")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportOverlay;
