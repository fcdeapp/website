// config.ts (web version)
import configJson from './config.json';

const getServerUrl = (): string => {
  const defaultRegion = 'KR';
  let region = defaultRegion;

  if (typeof navigator !== 'undefined' && navigator.language) {
    // Example: "en-US" → extract "US"
    const parts = navigator.language.split('-');
    if (parts.length > 1) {
      region = parts[1];
    }
  }

  let domainPrefix = '';

  switch (region.toUpperCase()) {
    case 'CA':
      domainPrefix = 'ca.';
      break;
    case 'AU':
      domainPrefix = 'au.';
      break;
    case 'GB':
      domainPrefix = 'uk.';
      break;
    case 'KR':
      domainPrefix = '';
      break;
    default:
      domainPrefix = '';
      break;
  }

  console.log("domainPrefix: ", domainPrefix);
  console.log("region: ", region);

  // You can adjust the returned URL based on your needs:
  // return `https://${domainPrefix}fcde.app`; // Normal Case
  // return `https://www.${domainPrefix}fcde.app`; // Dev Case
  // return `https://beta.fcde.app`; // Beta Test Case

  return `https://beta.fcde.app`;
};

export default {
  SERVER_URL: getServerUrl(),
  APP_VERSION: configJson.APP_VERSION,
  FACEBOOK_INTERSTITIAL_PLACEMENT_ID: configJson.FACEBOOK_INTERSTITIAL_PLACEMENT_ID,
  FACEBOOK_BANNER_PLACEMENT_ID: configJson.FACEBOOK_BANNER_PLACEMENT_ID,
};
