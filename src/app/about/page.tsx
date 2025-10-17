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
            className={stylesB.heroInner}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.7 }}
            variants={heroParent}
            style={{ rotateX: tiltX, rotateY: tiltY }}
          >
            <h1 className={styles.heroTitle}>
              {(() => {
                const titleWords = ["Learn", "where", "life", "happens"];
                const emphasize = new Set(["life", "happens"]);
                return titleWords.map((w, i) => {
                  const key = w.replace(/[^a-z]/gi, "") + i;
                  const isAlt = emphasize.has(w.toLowerCase());
                  return (
                    <motion.span
                      key={key}
                      className={`${styles.word} ${isAlt ? styles.wordAlt : ""}`}
                      variants={titleReveal}
                    >
                      {w}&nbsp;
                    </motion.span>
                  );
                });
              })()}
            </h1>

            <motion.p className={styles.heroLead} variants={wordReveal} custom={1}>
              Your moments become language you’ll remember and use. Start with a photo. Finish with words that fit your day.
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
                Start with a photo
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
          <span className={stylesB.sectionKicker}>Why Abrody</span>
          <h2 className={`${stylesB.sectionTitle} ${stylesB.jm}`}>
            Learn from the moments you actually live.
          </h2>
          <p className={stylesB.sectionLead}>
            Most lessons feel unrelated, too long, and don’t transfer to real conversations.
            Abrody flips it: start from your photo, then practice lines you can use today.
          </p>
        </motion.div>

        {/* 3 value pillars — light / stick / transfer */}
        <motion.div
          className={stylesB.cards3D}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
        >
          {[
            {
              title: "Make it light",
              body:
                "1–3 minute practices you can finish anywhere. No friction.",
            },
            {
              title: "Make it stick",
              body:
                "Your image becomes a clean sticker-style word card you’ll remember.",
            },
            {
              title: "Make it transfer",
              body:
                "Place-based lines that show up in the next café, meeting, or train ride.",
            },
          ].map((card, i) => (
            <motion.article
              key={card.title}
              className={`${stylesB.card} ${stylesB.statCard}`}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.10)" }}
            >
              {/* neutral badge dot */}
              <span className={`${stylesB.statBadge} ${stylesB.neutralBadge}`} aria-hidden>
                ●
              </span>
              <h3 className={stylesB.neutralTitle}>{card.title}</h3>
              <p className={stylesB.neutralBody}>{card.body}</p>
            </motion.article>
          ))}
        </motion.div>

        {/* ── Differentiators (no bright emoji, neutral chips) ───────────────── */}
        <section className={stylesB.sectionAlt}>
          <motion.h2
            className={stylesB.sectionTitle}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.45 }}
          >
            What makes Abrody different
          </motion.h2>

          <motion.p
            className={stylesB.diffLead}
            variants={fadeUp}
            custom={1}
            viewport={{ once: true, amount: 0.5 }}
          >
            You bring the <span className={stylesB.jm}>context</span>. We bring focused
            <span className={stylesB.jm}> practice</span>. Start with your world — not a generic unit.
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
                id: "imageVocab",
                title: "Image Vocab",
                value: "Auto-cuts edges into clean stickers.",
                feature:
                  "Turn your photo into crisp, shareable vocabulary cards that anchor memory.",
                badge: "●",
              },
              {
                id: "situationPractice",
                title: "Situation Practice",
                value: "Place-based lines that fit the moment.",
                feature:
                  "Upload a place photo (café, station, office) and get lines, voice drills, and a quick quiz for that scene.",
                badge: "●",
              },
              {
                id: "quickDrills",
                title: "Light, daily drills",
                value: "1–3 minute sessions you’ll actually do.",
                feature:
                  "Short listen-and-repeat + micro-quizzes keep momentum without burnout.",
                badge: "●",
              },
              {
                id: "notesMemory",
                title: "Auto notes & review",
                value: "Everything you say is saved.",
                feature:
                  "Every line is captured as a note, so review is always one tap away.",
                badge: "●",
              },
              {
                id: "voices",
                title: "Natural voices",
                value: "Human-like audio for real feel.",
                feature:
                  "Speak with voices that sound like real people — not a textbook.",
                badge: "●",
              },
              {
                id: "transferNow",
                title: "Use it today",
                value: "From phone to life fast.",
                feature:
                  "Because practice starts from your moments, results transfer to your next conversation.",
                badge: "●",
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
            className={stylesB.diffNote}
            variants={fadeLeft}
            custom={3}
            viewport={{ once: true, amount: 0.4 }}
          >
            Abrody is designed to be contextual, light, and transferable — built from your photos
            and places, not from abstract units.
          </motion.p>
        </section>

        {/* optional quote removed (kept UI calmer & monochrome) */}
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
          <h2 className={`${stylesB.sectionTitle} ${stylesB.jm}`}>How It Works</h2>
        </motion.div>

        <div className={stylesB.flowGrid}>
          {[
            {
              kicker: "Snap",
              img: "/images/flow-9.png",
              title: "Upload Image → Sticker Wordbook",
              desc:
                "Abrody auto-cuts irregular edges to make a clean, memorable word sticker.",
            },
            {
              kicker: "Practice",
              img: "/images/flow-10.png",
              title: "Place-based Lines & Quick Drills",
              desc:
                "Upload a place photo (café, station, office) and practice lines built for that scene.",
            },
            {
              kicker: "Review",
              img: "/images/flow-11.png",
              title: "Notes Save Automatically",
              desc:
                "Every line you speak is saved as a note, so review is always ready.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              className={stylesB.flowStep}
              variants={zoomIn}
              custom={i}
            >
              <span className={`${stylesB.stepKicker} ${stylesB.neutralChip}`} aria-hidden>
                {step.kicker}
              </span>

              <img src={step.img} alt={step.title} />
              <h3 className={stylesB.neutralTitle}>{step.title}</h3>
              <p className={stylesB.neutralBody}>{step.desc}</p>
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
