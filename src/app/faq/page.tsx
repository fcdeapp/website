"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../../styles/pages/Faq.module.css";
import Link from "next/link";
import WebFooter from "../../components/WebFooter";

// QnA 항목 타입 선언
interface QnAItem {
  question: string;
  answer: string;
}

export default function Faq() {
  // API URL 등은 환경변수 혹은 Context 등을 활용하세요.
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;
  const [qnaData, setQnaData] = useState<QnAItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [inquiryVisible, setInquiryVisible] = useState(false);
  const [inquiryText, setInquiryText] = useState("");

  // 다국어 처리(예시: i18n 사용 시) 및 번역 함수는 필요 시 추가하세요.
  const t = (text: string, fallback?: string) => fallback || text;

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });

    const fetchQnA = async () => {
      try {
        const lang = "en"; // 다국어 적용 시 i18n.language 등을 활용
        const response = await axios.get(`${SERVER_URL}/api/qna?lang=${lang}`);
        setQnaData(response.data);
      } catch (error: any) {
        console.error("Error fetching QnA data:", error);
        alert(t("error", "Error") + ": " + t("failed_to_load_qna", "Failed to load FAQ data."));
      }
    };

    fetchQnA();
  }, [SERVER_URL]);

  const toggleItem = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const submitInquiry = async () => {
    if (!inquiryText.trim()) {
      alert(t("error", "Error") + ": " + t("enter_inquiry_text", "Please enter your inquiry."));
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(t("auth_token_missing", "Authentication token missing."));
      }

      const response = await axios.post(
        `${SERVER_URL}/report/inquiries`,
        {
          reason: inquiryText,
          type: "inquiry",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200) {
        throw new Error(response.data.message || "Failed to submit inquiry");
      }

      alert(t("inquiry_submitted", "Inquiry submitted") + "\n" + t("inquiry_received", "We have received your inquiry."));
      setInquiryVisible(false);
      setInquiryText("");
    } catch (error: any) {
      console.error(t("error_submitting_inquiry", "Error submitting inquiry"), error);
      alert(t("error", "Error") + ": " + (error.message || t("error_occurred_during_submission", "An error occurred during submission.")));
    }
  };

  return (
    <>
      <Head>
        <title>{t("faq_header", "Frequently Asked Questions")} | Facade</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <div className={styles.container}>
        <header className={styles.headerSection} data-aos="fade-down">
          <h1 className={styles.headerTitle}>{t("faq_header", "Frequently Asked Questions")}</h1>
          <p className={styles.headerSubtitle}>
            {t("faq_subtitle", "Find answers to some of the most common questions.")}
          </p>
        </header>

        <main className={styles.mainContent}>
          {qnaData.map((item, index) => (
            <div
              key={index}
              className={styles.card}
              onClick={() => toggleItem(index)}
              data-aos="fade-up"
              data-aos-delay={`${index * 100}`}
            >
              <h2 className={styles.question}>
                {t(item.question, item.question)}
              </h2>
              <p className={styles.answer}>
                {t(item.answer, item.answer)}
              </p>
              {/*
                답변 텍스트의 접힘/펼침 처리는 CSS line-clamp 방식이나
                자바스크립트로 조절할 수 있으나 여기서는 단순 노출로 처리.
              */}
            </div>
          ))}
          {/* 문의하기 버튼 */}
          <div className={styles.inquirySection} data-aos="zoom-in" data-aos-delay="200">
            <button className={styles.inquiryButton} onClick={() => setInquiryVisible(true)}>
              <img
                src="/assets/friend-icon.png"
                alt="Inquiry Icon"
                className={styles.icon}
              />
              {t("cannot_find_answer", "Can't find your answer? Contact us!")}
            </button>
          </div>
        </main>

        {/* 문의하기 모달 */}
        {inquiryVisible && (
          <div className={styles.modalOverlay} onClick={() => setInquiryVisible(false)}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()} data-aos="zoom-in">
              <h2 className={styles.modalHeader}>{t("inquiry_title", "Submit Your Inquiry")}</h2>
              <textarea
                className={styles.modalInput}
                placeholder={t("inquiry_placeholder", "Type your inquiry here...")}
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                rows={5}
              />
              <div className={styles.modalButtonContainer}>
                <button className={styles.primaryButton} onClick={submitInquiry}>
                  {t("submit", "Submit")}
                </button>
                <button className={styles.cancelButton} onClick={() => setInquiryVisible(false)}>
                  {t("cancel", "Cancel")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <WebFooter />
    </>
  );
}
