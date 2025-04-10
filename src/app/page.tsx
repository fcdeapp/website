"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../styles/Home.module.css";

type Screenshot = {
  name: string;
  src: string;
};

export default function Home() {
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const screenshots: Screenshot[] = [
    { name: "Map", src: "/screenshots/map.png" },
    { name: "Home", src: "/screenshots/home.png" },
    { name: "Create Event", src: "/screenshots/create.png" },
    { name: "Chat", src: "/screenshots/chat.png" },
    { name: "Profile", src: "/screenshots/profile.png" },
  ];

  const openModal = (src: string) => setModalImage(src);
  const closeModal = () => setModalImage(null);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Facade | Connecting People and Cultures Abroad</title>
      </Head>

      <div className={styles.container}>
        {/* Hero Section */}
        <header className={styles.hero} data-aos="fade-in">
          <div className={styles.heroOverlay}>
            <h1 className={styles.title} data-aos="fade-up">Facade</h1>
            <p className={styles.subtitle} data-aos="fade-up" data-aos-delay="200">
              Connecting People and Cultures Abroad
            </p>
          </div>
        </header>

        <main className={styles.main}>
          {/* Value Proposition Section */}
          <section className={styles.section} data-aos="fade-up">
            <div className={styles.split} data-aos="fade-right">
              <div>
                <h2 className={styles.sectionTitle}>Why Facade?</h2>
                <p className={styles.sectionText}>
                  Facade is a mobile app and web service designed to help international students and workers overcome isolation and language barriers.
                  With AI-based event recommendations, a trust badge system, and local buddy groups, we make it easy and safe to join offline gatherings.
                </p>
              </div>
            </div>
            <div className={styles.split} data-aos="zoom-in" data-aos-delay="300">
              <img
                src="/screenshots/value-proposition.png"
                alt="Value Proposition"
                className={styles.sectionImage}
              />
            </div>
          </section>

          {/* Key Features Section */}
          <section className={styles.sectionAlt} data-aos="fade-up">
            <div className={styles.split} data-aos="fade-right">
              <img
                src="/screenshots/features.png"
                alt="Key Features"
                className={styles.sectionImage}
              />
            </div>
            <div className={styles.split} data-aos="fade-left">
              <h2 className={styles.sectionTitle}>Key Features</h2>
              <ul className={styles.featuresList}>
                <li>AI-Powered Personalized Event Recommendations</li>
                <li>Easy and Fast Event Creation</li>
                <li>Trust Badge System for Safe Meetups</li>
                <li>Local Buddy Groups for Seamless Cultural Exchange</li>
                <li>Real-time Chat and Notification Integration</li>
              </ul>
            </div>
          </section>

          {/* User Journey Section */}
          <section className={styles.section} data-aos="fade-up">
            <div className={styles.split} data-aos="fade-right">
              <h2 className={styles.sectionTitle}>User Journey</h2>
              <ol className={styles.journeyList}>
                <li>Sign Up and Create Your Profile</li>
                <li>Get Personalized Event Suggestions</li>
                <li>Join or Create an Event with One Click</li>
                <li>Connect with Local Buddies and Build Your Network</li>
              </ol>
            </div>
            <div className={styles.split} data-aos="zoom-in" data-aos-delay="300">
              <img
                src="/screenshots/journey.png"
                alt="User Journey"
                className={styles.sectionImage}
              />
            </div>
          </section>

          {/* App Screenshots Section */}
          <section className={styles.sectionAlt} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>App Screenshots</h2>
            <div className={styles.screenshotsGrid}>
              {screenshots.map((screen) => (
                <div
                  key={screen.name}
                  className={styles.screenshotItem}
                  onClick={() => openModal(screen.src)}
                  data-aos="zoom-in"
                  data-aos-delay="200"
                >
                  <img
                    src={screen.src}
                    alt={screen.name}
                    className={styles.screenshotImage}
                  />
                  <p className={styles.screenshotLabel}>{screen.name}</p>
                </div>
              ))}
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
                Help shape Facade by testing upcoming features before anyone else — your feedback matters!
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
        <footer className={styles.footer}>
          <div className={styles.footerContainer}>
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>About Facade</h3>
              <p className={styles.footerText}>
                Facade is dedicated to connecting international minds through cultural exchange and real events.
                Join our community and explore a world of possibilities.
              </p>
            </div>
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>Quick Links</h3>
              <ul className={styles.footerLinks}>
                <li>
                  <Link href="/about">
                    <a>About Us</a>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <a>Contact</a>
                  </Link>
                </li>
                <li>
                  <Link href="/faq">
                    <a>FAQ</a>
                  </Link>
                </li>
                <li>
                  <Link href="/terms">
                    <a>Terms of Service</a>
                  </Link>
                </li>
                <li>
                  <Link href="/privacy">
                    <a>Privacy Policy</a>
                  </Link>
                </li>
              </ul>
            </div>
            <div className={styles.footerSection}>
              <h3 className={styles.footerTitle}>Follow Us</h3>
              <div className={styles.socialIcons}>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <img src="/icons/twitter.png" alt="Twitter" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <img src="/icons/facebook.png" alt="Facebook" />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <img src="/icons/instagram.png" alt="Instagram" />
                </a>
                <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
                  <img src="/icons/tiktok.png" alt="TikTok" />
                </a>
                <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
                  <img src="/icons/youtube.png" alt="YouTube" />
                </a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© {new Date().getFullYear()} Facade. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
