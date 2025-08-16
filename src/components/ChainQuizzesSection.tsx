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
      A1: "I drink coffee every morning.",
      A2: "She usually takes the bus to work after breakfast.",
      B1: "We decided to cancel the trip because the forecast looked terrible.",
      B2: "After comparing several proposals, they managed to negotiate better terms for us.",
      C1: "Her recent research significantly advances the field by identifying previously overlooked patterns.",
      C2: "The provisional findings rigorously challenge long-standing assumptions and compel a thorough reevaluation of established theories.",
    },
    fr: {
      A1: "Je bois du café tous les matins.",
      A2: "Après le petit-déjeuner, elle prend généralement le bus pour aller au travail.",
      B1: "Nous avons décidé d’annuler le voyage parce que les prévisions annonçaient du mauvais temps.",
      B2: "Après avoir comparé plusieurs offres, ils ont réussi à négocier de meilleures conditions pour nous.",
      C1: "Ses recherches font progresser le domaine en révélant des schémas jusque-là négligés.",
      C2: "Ces résultats provisoires remettent en cause des hypothèses anciennes et imposent une redéfinition en profondeur.",
    },
    es: {
      A1: "Bebo café todas las mañanas.",
      A2: "Después del desayuno, ella suele ir al trabajo en autobús.",
      B1: "Decidimos cancelar el viaje porque el pronóstico anunciaba mal tiempo.",
      B2: "Tras comparar varias propuestas, lograron negociar condiciones más favorables para nosotros.",
      C1: "Su investigación impulsa el campo al descubrir patrones que antes se habían pasado por alto.",
      C2: "Los resultados provisionales cuestionan rigurosamente supuestos arraigados y obligan a replantearlos por completo.",
    },
    zh: {
      A1: "我每天早上都喝咖啡。",
      A2: "她通常吃完早餐后坐公交车去上班。",
      B1: "因为天气预报不好，我们决定取消旅行。",
      B2: "他们在比较多个方案后，为我们谈下了更有利的条件。",
      C1: "她的研究通过揭示以往被忽视的模式，显著推动了该领域的发展。",
      C2: "这些初步结论严格地挑战长期以来的假设，并迫使我们重新审视既有理论。",
    },
    ja: {
      A1: "毎朝コーヒーを飲みます。",
      A2: "彼女は朝食のあと、たいていバスで会社に行きます。",
      B1: "天気予報が悪かったので、私たちは旅行を中止することにしました。",
      B2: "いくつかの提案を比較した結果、彼らは私たちに有利な条件を引き出しました。",
      C1: "彼女の研究は、見過ごされてきたパターンを明らかにすることで分野を大きく前進させています。",
      C2: "その暫定的な知見は、長年の前提を根本から揺さぶり、再定義を迫ります。",
    },
    ko: {
      A1: "저는 매일 아침 커피를 마셔요.",
      A2: "그녀는 보통 아침을 먹고 버스를 타고 출근해요.",
      B1: "날씨 예보가 좋지 않아서 우리는 여행을 취소하기로 했어요.",
      B2: "여러 제안을 비교한 끝에 그들은 우리에게 더 유리한 조건을 끌어냈어요.",
      C1: "그녀의 연구는 그동안 간과되던 패턴을 밝혀내며 학문 분야를 크게 진전시킵니다.",
      C2: "이 잠정적인 발견은 오랫동안 굳어져 있던 가정을 철저히 재검토하고 근본적으로 재구성합니다.",
    },
    ar: {
      A1: "أشرب القهوة كل صباح.",
      A2: "بعد الإفطار، غالبًا ما تستقلّ الحافلة إلى العمل.",
      B1: "قررنا إلغاء الرحلة لأنّ النشرة الجوية كانت سيئة.",
      B2: "بعد مقارنة عدة عروض، نجحوا في التفاوض على شروط أفضل لنا.",
      C1: "يدفع بحثُها المجال قُدُمًا بكشف أنماطٍ كانت مُهمَلة من قبل.",
      C2: "تعيد هذه النتائج الأولية، رغم كونها مؤقتة، صياغة افتراضات راسخة منذ زمن طويل.",
    },
    it: {
      A1: "Bevo caffè ogni mattina.",
      A2: "Dopo la colazione prende di solito l’autobus per andare al lavoro.",
      B1: "Abbiamo deciso di cancellare il viaggio perché le previsioni del tempo erano brutte.",
      B2: "Dopo aver confrontato varie proposte, sono riusciti a negoziare condizioni migliori per noi.",
      C1: "La sua ricerca fa progredire il settore mettendo in luce schemi finora trascurati.",
      C2: "I risultati provvisori mettono in discussione presupposti di lunga data e li ridefiniscono a fondo.",
    },
    de: {
      A1: "Ich trinke jeden Morgen Kaffee.",
      A2: "Nach dem Frühstück fährt sie meistens mit dem Bus zur Arbeit.",
      B1: "Wir beschlossen, die Reise abzusagen, weil die Wettervorhersage schlecht war.",
      B2: "Nach dem Vergleich mehrerer Angebote handelten sie für uns bessere Konditionen aus.",
      C1: "Ihre Forschung treibt das Fachgebiet voran, indem sie bislang übersehene Muster sichtbar macht.",
      C2: "Die vorläufigen Ergebnisse stellen langjährige Annahmen ernsthaft infrage und ordnen sie neu.",
    },
    pt: {
      A1: "Eu tomo café todas as manhãs.",
      A2: "Depois do café da manhã, ela geralmente pega o ônibus para o trabalho.",
      B1: "Decidimos cancelar a viagem porque a previsão do tempo era ruim.",
      B2: "Após comparar várias propostas, conseguiram negociar condições melhores para nós.",
      C1: "A pesquisa dela faz a área avançar ao revelar padrões antes negligenciados.",
      C2: "Os resultados provisórios questionam pressupostos antigos e os redefinem de forma profunda.",
    },
    hi: {
      A1: "मैं हर सुबह कॉफ़ी पीता हूँ।",
      A2: "नाश्ते के बाद वह आमतौर पर बस से काम पर जाती है।",
      B1: "मौसम का पूर्वानुमान खराब था, इसलिए हमने यात्रा रद्द करने का फैसला किया।",
      B2: "कई प्रस्तावों की तुलना करने के बाद उन्होंने हमारे लिए बेहतर शर्तें तय कीं।",
      C1: "उसका शोध पहले अनदेखे पैटर्न उजागर करके इस क्षेत्र को काफी आगे बढ़ाता है।",
      C2: "ये प्रारंभिक निष्कर्ष पुरानी धारणाओं को गहराई से चुनौती देकर उन्हें नए सिरे से परिभाषित करते हैं।",
    },
    ru: {
      A1: "Я каждое утро пью кофе.",
      A2: "После завтрака она обычно едет на работу на автобусе.",
      B1: "Мы решили отменить поездку, потому что прогноз погоды был плохим.",
      B2: "Сравнив несколько предложений, они добились для нас более выгодных условий.",
      C1: "Её исследование продвигает область, выявляя ранее упускаемые закономерности.",
      C2: "Эти предварительные выводы серьёзно пересматривают давние предпосылки и переосмысливают их.",
    },
  };  

