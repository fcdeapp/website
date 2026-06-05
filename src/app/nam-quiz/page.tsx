"use client";

import { FormEvent, KeyboardEvent, ReactNode, useMemo, useState } from "react";
import styles from "../../styles/pages/NamQuiz.module.css";

type SectionKey = "main" | "plan";

type QuizItem = {
  id: number;
  section: SectionKey;
  text: string;
  keyTerms: string[];
};

type Mode = "typing" | "blank" | "order" | "flashcard";
type SectionFilter = "all" | SectionKey;

const SECTION_LABELS: Record<SectionFilter, string> = {
  all: "전체",
  main: "본문",
  plan: "발제문 수정 계획",
};

const QUIZ_ITEMS: QuizItem[] = [
  {
    id: 1,
    section: "main",
    text: "이루려는 마음이 무너지는 순간",
    keyTerms: ["이루려는 마음", "무너지는 순간"],
  },
  {
    id: 2,
    section: "main",
    text: "도정민(건축학과)",
    keyTerms: ["도정민", "건축학과"],
  },
  {
    id: 3,
    section: "main",
    text: '내가 응하려는 문제는 "가장 높은 경지를 바라는 마음은 어떻게 그 경지에 이르는 일을 스스로 가로막는가"이다.',
    keyTerms: ["가장 높은 경지", "그 경지에 이르는 일", "스스로 가로막는가"],
  },
  {
    id: 4,
    section: "main",
    text: "허균은 「남궁선생전」에서 이 물음을, 첩과 당질을 죽이고 도망자가 된 임피의 선비 남궁두가 산중에서 장로를 만나 도가 수련에 들었으나 끝내 신선의 문턱에서 좌절하는 일생으로 풀어낸다.",
    keyTerms: ["허균", "남궁선생전", "남궁두", "장로", "신선의 문턱"],
  },
  {
    id: 5,
    section: "main",
    text: "나는 남궁두를 무너뜨린 것이 재능의 부족도 식색(食色) 같은 낮은 욕망도 아니라 완성을 향한 조급함이고, 허균이 끝에 내세우는 '인(忍)'은 그 조급함을 늦추는 규율이라고 본다.",
    keyTerms: ["재능의 부족", "식색(食色)", "완성을 향한 조급함", "인(忍)", "규율"],
  },
  {
    id: 6,
    section: "main",
    text: "더 정확히 말하면, 허균이 가르는 것은 높은 경지를 향한 의지 자체가 아니라 그 의지가 '지금 당장 이루려는 마음'으로 변질되는 순간이다.",
    keyTerms: ["높은 경지를 향한 의지", "지금 당장 이루려는 마음", "변질"],
  },
  {
    id: 7,
    section: "main",
    text: "나는 이 해석을 수련의 전 과정에서 확인할 수 있다고 본다.",
    keyTerms: ["이 해석", "수련", "전 과정"],
  },
  {
    id: 8,
    section: "main",
    text: '장로는 그를 "그릇이 좋으니 이제 욕념만 끊으면 된다"고 인정했고(30%), 남궁두는 잠과 곡식을 끊고 온몸에 부스럼이 돋는 고통까지 견뎌 냈다.',
    keyTerms: ["그릇", "욕념", "잠과 곡식", "부스럼", "견뎌 냈다"],
  },
  {
    id: 9,
    section: "main",
    text: '그러나 단(丹)이 맺히려는 결정적 순간 남궁두에게 "속히 이루고 싶은 마음이 갑자기 일어"나면서 화기가 치솟아 모든 것이 어그러진다(35%).',
    keyTerms: ["단(丹)", "결정적 순간", "속히 이루고 싶은 마음", "화기", "어그러진다"],
  },
  {
    id: 10,
    section: "main",
    text: '앞서 장로가 식색이 아니라도 "일체의 망상이 진(眞)에 해롭다"고 경고했듯(40%), 그를 무너뜨린 망상은 재물도 색도 아니라 빨리 도달하려는 마음 그 자체였다.',
    keyTerms: ["일체의 망상", "진(眞)", "재물도 색도 아니라", "빨리 도달하려는 마음"],
  },
  {
    id: 11,
    section: "main",
    text: '더욱이 산을 내려온 뒤 남궁두 스스로도 "예전에 승천하고자 했으나 속히 이루려 하다가 결국 뜻을 이루지 못했다"고 진단하니(90%), 남궁두 자신이 짚은 패인과 허균이 논평한 패인이 한 지점에서 만난다.',
    keyTerms: ["산을 내려온 뒤", "승천", "속히 이루려", "패인", "한 지점에서 만난다"],
  },
  {
    id: 12,
    section: "main",
    text: "이와 달리, 忍의 다의성과 不忍의 함의에 주목하는 독법이 있다.",
    keyTerms: ["忍의 다의성", "不忍의 함의", "독법"],
  },
  {
    id: 13,
    section: "main",
    text: "이 독법을 따르는 논자들은 17세기 한문 독자에게 忍이 '참을성'이자 동시에 '잔인함'을 뜻하고, 不忍이 맹자의 불인인지심(不忍人之心)을 환기하는 미덕이었음을 복원한다.",
    keyTerms: ["17세기 한문 독자", "참을성", "잔인함", "불인인지심", "미덕"],
  },
  {
    id: 14,
    section: "main",
    text: "그들은 남궁두가 처음에는 인(忍)한 존재로 표상되다가 끝내 욕망을 참지 못하는 불인함, 곧 인간성을 드러낸다고 보고, 그 좌절을 의지박약이 아니라 인간 조건의 확인으로, 나아가 신선술의 실패를 실패가 아니라 성리학적 진리의 재확인으로 읽는다.",
    keyTerms: ["인(忍)한 존재", "불인함", "인간 조건의 확인", "성리학적 진리의 재확인"],
  },
  {
    id: 15,
    section: "main",
    text: "나는 이들이 복원한 독자의 지평을 그 층위에서는 타당하다고 인정한다.",
    keyTerms: ["독자의 지평", "그 층위", "타당"],
  },
  {
    id: 16,
    section: "main",
    text: "그러나 나는 저자의 의도가 고정되는 층위에서는 이 결론을 받아들이지 않는다.",
    keyTerms: ["저자의 의도", "고정되는 층위", "받아들이지 않는다"],
  },
  {
    id: 17,
    section: "main",
    text: "통상 논자들은 이 작품을 전계(傳系) 한문소설로 다루므로, 나는 전(傳)이 본디 말미의 논찬(論贊)에 필자의 평을 직접 싣는 양식이라는 점에 주목한다.",
    keyTerms: ["전계(傳系) 한문소설", "전(傳)", "논찬(論贊)", "필자의 평"],
  },
  {
    id: 18,
    section: "main",
    text: "작품을 닫는 '허자왈'에서 허균은 다름 아닌 '참지 않았기에' 거의 다 이룬 공을 망가뜨렸다고 패인을 명토 박고, 속히 이루려 하지만 않았다면 그가 선인들과 어깨를 나란히 했으리라고 단정하면서 애석해한다(98%).",
    keyTerms: ["허자왈", "참지 않았기에", "패인", "선인들과 어깨", "애석해한다"],
  },
  {
    id: 19,
    section: "main",
    text: "만약 허균이 불인함을 긍정할 미덕으로 삼았다면, 그는 그 좌절을 차라리 다행으로 그렸을 터이다.",
    keyTerms: ["불인함", "긍정할 미덕", "좌절", "다행"],
  },
  {
    id: 20,
    section: "main",
    text: "더욱이 허균은 결말에서 \"나 허균은 공주에서 파직되어 부안에 살고 있었다\"며 자신을 실명과 실연대로 못 박아(만력 무신년) 서술자를 역사적 저자에 포개므로, '허자는 구성된 페르소나일 뿐'이라는 반론도 텍스트 안에서 막힌다.",
    keyTerms: ["나 허균", "실명과 실연대", "역사적 저자", "구성된 페르소나", "텍스트 안에서 막힌다"],
  },
  {
    id: 21,
    section: "main",
    text: "또한 이 독법은 '성리학 교의를 따르는 독자에게는'이라는 외부 전제를 경유해야 비로소 실패를 진리의 재확인으로 바꾸어 놓지만, 나는 남궁두 자신의 진단과 필자의 논평이 만난다는 텍스트 내부의 근거만으로 내 해석을 닫을 수 있다.",
    keyTerms: ["성리학 교의", "외부 전제", "진리의 재확인", "텍스트 내부의 근거"],
  },
  {
    id: 22,
    section: "main",
    text: '화자가 패인을 "참지 않음"으로 직접 명명해 둔 만큼, 내 해석의 핵심은 그 명명을 옮기는 데 있지 않고 그것을 한 겹 갈라 읽는 데 있다.',
    keyTerms: ["패인", "참지 않음", "직접 명명", "한 겹 갈라 읽는 데"],
  },
  {
    id: 23,
    section: "main",
    text: '실패의 원인은 "초월을 원한 것" 자체가 아니다.',
    keyTerms: ["실패의 원인", "초월을 원한 것", "자체가 아니다"],
  },
  {
    id: 24,
    section: "main",
    text: "장로 또한 초월을 원했고 11년 수련 끝에 신태(神胎)를 이루었으니(48%), 초월을 바라는 의지는 결격 사유가 아니다.",
    keyTerms: ["장로", "11년 수련", "신태(神胎)", "초월을 바라는 의지", "결격 사유"],
  },
  {
    id: 25,
    section: "main",
    text: "허균이 가르는 것은 '수행하려는 의지'와 '지금 당장 이루려는 조급함'이고, 忍은 후자를 누르는 힘이다.",
    keyTerms: ["수행하려는 의지", "지금 당장 이루려는 조급함", "忍", "누르는 힘"],
  },
  {
    id: 26,
    section: "main",
    text: "그러므로 허균이 내놓는 답은 욕망을 긍정하라는 것이 아니라, 가장 높은 것을 향한 의지조차 조급함으로 변질되는 순간 스스로를 무너뜨린다는 것이다.",
    keyTerms: ["허균이 내놓는 답", "욕망을 긍정", "가장 높은 것을 향한 의지", "조급함", "스스로를 무너뜨린다"],
  },
  {
    id: 27,
    section: "plan",
    text: "발제문 수정 계획",
    keyTerms: ["발제문", "수정 계획"],
  },
  {
    id: 28,
    section: "plan",
    text: "본 발제문은 일부 논지 차원의 수정을 필요로 한다.",
    keyTerms: ["본 발제문", "논지 차원", "수정"],
  },
  {
    id: 29,
    section: "plan",
    text: "'두 개의 가짜 낙원'이라는 분석 틀과 \"어른이 된다는 것은 실재를 견디는 능력을 얻는 일\"이라는 전체 논지는 유지할 만하다고 판단하기 때문이다.",
    keyTerms: ["두 개의 가짜 낙원", "분석 틀", "실재를 견디는 능력", "전체 논지"],
  },
  {
    id: 30,
    section: "plan",
    text: "수정의 대상은 장정일 『아담이 눈뜰 때』를 다룬 본 발제문 가운데, 2장 말미에서 타자기 구매(p.157)를 '제3의 선택'으로 명명하고도 그 의미를 충분히 전개하지 못한 결말부다.",
    keyTerms: ["장정일", "아담이 눈뜰 때", "타자기 구매", "제3의 선택", "결말부"],
  },
  {
    id: 31,
    section: "plan",
    text: "수정이 필요한 이유는, 현재 글이 기존 질서와 자유를 '가짜 낙원'으로 부정하는 진단에 분량 대부분을 할애한 데 비해, 그 부정 이후 인간이 무엇을 할 수 있는가라는 긍정의 논지는 마지막 단락에서 단언적으로만 제시되기 때문이다.",
    keyTerms: ["기존 질서와 자유", "가짜 낙원", "부정 이후", "긍정의 논지", "단언적"],
  },
  {
    id: 32,
    section: "plan",
    text: "'낙원 없는 자리에서 그래도 쓴다'는 결론이 작품 분석으로 뒷받침되지 않아, 두 낙원을 무너뜨리는 비판의 힘에 비해 결론이 가볍게 얹혀 있다.",
    keyTerms: ["낙원 없는 자리", "그래도 쓴다", "작품 분석", "비판의 힘", "가볍게 얹혀 있다"],
  },
  {
    id: 33,
    section: "plan",
    text: "수정의 방향은 두 낙원을 부정하는 구도는 유지하되, '쓰기'를 제3의 길로 적극 논증하는 쪽이다.",
    keyTerms: ["수정의 방향", "두 낙원", "쓰기", "제3의 길", "적극 논증"],
  },
  {
    id: 34,
    section: "plan",
    text: "앞서 자유를 실재로부터의 '감각적 마비'로 규정했으므로, 쓰기는 거꾸로 실재를 직시하며 대면하는 실천이라는 대조를 명시한다.",
    keyTerms: ["감각적 마비", "쓰기", "실재를 직시", "대면하는 실천", "대조"],
  },
  {
    id: 35,
    section: "plan",
    text: "이를 뒷받침할 근거로는 타자기가 서두의 세 욕망(타자기·뭉크·턴테이블, p.12)에서 결말의 구매(p.157)로 수미상관을 이루는 구조, 『데미안』의 싱클레어와 달리 안내자가 모두 사라진 뒤 홀로 남은 아담의 처지, 그리고 \"썩어가는 세계\"를 외면하지 않고 기록하려는 행위로서의 쓰기를 활용한다.",
    keyTerms: ["세 욕망", "수미상관", "싱클레어", "홀로 남은 아담", "기록하려는 행위"],
  },
];

