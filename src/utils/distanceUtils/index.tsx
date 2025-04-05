// src/utils/distanceUtils.ts
import * as Location from 'expo-location';
import haversine from 'haversine-distance';
import * as Localization from 'expo-localization';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  

/**
 * 현재 위치와 타겟 위치 간의 거리를 계산하는 함수
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
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.log('Not logged in: skipping location fetch.');
      return;
    }

    const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') {
      if (canAskAgain) {
        // 재요청 가능하면 권한 재요청
        const { status: requestStatus } = await Location.requestForegroundPermissionsAsync();
        if (requestStatus !== 'granted') {
          // 재요청 후에도 권한이 거부되면 기본 메시지 반환
          return t('placeDetails.locationPermissionDenied');
        }
      } else {
        // 재요청 불가능한 상태라면 바로 종료
        return t('placeDetails.locationPermissionDenied');
      }
    }

    const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    const currentLocation = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    const targetLocation = { latitude, longitude };
    const distanceInMeters = haversine(currentLocation, targetLocation);

    // expo-localization에서 제공하는 isMetric 속성을 사용
    const isMetric = Localization.isMetric;

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
