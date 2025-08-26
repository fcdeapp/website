"use client";

import Head from "next/head";
import Image from "next/image";
import { motion, Variants, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import "aos/dist/aos.css";
import styles from "../../styles/pages/About.module.css";
import stylesB from "../../styles/pages/Business.module.css";
import stylesC from "../../styles/Home.module.css";
import WebFooter from "../../components/WebFooter";
import CountryBall from "../../components/CountryBall";
import ChainQuizzesSection from "../../components/ChainQuizzesSection";
import AOS from "aos";

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

// Stagger 부모
const heroParent: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

// 단어 단위 텍스트 리빌
const wordReveal: Variants = {
  hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

// 떠다니는 오브(구체)
const floatOrb: Variants = {
  initial: { y: 0, rotate: 0 },
  animate: {
    y: [-4, 6, -2, 0],
    rotate: [0, 1.2, -0.6, 0],
    transition: { duration: 7, repeat: Infinity, ease: "easeInOut" }
  }
};

const titleReveal: Variants = {
  hidden: { opacity: 0, y: 18 },         // blur 제거!
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function About() {

  useEffect(() => {
    // AOS 초기화 (클라이언트에서만 실행)
    AOS.init({
      once: true,          // 한 번만 애니메이션
      duration: 700,       // 0.7s
      easing: "ease-out",
      offset: 80,          // 트리거 오프셋
    });
    // 콘텐츠/이미지 로드 후 레이아웃 바뀌면 다시 계산
    AOS.refresh();
  }, []);

  // 마우스 파랄랙스
const mx = useMotionValue(0);   // -40 ~ 40(px)
const my = useMotionValue(0);
const sx = useSpring(mx, { stiffness: 120, damping: 18, mass: 0.25 });
const sy = useSpring(my, { stiffness: 120, damping: 18, mass: 0.25 });

// 3D 틸트 각도
const tiltX = useTransform(sy, v => v / -8); // deg
const tiltY = useTransform(sx, v => v / 8);  // deg

// 레이어별 파랄랙스 깊이
const layerSlow  = { x: useTransform(sx, v => v * -0.25), y: useTransform(sy, v => v * -0.25) };
const layerMed   = { x: useTransform(sx, v => v * -0.5 ), y: useTransform(sy, v => v * -0.5 ) };
const layerFast  = { x: useTransform(sx, v => v *  0.8 ), y: useTransform(sy, v => v *  0.8 ) };

function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
  const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
  const relX = ((e.clientX - r.left) / r.width  - 0.5) * 80; // -40~40
  const relY = ((e.clientY - r.top)  / r.height - 0.5) * 80;
  mx.set(relX);
  my.set(relY);
}


  return (
    <>
      <Head>
        <title>About Us | Abrody</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className={`${styles.container} ${styles.aosWrapper}`}>
        <section
          className={styles.heroSection}
          onMouseMove={handleMouseMove}
        >
          {/* --- 배경 FX 레이어들 (절대배치) --- */}
          <motion.div
            aria-hidden
            className={styles.fxMesh}
            style={layerSlow}
          />
          <motion.div
            aria-hidden
            className={styles.fxBeams}
            style={layerMed}
          />
          <motion.div
            aria-hidden
            className={styles.fxGrid}
          />

          {/* --- 전경 콘텐츠 (3D 틸트 적용) --- */}
          <motion.div
            className={styles.heroInner}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.7 }}
            variants={heroParent}
            style={{ rotateX: tiltX, rotateY: tiltY }}
          >
            {/* 타이틀: 단어별 리빌 */}
            <h1 className={styles.heroTitle}>
              {"4050 직장인을 위한 실전 영어".split(" ").map((w, i) => (
                <motion.span key={i} className={styles.word} variants={titleReveal}>
                  {w}&nbsp;
                </motion.span>
              ))}
            </h1>

            <motion.p className={styles.heroLead} variants={wordReveal} custom={1}>
              내 문서·이메일·보고서를 AI가 즉시 분석해 핵심 표현을
              음성 드릴·대화·퀴즈로 바꿉니다. 출퇴근 10분, 업무에 바로 쓰는 표현만.
            </motion.p>

            {/* CTA / 스크롤 힌트 */}
            <div className={styles.heroCtas}>
              <motion.a
                href="#why"
                className={styles.primaryCta}
                variants={wordReveal}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                내 문서로 시작하기
              </motion.a>
              <motion.span
                className={styles.scrollHintBig}
                variants={wordReveal}
                aria-hidden
              >
                ⌄
              </motion.span>
            </div>
          </motion.div>

          {/* 비주얼 오브젝트(구체) — heroImage 대체 */}
          <motion.div
            className={styles.orb}
            variants={floatOrb}
            initial="initial"
            animate="animate"
            style={layerFast}
            aria-hidden
          />
          {/* halo glow layer (pure DOM) */}
          <div className={styles.orbGlow} aria-hidden />
        </section>

      {/* ── Why Abrody Exists ───────────────────────────── */}
      <section id="why" className={stylesB.section}>
      <motion.div
        className={stylesB.whyHeader}
        variants={fadeUp}
        viewport={{ once: true, amount: 0.45 }}
      >
        <span className={stylesB.sectionKicker}>문제</span>
        <h2 className={stylesB.sectionTitle}>4050을 위한 어브로디가 필요한 이유</h2>
        <p className={stylesB.sectionLead}>
        당신의 업무와 일상에서 시작해, 즉시 현업에 적용 가능한 학습을 만듭니다.
        </p>
      </motion.div>

      <motion.div
        className={stylesB.cards3D}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
      >
        {[
          {
            icon: "🎯",
            title: "게임은 쉬워도, 업무는 어렵다",
            body: "캐릭터·XP가 아니라 ‘일에서 바로 쓰는 결과’가 필요합니다. 어브로디는 업무 연결형 학습을 전제로 만듭니다.",
          },
          {
            icon: "⏱",
            title: "시간은 없고, 맥락은 중요하다",
            body: "바쁜 출퇴근 사이, 내 일의 문서·메시지·통화 맥락으로 빠르게 배우는 게 핵심입니다.",
          },
          {
            icon: "🎙",
            title: "자신감·전달력",
            body: "우리는 실전 맥락 기반으로 명료성·유창성을 끌어올립니다.",
          },
        ].map((card, i) => (
          <motion.article
            key={card.title}
            className={`${stylesB.card} ${stylesB.statCard}`}
            variants={fadeUp}
            custom={i}
            whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(0,0,0,0.12)" }}
          >
            <span className={stylesB.statBadge} aria-hidden>{card.icon}</span>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </motion.article>
        ))}
      </motion.div>


        {/* ── Differentiators ───────────────────────────── */}
        <section className={stylesB.sectionAlt}>
          <motion.h2
            className={stylesB.sectionTitle}
            variants={fadeUp}
            viewport={{ once: true, amount: 0.45 }}
          >
            어브로디만의 차별점
          </motion.h2>

          <motion.div
            className={stylesB.flipHeader}
            variants={fadeUp}
            custom={2}
            viewport={{ once: true, amount: 0.5 }}
          >
            <span className={stylesB.flowLabel}>플랫폼 중심</span>
            <span className={stylesB.flipSwitch} aria-hidden>⇄</span>
            <span className={`${stylesB.flowLabel} ${stylesB.active}`}>사용자 중심</span>
          </motion.div>

          <motion.p
            className={stylesB.diffLead}
            variants={fadeUp}
            custom={1}
            viewport={{ once: true, amount: 0.5 }}
          >
            학습의 방향을 완전히 바꿨습니다. 어브로디는 사용자의 업무와 생활 맥락에서 시작해, 바로 현업에서 쓸 수 있는 연습으로 연결합니다.
          </motion.p>

          <motion.div
            className={stylesB.diffGrid}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          >
            {[
                {
                  title: "문서 → 오디오",
                  body: "PDF·PPT·보고서에서 핵심 문장·용어를 추출해 듣고-따라하는 반복 오디오를 즉시 생성합니다.",
                },
                {
                  title: "파일 기반 AI 대화",
                  body: "내 문서 내용으로 이메일·보고·프레젠테이션 대화를 만들어 자연스럽게 연습합니다.",
                },
                {
                  title: "한 장 사진으로 상황 학습(CTL)",
                  body: "사진 한 장을 찍으면 그 상황에 맞는 학습 시나리오가 자동으로 만들어집니다.",
                },
                {
                  title: "개인화 퀴즈",
                  body: "실수·빈출 표현을 자동 수집해 내 약점만 콕 집어 퀴즈로 보완합니다.",
                },
                {
                  title: "자연스러운 AI 보이스",
                  body: "실제 대화에 가까운 음성으로 듣기/말하기 훈련의 몰입감을 높입니다.",
                },
                {
                  title: "업무로 바로 전이",
                  body: "학습이 ‘내 업무 맥락’에서 시작되기에 성과가 현장으로 곧장 이어집니다.",
                },                 
            ].map((f, i) => (
              <motion.article
                key={f.title}
                className={stylesB.diffCard}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -6, boxShadow: "0 18px 40px rgba(17,12,43,0.12)" }}
              >
                <h3>
                  {f.title}
                </h3>
                <p>{f.body}</p>
              </motion.article>
            ))}
          </motion.div>

          <motion.p
            className={stylesB.diffNote}
            variants={fadeLeft}
            custom={3}
            viewport={{ once: true, amount: 0.4 }}
          >
              Abrody의 방식은 우리의 목표와 같습니다.
              일상과 학습을 자연스럽게 연결하고, 연구에서 증명된 CTL 방식으로 언어 실력을 눈에 띄게 끌어올립니다.
          </motion.p>
        </section>


        <motion.blockquote
          className={stylesB.quote}
          variants={fadeLeft}
          custom={3}
          viewport={{ once: true, amount: 0.4 }}
        >
          CTL 기반 학습은 말하기 명료성을
          <span className={stylesB.gradientNumber}>54%</span>
          유창성을
          <span className={stylesB.gradientNumber}>65%</span> 향상시킵니다.  
          어브로디는 이 방식을 전 과정에 자동화합니다.
          <cite className={stylesB.quoteCite}>— Yusyac 외, 2021</cite>
        </motion.blockquote>

      </section>

      <div className={stylesB.waveSplit} />

      <ChainQuizzesSection />

      {/* ── How It Works ───────────────────────────────── */}
      <section className={stylesB.sectionAlt}>
        <motion.div
          className={stylesB.whyHeader}
          variants={fadeUp}
          viewport={{ once: true, amount: 0.45 }}
        >
          <span className={stylesB.sectionKicker}>학습 흐름</span>
          <h2 className={stylesB.sectionTitle}>어브로디는 이렇게 작동합니다</h2>
        </motion.div>

        <div className={stylesB.flowGrid}>
          {[
            {
              kicker: "Upload",
              img: "/images/flow-6.png",
              title: "업무 문서 업로드",
              desc: "PDF·슬라이드·보고서를 올리면 핵심 문장/용어를 자동 추출하고 요약합니다.",
            },
            {
              kicker: "Chat",
              img: "/images/flow-7.png",
              title: "AI 대화 & 교정",
              desc: "문서 맥락으로 이메일/보고/발표 대화를 만들고, 즉시 교정을 받습니다.",
            },
            {
              kicker: "Drill",
              img: "/images/flow-8.png",
              title: "오디오 & 퀴즈",
              desc: "핵심 표현을 듣고-따라하고-테스트하며 기억에 박습니다.",
            },
          ].map((step, i) => (
            <motion.div
              key={i}
              className={stylesB.flowStep}
              variants={zoomIn}
              custom={i}
            >
              {/* 작은 칩 — 이미지(또는 제목) 위에 표시 */}
              <span className={stylesB.stepKicker} aria-hidden>
                {step.kicker}
              </span>

              <img src={step.img} alt={step.title} />
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className={stylesB.waveSplitFlip} />

          <section className={stylesC.betaSection} data-aos="fade-up">
            <div className={`${stylesC.betaCard} ${stylesC.glassCard}`}>
              <div className={stylesC.sectionHead}>
                <span className={stylesC.sectionKicker}>다운로드</span>
                <h2 className={stylesC.betaTitle}>iOS에서 설치하기</h2>
                <p className={stylesC.betaSubtitle}>
                캐나다, 호주, 영국, 한국에서 이용 가능합니다
                </p>
              </div>
              <div className={stylesC.ctaButtons}>
                <a
                  href="https://apps.apple.com/kr/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  국내
                </a>
                <a
                  href="https://apps.apple.com/app/id6743047157"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  국외
                </a>                
              </div>
            </div>
          </section>

          <section className={stylesC.betaSection} data-aos="fade-up">
            <div className={`${stylesC.betaCard} ${stylesC.glassCard}`}>
              <div className={stylesC.sectionHead}>
                <span className={stylesC.sectionKicker}>다운로드</span>
                <h2 className={stylesC.betaTitle}>Android에서 어브로디 받기</h2>
                <p className={stylesC.betaSubtitle}>Google Play에서 바로 다운로드하세요</p>
              </div>
              <div className={stylesC.ctaButtons}>
                <a
                  href="https://play.google.com/store/apps/details?id=com.fcdeapp.facade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${stylesC.ctaButton} ${stylesC.btnPrimary}`}
                >
                  Google Play에서 다운로드
                </a>
              </div>
            </div>
          </section>

      </div>
      <WebFooter />
    </>
  );
}
