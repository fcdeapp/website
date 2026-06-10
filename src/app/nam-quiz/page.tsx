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

type AnchorItem = {
  id: number;
  prompt: string;
  answer: string;
  accept?: string[];
};

type Mode = "typing" | "blank" | "firstchar" | "order" | "anchor" | "flashcard";
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
    text: "문턱에서 무너진 생애를 어떻게 결산할 것인가",
    keyTerms: ["문턱에서 무너진", "생애", "결산"],
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
    text: "내가 응하려는 작품은 허균의 「남궁선생전」이고, 구성하려는 문제는 이렇다.",
    keyTerms: ["응하려는 작품", "남궁선생전", "구성하려는 문제"],
  },
  {
    id: 4,
    section: "main",
    text: "무신년(1608) 가을, 허균은 공주목사에서 파직되어 부안에 물러나 있었다.",
    keyTerms: ["무신년(1608)", "공주목사", "부안"],
  },
  {
    id: 5,
    section: "main",
    text: "거듭된 파직으로 벼슬길이 막혀, 당대 제일로 자부하던 재능을 펼 자리를 그는 좀처럼 얻지 못했다.",
    keyTerms: ["거듭된 파직", "당대 제일", "재능을 펼 자리"],
  },
  {
    id: 6,
    section: "main",
    text: "높은 뜻을 품고도 끝까지 가닿지 못한 생애를 무엇으로 결산할 것인가 — 막을 수 있었던 헛된 낭비인가, 아니면 그 미완 속에 값있는 무엇이 남는가.",
    keyTerms: ["높은 뜻", "헛된 낭비", "값있는 무엇"],
  },
  {
    id: 7,
    section: "main",
    text: "이 물음과 마주한 허균은, 마침 자기 집을 걸어서 찾아온 남궁두의 일생을 빌려 거기에 답한다.",
    keyTerms: ["이 물음", "걸어서 찾아온", "남궁두의 일생"],
  },
  {
    id: 8,
    section: "main",
    text: "내가 내놓는 답은, 남궁두를 무너뜨린 것이 재능도 식색(食色) 같은 욕망도 아니라 완성을 향한 조급함이고, 따라서 그 좌절은 피할 수 있었던 자초의 비극이라는 것이다.",
    keyTerms: ["식색(食色)", "완성을 향한 조급함", "자초의 비극"],
  },
  {
    id: 9,
    section: "main",
    text: '장로가 그를 "그릇이 좋으니 욕념만 끊으면 된다"고 인정한(30%) 뒤, 남궁두는 잠과 곡식을 끊는 고통까지 견뎌 냈다.',
    keyTerms: ["그릇이 좋으니", "욕념", "잠과 곡식"],
  },
  {
    id: 10,
    section: "main",
    text: '그러나 단(丹)이 맺히려는 결정적 순간 "속히 이루고 싶은 마음"이 갑자기 일어 화기가 치솟으면서 모든 것이 어그러진다(35%).',
    keyTerms: ["단(丹)", "속히 이루고 싶은 마음", "화기"],
  },
  {
    id: 11,
    section: "main",
    text: '장로가 식색이 아니라도 "일체의 망상이 진(眞)에 해롭다"고 경고했듯(40%), 그를 무너뜨린 것은 빨리 도달하려는 마음 그 자체였다.',
    keyTerms: ["일체의 망상", "진(眞)", "빨리 도달하려는 마음"],
  },
  {
    id: 12,
    section: "main",
    text: '산을 내려온 뒤 남궁두 스스로 "속히 이루려 하다가 결국 뜻을 이루지 못했다"고 진단하니(90%), 필자도 같은 자리에서 그를 본다.',
    keyTerms: ["산을 내려온 뒤", "속히 이루려 하다가", "필자도 같은 자리"],
  },
  {
    id: 13,
    section: "main",
    text: "곧 허균은 이 생애를, 거의 다 이룬 공을 스스로 망가뜨린 애석한 낭비로 결산한다.",
    keyTerms: ["거의 다 이룬 공", "애석한 낭비", "결산한다"],
  },
  {
    id: 14,
    section: "main",
    text: "이와 달리 그 좌절을 값있는 것으로 결산하는 독법이 있다.",
    keyTerms: ["그 좌절", "값있는 것", "독법"],
  },
  {
    id: 15,
    section: "main",
    text: "이 논자들은 忍이 '참을성'이자 '잔인함'을 뜻하고 不忍이 맹자의 불인인지심(不忍人之心)을 환기함을 복원한 뒤, 남궁두가 끝내 욕망을 참지 못하는 불인함, 곧 인간성을 드러낸다고 보아, 그 좌절을 신선술의 실패가 아니라 성리학적 진리의 재확인으로 읽는다.",
    keyTerms: ["참을성", "잔인함", "불인인지심(不忍人之心)"],
  },
  {
    id: 16,
    section: "main",
    text: "이렇게 읽으면 남궁두는 미완에 그쳤어도 인간으로 남았다는 점에서 구제된다.",
    keyTerms: ["미완에 그쳤어도", "인간으로 남았다", "구제된다"],
  },
  {
    id: 17,
    section: "main",
    text: "나는 이 의미론적 통찰이 그 층위에서는 타당하다고 인정한다.",
    keyTerms: ["의미론적 통찰", "그 층위", "타당"],
  },
  {
    id: 18,
    section: "main",
    text: "그러나 그 통찰을 '저자의 결산'으로 옮기는 대목에서 나는 갈라선다.",
    keyTerms: ["저자의 결산", "옮기는 대목", "갈라선다"],
  },
  {
    id: 19,
    section: "main",
    text: "忍의 의미를 복원한 것은 옳되, 거기서 '허균이 그 생애를 값있게 결산했다'로 건너가는 추론이 작품 말미의 논찬(論贊)과 어긋나기 때문이다.",
    keyTerms: ["복원한 것은 옳되", "건너가는 추론", "논찬(論贊)"],
  },
  {
    id: 20,
    section: "main",
    text: "통상 이 작품은 전계(傳系) 한문소설로 다뤄지거니와, 전(傳)은 말미에 필자의 평을 직접 싣는 양식이다.",
    keyTerms: ["전계(傳系) 한문소설", "전(傳)", "필자의 평"],
  },
  {
    id: 21,
    section: "main",
    text: "'허자왈'에서 허균은 '참지 않았기에' 거의 다 이룬 공을 망가뜨렸다고 패인을 명토 박고, 속히 이루려 하지만 않았다면 그가 선인들과 어깨를 나란히 했으리라 애석해한다(98%).",
    keyTerms: ["허자왈", "참지 않았기에", "선인들과 어깨"],
  },
  {
    id: 22,
    section: "main",
    text: "불인함을 미덕 삼아 그 생애를 값있다 보았다면, 그 좌절을 차라리 다행으로 그렸을 것이다.",
    keyTerms: ["불인함을 미덕", "값있다 보았다면", "차라리 다행"],
  },
  {
    id: 23,
    section: "main",
    text: "더욱이 허균은 글 끝에서 자신을 무신년 공주 파직의 처지로 명기해 서술자를 역사적 저자에 포개므로, '허자는 구성된 페르소나일 뿐'이라는 반론도 막힌다.",
    keyTerms: ["무신년 공주 파직", "역사적 저자", "구성된 페르소나"],
  },
  {
    id: 24,
    section: "main",
    text: "낭비의 원인은 초월을 원한 것 자체가 아니다.",
    keyTerms: ["낭비의 원인", "초월", "자체가 아니다"],
  },
  {
    id: 25,
    section: "main",
    text: "장로 또한 초월을 원했고 11년 수련 끝에 신태(神胎)를 이루었으니(48%), 의지 자체는 결격 사유가 아니다.",
    keyTerms: ["11년 수련", "신태(神胎)", "결격 사유"],
  },
  {
    id: 26,
    section: "main",
    text: "허균은 욕망을 버리지 못한 인간성을 위안 삼지 않고, 가장 높은 것을 향한 의지조차 조급함으로 기우는 순간 사람은 스스로 무너진다는, 자신을 향한 뼈아픈 경계를 이 생애에 새긴다.",
    keyTerms: ["위안 삼지 않고", "조급함으로 기우는 순간", "뼈아픈 경계"],
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
    keyTerms: ["두 개의 가짜 낙원", "실재를 견디는 능력", "전체 논지"],
  },
  {
    id: 30,
    section: "plan",
    text: "수정의 대상은 장정일 『아담이 눈뜰 때』를 다룬 본 발제문 가운데, 2장 말미에서 타자기 구매(p.157)를 '제3의 선택'으로 명명하고도 그 의미를 충분히 전개하지 못한 결말부다.",
    keyTerms: ["아담이 눈뜰 때", "타자기 구매", "제3의 선택"],
  },
  {
    id: 31,
    section: "plan",
    text: "수정이 필요한 이유는, 현재 글이 기존 질서와 자유를 '가짜 낙원'으로 부정하는 진단에 분량 대부분을 할애한 데 비해, 그 부정 이후 인간이 무엇을 할 수 있는가라는 긍정의 논지는 마지막 단락에서 단언적으로만 제시되기 때문이다.",
    keyTerms: ["기존 질서와 자유", "긍정의 논지", "단언적"],
  },
  {
    id: 32,
    section: "plan",
    text: "'낙원 없는 자리에서 그래도 쓴다'는 결론이 작품 분석으로 뒷받침되지 않아, 두 낙원을 무너뜨리는 비판의 힘에 비해 결론이 가볍게 얹혀 있다.",
    keyTerms: ["그래도 쓴다", "작품 분석", "가볍게 얹혀 있다"],
  },
  {
    id: 33,
    section: "plan",
    text: "수정의 방향은 두 낙원을 부정하는 구도는 유지하되, '쓰기'를 제3의 길로 적극 논증하는 쪽이다.",
    keyTerms: ["수정의 방향", "쓰기", "제3의 길"],
  },
  {
    id: 34,
    section: "plan",
    text: "앞서 자유를 실재로부터의 '감각적 마비'로 규정했으므로, 쓰기는 거꾸로 실재를 직시하며 대면하는 실천이라는 대조를 명시한다.",
    keyTerms: ["감각적 마비", "실재를 직시", "대조"],
  },
  {
    id: 35,
    section: "plan",
    text: "이를 뒷받침할 근거로는 타자기가 서두의 세 욕망(타자기·뭉크·턴테이블, p.12)에서 결말의 구매(p.157)로 수미상관을 이루는 구조, 『데미안』의 싱클레어와 달리 안내자가 모두 사라진 뒤 홀로 남은 아담의 처지, 그리고 \"썩어가는 세계\"를 외면하지 않고 기록하려는 행위로서의 쓰기를 활용한다.",
    keyTerms: ["수미상관", "싱클레어", "썩어가는 세계"],
  },
];

