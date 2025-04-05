"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/Toggle.module.css";

export interface ToggleProps {
  orientation: "horizontal" | "vertical";
  items: string[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  width?: number;
  height?: number;
}

const ITEM_WIDTH = 60;

const Toggle: React.FC<ToggleProps> = ({
  orientation,
  items,
  selectedIndex,
  onSelectIndex,
  width = 300,
  height = 60,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<number[]>([]);
  const [buttonSize, setButtonSize] = useState<number>(0);
  const [sliderLeft, setSliderLeft] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  const { t } = useTranslation();
  const itemCount = items.length;
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 각 버튼의 레이아웃 정보를 측정하여 positions 배열에 저장
  const handleLayoutItem = useCallback((index: number) => {
    if (scrollRef.current && buttonRefs.current[index]) {
      const containerRect = scrollRef.current.getBoundingClientRect();
      const rect = buttonRefs.current[index]!.getBoundingClientRect();
      const pos = orientation === "horizontal" ? rect.left - containerRect.left : rect.top - containerRect.top;
      setPositions((prev) => {
        const temp = [...prev];
        temp[index] = pos;
        return temp;
      });
      if (index === 0) {
        setButtonSize(orientation === "horizontal" ? rect.width : rect.height);
      }
    }
  }, [orientation]);

  // 레이아웃 측정 (마운트 및 창 크기 변경 시)
  useEffect(() => {
    for (let i = 0; i < itemCount; i++) {
      handleLayoutItem(i);
    }
    const handleResize = () => {
      for (let i = 0; i < itemCount; i++) {
        handleLayoutItem(i);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [itemCount, handleLayoutItem]);

  // 선택된 인덱스가 변경되면 슬라이더의 위치와 크기를 업데이트하고 스크롤 중앙으로 이동
  useEffect(() => {
    if (positions.length === itemCount) {
      const targetPos = positions[selectedIndex] || 0;
      setSliderLeft(targetPos);
      setSliderWidth(buttonSize);
      if (scrollRef.current && buttonRefs.current[selectedIndex]) {
        const targetButton = buttonRefs.current[selectedIndex]!;
        const containerWidth = scrollRef.current.offsetWidth;
        const rect = targetButton.getBoundingClientRect();
        const containerRect = scrollRef.current.getBoundingClientRect();
        const targetScroll = Math.max(
          0,
          (rect.left - containerRect.left) + rect.width / 2 - containerWidth / 2
        );
        scrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
      }
    }
  }, [selectedIndex, positions, buttonSize, itemCount]);

  const handlePress = (index: number) => {
    onSelectIndex(index);
  };

  // Next.js의 inline style은 React.CSSProperties 타입이어야 하므로 명시적으로 캐스팅
  const containerStyle: React.CSSProperties =
    orientation === "horizontal"
      ? { width: `${width}px`, height: `${height}px`, display: "flex", flexDirection: "row" }
      : { width: `${width}px`, height: `${height}px`, display: "flex", flexDirection: "column" };

  const sliderStyle: React.CSSProperties =
    orientation === "horizontal"
      ? {
          left: sliderLeft + 11 + "px",
          width: sliderWidth + "px",
          top: "0",
          bottom: "0",
          position: "absolute",
        }
      : {
          top: sliderLeft + "px",
          height: sliderWidth + "px",
          left: "0",
          right: "0",
          position: "absolute",
        };

  return (
    <div className={styles.container} style={containerStyle}>
      <div className={styles.topicToggleContainer}>
        {/* 슬라이더(머커) 영역 */}
        <div className={styles.slider} style={sliderStyle}>
          <div className={styles.sliderGradient}></div>
        </div>
        <div className={styles.horizontalScroll} ref={scrollRef}>
          {items.map((item, index) => (
            <button
              key={index}
              ref={(el) => { buttonRefs.current[index] = el; }}
              className={styles.topicButton}
              onClick={() => handlePress(index)}
            >
              <span className={styles.itemText}>{item}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Toggle;
