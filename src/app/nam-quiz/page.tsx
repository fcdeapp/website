"use client";

import { FormEvent, KeyboardEvent, ReactNode, useMemo, useState } from "react";
import styles from "./NamQuiz.module.css";

type QuizItem = {
  id: number;
  text: string;
  keyTerms: string[];
};

type Mode = "typing" | "blank" | "order" | "flashcard";

const QUIZ_ITEMS: QuizItem[] = [
  {
    id: 1,
    text: '내가 응하려는 문제는 "가장 높은 경지를 바라는 마음은 어떻게 그 경지에 이르는 일을 스스로 가로막는가"이다.',
    keyTerms: ["문제", "가장 높은 경지", "스스로 가로막는가"],
  },
  {
    id: 2,
    text: "허균은 「남궁선생전」에서 이 물음을, 임피의 선비 남궁두가 첩과 당질을 죽이고 도망자가 되었다가 산중에서 장로를 만나 도가 수련에 들었으나 끝내 신선의 문턱에서 좌절하는 일생으로 풀어낸다.",
    keyTerms: ["허균", "남궁선생전", "남궁두", "장로", "신선의 문턱"],
  },
  {
    id: 3,
    text: "나는 남궁두를 무너뜨린 것이 재능의 부족도 식색(食色) 같은 낮은 욕망도 아니라 완성을 향한 조급함이고, 허균이 끝에 내세우는 '인(忍)'은 그 조급함을 늦추는 규율이라고 본다.",
    keyTerms: ["재능의 부족", "식색(食色)", "완성을 향한 조급함", "인(忍)", "규율"],
  },
  {
    id: 4,
    text: "더 정확히 말하면, 허균이 가르는 것은 높은 경지를 향한 의지 자체가 아니라 그 의지가 '지금 당장 이루려는 마음'으로 변질되는 순간이다.",
    keyTerms: ["높은 경지를 향한 의지", "지금 당장 이루려는 마음", "변질"],
  },
  {
    id: 5,
    text: "이 해석은 수련의 전 과정에서 확인된다.",
    keyTerms: ["해석", "수련", "전 과정"],
  },
  {
    id: 6,
    text: '장로는 그를 "그릇이 좋으니 이제 욕념만 끊으면 된다"고 인정했고(30%), 남궁두는 잠과 곡식을 끊고 온몸에 부스럼이 돋는 고통까지 견뎌 냈다.',
    keyTerms: ["그릇", "욕념", "잠과 곡식", "부스럼", "견뎌 냈다"],
  },
  {
    id: 7,
    text: '그러나 단(丹)이 맺히려는 결정적 순간 남궁두에게 "속히 이루고 싶은 마음이 갑자기 일어"나면서 화기가 치솟아 모든 것이 어그러진다(35%).',
    keyTerms: ["단(丹)", "결정적 순간", "속히 이루고 싶은 마음", "화기", "어그러진다"],
  },
  {
    id: 8,
    text: '장로가 앞서 식색이 아니라도 "일체의 망상이 진(眞)에 해롭다"고 경고했듯(40%), 그를 무너뜨린 망상은 재물도 색도 아니라 빨리 도달하려는 마음 그 자체였다.',
    keyTerms: ["식색", "일체의 망상", "진(眞)", "재물도 색도 아니라", "빨리 도달하려는 마음"],
  },
  {
    id: 9,
    text: '더욱이 산을 내려온 뒤 남궁 선생 스스로도 "예전에 승천하고자 했으나 속히 이루려 하다가 결국 뜻을 이루지 못했다"고 진단하니(90%), 인물의 자기 진단과 필자의 판단이 한 지점에서 만난다.',
    keyTerms: ["산을 내려온 뒤", "승천", "속히 이루려", "자기 진단", "필자의 판단"],
  },
  {
    id: 10,
    text: "이와 달리, 이 작품을 산중의 도를 버리고 인간적 삶으로 돌아오는 회복의 이야기로 읽는 해석이 있을 수 있다.",
    keyTerms: ["대안적 해석", "산중의 도", "인간적 삶", "회복의 이야기"],
  },
  {
    id: 11,
    text: "남궁 선생은 산중이 적막하여 낙이 없으니 오래 산들 무슨 소용이냐 물으면서, 속세의 음식을 금하지 않고 아들 손자를 곁에 두고 여생을 보내겠다고 하면서 끝내 산을 내려오기 때문이다(90%).",
    keyTerms: ["산중이 적막", "속세의 음식", "아들 손자", "여생", "산을 내려오기"],
  },
  {
    id: 12,
    text: "그러나 나는 이 읽기를 받아들이지 않는다.",
    keyTerms: ["받아들이지 않는다"],
  },
  {
    id: 13,
    text: "무엇보다 이 읽기가 근거로 삼는 바로 그 대목이 남궁두 자신의 실패 진단으로 열린다는 점에서, 그 장면을 지배하는 것은 회복의 정조가 아니라 좌절의 회한이다.",
    keyTerms: ["실패 진단", "회복의 정조", "좌절의 회한"],
  },
  {
    id: 14,
    text: "더하여 통상 이 작품은 전계(傳系) 한문소설로 다루어지는데, 나는 전(傳)이 본디 말미의 논찬(論贊)에 필자의 평을 직접 싣는 양식이라는 점에 주목한다.",
    keyTerms: ["전계(傳系) 한문소설", "전(傳)", "논찬(論贊)", "필자의 평"],
  },
  {
    id: 15,
    text: "등장인물 장로가 실패를 업장이나 운명으로 진단하는 것과 달리, 작품을 닫는 '허자왈'은 필자 허균의 판단이 직접 놓이는 자리다.",
    keyTerms: ["장로", "업장", "운명", "허자왈", "허균의 판단"],
  },
  {
    id: 16,
    text: '그 자리에서 허균은 다른 무엇도 아닌 "속히 이루려던 욕망"만 없었다면 그가 선인들과 나란히 섰으리라고 단정하면서 애석해한다(98%).',
    keyTerms: ["속히 이루려던 욕망", "선인들", "애석해한다"],
  },
  {
    id: 17,
    text: "필자가 회복을 핵심으로 삼았다면 귀환을 안도나 축복으로 그렸을 터이나, 그는 거의 이룬 공을 무너뜨린 원인에 눈길을 둔 채 탄식으로 끝맺는다.",
    keyTerms: ["회복", "귀환", "안도나 축복", "무너뜨린 원인", "탄식"],
  },
  {
    id: 18,
    text: '화자가 패인을 "참지 않음"으로 직접 명명해 둔 만큼, 내 해석의 핵심은 그 명명을 옮기는 데 있지 않고 그것을 한 겹 갈라 읽는 데 있다.',
    keyTerms: ["패인", "참지 않음", "한 겹 갈라 읽는 데"],
  },
  {
    id: 19,
    text: '실패의 원인은 "초월을 원한 것" 자체가 아니다.',
    keyTerms: ["실패의 원인", "초월을 원한 것", "자체가 아니다"],
  },
  {
    id: 20,
    text: "장로 또한 초월을 원했고 11 년 수련 끝에 신태(神胎)를 이루었으니(48%), 초월을 바라는 의지는 결격 사유가 아니다.",
    keyTerms: ["장로", "11 년 수련", "신태(神胎)", "초월을 바라는 의지", "결격 사유"],
  },
  {
    id: 21,
    text: "허균이 가르는 것은 '수행하려는 의지'와 '지금 당장 이루려는 조급함'이고, 忍은 후자를 누르는 힘이다.",
    keyTerms: ["수행하려는 의지", "지금 당장 이루려는 조급함", "忍", "누르는 힘"],
  },
  {
    id: 22,
    text: "그러므로 허균이 내놓는 답은 욕망을 긍정하라는 것이 아니라, 가장 높은 것을 향한 의지조차 조급함으로 변질되는 순간 스스로를 무너뜨린다는 것이다.",
    keyTerms: ["허균이 내놓는 답", "욕망을 긍정", "가장 높은 것을 향한 의지", "조급함", "스스로를 무너뜨린다"],
  },
];

