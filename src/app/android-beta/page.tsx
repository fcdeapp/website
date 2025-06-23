"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion, AnimatePresence } from "framer-motion";
import styles from '../../styles/pages/AndroidBeta.module.css'
import WebFooter from "../../components/WebFooter";
import RecordingModal from "../../components/RecordingModal";

type CarouselItem = {
  label: string;
  image: string;
};

type Screenshot = {
  name: string;
  src: string;
};

export default function AndroidBeta() {
  const [videoOrder, setVideoOrder] = useState<string[]>([
    "/DemoAbrody_1.mp4",
    "/DemoAbrody_2.mp4",
    "/DemoAbrody_3.mp4",
  ]);

  const journeyItems: CarouselItem[] = [
    { label: "내 실수가 곧 퀴즈로", image: "/journey/iPhoneJourney.jpg" },
    { label: "AI 친구와 자유로운 대화", image: "/journey/iPhoneJourney2.jpg" },
    { label: "AI가 복습카드 자동 생성", image: "/journey/iPhoneJourney3.jpg" },
    { label: "내 언어로 만나는 친구들", image: "/journey/iPhoneJourney4.jpg" },
    { label: "실시간 문법 체크", image: "/journey/iPhoneJourney5.jpg" },
    { label: "관심사로 만나는 모임", image: "/journey/iPhoneJourney6.jpg" },
    { label: "근처 언어모임에 참여", image: "/journey/iPhoneJourney7.jpg" },
  ];

  //--- 상태 관리 ---
  const [journeyOrder, setJourneyOrder] = useState<CarouselItem[]>(journeyItems);
  const [shotIdx, setShotIdx] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  //--- AOS 초기화 ---
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  //--- 비디오 순서 자동 순환 애니메이션 ---
  useEffect(() => {
    const iv = setInterval(() => {
      setVideoOrder((prev) => {
        // 맨 앞을 뒤로 보내는 로테이션
        return [...prev.slice(1), prev[0]];
      });
    }, 5000); // 5초마다 순환
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setJourneyOrder((prev) => [...prev.slice(1), prev[0]]);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const openModal = (src: string) => setModalImage(src);
  const closeModal = () => setModalImage(null);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Abrody | 안드로이드 베타테스터 모집</title>
      </Head>

      <div className={styles.container}>
        {/* Hero */}
        <header className={styles.hero} data-aos="fade-in">
          <div className={styles.heroOverlay}>
            <h1 className={styles.title} data-aos="fade-up">Abrody</h1>
            <p className={styles.subtitle} data-aos="fade-up" data-aos-delay={300}>
              여러분들의 의견을 듣고싶어요
            </p>
            <div className={styles.heroHint} data-aos="fade-up" data-aos-delay={500}>
              아래로 스크롤하기
            </div>
            <div className={styles.heroArrows} data-aos="fade-up" data-aos-delay={600}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </header>

        <section className={styles.videoSection}>
          <video
            src="/videos/GoogleAdsProjectKR250617(2).mp4"
            className={styles.fullscreenVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        </section>

            <div className={styles.languageConcept} data-aos="fade-up">
              <img
                src="/images/GoogleAdsBannerKR.jpg"
                alt="Language Journey"
                className={styles.languageImage}
              />
            </div>
            <div className={styles.languageConcept} data-aos="fade-up">
              <img
                src="/images/language_conceptKR.jpg"
                alt="Language Journey"
                className={styles.languageImage}
              />
            </div>

        <main className={styles.main}>
          <div className={styles.journeyHeader}>
            <h2 className={styles.sectionTitle}>내 대화가 즉시 언어교재로</h2>
            <p className={styles.sectionSubtitle}>
            AI 친구와 자연스럽게 이야기하고,  
            실수는 바로 나만의 퀴즈로,  
            내가 한 말은 자동으로 복습카드로 만들어집니다.
            </p>
          </div>
          <motion.div className={styles.journeyContainer} layout>
            {journeyOrder.slice(0, 5).map((item) => (
              <motion.div
                key={item.label}
                className={styles.journeyItemContainer}
                layout
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <img
                  src={item.image}
                  alt={item.label}
                  className={styles.carouselImage}
                />
                <p className={styles.carouselItem}>{item.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* App Demo Videos */}
          <section className={styles.section} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>앱 시연 영상</h2>
            <p className={styles.sectionSubtitleSmall}>
            Abrody 커뮤니티에 참여하세요.  
            모임, 대화, 복습까지 모든 순간이  
            나만의 언어 여정이 됩니다.
            </p>
            <motion.div
              className={styles.demoVideosContainer}
              layout
            >
              {videoOrder.map((src) => (
                <motion.video
                  key={src}
                  className={styles.demoVideo}
                  src={src}
                  autoPlay
                  muted
                  playsInline
                  loop
                  preload="metadata"
                  layout
                  transition={{ layout: { duration: 0.8, ease: "easeInOut" } }}
                />
              ))}
            </motion.div>
          </section>

          <section className={styles.section} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>나만을 위한 언어학습</h2>
            <p className={styles.sectionText}>
            부담 없이 말하고,  
            필요한 표현만 똑똑하게 배워보세요.
            </p>
            <img
              src="/images/speak_chat_master_owl.jpg"
              alt="Speak. Chat. Master."
              className={styles.recordButtonImage}
            />
          </section>

          {/* Beta Section */}
          <section className={styles.section} data-aos="fade-up">
          <div className={styles.betaCard}>
            <h2 className={styles.betaTitle}>안드로이드 베타테스터 모집</h2>
            {/* 메인 안내 문구 */}
            <p className={styles.betaSubtitle}>
                Abrody의 새로운 기능을<br />
                가장 먼저 경험해보고<br />
                여러분의 소중한 의견을 들려주세요!
            </p>
            <div className={styles.ctaButtons}>
                <a
                    href="/android-beta-redirect"
                    className={styles.ctaButton}
                    onClick={(e) => {
                        e.preventDefault();
                        (window as any).gtag_report_conversion("/android-beta-redirect");
                    }}
                >
                베타테스터 지원하기
                </a>
            </div>
            {/* 이벤트 안내 문구 (별도 스타일 적용) */}
            <div className={styles.eventNotice}>
                <span className={styles.eventMain}>🎁 베타테스터 이벤트</span><br />
                안드로이드 베타테스트에 참여하신 분 중<br />
                <strong>추첨을 통해 10분께 스타벅스 커피 기프티콘</strong>을 드립니다.<br />
                <span className={styles.eventDate}>* 추첨일: 7/1 예정</span>
            </div>
          </div>
          </section>

          <section className={styles.betaSection} data-aos="fade-up">
            <div className={styles.betaCard}>
              <h2 className={styles.betaTitle}>iOS 사용자이신가요?</h2>
              <p className={styles.betaSubtitle}>
              앱스토어에서 Abrody를 지금 바로 만나보세요.
              </p>
              <div className={styles.ctaButtons}>
                <a
                    href="https://apps.apple.com/kr/app/id6743047157"
                    className={styles.ctaButton}
                    onClick={(e) => {
                        e.preventDefault();
                        (window as any).gtag_report_conversion_ios("https://apps.apple.com/kr/app/id6743047157");
                    }}
                >
                  iOS 앱 다운로드
                </a>
              </div>
            </div>
          </section>
        </main>

        {/* Modal */}
        {modalImage && (
          <div className={styles.modal} onClick={closeModal}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={modalImage}
                alt="Enlarged screenshot"
                className={styles.modalImage}
              />
              <button className={styles.modalClose} onClick={closeModal}>
                X
              </button>
            </div>
          </div>
        )}

        <WebFooter />
      </div>
    </>
  );
}
