// src/config/config.ts

export function getDefaultServerUrl(): string {
  // 환경변수 최우선
  if (process.env.NEXT_PUBLIC_SERVER_URL) {
    return process.env.NEXT_PUBLIC_SERVER_URL;
  }
  // SSR/CSR 모두 fallback 하나로 고정(원하면 원하는 기본값으로 바꾸기)
  return "https://fcde.app";
}

// 교차출처 fetch를 없애기 위해 isHealthy / getServerUrlAsync 제거 또는 비활성화
export async function getServerUrlAsync(): Promise<string> {
  // 더 이상 런타임 헬스체크 하지 않음
  return getDefaultServerUrl();
}

const config = {
  SERVER_URL: getDefaultServerUrl(),
  ...
};

export default config;
