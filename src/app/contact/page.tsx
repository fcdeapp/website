"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../../styles/pages/Contact.module.css";
import WebFooter from "../../components/WebFooter";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
  }, []);

  const validateEmail = (e: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      alert("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email.trim())) {
      alert("Please enter a valid email address.");
      return;
    }

    setSending(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || ""}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }),
      });

      if (res.ok) {
        alert("Thanks — your message has been sent.");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        const text = await res.text();
        console.error("Submit failed:", res.status, text);
        alert("Failed to send message. Please try again later.");
      }
    } catch (err) {
      console.error("Submission error:", err);
      alert("An error occurred. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Head>
        <title>Contact Us | Abrody</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={styles.page}>
        {/* HERO */}
        <header className={styles.hero} data-aos="fade-down">
          <div className={styles.heroInner}>
            <span className={styles.kicker}>Contact</span>
            <h1 className={styles.title}>Contact Us</h1>
            <p className={styles.lead}>
              Have a question, collaboration idea, or feedback? Send us a message and we’ll get back to you.
            </p>
            <a href="#contact-form" className={styles.ctaLink}>↓ Send a message</a>
          </div>
        </header>

        {/* MAIN */}
        <main className={styles.container}>
          {/* Contact info */}
          <section className={styles.infoSection} data-aos="fade-up">
            <div className={styles.infoGrid}>
              <article className={`${styles.infoCard} ${styles.gradientBorder}`} data-aos="fade-up" data-aos-delay="60">
                <h3 className={styles.infoTitle}>Email</h3>
                <p className={styles.infoBody}>support@fcde.app</p>
              </article>

              <article className={`${styles.infoCard} ${styles.gradientBorder}`} data-aos="fade-up" data-aos-delay="120">
                <h3 className={styles.infoTitle}>Phone</h3>
                <p className={styles.infoBody}>+82 (010) 6854-9906</p>
              </article>

              <article className={`${styles.infoCard} ${styles.gradientBorder}`} data-aos="fade-up" data-aos-delay="180">
                <h3 className={styles.infoTitle}>Address</h3>
                <p className={styles.infoBody}>
                  4F A108, Sinchon Building<br />
                  34, Suji-ro 342beon-gil, Suji-gu, Yongin-si, Gyeonggi-do
                </p>
              </article>
            </div>
          </section>

          {/* Form */}
          <section id="contact-form" className={styles.formSection} data-aos="fade-up" data-aos-delay="240">
            <div className={styles.formCard}>
              <h2 className={styles.formTitle}>Send a message</h2>
              <p className={styles.formSubtitle}>We typically reply within 1–2 business days.</p>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.row}>
                  <label className={styles.label}>
                    Name
                    <input
                      className={styles.input}
                      type="text"
                      name="name"
                      placeholder="Your full name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </label>

                  <label className={styles.label}>
                    Email
                    <input
                      className={styles.input}
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </label>
                </div>

                <label className={styles.label}>
                  Message
                  <textarea
                    className={styles.textarea}
                    name="message"
                    placeholder="Tell us what's on your mind..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    required
                  />
                </label>

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.primary}`}
                    disabled={sending}
                  >
                    {sending ? "Sending..." : "Send message"}
                  </button>

                  <button
                    type="button"
                    className={`${styles.btn} ${styles.ghost}`}
                    onClick={() => { setName(""); setEmail(""); setMessage(""); }}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </section>
        </main>

        <WebFooter />
      </div>
    </>
  );
}
