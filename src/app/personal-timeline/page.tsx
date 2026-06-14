"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "../../styles/pages/PersonalTimeline.module.css";

type SchoolStage = {
  period: string;
  title: string;
  description: string;
  markers: string[];
};

type RouteRecord = {
  date: string;
  from: string;
  to: string;
  carrier: string; 
  label: string;
  theme: "domestic" | "asia" | "america" | "europe";
};

type City = {
  code: string;
  name: string;
  lat: number;
  lon: number;
};

type IntegratedItem = {
  period: string;
  text: string;
  tone?: "strong" | "soft" | "quiet";
};

type IntegratedSubgroup = {
  title: string;
  items: IntegratedItem[];
};

type IntegratedGroup = {
  id: string;
  title: string;
  period: string;
  summary: string;
  anchor: { x: number; y: number };
  subgroups: IntegratedSubgroup[];
};

type MonthBlock = {
  label: string;
  items: string[];
};

type MonthlyRecord = {
  month: string;
  title: string;
  headline: string;
  blocks: MonthBlock[];
};

const schoolStages: SchoolStage[] = [
  {
    period: "초등학교 · 2008.03 ~ 2014.02",
    title: "초등학교 시기",
    description:
      "제공된 항공 기록 기준으로 괌, 미국 서부, 싱가포르, 유럽, 태국, 제주, 미국 동부·플로리다 등 이동 경험이 누적된 시기. 학교명은 제공되지 않았으므로 학제 기준으로만 정리했다.",
    markers: ["가족 여행", "해외 경험", "초기 이동 기록"],
  },
  {
    period: "중학교 · 2014.03 ~ 2017.02",
    title: "중학교 시기",
    description:
      "홍콩, 유럽, 미국, 이탈리아, 스위스, 일본 등 장거리 여행 기록이 이어진 시기. 이후 고등학교·대입 준비로 넘어가는 중간 단계로 정리했다.",
    markers: ["홍콩", "유럽", "미국", "일본"],
  },
  {
    period: "고등학교 · 2017.03 ~ 2020.02",
    title: "고등학교 시기",
    description:
      "2017년 일본·제주·유럽, 2018년 일본, 2019년 말 미국 뉴욕행 기록이 확인된다. 2020년 재수종합 진입 전까지의 대입 준비기로 정리했다.",
    markers: ["대입 준비", "국내외 이동", "뉴욕행"],
  },
  {
    period: "재수 · 2020.01 ~ 2020.12",
    title: "시대인재 재수종합",
    description:
      "사용자가 직접 제시한 2020년 재수종합 기간. 2020년 2월 JFK-ICN 귀국 이후 국내에서 재수 생활로 들어간 흐름으로 정리했다.",
    markers: ["시대인재", "대입 재도전", "국내 집중"],
  },
  {
    period: "대학 · 2021.03 ~ 현재",
    title: "서울대학교 건축학과·건축공학 흐름",
    description:
      "2021년 대학입학 이후 2022년부터 건축사, 건축환경계획, 스튜디오, Grasshopper, 건축시공, 건축재료역학이 등장하고, 2026년에는 캡스톤·구조해석·졸업논문으로 수렴한다.",
    markers: ["서울대학교", "건축학과", "건축공학", "캡스톤"],
  },
];

const cities: Record<string, City> = {
  ICN: { code: "ICN", name: "서울/인천", lat: 37.4602, lon: 126.4407 },
  GMP: { code: "GMP", name: "서울/김포", lat: 37.5583, lon: 126.7906 },
  CJU: { code: "CJU", name: "제주", lat: 33.5113, lon: 126.493 },
  GUM: { code: "GUM", name: "괌", lat: 13.4839, lon: 144.797 },
  LAX: { code: "LAX", name: "로스앤젤레스", lat: 33.9416, lon: -118.4085 },
  SIN: { code: "SIN", name: "싱가포르", lat: 1.3644, lon: 103.9915 },
  LHR: { code: "LHR", name: "런던", lat: 51.47, lon: -0.4543 },
  VIE: { code: "VIE", name: "비엔나", lat: 48.1103, lon: 16.5697 },
  CDG: { code: "CDG", name: "파리", lat: 49.0097, lon: 2.5479 },
  BKK: { code: "BKK", name: "방콕", lat: 13.69, lon: 100.7501 },
  JFK: { code: "JFK", name: "뉴욕", lat: 40.6413, lon: -73.7781 },
  MCO: { code: "MCO", name: "올랜도", lat: 28.4312, lon: -81.3081 },
  DTW: { code: "DTW", name: "디트로이트", lat: 42.2162, lon: -83.3554 },
  HKG: { code: "HKG", name: "홍콩", lat: 22.308, lon: 113.9185 },
  MXP: { code: "MXP", name: "밀라노", lat: 45.63, lon: 8.7231 },
  FCO: { code: "FCO", name: "로마", lat: 41.8003, lon: 12.2389 },
  MAD: { code: "MAD", name: "마드리드", lat: 40.4983, lon: -3.5676 },
  IAD: { code: "IAD", name: "워싱턴 D.C.", lat: 38.9531, lon: -77.4565 },
  SEA: { code: "SEA", name: "시애틀", lat: 47.4502, lon: -122.3088 },
  ZRH: { code: "ZRH", name: "취리히", lat: 47.4581, lon: 8.5555 },
  HND: { code: "HND", name: "도쿄", lat: 35.5494, lon: 139.7798 },
  KIX: { code: "KIX", name: "오사카", lat: 34.4273, lon: 135.244 },
};

