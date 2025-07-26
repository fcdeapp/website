// app/business/page.tsx
// ───────────────────────────────────────────────────────────
"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import styles from "../../styles/pages/Business.module.css";

// Reusable motion variants
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" },
  }),
};

const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.12 + 0.2, duration: 0.55, ease: "easeOut" },
  }),
};

export default function BusinessPage() {
  return (
    <motion.main
      className={styles.wrapper}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── Hero ─────────────────────────────────────────────*/}
      <section className={styles.hero}>
        <motion.h1
          className={styles.heroTitle}
          variants={zoomIn}
          initial="hidden"
          animate="visible"
        >
          Everyday Life,
          <br /> Fluent English — <span className={styles.brand}>Abrody</span>
        </motion.h1>
        <motion.p
          className={styles.heroSubtitle}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
        >
          Snap • Speak • Succeed — AI‑powered English coaching drawn from your day‑to‑day experiences.
        </motion.p>
      </section>

      {/* ── Problem / Solution ───────────────────────────────*/}
      <section className={styles.section}>
        <motion.h2
          className={styles.sectionTitle}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          Why Abrody Exists
        </motion.h2>
        <motion.div
          className={styles.cardsGrid}
          initial="hidden"
          whileInView={{
            opacity: 1,
            transition: { staggerChildren: 0.15 },
          }}
          viewport={{ once: true, amount: 0.2 }}
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
              whileHover={{ y: -6, boxShadow: "0 12px 20px rgba(0,0,0,0.08)" }}
            >
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </motion.article>
          ))}
        </motion.div>
        <motion.blockquote
          className={styles.quote}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
          custom={3}
        >
          CTL‑based instruction lifts speaking clarity by <strong>54 %</strong> and fluency by <strong>65 %</strong>. Abrody automates CTL everywhere. <em>— Yusyac et al., 2021</em>
        </motion.blockquote>
      </section>

      {/* ── Product Snapshot ─────────────────────────────────*/}
      <section className={styles.sectionAlt}>
        <motion.h2
          className={styles.sectionTitle}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
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
              variants={fadeUp}
              custom={i}
            >
              {step}
            </motion.li>
          ))}
        </motion.ol>
      </section>

      {/* ── Market & Model ───────────────────────────────────*/}
      <section className={styles.section}>
        <motion.h2
          className={styles.sectionTitle}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          Market & Business Model
        </motion.h2>
        <motion.div
          className={styles.marketGrid}
          initial="hidden"
          whileInView={{
            opacity: 1,
            transition: { staggerChildren: 0.15 },
          }}
          viewport={{ once: true, amount: 0.2 }}
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
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          custom={3}
        >
          Freemium first: core features are free. Premium at <strong>₩19,000 / mo</strong> or <strong>₩136,800 / yr</strong> drives an average paid‑user LTV of <strong>₩102,714</strong>.
        </motion.p>
      </section>

      {/* ── Milestones ───────────────────────────────────────*/}
      <section className={styles.sectionAlt}>
        <motion.h2
          className={styles.sectionTitle}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          Roadmap
        </motion.h2>
        <motion.div
          className={styles.timeline}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
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

      {/* ── Team ─────────────────────────────────────────────*/}
      <section className={styles.section}>
        <motion.h2
          className={styles.sectionTitle}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
        >
          Team
        </motion.h2>
        <motion.div
          className={styles.teamGrid}
          initial="hidden"
          whileInView={{
            opacity: 1,
            transition: { staggerChildren: 0.15 },
          }}
          viewport={{ once: true, amount: 0.2 }}
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
              whileHover={{ translateY: -6, boxShadow: "0 12px 20px rgba(0,0,0,0.08)" }}
            >
              <h3>{member.name}</h3>
              <p>{member.bio}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      {/* ── CTA ───────────────────────────────────────────*/}
      <section className={styles.ctaSection}>
        <motion.h2
          className={styles.ctaTitle}
          variants={zoomIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.6 }}
        >
          Ready to rewrite language learning?
        </motion.h2>
        <motion.a
          href="mailto:tommydoh@abrody.app"
          className={styles.ctaButton}
          whileHover={{ scale: 1.07, boxShadow: "0 10px 20px rgba(0,0,0,0.18)" }}
          whileTap={{ scale: 0.97 }}
        >
          Contact us
        </motion.a>
      </section>
    </motion.main>
  );
}