const ORDER_ANSWERS = [
  "문제 설정",
  "자기 해석",
  "작품 근거",
  "대안 해석",
  "대안 반박",
  "최종 결론",
];

const ORDER_OPTIONS = [
  "대안 해석",
  "작품 근거",
  "최종 결론",
  "문제 설정",
  "대안 반박",
  "자기 해석",
];

function stripOptionalHanjaParentheses(value: string) {
  return value
    .replace(/\([^)]*\p{Script=Han}[^)]*\)/gu, "")
    .replace(/（[^）]*\p{Script=Han}[^）]*）/gu, "");
}

function normalize(value: string) {
  return stripOptionalHanjaParentheses(value)
    .normalize("NFKC")
    .replace(/[「『]/g, '"')
    .replace(/[」』]/g, '"')
    .replace(/[“”„‟]/g, '"')
    .replace(/[‘’‚‛]/g, "'")
    .replace(/["']/g, "")
    .replace(/[，、]/g, ",")
    .replace(/[．。]/g, ".")
    .replace(/[：]/g, ":")
    .replace(/[；]/g, ";")
    .replace(/\s+/g, "")
    .trim();
}

function getEditDistance(a: string, b: string) {
  const prev = Array.from({ length: b.length + 1 }, (_, index) => index);
  const curr = Array.from({ length: b.length + 1 }, () => 0);

  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;

    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;

      curr[j] = Math.min(
        prev[j] + 1,
        curr[j - 1] + 1,
        prev[j - 1] + cost
      );
    }

    for (let j = 0; j <= b.length; j += 1) {
      prev[j] = curr[j];
    }
  }

  return prev[b.length];
}

