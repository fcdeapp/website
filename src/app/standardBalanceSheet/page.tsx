"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useConfig } from "../../context/ConfigContext";
import WebFooter from "../../components/WebFooter";
import styles from "../../styles/pages/StandardBalanceSheet.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

function parseScheduleDate(input?: string): Date | null {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;

  const isoLike = trimmed.replace(/\./g, "-").replace(/\//g, "-").replace(/\s+/g, "");
  const match = isoLike.match(/^(\d{2,4})-(\d{1,2})-(\d{1,2})/);
  if (match) {
    let year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    if (year < 100) year += 2000;
    const parsed = new Date(year, month - 1, day);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  const fallback = new Date(trimmed);
  if (!Number.isNaN(fallback.getTime())) return fallback;
  return null;
}


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export interface Schedule {
  _id: string;
  eventDate: string;
  location: string;
  title: string;
  description?: string;
  fileUrl?: string;
  tag?: string;
  amount?: string;
  supportFiles?: {
    fileUrl: string;
    fileKey: string;
  }[];
}

const categoryOptions = [
  "Cloud Infrastructure",
  "AI Services",
  "Advertising & Marketing",
  "Software Licenses & Tools",
  "Office & Administrative",
  "Legal & Compliance",
  "Domain & Certificates",
  "Miscellaneous",
] as const;

type Category = (typeof categoryOptions)[number];
type RootSide = "asset" | "liability_equity";
type RowKind = "section" | "group" | "account" | "total";
type MappingMode = "debitCredit";

type AccountRow = {
  code: string;
  label: string;
  side: RootSide;
  level: number;
  kind: RowKind;
  parentCode?: string;
  isDirectInput?: boolean;
};

type ItemMapping = {
  category: Category;
  debitCode: string;
  creditCode: string;
  note?: string;
};

type AccountBalanceMap = Record<string, number>;
type MappingMap = Record<string, ItemMapping>;

type HardcodedAdjustment = {
  date: string;
  label: string;
  amount: number;
  debitCode: string;
  creditCode: string;
  note?: string;
};

const LOAN_TRANCHES = [
  { date: "2025-04-06", amount: 1081205 }, // 설립 전 누계
  { date: "2025-04-30", amount: 245938 }, // 4/7~4/30
  { date: "2025-05-31", amount: 638374 }, // 5/1~5/31
  { date: "2025-06-02", amount: 311580 }, // 6/1~6/2, (NL) FACEBK, (SG) Google Digital Inc.
  { date: "2025-06-09", amount: 327152 }, // (SG) MICROSOFT
  { date: "2025-06-17", amount: 30685 }, // (US)OPENAI *CHATGPT
  { date: "2025-06-29", amount: 9112 }, // (NL) FACEBK
  { date: "2025-07-01", amount: 20953 }, // (SG) Google Digital Inc.
  { date: "2025-12-19", amount: 1500000 },
  { date: "2026-01-24", amount: 1000000 },
  { date: "2026-04-01", amount: 1500000 },
] as const;

const HARDCODED_ADJUSTMENTS: HardcodedAdjustment[] = [
  { date: "2025-06-21", label: "예금이자", amount: 887, debitCode: "003", creditCode: "372", note: "이자수익 유입" },
  { date: "2025-07-08", label: "메타 환급", amount: 222, debitCode: "003", creditCode: "069", note: "기존 메타 광고/결제분 환급" },
  { date: "2025-07-09", label: "메타 환급", amount: 158, debitCode: "003", creditCode: "069", note: "기존 메타 광고/결제분 환급" },
  { date: "2025-07-10", label: "메타 환급", amount: 121, debitCode: "003", creditCode: "069", note: "기존 메타 광고/결제분 환급" },
  { date: "2025-07-10", label: "신한할인캐쉬백", amount: 1400, debitCode: "003", creditCode: "372", note: "카드 캐시백 유입" },
  { date: "2025-07-11", label: "메타 환급", amount: 10471, debitCode: "003", creditCode: "069", note: "기존 메타 광고/결제분 환급" },
  { date: "2025-07-12", label: "메타 환급", amount: 79, debitCode: "003", creditCode: "069", note: "기존 메타 광고/결제분 환급" },
  { date: "2025-08-11", label: "메타 환급", amount: 3553, debitCode: "003", creditCode: "069", note: "기존 메타 광고/결제분 환급" },
  { date: "2025-09-10", label: "법무법인 미션 환불", amount: 18000, debitCode: "003", creditCode: "069", note: "법률서비스 관련 환불" },
  { date: "2025-09-10", label: "신한할인캐쉬백", amount: 1027, debitCode: "003", creditCode: "372", note: "카드 캐시백 유입" },
  { date: "2025-09-20", label: "예금이자", amount: 717, debitCode: "003", creditCode: "372", note: "이자수익 유입" },
  { date: "2025-10-10", label: "신한할인캐쉬백", amount: 1604, debitCode: "003", creditCode: "372", note: "카드 캐시백 유입" },
  { date: "2025-11-10", label: "신한할인캐쉬백", amount: 1473, debitCode: "003", creditCode: "372", note: "카드 캐시백 유입" },
  { date: "2025-12-10", label: "신한할인캐쉬백", amount: 1486, debitCode: "003", creditCode: "372", note: "카드 캐시백 유입" },
  { date: "2025-12-20", label: "예금이자", amount: 278, debitCode: "003", creditCode: "372", note: "이자수익 유입" },
  { date: "2026-01-10", label: "신한할인캐쉬백", amount: 1574, debitCode: "003", creditCode: "372", note: "카드 캐시백 유입" },
  { date: "2026-02-10", label: "신한할인캐쉬백", amount: 1643, debitCode: "003", creditCode: "372", note: "카드 캐시백 유입" },
  { date: "2026-03-10", label: "신한할인캐쉬백", amount: 1648, debitCode: "003", creditCode: "372", note: "카드 캐시백 유입" },
  { date: "2026-03-21", label: "예금이자", amount: 320, debitCode: "003", creditCode: "372", note: "이자수익 유입" },
  { date: "2026-04-05", label: "어도비 환불", amount: 72000, debitCode: "003", creditCode: "069", note: "소프트웨어/선급비용 환불" },
  { date: "2026-04-10", label: "신한할인캐쉬백", amount: 2229, debitCode: "003", creditCode: "372", note: "카드 캐시백 유입" },
] as const;

const DEFAULT_MANUAL_BALANCES: AccountBalanceMap = {
  "003": 5000000,
  "334": 5000000,
};

const LOCAL_STORAGE_CATEGORY_KEY = "balanceSheet_tagCategories_v1";
const LOCAL_STORAGE_MAPPING_KEY = "balanceSheet_itemMappings_v1";
const LOCAL_STORAGE_MANUAL_KEY = "balanceSheet_manualBalances_v2";

function addRow(
  rows: AccountRow[],
  code: string,
  label: string,
  side: RootSide,
  level: number,
  kind: RowKind,
  parentCode?: string,
  isDirectInput = false
) {
  rows.push({ code, label, side, level, kind, parentCode, isDirectInput });
}

function buildAccountRows(): AccountRow[] {
  const rows: AccountRow[] = [];

  addRow(rows, "228", "자산총계(Ⅰ+Ⅱ)", "asset", 0, "total");
  addRow(rows, "001", "Ⅰ.유동자산", "asset", 1, "section", "228");
  addRow(rows, "002", "(1)당좌자산", "asset", 2, "group", "001");
  addRow(rows, "003", "1.현금 및 현금성자산", "asset", 3, "account", "002");
  addRow(rows, "004", "2.단기예금", "asset", 3, "account", "002");
  addRow(rows, "005", "3.유가증권", "asset", 3, "group", "002");
  addRow(rows, "006", "가.단기매매증권", "asset", 4, "account", "005");
  addRow(rows, "007", "나.유동성매도가능증권", "asset", 4, "account", "005");
  addRow(rows, "008", "다.유동성만기보유증권", "asset", 4, "account", "005");

  addRow(rows, "009", "4.매출채권(공사․분양수입 외)", "asset", 3, "group", "002");
  addRow(rows, "010", "가.외상매출금", "asset", 4, "account", "009");
  addRow(rows, "011", "(대손충당금)", "asset", 4, "account", "009");
  addRow(rows, "012", "나.받을어음", "asset", 4, "account", "009");
  addRow(rows, "013", "(대손충당금)", "asset", 4, "account", "009");
  for (const [base, label] of [["014", "다"], ["016", "라"], ["018", "마"], ["020", "바"], ["022", "사"]] as const) {
    const next = String(Number(base) + 1).padStart(3, "0");
    addRow(rows, base, `${label}.기타매출채권(직접기재)`, "asset", 4, "account", "009", true);
    addRow(rows, next, "(대손충당금)", "asset", 4, "account", "009");
  }

  addRow(rows, "024", "5.단기대여금", "asset", 3, "group", "002");
  for (const [base, label, title] of [
    ["025", "가", "관계회사"],
    ["027", "나", "주주·임원·직원"],
    ["029", "다", "기타단기대여금"],
  ] as const) {
    const next = String(Number(base) + 1).padStart(3, "0");
    addRow(rows, base, `${label}.${title}`, "asset", 4, "account", "024");
    addRow(rows, next, "(대손충당금)", "asset", 4, "account", "024");
  }

  addRow(rows, "031", "6.미수금", "asset", 3, "group", "002");
  for (const [base, label, title] of [
    ["032", "가", "분양미수금"],
    ["034", "나", "공사미수금"],
    ["036", "다", "기타미수금"],
  ] as const) {
    const next = String(Number(base) + 1).padStart(3, "0");
    addRow(rows, base, `${label}.${title}`, "asset", 4, "account", "031");
    addRow(rows, next, "(대손충당금)", "asset", 4, "account", "031");
  }

  addRow(rows, "038", "7.선급금", "asset", 3, "account", "002");
  for (const code of ["039", "040", "041", "042", "043"]) {
    addRow(rows, code, `${Number(code) - 31}.기타당좌자산(직접기재)`, "asset", 3, "account", "002", true);
  }

  addRow(rows, "044", "(2)재고자산", "asset", 2, "group", "001");
  const inventoryItems = [
    ["045", "1.상품"],
    ["046", "2.제품"],
    ["047", "3.반제품"],
    ["048", "4.재공품"],
    ["049", "5.부산물"],
    ["054", "7.가설재"],
    ["055", "8.저장품"],
    ["056", "9.미착상품(미착재료)"],
    ["057", "10.완성주택"],
    ["058", "11.미완성주택"],
    ["059", "12.용지(건설업)"],
    ["060", "13.완성공사(주택외)"],
    ["061", "14.미완성공사(주택외)"],
  ] as const;
  for (const [code, label] of inventoryItems) addRow(rows, code, label, "asset", 3, "account", "044");
  addRow(rows, "050", "6.원재료(원자재)", "asset", 3, "group", "044");
  addRow(rows, "051", "가.원재료", "asset", 4, "account", "050");
  addRow(rows, "052", "나.부재료", "asset", 4, "account", "050");
  addRow(rows, "053", "다.기타원재료", "asset", 4, "account", "050", true);
  for (const code of ["062", "063", "064", "065", "066"]) {
    addRow(rows, code, `${Number(code) - 47}.기타재고자산(직접기재)`, "asset", 3, "account", "044", true);
  }

  addRow(rows, "067", "(3)기타유동자산", "asset", 2, "group", "001");
  addRow(rows, "068", "1.미수수익", "asset", 3, "account", "067");
  addRow(rows, "069", "2.선급비용", "asset", 3, "account", "067");
  addRow(rows, "070", "3.이연법인세자산", "asset", 3, "account", "067");
  addRow(rows, "071", "4.기타유동자산", "asset", 3, "group", "067");
  addRow(rows, "072", "가.선급법인세", "asset", 4, "account", "071");
  addRow(rows, "073", "나.부가가치세대급금", "asset", 4, "account", "071");
  addRow(rows, "074", "다.선급관세", "asset", 4, "account", "071");
  for (const [code, label] of [["075", "라"], ["076", "마"], ["077", "바"], ["078", "사"], ["079", "아"]] as const) {
    addRow(rows, code, `${label}.기타유동자산(직접기재)`, "asset", 4, "account", "071", true);
  }

  addRow(rows, "080", "Ⅱ.비유동자산", "asset", 1, "section", "228");
  addRow(rows, "081", "(1)투자자산", "asset", 2, "group", "080");
  addRow(rows, "082", "1.장기예금", "asset", 3, "account", "081");
  addRow(rows, "083", "2.장기투자증권", "asset", 3, "group", "081");
  addRow(rows, "084", "가.매도가능증권", "asset", 4, "account", "083");
  addRow(rows, "085", "나.만기보유증권", "asset", 4, "account", "083");
  addRow(rows, "086", "3.지분법적용투자주식", "asset", 3, "account", "081");
  addRow(rows, "087", "4.장기대여금", "asset", 3, "group", "081");
  for (const [base, label, title] of [
    ["088", "가", "관계회사"],
    ["091", "나", "주주·임원·직원"],
    ["094", "다", "기타장기대여금"],
  ] as const) {
    addRow(rows, base, `${label}.${title}`, "asset", 4, "account", "087");
    addRow(rows, String(Number(base) + 1).padStart(3, "0"), "(대손충당금)", "asset", 4, "account", "087");
    addRow(rows, String(Number(base) + 2).padStart(3, "0"), "(현재가치할인차금)", "asset", 4, "account", "087");
  }

  addRow(rows, "097", "5.투자부동산", "asset", 3, "group", "081");
  addRow(rows, "098", "가.토지", "asset", 4, "account", "097");
  addRow(rows, "099", "나.건물", "asset", 4, "account", "097");
  addRow(rows, "100", "다.기타투자부동산(직접기재)", "asset", 4, "account", "097", true);
  addRow(rows, "101", "라.기타유동자산(직접기재)", "asset", 4, "account", "097", true);
  addRow(rows, "102", "마.기타유동자산(직접기재)", "asset", 4, "account", "097", true);
  addRow(rows, "103", "바.기타유동자산(직접기재)", "asset", 4, "account", "097", true);
  addRow(rows, "104", "사.기타유동자산(직접기재)", "asset", 4, "account", "097", true);
  for (const code of ["105", "106", "107", "108", "109"]) {
    addRow(rows, code, `${Number(code) - 99}.기타투자자산(직접기재)`, "asset", 3, "account", "081", true);
  }

  addRow(rows, "110", "(2)유형자산", "asset", 2, "group", "080");
  const tangible = [
    ["111", "1.토지", ["112", "(손상차손누계액)"], ["113", "(정부보조금등차감액)"]],
    ["114", "2.건물", ["115", "(감가상각누계액)"], ["116", "(손상차손누계액)"], ["117", "(정부보조금등차감액)"]],
    ["118", "3.구축물", ["119", "(감가상각누계액)"], ["120", "(손상차손누계액)"], ["121", "(정부보조금등차감액)"]],
    ["122", "4.기계장치", ["123", "(감가상각누계액)"], ["124", "(손상차손누계액)"], ["125", "(정부보조금등차감액)"]],
    ["126", "5.선박·항공기", ["127", "(감가상각누계액)"], ["128", "(손상차손누계액)"], ["129", "(정부보조금등차감액)"]],
    ["130", "6.건설용장비", ["131", "(감가상각누계액)"], ["132", "(손상차손누계액)"], ["133", "(정부보조금등차감액)"]],
    ["134", "7.차량운반구", ["135", "(감가상각누계액)"], ["136", "(손상차손누계액)"], ["137", "(정부보조금등차감액)"]],
    ["138", "8.건설중인유형자산", ["139", "(손상차손누계액)"], ["140", "(정부보조금등차감액)"]],
    ["141", "9.시설장치", ["142", "(감가상각누계액)"], ["143", "(손상차손누계액)"], ["144", "(정부보조금등차감액)"]],
    ["145", "10.공구·기구·비품", ["146", "(감가상각누계액)"], ["147", "(손상차손누계액)"], ["148", "(정부보조금등차감액)"]],
  ] as const;

  for (const entry of tangible) {
    const [mainCode, mainLabel, ...subs] = entry as any;
    addRow(rows, mainCode, mainLabel, "asset", 3, "account", "110");
    for (const [code, label] of subs) addRow(rows, code, label, "asset", 4, "account", "110");
  }
  for (const base of ["149", "153", "157", "161", "165"]) {
    addRow(rows, base, `${Math.floor((Number(base) - 149) / 4) + 11}.기타유형자산(직접기재)`, "asset", 3, "account", "110", true);
    addRow(rows, String(Number(base) + 1).padStart(3, "0"), "(감가상각누계액)", "asset", 4, "account", "110");
    addRow(rows, String(Number(base) + 2).padStart(3, "0"), "(손상차손누계액)", "asset", 4, "account", "110");
    addRow(rows, String(Number(base) + 3).padStart(3, "0"), "(정부보조금등차감액)", "asset", 4, "account", "110");
  }

  addRow(rows, "169", "(3)무형자산", "asset", 2, "group", "080");
  addRow(rows, "170", "1.영업권", "asset", 3, "account", "169");
  addRow(rows, "171", "2.산업재산권", "asset", 3, "group", "169");
  addRow(rows, "172", "가.특허권", "asset", 4, "account", "171");
  addRow(rows, "173", "나.상표권", "asset", 4, "account", "171");
  addRow(rows, "174", "다.실용신안권", "asset", 4, "account", "171");
  addRow(rows, "175", "라.의장권", "asset", 4, "account", "171");
  for (const [code, label] of [["176", "마"], ["177", "바"], ["178", "사"], ["179", "아"], ["180", "자"]] as const) {
    addRow(rows, code, `${label}.기타산업재산권(직접기재)`, "asset", 4, "account", "171", true);
  }
  const intangibleItems = [
    ["181", "3.광업권"],
    ["182", "4.어업권"],
    ["183", "5.차지권"],
    ["184", "6.개발비"],
    ["185", "7.사용수익기부자산가액"],
    ["186", "8.소프트웨어"],
    ["187", "9.저작권"],
    ["188", "10.제이용권"],
  ] as const;
  for (const [code, label] of intangibleItems) addRow(rows, code, label, "asset", 3, "account", "169");
  for (const base of ["189", "190", "191", "192", "193"]) {
    addRow(rows, base, `${Number(base) - 178}.기타무형자산(직접기재)`, "asset", 3, "account", "169", true);
  }

  addRow(rows, "194", "(4)기타비유동자산", "asset", 2, "group", "080");
  addRow(rows, "195", "1.장기매출채권(공사․분양수입 외)", "asset", 3, "group", "194");
  for (const [base, label, title] of [
    ["196", "가", "장기외상매출금"],
    ["199", "나", "장기받을어음"],
    ["202", "다", "장기기타매출채권"],
  ] as const) {
    addRow(rows, base, `${label}.${title}`, "asset", 4, "account", "195");
    addRow(rows, String(Number(base) + 1).padStart(3, "0"), "(대손충당금)", "asset", 4, "account", "195");
    addRow(rows, String(Number(base) + 2).padStart(3, "0"), "(현재가치할인차금)", "asset", 4, "account", "195");
  }

  addRow(rows, "205", "2.장기미수금", "asset", 3, "group", "194");
  for (const [base, label, title] of [
    ["206", "가", "분양장기미수금"],
    ["209", "나", "공사장기미수금"],
    ["212", "다", "기타장기미수금"],
  ] as const) {
    addRow(rows, base, `${label}.${title}`, "asset", 4, "account", "205");
    addRow(rows, String(Number(base) + 1).padStart(3, "0"), "(대손충당금)", "asset", 4, "account", "205");
    addRow(rows, String(Number(base) + 2).padStart(3, "0"), "(현재가치할인차금)", "asset", 4, "account", "205");
  }
  addRow(rows, "215", "3.장기선급금", "asset", 3, "account", "194");
  addRow(rows, "216", "(대손충당금)", "asset", 4, "account", "194");
  addRow(rows, "217", "4.보증금", "asset", 3, "group", "194");
  addRow(rows, "218", "가.임차보증금", "asset", 4, "account", "217");
  addRow(rows, "219", "(대손충당금)", "asset", 4, "account", "217");
  addRow(rows, "220", "나.기타보증금", "asset", 4, "account", "217");
  addRow(rows, "221", "(대손충당금)", "asset", 4, "account", "217");
  addRow(rows, "222", "5.이연법인세자산", "asset", 3, "account", "194");
  for (const [code, n] of [["223", "6"], ["224", "7"], ["225", "8"], ["226", "9"], ["227", "10"]] as const) {
    addRow(rows, code, `${n}.기타비유동자산(직접기재)`, "asset", 3, "account", "194", true);
  }

  addRow(rows, "383", "부채와 자본총계", "liability_equity", 0, "total");
  addRow(rows, "229", "Ⅰ.유동부채", "liability_equity", 1, "section", "383");
  addRow(rows, "230", "1.매입채무", "liability_equity", 2, "group", "229");
  addRow(rows, "231", "가.외상매입금", "liability_equity", 3, "account", "230");
  addRow(rows, "232", "나.지급어음", "liability_equity", 3, "account", "230");
  addRow(rows, "233", "다.기타매입채무", "liability_equity", 3, "account", "230");
  addRow(rows, "234", "2.단기차입금", "liability_equity", 2, "group", "229");
  addRow(rows, "235", "가.관계회사", "liability_equity", 3, "account", "234");
  addRow(rows, "236", "나.주주·임원·직원", "liability_equity", 3, "account", "234");
  addRow(rows, "237", "다.기타단기차입금", "liability_equity", 3, "account", "234");
  addRow(rows, "238", "3.미지급금", "liability_equity", 2, "group", "229");
  addRow(rows, "239", "가.미지급법인세", "liability_equity", 3, "account", "238");
  addRow(rows, "240", "나.미지급배당금", "liability_equity", 3, "account", "238");
  addRow(rows, "241", "다.기타미지급금", "liability_equity", 3, "account", "238");
  addRow(rows, "242", "4.선수금", "liability_equity", 2, "group", "229");
  addRow(rows, "243", "가.분양선수금", "liability_equity", 3, "account", "242");
  addRow(rows, "244", "나.공사선수금", "liability_equity", 3, "account", "242");
  addRow(rows, "245", "다.기타선수금", "liability_equity", 3, "account", "242");
  addRow(rows, "246", "5.예수금", "liability_equity", 2, "group", "229");
  addRow(rows, "247", "가.부가가치세예수금", "liability_equity", 3, "account", "246");
  addRow(rows, "248", "나.제세예수금", "liability_equity", 3, "account", "246");
  addRow(rows, "249", "다.예수보증금", "liability_equity", 3, "account", "246");
  addRow(rows, "250", "라.기타예수금", "liability_equity", 3, "account", "246");
  addRow(rows, "251", "6.미지급비용", "liability_equity", 2, "account", "229");
  addRow(rows, "252", "7.선수수익", "liability_equity", 2, "account", "229");
  addRow(rows, "253", "8.유동성장기부채", "liability_equity", 2, "group", "229");
  for (const [base, label, title] of [
    ["254", "가", "유동성장기차입금"],
    ["256", "나", "유동성사채"],
  ] as const) {
    addRow(rows, base, `${label}.${title}`, "liability_equity", 3, "account", "253");
    addRow(rows, String(Number(base) + 1).padStart(3, "0"), "(현재가치할인차금)", "liability_equity", 3, "account", "253");
  }
  for (const base of ["258", "260", "262", "264", "266"]) {
    const idx = ["다", "라", "마", "바", "사"][(Number(base) - 258) / 2];
    addRow(rows, base, `${idx}.기타유동성장기부채(직접기재)`, "liability_equity", 3, "account", "253", true);
    addRow(rows, String(Number(base) + 1).padStart(3, "0"), "(현재가치할인차금)", "liability_equity", 3, "account", "253");
  }

  addRow(rows, "268", "9.단기충당부채", "liability_equity", 2, "group", "229");
  addRow(rows, "269", "가.단기공사손실충당부채", "liability_equity", 3, "account", "268");
  addRow(rows, "270", "나.단기제품보증충당부채", "liability_equity", 3, "account", "268");
  addRow(rows, "271", "다.단기반품추정충당부채", "liability_equity", 3, "account", "268");
  addRow(rows, "272", "라.단기하자보수충당부채", "liability_equity", 3, "account", "268");
  for (const [code, label] of [["273", "마"], ["274", "바"], ["275", "사"], ["276", "아"], ["277", "자"]] as const) {
    addRow(rows, code, `${label}.단기기타충당부채(직접기재)`, "liability_equity", 3, "account", "268", true);
  }
  addRow(rows, "278", "10.이연법인세부채", "liability_equity", 2, "account", "229");
  for (const [code, n] of [["279", "11"], ["280", "12"], ["281", "13"], ["282", "14"], ["283", "15"]] as const) {
    addRow(rows, code, `${n}.기타유동부채(직접기재)`, "liability_equity", 2, "account", "229", true);
  }

  addRow(rows, "284", "Ⅱ.비유동부채", "liability_equity", 1, "section", "383");
  addRow(rows, "285", "1.사채", "liability_equity", 2, "account", "284");
  addRow(rows, "286", "(현재가치할인차금)", "liability_equity", 3, "account", "284");
  addRow(rows, "287", "2.전환사채등신종사채", "liability_equity", 2, "account", "284");
  addRow(rows, "288", "(현재가치할인차금)", "liability_equity", 3, "account", "284");
  addRow(rows, "289", "3.장기차입금", "liability_equity", 2, "group", "284");
  for (const [base, label, title] of [
    ["290", "가", "관계회사"],
    ["292", "나", "주주·임원·직원"],
    ["294", "다", "기타장기차입금"],
  ] as const) {
    addRow(rows, base, `${label}.${title}`, "liability_equity", 3, "account", "289");
    addRow(rows, String(Number(base) + 1).padStart(3, "0"), "(현재가치할인차금)", "liability_equity", 3, "account", "289");
  }
  addRow(rows, "296", "4.장기매입채무", "liability_equity", 2, "group", "284");
  for (const [base, label, title] of [
    ["297", "가", "장기외상매입금"],
    ["299", "나", "장기지급어음"],
    ["301", "다", "장기기타매입채무"],
  ] as const) {
    addRow(rows, base, `${label}.${title}`, "liability_equity", 3, "account", "296");
    addRow(rows, String(Number(base) + 1).padStart(3, "0"), "(현재가치할인차금)", "liability_equity", 3, "account", "296");
  }
  addRow(rows, "303", "5.장기미지급금", "liability_equity", 2, "account", "284");
  addRow(rows, "304", "(현재가치할인차금)", "liability_equity", 3, "account", "284");
  addRow(rows, "305", "6.장기선수금", "liability_equity", 2, "group", "284");
  addRow(rows, "306", "가.장기분양선수금", "liability_equity", 3, "account", "305");
  addRow(rows, "307", "나.장기공사선수금", "liability_equity", 3, "account", "305");
  addRow(rows, "308", "다.장기기타선수금", "liability_equity", 3, "account", "305");
  addRow(rows, "309", "7.퇴직급여충당부채", "liability_equity", 2, "account", "284");
  addRow(rows, "310", "8.퇴직연금미지급금", "liability_equity", 2, "account", "284");
  addRow(rows, "311", "(국민연금전환금)", "liability_equity", 3, "account", "284");
  addRow(rows, "312", "(퇴직보험예치금)", "liability_equity", 3, "account", "284");
  addRow(rows, "313", "(퇴직연금운용자산)", "liability_equity", 3, "account", "284");
  addRow(rows, "314", "9.장기충당부채", "liability_equity", 2, "group", "284");
  addRow(rows, "315", "가.장기공사손실충당부채", "liability_equity", 3, "account", "314");
  addRow(rows, "316", "나.장기제품보증충당부채", "liability_equity", 3, "account", "314");
  addRow(rows, "317", "다.장기반품추정충당부채", "liability_equity", 3, "account", "314");
  addRow(rows, "318", "라.장기하자보수충당부채", "liability_equity", 3, "account", "314");
  for (const [code, label] of [["319", "마"], ["320", "바"], ["321", "사"], ["322", "아"], ["323", "자"]] as const) {
    addRow(rows, code, `${label}.장기기타충당부채(직접기재)`, "liability_equity", 3, "account", "314", true);
  }
  addRow(rows, "324", "10.제준비금", "liability_equity", 2, "account", "284");
  addRow(rows, "325", "11.이연법인세부채", "liability_equity", 2, "account", "284");
  addRow(rows, "326", "12.장기임대보증금", "liability_equity", 2, "account", "284");
  addRow(rows, "327", "13.장기기타보증금", "liability_equity", 2, "account", "284");
  for (const [code, n] of [["328", "14"], ["329", "15"], ["330", "16"], ["331", "17"], ["332", "18"]] as const) {
    addRow(rows, code, `${n}.기타비유동부채(직접기재)`, "liability_equity", 2, "account", "284", true);
  }

  addRow(rows, "333", "부채총계(Ⅰ+Ⅱ)", "liability_equity", 1, "total", "383");
  addRow(rows, "334", "Ⅲ.자본금", "liability_equity", 1, "account", "383");
  addRow(rows, "337", "Ⅳ.자본잉여금", "liability_equity", 1, "account", "383");
  addRow(rows, "348", "Ⅴ.자본조정", "liability_equity", 1, "account", "383");
  addRow(rows, "361", "Ⅵ.기타포괄손익누계액", "liability_equity", 1, "account", "383");
  addRow(rows, "372", "Ⅶ.이익잉여금", "liability_equity", 1, "account", "383");
  addRow(rows, "382", "자본총계(Ⅲ+～Ⅶ)", "liability_equity", 1, "total", "383");

  return rows;
}

const ACCOUNT_ROWS = buildAccountRows();
const ACCOUNT_MAP = Object.fromEntries(ACCOUNT_ROWS.map((row) => [row.code, row])) as Record<string, AccountRow>;
const LEAF_POSTABLE_CODES = ACCOUNT_ROWS.filter((row) => row.kind === "account").map((row) => row.code);

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString("ko-KR")} KRW`;
}

function parseAmount(value?: string) {
  if (!value) return 0;
  const parsed = Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeTag(tag?: string): string {
  if (!tag) return "";
  const raw = tag.trim();
  const lower = raw.toLowerCase();
  const normalized = raw.normalize("NFC");
  const normalizedLower = normalized.toLowerCase();

  if (
    lower.includes("google digital inc") ||
    lower.includes("google* google digital") ||
    lower.includes("mountain view usa")
  ) return "Google";

  if (lower.includes("amazon_aws") || lower.includes("aws") || normalizedLower.includes("amazon aws")) {
    return "Amazon AWS";
  }

  if (lower.includes("openai") || normalizedLower.includes("chatgpt")) return "OpenAI ChatGPT";
  if (lower.includes("adobe")) return "Adobe";
  if (lower.includes("replit")) return "Replit";
  if (lower.includes("mongodbcloud") || lower.includes("mongodb")) return "MongoDB Cloud";
  if (lower.includes("anthropic") || lower.includes("claude.ai") || normalizedLower.includes("claude")) return "Anthropic";
  if (lower.includes("stability")) return "Stability AI";
  if (lower.includes("aimlapi")) return "AIMLAPI";
  if (lower.includes("m studio ai")) return "M Studio AI";
  if (lower.includes("resemble")) return "Resemble AI";
  if (lower.includes("replicate")) return "Replicate";
  if (lower.includes("650 industries") || lower.includes("expo")) return "Expo";
  if (lower.includes("microso")) return "Microsoft";
  if (lower.includes("github")) return "GitHub";
  if (lower.includes("parallels")) return "Parallels Desktop for Mac";
  if (lower.includes("dynadot")) return "Dynadot";
  if (lower.includes("apple") || normalized.includes("애플")) return "Apple";
  if (lower.includes("facebook") || lower.includes("facebk")) return "Facebook Ads";
  if (lower.includes("tiktok")) return "TikTok Promote";

  if (
    normalized.includes("구글애드워즈") ||
    normalized.includes("구글 애드워즈") ||
    normalized.includes("구글애드") ||
    normalized.includes("구글 광고")
  ) return "Google Ads";

  if (normalized.includes("사무실계약")) return "Office Lease";
  if (normalized.includes("등록면허세") || normalized.includes("용인시등록면허세")) return "Registration License Tax";
  if (normalized.includes("법원행정처")) return "Court Administration Office";
  if (normalized.includes("법인공동인증서")) return "Corporate 공동인증서";
  if (normalized.includes("법무법인") || normalized.includes("미션")) return "Law Firm / Legal Service";
  if (normalized.includes("더싼") || normalized.includes("인쇄") || normalized.includes("스캔")) return "Printing & Scanning";
  if (normalized.includes("다이소")) return "Daiso";

  return normalized;
}

function getDefaultCategory(normalizedTag: string): Category {
  const key = normalizedTag.toLowerCase();
  if (key.includes("google ads") || key.includes("facebook ads") || key.includes("tiktok promote")) {
    return "Advertising & Marketing";
  }
  if (key.includes("amazon aws") || key === "google" || key.includes("mongodb cloud")) {
    return "Cloud Infrastructure";
  }
  if (
    key.includes("openai") ||
    key.includes("anthropic") ||
    key.includes("stability") ||
    key.includes("aimlapi") ||
    key.includes("m studio ai") ||
    key.includes("resemble") ||
    key.includes("replicate")
  ) return "AI Services";

  if (
    key.includes("adobe") ||
    key.includes("replit") ||
    key.includes("expo") ||
    key.includes("microsoft") ||
    key.includes("parallels") ||
    key.includes("apple") ||
    key.includes("github")
  ) return "Software Licenses & Tools";

  if (key.includes("office lease") || key.includes("daiso") || key.includes("printing & scanning")) {
    return "Office & Administrative";
  }
  if (
    key.includes("registration license tax") ||
    key.includes("court administration office") ||
    key.includes("corporate 공동인증서") ||
    key.includes("law firm / legal service")
  ) return "Legal & Compliance";

  if (key.includes("dynadot")) return "Domain & Certificates";
  return "Miscellaneous";
}

function getDefaultMapping(normalizedTag: string, category: Category): ItemMapping {
  const key = normalizedTag.toLowerCase();

  if (key.includes("office lease")) {
    return { category, debitCode: "218", creditCode: "003", note: "기본값은 임차보증금으로 잡아두었고 필요 시 선급비용(069) 등으로 조정" };
  }

  if (key.includes("apple")) {
    return { category, debitCode: "145", creditCode: "003", note: "기본값은 공구·기구·비품" };
  }

  if (
    key.includes("adobe") ||
    key.includes("microsoft") ||
    key.includes("github") ||
    key.includes("expo") ||
    key.includes("replit") ||
    key.includes("parallels") ||
    key.includes("openai") ||
    key.includes("anthropic") ||
    key.includes("stability") ||
    key.includes("aimlapi") ||
    key.includes("m studio ai") ||
    key.includes("resemble") ||
    key.includes("replicate") ||
    key.includes("dynadot") ||
    key.includes("corporate 공동인증서")
  ) {
    return { category, debitCode: "069", creditCode: "003", note: "기본값은 선급비용. 장기 사용권이면 소프트웨어(186) 등으로 조정 가능" };
  }

  if (
    key.includes("google ads") ||
    key.includes("facebook ads") ||
    key.includes("tiktok promote") ||
    key.includes("google") ||
    key.includes("amazon aws") ||
    key.includes("mongodb cloud") ||
    key.includes("registration license tax") ||
    key.includes("law firm") ||
    key.includes("court administration office") ||
    key.includes("daiso") ||
    key.includes("printing")
  ) {
    return { category, debitCode: "069", creditCode: "003", note: "기본값은 선급비용. 이미 비용 소멸분이면 수동조정으로 잔액을 0에 맞추는 방식 권장" };
  }

  return { category, debitCode: "069", creditCode: "003" };
}


function applySignedEntry(
  map: Record<string, number>,
  debitCode: string,
  creditCode: string,
  amount: number
) {
  const debitSide = ACCOUNT_MAP[debitCode]?.side;
  const creditSide = ACCOUNT_MAP[creditCode]?.side;

  if (debitSide) {
    map[debitCode] =
      (map[debitCode] || 0) + (debitSide === "asset" ? amount : -amount);
  }

  if (creditSide) {
    map[creditCode] =
      (map[creditCode] || 0) + (creditSide === "asset" ? -amount : amount);
  }
}

function buildTransactionBalanceMap(
  scheduleList: Schedule[],
  tagCategories: Record<string, Category>,
  mappings: MappingMap
): Record<string, number> {
  const grouped: Record<string, number> = {};

  scheduleList
    .filter((schedule) => schedule.tag && schedule.amount)
    .forEach((schedule) => {
      const normalizedTag = normalizeTag(schedule.tag as string);
      const amount = parseAmount(schedule.amount);
      grouped[normalizedTag] = (grouped[normalizedTag] || 0) + amount;
    });

  const map: Record<string, number> = {};
  Object.entries(grouped).forEach(([normalizedTag, amount]) => {
    const selectedCategory = tagCategories[normalizedTag] || getDefaultCategory(normalizedTag);
    const mapping = mappings[normalizedTag] || getDefaultMapping(normalizedTag, selectedCategory);
    applySignedEntry(map, mapping.debitCode, mapping.creditCode, amount);
  });

  return map;
}

function buildLoanBalanceMap(loanAmount: number): Record<string, number> {
  const map: Record<string, number> = {};
  if (loanAmount > 0) {
    applySignedEntry(map, "003", "236", loanAmount);
  }
  return map;
}

function buildDirectBalanceMap(
  manualBalances: AccountBalanceMap,
  autoBalances: Record<string, number>
): Record<string, number> {
  const map: Record<string, number> = {};
  for (const row of ACCOUNT_ROWS) {
    const manual = Number(manualBalances[row.code] || 0);
    const auto = Number(autoBalances[row.code] || 0);
    map[row.code] = manual + auto;
  }
  return map;
}

function buildRolledBalanceMap(directBalances: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {};
  const calculate = (code: string): number => {
    const own = directBalances[code] || 0;
    const children = ACCOUNT_ROWS.filter((row) => row.parentCode === code);
    const childSum = children.reduce((sum, child) => sum + calculate(child.code), 0);
    const total = own + childSum;
    result[code] = total;
    return total;
  };

  calculate("228");
  calculate("383");
  result["333"] = (result["229"] || 0) + (result["284"] || 0);
  result["382"] =
    (result["334"] || directBalances["334"] || 0) +
    (result["337"] || directBalances["337"] || 0) +
    (result["348"] || directBalances["348"] || 0) +
    (result["361"] || directBalances["361"] || 0) +
    (result["372"] || directBalances["372"] || 0);
  result["383"] = (result["333"] || 0) + (result["382"] || 0);
  return result;
}

function getLoanAmountUntil(cutoffDate?: string): number {
  const cutoff = cutoffDate ? parseScheduleDate(cutoffDate) : null;
  if (cutoff) cutoff.setHours(23, 59, 59, 999);

  return LOAN_TRANCHES.reduce((sum, tranche) => {
    const parsed = parseScheduleDate(tranche.date);
    if (!parsed) return sum;
    if (!cutoff || parsed.getTime() <= cutoff.getTime()) {
      return sum + tranche.amount;
    }
    return sum;
  }, 0);
}

function getHardcodedAdjustmentsUntil(cutoffDate?: string): HardcodedAdjustment[] {
  const cutoff = cutoffDate ? parseScheduleDate(cutoffDate) : null;
  if (cutoff) cutoff.setHours(23, 59, 59, 999);

  return HARDCODED_ADJUSTMENTS.filter((entry) => {
    const parsed = parseScheduleDate(entry.date);
    if (!parsed) return false;
    return !cutoff || parsed.getTime() <= cutoff.getTime();
  });
}

function buildAdjustmentBalanceMap(entries: HardcodedAdjustment[]): Record<string, number> {
  const map: Record<string, number> = {};
  entries.forEach((entry) => {
    applySignedEntry(map, entry.debitCode, entry.creditCode, entry.amount);
  });
  return map;
}

function mergeBalanceMaps(...maps: Record<string, number>[]): Record<string, number> {
  const merged: Record<string, number> = {};
  maps.forEach((map) => {
    Object.entries(map).forEach(([code, amount]) => {
      merged[code] = (merged[code] || 0) + amount;
    });
  });
  return merged;
}

export default function StandardBalanceSheetPage() {
  const { SERVER_URL } = useConfig();

  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [manualBalances, setManualBalances] = useState<AccountBalanceMap>({});
  const [tagCategories, setTagCategories] = useState<Record<string, Category>>({});
  const [mappings, setMappings] = useState<MappingMap>({});
  const [query, setQuery] = useState("");
  const [cutoffDate, setCutoffDate] = useState("");
  const [mappingMode] = useState<MappingMode>("debitCredit");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedCategories = localStorage.getItem(LOCAL_STORAGE_CATEGORY_KEY);
    const storedMappings = localStorage.getItem(LOCAL_STORAGE_MAPPING_KEY);
    const storedManual = localStorage.getItem(LOCAL_STORAGE_MANUAL_KEY);

    if (storedCategories) setTagCategories(JSON.parse(storedCategories));
    if (storedMappings) setMappings(JSON.parse(storedMappings));
    if (storedManual) {
      setManualBalances({ ...DEFAULT_MANUAL_BALANCES, ...JSON.parse(storedManual) });
    } else {
      setManualBalances(DEFAULT_MANUAL_BALANCES);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_STORAGE_CATEGORY_KEY, JSON.stringify(tagCategories));
  }, [tagCategories]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_STORAGE_MAPPING_KEY, JSON.stringify(mappings));
  }, [mappings]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(LOCAL_STORAGE_MANUAL_KEY, JSON.stringify(manualBalances));
  }, [manualBalances]);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get<Schedule[]>(
          `${SERVER_URL}/api/adminPlan/schedules?region=beta`,
          { withCredentials: true }
        );
        setSchedules(res.data);
      } catch (error) {
        console.error("Error fetching schedules", error);
      }
    };
    fetchSchedules();
  }, [SERVER_URL]);

  const effectiveSchedules = useMemo(() => {
    if (!cutoffDate) return schedules;
    const cutoff = parseScheduleDate(cutoffDate);
    if (!cutoff) return schedules;
    cutoff.setHours(23, 59, 59, 999);

    return schedules.filter((schedule) => {
      const parsed = parseScheduleDate(schedule.eventDate);
      if (!parsed) return false;
      return parsed.getTime() <= cutoff.getTime();
    });
  }, [schedules, cutoffDate]);

  const effectiveAdjustments = useMemo(() => getHardcodedAdjustmentsUntil(cutoffDate), [cutoffDate]);

  const visibleAdjustments = useMemo(() => {
    if (!query.trim()) return effectiveAdjustments;
    const lowered = query.trim().toLowerCase();
    return effectiveAdjustments.filter((entry) => {
      return (
        entry.label.toLowerCase().includes(lowered)
        || (entry.note || "").toLowerCase().includes(lowered)
        || entry.debitCode.includes(lowered)
        || entry.creditCode.includes(lowered)
      );
    });
  }, [effectiveAdjustments, query]);

  const normalizedItems = useMemo(() => {
    const grouped: Record<string, { amount: number; schedules: Schedule[] }> = {};

    effectiveSchedules
      .filter((schedule) => schedule.tag && schedule.amount)
      .forEach((schedule) => {
        const normalizedTag = normalizeTag(schedule.tag);
        const amount = parseAmount(schedule.amount);
        if (!normalizedTag || amount <= 0) return;
        if (!grouped[normalizedTag]) {
          grouped[normalizedTag] = { amount: 0, schedules: [] };
        }
        grouped[normalizedTag].amount += amount;
        grouped[normalizedTag].schedules.push(schedule);
      });

    return Object.entries(grouped)
      .map(([normalizedTag, value]) => {
        const selectedCategory = tagCategories[normalizedTag] || getDefaultCategory(normalizedTag);
        const mapping = mappings[normalizedTag] || getDefaultMapping(normalizedTag, selectedCategory);
        return {
          normalizedTag,
          amount: value.amount,
          schedules: value.schedules,
          category: selectedCategory,
          mapping,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [effectiveSchedules, tagCategories, mappings]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return normalizedItems;
    const lowered = query.trim().toLowerCase();
    return normalizedItems.filter((item) => {
      const debitLabel = ACCOUNT_MAP[item.mapping.debitCode]?.label || "";
      const creditLabel = ACCOUNT_MAP[item.mapping.creditCode]?.label || "";
      return (
        item.normalizedTag.toLowerCase().includes(lowered) ||
        item.category.toLowerCase().includes(lowered) ||
        debitLabel.toLowerCase().includes(lowered) ||
        creditLabel.toLowerCase().includes(lowered)
      );
    });
  }, [normalizedItems, query]);

  const loanAmountUntilCutoff = useMemo(() => getLoanAmountUntil(cutoffDate), [cutoffDate]);
  const adjustmentTotal = useMemo(
    () => effectiveAdjustments.reduce((sum, entry) => sum + entry.amount, 0),
    [effectiveAdjustments]
  );

  const autoBalances = useMemo(() => {
    const scheduleMap = buildTransactionBalanceMap(effectiveSchedules, tagCategories, mappings);
    const adjustmentMap = buildAdjustmentBalanceMap(effectiveAdjustments);
    const loanMap = buildLoanBalanceMap(loanAmountUntilCutoff);
    return mergeBalanceMaps(scheduleMap, adjustmentMap, loanMap);
  }, [effectiveSchedules, effectiveAdjustments, tagCategories, mappings, loanAmountUntilCutoff]);

  const directBalances = useMemo(
    () => buildDirectBalanceMap(manualBalances, autoBalances),
    [manualBalances, autoBalances]
  );

  const rolledBalances = useMemo(
    () => buildRolledBalanceMap(directBalances),
    [directBalances]
  );


  const monthlyTrend = useMemo(() => {
    const datedSchedules = schedules
      .map((schedule) => ({
        ...schedule,
        parsedDate: parseScheduleDate(schedule.eventDate),
      }))
      .filter((schedule) => schedule.parsedDate);

    const loanDates = LOAN_TRANCHES.map((item) => parseScheduleDate(item.date)).filter(
      (date): date is Date => Boolean(date)
    );

    const allDates = [
      ...datedSchedules.map((item) => item.parsedDate as Date),
      ...loanDates,
    ].sort((a, b) => a.getTime() - b.getTime());

    if (!allDates.length) {
      return { labels: [], asset: [], liability: [], equity: [] };
    }

    const start = new Date(allDates[0].getFullYear(), allDates[0].getMonth(), 1);
    const cutoff = cutoffDate ? parseScheduleDate(cutoffDate) : null;
    const end = cutoff || allDates[allDates.length - 1];

    const labels: string[] = [];
    const asset: number[] = [];
    const liability: number[] = [];
    const equity: number[] = [];

    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);

    while (cursor.getTime() <= end.getTime()) {
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59, 999);
      const effectiveMonthEnd =
        monthEnd.getTime() > end.getTime()
          ? new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59, 999)
          : monthEnd;

      const monthSchedules = datedSchedules
        .filter((item) => (item.parsedDate as Date).getTime() <= effectiveMonthEnd.getTime())
        .map(({ parsedDate, ...rest }) => rest);

      const monthLoanAmount = LOAN_TRANCHES.reduce((sum, tranche) => {
        const parsed = parseScheduleDate(tranche.date);
        if (!parsed) return sum;
        return parsed.getTime() <= effectiveMonthEnd.getTime() ? sum + tranche.amount : sum;
      }, 0);

      const monthAdjustments = getHardcodedAdjustmentsUntil(
        `${effectiveMonthEnd.getFullYear()}-${String(effectiveMonthEnd.getMonth() + 1).padStart(2, "0")}-${String(
          effectiveMonthEnd.getDate()
        ).padStart(2, "0")}`
      );
      const monthTransactionBalances = buildTransactionBalanceMap(
        monthSchedules,
        tagCategories,
        mappings
      );
      const monthAdjustmentBalances = buildAdjustmentBalanceMap(monthAdjustments);
      const monthLoanBalances = buildLoanBalanceMap(monthLoanAmount);
      const monthAutoBalances = mergeBalanceMaps(
        monthTransactionBalances,
        monthAdjustmentBalances,
        monthLoanBalances
      );
      const monthDirectBalances = buildDirectBalanceMap(
        manualBalances,
        monthAutoBalances
      );
      const monthRolledBalances = buildRolledBalanceMap(monthDirectBalances);

      labels.push(
        effectiveMonthEnd.getDate() === monthEnd.getDate()
          ? `${effectiveMonthEnd.getFullYear()}-${String(effectiveMonthEnd.getMonth() + 1).padStart(2, "0")}`
          : `${effectiveMonthEnd.getFullYear()}-${String(effectiveMonthEnd.getMonth() + 1).padStart(2, "0")}-${String(
              effectiveMonthEnd.getDate()
            ).padStart(2, "0")}`
      );
      asset.push(monthRolledBalances["228"] || 0);
      liability.push(monthRolledBalances["333"] || 0);
      equity.push(monthRolledBalances["382"] || 0);

      cursor.setMonth(cursor.getMonth() + 1);
    }

    return { labels, asset, liability, equity };
  }, [schedules, cutoffDate, tagCategories, mappings, manualBalances]);

  const monthlyTrendData = useMemo(
    () => ({
      labels: monthlyTrend.labels,
      datasets: [
        {
          label: "자산",
          data: monthlyTrend.asset,
        },
        {
          label: "부채",
          data: monthlyTrend.liability,
        },
        {
          label: "자본",
          data: monthlyTrend.equity,
        },
      ],
    }),
    [monthlyTrend]
  );

  const assetTotal = rolledBalances["228"] || 0;
  const liabilityEquityTotal = rolledBalances["383"] || 0;
  const balanceGap = assetTotal - liabilityEquityTotal;

  const handleCategoryChange = (normalizedTag: string, category: Category) => {
    setTagCategories((prev) => ({ ...prev, [normalizedTag]: category }));
    setMappings((prev) => {
      const current = prev[normalizedTag] || getDefaultMapping(normalizedTag, category);
      return {
        ...prev,
        [normalizedTag]: {
          ...current,
          category,
        },
      };
    });
  };

  const handleMappingChange = (
    normalizedTag: string,
    field: keyof ItemMapping,
    value: string
  ) => {
    const currentCategory = tagCategories[normalizedTag] || getDefaultCategory(normalizedTag);
    const current = mappings[normalizedTag] || getDefaultMapping(normalizedTag, currentCategory);
    setMappings((prev) => ({
      ...prev,
      [normalizedTag]: {
        ...current,
        [field]: value,
      },
    }));
  };

  const handleManualBalanceChange = (code: string, value: string) => {
    const numeric = Number(value.replace(/[^\d.-]/g, ""));
    setManualBalances((prev) => ({
      ...prev,
      [code]: Number.isFinite(numeric) ? numeric : 0,
    }));
  };

  const sideRows = {
    asset: ACCOUNT_ROWS.filter((row) => row.side === "asset"),
    liability_equity: ACCOUNT_ROWS.filter((row) => row.side === "liability_equity"),
  };

  const postableOptions = LEAF_POSTABLE_CODES.map((code) => ({
    code,
    label: `${code} · ${ACCOUNT_MAP[code]?.label || ""}`,
  }));

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>AdminPlan → Standard Balance Sheet</p>
          <h1 className={styles.title}>표준재무상태표 관리</h1>
          <p className={styles.subtitle}>
            AdminPlan의 일정/결제 데이터를 불러와 항목별로 차변·대변 계정을 자동 반영하고,
            필요하면 수동으로 재분류·조정할 수 있게 만든 페이지입니다.
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span className={styles.summaryLabel}>자산총계</span>
            <strong className={styles.summaryValue}>{formatCurrency(assetTotal)}</strong>
            <span className={styles.summaryCode}>코드 228</span>
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.summaryLabel}>부채와 자본총계</span>
            <strong className={styles.summaryValue}>{formatCurrency(liabilityEquityTotal)}</strong>
            <span className={styles.summaryCode}>코드 383</span>
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.summaryLabel}>차액</span>
            <strong className={`${styles.summaryValue} ${Math.abs(balanceGap) < 1 ? styles.good : styles.warn}`}>
              {formatCurrency(balanceGap)}
            </strong>
            <span className={styles.summaryCode}>0에 가까울수록 균형</span>
          </article>
        </section>

        <section className={styles.noticeBox}>
          <p>
            현재 페이지는 <strong>AdminPlan의 결제 데이터</strong>를 기준으로 잔액 변동을 계산합니다.
            그래서 실제 신고용 재무상태표로 쓰려면 <strong>기초잔액/수동조정</strong>을 함께 넣어야 합니다.
          </p>
          <p>
            기본 예시값으로는 <strong>자본금 5,000,000원(코드 334)</strong>을 반영해 두었고,
            대표자 무이자 대여금은 <strong>설립 전 누계 1,081,205원</strong>과
            <strong>2025-04-30 ~ 2026-04-01</strong>까지의 각 차입 트랜치가 날짜별 누적으로 반영되도록 설정했습니다.
          </p>
          <p>
            기본 흐름: 결제 항목별로 <strong>차변 계정 + 대변 계정</strong>을 지정하고,
            필요 시 각 코드별 수동조정 금액을 입력하면 됩니다.
          </p>
          <p>
            아래의 <strong>기준일</strong>을 선택하면, 그 날짜까지 발생한 일정/비용 기여분만 반영하고,
            대표자 대여금도 같은 기준일까지 실제 입금된 분만 누적 반영합니다.
          </p>
        </section>

        <section className={styles.filterBar}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="cutoffDate">
              기준일
            </label>
            <input
              id="cutoffDate"
              type="date"
              className={styles.dateInput}
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
            />
            {cutoffDate && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={() => setCutoffDate("")}
              >
                날짜 초기화
              </button>
            )}
          </div>
          <div className={styles.filterMeta}>
            {cutoffDate
              ? `${cutoffDate}까지의 일정/비용 및 대표자 대여금 누적분 반영 중`
              : "전체 기간의 일정/비용 및 대표자 대여금 누적분 반영 중"}
            <span className={styles.filterCount}>
              {effectiveSchedules.length}건 반영 / 전체 {schedules.length}건 · 대여금 누적 {formatCurrency(loanAmountUntilCutoff)}
            </span>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>항목 분류 매핑</h2>
              <p>AdminPlan의 tag 정규화 결과를 기준으로 카테고리와 차변/대변 계정을 조절합니다.</p>
            </div>
            <input
              className={styles.searchInput}
              placeholder="항목명, 계정명, 카테고리 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.mappingTable}>
              <thead>
                <tr>
                  <th>항목명</th>
                  <th>누적금액</th>
                  <th>카테고리</th>
                  <th>차변 계정</th>
                  <th>대변 계정</th>
                  <th>참고</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.normalizedTag}>
                    <td>
                      <div className={styles.itemTitle}>{item.normalizedTag}</div>
                      <div className={styles.itemMeta}>{item.schedules.length}건 집계</div>
                    </td>
                    <td>{formatCurrency(item.amount)}</td>
                    <td>
                      <select
                        className={styles.select}
                        value={item.category}
                        onChange={(e) => handleCategoryChange(item.normalizedTag, e.target.value as Category)}
                      >
                        {categoryOptions.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className={styles.select}
                        value={item.mapping.debitCode}
                        onChange={(e) => handleMappingChange(item.normalizedTag, "debitCode", e.target.value)}
                      >
                        {postableOptions.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className={styles.select}
                        value={item.mapping.creditCode}
                        onChange={(e) => handleMappingChange(item.normalizedTag, "creditCode", e.target.value)}
                      >
                        {postableOptions.map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={styles.noteCell}>
                      {mappingMode === "debitCredit"
                        ? item.mapping.note || "-"
                        : "-"}
                    </td>
                  </tr>
                ))}
                {filteredItems.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyCell}>
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.dualGrid}>
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>자산총계 상세</h2>
                <p>코드 228 아래 모든 세목을 펼쳐서 보여줍니다.</p>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.balanceTable}>
                <thead>
                  <tr>
                    <th>코드</th>
                    <th>항목</th>
                    <th>자동반영</th>
                    <th>수동조정</th>
                    <th>반영잔액</th>
                  </tr>
                </thead>
                <tbody>
                  {sideRows.asset.map((row) => {
                    const auto = autoBalances[row.code] || 0;
                    const manual = manualBalances[row.code] || 0;
                    const total = rolledBalances[row.code] || 0;
                    return (
                      <tr key={row.code} className={styles[`level${Math.min(row.level, 4)}`]}>
                        <td>{row.code}</td>
                        <td>
                          <div className={styles.rowLabelWrap}>
                            <span className={row.kind === "total" ? styles.totalLabel : ""}>{row.label}</span>
                            {row.isDirectInput && <span className={styles.directBadge}>직접기재</span>}
                          </div>
                        </td>
                        <td>{formatCurrency(auto)}</td>
                        <td>
                          <input
                            className={styles.amountInput}
                            value={manual}
                            onChange={(e) => handleManualBalanceChange(row.code, e.target.value)}
                          />
                        </td>
                        <td className={row.kind === "total" ? styles.totalAmount : ""}>
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h2>부채와 자본총계 상세</h2>
                <p>코드 383 아래 모든 세목을 펼쳐서 보여줍니다.</p>
              </div>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.balanceTable}>
                <thead>
                  <tr>
                    <th>코드</th>
                    <th>항목</th>
                    <th>자동반영</th>
                    <th>수동조정</th>
                    <th>반영잔액</th>
                  </tr>
                </thead>
                <tbody>
                  {sideRows.liability_equity.map((row) => {
                    const auto = autoBalances[row.code] || 0;
                    const manual = manualBalances[row.code] || 0;
                    const total = rolledBalances[row.code] || 0;
                    return (
                      <tr key={row.code} className={styles[`level${Math.min(row.level, 4)}`]}>
                        <td>{row.code}</td>
                        <td>
                          <div className={styles.rowLabelWrap}>
                            <span className={row.kind === "total" ? styles.totalLabel : ""}>{row.label}</span>
                            {row.isDirectInput && <span className={styles.directBadge}>직접기재</span>}
                          </div>
                        </td>
                        <td>{formatCurrency(auto)}</td>
                        <td>
                          <input
                            className={styles.amountInput}
                            value={manual}
                            onChange={(e) => handleManualBalanceChange(row.code, e.target.value)}
                          />
                        </td>
                        <td className={row.kind === "total" ? styles.totalAmount : ""}>
                          {formatCurrency(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>빠른 가이드</h2>
              <p>실무적으로는 아래 순서로 쓰면 편합니다.</p>
            </div>
          </div>
          <ol className={styles.guideList}>
            <li>AdminPlan에서 들어온 항목이 무엇인지 보고 차변 계정을 먼저 맞춥니다.</li>
            <li>대변은 실제 지급수단에 따라 현금및현금성자산(003), 미지급금(241), 단기차입금(237), 주주·임원·직원 차입금(236) 등으로 바꿉니다.</li>
            <li>기초잔액이 있다면 해당 코드의 수동조정 칸에 넣습니다.</li>
            <li>자산총계(228)와 부채와 자본총계(383)의 차액이 0에 가깝게 맞는지 확인합니다.</li>
          </ol>
        </section>

        <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2>자동 반영 환급 · 이자 · 캐시백 내역</h2>
            <p>날짜 필터를 적용하면 해당 시점까지의 하드코딩된 유입 내역만 반영됩니다.</p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.mappingTable}>
            <thead>
              <tr>
                <th>일자</th>
                <th>항목</th>
                <th>차변 코드</th>
                <th>대변 코드</th>
                <th>금액</th>
                <th>비고</th>
              </tr>
            </thead>
            <tbody>
              {visibleAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.emptyCell}>반영할 자동 조정 내역이 없습니다.</td>
                </tr>
              ) : (
                visibleAdjustments.map((entry, index) => (
                  <tr key={`${entry.date}-${entry.label}-${index}`}>
                    <td>{entry.date}</td>
                    <td>
                      <div className={styles.itemTitle}>{entry.label}</div>
                    </td>
                    <td>{entry.debitCode}</td>
                    <td>{entry.creditCode}</td>
                    <td>{formatCurrency(entry.amount)}</td>
                    <td className={styles.noteCell}>{entry.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.chartPanel}>
          <div className={styles.panelHeader}>
            <div>
              <h2>월별 자산·부채·자본 변화</h2>
              <p>
                기준일이 선택되면 해당 기준일까지의 월별 누적 상태만 그래프로 표시합니다. 스케줄, 대표자 차입금, 환급·이자·캐시백을 함께 반영합니다.
              </p>
            </div>
          </div>
          <div className={styles.chartWrap}>
            <Line
              data={monthlyTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                  mode: "index",
                  intersect: false,
                },
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
                scales: {
                  y: {
                    ticks: {
                      callback: (value) => formatCurrency(Number(value)),
                    },
                  },
                },
              }}
            />
          </div>
        </section>
      </main>

      <WebFooter />
    </div>
  );
}
