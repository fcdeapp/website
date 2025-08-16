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
  const [showStatus, setShowStatus] = React.useState(false);

  const downloadData = [
    { date: "2024-06-16", ios: 16, android: 5, sum: 21 },
    { date: "2024-07-01", ios: 51, android: 6, sum: 57 },
    { date: "2024-07-16", ios: 159, android: 7, sum: 166 },
    { date: "2024-08-01", ios: 203, android: 6, sum: 209 },
    { date: "2024-08-16", ios: 328, android: 25, sum: 353 },
  ];

  // helper: readable label (e.g., "6/16")
  const shortLabel = (isoDate: string) => {
    const d = new Date(isoDate);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  // helper: build svg path 'd' for a series
  const buildPath = (values: number[], w = 600, h = 160, padLeft = 20, padRight = 20) => {
    if (!values || values.length === 0) return "";
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const n = values.length;
    const usableW = Math.max(1, w - padLeft - padRight);
    const xFor = (i: number) => padLeft + (i / (n - 1)) * usableW;
    const yFor = (v: number) => {
      const normalized = (v - min) / range;
      return h - normalized * (h - 24) - 8; // top/bottom padding
    };
    return values
      .map((v, i) => `${i === 0 ? "M" : "L"} ${xFor(i).toFixed(2)} ${yFor(v).toFixed(2)}`)
      .join(" ");
  };

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
        <motion.div
          className={styles.whyHeader}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={styles.sectionKicker}>Flow</span>
          <h2 className={styles.sectionTitle}>How It Works</h2>
        </motion.div>

        <div className={styles.flowGrid}>
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
              className={styles.flowStep}
              variants={zoomIn}
              custom={i}
            >
              {/* 작은 칩 — 이미지(또는 제목) 위에 표시 */}
              <span className={styles.stepKicker} aria-hidden>
                {step.kicker}
              </span>

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
          <div style={{ marginTop: "0.75rem" }}>
            <button
              className={styles.statusToggle}
              onClick={() => setShowStatus((s) => !s)}
              aria-expanded={showStatus}
              aria-controls="downloads-status-panel"
            >
              {showStatus ? "Hide status" : "View status"}
            </button>
          </div>
        </motion.div>

        {/* ── REPLACE: downloads status panel (graph-focused) ── */}
        <div
          id="downloads-status-panel"
          className={`${styles.statusPanel} ${showStatus ? styles.open : ""}`}
          aria-hidden={!showStatus}
        >
          <div className={styles.statusInner}>
            <div className={styles.chartWrapper}>
              <svg
                className={styles.sparklineSvg}
                viewBox="0 0 600 180"
                preserveAspectRatio="none"
                role="img"
                aria-label="Download counts over time"
              >
                <defs>
                  <linearGradient id="areaSumGrad" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#ffd7d9" stopOpacity="0.95" />
                    <stop offset="100%" stopColor="#fff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* area for sum (filled) */}
                <path
                  d={`${buildPath(downloadData.map(d => d.sum), 600, 160)} L ${600 - 20} ${160 - 8} L 20 ${160 - 8} Z`}
                  fill="url(#areaSumGrad)"
                  className={styles.areaSum}
                />

                {/* lines: ios, android, sum */}
                <path
                  d={buildPath(downloadData.map(d => d.ios), 600, 160)}
                  fill="none"
                  strokeWidth={2}
                  className={styles.lineIos}
                />
                <path
                  d={buildPath(downloadData.map(d => d.android), 600, 160)}
                  fill="none"
                  strokeWidth={2}
                  className={styles.lineAndroid}
                />
                <path
                  d={buildPath(downloadData.map(d => d.sum), 600, 160)}
                  fill="none"
                  strokeWidth={2.5}
                  className={styles.lineSum}
                />

                {/* x-axis ticks (dates) */}
                {downloadData.map((d, i) => {
                  const n = downloadData.length;
                  const padLeft = 20;
                  const padRight = 20;
                  const usableW = 600 - padLeft - padRight;
                  const x = padLeft + (i / (n - 1)) * usableW;
                  return (
                    <g key={d.date}>
                      <line x1={x} x2={x} y1={160 - 6} y2={160 - 2} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                      <text
                        x={x}
                        y={176}
                        textAnchor="middle"
                        fontSize="11"
                        fill="#666"
                        className={styles.xLabel}
                      >
                        {shortLabel(d.date)}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* legend */}
              <div className={styles.statusLegend}>
                <div className={styles.legendItem}><span className={styles.legendSwatchIos} /> iOS</div>
                <div className={styles.legendItem}><span className={styles.legendSwatchAndroid} /> Android</div>
                <div className={styles.legendItem}><span className={styles.legendSwatchSum} /> Total</div>
              </div>
            </div>

            {/* summary line with latest totals */}
            <div className={styles.statusSummary}>
              <div className={styles.latestLabel}>Latest ( {shortLabel(downloadData[downloadData.length - 1].date)} )</div>
              <div className={styles.latestNumbers}>
                <div>iOS: <strong>{downloadData[downloadData.length - 1].ios}</strong></div>
                <div>Android: <strong>{downloadData[downloadData.length - 1].android}</strong></div>
                <div>Total: <strong>{downloadData[downloadData.length - 1].sum}</strong></div>
              </div>
            </div>
          </div>
        </div>

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
        <motion.div
          className={styles.whyHeader}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={styles.sectionKicker}>Team</span>
          <h2 className={styles.sectionTitle}>Team</h2>
        </motion.div>

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
        <motion.div
          className={styles.whyHeader}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={styles.sectionKicker}>Resources</span>
          <h2 className={styles.sectionTitle}>Downloads</h2>
        </motion.div>

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
