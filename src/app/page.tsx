"use client";

import Head from "next/head";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { Box, Volume2, X } from "lucide-react";
import styles from "../styles/Home.module.css";
import WebFooter from "../components/WebFooter";

type IVItem = {
  label: string;
  meaning: string;
  description: string;
  examples: string[];
  src: string;
  modelSrc: string;
};
type DownloadLink = { label: string; href: string };
type Preview =
  | { kind: "model"; word: IVItem }
  | { kind: "screen"; src: string; title: string };

const WORDS: IVItem[] = [
  {
    label: "hot-air balloon",
    meaning: "열기구",
    description:
      "A large balloon filled with hot air that carries people in a basket through the sky.",
    examples: [
      "The hot-air balloon rose slowly over the field.",
      "We saw a colorful hot-air balloon at sunrise.",
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

const IOS_LINKS: DownloadLink[] = [
  { label: "Canada", href: "https://apps.apple.com/ca/app/id6743047157" },
  { label: "Australia", href: "https://apps.apple.com/au/app/id6743047157" },
  { label: "UK", href: "https://apps.apple.com/gb/app/id6743047157" },
  { label: "Korea", href: "https://apps.apple.com/kr/app/id6743047157" },
];

const ANDROID_LINK =
  "https://play.google.com/store/apps/details?id=com.fcdeapp.facade";

const SCREENS = [
  {
    title: "A little learning, every day.",
    caption: "Lessons and short quizzes, together in one place.",
    src: "/journey/AppStoreImageiPhoneEN2605011.jpg",
  },
  {
    title: "Keep the words you find.",
    caption: "Build a vocabulary collection from your own photos.",
    src: "/journey/AppStoreImageiPhoneEN2605012.jpg",
  },
  {
    title: "Look a little closer.",
    caption: "Explore selected objects in 3D, from every angle.",
    src: "/journey/AppStoreImageiPhoneEN2605013.jpg",
  },
];

function ModelPreview({ word }: { word: IVItem }) {
  const viewerRef = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const ready = () => {
      window.clearTimeout(timeout);
      setStatus("ready");
    };
    const failed = () => {
      window.clearTimeout(timeout);
      setStatus("error");
    };
    // Report a stalled network request instead of leaving an endless spinner.
    const timeout = window.setTimeout(failed, 30000);
    viewer.addEventListener("load", ready);
    viewer.addEventListener("error", failed);
    let script = document.querySelector<HTMLScriptElement>(
      'script[data-model-viewer="true"]',
    );
    if (!window.customElements.get("model-viewer")) {
      if (script?.dataset.failed === "true") {
        script.remove();
        script = null;
      }
      if (!script) {
        script = document.createElement("script");
        script.type = "module";
        script.src =
          "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
        script.dataset.modelViewer = "true";
        document.head.appendChild(script);
      }
    }
    const scriptFailed = () => {
      if (script) script.dataset.failed = "true";
      failed();
    };
    script?.addEventListener("error", scriptFailed);
    if ((viewer as HTMLElement & { loaded?: boolean }).loaded) ready();
    return () => {
      window.clearTimeout(timeout);
      viewer.removeEventListener("load", ready);
      viewer.removeEventListener("error", failed);
      script?.removeEventListener("error", scriptFailed);
    };
  }, []);

  return (
    <div className={styles.modelStage}>
      {status !== "error" &&
        React.createElement("model-viewer", {
          ref: viewerRef,
          src: word.modelSrc,
          alt: `Interactive 3D model of ${word.label}`,
          "camera-controls": true,
          "touch-action": "pan-y",
          "interaction-prompt": "none",
          exposure: "1",
          className: styles.modelViewer,
        })}
      {status === "loading" && (
        <p className={styles.modelStatus} role="status">
          Loading 3D model…
        </p>
      )}
      {status === "error" && (
        <div className={styles.modelFallback}>
          <Image
            src={word.src}
            alt={word.label}
            width={400}
            height={400}
            unoptimized
          />
          <p role="status">
            The 3D preview couldn’t load. Close and reopen it to try again.
          </p>
        </div>
      )}
      {status === "ready" && (
        <p className={styles.modelHint}>
          Drag to rotate · Scroll or pinch to zoom
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const [selectedIndex, setSelectedIndex] = useState(1);
  const [quiz, setQuiz] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [canSpeak, setCanSpeak] = useState(false);
  const [speechError, setSpeechError] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const word = WORDS[selectedIndex];

  useEffect(() => {
    setCanSpeak(
      "speechSynthesis" in window && "SpeechSynthesisUtterance" in window,
    );
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    if (!preview) return;
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [preview]);

  function selectWord(index: number) {
    setSelectedIndex(index);
    setAnswer(null);
    setSpeechError("");
    if (canSpeak) window.speechSynthesis.cancel();
  }

  function pronounce() {
    if (!canSpeak) return;
    setSpeechError("");
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word.label);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.onerror = (event) => {
      if (event.error !== "interrupted" && event.error !== "canceled") {
        setSpeechError("Audio is unavailable in this browser.");
      }
    };
    window.speechSynthesis.speak(utterance);
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
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Visual language learning</p>
            <h1 id="home-title">
              Learn the words
              <br />
              around you.
            </h1>
            <p className={styles.heroText}>
              A bowl on the table. A pair of shoes by the door. Turn the things
              around you into words you’ll remember.
            </p>
            <div className={styles.heroActions}>
              <a className={styles.primaryButton} href="#download">
                Get Abrody
              </a>
              <a className={styles.textLink} href="#how">
                How it works
              </a>
            </div>
            <p className={styles.platformNote}>For iOS and Android</p>
          </div>

          <div
            className={styles.demo}
            id="product"
            aria-label="Interactive vocabulary sample"
          >
            <div className={styles.objectStage}>
              <Image
                key={word.src}
                src={word.src}
                alt={quiz ? word.description : word.label}
                fill
                sizes="(max-width: 760px) 90vw, 520px"
                unoptimized
                priority={selectedIndex === 1}
                className={styles.objectImage}
              />
              {!quiz && (
                <button
                  type="button"
                  className={styles.modelButton}
                  onClick={() => setPreview({ kind: "model", word })}
                >
                  <Box size={17} aria-hidden="true" /> Explore in 3D
                </button>
              )}
            </div>
            <div
              className={styles.wordPicker}
              role="group"
              aria-label="Choose an object"
            >
              {WORDS.map((item, index) => (
                <button
                  key={item.src}
                  type="button"
                  aria-label={quiz ? `Sample object ${index + 1}` : item.label}
                  aria-pressed={index === selectedIndex}
                  onClick={() => selectWord(index)}
                >
                  <Image
                    src={item.src}
                    alt=""
                    width={56}
                    height={56}
                    unoptimized
                  />
                </button>
              ))}
            </div>
            <div className={styles.wordDetails}>
              {quiz ? (
                <div className={styles.quiz}>
                  <p className={styles.detailLabel}>A QUICK RECALL</p>
                  <h2>What do you see?</h2>
                  <div className={styles.answers}>
                    {WORDS.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        aria-pressed={answer === item.label}
                        data-correct={
                          answer === item.label && answer === word.label
                        }
                        onClick={() => setAnswer(item.label)}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <p className={styles.feedback} role="status">
                    {answer
                      ? answer === word.label
                        ? `That’s it. ${word.label} — ${word.meaning}.`
                        : "Not quite. Take another look."
                      : "Choose the word that matches the image."}
                  </p>
                </div>
              ) : (
                <div
                  key={word.label}
                  className={styles.wordEntry}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className={styles.wordHeading}>
                    <h2>{word.label}</h2>
                    {canSpeak && (
                      <button
                        type="button"
                        className={styles.audioButton}
                        onClick={pronounce}
                        aria-label={`Hear ${word.label} in English`}
                      >
                        <Volume2 size={22} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <p className={styles.translation}>
                    <span lang="ko">{word.meaning}</span>
                    <span>noun · English</span>
                  </p>
                  <p className={styles.example}>{word.examples[0]}</p>
                  {speechError && (
                    <p role="status" className={styles.speechError}>
                      {speechError}
                    </p>
                  )}
                </div>
              )}
              <div className={styles.demoBottom}>
                <span>Sample vocabulary</span>
                <button
                  type="button"
                  className={styles.textLink}
                  onClick={() => {
                    setQuiz(!quiz);
                    setAnswer(null);
                    if (canSpeak) window.speechSynthesis.cancel();
                  }}
                >
                  {quiz ? "Back to the word" : "Test your memory"}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.how} id="how" aria-labelledby="how-title">
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>From seeing to remembering</p>
            <h2 id="how-title">
              Start with something
              <br />
              you already know.
            </h2>
          </div>
          <div className={styles.steps}>
            <article>
              <h3>Take a photo.</h3>
              <p>
                Your morning coffee, your desk, the view outside. Start with a
                moment from your day.
              </p>
            </article>
            <article>
              <h3>Find the words.</h3>
              <p>
                Explore objects in your photo, learn their meanings, and see how
                to use them in a sentence.
              </p>
            </article>
            <article>
              <h3>Come back to them.</h3>
              <p>
                Save your vocabulary and revisit it in short quizzes. A few
                words at a time.
              </p>
            </article>
          </div>
        </section>

        <section className={styles.appSection} aria-labelledby="app-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Inside Abrody</p>
              <h2 id="app-title">See it. Keep it. Use it.</h2>
            </div>
            <p>
              Your photos become a collection
              <br />
              of things you can say.
            </p>
          </div>
          <div className={styles.screens}>
            {SCREENS.map((screen) => (
              <figure key={screen.src}>
                <button
                  type="button"
                  className={styles.screenButton}
                  onClick={() =>
                    setPreview({
                      kind: "screen",
                      src: screen.src,
                      title: screen.title,
                    })
                  }
                  aria-label={`Enlarge app screenshot: ${screen.title}`}
                >
                  <Image
                    src={screen.src}
                    alt={screen.title}
                    width={1290}
                    height={2796}
                    unoptimized
                    loading="lazy"
                  />
                  <span>View screen</span>
                </button>
                <figcaption>
                  <h3>{screen.title}</h3>
                  <p>{screen.caption}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section
          className={styles.download}
          id="download"
          aria-labelledby="download-title"
        >
          <div>
            <p className={styles.eyebrow}>Take it with you</p>
            <h2 id="download-title">
              Learn wherever
              <br />
              you are.
            </h2>
            <p>Available on iPhone, iPad, and Android.</p>
          </div>
          <div className={styles.stores}>
            <div className={styles.storeRow}>
              <h3>iPhone & iPad</h3>
              <p>Choose your App Store</p>
              <div className={styles.countryLinks}>
                {IOS_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            <div className={styles.storeRow}>
              <h3>Android</h3>
              <a
                className={styles.primaryButton}
                href={ANDROID_LINK}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get it on Google Play
              </a>
            </div>
          </div>
        </section>
      </div>
      <WebFooter />
      {preview && (
        <dialog
          ref={dialogRef}
          className={`${styles.dialog} ${preview.kind === "screen" ? styles.screenDialog : ""}`}
          aria-labelledby="preview-title"
          onClose={(event) => {
            if (!event.currentTarget.open) setPreview(null);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setPreview(null);
          }}
        >
          <div className={styles.dialogBody}>
            <div className={styles.dialogHeading}>
              <h2 id="preview-title">
                {preview.kind === "model" ? preview.word.label : preview.title}
              </h2>
              <button
                type="button"
                autoFocus
                className={styles.closeButton}
                onClick={() => setPreview(null)}
                aria-label="Close preview"
              >
                <X size={23} aria-hidden="true" />
              </button>
            </div>
            {preview.kind === "model" ? (
              <ModelPreview key={preview.word.modelSrc} word={preview.word} />
            ) : (
              <Image
                className={styles.fullScreen}
                src={preview.src}
                alt={preview.title}
                width={1290}
                height={2796}
                unoptimized
              />
            )}
          </div>
        </dialog>
      )}
    </>
  );
}
