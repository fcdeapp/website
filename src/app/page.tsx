"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

type Screenshot = {
  name: string;
  src: string;
};

export default function Home() {
  const [modalImage, setModalImage] = useState<string | null>(null);

  const screenshots: Screenshot[] = [
    { name: 'Map', src: '/screenshots/map.png' },
    { name: 'Home', src: '/screenshots/home.png' },
    { name: 'Create Event', src: '/screenshots/create.png' },
    { name: 'Chat', src: '/screenshots/chat.png' },
    { name: 'Profile', src: '/screenshots/profile.png' },
  ];

  const openModal = (src: string) => setModalImage(src);
  const closeModal = () => setModalImage(null);

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <header className={styles.hero}>
        <div className={styles.heroOverlay}>
          <h1 className={styles.title}>Welcome to Facade</h1>
          <p className={styles.subtitle}>Connecting People and Cultures Abroad</p>
          <Link href="/terms">
            <a className={styles.button}>Terms &amp; Conditions</a>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Value Proposition Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Why Facade?</h2>
          <p className={styles.sectionText}>
            Facade is a mobile app and web service designed to help international students and workers overcome isolation and language barriers.
            With AI-based event recommendations, a trust badge system, and local buddy groups, we make it easy and safe to join offline gatherings.
          </p>
        </section>

        {/* Key Features Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Key Features</h2>
          <ul className={styles.featuresList}>
            <li>AI-Powered Personalized Event Recommendations</li>
            <li>Easy and Fast Event Creation</li>
            <li>Trust Badge System for Safe Meetups</li>
            <li>Local Buddy Groups for Seamless Cultural Exchange</li>
            <li>Real-time Chat and Notification Integration</li>
          </ul>
        </section>

        {/* User Journey Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>User Journey</h2>
          <ol className={styles.journeyList}>
            <li>Sign Up and Create Your Profile</li>
            <li>Get Personalized Event Suggestions</li>
            <li>Join or Create an Event with One Click</li>
            <li>Connect with Local Buddies and Build Your Network</li>
          </ol>
        </section>

        {/* App Screenshots Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>App Screenshots</h2>
          <div className={styles.screenshotsGrid}>
            {screenshots.map((screen) => (
              <div
                key={screen.name}
                className={styles.screenshotItem}
                onClick={() => openModal(screen.src)}
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
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>App Demo</h2>
          <video
            className={styles.demoVideo}
            autoPlay
            muted
            playsInline
            loop
          >
            <source src="/demo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </section>

        {/* Download & Signup Call-to-Action → Beta Signup */}
        <section className={styles.betaSection}>
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
        © {new Date().getFullYear()} Doh Jung‑min. All rights reserved.
      </footer>
    </div>
  );
}
