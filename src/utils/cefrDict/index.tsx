// src/utils/cefrDict.ts

export type CEFR = 'A1'|'A2'|'B1'|'B2'|'C1'|'C2';
export type SupportedLang =
  'en'|'es'|'fr'|'zh'|'ja'|'ko'|'ar'|'de'|'hi'|'it'|'pt'|'ru';

export interface CEntry {
  form: string;
  CEFR: CEFR;
  norm?: string;
  tags?: string[];
  ['&']?: any[];
  definitions?: string[];
  examples?: string[];
}

/* ───────────────────────── CEFR 지원 언어 ───────────────────────── */
export const LANGS_WITH_CEFR = new Set<SupportedLang>([
  'en','es','fr','zh','ja','de','ar','it','pt'
]);

/* ───────────────────────── 랭크/유틸 ───────────────────────── */
const rank: Record<CEFR, number> = { A1:1, A2:2, B1:3, B2:4, C1:5, C2:6 };
export const cefrRank = (lvl: CEFR) => rank[lvl] ?? 6;

const coerce = (v: any): string => {
  if (v == null) return '';
  if (Array.isArray(v)) return v.join(' ');
  return String(v);
};
const safeLower = (v: any): string => coerce(v).toLowerCase();

const normalizePunc = (s: string) =>
  String(s ?? '')
    .replace(/[’ʼ]/g, "'")
    .replace(/[\u2010\u2011\u2012\u2013\u2014\u2212]/g, '-')
    .replace(/[¡¿]/g, '');

const stripDiacritics = (s: string) =>
  normalizePunc(String(s ?? ''))
    .normalize('NFD')
    // @ts-expect-error unicode property escapes ok at runtime
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ß/g, 'ss')
    .toLowerCase();

function toTier(v: any): CEFR | null {
  if (!v) return null;
  const s = String(v).toUpperCase() as CEFR;
  return (['A1','A2','B1','B2','C1','C2'] as CEFR[]).includes(s) ? s : null;
}

/* ───────────────────────── 런타임 fetch 경로 ───────────────────────── */
const LIGHT_URL: Partial<Record<SupportedLang, string>> = {
  en: '/cefr_form_cefr/english_form_cefr.json',
  es: '/cefr_form_cefr/spanish_form_cefr.json',
  fr: '/cefr_form_cefr/french_form_cefr.json',
  zh: '/cefr_form_cefr/chinese_form_cefr.json',
  ja: '/cefr_form_cefr/japanese_form_cefr.json',
  de: '/cefr_form_cefr/german_form_cefr.json',
  ar: '/cefr_form_cefr/arabic_form_cefr.json',
  it: '/cefr_form_cefr/italian_form_cefr.json',
  pt: '/cefr_form_cefr/portuguese_form_cefr.json',
};