const routes: RouteRecord[] = [
  { date: "2011.02.03", from: "ICN", to: "GUM", carrier: "대한항공", label: "괌", theme: "asia" },
  { date: "2011.02.08", from: "GUM", to: "ICN", carrier: "대한항공", label: "괌 귀국", theme: "asia" },
  { date: "2011.09.10", from: "ICN", to: "LAX", carrier: "대한항공", label: "미국 서부", theme: "america" },
  { date: "2011.09.17", from: "LAX", to: "ICN", carrier: "대한항공", label: "미국 서부 귀국", theme: "america" },
  { date: "2011.10.01", from: "ICN", to: "SIN", carrier: "대한항공", label: "싱가포르", theme: "asia" },
  { date: "2011.10.05", from: "SIN", to: "ICN", carrier: "대한항공", label: "싱가포르 귀국", theme: "asia" },
  { date: "2012.07.20", from: "ICN", to: "LHR", carrier: "대한항공", label: "런던", theme: "europe" },
  { date: "2012.07.29", from: "LHR", to: "ICN", carrier: "대한항공", label: "런던 귀국", theme: "europe" },
  { date: "2012.09.25", from: "ICN", to: "VIE", carrier: "대한항공", label: "비엔나", theme: "europe" },
  { date: "2012.09.28", from: "VIE", to: "CDG", carrier: "에어프랑스", label: "비엔나-파리", theme: "europe" },
  { date: "2012.10.02", from: "CDG", to: "ICN", carrier: "대한항공", label: "파리 귀국", theme: "europe" },
  { date: "2012.12.05", from: "ICN", to: "BKK", carrier: "대한항공", label: "방콕", theme: "asia" },
  { date: "2012.12.09", from: "BKK", to: "ICN", carrier: "대한항공", label: "방콕 귀국", theme: "asia" },
  { date: "2013.05.03", from: "GMP", to: "CJU", carrier: "대한항공", label: "제주", theme: "domestic" },
  { date: "2013.05.05", from: "CJU", to: "GMP", carrier: "대한항공", label: "제주 귀국", theme: "domestic" },
  { date: "2013.05.11", from: "ICN", to: "JFK", carrier: "델타항공", label: "미국 동부", theme: "america" },
  { date: "2013.05.14", from: "JFK", to: "MCO", carrier: "델타항공", label: "뉴욕-올랜도", theme: "america" },
  { date: "2013.05.18", from: "MCO", to: "DTW", carrier: "델타항공", label: "올랜도-디트로이트", theme: "america" },
  { date: "2013.05.18", from: "DTW", to: "ICN", carrier: "델타항공", label: "미국 귀국", theme: "america" },
  { date: "2014.01.30", from: "ICN", to: "HKG", carrier: "대한항공", label: "홍콩", theme: "asia" },
  { date: "2014.02.03", from: "HKG", to: "ICN", carrier: "대한항공", label: "홍콩 귀국", theme: "asia" },
  { date: "2014.08.01", from: "ICN", to: "MXP", carrier: "대한항공", label: "이탈리아", theme: "europe" },
  { date: "2014.08.10", from: "FCO", to: "ICN", carrier: "대한항공", label: "로마 귀국", theme: "europe" },
  { date: "2014.09.19", from: "ICN", to: "MAD", carrier: "대한항공", label: "스페인", theme: "europe" },
  { date: "2014.09.27", from: "LHR", to: "ICN", carrier: "대한항공", label: "런던 경유 귀국", theme: "europe" },
  { date: "2015.05.16", from: "ICN", to: "IAD", carrier: "대한항공", label: "워싱턴 D.C.", theme: "america" },
  { date: "2015.05.24", from: "SEA", to: "ICN", carrier: "대한항공", label: "시애틀 귀국", theme: "america" },
  { date: "2015.08.08", from: "ICN", to: "ZRH", carrier: "대한항공", label: "취리히", theme: "europe" },
  { date: "2015.08.15", from: "ZRH", to: "ICN", carrier: "대한항공", label: "취리히 귀국", theme: "europe" },
  { date: "2015.09.26", from: "ICN", to: "HKG", carrier: "대한항공", label: "홍콩", theme: "asia" },
  { date: "2015.09.29", from: "HKG", to: "ICN", carrier: "대한항공", label: "홍콩 귀국", theme: "asia" },
  { date: "2016.04.30", from: "ICN", to: "LAX", carrier: "대한항공", label: "로스앤젤레스", theme: "america" },
  { date: "2016.05.07", from: "LAX", to: "ICN", carrier: "대한항공", label: "미국 귀국", theme: "america" },
  { date: "2016.10.01", from: "ICN", to: "FCO", carrier: "대한항공", label: "로마", theme: "europe" },
  { date: "2016.10.08", from: "FCO", to: "ICN", carrier: "대한항공", label: "로마 귀국", theme: "europe" },
  { date: "2016.11.05", from: "ICN", to: "KIX", carrier: "대한항공", label: "오사카", theme: "asia" },
  { date: "2016.11.09", from: "KIX", to: "GMP", carrier: "대한항공", label: "오사카 귀국", theme: "asia" },
  { date: "2017.01.26", from: "ICN", to: "HND", carrier: "대한항공", label: "도쿄", theme: "asia" },
  { date: "2017.01.29", from: "HND", to: "GMP", carrier: "대한항공", label: "도쿄 귀국", theme: "asia" },
  { date: "2017.05.02", from: "GMP", to: "CJU", carrier: "대한항공", label: "제주", theme: "domestic" },
  { date: "2017.05.05", from: "CJU", to: "GMP", carrier: "대한항공", label: "제주 귀국", theme: "domestic" },
  { date: "2017.07.20", from: "ICN", to: "LHR", carrier: "대한항공", label: "런던", theme: "europe" },
  { date: "2017.07.29", from: "CDG", to: "ICN", carrier: "대한항공", label: "파리 귀국", theme: "europe" },
  { date: "2017.10.03", from: "GMP", to: "HND", carrier: "대한항공", label: "도쿄", theme: "asia" },
  { date: "2017.10.07", from: "HND", to: "GMP", carrier: "대한항공", label: "도쿄 귀국", theme: "asia" },
  { date: "2018.10.05", from: "ICN", to: "KIX", carrier: "대한항공", label: "오사카", theme: "asia" },
  { date: "2018.10.07", from: "KIX", to: "GMP", carrier: "대한항공", label: "오사카 귀국", theme: "asia" },
  { date: "2019.12.21", from: "ICN", to: "JFK", carrier: "대한항공", label: "뉴욕", theme: "america" },
  { date: "2020.02.01", from: "JFK", to: "ICN", carrier: "대한항공", label: "뉴욕 귀국", theme: "america" },
  { date: "2021.02.28", from: "GMP", to: "CJU", carrier: "대한항공", label: "제주", theme: "domestic" },
];

