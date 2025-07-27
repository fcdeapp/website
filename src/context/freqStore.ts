// src/context/freqStore.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

// ------------------------------------------------------
// 1) JSON으로 미리 로딩된 각 언어별 Zipf 빈도표
//    (번들 단계에서 포함된 ../constants/freq/<lang>_freq.json 파일들)
// ------------------------------------------------------
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
  | 'en'  // English
  | 'es'  // Español
  | 'fr'  // Français
  | 'zh'  // 中文
  | 'ja'  // 日本語
  | 'ko'  // 한국어
  | 'ar'  // العربية
  | 'de'  // Deutsch
  | 'hi'  // हिन्दी
  | 'it'  // Italiano
  | 'pt'  // Português
  | 'ru'; // Русский

// JSON-파일에서 미리 로드된 빈도표 맵 객체
const freqMaps: Record<SupportedLang, Record<string, number>> = {
  en: enFreq as unknown as Record<string, number>,
  es: esFreq as unknown as Record<string, number>,
  fr: frFreq as unknown as Record<string, number>,
  zh: zhFreq as unknown as Record<string, number>,
  ja: jaFreq as unknown as Record<string, number>,
  ko: koFreq as unknown as Record<string, number>,
  ar: arFreq as unknown as Record<string, number>,
  de: deFreq as unknown as Record<string, number>,
  hi: hiFreq as unknown as Record<string, number>,
  it: itFreq as unknown as Record<string, number>,
  pt: ptFreq as unknown as Record<string, number>,
  ru: ruFreq as unknown as Record<string, number>,
};

// 현재 선택된 언어 코드와 그에 대응하는 JSON 빈도표 맵
let currentLang: SupportedLang = 'en';
let currentMap: Record<string, number> = freqMaps[currentLang];

// ------------------------------------------------------
// 2) 언어를 변경하는 함수
// ------------------------------------------------------
export function setLanguage(lang: SupportedLang) {
  if (freqMaps[lang]) {
    currentLang = lang;
    currentMap = freqMaps[lang];
  } else {
    console.warn(`Unsupported language code: ${lang}. Falling back to 'en'.`);
    currentLang = 'en';
    currentMap = freqMaps.en;
  }
}

// ------------------------------------------------------
// 3) JSON-파일 기반으로 특정 단어의 Zipf 빈도를 가져오는 함수
//    JSON에 단어(key)가 없으면 “0”을 반환
// ------------------------------------------------------
export function getZipf(word: string): number {
  if (!word) return 0;
  const key = word.toLowerCase(); // JSON에서는 소문자 키를 가정
  return currentMap[key] ?? 0;
}

// ------------------------------------------------------
// 4) 로컬 AsyncStorage 캐시를 사용하여 “이미 계산해 둔 빈도값”을
//    저장/조회하는 함수들
//    캐시 키 예시: `freq_<lang>_<word>`
// ------------------------------------------------------
function makeStorageKey(lang: SupportedLang, word: string): string {
  return `freq_${lang}_${word.toLowerCase()}`;
}

/**
 * AsyncStorage에서 해당 단어의 빈도값을 조회
 * @param word 조회할 단어 (소문자 권장)
 * @returns 저장된 값이 있으면 숫자, 없으면 null
 */
export async function getWordFrequency(word: string): Promise<number | null> {
  if (!word) return null;
  try {
    const storageKey = makeStorageKey(currentLang, word);
    const stored = await AsyncStorage.getItem(storageKey);
    if (!stored) return null;
    const parsed = parseFloat(stored);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

/**
 * AsyncStorage에 단어의 빈도를 캐시에 저장
 * @param word 단어 (소문자 권장)
 * @param freq 빈도 값 (숫자)
 */
export async function setWordFrequency(word: string, freq: number): Promise<void> {
  if (!word) return;
  try {
    const storageKey = makeStorageKey(currentLang, word);
    await AsyncStorage.setItem(storageKey, freq.toString());
  } catch {
    // 저장 실패 시 무시
  }
}

// ------------------------------------------------------
// 5) “캐시 우선”으로 빈도값을 가져오는 편의 함수
//    - AsyncStorage에 값이 있으면 그 값을 리턴
//    - 없으면 JSON-빈도표(getZipf)를 사용하고, 필요하면 캐시에 저장
// ------------------------------------------------------
export async function fetchWordFrequency(word: string): Promise<number> {
  if (!word) return 0;
  const key = word.toLowerCase();

  // 1) 캐시에 저장된 값이 있는지 확인
  const cached = await getWordFrequency(key);
  if (cached !== null) {
    return cached;
  }

  // 2) 캐시에 없으면 JSON-빈도표에서 가져옴
  const zipfValue = getZipf(key);

  // 3) (옵션) JSON에서 가져온 값을 캐시에 저장해 둠
  //     → 다음번에는 AsyncStorage에서 바로 읽혀서 더 빠름
  await setWordFrequency(key, zipfValue);

  return zipfValue;
}

// ------------------------------------------------------
// 6) 현재 설정된 언어 코드 반환
// ------------------------------------------------------
export function getCurrentLanguage(): SupportedLang {
  return currentLang;
}

// ------------------------------------------------------
// 7) 지원 가능한 언어 목록 반환 (JSON 빈도표 기준)
// ------------------------------------------------------
export function getAvailableLanguages(): SupportedLang[] {
  return Object.keys(freqMaps) as SupportedLang[];
}
