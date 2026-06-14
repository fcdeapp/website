"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import styles from "../../styles/pages/SignInLogIn.module.css";

type ModalMode = "findId" | "changePassword";

type PasswordValidation = {
  strength: string;
  progress: number;
  violations: string[];
};

type GoogleCredentialResponse = {
  credential?: string;
  select_by?: string;
};

const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || "";
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || "";
const ENABLE_APPLE_WEB_AUTH =
  process.env.NEXT_PUBLIC_ENABLE_APPLE_WEB_AUTH === "true";

const OTP_REQUEST_ENDPOINT = "/password/request-otp";

const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
const codeRegex = /^\d{6}$/;

const regionNameFromCode: Record<string, string> = {
  "ca-central-1": "Canada",
  "ap-southeast-2": "Australia",
  "eu-west-2": "United Kingdom",
  "ap-northeast-2": "Korea",
  beta: "Beta",
  development: "Development",
};

function getGoogleIdApi() {
  if (typeof window === "undefined") return null;
  return (window as any).google?.accounts?.id || null;
}

function getDeviceRegion() {
  if (typeof window === "undefined") return null;

  const locale = window.navigator.language || "";
  const parts = locale.split("-");

  return parts[1] || null;
}

function getPasswordValidation(
  password: string,
  t: (key: string) => string
): PasswordValidation {
  const violations: string[] = [];

  if (password.length < 8) {
    violations.push(
      t("password_rule_min_length") || "Minimum 8 characters"
    );
  }

  if (!/[A-Z]/.test(password)) {
    violations.push(
      t("password_rule_uppercase") || "Must include an uppercase letter"
    );
  }

  if (!/[a-z]/.test(password)) {
    violations.push(
      t("password_rule_lowercase") || "Must include a lowercase letter"
    );
  }

  if (!/[0-9]/.test(password)) {
    violations.push(t("password_rule_number") || "Must include a number");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    violations.push(
      t("password_rule_special") || "Must include a special character"
    );
  }

  const satisfiedCount = 5 - violations.length;
  const progress = (satisfiedCount / 5) * 100;

  let strength = "";

  if (satisfiedCount <= 2) {
    strength = t("password_strength_weak") || "Weak";
  } else if (satisfiedCount === 3 || satisfiedCount === 4) {
    strength = t("password_strength_medium") || "Medium";
  } else {
    strength = t("password_strength_strong") || "Strong";
  }

  return { strength, progress, violations };
}

