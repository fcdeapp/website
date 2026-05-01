"use client";

import React, { useMemo, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from "framer-motion";
import styles from "../../styles/pages/Business.module.css";
import ChainQuizzesSection from "../../components/ChainQuizzesSection";

type Feature = {
  id: string;
  title: string;
  value: string;
  feature: string;
  badge: string;
};

type FlowStep = {
  kicker: string;
  img: string;
  title: string;
  desc: string;
  alt: string;
};

type DownloadPoint = {
  date: string;
  ios: number;
  android: number;
  sum: number;
};

type CpcPoint = {
  date: string;
  cpc: number;
};

type RoadmapItem = {
  time: string;
  text: string;
  status: "next" | "planned";
};

function shortLabel(isoDate: string) {
  const d = new Date(isoDate);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function toTs(iso: string) {
  return new Date(iso).getTime();
}

function buildPathFromPoints(
  points: { t: number; v: number }[],
  w = 600,
  h = 160,
  padLeft = 20,
  padRight = 20,
  globalMin?: number,
  globalMax?: number
) {
  if (!points.length) return "";

  const times = points.map((p) => p.t);
  const vals = points.map((p) => p.v);

  const minT = Math.min(...times);
  const maxT = Math.max(...times);
  const minV = globalMin ?? Math.min(...vals);
  const maxV = globalMax ?? Math.max(...vals);
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
    .map(
      (p, i) =>
        `${i === 0 ? "M" : "L"} ${xFor(p.t).toFixed(2)} ${yFor(p.v).toFixed(
          2
        )}`
    )
    .join(" ");
}

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 52 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.72,
      ease: "easeOut",
    },
  }),
};

const zoomIn: Variants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.08,
      duration: 0.62,
      ease: "easeOut",
    },
  }),
};

const titleReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: "easeOut" },
  },
};

const wordReveal: Variants = {
  hidden: { opacity: 0, y: 14, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.58, ease: "easeOut" },
  },
};

const heroParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.08,
    },
  },
};

const floatOrb: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-5, 7, -3, 0],
    rotate: [0, 1.2, -0.7, 0],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

function FeatureCard({
  item,
  idx,
  openFeatureId,
  onToggle,
}: {
  item: Feature;
  idx: number;
  openFeatureId: string | null;
  onToggle: (id: string) => void;
}) {
  const isOpen = openFeatureId === item.id;

  return (
    <motion.article
      className={`${styles.featureCard} ${isOpen ? styles.featureCardOpen : ""}`}
      variants={fadeUp}
      custom={idx}
      layout
      role="button"
      aria-pressed={isOpen}
      tabIndex={0}
      onClick={() => onToggle(item.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onToggle(item.id);
      }}
      whileHover={{ y: -6 }}
    >
      <div className={styles.featureTop}>
        <span className={styles.featureBadge} aria-hidden>
          {item.badge}
        </span>
        <h3>{item.title}</h3>
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.p
            key="value"
            className={styles.featureValue}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24 }}
          >
            {item.value}
          </motion.p>
        ) : (
          <motion.p
            key="feature"
            className={styles.featureDetail}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.24 }}
          >
            {item.feature}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

