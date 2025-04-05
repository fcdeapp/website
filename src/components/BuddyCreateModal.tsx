"use client";

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { getDistrictNameFromCoordinates } from '../utils/locationUtils';
import { countries } from '../constants/countries';
import CountrySelector, { Country } from './CountrySelector';
import CustomMapView from './CustomMapView';
import styles from '../styles/components/BuddyCreateModal.module.css';

interface BuddyCreateModalProps {
  visible: boolean;
  onClose: () => void;
  SERVER_URL: string;
}

// 로컬 이미지 경로 처리 함수:
// 서버에서 가져오는 이미지(예: http://, https://)가 아닌 경우 /assets/ 경로를 사용하도록 함.
const getLocalImage = (img: string): string => {
  return img.startsWith('http') ? img : `/assets/${img}`;
};

const BuddyCreateModal: React.FC<BuddyCreateModalProps> = ({ visible, onClose, SERVER_URL }) => {
  const { t } = useTranslation();
  const [buddyName, setBuddyName] = useState('');
  const [buddyDescription, setBuddyDescription] = useState('');
  const [activityCountry, setActivityCountry] = useState('Unknown');
  const [activityCity, setActivityCity] = useState('');
  const [latitude, setLatitude] = useState(37.5665); // Default: Seoul latitude
  const [longitude, setLongitude] = useState(126.9780); // Default: Seoul longitude
  const [buddyImage, setBuddyImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [region, setRegion] = useState({
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  // Image selection using a hidden file input element
  const pickImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event: any) => {
      const file = event.target.files[0];
      if (file) {
        // Optionally, implement resizing with a canvas or a library.
        // Here we simply create an object URL for preview.
        const imageUrl = URL.createObjectURL(file);
        setBuddyImage(imageUrl);
      }
    };
    input.click();
  };

  // Handle country selection: update activity country, region, and city via reverse geocoding
  const handleSelectCountry = async (country: Country) => {
    try {
      setActivityCountry(country.name);
      const newLat = country.latitude || 37.5665;
      const newLng = country.longitude || 126.9780;
      setLatitude(newLat);
      setLongitude(newLng);
      const newRegion = {
        latitude: newLat,
        longitude: newLng,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      };
      setRegion(newRegion);
      const locationData = await getDistrictNameFromCoordinates(newLat, newLng, SERVER_URL);
      setActivityCity(locationData.city);
    } catch (error) {
      console.error('Error selecting country:', error);
    }
  };

  // Create buddy group: validate inputs and submit form data to server
  const handleCreateBuddyGroup = async () => {
    if (!buddyName || !activityCity || !activityCountry) {
      window.alert(`${t('error')}: ${t('all_fields_required')}`);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      window.alert(`${t('error')}: ${t('auth_required')}`);
      return;
    }
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('name', buddyName);
      formData.append('description', buddyDescription);
      formData.append('activityCountry', activityCountry);
      formData.append('activityCity', activityCity);
      formData.append('latitude', latitude.toString());
      formData.append('longitude', longitude.toString());

      if (buddyImage) {
        // 실제 업로드 시에는 File 객체를 사용해야 하겠지만,
        // 여기서는 buddyImage가 로컬 미리보기 URL인 경우 그대로 전송합니다.
        formData.append('image', buddyImage);
      }

      const response = await axios.post(`${SERVER_URL}/buddy-groups`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        window.alert(`${t('success')}: ${t('buddy_created')}`);
        resetFields();
        onClose();
      }
    } catch (error) {
      console.error('Error creating buddy group:', error);
      window.alert(`${t('error')}: ${t('buddy_create_failed')}`);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFields = () => {
    setBuddyName('');
    setBuddyDescription('');
    setActivityCountry('Unknown');
    setActivityCity('');
    setLatitude(37.5665);
    setLongitude(126.9780);
    setBuddyImage(null);
    setRegion({
      latitude: 37.5665,
      longitude: 126.9780,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  // Move to "my location" using browser's geolocation API
  const handleMoveToMyLocation = async () => {
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const fetchedLatitude = position.coords.latitude;
        const fetchedLongitude = position.coords.longitude;
        setRegion({
          latitude: fetchedLatitude,
          longitude: fetchedLongitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
        setLatitude(fetchedLatitude);
        setLongitude(fetchedLongitude);
        try {
          const locationData = await getDistrictNameFromCoordinates(fetchedLatitude, fetchedLongitude, SERVER_URL);
          setActivityCity(locationData.city);
          setActivityCountry(locationData.country);
        } catch (error) {
          console.error('Error getting location data:', error);
        }
      },
      (error) => {
        console.error('Error getting geolocation:', error);
        window.alert(`${t('error')}: ${t('failed_to_retrieve_location')}`);
      },
      { enableHighAccuracy: true }
    );
  };

  // Handler for region changes in CustomMapView
  const onRegionChangeComplete = (newRegion: any) => {
    setRegion(newRegion);
  };

  // Define marker properties for the custom map
  const markerOneProps = {
    coordinate: { latitude, longitude },
    title: activityCity || 'Primary Activity Area',
    description: activityCountry || 'Main location for the buddy group.',
    imageSource: getLocalImage('map_star.png'),
    key: `marker1-${activityCity || 'unknown'}-${activityCountry || 'unknown'}`,
  };

  const markerTwoProps = {
    coordinate: { latitude: region.latitude, longitude: region.longitude },
    title: 'Click Here To Change Activity Location',
    imageSource: getLocalImage('map_post.png'),
    onPress: async () => {
      setLatitude(region.latitude);
      setLongitude(region.longitude);
      try {
        const locationData = await getDistrictNameFromCoordinates(
          region.latitude,
          region.longitude,
          SERVER_URL
        );
        setActivityCity(locationData.city);
        setActivityCountry(locationData.country);
      } catch (error) {
        console.error('Error updating location info:', error);
      }
    },
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.scrollContainer}>
          <button className={styles.closeButton} onClick={onClose}>
            <img src={getLocalImage('delete-icon-big.png')} alt="close" className={styles.closeIcon} />
          </button>
          <h2 className={styles.title}>{t('create_buddy')}</h2>
          <input
            type="text"
            className={styles.input}
            placeholder={t('buddy_name')}
            value={buddyName}
            onChange={(e) => setBuddyName(e.target.value)}
          />
          <textarea
            className={`${styles.input} ${styles.textArea}`}
            placeholder={t('buddy_description')}
            value={buddyDescription}
            onChange={(e) => setBuddyDescription(e.target.value)}
            rows={4}
          />
          <div className={styles.country}>
            <label className={styles.label}>{t('activity_country')}</label>
            <CountrySelector
              countries={countries}
              selectedCountry={activityCountry}
              onSelectCountry={handleSelectCountry}
            />
          </div>
          <input
            type="text"
            className={styles.input}
            placeholder={t('activity_city')}
            value={activityCity}
            onChange={(e) => setActivityCity(e.target.value)}
          />
          {/* CustomMapView: A web-compatible map component */}
          <CustomMapView
            key={`custommap-${activityCity || 'unknown'}-${activityCountry || 'unknown'}`}
            region={region}
            markerOne={markerOneProps}
            markerTwo={markerTwoProps}
            polylineCoordinates={[
              { latitude, longitude },
              { latitude: region.latitude, longitude: region.longitude },
            ]}
            isMapVisible={true}
            onMoveToMyLocation={handleMoveToMyLocation}
            myLocationIconSource={getLocalImage('map_user.png')}
            onRegionChangeComplete={onRegionChangeComplete}
          />
          {buddyImage ? (
            <div className={styles.imagePreviewContainer} onClick={pickImage}>
              <img src={buddyImage} alt="Buddy" className={styles.imagePreview} />
              <p className={styles.changeImageText}>{t('tap_to_change_image')}</p>
            </div>
          ) : (
            <div className={styles.imagePickerContainer}>
              <button className={styles.imagePicker} onClick={pickImage}>
                <img src={getLocalImage('image-icon-dark.png')} alt="Pick" className={styles.imageIcon} />
                <p className={styles.imagePickerText}>{t('select_image')}</p>
              </button>
            </div>
          )}
          <button
            className={styles.createButton}
            onClick={handleCreateBuddyGroup}
            disabled={isLoading}
          >
            {isLoading ? t('creating') : t('create')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuddyCreateModal;
