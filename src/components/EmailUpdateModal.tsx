"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import styles from "../styles/components/EmailUpdateModal.module.css";

interface EmailUpdateModalProps {
  visible: boolean;
  onClose: () => void;
}

const EmailUpdateModal: React.FC<EmailUpdateModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { SERVER_URL } = useConfig();
  const [newEmail, setNewEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: 새 이메일 입력, 2: OTP 입력
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (visible) {
      setNewEmail("");
      setOtp("");
      setStep(1);
      setIsSubmitting(false);
    }
  }, [visible]);

  // 1. OTP 요청
  const requestEmailOtp = async () => {
    if (!newEmail.trim()) {
      alert(t("error") + ": " + t("enter_new_email"));
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(
        `${SERVER_URL}/password/request-email-otp`,
        { newEmail },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert(t("success") + ": " + t("otp_sent_to_new_email"));
      setStep(2);
    } catch (error: any) {
      alert(t("error") + ": " + (error.message || t("otp_request_failed")));
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. OTP 검증 및 이메일 변경
  const verifyOtpAndChangeEmail = async () => {
    if (!otp.trim()) {
      alert(t("error") + ": " + t("enter_otp"));
      return;
    }
    setIsSubmitting(true);
    try {
      // OTP 검증
      await axios.post(
        `${SERVER_URL}/password/verify-email-otp`,
        { newEmail, otp },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      // 이메일 변경
      await axios.post(
        `${SERVER_URL}/password/change-email`,
        { newEmail },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      alert(t("success") + ": " + t("email_changed_successfully"));
      onClose();
    } catch (error: any) {
      alert(t("error") + ": " + (error.message || t("email_change_failed")));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.modalTitle}>
          {step === 1 ? t("enter_new_email") : t("enter_otp")}
        </h2>

        {step === 1 && (
          <>
            <input
              className={styles.input}
              placeholder={t("new_email_placeholder")}
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              type="email"
              autoComplete="off"
            />
            <button
              className={styles.submitButton}
              onClick={requestEmailOtp}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className={styles.spinner}></div>
              ) : (
                t("request_otp")
              )}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              className={styles.input}
              placeholder={t("enter_otp")}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              type="text"
            />
            <button
              className={styles.submitButton}
              onClick={verifyOtpAndChangeEmail}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className={styles.spinner}></div>
              ) : (
                t("confirm")
              )}
            </button>
          </>
        )}

        <button className={styles.cancelButton} onClick={onClose}>
          {t("cancel")}
        </button>
      </div>
    </div>
  );
};

export default EmailUpdateModal;
