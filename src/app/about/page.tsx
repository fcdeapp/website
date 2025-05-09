"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import styles from "../../styles/pages/About.module.css";
import WebFooter from "../../components/WebFooter";

export default function About() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <>
      <Head>
        <title>About Us | Abrody</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={`${styles.container} ${styles.aosWrapper}`}>
        {/* Section: Intro */}
        <section className={styles.heroSection}>
          <div className={styles.heroText}>
            <h1 data-aos="fade-up">
              Connecting Cultures. Building Communities.
            </h1>
            <p data-aos="fade-up" data-aos-delay="200">
              Abrody is a platform designed to bring together international
              residents, students, and workers through meaningful offline
              events and group interactions.
            </p>
          </div>
          <div
            className={styles.heroImage}
            data-aos="zoom-in"
            data-aos-delay="400"
          >
          </div>
        </section>

        {/* Section: Mission */}
        <section className={styles.section}>
          <div className={styles.split} data-aos="fade-right">
            <img
              src="/about/mission.png"
              alt="Mission graphic"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
          <div className={styles.split} data-aos="fade-left">
            <h2>Our Mission</h2>
            <p>
              We aim to solve the issues of loneliness and cultural barriers
              faced by foreigners by enabling localized offline meetups, trust
              systems, and hobby-based buddy groups. With AI-powered
              recommendations, users can discover personalized opportunities to
              connect with others in a safe, trusted environment.
            </p>
          </div>
        </section>

        {/* Section: Market Problem */}
        <section className={styles.sectionAlt}>
          <div className={styles.split} data-aos="fade-left">
            <h2>The Problem We Solve</h2>
            <p>
              Many international students and migrant residents struggle with
              social isolation, lack of local support, and difficulties joining
              meaningful groups. Existing platforms lack real-world group
              functionalities, trust mechanisms, and local relevance.
            </p>
          </div>
          <div className={styles.split} data-aos="fade-up">
            <img
              src="/about/problem.png"
              alt="Problem chart"
              className={styles.sectionImage}
            />
          </div>
        </section>

        {/* Section: Our Team */}
        <section className={styles.section} data-aos="fade-up">
          <h2 className={styles.center}>Meet the Team</h2>
          <div className={styles.teamGrid}>
            {/* Current team member card */}
            <div className={styles.teamCard}>
              <img
                src="/about/team-founder.png"
                alt="Doh Jung-min"
                style={{ width: "150px", height: "150px", borderRadius: "50%" }}
              />
              <h3>Doh Jung-min</h3>
              <p>Founder & CEO</p>
            </div>
            {/* Co-Founder & Team Member Recruitment Card */}
            <div className={styles.teamCard}>
              <div className={styles.hiringBadge}>
                <img
                  src="/about/hiring.png"
                  alt="Join Our Founding Team"
                  style={{ width: "150px", height: "150px", borderRadius: "50%" }}
                />
              </div>
              <h3>Join Our Founding Team</h3>
              <p>
                Currently operating as a one-person team—I'm actively seeking
                co-founders and talented team members in marketing, design, and
                development to help build and expand our venture.
              </p>
            </div>
          </div>
        </section>

        {/* Section: Future Vision */}
        <section className={styles.sectionAlt}>
          <div className={styles.split} data-aos="fade-right">
            <img
              src="/about/vision.png"
              alt="Vision roadmap"
              className={styles.sectionImage}
            />
          </div>
          <div className={styles.split} data-aos="fade-left">
            <h2>Our Vision</h2>
            <p>
              Abrody aims to expand into international markets starting with
              Canada, Australia, and the UK. With AI-based event sorting and
              buddy-group governance, we envision a trusted ecosystem for real-life
              connections around the world.
            </p>
          </div>
        </section>
      </div>
      <WebFooter />
    </>
  );
}
