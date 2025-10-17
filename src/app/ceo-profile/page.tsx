"use client";

import Head from "next/head";
import React, { useMemo, useState } from "react";
import {
  motion,
  Variants,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import styles from "../../styles/pages/CEO.module.css";

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

export default function Profile() {
  const [granularity, setGranularity] = useState<"month" | "day">("month");

  type TLItem = { date: string; title: string };
  const timelineItems: TLItem[] = [
    { date: "2025-03-21", title: "iOS & Android beta test begins" },
    { date: "2025-04-01", title: "Office lease signed" },
    { date: "2025-04-07", title: "FacadeConnect Co., Ltd. incorporated" },
    { date: "2025-04-21", title: "Business registration" },
    { date: "2025-04-21", title: "English Business Registration Certificate issued" },
    { date: "2025-05-28", title: "iOS launch" },
    { date: "2025-07-02", title: "Court Registry OTP issued" },
    { date: "2025-09-08", title: "Articles of Incorporation amended" },
    { date: "2025-09-12", title: "Court Registry OTP renewal issued" },
  ];

  function fmtMonth(d: Date) {
    return d.toLocaleString("en-US", { month: "short", year: "numeric" }); // e.g., "Mar 2025"
  }
  function fmtDay(d: Date) {
    return d.toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric" }); // "Mar 21, 2025"
  }

  const itemsSorted = useMemo(
    () => [...timelineItems].sort((a, b) => +new Date(a.date) - +new Date(b.date)),
    []
  );

  const groupedByMonth = useMemo(() => {
    const m = new Map<string, TLItem[]>();
    for (const it of itemsSorted) {
      const key = fmtMonth(new Date(it.date));
      if (!m.has(key)) m.set(key, []);
      m.get(key)!.push(it);
    }
    return Array.from(m.entries()); // [ [ "Mar 2025", [..] ], ... ]
  }, [itemsSorted]);

  /* ── mouse parallax for hero (orb + layers + subtle 3D tilt) ── */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.25 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.25 });

  // 3D tilt (deg)
  const tiltX = useTransform(sy, (v) => v / -8);
  const tiltY = useTransform(sx, (v) => v / 8);

  // depth layers
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
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relX = ((e.clientX - r.left) / r.width - 0.5) * 80; // -40~40
    const relY = ((e.clientY - r.top) / r.height - 0.5) * 80;
    mx.set(relX);
    my.set(relY);
  }

  return (
    <>
      <Head>
        <title>Founder | JungMin Doh</title>
        <meta name="description" content="Founder & CEO JungMin Doh’s profile" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* 폰트는 CSS @font-face 로드 (링크/임포트 사용 안 함) */}
      </Head>

      <motion.main
        className={`${styles.wrapper} ${styles.profileRoot}`}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
      >
        {/* ── Hero : orb + mesh/beams/grid + 제주명조(핵심 단어만) ─────────────────────── */}
        <section
          className={`${styles.hero} ${styles.heroMono}`}
          onMouseMove={handleMouseMove}
        >
          {/* background FX layers */}
          <motion.div aria-hidden className={styles.fxMesh} style={layerSlow} />
          <motion.div aria-hidden className={styles.fxBeams} style={layerMed} />
          <motion.div aria-hidden className={styles.fxGrid} />

          {/* foreground (subtle 3D tilt) */}
          <motion.div
            className={styles.heroInner}
            style={{ rotateX: tiltX, rotateY: tiltY }}
          >
            <motion.h1
              className={styles.heroTitle}
              variants={zoomIn}
              viewport={{ once: true, amount: 0.6 }}
            >
              JungMin{" "}
              <span className={`${styles.jm} ${styles.jmAccent}`}>Doh</span>
            </motion.h1>

            <motion.p
              className={styles.heroSubtitle}
              variants={fadeUp}
              custom={1}
              viewport={{ once: true, amount: 0.6 }}
            >
              <span className={styles.sectionKicker} style={{ marginRight: 8 }}>
                Founder &amp; CEO
              </span>
              {/* 중요 단어: Abrody */}
              <span className={`${styles.jm} ${styles.jmUnderline}`}>Abrody</span>
            </motion.p>

            <motion.div
              className={styles.profileHeroMeta}
              variants={fadeUp}
              custom={2}
              viewport={{ once: true, amount: 0.6 }}
            >
              <a className={styles.metaChip} href="mailto:tommydoh@snu.ac.kr">
                tommydoh@snu.ac.kr
              </a>
              <span className={styles.metaChip}>+82 10-6854-9906</span>
              <span className={styles.metaChip}>
                Seocho-gu, Seoul
              </span>
            </motion.div>
          </motion.div>

          {/* glassy orb + halo */}
          <motion.div className={styles.orb} style={layerFast} aria-hidden />
          <div className={styles.orbGlow} aria-hidden />

          {/* portrait (kept) */}
          <motion.img
            src="/about/jungmin.jpeg"
            alt="JungMin Doh"
            className={styles.heroAvatar}
            variants={zoomIn}
            custom={2}
            viewport={{ once: true, amount: 0.6 }}
          />
        </section>

        {/* ── Progress Timeline (place this section right ABOVE the Contact / Get in touch section) ── */}
        <section className={`${styles.sectionAlt} ${styles.timelineSection}`}>
          <motion.div
            className={styles.whyHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.sectionKicker}>Progress</span>
            <h2 className={styles.sectionTitle}>
              Project <span className={`${styles.jm} ${styles.jmAccent}`}>Timeline</span>
            </h2>
            <p className={styles.sectionLead}>
              A quick look at how things are moving — switch between monthly and daily views.
            </p>

            {/* Toggle */}
            <div className={styles.timelineToggle} role="tablist" aria-label="Timeline granularity">
              <button
                role="tab"
                aria-selected={granularity === "month"}
                className={`${styles.tlTab} ${granularity === "month" ? styles.tlTabActive : ""}`}
                onClick={() => setGranularity("month")}
              >
                Monthly
              </button>
              <button
                role="tab"
                aria-selected={granularity === "day"}
                className={`${styles.tlTab} ${granularity === "day" ? styles.tlTabActive : ""}`}
                onClick={() => setGranularity("day")}
              >
                Daily
              </button>
            </div>
          </motion.div>

          {/* Monthly view */}
          {granularity === "month" && (
            <motion.div
              className={styles.tlGrid}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            >
              {groupedByMonth.map(([month, items], i) => (
                <motion.article key={month} className={styles.tlCard} variants={fadeUp} custom={i}>
                  <div className={styles.tlCardHead}>
                    <h3 className={styles.tlMonth}>{month}</h3>
                    <span className={styles.tlCount}>{items.length} update{items.length > 1 ? "s" : ""}</span>
                  </div>
                  <ul className={styles.tlList}>
                    {items.map((it) => {
                      const d = new Date(it.date);
                      return (
                        <li key={it.date + it.title} className={styles.tlListItem}>
                          <span className={styles.tlDot} aria-hidden />
                          <span className={styles.tlListDate}>{fmtDay(d)}</span>
                          <span className={styles.tlListTitle}>{it.title}</span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.article>
              ))}
            </motion.div>
          )}

          {/* Daily view */}
          {granularity === "day" && (
            <motion.ol
              className={styles.tlDaily}
              variants={fadeUp}
              viewport={{ once: true, amount: 0.4 }}
            >
              {itemsSorted.map((it, i) => {
                const d = new Date(it.date);
                return (
                  <li key={it.date + i} className={styles.tlRow}>
                    <div className={styles.tlWhen}>
                      <span className={styles.tlWhenDay}>{d.toLocaleString("en-US", { day: "2-digit" })}</span>
                      <span className={styles.tlWhenMon}>{d.toLocaleString("en-US", { month: "short" })}</span>
                      <span className={styles.tlWhenYear}>{d.getFullYear()}</span>
                    </div>
                    <div className={styles.tlLine} aria-hidden />
                    <div className={styles.tlBody}>
                      <h4 className={styles.tlTitle}>{it.title}</h4>
                      <time className={styles.tlTime} dateTime={it.date}>
                        {fmtDay(d)}
                      </time>
                    </div>
                  </li>
                );
              })}
            </motion.ol>
          )}
        </section>

        {/* ── Contact ─────────────────────────────────────────────────── */}
        <section className={styles.section}>
          <motion.div
            className={styles.whyHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.sectionKicker}>Contact</span>
            <h2 className={styles.sectionTitle}>
              Get in <span className={`${styles.jm} ${styles.jmAccent}`}>touch</span>
            </h2>
            <p className={styles.sectionLead}>
              Reach out anytime — I’m building{" "}
              <span className={`${styles.jm} ${styles.jmAccent}`}>Abrody</span> and
              always happy to connect with{" "}
              <span className={styles.jm}>founders</span>,{" "}
              <span className={styles.jm}>educators</span>, and{" "}
              <span className={styles.jm}>product</span> people.
            </p>
          </motion.div>

          <motion.div
            className={styles.diffGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {[
              {
                title: "Email",
                body: (
                  <a className={styles.plainLink} href="mailto:tommydoh@snu.ac.kr">
                    tommydoh@snu.ac.kr
                  </a>
                ),
              },
              { title: "Phone", body: <>+82 10-6854-9906</> },
              { title: "Location", body: <>Seocho-gu, Seoul</> },
            ].map((c, i) => (
              <motion.article
                key={i}
                className={styles.diffCard}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, boxShadow: "0 18px 40px rgba(0,0,0,0.12)" }}
              >
                <h3>
                  {c.title === "Email" ? (
                    <>
                      <span className={`${styles.jm} ${styles.jmAccent}`}>Email</span>
                    </>
                  ) : (
                    c.title
                  )}
                </h3>
                <p>{c.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* ── Education ──────────────────────────────────────────────── */}
        <section className={styles.sectionAlt}>
          <motion.div
            className={styles.whyHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.sectionKicker}>Education</span>
            <h2 className={styles.sectionTitle}>
              <span className={`${styles.jm} ${styles.jmAccent}`}>
                Seoul National University
              </span>
            </h2>
            <p className={styles.sectionLead}>
              B.Sc. in Architectural Engineering · Expected Feb 2027
            </p>
          </motion.div>
        </section>

        {/* ── Technical Skills ───────────────────────────────────────── */}
        <section className={styles.section}>
          <motion.div
            className={styles.whyHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.sectionKicker}>Skills</span>
            <h2 className={styles.sectionTitle}>
              Technical <span className={`${styles.jm} ${styles.jmAccent}`}>Skills</span>
            </h2>
          </motion.div>

          <motion.div
            className={styles.diffGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {[
              {
                title: "Frontend · Mobile",
                body: "React Native, Next.js, TypeScript, Figma",
              },
              {
                title: "Backend · DevOps",
                body:
                  "Node.js, AWS (Lambda, EC2, S3, CodeDeploy), Terraform, VPC, GitHub Actions",
              },
              { title: "Databases · Caching", body: "MongoDB, Redis" },
              { title: "Other", body: "Python, Blender, Adobe CC" },
            ].map((b, i) => (
              <motion.article
                key={b.title}
                className={styles.diffCard}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, boxShadow: "0 18px 40px rgba(0,0,0,0.12)" }}
              >
                <h3>
                  {i === 0 ? (
                    <>
                      Frontend · <span className={`${styles.jm} ${styles.jmAccent}`}>Mobile</span>
                    </>
                  ) : (
                    b.title
                  )}
                </h3>
                <p>{b.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* ── Languages ──────────────────────────────────────────────── */}
        <section className={styles.sectionAlt}>
          <motion.div
            className={styles.whyHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.sectionKicker}>Languages</span>
            <h2 className={styles.sectionTitle}>
              Language{" "}
              <span className={`${styles.jm} ${styles.jmAccent}`}>Proficiency</span>
            </h2>
          </motion.div>

          <motion.div
            className={styles.langBar}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            {[
              "Korean — Native",
              "English — Upper-intermediate",
              "Japanese — Intermediate",
              "Chinese — Pre-intermediate",
              "French — Basic",
            ].map((l) => (
              <span key={l} className={styles.langChip}>
                {l}
              </span>
            ))}
          </motion.div>
        </section>

        {/* ── Activities ─────────────────────────────────────────────── */}
        <section className={styles.section}>
          <motion.div
            className={styles.whyHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.sectionKicker}>Activities</span>
            <h2 className={styles.sectionTitle}>
              External <span className={`${styles.jm} ${styles.jmAccent}`}>Activities</span>
            </h2>
          </motion.div>

          <motion.div
            className={styles.diffGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {[
              { title: "SNU Buddy", body: "Jan–Jun 2022 · Design Lead" },
              { title: "Junior Fellow", body: "Mar–Dec 2022 · JP Studies" },
              { title: "MZ Asia", body: "Jun–Nov 2022 · Magazine Design" },
              { title: "CAD Training", body: "Feb 2022 · ZWCAD workshop" },
            ].map((a, i) => (
              <motion.article
                key={a.title}
                className={styles.diffCard}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, boxShadow: "0 18px 40px rgba(0,0,0,0.12)" }}
              >
                <h3>{i === 1 ? <span className={`${styles.jm} ${styles.jmAccent}`}>{a.title}</span> : a.title}</h3>
                <p>{a.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        {/* ── Courses & Certifications ──────────────────────────────── */}
        <section className={styles.sectionAlt}>
          <motion.div
            className={styles.whyHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.sectionKicker}>Courses</span>
            <h2 className={styles.sectionTitle}>
              Courses & <span className={`${styles.jm} ${styles.jmAccent}`}>Certifications</span>
            </h2>
          </motion.div>

          <motion.ul
            className={styles.profileList}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <li>Structures, Environmental Planning, Materials Mechanics</li>
            <li>Advanced English: Drama Workshop (2022-2)</li>
            <li>Research Paper Writing — Concise 20 (Jan 2023)</li>
            <li>JPT 670 (Jan 2022) · HSK 4 (Aug 2021)</li>
          </motion.ul>
        </section>

        {/* ── Work Samples ───────────────────────────────────────────── */}
        <section className={styles.section}>
          <motion.div
            className={styles.whyHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.sectionKicker}>Work</span>
            <h2 className={styles.sectionTitle}>
              Design Report · <span className={`${styles.jm} ${styles.jmAccent}`}>Computational</span> Thinking
            </h2>
            <p className={styles.sectionLead}>
              Basic Studio 4 — “Develop the Koshino House” team project
            </p>
          </motion.div>

          <div className={styles.downloadGrid}>
            {[
              {
                title: "Panel",
                meta: "PDF",
                href: "/downloads/Panel.pdf",
                desc: "Project presentation panel.",
              },
              {
                title: "Design Report",
                meta: "PDF",
                href: "/downloads/DesignReport.pdf",
                desc: "Detailed process & outcomes.",
              },
            ].map((d, i) => (
              <motion.article
                key={d.title}
                className={styles.dCard}
                variants={fadeUp}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
              >
                <div className={styles.dHead}>
                  <h4 className={styles.dTitle}>
                    {i === 0 ? (
                      <span className={`${styles.jm} ${styles.jmAccent}`}>{d.title}</span>
                    ) : (
                      d.title
                    )}
                  </h4>
                  <span className={styles.dMeta}>{d.meta}</span>
                </div>
                <p className={styles.dDesc}>{d.desc}</p>
                <div className={styles.actions}>
                  <a
                    href={d.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.btn} ${styles.btnGhost}`}
                  >
                    Open
                  </a>
                  <a href={d.href} download className={`${styles.btn} ${styles.btnPrimary}`}>
                    Download
                  </a>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ── Military Service ──────────────────────────────────────── */}
        <section className={styles.sectionAlt}>
          <motion.div
            className={styles.whyHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.sectionKicker}>Service</span>
            <h2 className={styles.sectionTitle}>
              Military <span className={`${styles.jm} ${styles.jmAccent}`}>Service</span>
            </h2>
          </motion.div>

          <motion.article
            className={styles.diffCard}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h3>Republic of Korea Army · Bridge Company (Bailey bridge)</h3>
            <p>Jul 2023 – Jan 2025</p>
            <p style={{ marginTop: ".4rem" }}>
              Participated in Bailey-bridge assembly & routine training. Received a{" "}
              <strong>Division Commander’s Commendation</strong> for a startup idea during
              service.
            </p>
          </motion.article>
        </section>

        {/* ── Simulation & Modeling ──────────────────────────────────── */}
        <section className={styles.section}>
          <motion.div
            className={styles.whyHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.sectionKicker}>Simulation</span>
            <h2 className={styles.sectionTitle}>
              Simulation & <span className={`${styles.jm} ${styles.jmAccent}`}>Modeling</span>
            </h2>
            <p className={styles.sectionLead}>
              Excel VBA / 2D Modeling I — U-value & thermal-bridge analysis / Building-energy
              simulation
            </p>
          </motion.div>

          <motion.div
            className={styles.imageCard}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <img
              src="/images/BuildingThermalLoad.png"
              alt="Building Thermal Load Diagram"
            />
          </motion.div>
        </section>

        {/* ── About Abrody ───────────────────────────────────────────── */}
        <section className={styles.sectionAlt}>
          <motion.div
            className={styles.whyHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={styles.sectionKicker}>Product</span>
            <h2 className={styles.sectionTitle}>
              About <span className={`${styles.jm} ${styles.jmAccent}`}>Abrody</span>
            </h2>
            <p className={styles.sectionLead}>
              Abrody turns everyday conversations into interactive, AI-powered language
              quizzes—so you learn vocabulary and expressions that truly matter to you.
            </p>
          </motion.div>

          <motion.div
            className={styles.imageCard}
            variants={fadeLeft}
            viewport={{ once: true, amount: 0.4 }}
          >
            <img
              src="/images/1-pager_EN_251016.jpg"
              alt="Abrody Advertisement"
            />
          </motion.div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────── */}
        <section className={styles.ctaSection}>
          <motion.h2
            className={styles.ctaTitle}
            variants={zoomIn}
            viewport={{ once: true, amount: 0.55 }}
          >
            Want to collaborate or chat?
          </motion.h2>

          <div className={styles.ctaButtons}>
            <a
              href="mailto:tommydoh@snu.ac.kr"
              className={styles.ctaButton}
              onClick={(e) => {
                e.preventDefault();
                window.location.href = "mailto:tommydoh@snu.ac.kr";
              }}
            >
              Contact JungMin
            </a>
          </div>
          <p className={styles.ctaNote}>
            I’m building at the intersection of AI, learning, and product.
          </p>
        </section>
      </motion.main>
    </>
  );
}
