"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/TopicSlider.module.css";

export interface Topic {
  key: string;
  color: string;
}

interface TopicSliderProps {
  myTopics: Topic[];
  selectedTopics: string[]; // 예: ['tech', 'sports', ...] 또는 전체 선택 시 ['tech', ..., 'no_topic']
  setSelectedTopics: (topics: string[]) => void;
  isCompact: boolean;
  handleSelectTopic: (topicKey: string, index: number) => void;
  t: (key: string, options?: any) => string;
}

const TopicSlider: React.FC<TopicSliderProps> = ({
  myTopics,
  selectedTopics,
  setSelectedTopics,
  isCompact,
  handleSelectTopic,
  t,
}) => {
  // 화면 넓이 (웹 환경)
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 375;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<number[]>([]);
  const [buttonSize, setButtonSize] = useState<number>(0);
  const [sliderLeft, setSliderLeft] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [currentTopicColor, setCurrentTopicColor] = useState("#0A1045");

  // 각 버튼 ref 배열
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // "All" 버튼 포함 전체 주제 수 (All 버튼은 인덱스 0)
  const itemCount = myTopics.length + 1;

  // 각 버튼의 위치를 측정
  const handleLayoutItem = useCallback((index: number) => {
    if (scrollRef.current && buttonRefs.current[index]) {
      const containerRect = scrollRef.current.getBoundingClientRect();
      const rect = buttonRefs.current[index]!.getBoundingClientRect();
      const pos = rect.left - containerRect.left;
      setPositions((prev) => {
        const temp = [...prev];
        temp[index] = pos;
        return temp;
      });
      // 첫 번째 버튼의 너비 저장
      if (index === 0) {
        setButtonSize(rect.width);
      }
    }
  }, []);

  // mount 및 윈도우 리사이즈 시 모든 버튼 레이아웃 측정
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
  }, [myTopics, handleLayoutItem, itemCount]);

  // 선택된 주제에 따라 슬라이더의 위치와 너비 업데이트
  useEffect(() => {
    let index = 0;
    if (selectedTopics.includes("no_topic")) {
      index = 0;
      setCurrentTopicColor("#0A1045");
    } else {
      const foundIndex = myTopics.findIndex((topic) =>
        selectedTopics.includes(topic.key)
      );
      if (foundIndex !== -1) {
        index = foundIndex + 1; // All 버튼은 인덱스 0
        setCurrentTopicColor(myTopics[foundIndex].color);
      }
    }
    if (positions[index] !== undefined) {
      setSliderLeft(positions[index]);
      setSliderWidth(buttonSize);
      if (scrollRef.current && buttonRefs.current[index]) {
        const targetButton = buttonRefs.current[index]!;
        const containerWidth = scrollRef.current.offsetWidth;
        const rect = targetButton.getBoundingClientRect();
        const containerRect = scrollRef.current.getBoundingClientRect();
        const targetScroll = Math.max(
          0,
          rect.left - containerRect.left + rect.width / 2 - containerWidth / 2
        );
        scrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
      }
    }
  }, [selectedTopics, positions, buttonSize, myTopics]);

  // 앱 버전과 동일하게 "All" 버튼 선택 시 모든 주제를 선택하도록 함
  const handleSelectAll = () => {
    if (
      !selectedTopics.includes("no_topic") ||
      (selectedTopics.length - 1) !== myTopics.length
    ) {
      setSelectedTopics([...myTopics.map((topic) => topic.key), "no_topic"]);
    }
    handleSelectTopic("no_topic", 0);
  };

  // 버튼 클릭 시 처리
  const handlePress = (topicKey: string, index: number) => {
    handleSelectTopic(topicKey, index);
  };

  // 앱 버전과 동일한 효과: 선택된 주제 수 (no_topic 제외)
  const effectiveSelectedCount = selectedTopics.includes("no_topic")
    ? selectedTopics.length - 1
    : selectedTopics.length;

  // All 버튼 스타일 (앱 버전 LinearGradient 효과 모방)
  const allButtonStyle: React.CSSProperties = {
    height: isCompact ? 48 : 40,
    borderRadius: 30,
    padding: "0 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: effectiveSelectedCount === myTopics.length
      ? "linear-gradient(to right, #FF7E5F, #FD3A69)"
      : "#EEEEEE",
  };

  const allTextStyle: React.CSSProperties = {
    fontSize: isCompact ? 16 : 14,
    fontWeight: 600,
    color: effectiveSelectedCount === myTopics.length ? "#fff" : "#888",
  };

  // 컨테이너는 CSS 모듈의 스타일을 사용하고, 필요 시 추가 inline 스타일 지정
  const containerStyle: React.CSSProperties = {
    width: "100%",
    height: "60px",
  };

  // 슬라이더 marker 스타일 (좌측 위치에 11px padding 추가)
  const sliderStyle: React.CSSProperties = {
    left: sliderLeft + 11 + "px",
    width: sliderWidth + "px",
    top: "0",
    bottom: "0",
    position: "absolute",
  };

  // 각 주제 버튼의 텍스트 처리 (앱 버전과 동일)
  const getDisplayText = (rawTranslation: string, isSelected: boolean) => {
    const emojiOnly = rawTranslation.split(" ")[0];
    if (isSelected && isCompact) {
      return emojiOnly;
    } else if (isSelected && !isCompact) {
      return rawTranslation;
    } else if (!isSelected && !isCompact) {
      return rawTranslation.replace(/[\u{1F600}-\u{1F64F}]/gu, "").trim();
    }
    return "";
  };

  return (
    <div className={styles.container} style={containerStyle}>
      <div className={styles.topicToggleContainer}>
      <div className={styles.sliderWrapper}>
        <div className={styles.horizontalScroll} ref={scrollRef}>
          {/* All 버튼 */}
          <button
            ref={(el) => {
              buttonRefs.current[0] = el;
            }}
            className={styles.topicButtonAll}
            style={{
              backgroundColor: "transparent",
              borderColor: "transparent",
              margin: "0 8px",
              height: isCompact ? 48 : 40,
            }}
            onClick={handleSelectAll}
          >
            <div
              className={styles.allButton}
              style={Object.assign(
                { height: isCompact ? 48 : 40 },
                allButtonStyle
              )}
            >
              <span className={styles.allTopicText} style={allTextStyle}>
                {t("select_all")}
              </span>
            </div>
          </button>
          {myTopics.map((topic, index) => {
            const isSelected = selectedTopics.includes(topic.key);
            // Compact 모드에서는 선택되지 않은 주제는 렌더링하지 않음
            if (!isSelected && isCompact) return null;
            const rawTranslation = t(`topics.${topic.key}`);
            const displayText = getDisplayText(rawTranslation, isSelected);
            return (
              <div key={topic.key} style={{ transform: "scale(1)" }}>
                <button
                  ref={(el) => {
                    buttonRefs.current[index + 1] = el;
                  }}
                  className={styles.topicButton}
                  style={{
                    backgroundColor: isSelected ? "#fff" : "transparent",
                    borderColor: isSelected ? topic.color : "#D9D9D9",
                    margin: "0 8px",
                    height: isCompact ? 48 : 40,
                    padding: isCompact ? "0 8px" : "0 16px",
                  }}
                  onClick={() => handlePress(topic.key, index + 1)}
                >
                  <span
                    className={styles.topicText}
                    style={{
                      fontSize: isSelected
                        ? isCompact
                          ? 30
                          : 14
                        : isCompact
                        ? 22
                        : 12,
                      color: isSelected ? topic.color : "#888",
                    }}
                  >
                    {displayText}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
};

export default TopicSlider;
