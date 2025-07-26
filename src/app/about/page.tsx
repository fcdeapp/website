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
              The Easiest Way to Learn a Language — From Your Own Words
            </h1>
            <p data-aos="fade-up" data-aos-delay="200">
              Tried language apps but never felt like you were improving? <br />
              Abrody turns your actual conversations — with friends or our AI — into personalized quizzes and interactive study materials. <br />
              Learn smarter, not harder. See real progress and get truly engaged, every day.
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
              src="/images/GoogleAdsBannerEN.jpg"
              alt="Mission graphic"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <section className={styles.section}>
          <div className={styles.split} data-aos="fade-left">
          <h2>Why Most Language Apps Don’t Really Work</h2>
          <p>
            Most apps teach you with generic, scripted lessons. But what you actually need is to learn from your own life and real conversations — not someone else’s.
          </p>
          </div>
          </section>

        {/* Section: Market Problem */}
        <section className={styles.sectionAlt}>
          <div className={styles.split} data-aos="fade-left">
            <h2>How Abrody Changes Everything</h2>
            <p>
              With Abrody, your chats — whether with friends or our AI — instantly become your own personal study materials. <br />
              Every mistake turns into a quiz, every conversation becomes real, targeted practice. <br />
              Stop memorizing random phrases. Start mastering a language that’s truly yours.
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
                src="/about/AbrodyWebIcon.png"
                alt="Jungmin Doh"
                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
              />
              <h3>Jungmin Doh</h3>
              <p>Founder & CEO</p>
            </div>
            <div className={styles.teamCard}>
              <img
                src="/about/AbrodyWebIcon.png"
                alt="Taeyeon Kim"
                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
              />
              <h3>Taeyeon Kim</h3>
              <p>Co-Founder & CFO</p>
            </div>
            {/* Co-Founder & Team Member Recruitment Card */}
            <div className={styles.teamCard}>
              <div className={styles.hiringBadge}>
                <img
                  src="/about/FoxIconWithoutEyes.png"
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
           <video
             src="/videos/autoCheckFrench.mp4"
             className={styles.sectionImage}
             autoPlay
             loop
             muted
             playsInline
           />
          </div>
          <div className={styles.split} data-aos="fade-left">
            <h2>Our Vision</h2>
            <p>
            We're building a future where learning a new language is as natural as chatting with friends.
            </p>
          </div>
        </section>
      </div>
      <WebFooter />
    </>
  );
}
