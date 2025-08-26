"use client";

import React, { useEffect, useRef, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import { motion, Variants, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import "aos/dist/aos.css";
import styles from "../../styles/pages/About.module.css";
import stylesB from "../../styles/pages/Business.module.css";
import stylesC from "../../styles/Home.module.css";
import WebFooter from "../../components/WebFooter";
import CountryBall from "../../components/CountryBall";
import ChainQuizzesSection from "../../components/ChainQuizzesSection";
import AOS from "aos";

// ADD: 가치↔기능 토글 카드
function FeatureCard({
  item,
  idx
}: {
  item: {
    id: string;
    title: string;
    value: string;
    feature: string;
    badge: string;
  };
  idx: number;
}) {
  const [mode, setMode] = React.useState<"value" | "feature">("value");

  return (
    <motion.article
      className={`${stylesB.diffCard} ${stylesB.featCard}`}
      variants={fadeUp}
      custom={idx}
      layout
      whileHover={{ y: -6, boxShadow: "0 18px 40px rgba(17,12,43,0.12)" }}
      onClick={() => setMode(m => (m === "value" ? "feature" : "value"))}
      role="button"
      aria-pressed={mode === "feature"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setMode(m => (m === "value" ? "feature" : "value"));
      }}
    >
      <div className={stylesB.featHead}>
        <h3 className={stylesB.featTitle}>
          {item.title}
        </h3>
      </div>

      <div className={stylesB.featBody}>
        <AnimatePresence mode="wait">
          {mode === "value" ? (
            <motion.div
              key="value"
              className={stylesB.featValue}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              <p className={stylesB.valueText}>{item.value}</p>
            </motion.div>
          ) : (
            <motion.div
              key="feature"
              className={stylesB.featFeature}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {/* 작은 배지로 전환 + 본문은 기능 설명 */}
              <motion.div
                className={stylesB.featMediaBadge}
                layoutId={`media-${item.id}`}
              >
                <span aria-hidden>{item.badge}</span>
              </motion.div>
              <p>{item.feature}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  );
}


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

// Stagger 부모
const heroParent: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

// 단어 단위 텍스트 리빌
const wordReveal: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// 떠다니는 오브(구체)
const floatOrb: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-4, 6, -2, 0],
    rotate: [0, 1.2, -0.6, 0],
    transition: { duration: 7, repeat: Infinity, ease: "easeInOut" }
  }
};

const titleReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const quoteVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.44, ease: "easeOut" },
  },
  exit: { opacity: 0, y: 8, scale: 0.995, transition: { duration: 0.28 } },
};

const citeVariants: Variants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { delay: 0.16, duration: 0.36 } },
};

export default function About() {
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    // AOS 초기화 (클라이언트에서만 실행)
    AOS.init({
      once: true,          // 한 번만 애니메이션
      duration: 700,       // 0.7s
      easing: "ease-out",
      offset: 80,          // 트리거 오프셋
    });
    // 콘텐츠/이미지 로드 후 레이아웃 바뀌면 다시 계산
    AOS.refresh();
  }, []);

  // 마우스 파랄랙스
const mx = useMotionValue(0);   // -40 ~ 40(px)
const my = useMotionValue(0);
const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.25 });
const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.25 });

// 3D 틸트 각도
const tiltX = useTransform(sy, v => v / -8); // deg
const tiltY = useTransform(sx, v => v / 8);  // deg

// 레이어별 파랄랙스 깊이
const layerSlow  = { x: useTransform(sx, v => v * -0.25), y: useTransform(sy, v => v * -0.25) };
const layerMed   = { x: useTransform(sx, v => v * -0.5 ), y: useTransform(sy, v => v * -0.5 ) };
const layerFast  = { x: useTransform(sx, v => v *  0.8 ), y: useTransform(sy, v => v *  0.8 ) };

