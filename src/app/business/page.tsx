"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import styles from "../../styles/pages/Business.module.css";
import FlipNumber from "../../components/FlipNumber";
import ChainQuizzesSection from "../../components/ChainQuizzesSection";

/* ───────── Motion variants ───────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 64 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: "easeOut" },
  }),
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.12 + 0.15, duration: 0.8, ease: "easeOut" },
  }),
};

const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1 + 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

const numberVariant: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { delay: 0.4 + i * 0.3, duration: 0.6, ease: "easeOut" },
    }),
  };

export default function BusinessPage() {
  const [preview, setPreview] = React.useState<null | { type: "pdf" | "video"; src: string }>(null);

  return (
    <motion.main
      className={styles.wrapper}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={styles.hero}>
        <div className={styles.starfield} /> {/* 배경 오브젝트 */}
        <motion.h1
          className={styles.heroTitle}
          variants={zoomIn}
          viewport={{ once: true, amount: 0.6 }}
        >
          Everyday Life,
          <br />
          Fluent Language —{" "}
          <span className={styles.brandGradient}>Abrody</span>
        </motion.h1>

        <motion.p
          className={styles.heroSubtitle}
          variants={fadeUp}
          custom={1}
          viewport={{ once: true, amount: 0.6 }}
        >
          Snap • Speak • Succeed — AI‑powered Language coaching drawn from your
          day‑to‑day experiences.
        </motion.p>

        <motion.a
          href="#why"
          className={styles.scrollHint}
          variants={fadeUp}
          custom={2}
          viewport={{ once: true, amount: 0.6 }}
          whileHover={{ y: 6 }}
        >
          ↓ Dive in
        </motion.a>
      </section>

      {/* ── Why Abrody Exists ───────────────────────────── */}
      <section id="why" className={styles.section}>
      <motion.div
        className={styles.whyHeader}
        variants={fadeUp}
        viewport={{ once: true, amount: 0.45 }}
      >
        <span className={styles.sectionKicker}>The Problem</span>
        <h2 className={styles.sectionTitle}>Why Abrody Exists</h2>
        <p className={styles.sectionLead}>
          Traditional apps push scripted content at learners. We start from real life —
          letting your daily context generate what you practice next.
        </p>
      </motion.div>

      <motion.div
        className={styles.cards3D}
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
            className={`${styles.card} ${styles.statCard}`}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
          >
            <span className={styles.statBadge} aria-hidden>{card.icon}</span>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </motion.article>
        ))}
      </motion.div>


        {/* ── Differentiators ───────────────────────────── */}
        <section className={styles.sectionAlt}>
          <motion.h2
            className={styles.sectionTitle}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.45 }}
          >
            What Makes Abrody Different
          </motion.h2>

          <motion.div
            className={styles.flipHeader}
            variants={fadeUp}
            custom={2}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.flowLabel}>Platform → User</span>
            <span className={styles.flipSwitch} aria-hidden>⇄</span>
            <span className={`${styles.flowLabel} ${styles.active}`}>User → Platform</span>
          </motion.div>

          <motion.p
            className={styles.diffLead}
            variants={fadeUp}
            custom={1}
            viewport={{ once: true, amount: 0.5 }}
          >
            We flip the direction of learning. It no longer flows <em>from</em> the platform <em>to</em> the user.
            With Abrody, everything starts <strong>from you</strong> — your situations, your context, your words.
          </motion.p>

          <motion.div
            className={styles.diffGrid}
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
            ].map((f, i) => (
              <motion.article
                key={f.title}
                className={styles.diffCard}
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
            className={styles.diffNote}
            variants={fadeLeft}
            custom={3}
            viewport={{ once: true, amount: 0.4 }}
          >
            This user-first, contextual approach aligns with our vision—connecting daily life to language learning—
            and with research showing CTL can lift speaking clarity and fluency substantially.
          </motion.p>
        </section>


        <motion.blockquote
          className={styles.quote}
          variants={fadeLeft}
          custom={3}
          viewport={{ once: true, amount: 0.4 }}
        >
          CTL-based instruction lifts speaking clarity by
          <span className={styles.gradientNumber}>54%</span>
          and fluency by
          <span className={styles.gradientNumber}>65%</span>.
          Abrody automates CTL everywhere.
          <cite className={styles.quoteCite}>— Yusyac et al., 2021</cite>
        </motion.blockquote>

      </section>

      <div className={styles.waveSplit} />

      <ChainQuizzesSection />

      {/* ── How It Works ───────────────────────────────── */}
      <section className={styles.sectionAlt}>
        <motion.h2
          className={styles.sectionTitle}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          How It Works
        </motion.h2>

        <div className={styles.flowGrid}>
            {[
            {
                img: "/images/flow-1.png",
                title: "1. Snap & Scenario",
                desc: "Take a photo to automatically build your learning scenario.",
            },
            {
                img: "/images/flow-4.png",
                title: "2. AI Chat & Correction",
                desc: "Chat with our AI tutor—get real‑time corrections.",
            },
            {
                img: "/images/flow-5.png",
                title: "3. Instant Quiz",
                desc: "Jump straight into a quiz to reinforce what you learned.",
            },
            ].map((step, i) => (
            <motion.div
                key={i}
                className={styles.flowStep}
                variants={zoomIn}
                custom={i}
            >
                <img src={step.img} alt={step.title} />
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
            </motion.div>
            ))}
        </div>
      </section>

      <div className={styles.waveSplitFlip} />

      {/* ── Roadmap (Timeline) ───────────────────────── */}
      <section className={styles.sectionRoad}>
        <motion.div
          className={styles.roadmapHeader}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.5 }}
        >
          <span className={styles.sectionKicker}>Plan</span>
          <h2 className={styles.sectionTitle}>Roadmap</h2>
        </motion.div>

        <div className={styles.roadmapWrap}>
          <div className={styles.roadmapTrack} aria-hidden />
          {[
            { time: "2025 Aug", text: "Android launch · CAC ≤ ₩2,900", status: "next" },
            { time: "2025 Q4", text: "AR practice beta · New pricing tiers", status: "planned" },
            { time: "2026 Q1", text: "Launch AR publicly · power-users > 50 K", status: "planned" },
            { time: "2026 H2", text: "Pre-Series A raise · global expansion", status: "planned" },
          ].map((mile, i) => (
            <motion.article
              key={mile.time}
              className={`${styles.milestoneCard} ${i % 2 ? styles.right : styles.left}`}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <span className={`${styles.mileDot} ${styles[mile.status]}`} />
              <header className={styles.mileHead}>
                <span className={styles.mileTime}>{mile.time}</span>
                <span className={`${styles.milePill} ${styles[mile.status]}`}>
                  {mile.status === "next" ? "Next" : "Planned"}
                </span>
              </header>
              <p className={styles.mileText}>{mile.text}</p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────── */}
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
              name: "Jungmin Doh",
              role: "Founder\nCEO",
              bio: `“I build products that feel like a natural extension of your day — blending tech, design, and genuine human moments to make learning stick.”`,
            },
            {
              name: "Taeyeon Kim",
              role: "Executive\nCFO",
              bio: `“I’m here to turn insight into impact — using data and strategy to grow our community sustainably and meaningfully.”`,
            },
            {
              name: "Chaewon Kim",
              role: "Executive\nCMO",
              bio: `“I turn market insight into growth — leveraging segmentation, content, and influencer campaigns to reach and engage the right users, globally.”`,
            },
          ].map((m, i) => (
            <motion.article
              key={m.name}
              className={styles.member}
              variants={zoomIn}
              custom={i}
              whileHover={{ y: -10, boxShadow: "0 18px 28px rgba(0,0,0,0.12)" }}
            >
              <h3 className={styles.memberName}>{m.name}</h3>
              <p className={styles.memberRole} style={{ whiteSpace: "pre-line" }}>
                {m.role}
              </p>
              <p className={styles.memberBio}>{m.bio}</p>

              {/* ↓ CEO에게만 Learn more 노출 */}
              {m.role.includes("CEO") && (
                <a href="/ceo-profile" className={styles.learnMore}>
                  Learn more
                </a>
              )}
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className={styles.downloadSection}>
        <h3 className={styles.downloadTitle}>Downloads</h3>
        <div className={styles.downloadGrid}>
          {/* Pitch Deck Card */}
          <motion.article className={styles.dCard} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true, amount:0.3}}>
            <div className={styles.dHead}>
              <h4 className={styles.dTitle}>Pitch Deck</h4>
              <span className={styles.dMeta}>PDF · Korean</span>
            </div>
            <p className={styles.dDesc}>Our fundraising deck with product, market, and traction highlights.</p>
            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => setPreview({ type: "pdf", src: "/(주)파사드커넥트_도정민_피치덱.pdf" })}
              >
                Preview
              </button>
              <a
                className={`${styles.btn} ${styles.btnGhost}`}
                href={encodeURI("/(주)파사드커넥트_도정민_피치덱.pdf")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new tab
              </a>
              <a
                href="/(주)파사드커넥트_도정민_피치덱.pdf"
                download
                className={`${styles.btn} ${styles.btnGhost}`}
              >
                Download
              </a>
            </div>
          </motion.article>

          {/* Demo Video Card */}
          <motion.article className={styles.dCard} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true, amount:0.3}} transition={{delay:0.06}}>
            <div className={styles.dHead}>
              <h4 className={styles.dTitle}>Demo Video</h4>
              <span className={styles.dMeta}>MP4 · English</span>
            </div>
            <p className={styles.dDesc}>A quick walkthrough of Abrody’s core user flow and features.</p>
            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => setPreview({ type: "video", src: "/demoAbrody.mp4" })}
              >
                Preview
              </button>
              <a
                className={`${styles.btn} ${styles.btnGhost}`}
                href={encodeURI("/demoAbrody.mp4")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new tab
              </a>
              <a
                href="/demoAbrody.mp4"
                download
                className={`${styles.btn} ${styles.btnGhost}`}
              >
                Download
              </a>
            </div>
          </motion.article>

          {/* 1-Pager (EN) Card */}
          <motion.article className={styles.dCard} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true, amount:0.3}} transition={{delay:0.12}}>
            <div className={styles.dHead}>
              <h4 className={styles.dTitle}>1-Pager</h4>
              <span className={styles.dMeta}>PDF · English</span>
            </div>
            <p className={styles.dDesc}>A one-page overview of Abrody’s mission, product, and traction.</p>
            <div className={styles.actions}>
              <a
                href="/1-pager(EN).pdf"
                download
                className={`${styles.btn} ${styles.btnGhost}`}
              >
                Download
              </a>
            </div>
          </motion.article>

        </div>
      </section>

    {/* ── Preview Modal ───────────────────────────── */}
    {preview && (
      <motion.div
        className={styles.modalBackdrop}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setPreview(null)}
      >
        <motion.div
          className={styles.modalBody}
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className={styles.modalClose} onClick={() => setPreview(null)}>✕</button>
          {preview.type === "pdf" ? (
            <iframe
              className={styles.previewFrame} 
              src={preview.src}
              title="Pitch Deck Preview"
            />
          ) : (
            <video className={styles.previewVideo} src={preview.src} controls playsInline />
          )}
          <div className={styles.modalActions}>
            <a className={`${styles.btn} ${styles.btnPrimary}`} href={preview.src} download>
              Download
            </a>
            <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setPreview(null)}>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}

     {/* ── CTA ───────────────────────────────────────── */}
     <section className={styles.ctaSection}>
        <motion.h2
          className={styles.ctaTitle}
          variants={zoomIn}
          viewport={{ once: true, amount: 0.55 }}
        >
          Ready to rewrite language learning?
        </motion.h2>

        <div className={styles.ctaButtons}>
          <a
            href="mailto:tommydoh@abrody.app"
            className={styles.ctaButton}
            onClick={e => {
              e.preventDefault();
              window.location.href = "mailto:tommydoh@abrody.app";
            }}
          >
            Contact us
          </a>
        </div>
        <p className={styles.ctaNote}>
          We are currently raising pre‑seed to seed funding. Please reach out if you’d like to chat!
        </p>
      </section>

    </motion.main>
  );
}
