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
    { label: "Turn Your Mistakes into Quizzes", image: "/journey/AppStoreImageiPhoneEN2507011.jpg" },
    { label: "Talk with AI like a Friend", image: "/journey/AppStoreImageiPhoneEN2507012.jpg" },
    { label: "AI Generates Personalized Notes", image: "/journey/AppStoreImageiPhoneEN2507013.jpg" },
    { label: "Meet in Your Language", image: "/journey/AppStoreImageiPhoneEN2507014.jpg" },
    { label: "Check Grammar Live", image: "/journey/AppStoreImageiPhoneEN2507015.jpg" },
    { label: "Pick Your Interests", image: "/journey/AppStoreImageiPhoneEN2507016.jpg" },
    { label: "Join Meetups Near You", image: "/journey/AppStoreImageiPhoneEN2507017.jpg" },
    { label: "Find Nearby Expats", image: "/journey/AppStoreImageiPhoneEN2507018.jpg" },
    { label: "Make Global Friends", image: "/journey/AppStoreImageiPhoneEN2507019.jpg" },
    { label: "Make Global Friends", image: "/journey/AppStoreImageiPhoneEN25070110.jpg" },
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
      </Head>

      <div className={styles.container}>
        {/* Hero */}
        <header className={styles.hero} data-aos="fade-in">
          <div className={styles.heroOverlay}>
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
            <p className={styles.subtitle} data-aos="fade-up" data-aos-delay={300}>
              Tried language apps but never felt like you were truly improving? <br />
              With Abrody, every chat — with AI or friends — instantly turns into personalized, interactive quizzes just for you.<br />
              Learn smarter, see real progress, and feel more engaged with your study.
            </p>
            <div className={styles.heroHint} data-aos="fade-up" data-aos-delay={500}>
              Swipe to Explore
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

        <main className={styles.main}>
          <div className={styles.journeyHeader}>
          <h2 className={styles.sectionTitle}>
            Learn from Your Own Words, Not Someone Else’s
          </h2>
          <p className={styles.sectionSubtitle}>
            Abrody transforms your real conversations into personalized quizzes.  
            Progress you can feel, every day.
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
              </motion.div>
            ))}
          </motion.div>

          {/* App Demo Videos */}
          <section className={styles.section} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>App Demo</h2>
            <p className={styles.sectionSubtitleSmall}>
              See how Abrody turns every chat into a quiz made just for you.  
              Speak, make mistakes, and learn naturally — it’s all automatic.
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
            <video
              src="/videos/GoogleAdsProject250617.mp4"
              className={styles.fullscreenVideo}
              autoPlay
              muted
              loop
              playsInline
            />
          </section>

          <section className={styles.section} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>Speak. Chat. Master.</h2>
            <p className={styles.sectionText}>
              Chat with friends or AI.  
              Your mistakes turn into personalized quizzes — learning that actually sticks. 
            </p>
            <img
              src="/images/WebInfo.jpg"
              alt="Speak. Chat. Master."
              className={styles.recordButtonImage}
            />
          </section>

          <section className={styles.betaSection} data-aos="fade-up">
            <div className={styles.betaCard}>
              <h2 className={styles.betaTitle}>Install on iOS</h2>
              <p className={styles.betaSubtitle}>
                Available for Canada, Australia, UK &amp; Korea
              </p>
              <div className={styles.ctaButtons}>
                <a
                  href="https://apps.apple.com/ca/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaButton}
                >
                  Canada
                </a>
                <a
                  href="https://apps.apple.com/au/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaButton}
                >
                  Australia
                </a>
                <a
                  href="https://apps.apple.com/gb/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaButton}
                >
                  UK
                </a>
                <a
                  href="https://apps.apple.com/kr/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaButton}
                >
                  Korea
                </a>
              </div>
            </div>
          </section>

          {/* Beta Section */}
          <section className={styles.betaSection} data-aos="fade-up">
            <div className={styles.betaCard}>
              <h2 className={styles.betaTitle}>Android Beta Test</h2>
              <p className={styles.betaSubtitle}>
                Help shape Abrody by testing upcoming features before anyone else — your feedback matters!
              </p>
              <div className={styles.ctaButtons}>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSegOW7ihlRB7tOnMGwJtJXE_dqPvro0gdhw_W5cOItTSWySYg/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaButton}
                >
                  Apply for Beta (KR)
                </a>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSe489LaaOkRxUXYFx64aEee5Q5_IhKmMPKrb6--P8sSrHNGfQ/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaButton}
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
