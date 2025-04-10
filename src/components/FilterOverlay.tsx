"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import styles from "../styles/components/FilterOverlay.module.css";
import countryFlags from "../constants/countryFlags";

type FilterOverlayProps = {
  visible: boolean;
  onClose: () => void;
  sortOption: string;
  setSortOption: React.Dispatch<React.SetStateAction<string>>;
  nearbyOption: string;
  setNearbyOption: React.Dispatch<React.SetStateAction<string>>;
  countryOption?: string;
  setCountryOption?: React.Dispatch<React.SetStateAction<string>>;
  currentCountry?: string;
  currentCity?: string;
};

const FilterOverlay: React.FC<FilterOverlayProps> = ({
  visible,
  onClose,
  sortOption,
  setSortOption,
  nearbyOption,
  setNearbyOption,
  countryOption,
  setCountryOption,
  currentCountry,
  currentCity,
}) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();

  // 오버레이 애니메이션 상태 (fade/scale)
  const [overlayStyle, setOverlayStyle] = useState({
    opacity: 0,
    transform: "scale(0.9)",
  });
  const [isOverlayVisible, setIsOverlayVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsOverlayVisible(true);
      // 열릴 때 애니메이션
      setTimeout(() => {
        setOverlayStyle({ opacity: 1, transform: "scale(1)" });
      }, 10);
    } else {
      // 닫을 때 애니메이션
      setOverlayStyle({ opacity: 0, transform: "scale(0.9)" });
      setTimeout(() => {
        setIsOverlayVisible(false);
        onClose();
      }, 300);
    }
  }, [visible, onClose]);

  // 옵션 애니메이션 상태
  const [sortScale, setSortScale] = useState(1);
  const [sortOpacity, setSortOpacity] = useState(1);
  const [nearbyScale, setNearbyScale] = useState(1);
  const [nearbyOpacity, setNearbyOpacity] = useState(1);
  const [countryScale, setCountryScale] = useState(1);
  const [countryOpacity, setCountryOpacity] = useState(1);

  const handleSortChange = () => {
    const options = ["latest", "popularity", "recommended", "distance"];
    const newOption = options[(options.indexOf(sortOption) + 1) % options.length];
    setSortScale(0.8);
    setSortOpacity(0);
    setTimeout(() => {
      setSortOption(newOption);
      setSortScale(1.1);
      setSortOpacity(1);
      setTimeout(() => {
        setSortScale(1);
      }, 100);
    }, 200);
  };

  const handleNearbyChange = () => {
    const newOption = nearbyOption === t("nearby-only") ? t("anywhere") : t("nearby-only");
    setNearbyScale(0.8);
    setNearbyOpacity(0);
    setTimeout(() => {
      setNearbyOption(newOption);
      setNearbyScale(1.1);
      setNearbyOpacity(1);
      setTimeout(() => {
        setNearbyScale(1);
      }, 100);
    }, 200);
  };

  const handleCountryOptionChange = () => {
    if (!setCountryOption) return;
    const newOption = countryOption === t("all_countries") ? t("same_country") : t("all_countries");
    setCountryScale(0.8);
    setCountryOpacity(0);
    setTimeout(() => {
      setCountryOption(newOption);
      setCountryScale(1.1);
      setCountryOpacity(1);
      setTimeout(() => {
        setCountryScale(1);
      }, 100);
    }, 200);
  };

  return (
    <>
      {isOverlayVisible && (
        <div className={styles.modalOverlay} style={overlayStyle}>
          <div className={styles.overlayInnerContent}>
            <h2 className={styles.overlayTitle}>{t("filter_options")}</h2>

            {/* 정렬 옵션 */}
            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>{t("sort_by")}</span>
              <button className={styles.optionButton} onClick={handleSortChange}>
                <span
                  className={styles.optionText}
                  style={{
                    transform: `scale(${sortScale})`,
                    opacity: sortOpacity,
                  }}
                >
                  {t(`sort_options.${sortOption}`)}
                </span>
              </button>
            </div>

            {/* 근처 옵션 */}
            <div className={styles.optionGroup}>
              <span className={styles.optionLabel}>{t("nearby_filter_options")}</span>
              <button className={styles.optionButton} onClick={handleNearbyChange}>
                <span
                  className={styles.optionText}
                  style={{
                    transform: `scale(${nearbyScale})`,
                    opacity: nearbyOpacity,
                  }}
                >
                  {t(`nearby_options.${nearbyOption}`)}
                </span>
              </button>
            </div>

            {countryOption !== undefined &&
              setCountryOption !== undefined &&
              currentCountry !== undefined &&
              currentCity !== undefined && (
                <>
                  {/* 현재 내 위치 (국가, 도시, 국기) */}
                  <div className={styles.optionGroup}>
                    <span className={styles.optionLabel}>{t("current_location")}</span>
                    <div className={styles.locationInfoContainer}>
                      {currentCountry !== "Unknown Country" && currentCountry !== "Unknown" && currentCountry !== "" && (
                        <img
                        src={(countryFlags as Record<string, string>)[currentCountry] || ""}
                          alt={currentCountry}
                          className={styles.locationFlag}
                        />
                      )}
                      <div className={styles.locationTextContainer}>
                        <span className={styles.locationText}>{currentCountry}</span>
                        <span className={styles.locationText}>{currentCity}</span>
                      </div>
                    </div>
                  </div>

                  {/* 국가 옵션 버튼 */}
                  <div className={styles.optionGroup}>
                    <span className={styles.optionLabel}>{t("country_filter")}</span>
                    <button className={styles.optionButton} onClick={handleCountryOptionChange}>
                      <span
                        className={styles.optionText}
                        style={{
                          transform: `scale(${countryScale})`,
                          opacity: countryOpacity,
                        }}
                      >
                        {countryOption}
                      </span>
                    </button>
                  </div>
                </>
              )}

            {/* 닫기 버튼 */}
            <button className={styles.closeButton} onClick={onClose}>
              {t("close")}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FilterOverlay;
