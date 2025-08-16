"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import "aos/dist/aos.css";
import styles from "../../styles/pages/About.module.css";
import stylesB from "../../styles/pages/Business.module.css";
import stylesC from "../../styles/Home.module.css";
import WebFooter from "../../components/WebFooter";
import CountryBall from "../../components/CountryBall";
import ChainQuizzesSection from "../../components/ChainQuizzesSection";

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

      {/* ── Why Abrody Exists ───────────────────────────── */}
      <section id="why" className={stylesB.section}>
      <motion.div
        className={stylesB.whyHeader}
        variants={fadeUp}
        viewport={{ once: true, amount: 0.45 }}
      >
        <span className={stylesB.sectionKicker}>문제</span>
        <h2 className={stylesB.sectionTitle}>Abrody가 필요한 이유</h2>
        <p className={stylesB.sectionLead}>
        대부분의 앱은 정해진 학습 콘텐츠를 일방적으로 제공합니다.  
        우리는 반대로, 당신의 일상에서 출발해 학습 내용을 만듭니다.
        </p>
      </motion.div>

      <motion.div
        className={stylesB.cards3D}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
      >
        {[
          {
            icon: "↓",
            title: "최악의 학습 앱 유지율",
            body: "교육 앱의 30일 유지율은 고작 2.1%. 많은 학습자들이 성과를 느끼기도 전에 포기합니다. — AppsFlyer 2025",
          },
          {
            icon: "≠",
            title: "공부 ≠ 말하기",
            body: "문법 문제 풀이와 점수 올리기는 자연스러운 대화를 만들어주지 못합니다. 수년을 투자해도 말할 때 불안은 여전합니다.",
          },
          {
            icon: "₩",
            title: "많은 비용, 낮은 효과",
            body: "한국은 매년 약 29.2조 원(약 210억 달러)을 영어에 투자하지만, EF EPI 영어 능력 순위는 50위에 불과합니다.",
          },
        ].map((card, i) => (
          <motion.article
            key={card.title}
            className={`${stylesB.card} ${stylesB.statCard}`}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
          >
            <span className={stylesB.statBadge} aria-hidden>{card.icon}</span>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </motion.article>
        ))}
      </motion.div>


        {/* ── Differentiators ───────────────────────────── */}
        <section className={stylesB.sectionAlt}>
          <motion.h2
            className={stylesB.sectionTitle}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.45 }}
          >
            Abrody만의 차별점
          </motion.h2>

          <motion.div
            className={stylesB.flipHeader}
            variants={fadeUp}
            custom={2}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={stylesB.flowLabel}>플랫폼 중심</span>
            <span className={stylesB.flipSwitch} aria-hidden>⇄</span>
            <span className={`${stylesB.flowLabel} ${stylesB.active}`}>사용자 중심</span>
          </motion.div>

          <motion.p
            className={stylesB.diffLead}
            variants={fadeUp}
            custom={1}
            viewport={{ once: true, amount: 0.5 }}
          >
            학습의 방향을 완전히 뒤집었습니다.  
            Abrody에서는 모든 것이 <strong>사용자</strong>—당신의 상황, 맥락, 말에서 시작됩니다.
          </motion.p>

          <motion.div
            className={stylesB.diffGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {[
              {
                title: "사용자가 시작하는 학습",
                body: "정해진 커리큘럼이 아니라, 실제 대화와 경험에서 학습이 출발합니다.",
              },
              {
                title: "맥락이 곧 교재",
                body: "매일 겪는 상황과 의도가 그대로 학습 내용이 되어, 배운 즉시 활용할 수 있습니다.",
              },
              {
                title: "초개인화 학습",
                body: "내가 한 실수는 곧 퀴즈가 되고, 내가 즐겨 쓰는 표현은 집중 연습으로 이어집니다. 학습은 나에게 꼭 맞게 설계됩니다.",
              },
              {
                title: "AI가 만드는 실시간 피드백",
                body: "AI가 일상의 순간을 대화, 교정, 복습으로 바꾸어 CTL 방식 루프를 자동으로 완성합니다.",
              },
              {
                title: "게임이 아닌 실력",
                body: "연속 기록이나 점수가 아니라, 말할 때의 명확성과 자신감을 목표로 합니다.",
              },
              {
                title: "일상에서 성취로",
                body: "Snap → Chat → Quiz. 생활 속 순간이 학습으로 전환되어 하루하루 실력이 쌓입니다.",
              },
              {
                title: "체인 퀴즈로 깊은 기억",
                body: "단계적으로 연결된 퀴즈가 학습 흐름을 이어가며, 답할수록 다음 답이 쉬워집니다.",
              },
              {
                title: "문맥 속 어휘 연결",
                body: "단어를 따로 외우는 대신, 실제 문맥 속에서 연습해 대화할 때 자연스럽게 떠오릅니다.",
              },              
            ].map((f, i) => (
              <motion.article
                key={f.title}
                className={stylesB.diffCard}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, boxShadow: "0 18px 40px rgba(17,12,43,0.12)" }}
              >
                <h3>
                  {f.title}
                </h3>
                <p>{f.body}</p>
              </motion.article>
            ))}
          </motion.div>

          <motion.p
            className={stylesB.diffNote}
            variants={fadeLeft}
            custom={3}
            viewport={{ once: true, amount: 0.4 }}
          >
              Abrody의 방식은 우리의 목표와 같습니다.
              일상과 학습을 자연스럽게 연결하고, 연구에서 증명된 CTL 방식으로 언어 실력을 눈에 띄게 끌어올립니다.
          </motion.p>
        </section>


        <motion.blockquote
          className={stylesB.quote}
          variants={fadeLeft}
          custom={3}
          viewport={{ once: true, amount: 0.4 }}
        >
          CTL 기반 학습은 말하기 명료성을
          <span className={stylesB.gradientNumber}>54%</span>
          유창성을
          <span className={stylesB.gradientNumber}>65%</span> 향상시킵니다.  
          Abrody는 이 방식을 전 과정에 자동화합니다.
          <cite className={stylesB.quoteCite}>— Yusyac 외, 2021</cite>
        </motion.blockquote>

      </section>

      <div className={stylesB.waveSplit} />

      <ChainQuizzesSection />

      {/* ── How It Works ───────────────────────────────── */}
      <section className={stylesB.sectionAlt}>
        <motion.div
          className={stylesB.whyHeader}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={stylesB.sectionKicker}>학습 흐름</span>
          <h2 className={stylesB.sectionTitle}>Abrody는 이렇게 작동합니다</h2>
        </motion.div>

        <div className={stylesB.flowGrid}>
          {[
            {
              kicker: "Snap",
              img: "/images/flow-1.png",
              title: "사진으로 상황 만들기",
              desc: "사진 한 장이면, 그 순간에 맞는 학습 시나리오가 자동 생성됩니다.",
            },
            {
              kicker: "Chat",
              img: "/images/flow-4.png",
              title: "AI 대화 & 교정",
              desc: "AI 튜터와 대화하며 문맥에 맞는 교정을 즉시 받습니다.",
            },
            {
              kicker: "Quiz",
              img: "/images/flow-5.png",
              title: "즉시 복습 퀴즈",
              desc: "방금 배운 내용을 짧고 집중적인 퀴즈로 바로 연습합니다.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              className={stylesB.flowStep}
              variants={zoomIn}
              custom={i}
            >
              {/* 작은 칩 — 이미지(또는 제목) 위에 표시 */}
              <span className={stylesB.stepKicker} aria-hidden>
                {step.kicker}
              </span>

              <img src={step.img} alt={step.title} />
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className={stylesB.waveSplitFlip} />

          <section className={stylesC.betaSection} data-aos="fade-up">
            <div className={`${stylesC.betaCard} ${stylesC.glassCard}`}>
              <div className={stylesC.sectionHead}>
                <span className={stylesC.sectionKicker}>다운로드</span>
                <h2 className={stylesC.betaTitle}>iOS에서 설치하기</h2>
                <p className={stylesC.betaSubtitle}>
                캐나다, 호주, 영국, 한국에서 이용 가능합니다
                </p>
              </div>
              <div className={stylesC.ctaButtons}>
                <a
                  href="https://apps.apple.com/kr/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  국내
                </a>
                <a
                  href="https://apps.apple.com/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  국외
                </a>                
              </div>
            </div>
          </section>

          <section className={stylesC.betaSection} data-aos="fade-up">
            <div className={`${stylesC.betaCard} ${stylesC.glassCard}`}>
              <div className={stylesC.sectionHead}>
                <span className={stylesC.sectionKicker}>얼리 액세스</span>
                <h2 className={stylesC.betaTitle}>안드로이드 베타 테스트</h2>
                <p className={stylesC.betaSubtitle}>
                정식 출시 전에 새로운 기능을 먼저 체험하고 의견을 들려주세요.  
                여러분의 피드백이 Abrody를 더 나은 서비스로 만듭니다!
                </p>
              </div>
              <div className={stylesC.ctaButtons}>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSegOW7ihlRB7tOnMGwJtJXE_dqPvro0gdhw_W5cOItTSWySYg/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  베타 신청 (한국어)
                </a>
                <a
                  href="https://docs.google.com/forms/d/e/1FAIpQLSe489LaaOkRxUXYFx64aEee5Q5_IhKmMPKrb6--P8sSrHNGfQ/viewform?usp=dialog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  베타 신청 (영어)
                </a>
              </div>
            </div>
          </section>

      </div>
      <WebFooter />
    </>
  );
}
