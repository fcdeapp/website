"use client";

import React, { useState } from 'react';

interface AnimatedMarkerProps {
  coordinate: { latitude: number; longitude: number };
  title?: string;
  description?: string;
  imageSource: string; // URL string for web
  onPress?: () => void;
  mapRef?: React.MutableRefObject<any>;
  zIndex?: number;
}

const AnimatedMarker: React.FC<AnimatedMarkerProps> = ({
  coordinate,
  title,
  description,
  imageSource,
  onPress,
  mapRef,
  zIndex = 1,
}) => {
  // 이미지 경로가 http/https로 시작하지 않으면 public/assets/에서 가져오도록 처리
  const localImageSource = imageSource.startsWith('http')
    ? imageSource
    : `/assets/${imageSource}`;

  // For the web, we'll use state variables to simulate the animated scale and translation.
  const [isSelected, setIsSelected] = useState(false);
  const [scale, setScale] = useState(1);
  const [translateY, setTranslateY] = useState(0);

  // When the marker is clicked, toggle the selected state and trigger a simple animation.
  const handleClick = async () => {
    setIsSelected(!isSelected);
    if (onPress) {
      onPress();
    }

    // Start animation: shrink and translate upward
    setScale(0.5);
    setTranslateY(-10);

    // After 150ms, restore to original
    setTimeout(() => {
      setScale(1);
      setTranslateY(0);
    }, 150);

    // If a mapRef is provided and supports centering (for example, a Google Maps ref), attempt to center the map.
    if (mapRef?.current && typeof mapRef.current.animateCamera === 'function') {
      try {
        const currentCamera = await mapRef.current.getCamera();
        const newCamera = {
          ...currentCamera,
          center: {
            latitude: coordinate.latitude,
            longitude: coordinate.longitude,
          },
        };
        mapRef.current.animateCamera(newCamera, { duration: 500 });
      } catch (error) {
        console.error('Error centering map on marker:', error);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'absolute',
        zIndex,
        // We assume the marker is positioned via CSS left/top elsewhere based on its coordinate.
        // Here we center it at the coordinate by shifting it left by 50% and bottom by 100%.
        transform: `translate(-50%, -100%) scale(${scale}) translateY(${translateY}px)`,
        transition: 'transform 150ms ease-in-out',
        cursor: 'pointer',
      }}
    >
      <img
        src={localImageSource}
        alt="marker"
        style={{
          width: 40,
          height: 40,
          objectFit: 'contain',
          display: 'block',
        }}
      />
      {isSelected && (
        <div
          style={{
            position: 'absolute',
            bottom: 50,
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255,255,255,0.85)',
            borderRadius: 12,
            padding: '10px 14px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.35)',
            pointerEvents: 'none',
            textAlign: 'left',
          }}
        >
          {title && (
            <div style={{ fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4 }}>
              {title}
            </div>
          )}
          {description && (
            <div style={{ fontSize: 14, color: '#555', lineHeight: '18px' }}>
              {description}
            </div>
          )}
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '10px solid rgba(255,255,255,0.7)',
              marginTop: 4,
            }}
          ></div>
        </div>
      )}
    </div>
  );
};

export default AnimatedMarker;
