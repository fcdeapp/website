"use client";

import React, { useEffect, useState } from "react";
import styles from "../../styles/pages/Terms.module.css";

type TermsType = "service" | "privacy" | "community";

export default function TermsPage() {
  const [termsContent, setTermsContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [termsLanguage, setTermsLanguage] = useState("en");
  const [termsType, setTermsType] = useState<TermsType>("privacy");

  const fetchTerms = async (lang: string, type: TermsType) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/terms/${type}/${lang}`
      );
      if (!res.ok) {
        throw new Error("Failed to load terms");
      }
      const data = await res.json();
      setTermsContent(data.content);
    } catch (error) {
      console.error("Error fetching terms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms(termsLanguage, termsType);
  }, [termsLanguage, termsType]);

  const toggleLanguage = () => {
    setTermsLanguage((prev) => (prev === "en" ? "ko" : "en"));
  };

  const handleTermsTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTermsType(e.target.value as TermsType);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {termsType === "service"
            ? termsLanguage === "en"
              ? "Terms of Service"
              : "서비스 이용약관"
            : termsType === "privacy"
            ? termsLanguage === "en"
              ? "Privacy Policy"
              : "개인정보처리방침"
            : termsLanguage === "en"
            ? "Community Guidelines"
            : "커뮤니티 이용약관"}
        </h1>
        <div className={styles.controls}>
          <button onClick={toggleLanguage} className={styles.toggleButton}>
            {termsLanguage === "en" ? "View in Korean" : "View in English"}
          </button>
          <select
            className={styles.select}
            value={termsType}
            onChange={handleTermsTypeChange}
          >
            <option value="service">
              {termsLanguage === "en" ? "Terms of Service" : "서비스 이용약관"}
            </option>
            <option value="privacy">
              {termsLanguage === "en" ? "Privacy Policy" : "개인정보처리방침"}
            </option>
            <option value="community">
              {termsLanguage === "en" ? "Community Guidelines" : "커뮤니티 이용약관"}
            </option>
          </select>
        </div>
      </header>
      <main className={styles.main}>
        {isLoading ? (
          <p>Loading terms...</p>
        ) : (
          <section className={styles.content}>
            <p>{termsContent}</p>
          </section>
        )}
      </main>
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Doh Jung‑min. All rights reserved.
      </footer>
    </div>
  );
}