export default function SignInLogInPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const googleButtonRef = useRef<HTMLDivElement | null>(null);

  const [deviceRegion, setDeviceRegion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  const [modalMode, setModalMode] = useState<ModalMode>("findId");
  const [accountModalVisible, setAccountModalVisible] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);

  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [userId, setUserId] = useState("");
  const [warning, setWarning] = useState("");
  const [resultMessage, setResultMessage] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const passwordValidation = useMemo(() => {
    return getPasswordValidation(newPassword, t);
  }, [newPassword, t]);

  const passwordMatchMessage = useMemo(() => {
    if (!confirmNewPassword) return "";

    return newPassword === confirmNewPassword
      ? t("password_match") || "Passwords match"
      : t("password_mismatch") || "Passwords do not match";
  }, [confirmNewPassword, newPassword, t]);

  const plusItems = useMemo(() => {
    return Array.from({ length: 90 }).map((_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${-(Math.random() * 7).toFixed(2)}s`,
      duration: `${6 + Math.random() * 4}s`,
      opacity: 0.22 + Math.random() * 0.44,
    }));
  }, []);

  const tt = (key: string, fallback: string) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  useEffect(() => {
    setDeviceRegion(getDeviceRegion());

    const params = new URLSearchParams(window.location.search);
    if (params.get("showChangePasswordModal") === "true") {
      setModalMode("changePassword");
      setAccountModalVisible(true);
    }
  }, []);

  const saveLoginPayload = async (data: any) => {
    const token = data?.token;
    const userIdFromServer = data?.userId;
    const serverRegion = data?.region;

    if (token) {
      localStorage.setItem("token", token);
      localStorage.setItem("isLoggedIn", "true");
    }

    if (userIdFromServer) {
      localStorage.setItem("userId", String(userIdFromServer));
    }

    if (serverRegion) {
      const displayRegion = regionNameFromCode[serverRegion] || serverRegion;
      localStorage.setItem("selectedServer", displayRegion);
      localStorage.setItem("dataRegion", displayRegion);
      localStorage.setItem("needsRestart", "1");
    }
  };

  const handleGoogleCredential = async (
    response: GoogleCredentialResponse
  ) => {
    const idToken = response.credential;

    if (!idToken) {
      setResultMessage("Google idToken not found.");
      setResultModalVisible(true);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${SERVER_URL}/googleAuth/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          idToken,
          platform: "web",
          deviceRegion,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.token) {
        throw new Error(data?.message || "Google authentication failed");
      }

      await saveLoginPayload(data);
      router.push("/");
    } catch (error: any) {
      console.error("Google auth error:", error);
      setResultMessage(error.message || "Google authentication failed");
      setResultModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeGoogle = () => {
    const googleId = getGoogleIdApi();

    if (!GOOGLE_CLIENT_ID || !googleId) return;

    googleId.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    if (googleButtonRef.current && googleId.renderButton) {
      googleButtonRef.current.innerHTML = "";

      googleId.renderButton(googleButtonRef.current, {
        theme: "outline",
        size: "large",
        type: "standard",
        shape: "pill",
        text: "continue_with",
        logo_alignment: "left",
        width: 294,
      });
    }

    setGoogleReady(true);
  };

  const handleGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
      setResultMessage(
        "Google Web Client ID is missing. Set NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID."
      );
      setResultModalVisible(true);
      return;
    }

    const googleId = getGoogleIdApi();

    if (!googleId) {
      setResultMessage("Google login is still loading. Please try again.");
      setResultModalVisible(true);
      return;
    }

    googleId.prompt();
  };

  const handleAppleLogin = () => {
    if (!ENABLE_APPLE_WEB_AUTH) {
      setResultMessage(
        "Apple web login is not enabled. Set NEXT_PUBLIC_ENABLE_APPLE_WEB_AUTH=true and connect your server-side Apple OAuth route."
      );
      setResultModalVisible(true);
      return;
    }

    const redirect = encodeURIComponent(
      `${window.location.origin}/auth/apple/callback`
    );

    window.location.href = `${SERVER_URL}/appleAuth/web?deviceRegion=${
      deviceRegion || ""
    }&redirect=${redirect}`;
  };

  const openFindIdModal = () => {
    setWarning("");
    setModalMode("findId");
    setAccountModalVisible(true);
  };

  const openChangePasswordModal = () => {
    setWarning("");
    setModalMode("changePassword");
    setAccountModalVisible(true);
  };

  const closeAccountModal = () => {
    setWarning("");
    setAccountModalVisible(false);
  };

  const closeResultModal = () => {
    setResultModalVisible(false);
    setResultMessage("");
  };

  const requestOtp = async () => {
    if (!emailRegex.test(email)) {
      setWarning(tt("invalid_email_format", "Invalid email format"));
      return;
    }

    setIsLoading(true);
    setWarning("");

    try {
      const res = await fetch(`${SERVER_URL}${OTP_REQUEST_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          type: modalMode === "findId" ? "find-id" : "change-password",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Failed to send verification code");
      }

      setWarning(tt("code_sent", "Verification code sent to your email"));
    } catch (error: any) {
      console.error("OTP request error:", error);
      setWarning(
        error.message ||
          "Failed to send verification code. Check your server OTP endpoint."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFindId = async () => {
    if (!emailRegex.test(email)) {
      setWarning(tt("invalid_email_format", "Invalid email format"));
      return;
    }

    if (!codeRegex.test(verificationCode)) {
      setWarning(tt("invalid_code_format", "Invalid verification code format"));
      return;
    }

    setIsLoading(true);
    setWarning("");

    try {
      const res = await fetch(`${SERVER_URL}/password/find-id`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email,
          otp: verificationCode,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message || tt("error_occurred", "An error occurred")
        );
      }

      const foundId = data?.setUserId || data?.userId || data?.id || "";

      setResultMessage(
        foundId
          ? `Your ID is ${foundId}`
          : tt("result_found_id", "We found your account ID.")
      );
      setAccountModalVisible(false);
      setResultModalVisible(true);
    } catch (error: any) {
      console.error("Find ID error:", error);
      setWarning(error.message || tt("error_occurred", "An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!userId.trim()) {
      setWarning(tt("fill_required_fields", "Please fill in required fields"));
      return;
    }

    if (!emailRegex.test(email)) {
      setWarning(tt("invalid_email_format", "Invalid email format"));
      return;
    }

    if (!codeRegex.test(verificationCode)) {
      setWarning(tt("invalid_code_format", "Invalid verification code format"));
      return;
    }

    if (!newPassword || !confirmNewPassword) {
      setWarning(tt("fill_required_fields", "Please fill in required fields"));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setWarning(tt("passwords_do_not_match", "Passwords do not match"));
      return;
    }

    if (passwordValidation.violations.length > 0) {
      setWarning(
        tt("password_invalid", "Password does not meet security requirements")
      );
      return;
    }

    setIsLoading(true);
    setWarning("");

    try {
      const res = await fetch(`${SERVER_URL}/password/change-my-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId,
          email,
          otp: verificationCode,
          newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data?.message || tt("error_occurred", "An error occurred")
        );
      }

      setResultMessage(
        tt("result_change_pw", "Your password has been changed.")
      );
      setAccountModalVisible(false);
      setResultModalVisible(true);
    } catch (error: any) {
      console.error("Change password error:", error);
      setWarning(error.message || tt("error_occurred", "An error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initializeGoogle}
        onReady={initializeGoogle}
      />

      <main className={styles.container}>
        <div className={styles.rippleLayer} aria-hidden>
          {plusItems.map((item) => (
            <span
              key={item.id}
              className={styles.plusMark}
              style={{
                left: item.left,
                top: item.top,
                animationDelay: item.delay,
                animationDuration: item.duration,
                opacity: item.opacity,
              }}
            >
              +
            </span>
          ))}
        </div>

        <img
          src="/assets/AbrodyBackground.png"
          alt=""
          className={styles.backgroundImage}
          draggable={false}
        />

        <div className={styles.gradientOverlay} />

        <section className={styles.content}>
          <div className={styles.titleBlock}>
            <span className={styles.kicker}>Abrody</span>

            <h1 className={styles.title}>
              {isLoading
                ? tt("loading_text", "Loading...")
                : tt("welcome_to_Abrody", "Welcome to Abrody")}
            </h1>

            <p className={styles.subtitle}>
              {tt(
                "sign_in_intro",
                "Sign in, create an account, or explore Abrody before getting started."
              )}
            </p>
          </div>

          <div className={styles.buttonContainer}>
            <Link href="/signUpForm" className={styles.mainButton}>
              {tt("sign_up", "Sign Up")}
            </Link>

            <Link href="/login" className={styles.mainButton}>
              {tt("log_in", "Log In")}
            </Link>
          </div>

          <div className={styles.socialStack}>
            {ENABLE_APPLE_WEB_AUTH && (
              <button
                type="button"
                className={styles.appleButton}
                onClick={handleAppleLogin}
                disabled={isLoading}
              >
                <span className={styles.appleIconCircle}>
                  <img
                    src="/assets/apple-logo.png"
                    alt=""
                    className={styles.appleIcon}
                    draggable={false}
                  />
                </span>
                <span>{tt("login_with_apple", "Continue with Apple")}</span>
              </button>
            )}

            <button
              type="button"
              className={styles.googleButton}
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <span className={styles.googleIconCircle}>
                <img
                  src="/assets/google.png"
                  alt=""
                  className={styles.googleIcon}
                  draggable={false}
                />
              </span>
              <span>{tt("login_with_google", "Continue with Google")}</span>
            </button>

            <div className={styles.googleNativeButton} ref={googleButtonRef} />

            {!googleReady && GOOGLE_CLIENT_ID && (
              <span className={styles.socialHint}>
                Preparing Google login...
              </span>
            )}
          </div>

          <button
            type="button"
            className={styles.forgotLink}
            onClick={openFindIdModal}
          >
            {tt("forgot_id_or_password", "Forgot ID or password?")}
          </button>
        </section>

        <footer className={styles.footer}>
          <p className={styles.footerText}>
            ⓒ {new Date().getFullYear()} Abrody, operated by FacadeConnect Co.,
            Ltd. All rights reserved.
          </p>

          <Link href="/" className={styles.exploreButton}>
            {tt("explore_button", "Explore")}
          </Link>
        </footer>
      </main>

      {accountModalVisible && (
        <div className={styles.overlayBackground} role="dialog" aria-modal="true">
          <div className={styles.overlayContent}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeAccountModal}
              aria-label="Close"
            >
              ×
            </button>

            <div className={styles.modalTabs}>
              <button
                type="button"
                className={`${styles.modalTab} ${
                  modalMode === "findId" ? styles.modalTabActive : ""
                }`}
                onClick={() => {
                  setWarning("");
                  setModalMode("findId");
                }}
              >
                Find ID
              </button>

              <button
                type="button"
                className={`${styles.modalTab} ${
                  modalMode === "changePassword" ? styles.modalTabActive : ""
                }`}
                onClick={() => {
                  setWarning("");
                  setModalMode("changePassword");
                }}
              >
                Change Password
              </button>
            </div>

            <h2 className={styles.overlayTitle}>
              {modalMode === "findId"
                ? tt("find_id", "Find your ID")
                : tt("change_password", "Change password")}
            </h2>

            <div className={styles.modalForm}>
              {modalMode === "changePassword" && (
                <>
                  <label className={styles.inputLabel} htmlFor="userId">
                    User ID
                  </label>
                  <input
                    id="userId"
                    className={styles.input}
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter your ID"
                  />
                </>
              )}

              <label className={styles.inputLabel} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={styles.input}
                value={email}
                type="email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setWarning("");
                }}
                placeholder="you@example.com"
              />

              <div className={styles.codeRow}>
                <div className={styles.codeInputWrap}>
                  <label
                    className={styles.inputLabel}
                    htmlFor="verificationCode"
                  >
                    Verification code
                  </label>
                  <input
                    id="verificationCode"
                    className={styles.input}
                    value={verificationCode}
                    inputMode="numeric"
                    onChange={(e) => {
                      setVerificationCode(e.target.value);
                      setWarning("");
                    }}
                    placeholder="6-digit code"
                  />
                </div>

                <button
                  type="button"
                  className={styles.smallButton}
                  onClick={requestOtp}
                  disabled={isLoading}
                >
                  Send Code
                </button>
              </div>

              {modalMode === "changePassword" && (
                <>
                  <label className={styles.inputLabel} htmlFor="newPassword">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    className={styles.input}
                    value={newPassword}
                    type="password"
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setWarning("");
                    }}
                    placeholder="Enter new password"
                  />

                  <div className={styles.passwordMeta}>
                    <span>Password strength</span>
                    <strong>{passwordValidation.strength || "—"}</strong>
                  </div>

                  <div className={styles.strengthTrack}>
                    <div
                      className={styles.strengthFill}
                      style={{ width: `${passwordValidation.progress}%` }}
                    />
                  </div>

                  {passwordValidation.violations.length > 0 && (
                    <ul className={styles.violationsList}>
                      {passwordValidation.violations.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}

                  <label
                    className={styles.inputLabel}
                    htmlFor="confirmNewPassword"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirmNewPassword"
                    className={styles.input}
                    value={confirmNewPassword}
                    type="password"
                    onChange={(e) => {
                      setConfirmNewPassword(e.target.value);
                      setWarning("");
                    }}
                    placeholder="Confirm new password"
                  />

                  {passwordMatchMessage && (
                    <p
                      className={
                        newPassword === confirmNewPassword
                          ? styles.matchText
                          : styles.warningInline
                      }
                    >
                      {passwordMatchMessage}
                    </p>
                  )}
                </>
              )}

              {warning && <p className={styles.warningText}>{warning}</p>}

              <div className={styles.buttonContainerOverlay}>
                {modalMode === "findId" ? (
                  <>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={openChangePasswordModal}
                    >
                      Change Password
                    </button>
                    <button
                      type="button"
                      className={styles.agreeButton}
                      onClick={handleFindId}
                      disabled={isLoading}
                    >
                      Find ID
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={styles.cancelButton}
                      onClick={openFindIdModal}
                    >
                      Find ID
                    </button>
                    <button
                      type="button"
                      className={styles.agreeButton}
                      onClick={handleChangePassword}
                      disabled={isLoading}
                    >
                      Change
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {resultModalVisible && (
        <div className={styles.overlayBackground} role="dialog" aria-modal="true">
          <div className={styles.resultContent}>
            <button
              type="button"
              className={styles.closeButton}
              onClick={closeResultModal}
              aria-label="Close"
            >
              ×
            </button>

            <p className={styles.resultMessage}>{resultMessage}</p>

            <button
              type="button"
              className={styles.agreeButton}
              onClick={closeResultModal}
            >
              {tt("confirm", "Confirm")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}