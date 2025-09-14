"use client";

import Head from "next/head";
import React, { useState, useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import styles from "../styles/Home.module.css";
import WebFooter from "../components/WebFooter";
import RecordingModal from "../components/RecordingModal";

type CarouselItem = {
  label: string;
  image: string;
};

type Screenshot = {
  name: string;
  src: string;
};

export default function Home() {
  type IVItem = { label: string; src: string };

  const [ivItems, setIvItems] = useState<IVItem[]>([
    { label: "coffee",       src: "/imageVocab/imageVocab_1.png" }, // 커피
    { label: "bread",        src: "/imageVocab/imageVocab_2.png" }, // 빵
    { label: "tempura bowl", src: "/imageVocab/imageVocab_3.png" }, // 텐동(영문 표기)
    { label: "cat",          src: "/imageVocab/imageVocab_4.png" }, // 고양이
    { label: "pigeon",       src: "/imageVocab/imageVocab_5.png" }, // 비둘기
  ]);

  const journeyItems: CarouselItem[] = [
    { label: "1", image: "/journey/AppStoreImageiPhoneEN2509141.jpg" },
    { label: "2", image: "/journey/AppStoreImageiPhoneEN2509142.jpg" },
    { label: "3", image: "/journey/AppStoreImageiPhoneEN2509143.jpg" },
    { label: "4", image: "/journey/AppStoreImageiPhoneEN2509144.jpg" },
    { label: "5", image: "/journey/AppStoreImageiPhoneEN2509145.jpg" },
    { label: "6", image: "/journey/AppStoreImageiPhoneEN2509146.jpg" },
  ];

  //--- 상태 관리 ---
  const [journeyOrder, setJourneyOrder] = useState<CarouselItem[]>(journeyItems);
  const [shotIdx, setShotIdx] = useState(0);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const languages = ["English", "Français", "Español", "中文", "日本語", "한국어"];
  // ② 현재 인덱스 관리
  const [langIndex, setLangIndex] = useState(0);
  
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.25 });
  const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.25 });
  const tiltX = useTransform(sy, v => v / -8);
  const tiltY = useTransform(sx, v => v / 8);
  const layerSlow = { x: useTransform(sx, v => v * -0.25), y: useTransform(sy, v => v * -0.25) };
  const layerMed  = { x: useTransform(sx, v => v * -0.5 ), y: useTransform(sy, v => v * -0.5 ) };
  const layerFast = { x: useTransform(sx, v => v *  0.8 ), y: useTransform(sy, v => v *  0.8 ) };


  // ③ 3초마다 인덱스 순환
  useEffect(() => {
    const iv = setInterval(() => {
      setLangIndex(i => (i + 1) % languages.length);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  //--- AOS 초기화 ---
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setIvItems((prev) => [...prev.slice(1), prev[0]]);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => {
      setJourneyOrder((prev) => [...prev.slice(1), prev[0]]);
    }, 5000);
    return () => clearInterval(iv);
  }, []);

  const openModal = (src: string) => setModalImage(src);
  const closeModal = () => setModalImage(null);


  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Abrody | Built for Mid-Career Pros — Learn from Your Work</title>
        <meta name="description" content="Upload a document and get short, practical language practice built from your own work — voice drills, AI coaching and quick quizzes so you can use the language confidently at work in just 10 minutes a day." />
        <meta property="og:title" content="Abrody — Practical workplace language practice" />
        <meta name="twitter:title" content="Abrody — Practical workplace language practice" />
        <meta property="og:description" content="Turn your PDFs, emails and slides into short practice sessions that make your on-the-job communication clearer and more confident." />
        <meta name="twitter:description" content="Work-focused voice drills, AI coaching and quick quizzes built from your documents — practice that transfers to meetings and emails." />

        {/* Open Graph for link previews */}
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content="https://website.fcde.app/AbrodyFoxB.png" />
        <meta property="og:url"         content="https://website.fcde.app/" />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter Card */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:image"       content="https://website.fcde.app/AbrodyFoxB.png" />
        <meta name="twitter:image:alt"   content="Abrody | Connecting People Abroad" />
      </Head>

      <div className={styles.container}>
      <section
        className={styles.heroSection}
        onMouseMove={(e) => {
          const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
          const relX = ((e.clientX - r.left) / r.width - 0.5) * 80; // -40~40
          const relY = ((e.clientY - r.top) / r.height - 0.5) * 80;
          mx.set(relX); my.set(relY);
        }}
      >
        {/* 배경 FX */}
        <motion.div aria-hidden className={styles.fxMesh} style={layerSlow} />
        <motion.div aria-hidden className={styles.fxBeams} style={layerMed} />
        <motion.div aria-hidden className={styles.fxGrid} />

        {/* 전경 콘텐츠 (3D 틸트) */}
        <motion.div
          className={styles.heroInner}
          style={{ rotateX: tiltX, rotateY: tiltY }}
        >
          <h1 className={styles.heroTitle}>
          Learn&nbsp;
            <span className={styles.dynamicLangBg}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={langIndex}
                  className={styles.dynamicLang}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  {languages[langIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
            &nbsp;where life happens
          </h1>

          <motion.p className={styles.heroLead}>
            Start with a photo. Finish with words that fit your day. Your moments become language you’ll remember and use.
          </motion.p>

          <div className={styles.heroCtas}>
            <a href="#how" className={styles.primaryCta}>Practice with my documents</a>
            <a href="#product" className={styles.secondaryCta}>Watch the demo</a>
            <span className={styles.scrollHintBig} aria-hidden>⌄</span>
          </div>
        </motion.div>

        {/* 비주얼 오브젝트(구체) */}
        <motion.div className={styles.orb} style={layerFast} aria-hidden />
        <div className={styles.orbGlow} aria-hidden />
      </section>

        <main className={styles.main}>
        <div id="how" className={styles.journeyHeader}>
        <span className={styles.sectionKicker}>How it helps</span>
        <h2 className={styles.sectionTitle}>Your moments become your vocabulary</h2>
        <p className={styles.sectionLead}>
          Talk about what just happened. Use the right expressions at work and in life.
          New words stick because they’re tied to your memory. No filler—only what matters to you.
        </p>
        </div>


        <motion.div className={styles.journeyContainer} layout>
          {journeyOrder.slice(0, 5).map((item) => (
            <motion.div
              key={item.label}
              className={`${styles.journeyItemContainer} ${styles.card}`}
              layout
              transition={{ duration: 0.6, ease: "easeInOut" }}
              whileHover={{ y: -6 }}
            >
              <img
                src={item.image}
                alt={`Screens showing how short practice improves work communication — step ${item.label}`}
                className={styles.carouselImage}
                loading="lazy"
              />
            </motion.div>
          ))}
        </motion.div>

          {/* App Demo Videos */}
          <section className={`${styles.section} ${styles.ivSection}`} data-aos="fade-up">
          <div className={styles.sectionHead}>
            <span className={styles.sectionKicker}>Product</span>
            <h2 className={styles.sectionTitle}>See it in action</h2>
            <p className={styles.sectionLeadSmall}>
              You bring the context. We bring the practice.
            </p>
          </div>

          <motion.div className={`${styles.demoVideosContainer} ${styles.demoRail}`} layout>
            {ivItems.map((it) => (
              <motion.div key={it.src} className={`${styles.videoCard} ${styles.ivCard}`} layout>
                <div className={styles.ivImgWrap}>
                  <img
                    className={styles.ivImg}
                    src={it.src}
                    alt={`Image vocabulary — ${it.label}`}
                    loading="lazy"
                  />
                  {/* 앱 스타일: 흰 두꺼운 테두리 + 짙은 회색 텍스트 (겹쳐서 표시) */}
                  <div className={styles.ivLabel} aria-hidden="true">
                    <span className={styles.ivWordStroke}>{it.label}</span>
                    <span className={styles.ivWordFill}>{it.label}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
          </section>

          <section className={styles.section} data-aos="fade-up">
            <img
              src="/images/Ads250812EN.jpg"
              alt="Practice that improves your meetings and emails"
              className={styles.recordButtonImage}
            />
          </section>

          <section className={styles.betaSection} data-aos="fade-up">
            <div className={`${styles.betaCard} ${styles.glassCard}`}>
              <div className={styles.sectionHead}>
                <span className={styles.sectionKicker}>Download</span>
                <h2 className={styles.betaTitle}>Install on iOS</h2>
                <p className={styles.betaSubtitle}>
                  Available for Canada, Australia, UK &amp; Korea
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
                  Download Abrody on Google Play
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

        {/* Modal */}
        {modalImage && (
          <div className={styles.modal} onClick={closeModal}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={modalImage}
                alt="Enlarged screenshot"
                className={styles.modalImage}
              />
              <button className={styles.modalClose} onClick={closeModal}>
                X
              </button>
            </div>
          </div>
        )}

        <WebFooter />
      </div>
    </>
  );
}