const integratedGroups: IntegratedGroup[] = [
  {
    id: "education",
    title: "학제·진학",
    period: "초등학교 ~ 대학입학",
    summary: "초·중·고, 2020년 재수종합, 2021년 대학입학 이후 건축학과/건축공학 흐름으로 이어지는 큰 축.",
    anchor: { x: 18, y: 22 },
    subgroups: [
      {
        title: "학제 흐름",
        items: [
          { period: "2008~2014", text: "초등학교 시기: 해외·국내 이동 기록이 누적된 성장기." },
          { period: "2014~2017", text: "중학교 시기: 홍콩·유럽·미국·일본 등 장거리 이동 경험이 이어짐." },
          { period: "2017~2020", text: "고등학교 시기: 대입 준비와 국내외 이동이 병행됨." },
          { period: "2020", text: "시대인재 재수종합: 뉴욕 귀국 이후 국내 대입 재도전." },
          { period: "2021~", text: "서울대학교 입학 이후 건축학과/건축공학 전공 흐름 본격화.", tone: "strong" },
        ],
      },
    ],
  },
  {
    id: "architecture",
    title: "건축·구조·환경",
    period: "2022.01 ~ 2026.06",
    summary: "스튜디오와 건축사에서 시작해 Grasshopper, 건축시공, 재료역학, 구조설계, Revit/MIDAS 캡스톤으로 연결.",
    anchor: { x: 42, y: 34 },
    subgroups: [
      {
        title: "초기 전공 기반",
        items: [
          { period: "2022", text: "건축사·건축환경계획·스튜디오·Design Review·건축시공·건축재료역학." },
          { period: "2022.09~12", text: "Grasshopper T1~T6, AE 과제, 건축시공/재료역학 시험과 프로젝트." },
        ],
      },
      {
        title: "심화·졸업 프로젝트",
        items: [
          { period: "2023.03~06", text: "건축전산, 건재역, 건환시, 콘크리트, 건물에너지, 건축시공 과제 폭주." },
          { period: "2025.09~12", text: "복학 후 철골구조·조명·설비시스템·과제/시험을 법인 업무와 병행." },
          { period: "2026.03~06", text: "캡스톤, 구조설계, 건축환경설계, 스마트건설, 졸업논문 발표로 수렴.", tone: "strong" },
        ],
      },
    ],
  },
  {
    id: "startup",
    title: "앱·창업·법인",
    period: "2024.12 ~ 2025.08",
    summary: "React Native 앱 개발에서 IR, 예창패/SNAAC, 법인 설립, iOS 출시, 액셀러레이터 탐색까지 이어진 실행축.",
    anchor: { x: 68, y: 26 },
    subgroups: [
      {
        title: "앱 개발",
        items: [
          { period: "2024.12", text: "React Native 컴포넌트와 투표 UI/상태 관리 문제를 다루기 시작." },
          { period: "2025.01~02", text: "IR 피칭자료, UI 점검, SNS 계정, 정부지원사업 조건 검토." },
        ],
      },
      {
        title: "사업화",
        items: [
          { period: "2025.03", text: "SNAAC, 예창패, 베타테스트, AWS SES, 가상오피스와 법인 설립 시점 검토." },
          { period: "2025.04~05", text: "법인 설립, 계좌/홈택스, 앱스토어 심사, iOS 출시, EAS/운영서버." , tone: "strong"},
          { period: "2025.06~08", text: "Google Play 정책, 정부지원사업 후속, SNU IR, Techstars, YC, 인터뷰." },
        ],
      },
    ],
  },
  {
    id: "service",
    title: "군복무·자기계발",
    period: "2023.07 ~ 2024.12",
    summary: "군 복무 중 경영·회계·세무·어학·자격·개발기초를 병행하고 전역 전 창업 준비로 넘어간 축.",
    anchor: { x: 26, y: 60 },
    subgroups: [
      {
        title: "복무·원격학습",
        items: [
          { period: "2023.07~08", text: "입대, 휴학, 졸업요건 교육, 군 생활 적응." },
          { period: "2023.09~2024.02", text: "중급회계, 법인세법, 재무관리, 경영학, 회계원리, HSK, GRE." },
          { period: "2024.03~08", text: "HSK, JLPT, TOEFL, OPIC, GRE, 건축기사, 행정학개론, HTML/CSS." },
          { period: "2024.09~11", text: "군원격수업, 상담, 휴가, 유격훈련, 전투휴무, 군 생활 말기 정리." },
        ],
      },
    ],
  },
  {
    id: "travel",
    title: "여행·이동 경험",
    period: "2011 ~ 2021",
    summary: "동아시아, 동남아, 유럽, 미국, 제주까지 항공 이동 기록이 학제 흐름과 겹쳐 누적됨.",
    anchor: { x: 76, y: 60 },
    subgroups: [
      {
        title: "주요 권역",
        items: [
          { period: "2011~2012", text: "괌, 미국 서부, 싱가포르, 런던, 비엔나/파리, 방콕." },
          { period: "2013~2014", text: "제주, 미국 동부/플로리다/디트로이트, 홍콩, 이탈리아, 스페인." },
          { period: "2015~2017", text: "워싱턴 D.C., 시애틀, 취리히, 홍콩, 로마, 오사카, 도쿄, 런던/파리." },
          { period: "2018~2021", text: "오사카, 뉴욕, 제주로 이어지는 후기 이동 기록." },
        ],
      },
    ],
  },
];

