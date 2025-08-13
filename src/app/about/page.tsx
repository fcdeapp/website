"use client";

import Head from "next/head";
import Image from "next/image";
import { useEffect } from "react";
import { motion, Variants } from "framer-motion";
import "aos/dist/aos.css";
import styles from "../../styles/pages/About.module.css";
import WebFooter from "../../components/WebFooter";
import CountryBall from "../../components/CountryBall";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" },
  }),
};
const fadeLeft: Variants = {
  hidden: { opacity: 0, x: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.12 + 0.1, duration: 0.7, ease: "easeOut" },
  }),
};
const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1 + 0.2, duration: 0.6, ease: "easeOut" },
  }),
};


export default function About() {

  return (
    <>
      <Head>
        <title>About Us | Abrody</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={`${styles.container} ${styles.aosWrapper}`}>
        <section className={styles.heroSection}>
          <motion.div className={styles.heroText} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.6 }}>
            <motion.h1 variants={zoomIn}>The Easiest Way to Learn a Language — From Your Own Words</motion.h1>
            <motion.p variants={fadeUp} custom={1}>
              Tried language apps but never felt like you were improving? <br />
              Abrody turns your actual conversations — with friends or our AI — into personalized quizzes and interactive study materials. <br />
              Learn smarter, not harder. See real progress and get truly engaged, every day.
            </motion.p>
            <motion.a href="#why" className={styles.scrollHint} variants={fadeUp} custom={2} whileHover={{ y: 4 }}>
              ↓ See why
            </motion.a>
          </motion.div>
          <motion.div className={styles.heroImage} variants={zoomIn} />
        </section>

        <section id="why" className={styles.section}>
          <motion.div className={styles.sectionHeader} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.45 }}>
            <span className={styles.sectionKicker}>The Problem</span>
            <h2 className={styles.sectionTitle}>Why Most Language Apps Don’t Really Work</h2>
            <p className={styles.sectionLead}>
              Apps push scripted content at you. But fluency comes from your own moments and words — not someone else’s.
            </p>
          </motion.div>

          <motion.div className={styles.diffGrid} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            {[
              { title: "Generic Lessons", body: "Prewritten drills don’t fit your life or goals." },
              { title: "One-Way Learning", body: "Content flows from platform to user — not the other way around." },
              { title: "Low Retention", body: "When it’s irrelevant, you stop returning — and stop improving." },
            ].map((f, i) => (
              <motion.article key={f.title} className={styles.diffCard} variants={fadeUp} custom={i}
                whileHover={{ y: -6, boxShadow: "0 18px 38px rgba(17,12,43,.12)" }}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className={styles.sectionAlt}>
          <motion.div className={styles.sectionHeader} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.45 }}>
            <span className={styles.sectionKicker}>Our Approach</span>
            <h2 className={styles.sectionTitle}>How Abrody Changes Everything</h2>
            <p className={styles.sectionLead}>
              We flip the direction of learning: everything starts from you — your situations, context, and words.
            </p>
          </motion.div>

          <motion.div className={styles.diffGrid} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}>
            {[
              { title: "User-Origin Learning", body: "Real conversations seed lessons and reviews." },
              { title: "Context at the Core", body: "Practice maps to your life, so it transfers to speaking." },
              { title: "Hyper-Personalization", body: "Your mistakes → targeted quizzes; your phrases → focused practice." },
              { title: "AI-Powered CTL Loop", body: "AI turns moments into dialogue, feedback, and quizzes that compound." },
            ].map((f, i) => (
              <motion.article key={f.title} className={styles.diffCard} variants={fadeUp} custom={i}
                whileHover={{ y: -6, boxShadow: "0 18px 38px rgba(17,12,43,.12)" }}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </motion.article>
            ))}
          </motion.div>

          <motion.div className={styles.ballWrap} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
            <div className={styles.ballContainer}>
              {["UKCountryBallX.png","FranceCountryBallX.png","SpainCountryBallX.png","ChinaCountryBallX.png","JapanCountryBallX.png","KoreaCountryBallX.png"]
                .map((file) => (<CountryBall key={file} src={`/images/${file}`} size={60} />))}
            </div>
          </motion.div>
        </section>

        {/* Section: Our Team */}
        <section className={styles.section} data-aos="fade-up">
          <h2 className={styles.center}>Meet the Team</h2>
          <div className={styles.teamGrid}>
            <div className={styles.teamCard}>
              <div className={styles.cardLeft}>
                <img src="/about/AbrodyWebIcon.png" alt="Doh Jungmin" className={styles.cardAvatar} />
                <div className={styles.cardInfo}>
                <h3 className={styles.memberName}>Jungmin Doh</h3>
                  <p className={styles.memberRole}>
                    Founder<br/>
                    & CEO
                  </p>
                </div>
              </div>
              <div className={styles.cardRight}>
              <p>
                “I believe learning should feel like living, not just studying.<br/>
                As a developer and designer, I built Abrody to finally make language apps as engaging as our daily lives — creative, practical, and genuinely helpful.”
              </p>
               <a href="/ceo-profile" className={styles.learnMore}>
                 Learn more
               </a>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.cardLeft}>
                <img src="/about/AbrodyWebIcon.png" alt="Taeyeon Kim" className={styles.cardAvatar} />
                <div className={styles.cardInfo}>
                <h3 className={styles.memberName}>Taeyeon Kim</h3>
                  <p className={styles.memberRole}>
                    Executive<br/>
                    Growth · Finance
                  </p>
                </div>
              </div>
              <div className={styles.cardRight}>
              <p>
                “I joined Abrody to help create real value for learners — not vanity metrics.<br/>
                My background in tech, business, and data helps us reach more people and build a sustainable future together.”
              </p>
              </div>
            </div>
            <div className={styles.teamCard}>
              <div className={styles.cardLeft}>
                <img src="/about/AbrodyWebIcon.png" alt="Chaewon Kim" className={styles.cardAvatar} />
                <div className={styles.cardInfo}>
                <h3 className={styles.memberName}>Chaewon Kim</h3>
                  <p className={styles.memberRole}>
                    Executive<br/>
                    Marketing · Content Strategy
                  </p>
                </div>
              </div>
              <div className={styles.cardRight}>
                <p>
                “I believe effective marketing starts with a deep understanding of people and a user-centric approach.<br/>
                At Abrody, my goal is to craft messaging that reflects real-life language needs, so users feel truly connected to what we build.”
                </p>
              </div>
            </div>
            {/* Co-Founder & Team Member Recruitment Card */}
            <div className={styles.teamCard}>
              <div className={styles.cardLeft}>
                  <img
                    src="/about/FoxIconWithoutEyes.png"
                    alt="Join Our Founding Team"
                    className={styles.cardAvatar}
                  />
                <div className={styles.cardInfo}>
                <h3 className={styles.memberName}>Join Our Founding Team</h3>
                  <p className={styles.memberRole}>-</p>
                </div>
              </div>
              <div className={styles.cardRight}>
                <p>
                  Abrody is now run by a two-person founding team, and we’re excited to welcome new co-founders or teammates in marketing, design, or development who want to build something meaningful from the ground up with us!
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Section: Future Vision */}
        <section className={`${styles.sectionAlt} ${styles.futureVisionSection}`}>
          {/* 카드 그리드 (위) */}
          <motion.div className={`${styles.flowGrid} ${styles.futureVisionGrid}`} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.35 }}>
            <div className={styles.flowItem} data-aos="zoom-in-up" data-aos-delay="0">
              <img src="/images/flow-1.png" alt="Snap & Scenario" className={`${styles.languageImage} ${styles.noCrop}`} />
              <p className={styles.flowDesc}>Take a photo to automatically build your learning scenario.</p>
            </div>
            <div className={styles.flowItem} data-aos="zoom-in-up" data-aos-delay="150">
              <img src="/images/flow-4.png" alt="AI Chat & Correction" className={`${styles.languageImage} ${styles.noCrop}`} />
              <p className={styles.flowDesc}>Chat with our AI tutor—get real-time corrections.</p>
            </div>
            <div className={styles.flowItem} data-aos="zoom-in-up" data-aos-delay="300">
              <img src="/images/flow-5.png" alt="Instant Quiz" className={`${styles.languageImage} ${styles.noCrop}`} />
              <p className={styles.flowDesc}>Jump straight into a quiz to reinforce what you learned.</p>
            </div>
          </motion.div>

          <motion.div className={styles.sectionHeader} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.45 }}>
            <span className={styles.sectionKicker}>Vision</span>
            <h2 className={styles.sectionTitle}>Our Vision</h2>
            <p className={styles.sectionLead}>We're building a future where learning a new language is as natural as chatting with friends.</p>
          </motion.div>
        </section>
      </div>
      <WebFooter />
    </>
  );
}
