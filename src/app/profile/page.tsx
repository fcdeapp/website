// src/app/profile/page.tsx
"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../../../styles/pages/Profile.module.css";

export default function Profile() {
  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <Head>
        <title>Founder | JungMin Doh</title>
        <meta name="description" content="Founder & CEO JungMin Doh’s profile" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.container}>
        {/* Hero */}
        <section className={styles.hero} data-aos="fade-up">
          <div className={styles.photoWrapper}>
            <Image
              src="/about/AbrodyWebIcon.png"
              alt="JungMin Doh"
              width={200}
              height={200}
              className={styles.photo}
            />
          </div>
          <div className={styles.heroText}>
            <h1>JungMin Doh</h1>
            <p className={styles.title}>Founder &amp; CEO</p>
            <p className={styles.tagline}>
              “Building bridges between real life and language learning.”
            </p>
          </div>
        </section>

        {/* Contact Info */}
        <section className={styles.section} data-aos="fade-right">
          <h2>Contact</h2>
          <ul className={styles.contactList}>
            <li>Email: <a href="mailto:tommydoh@snu.ac.kr">tommydoh@snu.ac.kr</a></li>
            <li>Phone: +82 10-6854-9906</li>
            <li>Location: Seocho-gu, Seoul, South Korea</li>
          </ul>
        </section>

        {/* Education */}
        <section className={styles.sectionAlt} data-aos="fade-left">
          <h2>Education</h2>
          <div className={styles.card}>
            <p><strong>Seoul National University</strong> — B.Sc. in Architectural Engineering</p>
            <p>Expected Graduation: February 2027</p>
          </div>
        </section>

        {/* Skills & Stack */}
        <section className={styles.section} data-aos="fade-up">
          <h2>Technical Skills</h2>
          <div className={styles.grid}>
            <div>
              <h3>Frontend & Mobile</h3>
              <p>React Native, Next.js, TypeScript, Figma</p>
            </div>
            <div>
              <h3>Backend & DevOps</h3>
              <p>Node.js, AWS Lambda, EC2, S3, CodeDeploy, Terraform, VPC, GitHub Actions</p>
            </div>
            <div>
              <h3>Databases & Caching</h3>
              <p>MongoDB, Redis</p>
            </div>
            <div>
              <h3>Other</h3>
              <p>Python, Blender, Adobe CC</p>
            </div>
          </div>
        </section>

        {/* Languages */}
        <section className={styles.sectionAlt} data-aos="fade-up">
          <h2>Languages</h2>
          <ul className={styles.languages}>
            <li>Korean (Native)</li>
            <li>English (Upper-intermediate)</li>
            <li>Japanese (Intermediate)</li>
            <li>Chinese (Pre-intermediate)</li>
            <li>French (Basic)</li>
          </ul>
        </section>

        {/* Activities */}
        <section className={styles.section} data-aos="fade-right">
          <h2>External Activities</h2>
          <div className={styles.card}>
            <p><strong>SNU Buddy</strong> (Jan 2022–Jun 2022): Design lead for exchange-student guidance.</p>
            <p><strong>Junior Fellow</strong> (Mar 2022–Dec 2022): Japan-focused lectures & discussions.</p>
            <p><strong>MZ Asia</strong> (Jun 2022–Nov 2022): English magazine design & presentation.</p>
            <p><strong>CAD Training</strong> (Feb 2022): ZWCAD winter special lecture.</p>
          </div>
        </section>

        {/* Courses & Qualifications */}
        <section className={styles.sectionAlt} data-aos="fade-left">
          <h2>Courses &amp; Certifications</h2>
          <ul className={styles.list}>
            <li>Structures in Architecture, Environmental Planning, Materials Mechanics</li>
            <li>Advanced English: Drama Workshop (2022-2)</li>
            <li>Research Paper Writing – Concise 20 (Jan 2023)</li>
            <li>JPT 670 (Jan 2022) • HSK 4 (Aug 2021)</li>
          </ul>
        </section>

        {/* Design Report – Computational Thinking (2022-2) */}
        <section className={styles.section} data-aos="fade-up">
        <h2>Design Report · Computational Thinking</h2>
        <p className={styles.smallNote}>
            Basic Studio 4 · “Develop the Koshino House” team project
        </p>
        <ul className={styles.downloadList}>
            <li>
            <a
                href="/downloads/Panel.pdf"
                download
                className={styles.downloadLink}
            >
                Download Panel.pdf
            </a>
            </li>
            <li>
            <a
                href="/downloads/DesignReport.pdf"
                download
                className={styles.downloadLink}
            >
                Download DesignReport.pdf
            </a>
            </li>
        </ul>
        </section>

        {/* Military Service */}
        <section className={styles.sectionAlt} data-aos="fade-left">
        <h2>Military Service</h2>
        <div className={styles.card}>
            <p>
            <strong>Republic of Korea Army · Bridge Company (Bailey bridge)</strong><br />
            <em>July 2023 – January 2025</em>
            </p>
            <p>
            Participated in Bailey bridge assembly and related military training. <br />
            Received a <strong>Division Commander’s Commendation</strong> for a startup idea during service.
            </p>
        </div>
        </section>

      </div>
    </>
  );
}
