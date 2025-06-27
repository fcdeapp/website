// config.ts (web version)
import configJson from './config.json';

const getServerUrl = (): string => {
  // 1) Try explicitly set region in localStorage
  let region = '';
  try {
    const stored = localStorage.getItem('region');
    if (stored) {
      region = stored;
    }
  } catch {
    // localStorage not available or error — fall back
  }

  // 2) If no stored region, derive from browser
  if (!region && typeof navigator !== 'undefined' && navigator.language) {
    const parts = navigator.language.split('-');
    if (parts.length > 1) {
      region = parts[1];
    }
  }

  // 3) Normalize to lowercase for matching
  const r = region.toLowerCase();

  // 4) Hardcoded mapping for special endpoints
  if (r === 'beta') {
    return 'https://beta.fcde.app';
  }
  if (r === 'development') {
    return 'https://fcde.app';
  }

  // 5) AWS‐style region → domainPrefix
  const awsPrefixMap: Record<string, string> = {
    'ca-central-1': 'ca.',
    'ap-southeast-2': 'au.',
    'eu-west-2'    : 'uk.',
    'ap-northeast-2': '',
  };

  const domainPrefix = awsPrefixMap[r] ?? '';

  // 6) Default (KR or anything else) → no prefix
  return `https://${domainPrefix}fcde.app`;
};

export default {
  SERVER_URL: getServerUrl(),
  APP_VERSION: configJson.APP_VERSION,
  FACEBOOK_INTERSTITIAL_PLACEMENT_ID: configJson.FACEBOOK_INTERSTITIAL_PLACEMENT_ID,
  FACEBOOK_BANNER_PLACEMENT_ID: configJson.FACEBOOK_BANNER_PLACEMENT_ID,
};
