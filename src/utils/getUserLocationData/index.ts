// src/utils/getUserLocationData.ts
import axios from 'axios';
import { countries } from '../../constants/countries';

export interface LocationData {
  latitude: number;
  longitude: number;
  source?: 'permission' | 'country' | 'fallback';
}

const defaultLocation: LocationData = {
  latitude: 37.5665,  // fallback: Seoul
  longitude: 126.9780,
  source: 'fallback',
};

/**
 * 현재 위치와 관련 정보를 가져오는 함수 (웹용)
 * @param SERVER_URL 서버 URL
 * @returns LocationData 객체 (현재 위치 또는 대체 위치)
 */
export const getUserLocationData = async (SERVER_URL: string): Promise<LocationData> => {
  try {
    // 1) 브라우저의 Geolocation API를 사용하여 현재 위치 요청
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

    try {
      const position = await getCurrentPosition();
      const loc: LocationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        source: 'permission',
      };
      localStorage.setItem('latitude', loc.latitude.toString());
      localStorage.setItem('longitude', loc.longitude.toString());
      return loc;
    } catch (error) {
      console.error('Geolocation failed:', error);
      // 권한 거부 등으로 실패한 경우 다음 단계로 진행
    }

    // 2) localStorage에 저장된 currentCountry 값 확인
    const storedCountry = localStorage.getItem('currentCountry');
    if (storedCountry) {
      const found = countries.find(c => c.name === storedCountry);
      if (found) {
        return {
          latitude: found.latitude,
          longitude: found.longitude,
          source: 'country',
        };
      }
    }

    // 3) 서버에서 사용자 정보를 가져와 currentCountry 확인
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get(`${SERVER_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { currentCountry: serverCountry } = response.data;
        if (serverCountry) {
          localStorage.setItem('currentCountry', serverCountry);
          const found = countries.find(c => c.name === serverCountry);
          if (found) {
            return {
              latitude: found.latitude,
              longitude: found.longitude,
              source: 'country',
            };
          }
        }
      } catch (error) {
        console.error('Error fetching country from server:', error);
      }
    }

    // 4) Fallback
    return defaultLocation;
  } catch (error) {
    console.error('Error in getUserLocationData:', error);
    return defaultLocation;
  }
};
