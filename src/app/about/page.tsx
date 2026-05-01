"use client";

import React from "react";
import Head from "next/head";
import Image from "next/image";
import {
  motion,
  Variants,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import styles from "../../styles/pages/About.module.css";
import WebFooter from "../../components/WebFooter";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.65,
      ease: "easeOut",
    },
  }),
};

const heroParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const wordReveal: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const titleReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: "easeOut" },
  },
};

const floatOrb: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-4, 7, -2, 0],
    rotate: [0, 1.1, -0.6, 0],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const appScreens = [
  {
    label: "Study",
    image: "/images/AbrodyStudy.png",
    title: "Start with today’s lesson",
    desc: "Keep learning light with daily lessons, level selection, and simple routines.",
  },
  {
    label: "Quiz",
    image: "/images/AbrodyQuiz.png",
    title: "Practice in quick quizzes",
    desc: "Review words and expressions through fast, focused exercises.",
  },
  {
    label: "Explore",
    image: "/images/AbrodyGyro.png",
    title: "Explore words visually",
    desc: "Turn real objects into visual vocabulary and interact with them in a 3D-style view.",
  },
];

const pillars = [
  {
    title: "Image Vocabulary",
    desc: "Upload a photo, pick a label, and save a clean visual word card.",
  },
  {
    title: "Daily Lessons",
    desc: "Small, calm learning sessions designed to fit into your day.",
  },
  {
    title: "3D-style Exploration",
    desc: "Look at words through visual context, not only through plain text.",
  },
];

const features = [
  "Learn from photos you actually take",
  "Save words as visual cards",
  "Practice with short quizzes",
  "Review with a clean, minimal interface",
  "Use visual memory to make words easier to recall",
  "Move between lessons, quizzes, and exploration naturally",
];

export default function About() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.25 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.25 });

  const tiltX = useTransform(sy, (v) => v / -8);
  const tiltY = useTransform(sx, (v) => v / 8);

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
    const rect = e.currentTarget.getBoundingClientRect();
    const relX = ((e.clientX - rect.left) / rect.width - 0.5) * 80;
    const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 80;

    mx.set(relX);
    my.set(relY);
  }

  return (
    <>
      <Head>
        <title>About Abrody</title>
        <meta
          name="description"
          content="Abrody is a visual language learning app that helps you learn vocabulary from photos, daily lessons, quizzes, and 3D-style exploration."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className={styles.wrapper}>
        <section className={styles.heroSection} onMouseMove={handleMouseMove}>
          <motion.div aria-hidden className={styles.fxMesh} style={layerSlow} />
          <motion.div aria-hidden className={styles.fxBeams} style={layerMed} />
          <motion.div aria-hidden className={styles.fxGrid} />

          <motion.div
            className={styles.heroInner}
            initial="hidden"
            animate="visible"
            variants={heroParent}
            style={{ rotateX: tiltX, rotateY: tiltY }}
          >
            <p className={styles.heroKicker}>Abrody</p>

            <h1 className={styles.heroTitle}>
              {["Learn", "with", "what", "you", "see"].map((word, index) => {
                const isAlt = word === "see";

                return (
                  <motion.span
                    key={`${word}-${index}`}
                    className={`${styles.word} ${isAlt ? styles.wordAlt : ""}`}
                    variants={titleReveal}
                  >
                    {word}
                    {index < 4 ? "\u00A0" : ""}
                  </motion.span>
                );
              })}
            </h1>

            <motion.p className={styles.heroLead} variants={wordReveal}>
              Abrody helps you build vocabulary from real images, short lessons,
              and quick practice. Take a photo, save the word, and review it in a
              way that feels visual and natural.
            </motion.p>

            <motion.div className={styles.heroCtas} variants={wordReveal}>
              <a href="#product" className={styles.primaryCta}>
                Explore Abrody
              </a>
              <a href="#download" className={styles.secondaryCta}>
                Download
              </a>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.orb}
            variants={floatOrb}
            initial="initial"
            animate="animate"
            style={layerFast}
            aria-hidden
          />

          <div className={styles.orbGlow} aria-hidden />
        </section>

        <section id="product" className={styles.section}>
          <motion.div
            className={styles.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.45 }}
            variants={fadeUp}
          >
            <span className={styles.sectionKicker}>Product</span>
            <h2 className={styles.sectionTitle}>
              Visual learning, built around your day.
            </h2>
            <p className={styles.sectionLead}>
              Abrody connects image vocabulary, daily lessons, quizzes, and
              3D-style visual exploration into one calm learning flow.
            </p>
          </motion.div>

          <motion.div
            className={styles.screenGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {appScreens.map((item, index) => (
              <motion.article
                key={item.label}
                className={styles.screenCard}
                variants={fadeUp}
                custom={index}
              >
                <div className={styles.screenImageWrap}>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={720}
                    height={1440}
                    className={styles.screenImage}
                    priority={index === 0}
                  />
                </div>

                <div className={styles.screenText}>
                  <span>{item.label}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className={styles.sectionAlt}>
          <motion.div
            className={styles.sectionHeader}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.45 }}
            variants={fadeUp}
          >
            <span className={styles.sectionKicker}>Why Abrody</span>
            <h2 className={styles.sectionTitle}>
              A wordbook made from your own visual memory.
            </h2>
            <p className={styles.sectionLead}>
              Words are easier to remember when they are connected to a moment,
              an object, or a place you already experienced.
            </p>
          </motion.div>

          <motion.div
            className={styles.pillarGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {pillars.map((item, index) => (
              <motion.article
                key={item.title}
                className={styles.pillarCard}
                variants={fadeUp}
                custom={index}
              >
                <span className={styles.pillarIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className={styles.featureSection}>
          <motion.div
            className={styles.featurePanel}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={fadeUp}
          >
            <div className={styles.featureCopy}>
              <span className={styles.sectionKicker}>Experience</span>
              <h2 className={styles.sectionTitle}>
                From one photo to words you can keep.
              </h2>
              <p className={styles.sectionLead}>
                Abrody is designed for people who want language learning to feel
                closer to real life: visual, short, and easy to return to.
              </p>
            </div>

            <div className={styles.featureList}>
              {features.map((feature) => (
                <div key={feature} className={styles.featureItem}>
                  <span aria-hidden />
                  <p>{feature}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        <section id="download" className={styles.downloadSection}>
          <motion.div
            className={styles.downloadCard}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            variants={fadeUp}
          >
            <span className={styles.sectionKicker}>Download</span>
            <h2 className={styles.downloadTitle}>Get Abrody</h2>
            <p className={styles.downloadLead}>
              Available on the App Store and Google Play.
            </p>

            <div className={styles.downloadButtons}>
              <a
                href="https://apps.apple.com/ca/app/id6743047157"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeButton}
              >
                App Store
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.fcdeapp.facade"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.storeButton}
              >
                Google Play
              </a>
            </div>
          </motion.div>
        </section>
      </main>

      <WebFooter />
    </>
  );
}