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
  idx,
  onFeatureOpen,
  onFeatureClose,
}: {
  item: {
    id: string;
    title: string;
    value: string;
    feature: string;
    badge: string;
  };
  idx: number;
  onFeatureOpen?: (id: string) => void;
  onFeatureClose?: (id: string) => void;
}) {
  const [mode, setMode] = React.useState<"value" | "feature">("value");
  const toggleMode = () => {
    setMode((m) => {
      const next = m === "value" ? "feature" : "value";
      if (next === "feature") onFeatureOpen?.(item.id);
      else onFeatureClose?.(item.id);
      return next;
    });
  };

  return (
    <motion.article
      className={`${stylesB.diffCard} ${stylesB.featCard}`}
      variants={fadeUp}
      custom={idx}
      layout
      whileHover={{ y: -6, boxShadow: "0 18px 40px rgba(17,12,43,0.12)" }}
      onClick={toggleMode}
      role="button"
      aria-pressed={mode === "feature"}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") toggleMode();
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
  const [openFeatureId, setOpenFeatureId] = useState<string | null>(null);

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

      <motion.main
        className={stylesB.wrapper}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
      >
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
              {"일상에서 배워요".split(" ").map((w, i) => (
                <motion.span key={i} className={styles.word} variants={titleReveal}>
                  {w}&nbsp;
                </motion.span>
              ))}
            </h1>

            <motion.p className={styles.heroLead} variants={wordReveal} custom={1}>
            지금의 경험을 바로 쓰는 말로 익혀요. 사진 한 장으로 시작하고, 오늘에 맞는 말로 끝나요.
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
                사진으로 시작하기
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
        <span className={stylesB.sectionKicker}>오직 나에 의해</span>
        <h2 className={stylesB.sectionTitle}>방금 있었던 일을 말로 풀어봐요</h2>
        <p className={stylesB.sectionLead}>
        일과 생활에서 바로 쓸 표현을 익혀요. 새 단어가 내 경험에 연결돼 기억에 남아요.
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
            icon: "📷",
            title: "사진이 내 단어장이 돼요",
            body: "내가 찍은 순간이 곧 주제가 돼요."
          },
          {
            icon: "🧠",
            title: "기억에 남는 이유",
            body: "새 단어가 내 경험에 연결돼 오래가요."
          },
          {
            icon: "✨",
            title: "군더더기 없이 딱 필요한 것만",
            body: "지금 상황에 맞는 표현만 빠르게 익혀요."
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
            <strong>맥락은 사진과 경험에서.</strong> 연습은 우리가 준비해요. 군더더기 없이, 나에게 필요한 것만 배워요.
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
                title: "사진에서 바로 말하기",
                value: "사진 속 순간을 한 줄 말로.",
                feature: "내 사진과 경험을 짧은 듣기로 바꿔줘요.",
                badge: "🔊"
              },
              {
                id: "fileChat",
                title: "내 순간으로 대화 연습",
                value: "방금 일을 자연스럽게 말해봐요.",
                feature: "사진/메모를 바탕으로 실제 같은 대화를 만들어 연습해요.",
                badge: "💬"
              },
              {
                id: "photoCTL",
                title: "사진 한 장으로 시작",
                value: "오늘에 맞는 표현만 골라줘요.",
                feature: "한 장의 사진으로 상황 맞춤 표현과 학습 시나리오를 생성해요.",
                badge: "📷"
              },
              {
                id: "quiz",
                title: "약점만 콕, 퀴즈",
                value: "자주 헷갈리는 부분만 빠르게.",
                feature: "내가 틀리거나 자주 쓰는 패턴을 모아 개인 맞춤 퀴즈로 복습해요.",
                badge: "🧩"
              },
              {
                id: "voice",
                title: "자연스러운 목소리",
                value: "실제 대화처럼 듣고 말해요.",
                feature: "사람 같은 AI 음성으로 몰입감 있게 연습해요.",
                badge: "🎙"
              },
              {
                id: "transfer",
                title: "오늘 바로 쓰는 학습",
                value: "배운 표현이 오늘 대화에.",
                feature: "내 순간에서 시작하니 결과가 바로 일상에 이어져요.",
                badge: "🎯"
              },
            ].map((f, i) => (
              <FeatureCard
                key={f.id}
                item={f}
                idx={i}
                onFeatureOpen={(id) => setOpenFeatureId(id)}
                onFeatureClose={(id) => {
                  setOpenFeatureId((prev) => (prev === id ? null : prev));
                }}
              />
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
                  사진·경험 기반 연습은 기억 고정과 말하기 자신감을
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

      {openFeatureId === "quiz" && <ChainQuizzesSection />}

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
              kicker: "Snap",
              img: "/images/flow-6.png",
              title: "사진 한 장으로 시작",
              desc: "지금 이 순간을 찍으면 주제와 단어장이 바로 정해져요.",
            },
            {
              kicker: "Talk",
              img: "/images/flow-7.png",
              title: "방금 있었던 일을 말로 풀기",
              desc: "상황에 맞는 자연스러운 표현을 바로 익혀요.",
            },
            {
              kicker: "Remember",
              img: "/images/flow-8.png",
              title: "사진으로 기억에 남기기",
              desc: "내 경험이 금방 내 표현이 돼요.",
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
      </motion.main>
      <WebFooter />
    </>
  );
}
