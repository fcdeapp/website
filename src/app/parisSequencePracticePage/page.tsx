"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/pages/ParisSequencePracticePage.module.css";

type SectionName = "문제 제기" | "나의 해석" | "다른 독법" | "반박과 결론";
type GameMode = "sentence" | "word";
type Difficulty = "easy" | "normal" | "hard";

type MemoryLine = {
  id: string;
  text: string;
  section: SectionName;
};

type Chip = {
  key: string;
  label: string;
};

const TITLE = "파리에 남은 시선";
const AUTHOR = "도정민(건축학과)";

const MEMORY_LINES: MemoryLine[] = [
  {
    id: "1",
    section: "문제 제기",
    text: "에리봉은 『랭스로 되돌아가다』에서 ‘계급 탈주 이후의 귀향이 과연 화해가 될 수 있는가’라는 문제를 제기한다.",
  },
  {
    id: "2",
    section: "문제 제기",
    text: "그는 계급 소속감의 부재가 부르주아의 유년기를 특징짓는다고 쓴다(112).",
  },
  {
    id: "3",
    section: "문제 제기",
    text: "지배자들은 자신이 특정한 세계 안에 위치해 있다는 사실을 지각하지 못한다.",
  },
  {
    id: "4",
    section: "문제 제기",
    text: "이는 백인이나 이성애자가 자신을 그렇게 의식하지 않는 것과 같다.",
  },
  {
    id: "5",
    section: "문제 제기",
    text: "에리봉 역시 서술 과정에서 그 계급적 비대칭에서 벗어나지 못한다.",
  },
  {
    id: "6",
    section: "나의 해석",
    text: "나는 이 텍스트를 귀환 불가능성의 비자발적 증거로 읽는다.",
  },
  {
    id: "7",
    section: "나의 해석",
    text: "에리봉은 아버지를 고유한 인물이 아니라 노동자 세계의 한 유형으로 서술한다(109).",
  },
  {
    id: "8-1",
    section: "나의 해석",
    text: "그는 자신의 시선이 이미 외부자의 것임을 인정하고(109),",
  },
  {
    id: "8-2",
    section: "나의 해석",
    text: "그렇기에 계급 구조를 파악하려면 내려다보는 시각(55)이 필요하다고 말한다.",
  },
  {
    id: "9-1",
    section: "나의 해석",
    text: "에리봉이 사회학의 언어로 랭스를 설명할수록,",
  },
  {
    id: "9-2",
    section: "나의 해석",
    text: "그는 랭스에서 멀어진다.",
  },
  {
    id: "10",
    section: "나의 해석",
    text: "에리봉은 과거를 화해를 통해 현재화하기보다, 분석의 대상으로 객관화한다.",
  },
  {
    id: "11",
    section: "다른 독법",
    text: "다른 독법도 가능하다.",
  },
  {
    id: "12",
    section: "다른 독법",
    text: "에리봉이 가족의 혐오를 계급적 조건의 산물로 재배치한다는 점에서, 이를 뒤늦은 용서의 형식으로도 읽을 수 있다.",
  },
  {
    id: "13",
    section: "다른 독법",
    text: "에리봉은 아버지가 태어날 때부터 사회적 결정논리의 지배를 받았고, 재생산의 법칙 속에서 주어진 계급적 위치에서 끝내 벗어나지 못했다고 쓴다(54).",
  },
  {
    id: "14",
    section: "다른 독법",
    text: "이처럼 원인을 개인에게서 구조로 옮긴다는 점에서, 이 독법에서는 그의 서술을 우회된 용서의 형식으로 읽어낼 수 있다.",
  },
  {
    id: "15",
    section: "반박과 결론",
    text: "그러나 외부성을 인정하는 것과 화해는 다르다.",
  },
  {
    id: "16",
    section: "반박과 결론",
    text: "에리봉은 아버지의 적대를 사회적 조건으로 설명하지만, 관계를 재구성하지는 않는다.",
  },
  {
    id: "17",
    section: "반박과 결론",
    text: "에리봉은 집 안팎에서 반복된 동성애 혐오의 말들, 그중에서도 아버지의 언어(225)를 통해 자신이 랭스를 여전히 모욕의 장소로 기억하고 있음을 드러낸다.",
  },
  {
    id: "18-1",
    section: "반박과 결론",
    text: "화해의 텍스트라면 정동의 변화가 수반되어야 하지만,",
  },
  {
    id: "18-2",
    section: "반박과 결론",
    text: "그가 전제하는 ‘내려다보는 시각’ 속에서 그는 끝내 기억을 화해의 매개가 아니라 분석의 재료로 다룬다.",
  },
  {
    id: "19-1",
    section: "반박과 결론",
    text: "에리봉은 제목에서만 귀환을 완수하고,",
  },
  {
    id: "19-2",
    section: "반박과 결론",
    text: "끝내 파리에 시선을 둔다.",
  },
];

