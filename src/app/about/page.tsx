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

// ADD: value ↔ feature toggle card
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
              {/* swap to small badge + show feature description */}
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

// Stagger parent
const heroParent: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

// word-by-word text reveal
const wordReveal: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// floating orb
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
    // AOS init (client only)
    AOS.init({
      once: true,
      duration: 700,
      easing: "ease-out",
      offset: 80,
    });
    // recalc after content/layout changes
    AOS.refresh();
  }, []);

  // mouse parallax
  const mx = useMotionValue(0);   // -40 ~ 40(px)
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.25 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.25 });

  // 3D tilt angles
  const tiltX = useTransform(sy, v => v / -8); // deg
  const tiltY = useTransform(sx, v => v / 8);  // deg

  // parallax depths per layer
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
          {/* --- background FX layers (absolute) --- */}
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

          {/* --- foreground content (3D tilt) --- */}
          <motion.div
            className={styles.heroInner}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.7 }}
            variants={heroParent}
            style={{ rotateX: tiltX, rotateY: tiltY }}
          >
            {/* title: word-by-word reveal */}
            <h1 className={styles.heroTitle}>
              {"Confident communication in any language, for busy professionals in their 40s and 50s".split(" ").map((w, i) => (
                <motion.span key={i} className={styles.word} variants={titleReveal}>
                  {w}&nbsp;
                </motion.span>
              ))}
            </h1>

            <motion.p className={styles.heroLead} variants={wordReveal} custom={1}>
              AI instantly analyzes your documents, emails, and reports, then turns key expressions into voice drills, guided conversations, and quizzes. Ten minutes on your commute, focused on phrases you can use at work today.
            </motion.p>

            {/* CTA / scroll hint */}
            <div className={styles.heroCtas}>
              <motion.a
                href="#why"
                className={styles.primaryCta}
                variants={wordReveal}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Start with my document
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

          {/* visual orb — replaces heroImage */}
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
            <h2 className={stylesB.sectionTitle}>Why Abrody matters for professionals in their 40s and 50s</h2>
            <p className={stylesB.sectionLead}>
              We start from your work and daily context to build learning you can apply immediately on the job.
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
                title: "Games are easy, work is hard",
                body: "You don’t need characters or XP — you need results at work. Abrody is built for work-connected learning."
              },
              {
                icon: "⏱",
                title: "Time is short, context is everything",
                body: "Between commutes and meetings, what matters is learning fast in the context of your documents, messages, and calls."
              },
              {
                icon: "🎙",
                title: "Confidence and clarity",
                body: "We raise clarity and fluency through real-world contexts you face every day."
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
              What makes Abrody different
            </motion.h2>

            <motion.div
              className={stylesB.flipHeader}
              variants={fadeUp}
              custom={2}
              viewport={{ once: true, amount: 0.5 }}
            >
              <span className={stylesB.flowLabel}>Platform first</span>
              <span className={stylesB.flipSwitch} aria-hidden>⇄</span>
              <span className={`${stylesB.flowLabel} ${stylesB.active}`}>User first</span>
            </motion.div>

            <motion.p
              className={stylesB.diffLead}
              variants={fadeUp}
              custom={1}
              viewport={{ once: true, amount: 0.5 }}
            >
              We design for <strong>moments when outcomes change</strong>, not time spent in an app.
              We start from your documents and conversations to create results that show up in your <em>next meeting, email,</em> or <em>presentation</em>.
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
                  title: "Learn your report by speaking",
                  value: "Ten minutes before a meeting, your key points come out naturally.",
                  feature: "We extract key sentences and terms from PDFs, slides, and reports to instantly create listen-and-repeat audio drills.",
                  badge: "🔊"
                },
                {
                  id: "fileChat",
                  title: "Practice real situations from your documents",
                  value: "Write emails and reports faster and more naturally.",
                  feature: "We turn your document content into practice conversations for email, reports, and presentations.",
                  badge: "💬"
                },
                {
                  id: "photoCTL",
                  title: "Build on-site language from a photo",
                  value: "Snap a photo and get the exact phrases you need for that situation.",
                  feature: "One photo generates a tailored learning scenario and expressions for the moment.",
                  badge: "📷"
                },
                {
                  id: "quiz",
                  title: "Fix only your weak spots",
                  value: "Target and correct the expressions you miss most.",
                  feature: "We automatically collect mistakes and frequent patterns to quiz you on your personal gaps.",
                  badge: "🧩"
                },
                {
                  id: "voice",
                  title: "Natural voices that feel like real meetings",
                  value: "Immersive practice that speeds up your speaking.",
                  feature: "Human-like AI voices make listening and speaking practice feel real.",
                  badge: "🎙"
                },
                {
                  id: "transfer",
                  title: "Learning turns into business results",
                  value: "What you learn shows up in your very next deliverable.",
                  feature: "Because we start from your actual work context, results transfer directly to the field.",
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
              With a CTL philosophy that connects work and learning seamlessly, learning blends into <em>today’s tasks</em> and results are proven <strong>on the job</strong>. 
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
                  CTL-based learning improves speaking clarity by
                  <span className={stylesB.gradientNumber}>54%</span>
                  and fluency by
                  <span className={stylesB.gradientNumber}>65%</span>.
                  Abrody automates this approach across the entire experience.
                </div>

                <motion.cite className={stylesB.quoteCiteReveal} variants={citeVariants}>
                  — Yusyac et al., 2021
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
          <span className={stylesB.sectionKicker}>Flow</span>
          <h2 className={stylesB.sectionTitle}>How It Works</h2>
        </motion.div>

        <div className={stylesB.flowGrid}>
          {[
            {
              kicker: "Upload",
              img: "/images/flow-6.png",
              title: "Upload your files",
              desc: "Drop a PDF, slide deck, or email—Abrody auto-summarizes and extracts useful phrases and vocabulary.",
            },
            {
              kicker: "Chat",
              img: "/images/flow-7.png",
              title: "AI chat & correction",
              desc: "Practice workplace dialogues generated from your content and get instant, contextual corrections.",
            },
            {
              kicker: "Drill",
              img: "/images/flow-8.png",
              title: "Audio drills & quick quizzes",
              desc: "Listen, shadow, and lock it in with short drills and micro-quizzes tailored to your needs.",
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

      </motion.main>
      <WebFooter />
    </>
  );
}
