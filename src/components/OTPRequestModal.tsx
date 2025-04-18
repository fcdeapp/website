"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import axios from "axios";
import styles from "../styles/components/OTPRequestModal.module.css";

interface OTPRequestModalProps {
  visible: boolean;
  onClose: () => void;
}

const OTPRequestModal: React.FC<OTPRequestModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { SERVER_URL } = useConfig();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달이 열릴 때 상태 초기화
  useEffect(() => {
    if (visible) {
      setEmail("");
      setOtp("");
      setStep(1);
      setIsSubmitting(false);
    }
  }, [visible]);

  const requestOtp = async () => {
    if (!email.trim()) {
      window.alert(t("error") + ": " + t("enter_email"));
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(
        `${SERVER_URL}/password/request-otp`,
        { email },
        {
          headers: {
            "Content-Type": "application/json"
          },
        }
      );
      window.alert(t("success") + ": " + t("otp_sent_to_email"));
      setStep(2);
    } catch (error: any) {
      window.alert(t("error") + ": " + (error.message || t("otp_request_failed")));
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim()) {
      window.alert(t("error") + ": " + t("enter_otp"));
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(
        `${SERVER_URL}/password/verify-otp`,
        { email, otp },
        {
          headers: {
            "Content-Type": "application/json"
          },
        }
      );
      window.alert(t("success") + ": " + t("admin_access_granted_for_7_days"));
      onClose();
    } catch (error: any) {
      window.alert(t("error") + ": " + (error.message || t("admin_access_failed")));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <h2 className={styles.modalTitle}>
          {step === 1 ? t("enter_email_for_otp") : t("enter_otp")}
        </h2>

        {step === 1 && (
          <>
            <input
              className={styles.input}
              placeholder={t("enter_email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
            <button
              className={styles.submitButton}
              onClick={requestOtp}
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
              onClick={verifyOtp}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className={styles.spinner}></div>
              ) : (
                t("confirm")
              )}
            </button>
            <button
              className={styles.resendOtpButton}
              onClick={requestOtp}
              disabled={isSubmitting}
            >
              {t("resend_otp")}
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

export default OTPRequestModal;
