"use client";

import Head from "next/head";
import React, { useEffect, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import {
  AnimatePresence,
  motion,
  Variants,
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
  meaning: string;
  description: string;
  examples: string[];
  src: string;
  modelSrc: string;
};

const LANGUAGES = ["English", "Français", "Español", "中文", "日本語", "한국어"];

const JOURNEY_ITEMS: CarouselItem[] = [
  { label: "1", image: "/journey/AppStoreImageiPhoneEN2605011.jpg" },
  { label: "2", image: "/journey/AppStoreImageiPhoneEN2605012.jpg" },
  { label: "3", image: "/journey/AppStoreImageiPhoneEN2605013.jpg" },
];

const INITIAL_IV_ITEMS: IVItem[] = [
  {
    label: "air balloon",
    meaning: "열기구",
    description:
      "A large balloon filled with hot air that carries people in a basket through the sky.",
    examples: [
      "The air balloon rose slowly over the field.",
      "We saw a colorful air balloon at sunrise.",
    ],
    src: "/air_balloon_model.png",
    modelSrc: "/air_balloon_model.glb",
  },
  {
    label: "bowl",
    meaning: "그릇",
    description:
      "A round, open container used for holding food such as soup, rice, cereal, or salad.",
    examples: [
      "She poured soup into a white bowl.",
      "I ate cereal from a small bowl.",
    ],
    src: "/bowl_model.png",
    modelSrc: "/bowl_model.glb",
  },
  {
    label: "fish",
    meaning: "물고기",
    description:
      "An animal that lives in water, breathes through gills, and usually swims with fins.",
    examples: [
      "The yellow fish swam near the glass.",
      "A fish moved quickly under the water.",
    ],
    src: "/fish_model.png",
    modelSrc: "/fish_model.glb",
  },
  {
    label: "shoes",
    meaning: "신발",
    description:
      "Things you wear on your feet to protect them when walking, running, or going outside.",
    examples: [
      "He put on his shoes before leaving home.",
      "These shoes are comfortable for walking.",
    ],
    src: "/shoes_model.png",
    modelSrc: "/shoes_model.glb",
  },
  {
    label: "sushi",
    meaning: "초밥",
    description:
      "A Japanese food often made with vinegared rice and toppings such as fish, seafood, or vegetables.",
    examples: [
      "We ordered sushi for dinner.",
      "This sushi has a soft piece of fish on top.",
    ],
    src: "/sushi_model.png",
    modelSrc: "/sushi_model.glb",
  },
];

const heroParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
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

const wordReveal: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" },
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

export default function Home() {
  const [ivItems, setIvItems] = useState<IVItem[]>(INITIAL_IV_ITEMS);
  const [journeyOrder, setJourneyOrder] =
    useState<CarouselItem[]>(JOURNEY_ITEMS);
  const [langIndex, setLangIndex] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [loadingModelSrc, setLoadingModelSrc] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<IVItem | null>(null);

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
    if (document.querySelector('script[data-model-viewer="true"]')) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    script.dataset.modelViewer = "true";
    document.head.appendChild(script);
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

  function openModel(item: IVItem) {
    if (loadingModelSrc) return;

    setLoadingModelSrc(item.modelSrc);

    window.setTimeout(() => {
      setActiveModel(item);
      setLoadingModelSrc(null);
    }, 1100);
  }

  function closeModel() {
    setActiveModel(null);
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
            initial="hidden"
            animate="visible"
            variants={heroParent}
            style={{
              rotateX: tiltX,
              rotateY: tiltY,
            }}
          >
            <motion.p className={styles.heroKicker} variants={titleReveal}>
              Abrody
            </motion.p>

            <h1 className={styles.heroTitle}>
              <motion.span className={styles.word} variants={titleReveal}>
                Learn&nbsp;
              </motion.span>

              <motion.span
                className={`${styles.word} ${styles.dynamicLangBg}`}
                variants={titleReveal}
              >
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
              </motion.span>

              <motion.span className={styles.word} variants={titleReveal}>
                &nbsp;with&nbsp;
              </motion.span>

              <motion.span
                className={`${styles.word} ${styles.wordAlt}`}
                variants={titleReveal}
              >
                what
              </motion.span>

              <motion.span className={styles.word} variants={titleReveal}>
                &nbsp;you&nbsp;
              </motion.span>

              <motion.span
                className={`${styles.word} ${styles.wordAlt}`}
                variants={titleReveal}
              >
                see
              </motion.span>
            </h1>

            <motion.p className={styles.heroLead} variants={wordReveal}>
              Start with a photo. Discover words from real objects. Practice
              through short quizzes and remember language through moments you
              actually lived.
            </motion.p>

            <motion.div className={styles.heroCtas} variants={wordReveal}>
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
            variants={floatOrb}
            initial="initial"
            animate="animate"
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
              {ivItems.map((item) => {
                const isLoading = loadingModelSrc === item.modelSrc;

                return (
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

                      <div className={styles.ivMeaningPill} aria-label={`${item.label} meaning`}>
                        {item.meaning}
                      </div>

                      <button
                        type="button"
                        className={`${styles.modelLaunchButton} ${
                          isLoading ? styles.modelLaunchButtonLoading : ""
                        }`}
                        onClick={() => openModel(item)}
                        aria-label={`Open ${item.label} 3D model`}
                        disabled={isLoading}
                      >
                        <span className={styles.modelProgressRing} aria-hidden />

                        <img
                          src="/images/AbrodyLogo3D.png"
                          alt=""
                          className={styles.modelLaunchLogo}
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    </div>

                    <div className={styles.ivWordLabel}>{item.label}</div>
                  </motion.article>
                );
              })}
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

        {activeModel && (
          <div
            className={styles.modelModal}
            onClick={closeModel}
            role="presentation"
          >
            <div
              className={styles.modelModalContent}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className={styles.modelCloseButton}
                onClick={closeModel}
                aria-label="Close 3D model preview"
              >
                <img
                  src="/images/AbrodyClose.png"
                  alt=""
                  className={styles.modelCloseIcon}
                  loading="lazy"
                  decoding="async"
                />
              </button>

              <div className={styles.modelViewerShell}>
                {React.createElement("model-viewer", {
                  src: activeModel.modelSrc,
                  alt: `${activeModel.label} 3D model`,
                  cameraControls: true,
                  autoRotate: true,
                  ar: true,
                  exposure: "1",
                  shadowIntensity: "0.45",
                  class: styles.modelViewer,
                })}
              </div>

              <aside className={styles.modelInfoPanel}>
                <span className={styles.modelInfoKicker}>Image vocabulary</span>

                <h3 className={styles.modelInfoTitle}>{activeModel.label}</h3>

                <div className={styles.modelInfoMeaning}>{activeModel.meaning}</div>

                <p className={styles.modelInfoDescription}>
                  {activeModel.description}
                </p>

                <div className={styles.modelExampleBlock}>
                  <span className={styles.modelExampleTitle}>Examples</span>

                  {activeModel.examples.map((example) => (
                    <p key={example} className={styles.modelExampleText}>
                      “{example}”
                    </p>
                  ))}
                </div>
              </aside>
            </div>
          </div>
        )}

        <WebFooter />
      </div>
    </>
  );
}