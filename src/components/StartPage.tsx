"use client";

import React, { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../config/i18n";
import { countries } from "../constants/countries";
import styles from "../styles/pages/StartPage.module.css";

type Lang =
  | "en"
  | "es"
  | "fr"
  | "zh"
  | "ja"
  | "ko"
  | "ar"
  | "de"
  | "hi"
  | "it"
  | "pt"
  | "ru";

type WordKey = "airBalloon" | "bowl" | "fish" | "shoes" | "sushi";

type CountryItem = {
  name: string;
  flag: string | { src?: string };
  code?: string;
  iso2?: string;
};

type WordAsset = {
  key: WordKey;
  label: string;
  meaning: string;
  description: string;
  pngSrc: string;
  modelSrc: string;
};

interface StartPageProps {
  onFinish?: () => void;
}

const FINISH_PATH = "/login";

const MODEL_VIEWER_SRC =
  "https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js";

const BG_IMG = "/assets/AbrodyFoxBB.png";
const START_STUDY_IMG = "/images/AbrodyStudy.png";

const WORD_ASSETS: WordAsset[] = [
  {
    key: "airBalloon",
    label: "air balloon",
    meaning: "열기구",
    description:
      "A large balloon filled with hot air that carries people in a basket through the sky.",
    pngSrc: "/air_balloon_model.png",
    modelSrc: "/air_balloon_model.glb",
  },
  {
    key: "bowl",
    label: "bowl",
    meaning: "그릇",
    description:
      "A round, open container used for holding food such as soup, rice, cereal, or salad.",
    pngSrc: "/bowl_model.png",
    modelSrc: "/bowl_model.glb",
  },
  {
    key: "fish",
    label: "fish",
    meaning: "물고기",
    description:
      "An animal that lives in water, breathes through gills, and usually swims with fins.",
    pngSrc: "/fish_model.png",
    modelSrc: "/fish_model.glb",
  },
  {
    key: "shoes",
    label: "shoes",
    meaning: "신발",
    description:
      "Things you wear on your feet to protect them when walking, running, or going outside.",
    pngSrc: "/shoes_model.png",
    modelSrc: "/shoes_model.glb",
  },
  {
    key: "sushi",
    label: "sushi",
    meaning: "초밥",
    description:
      "A Japanese food often made with vinegared rice and toppings such as fish, seafood, or vegetables.",
    pngSrc: "/sushi_model.png",
    modelSrc: "/sushi_model.glb",
  },
];

const WORD_LABELS: Record<Lang, Record<WordKey, string>> = {
  en: {
    airBalloon: "air balloon",
    bowl: "bowl",
    fish: "fish",
    shoes: "shoes",
    sushi: "sushi",
  },
  ko: {
    airBalloon: "열기구",
    bowl: "그릇",
    fish: "물고기",
    shoes: "신발",
    sushi: "초밥",
  },
  ja: {
    airBalloon: "気球",
    bowl: "ボウル",
    fish: "魚",
    shoes: "靴",
    sushi: "寿司",
  },
  zh: {
    airBalloon: "热气球",
    bowl: "碗",
    fish: "鱼",
    shoes: "鞋",
    sushi: "寿司",
  },
  es: {
    airBalloon: "globo",
    bowl: "cuenco",
    fish: "pez",
    shoes: "zapatos",
    sushi: "sushi",
  },
  fr: {
    airBalloon: "montgolfière",
    bowl: "bol",
    fish: "poisson",
    shoes: "chaussures",
    sushi: "sushi",
  },
  de: {
    airBalloon: "Heißluftballon",
    bowl: "Schüssel",
    fish: "Fisch",
    shoes: "Schuhe",
    sushi: "Sushi",
  },
  ar: {
    airBalloon: "منطاد",
    bowl: "وعاء",
    fish: "سمكة",
    shoes: "أحذية",
    sushi: "سوشي",
  },
  it: {
    airBalloon: "mongolfiera",
    bowl: "ciotola",
    fish: "pesce",
    shoes: "scarpe",
    sushi: "sushi",
  },
  pt: {
    airBalloon: "balão",
    bowl: "tigela",
    fish: "peixe",
    shoes: "sapatos",
    sushi: "sushi",
  },
  ru: {
    airBalloon: "шар",
    bowl: "миска",
    fish: "рыба",
    shoes: "обувь",
    sushi: "суши",
  },
  hi: {
    airBalloon: "गुब्बारा",
    bowl: "कटोरा",
    fish: "मछली",
    shoes: "जूते",
    sushi: "सुशी",
  },
};

const LANG_CODES: Lang[] = [
  "en",
  "ko",
  "ja",
  "zh",
  "es",
  "fr",
  "de",
  "ar",
  "it",
  "pt",
  "ru",
  "hi",
];

const languages: Array<{
  name: string;
  code: Lang;
  flag: string;
}> = [
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

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];

  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }

  return copy.slice(0, n);
}

