// src/context/freqStore.ts
/* eslint no-console: 0 */

//
// ──────────────────────────────────────────────────────────────────────────────
//  0.  브라우저(LocalStorage) 헬퍼
//      ──────────────────────────────────────────────────────────────────
//
const hasStorage =
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

function lsGet(key: string): string | null {
  try {
    return hasStorage ? localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

function lsSet(key: string, value: string): void {
  try {
    if (hasStorage) localStorage.setItem(key, value);
  } catch {
    /* ignore quota / private‑mode errors */
  }
}

//
// ──────────────────────────────────────────────────────────────────────────────
//  1.  미리 번들된 Zipf 빈도표(JSON) 로드
//      (next.js / vite 에선 tree‑shaking 됩니다)
// ──────────────────────────────────────────────────────────────────────────────
//
import enFreq from '../constants/freq/en_freq.json';
import esFreq from '../constants/freq/es_freq.json';
import frFreq from '../constants/freq/fr_freq.json';
import zhFreq from '../constants/freq/zh_freq.json';
import jaFreq from '../constants/freq/ja_freq.json';
import koFreq from '../constants/freq/ko_freq.json';
import arFreq from '../constants/freq/ar_freq.json';
import deFreq from '../constants/freq/de_freq.json';
import hiFreq from '../constants/freq/hi_freq.json';
import itFreq from '../constants/freq/it_freq.json';
import ptFreq from '../constants/freq/pt_freq.json';
import ruFreq from '../constants/freq/ru_freq.json';

export type SupportedLang =
  | 'en' | 'es' | 'fr' | 'zh' | 'ja' | 'ko'
  | 'ar' | 'de' | 'hi' | 'it' | 'pt' | 'ru';

const freqMaps: Record<SupportedLang, Record<string, number>> = {
  en: enFreq as any,
  es: esFreq as any,
  fr: frFreq as any,
  zh: zhFreq as any,
  ja: jaFreq as any,
  ko: koFreq as any,
  ar: arFreq as any,
  de: deFreq as any,
  hi: hiFreq as any,
  it: itFreq as any,
  pt: ptFreq as any,
  ru: ruFreq as any,
};

//
// ──────────────────────────────────────────────────────────────────────────────
//  2.  현재 언어 설정
// ──────────────────────────────────────────────────────────────────────────────
//
let currentLang: SupportedLang = 'en';
let currentMap: Record<string, number> = freqMaps[currentLang];

export function setLanguage(lang: SupportedLang) {
  if (freqMaps[lang]) {
    currentLang = lang;
    currentMap = freqMaps[lang];
  } else {
    console.warn(`Unsupported language code "${lang}". Falling back to "en".`);
    currentLang = 'en';
    currentMap = freqMaps.en;
  }
}

//
// ──────────────────────────────────────────────────────────────────────────────
//  3.  JSON Zipf 빈도 조회 (동기)
// ──────────────────────────────────────────────────────────────────────────────
//
export function getZipf(word: string): number {
  if (!word) return 0;
  return currentMap[word.toLowerCase()] ?? 0;
}

//
// ──────────────────────────────────────────────────────────────────────────────
//  4.  LocalStorage 캐시 helpers (비동기 Promise API 유지)
// ──────────────────────────────────────────────────────────────────────────────
//
const makeKey = (lang: SupportedLang, w: string) =>
  `freq_${lang}_${w.toLowerCase()}`;

export async function getWordFrequency(word: string): Promise<number | null> {
  if (!word) return null;
  const v = lsGet(makeKey(currentLang, word));
  if (v === null) return null;
  const num = parseFloat(v);
  return isNaN(num) ? null : num;
}

export async function setWordFrequency(word: string, freq: number): Promise<void> {
  if (!word) return;
  lsSet(makeKey(currentLang, word), freq.toString());
}

//
// ──────────────────────────────────────────────────────────────────────────────
//  5.  “캐시 우선” 빈도 조회
// ──────────────────────────────────────────────────────────────────────────────
//
export async function fetchWordFrequency(word: string): Promise<number> {
  if (!word) return 0;
  const cached = await getWordFrequency(word);
  if (cached !== null) return cached;

  const zipf = getZipf(word);
  await setWordFrequency(word, zipf);
  return zipf;
}

export function getCurrentLanguage(): SupportedLang {
  return currentLang;
}

export function getAvailableLanguages(): SupportedLang[] {
  return Object.keys(freqMaps) as SupportedLang[];
}
