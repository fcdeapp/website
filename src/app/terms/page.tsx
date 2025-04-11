"use client";

import React, { useState, useEffect } from "react";
import styles from "../../styles/pages/Terms.module.css";
import WebFooter from "../../components/WebFooter";
import Licenses from "../../components/Licenses";

type TermsType = "service" | "privacy" | "community";

const languageOptions = [
  { code: "ar", label: "Arabic" },
  { code: "de", label: "German" },
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "hi", label: "Hindi" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "pt", label: "Portuguese" },
  { code: "ru", label: "Russian" },
  { code: "zh", label: "Chinese" }
];

export default function TermsPage() {
  const [termsContent, setTermsContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [termsLanguage, setTermsLanguage] = useState("en");
  const [termsType, setTermsType] = useState<TermsType>("privacy");
  const [licensesVisible, setLicensesVisible] = useState(false);

  // 페이지 로드시 localStorage에 저장된 TermsType 값 반영 후 삭제
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedType = localStorage.getItem("termsType") as TermsType | null;
      if (storedType) {
        setTermsType(storedType);
        localStorage.removeItem("termsType");
      }
    }
  }, []);

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

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTermsLanguage(e.target.value);
  };

  const handleTermsTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTermsType(e.target.value as TermsType);
  };

  const toggleLicenses = () => {
    setLicensesVisible((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {termsType === "service"
            ? termsLanguage !== "ko"
              ? "Terms of Service"
              : "서비스 이용약관"
            : termsType === "privacy"
            ? termsLanguage !== "ko"
              ? "Privacy Policy"
              : "개인정보처리방침"
            : termsLanguage !== "ko"
            ? "Community Guidelines"
            : "커뮤니티 이용약관"}
        </h1>
        <div className={styles.controls}>
          <div className={styles.selectWrapper}>
            <label htmlFor="termsType" className={styles.selectLabel}>
              Type
            </label>
            <select
              id="termsType"
              className={styles.select}
              value={termsType}
              onChange={handleTermsTypeChange}
            >
              <option value="service">
                {termsLanguage !== "ko" ? "Terms of Service" : "서비스 이용약관"}
              </option>
              <option value="privacy">
                {termsLanguage !== "ko" ? "Privacy Policy" : "개인정보처리방침"}
              </option>
              <option value="community">
                {termsLanguage !== "ko" ? "Community Guidelines" : "커뮤니티 이용약관"}
              </option>
            </select>
          </div>
          <div className={styles.selectWrapper}>
            <label htmlFor="language" className={styles.selectLabel}>
              Language
            </label>
            <select
              id="language"
              className={styles.select}
              value={termsLanguage}
              onChange={handleLanguageChange}
            >
              {languageOptions.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>
      <main className={styles.main}>
        {isLoading ? (
          <p className={styles.loading}>Loading terms...</p>
        ) : (
          <section className={styles.content}>
            <p>{termsContent}</p>
          </section>
        )}
        <button className={styles.licensesButton} onClick={toggleLicenses}>
          {licensesVisible ? "Close Licenses" : "View Licenses"}
        </button>
      </main>
      <WebFooter />
      {licensesVisible && <Licenses onClose={() => setLicensesVisible(false)} />}
    </div>
  );
}
