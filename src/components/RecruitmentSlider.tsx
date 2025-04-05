"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/RecruitmentSlider.module.css";

interface RecruitmentSliderProps {
  maxParticipants: number;
  onValueChange: (value: number) => void;
}

const ITEM_WIDTH = 60;

const RecruitmentSlider: React.FC<RecruitmentSliderProps> = ({
  maxParticipants,
  onValueChange,
}) => {
  const { t } = useTranslation();
  const [currentValue, setCurrentValue] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollX, setScrollX] = useState(0);

  // 컨테이너 너비 측정
  useEffect(() => {
    const updateWidth = () => {
      if (scrollRef.current) {
        setContainerWidth(scrollRef.current.offsetWidth);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      setScrollX(scrollRef.current.scrollLeft);
    }
  }, []);

  // 스크롤이 멈춘 후 선택된 인덱스 계산 (디바운스 처리)
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (scrollRef.current) {
        const offsetX = scrollRef.current.scrollLeft;
        const selectedIndex = Math.round(offsetX / ITEM_WIDTH) + 1;
        if (selectedIndex <= maxParticipants) {
          setCurrentValue(selectedIndex);
          onValueChange(selectedIndex);
        }
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [scrollX, maxParticipants, onValueChange]);

  // 각 아이템의 스케일과 투명도를 계산하는 함수
  const renderItems = () => {
    // 컨테이너의 중앙 위치
    const center = scrollX + containerWidth / 2;
    return Array.from({ length: maxParticipants }, (_, index) => {
      const itemCenter = index * ITEM_WIDTH + ITEM_WIDTH / 2;
      const distance = Math.abs(center - itemCenter);
      // distance가 0일 때 scale 1.2, distance가 ITEM_WIDTH 이상이면 scale 0.8, 선형 보간
      const scale = distance >= ITEM_WIDTH ? 0.8 : 1.2 - ((distance / ITEM_WIDTH) * 0.4);
      const opacity = distance >= ITEM_WIDTH ? 0.5 : 1 - ((distance / ITEM_WIDTH) * 0.5);
      return (
        <button
          key={index}
          className={styles.itemButton}
          onClick={() => {
            const value = index + 1;
            setCurrentValue(value);
            onValueChange(value);
            scrollRef.current?.scrollTo({ left: index * ITEM_WIDTH, behavior: "smooth" });
          }}
          style={{
            transform: `scale(${scale})`,
            opacity,
            width: ITEM_WIDTH,
          }}
        >
          <span className={styles.itemText}>{index + 1}</span>
        </button>
      );
    });
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.scrollContainer}
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {renderItems()}
      </div>
      <p className={styles.selectedValueText}>
        {t("recruitment.message", {
          currentValue,
          totalParticipants: currentValue + 1,
        })}
      </p>
    </div>
  );
};

export default RecruitmentSlider;
