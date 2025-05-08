"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/Home.module.css";
import WebFooter from "../components/WebFooter";

type CarouselItem = {
  label: string;
  image: string;
};

type Screenshot = {
  name: string;
  src: string;
};

export default function Home() {
  const journeyItems: CarouselItem[] = [
    { label: "Make Global Friends", image: "/journey/phone4.png" },
    { label: "Pick Your Interests", image: "/journey/phone1.png" },
    { label: "Join Meetups Near You", image: "/journey/phone2.png" },
    { label: "Find Nearby Expats", image: "/journey/phone3.png" },
  ];

  const screenshots: Screenshot[] = [
    { name: "Map View", src: "/screenshots/map.png" },
    { name: "Home Feed", src: "/screenshots/home.png" },
    { name: "New Event", src: "/screenshots/create.png" },
    { name: "Chat Room", src: "/screenshots/chat.png" },
    { name: "Profile Page", src: "/screenshots/profile.png" },
  ];

  //--- 상태 관리 ---
  const [featIdx, setFeatIdx] = useState(0);
  const [featDir, setFeatDir] = useState(0);
  const [journeyIdx, setJourneyIdx] = useState(0);
  const [journeyDir, setJourneyDir] = useState(0);
  const [shotIdx, setShotIdx] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);

  //--- AOS 초기화 ---
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setJourneyDir(1);
      setJourneyIdx((i) => (i + 1) % journeyItems.length);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setShotIdx((i) => (i + 1) % screenshots.length);
    }, 7000);
    return () => clearInterval(iv);
  }, []);

  const handleJourneyClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const { width, left } = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    if (x > width / 2) {
      setJourneyDir(1);
      setJourneyIdx((i) => (i + 1) % journeyItems.length);
    } else {
      setJourneyDir(-1);
      setJourneyIdx((i) => (i - 1 + journeyItems.length) % journeyItems.length);
    }
  };

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
              Connecting People and Cultures Abroad
            </p>
            <div className={styles.heroHint} data-aos="fade-up" data-aos-delay={500}>
              Swipe to Explore
            </div>
            <div className={styles.heroArrows} data-aos="fade-up" data-aos-delay={600}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                stroke="#F7F7F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none"
                stroke="#F7F7F7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          {/* User Journey Carousel */}
          <section
            className={styles.sectionAlt}
            data-aos="fade-in"
            onClick={handleJourneyClick}
          >
            <h2 className={styles.sectionTitle}>Your Journey</h2>
            <div className={styles.carouselContainer}>
              <AnimatePresence initial={false} custom={journeyDir}>
                 <motion.div
                   className={styles.carouselSlide}
                   key={journeyIdx}
                   custom={journeyDir}
                   variants={{
                     enter: (dir) => ({
                       x: dir > 0 ? 300 : -300,
                       scale: 0.8,
                       opacity: 0
                     }),
                     center: { x: 0, scale: 1, opacity: 1 },
                     exit: (dir) => ({
                       x: dir > 0 ? -300 : 300,
                       scale: 0.8,
                       opacity: 0
                     })
                   }}
                   initial="enter"
                   animate="center"
                   exit="exit"
                   transition={{ duration: 0.6, ease: "easeInOut" }}
                 >
                  <img
                    src={journeyItems[journeyIdx].image}
                    alt={journeyItems[journeyIdx].label}
                    className={styles.carouselImage}
                  />
                  <p className={styles.carouselItem}>
                    {journeyItems[journeyIdx].label}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* Screenshots Carousel */}
          <section
            className={styles.section}
            data-aos="fade-in"
            onClick={() => {
              /* 이전처럼 클릭으로 이동 */
              setShotIdx((i) => (i + 1) % screenshots.length);
            }}
          >
            <h2 className={styles.sectionTitle}>Preview</h2>
            <div className={styles.carouselContainer}>
              <img
                src={screenshots[shotIdx].src}
                alt={screenshots[shotIdx].name}
                className={styles.carouselImage}
              />
              <p className={styles.carouselItem}>
                {screenshots[shotIdx].name}
              </p>
            </div>
          </section>

          {/* App Demo Video */}
          <section className={styles.section} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>App Demo</h2>
            <video
              className={styles.demoVideo}
              autoPlay
              muted
              playsInline
              loop
              data-aos="zoom-in"
              data-aos-delay="200"
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
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
