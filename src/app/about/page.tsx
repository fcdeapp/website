"use client";

import Head from "next/head";
import Image from "next/image";
import { motion, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import "aos/dist/aos.css";
import styles from "../../styles/pages/About.module.css";
import stylesB from "../../styles/pages/Business.module.css";
import stylesC from "../../styles/Home.module.css";
import WebFooter from "../../components/WebFooter";
import CountryBall from "../../components/CountryBall";
import ChainQuizzesSection from "../../components/ChainQuizzesSection";
import AOS from "aos";

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

export default function About() {

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
            {"Built for Gen X — Learn From Your Own Life".split(" ").map((w, i) => (
              <motion.span key={i} className={styles.word} variants={wordReveal}>
                {w}&nbsp;
              </motion.span>
            ))}
          </h1>

          {/* 서브카피 */}
          <motion.p className={styles.heroLead} variants={wordReveal} custom={1}>
            Tried language apps that felt like a game, not progress? <br />
            Abrody turns your real conversations—at work or with our AI—into targeted quizzes and practice. <br />
            Learn what matters, see results you can use.
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
              Why it works for Gen X
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
        <span className={stylesB.sectionKicker}>The Problem</span>
        <h2 className={stylesB.sectionTitle}>Why Abrody Exists for Gen X</h2>
        <p className={stylesB.sectionLead}>
          Most apps push scripted drills. We start from real life—so Gen X learners practice what they’ll actually say at work and in daily moments.
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
            title: "Apps That Don’t Stick",
            body: "Many learning apps lose adults fast. Gen X needs relevant, transferable practice—not streaks.",
          },
          {
            icon: "≠",
            title: "Study ≠ Speaking",
            body: "Endless grammar and XP don’t unlock spontaneous speaking. Confidence stays low without real-context practice.",
          },
          {
            icon: "₩",
            title: "Big Spend, Small Gains",
            body: "Time and money go in, practical results don’t. Abrody focuses on outcomes Gen X can use at work.",
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
            Why Gen X Chooses Abrody
          </motion.h2>

          <motion.div
            className={stylesB.flipHeader}
            variants={fadeUp}
            custom={2}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={stylesB.flowLabel}>Platform → User</span>
            <span className={stylesB.flipSwitch} aria-hidden>⇄</span>
            <span className={`${stylesB.flowLabel} ${stylesB.active}`}>User → Platform</span>
          </motion.div>

          <motion.p
            className={stylesB.diffLead}
            variants={fadeUp}
            custom={1}
            viewport={{ once: true, amount: 0.5 }}
          >
            We flip the direction of learning. It no longer flows <em>from</em> the platform <em>to</em> the user.
            With Abrody, everything starts <strong>from you</strong> — your situations, your context, your words.
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
                title: "Learn From Your Own Documents",
                body: "Upload your proposals, papers, and slides. Abrody’s AI extracts key points and core vocabulary, then turns them into repeatable practice.",
              },
              {
                title: "AI-Powered Summaries & Drills",
                body: "No more manual note-taking. Abrody auto-generates concise summaries and targeted quizzes from your real work.",
              },
              {
                title: "More Natural Voice Learning",
                body: "Abrody’s voices sound real—so you can listen, repeat, and practice in real-world scenarios, anytime, anywhere.",
              },
              {
                title: "Instant AI Dialogs From Your Files",
                body: "Jump into natural AI conversations based on the content you actually need—emails, reports, even presentations.",
              },
              {
                title: "Progress That Transfers to Work",
                body: "Every session is grounded in your actual job context, so what you practice transfers to real workplace results.",
              },
              {
                title: "Context First",
                body:
                  "Situation, intent, and phrasing come from your day—so it transfers.",
              },
              {
                title: "Hyper-Personalization",
                body:
                  "Your mistakes become targeted quizzes. Your phrases become practice.",
              },
              {
                title: "Less Game, More Gain",
                body:
                  "We optimize clarity and confidence—not points or streaks.",
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
            This user-first, contextual approach aligns with our vision—connecting daily life to language learning—
            and with research showing CTL can lift speaking clarity and fluency substantially.
          </motion.p>
        </section>


        <motion.blockquote
          className={stylesB.quote}
          variants={fadeLeft}
          custom={3}
          viewport={{ once: true, amount: 0.4 }}
        >
          CTL-based instruction lifts speaking clarity by
          <span className={stylesB.gradientNumber}>54%</span>
          and fluency by
          <span className={stylesB.gradientNumber}>65%</span>.
          Abrody automates CTL everywhere.
          <cite className={stylesB.quoteCite}>— Yusyac et al., 2021</cite>
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
          <span className={stylesB.sectionKicker}>Flow</span>
          <h2 className={stylesB.sectionTitle}>How It Works</h2>
        </motion.div>

        <div className={stylesB.flowGrid}>
          {[
            {
              kicker: "Snap",
              img: "/images/flow-1.png",
              title: "Snap & Scenario",
              desc: "Take a photo to automatically build a learning scenario from your moment.",
            },
            {
              kicker: "Chat",
              img: "/images/flow-4.png",
              title: "AI Chat & Correction",
              desc: "Chat with our AI tutor and get instant, contextual corrections.",
            },
            {
              kicker: "Quiz",
              img: "/images/flow-5.png",
              title: "Instant Quiz",
              desc: "Lock it in with a quick, targeted quiz.",
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
                <span className={stylesC.sectionKicker}>Download</span>
                <h2 className={stylesC.betaTitle}>Install on iOS</h2>
                <p className={stylesC.betaSubtitle}>
                  Available for Canada, Australia, UK &amp; Korea
                </p>
              </div>
              <div className={stylesC.ctaButtons}>
                <a
                  href="https://apps.apple.com/ca/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  Canada
                </a>
                <a
                  href="https://apps.apple.com/au/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  Australia
                </a>
                <a
                  href="https://apps.apple.com/gb/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  UK
                </a>
                <a
                  href="https://apps.apple.com/kr/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  Korea
                </a>
              </div>
            </div>
          </section>

          <section className={stylesC.betaSection} data-aos="fade-up">
            <div className={`${stylesC.betaCard} ${stylesC.glassCard}`}>
              <div className={stylesC.sectionHead}>
                <span className={stylesC.sectionKicker}>Get Abrody</span>
                <h2 className={stylesC.betaTitle}>Get Abrody on Android</h2>
                <p className={stylesC.betaSubtitle}>
                  Download Abrody on Google Play
                </p>
              </div>
              <div className={stylesC.ctaButtons}>
                <a
                  href="https://play.google.com/store/apps/details?id=com.fcdeapp.facade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  Download on Google Play
                </a>
              </div>
            </div>
          </section>

      </div>
      <WebFooter />
    </>
  );
}
