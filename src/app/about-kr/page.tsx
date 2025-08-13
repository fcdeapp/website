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
          영어를 배우는 가장 쉬운 방법 — 내 대화에서 시작하세요
          </h1>
          <p data-aos="fade-up" data-aos-delay="200">
          언어학습 앱을 써도 실력이 느는 느낌이 없었다면, Abrody가 새로운 방법을 제안합니다.<br />
          내 대화에서 퀴즈와 학습자료가 자동으로 만들어지니,<br />
          쉽고 몰입감 있게 진짜 실력을 쌓을 수 있어요.
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
            src="/videos/GoogleAdsProjectKR250617(2).mp4"
            className={styles.fullscreenVideo}
            autoPlay
            muted
            loop
            playsInline
          />
        </section>
        
          <section className={styles.section}>
          <div className={styles.split} data-aos="fade-left">
          <h2>기존 언어 앱, 왜 실력이 안 늘까?</h2>
          <p>
            내 얘기는 없고, 남 얘기만 가득한 예문들.<br />
            현실과 동떨어진 강의, 한 방향 수업. 그래서 실제로 써먹기 힘들죠.
          </p>
          </div>
          </section>

        {/* Section: Market Problem */}
        <section className={styles.sectionAlt}>
          <div className={styles.split} data-aos="fade-left">
            <h2>Abrody가 바꾸는 언어 학습</h2>
            <p>
            Abrody에서는 친구·AI와 나눈 모든 대화가 바로 내 학습 자료가 됩니다.<br />
            내가 실수한 부분이 퀴즈로, 내가 자주 쓰는 말이 맞춤 학습으로.<br />
            남의 문장이 아니라, 내 언어 실력이 눈에 띄게 늘어나는 걸 직접 느껴보세요.
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
          <div className={styles.languageConcept}>
              <div className={styles.flowItem}>
                <img src="/images/flow-1.png" alt="Snap & Scenario" className={styles.languageImage} />
                <p className={styles.flowDesc}>
                  Take a photo to automatically build your learning scenario.
                </p>
              </div>
              <div className={styles.flowItem}>
                <img src="/images/flow-4.png" alt="AI Chat & Correction" className={styles.languageImage} />
                <p className={styles.flowDesc}>
                  Chat with our AI tutor—get real‑time corrections.
                </p>
              </div>
              <div className={styles.flowItem}>
                <img src="/images/flow-5.png" alt="Instant Quiz" className={styles.languageImage} />
                <p className={styles.flowDesc}>
                  Jump straight into a quiz to reinforce what you learned.
                </p>
              </div>
            </div>
          </div>
          <div className={styles.split} data-aos="fade-left">
            <h2>우리의 비전</h2>
            <p>
              전 세계 어디서나, Abrody와 함께라면<br />
              내 삶과 대화 속에서 자연스럽게 언어를 배우고,<br />
              AI가 만들어주는 맞춤 학습으로 진짜 실력을 쌓을 수 있습니다.<br />
              이제 언어, 더 이상 남의 얘기가 아닙니다.
            </p>
          </div>
        </section>
      </div>
      <WebFooter />
    </>
  );
}