/* ───────────────────────── Utils ───────────────────────── */
const isCJK = (lang: LangKey) => lang === "zh" || lang === "ja";

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

/* Connector — replace existing implementation with this */
function Connector({
    fromEl,
    toEl,
    host,
  }: {
    fromEl: HTMLElement | null;
    toEl: HTMLElement | null;
    host: HTMLElement | null;
  }) {
    const gid = React.useId();
    const [path, setPath] = React.useState<string | null>(null);
    const [grad, setGrad] = React.useState<{ x1:number;y1:number;x2:number;y2:number } | null>(null);
    const [alive, setAlive] = React.useState(true);
  
    React.useLayoutEffect(() => {
      if (!fromEl || !toEl || !host) {
        setPath(null);
        setGrad(null);
        setAlive(false);
        return;
      }
      const fr = fromEl.getBoundingClientRect();
      const tr = toEl.getBoundingClientRect();
      const hr = host.getBoundingClientRect();
  
      const ax = fr.left + fr.width / 2 - hr.left;
      const ay = fr.top - hr.top + 6;   // token top + 6px offset (값은 취향대로 조정)
      const bx = tr.left + tr.width / 2 - hr.left;
      const by = tr.top - hr.top + 6;   // token top + 6px offset
  
      // arch lift scales with vertical distance
      const lift = -Math.max(14, Math.abs(by - ay) * 0.4);
  
      const d = `M ${ax},${ay} C ${ax},${ay + lift} ${bx},${by + lift} ${bx},${by}`;
      setPath(d);
  
      // 그라디언트: 정상(시작->끝) 방향으로 설정 (ax->bx)
      setGrad({ x1: ax, y1: ay, x2: bx, y2: by });
  
      // new path 생성 시 다시 보이게
      setAlive(true);
    }, [fromEl, toEl, host]);
  
    if (!path || !alive) return null;
  
    return (
      <motion.svg
        className={styles.connectorSvg}
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ pointerEvents: "none" }}
      >
        <defs>
          <linearGradient
            id={`chainGrad-${gid}`}
            gradientUnits="userSpaceOnUse"
            x1={grad?.x1 ?? 0} y1={grad?.y1 ?? 0}
            x2={grad?.x2 ?? 0} y2={grad?.y2 ?? 0}
          >
            {/* stop 순서는 그대로 (색상 흐름이 ax -> bx 쪽으로 보이게 됨) */}
            <stop offset="0%" stopColor="#f2542d" />
            <stop offset="100%" stopColor="#d8315b" />
          </linearGradient>
        </defs>
  
        {/* 은은한 베이스 라인 */}
        <motion.path d={path} className={styles.connectorBase} />
  
        {/* 하이라이트: pathOffset을 0 → 1으로 애니메이트 (정방향) */}
        <motion.path
          key={`hl-${path}`} // path가 바뀔 때마다 재생되도록
          d={path}
          className={styles.connectorHighlight}
          stroke={`url(#chainGrad-${gid})`}
          initial={{ pathLength: 0.32, pathOffset: 0, opacity: 1 }}
          animate={{
            pathLength: 0.32,
            pathOffset: 1,          // <-- 진행 방향: 0 -> 1
            opacity: [1, 1, 0],     // 끝에 페이드아웃
          }}
          transition={{
            duration: 0.8,
            ease: "easeInOut",
            opacity: { duration: 0.12, ease: "easeOut", delay: 0.7 },
          }}
          onAnimationComplete={() => setAlive(false)} // 끝나면 SVG 제거
        />
      </motion.svg>
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
    const [indicatorPos, setIndicatorPos] = React.useState<{ x: number; y: number } | null>(null);
  
    React.useEffect(() => {
      setShowN(0);
      let i = 0;
      const timer = setInterval(() => {
        i++;
        setShowN((prev) => {
          const next = Math.min(i, tokens.length);
          return next;
        });
        if (i >= tokens.length) clearInterval(timer);
      }, speed);
      return () => clearInterval(timer);
    }, [sentence, lang, speed, tokens.length]);
  
    // showN이 바뀔 때 마지막 토큰 위치를 계산해서 인디케이터 이동
    React.useLayoutEffect(() => {
      const hr = shellRef.current;
      if (!hr) {
        setIndicatorPos(null);
        return;
      }
      const idx = Math.min(Math.max(showN - 1, 0), tokens.length - 1);
      const el = tokenRefs.current[idx] ?? null;
      if (!el || showN === 0) {
        setIndicatorPos(null);
        return;
      }
      const er = el.getBoundingClientRect();
      const hrRect = hr.getBoundingClientRect();
      const cx = er.left + er.width / 2 - hrRect.left;
      const cy = er.top + er.height / 2 - hrRect.top;
      setIndicatorPos({ x: Math.round(cx), y: Math.round(cy) });
    }, [showN, tokens.length]);
  
    const lastIdx = showN - 1;
  
    return (
      <div className={styles.streamShell} ref={shellRef}>
        {showN >= 2 &&
        tokenRefs.current.slice(0, showN - 1).map((fromEl, idx) => (
            <Connector
            key={`conn-${idx}-${showN}`}
            fromEl={fromEl}
            toEl={tokenRefs.current[lastIdx] ?? null}
            host={shellRef.current}
            />
        ))}
    
    <motion.div
    className={styles.streamIndicator}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{
        opacity: indicatorPos ? 1 : 0,
        left: indicatorPos ? indicatorPos.x : 0,
        top: indicatorPos ? indicatorPos.y - 6 : 0,
        scale: indicatorPos ? 1 : 0.9,
    }}
    transition={{ type: "spring", stiffness: 280, damping: 26 }}
    aria-hidden
    >
    <span className={styles.scanHalo} />
    </motion.div>
  
  <div className={styles.streamBoxFrame}>
    <div className={styles.streamBox}>
        {tokens.map((tk, i) => {
        const visible = i < showN;
        const isActive = visible && i === showN - 1;
        return (
            <span
            key={i}
            ref={(el) => { tokenRefs.current[i] = el; }}
            className={[
                styles.token,
                visible ? styles.tokenIn : styles.tokenGhost,
                isActive ? styles.tokenActive : ""
            ].join(" ")}
            >
            {tk}
            </span>
        );
        })}
    </div>
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
  const rafRef = React.useRef<number | null>(null);
  const deadlineRef = React.useRef<number>(0);
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
    const dur = TIME_PER_WORD[level] * 1000;
    deadlineRef.current = performance.now() + dur;
    setTimeLeft(TIME_PER_WORD[level]); // 숫자 표기 초기화
  }, [round, level, done]);

  React.useEffect(() => {
    if (done) return;
  
    const tick = (t: number) => {
      const msLeft = Math.max(0, deadlineRef.current - t);
      const secLeft = msLeft / 1000;
      setTimeLeft(secLeft);
  
      if (msLeft <= 0) {
        handlePick("__timeout__", false);
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
  
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [round, level, done]);

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
                style={{
                    width: `${Math.max(0, Math.min(1, timeLeft / TIME_PER_WORD[level])) * 100}%`,
                }}
                />
            </div>
            <span className={styles.timerText}>{Math.ceil(timeLeft)}s</span>
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
  const [level, setLevel] = React.useState<CEFR>("B2");
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

    {/* 변경: 버튼이 언어 칩과 같은 스타일이 되도록, 선택된 항목에만 시간 노출 */}
    <div className={styles.levelChips}>
        {LEVELS.map((lv) => (
        <button
            key={lv}
            role="radio"
            aria-checked={level === lv}
            className={`${styles.levelChip} ${level === lv ? styles.levelChipActive : ""}`}
            onClick={() => setLevel(lv)}
        >
            <span className={styles.levelShort}>{lv}</span>
            {/* 시간은 선택된 항목에서만 렌더 */}
            {level === lv && (
            <span className={styles.levelTime}>
                {TIME_PER_WORD[lv]}s/word
            </span>
            )}
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
