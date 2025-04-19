// File: src/pages/child-safety/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import Head from "next/head";
import AOS from "aos";
import "aos/dist/aos.css";
import { useTranslation } from "react-i18next";
import styles from "../../styles/pages/ChildSafety.module.css";
import WebFooter from "../../components/WebFooter";

export default function ChildSafety() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL || ""}/api/child-safety-report`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, details }),
        }
      );
      if (res.ok) {
        alert(
          "Thank you for your report. We will review and take action promptly."
        );
        setName("");
        setEmail("");
        setDetails("");
      } else {
        alert("Submission failed. Please try again later.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{t("Child Safety & Report Concern")}</title>
      </Head>
      <div className={styles.container}>
        {/* Hero Section */}
        <header className={styles.hero} data-aos="fade-in">
          <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle}>Child Safety Standards</h1>
            <p className={styles.heroSubtitle}>
              Protecting children is our top priority
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Overview */}
          <section className={styles.contentSection} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>Overview</h2>
            <p className={styles.textBlock}>
              We strictly prohibit any child sexual abuse and exploitation (CSAE) content. Our policies and procedures ensure that any report or detection of CSAE is reviewed immediately and appropriate action is taken.
            </p>
          </section>

          {/* CSAE Definition */}
          <section className={styles.contentSection} data-aos="fade-up" data-aos-delay="100">
            <h2 className={styles.sectionTitle}>CSAE Definition</h2>
            <p className={styles.textBlock}>
              Child sexual abuse and exploitation (CSAE) includes any depiction of a minor (under 18) in sexual activities or any portrayal of the sexual parts of a minor for primarily sexual purposes.
            </p>
          </section>

          {/* Reporting Mechanism */}
          <section className={styles.contentSection} data-aos="fade-up" data-aos-delay="200">
            <h2 className={styles.sectionTitle}>Reporting Mechanism</h2>
            <p className={styles.textBlock}>
              If you become aware of any potential CSAE content, you can submit a report directly through the form below or use the in-app "Report Child Safety Concern" option under Settings. All reports are handled confidentially.
            </p>
          </section>

          {/* Internal Review & Removal */}
          <section className={styles.contentSection} data-aos="fade-up" data-aos-delay="300">
            <h2 className={styles.sectionTitle}>Internal Review & Removal</h2>
            <p className={styles.textBlock}>
              Upon receiving a report, our moderation team reviews the content within 24 hours. Verified CSAE content is immediately removed and associated user accounts are suspended.
            </p>
          </section>

          {/* Legal Reporting */}
          <section className={styles.contentSection} data-aos="fade-up" data-aos-delay="400">
            <h2 className={styles.sectionTitle}>Legal Reporting</h2>
            <p className={styles.textBlock}>
              We legally report confirmed CSAE incidents to appropriate authorities and organizations, including NCMEC or equivalent bodies in your region, to ensure further investigation and protection of minors.
            </p>
          </section>

          {/* In-App Reporting */}
          <section className={styles.contentSection} data-aos="fade-up" data-aos-delay="500">
            <h2 className={styles.sectionTitle}>In-App Reporting</h2>
            <p className={styles.textBlock}>
              Within the app, navigate to Settings &gt; Report Child Safety Concern to quickly submit a report without leaving the application.
            </p>
          </section>

          {/* Report Concern Form */}
          <section className={styles.formSection} data-aos="fade-up" data-aos-delay="600">
            <h2 className={styles.sectionTitle}>Report a Concern</h2>
            <p className={styles.textBlock}>
              Please provide any details you have. Your information will be kept confidential.
            </p>
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <input
                type="text"
                placeholder="Your Name (Optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.inputField}
              />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.inputField}
                required
              />
              <textarea
                placeholder="Details of your concern"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className={styles.textArea}
                required
              />
              <button type="submit" className={styles.submitButton}>
                Submit Report
              </button>
            </form>
          </section>
        </main>

        {/* Footer */}
        <WebFooter />
      </div>
    </>
  );
}