const ANCHOR_ITEMS: AnchorItem[] = [
  {
    id: 1,
    prompt: "허균이 공주목사에서 파직된 해 (간지와 서기)",
    answer: "무신년(1608)",
    accept: ["무신년 1608", "1608 무신년", "무신년", "1608"],
  },
  { id: 2, prompt: "허균이 파직된 벼슬", answer: "공주목사" },
  { id: 3, prompt: "파직 후 허균이 물러나 있던 곳", answer: "부안" },
  {
    id: 4,
    prompt: '장로가 "그릇이 좋으니 욕념만 끊으면 된다"고 인정한 지점',
    answer: "30%",
    accept: ["30"],
  },
  {
    id: 5,
    prompt: '"속히 이루고 싶은 마음"이 일어 모든 것이 어그러지는 지점',
    answer: "35%",
    accept: ["35"],
  },
  {
    id: 6,
    prompt: '"일체의 망상이 진(眞)에 해롭다"는 경고가 나오는 지점',
    answer: "40%",
    accept: ["40"],
  },
  {
    id: 7,
    prompt: "남궁두가 스스로 패인을 진단하는 지점",
    answer: "90%",
    accept: ["90"],
  },
  {
    id: 8,
    prompt: "'허자왈' 논찬이 나오는 지점",
    answer: "98%",
    accept: ["98"],
  },
  {
    id: 9,
    prompt: "장로가 신태(神胎)를 이룬 대목의 지점",
    answer: "48%",
    accept: ["48"],
  },
  { id: 10, prompt: "장로의 수련 기간", answer: "11년", accept: ["11"] },
  {
    id: 11,
    prompt: "『아담이 눈뜰 때』에서 타자기 구매가 나오는 페이지",
    answer: "p.157",
    accept: ["157", "p157"],
  },
  {
    id: 12,
    prompt: "서두의 세 욕망이 나오는 페이지",
    answer: "p.12",
    accept: ["12", "p12"],
  },
  {
    id: 13,
    prompt: "서두의 세 욕망 (세 가지)",
    answer: "타자기·뭉크·턴테이블",
    accept: ["타자기 뭉크 턴테이블"],
  },
  {
    id: 14,
    prompt: "장로가 남궁두를 인정한 발언 (인용 그대로)",
    answer: "그릇이 좋으니 욕념만 끊으면 된다",
  },
  {
    id: 15,
    prompt: "단(丹)이 맺히려는 순간 갑자기 일어난 마음 (인용 그대로)",
    answer: "속히 이루고 싶은 마음",
  },
  {
    id: 16,
    prompt: "식색이 아니라도 해롭다고 한 장로의 경고 (인용 그대로)",
    answer: "일체의 망상이 진(眞)에 해롭다",
    accept: ["일체의 망상이 진에 해롭다"],
  },
  {
    id: 17,
    prompt: "산을 내려온 뒤 남궁두의 자기 진단 (인용 그대로)",
    answer: "속히 이루려 하다가 결국 뜻을 이루지 못했다",
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
      "본문: 허균의 처지와 문제 설정",
      "본문: 내 답 — 조급함, 자초의 비극",
      "본문: 수련 과정 근거(30→35→40→90%)",
      "본문: 애석한 낭비 결산",
      "본문: 忍·不忍 독법과 부분 인정",
      "본문: 논찬(98%) 근거의 반박",
      "본문: 결론 — 자신을 향한 경계",
      "계획: 수정 필요성과 유지할 논지",
      "계획: 수정 대상과 이유",
      "계획: 수정 방향과 세 근거",
    ],
    options: [
      "계획: 수정 대상과 이유",
      "본문: 내 답 — 조급함, 자초의 비극",
      "본문: 결론 — 자신을 향한 경계",
      "계획: 수정 필요성과 유지할 논지",
      "본문: 수련 과정 근거(30→35→40→90%)",
      "본문: 허균의 처지와 문제 설정",
      "본문: 논찬(98%) 근거의 반박",
      "계획: 수정 방향과 세 근거",
      "본문: 忍·不忍 독법과 부분 인정",
      "본문: 애석한 낭비 결산",
    ],
    hint:
      "전체 글의 흐름을 문제 설정 → 내 답 → 근거 → 결산 → 대안 독법 → 반박 → 결론 → 수정 계획 순서로 배열하세요.",
  },
  main: {
    answers: [
      "허균의 처지와 문제 설정",
      "내 답: 조급함, 자초의 비극",
      "수련 근거: 인정(30%)→좌절(35%)→경고(40%)",
      "자기 진단(90%)과 애석한 낭비 결산",
      "대안 독법: 忍·不忍과 인간성",
      "의미론적 통찰의 부분 인정",
      "논찬(98%) 근거의 반박",
      "페르소나 반론 차단",
      "초월 의지와 조급함의 구분(48%)",
      "결론: 자신을 향한 뼈아픈 경계",
    ],
    options: [
      "의미론적 통찰의 부분 인정",
      "수련 근거: 인정(30%)→좌절(35%)→경고(40%)",
      "결론: 자신을 향한 뼈아픈 경계",
      "허균의 처지와 문제 설정",
      "초월 의지와 조급함의 구분(48%)",
      "내 답: 조급함, 자초의 비극",
      "논찬(98%) 근거의 반박",
      "대안 독법: 忍·不忍과 인간성",
      "페르소나 반론 차단",
      "자기 진단(90%)과 애석한 낭비 결산",
    ],
    hint:
      "본문의 구조를 문제 설정 → 내 답 → 수련 근거 → 낭비 결산 → 대안 독법 → 인정 → 논찬 반박 → 페르소나 차단 → 초월/조급함 구분 → 결론 흐름으로 배열하세요.",
  },
  plan: {
    answers: [
      "수정 필요성과 유지할 논지",
      "수정 대상: 결말부 특정",
      "수정 이유: 단언적 결론",
      "약점 진단: 가볍게 얹힌 결론",
      "수정 방향: 쓰기를 제3의 길로",
      "감각적 마비와의 대조 명시",
      "세 근거: 수미상관·아담·기록",
    ],
    options: [
      "수정 이유: 단언적 결론",
      "수정 방향: 쓰기를 제3의 길로",
      "수정 필요성과 유지할 논지",
      "세 근거: 수미상관·아담·기록",
      "감각적 마비와의 대조 명시",
      "약점 진단: 가볍게 얹힌 결론",
      "수정 대상: 결말부 특정",
    ],
    hint:
      "발제문 수정 계획의 흐름을 필요성/유지 논지 → 대상 → 이유 → 약점 → 방향 → 대조 명시 → 근거 순서로 배열하세요.",
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
    .replace(/[—–―ーｰ\-]/g, "")
    .replace(/[·•]/g, "")
    .replace(/[()（）]/g, "")
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

function makeFirstCharCue(text: string) {
  return text
    .split(" ")
    .map((word) => {
      const chars = Array.from(word);

      return chars
        .map((ch, index) => {
          if (index === 0) return ch;
          return /[\p{L}\p{N}]/u.test(ch) ? "○" : ch;
        })
        .join("");
    })
    .join(" ");
}

type DiffOp = { ch: string; type: "same" | "diff" };

function diffChars(userRaw: string, targetRaw: string) {
  const a = Array.from(userRaw.replace(/\s+/g, " ").trim());
  const b = Array.from(targetRaw.replace(/\s+/g, " ").trim());

  if (a.length === 0 || b.length === 0) return null;
  if (a.length > 600 || b.length > 600) return null;

  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array<number>(n + 1).fill(0)
  );

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const userOps: DiffOp[] = [];
  const targetOps: DiffOp[] = [];
  let i = m;
  let j = n;

  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      userOps.push({ ch: a[i - 1], type: "same" });
      targetOps.push({ ch: b[j - 1], type: "same" });
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      userOps.push({ ch: a[i - 1], type: "diff" });
      i -= 1;
    } else {
      targetOps.push({ ch: b[j - 1], type: "diff" });
      j -= 1;
    }
  }

  while (i > 0) {
    userOps.push({ ch: a[i - 1], type: "diff" });
    i -= 1;
  }

  while (j > 0) {
    targetOps.push({ ch: b[j - 1], type: "diff" });
    j -= 1;
  }

  userOps.reverse();
  targetOps.reverse();

  return { userOps, targetOps };
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

