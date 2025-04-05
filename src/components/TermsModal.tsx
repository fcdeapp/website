"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useConfig } from "../context/ConfigContext";
import styles from "../styles/components/TermsModal.module.css";

interface TermsModalProps {
  visible: boolean;
  type: "service" | "privacy" | "community";
  onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ visible, type, onClose }) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const [termsContent, setTermsContent] = useState<string>("");
  const [termsLanguage, setTermsLanguage] = useState<string>("en");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userMainLanguage, setUserMainLanguage] = useState<string>("en");

  // 서버에서 약관 내용을 가져오는 함수
  const fetchTerms = async (termsType: string, lang: string) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${SERVER_URL}/api/terms/${termsType}/${lang}`);
      if (response.status >= 200 && response.status < 300) {
        setTermsContent(response.data.content);
        setTermsLanguage(lang);
      } else {
        throw new Error(t("failed_to_load_terms"));
      }
    } catch (error: any) {
      console.error(t("error_fetching_terms"), error);
      window.alert(t("error") + ": " + t("failed_to_load_terms"));
    } finally {
      setIsLoading(false);
    }
  };

  // 언어 토글 함수: 현재 약관이 영어면 사용자의 언어(저장된 값)로, 아니면 영어('en')로 변경
  const toggleTermsLanguage = async () => {
    let storedLang = localStorage.getItem("language");
    if (!storedLang) {
      storedLang = "en";
      localStorage.setItem("language", storedLang);
    }
    const newLang = termsLanguage === "en" ? storedLang : "en";
    fetchTerms(type, newLang);
  };

  // 이메일 형식을 감지하여 스타일을 적용하는 함수
  const renderStyledText = (content: string) => {
    const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    const parts = content.split(emailRegex);
    return parts.map((part, index) => {
      if (emailRegex.test(part)) {
        return (
          <span key={index} className={styles.email}>
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // 초기 언어 설정: localStorage에서 저장된 언어(없으면 'en')를 사용하여 약관 내용 로드
  useEffect(() => {
    const initializeLanguage = async () => {
      let lang = localStorage.getItem("language");
      if (!lang) {
        lang = "en";
        localStorage.setItem("language", lang);
      }
      setUserMainLanguage(lang);
      setTermsLanguage(lang);
      fetchTerms(type, lang);
    };
    if (visible) {
      initializeLanguage();
    }
  }, [visible, type]);

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <button className={styles.overlayCloseIcon} onClick={onClose}>
          <img src="/assets/delete-icon-big.png" alt="Close" className={styles.closeIcon} />
        </button>
        <h2 className={styles.overlayTitle}>
          {type === "service" && t("terms_of_service")}
          {type === "privacy" && t("privacy_policy")}
          {type === "community" && t("community_rules")}
        </h2>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
          </div>
        ) : (
          <div className={styles.overlayScroll}>
            <p className={styles.termsText}>{renderStyledText(termsContent)}</p>
            {userMainLanguage !== "en" && (
              <button className={styles.languageToggleButton} onClick={toggleTermsLanguage}>
                {termsLanguage === "en" ? t("view_in_my_language") : t("view_in_english")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsModal;
