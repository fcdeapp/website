"use client";

import { useMemo, useState } from "react";
import styles from "../../styles/pages/ParisMemoryPracticePage.module.css";

type PracticeMode = "line" | "paragraph" | "full";

type MemoryLine = {
  id: string;
  text: string;
  section: "문제 제기" | "나의 해석" | "다른 독법" | "반박과 결론";
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
    id: "9",
    section: "나의 해석",
    text: "에리봉이 사회학의 언어로 랭스를 설명할수록 랭스는 멀어진다.",
  },
  {
    id: "10",
    section: "나의 해석",
    text: "과거는 화해를 통해 현재화되기보다, 분석의 대상으로 객관화된다.",
  },
  {
    id: "11",
    section: "다른 독법",
    text: "다른 독법도 가능하다.",
  },
  {
    id: "12",
    section: "다른 독법",
    text: "가족의 혐오를 계급적 조건의 산물로 재배치하는 이 분석은 뒤늦은 용서의 형식으로도 읽힌다.",
  },
  {
    id: "13",
    section: "다른 독법",
    text: "에리봉은 아버지가 태어날 때부터 사회적 결정논리의 지배를 받았으며, 재생산의 법칙 속에서 주어진 계급적 위치에서 끝내 벗어나지 못했다고 쓴다(54).",
  },
  {
    id: "14",
    section: "다른 독법",
    text: "이처럼 원인을 개인에게서 구조로 옮겨 설명하는 서술은, 이 독법에서 우회된 용서의 형식으로 읽힌다.",
  },
  {
    id: "15",
    section: "반박과 결론",
    text: "그러나 외부성을 인정하는 것과 화해는 다르다.",
  },
  {
    id: "16",
    section: "반박과 결론",
    text: "아버지의 적대는 사회적 조건으로 설명되지만 관계는 재구성되지 않는다.",
  },
  {
    id: "17",
    section: "반박과 결론",
    text: "집 안팎에서 반복된 동성애 혐오의 말들, 그중에서도 아버지의 언어(225)에서 랭스가 그에게 여전히 모욕의 기억임이 드러난다.",
  },
  {
    id: "18-1",
    section: "반박과 결론",
    text: "화해의 텍스트라면 정동의 변화가 수반되어야 하지만,",
  },
  {
    id: "18-2",
    section: "반박과 결론",
    text: "그가 전제하는 ‘내려다보는 시각’ 속에서 기억은 끝내 화해의 매개가 아니라 분석의 재료로 남는다.",
  },
  {
    id: "19-1",
    section: "반박과 결론",
    text: "귀환은 제목에서만 완수되었고,",
  },
  {
    id: "19-2",
    section: "반박과 결론",
    text: "시선은 파리에 남는다.",
  },
];

const SECTION_ORDER: MemoryLine["section"][] = ["문제 제기", "나의 해석", "다른 독법", "반박과 결론"];

function buildFullText() {
  return [TITLE, AUTHOR, ...MEMORY_LINES.map((line) => `${line.id} ${line.text}`)].join("\n");
}

function normalizeForCheck(value: string, strictSpacing: boolean) {
  const normalized = value
    .replace(/\r\n/g, "\n")
    .replace(/[‘’]/g, "'")
    .replace(/\(p\.\s*(\d+)\)/gi, "($1)")
    .replace(/[『「]랭스로 되돌아가다[』」]/g, "랭스로 되돌아가다")
    .replace(/'랭스로 되돌아가다'/g, "랭스로 되돌아가다")
    .trim();

  if (strictSpacing) return normalized;
  return normalized.replace(/[ \t]+/g, " ");
}

function getParagraphText(section: MemoryLine["section"]) {
  return MEMORY_LINES.filter((line) => line.section === section)
    .map((line) => `${line.id} ${line.text}`)
    .join("\n");
}

function findFirstDifference(target: string, input: string) {
  const max = Math.max(target.length, input.length);
  for (let i = 0; i < max; i += 1) {
    if (target[i] !== input[i]) {
      return i;
    }
  }
  return -1;
}

function makeMaskedText(text: string, level: number) {
  if (level <= 0) return text;
  const chunks = text.split(/(\s+)/);
  let visibleWordIndex = 0;
  return chunks
    .map((chunk) => {
      if (/^\s+$/.test(chunk)) return chunk;
      visibleWordIndex += 1;
      const shouldHide = level === 1 ? visibleWordIndex % 4 === 0 : level === 2 ? visibleWordIndex % 2 === 0 : true;
      if (!shouldHide) return chunk;
      return "□".repeat(Math.max(2, Math.min(chunk.length, 8)));
    })
    .join("");
}

