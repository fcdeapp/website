"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../styles/Home.module.css";
import WebFooter from "../components/WebFooter"; 

type Screenshot = {
  name: string;
  src: string;
};

export default function Home() {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [featIdx, setFeatIdx] = useState(0);
  const [journeyIdx, setJourneyIdx] = useState(0);
  const [shotIdx, setShotIdx] = useState(0);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const screenshots: Screenshot[] = [
    { name: "Map View", src: "/screenshots/map.png" },
    { name: "Home Feed", src: "/screenshots/home.png" },
    { name: "New Event", src: "/screenshots/create.png" },
    { name: "Chat Room", src: "/screenshots/chat.png" },
    { name: "Profile Page", src: "/screenshots/profile.png" },
  ];

  const openModal = (src: string) => setModalImage(src);
  const closeModal = () => setModalImage(null);

  const features = [
    "Smart Event Picks",
    "Quick Event Creation",
    "Verified Hosts",
    "Local Buddy Circles",
    "Live Chat & Alerts",
  ];

  const journeySteps = [
    "Create Your Profile",
    "Get Tailored Suggestions",
    "Join or Start an Event",
    "Meet Local Buddies",
  ];

  // advance / retreat functions
  const next = (len: number, idx: number, set: (i: number) => void) =>
    set((idx + 1) % len);
  const prev = (len: number, idx: number, set: (i: number) => void) =>
    set((idx - 1 + len) % len);

  // auto-advance
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  useEffect(() => {
    const iv = setInterval(() => next(features.length, featIdx, setFeatIdx), 5000);
    return () => clearInterval(iv);
  }, [featIdx]);

  useEffect(() => {
    const iv = setInterval(
      () => next(journeySteps.length, journeyIdx, setJourneyIdx),
      5000
    );
    return () => clearInterval(iv);
  }, [journeyIdx]);

  useEffect(() => {
    const iv = setInterval(
      () => next(screenshots.length, shotIdx, setShotIdx),
      7000
    );
    return () => clearInterval(iv);
  }, [shotIdx]);

  // click handler: left half → prev, right half → next
  const handleClick =
    (len: number, idx: number, set: (i: number) => void) =>
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { width, left } = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - left;
      if (x > width / 2) next(len, idx, set);
      else prev(len, idx, set);
    };

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
            <h1 className={styles.title} data-aos="fade-up">
              Abrody
            </h1>
            <p
              className={styles.subtitle}
              data-aos="fade-up"
              data-aos-delay={300}
            >
              Connecting People and Cultures Abroad
            </p>
            <div
              className={styles.heroHint}
              data-aos="fade-up"
              data-aos-delay={500}
            >
              Swipe to Explore
            </div>
            <div
              className={styles.heroArrows}
              data-aos="fade-up"
              data-aos-delay={600}
            >
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F7F7F7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#F7F7F7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        </header>

        <main className={styles.main}>
          {/* Key Features Carousel */}
          <section
            className={styles.section}
            onClick={handleClick(features.length, featIdx, setFeatIdx)}
            data-aos="fade-in"
          >
            <h2 className={styles.sectionTitle}>Key Feature</h2>
            <div className={styles.carouselContainer}>
              <p className={styles.carouselItem}>{features[featIdx]}</p>
            </div>
          </section>

          {/* User Journey Carousel */}
          <section
            className={styles.sectionAlt}
            onClick={handleClick(
              journeySteps.length,
              journeyIdx,
              setJourneyIdx
            )}
            data-aos="fade-in"
          >
            <h2 className={styles.sectionTitle}>Your Journey</h2>
            <div className={styles.carouselContainer}>
              <p className={styles.carouselItem}>
                {journeySteps[journeyIdx]}
              </p>
            </div>
          </section>

          {/* Screenshots Carousel */}
          <section
            className={styles.section}
            onClick={handleClick(
              screenshots.length,
              shotIdx,
              setShotIdx
            )}
            data-aos="fade-in"
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

          {/* App Demo Video Section */}
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

        {/* Modal for Enlarged Screenshot */}
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

        {/* Footer */}
        <WebFooter />
      </div>
    </>
  );
}
