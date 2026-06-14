"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../styles/pages/Login.module.css";

type PasswordRules = {
  label: string;
  regex: RegExp;
};

const RULES: PasswordRules[] = [
  { label: "Min 8 characters", regex: /^.{8,}$/ },
  { label: "Uppercase letter", regex: /[A-Z]/ },
  { label: "Lowercase letter", regex: /[a-z]/ },
  { label: "Number", regex: /\d/ },
  { label: "Special character", regex: /[^A-Za-z0-9]/ },
];

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [valid, setValid] = useState(false);
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sending, setSending] = useState(false);

  const completedCount = RULES.filter((rule) => rule.regex.test(password)).length;

  useEffect(() => {
    setValid(username.trim().length >= 6 && completedCount === RULES.length);
  }, [username, completedCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || sending) return;

    setSending(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL || ""}/auth/web/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("isLoggedIn", "true");

        if (data.region) {
          localStorage.setItem("region", data.region);
        }

        router.push("/");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error", error);
      alert("Network error — please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>Sign In | Abrody</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className={styles.container}>
        <div className={styles.bgOrbOne} aria-hidden />
        <div className={styles.bgOrbTwo} aria-hidden />
        <div className={styles.bgGrid} aria-hidden />

        <section className={styles.authShell}>
          <div className={styles.authIntro}>
            <span className={styles.kicker}>Welcome back</span>
            <h1 className={styles.heroTitle}>Continue learning with Abrody.</h1>
            <p className={styles.heroLead}>
              Sign in to return to your visual vocabulary, quizzes, and daily
              learning flow.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.formHeader}>
              <span className={styles.formKicker}>Abrody Account</span>
              <h2 className={styles.title}>Sign In</h2>
              <p className={styles.subtitle}>
                Enter your account information to continue.
              </p>
            </div>

            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className={styles.input}
              type="text"
              value={username}
              placeholder="Enter your username"
              autoComplete="username"
              onChange={(e) => setUsername(e.target.value)}
            />

            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                className={styles.input}
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="Enter your password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
              />

              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {focused && (
              <ul className={styles.rules}>
                {RULES.map((rule) => {
                  const passed = rule.regex.test(password);

                  return (
                    <li
                      key={rule.label}
                      className={passed ? styles.rulePass : styles.ruleFail}
                    >
                      <span aria-hidden>{passed ? "✓" : "•"}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}

            <div className={styles.strengthBlock}>
              <div className={styles.strengthMeta}>
                <span>Password strength</span>
                <strong>{completedCount}/5</strong>
              </div>

              <div className={styles.strengthBar}>
                <div className={styles[`strength${completedCount}`]} />
              </div>
            </div>

            <button
              type="submit"
              className={styles.submit}
              disabled={!valid || sending}
            >
              {sending ? "Signing in..." : "Login"}
            </button>

            <p className={styles.footer}>
              Don’t have an account? <Link href="/signUpForm">Sign Up</Link>
            </p>
          </form>
        </section>
      </main>
    </>
  );
}