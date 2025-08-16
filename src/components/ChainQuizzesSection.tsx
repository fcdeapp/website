"use client";
import React from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import styles from "../styles/pages/Business.module.css";

/* ───────── Motion variants ───────── */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: "easeOut" },
  }),
};
const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.97 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08 + 0.12, duration: 0.5, ease: "easeOut" },
  }),
};

/* ───────────────────────── Data ───────────────────────── */
type CEFR = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
const LEVELS: CEFR[] = ["A1", "A2", "B1", "B2", "C1", "C2"];
const TIME_PER_WORD: Record<CEFR, number> = { A1: 6, A2: 5, B1: 4, B2: 3, C1: 2, C2: 1 };

type LangKey =
  | "en" | "fr" | "es" | "zh" | "ja" | "ko"
  | "ar" | "it" | "de" | "pt" | "hi" | "ru";

const LANGS: { key: LangKey; label: string }[] = [
  { key: "en", label: "English" },
  { key: "fr", label: "Français" },
  { key: "es", label: "Español" },
  { key: "zh", label: "中文" },
  { key: "ja", label: "日本語" },
  { key: "ko", label: "한국어" },
  { key: "ar", label: "العربية" },
  { key: "it", label: "Italiano" },
  { key: "de", label: "Deutsch" },
  { key: "pt", label: "Português" },
  { key: "hi", label: "हिन्दी" },
  { key: "ru", label: "Русский" },
];