const monthlyRecords: MonthlyRecord[] = [
  {
    month: "2022.01",
    title: "대학 초반 루틴과 일본어·영어 학습",
    headline: "스누버디, 일본어, 영어논문작성, 토익/HSK 준비가 동시에 보이는 달.",
    blocks: [
      { label: "학업·언어", items: ["집중일본어, 일본어 모임, 영어논문작성, HSK 준비", "조별활동·과제·기말 개별 보강 정리"] },
      { label: "대학 생활", items: ["스누버디 면접/자기소개, 주니어펠로우, 수강지도상담", "친구·스터디·일상 일정이 촘촘하게 배치"] },
      { label: "생활 관리", items: ["치과·미용실·은행·개인 일정 정리", "연초 학업과 생활 루틴을 재정렬"] },
    ],
  },
  {
    month: "2022.02",
    title: "방학 말 학사 준비와 CAD 특강",
    headline: "다음 학기 수업과 교환/국제 활동 준비, CAD 대면 특강이 보이는 달.",
    blocks: [
      { label: "학업·기술", items: ["CAD 특강 대면 수강", "일본어 스터디, 영어회화스터디, HSK 5급 준비"] },
      { label: "학사·활동", items: ["등록금 납부, 다음학기 수업 준비", "SNU Buddy 관련 일정과 국제교류 관심"] },
      { label: "생활", items: ["여행·면허·은행·개인 일정 관리"] },
    ],
  },
  {
    month: "2022.03",
    title: "개강과 스튜디오/건축사 기초 진입",
    headline: "Climate Studio, 건축사, 공수, 영어회화스터디, 독서·글쓰기 루틴이 같이 시작됨.",
    blocks: [
      { label: "전공", items: ["Climate Studio, 건축사 정리, 스튜디오 공구/모형 관련 일정", "건축사 강의와 기초 설계 활동"] },
      { label: "교양·기초", items: ["영어대중소설, 공수 퀴즈, 독서와 글쓰기", "HSK 성적공고와 외국어 학습"] },
      { label: "생활", items: ["스터디·동아리·친구 일정과 건강검진"] },
    ],
  },
  {
    month: "2022.04",
    title: "스튜디오와 건축사 중간 구간",
    headline: "Phase 과제, 건축사 중간, 공학수학 퀴즈, 스튜디오 발표가 겹친 달.",
    blocks: [
      { label: "전공·스튜디오", items: ["PHASE 과제, 대영 스크립트, 스튜디오 과제", "건축사 중간, 건축환경계획, 안 쓰는 건축 관련 메일/자료 정리"] },
      { label: "교양·언어", items: ["영어회화스터디, 중국어 비대면, 공학수학 퀴즈"] },
      { label: "활동", items: ["SNU Buddy 발표/후속, 전공수업 준비"] },
    ],
  },
  {
    month: "2022.05",
    title: "스튜디오 파이널 리뷰와 설계실 중심 생활",
    headline: "건축사, PHASE2, 파이널 리뷰, 설계실, 대영 준비가 중심.",
    blocks: [
      { label: "전공·설계", items: ["스튜디오 최종 준비, 파이널 리뷰, 설계실 작업", "건축사·주필 건축사·대영 주제 정리"] },
      { label: "교양·언어", items: ["영어회화, 중국어 책, 공수 대면/퀴즈", "스누버디 후속과 국제교류 활동"] },
      { label: "생활", items: ["방지석·가족·여친 일정 등 개인 일정 병행"] },
    ],
  },
  {
    month: "2022.06",
    title: "건축사·건환계 기말과 계절학기 준비",
    headline: "건축사 수업/정리/기말, 건환계 수업, Design Review, 운전면허가 함께 진행됨.",
    blocks: [
      { label: "전공", items: ["건축사 기말, 건축사 과제, 건축사 정리", "건환계 수업, Design Review, 디레 모형"] },
      { label: "학사", items: ["계절학기 수강료 납부, 계절 대면 수업 시작", "대면수업 전환과 학교 생활 재정비"] },
      { label: "생활", items: ["운전면허 일정, 영어회화, 스튜디오 정리"] },
    ],
  },
  {
    month: "2022.07",
    title: "계절학기와 언어·면허 준비",
    headline: "언어의 세계, 집중일본어, 기말과제, 2학기 랩인턴 신청이 보임.",
    blocks: [
      { label: "계절학기", items: ["언어의 세계/언어의세계법, 집중일본어, 과제와 기말 주제", "수강지도신청과 2학기 랩인턴 신청"] },
      { label: "생활·자격", items: ["운전면허 시험/예약", "제주/여친 일정 등 개인 일정"] },
    ],
  },
  {
    month: "2022.08",
    title: "계절학기 마무리와 창업 관심의 초기 흔적",
    headline: "계절 강의평가, 스타트업 동아리, 창업자 초청, 등록금·운전면허가 확인됨.",
    blocks: [
      { label: "학사", items: ["계절 강의평가, 등록금 수납, 2학기 준비"] },
      { label: "창업·활동", items: ["스타트업 동아리, 창업자 초청 관련 일정", "한 아시아 관련 일정"] },
      { label: "생활", items: ["운전면허 발급, 실내운전연습, 개인 일정"] },
    ],
  },
  {
    month: "2022.09",
    title: "2학기 개강과 Grasshopper 시작",
    headline: "T1/T2 Grasshopper, 건축시공, 건축재료역학, 스튜디오가 본격화됨.",
    blocks: [
      { label: "전공", items: ["Grasshopper T1/T2, Project 01, AE Presentation", "건축시공, 건축재료역학, 스튜디오 과제"] },
      { label: "활동", items: ["주니어펠로우, 카투사 지원, 스튜디오 발표 준비"] },
    ],
  },
  {
    month: "2022.10",
    title: "Grasshopper와 중간고사 구간",
    headline: "T3~T5 Grasshopper, AE Midterm, 건축시공 중간, 건재역 필기가 겹침.",
    blocks: [
      { label: "파라메트릭", items: ["T3/T4/T5 Grasshopper, Lecture, Project 02", "레이저프린팅과 모델/과제 작업"] },
      { label: "전공", items: ["건축시공 중간, 건축재료역학, 건재역 필기", "AE Theatre, AE Midterm"] },
    ],
  },
  {
    month: "2022.11",
    title: "Grasshopper 후반·건축재료역학·AE Critical",
    headline: "T5/T6 Grasshopper, AE Critical, 건축시공 캠프, 건축사 답사가 보임.",
    blocks: [
      { label: "전공", items: ["T5/T6 Grasshopper, 건축재료역학, 건축시공 캠프", "건축사 답사, 건축사 레포트, 건재역 과제"] },
      { label: "영어·발표", items: ["AE Critical, Individual 과제, 영어 과제"] },
    ],
  },
  {
    month: "2022.12",
    title: "학기말·Design Review·전공 방향 정리",
    headline: "AE Final, Design Review, 건축시공/재료역학 마무리와 건축학/공학 방향 제출이 보임.",
    blocks: [
      { label: "전공 마감", items: ["건축시공, 건축재료역학, AE Final, AE Critical", "Design Review, PN 미리 읽기"] },
      { label: "진로·학사", items: ["건축학/공학 정해서 제출", "계절학기 개강 준비"] },
    ],
  },
  {
    month: "2023.01",
    title: "전공 방향 제출과 영어 글쓰기",
    headline: "건축학/공학 방향 정리, 영어논문작성, TOEFL Writing, 계절학기 흐름.",
    blocks: [
      { label: "학업", items: ["건축학/공학 방향 제출", "영어논문작성, TOEFL Writing, 계절학기 수강"] },
      { label: "생활", items: ["치과·피부과·스카·은행·일상 관리"] },
    ],
  },
  {
    month: "2023.02",
    title: "여행과 연구실 탐색, 수강신청",
    headline: "뉴욕여행, 연구실 방문, 연구목표, 컨택메일, 등록금·수강신청이 보임.",
    blocks: [
      { label: "탐색", items: ["연구실 방문, 연구목표 정리, 컨택메일", "UNSC 모집, 등록금 수납, 수강신청"] },
      { label: "이동·생활", items: ["뉴욕여행, 가족 일정, 개인 행정"] },
    ],
  },
  {
    month: "2023.03",
    title: "건축학과 개강·워크숍·전공 과제 시작",
    headline: "건축학과 경주 워크숍, 랩인턴, 건재역2·건환시·건시공·콘크리트 과제가 시작됨.",
    blocks: [
      { label: "전공", items: ["건재역2 과제, 건환시 과제, 건시공 과제, 콘크리트 과제", "시공 수업, 공학 인증, 리트 풀어보기"] },
      { label: "연구·활동", items: ["랩인턴 시작, 사업계획서 관련 일정", "워크숍과 학과 활동"] },
    ],
  },
  {
    month: "2023.04",
    title: "건축전산·콘크리트·건축환경시스템 중간 구간",
    headline: "건축전산, 건재역2, 건환시, 콘크리트, 건물에너지, 시공 필기가 밀집.",
    blocks: [
      { label: "전공", items: ["건축전산 과제, 건재역2 과제, 건환시 과제", "콘크리트 공학, 건물에너지, 건축환경시스템"] },
      { label: "학사", items: ["휴학 접수 준비, 군입대 일정이 보이기 시작"] },
    ],
  },
  {
    month: "2023.05",
    title: "전공 과제 폭주와 기술창업론",
    headline: "건축전산·건재역·콘크리트·건물열에너지·therm 과제, 기술창업론이 동시에 진행됨.",
    blocks: [
      { label: "전공", items: ["건축전산 중간, 건재역 보강/과제, 건축재료 중간", "콘크리트 수업/퀴즈, 건물열에너지, therm 과제"] },
      { label: "창업·학사", items: ["기술창업론/창업론 수업", "군휴학 신청과 학기 말 준비"] },
    ],
  },
  {
    month: "2023.06",
    title: "전공 기말·발표·입대 전 정리",
    headline: "건축시공 발표, 건축재료/콘크리트 기말, 건축환경시스템, 휴학신청과 입영판정검사.",
    blocks: [
      { label: "전공 마감", items: ["건축시공 발표, 건축재료 기말, 콘크리트 기말", "건물열에너지, 건축전산 과제, 건축환경시스템"] },
      { label: "입대 준비", items: ["휴학신청, 입영판정검사, 병무청 검사, 노트북 챙기기"] },
    ],
  },
  {
    month: "2023.07",
    title: "입대 초기와 군 생활 적응",
    headline: "입대, 군대 짐싸기, 학교/휴학 잔무, 생활 준비가 중심.",
    blocks: [
      { label: "군복무", items: ["입대 초기 적응, 준비물과 개인 정리", "휴학신청·학교 사무실 관련 잔무"] },
    ],
  },
  {
    month: "2023.08",
    title: "군 복무 적응과 졸업요건 교육",
    headline: "생명존중/안전환경교육, 은행 업무 등 행정성 일정 중심.",
    blocks: [
      { label: "행정·생활", items: ["졸업요건 교육 이수", "군 생활 적응과 개인 행정 정리"] },
    ],
  },
  {
    month: "2023.09",
    title: "군 복무 중 회계·세무 학습 시작",
    headline: "중급회계, 법인세법, 재무관리 정리가 등장함.",
    blocks: [
      { label: "회계·세무", items: ["중급회계, 법인세법, 재무관리 정리", "군 복무 중 원격·자기계발 루틴 시작"] },
    ],
  },
  {
    month: "2023.10",
    title: "회계·세법·재무관리 집중",
    headline: "재무관리, 법인세법, 원가관리회계, 부가가치세법, 경제학/상법 정리가 보임.",
    blocks: [
      { label: "회계·경영", items: ["재무관리 강의/정리, 원가관리회계, 재무회계", "법인세법, 부가가치세법, 소득세법, 경제학·상법 정리"] },
      { label: "시험 기반", items: ["CPA 기초 풀이와 경영/회계 학습 루틴"] },
    ],
  },
  {
    month: "2023.11",
    title: "경영학 수업과 신병위로휴가",
    headline: "경영학 수업, 강의교안/핵심정리 출력, 퀴즈와 휴가가 같이 보임.",
    blocks: [
      { label: "학업", items: ["경영학 수업, 1~2주차 강의, 퀴즈 1차", "강의교안과 핵심정리 자료 출력"] },
      { label: "군복무", items: ["신병위로휴가와 일상 일정"] },
    ],
  },
  {
    month: "2023.12",
    title: "경영학 중간·기말과 과제정리",
    headline: "경영학 중간고사, 기말강의 시작, 과제&학습정리, 중급회계 강의.",
    blocks: [
      { label: "학업", items: ["경영학 중간고사, 기말강의, 과제&학습정리", "중급회계 강의와 면회 일정"] },
    ],
  },
  {
    month: "2024.01",
    title: "경영학 기말·HSK·휴가",
    headline: "경영학 기말고사, 과제/학습정리, HSK, 퀴즈 2차가 중심.",
    blocks: [
      { label: "학업·어학", items: ["경영학 기말, 과제&학습정리, 퀴즈 2차", "HSK 시험과 휴가 중 개인정비"] },
    ],
  },
  {
    month: "2024.02",
    title: "회계원리·GRE·HSK",
    headline: "회계원리 학습, GRE V.R. Practice, HSK 시험, 군 훈련이 병행됨.",
    blocks: [
      { label: "학업·시험", items: ["회계원리 학습 및 정리", "GRE 연습, HSK 시험"] },
      { label: "군복무", items: ["옥타기훈련과 출타교육"] },
    ],
  },
  {
    month: "2024.03",
    title: "군 훈련·HSK·건축기사 관심",
    headline: "혹한기/중대전술훈련, HSK, 건축기사 필기 접수, 과제 마감.",
    blocks: [
      { label: "군복무", items: ["혹한기훈련, 중대전술훈련, 상병 신체검사"] },
      { label: "자격·학업", items: ["HSK 시험일, 건축기사 필기 접수, 군원격강좌 과제"] },
    ],
  },
  {
    month: "2024.04",
    title: "JLPT·HSK·TOEFL/OPIC 준비",
    headline: "어학시험 준비와 소부대전술훈련, 과제 마감이 함께 보임.",
    blocks: [
      { label: "어학", items: ["JLPT 접수, HSK, TOEFL 결제, OPIC 등록", "어학시험 일정과 군 생활 병행"] },
      { label: "군복무", items: ["소부대전술훈련, 과제 마감"] },
    ],
  },
  {
    month: "2024.05",
    title: "TOEFL·행정학개론·휴가",
    headline: "TOEFL iBT와 결과확인, 행정학개론, 과제 마감, 휴가/가족 일정.",
    blocks: [
      { label: "어학·학업", items: ["TOEFL iBT, TOEFL 결과확인", "행정학개론, 과제 마감"] },
      { label: "군복무·생활", items: ["휴가 확정, 가족 일본여행, 지상합동훈련"] },
    ],
  },
  {
    month: "2024.06",
    title: "HTML/CSS와 건축기사·행정학개론",
    headline: "웹 개발 기초, 건축기사 필기, 행정학개론, 군 훈련과 휴가.",
    blocks: [
      { label: "개발·자격", items: ["HTML/CSS 강좌 내용 정리", "건축기사 필기 접수일"] },
      { label: "학업·군복무", items: ["행정학개론, 1학기 종강", "사격집중훈련, 체력측정, 휴가"] },
    ],
  },
  {
    month: "2024.07",
    title: "GRE·JLPT·OPIC과 상담/자기관리",
    headline: "GRE, JLPT, OPIC, ACTFL, 상담, 태권도, 주식 일부 매도.",
    blocks: [
      { label: "어학·자격", items: ["GRE, JLPT, OPIC, ACTFL 관련 일정", "OPIC 군인 증명과 접수"] },
      { label: "생활", items: ["상담, 태권도, 개인 재정/주식 정리"] },
    ],
  },
  {
    month: "2024.08",
    title: "2학기 군원격 준비와 OPIC/HSK",
    headline: "2학기 수강신청, 군원격 신청, OPIC, HSK 5급 교재, 집중인성교육.",
    blocks: [
      { label: "학사", items: ["제2학기 수강신청, 2학기 군원격 신청", "수강 변경과 상담신청"] },
      { label: "어학", items: ["OPIC, HSK 5급 교재, OPIC 성적발표"] },
    ],
  },
  {
    month: "2024.09",
    title: "군원격 2학기와 상담/휴가",
    headline: "2학기 개강, 군원격 교재, HSK/OPIC, 상담신청, 추석과 휴가.",
    blocks: [
      { label: "군원격", items: ["제2학기 개강, 수강신청 변경, 군원격 교재", "군원격 수강과 학습 루틴"] },
      { label: "생활", items: ["상담신청, 휴가/외박, 추석 연휴"] },
    ],
  },
  {
    month: "2024.10",
    title: "휴가계획·상담·자대배치",
    headline: "휴가계획서, 상담, 치과, 생일, 자대배치와 개인정비.",
    blocks: [
      { label: "군복무", items: ["휴가계획서, 상담신청, 자대배치", "전투휴무와 군 생활 전환"] },
      { label: "개인", items: ["치과, 생일, 휴가 중 개인정비"] },
    ],
  },
  {
    month: "2024.11",
    title: "유격훈련과 복무 말기 루틴",
    headline: "유격훈련, D-50, 전투휴무, 외박, 당직 중심의 달.",
    blocks: [
      { label: "군복무", items: ["유격훈련, 전투휴무, 외박", "군 생활 말기 루틴과 휴식"] },
    ],
  },
  {
    month: "2024.12",
    title: "군 복무 말기와 앱 개발 시작",
    headline: "대침투훈련·휴가와 창업기숙사, React Native 앱 개발 단서가 같이 등장.",
    blocks: [
      { label: "군복무", items: ["대침투훈련, 휴가, 교육훈련, 전투휴무"] },
      { label: "창업·개발", items: ["창업기숙사 입주생 모집 마감", "React Native 컴포넌트/투표 UI/상태관리 문제를 다루기 시작"] },
    ],
  },
  {
    month: "2025.01",
    title: "IR 피칭자료와 창업기숙사",
    headline: "앱을 창업 아이템으로 설명하고 팀/면접/기숙사 흐름으로 연결.",
    blocks: [
      { label: "창업", items: ["발표 IR 피칭자료 제작, 링커스 모집", "창업기숙사, 면접, 장학재단 기숙"] },
      { label: "앱 기획", items: ["서비스 구조와 화면 구성, 초기 피칭 메시지 정리"] },
    ],
  },
  {
    month: "2025.02",
    title: "예창패·정부지원사업·UI 점검",
    headline: "정부지원사업 자격과 UI, SNS 운영 준비가 중심.",
    blocks: [
      { label: "지원사업", items: ["예비창업패키지, 글로벌창업사관학교, 생애최초 청년창업 조건 검토", "해외 서비스와 국내 법인 조건 확인"] },
      { label: "앱·마케팅", items: ["UI 점검, SNS 국가별 계정 활성화"] },
    ],
  },
  {
    month: "2025.03",
    title: "SNAAC·베타테스트·법인 설립 전 준비",
    headline: "창업지원사업과 베타테스트, AWS SES, 가상오피스/인감이 겹침.",
    blocks: [
      { label: "창업지원", items: ["SNAAC 지원/결과, 예창패, 창업중심대학", "아산 보이저 글로벌 트랙"] },
      { label: "개발·법인", items: ["베타테스트, AWS SES 재심사", "가상오피스 계약, 인감 제작, 창업예정일"] },
    ],
  },
  {
    month: "2025.04",
    title: "법인 설립과 운영체계 구성",
    headline: "법인 설립, 법인계좌, 홈택스, 베타테스트, 사업자등록 흐름.",
    blocks: [
      { label: "법인", items: ["법인 설립, 법인계좌개설, 홈택스", "영문 사업자등록, 용인 수지 사무실"] },
      { label: "앱 운영", items: ["베타테스트 기간 유지, 창업중심대학 관련 일정"] },
    ],
  },
  {
    month: "2025.05",
    title: "iOS 출시·앱스토어 심사·EAS",
    headline: "앱이 실제 출시/배포 단계로 이동한 달.",
    blocks: [
      { label: "앱 출시", items: ["앱스토어 심사 신청, iOS 출시", "EAS 플랜, 운영서버 통신"] },
      { label: "법인", items: ["등기변경신청, 사무실/운영 정리"] },
    ],
  },
  {
    month: "2025.06",
    title: "EAS 운영과 사무공간 정리",
    headline: "앱 운영 안정화, 사무실/공간, 학교 복귀 준비가 보임.",
    blocks: [
      { label: "앱 운영", items: ["EAS/Expo 운영 안정화", "서버와 우편물/공간 관련 관리"] },
      { label: "생활", items: ["스페이스어스, 수지구 사무실, 학교가기"] },
    ],
  },
  {
    month: "2025.07",
    title: "Google Play 정책과 정부지원 후속",
    headline: "Google Play/API, 법인 등기소 OTP, 정부지원사업 후속 탐색.",
    blocks: [
      { label: "앱 정책", items: ["Google Play target API, Android 14/API 34 대응", "1:1 Meet, Google 관련 일정"] },
      { label: "법인·지원", items: ["법원 등기소 OTP 의무화 확인", "관악 S밸리, 미니특강, 휴학서류 제출"] },
    ],
  },
  {
    month: "2025.08",
    title: "IR·액셀러레이터·복학 준비",
    headline: "SNU IR, Techstars, YC, 인터뷰, 동문창업네트워크가 중심.",
    blocks: [
      { label: "창업 네트워크", items: ["SNU IR CL, 인터뷰 결과, Techstars, YC 서류평가", "디캠프 오피스아워, 동문창업네트워크"] },
      { label: "학사", items: ["수강신청변경과 복학 준비"] },
    ],
  },
  {
    month: "2025.09",
    title: "복학과 철골구조·조명, 법인 세무",
    headline: "학교 수업과 법인 운영이 함께 굴러가기 시작.",
    blocks: [
      { label: "전공", items: ["철골구조 과제, 조명 수업/휴강", "복학 후 수업 리듬 재정립"] },
      { label: "법인", items: ["등록금 납부, 법인통장 개설, 세금 문제 처리"] },
    ],
  },
  {
    month: "2025.10",
    title: "철골·조명·설비 중간고사와 사업요약",
    headline: "전공 시험/과제와 사업자료 정리가 겹침.",
    blocks: [
      { label: "전공", items: ["철골구조 과제와 중간고사", "조명 시험, 설비시스템"] },
      { label: "창업·법인", items: ["사업요약 보고, 법인 세금, 면담"] },
    ],
  },
  {
    month: "2025.11",
    title: "철골 과제·개발 이슈·시험 준비",
    headline: "철골구조, 조명/설비, 코딩과 심사, 프린터/메모리 이슈가 보임.",
    blocks: [
      { label: "전공", items: ["철골 과제, 조명/설비 수업과 휴강", "철골 영상강의, 시험공부"] },
      { label: "개발", items: ["코딩하고 심사, 프린터 호환, 16KB 메모리 페이지 이슈"] },
    ],
  },
  {
    month: "2025.12",
    title: "기말·법인 등기·어학/대외 준비",
    headline: "건축공학 기말과 법인 임원변경등기, TOEFL/GRE/LinkedIn이 겹침.",
    blocks: [
      { label: "전공", items: ["철골 기말, 조명 정리/기말시험, 설비시스템"] },
      { label: "법인", items: ["정관, 사내이사 사임, 임원변경등기, 등록면허세, 온라인등기소 전자신청"] },
      { label: "대외", items: ["TOEFL/GRE, LinkedIn, 온라인 교육, 서류 인쇄"] },
    ],
  },
  {
    month: "2026.01",
    title: "세무·수강신청·캡스톤 과목 설계",
    headline: "부가세와 1학기 수강계획, 건축공학 캡스톤/구조/환경 과목 인정 검토.",
    blocks: [
      { label: "세무·학사", items: ["부가세 확정신고/납부", "수강신청 기간, 장바구니 신청"] },
      { label: "전공계획", items: ["건축공학캡스톤설계, 구조설계, 건축환경설계 전공선택 인정 여부 확인"] },
    ],
  },
  {
    month: "2026.02",
    title: "졸업신청·수강변경·학기 준비",
    headline: "졸업신청서 제출, 수강신청변경, 등록금, 국어/수능특강, 서버 잔여 이슈.",
    blocks: [
      { label: "학사", items: ["졸업신청서 제출, 수강신청변경, 등록금 납부"] },
      { label: "학습·운영", items: ["국어 과외, 수능특강, 아마존 서버 관련 잔여 이슈"] },
    ],
  },
  {
    month: "2026.03",
    title: "건축환경·캡스톤·구조설계 시작",
    headline: "건축공학 학기 본격 시작. 캡스톤, 구조설계, 스마트건설, 한국문학/아시아미술.",
    blocks: [
      { label: "전공", items: ["건축환경설계, 캡스톤설계, 구조설계 과제, 스마트건설", "발표문과 졸업신청 관련 서류"] },
      { label: "교양", items: ["한국문학과, 아시아미술 수업 시작"] },
    ],
  },
  {
    month: "2026.04",
    title: "논문 방향·지도교수 상담·BIM",
    headline: "논문 방향 설정, 지도교수 상담, 구조설계 중간, BIM/Revit 흐름이 시작됨.",
    blocks: [
      { label: "논문·캡스톤", items: ["논문 방향 정한 뒤 지도교수님 상담신청", "그동안 BIM, 구조설계 중간"] },
      { label: "수업", items: ["건축환경설계, 아시아미술, 건축학과 일정, TEPS 성적확인"] },
    ],
  },
  {
    month: "2026.05",
    title: "캡스톤 구조 파트와 Revit/GH/MIDAS",
    headline: "Revit, Grasshopper, MIDAS, 구조해석 자동화와 환경설계/스마트건설이 폭발적으로 늘어남.",
    blocks: [
      { label: "구조·해석", items: ["Revit-GH-MIDAS 구조해석 워크플로우", "shell/plate 변환, Karamba/Alpaca, 구조 검토"] },
      { label: "수업·마감", items: ["건축환경설계, 구조설계 과제, 스마트건설, 아시아미술, TEPS, 예비군"] },
    ],
  },
  {
    month: "2026.06",
    title: "캡스톤 최종 제출·졸업논문 발표",
    headline: "캡스톤, 구조설계, 환경설계, 졸업논문, 암기노트와 지도 기반 웹앱이 동시에 몰림.",
    blocks: [
      { label: "캡스톤·논문", items: ["최종자료제출, 구조설계 기말, 졸업논문 발표", "Revit→Grasshopper→MIDAS MGT Export, Plate/Wall/Slab 누락 문제 해결"] },
      { label: "환경·도구", items: ["ClimateStudio, Rhino.Inside.Revit, 조명/환기 분석", "Next.js 지도 기반 방음 캐노피/에어돔 웹앱, Google Maps 3D, RGBA 이미지"] },
      { label: "암기·발표", items: ["아시아미술, 한국문학, 강의 암기노트, 발표시간/자료 평가"] },
    ],
  },
];


