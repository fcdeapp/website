"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/Home.module.css";
import WebFooter from "../components/WebFooter";
import RecordingModal from "../components/RecordingModal";

type CarouselItem = {
  label: string;
  image: string;
};

type Screenshot = {
  name: string;
  src: string;
};

export default function Home() {
  const [videoOrder, setVideoOrder] = useState<string[]>([
    "/fr_1.mp4",
    "/fr_2.mp4",
    "/fr_3.mp4",
  ]);

  const journeyItems: CarouselItem[] = [
    { label: "1", image: "/journey/AppStoreImageiPhoneEN2508111.jpg" },
    { label: "2", image: "/journey/AppStoreImageiPhoneEN2508112.jpg" },
    { label: "3", image: "/journey/AppStoreImageiPhoneEN2508113.jpg" },
    { label: "4", image: "/journey/AppStoreImageiPhoneEN2508114.jpg" },
    { label: "5", image: "/journey/AppStoreImageiPhoneEN2508115.jpg" },
    { label: "6", image: "/journey/AppStoreImageiPhoneEN2508116.jpg" },
    { label: "7", image: "/journey/AppStoreImageiPhoneEN2508117.jpg" },
    { label: "8", image: "/journey/AppStoreImageiPhoneEN2508118.jpg" },
    { label: "9", image: "/journey/AppStoreImageiPhoneEN2508119.jpg" },
    { label: "10", image: "/journey/AppStoreImageiPhoneEN25081110.jpg" },
  ];

  //--- 상태 관리 ---
  const [journeyOrder, setJourneyOrder] = useState<CarouselItem[]>(journeyItems);
  const [shotIdx, setShotIdx] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const languages = ["English", "Français", "Español", "中文", "日本語", "한국어"];
  // ② 현재 인덱스 관리
  const [langIndex, setLangIndex] = useState(0);

  // ③ 3초마다 인덱스 순환
  useEffect(() => {
    const iv = setInterval(() => {
      setLangIndex(i => (i + 1) % languages.length);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

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
        <title>Abrody | Connecting People Abroad</title>
        <meta name="description" content="With Abrody, every chat turns into personalized quizzes—learn smarter, see real progress, and enjoy language learning." />

        {/* Open Graph for link previews */}
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content="Abrody | Connecting People Abroad" />
        <meta property="og:description" content="With Abrody, every chat turns into personalized quizzes—learn smarter, see real progress, and enjoy language learning." />
        <meta property="og:image"       content="https://website.fcde.app/og-image.jpg" />
        <meta property="og:url"         content="https://website.fcde.app/" />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Abrody | Connecting People Abroad" />
        <meta name="twitter:description" content="With Abrody, every chat turns into personalized quizzes—learn smarter, see real progress, and enjoy language learning." />
        <meta name="twitter:image"       content="https://website.fcde.app/og-image.jpg" />
        <meta name="twitter:image:alt"   content="Abrody | Connecting People Abroad" />
      </Head>

      <div className={styles.container}>
      <header className={`${styles.hero} ${styles.heroBrand}`} data-aos="fade-in">
        <div className={styles.starfield} aria-hidden />
        <div className={styles.heroOverlay}>
            <h1 className={styles.title} data-aos="fade-up">
              The Easiest Way to Learn&nbsp;
              <AnimatePresence mode="wait">
                <motion.span
                  key={langIndex}
                  className={styles.dynamicLang}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {languages[langIndex]}
                </motion.span>
              </AnimatePresence>
              &nbsp;— From Your Own Words
            </h1>
            <p className={styles.subtitle} data-aos="fade-up" data-aos-delay={300}>
              Tried language apps but never felt like you were truly improving? <br />
              With Abrody, every chat — with AI or friends — instantly turns into personalized, interactive quizzes just for you.<br />
              Learn smarter, see real progress, and feel more engaged with your study.
            </p>
            <div className={styles.heroHint} data-aos="fade-up" data-aos-delay={500}>
              Swipe to Explore
            </div>
            <div className={styles.heroArrows} data-aos="fade-up" data-aos-delay={600}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </header>

        <main className={styles.main}>
        <div className={styles.journeyHeader}>
          <span className={styles.sectionKicker}>How it works</span>
          <h2 className={styles.sectionTitle}>
            Learn from Your Own Words, Not Someone Else’s
          </h2>
          <p className={styles.sectionLead}>
            Abrody transforms your real conversations into personalized quizzes.
            Progress you can feel, every day.
          </p>
        </div>

        <motion.div className={styles.journeyContainer} layout>
          {journeyOrder.slice(0, 5).map((item) => (
            <motion.div
              key={item.label}
              className={`${styles.journeyItemContainer} ${styles.card}`}
              layout
              transition={{ duration: 0.6, ease: "easeInOut" }}
              whileHover={{ y: -6 }}
            >
              <img
                src={item.image}
                alt={`App journey screen ${item.label}`}
                className={styles.carouselImage}
                loading="lazy"
              />
            </motion.div>
          ))}
        </motion.div>

          {/* App Demo Videos */}
          <section className={styles.section} data-aos="fade-up">
            <div className={styles.sectionHead}>
              <span className={styles.sectionKicker}>Product</span>
              <h2 className={styles.sectionTitle}>App Demo</h2>
              <p className={styles.sectionLeadSmall}>
                See how Abrody turns every chat into a quiz made just for you. 
                Speak, make mistakes, and learn naturally — it’s all automatic.
              </p>
            </div>

            <motion.div className={`${styles.demoVideosContainer} ${styles.demoRail}`} layout>
              {videoOrder.map((src) => (
                <motion.div key={src} className={styles.videoCard} layout>
                  <motion.video
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
                </motion.div>
              ))}
            </motion.div>
          </section>

          <section className={styles.section} data-aos="fade-up">
            <img
              src="/images/Ads250812EN.jpg"
              alt="Speak. Chat. Master."
              className={styles.recordButtonImage}
            />
          </section>

          <section className={styles.betaSection} data-aos="fade-up">
            <div className={`${styles.betaCard} ${styles.glassCard}`}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionKicker}>Download</span>
                <h2 className={styles.betaTitle}>Install on iOS</h2>
                <p className={styles.betaSubtitle}>
                  Available for Canada, Australia, UK &amp; Korea
                </p>
              </div>
              <div className={styles.ctaButtons}>
                <a
                  href="https://apps.apple.com/ca/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.btnPrimary}`}
                >
                  Canada
                </a>
                <a
                  href="https://apps.apple.com/au/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.btnPrimary}`}
                >
                  Australia
                </a>
                <a
                  href="https://apps.apple.com/gb/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.btnPrimary}`}
                >
                  UK
                </a>
                <a
                  href="https://apps.apple.com/kr/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.btnPrimary}`}
                >
                  Korea
                </a>
              </div>
            </div>
          </section>

          <section className={styles.betaSection} data-aos="fade-up">
            <div className={`${styles.betaCard} ${styles.glassCard}`}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionKicker}>Early Access</span>
                <h2 className={styles.betaTitle}>Android Beta Test</h2>
                <p className={styles.betaSubtitle}>
                  Help shape Abrody by testing upcoming features before anyone else — your feedback matters!
                </p>
              </div>
              <div className={styles.ctaButtons}>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSegOW7ihlRB7tOnMGwJtJXE_dqPvro0gdhw_W5cOItTSWySYg/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.btnPrimary}`}
                >
                  Apply for Beta (KR)
                </a>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSe489LaaOkRxUXYFx64aEee5Q5_IhKmMPKrb6--P8sSrHNGfQ/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.btnPrimary}`}
                >
                  Apply for Beta (EN)
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