function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const relX = ((e.clientX - r.left) / r.width  - 0.5) * 80; // -40~40
  const relY = ((e.clientY - r.top)  / r.height - 0.5) * 80;
  mx.set(relX);
  my.set(relY);
}


  return (
    <>
      <Head>
        <title>About Us | Abrody</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={`${styles.container} ${styles.aosWrapper}`}>
        <section
          className={styles.heroSection}
          onMouseMove={handleMouseMove}
        >
          {/* --- 배경 FX 레이어들 (절대배치) --- */}
          <motion.div
            aria-hidden
            className={styles.fxMesh}
            style={layerSlow}
          />
          <motion.div
            aria-hidden
            className={styles.fxBeams}
            style={layerMed}
          />
          <motion.div
            aria-hidden
            className={styles.fxGrid}
          />

          {/* --- 전경 콘텐츠 (3D 틸트 적용) --- */}
          <motion.div
            className={styles.heroInner}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.7 }}
            variants={heroParent}
            style={{ rotateX: tiltX, rotateY: tiltY }}
          >
            {/* 타이틀: 단어별 리빌 */}
            <h1 className={styles.heroTitle}>
              {"4050 직장인을 위한 실전 영어".split(" ").map((w, i) => (
                <motion.span key={i} className={styles.word} variants={titleReveal}>
                  {w}&nbsp;
                </motion.span>
              ))}
            </h1>

            <motion.p className={styles.heroLead} variants={wordReveal} custom={1}>
              내 문서·이메일·보고서를 AI가 즉시 분석해 핵심 표현을
              음성 드릴·대화·퀴즈로 바꿉니다. 출퇴근 10분, 업무에 바로 쓰는 표현만.
            </motion.p>

            {/* CTA / 스크롤 힌트 */}
            <div className={styles.heroCtas}>
              <motion.a
                href="#why"
                className={styles.primaryCta}
                variants={wordReveal}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                내 문서로 시작하기
              </motion.a>
              <motion.span
                className={styles.scrollHintBig}
                variants={wordReveal}
                aria-hidden
              >
                ⌄
              </motion.span>
            </div>
          </motion.div>

          {/* 비주얼 오브젝트(구체) — heroImage 대체 */}
          <motion.div
            className={styles.orb}
            variants={floatOrb}
            initial="initial"
            animate="animate"
            style={layerFast}
            aria-hidden
          />
          {/* halo glow layer (pure DOM) */}
          <div className={styles.orbGlow} aria-hidden />
        </section>

      {/* ── Why Abrody Exists ───────────────────────────── */}
      <section id="why" className={stylesB.section}>
      <motion.div
        className={stylesB.whyHeader}
        variants={fadeUp}
        viewport={{ once: true, amount: 0.45 }}
      >
        <span className={stylesB.sectionKicker}>문제</span>
        <h2 className={stylesB.sectionTitle}>4050을 위한 어브로디가 필요한 이유</h2>
        <p className={stylesB.sectionLead}>
        당신의 업무와 일상에서 시작해, 즉시 현업에 적용 가능한 학습을 만듭니다.
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
            icon: "🎯",
            title: "게임은 쉬워도, 업무는 어렵다",
            body: "캐릭터·XP가 아니라 ‘일에서 바로 쓰는 결과’가 필요합니다. 어브로디는 업무 연결형 학습을 전제로 만듭니다.",
          },
          {
            icon: "⏱",
            title: "시간은 없고, 맥락은 중요하다",
            body: "바쁜 출퇴근 사이, 내 일의 문서·메시지·통화 맥락으로 빠르게 배우는 게 핵심입니다.",
          },
          {
            icon: "🎙",
            title: "자신감·전달력",
            body: "우리는 실전 맥락 기반으로 명료성·유창성을 끌어올립니다.",
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
            어브로디만의 차별점
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
            우리는 ‘앱을 쓰는 시간’이 아니라 <strong>‘성과가 바뀌는 순간’</strong>을 디자인합니다.
            내 일의 문서·대화에서 출발해, <em>다음 회의·메일·발표</em>에서 달라지는 결과를 만듭니다.
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
                  id: "docAudio",
                  title: "보고서를 말로 익히기",
                  value: "회의 10분 전, 보고서 핵심이 자연스럽게 말로 나옵니다.",
                  feature: "PDF, PPT, 보고서에서 핵심 문장과 용어를 추출해 반복 듣기·따라하기 오디오를 즉시 생성합니다.",
                  badge: "🔊"
                },
                {
                  id: "fileChat",
                  title: "문서로 실제 상황 대화 연습",
                  value: "메일과 보고를 더 빠르고 자연스럽게 만들 수 있습니다.",
                  feature: "내 문서 내용을 바탕으로 이메일·보고·발표용 대화를 생성해 자연스럽게 연습합니다.",
                  badge: "💬"
                },
                {
                  id: "photoCTL",
                  title: "사진으로 현장 표현 만들기",
                  value: "현장 사진만으로 그 상황에서 바로 쓸 표현을 만듭니다.",
                  feature: "사진 한 장으로 상황에 맞는 학습 시나리오와 표현을 자동 생성합니다.",
                  badge: "📷"
                },
                {
                  id: "quiz",
                  title: "나만의 취약점만 고치는 퀴즈",
                  value: "자주 틀리는 표현을 집중적으로 교정합니다.",
                  feature: "실수와 빈출 표현을 자동 수집해 개인별 약점만 골라 퀴즈로 보완합니다.",
                  badge: "🧩"
                },
                {
                  id: "voice",
                  title: "실전 감각을 높이는 자연스러운 음성",
                  value: "회의처럼 들리고 말하는 연습의 몰입감이 높아집니다.",
                  feature: "실제 대화에 가까운 AI 음성으로 듣기와 말하기 훈련의 몰입감을 제공합니다.",
                  badge: "🎙"
                },
                {
                  id: "transfer",
                  title: "배운 내용이 바로 업무 성과로",
                  value: "학습한 표현이 다음 업무 결과로 곧장 연결됩니다.",
                  feature: "학습이 사용자의 실제 업무 맥락에서 시작되어 현장에서 바로 적용되는 성과를 만듭니다.",
                  badge: "🎯"
                },
            ].map((f, i) => (
              <FeatureCard key={f.id} item={f} idx={i} />
            ))}
          </motion.div>

          <motion.p
            className={stylesB.diffNoteClickable}
            variants={fadeLeft}
            custom={3}
            viewport={{ once: true, amount: 0.4 }}
            onClick={() => setQuoteOpen(v => !v)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setQuoteOpen(v => !v); }}
            role="button"
            tabIndex={0}
            aria-expanded={quoteOpen}
          >
            일과 학습을 끊김 없이 잇는 CTL 철학으로, 학습은 <em>그날의 일</em>에 스며들고
            결과는 <strong>현장</strong>에서 확인됩니다. 
          </motion.p>
        </section>

        <AnimatePresence>
            {quoteOpen && (
              <motion.blockquote
                className={stylesB.quoteReveal}
                variants={quoteVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="region"
                aria-live="polite"
              >
                <div className={stylesB.quoteBody}>
                  CTL 기반 학습은 말하기 명료성을
                  <span className={stylesB.gradientNumber}>54%</span>
                  유창성을
                  <span className={stylesB.gradientNumber}>65%</span> 향상시킵니다.
                  어브로디는 이 방식을 전 과정에 자동화합니다.
                </div>

                <motion.cite className={stylesB.quoteCiteReveal} variants={citeVariants}>
                  — Yusyac 외, 2021
                </motion.cite>
              </motion.blockquote>
            )}
          </AnimatePresence>
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
          <h2 className={stylesB.sectionTitle}>어브로디는 이렇게 작동합니다</h2>
        </motion.div>

        <div className={stylesB.flowGrid}>
          {[
            {
              kicker: "Upload",
              img: "/images/flow-6.png",
              title: "업무 문서 업로드",
              desc: "PDF·슬라이드·보고서를 올리면 핵심 문장/용어를 자동 추출하고 요약합니다.",
            },
            {
              kicker: "Chat",
              img: "/images/flow-7.png",
              title: "AI 대화 & 교정",
              desc: "문서 맥락으로 이메일/보고/발표 대화를 만들고, 즉시 교정을 받습니다.",
            },
            {
              kicker: "Drill",
              img: "/images/flow-8.png",
              title: "오디오 & 퀴즈",
              desc: "핵심 표현을 듣고-따라하고-테스트하며 기억에 박습니다.",
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
                <span className={stylesC.sectionKicker}>다운로드</span>
                <h2 className={stylesC.betaTitle}>Android에서 어브로디 받기</h2>
                <p className={stylesC.betaSubtitle}>Google Play에서 바로 다운로드하세요</p>
              </div>
              <div className={stylesC.ctaButtons}>
                <a
                  href="https://play.google.com/store/apps/details?id=com.fcdeapp.facade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  Google Play에서 다운로드
                </a>
              </div>
            </div>
          </section>

      </div>
      <WebFooter />
    </>
  );
}
