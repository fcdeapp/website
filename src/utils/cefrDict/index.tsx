// src/utils/cefrDict.ts

export type CEFR = 'A1'|'A2'|'B1'|'B2'|'C1'|'C2';
export type SupportedLang = 'en'|'es'|'fr'|'zh'|'ja'|'ko'|'ar'|'de'|'hi'|'it'|'pt'|'ru';

export interface CEntry {
  form: string;
  CEFR: CEFR;
  norm?: string;
  tags?: string[];
  ['&']?: any[];
  definitions?: string[];
  examples?: string[];
}

/* -------------------------------- JSON 사전 로드 -------------------------------- */
// Next/TS에서 JSON 임포트를 사용합니다 (tsconfig: resolveJsonModule: true 필요)
import enCEFR from '../../constants/cefr/english_vocab_with_cefr.json';
import frCEFR from '../../constants/cefr/french_vocab_with_cefr.json';
import zhCEFR from '../../constants/cefr/chinese_vocab_with_cefr.json';
import jaCEFR from '../../constants/cefr/japanese_vocab_with_cefr.json';
import esCEFR from '../../constants/cefr/spanish_vocab_with_cefr.json';
import deCEFR from '../../constants/cefr/german_vocab_with_cefr.json';
import arCEFR from '../../constants/cefr/arabic_vocab_with_cefr.json';
import itCEFR from '../../constants/cefr/italian_vocab_with_cefr.json';
import ptCEFR from '../../constants/cefr/portuguese_vocab_with_cefr.json';

import enFormCEFR from '../../constants/cefr_form_cefr/english_form_cefr.json';
import frFormCEFR from '../../constants/cefr_form_cefr/french_form_cefr.json';
import zhFormCEFR from '../../constants/cefr_form_cefr/chinese_form_cefr.json';
import jaFormCEFR from '../../constants/cefr_form_cefr/japanese_form_cefr.json';
import esFormCEFR from '../../constants/cefr_form_cefr/spanish_form_cefr.json';
import deFormCEFR from '../../constants/cefr_form_cefr/german_form_cefr.json';
import arFormCEFR from '../../constants/cefr_form_cefr/arabic_form_cefr.json';
import itFormCEFR from '../../constants/cefr_form_cefr/italian_form_cefr.json';
import ptFormCEFR from '../../constants/cefr_form_cefr/portuguese_form_cefr.json';

/* CEFR을 제공하는 언어 집합 */
export const LANGS_WITH_CEFR = new Set<SupportedLang>([
  'en','es','fr','zh','ja','de','ar','it','pt'
]);

/* 풀 사전 */
const ARR_MAP: Partial<Record<SupportedLang, CEntry[]>> = {
  en: enCEFR as CEntry[],
  es: esCEFR as CEntry[],
  fr: frCEFR as CEntry[],
  zh: zhCEFR as CEntry[],
  ja: jaCEFR as CEntry[],
  de: deCEFR as CEntry[],
  ar: arCEFR as CEntry[],
  it: itCEFR as CEntry[],
  pt: ptCEFR as CEntry[],
};

/* CEFR 순서/랭크 */
const rank: Record<CEFR, number> = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 };
export const cefrRank = (lvl: CEFR) => rank[lvl] ?? 6;

/* 경량 사전(폼→CEFR 등) */
type LEntry = { form: string; CEFR?: CEFR | string | null; norm?: string };

const LIGHT_ARR_MAP: Partial<Record<SupportedLang, LEntry[]>> = {
  en: enFormCEFR as LEntry[],
  es: esFormCEFR as LEntry[],
  fr: frFormCEFR as LEntry[],
  zh: zhFormCEFR as LEntry[],
  ja: jaFormCEFR as LEntry[],
  de: deFormCEFR as LEntry[],
  ar: arFormCEFR as LEntry[],
  it: itFormCEFR as LEntry[],
  pt: ptFormCEFR as LEntry[],
};

type LightLookup = {
  byFormCEFR: Map<string, CEFR[]>;
  byNormCEFR: Map<string, CEFR[]>;
};

