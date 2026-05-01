"use client";

import React, { useEffect, useMemo, useState } from "react";
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

const termsMeta: Record<
  TermsType,
  {
    labelEn: string;
    labelKo: string;
    eyebrow: string;
    descriptionEn: string;
    descriptionKo: string;
  }
> = {
  service: {
    labelEn: "Terms of Service",
    labelKo: "서비스 이용약관",
    eyebrow: "Service Rules",
    descriptionEn:
      "Understand the rules for using Abrody safely, fairly, and responsibly.",
    descriptionKo:
      "Abrody를 안전하고 공정하게 이용하기 위한 기본 약관을 확인하세요.",
  },
  privacy: {
    labelEn: "Privacy Policy",
    labelKo: "개인정보처리방침",
    eyebrow: "Privacy & Data",
    descriptionEn:
      "Review how Abrody handles personal information and protects your data.",
    descriptionKo:
      "Abrody가 개인정보를 어떻게 처리하고 보호하는지 확인하세요.",
  },
  community: {
    labelEn: "Community Guidelines",
    labelKo: "커뮤니티 이용약관",
    eyebrow: "Community Safety",
    descriptionEn:
      "Keep the community respectful, welcoming, and useful for language learning.",
    descriptionKo:
      "서로 존중하는 언어 학습 커뮤니티를 위한 이용 기준을 확인하세요.",
  },
};

