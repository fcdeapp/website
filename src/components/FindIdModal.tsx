"use client";

import React, { useState, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import styles from "../styles/components/FindIdModal.module.css";
import deleteIcon from "/assets/delete-icon-big.png"; // public/assets/ 에 위치

interface FindIdModalProps {
  visible: boolean;
  onClose: () => void;
  onResult: (result: string) => void;
  onSwitchToChangePW: () => void;
}

interface GradientButtonProps {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const GradientButton: React.FC<GradientButtonProps> = ({ onPress, disabled = false, children }) => {
  return disabled ? (
    <button onClick={onPress} disabled className={`${styles.sendButton} ${styles.sendButtonDisabled}`}>
      <span className={styles.sendButtonDisabledText}>{children}</span>
    </button>
  ) : (
    <button onClick={onPress} className={`${styles.sendButton} ${styles.sendButtonActiveGradient}`}>
      <span className={styles.sendButtonActiveText}>{children}</span>
    </button>
  );
};

const FindIdModal: React.FC<FindIdModalProps> = ({ visible, onClose, onResult, onSwitchToChangePW }) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [warning, setWarning] = useState("");
  const [isSending, setIsSending] = useState(false);

  const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  const codeRegex = /^\d{6}$/;

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setWarning("");
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
    setWarning("");
  };

  const sendVerificationCode = useCallback(async () => {
    if (isSending) return;
    if (!emailRegex.test(email)) {
      setWarning(t("warning_invalid_email"));
      return;
    }
    setIsSending(true);
    try {
      await axios.post(
        `${SERVER_URL}/password/request-password-otp`,
        { email },
        { headers: { "Content-Type": "application/json" } }
      );
      setWarning(t("warning_code_sent"));
    } catch (error) {
      console.error("Error sending OTP:", error);
      setWarning(t("error_occurred"));
    } finally {
      setTimeout(() => setIsSending(false), 2000);
    }
  }, [email, isSending, SERVER_URL, t]);

  const verifyCode = async () => {
    if (!codeRegex.test(verificationCode)) {
      setWarning(t("warning_invalid_code"));
      return;
    }
    try {
      await axios.post(
        `${SERVER_URL}/password/verify-password-otp`,
        { email, otp: verificationCode },
        { headers: { "Content-Type": "application/json" } }
      );
      setWarning(t("warning_code_verified"));
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      setWarning(error.response?.data?.message || t("warning_invalid_code"));
    }
  };

  const handleFindID = async () => {
    try {
      const res = await axios.post(
        `${SERVER_URL}/password/find-id`,
        { email, otp: verificationCode },
        { headers: { "Content-Type": "application/json" } }
      );
      const result = t("result_found_id", { id: res.data.setUserId });
      onResult(result);
    } catch (error: any) {
      console.error("Error finding ID:", error);
      alert(t("error") + ": " + t("error_occurred"));
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay} onClick={() => { /* 클릭 시 키보드 숨김 없음 */ }}>
      <div className={styles.keyboardAvoidingView} onClick={(e) => e.stopPropagation()}>
        <div className={styles.overlayContent}>
          <button className={styles.deleteIconWrapper} onClick={onClose}>
            <img src={deleteIcon.src} alt="Delete" className={styles.deleteIcon} />
          </button>
          <h2 className={styles.overlayTitle}>{t("find_id")}</h2>
          <div className={styles.inputWithButton}>
            <input
              className={styles.input}
              placeholder={t("enter_email")}
              value={email}
              onChange={handleEmailChange}
              type="email"
              autoComplete="off"
            />
            <GradientButton onPress={sendVerificationCode} disabled={isSending || !emailRegex.test(email)}>
              {t("send_code")}
            </GradientButton>
          </div>
          <div className={styles.inputWithButton}>
            <input
              className={styles.input}
              placeholder={t("enter_verification_code")}
              value={verificationCode}
              onChange={handleVerificationCodeChange}
              type="text"
            />
            <GradientButton onPress={verifyCode} disabled={!codeRegex.test(verificationCode)}>
              {t("verify_code")}
            </GradientButton>
          </div>
          {warning && <p className={styles.warningText}>{warning}</p>}
          <button className={styles.smallLink} onClick={onSwitchToChangePW}>
            {t("forgot_password")}
          </button>
          <div className={styles.buttonContainerOverlay}>
            <button onClick={handleFindID} className={styles.agreeButton}>
              {t("confirm")}
            </button>
            <button onClick={onClose} className={styles.cancelButton}>
              {t("cancel")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindIdModal;
