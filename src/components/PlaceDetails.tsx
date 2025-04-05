"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import { calculateDistance } from "../utils/distanceUtils";
import styles from "../styles/components/PlaceDetails.module.css";

interface PlaceDetailsProps {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  locality: string;
  region: string;
  country: string;
  showButton?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  selectedTopic?: string;
}

type RootStackParamList = {
  Posting: { 
    latitude: number; 
    longitude: number; 
    selectedTopic?: string; // 선택적 매개변수 (undefined 가능)
    meetingPlace: string; 
  };
};

const PlaceDetails: React.FC<PlaceDetailsProps> = ({
  name,
  address,
  latitude,
  longitude,
  category,
  locality,
  region,
  country,
  showButton = true,
  isSelected = false,
  onSelect,
  selectedTopic,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [distance, setDistance] = useState<string | null>(null);

  useEffect(() => {
    const fetchDistance = async () => {
      const result = await calculateDistance(latitude, longitude, t);
      setDistance(result);
    };
    fetchDistance();
  }, [latitude, longitude, t]);

  const handleCreateMeeting = () => {
    if (!selectedTopic) {
      console.warn("selectedTopic is undefined");
    }
    router.push(
      `/posting?latitude=${latitude}&longitude=${longitude}&selectedTopic=${selectedTopic || ""}&meetingPlace=${encodeURIComponent(
        `${name} (${address})`
      )}`
    );
  };

  return (
    <div
      className={`${styles.container} ${isSelected ? styles.selectedContainer : ""}`}
      onClick={onSelect}
    >
      {isSelected && (
        <div className={styles.checkBadge}>
          <span className={styles.checkBadgeText}>✓</span>
        </div>
      )}
      <h2 className={styles.title}>{name}</h2>
      <p className={styles.subtitle}>{category}</p>
      <div className={styles.divider} />
      <p className={styles.detailLabel}>{t("placeDetails.address")}</p>
      <p className={styles.detailText}>{address}</p>
      <p className={styles.detailLabel}>{t("placeDetails.distance")}</p>
      <p className={styles.detailText}>
        {distance ? distance : t("placeDetails.calculatingDistance")}
      </p>
      <p className={styles.detailLabel}>{t("placeDetails.area")}</p>
      <p className={styles.detailText}>{`${locality}, ${region}, ${country}`}</p>
      {showButton && (
        <button className={styles.button} onClick={handleCreateMeeting}>
          <span className={styles.buttonText}>{t("placeDetails.createMeeting")}</span>
        </button>
      )}
    </div>
  );
};

export default PlaceDetails;
