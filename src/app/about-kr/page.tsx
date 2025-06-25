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
              내 대화를 배우다
            </h1>
            <p data-aos="fade-up" data-aos-delay="200">
            누구에게나 똑같은 학습는 이제 그만.
            Abrody는 내 생활, 내 대화에서 나온 표현만 뽑아 진짜 내게 맞는 학습 자료를 만듭니다.
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

            <div className={styles.languageConcept} data-aos="fade-up">
              <img
                src="/images/language_conceptKR.jpg"
                alt="Language Journey"
                className={styles.languageImage}
              />
            </div>
          <div className={styles.split} data-aos="fade-right">
            <img
              src="/images/GoogleAdsBannerKR.jpg"
              alt="Mission graphic"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <section className={styles.section}>
          <div className={styles.split} data-aos="fade-left">
            <h2>기존 언어 앱이 놓치는 것</h2>
            <p>
              일방적인 강의, 내 삶과 동떨어진 표현들. 실제 대화와는 거리가 멀어요.
            </p>
          </div>
          </section>

        {/* Section: Market Problem */}
        <section className={styles.sectionAlt}>
          <div className={styles.split} data-aos="fade-left">
            <h2>Abrody가 바꾸는 언어 학습</h2>
            <p>
            실제 모임, 실제 채팅이 곧 나만의 학습 자료가 됩니다.
            내가 한 대화와 실수가 바로 AI가 만들어주는 맞춤 연습문제가 되어, 진짜 필요했던 표현을 자연스럽게 익힙니다.
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
            <img
              src="/about/vision_bannerKR.jpg"
              alt="Vision roadmap"
              className={styles.sectionImage}
            />
          </div>
          <div className={styles.split} data-aos="fade-left">
            <h2>우리의 비전</h2>
            <p>
            전 세계 어디에서든, 소모임에서 사람들과 자연스럽게 언어를 배우세요.
            AI가 내 대화와 경험을 분석해, 나에게 꼭 맞는 학습을 만들어줍니다.
            캐나다, 호주, 한국, 영국에서 시작해, 누구나 쉽게 친구도 만들고, 언어도 내 삶 속에서 익힐 수 있게 하겠습니다.
            </p>
          </div>
        </section>
      </div>
      <WebFooter />
    </>
  );
}