const years = Array.from(new Set(monthlyRecords.map((record) => record.month.slice(0, 4))));

const themeLabel: Record<RouteRecord["theme"], string> = {
  domestic: "국내",
  asia: "아시아",
  america: "미주",
  europe: "유럽",
};

const themeColor: Record<RouteRecord["theme"], string> = {
  domestic: "#0ea5e9",
  asia: "#2563eb",
  america: "#ef4444",
  europe: "#7c3aed",
};

const GOOGLE_MAP_SCRIPT_ID = "personal-timeline-google-map-script";

declare global {
  interface Window {
    google?: any;
    initPersonalTimelineGoogleMap?: () => void;
  }
}

function classNames(...items: Array<string | false | null | undefined>) {
  return items.filter(Boolean).join(" ");
}

function getRouteLatLng(route: RouteRecord) {
  const from = cities[route.from];
  const to = cities[route.to];
  return {
    from: { lat: from.lat, lng: from.lon },
    to: { lat: to.lat, lng: to.lon },
  };
}

function loadGoogleMapsApi() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps can only be loaded in the browser."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google);
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return Promise.reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is missing."));
  }

  return new Promise<any>((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_MAP_SCRIPT_ID) as HTMLScriptElement | null;

    window.initPersonalTimelineGoogleMap = () => {
      if (window.google?.maps) resolve(window.google);
    };

    if (existing) {
      existing.addEventListener("load", () => {
        if (window.google?.maps) resolve(window.google);
      });
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Maps.")));
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_MAP_SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initPersonalTimelineGoogleMap`;
    script.onerror = () => reject(new Error("Failed to load Google Maps."));
    document.head.appendChild(script);
  });
}

export default function PersonalTimeline() {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const basePolylinesRef = useRef<any[]>([]);
  const markersRef = useRef<any[]>([]);
  const activePolylineRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);

  const [activeGroup, setActiveGroup] = useState(integratedGroups[0].id);
  const [activeYear, setActiveYear] = useState("2026");
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    const id = window.setInterval(() => {
      setActiveRouteIndex((prev) => (prev + 1) % routes.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    let cancelled = false;

    loadGoogleMapsApi()
      .then((google) => {
        if (cancelled || !mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: 28, lng: 28 },
          zoom: 2,
          minZoom: 2,
          maxZoom: 8,
          mapTypeId: "roadmap",
          disableDefaultUI: true,
          zoomControl: true,
          gestureHandling: "greedy",
          backgroundColor: "#eaf1f8",
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", stylers: [{ visibility: "off" }] },
            { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#64748b" }] },
            { featureType: "water", elementType: "geometry", stylers: [{ color: "#dbeafe" }] },
            { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#f8fafc" }] },
            { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
            { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
          ],
        });

        mapInstanceRef.current = map;

        const worldBounds = new google.maps.LatLngBounds();
        Object.values(cities).forEach((city) => {
          const position = { lat: city.lat, lng: city.lon };
          worldBounds.extend(position);
          const marker = new google.maps.Marker({
            map,
            position,
            title: `${city.code} · ${city.name}`,
            label: {
              text: city.code,
              color: "#0f172a",
              fontSize: "11px",
              fontWeight: "900",
            },
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 4.5,
              fillColor: "#0f172a",
              fillOpacity: 0.9,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            },
          });
          markersRef.current.push(marker);
        });

        map.fitBounds(worldBounds, 70);

        basePolylinesRef.current = routes.map((route) => {
          const path = getRouteLatLng(route);
          return new google.maps.Polyline({
            path: [path.from, path.to],
            geodesic: true,
            strokeColor: themeColor[route.theme],
            strokeOpacity: 0.18,
            strokeWeight: 2,
            map,
          });
        });

        setIsMapReady(true);
      })
      .catch(() => {
        if (!cancelled) {
          setMapError("Google Maps API 키를 확인해줘. NEXT_PUBLIC_GOOGLE_MAPS_API_KEY가 필요해.");
        }
      });

    return () => {
      cancelled = true;
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
      activePolylineRef.current?.setMap?.(null);
      basePolylinesRef.current.forEach((line) => line.setMap?.(null));
      markersRef.current.forEach((marker) => marker.setMap?.(null));
      basePolylinesRef.current = [];
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    const google = window.google;
    const map = mapInstanceRef.current;
    if (!isMapReady || !google?.maps || !map) return;

    if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
    activePolylineRef.current?.setMap?.(null);

    const route = routes[activeRouteIndex];
    const color = themeColor[route.theme];
    const path = getRouteLatLng(route);

    const planeIcon = {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 4.4,
      fillColor: color,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 1.4,
    };

    const line = new google.maps.Polyline({
      path: [path.from, path.to],
      geodesic: true,
      strokeColor: color,
      strokeOpacity: 0.98,
      strokeWeight: 4,
      icons: [{ icon: planeIcon, offset: "0%" }],
      map,
    });

    activePolylineRef.current = line;

    const bounds = new google.maps.LatLngBounds();
    bounds.extend(path.from);
    bounds.extend(path.to);
    map.fitBounds(bounds, 110);

    const startedAt = performance.now();
    const duration = route.theme === "domestic" ? 2400 : 3600;

    const animate = (now: number) => {
      const progress = (((now - startedAt) % duration) / duration) * 100;
      line.set("icons", [{ icon: planeIcon, offset: `${progress.toFixed(2)}%` }]);
      animationRef.current = window.requestAnimationFrame(animate);
    };

    animationRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) window.cancelAnimationFrame(animationRef.current);
      line.setMap(null);
    };
  }, [activeRouteIndex, isMapReady]);

  const selectedGroup = integratedGroups.find((group) => group.id === activeGroup) ?? integratedGroups[0];
  const yearRecords = useMemo(
    () => monthlyRecords.filter((record) => record.month.startsWith(activeYear)),
    [activeYear]
  );
  const activeRoute = routes[activeRouteIndex];

  const routeSummary = useMemo(() => {
    const citySet = new Set(routes.flatMap((r) => [r.from, r.to]));
    return {
      count: routes.length,
      cityCount: citySet.size,
      themes: Array.from(new Set(routes.map((r) => themeLabel[r.theme]))).join(" · "),
    };
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Personal Timeline · 2011—2026</p>
            <h1>내 기록 지도</h1>
            <p className={styles.heroText}>여행, 학업, 창업, 건축공학을 한 화면에 정리했다.</p>
            <div className={styles.heroStats}>
              <article>
                <strong>53</strong>
                <span>항공 탑승 기록</span>
              </article>
              <article>
                <strong>2022—2026</strong>
                <span>월별 캘린더</span>
              </article>
              <article>
                <strong>Revit·MIDAS</strong>
                <span>최근 프로젝트</span>
              </article>
            </div>
          </div>
          <div className={styles.heroCard}>
            <div className={styles.heroCardTop}>
              <span>Current Focus</span>
              <strong>캡스톤 · 구조해석 · 졸업논문</strong>
            </div>
            <p>초기 전공 수업, 군복무, 앱 창업, 복학 이후 건축공학 프로젝트까지 한 흐름으로 연결했다.</p>
          </div>
        </div>
      </section>

      <section className={styles.integratedSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Life Map</p>
          <h2>이동 위에 쌓인 타임라인</h2>
          <p>실제 Google 지도 위에서 항공 경로와 주요 시기를 함께 본다.</p>
        </div>

        <div className={styles.lifeMapShell}>
          <div className={styles.mapPanel}>
            <div ref={mapRef} className={styles.googleMap} aria-label="Google 지도 기반 항공 이동 경로" />
            {mapError && <div className={styles.mapFallback}>{mapError}</div>}

            <div className={styles.integratedNodes}>
              {integratedGroups.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  className={classNames(styles.mapNode, activeGroup === group.id && styles.activeMapNode)}
                  style={{ left: `${group.anchor.x}%`, top: `${group.anchor.y}%` }}
                  onClick={() => setActiveGroup(group.id)}
                >
                  <span>{group.period}</span>
                  <strong>{group.title}</strong>
                </button>
              ))}
            </div>

            <div className={styles.routeCard}>
              <span>Flight path</span>
              <strong>{activeRoute.date} · {activeRoute.from} → {activeRoute.to}</strong>
              <p>{activeRoute.carrier} · {activeRoute.label} · {themeLabel[activeRoute.theme]}</p>
              <div className={styles.routeButtons}>
                <button type="button" onClick={() => setActiveRouteIndex((prev) => (prev - 1 + routes.length) % routes.length)}>이전</button>
                <button type="button" onClick={() => setActiveRouteIndex((prev) => (prev + 1) % routes.length)}>다음</button>
              </div>
            </div>
          </div>

          <aside className={styles.groupInspector}>
            <span>{selectedGroup.period}</span>
            <h3>{selectedGroup.title}</h3>
            <p>{selectedGroup.summary}</p>
            <div className={styles.subgroupStack}>
              {selectedGroup.subgroups.map((subgroup) => (
                <article key={subgroup.title}>
                  <strong>{subgroup.title}</strong>
                  <ul>
                    {subgroup.items.map((item) => (
                      <li key={`${item.period}-${item.text}`} className={item.tone ? styles[item.tone] : undefined}>
                        <b>{item.period}</b>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>

            <div className={styles.routeStatsInline}>
              <article><strong>{routeSummary.count}</strong><span>항공 구간</span></article>
              <article><strong>{routeSummary.cityCount}</strong><span>공항/도시</span></article>
              <article><strong>{routeSummary.themes}</strong><span>권역</span></article>
            </div>
          </aside>
        </div>

        <div className={styles.routeStrip}>
          {routes.map((route, index) => (
            <button
              key={`${route.date}-${route.from}-${route.to}-${index}`}
              type="button"
              className={classNames(styles.routeChip, activeRouteIndex === index && styles.activeRouteChip)}
              onClick={() => setActiveRouteIndex(index)}
            >
              <span>{route.date}</span>
              <strong>{route.from} → {route.to}</strong>
              <em>{route.label}</em>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.monthSection}>
        <div className={styles.sectionHeaderCompact}>
          <div>
            <p className={styles.eyebrow}>Monthly Archive</p>
            <h2>2022.01—2026.06</h2>
            <p>월별 기록을 학업, 전공, 창업, 군복무, 법인, 생활로 세분화했다.</p>
          </div>
          <div className={styles.yearTabs}>
            {years.map((year) => (
              <button
                key={year}
                type="button"
                className={activeYear === year ? styles.activeYear : undefined}
                onClick={() => setActiveYear(year)}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.monthGrid}>
          {yearRecords.map((record) => (
            <article key={record.month} className={styles.monthCard}>
              <div className={styles.monthTop}>
                <span>{record.month}</span>
                <h3>{record.title}</h3>
                <p>{record.headline}</p>
              </div>
              <div className={styles.monthBlocks}>
                {record.blocks.map((block) => (
                  <div key={block.label}>
                    <strong>{block.label}</strong>
                    <ul>
                      {block.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