const lightCache = new Map<SupportedLang, LightLookup>();

function toTier(v: any): CEFR | null {
  if (!v) return null;
  const s = String(v).toUpperCase() as CEFR;
  return (['A1','A2','B1','B2','C1','C2'] as CEFR[]).includes(s) ? s : null;
}

const coerce = (v: any): string => {
  if (v == null) return '';
  if (Array.isArray(v)) return v.join(' ');
  return String(v);
};
const safeLower = (v: any): string => coerce(v).toLowerCase();

/* 구두점/발음 부호 정규화 */
const normalizePunc = (s: string) =>
  String(s ?? '')
    .replace(/[’ʼ]/g, "'")
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
    .replace(/[¡¿]/g, '');

const stripDiacritics = (s: string) =>
  normalizePunc(String(s ?? ''))
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ß/g, 'ss')
    .toLowerCase();

/* 경량 룩업 구성 */
function buildLightLookup(lang: SupportedLang): LightLookup | null {
  const arr = LIGHT_ARR_MAP[lang];
  if (!arr) return null;
  const byFormCEFR = new Map<string, CEFR[]>();
  const byNormCEFR = new Map<string, CEFR[]>();

  for (const e of arr) {
    const rawForm = coerce(e.form);
    const form = rawForm.toLowerCase();

    const normBase = e.norm != null ? e.norm : stripDiacritics(rawForm);
    const norm = coerce(normBase).toLowerCase();

    const tier = toTier((e as any).CEFR);
    if (!form || !tier) continue;

    const push = (m: Map<string, CEFR[]>, k: string) => {
      if (!k) return;
      const prev = m.get(k) ?? [];
      if (!prev.includes(tier)) m.set(k, [...prev, tier]);
    };
    push(byFormCEFR, form);
    if (norm) push(byNormCEFR, norm);
  }
  return { byFormCEFR, byNormCEFR };
}

function getLightLookup(lang: SupportedLang): LightLookup | null {
  if (lightCache.has(lang)) return lightCache.get(lang)!;
  const lk = buildLightLookup(lang);
  if (lk) lightCache.set(lang, lk as LightLookup);
  return lk;
}

/** 경량 룩업으로 최소 랭크 이상이 있는지 빠르게 확인 */
export function hasCEFRAtOrAbove(lang: SupportedLang, token: string, minRank: number): boolean {
  const lk = getLightLookup(lang);
  if (!lk) return false;
  const raw = token.toLowerCase();
  const norm = stripDiacritics(token);

  const tiers = new Set<CEFR>([
    ...(lk.byFormCEFR.get(raw) ?? []),
    ...(lk.byNormCEFR.get(norm) ?? []),
  ]);

  for (const t of tiers) {
    if (cefrRank(t) >= minRank) return true;
  }
  return false;
}

/* 타깃 스크립트 문자 여부 (중/일 전용) */
function isTargetChar(lang: SupportedLang, ch: string): boolean {
  if (!ch) return false;
  if (lang === 'zh') {
    return /\p{Script=Han}/u.test(ch);
  }
  if (lang === 'ja') {
    return /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(ch);
  }
  return false;
}

/* 풀 룩업 */
type Lookup = {
  byForm: Map<string, CEntry[]>;
  byNorm: Map<string, CEntry[]>;
};

const cache = new Map<SupportedLang, Lookup>();

type DictInfo = { set: Set<string>; maxLen: number };
const dictSetCache = new Map<SupportedLang, DictInfo>();

function getDictInfo(lang: SupportedLang): DictInfo | null {
  const arr = ARR_MAP[lang];
  if (!arr) return null;
  if (dictSetCache.has(lang)) return dictSetCache.get(lang)!;

  const set = new Set<string>();
  let maxLen = 1;

  for (const e of arr) {
    const rawF = coerce(e.form);
    const f = normalizePunc(rawF);
    const rawN = e.norm != null ? e.norm : stripDiacritics(rawF);
    const n = normalizePunc(rawN);

    for (const v of [f, n]) {
      if (!v) continue;
      set.add(v);
      if (v.length > maxLen) maxLen = v.length;
    }
  }
  const info = { set, maxLen: Math.min(maxLen, 16) };
  dictSetCache.set(lang, info);
  return info;
}

