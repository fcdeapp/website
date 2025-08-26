"use client";

import React from "react";
import { motion, Variants } from "framer-motion";
import styles from "../../styles/pages/Business.module.css";
import ChainQuizzesSection from "../../components/ChainQuizzesSection";

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

export default function BusinessPage() {
  const [preview, setPreview] = React.useState<null | { type: "pdf" | "video"; src: string }>(null);
  const [showStatus, setShowStatus] = React.useState(false);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  // ============ 데이터 선언 위치 (여기에 있어야 함) ============
  const downloadData = [
    { date: "2024-06-16", ios: 16, android: 5, sum: 21 },
    { date: "2024-07-01", ios: 51, android: 6, sum: 57 },
    { date: "2024-07-16", ios: 159, android: 7, sum: 166 },
    { date: "2024-08-01", ios: 203, android: 6, sum: 209 },
    { date: "2024-08-16", ios: 330, android: 25, sum: 355 },
  ];

  // prepare points + global scale (AFTER downloadData and toTs/buildPathFromPoints are defined)
  const pointsSum = downloadData.map(d => ({ t: toTs(d.date), v: d.sum }));
  const pointsIos = downloadData.map(d => ({ t: toTs(d.date), v: d.ios }));
  const pointsAndroid = downloadData.map(d => ({ t: toTs(d.date), v: d.android }));

  const allVals = downloadData.flatMap(d => [d.ios, d.android, d.sum]);
  const globalMin = Math.min(...allVals);
  const globalMax = Math.max(...allVals);

  // helpers for tick positions
  const padLeft = 20;
  const padRight = 20;
  const svgW = 600;
  const svgH = 160;
  const usableW = svgW - padLeft - padRight;
  const minT = Math.min(...downloadData.map(d => toTs(d.date)));
  const maxT = Math.max(...downloadData.map(d => toTs(d.date)));
  const xForTick = (t: number) => padLeft + ((t - minT) / Math.max(1, maxT - minT)) * usableW;

  // [ADD] y 좌표 변환 헬퍼(그래프와 동일 스케일)
  const yFor = (v: number) => {
    const topPad = 8;
    const bottomPad = 8;
    const rangeV = globalMax - globalMin || 1;
    const normalized = (v - globalMin) / rangeV;
    return svgH - (normalized * (svgH - topPad - bottomPad) + bottomPad);
  };

  // [ADD] 툴팁 위치/데이터 메모
  const tip = React.useMemo(() => {
    if (hoverIdx == null) return null;
    const d = downloadData[hoverIdx];
    const x = xForTick(toTs(d.date));
    const y = yFor(d.sum); // 총합 기준으로 툴팁 위치
    return { x, y, d };
  }, [hoverIdx, downloadData, xForTick, globalMin, globalMax]);


  return (
    <motion.main
      className={styles.wrapper}
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
    >
      {/* ── Hero ─────────────────────────────────────────── */}
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
            {"Built for Mid-Career Pros — Learn From Your Work".split(" ").map((w, i) => (
              <motion.span key={i} className={styles.word} variants={titleReveal}>
                {w}&nbsp;
              </motion.span>
            ))}
          </h1>

          <motion.p className={styles.heroLead} variants={wordReveal} custom={1}>
            Upload PDFs, emails, or slides and our AI extracts the expressions you actually use—then turns them into short audio drills,
            contextual chats, and targeted quizzes. Ten minutes a day: practice that transfers directly to work.
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
              Start with My Files
            </motion.a>
            <motion.a
              href="#how"
              className={styles.secondaryCta}
              variants={wordReveal}
              whileHover={{ y: -2, scale: 1.02 }}
              style={{ marginLeft: 12, textDecoration: "underline", color: "rgba(10,16,69,0.8)" }}
            >
              See how it works
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
      <section id="why" className={styles.section}>
      <motion.div
        className={styles.whyHeader}
        variants={fadeUp}
        viewport={{ once: true, amount: 0.45 }}
      >
        <span className={styles.sectionKicker}>The Problem</span>
        <h2 className={styles.sectionTitle}>Why Abrody Exists for Gen X</h2>
        <p className={styles.sectionLead}>
          Most apps push scripted drills. We start from real life—so Gen X learners practice what they’ll actually say at work and in daily moments.
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
            icon: "🎯",
            title: "Practice, not transfer",
            body: "Most apps teach exercises—rarely the phrases you need at work. People need practice that transfers to real tasks.",
          },
          {
            icon: "⏱",
            title: "No time for irrelevant drills",
            body: "Commute and lunch breaks are short. Learners need bite-sized sessions tied to their own emails and reports.",
          },
          {
            icon: "🎙",
            title: "Fluency needs context",
            body: "Real context builds confidence.",
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
            Why Gen X Chooses Abrody
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
                  title: "Document → Audio Drills",
                  body: "Upload your PDFs, slides, or emails. Abrody extracts the key sentences and turns them into short listening & repeat drills.",
                },
                {
                  title: "File-based AI Conversations",
                  body: "Practice emails, reports, and presentations in natural dialogues built from your own documents.",
                },
                {
                  title: "One-tap Scenario from Photos",
                  body: "Take a photo of a moment and we generate a contextual scenario you can practice immediately.",
                },
                {
                  title: "Personalized Micro-Quizzes",
                  body: "We detect your frequent mistakes and create tiny, focused quizzes that fix exactly what you need.",
                },
                {
                  title: "Natural AI Voices",
                  body: "High-quality, natural TTS for listening and shadowing—closer to real conversation than robotic prompts.",
                },
                {
                  title: "Work-ready Transfer",
                  body: "Every exercise starts from your work context—so what you practice transfers to real outcomes faster.",
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

                {/* area / lines (기존 그대로) */}
                <path d={`${buildPathFromPoints(pointsSum, 600, 160, 20, 20, globalMin, globalMax)} L ${600 - 20} ${160 - 8} L ${20} ${160 - 8} Z`} fill="url(#areaSumGrad)" className={styles.areaSum} />
                <path d={buildPathFromPoints(pointsIos, 600, 160, 20, 20, globalMin, globalMax)} fill="none" strokeWidth={2} className={styles.lineIos} />
                <path d={buildPathFromPoints(pointsAndroid, 600, 160, 20, 20, globalMin, globalMax)} fill="none" strokeWidth={2} className={styles.lineAndroid} />
                <path d={buildPathFromPoints(pointsSum, 600, 160, 20, 20, globalMin, globalMax)} fill="none" strokeWidth={2.5} className={styles.lineSum} />

                {/* x-axis ticks (기존 그대로) */}
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

                {/* [ADD] 각 날짜에 투명 히트타겟 (hover 인덱스 설정) */}
                {downloadData.map((d, i) => {
                  const x = xForTick(toTs(d.date));
                  const y = yFor(d.sum);
                  return (
                    <g key={`hit-${d.date}`} onMouseEnter={() => setHoverIdx(i)}>
                      {/* 넓은 히트존: 이동/포커스 안정성 */}
                      <rect x={x - 12} y={0} width={24} height={svgH} fill="transparent" />
                      {/* 작게 보이는 포인트(시각적 힌트) */}
                      <circle cx={x} cy={y} r={hoverIdx === i ? 3 : 2} className={styles.pointSum} />
                    </g>
                  );
                })}

                {/* [ADD] 포커스 라인/포인트 */}
                {hoverIdx != null && (() => {
                  const d = downloadData[hoverIdx];
                  const x = xForTick(toTs(d.date));
                  const yS = yFor(d.sum);
                  const yI = yFor(d.ios);
                  const yA = yFor(d.android);
                  return (
                    <g key="focus">
                      {/* 가이드 라인 */}
                      <line x1={x} x2={x} y1={8} y2={svgH - 8} className={styles.focusLine} />
                      {/* 포인트들 */}
                      <circle cx={x} cy={yI} r={4} className={styles.dotIos} />
                      <circle cx={x} cy={yA} r={4} className={styles.dotAndroid} />
                      <circle cx={x} cy={yS} r={5} className={styles.dotSum} />
                    </g>
                  );
                })()}
              </svg>

              {/* [ADD] HTML 툴팁 (절대 배치) */}
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
              { time: "2025 Q4", text: "AI Voice v2 · CAC ≤ ₩2,900", status: "next" },
              { time: "2026 Q1", text: "Retention & Growth · UX experiments, onboarding A/B tests", status: "planned" },
              { time: "2026 H1", text: "Localization & Partnerships · Pilot with schools & enterprise partners", status: "planned" },
              { time: "2026 H2", text: "Pre-Series A · scale growth & broaden market reach", status: "planned" },
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