export default function ParisMemoryPracticePage() {
  const [mode, setMode] = useState<PracticeMode>("line");
  const [selectedLineId, setSelectedLineId] = useState("1");
  const [selectedSection, setSelectedSection] = useState<MemoryLine["section"]>("문제 제기");
  const [answer, setAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [maskLevel, setMaskLevel] = useState(1);
  const [strictSpacing, setStrictSpacing] = useState(true);

  const selectedLine = useMemo(
    () => MEMORY_LINES.find((line) => line.id === selectedLineId) || MEMORY_LINES[0],
    [selectedLineId]
  );

  const targetText = useMemo(() => {
    if (mode === "full") return buildFullText();
    if (mode === "paragraph") return getParagraphText(selectedSection);
    return selectedLine.text;
  }, [mode, selectedLine.text, selectedSection]);

  const comparableTarget = normalizeForCheck(targetText, strictSpacing);
  const comparableAnswer = normalizeForCheck(answer, strictSpacing);
  const firstDiff = findFirstDifference(comparableTarget, comparableAnswer);
  const isPerfect = comparableTarget.length > 0 && comparableAnswer === comparableTarget;
  const typedLength = comparableAnswer.length;
  const progress = Math.min(100, Math.round((typedLength / Math.max(comparableTarget.length, 1)) * 100));
  const wrongCount = firstDiff === -1 ? 0 : Math.max(comparableTarget.length - firstDiff, comparableAnswer.length - firstDiff);

  const groupedLines = useMemo(() => {
    return SECTION_ORDER.map((section) => ({
      section,
      lines: MEMORY_LINES.filter((line) => line.section === section),
    }));
  }, []);

  const handleModeChange = (nextMode: PracticeMode) => {
    setMode(nextMode);
    setAnswer("");
    setShowAnswer(false);
  };

  const goNextLine = () => {
    const currentIndex = MEMORY_LINES.findIndex((line) => line.id === selectedLineId);
    const next = MEMORY_LINES[Math.min(currentIndex + 1, MEMORY_LINES.length - 1)];
    setSelectedLineId(next.id);
    setSelectedSection(next.section);
    setAnswer("");
    setShowAnswer(false);
  };

  const goPrevLine = () => {
    const currentIndex = MEMORY_LINES.findIndex((line) => line.id === selectedLineId);
    const prev = MEMORY_LINES[Math.max(currentIndex - 1, 0)];
    setSelectedLineId(prev.id);
    setSelectedSection(prev.section);
    setAnswer("");
    setShowAnswer(false);
  };

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.kicker}>Exact Memorization Trainer</p>
          <h1>{TITLE}</h1>
          <p className={styles.author}>{AUTHOR}</p>
          <p className={styles.subtitle}>
            조사와 문장부호까지 정확히 맞추는 암기 연습 페이지입니다.
            ‘/’ 인용부호 차이, (p.숫자)/(숫자), 『랭스로 되돌아가다』/'랭스로 되돌아가다' 입력 차이는 허용됩니다.
          </p>
        </div>
        <div className={styles.scoreCard}>
          <span className={styles.scoreLabel}>현재 정확도</span>
          <strong className={isPerfect ? styles.perfectScore : ""}>{isPerfect ? "100%" : `${progress}%`}</strong>
          <span className={styles.scoreHint}>{isPerfect ? "완전 일치" : firstDiff === -1 ? "입력 중" : `첫 오류 위치 ${firstDiff + 1}자`}</span>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.toolbar}>
          <div className={styles.modeGroup} aria-label="practice mode">
            <button className={mode === "line" ? styles.activeButton : ""} onClick={() => handleModeChange("line")}>
              줄별 암기
            </button>
            <button className={mode === "paragraph" ? styles.activeButton : ""} onClick={() => handleModeChange("paragraph")}>
              문단 암기
            </button>
            <button className={mode === "full" ? styles.activeButton : ""} onClick={() => handleModeChange("full")}>
              전체 백지쓰기
            </button>
          </div>

          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={strictSpacing}
              onChange={(event) => setStrictSpacing(event.target.checked)}
            />
            띄어쓰기까지 엄격 채점
          </label>
        </section>

        <section className={styles.layoutGrid}>
          <aside className={styles.sidebar}>
            <div className={styles.panelHeaderCompact}>
              <h2>암기 순서</h2>
              <span>{MEMORY_LINES.length} lines</span>
            </div>

            <div className={styles.lineList}>
              {groupedLines.map((group) => (
                <div key={group.section} className={styles.lineGroup}>
                  <button
                    className={`${styles.sectionButton} ${selectedSection === group.section ? styles.selectedSection : ""}`}
                    onClick={() => {
                      setSelectedSection(group.section);
                      setMode("paragraph");
                      setAnswer("");
                      setShowAnswer(false);
                    }}
                  >
                    {group.section}
                  </button>
                  <div className={styles.lineButtons}>
                    {group.lines.map((line) => (
                      <button
                        key={line.id}
                        className={`${styles.lineButton} ${selectedLineId === line.id ? styles.selectedLine : ""}`}
                        onClick={() => {
                          setSelectedLineId(line.id);
                          setSelectedSection(line.section);
                          setMode("line");
                          setAnswer("");
                          setShowAnswer(false);
                        }}
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
                  {mode === "line" ? `${selectedLine.id}번 줄` : mode === "paragraph" ? selectedSection : "전체 원문"}
                </p>
                <h2>{mode === "full" ? "처음부터 끝까지 그대로 쓰기" : "안 보고 입력하기"}</h2>
              </div>
              {mode === "line" && (
                <div className={styles.navButtons}>
                  <button onClick={goPrevLine}>이전</button>
                  <button onClick={goNextLine}>다음</button>
                </div>
              )}
            </div>

            <div className={styles.maskBox}>
              <div className={styles.maskHeader}>
                <strong>가림 힌트</strong>
                <select value={maskLevel} onChange={(event) => setMaskLevel(Number(event.target.value))}>
                  <option value={0}>원문 보기</option>
                  <option value={1}>25% 가림</option>
                  <option value={2}>50% 가림</option>
                  <option value={3}>전부 가림</option>
                </select>
              </div>
              <p>{makeMaskedText(targetText, maskLevel)}</p>
            </div>

            <textarea
              className={`${styles.answerInput} ${isPerfect ? styles.answerPerfect : firstDiff >= 0 ? styles.answerWrong : ""}`}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              placeholder={mode === "full" ? "제목, 이름, 번호, 본문까지 전부 입력하세요." : "정확히 입력하세요."}
              spellCheck={false}
            />

            <div className={styles.resultBar}>
              <div>
                <strong>{isPerfect ? "완전 일치" : firstDiff === -1 ? "아직 오류 없음" : "불일치 발견"}</strong>
                <span>
                  {isPerfect
                    ? "다음 줄 또는 다음 문단으로 넘어가도 됩니다."
                    : firstDiff === -1
                      ? `${typedLength}/${comparableTarget.length}자 입력`
                      : `첫 차이: ${firstDiff + 1}번째 글자 · 남은 오류 가능 구간 ${wrongCount}자`}
                </span>
              </div>
              <div className={styles.actionButtons}>
                <button onClick={() => setShowAnswer((prev) => !prev)}>{showAnswer ? "정답 숨기기" : "정답 보기"}</button>
                <button onClick={() => setAnswer("")}>다시 쓰기</button>
              </div>
            </div>

            {firstDiff >= 0 && (
              <div className={styles.diffBox}>
                <div>
                  <span>정답</span>
                  <code>{comparableTarget.slice(Math.max(0, firstDiff - 16), firstDiff)}<mark>{comparableTarget[firstDiff] || "∅"}</mark>{comparableTarget.slice(firstDiff + 1, firstDiff + 34)}</code>
                </div>
                <div>
                  <span>입력</span>
                  <code>{comparableAnswer.slice(Math.max(0, firstDiff - 16), firstDiff)}<mark>{comparableAnswer[firstDiff] || "∅"}</mark>{comparableAnswer.slice(firstDiff + 1, firstDiff + 34)}</code>
                </div>
              </div>
            )}

            {showAnswer && (
              <pre className={styles.answerSheet}>{targetText}</pre>
            )}
          </section>
        </section>

        <section className={styles.sourcePanel}>
          <div className={styles.panelHeaderCompact}>
            <h2>전체 원문</h2>
            <span>복사·확인용</span>
          </div>
          <pre>{buildFullText()}</pre>
        </section>
      </main>
    </div>
  );
}
