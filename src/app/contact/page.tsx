"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../../styles/pages/Contact.module.css";
import WebFooter from "../../components/WebFooter";

export default function Contact() {
  // 연락 양식 state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 900, once: true });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || ""}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        alert("Thank you — we received your message!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        console.error("Server responded:", res.status, await res.text());
        alert("Failed to send message. Please try again later.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Contact Us | Abrody</title>
      </Head>

      <div className={styles.pageWrap}>
        {/* Hero */}
        <header className={styles.hero} data-aos="fade-down">
          <div className={styles.starfield} aria-hidden />
          <div className={styles.heroInner}>
            <span className={styles.sectionKicker}>Contact</span>
            <h1 className={styles.heroTitle} data-aos="fade-up">
              Get in touch
            </h1>
            <p className={styles.heroSubtitle} data-aos="fade-up" data-aos-delay="200">
              Questions, feedback, or partnership inquiries — we’re here to help.
            </p>
            <a href="#contact-form" className={styles.scrollHint} data-aos="fade-up" data-aos-delay="350">
              ↓ Send a message
            </a>
          </div>
        </header>

        {/* Main */}
        <main className={styles.container}>
          {/* Info */}
          <section className={styles.infoSection} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>Contact Information</h2>

            <div className={styles.infoGrid}>
              <article className={`${styles.infoCard} ${styles.gradientCard}`} data-aos="fade-up" data-aos-delay="60">
                <h3>Email</h3>
                <p className={styles.mono}>support@fcde.app</p>
              </article>

              <article className={`${styles.infoCard} ${styles.gradientCard}`} data-aos="fade-up" data-aos-delay="120">
                <h3>Phone</h3>
                <p className={styles.mono}>+82 (010) 6854-9906</p>
              </article>

              <article className={`${styles.infoCard} ${styles.gradientCard}`} data-aos="fade-up" data-aos-delay="180">
                <h3>Address</h3>
                <p>
                  Main Branch:<br />
                  경기도 용인시 수지구 수지로 342번길 34, 신촌빌딩 4층 A108<br />
                  34, Suji-ro 342beon-gil, Suji-gu, Yongin-si, Gyeonggi-do, 4F A108, Sinchon Building
                </p>
              </article>
            </div>
          </section>

          {/* Form */}
          <section id="contact-form" className={styles.formSection} data-aos="fade-up" data-aos-delay="240">
            <h2 className={styles.sectionTitle}>Send Us a Message</h2>

            <form className={styles.formGrid} onSubmit={handleSubmit}>
              <div className={styles.formLeft}>
                <label className={styles.label}>
                  Your name
                  <input
                    className={styles.input}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    required
                  />
                </label>

                <label className={styles.label}>
                  Your email
                  <input
                    className={styles.input}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                  />
                </label>
              </div>

              <div className={styles.formRight}>
                <label className={styles.label}>
                  Message
                  <textarea
                    className={styles.textarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us about your question or request..."
                    rows={8}
                    required
                  />
                </label>

                <div className={styles.formActions}>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={sending}
                  >
                    {sending ? "Sending..." : "Send Message"}
                  </button>

                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnGhost}`}
                    onClick={() => { setName(""); setEmail(""); setMessage(""); }}
                  >
                    Reset
                  </button>
                </div>
              </div>
            </form>
          </section>
        </main>

        <WebFooter />
      </div>
    </>
  );
}
