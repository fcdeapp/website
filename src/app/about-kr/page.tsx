"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import "aos/dist/aos.css";
import styles from "../../styles/pages/About.module.css";
import WebFooter from "../../components/WebFooter";
import CountryBall from "../../components/CountryBall";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" },
  }),
};
const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.12 + 0.1, duration: 0.7, ease: "easeOut" },
  }),
};
const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1 + 0.2, duration: 0.6, ease: "easeOut" },
  }),
};


export default function About() {

  return (
    <>
      <Head>
        <title>About Us | Abrody</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={`${styles.container} ${styles.aosWrapper}`}>
        <section className={styles.heroSection}>
          <motion.div className={styles.heroText} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }}>
            <motion.h1 variants={zoomIn}>영어를 배우는 가장 쉬운 방법 — 내 대화에서 시작하세요</motion.h1>
            <motion.p variants={fadeUp} custom={1}>
            여러 언어 앱을 써봐도 실력이 늘지 않는 것 같나요? <br />
            Abrody는 친구나 AI와 나눈 실제 대화를 맞춤형 퀴즈와 학습 자료로 바꿔 드립니다. <br />
            더 똑똑하게, 더 재미있게 배우고 매일 실력 향상을 느껴보세요.
            </motion.p>
            <motion.a href="#why" className={styles.scrollHint} variants={fadeUp} custom={2} whileHover={{ y: 4 }}>
            ↓ 이유 보기
            </motion.a>
          </motion.div>
          <motion.div className={styles.heroImage} variants={zoomIn} />
        </section>

        <section id="why" className={styles.section}>
          <motion.div className={styles.sectionHeader} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.45 }}>
            <span className={styles.sectionKicker}>문제</span>
            <h2 className={styles.sectionTitle}>왜 대부분의 언어 앱은 효과가 없을까</h2>
            <p className={styles.sectionLead}>
            대부분의 앱은 미리 만들어진 문장을 일방적으로 제공합니다. 하지만 진짜 유창함은 남의 문장이 아니라, 나만의 순간과 나만의 말에서 나옵니다.
            </p>
          </motion.div>

          <motion.div className={styles.diffGrid} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            {[
              { title: "천편일률적인 학습", body: "정해진 문장과 문제들은 내 삶과 목표에 맞지 않습니다." },
              { title: "일방향 학습", body: "콘텐츠가 플랫폼에서 사용자에게만 전달되고, 반대 방향의 흐름은 없습니다." },
              { title: "낮은 학습 지속률", body: "내게 필요한 내용이 아니면 앱을 다시 열지 않게 되고, 실력 향상도 멈춥니다." },
            ].map((f, i) => (
              <motion.article key={f.title} className={styles.diffCard} variants={fadeUp} custom={i}
                whileHover={{ y: -6, boxShadow: "0 18px 38px rgba(17,12,43,.12)" }}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className={styles.sectionAlt}>
          <motion.div className={styles.sectionHeader} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.45 }}>
            <span className={styles.sectionKicker}>Abrody의 방식</span>
            <h2 className={styles.sectionTitle}>Abrody가 바꾸는 언어 학습</h2>
            <p className={styles.sectionLead}>
            우리는 학습의 방향을 바꿉니다. 모든 것이 나의 상황, 맥락, 그리고 내가 쓰는 말에서 시작됩니다.
            </p>
          </motion.div>

          <motion.div className={styles.diffGrid} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            {[
              { title: "사용자 중심 학습", body: "실제 대화가 레슨과 복습의 재료가 됩니다." },
              { title: "맥락 중심", body: "연습이 내 삶에 연결되어 있어, 바로 말하기로 이어집니다." },
              { title: "초개인화 학습", body: "내 실수는 맞춤 퀴즈로, 내가 자주 쓰는 말은 집중 연습으로 전환됩니다." },
              { title: "AI 기반 CTL 학습 루프", body: "AI가 나의 순간을 대화·피드백·퀴즈로 변환해, 학습 효과를 계속 쌓아갑니다." },
            ].map((f, i) => (
              <motion.article key={f.title} className={styles.diffCard} variants={fadeUp} custom={i}
                whileHover={{ y: -6, boxShadow: "0 18px 38px rgba(17,12,43,.12)" }}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </motion.article>
            ))}
          </motion.div>

          <motion.div className={styles.ballWrap} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
            <div className={styles.ballContainer}>
              {["UKCountryBallX.png","FranceCountryBallX.png","SpainCountryBallX.png","ChinaCountryBallX.png","JapanCountryBallX.png","KoreaCountryBallX.png"]
                .map((file) => (<CountryBall key={file} src={`/images/${file}`} size={60} />))}
            </div>
          </motion.div>
        </section>

        {/* Section: Future Vision */}
        <section className={`${styles.sectionAlt} ${styles.futureVisionSection}`}>
          {/* 카드 그리드 (위) */}
          <motion.div className={`${styles.flowGrid} ${styles.futureVisionGrid}`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
            <div className={styles.flowItem} data-aos="zoom-in-up" data-aos-delay="0">
              <img src="/images/flow-1.png" alt="Snap & Scenario" className={`${styles.languageImage} ${styles.noCrop}`} />
              <p className={styles.flowDesc}>사진 한 장으로 나만의 학습 시나리오가 자동 생성됩니다.</p>
            </div>
            <div className={styles.flowItem} data-aos="zoom-in-up" data-aos-delay="150">
              <img src="/images/flow-4.png" alt="AI Chat & Correction" className={`${styles.languageImage} ${styles.noCrop}`} />
              <p className={styles.flowDesc}>AI 튜터와 대화하며, 실시간 교정을 받아보세요.</p>
            </div>
            <div className={styles.flowItem} data-aos="zoom-in-up" data-aos-delay="300">
              <img src="/images/flow-5.png" alt="Instant Quiz" className={`${styles.languageImage} ${styles.noCrop}`} />
              <p className={styles.flowDesc}>방금 배운 내용을 퀴즈로 바로 복습하세요.</p>
            </div>
          </motion.div>

          <motion.div className={styles.sectionHeader} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.45 }}>
            <span className={styles.sectionKicker}>비전</span>
            <h2 className={styles.sectionTitle}>우리의 비전</h2>
            <p className={styles.sectionLead}>우리는 친구와 대화하듯 자연스럽게 새로운 언어를 배우는 미래를 만들고 있습니다.</p>
          </motion.div>
        </section>
      </div>
      <WebFooter />
    </>
  );
}