const NO_SPACE = new Set<SupportedLang>(['zh', 'ja']);

/* 타깃 스크립트 run(연속 구간)을 사전으로 분해 (최장일치) */
function segmentRunWithDict(lang: SupportedLang, run: string, info: DictInfo): string[] {
  const s = run;
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    let matched = '';
    let L = Math.min(info.maxLen, s.length - i);
    while (L > 0) {
      const sub = s.slice(i, i + L);
      if (info.set.has(sub) || info.set.has(stripDiacritics(sub))) { matched = sub; break; }
      L--;
    }
    if (matched) { out.push(matched); i += matched.length; }
    else         { out.push(s[i]);    i += 1; }
  }
  return out;
}

/* 공백 없는 언어(zh/ja) 토크나이즈: 사전 세그먼트 + 비타깃 run 보존 */
function segmentNoSpaceWithDict(lang: SupportedLang, text: string): string[] {
  const info = getDictInfo(lang);
  if (!info) return text.replace(/\s+/g, '').split('');

  const s = normalizePunc(text);
  const out: string[] = [];
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    // 타깃 문자 run 수집
    if (isTargetChar(lang, ch)) {
      let j = i + 1;
      while (j < s.length && isTargetChar(lang, s[j])) j++;
      const run = s.slice(i, j);
      const segs = segmentRunWithDict(lang, run, info);
      out.push(...segs);
      i = j;
      continue;
    }

    // 비타깃 run(영/숫자/공백/구두점 등) 보존
    let j = i + 1;
    while (j < s.length && !isTargetChar(lang, s[j])) j++;
    const run = s.slice(i, j);
    out.push(run);
    i = j;
  }

  return out.filter(Boolean);
}

/** UI용 토크나이즈: zh/ja는 세그먼트, 그 외는 공백 기준 */
export function tokenizeForCEFR(lang: SupportedLang, text: string): string[] {
  if (NO_SPACE.has(lang)) {
    return segmentNoSpaceWithDict(lang, text).filter(Boolean);
  }
  return normalizePunc(text).split(/\s+/).filter(Boolean);
}

/* 풀 룩업 빌드 */
function buildLookup(lang: SupportedLang): Lookup | null {
  const arr = ARR_MAP[lang];
  if (!arr) return null;

  const byForm = new Map<string, CEntry[]>();
  const byNorm = new Map<string, CEntry[]>();

  for (const e of arr) {
    const f = safeLower(e.form);
    if (f) byForm.set(f, [...(byForm.get(f) || []), e]);

    const n = e.norm != null ? safeLower(e.norm) : stripDiacritics(coerce(e.form));
    if (n) byNorm.set(n, [...(byNorm.get(n) || []), e]);
  }
  return { byForm, byNorm };
}

export function getLookup(lang: SupportedLang): Lookup | null {
  if (cache.has(lang)) return cache.get(lang)!;
  const lk = buildLookup(lang as SupportedLang);
  if (lk) cache.set(lang, lk);
  return lk;
}

