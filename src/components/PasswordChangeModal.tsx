"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import axios from "axios";
import styles from "../styles/components/PasswordChangeModal.module.css";

interface PasswordChangeModalProps {
  visible: boolean;
  onClose: () => void;
}

const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { SERVER_URL } = useConfig();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordMatchError, setPasswordMatchError] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMatchError(true);
      return;
    }
    setPasswordMatchError(false);
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${SERVER_URL}/password/change-password`,
        { currentPassword, newPassword },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      window.alert(t("success") + ": " + t("password_changed"));
      onClose();
    } catch (error: any) {
      window.alert(t("error") + ": " + (error.message || t("password_change_error")));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.modalTitle}>{t("change_password")}</h2>
        <input
          className={styles.input}
          type="password"
          placeholder={t("current_password")}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          className={styles.input}
          type="password"
          placeholder={t("new_password")}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          className={styles.input}
          type="password"
          placeholder={t("confirm_password")}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {passwordMatchError && (
          <p className={styles.errorText}>{t("password_mismatch")}</p>
        )}
        <button
          className={styles.submitButton}
          onClick={handlePasswordChange}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className={styles.spinner}></div>
          ) : (
            <span className={styles.submitButtonText}>{t("change_password")}</span>
          )}
        </button>
        <button className={styles.cancelButton} onClick={onClose}>
          <span className={styles.cancelText}>{t("cancel")}</span>
        </button>
      </div>
    </div>
  );
};

export default PasswordChangeModal;