const EXAMPLES: Record<LangKey, Record<CEFR, string>> = {
    en: {
      A1: "I like coffee in the morning.",
      A2: "She usually takes the bus to work after breakfast.",
      B1: "We decided to cancel the trip because the weather looked bad.",
      B2: "They negotiated better terms for us after comparing several proposals.",
      C1: "Her research substantially advances the field by revealing previously overlooked patterns.",
      C2: "The findings, while provisional, thoroughly challenge and reframe long-standing assumptions.",
    },
    fr: {
      A1: "Je bois du café le matin.",
      A2: "Elle prend souvent le bus pour aller au travail après le petit-déjeuner.",
      B1: "Nous avons décidé d'annuler le voyage parce que la météo s'annonçait mauvaise.",
      B2: "Ils ont négocié pour nous de meilleures conditions après avoir comparé plusieurs offres.",
      C1: "Ses recherches font progresser le domaine en mettant au jour des schémas jusque-là négligés.",
      C2: "Ces résultats, bien que provisoires, bousculent en profondeur des présupposés de longue date.",
    },
    es: {
      A1: "Me gusta el café por la mañana.",
      A2: "Ella suele tomar el autobús al trabajo después del desayuno.",
      B1: "Decidimos cancelar el viaje porque el clima se veía mal.",
      B2: "Negociaron mejores condiciones para nosotros tras comparar varias ofertas.",
      C1: "Su investigación impulsa el campo al revelar patrones antes pasados por alto.",
      C2: "Los hallazgos, aunque provisionales, cuestionan y reconfiguran supuestos arraigados.",
    },
    zh: {
      A1: "我早上喜欢喝咖啡。",
      A2: "她通常吃完早餐后坐公交车去上班。",
      B1: "因为天气不好，我们决定取消旅行。",
      B2: "他们在比较多份方案后为我们谈下了更好的条件。",
      C1: "她的研究通过揭示以往被忽视的模式，显著推进了该领域。",
      C2: "这些初步结论全面挑战并重塑了长期以来的既有假设。",
    },
    ja: {
      A1: "朝はコーヒーが好きです。",
      A2: "彼女は朝食のあと、たいていバスで会社に行きます。",
      B1: "天気が悪そうだったので、私たちは旅行を中止することにしました。",
      B2: "いくつかの提案を比較した結果、彼らは私たちに有利な条件を引き出しました。",
      C1: "彼女の研究は、見過ごされてきたパターンを明らかにすることで分野を大きく前進させています。",
      C2: "その知見は暫定的ながら、長年の前提を根本から揺さぶり再定義します。",
    },
    ko: {
      A1: "아침에 저는 커피를 좋아해요.",
      A2: "그녀는 보통 아침을 먹고 버스를 타고 출근해요.",
      B1: "날씨가 나빠 보였기 때문에 우리는 여행을 취소하기로 했어요.",
      B2: "여러 제안을 비교한 끝에 그들은 우리에게 더 유리한 조건을 이끌어냈어요.",
      C1: "그녀의 연구는 그동안 간과되던 패턴을 밝혀내며 분야를 크게 진전시킵니다.",
      C2: "이 발견은 잠정적이지만 오랜 가정을 근본적으로 재구성합니다.",
    },
    ar: {
      A1: "أحب القهوة في الصباح.",
      A2: "غالبًا ما تستقل الحافلة إلى العمل بعد الإفطار.",
      B1: "قررنا إلغاء الرحلة لأن الطقس بدا سيئًا.",
      B2: "بعد مقارنة عدة عروض، تفاوضوا على شروط أفضل لنا.",
      C1: "يدفع بحثُها المجال قدمًا بكشف أنماط كانت مُهمَلة من قبل.",
      C2: "تُعيد هذه النتائج، رغم أنها أولية، تشكيل افتراضات راسخة منذ زمن.",
    },
    it: {
      A1: "Mi piace il caffè al mattino.",
      A2: "Di solito dopo la colazione prende l'autobus per andare al lavoro.",
      B1: "Abbiamo deciso di cancellare il viaggio perché il meteo sembrava brutto.",
      B2: "Dopo aver confrontato varie proposte, hanno negoziato condizioni migliori per noi.",
      C1: "La sua ricerca fa avanzare il settore rivelando schemi finora trascurati.",
      C2: "I risultati, sebbene preliminari, mettono profondamente in discussione e ridefiniscono presupposti di lunga data.",
    },
    de: {
      A1: "Ich mag morgens Kaffee.",
      A2: "Sie fährt nach dem Frühstück meist mit dem Bus zur Arbeit.",
      B1: "Wir beschlossen, die Reise abzusagen, weil das Wetter schlecht aussah.",
      B2: "Nach dem Vergleich mehrerer Angebote handelten sie bessere Bedingungen für uns aus.",
      C1: "Ihre Forschung treibt das Fachgebiet voran, indem sie bislang übersehene Muster aufdeckt.",
      C2: "Die Ergebnisse, wenngleich vorläufig, stellen langjährige Annahmen grundlegend in Frage und ordnen sie neu.",
    },
    pt: {
      A1: "Eu gosto de café de manhã.",
      A2: "Ela costuma, após o café da manhã, pegar o ônibus para o trabalho.",
      B1: "Decidimos cancelar a viagem porque o tempo parecia ruim.",
      B2: "Depois de comparar várias propostas, negociaram condições melhores para nós.",
      C1: "A pesquisa dela avança a área ao revelar padrões antes negligenciados.",
      C2: "As conclusões, ainda preliminares, desafiam e reconfiguram pressupostos de longa data.",
    },
    hi: {
      A1: "मुझे सुबह कॉफ़ी पसंद है।",
      A2: "वह अक्सर नाश्ते के बाद बस से काम पर जाती है।",
      B1: "मौसम खराब लगने पर हमने यात्रा रद्द करने का फैसला किया।",
      B2: "कई प्रस्तावों की तुलना के बाद उन्होंने हमारे लिए बेहतर शर्तें तय कीं।",
      C1: "उसका शोध, पहले अनदेखे पैटर्न उजागर करके, क्षेत्र को काफ़ी आगे बढ़ाता है।",
      C2: "ये निष्कर्ष, भले ही प्रारंभिक हों, पुरानी धारणाओं को गहराई से चुनौती देकर पुनर्परिभाषित करते हैं।",
    },
    ru: {
      A1: "Мне нравится кофе по утрам.",
      A2: "После завтрака она обычно едет на работу на автобусе.",
      B1: "Мы решили отменить поездку, потому что погода обещала быть плохой.",
      B2: "Сравнив несколько предложений, они договорились о более выгодных условиях для нас.",
      C1: "Её исследование продвигает область, выявляя ранее упускаемые закономерности.",
      C2: "Эти, пусть и предварительные, выводы радикально пересматривают давние предпосылки.",
    },
  };  

/* ───────────────────────── Utils ───────────────────────── */
const isCJK = (lang: LangKey) => lang === "zh" || lang === "ja" || lang === "ko";

const tokenize = (s: string, lang: LangKey) => {
  if (isCJK(lang)) {
    // CJK: 한 줄로 띄어쓰기 없이 시각적 토큰화(문자 단위)
    return s.replace(/\s+/g, "").split("").filter(Boolean);
  }
  return s.trim().split(/\s+/);
};

const clean = (w: string) =>
  w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, "");

