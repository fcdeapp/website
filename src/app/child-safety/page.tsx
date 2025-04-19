// File: src/pages/child-safety/page.tsx

"use client";

import Head from "next/head";
import React, { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";
import styles from "../../styles/pages/ChildSafety.module.css";
import WebFooter from "../../components/WebFooter";

export default function ChildSafety() {
  const { t } = useTranslation();

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{t("childSafety.pageTitle")}</title>
      </Head>
      <div className={styles.container}>
        {/* Hero Section */}
        <header className={styles.hero} data-aos="fade-in">
          <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle}>{t("childSafety.title")}</h1>
            <p className={styles.heroSubtitle}>{t("childSafety.subtitle")}</p>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Overview */}
          <section className={styles.contentSection} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>{t("childSafety.overviewTitle")}</h2>
            <p className={styles.textBlock}>{t("childSafety.overviewText")}</p>
          </section>

          {/* CSAE Definition */}
          <section className={styles.contentSection} data-aos="fade-up" data-aos-delay="100">
            <h2 className={styles.sectionTitle}>{t("childSafety.definitionTitle")}</h2>
            <p className={styles.textBlock}>{t("childSafety.definitionText")}</p>
          </section>

          {/* Reporting Mechanism */}
          <section className={styles.contentSection} data-aos="fade-up" data-aos-delay="200">
            <h2 className={styles.sectionTitle}>{t("childSafety.reportingTitle")}</h2>
            <p className={styles.textBlock}>{t("childSafety.reportingText")}</p>
          </section>

          {/* Internal Review & Removal */}
          <section className={styles.contentSection} data-aos="fade-up" data-aos-delay="300">
            <h2 className={styles.sectionTitle}>{t("childSafety.removalTitle")}</h2>
            <p className={styles.textBlock}>{t("childSafety.removalText")}</p>
          </section>

          {/* Legal Reporting */}
          <section className={styles.contentSection} data-aos="fade-up" data-aos-delay="400">
            <h2 className={styles.sectionTitle}>{t("childSafety.legalTitle")}</h2>
            <p className={styles.textBlock}>{t("childSafety.legalText")}</p>
          </section>

          {/* In-App Reporting */}
          <section className={styles.contentSection} data-aos="fade-up" data-aos-delay="500">
            <h2 className={styles.sectionTitle}>{t("childSafety.inAppTitle")}</h2>
            <p className={styles.textBlock}>{t("childSafety.inAppText")}</p>
          </section>
        </main>

        {/* Footer */}
        <WebFooter />
      </div>
    </>
  );
}