function getFlagSrc(flag: string | { src?: string } | undefined) {
  if (!flag) return "";
  if (typeof flag === "string") return flag;
  return flag.src || "";
}

function randomTilePosition() {
  return {
    x: 8 + Math.random() * 68,
    y: 8 + Math.random() * 58,
    scale: 0.94 + Math.random() * 0.12,
  };
}

function ModelViewer({
  src,
  poster,
  label,
}: {
  src: string;
  poster: string;
  label: string;
}) {
  return React.createElement("model-viewer", {
    src,
    poster,
    alt: label,
    class: styles.tileModel,
    "aria-label": label,
    "auto-rotate": true,
    "camera-controls": false,
    "disable-zoom": true,
    "interaction-prompt": "none",
    "shadow-intensity": "0.45",
    "environment-image": "neutral",
    loading: "lazy",
    reveal: "auto",
  });
}

function MovingTile({
  item,
  index,
}: {
  item: WordAsset;
  index: number;
}) {
  const [label, setLabel] = useState(WORD_LABELS.en[item.key]);
  const [pos, setPos] = useState(() => randomTilePosition());

  useEffect(() => {
    let alive = true;

    const tick = () => {
      const next = LANG_CODES[Math.floor(Math.random() * LANG_CODES.length)];

      if (alive) {
        setLabel(WORD_LABELS[next][item.key]);
        setPos(randomTilePosition());
      }
    };

    const interval = window.setInterval(tick, 1800 + index * 160);

    return () => {
      alive = false;
      window.clearInterval(interval);
    };
  }, [index, item.key]);

  return (
    <motion.div
      className={styles.movingTile}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{
        opacity: 1,
        scale: pos.scale,
        left: `${pos.x}%`,
        top: `${pos.y}%`,
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{
        opacity: { duration: 0.55 },
        scale: { duration: 4.8, ease: "easeInOut" },
        left: { duration: 5.2, ease: "easeInOut" },
        top: { duration: 5.2, ease: "easeInOut" },
      }}
    >
      <img
        src={item.pngSrc}
        alt=""
        className={styles.tilePoster}
        draggable={false}
      />

      <div className={styles.tileModelLayer} aria-hidden>
        <ModelViewer src={item.modelSrc} poster={item.pngSrc} label={item.label} />
      </div>

      <span className={styles.tileLabel}>{label}</span>
    </motion.div>
  );
}

