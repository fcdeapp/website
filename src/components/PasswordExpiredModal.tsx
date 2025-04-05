"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/PasswordExpiredModal.module.css";

interface PasswordExpiredModalProps {
  visible: boolean;
  onPressChange: () => void;
  onClose?: () => void;
}

const PasswordExpiredModal: React.FC<PasswordExpiredModalProps> = ({ visible, onPressChange, onClose }) => {
  const { t } = useTranslation();

  if (!visible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.title}>{t("password_expired_title")}</h2>
        <p className={styles.message}>{t("password_expired_message")}</p>
        <div className={styles.buttonContainer}>
          <button className={styles.button} onClick={onPressChange}>
            <span className={styles.buttonText}>{t("change_now")}</span>
          </button>
        </div>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            <span className={styles.closeText}>{t("close")}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PasswordExpiredModal;
