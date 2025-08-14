// src/config/config.ts
/* 웹 전용 동적 config (SSR 안전) */

export type ForcedKey =
  | "Beta"
  | "Development"
  | "Canada"
  | "Australia"
  | "UK"
  | "Korea"
  | "CA"
  | "AU"
  | "GB"
  | "KR";

/** 키에서 실제 도메인 URL 생성 */
function makeUrlFromKey(key: string): string {
  const k = key.trim().toUpperCase();

  switch (k) {
    case "BETA":
      return "https://beta.fcde.app";
    case "DEVELOPMENT":
      return "https://dev.fcde.app";

    // 국가 약어
    case "CA":
    case "CANADA":
      return "https://ca.fcde.app";
    case "AU":
    case "AUSTRALIA":
      return "https://au.fcde.app";
    case "GB":
    case "UK":
      return "https://uk.fcde.app";
    case "KR":
    case "KOREA":
      return "https://kr.fcde.app";

    default:
      return "https://fcde.app";
  }
}

/** 브라우저 환경에서 기본 키(region) 추정 */
function guessPrimaryKeyInBrowser(): string {
  // 1) region (예: 'KR', 'CA-central-1' 등) — 사용자가 직접 저장한 값
  try {
    const storedRegion = localStorage.getItem("region");
    if (storedRegion) return storedRegion;
  } catch {
    /* ignore */
  }

  // 2) 브라우저 로케일 → 지역코드
  if (typeof navigator !== "undefined" && navigator.language) {
    const parts = navigator.language.split("-");
    if (parts.length > 1) return parts[1]; // e.g. "KR"
  }

  // 3) 기본
  return "KR";
}

/** 동기 기본 URL (SSR에서 호출 가능) */
export function getDefaultServerUrl(): string {
  // 1) 환경변수 절대 우선
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL;
  }

  // 2) 브라우저면 로케일 기반
  if (typeof window !== "undefined") {
    const key = guessPrimaryKeyInBrowser();
    return makeUrlFromKey(key);
  }

  // 3) SSR 기본
  return "https://www.fcde.app";
}

/** /health 체크 (간단 버전) */
async function isHealthy(url: string): Promise<boolean> {
  try {
    const res = await fetch(`${url}/health`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

/** 비동기 서버 URL 결정 (클라이언트 전용) */
export async function getServerUrlAsync(): Promise<string> {
  // 1) 사용자가 강제로 지정한 서버 (로컬스토리지)
  let primaryKey: string | null = null;
  try {
    const selected = localStorage.getItem("selectedServer"); // 앱과 유사 키
    if (selected) primaryKey = selected;
  } catch {
    /* ignore */
  }

  // 2) 빌드 환경에서 강제 설정
  if (!primaryKey && process.env.NEXT_PUBLIC_FORCED_DEFAULT_SERVER) {
    primaryKey = process.env.NEXT_PUBLIC_FORCED_DEFAULT_SERVER;
  }

  // 3) 위가 없다면 브라우저 로케일/region 추정
  if (!primaryKey) {
    primaryKey = guessPrimaryKeyInBrowser();
  }

  // 4) 우선순위: primary → Beta → Development
  const priority: string[] = [primaryKey, "Beta", "Development"];

  for (const key of priority) {
    const url = makeUrlFromKey(key);
    if (await isHealthy(url)) {
      return url;
    }
  }

  // 5) 모두 실패하면 primary 키의 URL 반환
  return makeUrlFromKey(primaryKey);
}

/** 기본 export: 앱과 동일하게 부가 플래그/버전 포함 */
const config = {
  // 즉시 사용이 필요할 때는 기본값(SSR 안전)
  SERVER_URL: getDefaultServerUrl() || "https://www.fcde.app",
  APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || "",
  FACEBOOK_INTERSTITIAL_PLACEMENT_ID:
    process.env.NEXT_PUBLIC_FACEBOOK_INTERSTITIAL_PLACEMENT_ID || "",
  FACEBOOK_BANNER_PLACEMENT_ID:
    process.env.NEXT_PUBLIC_FACEBOOK_BANNER_PLACEMENT_ID || "",
  FEATURE_UNDER_DEV:
    (process.env.NEXT_PUBLIC_FEATURE_UNDER_DEV || "true").toLowerCase() ===
    "true",
  TEST_AD_MODE:
    (process.env.NEXT_PUBLIC_TEST_AD_MODE || "false").toLowerCase() === "true",
};

export default config;
