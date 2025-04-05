"use client";

import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import L, { Map, LatLngExpression } from "leaflet";
import styles from "../styles/components/CustomMapView.module.css";

interface MarkerProps {
  coordinate: { latitude: number; longitude: number };
  title: string;
  description?: string;
  imageSource: string; // 이미지 URL (public/assets/ 내 파일 등)
  onPress?: () => void;
  key?: string;
}

interface Region {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface CustomMapViewProps {
  region: Region;
  markerOne: MarkerProps;
  markerTwo: MarkerProps;
  polylineCoordinates: { latitude: number; longitude: number }[];
  isMapVisible: boolean;
  onToggleMapVisibility?: () => void;
  onMoveToMyLocation: () => void;
  mapToggleButtonTextShow?: string;
  mapToggleButtonTextHide?: string;
  myLocationIconSource: string;
  onRegionChangeComplete?: (region: Region) => void;
}

// region을 Leaflet의 center, zoom으로 변환하는 헬퍼 함수
const regionToCenterZoom = (region: Region) => {
  const center: LatLngExpression = [region.latitude, region.longitude];
  // 간단히 latitudeDelta를 사용하여 zoom을 추정 (360/latitudeDelta의 로그값)
  const zoom = Math.round(Math.log2(360 / region.latitudeDelta));
  return { center, zoom };
};

// 지도 이동 후 이벤트 핸들러 컴포넌트
function MapEvents({ onRegionChangeComplete }: { onRegionChangeComplete?: (region: Region) => void }) {
  useMapEvents({
    moveend(e) {
      if (onRegionChangeComplete) {
        const map = e.target;
        const center = map.getCenter();
        const bounds = map.getBounds();
        const latDelta = Math.abs(bounds.getNorth() - bounds.getSouth());
        const lngDelta = Math.abs(bounds.getEast() - bounds.getWest());
        onRegionChangeComplete({
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: latDelta,
          longitudeDelta: lngDelta,
        });
      }
    },
  });
  return null;
}

// AnimatedMarker: 간단한 애니메이션 효과는 CSS 전환을 통해 처리
const AnimatedMarker: React.FC<MarkerProps> = ({
  coordinate,
  title,
  description,
  imageSource,
  onPress,
  key,
}) => {
  const position: LatLngExpression = [coordinate.latitude, coordinate.longitude];
  // 커스텀 아이콘 생성
  const icon = L.icon({
    iconUrl: imageSource,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  return (
    <Marker
      position={position}
      icon={icon}
      eventHandlers={{
        click: onPress || (() => {}),
      }}
      key={key}
    />
  );
};

const CustomMapView: React.FC<CustomMapViewProps> = ({
  region,
  markerOne,
  markerTwo,
  polylineCoordinates,
  isMapVisible,
  onToggleMapVisibility,
  onMoveToMyLocation,
  mapToggleButtonTextShow,
  mapToggleButtonTextHide,
  myLocationIconSource,
  onRegionChangeComplete,
}) => {
  const { center, zoom } = regionToCenterZoom(region);
  const mapRef = useRef<any>(null);

  if (!isMapVisible) {
    return (
      <div className={styles.noMapContainer}>
        {onToggleMapVisibility && mapToggleButtonTextShow && (
          <button className={styles.mapToggleButton} onClick={onToggleMapVisibility}>
            {mapToggleButtonTextShow}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.mapContainer}>
      <MapContainer
        ref={mapRef}
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "300px", width: "100%", borderRadius: "15px" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onRegionChangeComplete={onRegionChangeComplete} />
        <AnimatedMarker
          key={markerOne.key || "marker1"}
          coordinate={markerOne.coordinate}
          title={markerOne.title}
          description={markerOne.description}
          imageSource={markerOne.imageSource}
          onPress={markerOne.onPress}
        />
        <AnimatedMarker
          key={markerTwo.key || "marker2"}
          coordinate={markerTwo.coordinate}
          title={markerTwo.title}
          description={markerTwo.description}
          imageSource={markerTwo.imageSource}
          onPress={markerTwo.onPress}
        />
        <Polyline
          positions={polylineCoordinates.map((coord) => [coord.latitude, coord.longitude])}
          pathOptions={{ color: "#D8315B", weight: 3, dashArray: "6 4" }}
        />
      </MapContainer>
      {onToggleMapVisibility && mapToggleButtonTextHide && (
        <button className={styles.mapToggleButtonHide} onClick={onToggleMapVisibility}>
          {mapToggleButtonTextHide}
        </button>
      )}
      <button className={styles.myLocationButton} onClick={onMoveToMyLocation}>
        <img src={myLocationIconSource} alt="My Location" className={styles.myLocationIcon} />
      </button>
    </div>
  );
};

export default CustomMapView;
