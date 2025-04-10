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

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL || ''}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        alert("Thank you for contacting us!");
        setName("");
        setEmail("");
        setMessage("");
      } else {
        alert("Failed to send message. Please try again later.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Contact Us | Facade</title>
      </Head>
      <div className={styles.container}>
        {/* Hero Section */}
        <header className={styles.hero} data-aos="fade-in">
          <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle} data-aos="fade-up">
              Contact Us
            </h1>
            <p
              className={styles.heroSubtitle}
              data-aos="fade-up"
              data-aos-delay="300"
            >
              We're Here to Help
            </p>
          </div>
        </header>

        <main className={styles.main}>
          {/* Contact Information Section */}
          <section className={styles.infoSection} data-aos="fade-up">
            <h2 className={styles.sectionTitle}>Get in Touch</h2>
            <div className={styles.infoContainer}>
              <div className={styles.infoItem} data-aos="fade-up" data-aos-delay="100">
                <h3>Email</h3>
                <p>support@fcde.app</p>
              </div>
              <div className={styles.infoItem} data-aos="fade-up" data-aos-delay="200">
                <h3>Phone</h3>
                <p>+82 (010) 6854-9906</p>
              </div>
              <div className={styles.infoItem} data-aos="fade-up" data-aos-delay="300">
                <h3>Address</h3>
                <p>
                  Main Branch:<br />
                  경기도 용인시 수지구 수지로 342번길 34, 신촌빌딩 4층 A108<br />
                  34, Suji-ro 342beon-gil, Suji-gu, Yongin-si, Gyeonggi-do, 4th Floor A108, Sinchon Building
                </p>
              </div>
            </div>
          </section>

          {/* Contact Form Section */}
          <section className={styles.formSection} data-aos="fade-up" data-aos-delay="400">
            <h2 className={styles.sectionTitle}>Send Us a Message</h2>
            <form onSubmit={handleSubmit} className={styles.contactForm}>
              <input
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.inputField}
                required
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
                placeholder="Your Message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={styles.textArea}
                required
              />
              <button type="submit" className={styles.submitButton}>
                Send Message
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