/** 토큰으로 엔트리 찾기 (가장 알찬 1개만 반환) */
export function findEntries(lang: SupportedLang, token: string): CEntry[] {
  const lk = getLookup(lang);
  if (!lk) return [];

  const raw = token.toLowerCase();
  const norm = stripDiacritics(token);

  const candidates = new Set<string>([raw, norm]);

  if (lang === 'fr') {
    const CLITIC_RE = /^(?:c|d|j|l|m|n|qu|s|t|jusqu|lorsqu|puisqu)'/i;
    const core = norm.replace(CLITIC_RE, '');
    if (core && core !== norm) candidates.add(core);
    for (const part of norm.split('-')) {
      const p = part.replace(CLITIC_RE, '');
      if (p) candidates.add(p);
    }
  }

  if (lang === 'it') {
    const CLITIC_RE_IT = /^(?:l|un|d|c|m|t|s|gl)'/i;
    const core = norm.replace(CLITIC_RE_IT, '');
    if (core && core !== norm) candidates.add(core);
    for (const part of norm.split('-')) {
      const p = part.replace(CLITIC_RE_IT, '');
      if (p) candidates.add(p);
    }
  }

  if (lang === 'pt') {
    const parts = norm.split('-');
    for (const p of parts) if (p) candidates.add(p);
    const PRO_RE_PT = /-(?:me|te|se|lhe|lhes|nos|vos|lo|la|los|las)$/i;
    const base = norm.replace(PRO_RE_PT, '');
    if (base && base !== norm) candidates.add(base);
  }

  if (lang === 'de') {
    const umlAlt = normalizePunc(token)
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss');
    candidates.add(umlAlt);
  }

  /* 더 '풍부한' 엔트리 선호 (정의/예문/영문정의/병음 등) */
  const richness = (e: CEntry) => {
    const defs = (e.definitions?.length ?? 0);
    const exs  = (e.examples?.length ?? 0);
    const enDefs = ((e as any).en_definitions?.length ?? 0);
    const forms = ((e as any).forms?.length ?? 0);
    const hasPinyin =
      !!(e as any).pinyin ||
      !!(((e as any).forms?.[0]?.transcriptions?.pinyin));
    return defs * 10 + enDefs * 8 + exs * 2 + forms * 1 + (hasPinyin ? 2 : 0);
  };

  const picked = new Map<string, CEntry>(); // key → best entry
  for (const cand of candidates) {
    const arrs = [
      lk.byForm.get(cand) || [],
      lk.byNorm.get(cand) || [],
    ];
    for (const arr of arrs) {
      for (const e of arr) {
        const key = `${e.form}|${e.CEFR}`;
        const prev = picked.get(key);
        if (!prev) {
          picked.set(key, e);
        } else if (richness(e) > richness(prev)) {
          picked.set(key, e);
        }
      }
    }
  }

  const results = Array.from(picked.values());
  if (results.length === 0) return [];

  // 최종 스코어(정확도+풍부함+난이도 보정)
  const diacriticLess = (s: string) => stripDiacritics(s).toLowerCase();
  const rawEq = (e: CEntry) => e.form?.toLowerCase?.() === raw;
  const normEq = (e: CEntry) => diacriticLess(e.form || '') === norm;

  const defsLen = (e: CEntry) => (e.definitions?.length ?? 0);
  const exsLen  = (e: CEntry) => (e.examples?.length ?? 0);
  const enDefsLen = (e: CEntry) => ((e as any).en_definitions?.length ?? 0);
  const hasPinyin = (e: CEntry) =>
    !!(e as any).pinyin ||
    !!(((e as any).forms?.[0]?.transcriptions?.pinyin));
  const tierNum = (e: CEntry) => {
    const t = toTier((e as any).CEFR);
    return t ? cefrRank(t) : 999;
  };

  const score = (e: CEntry) => {
    let s = 0;
    if (rawEq(e)) s += 1000;
    if (normEq(e)) s += 600;
    s += defsLen(e) * 12;
    s += enDefsLen(e) * 8;
    s += exsLen(e) * 3;
    if (hasPinyin(e)) s += 5;
    s += (10 - Math.min(tierNum(e), 10));
    return s;
  };

  // 1) 정확 일치 → 최고 득점 1개
  const exact = results.filter(rawEq);
  if (exact.length > 0) {
    exact.sort((a, b) => score(b) - score(a));
    return [exact[0]];
  }

  // 2) 악센트 제거 일치 → 최고 득점 1개
  const approx = results.filter(normEq);
  if (approx.length > 0) {
    approx.sort((a, b) => score(b) - score(a));
    return [approx[0]];
  }

  // 3) 나머지 중 최고 득점 1개
  results.sort((a, b) => score(b) - score(a));
  return [results[0]];
}
