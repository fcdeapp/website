"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import "aos/dist/aos.css";
import styles from "../../styles/pages/About.module.css";
import stylesB from "../../styles/pages/Business.module.css";
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
            <motion.h1 variants={zoomIn}>The Easiest Way to Learn a Language — From Your Own Words</motion.h1>
            <motion.p variants={fadeUp} custom={1}>
              Tried language apps but never felt like you were improving? <br />
              Abrody turns your actual conversations — with friends or our AI — into personalized quizzes and interactive study materials. <br />
              Learn smarter, not harder. See real progress and get truly engaged, every day.
            </motion.p>
            <motion.a href="#why" className={styles.scrollHint} variants={fadeUp} custom={2} whileHover={{ y: 4 }}>
              ↓ See why
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
        <span className={stylesB.sectionKicker}>The Problem</span>
        <h2 className={stylesB.sectionTitle}>Why Abrody Exists</h2>
        <p className={stylesB.sectionLead}>
          Traditional apps push scripted content at learners. We start from real life —
          letting your daily context generate what you practice next.
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
            title: "Lowest App Retention",
            body: "Education apps post the worst 30-day retention (2.1 %). Learners quit before progress. — AppsFlyer 2025",
          },
          {
            icon: "≠",
            title: "Study ≠ Speaking",
            body: "Grammar drills and XP rarely yield spontaneous conversation; anxiety stays high even after years of study.",
          },
          {
            icon: "₩",
            title: "Costly Yet Ineffective",
            body: "South Korea spends ₩29.2 T (≈ $21 B) annually on English, yet ranks 50th in EF EPI proficiency.",
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
            What Makes Abrody Different
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
                title: "User-Origin Learning",
                body:
                  "Real life leads, the platform follows. Lessons are seeded by your own conversations and moments, not scripted drills.",
              },
              {
                title: "Context at the Core",
                body:
                  "Situation, intent, and phrasing come from your day-to-day context—so practice instantly feels relevant and transferable.",
              },
              {
                title: "Hyper-Personalization",
                body:
                  "Your mistakes become tailored quizzes, your favorite phrases become targeted practice. Progress is personal, not generic.",
              },
              {
                title: "AI-Powered, Not App-Powered",
                body:
                  "AI turns your lived moments into dialogues, feedback, and review—automating a CTL-style loop that actually builds fluency.",
              },
              {
                title: "Less Gamification, More Growth",
                body:
                  "We optimize for speaking clarity and confidence—not just streaks. Learn in a way that sticks when you talk to real people.",
              },
              {
                title: "From Daily Life to Daily Wins",
                body:
                  "Snap → Chat → Quiz, repeatedly—each micro-loop converts life into practice and builds durable skill, day after day.",
              },
              {
                title: "Chain Quizzes for Deeper Recall",
                body:
                  "Linked questions guide you step-by-step, mirroring how large language models learn — so each answer strengthens the next.",
              },
              {
                title: "Word Chains That Stick",
                body:
                  "Vocabulary connects in context, not isolation. Chained practice weaves words into patterns you’ll actually recall when speaking.",
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
              desc: "Practice what you learned in a quick, targeted quiz.",
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

      </div>
      <WebFooter />
    </>
  );
}
