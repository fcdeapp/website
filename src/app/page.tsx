"use client";

import Head from "next/head";
import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import styles from "../styles/Home.module.css";
import WebFooter from "../components/WebFooter";

type CarouselItem = {
  label: string;
  image: string;
};

type IVItem = {
  label: string;
  src: string;
};

const LANGUAGES = ["English", "Français", "Español", "中文", "日本語", "한국어"];

const JOURNEY_ITEMS: CarouselItem[] = [
  { label: "1", image: "/journey/AppStoreImageiPhoneEN2605011.jpg" },
  { label: "2", image: "/journey/AppStoreImageiPhoneEN2605012.jpg" },
  { label: "3", image: "/journey/AppStoreImageiPhoneEN2605013.jpg" },
];

const INITIAL_IV_ITEMS: IVItem[] = [
  { label: "coffee", src: "/imageVocab/imageVocab_1.png" },
  { label: "bread", src: "/imageVocab/imageVocab_2.png" },
  { label: "tempura bowl", src: "/imageVocab/imageVocab_3.png" },
  { label: "cat", src: "/imageVocab/imageVocab_4.png" },
  { label: "pigeon", src: "/imageVocab/imageVocab_5.png" },
];

export default function Home() {
  const [ivItems, setIvItems] = useState<IVItem[]>(INITIAL_IV_ITEMS);
  const [journeyOrder, setJourneyOrder] =
    useState<CarouselItem[]>(JOURNEY_ITEMS);
  const [langIndex, setLangIndex] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const sx = useSpring(mx, {
    stiffness: 120,
    damping: 18,
    mass: 0.25,
  });

  const sy = useSpring(my, {
    stiffness: 120,
    damping: 18,
    mass: 0.25,
  });

  const tiltX = useTransform(sy, (v) => v / -8);
  const tiltY = useTransform(sx, (v) => v / 8);

  const slowX = useTransform(sx, (v) => v * -0.25);
  const slowY = useTransform(sy, (v) => v * -0.25);

  const medX = useTransform(sx, (v) => v * -0.5);
  const medY = useTransform(sy, (v) => v * -0.5);

  const fastX = useTransform(sx, (v) => v * 0.8);
  const fastY = useTransform(sy, (v) => v * 0.8);

  useEffect(() => {
    AOS.init({
      duration: 900,
      once: true,
      offset: 80,
    });
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLangIndex((current) => {
        if (LANGUAGES.length === 0) return 0;
        return (current + 1) % LANGUAGES.length;
      });
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setIvItems((prev) => {
        if (!Array.isArray(prev) || prev.length <= 1) return prev;
        return [...prev.slice(1), prev[0]];
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setJourneyOrder((prev) => {
        if (!Array.isArray(prev) || prev.length <= 1) return prev;
        return [...prev.slice(1), prev[0]];
      });
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, []);

  function handleHeroMouseMove(event: React.MouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();

    const relX = ((event.clientX - rect.left) / rect.width - 0.5) * 80;
    const relY = ((event.clientY - rect.top) / rect.height - 0.5) * 80;

    mx.set(relX);
    my.set(relY);
  }

  function handleHeroMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  function closeModal() {
    setModalImage(null);
  }

  const currentLanguage = LANGUAGES[langIndex] ?? LANGUAGES[0] ?? "English";

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        <title>Abrody | Learn Languages from What You See</title>

        <meta
          name="description"
          content="Abrody is a visual language learning app. Take a photo, turn real objects into vocabulary, practice with short quizzes, and remember words through your own moments."
        />

        <meta
          property="og:title"
          content="Abrody — Learn languages from what you see"
        />
        <meta
          name="twitter:title"
          content="Abrody — Learn languages from what you see"
        />

        <meta
          property="og:description"
          content="Start with a photo, explore words visually, and practice with short quizzes that fit your day."
        />
        <meta
          name="twitter:description"
          content="Visual vocabulary, 3D-style exploration, and quick quizzes for everyday language learning."
        />

        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://website.fcde.app/AbrodyLogo3DSimple.png"
        />
        <meta property="og:url" content="https://website.fcde.app/" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:image"
          content="https://website.fcde.app/AbrodyLogo3DSimple.png"
        />
        <meta
          name="twitter:image:alt"
          content="Abrody visual language learning app"
        />
      </Head>

      <div className={styles.container}>
        <section
          className={styles.heroSection}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
        >
          <motion.div
            aria-hidden
            className={styles.fxMesh}
            style={{
              x: slowX,
              y: slowY,
            }}
          />

          <motion.div
            aria-hidden
            className={styles.fxBeams}
            style={{
              x: medX,
              y: medY,
            }}
          />

          <motion.div aria-hidden className={styles.fxGrid} />

          <motion.div
            className={styles.heroInner}
            style={{
              rotateX: tiltX,
              rotateY: tiltY,
            }}
          >
            <p className={styles.heroKicker}>Abrody</p>

            <h1 className={styles.heroTitle}>
              <span>Learn&nbsp;</span>

              <span className={styles.dynamicLangBg}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentLanguage}
                    className={styles.dynamicLang}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -18 }}
                    transition={{ duration: 0.45, ease: "easeOut" }}
                  >
                    {currentLanguage}
                  </motion.span>
                </AnimatePresence>
              </span>

              <span>&nbsp;where&nbsp;</span>
              <span className={styles.wordAlt}>life</span>
              <span>&nbsp;</span>
              <span className={styles.wordAlt}>happens</span>
            </h1>

            <motion.p
              className={styles.heroLead}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, ease: "easeOut", delay: 0.12 }}
            >
              Start with a photo. Discover words from real objects. Practice
              through short quizzes and remember language through moments you
              actually lived.
            </motion.p>

            <motion.div
              className={styles.heroCtas}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.62, ease: "easeOut", delay: 0.2 }}
            >
              <a href="#how" className={styles.primaryCta}>
                See how it works
              </a>

              <a href="#product" className={styles.secondaryCta}>
                Explore product
              </a>

              <span className={styles.scrollHintBig} aria-hidden>
                ⌄
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.orb}
            style={{
              x: fastX,
              y: fastY,
            }}
            aria-hidden
          />

          <div className={styles.orbGlow} aria-hidden />
        </section>

        <main className={styles.main}>
          <section id="how" className={styles.journeySection}>
            <div className={styles.journeyHeader} data-aos="fade-up">
              <span className={styles.sectionKicker}>How it helps</span>

              <h2 className={styles.sectionTitle}>
                Your moments become your vocabulary
              </h2>

              <p className={styles.sectionLead}>
                Abrody turns everyday scenes into language practice. Take a
                photo, connect words to what you saw, and review them in a way
                that feels visual, quick, and personal.
              </p>
            </div>

            <motion.div className={styles.journeyContainer} layout>
              {journeyOrder.map((item, index) => (
                <motion.button
                  key={item.label}
                  type="button"
                  className={`${styles.journeyItemContainer} ${styles.card}`}
                  layout
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  whileHover={{ y: -6 }}
                  onClick={() => setModalImage(item.image)}
                  aria-label={`Open Abrody app screenshot ${item.label}`}
                >
                  <img
                    src={item.image}
                    alt={`Abrody app store screenshot ${item.label}`}
                    className={styles.carouselImage}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                  />
                </motion.button>
              ))}
            </motion.div>
          </section>

          <section
            id="product"
            className={`${styles.section} ${styles.ivSection}`}
            data-aos="fade-up"
          >
            <div className={styles.sectionHead}>
              <span className={styles.sectionKicker}>Product</span>

              <h2 className={styles.sectionTitle}>See it in action</h2>

              <p className={styles.sectionLeadSmall}>
                Real photos become visual word cards you can revisit anytime.
              </p>
            </div>

            <motion.div
              className={`${styles.demoVideosContainer} ${styles.demoRail}`}
              layout
            >
              {ivItems.map((item) => (
                <motion.article
                  key={item.src}
                  className={`${styles.videoCard} ${styles.ivCard}`}
                  layout
                >
                  <div className={styles.ivImgWrap}>
                    <img
                      className={styles.ivImg}
                      src={item.src}
                      alt={`Image vocabulary card for ${item.label}`}
                      loading="lazy"
                      decoding="async"
                    />

                    <div className={styles.ivLabel} aria-hidden="true">
                      <span className={styles.ivWordStroke}>{item.label}</span>

                      <span className={styles.ivWordFill}>{item.label}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </section>

          <section className={styles.section} data-aos="fade-up">
            <div className={styles.sectionHead}>
              <span className={styles.sectionKicker}>Practice</span>

              <h2 className={styles.sectionTitle}>
                Learn in short, visual sessions
              </h2>

              <p className={styles.sectionLeadSmall}>
                Abrody is designed for everyday learning: light enough to open
                often, visual enough to remember.
              </p>
            </div>

            <img
              src="/images/AbrodyLogo3D.png"
              alt="Abrody language learning practice preview"
              className={styles.recordButtonImage}
              loading="lazy"
              decoding="async"
            />
          </section>

          <section className={styles.betaSection} data-aos="fade-up">
            <div className={`${styles.betaCard} ${styles.glassCard}`}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionKicker}>Download</span>

                <h2 className={styles.betaTitle}>Install on iOS</h2>

                <p className={styles.betaSubtitle}>
                  Available for Canada, Australia, UK, and Korea.
                </p>
              </div>

              <div className={styles.ctaButtons}>
                <a
                  href="https://apps.apple.com/ca/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.btnPrimary}`}
                >
                  Canada
                </a>

                <a
                  href="https://apps.apple.com/au/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.btnPrimary}`}
                >
                  Australia
                </a>

                <a
                  href="https://apps.apple.com/gb/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.btnPrimary}`}
                >
                  UK
                </a>

                <a
                  href="https://apps.apple.com/kr/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.btnPrimary}`}
                >
                  Korea
                </a>
              </div>
            </div>
          </section>

          <section className={styles.betaSection} data-aos="fade-up">
            <div className={`${styles.betaCard} ${styles.glassCard}`}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionKicker}>Download</span>

                <h2 className={styles.betaTitle}>Get Abrody on Android</h2>

                <p className={styles.betaSubtitle}>
                  Download Abrody on Google Play.
                </p>
              </div>

              <div className={styles.ctaButtons}>
                <a
                  href="https://play.google.com/store/apps/details?id=com.fcdeapp.facade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${styles.ctaButton} ${styles.btnPrimary}`}
                >
                  Download on Google Play
                </a>
              </div>
            </div>
          </section>
        </main>

        {modalImage && (
          <div
            className={styles.modal}
            onClick={closeModal}
            role="presentation"
          >
            <div
              className={styles.modalContent}
              onClick={(event) => event.stopPropagation()}
            >
              <img
                src={modalImage}
                alt="Enlarged Abrody app screenshot"
                className={styles.modalImage}
              />

              <button
                type="button"
                className={styles.modalClose}
                onClick={closeModal}
                aria-label="Close image preview"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <WebFooter />
      </div>
    </>
  );
}