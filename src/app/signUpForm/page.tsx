"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTranslation } from "react-i18next";
import styles from "../../styles/pages/SignUpForm.module.css";

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const codeRegex = /^\d{6}$/;

interface FormValues {
  username: string;
  email: string;
  verificationCode: string;
  password: string;
  confirmPassword: string;
}

interface PasswordValidation {
  strength: string;
  progress: number; // 0 ~ 100
  violations: string[];
}

const getPasswordValidation = (password: string, t: (key: string) => string): PasswordValidation => {
  const violations: string[] = [];
  if (password.length < 8) violations.push(t("password_rule_min_length") || "Minimum 8 characters required");
  if (!/[A-Z]/.test(password)) violations.push(t("password_rule_uppercase") || "At least one uppercase letter required");
  if (!/[a-z]/.test(password)) violations.push(t("password_rule_lowercase") || "At least one lowercase letter required");
  if (!/[0-9]/.test(password)) violations.push(t("password_rule_number") || "At least one number required");
  if (!/[^A-Za-z0-9]/.test(password)) violations.push(t("password_rule_special") || "At least one special character required");
  const satisfiedCount = 5 - violations.length;
  let strength = "";
  let progress = (satisfiedCount / 5) * 100;
  if (satisfiedCount <= 2) strength = t("password_strength_weak") || "Weak";
  else if (satisfiedCount === 3 || satisfiedCount === 4) strength = t("password_strength_medium") || "Medium";
  else if (satisfiedCount === 5) strength = t("password_strength_strong") || "Strong";
  return { strength, progress, violations };
};