const FULL_URL: Partial<Record<SupportedLang, string>> = {
  en: '/cefr/english_vocab_with_cefr.json',
  es: '/cefr/spanish_vocab_with_cefr.json',
  fr: '/cefr/french_vocab_with_cefr.json',
  zh: '/cefr/chinese_vocab_with_cefr.json',
  ja: '/cefr/japanese_vocab_with_cefr.json',
  de: '/cefr/german_vocab_with_cefr.json',
  ar: '/cefr/arabic_vocab_with_cefr.json',
  it: '/cefr/italian_vocab_with_cefr.json',
  pt: '/cefr/portuguese_vocab_with_cefr.json',
};

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to fetch ${url} (${res.status})`);
  return res.json() as Promise<T>;
}

/* ───────────────────────── LIGHT 룩업 (경량) ───────────────────────── */
type LEntry = { form: string; CEFR?: CEFR | string | null; norm?: string };

type LightLookup = {
  byFormCEFR: Map<string, CEFR[]>;
  byNormCEFR: Map<string, CEFR[]>;
};

const lightCache = new Map<SupportedLang, LightLookup>();
const lightLoading = new Map<SupportedLang, Promise<LightLookup | null>>();

function buildLightLookupSync(arr: LEntry[] | null): LightLookup | null {
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

async function buildLightLookup(lang: SupportedLang): Promise<LightLookup | null> {
  const url = LIGHT_URL[lang];
  if (!url) return null;
  const arr = await fetchJson<LEntry[]>(url);
  const lk = buildLightLookupSync(arr);
  if (lk) lightCache.set(lang, lk);
  return lk;
}

export async function getLightLookupAsync(lang: SupportedLang): Promise<LightLookup | null> {
  if (lightCache.has(lang)) return lightCache.get(lang)!;
  if (lightLoading.has(lang)) return lightLoading.get(lang)!;
  const p = buildLightLookup(lang).finally(() => lightLoading.delete(lang));
  lightLoading.set(lang, p);
  return p;
}

/** 캐시가 있으면 즉시 반환, 없으면 null */
export function getLightLookup(lang: SupportedLang): LightLookup | null {
  return lightCache.get(lang) ?? null;
}

/** 정식: 비동기 판정 */
export async function hasCEFRAtOrAboveAsync(
  lang: SupportedLang,
  token: string,
  minRank: number
): Promise<boolean> {
  const lk = await getLightLookupAsync(lang);
  if (!lk) return false;
  const raw = token.toLowerCase();
  const norm = stripDiacritics(token);
  const tiers = new Set<CEFR>([
    ...(lk.byFormCEFR.get(raw) ?? []),
    ...(lk.byNormCEFR.get(norm) ?? []),
  ]);
  for (const t of tiers) if (cefrRank(t) >= minRank) return true;
  return false;
}

/** 호환용(동기): 캐시 준비 전이면 false */
export function hasCEFRAtOrAbove(
  lang: SupportedLang,
  token: string,
  minRank: number
): boolean {
  const lk = getLightLookup(lang);
  if (!lk) return false;
  const raw = token.toLowerCase();
  const norm = stripDiacritics(token);
  const tiers = new Set<CEFR>([
    ...(lk.byFormCEFR.get(raw) ?? []),
    ...(lk.byNormCEFR.get(norm) ?? []),
  ]);
  for (const t of tiers) if (cefrRank(t) >= minRank) return true;
  return false;
}

/* ───────────────────────── 토크나이즈 ───────────────────────── */
const NO_SPACE = new Set<SupportedLang>(['zh', 'ja']);

function isTargetChar(lang: SupportedLang, ch: string): boolean {
  if (!ch) return false;
  if (lang === 'zh') return /\p{Script=Han}/u.test(ch);
  if (lang === 'ja') return /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(ch);
  return false;
}

type DictInfo = { set: Set<string>; maxLen: number };
const dictSetCache = new Map<SupportedLang, DictInfo>();

function getDictInfo(lang: SupportedLang): DictInfo | null {
  return dictSetCache.get(lang) ?? null;
}

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

function segmentNoSpaceWithDict(lang: SupportedLang, text: string): string[] {
  const info = getDictInfo(lang);
  if (!info) {
    return text.replace(/\s+/g, '').split('');
  }
  const s = normalizePunc(text);
  const out: string[] = [];
  let i = 0;

  while (i < s.length) {
    const ch = s[i];
    if (isTargetChar(lang, ch)) {
      let j = i + 1;
      while (j < s.length && isTargetChar(lang, s[j])) j++;
      const run = s.slice(i, j);
      const segs = segmentRunWithDict(lang, run, info);
      out.push(...segs);
      i = j;
      continue;
    }
    let j = i + 1;
    while (j < s.length && !isTargetChar(lang, s[j])) j++;
    const run = s.slice(i, j);
    out.push(run);
    i = j;
  }
  return out.filter(Boolean);
}

/** UI 토크나이즈: zh/ja는 사전 세그먼트, 그 외 공백 기준 */
export function tokenizeForCEFR(lang: SupportedLang, text: string): string[] {
  if (NO_SPACE.has(lang)) {
    return segmentNoSpaceWithDict(lang, text).filter(Boolean);
  }
  return normalizePunc(text).split(/\s+/).filter(Boolean);
}

/* ───────────────────────── FULL 룩업 (상세) ───────────────────────── */
type Lookup = {
  byForm: Map<string, CEntry[]>;
  byNorm: Map<string, CEntry[]>;
};

const fullCache = new Map<SupportedLang, Lookup>();
const fullLoading = new Map<SupportedLang, Promise<Lookup | null>>();

function buildLookupSync(arr: CEntry[] | null, lang: SupportedLang): Lookup | null {
  if (!arr) return null;
  const byForm = new Map<string, CEntry[]>();
  const byNorm = new Map<string, CEntry[]>();

  const set = new Set<string>();
  let maxLen = 1;

  for (const e of arr) {
    const f = safeLower(e.form);
    if (f) {
      byForm.set(f, [...(byForm.get(f) || []), e]);
      const nf = normalizePunc(e.form);
      if (nf) { set.add(nf); if (nf.length > maxLen) maxLen = Math.max(maxLen, nf.length); }
    }
    const n = e.norm != null ? safeLower(e.norm) : stripDiacritics(coerce(e.form));
    if (n) {
      byNorm.set(n, [...(byNorm.get(n) || []), e]);
      const nn = normalizePunc(e.norm ?? e.form);
      if (nn) { set.add(nn); if (nn.length > maxLen) maxLen = Math.max(maxLen, nn.length); }
    }
  }

  dictSetCache.set(lang, { set, maxLen: Math.min(maxLen, 16) });
  return { byForm, byNorm };
}

async function buildLookup(lang: SupportedLang): Promise<Lookup | null> {
  const url = FULL_URL[lang];
  if (!url) return null;
  const arr = await fetchJson<CEntry[]>(url);
  const lk = buildLookupSync(arr, lang);
  if (lk) fullCache.set(lang, lk);
  return lk;
}

export async function getLookupAsync(lang: SupportedLang): Promise<Lookup | null> {
  if (fullCache.has(lang)) return fullCache.get(lang)!;
  if (fullLoading.has(lang)) return fullLoading.get(lang)!;
  const p = buildLookup(lang).finally(() => fullLoading.delete(lang));
  fullLoading.set(lang, p);
  return p;
}

/** 호환용(동기): 캐시가 없으면 null */
export function getLookup(lang: SupportedLang): Lookup | null {
  return fullCache.get(lang) ?? null;
}

/* ───────────────────────── 엔트리 찾기 ───────────────────────── */
function scoreEntryFactory(raw: string, norm: string) {
  const diacriticLess = (s: string) => stripDiacritics(s).toLowerCase();
  const rawEq  = (e: CEntry) => e.form?.toLowerCase?.() === raw;
  const normEq = (e: CEntry) => diacriticLess(e.form || '') === norm;

  const defsLen   = (e: CEntry) => (e.definitions?.length ?? 0);
  const exsLen    = (e: CEntry) => (e.examples?.length ?? 0);
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
    if (rawEq(e))  s += 1000;
    if (normEq(e)) s += 600;
    s += defsLen(e)   * 12;
    s += enDefsLen(e) * 8;
    s += exsLen(e)    * 3;
    if (hasPinyin(e)) s += 5;
    s += (10 - Math.min(tierNum(e), 10));
    return s;
  };

  return { score, rawEq, normEq };
}

function enrichCandidates(lang: SupportedLang, token: string, norm: string, set: Set<string>) {
  if (lang === 'fr') {
    const CLITIC_RE = /^(?:c|d|j|l|m|n|qu|s|t|jusqu|lorsqu|puisqu)'/i;
    const core = norm.replace(CLITIC_RE, '');
    if (core && core !== norm) set.add(core);
    for (const part of norm.split('-')) {
      const p = part.replace(CLITIC_RE, '');
      if (p) set.add(p);
    }
  }
  if (lang === 'it') {
    const CLITIC_RE_IT = /^(?:l|un|d|c|m|t|s|gl)'/i;
    const core = norm.replace(CLITIC_RE_IT, '');
    if (core && core !== norm) set.add(core);
    for (const part of norm.split('-')) {
      const p = part.replace(CLITIC_RE_IT, '');
      if (p) set.add(p);
    }
  }
  if (lang === 'pt') {
    const parts = norm.split('-');
    for (const p of parts) if (p) set.add(p);
    const PRO_RE_PT = /-(?:me|te|se|lhe|lhes|nos|vos|lo|la|los|las)$/i;
    const base = norm.replace(PRO_RE_PT, '');
    if (base && base !== norm) set.add(base);
  }
  if (lang === 'de') {
    const umlAlt = normalizePunc(token)
      .toLowerCase()
      .replace(/ä/g, 'ae')
      .replace(/ö/g, 'oe')
      .replace(/ü/g, 'ue')
      .replace(/ß/g, 'ss');
    set.add(umlAlt);
  }
}

/** 정식: 비동기 상세 조회 (가장 알찬 1개만 반환) */
export async function findEntriesAsync(
  lang: SupportedLang,
  token: string
): Promise<CEntry[]> {
  const lk = await getLookupAsync(lang);
  if (!lk) return [];
  const raw  = token.toLowerCase();
  const norm = stripDiacritics(token);

  const candidates = new Set<string>([raw, norm]);
  enrichCandidates(lang, token, norm, candidates);

  const picked = new Map<string, CEntry>();
  const richness = (x: CEntry) => {
    const defs = (x.definitions?.length ?? 0);
    const exs  = (x.examples?.length ?? 0);
    const enD  = ((x as any).en_definitions?.length ?? 0);
    const forms= ((x as any).forms?.length ?? 0);
    const hasP = !!(x as any).pinyin ||
      !!(((x as any).forms?.[0]?.transcriptions?.pinyin));
    return defs*10 + enD*8 + exs*2 + forms*1 + (hasP?2:0);
  };

  for (const cand of candidates) {
    const arrs = [ lk.byForm.get(cand) || [], lk.byNorm.get(cand) || [] ];
    for (const arr of arrs) {
      for (const e of arr) {
        const key = `${e.form}|${e.CEFR}`;
        const prev = picked.get(key);
        if (!prev || richness(e) > richness(prev)) picked.set(key, e);
      }
    }
  }

  const results = Array.from(picked.values());
  if (results.length === 0) return [];

  const { score, rawEq, normEq } = scoreEntryFactory(raw, norm);
  const exact = results.filter(rawEq);
  if (exact.length) {
    exact.sort((a, b) => score(b) - score(a));
    return [exact[0]];
  }
  const approx = results.filter(normEq);
  if (approx.length) {
    approx.sort((a, b) => score(b) - score(a));
    return [approx[0]];
  }
  results.sort((a, b) => score(b) - score(a));
  return [results[0]];
}

/** 호환용(동기): 캐시가 없으면 [] */
export function findEntries(lang: SupportedLang, token: string): CEntry[] {
  const lk = getLookup(lang);
  if (!lk) return [];
  const raw  = token.toLowerCase();
  const norm = stripDiacritics(token);

  const candidates = new Set<string>([raw, norm]);
  enrichCandidates(lang, token, norm, candidates);

  const picked = new Map<string, CEntry>();
  const richness = (x: CEntry) => {
    const defs = (x.definitions?.length ?? 0);
    const exs  = (x.examples?.length ?? 0);
    const enD  = ((x as any).en_definitions?.length ?? 0);
    const forms= ((x as any).forms?.length ?? 0);
    const hasP = !!(x as any).pinyin ||
      !!(((x as any).forms?.[0]?.transcriptions?.pinyin));
    return defs*10 + enD*8 + exs*2 + forms*1 + (hasP?2:0);
  };

  for (const cand of candidates) {
    const arrs = [ lk.byForm.get(cand) || [], lk.byNorm.get(cand) || [] ];
    for (const arr of arrs) {
      for (const e of arr) {
        const key = `${e.form}|${e.CEFR}`;
        const prev = picked.get(key);
        if (!prev || richness(e) > richness(prev)) picked.set(key, e);
      }
    }
  }

  const results = Array.from(picked.values());
  if (results.length === 0) return [];

  const { score, rawEq, normEq } = scoreEntryFactory(raw, norm);
  const exact = results.filter(rawEq);
  if (exact.length) {
    exact.sort((a, b) => score(b) - score(a));
    return [exact[0]];
  }
  const approx = results.filter(normEq);
  if (approx.length) {
    approx.sort((a, b) => score(b) - score(a));
    return [approx[0]];
  }
  results.sort((a, b) => score(b) - score(a));
  return [results[0]];
}
