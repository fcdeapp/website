"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../../styles/pages/About.module.css";
import WebFooter from "../../components/WebFooter";
import CountryBall from "../../components/CountryBall";

export default function About() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <>
      <Head>
        <title>About Us | Abrody</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={`${styles.container} ${styles.aosWrapper}`}>
        {/* Section: Intro */}
        <section className={styles.heroSection}>
          <div className={styles.heroText}>
            <h1 data-aos="fade-up">
              Building Real-World Connections, Empowering Personalized Language Learning.
            </h1>
            <p data-aos="fade-up" data-aos-delay="200">
              Abrody isn’t just a meetup platform—it’s where expats and locals form communities, build friendships, and naturally master languages together, both online and offline.
            </p>
          </div>
          <div
            className={styles.heroImage}
            data-aos="zoom-in"
            data-aos-delay="400"
          >
          </div>
        </section>

        <section className={styles.videoSection}>
          <video
            src="/videos/GoogleAdsProject250617.mp4"
            className={styles.fullscreenVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        </section>

          <div className={styles.split} data-aos="fade-right">
            <img
              src="/about/GoogleAdsBannerEN.jpg"
              alt="Mission graphic"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <section className={styles.section}>
          <div className={styles.split} data-aos="fade-left">
            <h2>Why Language Apps Fall Short</h2>
            <p>
              Traditional language apps rely on generic lessons and one-way teaching. Learners are left with materials that don’t reflect their real needs or daily conversations.
            </p>
          </div>
          </section>

        {/* Section: Market Problem */}
        <section className={styles.sectionAlt}>
          <div className={styles.split} data-aos="fade-left">
            <h2>How Abrody Changes Everything</h2>
            <p>
              At Abrody, learning starts with your actual conversations. Every group chat, meetup, and message becomes a personalized study resource—AI turns your own words and mistakes into targeted practice, making learning social, relevant, and truly yours.
            </p>
          </div>
          <div className={styles.split} data-aos="fade-up">
            <div className={styles.ballContainer}>
              {[
                "UKCountryBallX.png",
                "FranceCountryBallX.png",
                "SpainCountryBallX.png",
                "ChinaCountryBallX.png",
                "JapanCountryBallX.png",
                "KoreaCountryBallX.png",
              ].map((file) => (
                <CountryBall key={file} src={`/images/${file}`} size={60} />
              ))}
            </div>
          </div>
        </section>

        {/* Section: Our Team */}
        <section className={styles.section} data-aos="fade-up">
          <h2 className={styles.center}>Meet the Team</h2>
          <div className={styles.teamGrid}>
            {/* Current team member card */}
            <div className={styles.teamCard}>
              <img
                src="/about/team-founder.png"
                alt="Doh Jung-min"
                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
              />
              <h3>Doh Jung-min</h3>
              <p>Founder & CEO</p>
            </div>
            {/* Co-Founder & Team Member Recruitment Card */}
            <div className={styles.teamCard}>
              <div className={styles.hiringBadge}>
                <img
                  src="/about/hiring.png"
                  alt="Join Our Founding Team"
                  style={{ width: "150px", height: "150px", borderRadius: "50%" }}
                />
              </div>
              <h3>Join Our Founding Team</h3>
              <p>
                Currently operating as a one-person team—I'm actively seeking
                co-founders and talented team members in marketing, design, and
                development to help build and expand our venture.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Future Vision */}
        <section className={styles.sectionAlt}>
          <div className={styles.split} data-aos="fade-right">
            <img
              src="/about/vision_banner.jpg"
              alt="Vision roadmap"
              className={styles.sectionImage}
            />
          </div>
          <div className={styles.split} data-aos="fade-left">
            <h2>Our Vision</h2>
            <p>
              We’re building a new standard for global communities—where local meetups drive language mastery and AI personalizes every step. Launching in Canada, Australia, Korea, and the UK, Abrody is on a mission to make personalized social learning accessible everywhere.
            </p>
          </div>
        </section>
      </div>
      <WebFooter />
    </>
  );
}