const SECTION_ORDER: SectionName[] = ["문제 제기", "나의 해석", "다른 독법", "반박과 결론"];

function makeKey(prefix: string, index: number) {
  return `${prefix}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

function shuffleArray<T>(items: T[]) {
  const next = [...items];

  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }

  return next;
}

function buildFullText() {
  return [TITLE, AUTHOR, ...MEMORY_LINES.map((line) => `${line.id} ${line.text}`)].join("\n");
}

function normalizeText(value: string) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/[‘’]/g, "'")
    .replace(/\(p\.\s*(\d+)\)/gi, "($1)")
    .replace(/[『「]랭스로 되돌아가다[』」]/g, "랭스로 되돌아가다")
    .replace(/'랭스로 되돌아가다'/g, "랭스로 되돌아가다")
    .replace(/\s+/g, " ")
    .trim();
}

function splitLineToChunks(text: string, difficulty: Difficulty) {
  const words = text.trim().split(/\s+/);

  if (difficulty === "hard") {
    return words;
  }

  const chunkSize = difficulty === "easy" ? 4 : 2;
  const chunks: string[] = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push(words.slice(i, i + chunkSize).join(" "));
  }

  return chunks;
}

function getSectionLines(section: SectionName) {
  return MEMORY_LINES.filter((line) => line.section === section);
}

function getLineById(id: string) {
  return MEMORY_LINES.find((line) => line.id === id) || MEMORY_LINES[0];
}

function makeSentenceChips(section: SectionName): Chip[] {
  return getSectionLines(section).map((line, index) => ({
    key: makeKey("sentence", index),
    label: `${line.id}. ${line.text}`,
  }));
}

function makeWordChips(lineId: string, difficulty: Difficulty): Chip[] {
  const line = getLineById(lineId);
  return splitLineToChunks(line.text, difficulty).map((chunk, index) => ({
    key: makeKey("word", index),
    label: chunk,
  }));
}

function getCorrectSentenceLabels(section: SectionName) {
  return getSectionLines(section).map((line) => `${line.id}. ${line.text}`);
}

function getCorrectWordLabels(lineId: string, difficulty: Difficulty) {
  return splitLineToChunks(getLineById(lineId).text, difficulty);
}

function getModeTitle(mode: GameMode) {
  if (mode === "sentence") return "문장 순서 맞추기";
  return "단어·구절 순서 맞추기";
}

export default function ParisSequencePracticePage() {
  const [mode, setMode] = useState<GameMode>("sentence");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [selectedSection, setSelectedSection] = useState<SectionName>("문제 제기");
  const [selectedLineId, setSelectedLineId] = useState("1");
  const [pool, setPool] = useState<Chip[]>([]);
  const [answer, setAnswer] = useState<Chip[]>([]);
  const [checked, setChecked] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const selectedLine = useMemo(() => getLineById(selectedLineId), [selectedLineId]);

  const correctLabels = useMemo(() => {
    if (mode === "sentence") return getCorrectSentenceLabels(selectedSection);
    return getCorrectWordLabels(selectedLineId, difficulty);
  }, [difficulty, mode, selectedLineId, selectedSection]);

  const answerLabels = useMemo(() => answer.map((chip) => chip.label), [answer]);

  const correctCount = useMemo(() => {
    return answerLabels.filter((label, index) => normalizeText(label) === normalizeText(correctLabels[index] || "")).length;
  }, [answerLabels, correctLabels]);

  const isComplete = answer.length === correctLabels.length;
  const isPerfect =
    isComplete &&
    correctLabels.every((label, index) => normalizeText(label) === normalizeText(answerLabels[index] || ""));

  const progress = Math.round((answer.length / Math.max(correctLabels.length, 1)) * 100);

  const groupedLines = useMemo(() => {
    return SECTION_ORDER.map((section) => ({
      section,
      lines: getSectionLines(section),
    }));
  }, []);

  const resetGame = () => {
    const chips =
      mode === "sentence"
        ? makeSentenceChips(selectedSection)
        : makeWordChips(selectedLineId, difficulty);

    setPool(shuffleArray(chips));
    setAnswer([]);
    setChecked(false);
    setShowAnswer(false);
  };

  useEffect(() => {
    resetGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedSection, selectedLineId, difficulty]);

  const moveToAnswer = (chip: Chip) => {
    setAnswer((prev) => [...prev, chip]);
    setPool((prev) => prev.filter((item) => item.key !== chip.key));
    setChecked(false);
  };

  const moveToPool = (chip: Chip) => {
    setPool((prev) => [...prev, chip]);
    setAnswer((prev) => prev.filter((item) => item.key !== chip.key));
    setChecked(false);
  };

  const moveAnswerChip = (index: number, direction: "left" | "right") => {
    setAnswer((prev) => {
      const next = [...prev];
      const targetIndex = direction === "left" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= next.length) return prev;

      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });

    setChecked(false);
  };

  const fillCorrectAnswer = () => {
    const correctChips =
      mode === "sentence"
        ? makeSentenceChips(selectedSection)
        : makeWordChips(selectedLineId, difficulty);

    setAnswer(correctChips);
    setPool([]);
    setChecked(true);
    setShowAnswer(true);
  };

  const clearAnswer = () => {
    const all = [...pool, ...answer];
    setPool(shuffleArray(all));
    setAnswer([]);
    setChecked(false);
  };

  const handleModeChange = (nextMode: GameMode) => {
    setMode(nextMode);
    setChecked(false);
    setShowAnswer(false);
  };

  const handleSectionSelect = (section: SectionName) => {
    const firstLine = getSectionLines(section)[0];

    setSelectedSection(section);
    if (firstLine) setSelectedLineId(firstLine.id);
  };

  const handleLineSelect = (line: MemoryLine) => {
    setSelectedLineId(line.id);
    setSelectedSection(line.section);
    setMode("word");
  };

  const goPrevLine = () => {
    const currentIndex = MEMORY_LINES.findIndex((line) => line.id === selectedLineId);
    const prev = MEMORY_LINES[Math.max(0, currentIndex - 1)];

    setSelectedLineId(prev.id);
    setSelectedSection(prev.section);
    setMode("word");
  };

  const goNextLine = () => {
    const currentIndex = MEMORY_LINES.findIndex((line) => line.id === selectedLineId);
    const next = MEMORY_LINES[Math.min(MEMORY_LINES.length - 1, currentIndex + 1)];

    setSelectedLineId(next.id);
    setSelectedSection(next.section);
    setMode("word");
  };

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>Sequence Memorization Trainer</p>
          <h1>{TITLE}</h1>
          <p className={styles.author}>{AUTHOR}</p>
          <p className={styles.subtitle}>
            문장과 단어를 섞어 놓고, 올바른 순서로 다시 배열하는 암기 페이지입니다.
            문단 구조를 먼저 익힌 뒤 문장 내부의 단어 순서까지 점검할 수 있습니다.
          </p>
        </div>

        <div className={styles.scoreCard}>
          <span className={styles.scoreLabel}>현재 진행도</span>
          <strong className={isPerfect ? styles.perfectScore : ""}>
            {isPerfect ? "100%" : `${progress}%`}
          </strong>
          <span className={styles.scoreHint}>
            {checked
              ? isPerfect
                ? "완전 정답"
                : `${correctCount}/${correctLabels.length}개 위치 정답`
              : `${answer.length}/${correctLabels.length}개 배치`}
          </span>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.toolbar}>
          <div className={styles.modeGroup} aria-label="practice mode">
            <button
              className={mode === "sentence" ? styles.activeButton : ""}
              onClick={() => handleModeChange("sentence")}
              type="button"
            >
              문장 재배열
            </button>
            <button
              className={mode === "word" ? styles.activeButton : ""}
              onClick={() => handleModeChange("word")}
              type="button"
            >
              단어·구절 재배열
            </button>
          </div>

          <div className={styles.controlGroup}>
            <label className={styles.selectLabel}>
              난이도
              <select
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as Difficulty)}
                disabled={mode === "sentence"}
              >
                <option value="easy">쉬움: 4단어 묶음</option>
                <option value="normal">보통: 2단어 묶음</option>
                <option value="hard">어려움: 1단어 단위</option>
              </select>
            </label>

            <button className={styles.ghostButton} onClick={resetGame} type="button">
              다시 섞기
            </button>
          </div>
        </section>

        <section className={styles.layoutGrid}>
          <aside className={styles.sidebar}>
            <div className={styles.panelHeaderCompact}>
              <h2>선택</h2>
              <span>{MEMORY_LINES.length} lines</span>
            </div>

            <div className={styles.lineList}>
              {groupedLines.map((group) => (
                <div key={group.section} className={styles.lineGroup}>
                  <button
                    className={`${styles.sectionButton} ${
                      selectedSection === group.section ? styles.selectedSection : ""
                    }`}
                    onClick={() => {
                      handleSectionSelect(group.section);
                      setMode("sentence");
                    }}
                    type="button"
                  >
                    {group.section}
                  </button>

                  <div className={styles.lineButtons}>
                    {group.lines.map((line) => (
                      <button
                        key={line.id}
                        className={`${styles.lineButton} ${
                          selectedLineId === line.id ? styles.selectedLine : ""
                        }`}
                        onClick={() => handleLineSelect(line)}
                        type="button"
                      >
                        {line.id}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </aside>

          <section className={styles.practicePanel}>
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.panelKicker}>
                  {mode === "sentence" ? selectedSection : `${selectedLine.id}번 줄`}
                </p>
                <h2>{getModeTitle(mode)}</h2>
              </div>

              {mode === "word" && (
                <div className={styles.navButtons}>
                  <button onClick={goPrevLine} type="button">
                    이전 줄
                  </button>
                  <button onClick={goNextLine} type="button">
                    다음 줄
                  </button>
                </div>
              )}
            </div>

            <div className={styles.guideBox}>
              {mode === "sentence" ? (
                <p>
                  아래에 섞인 문장 카드를 눌러 이 문단의 올바른 순서대로 배치하세요.
                  문장 번호까지 함께 보면서 흐름을 암기하는 단계입니다.
                </p>
              ) : (
                <p>
                  아래에 섞인 단어·구절 카드를 눌러 한 문장을 정확한 순서로 복원하세요.
                  완성 후 “채점하기”를 누르면 위치별 정답 여부가 표시됩니다.
                </p>
              )}
            </div>

            <div className={styles.boardGrid}>
              <div className={styles.cardPanel}>
                <div className={styles.cardPanelHeader}>
                  <strong>섞인 카드</strong>
                  <span>{pool.length}개 남음</span>
                </div>

                <div className={styles.chipPool}>
                  {pool.length === 0 ? (
                    <div className={styles.emptyState}>모든 카드를 배치했습니다.</div>
                  ) : (
                    pool.map((chip) => (
                      <button
                        key={chip.key}
                        className={styles.poolChip}
                        onClick={() => moveToAnswer(chip)}
                        type="button"
                      >
                        {chip.label}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className={styles.cardPanel}>
                <div className={styles.cardPanelHeader}>
                  <strong>내가 맞춘 순서</strong>
                  <span>{answer.length}개 배치</span>
                </div>

                <div className={styles.answerList}>
                  {answer.length === 0 ? (
                    <div className={styles.emptyState}>왼쪽 카드를 눌러 순서대로 배치하세요.</div>
                  ) : (
                    answer.map((chip, index) => {
                      const isRight =
                        checked &&
                        normalizeText(chip.label) === normalizeText(correctLabels[index] || "");
                      const isWrong =
                        checked &&
                        normalizeText(chip.label) !== normalizeText(correctLabels[index] || "");

                      return (
                        <div
                          key={chip.key}
                          className={`${styles.answerChip} ${
                            isRight ? styles.rightChip : isWrong ? styles.wrongChip : ""
                          }`}
                        >
                          <button
                            className={styles.removeChip}
                            onClick={() => moveToPool(chip)}
                            type="button"
                            aria-label="remove chip"
                          >
                            ×
                          </button>

                          <span className={styles.orderNumber}>{index + 1}</span>
                          <p>{chip.label}</p>

                          <div className={styles.moveButtons}>
                            <button
                              onClick={() => moveAnswerChip(index, "left")}
                              disabled={index === 0}
                              type="button"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => moveAnswerChip(index, "right")}
                              disabled={index === answer.length - 1}
                              type="button"
                            >
                              ↓
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className={styles.resultBar}>
              <div>
                <strong>
                  {checked
                    ? isPerfect
                      ? "완전 정답"
                      : "순서가 아직 맞지 않습니다"
                    : "배치 후 채점하세요"}
                </strong>
                <span>
                  {checked
                    ? isPerfect
                      ? "이 순서를 그대로 외우면 됩니다."
                      : `${correctCount}/${correctLabels.length}개가 정확한 위치에 있습니다.`
                    : `${answer.length}/${correctLabels.length}개를 배치했습니다.`}
                </span>
              </div>

              <div className={styles.actionButtons}>
                <button onClick={() => setChecked(true)} type="button">
                  채점하기
                </button>
                <button onClick={clearAnswer} type="button">
                  답안 비우기
                </button>
                <button onClick={fillCorrectAnswer} type="button">
                  정답 배치
                </button>
                <button onClick={() => setShowAnswer((prev) => !prev)} type="button">
                  {showAnswer ? "정답 숨기기" : "정답 보기"}
                </button>
              </div>
            </div>

            {checked && !isPerfect && (
              <div className={styles.feedbackBox}>
                <h3>위치별 확인</h3>
                <div className={styles.feedbackList}>
                  {correctLabels.map((correct, index) => {
                    const user = answerLabels[index] || "아직 배치 안 됨";
                    const isRight = normalizeText(user) === normalizeText(correct);

                    return (
                      <div
                        key={`${correct}-${index}`}
                        className={`${styles.feedbackItem} ${
                          isRight ? styles.feedbackRight : styles.feedbackWrong
                        }`}
                      >
                        <span>{index + 1}</span>
                        <div>
                          <p>
                            <strong>정답:</strong> {correct}
                          </p>
                          <p>
                            <strong>내 답:</strong> {user}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {showAnswer && (
              <pre className={styles.answerSheet}>
                {mode === "sentence"
                  ? getCorrectSentenceLabels(selectedSection).join("\n")
                  : getCorrectWordLabels(selectedLineId, difficulty).join(" ")}
              </pre>
            )}
          </section>
        </section>

        <section className={styles.sourcePanel}>
          <div className={styles.panelHeaderCompact}>
            <h2>전체 원문</h2>
            <span>확인용</span>
          </div>
          <pre>{buildFullText()}</pre>
        </section>
      </main>
    </div>
  );
}