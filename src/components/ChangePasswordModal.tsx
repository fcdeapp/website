"use client";

import React, { useState, useRef, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import { useRouter } from "next/navigation";
import styles from "../styles/components/ChangePasswordModal.module.css";

// 정규식
const codeRegex = /^\d{6}$/;
const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;

interface GradientButtonProps {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

const GradientButton: React.FC<GradientButtonProps> = ({ onPress, disabled = false, children }) => {
  return (
    <button
      onClick={onPress}
      disabled={disabled}
      className={`${styles.sendButton} ${disabled ? styles.sendButtonDisabled : styles.sendButtonActiveGradient}`}
    >
      {children}
    </button>
  );
};

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onResult: (result: string) => void;
  onSwitchToFindId: () => void;
  isPasswordOutdated?: boolean;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onClose,
  onResult,
  onSwitchToFindId,
  isPasswordOutdated = false,
}) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [warning, setWarning] = useState("");
  const [passwordRules, setPasswordRules] = useState<{ strength: string; violations: string[] }>({
    strength: "",
    violations: [],
  });
  const [passwordMatchMessage, setPasswordMatchMessage] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0 ~ 1

  const getPasswordValidation = (password: string) => {
    const violations: string[] = [];
    if (password.length < 8) violations.push(t("password_rule_min_length") || "Minimum 8 characters");
    if (!/[A-Z]/.test(password)) violations.push(t("password_rule_uppercase") || "Must include an uppercase letter");
    if (!/[a-z]/.test(password)) violations.push(t("password_rule_lowercase") || "Must include a lowercase letter");
    if (!/[0-9]/.test(password)) violations.push(t("password_rule_number") || "Must include a number");
    if (!/[^A-Za-z0-9]/.test(password)) violations.push(t("password_rule_special") || "Must include a special character");
    const satisfiedCount = 5 - violations.length;
    let strength = "";
    if (satisfiedCount <= 2) strength = t("password_strength_weak") || "Weak";
    else if (satisfiedCount === 3 || satisfiedCount === 4) strength = t("password_strength_medium") || "Medium";
    else if (satisfiedCount === 5) strength = t("password_strength_strong") || "Strong";
    return { strength, violations };
  };

  const handleUserIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserId(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setWarning("");
  };

  const handleVerificationCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationCode(e.target.value);
    setWarning("");
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewPassword(text);
    const validation = getPasswordValidation(text);
    setPasswordRules(validation);
    const satisfaction = 5 - validation.violations.length;
    setPasswordStrength(satisfaction / 5);
    if (confirmNewPassword !== "") {
      setPasswordMatchMessage(
        text === confirmNewPassword ? t("password_match") || "Passwords match" : t("password_mismatch") || "Passwords do not match"
      );
    } else {
      setPasswordMatchMessage("");
    }
  };

  const handleConfirmNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setConfirmNewPassword(text);
    setPasswordMatchMessage(
      newPassword === text ? t("password_match") || "Passwords match" : t("password_mismatch") || "Passwords do not match"
    );
  };

  const sendVerificationCode = async () => {
    if (!emailRegex.test(email)) {
      setWarning(t("warning_invalid_email"));
      return;
    }
    if (isSendingOTP) return;
    setIsSendingOTP(true);
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
      setTimeout(() => setIsSendingOTP(false), 2000);
    }
  };

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

  const handleChangePW = async () => {
    if (!newPassword || !confirmNewPassword) {
      setWarning(t("fill_required_fields") || "Please fill in required fields");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setWarning(t("passwords_do_not_match") || "Passwords do not match");
      return;
    }
    if (passwordRules.violations.length > 0) {
      setWarning(t("password_invalid") || "Password does not meet security requirements");
      return;
    }
    try {
      await axios.post(
        `${SERVER_URL}/password/change-my-password`,
        { userId, email, otp: verificationCode, newPassword },
        { headers: { "Content-Type": "application/json" } }
      );
      onResult(t("result_change_pw"));
    } catch (error: any) {
      console.error("Error changing password:", error);
      alert(t("error_occurred"));
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <button className={styles.deleteIconWrapper} onClick={onClose}>
          <img src="/assets/delete-icon-big.png" alt="Delete" className={styles.deleteIcon} />
        </button>
        <h2 className={styles.overlayTitle}>
          {isPasswordOutdated ? t("password_outdated") : t("change_password")}
        </h2>
        <div className={styles.inputWithButton}>
          <input
            className={styles.input}
            placeholder={t("enter_user_id")}
            value={userId}
            onChange={handleUserIdChange}
          />
        </div>
        <div className={styles.inputWithButton}>
          <input
            className={styles.input}
            placeholder={t("enter_email")}
            value={email}
            onChange={handleEmailChange}
            type="email"
          />
          <GradientButton onPress={sendVerificationCode} disabled={!emailRegex.test(email) || isSendingOTP}>
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
        <div className={styles.inputWithButton}>
          <input
            className={styles.input}
            placeholder={t("enter_new_password")}
            value={newPassword}
            onChange={handleNewPasswordChange}
            type="password"
          />
        </div>
        {newPassword !== "" && (
          <>
            <div className={styles.strengthBarContainer}>
              <div
                className={styles.strengthBar}
                style={{
                  width: `${passwordStrength * 100}%`,
                  backgroundColor:
                    passwordStrength < 0.33
                      ? "red"
                      : passwordStrength < 0.66
                      ? "orange"
                      : passwordStrength < 1
                      ? "yellow"
                      : "green",
                }}
              />
            </div>
            <p className={styles.passwordStrength}>
              {t("password_strength")}: {passwordRules.strength}
            </p>
            {passwordRules.violations.length > 0 && (
              <div className={styles.violationsContainer}>
                {passwordRules.violations.map((violation, index) => (
                  <p key={index} className={styles.violationText}>
                    - {violation}
                  </p>
                ))}
              </div>
            )}
          </>
        )}
        <div className={styles.inputWithButton}>
          <input
            className={styles.input}
            placeholder={t("confirm_new_password")}
            value={confirmNewPassword}
            onChange={handleConfirmNewPasswordChange}
            type="password"
          />
        </div>
        {confirmNewPassword !== "" && (
          <p className={styles.passwordMatchMessage}>{passwordMatchMessage}</p>
        )}
        {warning && <p className={styles.warningText}>{warning}</p>}
        <button className={styles.smallLink} onClick={onSwitchToFindId}>
          {t("forgot_id")}
        </button>
        <div className={styles.buttonContainerOverlay}>
          <button onClick={handleChangePW} className={styles.agreeButton}>
            {t("confirm")}
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