export default function BusinessPage() {
  const [showStatus, setShowStatus] = useState(false);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [openFeatureId, setOpenFeatureId] = useState<string | null>(null);

  const downloadData: DownloadPoint[] = [
    { date: "2025-06-16", ios: 16, android: 5, sum: 21 },
    { date: "2025-07-01", ios: 51, android: 6, sum: 57 },
    { date: "2025-08-01", ios: 203, android: 6, sum: 209 },
    { date: "2025-09-01", ios: 373, android: 34, sum: 407 },
    { date: "2025-10-01", ios: 499, android: 193, sum: 692 },
  ];

  const cpcData: CpcPoint[] = [
    { date: "2025-07-01", cpc: 3201 },
    { date: "2025-08-01", cpc: 3125 },
    { date: "2025-09-01", cpc: 1442 },
    { date: "2025-10-01", cpc: 1254 },
  ];

  const features: Feature[] = [
    {
      id: "imageVocab",
      title: "Image Vocab",
      value: "Turn real objects into visual word cards.",
      feature:
        "Abrody finds the object in your photo and turns it into a clean 3D-style vocabulary card that feels personal and easy to remember.",
      badge: "01",
    },
    {
      id: "situationPractice",
      title: "Situation Practice",
      value: "Practice language for the place you are in.",
      feature:
        "Use a café, station, classroom, or street scene as your learning context. Abrody creates useful lines for that exact moment.",
      badge: "02",
    },
    {
      id: "quickDrills",
      title: "Quick Drills",
      value: "Small quizzes that keep learning moving.",
      feature:
        "Short review sessions help users remember words, expressions, and context without making learning feel heavy.",
      badge: "03",
    },
    {
      id: "review",
      title: "Review Notes",
      value: "Keep what you learned ready to revisit.",
      feature:
        "Words and practice lines are saved into a clean review flow, so learning continues after the first moment.",
      badge: "04",
    },
    {
      id: "voices",
      title: "Natural Audio",
      value: "Listen and repeat with smoother voices.",
      feature:
        "Voice practice helps users connect visual memory with real pronunciation and everyday expression.",
      badge: "05",
    },
    {
      id: "transfer",
      title: "Use It Outside",
      value: "Move from screen practice to real life.",
      feature:
        "Because each lesson begins with a real photo, the result feels closer to real conversation than a generic unit.",
      badge: "06",
    },
  ];

  const flowSteps: FlowStep[] = [
    {
      kicker: "Study",
      img: "/images/AbrodyStudy.png",
      title: "Capture what you see",
      desc: "Start from a real object or place. Abrody turns it into a visual learning moment.",
      alt: "Abrody study feature preview",
    },
    {
      kicker: "Quiz",
      img: "/images/AbrodyQuiz.png",
      title: "Review with quick drills",
      desc: "Practice vocabulary and expressions through lightweight quizzes made for fast recall.",
      alt: "Abrody quiz feature preview",
    },
    {
      kicker: "Explore",
      img: "/images/AbrodyGyro.png",
      title: "Learn through visual memory",
      desc: "3D-style visuals make words feel closer to the things you actually experienced.",
      alt: "Abrody visual exploration preview",
    },
  ];

  const roadmap: RoadmapItem[] = [
    {
      time: "2025 Q4",
      text: "Launch paid subscriptions · Upgrade scenario-based learning",
      status: "next",
    },
    {
      time: "2026 Q1",
      text: "Improve image boundary segmentation and visual word creation speed",
      status: "planned",
    },
    {
      time: "2026 Q2-Q3",
      text: "Advance context memory, natural audio, and smarter review drills",
      status: "planned",
    },
    {
      time: "2026 Q4",
      text: "Increase marketing tests and polish the full learning flow",
      status: "planned",
    },
  ];

  const svgW = 600;
  const svgH = 160;
  const padLeft = 20;
  const padRight = 20;
  const usableW = svgW - padLeft - padRight;

  const chartData = useMemo(() => {
    const pointsSum = downloadData.map((d) => ({ t: toTs(d.date), v: d.sum }));
    const pointsIos = downloadData.map((d) => ({ t: toTs(d.date), v: d.ios }));
    const pointsAndroid = downloadData.map((d) => ({
      t: toTs(d.date),
      v: d.android,
    }));

    const allVals = downloadData.flatMap((d) => [d.ios, d.android, d.sum]);
    const globalMin = Math.min(...allVals);
    const globalMax = Math.max(...allVals);

    const minT = Math.min(...downloadData.map((d) => toTs(d.date)));
    const maxT = Math.max(...downloadData.map((d) => toTs(d.date)));

    const xForTick = (t: number) =>
      padLeft + ((t - minT) / Math.max(1, maxT - minT)) * usableW;

    const yFor = (v: number) => {
      const topPad = 8;
      const bottomPad = 8;
      const rangeV = globalMax - globalMin || 1;
      const normalized = (v - globalMin) / rangeV;
      return svgH - (normalized * (svgH - topPad - bottomPad) + bottomPad);
    };

    return {
      pointsSum,
      pointsIos,
      pointsAndroid,
      globalMin,
      globalMax,
      xForTick,
      yFor,
    };
  }, [downloadData]);

  const cpcChartData = useMemo(() => {
    const pointsCPC = cpcData.map((d) => ({ t: toTs(d.date), v: d.cpc }));
    const cpcMin = Math.min(...cpcData.map((d) => d.cpc));
    const cpcMax = Math.max(...cpcData.map((d) => d.cpc));
    const minT = Math.min(...cpcData.map((d) => toTs(d.date)));
    const maxT = Math.max(...cpcData.map((d) => toTs(d.date)));

    const xForTickCPC = (t: number) =>
      padLeft + ((t - minT) / Math.max(1, maxT - minT)) * usableW;

    return {
      pointsCPC,
      cpcMin,
      cpcMax,
      xForTickCPC,
    };
  }, [cpcData]);

  const tip = useMemo(() => {
    if (hoverIdx == null) return null;
    const d = downloadData[hoverIdx];
    if (!d) return null;

    const x = chartData.xForTick(toTs(d.date));
    const y = chartData.yFor(d.sum);

    return { x, y, d };
  }, [hoverIdx, chartData, downloadData]);

  const krw = (n: number) => `₩${n.toLocaleString("en-US")}`;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, {
    stiffness: 120,
    damping: 18,
    mass: 0.25,
  });

  const sy = useSpring(my, {
    stiffness: 120,
    damping: 18,
    mass: 0.25,
  });

  const tiltX = useTransform(sy, (v) => v / -8);
  const tiltY = useTransform(sx, (v) => v / 8);

  const layerSlow = {
    x: useTransform(sx, (v) => v * -0.25),
    y: useTransform(sy, (v) => v * -0.25),
  };

  const layerMed = {
    x: useTransform(sx, (v) => v * -0.5),
    y: useTransform(sy, (v) => v * -0.5),
  };

  const layerFast = {
    x: useTransform(sx, (v) => v * 0.8),
    y: useTransform(sy, (v) => v * 0.8),
  };

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width - 0.5) * 80;
    const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 80;

    mx.set(relX);
    my.set(relY);
  }

  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.main
      className={styles.wrapper}
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.14,
          },
        },
      }}
    >
      <section
        className={styles.heroSection}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div aria-hidden className={styles.fxMesh} style={layerSlow} />
        <motion.div aria-hidden className={styles.fxBeams} style={layerMed} />
        <motion.div aria-hidden className={styles.fxGrid} />

        <motion.div
          className={styles.heroInner}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.7 }}
          variants={heroParent}
          style={{ rotateX: tiltX, rotateY: tiltY }}
        >
          <p className={styles.heroEyebrow}>Abrody Business</p>

          <h1 className={styles.heroTitle}>
            {["Learning", "that", "starts", "from", "life"].map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                className={`${styles.word} ${
                  word === "life" ? styles.wordAlt : ""
                }`}
                variants={titleReveal}
              >
                {word}
                {i < 4 ? "\u00A0" : ""}
              </motion.span>
            ))}
          </h1>

          <motion.p className={styles.heroLead} variants={wordReveal}>
            Abrody turns real photos into visual vocabulary, quick drills, and
            place-based practice. A language app built around moments users
            actually live.
          </motion.p>

          <motion.div className={styles.heroCtas} variants={wordReveal}>
            <a href="#why" className={styles.primaryCta}>
              Explore Abrody
            </a>
            <a href="#metrics" className={styles.secondaryCta}>
              View metrics
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.orb}
          variants={floatOrb}
          initial="initial"
          animate="animate"
          style={layerFast}
          aria-hidden
        />
        <div className={styles.orbGlow} aria-hidden />
      </section>

      <section id="why" className={styles.section}>
        <motion.div
          className={styles.sectionHeader}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={styles.sectionKicker}>Why Abrody</span>
          <h2 className={styles.sectionTitle}>
            Learn from the moments users already have.
          </h2>
          <p className={styles.sectionLead}>
            Abrody connects language learning with real images, places, and
            situations. The result is lighter to start, easier to remember, and
            closer to everyday conversation.
          </p>
        </motion.div>

        <motion.div
          className={styles.valueGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.12,
              },
            },
          }}
        >
          {[
            {
              title: "Visual first",
              body: "Users begin from something they saw, not a generic lesson list.",
            },
            {
              title: "Small enough to repeat",
              body: "Short word cards, quick quizzes, and scene-based practice reduce friction.",
            },
            {
              title: "Closer to real use",
              body: "The learning context is connected to the user’s own day, place, and memory.",
            },
          ].map((card, i) => (
            <motion.article
              key={card.title}
              className={styles.valueCard}
              variants={fadeUp}
              custom={i}
              whileHover={{ y: -6 }}
            >
              <span className={styles.valueDot} aria-hidden />
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section className={styles.sectionAlt}>
        <motion.div
          className={styles.sectionHeader}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={styles.sectionKicker}>Product</span>
          <h2 className={styles.sectionTitle}>What makes Abrody different</h2>
          <p className={styles.sectionLead}>
            The app is designed around visual memory, contextual practice, and
            lightweight review.
          </p>
        </motion.div>

        <motion.div
          className={styles.featureGrid}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.id}
              item={feature}
              idx={i}
              openFeatureId={openFeatureId}
              onToggle={(id) =>
                setOpenFeatureId((prev) => (prev === id ? null : id))
              }
            />
          ))}
        </motion.div>

        <p className={styles.sectionNote}>
          Tap each card to switch between the user value and the feature detail.
        </p>

        {openFeatureId === "quickDrills" && (
          <div className={styles.quizSectionWrap}>
            <ChainQuizzesSection />
          </div>
        )}
      </section>

      <section className={styles.section}>
        <motion.div
          className={styles.sectionHeader}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={styles.sectionKicker}>Flow</span>
          <h2 className={styles.sectionTitle}>How it works</h2>
        </motion.div>

        <div className={styles.flowGrid}>
          {flowSteps.map((step, i) => (
            <motion.article
              key={step.title}
              className={styles.flowCard}
              variants={zoomIn}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.25 }}
              whileHover={{ y: -7 }}
            >
              <span className={styles.flowKicker}>{step.kicker}</span>

              <div className={styles.flowImageWrap}>
                <img
                  src={step.img}
                  alt={step.alt}
                  className={styles.flowImage}
                  loading={i === 0 ? "eager" : "lazy"}
                />
              </div>

              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section id="metrics" className={styles.sectionAlt}>
        <motion.div
          className={styles.sectionHeader}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={styles.sectionKicker}>Metrics</span>
          <h2 className={styles.sectionTitle}>Key Performance</h2>
          <p className={styles.sectionLead}>
            A compact view of early acquisition and cost trends.
          </p>

          <button
            type="button"
            className={styles.statusToggle}
            onClick={() => setShowStatus((prev) => !prev)}
            aria-expanded={showStatus}
            aria-controls="metrics-panel"
          >
            {showStatus ? "Hide metrics" : "View metrics"}
          </button>
        </motion.div>

        <div
          id="metrics-panel"
          className={`${styles.statusPanel} ${showStatus ? styles.open : ""}`}
          aria-hidden={!showStatus}
        >
          <div className={styles.statusInner}>
            <article className={styles.chartWrapper}>
              <div className={styles.chartHeader}>
                <div>
                  <h3>Monthly Cost per Conversion</h3>
                  <p>Marketing efficiency trend</p>
                </div>
              </div>

              <div className={styles.chartBox}>
                <svg
                  className={styles.sparklineSvg}
                  viewBox="0 0 600 180"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Monthly Cost per Conversion"
                >
                  <defs>
                    <linearGradient
                      id="areaCPCGrad"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#fdebee"
                        stopOpacity="0.65"
                      />
                      <stop
                        offset="100%"
                        stopColor="#ffffff"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d={`${buildPathFromPoints(
                      cpcChartData.pointsCPC,
                      600,
                      160,
                      20,
                      20,
                      cpcChartData.cpcMin,
                      cpcChartData.cpcMax
                    )} L ${600 - 20} ${160 - 8} L ${20} ${160 - 8} Z`}
                    fill="url(#areaCPCGrad)"
                    className={styles.areaSum}
                  />

                  <path
                    d={buildPathFromPoints(
                      cpcChartData.pointsCPC,
                      600,
                      160,
                      20,
                      20,
                      cpcChartData.cpcMin,
                      cpcChartData.cpcMax
                    )}
                    fill="none"
                    strokeWidth={2.5}
                    className={styles.lineCAC}
                  />

                  {cpcData.map((d) => {
                    const x = cpcChartData.xForTickCPC(toTs(d.date));
                    return (
                      <g key={`cpc-${d.date}`}>
                        <line
                          x1={x}
                          x2={x}
                          y1={svgH - 6}
                          y2={svgH - 2}
                          className={styles.tickLine}
                        />
                        <text
                          x={x}
                          y={svgH + 16}
                          textAnchor="middle"
                          fontSize="11"
                          className={styles.xLabel}
                        >
                          {shortLabel(d.date)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className={styles.statusSummary}>
                {cpcData.map((d) => (
                  <div key={`cpc-sum-${d.date}`}>
                    {new Date(d.date).toLocaleString("en-US", {
                      month: "short",
                    })}
                    <strong>{krw(d.cpc)}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className={styles.chartWrapper}>
              <div className={styles.chartHeader}>
                <div>
                  <h3>Downloads</h3>
                  <p>iOS, Android, and total acquisition</p>
                </div>
              </div>

              <div
                className={styles.chartBox}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <svg
                  className={styles.sparklineSvg}
                  viewBox="0 0 600 180"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Download counts over time"
                >
                  <defs>
                    <linearGradient
                      id="areaSumGrad"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="#fbe9ec"
                        stopOpacity="0.7"
                      />
                      <stop
                        offset="100%"
                        stopColor="#ffffff"
                        stopOpacity="0"
                      />
                    </linearGradient>
                  </defs>

                  <path
                    d={`${buildPathFromPoints(
                      chartData.pointsSum,
                      600,
                      160,
                      20,
                      20,
                      chartData.globalMin,
                      chartData.globalMax
                    )} L ${600 - 20} ${160 - 8} L ${20} ${160 - 8} Z`}
                    fill="url(#areaSumGrad)"
                    className={styles.areaSum}
                  />

                  <path
                    d={buildPathFromPoints(
                      chartData.pointsIos,
                      600,
                      160,
                      20,
                      20,
                      chartData.globalMin,
                      chartData.globalMax
                    )}
                    fill="none"
                    strokeWidth={2}
                    className={styles.lineIos}
                  />

                  <path
                    d={buildPathFromPoints(
                      chartData.pointsAndroid,
                      600,
                      160,
                      20,
                      20,
                      chartData.globalMin,
                      chartData.globalMax
                    )}
                    fill="none"
                    strokeWidth={2}
                    className={styles.lineAndroid}
                  />

                  <path
                    d={buildPathFromPoints(
                      chartData.pointsSum,
                      600,
                      160,
                      20,
                      20,
                      chartData.globalMin,
                      chartData.globalMax
                    )}
                    fill="none"
                    strokeWidth={2.5}
                    className={styles.lineSum}
                  />

                  {downloadData.map((d) => {
                    const x = chartData.xForTick(toTs(d.date));
                    return (
                      <g key={d.date}>
                        <line
                          x1={x}
                          x2={x}
                          y1={svgH - 6}
                          y2={svgH - 2}
                          className={styles.tickLine}
                        />
                        <text
                          x={x}
                          y={svgH + 16}
                          textAnchor="middle"
                          fontSize="11"
                          className={styles.xLabel}
                        >
                          {shortLabel(d.date)}
                        </text>
                      </g>
                    );
                  })}

                  {downloadData.map((d, i) => {
                    const x = chartData.xForTick(toTs(d.date));
                    const y = chartData.yFor(d.sum);

                    return (
                      <g
                        key={`hit-${d.date}`}
                        onMouseEnter={() => setHoverIdx(i)}
                      >
                        <rect
                          x={x - 12}
                          y={0}
                          width={24}
                          height={svgH}
                          fill="transparent"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r={hoverIdx === i ? 3.6 : 2.4}
                          className={styles.pointSum}
                        />
                      </g>
                    );
                  })}

                  {hoverIdx != null &&
                    (() => {
                      const d = downloadData[hoverIdx];
                      if (!d) return null;

                      const x = chartData.xForTick(toTs(d.date));
                      const yS = chartData.yFor(d.sum);
                      const yI = chartData.yFor(d.ios);
                      const yA = chartData.yFor(d.android);

                      return (
                        <g key="focus">
                          <line
                            x1={x}
                            x2={x}
                            y1={8}
                            y2={svgH - 8}
                            className={styles.focusLine}
                          />
                          <circle
                            cx={x}
                            cy={yI}
                            r={4}
                            className={styles.dotIos}
                          />
                          <circle
                            cx={x}
                            cy={yA}
                            r={4}
                            className={styles.dotAndroid}
                          />
                          <circle
                            cx={x}
                            cy={yS}
                            r={5}
                            className={styles.dotSum}
                          />
                        </g>
                      );
                    })()}
                </svg>

                {tip && (
                  <div
                    className={styles.chartTooltip}
                    style={{
                      left: `calc(${(tip.x / svgW) * 100}% + 8px)`,
                      top: `${Math.max(0, tip.y - 42)}px`,
                    }}
                  >
                    <div className={styles.tipDate}>{shortLabel(tip.d.date)}</div>
                    <div className={styles.tipRow}>
                      <span className={styles.swIos} /> iOS <b>{tip.d.ios}</b>
                    </div>
                    <div className={styles.tipRow}>
                      <span className={styles.swAndroid} /> Android{" "}
                      <b>{tip.d.android}</b>
                    </div>
                    <div className={styles.tipRow}>
                      <span className={styles.swSum} /> Total{" "}
                      <b>{tip.d.sum}</b>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.statusLegend}>
                <span>
                  <i className={styles.legendSwatchIos} /> iOS
                </span>
                <span>
                  <i className={styles.legendSwatchAndroid} /> Android
                </span>
                <span>
                  <i className={styles.legendSwatchSum} /> Total
                </span>
              </div>

              <div className={styles.statusSummary}>
                <div>
                  Latest
                  <strong>
                    {shortLabel(downloadData[downloadData.length - 1].date)}
                  </strong>
                </div>
                <div>
                  iOS
                  <strong>{downloadData[downloadData.length - 1].ios}</strong>
                </div>
                <div>
                  Android
                  <strong>
                    {downloadData[downloadData.length - 1].android}
                  </strong>
                </div>
                <div>
                  Total
                  <strong>{downloadData[downloadData.length - 1].sum}</strong>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className={styles.sectionRoad}>
        <motion.div
          className={styles.sectionHeader}
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={styles.sectionKicker}>Plan</span>
          <h2 className={styles.sectionTitle}>Roadmap</h2>
        </motion.div>

        <div className={styles.roadmapWrap}>
          <div className={styles.roadmapTrack} aria-hidden />

          {roadmap.map((mile, i) => (
            <motion.article
              key={mile.time}
              className={`${styles.milestoneCard} ${
                i % 2 ? styles.right : styles.left
              }`}
              variants={fadeUp}
              custom={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <span
                className={`${styles.mileDot} ${
                  mile.status === "next" ? styles.next : styles.planned
                }`}
              />
              <header className={styles.mileHead}>
                <span className={styles.mileTime}>{mile.time}</span>
                <span
                  className={`${styles.milePill} ${
                    mile.status === "next" ? styles.next : styles.planned
                  }`}
                >
                  {mile.status === "next" ? "Next" : "Planned"}
                </span>
              </header>
              <p className={styles.mileText}>{mile.text}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </motion.main>
  );
}