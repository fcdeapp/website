"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import styles from "../../styles/pages/Business.module.css";

/* ───────── Reusable motion variants ───────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" },
  }),
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.12 + 0.25, duration: 0.7, ease: "easeOut" },
  }),
};

const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.12 + 0.15, duration: 0.55, ease: "easeOut" },
  }),
};

export default function BusinessPage() {
  return (
    <motion.main
      className={styles.wrapper}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      {/* ── Hero ─────────────────────────────────────── */}
      <section className={styles.hero}>
        <motion.h1
          className={styles.heroTitle}
          variants={zoomIn}
          viewport={{ once: true, amount: 0.6 }}
        >
          Everyday Life,
          <br />
          Fluent English —{" "}
          <span className={styles.brandGradient}>Abrody</span>
        </motion.h1>

        <motion.p
          className={styles.heroSubtitle}
          variants={fadeUp}
          custom={1}
          viewport={{ once: true, amount: 0.6 }}
        >
          Snap • Speak • Succeed — AI‑powered English coaching drawn from your
          day‑to‑day experiences.
        </motion.p>

        <motion.a
          href="#why"
          className={styles.scrollHint}
          variants={fadeUp}
          custom={2}
          viewport={{ once: true, amount: 0.6 }}
          whileHover={{ y: 4 }}
        >
          ↓ Dive in
        </motion.a>
      </section>

      {/* ── Problem / Solution ──────────────────────── */}
      <section id="why" className={styles.section}>
        <motion.h2
          className={styles.sectionTitle}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          Why Abrody Exists
        </motion.h2>

        <motion.div
          className={styles.cardsGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {[
            {
              title: "Lowest App Retention",
              body:
                "Education apps post the worst 30‑day retention (2.1 %). Learners quit before progress. — AppsFlyer 2025",
            },
            {
              title: "Study ≠ Speaking",
              body:
                "Grammar drills and XP rarely yield spontaneous conversation; anxiety stays high even after years of study.",
            },
            {
              title: "Costly Yet Ineffective",
              body:
                "South Korea spends ₩29.2 T (≈ $21 B) annually on English, yet ranks 50th in EF EPI proficiency.",
            },
          ].map((card, i) => (
            <motion.article
              key={card.title}
              className={styles.card}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -8, rotate: -0.5 }}
            >
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </motion.article>
          ))}
        </motion.div>

        <motion.blockquote
          className={styles.quote}
          variants={fadeRight}
          custom={3}
          viewport={{ once: true, amount: 0.35 }}
        >
          CTL‑based instruction lifts speaking clarity by{" "}
          <strong>54 %</strong> and fluency by <strong>65 %</strong>. Abrody
          automates CTL everywhere. <em>— Yusyac et al., 2021</em>
        </motion.blockquote>
      </section>

      <div className={styles.waveBottom} />

      {/* ── Product Snapshot ────────────────────────── */}
      <section className={styles.sectionAlt}>
        <motion.h2
          className={styles.sectionTitle}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          How It Works
        </motion.h2>

        <motion.ol
          className={styles.steps}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {[
            "Take a photo from your daily life.",
            "Our AI detects context and crafts a personalised dialogue, quiz, and real‑time feedback.",
            "Key phrases are saved into an auto‑generated smart notebook for spaced review.",
            "Upgrade for unlimited chats, longer memory, natural TTS voices, and an ad‑free experience.",
          ].map((step, i) => (
            <motion.li
              key={i}
              className={styles.stepItem}
              variants={zoomIn}
              custom={i}
            >
              <span className={styles.stepIndex}>{i + 1}</span>
              <p>{step}</p>
            </motion.li>
          ))}
        </motion.ol>
      </section>

      <div className={styles.waveTop} />

      {/* ── Market & Model ──────────────────────────── */}
      <section className={styles.section}>
        <motion.h2
          className={styles.sectionTitle}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          Market & Business Model
        </motion.h2>

        <motion.div
          className={styles.marketGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {[
            { tag: "TAM", value: "$61.7 B", label: "Global online language learning" },
            { tag: "SAM", value: "$5.3 B", label: "KR · CA · AU · UK combined" },
            { tag: "SOM", value: "$53.1 M", label: "Initial 1 % slice" },
          ].map((m, i) => (
            <motion.div
              key={m.tag}
              className={styles.marketCard}
              variants={zoomIn}
              custom={i}
            >
              <span className={styles.marketTag}>{m.tag}</span>
              <strong className={styles.marketValue}>{m.value}</strong>
              <span className={styles.marketLabel}>{m.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          className={styles.modelCopy}
          variants={fadeRight}
          custom={3}
          viewport={{ once: true, amount: 0.45 }}
        >
          Freemium first: core features are free. Premium at{" "}
          <strong>₩19,000 / mo</strong> or <strong>₩136,800 / yr</strong>{" "}
          drives an average paid‑user LTV of <strong>₩102,714</strong>.
        </motion.p>
      </section>

      {/* ── Milestones ─────────────────────────────── */}
      <section className={styles.sectionAlt}>
        <motion.h2
          className={styles.sectionTitle}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          Roadmap
        </motion.h2>

        <motion.div
          className={styles.timeline}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
        >
          {[
            { time: "2025 Aug", text: "Android launch · CAC ≤ ₩2,900" },
            { time: "2025 Q4", text: "AR practice beta · New pricing tiers" },
            { time: "2026 Q1", text: "Launch AR publicly · power‑users > 50 K" },
            { time: "2026 H2", text: "Pre‑Series A raise · global expansion" },
          ].map((mile, i) => (
            <motion.div
              key={mile.time}
              className={styles.milestone}
              variants={fadeUp}
              custom={i}
            >
              <span className={styles.mileTime}>{mile.time}</span>
              <span className={styles.mileText}>{mile.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── Team ───────────────────────────────────── */}
      <section className={styles.section}>
        <motion.h2
          className={styles.sectionTitle}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          Team
        </motion.h2>

        <motion.div
          className={styles.teamGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {[
            {
              name: "Tommy Doh · CEO & Founder",
              bio: "Full‑stack developer (React Native, Node.js, AWS) & designer. SNU architecture — unites tech, design, and learning science.",
            },
            {
              name: "Tae‑Yeon Kim · CFO & Growth",
              bio: "Dual major CS & Business. Ex‑PwC, UNESCO. Data‑driven growth, finance, and CAC wins.",
            },
          ].map((member, i) => (
            <motion.article
              key={member.name}
              className={styles.member}
              variants={zoomIn}
              custom={i}
              whileHover={{ y: -8 }}
            >
              <h3>{member.name}</h3>
              <p>{member.bio}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className={styles.ctaSection}>
        <motion.h2
          className={styles.ctaTitle}
          variants={zoomIn}
          viewport={{ once: true, amount: 0.55 }}
        >
          Ready to rewrite language learning?
        </motion.h2>

        <motion.a
          href="mailto:tommydoh@abrody.app"
          className={styles.ctaButton}
          whileHover={{ scale: 1.07, boxShadow: "0 14px 30px rgba(0,0,0,0.18)" }}
          whileTap={{ scale: 0.95 }}
        >
          Contact us
        </motion.a>
      </section>
    </motion.main>
  );
}
