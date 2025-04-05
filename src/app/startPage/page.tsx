// src/pages/startPage.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useConfig } from "../../context/ConfigContext";
import { useTranslation } from "react-i18next";
import i18n from "../../config/i18n";
import { countries } from "../../constants/countries";
import { motion, AnimatePresence } from "framer-motion";
import styles from "../../styles/pages/StartPage.module.css";

// 언어 목록 (이미지는 public/assets/flags에 위치)
const languages = [
  { name: "English", code: "en", flag: "/assets/flags/uk-flag.png" },
  { name: "Spanish", code: "es", flag: "/assets/flags/spain-flag.png" },
  { name: "Chinese", code: "zh", flag: "/assets/flags/china-flag.png" },
  { name: "Hindi", code: "hi", flag: "/assets/flags/india-flag.png" },
  { name: "French", code: "fr", flag: "/assets/flags/france-flag.png" },
  { name: "Korean", code: "ko", flag: "/assets/flags/south-korea-flag.png" },
  { name: "Japanese", code: "ja", flag: "/assets/flags/japan-flag.png" },
  { name: "German", code: "de", flag: "/assets/flags/germany-flag.png" },
  { name: "Arabic", code: "ar", flag: "/assets/flags/saudi-arabia-flag.png" },
  { name: "Portuguese", code: "pt", flag: "/assets/flags/portugal-flag.png" },
  { name: "Russian", code: "ru", flag: "/assets/flags/russia-flag.png" },
  { name: "Italian", code: "it", flag: "/assets/flags/italy-flag.png" },
];

interface StartPageProps {
  onFinish: () => void;
}

