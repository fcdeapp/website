// src/utils/distanceUtils.ts
import haversine from 'haversine-distance';

/**
 * 현재 위치와 타겟 위치 간의 거리를 계산하는 함수 (웹용)
 * @param latitude 타겟 위치의 위도
 * @param longitude 타겟 위치의 경도
 * @param t 다국어 번역 함수
 * @returns 거리 문자열 반환 (예: '1.2 km' 또는 '0.8 mi')
 */
export const calculateDistance = async (
  latitude: number,
  longitude: number,
  t: (key: string) => string
): Promise<string> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('Not logged in: skipping location fetch.');
      return '';
    }

    // 브라우저의 Geolocation API를 프로미스로 감싸기
    const getCurrentPosition = (): Promise<GeolocationPosition> => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          return reject(new Error('Geolocation is not supported by this browser.'));
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
        });
      });
    };

    const position = await getCurrentPosition();
    const currentLocation = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
    const targetLocation = { latitude, longitude };
    const distanceInMeters = haversine(currentLocation, targetLocation);

    // 간단한 로케일 기반 미터법 여부 판별: 미국(en-US)인 경우 비미터법, 그 외는 미터법으로 가정
    const isMetric = !navigator.language.includes('US');

    return formatDistance(distanceInMeters, isMetric);
  } catch (error) {
    console.error('Error fetching location:', error);
    return t('placeDetails.locationError');
  }
};

/**
 * 거리 포맷팅 함수
 * @param meters 거리 (미터 단위)
 * @param isMetric 미터법 사용 여부
 * @returns 포맷된 거리 문자열
 */
export const formatDistance = (meters: number, isMetric: boolean): string => {
  if (isMetric) {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    } else if (meters < 10000) {
      return `${(meters / 1000).toFixed(1)} km`;
    } else {
      return `${Math.round(meters / 1000)} km`;
    }
  } else {
    const feet = meters * 3.28084;
    if (feet < 5280) {
      return `${Math.round(feet)} ft`;
    } else {
      const miles = feet / 5280;
      if (miles < 10) {
        return `${miles.toFixed(1)} mi`;
      } else {
        return `${Math.round(miles)} mi`;
      }
    }
  }
};
