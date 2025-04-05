"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/MaintenanceModal.module.css";

interface MaintenanceModalProps {
  visible: boolean;
  onRetry: () => void;
}

const MaintenanceModal: React.FC<MaintenanceModalProps> = ({ visible, onRetry }) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        <h2 className={styles.title}>{t("maintenance.title")}</h2>
        <p className={styles.message}>{t("maintenance.message")}</p>
        <p className={styles.support}>
          {t("maintenance.support_contact", { email: "support@fcde.app" })}
        </p>
        <button className={styles.button} onClick={onRetry}>
          <span className={styles.buttonText}>{t("maintenance.retry")}</span>
        </button>
      </div>
    </div>
  );
};

export default MaintenanceModal;
