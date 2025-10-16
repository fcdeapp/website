"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, Variants, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import styles from "../../styles/pages/Business.module.css";
import stylesB from "../../styles/pages/About.module.css";
import ChainQuizzesSection from "../../components/ChainQuizzesSection";

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
      className={`${styles.diffCard} ${styles.featCard}`}
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
      <div className={styles.featHead}>
        <h3 className={styles.featTitle}>
          {item.title}
        </h3>
      </div>

      <div className={styles.featBody}>
        <AnimatePresence mode="wait">
          {mode === "value" ? (
            <motion.div
              key="value"
              className={styles.featValue}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              <p className={styles.valueText}>{item.value}</p>
            </motion.div>
          ) : (
            <motion.div
              key="feature"
              className={styles.featFeature}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28 }}
            >
              {/* swap to small badge + show feature description */}
              <motion.div
                className={styles.featMediaBadge}
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

// helper: readable label (e.g., "6/16")
function shortLabel(isoDate: string) {
  const d = new Date(isoDate);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// new helper: convert ISO date -> timestamp (ms)
function toTs(iso: string) {
  return new Date(iso).getTime();
}

// buildPath: (function declaration so it's hoisted)
function buildPathFromPoints(
  points: { t: number; v: number }[],
  w = 600,
  h = 160,
  padLeft = 20,
  padRight = 20,
  globalMin?: number,
  globalMax?: number
) {
  if (!points || points.length === 0) return "";

  const times = points.map((p) => p.t);
  const vals = points.map((p) => p.v);

  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const minV = globalMin !== undefined ? globalMin : Math.min(...vals);
  const maxV = globalMax !== undefined ? globalMax : Math.max(...vals);
  const rangeV = maxV - minV || 1;
  const usableW = Math.max(1, w - padLeft - padRight);

  const xFor = (t: number) =>
    padLeft + ((t - minT) / Math.max(1, maxT - minT)) * usableW;
  const yFor = (v: number) => {
    const topPad = 8;
    const bottomPad = 8;
    const normalized = (v - minV) / rangeV;
    return h - (normalized * (h - topPad - bottomPad) + bottomPad);
  };

  return points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xFor(p.t).toFixed(2)} ${yFor(p.v).toFixed(2)}`)
    .join(" ");
}


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
  hidden: { opacity: 0, y: 18 },         // blur 제거!
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

export default function BusinessPage() {
  const [preview, setPreview] = React.useState<null | { type: "pdf" | "video"; src: string }>(null);
  const [showStatus, setShowStatus] = React.useState(false);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [openFeatureId, setOpenFeatureId] = useState<string | null>(null);  

  // ============ 데이터 선언 위치 (여기에 있어야 함) ============
  const downloadData = [
    { date: "2025-06-16", ios: 16, android: 5, sum: 21 },
    { date: "2025-07-01", ios: 51, android: 6, sum: 57 },
    { date: "2025-08-01", ios: 203, android: 6, sum: 209 },
    { date: "2025-09-01", ios: 373, android: 34, sum: 407 },
    { date: "2025-10-01", ios: 499, android: 193, sum: 692 },
  ];

  // prepare points + global scale (AFTER downloadData and toTs/buildPathFromPoints are defined)
  const pointsSum = downloadData.map(d => ({ t: toTs(d.date), v: d.sum }));
  const pointsIos = downloadData.map(d => ({ t: toTs(d.date), v: d.ios }));
  const pointsAndroid = downloadData.map(d => ({ t: toTs(d.date), v: d.android }));

  const allVals = downloadData.flatMap(d => [d.ios, d.android, d.sum]);
  const globalMin = Math.min(...allVals);
  const globalMax = Math.max(...allVals);

  const padLeft = 20;
  const padRight = 20;
  const svgW = 600;
  const svgH = 160;
  const usableW = svgW - padLeft - padRight;
  const minT = Math.min(...downloadData.map(d => toTs(d.date)));
  const maxT = Math.max(...downloadData.map(d => toTs(d.date)));
  const xForTick = (t: number) => padLeft + ((t - minT) / Math.max(1, maxT - minT)) * usableW;
  
  const cpcData = [
    { date: "2025-07-01", cpc: 3201 },
    { date: "2025-08-01", cpc: 3125 },
    { date: "2025-09-01", cpc: 1442 },
    { date: "2025-10-01", cpc: 1254 }, // current-to-date
  ];

  // points for CPC chart (independent scale)
  const pointsCPC = cpcData.map(d => ({ t: toTs(d.date), v: d.cpc }));
  const cpcMin = Math.min(...cpcData.map(d => d.cpc));
  const cpcMax = Math.max(...cpcData.map(d => d.cpc));

  // x helper for CPC chart (same width/padding as downloads)
  const minTCPC = Math.min(...cpcData.map(d => toTs(d.date)));
  const maxTCPC = Math.max(...cpcData.map(d => toTs(d.date)));
  const xForTickCPC = (t: number) =>
    padLeft + ((t - minTCPC) / Math.max(1, maxTCPC - minTCPC)) * usableW;

  // y helper for CPC chart (own min/max)
  const yForCPC = (v: number) => {
    const topPad = 8;
    const bottomPad = 8;
    const rangeV = cpcMax - cpcMin || 1;
    const normalized = (v - cpcMin) / rangeV;
    return svgH - (normalized * (svgH - topPad - bottomPad) + bottomPad);
  };

  // currency formatter (₩ with thousands)
  const krw = (n: number) => `₩${n.toLocaleString("en-US")}`;

  // y 좌표 변환 헬퍼(그래프와 동일 스케일)
  const yFor = (v: number) => {
    const topPad = 8;
    const bottomPad = 8;
    const rangeV = globalMax - globalMin || 1;
    const normalized = (v - globalMin) / rangeV;
    return svgH - (normalized * (svgH - topPad - bottomPad) + bottomPad);
  };

  // 툴팁 위치/데이터 메모
  const tip = React.useMemo(() => {
    if (hoverIdx == null) return null;
    const d = downloadData[hoverIdx];
    const x = xForTick(toTs(d.date));
    const y = yFor(d.sum); // 총합 기준으로 툴팁 위치
    return { x, y, d };
  }, [hoverIdx, downloadData, xForTick, globalMin, globalMax]);

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
    <motion.main
      className={styles.wrapper}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      <section
        className={stylesB.heroSection}
        onMouseMove={handleMouseMove}
      >
        {/* --- background FX layers (absolute) --- */}
        <motion.div
          aria-hidden
          className={stylesB.fxMesh}
          style={layerSlow}
        />
        <motion.div
          aria-hidden
          className={stylesB.fxBeams}
          style={layerMed}
        />
        <motion.div
          aria-hidden
          className={stylesB.fxGrid}
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
          <h1 className={stylesB.heroTitle}>
            {(() => {
              const titleWords = ["Learn", "where", "life", "happens"];
              const emphasize = new Set(["life", "happens"]);
              return titleWords.map((w, i) => {
                const key = w.replace(/[^a-z]/gi, "") + i;
                const isAlt = emphasize.has(w.toLowerCase());
                return (
                  <motion.span
                    key={key}
                    className={`${stylesB.word} ${isAlt ? stylesB.wordAlt : ""}`}
                    variants={titleReveal}
                  >
                    {w}&nbsp;
                  </motion.span>
                );
              });
            })()}
          </h1>

          <motion.p className={stylesB.heroLead} variants={wordReveal} custom={1}>
            Your moments become language you’ll remember and use. Start with a photo. Finish with words that fit your day.
          </motion.p>

          {/* CTA / scroll hint */}
          <div className={stylesB.heroCtas}>
            <motion.a
              href="#why"
              className={stylesB.primaryCta}
              variants={wordReveal}
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Start with a photo
            </motion.a>
            <motion.span
              className={stylesB.scrollHintBig}
              variants={wordReveal}
              aria-hidden
            >
              ⌄
            </motion.span>
          </div>
        </motion.div>

        {/* visual orb — replaces heroImage */}
        <motion.div
          className={stylesB.orb}
          variants={floatOrb}
          initial="initial"
          animate="animate"
          style={layerFast}
          aria-hidden
        />
        {/* halo glow layer (pure DOM) */}
        <div className={stylesB.orbGlow} aria-hidden />
      </section>

      {/* ── Why Abrody Exists ───────────────────────────── */}
      <section id="why" className={styles.section}>
        <motion.div
          className={styles.whyHeader}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={styles.sectionKicker}>The Why</span>
          <h2 className={styles.sectionTitle}>Talk about what just happened.</h2>
          <p className={styles.sectionLead}>
            Use the right expressions at work and in life. New words stick because they’re tied to your memory.
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
              icon: "📷",
              title: "Start with a photo",
              body: "Snap what you see. Your photos become your vocabulary."
            },
            {
              icon: "🗣️",
              title: "Talk about what just happened",
              body: "Get natural, situation-ready phrases for your day."
            },
            {
              icon: "✨",
              title: "No filler — only what matters",
              body: "Focus on words you’ll actually use. Remember because it’s yours."
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
            What makes Abrody different
          </motion.h2>

          <motion.div
            className={styles.flipHeader}
            variants={fadeUp}
            custom={2}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.flowLabel}>Platform first</span>
            <span className={styles.flipSwitch} aria-hidden>⇄</span>
            <span className={`${styles.flowLabel} ${styles.active}`}>User first</span>
          </motion.div>

          <motion.p
            className={styles.diffLead}
            variants={fadeUp}
            custom={1}
            viewport={{ once: true, amount: 0.5 }}
          >
            <strong>You bring the context. We bring the practice.</strong> No filler — only what matters to you. Your photos become your vocabulary.
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
                id: "docAudio",
                title: "Speak from your moments",
                value: "Turn key lines into natural speech.",
                feature: "We turn your photos and daily moments into short listen-and-repeat drills.",
                badge: "🔊"
              },
              {
                id: "fileChat",
                title: "Practice real situations",
                value: "Chat through what just happened.",
                feature: "Use your photos and notes to generate realistic back-and-forth practice.",
                badge: "💬"
              },
              {
                id: "photoCTL",
                title: "Start with a photo",
                value: "Get the exact phrases you need today.",
                feature: "One photo creates a tailored scenario with expressions that fit your day.",
                badge: "📷"
              },
              {
                id: "quiz",
                title: "Fix only your weak spots",
                value: "Target what you miss most.",
                feature: "We collect mistakes and frequent patterns to quiz you on your personal gaps.",
                badge: "🧩"
              },
              {
                id: "voice",
                title: "Natural voices, real-life feel",
                value: "Listen and speak like a real chat.",
                feature: "Human-like AI voices make practice immersive and memorable.",
                badge: "🎙"
              },
              {
                id: "transfer",
                title: "Learning that shows up today",
                value: "Use it in your next conversation.",
                feature: "Because we start from your own context, results transfer to real life.",
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
            className={styles.diffNoteClickable}
            variants={fadeLeft}
            custom={3}
            viewport={{ once: true, amount: 0.4 }}
            onClick={() => setQuoteOpen(v => !v)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setQuoteOpen(v => !v); }}
            role="button"
            tabIndex={0}
            aria-expanded={quoteOpen}
          >
            With a flow that ties your photos and experiences to practice, learning blends into <em>today</em> and shows up in your next <strong>conversation</strong>.
          </motion.p>
        </section>

        <AnimatePresence>
          {quoteOpen && (
            <motion.blockquote
              className={styles.quoteReveal}
              variants={quoteVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="region"
              aria-live="polite"
            >
              <div className={styles.quoteBody}>
                CTL-based learning improves speaking clarity by
                <span className={styles.gradientNumber}>54%</span>
                and fluency by
                <span className={styles.gradientNumber}>65%</span>.
                Abrody automates this approach across the entire experience.
              </div>

              <motion.cite className={styles.quoteCiteReveal} variants={citeVariants}>
                — Yusyac et al., 2021
              </motion.cite>
            </motion.blockquote>
          )}
        </AnimatePresence>
      </section>

    <div className={styles.waveSplit} />

    {openFeatureId === "quiz" && <ChainQuizzesSection />}

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
              img: "/images/flow-9.png",
              title: "Start with a photo",
              desc: "Take a quick photo. Your own moment sets the topic and vocabulary.",
            },
            {
              kicker: "Talk",
              img: "/images/flow-10.png",
              title: "Talk about what just happened",
              desc: "Get natural expressions for the exact situation — travel, friends, campus, or work.",
            },
            {
              kicker: "Remember",
              img: "/images/flow-11.png",
              title: "Make it stick with a photo",
              desc: "Your moments quickly become your words.",
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

      {/* ── Metrics (tables/graphs hub) ───────────────────── */}
      <section className={styles.sectionAlt}>
        <motion.div
          className={styles.whyHeader}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={styles.sectionKicker}>Metrics</span>
          <h2 className={styles.sectionTitle}>Key Performance</h2>
          <div style={{ marginTop: "0.75rem" }}>
            <button
              className={styles.statusToggle}
              onClick={() => setShowStatus((s) => !s)}
              aria-expanded={showStatus}
              aria-controls="metrics-panel"
            >
              {showStatus ? "Hide metrics" : "View metrics"}
            </button>
          </div>
        </motion.div>

        {/* Collapsible panel that groups ALL charts (CPC + Downloads) */}
        <div
          id="metrics-panel"
          className={`${styles.statusPanel} ${showStatus ? styles.open : ""}`}
          aria-hidden={!showStatus}
        >
          <div className={styles.statusInner}>

            {/* ===== 1) Monthly Cost per Conversion (CPC) ===== */}
            <div className={styles.chartWrapper}>
              <div className={styles.chartBox}>
                <svg
                  className={styles.sparklineSvg}
                  viewBox="0 0 600 180"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Monthly Cost per Conversion"
                >
                  <defs>
                    <linearGradient id="areaCPCGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#fdebee" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Area + Line (brand-consistent) */}
                  <path
                    d={`${buildPathFromPoints(pointsCPC, 600, 160, 20, 20, cpcMin, cpcMax)} L ${600 - 20} ${160 - 8} L ${20} ${160 - 8} Z`}
                    fill="url(#areaCPCGrad)"
                    className={styles.areaSum}
                  />
                  <path
                    d={buildPathFromPoints(pointsCPC, 600, 160, 20, 20, cpcMin, cpcMax)}
                    fill="none"
                    strokeWidth={2.5}
                    className={styles.lineCAC}
                  />

                  {/* X ticks + labels: show “7/1, 8/1, …” */}
                  {cpcData.map((d) => {
                    const x = xForTickCPC(toTs(d.date));
                    return (
                      <g key={`cpc-${d.date}`}>
                        <line x1={x} x2={x} y1={svgH - 6} y2={svgH - 2} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                        <text x={x} y={svgH + 16} textAnchor="middle" fontSize="11" fill="#666" className={styles.xLabel}>
                          {shortLabel(d.date)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className={styles.statusSummary}>
                <div className={styles.latestLabel}>Monthly Cost per Conversion</div>
                <div className={styles.latestNumbers}>
                  {cpcData.map((d) => (
                    <div key={`cpc-sum-${d.date}`}>
                      {new Date(d.date).toLocaleString("en-US", { month: "short" })}: <strong>{krw(d.cpc)}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.statusLegend}>
                <div className={styles.legendItem}><span className={styles.legendSwatchCAC} /> Cost per Conversion (₩)</div>
              </div>
            </div>

            {/* ===== 2) Downloads (moved from Roadmap’s status panel) ===== */}
            <div className={styles.chartWrapper}>
              <div className={styles.chartBox} onMouseLeave={() => setHoverIdx(null)}>
                <svg
                  className={styles.sparklineSvg}
                  viewBox="0 0 600 180"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Download counts over time"
                >
                  <defs>
                    <linearGradient id="areaSumGrad" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="#fbe9ec" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* area / lines (existing) */}
                  <path d={`${buildPathFromPoints(pointsSum, 600, 160, 20, 20, globalMin, globalMax)} L ${600 - 20} ${160 - 8} L ${20} ${160 - 8} Z`} fill="url(#areaSumGrad)" className={styles.areaSum} />
                  <path d={buildPathFromPoints(pointsIos, 600, 160, 20, 20, globalMin, globalMax)} fill="none" strokeWidth={2} className={styles.lineIos} />
                  <path d={buildPathFromPoints(pointsAndroid, 600, 160, 20, 20, globalMin, globalMax)} fill="none" strokeWidth={2} className={styles.lineAndroid} />
                  <path d={buildPathFromPoints(pointsSum, 600, 160, 20, 20, globalMin, globalMax)} fill="none" strokeWidth={2.5} className={styles.lineSum} />

                  {/* x-axis ticks */}
                  {downloadData.map((d) => {
                    const x = xForTick(toTs(d.date));
                    return (
                      <g key={d.date}>
                        <line x1={x} x2={x} y1={svgH - 6} y2={svgH - 2} stroke="rgba(0,0,0,0.06)" strokeWidth="1" />
                        <text x={x} y={svgH + 16} textAnchor="middle" fontSize="11" fill="#666" className={styles.xLabel}>
                          {shortLabel(d.date)}
                        </text>
                      </g>
                    );
                  })}

                  {/* hover targets + focus (same as before) */}
                  {downloadData.map((d, i) => {
                    const x = xForTick(toTs(d.date));
                    const y = yFor(d.sum);
                    return (
                      <g key={`hit-${d.date}`} onMouseEnter={() => setHoverIdx(i)}>
                        <rect x={x - 12} y={0} width={24} height={svgH} fill="transparent" />
                        <circle cx={x} cy={y} r={hoverIdx === i ? 3 : 2} className={styles.pointSum} />
                      </g>
                    );
                  })}

                  {hoverIdx != null && (() => {
                    const d = downloadData[hoverIdx];
                    const x = xForTick(toTs(d.date));
                    const yS = yFor(d.sum);
                    const yI = yFor(d.ios);
                    const yA = yFor(d.android);
                    return (
                      <g key="focus">
                        <line x1={x} x2={x} y1={8} y2={svgH - 8} className={styles.focusLine} />
                        <circle cx={x} cy={yI} r={4} className={styles.dotIos} />
                        <circle cx={x} cy={yA} r={4} className={styles.dotAndroid} />
                        <circle cx={x} cy={yS} r={5} className={styles.dotSum} />
                      </g>
                    );
                  })()}
                </svg>

                {/* tooltip */}
                {tip && (
                  <div
                    className={styles.chartTooltip}
                    style={{
                      left: `calc(${(tip.x / svgW) * 100}% + 8px)`,
                      top: `${Math.max(0, tip.y - 42)}px`,
                    }}
                  >
                    <div className={styles.tipDate}>{shortLabel(tip.d.date)}</div>
                    <div className={styles.tipRow}><span className={styles.swIos} /> iOS&nbsp;<b>{tip.d.ios}</b></div>
                    <div className={styles.tipRow}><span className={styles.swAndroid} /> Android&nbsp;<b>{tip.d.android}</b></div>
                    <div className={styles.tipRow}><span className={styles.swSum} /> Total&nbsp;<b>{tip.d.sum}</b></div>
                  </div>
                )}
              </div>

              <div className={styles.statusLegend}>
                <div className={styles.legendItem}><span className={styles.legendSwatchIos} /> iOS</div>
                <div className={styles.legendItem}><span className={styles.legendSwatchAndroid} /> Android</div>
                <div className={styles.legendItem}><span className={styles.legendSwatchSum} /> Total</div>
              </div>

              <div className={styles.statusSummary}>
                <div className={styles.latestLabel}>
                  Latest ( {shortLabel(downloadData[downloadData.length - 1].date)} )
                </div>
                <div className={styles.latestNumbers}>
                  <div>iOS: <strong>{downloadData[downloadData.length - 1].ios}</strong></div>
                  <div>Android: <strong>{downloadData[downloadData.length - 1].android}</strong></div>
                  <div>Total: <strong>{downloadData[downloadData.length - 1].sum}</strong></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

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
              { time: "2025 Q4", text: "Launch paid subscriptions · Upgrade scenario-based learning", status: "next" },
              { time: "2026 Q1", text: "Speed up image boundary segmentation", status: "planned" },
              { time: "2026 Q2-Q3", text: "Lower CAC by 10% · Advance AI (context memory, natural voices, smarter drills)", status: "planned" },
              { time: "2026 Q4", text: "Increase marketing budget · Polish UX", status: "planned" },
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
          <span className={styles.dUpdatedChip} aria-hidden>Updated 2025-08-25</span>
            <div className={styles.dHead}>
              <h4 className={styles.dTitle}>Pitch Deck</h4>
              <span className={styles.dMeta}>PDF · English</span>
            </div>
            <p className={styles.dDesc}>Our fundraising deck with product, market, and traction highlights.</p>
            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => setPreview({ type: "pdf", src: "/Abrody_Pitch_Deck_EN_250825.pdf" })}
              >
                Preview
              </button>
              <a
                className={`${styles.btn} ${styles.btnGhost}`}
                href={encodeURI("/Abrody_Pitch_Deck_EN_250825.pdf")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new tab
              </a>
              <a
                href="/Abrody_Pitch_Deck_EN_250825.pdf"
                download
                className={`${styles.btn} ${styles.btnGhost}`}
              >
                Download
              </a>
            </div>
          </motion.article>

          <motion.article className={styles.dCard} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true, amount:0.3}}>
          <span className={styles.dUpdatedChip} aria-hidden>Updated 2025-08-25</span>
            <div className={styles.dHead}>
              <h4 className={styles.dTitle}>Pitch Deck</h4>
              <span className={styles.dMeta}>PDF · Korean</span>
            </div>
            <p className={styles.dDesc}>Our fundraising deck with product, market, and traction highlights.</p>
            <div className={styles.actions}>
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={() => setPreview({ type: "pdf", src: "/Abrody_Pitch_Deck_KR_250825.pdf" })}
              >
                Preview
              </button>
              <a
                className={`${styles.btn} ${styles.btnGhost}`}
                href={encodeURI("/Abrody_Pitch_Deck_KR_250825.pdf")}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new tab
              </a>
              <a
                href="/Abrody_Pitch_Deck_KR_250825.pdf"
                download
                className={`${styles.btn} ${styles.btnGhost}`}
              >
                Download
              </a>
            </div>
          </motion.article>

          {/* Demo Video Card */}
          <motion.article className={styles.dCard} initial={{opacity:0,y:20}} whileInView={{opacity:1,y:0}} viewport={{once:true, amount:0.3}} transition={{delay:0.06}}>
          <span className={styles.dUpdatedChip} aria-hidden>Updated 2025-08-04</span>
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
          <span className={styles.dUpdatedChip} aria-hidden>Updated 2025-08-25</span>
            <div className={styles.dHead}>
              <h4 className={styles.dTitle}>1-Pager</h4>
              <span className={styles.dMeta}>PDF · English</span>
            </div>
            <p className={styles.dDesc}>A one-page overview of Abrody’s mission, product, and traction.</p>
            <div className={styles.actions}>
              <a
                href="/1-pager_EN_250825.pdf"
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