function buildDistractors(
  lang: LangKey,
  idx: number,
  level: CEFR,
  correctToken: string
): string[] {
  const pool: string[] = [];
  LEVELS.forEach((lv) => {
    if (lv === level) return;
    const toks = tokenize(EXAMPLES[lang][lv], lang);
    if (toks[idx]) pool.push(toks[idx]);
    if (toks[idx - 1]) pool.push(toks[idx - 1]);
    if (toks[idx + 1]) pool.push(toks[idx + 1]);
  });

  const uniq = Array.from(
    new Set(pool.filter((t) => clean(t).toLowerCase() !== clean(correctToken).toLowerCase()))
  );

  const fallbackMap: Record<LangKey, string[]> = {
    en: ["and", "with", "from", "on", "into", "about", "over", "before"],
    fr: ["et", "avec", "dans", "pour", "sur", "avant", "après", "chez"],
    es: ["y", "con", "de", "para", "en", "sobre", "antes", "después"],
    zh: ["在", "和", "到", "把", "对", "从", "给", "向"],
    ja: ["と", "に", "で", "から", "まで", "より", "へ", "を"],
    ko: ["그리고", "에서", "으로", "에게", "부터", "까지", "보다", "에"],
    ar: ["و", "من", "إلى", "على", "عن", "مع", "قبل", "بعد"],
    it: ["e", "con", "da", "di", "per", "su", "prima", "dopo"],
    de: ["und", "mit", "von", "zu", "für", "auf", "vor", "nach"],
    pt: ["e", "com", "de", "para", "em", "sobre", "antes", "depois"],
    hi: ["और", "से", "को", "में", "पर", "के", "तक", "बाद"],
    ru: ["и", "с", "к", "на", "для", "о", "до", "после"],
  };

  const fallback = fallbackMap[lang] || fallbackMap.en;
  const picks = uniq
    .slice(0, 6)
    .concat(fallback)
    .filter((w) => clean(w) && clean(w) !== clean(correctToken));

  const chosen: string[] = [];
  for (const w of picks) {
    if (!chosen.includes(w)) chosen.push(w);
    if (chosen.length >= 2) break;
  }
  return chosen.slice(0, 2);
}