export default function StartPage({ onFinish }: StartPageProps) {
  const router = useRouter();
  const { t } = useTranslation();

  const countryList = countries as CountryItem[];

  const [showInitialContent, setShowInitialContent] = useState(true);
  const [showCountry, setShowCountry] = useState(false);
  const [animationDone, setAnimationDone] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedOriginCountry, setSelectedOriginCountry] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Lang | null>(null);
  const [showAllCountries, setShowAllCountries] = useState(false);
  const [showBackPromptCycle, setShowBackPromptCycle] = useState(true);

  const [visibleIdxs, setVisibleIdxs] = useState<number[]>(() => {
    const count = Math.random() < 0.5 ? 2 : 3;
    return pickN(WORD_ASSETS.map((_, i) => i), count);
  });

  const dragStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  const tt = (key: string, fallback: string) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  const finish = () => {
    if (onFinish) {
      onFinish();
      return;
    }

    router.push(FINISH_PATH);
  };

  useEffect(() => {
    const seen = window.localStorage.getItem("hasSeenStartPage");

    if (seen === "true") {
      finish();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;

    const cycle = () => {
      if (!active) return;

      const count = Math.random() < 0.5 ? 2 : 3;
      setVisibleIdxs(pickN(WORD_ASSETS.map((_, i) => i), count));
    };

    const interval = window.setInterval(cycle, 3400);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (step !== 2 || selectedLanguage) return;

    const interval = window.setInterval(() => {
      setShowBackPromptCycle((prev) => !prev);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [step, selectedLanguage]);

  const resolveDevicePrefs = () => {
    if (typeof window === "undefined") {
      return { langEntry: undefined, countryEntry: undefined };
    }

    const locale = navigator.language || "";
    const [languageCode, regionCode] = locale.split("-");

    const langEntry = languageCode
      ? languages.find(
          (lang) => lang.code.toLowerCase() === languageCode.toLowerCase()
        )
      : undefined;

    const countryEntry = regionCode
      ? countryList.find((country) => {
          const code = country.code || country.iso2 || "";
          return code.toUpperCase() === regionCode.toUpperCase();
        })
      : undefined;

    return { langEntry, countryEntry };
  };

  const tryAutoApplyDevicePrefs = async () => {
    const { langEntry, countryEntry } = resolveDevicePrefs();

    if (langEntry) {
      setSelectedLanguage(langEntry.code);
    }

    if (countryEntry) {
      setSelectedOriginCountry(countryEntry.name);
    }

    if (langEntry && countryEntry) {
      window.localStorage.setItem("language", langEntry.code);
      window.localStorage.setItem("selectedOriginCountry", countryEntry.name);
      window.localStorage.setItem("hasSeenStartPage", "true");

      await i18n.changeLanguage(langEntry.code);
      finish();

      return true;
    }

    return false;
  };

  const handleGetStarted = async () => {
    if (isStarted) return;

    setIsStarted(true);

    window.setTimeout(async () => {
      setAnimationDone(true);
      setShowInitialContent(false);

      const applied = await tryAutoApplyDevicePrefs();

      if (!applied) {
        window.setTimeout(() => setShowCountry(true), 120);
      }
    }, 760);
  };

  const handleConfirm = async () => {
    if (!selectedOriginCountry || !selectedLanguage) return;

    try {
      window.localStorage.setItem("language", selectedLanguage);
      window.localStorage.setItem("selectedOriginCountry", selectedOriginCountry);
      window.localStorage.setItem("hasSeenStartPage", "true");

      await i18n.changeLanguage(selectedLanguage);
      finish();
    } catch (error) {
      console.error("Error saving start page settings", error);
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragStartY.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragStartY.current == null || isStarted) return;

    const delta = e.clientY - dragStartY.current;

    if (delta > 0) {
      setDragY(Math.min(delta, 180));
    }
  };

  const handlePointerUp = () => {
    if (dragY > 120) {
      handleGetStarted();
    } else {
      setDragY(0);
    }

    dragStartY.current = null;
  };

  const visibleCountries = showAllCountries
    ? countryList
    : countryList.slice(0, 15);

  return (
    <>
      <Script
        id="model-viewer"
        type="module"
        src={MODEL_VIEWER_SRC}
        strategy="afterInteractive"
      />

      {showInitialContent && !animationDone && (
        <motion.main
          className={styles.container}
          initial={false}
          animate={isStarted ? { opacity: 0 } : { opacity: 1 }}
          transition={{ duration: 0.46, delay: isStarted ? 0.22 : 0 }}
        >
          <motion.section
            className={styles.heroWrap}
            animate={isStarted ? { scale: 2.65, y: 110 } : { scale: 1, y: 0 }}
            transition={{ duration: 0.58, ease: "easeInOut" }}
          >
            <img
              src={BG_IMG}
              alt=""
              className={styles.heroImage}
              draggable={false}
            />
            <div className={styles.heroBlur} />
            <div className={styles.heroBrightOverlay} />

            <div className={styles.tilesLayer} aria-hidden>
              <AnimatePresence mode="popLayout">
                {visibleIdxs.map((i) => {
                  const item = WORD_ASSETS[i];

                  return (
                    <MovingTile
                      key={`${item.key}-${i}`}
                      item={item}
                      index={i}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.section>

          <motion.section
            className={styles.content}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            animate={
              isStarted
                ? { y: 500, opacity: 0 }
                : { y: dragY, opacity: 1 }
            }
            transition={{ duration: isStarted ? 0.62 : 0.2, ease: "easeOut" }}
          >
            <div className={styles.dragHandle} aria-hidden />

            <img
              src={START_STUDY_IMG}
              alt="Abrody Study"
              className={styles.startStudyImage}
              draggable={false}
            />

            <h1 className={styles.title}>
              {tt("startpage.title", "Learn from what you see.")}
            </h1>

            <p className={styles.description}>
              {tt(
                "startpage.descriptionLine1",
                "Turn photos, objects, and 3D models"
              )}
              <br />
              {tt(
                "startpage.descriptionLine2",
                "into visual vocabulary and quick practice."
              )}
            </p>

            <button
              type="button"
              className={styles.getStartedButton}
              onClick={handleGetStarted}
            >
              <span className={styles.getStartedButtonText}>
                {tt("get_started", "Get Started")}
              </span>
            </button>
          </motion.section>
        </motion.main>
      )}

      <AnimatePresence>
        {showCountry && (
          <motion.div
            className={styles.modalBackground}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modalContainer}
              initial={{ y: 42, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 42, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.36, ease: "easeOut" }}
            >
              <div className={styles.containerCountry}>
                <div className={styles.overlay}>
                  <span className={styles.modalKicker}>
                    {step === 1
                      ? tt("country_of_origin", "Country of origin")
                      : tt("preferred_language", "Preferred language")}
                  </span>

                  <h2 className={styles.headerText}>
                    {tt("select_country_language", "Select country and language")}
                  </h2>

                  <p className={styles.modalLead}>
                    {step === 1
                      ? tt("select_country_prompt", "Choose your country first.")
                      : tt(
                          "select_language_prompt",
                          "Choose the language you want to learn with."
                        )}
                  </p>

                  <div className={styles.selectionWrapper}>
                    <AnimatePresence mode="wait">
                      {step === 1 && (
                        <motion.div
                          key="country"
                          className={styles.card}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          transition={{ duration: 0.24 }}
                        >
                          <h3 className={styles.label}>
                            {tt("country_of_origin", "Country of origin")}
                          </h3>

                          {selectedOriginCountry && (
                            <p className={styles.selectedText}>
                              {selectedOriginCountry}
                            </p>
                          )}

                          <div className={styles.scrollContainer}>
                            <div className={styles.flagsContainer}>
                              {visibleCountries.map((country, index) => {
                                const selected =
                                  selectedOriginCountry === country.name;

                                return (
                                  <button
                                    type="button"
                                    key={`${country.name}-${index}`}
                                    className={`${styles.flagButton} ${
                                      selected ? styles.flagButtonActive : ""
                                    }`}
                                    onClick={() =>
                                      setSelectedOriginCountry(country.name)
                                    }
                                  >
                                    <img
                                      src={getFlagSrc(country.flag)}
                                      alt={country.name}
                                      className={styles.flag}
                                      draggable={false}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <button
                            type="button"
                            className={styles.moreButton}
                            onClick={() => setShowAllCountries((prev) => !prev)}
                          >
                            <span className={styles.moreButtonText}>
                              {showAllCountries
                                ? tt("show_less", "Show less")
                                : tt("show_more", "Show more")}
                            </span>
                          </button>
                        </motion.div>
                      )}

                      {step === 2 && (
                        <motion.div
                          key="language"
                          className={styles.card}
                          initial={{ opacity: 0, x: 16 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -16 }}
                          transition={{ duration: 0.24 }}
                        >
                          <h3 className={styles.label}>
                            {tt("preferred_language", "Preferred language")}
                          </h3>

                          {selectedLanguage && (
                            <p className={styles.selectedText}>
                              {languages.find(
                                (lang) => lang.code === selectedLanguage
                              )?.name || ""}
                            </p>
                          )}

                          <div className={styles.scrollContainer}>
                            <div className={styles.flagsContainer}>
                              {languages.map((language) => {
                                const selected =
                                  selectedLanguage === language.code;

                                return (
                                  <button
                                    type="button"
                                    key={language.code}
                                    className={`${styles.flagButton} ${
                                      selected ? styles.flagButtonActive : ""
                                    }`}
                                    onClick={() =>
                                      setSelectedLanguage(language.code)
                                    }
                                  >
                                    <img
                                      src={language.flag}
                                      alt={language.name}
                                      className={styles.flag}
                                      draggable={false}
                                    />
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className={styles.modalActions}>
                      {step === 1 && (
                        <button
                          type="button"
                          className={styles.subtleBtn}
                          onClick={() => setStep(2)}
                          disabled={!selectedOriginCountry}
                        >
                          <span
                            className={`${styles.subtleText} ${
                              !selectedOriginCountry ? styles.textDisabled : ""
                            }`}
                          >
                            {selectedOriginCountry
                              ? tt("next", "Next")
                              : tt("select_country_prompt", "Select country")}
                          </span>
                        </button>
                      )}

                      {step === 2 && !selectedLanguage && (
                        <button
                          type="button"
                          className={`${styles.subtleBtn} ${
                            !showBackPromptCycle ? styles.subtleBtnDisabled : ""
                          }`}
                          onClick={() => {
                            if (showBackPromptCycle) setStep(1);
                          }}
                          disabled={!showBackPromptCycle}
                        >
                          <span
                            className={`${styles.subtleText} ${
                              !showBackPromptCycle ? styles.textDisabled : ""
                            }`}
                          >
                            {showBackPromptCycle
                              ? tt("back", "Back")
                              : tt("select_language_prompt", "Select language")}
                          </span>
                        </button>
                      )}

                      {step === 2 && selectedLanguage && (
                        <button
                          type="button"
                          className={styles.confirmButton}
                          onClick={handleConfirm}
                        >
                          <span className={styles.confirmButtonText}>
                            {tt("confirm", "Confirm")}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}