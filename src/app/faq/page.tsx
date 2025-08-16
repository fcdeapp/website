"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import axios from "axios";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../../styles/pages/Faq.module.css";
import WebFooter from "../../components/WebFooter";

// QnA 항목 타입 선언
interface QnAItem {
  question: string;
  answer: string;
}

export default function Faq() {
  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL;

  const [qnaData, setQnaData] = useState<QnAItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [inquiryVisible, setInquiryVisible] = useState(false);
  const [inquiryText, setInquiryText] = useState("");
  const [loading, setLoading] = useState<boolean>(true);

  // 다국어 처리(예시: i18n 사용 시) 및 번역 함수는 필요 시 추가하세요.
  const t = (text: string, fallback?: string) => fallback || text;

  useEffect(() => {
    AOS.init({ duration: 900, once: true });

    const fetchQnA = async () => {
      try {
        const lang = "en"; // 다국어 적용 시 i18n.language 등을 활용
        const response = await axios.get(`${SERVER_URL}/api/qna?lang=${lang}`);
        setQnaData(response.data || []);
      } catch (error: any) {
        console.error("Error fetching QnA data:", error);
        alert(t("error", "Error") + ": " + t("failed_to_load_qna", "Failed to load FAQ data."));
      } finally {
        setLoading(false);
      }
    };

    fetchQnA();
  }, [SERVER_URL]);

  const toggleItem = (index: number) => {
    setExpandedItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const onKeyToggle = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleItem(index);
    }
  };

  const submitInquiry = async () => {
    if (!inquiryText.trim()) {
      alert(t("error", "Error") + ": " + t("enter_inquiry_text", "Please enter your inquiry."));
      return;
    }

    try {
      const response = await axios.post(
        `${SERVER_URL}/report/inquiries`,
        {
          reason: inquiryText,
          type: "inquiry",
        },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status !== 200) {
        throw new Error(response.data?.message || "Failed to submit inquiry");
      }

      alert(
        t("inquiry_submitted", "Inquiry submitted") +
          "\n" +
          t("inquiry_received", "We have received your inquiry.")
      );
      setInquiryVisible(false);
      setInquiryText("");
    } catch (error: any) {
      console.error(t("error_submitting_inquiry", "Error submitting inquiry"), error);
      alert(
        t("error", "Error") +
          ": " +
          (error.message ||
            t("error_occurred_during_submission", "An error occurred during submission."))
      );
    }
  };

  return (
    <>
      <Head>
        <title>{t("faq_header", "Frequently Asked Questions")} | Abrody</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* ===== Hero ===== */}
      <header className={styles.hero} data-aos="fade-down">
        <div className={styles.starfield} aria-hidden />
        <div className={styles.heroInner}>
          <span className={styles.sectionKicker}>Support</span>
          <h1 className={styles.heroTitle}>{t("faq_header", "Frequently Asked Questions")}</h1>
          <p className={styles.heroSubtitle}>
            {t(
              "faq_subtitle",
              "Find answers to common questions, tips, and how Abrody works."
            )}
          </p>
          <a href="#faq-list" className={styles.scrollHint}>
            ↓ Browse questions
          </a>
        </div>
      </header>

      {/* ===== Main ===== */}
      <main className={styles.section} id="faq-list">
        {/* 로딩 스켈레톤 */}
        {loading && (
          <div className={styles.skeletonWrap}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div className={styles.skeletonCard} key={i} />
            ))}
          </div>
        )}

        {/* FAQ 리스트 */}
        {!loading && qnaData.length > 0 && (
          <div
            className={styles.faqList}
            data-aos="fade-up"
            data-aos-delay="50"
            aria-label="Frequently Asked Questions"
          >
            {qnaData.map((item, index) => {
              const isOpen = expandedItems.includes(index);
              return (
                <div
                  key={index}
                  className={`${styles.faqCard} ${isOpen ? styles.open : ""}`}
                  onClick={() => toggleItem(index)}
                  onKeyDown={(e) => onKeyToggle(e, index)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${index}`}
                  data-aos="fade-up"
                  data-aos-delay={`${index * 60}`}
                >
                  <div className={styles.cardHead}>
                    <h2 className={styles.question}>{t(item.question, item.question)}</h2>
                    <svg
                      className={`${styles.chev} ${isOpen ? styles.chevOpen : ""}`}
                      width="22"
                      height="22"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 9l6 6 6-6"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>

                  <div
                    id={`faq-panel-${index}`}
                    className={`${styles.answerWrap} ${isOpen ? styles.open : ""}`}
                  >
                    <p className={styles.answer}>{t(item.answer, item.answer)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && qnaData.length === 0 && (
          <div className={styles.emptyCard} data-aos="zoom-in">
            <h3>No FAQs yet</h3>
            <p>
              We’re preparing helpful answers. In the meantime, feel free to reach out with
              your questions.
            </p>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setInquiryVisible(true)}>
              Ask a question
            </button>
          </div>
        )}

        {/* 문의하기 CTA 스트립 */}
        <div className={styles.inquiryStrip} data-aos="zoom-in" data-aos-delay="120">
          <div className={styles.inquiryText}>
            <strong>Still need help?</strong> Send us your question — we’ll get back to you.
          </div>
          <button
            className={`${styles.btn} ${styles.btnLight}`}
            onClick={() => setInquiryVisible(true)}
          >
            Contact support
          </button>
        </div>
      </main>

      {/* ===== 문의하기 모달 ===== */}
      {inquiryVisible && (
        <div className={styles.modalOverlay} onClick={() => setInquiryVisible(false)}>
          <div
            className={styles.modalBody}
            onClick={(e) => e.stopPropagation()}
            data-aos="zoom-in"
          >
            <button
              className={styles.modalClose}
              onClick={() => setInquiryVisible(false)}
              aria-label="Close modal"
            >
              ✕
            </button>

            <h2 className={styles.modalHeader}>{t("inquiry_title", "Submit Your Inquiry")}</h2>
            <textarea
              className={styles.modalInput}
              placeholder={t("inquiry_placeholder", "Type your inquiry here...")}
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              rows={6}
            />
            <div className={styles.modalActions}>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={submitInquiry}>
                {t("submit", "Submit")}
              </button>
              <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setInquiryVisible(false)}>
                {t("cancel", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      <WebFooter />
    </>
  );
}
