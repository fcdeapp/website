"use client";

import Head from "next/head";
import React from "react";
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
                <span className={styles.jm}>Seocho-gu</span>, Seoul
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
            Want to <span className={`${styles.jm} ${styles.jmAccent}`}>collaborate</span> or chat?
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
