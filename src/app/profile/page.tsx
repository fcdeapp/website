"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../../styles/pages/Profile.module.css";

export default function Profile() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <Head>
        <title>Founder | JungMin Doh</title>
        <meta name="description" content="Founder & CEO JungMin Doh’s professional profile" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.container}>
        {/* ─── Hero ─────────────────────────────────────────── */}
        <section className={styles.hero} data-aos="fade-up">
          <div className={styles.photoWrapper}>
            <Image
              src="/about/jungmin.jpeg"
              alt="JungMin Doh"
              width={220}
              height={220}
              className={styles.photo}
              priority
            />
          </div>
          <div className={styles.heroText}>
            <h1>JungMin Doh</h1>
            <p className={styles.title}>Founder&nbsp;&amp;&nbsp;CEO</p>
            <p className={styles.tagline}>
              “Building bridges between real life and language learning.”
            </p>
          </div>
        </section>

        {/* ─── Contact ─────────────────────────────────────── */}
        <section className={styles.section} data-aos="fade-right">
          <h2>Contact</h2>
          <ul className={styles.contactList}>
            <li>Email&nbsp;·&nbsp;<a href="mailto:tommydoh@snu.ac.kr">tommydoh@snu.ac.kr</a></li>
            <li>Phone&nbsp;·&nbsp;+82&nbsp;10-6854-9906</li>
            <li>Location&nbsp;·&nbsp;Seocho-gu, Seoul</li>
          </ul>
        </section>

        {/* ─── Education ───────────────────────────────────── */}
        <section className={styles.sectionAlt} data-aos="fade-left">
          <h2>Education</h2>
          <div className={styles.card}>
            <p><strong>Seoul National University</strong></p>
            <p>B.Sc. Architectural Engineering · Expected Feb 2027</p>
          </div>
        </section>

        {/* ─── Skills ──────────────────────────────────────── */}
        <section className={styles.section} data-aos="fade-up">
          <h2>Technical Skills</h2>
          <div className={styles.grid}>
            <div>
              <h3>Frontend · Mobile</h3>
              <p>React Native, Next.js, TypeScript, Figma</p>
            </div>
            <div>
              <h3>Backend · DevOps</h3>
              <p>Node.js, AWS Lambda, EC2, S3, CodeDeploy, Terraform, VPC, GitHub Actions</p>
            </div>
            <div>
              <h3>Databases · Caching</h3>
              <p>MongoDB, Redis</p>
            </div>
            <div>
              <h3>Other</h3>
              <p>Python, Blender, Adobe CC</p>
            </div>
          </div>
        </section>

        {/* ─── Languages ───────────────────────────────────── */}
        <section className={styles.sectionAlt} data-aos="fade-up">
          <h2>Languages</h2>
          <ul className={styles.languages}>
            <li>Korean — Native</li>
            <li>English — Upper-intermediate</li>
            <li>Japanese — Intermediate</li>
            <li>Chinese — Pre-intermediate</li>
            <li>French — Basic</li>
          </ul>
        </section>

        {/* ─── Activities ─────────────────────────────────── */}
        <section className={styles.section} data-aos="fade-right">
          <h2>External Activities</h2>
          <div className={styles.card}>
            <p><strong>SNU Buddy</strong> Jan–Jun 2022 · Design lead</p>
            <p><strong>Junior Fellow</strong> Mar–Dec 2022 · JP studies</p>
            <p><strong>MZ Asia</strong> Jun–Nov 2022 · Magazine design</p>
            <p><strong>CAD Training</strong> Feb 2022 · ZWCAD workshop</p>
          </div>
        </section>

        {/* ─── Courses ─────────────────────────────────────── */}
        <section className={styles.sectionAlt} data-aos="fade-left">
          <h2>Courses & Certifications</h2>
          <ul className={styles.list}>
            <li>Structures, Environmental Planning, Materials Mechanics</li>
            <li>Advanced English: Drama Workshop (2022-2)</li>
            <li>Research Paper Writing – Concise 20 (Jan 2023)</li>
            <li>JPT 670 (Jan 2022) · HSK 4 (Aug 2021)</li>
          </ul>
        </section>

        {/* ─── Design Report ───────────────────────────────── */}
        <section className={styles.section} data-aos="fade-up">
          <h2>Design Report · Computational Thinking</h2>
          <p className={styles.smallNote}>
            Basic Studio 4&nbsp;—&nbsp;“Develop the Koshino House” team project
          </p>
          <div className={styles.pdfGrid}>
            <figure className={styles.pdfFrame}>
              <embed src="/downloads/Panel.pdf" type="application/pdf" className={styles.pdf} />
              <figcaption>
                <a className={styles.downloadLink} href="/downloads/Panel.pdf" download>
                  Download Panel.pdf
                </a>
              </figcaption>
            </figure>
            <figure className={styles.pdfFrame}>
              <embed src="/downloads/DesignReport.pdf" type="application/pdf" className={styles.pdf} />
              <figcaption>
                <a className={styles.downloadLink} href="/downloads/DesignReport.pdf" download>
                  Download DesignReport.pdf
                </a>
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ─── Military ───────────────────────────────────── */}
        <section className={styles.sectionAlt} data-aos="fade-left">
          <h2>Military Service</h2>
          <div className={styles.card}>
            <p><strong>Republic of Korea Army · Bridge Company (Bailey bridge)</strong><br />Jul 2023 – Jan 2025</p>
            <p>
              Participated in Bailey-bridge assembly and training.<br />
              Received a <strong>Division Commander’s Commendation</strong> for a startup idea during service.
            </p>
          </div>
        </section>
      </div>
    </>
  );
}