/* ───────────────────────── Token Connector (SVG curve) ───────────────────────── */
function Connector({
  fromEl,
  toEl,
  host,
}: {
  fromEl: HTMLElement | null;
  toEl: HTMLElement | null;
  host: HTMLElement | null;
}) {
  const [path, setPath] = React.useState<string | null>(null);

  React.useLayoutEffect(() => {
    if (!fromEl || !toEl || !host) return;
    const fr = fromEl.getBoundingClientRect();
    const tr = toEl.getBoundingClientRect();
    const hr = host.getBoundingClientRect();

    const ax = fr.left + fr.width / 2 - hr.left;
    const bx = tr.left + tr.width / 2 - hr.left;
    const y = 12;               // 토큰 상단 근처
    const lift = -10;           // 위로 들어 올릴 정도(곡선 높이)

    const d = `M ${ax},${y} C ${ax},${y + lift} ${bx},${y + lift} ${bx},${y}`;
    setPath(d);
  }, [fromEl, toEl, host]);

  if (!path) return null;
  return (
    <svg className={styles.connectorSvg} aria-hidden>
      <motion.path
        d={path}
        className={styles.connectorPath}
        initial={{ pathLength: 0, opacity: 0.8 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ───────────────────────── Streaming sentence ───────────────────────── */
function StreamingSentence({
  sentence,
  lang,
  speed = 520,
}: {
  sentence: string;
  lang: LangKey;
  speed?: number;
}) {
  const tokens = React.useMemo(() => tokenize(sentence, lang), [sentence, lang]);
  const [showN, setShowN] = React.useState(0);
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const tokenRefs = React.useRef<(HTMLSpanElement | null)[]>([]);

  React.useEffect(() => {
    setShowN(0);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setShowN(Math.min(i, tokens.length));
      if (i >= tokens.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [sentence, lang, speed, tokens.length]);

  const lastFrom =
    showN >= 2 ? tokenRefs.current[showN - 2] ?? null : null;
  const lastTo =
    showN >= 2 ? tokenRefs.current[showN - 1] ?? null : null;

  return (
    <div className={styles.streamShell} ref={shellRef}>
      {/* 마지막 두 토큰을 연결하는 곡선 */}
      {showN >= 2 && (
        <Connector fromEl={lastFrom} toEl={lastTo} host={shellRef.current} />
      )}

      <div className={styles.streamBox}>
        {tokens.map((tk, i) => {
          const visible = i < showN;
          return (
            <span
              key={i}
              ref={(el) => { tokenRefs.current[i] = el; }}
              className={`${styles.token} ${visible ? styles.tokenIn : styles.tokenGhost}`}
            >
              {tk}
            </span>
          );
        })}
        {showN < tokens.length && <span className={styles.cursor} aria-hidden>▌</span>}
      </div>
    </div>
  );
}

/* ───────────────────────── Web Quiz (lightweight) ───────────────────────── */
function WebChainQuiz({
  lang,
  level,
  onClose,
}: {
  lang: LangKey;
  level: CEFR;
  onClose: () => void;
}) {
  const base = EXAMPLES[lang][level];
  const tokens = React.useMemo(() => tokenize(base, lang), [base, lang]);
  const startIndex = Math.min(2, Math.max(0, tokens.length - 1));
  const [i, setI] = React.useState(startIndex); // 3번째 토큰부터 선택
  const [assembled, setAssembled] = React.useState(
    tokens.slice(0, startIndex).join(isCJK(lang) ? "" : " ")
  );
  const [score, setScore] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [picked, setPicked] = React.useState<string | null>(null);
  const [timeLeft, setTimeLeft] = React.useState(TIME_PER_WORD[level]);
  const [round, setRound] = React.useState(0);

  React.useEffect(() => {
    const si = Math.min(2, Math.max(0, tokens.length - 1));
    setI(si);
    setAssembled(tokens.slice(0, Math.min(2, tokens.length)).join(isCJK(lang) ? "" : " "));
    setScore(0);
    setDone(false);
    setPicked(null);
    setTimeLeft(TIME_PER_WORD[level]);
    setRound(0);
  }, [lang, level, tokens]);

  React.useEffect(() => {
    if (done) return;
    setTimeLeft(TIME_PER_WORD[level]);
  }, [round, level, done]);

  React.useEffect(() => {
    if (done) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handlePick("__timeout__", false);
          return TIME_PER_WORD[level];
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-comments
  }, [round, done, level]);

  const correct = tokens[i] || "";
  const options = React.useMemo(() => {
    const ds = buildDistractors(lang, i, level, correct);
    const arr = [
      { text: correct, correct: true },
      { text: ds[0] || correct + "*", correct: false },
      { text: ds[1] || correct + "**", correct: false },
    ];
    // shuffle
    for (let k = arr.length - 1; k > 0; k--) {
      const r = Math.floor(Math.random() * (k + 1));
      [arr[k], arr[r]] = [arr[r], arr[k]];
    }
    return arr;
  }, [correct, lang, i, level]);

  function handlePick(txt: string, isCorrect: boolean) {
    if (picked) return;
    setPicked(txt);
    setTimeout(() => {
      // 실제 다음 정답 토큰을 체인에 붙임(시각적으로)
      const newAsm = (assembled + (isCJK(lang) ? "" : " ") + (tokens[i] || "")).trim();
      setAssembled(newAsm);
      if (isCorrect) setScore((s) => s + 1);

      const next = i + 1;
      if (next >= tokens.length) {
        setDone(true);
        return;
      }
      setI(next);
      setPicked(null);
      setRound((r) => r + 1);
    }, 320);
  }

  return (
    <div className={styles.quizBox}>
      <div className={styles.quizHeader}>
        <div className={styles.wordBar}>
          <span className={styles.wordLead}>Next word</span>
          <div className={styles.timerWrap}>
            <div className={styles.timerBg}>
              <div
                className={styles.timerFill}
                style={{ width: `${(timeLeft / TIME_PER_WORD[level]) * 100}%` }}
              />
            </div>
            <span className={styles.timerText}>{timeLeft}s</span>
          </div>
          <div className={styles.scorePill}>
            {score} / {Math.max(1, tokens.length - Math.min(2, tokens.length))}
          </div>
        </div>
        <div className={styles.assembledLine}>
          <span className={styles.assembledLabel}>Sentence</span>
          <span className={styles.assembledText}>
            {assembled}
            {i < tokens.length ? (isCJK(lang) ? "" : " ") : ""}
            {i < tokens.length ? "…" : ""}
          </span>
        </div>
      </div>

      {!done ? (
        <div className={styles.optionsGrid}>
          {options.map((op, idx) => {
            const selected = picked === op.text;
            const wrongSelected = selected && !op.correct && picked !== "__timeout__";
            const showTick = !!picked && op.correct;
            const showAnswerHint = wrongSelected; // 틀리면 정답 힌트 노출
            return (
              <button
                key={idx}
                className={[
                  styles.optCard,
                  selected && op.correct ? styles.optCardCorrect : "",
                  wrongSelected ? styles.optCardWrong : "",
                ].join(" ")}
                onClick={() => handlePick(op.text, !!op.correct)}
                disabled={!!picked}
              >
                <span className={styles.optText}>{op.text}</span>
                <div className={styles.optMeta}>
                  {showTick && <span className={styles.tick}>✓</span>}
                  {wrongSelected && <span className={styles.cross}>✕</span>}
                  {showAnswerHint && (
                    <span className={styles.suggestionPill}>
                      Answer: <span className={styles.suggestionText}>{correct}</span>
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className={styles.summaryCard}>
          <h4 className={styles.summaryTitle}>Result</h4>
          <p className={styles.summaryLine}>Score: {score}</p>
          <div className={styles.summaryActions}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Main Section ───────────────────────── */
export function ChainQuizzesSection() {
  const [lang, setLang] = React.useState<LangKey>("en");
  const [level, setLevel] = React.useState<CEFR>("B1");
  const [showQuiz, setShowQuiz] = React.useState(false);

  const currentSentence = React.useMemo(() => EXAMPLES[lang][level], [lang, level]);

  return (
    <section id="chain-quizzes" className={styles.sectionAlt}>
      <motion.h2
        className={styles.sectionTitle}
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        Chain Quizzes
      </motion.h2>

      <motion.p
        className={styles.chainLead}
        variants={fadeUp}
        custom={1}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        Learn exactly the way LLMs do — by predicting the <em>next token</em>.
        We stream real sentences and ask your brain to complete them step by step, building a fluent chain.
      </motion.p>

      {/* Language selector */}
      <motion.div
        className={styles.langBar}
        variants={fadeUp}
        custom={2}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.45 }}
      >
        {LANGS.map((l) => (
          <button
            key={l.key}
            className={`${styles.langChip} ${lang === l.key ? styles.langChipActive : ""}`}
            onClick={() => {
              setLang(l.key);
              // 선택만 바꾸고 스테이지는 유지(크로스페이드로 자연 전환)
            }}
            dir={l.key === "ar" ? "rtl" : "ltr"}
          >
            {l.label}
          </button>
        ))}
      </motion.div>

      {/* Difficulty selector (퀴즈 시간도 연동) */}
      <motion.div
        className={styles.levelBar}
        variants={fadeUp}
        custom={3}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        <span className={styles.levelLabel}>Difficulty</span>
        <div className={styles.levelChips}>
          {LEVELS.map((lv) => (
            <button
              key={lv}
              className={`${styles.levelChip} ${level === lv ? styles.levelChipActive : ""}`}
              onClick={() => setLevel(lv)}
            >
              {lv} <span className={styles.levelTime}>{TIME_PER_WORD[lv]}s/word</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Single streaming sentence (cross-fade on lang/level change) */}
      <div className={styles.streamStage}>
        <AnimatePresence mode="popLayout">
          <motion.article
            key={`${lang}-${level}`}
            className={styles.streamCard}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            dir={lang === "ar" ? "rtl" : "ltr"}
          >
            <div className={styles.levelPill}>{level}</div>
            <StreamingSentence sentence={currentSentence} lang={lang} />
          </motion.article>
        </AnimatePresence>
      </div>

      <motion.p
        className={styles.chainNote}
        variants={fadeUp}
        custom={4}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        Your mind can learn this way too. Predict one word at a time, lock it in, and let the chain grow into a sentence — then into fluent speech.
      </motion.p>

      <motion.div
        className={styles.ctaRow}
        variants={fadeUp}
        custom={5}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
      >
        {!showQuiz ? (
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={() => setShowQuiz(true)}>
            Try it
          </button>
        ) : (
          <button className={`${styles.btn} ${styles.btnGhost}`} onClick={() => setShowQuiz(false)}>
            Reset
          </button>
        )}
      </motion.div>

      {showQuiz && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          <WebChainQuiz lang={lang} level={level} onClose={() => setShowQuiz(false)} />
        </motion.div>
      )}
    </section>
  );
}

/* Default export so page can `import ChainQuizzesSection from ".../ChainQuizzesSection"` */
export default ChainQuizzesSection;
