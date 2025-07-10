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
            공부하지 마세요
          </h1>
          <p data-aos="fade-up" data-aos-delay="200">
          다른 앱들은 공부, Abrody는 채팅입니다.<br />
          내 말이 바로 퀴즈로 바뀌니까,<br />
          공부 없이 영어가 진짜 쉬워집니다.
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
        
          <div className={styles.split} data-aos="fade-right">
            <img
              src="/images/GoogleAdsBannerKR.jpg"
              alt="Mission graphic"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <section className={styles.section}>
          <div className={styles.split} data-aos="fade-left">
          <h2>아직도 공부하세요?</h2>
          <p>
            내 얘기는 없고, 남 얘기만 가득한 예문들.<br />
            현실과 동떨어진 강의, 한 방향 수업. 이제 거기서 나오셔야 해요
          </p>
          </div>
          </section>

        {/* Section: Market Problem */}
        <section className={styles.sectionAlt}>
          <div className={styles.split} data-aos="fade-left">
            <h2>공부 없는 영어, Abrody가 시작합니다</h2>
            <p>
            공부하지 마세요. 그냥 대화만 하세요.<br />
            내 말이 곧 영어 실력이 됩니다.
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
             src="/videos/autoCheckEnglish.mp4"
             className={styles.sectionImage}
             autoPlay
             loop
             muted
             playsInline
           />
          </div>
          <div className={styles.split} data-aos="fade-left">
            <h2>우리의 비전</h2>
            <p>
              우리는 공부가 필요 없는 세상을 만듭니다.
            </p>
          </div>
        </section>
      </div>
      <WebFooter />
    </>
  );
}
