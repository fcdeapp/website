"use client";

import React, { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  Variants,
} from "framer-motion";
import styles from "../../styles/pages/About.module.css";
import WebFooter from "../../components/WebFooter";

type FeatureItem = {
  id: string;
  title: string;
  body: string;
};

type FlowItem = {
  kicker: string;
  title: string;
  desc: string;
  img: string;
  alt: string;
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.68,
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

const titleReveal: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.62,
      ease: "easeOut",
    },
  },
};

const floatOrb: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-4, 6, -2, 0],
    rotate: [0, 1.2, -0.6, 0],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const quoteVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.44,
      ease: "easeOut",
    },
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.995,
    transition: {
      duration: 0.28,
    },
  },
};

function FeatureCard({
  item,
  index,
}: {
  item: FeatureItem;
  index: number;
}) {
  return (
    <motion.article
      className={styles.diffCard}
      variants={fadeUp}
      custom={index}
      whileHover={{
        y: -6,
        boxShadow: "0 18px 40px rgba(17, 12, 43, 0.12)",
      }}
    >
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </motion.article>
  );
}

export default function About() {
  const [quoteOpen, setQuoteOpen] = useState(false);

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
    return () => {
      mx.stop();
      my.stop();
    };
  }, [mx, my]);

  const features = useMemo<FeatureItem[]>(
    () => [
      {
        id: "visual-vocab",
        title: "사진으로 만드는 단어장",
        body: "직접 찍은 사진에서 단어를 고르고, 이미지와 함께 자연스럽게 익혀요.",
      },
      {
        id: "3d-explore",
        title: "3D-style 시각 탐색",
        body: "단어를 평면으로 외우는 대신, 사물을 돌려 보듯 더 입체적으로 기억해요.",
      },
      {
        id: "quiz",
        title: "짧고 빠른 복습",
        body: "오늘 배운 표현을 퀴즈로 다시 확인하며 기억을 단단하게 만들어요.",
      },
      {
        id: "daily",
        title: "일상에서 이어지는 학습",
        body: "교재 속 예문보다 지금 내 주변에서 본 것들로 학습을 시작해요.",
      },
    ],
    []
  );

  const flow = useMemo<FlowItem[]>(
    () => [
      {
        kicker: "Study",
        title: "사진에서 단어를 발견해요",
        desc: "내가 본 장면이 곧 학습 자료가 됩니다. 사진 속 사물과 표현을 연결해 익혀요.",
        img: "/images/AbrodyStudy.png",
        alt: "Abrody image vocabulary study screen",
      },
      {
        kicker: "Quiz",
        title: "짧게 확인하고 오래 기억해요",
        desc: "단어와 표현을 퀴즈로 다시 만나며, 헷갈리는 부분을 가볍게 복습해요.",
        img: "/images/AbrodyQuiz.png",
        alt: "Abrody quiz screen",
      },
      {
        kicker: "Explore",
        title: "3D-style로 더 생생하게 탐색해요",
        desc: "사물을 보는 감각을 살려 단어를 더 직관적으로 이해하고 기억해요.",
        img: "/images/AbrodyGyro.png",
        alt: "Abrody 3D-style gyro exploration screen",
      },
    ],
    []
  );

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const rect = e.currentTarget.getBoundingClientRect();

    const relX = ((e.clientX - rect.left) / rect.width - 0.5) * 80;
    const relY = ((e.clientY - rect.top) / rect.height - 0.5) * 80;

    mx.set(relX);
    my.set(relY);
  }

  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <>
      <Head>
        <title>Abrody | 사진으로 배우는 언어 학습</title>
        <meta
          name="description"
          content="Abrody는 사진과 3D-style visual exploration으로 일상 속 단어와 표현을 더 자연스럽게 익히는 언어 학습 앱입니다."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <motion.main
        className={styles.container}
        initial="hidden"
        animate="visible"
      >
        <section
          className={styles.heroSection}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div
            aria-hidden
            className={styles.fxMesh}
            style={{ x: slowX, y: slowY }}
          />
          <motion.div
            aria-hidden
            className={styles.fxBeams}
            style={{ x: medX, y: medY }}
          />
          <motion.div aria-hidden className={styles.fxGrid} />

          <motion.div
            className={styles.heroInner}
            variants={heroParent}
            style={{
              rotateX: tiltX,
              rotateY: tiltY,
            }}
          >
            <motion.h1 className={styles.heroTitle}>
              <motion.span className={styles.word} variants={titleReveal}>
                사진으로 시작하는{" "}
              </motion.span>
              <motion.span
                className={`${styles.word} ${styles.wordAlt}`}
                variants={titleReveal}
              >
                언어 학습
              </motion.span>
            </motion.h1>

            <motion.p className={styles.heroLead} variants={titleReveal}>
              Abrody는 일상에서 본 장면을 단어와 표현으로 바꿔 줍니다.
              사진을 찍고, 사물을 탐색하고, 짧은 퀴즈로 다시 기억하세요.
            </motion.p>

            <motion.div className={styles.heroCtas} variants={titleReveal}>
              <a href="#how" className={styles.primaryCta}>
                학습 흐름 보기
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
            style={{ x: fastX, y: fastY }}
            aria-hidden
          />
          <div className={styles.orbGlow} aria-hidden />
        </section>

        <section className={styles.section} id="why">
          <motion.div
            className={styles.sectionHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.35 }}
          >
            <span className={styles.sectionKicker}>Why Abrody</span>
            <h2 className={styles.sectionTitle}>
              보이는 장면이 기억나는 표현이 됩니다
            </h2>
            <p className={styles.sectionLead}>
              단어는 따로 외울 때보다 실제로 본 장면과 연결될 때 더 오래 남습니다.
              Abrody는 사진, 시각 탐색, 짧은 복습을 하나의 흐름으로 묶어
              학습이 더 자연스럽게 이어지도록 돕습니다.
            </p>
          </motion.div>

          <motion.div
            className={styles.diffGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {features.map((item, index) => (
              <FeatureCard key={item.id} item={item} index={index} />
            ))}
          </motion.div>
        </section>

        <section className={styles.sectionAlt} id="how">
          <motion.div
            className={styles.sectionHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.35 }}
          >
            <span className={styles.sectionKicker}>How It Works</span>
            <h2 className={styles.sectionTitle}>
              사진에서 시작해, 탐색하고, 다시 확인해요
            </h2>
            <p className={styles.sectionLead}>
              Abrody의 학습 흐름은 복잡하지 않습니다. 오늘 본 장면을 사진으로
              남기고, 단어를 시각적으로 살펴본 뒤, 짧은 퀴즈로 기억을 정리합니다.
            </p>
          </motion.div>

          <motion.div
            className={styles.flowGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.25 }}
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
          >
            {flow.map((step, index) => (
              <motion.article
                key={step.kicker}
                className={styles.flowStep}
                variants={fadeUp}
                custom={index}
                whileHover={{
                  y: -6,
                  boxShadow: "0 16px 36px rgba(10, 16, 69, 0.12)",
                }}
              >
                <span className={styles.sectionKicker}>{step.kicker}</span>

                <Image
                  src={step.img}
                  alt={step.alt}
                  width={720}
                  height={1440}
                  className={styles.sectionImage}
                  priority={index === 0}
                />

                <h3>{step.title}</h3>
                <p className={styles.flowDesc}>{step.desc}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section className={styles.section}>
          <motion.div
            className={styles.sectionHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.35 }}
          >
            <span className={styles.sectionKicker}>Learning Style</span>
            <h2 className={styles.sectionTitle}>
              내 주변의 사물로 배우는 언어
            </h2>
            <p className={styles.sectionLead}>
              Abrody는 매일 마주치는 사물을 학습의 출발점으로 삼습니다.
              커피, 노트, 가방, 하늘처럼 익숙한 장면이 단어와 표현으로 이어지고,
              그렇게 배운 말은 실제 상황에서 더 쉽게 떠오릅니다.
            </p>

            <button
              type="button"
              className={styles.primaryCta}
              onClick={() => setQuoteOpen((prev) => !prev)}
              aria-expanded={quoteOpen}
            >
              Abrody의 학습 방식 보기
            </button>
          </motion.div>

          <AnimatePresence>
            {quoteOpen && (
              <motion.div
                className={styles.diffCard}
                variants={quoteVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                role="region"
                aria-live="polite"
              >
                <h3>사진 기반 학습</h3>
                <p>
                  단어를 먼저 외우고 장면을 상상하는 방식이 아니라, 이미 본 장면에서
                  단어를 발견합니다. 그래서 학습이 더 가볍고, 기억은 더 구체적으로
                  남습니다.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className={styles.sectionAlt}>
          <motion.div
            className={styles.sectionHeader}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.35 }}
          >
            <span className={styles.sectionKicker}>Download</span>
            <h2 className={styles.sectionTitle}>Abrody를 시작해 보세요</h2>
            <p className={styles.sectionLead}>
              사진 한 장으로 시작하는 새로운 언어 학습 경험을 만나보세요.
            </p>

            <div className={styles.heroCtas}>
              <a
                href="https://apps.apple.com/kr/app/id6743047157"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryCta}
              >
                App Store에서 보기
              </a>

              <a
                href="https://play.google.com/store/apps/details?id=com.fcdeapp.facade"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryCta}
              >
                Google Play에서 보기
              </a>
            </div>
          </motion.div>
        </section>
      </motion.main>

      <WebFooter />
    </>
  );
}