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
              <img src="/about/AbrodyWebIcon.png" alt="Do Jeongmin" style={{ width: 150, height: 150, borderRadius: "50%" }} />
              <h3>Do Jeongmin · CEO & Founder</h3>
              <p>
                B.S. Architecture, College of Engineering, Seoul National University<br/>
                <strong>Programming:</strong> React Native (TS), Node.js, HCL, MongoDB, AWS (EC2, CodeDeploy, S3, Route53, VPC), GitHub Actions CI/CD<br/>
                <strong>Design:</strong> Photoshop, Illustrator, InDesign, Premiere Pro, After Effects, Rhino, Blender, V‑Ray, Enscape, Figma
              </p>
            </div>
            <div className={styles.teamCard}>
              <img src="/about/AbrodyWebIcon.png" alt="Taeyeon Kim" style={{ width: 150, height: 150, borderRadius: "50%" }} />
              <h3>Taeyeon Kim · CFO & Growth</h3>
              <p>
                B.S. Computer Engineering & B.S. Business Administration (dual major), Seoul National University<br/>
                <strong>Programming:</strong> Unity (game development)<br/>
                <strong>Accounting & Marketing:</strong> PwC (intern), UNESCO (intern)
              </p>
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
            <div className={styles.languageConcept}>
              <div className={styles.flowItem}>
                <img src="/images/flow-1.png" alt="Snap & Scenario" className={styles.languageImage} />
                <p className={styles.flowDesc}>
                  Take a photo to automatically build your learning scenario.
                </p>
              </div>
              <div className={styles.flowItem}>
                <img src="/images/flow-2.png" alt="AI Chat & Correction" className={styles.languageImage} />
                <p className={styles.flowDesc}>
                  Chat with our AI tutor—get real‑time corrections.
                </p>
              </div>
              <div className={styles.flowItem}>
                <img src="/images/flow-3.png" alt="Instant Quiz" className={styles.languageImage} />
                <p className={styles.flowDesc}>
                  Jump straight into a quiz to reinforce what you learned.
                </p>
              </div>
            </div>
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