const StartPage: React.FC<StartPageProps> = ({ onFinish }) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const screenHeight = window.innerHeight;

  // 상태 변수들
  const [hasSeenStartPage, setHasSeenStartPage] = useState<boolean>(false);
  const [showInitialContent, setShowInitialContent] = useState(true);
  const [showCountry, setShowCountry] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);

  // 애니메이션 상태 (Framer Motion을 사용)
  const [contentTranslateY, setContentTranslateY] = useState(0);
  const [heroImageTranslateY, setHeroImageTranslateY] = useState(0);
  const [contentOpacity, setContentOpacity] = useState(1);
  const [heroImageScale, setHeroImageScale] = useState(1);
  const [fadeOutScreen, setFadeOutScreen] = useState(1);

  const [selectedOriginCountry, setSelectedOriginCountry] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [scaleAnimation, setScaleAnimation] = useState(1);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [headerPadding, setHeaderPadding] = useState(60);
  const threshold = screenHeight * 0.25;
  // PanResponder 대체: 현재 드래그 오프셋
  const [dragOffset, setDragOffset] = useState(0);

  // Carousel taglines
  const taglines = [t("tagline_connect"), t("tagline_explore"), t("tagline_belong")];
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);

  // 시작 페이지 본인 확인
  useEffect(() => {
    const seen = localStorage.getItem("hasSeenStartPage");
    if (seen === "true") {
      setHasSeenStartPage(true);
      onFinish();
    }
  }, [onFinish]);

  // 태그라인 애니메이션: Framer Motion의 반복 애니메이션으로 처리
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTaglineIndex((prev) => (prev + 1) % taglines.length);
    }, 3100);
    return () => clearInterval(interval);
  }, [taglines.length]);

  // Get Started 버튼 핸들러: 애니메이션 실행 후 모달 표시
  const handleGetStarted = () => {
    if (animationDone) return;
    // 시퀀스 애니메이션: 각 상태를 순차적으로 변경
    setContentTranslateY(500);
    setHeroImageTranslateY(110);
    setContentOpacity(0);
    setHeroImageScale(3);
    setFadeOutScreen(0);
    setTimeout(() => {
      setAnimationDone(true);
      setShowInitialContent(false);
      setTimeout(() => {
        setShowCountry(true);
      }, 100);
    }, 800);
  };

  const handleConfirm = async () => {
    try {
      if (selectedLanguage && selectedOriginCountry) {
        localStorage.setItem("language", selectedLanguage);
        i18n.changeLanguage(selectedLanguage);
        localStorage.setItem("selectedOriginCountry", selectedOriginCountry);
      }
      localStorage.setItem("hasSeenStartPage", "true");
      onFinish();
    } catch (error) {
      console.error("Error saving data", error);
    }
  };

  const animateSelection = () => {
    setScaleAnimation(1.2);
    setTimeout(() => setScaleAnimation(1), 100);
  };

  const animateButtonPress = (toValue: number) => {
    setScaleAnimation(toValue);
    setTimeout(() => setScaleAnimation(1), 100);
  };

  const handleCountrySelection = (name: string) => {
    setSelectedOriginCountry(name);
    animateSelection();
  };

  const handleLanguageSelection = (name: string, code: string) => {
    setSelectedLanguage(code);
    animateSelection();
  };

  const toggleShowAllCountries = () => {
    setShowAllCountries(!showAllCountries);
    setHeaderPadding(showAllCountries ? 60 : 90);
  };

  // PanResponder 대체: 마우스 드래그 이벤트 처리
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const startY = e.clientY;
    const onMouseMove = (moveEvent: MouseEvent) => {
      const dy = moveEvent.clientY - startY;
      if (dy > 0) setDragOffset(dy);
    };
    const onMouseUp = () => {
      if (dragOffset > threshold) {
        handleGetStarted();
      } else {
        setDragOffset(0);
      }
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <>
      {/* 초기 애니메이션 콘텐츠 */}
      {showInitialContent && !animationDone && (
        <motion.div
          className={styles.container}
          onMouseDown={handleMouseDown}
          animate={{ translateY: contentTranslateY, opacity: contentOpacity }}
          transition={{ duration: 0.8 }}
          style={{ opacity: fadeOutScreen }}
        >
          <motion.img
            src="/assets/owlBackgroundPink.png"
            alt="Hero Background"
            className={styles.heroImage}
            animate={{ scale: heroImageScale, translateY: heroImageTranslateY }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
          <div className={styles.content}>
            <h1 className={styles.title}>{t("find_home_title")}</h1>
            <motion.p
              className={styles.tagline}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, repeat: Infinity, repeatType: "mirror", delay: 1.5 }}
            >
              {taglines[currentTaglineIndex]}
            </motion.p>
            <p className={styles.description}>{t("description_startpage")}</p>
            <div>
              <button className={styles.getStartedButton} onClick={handleGetStarted}>
                <div
                  className={styles.buttonStartedInner}
                  style={{ transform: `scale(${scaleAnimation})` }}
                >
                  <div className={styles.gradient}>
                    <span className={styles.getStartedButtonText}>{t("get_started")}</span>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* 국가 및 언어 선택 모달 */}
      <AnimatePresence>
        {showCountry && (
          <motion.div
            className={styles.modalBackground}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.modalContainer}>
              <div className={styles.containerCountry}>
                <div className={styles.overlay} style={{ paddingTop: headerPadding }}>
                  <h2 className={styles.headerText}>{t("select_country_language")}</h2>
                  <div className={styles.selectionWrapper}>
                    <div className={styles.card}>
                      <h3 className={styles.label}>{t("country_of_origin")}</h3>
                      {selectedOriginCountry && <p className={styles.selectedText}>{selectedOriginCountry}</p>}
                      <div className={styles.scrollContainer}>
                        <div className={styles.flagsContainer}>
                          {(showAllCountries ? countries : countries.slice(0, 15)).map((country, index) => (
                            <button
                              key={index}
                              className={styles.flagButton}
                              onClick={() => handleCountrySelection(country.name)}
                            >
                              <img
                                src={country.flag}
                                alt={country.name}
                                className={styles.flag}
                                style={selectedOriginCountry === country.name ? { transform: `scale(${scaleAnimation})` } : {}}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <button className={styles.moreButton} onClick={toggleShowAllCountries}>
                        {showAllCountries ? t("show_less") : t("show_more")}
                      </button>
                    </div>
                    <div className={styles.card}>
                      <h3 className={styles.label}>{t("preferred_language")}</h3>
                      {selectedLanguage && (
                        <p className={styles.selectedText}>
                          {languages.find((lang) => lang.code === selectedLanguage)?.name || ""}
                        </p>
                      )}
                      <div className={styles.scrollContainer}>
                        <div className={styles.flagsContainer}>
                          {languages.map((language, index) => (
                            <button
                              key={index}
                              className={styles.flagButton}
                              onClick={() => handleLanguageSelection(language.name, language.code)}
                            >
                              <img
                                src={language.flag}
                                alt={language.name}
                                className={styles.flag}
                                style={selectedLanguage === language.code ? { transform: `scale(${scaleAnimation})` } : {}}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      className={styles.confirmButton}
                      onMouseDown={() => animateButtonPress(0.95)}
                      onMouseUp={() => animateButtonPress(1)}
                      onClick={handleConfirm}
                    >
                      <div className={styles.buttonInner} style={{ transform: `scale(${scaleAnimation})` }}>
                        <div className={styles.gradient}>
                          <span className={styles.confirmButtonText}>{t("confirm")}</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default StartPage;
