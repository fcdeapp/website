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
  progress: number;
  violations: string[];
}

const getPasswordValidation = (
  password: string,
  t: (key: string) => string
): PasswordValidation => {
  const violations: string[] = [];

  if (password.length < 8) {
    violations.push(t("password_rule_min_length") || "Minimum 8 characters required");
  }

  if (!/[A-Z]/.test(password)) {
    violations.push(t("password_rule_uppercase") || "At least one uppercase letter required");
  }

  if (!/[a-z]/.test(password)) {
    violations.push(t("password_rule_lowercase") || "At least one lowercase letter required");
  }

  if (!/[0-9]/.test(password)) {
    violations.push(t("password_rule_number") || "At least one number required");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    violations.push(t("password_rule_special") || "At least one special character required");
  }

  const satisfiedCount = 5 - violations.length;
  const progress = (satisfiedCount / 5) * 100;

  let strength = "";

  if (satisfiedCount <= 2) {
    strength = t("password_strength_weak") || "Weak";
  } else if (satisfiedCount === 3 || satisfiedCount === 4) {
    strength = t("password_strength_medium") || "Medium";
  } else if (satisfiedCount === 5) {
    strength = t("password_strength_strong") || "Strong";
  }

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
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [passwordValidation, setPasswordValidation] =
    useState<PasswordValidation>({
      strength: "",
      progress: 0,
      violations: [],
    });

  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeService, setAgreeService] = useState(false);
  const [agreeCommunity, setAgreeCommunity] = useState(false);
  const [agreeAdvertising, setAgreeAdvertising] = useState(false);
  const [isAllAgreed, setIsAllAgreed] = useState(false);

  const handleInputChange = (name: keyof FormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    setIsUsernameChecked(formValues.username.trim().length >= 6);
  }, [formValues.username]);

  useEffect(() => {
    setIsEmailValid(emailRegex.test(formValues.email));
    setIsCodeVerified(false);
  }, [formValues.email]);

  useEffect(() => {
    setIsCodeValid(codeRegex.test(formValues.verificationCode));
  }, [formValues.verificationCode]);

  useEffect(() => {
    const validation = getPasswordValidation(formValues.password, t);
    setPasswordValidation(validation);
  }, [formValues.password, t]);

  useEffect(() => {
    setIsAllAgreed(agreePrivacy && agreeService && agreeCommunity);
  }, [agreePrivacy, agreeService, agreeCommunity]);

  const sendVerificationCode = async () => {
    if (!isEmailValid) {
      setWarning(t("invalid_email_format") || "Invalid email format");
      return;
    }

    setSendingCode(true);
    setWarning("");

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL || ""}/password/request-register-otp`,
        { email: formValues.email },
        { headers: { "Content-Type": "application/json" } }
      );

      setWarning(t("code_sent") || "Verification code sent to your email");
    } catch (error: any) {
      setWarning(
        error.response?.data?.message ||
          t("error_occurred") ||
          "An error occurred"
      );
    } finally {
      setSendingCode(false);
    }
  };

  const verifyCode = async () => {
    if (!isCodeValid) {
      setWarning(t("invalid_code_format") || "Invalid verification code format");
      return;
    }

    setVerifyingCode(true);
    setWarning("");

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
      setWarning(
        error.response?.data?.message ||
          t("error_occurred") ||
          "An error occurred"
      );
      setIsCodeVerified(false);
    } finally {
      setVerifyingCode(false);
    }
  };

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

  const handleSignUp = async () => {
    if (!isAllAgreed) {
      setWarning(t("required_agreements") || "You must agree to all required terms");
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      setWarning(t("passwords_do_not_match") || "Passwords do not match");
      return;
    }

    setSubmitting(true);
    setWarning("");

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
      setWarning(
        error.response?.data?.message ||
          t("server_error") ||
          "A server error occurred"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const nextDisabled =
    (currentStep === 1 &&
      (!formValues.username || !formValues.email || !isCodeVerified)) ||
    (currentStep === 2 &&
      (!formValues.password ||
        !formValues.confirmPassword ||
        formValues.password !== formValues.confirmPassword ||
        passwordValidation.progress < 80));

  return (
    <main className={styles.container}>
      <div className={styles.bgOrbOne} aria-hidden />
      <div className={styles.bgOrbTwo} aria-hidden />
      <div className={styles.bgGrid} aria-hidden />

      <section className={styles.authShell}>
        <div className={styles.authIntro}>
          <span className={styles.kicker}>Create account</span>
          <h1 className={styles.heroTitle}>Start your visual learning flow.</h1>
          <p className={styles.heroLead}>
            Create an Abrody account to save visual vocabulary, daily lessons,
            quizzes, and review notes in one place.
          </p>
        </div>

        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            handleSignUp();
          }}
        >
          <div className={styles.formHeader}>
            <span className={styles.formKicker}>Abrody Account</span>
            <h2 className={styles.title}>Sign Up</h2>

            <div className={styles.stepIndicator}>
              <span>Step {currentStep} of 3</span>
              <div className={styles.stepTrack} aria-hidden>
                <div
                  className={styles.stepFill}
                  style={{ width: `${(currentStep / 3) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {currentStep === 1 && (
            <div className={styles.stepContainer}>
              <label className={styles.label} htmlFor="username">
                Username
              </label>
              <input
                id="username"
                className={styles.input}
                type="text"
                placeholder="Enter username"
                value={formValues.username}
                autoComplete="username"
                onChange={(e) => handleInputChange("username", e.target.value)}
              />

              <button
                type="button"
                className={styles.checkButton}
                onClick={() => setIsUsernameChecked(true)}
              >
                {isUsernameChecked
                  ? t("username_available") || "Username ready"
                  : t("check_username") || "Check Username"}
              </button>

              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                placeholder="Enter email"
                value={formValues.email}
                autoComplete="email"
                onChange={(e) => handleInputChange("email", e.target.value)}
              />

              <div className={styles.verificationContainer}>
                <input
                  className={styles.input}
                  type="text"
                  inputMode="numeric"
                  placeholder="Enter verification code"
                  value={formValues.verificationCode}
                  onChange={(e) =>
                    handleInputChange("verificationCode", e.target.value)
                  }
                />

                <button
                  type="button"
                  className={styles.sendCodeButton}
                  onClick={sendVerificationCode}
                  disabled={sendingCode}
                >
                  {sendingCode ? "Sending..." : t("send_code") || "Send Code"}
                </button>

                <button
                  type="button"
                  className={styles.verifyCodeButton}
                  onClick={verifyCode}
                  disabled={verifyingCode}
                >
                  {isCodeVerified
                    ? "Verified"
                    : verifyingCode
                    ? "Checking..."
                    : t("verify_code") || "Verify Code"}
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className={styles.stepContainer}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>

              <input
                id="password"
                className={styles.input}
                type="password"
                placeholder="Enter password"
                value={formValues.password}
                autoComplete="new-password"
                onChange={(e) => handleInputChange("password", e.target.value)}
              />

              <div className={styles.strengthBarContainer}>
                <div className={styles.strengthMeta}>
                  <span>{t("password_strength") || "Password strength"}</span>
                  <strong>{passwordValidation.strength || "—"}</strong>
                </div>

                <div className={styles.strengthBarBackground}>
                  <div
                    className={styles.strengthBarFill}
                    style={{ width: `${passwordValidation.progress}%` }}
                  />
                </div>
              </div>

              {passwordValidation.violations.length > 0 && (
                <ul className={styles.violationsList}>
                  {passwordValidation.violations.map((v, idx) => (
                    <li key={idx} className={styles.violationItem}>
                      {v}
                    </li>
                  ))}
                </ul>
              )}

              <label className={styles.label} htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                className={styles.input}
                type="password"
                placeholder="Confirm password"
                value={formValues.confirmPassword}
                autoComplete="new-password"
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
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
                  {t("agree_to_advertising_terms") ||
                    "I agree to receive Advertising Communications"}
                </label>
              </div>

              <div className={`${styles.agreementRow} ${styles.agreementAll}`}>
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
                  {t("agree_all") || "Agree to all required terms"}
                </label>
              </div>
            </div>
          )}

          <div className={styles.navigationButtons}>
            {currentStep > 1 && (
              <button
                type="button"
                className={styles.navButton}
                onClick={goToPreviousStep}
              >
                {t("back") || "Back"}
              </button>
            )}

            {currentStep < 3 && (
              <button
                type="button"
                className={styles.navButton}
                onClick={goToNextStep}
                disabled={nextDisabled}
              >
                {t("next") || "Next"}
              </button>
            )}

            {currentStep === 3 && (
              <button
                type="submit"
                className={styles.navButton}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : t("submit") || "Submit"}
              </button>
            )}
          </div>

          {warning && <p className={styles.warningText}>{warning}</p>}

          <div className={styles.footer}>
            <p>{t("already_have_account") || "Already have an account?"}</p>
            <Link href="/login" className={styles.footerLink}>
              {t("sign_in") || "Sign In"}
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}