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
              Stop Studying. Start Chatting.
            </h1>
            <p data-aos="fade-up" data-aos-delay="200">
            Most apps feel like work. Abrody feels like chatting with friends. <br />
            Every conversation becomes your personal lesson. <br />
            No textbooks. No stress. Just progress.
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
          Stop memorizing someone else's scripts.
          Real learning comes from your real conversations.
          </p>
          </div>
          </section>

        {/* Section: Market Problem */}
        <section className={styles.sectionAlt}>
          <div className={styles.split} data-aos="fade-left">
            <h2>How Abrody Changes Everything</h2>
            <p>
            Your conversations become quizzes. Instantly. <br />
            Mistakes are your fastest way to learn. <br />
            Abrody makes language learning effortless.
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
              We envision a world where language learning doesn’t feel like learning at all.
            </p>
          </div>
        </section>
      </div>
      <WebFooter />
    </>
  );
}