const escapeHtml = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const formatContent = (content: string): string => {
  const safeContent = escapeHtml(content || "");
  const lines = safeContent.split(/\r?\n/);

  return lines
    .map((line, index) => {
      let wrapped = "";

      if (index === 0) {
        wrapped = `<span class="${styles.firstLine}">${line}</span>`;
      } else if (/^\d+\.\s+/.test(line)) {
        wrapped = `<span class="${styles.listLine}">${line}</span>`;
      } else if (/^\s*[-•]\s+/.test(line)) {
        wrapped = `<span class="${styles.bulletLine}">${line}</span>`;
      } else if (line.trim().length === 0) {
        wrapped = `<span class="${styles.blankLine}">&nbsp;</span>`;
      } else {
        wrapped = `<span class="${styles.bodyText}">${line}</span>`;
      }

      const dateRegex = /(\d{4}-\d{2}-\d{2})/g;
      wrapped = wrapped.replace(
        dateRegex,
        `<span class="${styles.date}">$1</span>`
      );

      const emailRegex = /([\w.-]+@[\w.-]+\.[A-Za-z]{2,6})/g;
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
  const [isLoading, setIsLoading] = useState(false);
  const [termsLanguage, setTermsLanguage] = useState("en");
  const [termsType, setTermsType] = useState<TermsType>("privacy");
  const [licensesVisible, setLicensesVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isKo = termsLanguage === "ko";

  const activeMeta = useMemo(() => {
    return termsMeta[termsType];
  }, [termsType]);

  const formattedContent = useMemo(() => {
    return formatContent(termsContent);
  }, [termsContent]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("termsType") as TermsType | null;

      if (
        stored === "service" ||
        stored === "privacy" ||
        stored === "community"
      ) {
        setTermsType(stored);
        localStorage.removeItem("termsType");
      }
    }
  }, []);

  const fetchTerms = async (lang: string, type: TermsType) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/terms/${type}/${lang}`
      );

      if (!res.ok) {
        throw new Error("Failed to load terms");
      }

      const data = await res.json();
      setTermsContent(typeof data?.content === "string" ? data.content : "");
    } catch (error) {
      console.error("Error fetching terms:", error);
      setTermsContent("");
      setErrorMessage(
        isKo
          ? "약관을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요."
          : "We couldn’t load this document. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms(termsLanguage, termsType);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <main className={styles.pageShell}>
        <section className={styles.heroSection}>
          <div className={styles.bgOrbOne} />
          <div className={styles.bgOrbTwo} />
          <div className={styles.bgGrid} />

          <div className={styles.heroInner}>
            <div className={styles.heroVisual} aria-hidden="true">
              <div className={styles.floatingCard}>
                <div className={styles.paperTop} />
                <div className={styles.paperLineLong} />
                <div className={styles.paperLineMedium} />
                <div className={styles.paperLineShort} />
                <div className={styles.paperSeal}>A</div>
              </div>
            </div>

            <div className={styles.heroTextBlock}>
              <span className={styles.kicker}>{activeMeta.eyebrow}</span>

              <h1 className={styles.title}>
                {isKo ? activeMeta.labelKo : activeMeta.labelEn}
              </h1>

              <p className={styles.subtitle}>
                {isKo ? activeMeta.descriptionKo : activeMeta.descriptionEn}
              </p>

              <div className={styles.quickPills} aria-label="Legal categories">
                <button
                  type="button"
                  className={`${styles.quickPill} ${
                    termsType === "privacy" ? styles.quickPillActive : ""
                  }`}
                  onClick={() => setTermsType("privacy")}
                >
                  Privacy
                </button>
                <button
                  type="button"
                  className={`${styles.quickPill} ${
                    termsType === "service" ? styles.quickPillActive : ""
                  }`}
                  onClick={() => setTermsType("service")}
                >
                  Service
                </button>
                <button
                  type="button"
                  className={`${styles.quickPill} ${
                    termsType === "community" ? styles.quickPillActive : ""
                  }`}
                  onClick={() => setTermsType("community")}
                >
                  Community
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.controlSection}>
          <div className={styles.controlCard}>
            <div className={styles.controlHeader}>
              <span className={styles.controlTitle}>
                {isKo ? "문서 설정" : "Document settings"}
              </span>
              <span className={styles.controlHint}>
                {isKo
                  ? "유형과 언어를 선택하면 내용이 자동으로 업데이트됩니다."
                  : "Choose a type and language to refresh the document."}
              </span>
            </div>

            <div className={styles.selectRow}>
              <label className={styles.selectWrapper} htmlFor="termsType">
                <span className={styles.selectLabel}>
                  {isKo ? "문서 유형" : "Type"}
                </span>
                <select
                  id="termsType"
                  className={styles.select}
                  value={termsType}
                  onChange={handleTermsTypeChange}
                >
                  <option value="service">
                    {isKo ? "서비스 이용약관" : "Terms of Service"}
                  </option>
                  <option value="privacy">
                    {isKo ? "개인정보처리방침" : "Privacy Policy"}
                  </option>
                  <option value="community">
                    {isKo ? "커뮤니티 이용약관" : "Community Guidelines"}
                  </option>
                </select>
              </label>

              <label className={styles.selectWrapper} htmlFor="language">
                <span className={styles.selectLabel}>
                  {isKo ? "언어" : "Language"}
                </span>
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
              </label>
            </div>
          </div>
        </section>

        <section className={styles.documentSection}>
          <div className={styles.documentCard}>
            <div className={styles.documentTopBar}>
              <div>
                <span className={styles.documentKicker}>Abrody Legal</span>
                <h2 className={styles.documentTitle}>
                  {isKo ? activeMeta.labelKo : activeMeta.labelEn}
                </h2>
              </div>

              <span className={styles.statusBadge}>
                <span className={styles.statusDot} />
                {isLoading ? (isKo ? "불러오는 중" : "Loading") : "Live"}
              </span>
            </div>

            {isLoading ? (
              <div className={styles.skeleton} aria-label="Loading document">
                <div className={styles.skelLine} />
                <div className={styles.skelLineWide} />
                <div className={styles.skelLine} />
                <div className={styles.skelLineShort} />
                <div className={styles.skelBlock} />
              </div>
            ) : errorMessage ? (
              <div className={styles.errorBox}>
                <span className={styles.errorTitle}>
                  {isKo ? "문서를 불러올 수 없습니다" : "Unable to load document"}
                </span>
                <p>{errorMessage}</p>
              </div>
            ) : (
              <article className={styles.content}>
                <p dangerouslySetInnerHTML={{ __html: formattedContent }} />
              </article>
            )}
          </div>

          <div className={styles.licenseArea}>
            <button className={styles.licensesButton} onClick={toggleLicenses}>
              <span className={styles.licenseIcon}>i</span>
              {licensesVisible
                ? isKo
                  ? "라이선스 닫기"
                  : "Close Licenses"
                : isKo
                ? "오픈소스 라이선스 보기"
                : "View Licenses"}
            </button>
          </div>
        </section>
      </main>

      <WebFooter />

      {licensesVisible && <Licenses onClose={() => setLicensesVisible(false)} />}
    </div>
  );
}