export default function SignUpForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formValues, setFormValues] = useState<FormValues>({
    username: "",
    email: "",
    verificationCode: "",
    password: "",
    confirmPassword: "",
  });
  const [warning, setWarning] = useState("");
  const [isUsernameChecked, setIsUsernameChecked] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isCodeValid, setIsCodeValid] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    strength: "",
    progress: 0,
    violations: [],
  });
  // 동의 체크박스 상태
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeService, setAgreeService] = useState(false);
  const [agreeCommunity, setAgreeCommunity] = useState(false);
  const [agreeAdvertising, setAgreeAdvertising] = useState(false);
  const [isAllAgreed, setIsAllAgreed] = useState(false);

  // 입력값 변경 핸들러
  const handleInputChange = (name: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Username - 최소 6자 검사 (여기서는 duplication 체크를 별도 생략하고, 최소 길이만 검사)
  useEffect(() => {
    if (formValues.username.trim().length >= 6) {
      setIsUsernameChecked(true);
    } else {
      setIsUsernameChecked(false);
    }
  }, [formValues.username]);

  // Email 유효성 검사
  useEffect(() => {
    setIsEmailValid(emailRegex.test(formValues.email));
  }, [formValues.email]);

  // Verification code 유효성 검사
  useEffect(() => {
    setIsCodeValid(codeRegex.test(formValues.verificationCode));
  }, [formValues.verificationCode]);

  // 비밀번호 유효성 및 강도 업데이트
  useEffect(() => {
    const validation = getPasswordValidation(formValues.password, t);
    setPasswordValidation(validation);
  }, [formValues.password, t]);

  // 동의 체크박스 전체 여부 업데이트
  useEffect(() => {
    setIsAllAgreed(agreePrivacy && agreeService && agreeCommunity);
  }, [agreePrivacy, agreeService, agreeCommunity]);

  // 이메일로 OTP 전송
  const sendVerificationCode = async () => {
    if (!isEmailValid) {
      setWarning(t("invalid_email_format") || "Invalid email format");
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL || ""}/password/request-register-otp`,
        { email: formValues.email },
        { headers: { "Content-Type": "application/json" } }
      );
      setWarning(t("code_sent") || "Verification code sent to your email");
    } catch (error: any) {
      setWarning(error.response?.data?.message || t("error_occurred") || "An error occurred");
    }
  };

  // OTP 코드 검증
  const verifyCode = async () => {
    if (!isCodeValid) {
      setWarning(t("invalid_code_format") || "Invalid verification code format");
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL || ""}/password/verify-register-otp`,
        { email: formValues.email, otp: formValues.verificationCode },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.status === 200) {
        setWarning(t("code_verified") || "Verification code verified");
        setIsCodeVerified(true);
      } else {
        setWarning(res.data.message || t("error_occurred") || "An error occurred");
        setIsCodeVerified(false);
      }
    } catch (error: any) {
      setWarning(error.response?.data?.message || t("error_occurred") || "An error occurred");
      setIsCodeVerified(false);
    }
  };

  // 단계별 이동 전 validation
  const goToNextStep = () => {
    if (currentStep === 1) {
      if (!formValues.username.trim() || !formValues.email.trim()) {
        setWarning(t("fill_required_fields") || "Please fill in all required fields");
        return;
      }
      if (!isUsernameChecked) {
        setWarning(t("username_check_required") || "Please check username availability");
        return;
      }
      if (formValues.email.trim() && !isCodeVerified) {
        setWarning(t("otp_verification_required") || "Please verify your email");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formValues.password || !formValues.confirmPassword) {
        setWarning(t("fill_required_fields") || "Please fill in all required fields");
        return;
      }
      if (formValues.password !== formValues.confirmPassword) {
        setWarning(t("passwords_do_not_match") || "Passwords do not match");
        return;
      }
      if (passwordValidation.progress < 80) {
        setWarning(t("password_strength_requirement") || "Password must satisfy more rules");
        return;
      }
    }
    setWarning("");
    setCurrentStep((prev) => prev + 1);
  };

  const goToPreviousStep = () => {
    setWarning("");
    setCurrentStep((prev) => prev - 1);
  };

  // 회원가입 API 호출
  const handleSignUp = async () => {
    if (!isAllAgreed) {
      setWarning(t("required_agreements") || "You must agree to all required terms");
      return;
    }
    if (formValues.password !== formValues.confirmPassword) {
      setWarning(t("passwords_do_not_match") || "Passwords do not match");
      return;
    }
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL || ""}/auth/register`,
        {
          username: formValues.username,
          email: formValues.email,
          password: formValues.password,
        },
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.status === 201) {
        alert(t("sign_up_success") || "Sign Up Successful! You can now log in.");
        router.push("/login");
      } else {
        setWarning(res.data.message || t("server_error") || "A server error occurred");
      }
    } catch (error: any) {
      setWarning(error.response?.data?.message || t("server_error") || "A server error occurred");
    }
  };

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={(e) => { e.preventDefault(); handleSignUp(); }}>
        <h1 className={styles.title}>Sign Up for Facade</h1>
        <div className={styles.stepIndicator}>Step {currentStep} of 3</div>
        
        {currentStep === 1 && (
          <div className={styles.stepContainer}>
            <label className={styles.label}>Username</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Enter username"
              value={formValues.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
            />
            <button type="button" className={styles.checkButton} onClick={() => setIsUsernameChecked(true)}>
              {t("check_username") || "Check Username"}
            </button>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="Enter email"
              value={formValues.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
            <div className={styles.verificationContainer}>
              <input
                className={styles.input}
                type="text"
                placeholder="Enter verification code"
                value={formValues.verificationCode}
                onChange={(e) => handleInputChange("verificationCode", e.target.value)}
              />
              <button type="button" className={styles.sendCodeButton} onClick={sendVerificationCode}>
                {t("send_code") || "Send Code"}
              </button>
              <button type="button" className={styles.verifyCodeButton} onClick={verifyCode}>
                {t("verify_code") || "Verify Code"}
              </button>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className={styles.stepContainer}>
            <label className={styles.label}>Password</label>
            <div className={styles.inputWithToggle}>
              <input
                className={styles.input}
                type="password"
                placeholder="Enter password"
                value={formValues.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
            </div>
            <div className={styles.strengthBarContainer}>
              <div className={styles.strengthBarBackground}>
                <div
                  className={styles.strengthBarFill}
                  style={{ width: `${passwordValidation.progress}%` }}
                />
              </div>
              <div className={styles.strengthText}>
                {t("password_strength")}: {passwordValidation.strength}
              </div>
            </div>
            {passwordValidation.violations.length > 0 && (
              <ul className={styles.violationsList}>
                {passwordValidation.violations.map((v, idx) => (
                  <li key={idx} className={styles.violationItem}>
                    - {v}
                  </li>
                ))}
              </ul>
            )}
            <label className={styles.label}>Confirm Password</label>
            <input
              className={styles.input}
              type="password"
              placeholder="Confirm password"
              value={formValues.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
            />
          </div>
        )}

        {currentStep === 3 && (
          <div className={styles.stepContainer}>
            <div className={styles.agreementRow}>
              <input
                type="checkbox"
                id="privacy"
                checked={agreePrivacy}
                onChange={() => setAgreePrivacy((prev) => !prev)}
              />
              <label htmlFor="privacy" className={styles.agreementLabel}>
                {t("agree_to_privacy_policy") || "I agree to the Privacy Policy"}
              </label>
            </div>
            <div className={styles.agreementRow}>
              <input
                type="checkbox"
                id="service"
                checked={agreeService}
                onChange={() => setAgreeService((prev) => !prev)}
              />
              <label htmlFor="service" className={styles.agreementLabel}>
                {t("agree_to_service_terms") || "I agree to the Service Terms"}
              </label>
            </div>
            <div className={styles.agreementRow}>
              <input
                type="checkbox"
                id="community"
                checked={agreeCommunity}
                onChange={() => setAgreeCommunity((prev) => !prev)}
              />
              <label htmlFor="community" className={styles.agreementLabel}>
                {t("agree_to_community_terms") || "I agree to the Community Terms"}
              </label>
            </div>
            <div className={styles.agreementRow}>
              <input
                type="checkbox"
                id="advertising"
                checked={agreeAdvertising}
                onChange={() => setAgreeAdvertising((prev) => !prev)}
              />
              <label htmlFor="advertising" className={styles.agreementLabel}>
                {t("agree_to_advertising_terms") || "I agree to receive Advertising Communications"}
              </label>
            </div>
            <div className={styles.agreementRow}>
              <input
                type="checkbox"
                id="all"
                checked={isAllAgreed}
                onChange={() => {
                  const newVal = !isAllAgreed;
                  setAgreePrivacy(newVal);
                  setAgreeService(newVal);
                  setAgreeCommunity(newVal);
                  setIsAllAgreed(newVal);
                }}
              />
              <label htmlFor="all" className={styles.agreementLabel}>
                {t("agree_all") || "Agree to all"}
              </label>
            </div>
          </div>
        )}

        <div className={styles.navigationButtons}>
          {currentStep > 1 && (
            <button type="button" className={styles.navButton} onClick={goToPreviousStep}>
              {t("back") || "Back"}
            </button>
          )}
          {currentStep < 3 && (
            <button
              type="button"
              className={styles.navButton}
              onClick={goToNextStep}
              disabled={
                (currentStep === 1 && (!formValues.username || !formValues.email)) ||
                (currentStep === 1 && formValues.email && !isCodeVerified) ||
                (currentStep === 2 &&
                  (!formValues.password ||
                   !formValues.confirmPassword ||
                   formValues.password !== formValues.confirmPassword ||
                   passwordValidation.progress < 80))
              }
            >
              {t("next") || "Next"}
            </button>
          )}
          {currentStep === 3 && (
            <button type="submit" className={styles.navButton}>
              {t("submit") || "Submit"}
            </button>
          )}
        </div>
        {warning && <p className={styles.warningText}>{warning}</p>}
        <div className={styles.footer}>
          <p>{t("already_have_account") || "Already have an account?"}</p>
          <Link href="/login">
            <a className={styles.footerLink}>{t("sign_in") || "Sign In"}</a>
          </Link>
        </div>
      </form>
    </main>
  );
}
