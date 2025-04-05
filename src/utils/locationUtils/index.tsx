// src/utils/getUserLocationData.ts (또는 getDistrictNameFromCoordinates.ts)
import axios from 'axios';
import _ from 'lodash';
import cityTranslations from '../../constants/cities_translations.json';
import countryTranslations from '../../constants/countries_translations.json';

const geocodeCache: Record<string, { city: string; country: string }> = {};

// 입력값과 JSON 데이터셋을 비교하여 영어 번역을 찾아주는 헬퍼 함수
const findEnglishTranslation = (input: string, translations: any): string => {
  if (translations[input] && translations[input].en) {
    return translations[input].en;
  }
  for (const key in translations) {
    const translationObj = translations[key];
    for (const lang in translationObj) {
      if (translationObj[lang].toLowerCase() === input.toLowerCase()) {
        return translationObj.en;
      }
    }
  }
  return input;
};

// 브라우저용 역지오코딩 함수: OpenStreetMap Nominatim API 사용
async function reverseGeocodeAsyncWeb(latitude: number, longitude: number): Promise<any[]> {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Reverse geocoding failed');
  }
  const data = await response.json();
  // OpenStreetMap의 응답을 expo-location의 reverseGeocodeAsync와 유사한 형태로 가공
  const address = data.address;
  return [{
    city: address.city || address.town || address.village || '',
    country: address.country || '',
    region: address.state || '',
    subregion: address.county || '',
  }];
}

/**
 * Debounce 없이 즉시 실행하는 함수 (웹용)
 * @param latitude 타겟 위치의 위도
 * @param longitude 타겟 위치의 경도
 * @param serverUrl 서버 URL
 * @param token 선택적 인증 토큰
 * @returns { city: string, country: string }
 */
export async function getDistrictNameFromCoordinates(
  latitude: number,
  longitude: number,
  serverUrl: string,
  token?: string
): Promise<{ city: string; country: string }> {
  try {
    // 캐시 키(소수점 4자리)
    const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

    // 캐시에 이미 있다면 즉시 반환
    if (geocodeCache[cacheKey]) {
      return geocodeCache[cacheKey];
    }

    // 브라우저의 Geolocation API를 사용하여 역지오코딩 (외부 API 호출)
    let address;
    try {
      address = await reverseGeocodeAsyncWeb(latitude, longitude);
    } catch (error) {
      console.warn('Reverse geocoding failed, returning default values.');
      geocodeCache[cacheKey] = { city: 'Unknown City', country: 'Unknown Country' };
      return geocodeCache[cacheKey];
    }

    if (address.length > 0) {
      let { city, country, region, subregion } = address[0];

      city = (city?.trim() || region?.trim() || subregion?.trim() || 'Unknown City');
      country = country?.trim() || 'Unknown Country';

      // 내부 JSON 번역
      const englishCity = findEnglishTranslation(city, cityTranslations);
      const englishCountry = findEnglishTranslation(country, countryTranslations);

      if (englishCity !== city || englishCountry !== country) {
        geocodeCache[cacheKey] = { city: englishCity, country: englishCountry };
        return geocodeCache[cacheKey];
      }

      // 내부 번역본으로도 변환 불가 → 토큰 필요
      if (!token) {
        geocodeCache[cacheKey] = { city: 'Unknown City', country: 'Unknown Country' };
        return geocodeCache[cacheKey];
      }

      // 서버 번역 요청
      const translatedLocation = await axios.post(
        `${serverUrl}/translate/location`,
        { city, country },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const finalCity = translatedLocation.data.translatedCity || 'Unknown City';
      const finalCountry = translatedLocation.data.translatedCountry || 'Unknown Country';
      geocodeCache[cacheKey] = { city: finalCity, country: finalCountry };
      return geocodeCache[cacheKey];
    }

    // address가 비어있는 경우
    geocodeCache[cacheKey] = { city: 'Unknown City', country: 'Unknown Country' };
    return geocodeCache[cacheKey];
  } catch (error) {
    console.error('Error translating location:', error);
    return { city: 'Unknown City', country: 'Unknown Country' };
  }
};

/**
 * Debounce 적용 (500ms 뒤에 실행)
 * - 지도 이동 시 과도한 호출을 방지하기 위해 사용
 */
const getDistrictNameFromCoordinatesDebounced = _.debounce(
  async (
    latitude: number,
    longitude: number,
    serverUrl: string,
    token?: string
  ): Promise<{ city: string; country: string }> => {
    return await getDistrictNameFromCoordinates(latitude, longitude, serverUrl, token);
  },
  500,
  { leading: false, trailing: true }
);

/**
 * Debounce된 함수를 export
 * - onRegionChangeComplete 등 "지도 이동"에서만 사용
 */
export async function getDistrictNameFromCoordinatesDelayed(
  latitude: number,
  longitude: number,
  serverUrl: string,
  token?: string
): Promise<{ city: string; country: string }> {
  return getDistrictNameFromCoordinatesDebounced(latitude, longitude, serverUrl, token)!;
}

/**
 * setTimeout을 이용한 지연 호출 함수
 * - 주어진 시간(기본 500ms) 후에 getDistrictNameFromCoordinates를 실행
 */
export function getDistrictNameFromCoordinatesTimeout(
  latitude: number,
  longitude: number,
  serverUrl: string,
  token?: string,
  delay: number = 500
): Promise<{ city: string; country: string }> {
  return new Promise((resolve, reject) => {
    setTimeout(async () => {
      try {
        const result = await getDistrictNameFromCoordinates(latitude, longitude, serverUrl, token);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }, delay);
  });
}
