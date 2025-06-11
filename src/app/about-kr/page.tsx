"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../../styles/pages/About.module.css";
import WebFooter from "../../components/WebFooter";

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
              실제 만남, 내 언어로 성장하다
            </h1>
            <p data-aos="fade-up" data-aos-delay="200">
              Abrody는 외국인과 현지인이 모여, 자연스럽게 친구가 되고 언어를 함께 익히는 새로운 공간입니다.
            </p>
          </div>
          <div
            className={styles.heroImage}
            data-aos="zoom-in"
            data-aos-delay="400"
          >
          </div>
        </section>

          <div className={styles.split} data-aos="fade-right">
            <img
              src="/about/mission_bannerKR.jpg"
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
            <img
              src="/images/speak_owl.png"
              alt="Problem"
              className={styles.sectionImage}
            />
          </div>
        </section>

        {/* Section: Our Team */}
        <section className={styles.section} data-aos="fade-up">
          <h2 className={styles.center}>팀 소개</h2>
          <div className={styles.teamGrid}>
            {/* Current team member card */}
            <div className={styles.teamCard}>
              <img
                src="/about/team-founder.png"
                alt="Doh Jung-min"
                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
              />
              <h3>도정민</h3>
              <p>창업자 & 대표</p>
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
              <h3>함께할 공동 창업자를 찾습니다</h3>
              <p>
              현재 1인팀으로 운영 중이며,
              마케팅/디자인/개발 공동창업자를 적극 모집 중입니다.
              </p>
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
            전 세계 어디서든, 소모임에서 언어가 자라고 AI가 내 학습을 맞춤 지원합니다.
            캐나다, 호주, 한국, 영국에서 시작해 누구나 쉽고 자연스럽게 언어와 친구를 얻을 수 있도록 만들겠습니다.
            </p>
          </div>
        </section>
      </div>
      <WebFooter />
    </>
  );
}