function renderDiffLine(ops: DiffOp[], errorClass: string): ReactNode[] {
  return ops.map((op, index) => {
    if (op.type === "same") {
      return <span key={index}>{op.ch}</span>;
    }

    return (
      <span key={index} className={errorClass}>
        {op.ch === " " ? "␣" : op.ch}
      </span>
    );
  });
}

export default function NamQuizPage() {
  const [mode, setMode] = useState<Mode>("typing");
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>("all");
  const [wrongOnly, setWrongOnly] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [typingAnswer, setTypingAnswer] = useState("");
  const [blankAnswers, setBlankAnswers] = useState(["", "", ""]);
  const [orderAnswer, setOrderAnswer] = useState<string[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [checked, setChecked] = useState(false);
  const [hideSource, setHideSource] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [solvedIds, setSolvedIds] = useState<number[]>([]);
  const [wrongIds, setWrongIds] = useState<number[]>([]);
  const [anchorIndex, setAnchorIndex] = useState(0);
  const [anchorAnswer, setAnchorAnswer] = useState("");
  const [anchorChecked, setAnchorChecked] = useState(false);
  const [anchorCorrectCount, setAnchorCorrectCount] = useState(0);

  const filteredItems = useMemo(() => {
    let items =
      sectionFilter === "all"
        ? QUIZ_ITEMS
        : QUIZ_ITEMS.filter((item) => item.section === sectionFilter);

    if (wrongOnly) {
      items = items.filter((item) => wrongIds.includes(item.id));
    }

    return items;
  }, [sectionFilter, wrongOnly, wrongIds]);

  const currentItem: QuizItem | null =
    filteredItems[currentIndex] ?? filteredItems[0] ?? null;
  const prevItem: QuizItem | null =
    currentIndex > 0 ? filteredItems[currentIndex - 1] ?? null : null;
  const activeOrderSet = ORDER_SETS[sectionFilter];
  const anchorItem = ANCHOR_ITEMS[anchorIndex];

  const progressPercent = useMemo(() => {
    const visibleSolvedCount = filteredItems.filter((item) =>
      solvedIds.includes(item.id)
    ).length;

    if (filteredItems.length === 0) return 0;
    return Math.round((visibleSolvedCount / filteredItems.length) * 100);
  }, [filteredItems, solvedIds]);

  const typingScore = useMemo(() => {
    if (!currentItem) return 0;
    return getSimilarity(typingAnswer, currentItem.text);
  }, [typingAnswer, currentItem]);

  const blankScore = useMemo(() => {
    if (!currentItem) return 0;

    const targets = getBlankAnswers(currentItem);
    const correct = targets.filter(
      (target, index) =>
        normalize(blankAnswers[index] || "") === normalize(target)
    ).length;

    if (targets.length === 0) return 0;
    return Math.round((correct / targets.length) * 100);
  }, [blankAnswers, currentItem]);

  const orderScore = useMemo(() => {
    const correct = activeOrderSet.answers.filter(
      (answer, index) => orderAnswer[index] === answer
    ).length;

    return Math.round((correct / activeOrderSet.answers.length) * 100);
  }, [activeOrderSet.answers, orderAnswer]);

  const anchorIsCorrect = useMemo(() => {
    if (!anchorItem) return false;

    const candidates = [anchorItem.answer, ...(anchorItem.accept ?? [])];

    return candidates.some(
      (candidate) =>
        normalize(anchorAnswer) === normalize(candidate) ||
        getSimilarity(anchorAnswer, candidate) >= 92
    );
  }, [anchorAnswer, anchorItem]);

  const isRecallMode = mode === "typing" || mode === "firstchar";

  const diffResult = useMemo(() => {
    if (!checked || !isRecallMode || !currentItem) return null;
    if (!typingAnswer.trim()) return null;
    return diffChars(typingAnswer, currentItem.text);
  }, [checked, isRecallMode, typingAnswer, currentItem]);

  const activeScore =
    mode === "blank" ? blankScore : mode === "order" ? orderScore : typingScore;

  function markSolved(isCorrect: boolean) {
    setChecked(true);

    if (!currentItem) return;

    if (isCorrect) {
      setSolvedIds((prev) => {
        if (prev.includes(currentItem.id)) return prev;
        return [...prev, currentItem.id];
      });
      setWrongIds((prev) => prev.filter((id) => id !== currentItem.id));
      setCorrectCount((prev) => prev + 1);
      return;
    }

    setWrongIds((prev) => {
      if (prev.includes(currentItem.id)) return prev;
      return [...prev, currentItem.id];
    });
  }

  function handleCheck(event?: FormEvent) {
    event?.preventDefault();

    if (isRecallMode) {
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

  function handleAnchorCheck(event?: FormEvent) {
    event?.preventDefault();

    if (anchorChecked) return;

    setAnchorChecked(true);

    if (anchorIsCorrect) {
      setAnchorCorrectCount((prev) => prev + 1);
    }
  }

  function resetAnswerOnly() {
    setTypingAnswer("");
    setBlankAnswers(["", "", ""]);
    setOrderAnswer([]);
    setShowAnswer(false);
    setChecked(false);
  }

  function resetAnchorOnly() {
    setAnchorAnswer("");
    setAnchorChecked(false);
    setShowAnswer(false);
  }

  function goToIndex(nextIndex: number) {
    setCurrentIndex(nextIndex);
    resetAnswerOnly();
  }

  function goNext() {
    if (mode === "anchor") {
      setAnchorIndex((prev) =>
        prev + 1 >= ANCHOR_ITEMS.length ? 0 : prev + 1
      );
      resetAnchorOnly();
      return;
    }

    if (filteredItems.length === 0) return;

    const nextIndex =
      currentIndex + 1 >= filteredItems.length ? 0 : currentIndex + 1;
    goToIndex(nextIndex);
  }

  function goPrev() {
    if (mode === "anchor") {
      setAnchorIndex((prev) =>
        prev - 1 < 0 ? ANCHOR_ITEMS.length - 1 : prev - 1
      );
      resetAnchorOnly();
      return;
    }

    if (filteredItems.length === 0) return;

    const nextIndex =
      currentIndex - 1 < 0 ? filteredItems.length - 1 : currentIndex - 1;
    goToIndex(nextIndex);
  }

  function switchMode(nextMode: Mode) {
    setMode(nextMode);
    setHideSource(false);
    resetAnswerOnly();
    resetAnchorOnly();
  }

  function switchSection(nextSection: SectionFilter) {
    setSectionFilter(nextSection);
    setCurrentIndex(0);
    resetAnswerOnly();
  }

  function toggleWrongOnly() {
    setWrongOnly((prev) => !prev);
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

    if (isRecallMode) {
      if (typingScore === 100)
        return "토씨까지 완벽합니다. 다음 문장으로 넘어가세요.";
      if (typingScore >= 92)
        return "정답 처리입니다. 아래 대조에서 빨간 글자(조사·문장부호)를 한 번 확인하세요.";
      if (typingScore >= 75)
        return "핵심은 맞지만 표현이 어긋납니다. 대조의 빨간 부분만 집중해서 다시 입력해 보세요.";
      return "아직 원문 구조가 흔들립니다. 빈칸 퀴즈나 플래시카드로 키워드부터 다시 잡아보세요.";
    }

    if (mode === "blank") {
      if (blankScore === 100)
        return "빈칸 정답입니다. 이제 첫글자 암송으로 전체 문장을 재현해 보세요.";
      return "빠진 핵심어가 있습니다. 정답 확인을 열어 다시 외워보세요.";
    }

    if (orderScore === 100)
      return "구성 순서 정답입니다. 답안의 큰 흐름을 잘 잡았습니다.";
    return "구성 순서가 아직 섞여 있습니다. 각 섹션의 논리 흐름을 다시 확인하세요.";
  }

  const prevTail = prevItem
    ? Array.from(prevItem.text).slice(-14).join("")
    : null;

  return (
    <main className={styles.wrapper}>
      <section className={styles.heroSection}>
        <div className={styles.heroInner}>
          <p className={styles.kicker}>Namgung Quiz Lab</p>
          <h1 className={styles.heroTitle}>남궁선생전 암기 퀴즈</h1>
          <p className={styles.heroLead}>
            「문턱에서 무너진 생애를 어떻게 결산할 것인가」 본문과 「발제문
            수정 계획」을 토씨 하나까지 외우기 위한
            타자연습·빈칸·첫글자암송·구성순서·앵커드릴·플래시카드 페이지입니다.
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
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{wrongIds.length}</span>
              <span className={styles.statLabel}>오답 문장</span>
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

            <button
              type="button"
              className={`${styles.modeButton} ${
                wrongOnly ? styles.modeButtonActive : ""
              }`}
              onClick={toggleWrongOnly}
            >
              오답만 ({wrongIds.length})
            </button>
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
                mode === "firstchar" ? styles.modeButtonActive : ""
              }`}
              onClick={() => switchMode("firstchar")}
            >
              첫글자 암송
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
                mode === "anchor" ? styles.modeButtonActive : ""
              }`}
              onClick={() => switchMode("anchor")}
            >
              앵커 드릴
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

          <div className={styles.modePanel}>
            <p className={styles.panelLabel}>추천 2시간 루틴</p>
            <ol className={styles.routineList}>
              <li>0:00–0:50 타자연습(원문 보며) + 플래시카드</li>
              <li>0:50–1:20 빈칸 퀴즈 → 첫글자 암송</li>
              <li>1:20–1:45 타자연습(원문 가리기) + 오답만</li>
              <li>1:45–2:00 앵커 드릴 + 구성 순서</li>
            </ol>
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
                  } ${
                    solvedIds.includes(item.id)
                      ? styles.numberButtonSolved
                      : ""
                  }`}
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
                {mode === "anchor"
                  ? `앵커 드릴 · ${anchorIndex + 1} / ${ANCHOR_ITEMS.length}`
                  : currentItem
                  ? `${SECTION_LABELS[currentItem.section]} · 문장 ${
                      currentItem.id
                    } / ${QUIZ_ITEMS.length}`
                  : "선택된 문장 없음"}
              </p>
              <h2 className={styles.quizTitle}>
                {mode === "typing" &&
                  "보고 외운 뒤, 원문을 직접 타자 입력하세요. 익숙해지면 원문을 가리고 입력하세요."}
                {mode === "blank" && "빈칸에 들어갈 핵심 표현을 입력하세요."}
                {mode === "firstchar" &&
                  "어절 첫 글자만 보고 전체 문장을 복원해 입력하세요."}
                {mode === "order" &&
                  "선택한 범위의 논리 흐름을 순서대로 배열하세요."}
                {mode === "anchor" &&
                  "숫자·지점·인용 같은 앵커를 즉답으로 외우세요."}
                {mode === "flashcard" &&
                  "앞면의 핵심어를 보고 문장을 떠올리세요."}
              </h2>
            </div>

            <div className={styles.scoreBadge}>
              {mode === "flashcard" ? (
                <>
                  <span>암기</span>
                  <small>CARD</small>
                </>
              ) : mode === "anchor" ? (
                <>
                  <span>{anchorCorrectCount}</span>
                  <small>정답</small>
                </>
              ) : (
                <>
                  <span>{activeScore}</span>
                  <small>점</small>
                </>
              )}
            </div>
          </div>

          {mode !== "anchor" && mode !== "order" && !currentItem && (
            <div className={styles.emptyState}>
              이 범위에는 풀 문장이 없습니다. ‘오답만’ 필터를 끄거나 다른
              범위를 선택하세요.
            </div>
          )}

          {mode === "typing" && currentItem && (
            <form className={styles.practiceArea} onSubmit={handleCheck}>
              <div className={styles.sourceBox}>
                <p className={styles.boxLabel}>
                  {hideSource ? "원문 가림 · 단서" : "원문"}
                </p>
                {hideSource ? (
                  <p className={styles.sourceText}>
                    {prevTail
                      ? `직전 문장 끝 → …${prevTail}`
                      : "첫 문장입니다. 단서 없이 시작하세요."}
                  </p>
                ) : (
                  <p className={styles.sourceText}>
                    {renderTextWithHanja(currentItem.text)}
                  </p>
                )}
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
                  className={`${styles.secondaryButton} ${
                    hideSource ? styles.secondaryButtonActive : ""
                  }`}
                  onClick={() => setHideSource((prev) => !prev)}
                >
                  원문 {hideSource ? "보이기" : "가리기"}
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

          {mode === "blank" && currentItem && (
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

          {mode === "firstchar" && currentItem && (
            <form className={styles.practiceArea} onSubmit={handleCheck}>
              <div className={styles.sourceBox}>
                <p className={styles.boxLabel}>첫 글자 단서</p>
                <p className={styles.sourceText}>
                  {makeFirstCharCue(currentItem.text)}
                </p>
              </div>

              <label className={styles.inputLabel} htmlFor="firstchar-answer">
                전체 문장 복원
              </label>
              <textarea
                id="firstchar-answer"
                className={styles.textarea}
                value={typingAnswer}
                onChange={(event) => {
                  setTypingAnswer(event.target.value);
                  setChecked(false);
                }}
                onKeyDown={handleTextareaKeyDown}
                placeholder="첫 글자 단서만 보고 문장 전체를 입력하세요. Cmd/Ctrl + Enter로 채점할 수 있습니다."
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

          {mode === "order" && (
            <div className={styles.practiceArea}>
              <div className={styles.sourceBox}>
                <p className={styles.boxLabel}>배열할 구성</p>
                <p className={styles.sourceText}>
                  {activeOrderSet.hint} 잘못 넣은 항목은 아래 선택된 카드에서
                  다시 누르면 빠집니다.
                </p>
              </div>

              <div className={styles.optionWrap}>
                {activeOrderSet.options.map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${styles.orderOption} ${
                      orderAnswer.includes(option)
                        ? styles.orderOptionDisabled
                        : ""
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
                  <p className={styles.emptyOrder}>
                    아직 선택한 항목이 없습니다.
                  </p>
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

          {mode === "anchor" && anchorItem && (
            <form className={styles.practiceArea} onSubmit={handleAnchorCheck}>
              <div className={styles.sourceBox}>
                <p className={styles.boxLabel}>앵커 질문</p>
                <p className={styles.sourceText}>
                  {renderTextWithHanja(anchorItem.prompt)}
                </p>
              </div>

              <label className={styles.inputLabel} htmlFor="anchor-answer">
                즉답 입력
              </label>
              <input
                id="anchor-answer"
                className={styles.anchorInput}
                value={anchorAnswer}
                onChange={(event) => {
                  setAnchorAnswer(event.target.value);
                  setAnchorChecked(false);
                }}
                placeholder="숫자·지점·인용을 그대로 입력하세요. Enter로 채점합니다."
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
                  onClick={resetAnchorOnly}
                >
                  다시 입력
                </button>
              </div>

              {anchorChecked && (
                <div
                  className={`${styles.resultBox} ${
                    anchorIsCorrect ? styles.resultBoxGood : styles.resultBoxBad
                  }`}
                >
                  {anchorIsCorrect
                    ? "앵커 정답입니다. 시험에서 가장 흔들리기 쉬운 부분을 잡았습니다."
                    : "오답입니다. 정답 보기를 눌러 앵커를 다시 박아두세요."}
                </div>
              )}

              {showAnswer && (
                <div className={styles.answerBox}>
                  <p className={styles.boxLabel}>정답</p>
                  <p className={styles.answerText}>
                    {renderTextWithHanja(anchorItem.answer)}
                  </p>
                </div>
              )}
            </form>
          )}

          {mode === "flashcard" && currentItem && (
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
                핵심어만 보고 전체 문장을 먼저 소리 내어 말한 뒤, 문장 보기를
                눌러 확인하세요.
              </div>
            </div>
          )}

          {checked && isRecallMode && diffResult && (
            <div className={styles.diffBox}>
              <p className={styles.boxLabel}>토씨 대조</p>

              <p className={styles.diffLabel}>내 입력 (주황: 잘못 들어간 부분)</p>
              <p className={styles.diffLine}>
                {renderDiffLine(diffResult.userOps, styles.diffExtra)}
              </p>

              <p className={styles.diffLabel}>원문 (빨강: 빠뜨린 부분)</p>
              <p className={styles.diffLine}>
                {renderDiffLine(diffResult.targetOps, styles.diffMiss)}
              </p>

              <p className={styles.diffHint}>
                한자 병기와 따옴표 모양은 점수에서 제외되지만 대조에는
                표시됩니다. 빨간 글자만 따로 입으로 3번 반복하면 효율이
                좋습니다.
              </p>
            </div>
          )}

          {checked && mode !== "flashcard" && mode !== "anchor" && (
            <div
              className={`${styles.resultBox} ${
                activeScore >= 92 ? styles.resultBoxGood : styles.resultBoxBad
              }`}
            >
              {getResultText()}
            </div>
          )}

          {showAnswer && mode !== "anchor" && currentItem && (
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
              {mode === "anchor" ? "이전 앵커" : "이전 문장"}
            </button>
            <button
              type="button"
              className={styles.navButtonStrong}
              onClick={goNext}
            >
              {mode === "anchor" ? "다음 앵커" : "다음 문장"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}