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
  { code: "zh", label: "Chinese" },
];

// 업데이트된 formatContent 함수:
// - 콘텐츠를 줄 단위로 분리
// - 첫 번째 줄은 .firstLine, 숫자. 으로 시작하는 줄은 .listLine, 그 외는 .bodyText로 감쌉니다.
// - 각 줄 내 날짜(YYYY-MM-DD)와 이메일 형식은 각각 .date, .email 클래스로 감쌉니다.
const formatContent = (content: string): string => {
  const lines = content.split(/\r?\n/);
  return lines
    .map((line, index) => {
      let wrapped = "";
      if (index === 0) {
        wrapped = `<span class="${styles.firstLine}">${line}</span>`;
      } else if (/^\d+\.\s+/.test(line)) {
        wrapped = `<span class="${styles.listLine}">${line}</span>`;
      } else {
        wrapped = `<span class="${styles.bodyText}">${line}</span>`;
      }
      // 날짜: YYYY-MM-DD
      const dateRegex = /(\d{4}-\d{2}-\d{2})/g;
      wrapped = wrapped.replace(
        dateRegex,
        `<span class="${styles.date}">$1</span>`
      );
      // 이메일 형식
      const emailRegex = /([\w\.-]+@[\w\.-]+\.[A-Za-z]{2,6})/g;
      wrapped = wrapped.replace(
        emailRegex,
        `<span class="${styles.email}">$1</span>`
      );
      return wrapped;
    })
    .join("<br/>");
};

export default function TermsPage() {
  const [termsContent, setTermsContent] = useState("");
  const [formattedContent, setFormattedContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [termsLanguage, setTermsLanguage] = useState("en");
  const [termsType, setTermsType] = useState<TermsType>("privacy");
  const [licensesVisible, setLicensesVisible] = useState(false);

  // 저장된 termsType 반영 후 제거
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("termsType") as TermsType | null;
      if (stored) {
        setTermsType(stored);
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

  useEffect(() => {
    setFormattedContent(formatContent(termsContent));
  }, [termsContent]);

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
        <span className={styles.kicker}>Legal</span>
        <h1 className={styles.title}>
          <span className={styles.brandGradientText}>
            {termsType === "service"
              ? termsLanguage !== "ko" ? "Terms of Service" : "서비스 이용약관"
              : termsType === "privacy"
              ? termsLanguage !== "ko" ? "Privacy Policy" : "개인정보처리방침"
              : termsLanguage !== "ko" ? "Community Guidelines" : "커뮤니티 이용약관"}
          </span>
        </h1>
        <p className={styles.subtitle}>
          Keep things clear and respectful. Choose a <strong>type</strong> and <strong>language</strong> below.
        </p>

        {/* 컨트롤 바는 헤더 안으로 끌어올려 시각적으로 묶어줌 */}
        <div className={styles.controls}>
          <div className={styles.controlCard}>
            <div className={styles.selectRow}>
              <div className={styles.selectWrapper}>
                <label htmlFor="termsType" className={styles.selectLabel}>Type</label>
                <select id="termsType" className={styles.select} value={termsType} onChange={handleTermsTypeChange}>
                  <option value="service">{termsLanguage !== "ko" ? "Terms of Service" : "서비스 이용약관"}</option>
                  <option value="privacy">{termsLanguage !== "ko" ? "Privacy Policy" : "개인정보처리방침"}</option>
                  <option value="community">{termsLanguage !== "ko" ? "Community Guidelines" : "커뮤니티 이용약관"}</option>
                </select>
              </div>
              <div className={styles.selectWrapper}>
                <label htmlFor="language" className={styles.selectLabel}>Language</label>
                <select id="language" className={styles.select} value={termsLanguage} onChange={handleLanguageChange}>
                  {languageOptions.map((lang) => (
                    <option key={lang.code} value={lang.code}>{lang.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className={styles.metaHint}>
              <span className={styles.metaDot} /> Updated content is fetched dynamically.
            </div>
          </div>
        </div>
      </header>
      <main className={styles.main}>
      {isLoading ? (
        <div className={styles.skeleton}>
          <div className={styles.skelLine} />
          <div className={styles.skelLine} />
          <div className={styles.skelLineShort} />
        </div>
      ) : (
        <section className={styles.content}>
          <p dangerouslySetInnerHTML={{ __html: formattedContent }} />
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
