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
    "/DemoAbrody_1.mp4",
    "/DemoAbrody_2.mp4",
    "/DemoAbrody_3.mp4",
  ]);

  const journeyItems: CarouselItem[] = [
    { label: "Turn Your Mistakes into Quizzes", image: "/journey/iPhoneJourney.jpg" },
    { label: "Talk with AI like a Friend", image: "/journey/iPhoneJourney2.jpg" },
    { label: "AI Generates Personalized Notes", image: "/journey/iPhoneJourney3.jpg" },
    { label: "Meet in Your Language", image: "/journey/iPhoneJourney4.jpg" },
    { label: "Check Grammar Live", image: "/journey/iPhoneJourney5.jpg" },
    { label: "Pick Your Interests", image: "/journey/iPhoneJourney6.jpg" },
    { label: "Join Meetups Near You", image: "/journey/iPhoneJourney7.jpg" },
    { label: "Find Nearby Expats", image: "/journey/iPhoneJourney8.jpg" },
    { label: "Make Global Friends", image: "/journey/iPhoneJourney9.jpg" },
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
        <title>Abrody | Connecting People Abroad</title>
      </Head>

      <div className={styles.container}>
        {/* Hero */}
        <header className={styles.hero} data-aos="fade-in">
          <div className={styles.heroOverlay}>
            <h1 className={styles.title} data-aos="fade-up">Abrody</h1>
            <p className={styles.subtitle} data-aos="fade-up" data-aos-delay={300}>
              Your Words Matter
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

            <div className={styles.languageConcept} data-aos="fade-up">
              <img
                src="/images/language_concept.jpg"
                alt="Language Journey"
                className={styles.languageImage}
              />
            </div>

        <main className={styles.main}>
          <h2 className={styles.sectionTitle}>Your Journey</h2>
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
            <h2 className={styles.sectionTitle}>App Demo</h2>
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
            <h2 className={styles.sectionTitle}>Speak. Chat. Master.</h2>
            <p className={styles.sectionText}>
              Speak naturally—learn exactly what you need.
            </p>
            <img
              src="/images/speak_chat_master_owl.jpg"
              alt="Speak. Chat. Master."
              className={styles.recordButtonImage}
            />
          </section>

          {/* Beta Section */}
          <section className={styles.betaSection} data-aos="fade-up">
            <div className={styles.betaCard}>
              <h2 className={styles.betaTitle}>Join Our Closed Beta</h2>
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