function getSimilarity(answer: string, target: string) {
  const a = normalize(answer);
  const b = normalize(target);

  if (!b) return 0;
  if (!a) return 0;
  if (a === b) return 100;

  const distance = getEditDistance(a, b);
  const maxLength = Math.max(a.length, b.length);

  return Math.max(0, Math.round((1 - distance / maxLength) * 100));
}

function makeBlankText(item: QuizItem) {
  let result = item.text;

  item.keyTerms.slice(0, 3).forEach((term, index) => {
    const displayTerm = stripOptionalHanjaParentheses(term);
    const blankLength = Math.min(Math.max(displayTerm.length, 4), 12);
    const blank = `(${index + 1}) ${"＿".repeat(blankLength)}`;

    result = result.replace(term, blank);
  });

  return result;
}

function getBlankAnswers(item: QuizItem) {
  return item.keyTerms.slice(0, 3);
}

function renderTextWithHanja(text: string): ReactNode[] {
  const parts = text.split(/(\p{Script=Han}+)/gu);

  return parts.map((part, index) => {
    if (!part) return null;

    if (/^\p{Script=Han}+$/u.test(part)) {
      return (
        <span key={`${part}-${index}`} className={styles.hanjaText}>
          {part}
        </span>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

export default function NamQuizPage() {
  const [mode, setMode] = useState<Mode>("typing");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingAnswer, setTypingAnswer] = useState("");
  const [blankAnswers, setBlankAnswers] = useState(["", "", ""]);
  const [orderAnswer, setOrderAnswer] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [solvedIds, setSolvedIds] = useState<number[]>([]);

  const currentItem = QUIZ_ITEMS[currentIndex];

  const progressPercent = useMemo(() => {
    return Math.round((solvedIds.length / QUIZ_ITEMS.length) * 100);
  }, [solvedIds.length]);

  const typingScore = useMemo(() => {
    return getSimilarity(typingAnswer, currentItem.text);
  }, [typingAnswer, currentItem.text]);

  const blankScore = useMemo(() => {
    const targets = getBlankAnswers(currentItem);
    const correct = targets.filter(
      (target, index) => normalize(blankAnswers[index] || "") === normalize(target)
    ).length;

    return Math.round((correct / targets.length) * 100);
  }, [blankAnswers, currentItem]);

  const orderScore = useMemo(() => {
    const correct = ORDER_ANSWERS.filter(
      (answer, index) => orderAnswer[index] === answer
    ).length;

    return Math.round((correct / ORDER_ANSWERS.length) * 100);
  }, [orderAnswer]);

  const activeScore =
    mode === "typing" ? typingScore : mode === "blank" ? blankScore : orderScore;

  function markSolved(isCorrect: boolean) {
    setChecked(true);

    if (!isCorrect) return;

    setSolvedIds((prev) => {
      if (prev.includes(currentItem.id)) return prev;
      return [...prev, currentItem.id];
    });

    setCorrectCount((prev) => prev + 1);
  }

  function handleCheck(event?: FormEvent) {
    event?.preventDefault();

    if (mode === "typing") {
      markSolved(typingScore >= 92);
      return;
    }

    if (mode === "blank") {
      markSolved(blankScore === 100);
      return;
    }

    if (mode === "order") {
      markSolved(orderScore === 100);
    }
  }

  function resetAnswerOnly() {
    setTypingAnswer("");
    setBlankAnswers(["", "", ""]);
    setOrderAnswer([]);
    setShowAnswer(false);
    setChecked(false);
  }

  function goToIndex(nextIndex: number) {
    setCurrentIndex(nextIndex);
    resetAnswerOnly();
  }

  function goNext() {
    const nextIndex = currentIndex + 1 >= QUIZ_ITEMS.length ? 0 : currentIndex + 1;
    goToIndex(nextIndex);
  }

  function goPrev() {
    const nextIndex = currentIndex - 1 < 0 ? QUIZ_ITEMS.length - 1 : currentIndex - 1;
    goToIndex(nextIndex);
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    resetAnswerOnly();
  }

  function handleTextareaKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
      handleCheck();
    }
  }

  function addOrderOption(option: string) {
    if (orderAnswer.includes(option)) return;
    setOrderAnswer((prev) => [...prev, option]);
    setChecked(false);
  }

  function removeOrderOption(option: string) {
    setOrderAnswer((prev) => prev.filter((item) => item !== option));
    setChecked(false);
  }

  function getResultText() {
    if (!checked) return "아직 채점 전입니다.";

    if (mode === "typing") {
      if (typingScore >= 98) return "거의 완벽합니다. 그대로 외워도 됩니다.";
      if (typingScore >= 92) return "정답 처리입니다. 작은 조사나 문장부호만 다시 보면 됩니다.";
      if (typingScore >= 75) return "핵심은 맞지만 문장 순서와 표현을 더 맞춰야 합니다.";
      return "아직 원문 구조가 흔들립니다. 키워드부터 다시 잡아보세요.";
    }

    if (mode === "blank") {
      if (blankScore === 100) return "빈칸 정답입니다. 핵심어 암기는 잘 되어 있습니다.";
      return "빠진 핵심어가 있습니다. 아래 정답 확인을 열어 다시 외워보세요.";
    }

    if (orderScore === 100) return "구성 순서 정답입니다. 답안의 큰 흐름을 잘 잡았습니다.";
    return "구성 순서가 아직 섞여 있습니다. 문제 설정 → 해석 → 근거 → 대안 → 반박 → 결론 흐름을 기억하세요.";
  }

  return (
    <main className={styles.wrapper}>
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Namgung Quiz Lab</p>
          <h1 className={styles.heroTitle}>남궁선생전 암기 퀴즈</h1>
          <p className={styles.heroLead}>
            「이루려는 마음이 무너지는 순간」 답안을 문장 단위로 외우기 위한
            타자연습·빈칸·구성순서·플래시카드 페이지입니다.
          </p>

          <div className={styles.heroStats}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{QUIZ_ITEMS.length}</span>
              <span className={styles.statLabel}>암기 문장</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{progressPercent}%</span>
              <span className={styles.statLabel}>진행률</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{correctCount}</span>
              <span className={styles.statLabel}>누적 정답</span>
            </div>
          </div>

          <div className={styles.progressTrack} aria-label="진행률">
            <div
              className={styles.progressFill}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <aside className={styles.sidePanel}>
          <div className={styles.modePanel}>
            <p className={styles.panelLabel}>연습 방식</p>

            <button
              type="button"
              className={`${styles.modeButton} ${
                mode === "typing" ? styles.modeButtonActive : ""
              }`}
              onClick={() => switchMode("typing")}
            >
              타자연습
            </button>

            <button
              type="button"
              className={`${styles.modeButton} ${
                mode === "blank" ? styles.modeButtonActive : ""
              }`}
              onClick={() => switchMode("blank")}
            >
              빈칸 퀴즈
            </button>

            <button
              type="button"
              className={`${styles.modeButton} ${
                mode === "order" ? styles.modeButtonActive : ""
              }`}
              onClick={() => switchMode("order")}
            >
              구성 순서
            </button>

            <button
              type="button"
              className={`${styles.modeButton} ${
                mode === "flashcard" ? styles.modeButtonActive : ""
              }`}
              onClick={() => switchMode("flashcard")}
            >
              플래시카드
            </button>
          </div>

          <div className={styles.indexPanel}>
            <p className={styles.panelLabel}>문장 선택</p>
            <div className={styles.numberGrid}>
              {QUIZ_ITEMS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.numberButton} ${
                    currentIndex === index ? styles.numberButtonActive : ""
                  } ${solvedIds.includes(item.id) ? styles.numberButtonSolved : ""}`}
                  onClick={() => goToIndex(index)}
                  aria-label={`${item.id}번 문장으로 이동`}
                >
                  {item.id}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className={styles.quizPanel}>
          <div className={styles.quizTop}>
            <div>
              <p className={styles.quizEyebrow}>
                문장 {currentItem.id} / {QUIZ_ITEMS.length}
              </p>
              <h2 className={styles.quizTitle}>
                {mode === "typing" && "보고 외운 뒤, 원문을 직접 타자 입력하세요."}
                {mode === "blank" && "빈칸에 들어갈 핵심 표현을 입력하세요."}
                {mode === "order" && "답안 전체의 논리 흐름을 순서대로 배열하세요."}
                {mode === "flashcard" && "앞면의 핵심어를 보고 문장을 떠올리세요."}
              </h2>
            </div>

            <div className={styles.scoreBadge}>
              <span>{mode === "flashcard" ? "암기" : activeScore}</span>
              <small>{mode === "flashcard" ? "CARD" : "점"}</small>
            </div>
          </div>

          {mode === "typing" && (
            <form className={styles.practiceArea} onSubmit={handleCheck}>
              <div className={styles.sourceBox}>
                <p className={styles.boxLabel}>원문</p>
                <p className={styles.sourceText}>{renderTextWithHanja(currentItem.text)}</p>
              </div>

              <label className={styles.inputLabel} htmlFor="typing-answer">
                암기 입력
              </label>
              <textarea
                id="typing-answer"
                className={styles.textarea}
                value={typingAnswer}
                onChange={(event) => {
                  setTypingAnswer(event.target.value);
                  setChecked(false);
                }}
                onKeyDown={handleTextareaKeyDown}
                placeholder="여기에 원문을 보지 않고 다시 입력하세요. Cmd/Ctrl + Enter로 채점할 수 있습니다."
              />

              <div className={styles.actionRow}>
                <button type="submit" className={styles.primaryButton}>
                  채점하기
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setShowAnswer((prev) => !prev)}
                >
                  정답 {showAnswer ? "숨기기" : "보기"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={resetAnswerOnly}
                >
                  다시 입력
                </button>
              </div>
            </form>
          )}

          {mode === "blank" && (
            <form className={styles.practiceArea} onSubmit={handleCheck}>
              <div className={styles.sourceBox}>
                <p className={styles.boxLabel}>빈칸 문장</p>
                <p className={styles.sourceText}>{renderTextWithHanja(makeBlankText(currentItem))}</p>
              </div>

              <div className={styles.blankGrid}>
                {getBlankAnswers(currentItem).map((_, index) => (
                  <label key={index} className={styles.blankLabel}>
                    <span>{index + 1}번 빈칸</span>
                    <input
                      className={styles.blankInput}
                      value={blankAnswers[index]}
                      onChange={(event) => {
                        const next = [...blankAnswers];
                        next[index] = event.target.value;
                        setBlankAnswers(next);
                        setChecked(false);
                      }}
                      placeholder="핵심 표현 입력"
                    />
                  </label>
                ))}
              </div>

              <div className={styles.actionRow}>
                <button type="submit" className={styles.primaryButton}>
                  채점하기
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setShowAnswer((prev) => !prev)}
                >
                  정답 {showAnswer ? "숨기기" : "보기"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={resetAnswerOnly}
                >
                  초기화
                </button>
              </div>
            </form>
          )}

          {mode === "order" && (
            <div className={styles.practiceArea}>
              <div className={styles.sourceBox}>
                <p className={styles.boxLabel}>배열할 구성</p>
                <p className={styles.sourceText}>
                  답안의 큰 구조를 순서대로 누르세요. 잘못 넣은 항목은 아래 선택된
                  카드에서 다시 누르면 빠집니다.
                </p>
              </div>

              <div className={styles.optionWrap}>
                {ORDER_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.orderOption} ${
                      orderAnswer.includes(option) ? styles.orderOptionDisabled : ""
                    }`}
                    onClick={() => addOrderOption(option)}
                    disabled={orderAnswer.includes(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className={styles.orderAnswerBox}>
                {orderAnswer.length === 0 ? (
                  <p className={styles.emptyOrder}>아직 선택한 항목이 없습니다.</p>
                ) : (
                  orderAnswer.map((option, index) => (
                    <button
                      key={option}
                      type="button"
                      className={styles.orderAnswer}
                      onClick={() => removeOrderOption(option)}
                    >
                      <span>{index + 1}</span>
                      {option}
                    </button>
                  ))
                )}
              </div>

              <div className={styles.actionRow}>
                <button
                  type="button"
                  className={styles.primaryButton}
                  onClick={() => handleCheck()}
                >
                  채점하기
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={() => setShowAnswer((prev) => !prev)}
                >
                  정답 {showAnswer ? "숨기기" : "보기"}
                </button>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={resetAnswerOnly}
                >
                  초기화
                </button>
              </div>
            </div>
          )}

          {mode === "flashcard" && (
            <div className={styles.practiceArea}>
              <div className={styles.flashcard}>
                <p className={styles.boxLabel}>핵심어</p>
                <div className={styles.termWrap}>
                  {currentItem.keyTerms.map((term) => (
                    <span key={term} className={styles.termChip}>
                      {renderTextWithHanja(term)}
                    </span>
                  ))}
                </div>

                <button
                  type="button"
                  className={styles.revealButton}
                  onClick={() => setShowAnswer((prev) => !prev)}
                >
                  {showAnswer ? "문장 숨기기" : "문장 보기"}
                </button>
              </div>

              <div className={styles.flashHint}>
                핵심어만 보고 전체 문장을 먼저 말한 뒤, 문장 보기를 눌러 확인하세요.
              </div>
            </div>
          )}

          {checked && mode !== "flashcard" && (
            <div
              className={`${styles.resultBox} ${
                activeScore >= 92 ? styles.resultBoxGood : styles.resultBoxBad
              }`}
            >
              {getResultText()}
            </div>
          )}

          {showAnswer && (
            <div className={styles.answerBox}>
              <p className={styles.boxLabel}>정답</p>

              {mode === "order" ? (
                <ol className={styles.answerList}>
                  {ORDER_ANSWERS.map((answer) => (
                    <li key={answer}>{answer}</li>
                  ))}
                </ol>
              ) : (
                <p className={styles.answerText}>{renderTextWithHanja(currentItem.text)}</p>
              )}

              {mode === "blank" && (
                <div className={styles.answerTerms}>
                  {getBlankAnswers(currentItem).map((answer, index) => (
                    <span key={answer}>
                      {index + 1}. {renderTextWithHanja(answer)}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className={styles.navRow}>
            <button type="button" className={styles.navButton} onClick={goPrev}>
              이전 문장
            </button>
            <button type="button" className={styles.navButtonStrong} onClick={goNext}>
              다음 문장
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}