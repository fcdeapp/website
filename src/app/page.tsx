"use client";

import Head from "next/head";
import React, { useEffect, useMemo, useState } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { AnimatePresence, motion, Variants } from "framer-motion";
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

type FeatureItem = {
  index: string;
  title: string;
  body: string;
};

type DownloadLink = {
  label: string;
  href: string;
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

const HOW_ITEMS: FeatureItem[] = [
  {
    index: "01",
    title: "Take a photo",
    body: "Start from real scenes around you instead of a fixed textbook list.",
  },
  {
    index: "02",
    title: "Find visual words",
    body: "Objects in the photo become vocabulary cards with meaning and examples.",
  },
  {
    index: "03",
    title: "Review quickly",
    body: "Short sessions help you remember words through moments you actually saw.",
  },
];

const PRACTICE_ITEMS: FeatureItem[] = [
  {
    index: "A",
    title: "Personal context",
    body: "Words are connected to your own photos, so they feel easier to recall.",
  },
  {
    index: "B",
    title: "3D-style exploration",
    body: "Selected cards can open a model preview to make the word more concrete.",
  },
  {
    index: "C",
    title: "Light daily rhythm",
    body: "Abrody is designed to be opened often, even when you only have a minute.",
  },
];

const IOS_LINKS: DownloadLink[] = [
  { label: "Canada", href: "https://apps.apple.com/ca/app/id6743047157" },
  { label: "Australia", href: "https://apps.apple.com/au/app/id6743047157" },
  { label: "UK", href: "https://apps.apple.com/gb/app/id6743047157" },
  { label: "Korea", href: "https://apps.apple.com/kr/app/id6743047157" },
];

const ANDROID_LINK =
  "https://play.google.com/store/apps/details?id=com.fcdeapp.facade";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.58, ease: "easeOut" },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
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

  const currentLanguage = useMemo(() => {
    return LANGUAGES[langIndex] ?? LANGUAGES[0] ?? "English";
  }, [langIndex]);

  useEffect(() => {
    AOS.init({
      duration: 850,
      once: true,
      offset: 80,
    });
  }, []);

  useEffect(() => {
    if (document.querySelector('script[data-model-viewer="true"]')) return;

    const script = document.createElement("script");
    script.type = "module";
    script.src =
      "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
    script.dataset.modelViewer = "true";
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setLangIndex((current) => (current + 1) % LANGUAGES.length);
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

  function closeModal() {
    setModalImage(null);
  }

  function openModel(item: IVItem) {
    if (loadingModelSrc) return;

    setLoadingModelSrc(item.modelSrc);

    window.setTimeout(() => {
      setActiveModel(item);
      setLoadingModelSrc(null);
    }, 850);
  }

  function closeModel() {
    setActiveModel(null);
  }

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

      <div className={styles.page}>
        <section className={styles.hero}>
          <motion.div
            className={styles.heroCopy}
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            <motion.p className={styles.eyebrow} variants={fadeUp}>
              Abrody visual language app
            </motion.p>

            <motion.h1 variants={fadeUp}>
              Learn{" "}
              <span className={styles.languageSlot}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentLanguage}
                    className={styles.languageText}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.32, ease: "easeOut" }}
                  >
                    {currentLanguage}
                  </motion.span>
                </AnimatePresence>
              </span>
              <br />
              from what you see.
            </motion.h1>

            <motion.p className={styles.heroText} variants={fadeUp}>
              Take a photo, turn real objects into vocabulary, and review words
              through short visual sessions. Abrody makes language learning feel
              closer to your daily life.
            </motion.p>

            <motion.div className={styles.heroActions} variants={fadeUp}>
              <a href="#how" className={styles.darkButton}>
                See how it works
              </a>
              <a href="#product" className={styles.lightButton}>
                Explore product
              </a>
            </motion.div>

            <motion.div className={styles.heroStats} variants={fadeUp}>
              <div>
                <span>Input</span>
                <strong>Photo</strong>
              </div>
              <div>
                <span>Output</span>
                <strong>Vocabulary</strong>
              </div>
              <div>
                <span>Review</span>
                <strong>Short quiz</strong>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            className={styles.heroVisual}
            initial={{ opacity: 0, y: 30, rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.75, ease: "easeOut", delay: 0.12 }}
            aria-hidden="true"
          >
            <div className={styles.visualGlow} />

            <div className={styles.phoneStack}>
              {JOURNEY_ITEMS.map((item, index) => (
                <img
                  key={item.image}
                  src={item.image}
                  alt=""
                  className={`${styles.heroPhone} ${
                    index === 0
                      ? styles.heroPhoneOne
                      : index === 1
                        ? styles.heroPhoneTwo
                        : styles.heroPhoneThree
                  }`}
                  draggable={false}
                />
              ))}
            </div>

            <div className={styles.wordBubble}>
              <span>Detected word</span>
              <strong>{ivItems[0]?.label ?? "object"}</strong>
              <em>{ivItems[0]?.meaning ?? "단어"}</em>
            </div>

            <div className={styles.quizBubble}>
              <span>Quick review</span>
              <strong>3 min</strong>
            </div>
          </motion.div>
        </section>

        <main className={styles.main}>
          <section id="how" className={styles.problemSection}>
            <div className={styles.sectionTitle} data-aos="fade-up">
              <p className={styles.eyebrow}>How it works</p>
              <h2>Your everyday moments become study material.</h2>
              <p>
                Abrody removes the distance between what you see and what you
                learn. The flow is simple: capture, understand, and review.
              </p>
            </div>

            <div className={styles.problemGrid}>
              {HOW_ITEMS.map((item) => (
                <article key={item.index} data-aos="fade-up">
                  <span>{item.index}</span>
                  <strong>{item.title}</strong>
                  <p>{item.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.solutionSection}>
            <div className={styles.solutionVisual} aria-hidden="true">
              <motion.div className={styles.appGallery} layout>
                {journeyOrder.map((item, index) => (
                  <motion.button
                    key={item.label}
                    type="button"
                    className={styles.appShotButton}
                    layout
                    transition={{ duration: 0.55, ease: "easeInOut" }}
                    whileHover={{ y: -8 }}
                    onClick={() => setModalImage(item.image)}
                    aria-label={`Open Abrody app screenshot ${item.label}`}
                  >
                    <img
                      src={item.image}
                      alt={`Abrody app screenshot ${item.label}`}
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                    />
                  </motion.button>
                ))}
              </motion.div>
            </div>

            <div className={styles.solutionCopy} data-aos="fade-up">
              <p className={styles.eyebrow}>Product flow</p>
              <h2>Photo first. Words second. Memory after that.</h2>
              <p>
                Instead of beginning with an abstract word list, Abrody begins
                with an image. You connect the word to something you actually
                saw, which makes the review experience more visual and personal.
              </p>

              <div className={styles.solutionList}>
                <div>
                  <strong>Image-based vocabulary</strong>
                  <span>Words are attached to visible objects and scenes.</span>
                </div>
                <div>
                  <strong>Clear meaning and examples</strong>
                  <span>Each card shows meaning, description, and usage.</span>
                </div>
                <div>
                  <strong>Review without friction</strong>
                  <span>Open the app for short sessions that fit your day.</span>
                </div>
              </div>
            </div>
          </section>

          <section id="product" className={styles.productSection}>
            <div className={styles.sectionTitle} data-aos="fade-up">
              <p className={styles.eyebrow}>Image vocabulary</p>
              <h2>See real objects turn into word cards.</h2>
              <p>
                Tap the Abrody icon on a card to open a 3D-style preview and
                learn the word with examples.
              </p>
            </div>

            <motion.div className={styles.vocabRail} layout>
              {ivItems.map((item) => {
                const isLoading = loadingModelSrc === item.modelSrc;

                return (
                  <motion.article
                    key={item.src}
                    className={styles.vocabCard}
                    layout
                    transition={{ duration: 0.45, ease: "easeInOut" }}
                  >
                    <div className={styles.vocabImageWrap}>
                      <img
                        className={styles.vocabImage}
                        src={item.src}
                        alt={`Image vocabulary card for ${item.label}`}
                        loading="lazy"
                        decoding="async"
                      />

                      <div
                        className={styles.meaningPill}
                        aria-label={`${item.label} meaning`}
                      >
                        {item.meaning}
                      </div>

                      <button
                        type="button"
                        className={`${styles.modelButton} ${
                          isLoading ? styles.modelButtonLoading : ""
                        }`}
                        onClick={() => openModel(item)}
                        aria-label={`Open ${item.label} 3D model`}
                        disabled={isLoading}
                      >
                        <span className={styles.modelProgressRing} aria-hidden />
                        <img
                          src="/images/AbrodyLogo3D.png"
                          alt=""
                          className={styles.modelButtonLogo}
                          loading="lazy"
                          decoding="async"
                        />
                      </button>
                    </div>

                    <div className={styles.vocabMeta}>
                      <strong>{item.label}</strong>
                      <span>{item.description}</span>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </section>

          <section className={styles.practiceSection}>
            <div className={styles.practiceCopy} data-aos="fade-up">
              <p className={styles.eyebrow}>Practice</p>
              <h2>Designed for short, visual learning sessions.</h2>
              <p>
                Abrody keeps the learning loop light. You do not need to sit
                down for a long study block; you can review small pieces often.
              </p>
            </div>

            <div className={styles.practiceLayout}>
              <div className={styles.practiceVisual} aria-hidden="true">
                <img
                  src="/images/AbrodyLogo3D.png"
                  alt=""
                  loading="lazy"
                  decoding="async"
                />
                <div className={styles.practiceHalo} />
              </div>

              <div className={styles.practiceCards}>
                {PRACTICE_ITEMS.map((item) => (
                  <article key={item.index} data-aos="fade-up">
                    <span>{item.index}</span>
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className={styles.downloadSection}>
            <div className={styles.downloadCard} data-aos="fade-up">
              <div>
                <p className={styles.eyebrow}>Download</p>
                <h2>Install Abrody on iOS.</h2>
                <p>Available for Canada, Australia, UK, and Korea.</p>
              </div>

              <div className={styles.downloadButtons}>
                {IOS_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.darkButton}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            <div className={styles.downloadCard} data-aos="fade-up">
              <div>
                <p className={styles.eyebrow}>Android</p>
                <h2>Get Abrody on Google Play.</h2>
                <p>Download the Android version directly from Google Play.</p>
              </div>

              <div className={styles.downloadButtons}>
                <a
                  href={ANDROID_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.darkButton}
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
                  className: styles.modelViewer,
                })}
              </div>

              <aside className={styles.modelInfoPanel}>
                <span className={styles.modelInfoKicker}>
                  Image vocabulary
                </span>

                <h3 className={styles.modelInfoTitle}>{activeModel.label}</h3>

                <div className={styles.modelInfoMeaning}>
                  {activeModel.meaning}
                </div>

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