const ORDER_SETS: Record<
  SectionFilter,
  {
    answers: string[];
    options: string[];
    hint: string;
  }
> = {
  all: {
    answers: [
      "본문 제목과 문제 설정",
      "남궁두 실패 원인 제시",
      "수련 과정 근거",
      "忍·不忍 독법 소개",
      "저자 의도 기준의 반박",
      "최종 결론",
      "발제문 수정 필요성",
      "수정 대상",
      "수정 이유",
      "수정 방향과 근거",
    ],
    options: [
      "수정 이유",
      "남궁두 실패 원인 제시",
      "발제문 수정 필요성",
      "최종 결론",
      "수련 과정 근거",
      "본문 제목과 문제 설정",
      "저자 의도 기준의 반박",
      "수정 방향과 근거",
      "忍·不忍 독법 소개",
      "수정 대상",
    ],
    hint:
      "전체 글의 흐름을 제목/문제 → 해석 → 근거 → 반론 → 반박 → 결론 → 수정 계획 순서로 배열하세요.",
  },
  main: {
    answers: [
      "문제 설정",
      "자기 해석",
      "수련 과정 근거",
      "대안 독법 소개",
      "대안 독법 부분 인정",
      "저자 의도 기준의 반박",
      "텍스트 내부 근거 정리",
      "최종 결론",
    ],
    options: [
      "대안 독법 부분 인정",
      "수련 과정 근거",
      "최종 결론",
      "문제 설정",
      "텍스트 내부 근거 정리",
      "자기 해석",
      "저자 의도 기준의 반박",
      "대안 독법 소개",
    ],
    hint:
      "본문의 큰 구조를 문제 설정 → 자기 해석 → 작품 근거 → 대안 독법 → 인정 → 반박 → 내부 근거 → 결론 흐름으로 배열하세요.",
  },
  plan: {
    answers: [
      "수정 필요성 제시",
      "유지할 논지 확인",
      "수정 대상 특정",
      "수정 이유 설명",
      "현재 결론의 약점 진단",
      "수정 방향 제시",
      "구체적 근거 제시",
    ],
    options: [
      "수정 이유 설명",
      "수정 방향 제시",
      "유지할 논지 확인",
      "구체적 근거 제시",
      "수정 필요성 제시",
      "현재 결론의 약점 진단",
      "수정 대상 특정",
    ],
    hint:
      "발제문 수정 계획의 흐름을 필요성 → 유지할 논지 → 수정 대상 → 이유 → 약점 → 방향 → 근거 순서로 배열하세요.",
  },
};

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
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingAnswer, setTypingAnswer] = useState("");
  const [blankAnswers, setBlankAnswers] = useState(["", "", ""]);
  const [orderAnswer, setOrderAnswer] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [checked, setChecked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [solvedIds, setSolvedIds] = useState<number[]>([]);

  const filteredItems = useMemo(() => {
    if (sectionFilter === "all") return QUIZ_ITEMS;
    return QUIZ_ITEMS.filter((item) => item.section === sectionFilter);
  }, [sectionFilter]);

  const currentItem = filteredItems[currentIndex] ?? filteredItems[0];
  const activeOrderSet = ORDER_SETS[sectionFilter];

  const progressPercent = useMemo(() => {
    const visibleSolvedCount = filteredItems.filter((item) =>
      solvedIds.includes(item.id)
    ).length;

    return Math.round((visibleSolvedCount / filteredItems.length) * 100);
  }, [filteredItems, solvedIds]);

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
    const correct = activeOrderSet.answers.filter(
      (answer, index) => orderAnswer[index] === answer
    ).length;

    return Math.round((correct / activeOrderSet.answers.length) * 100);
  }, [activeOrderSet.answers, orderAnswer]);

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
      setChecked(true);
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
    const nextIndex =
      currentIndex + 1 >= filteredItems.length ? 0 : currentIndex + 1;
    goToIndex(nextIndex);
  }

  function goPrev() {
    const nextIndex =
      currentIndex - 1 < 0 ? filteredItems.length - 1 : currentIndex - 1;
    goToIndex(nextIndex);
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    resetAnswerOnly();
  }

  function switchSection(nextSection: SectionFilter) {
    setSectionFilter(nextSection);
    setCurrentIndex(0);
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
    return "구성 순서가 아직 섞여 있습니다. 각 섹션의 논리 흐름을 다시 확인하세요.";
  }

  return (
    <main className={styles.wrapper}>
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Namgung Quiz Lab</p>
          <h1 className={styles.heroTitle}>남궁선생전 암기 퀴즈</h1>
          <p className={styles.heroLead}>
            「이루려는 마음이 무너지는 순간」 본문과 「발제문 수정 계획」을
            문장 단위로 외우기 위한 타자연습·빈칸·구성순서·플래시카드
            페이지입니다.
          </p>

          <div className={styles.heroStats}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{filteredItems.length}</span>
              <span className={styles.statLabel}>현재 문장</span>
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
            <p className={styles.panelLabel}>연습 범위</p>

            {(["all", "main", "plan"] as SectionFilter[]).map((section) => (
              <button
                key={section}
                type="button"
                className={`${styles.modeButton} ${
                  sectionFilter === section ? styles.modeButtonActive : ""
                }`}
                onClick={() => switchSection(section)}
              >
                {SECTION_LABELS[section]}
              </button>
            ))}
          </div>

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
              {filteredItems.map((item, index) => (
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
                {SECTION_LABELS[currentItem.section]} · 문장 {currentItem.id} /{" "}
                {QUIZ_ITEMS.length}
              </p>
              <h2 className={styles.quizTitle}>
                {mode === "typing" && "보고 외운 뒤, 원문을 직접 타자 입력하세요."}
                {mode === "blank" && "빈칸에 들어갈 핵심 표현을 입력하세요."}
                {mode === "order" && "선택한 범위의 논리 흐름을 순서대로 배열하세요."}
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
                <p className={styles.sourceText}>
                  {renderTextWithHanja(currentItem.text)}
                </p>
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
                <p className={styles.sourceText}>
                  {renderTextWithHanja(makeBlankText(currentItem))}
                </p>
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
                  {activeOrderSet.hint} 잘못 넣은 항목은 아래 선택된 카드에서 다시
                  누르면 빠집니다.
                </p>
              </div>

              <div className={styles.optionWrap}>
                {activeOrderSet.options.map((option) => (
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
                  {activeOrderSet.answers.map((answer) => (
                    <li key={answer}>{answer}</li>
                  ))}
                </ol>
              ) : (
                <p className={styles.answerText}>
                  {renderTextWithHanja(currentItem.text)}
                </p>
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