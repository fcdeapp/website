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
  selectedTopics: string[]; // e.g. ['tech', 'sports', ...] or, for all selected: ['tech', ..., 'no_topic']
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
  // Use window.innerWidth for screen width in web environment.
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 375;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<number[]>([]);
  const [buttonSize, setButtonSize] = useState<number>(0);
  const [sliderLeft, setSliderLeft] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);
  const [currentTopicColor, setCurrentTopicColor] = useState("#0A1045");

  // Array to hold refs for each button.
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Measure each button's layout and store its x-position in the positions array.
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
      // Save the width of the first button.
      if (index === 0) {
        setButtonSize(rect.width);
      }
    }
  }, []);

  // On mount and on window resize, measure all button layouts.
  useEffect(() => {
    const itemCount = myTopics.length + 1; // +1 for "All" button.
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
  }, [myTopics, handleLayoutItem]);

  // Update the slider position and width based on the selected topic.
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
        index = foundIndex + 1; // "All" button is at index 0.
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

  const handlePress = (topicKey: string, index: number) => {
    handleSelectTopic(topicKey, index);
  };

  // "All" button logic: if not all topics are selected, select all (including "no_topic").
  const handleSelectAll = () => {
    if (!selectedTopics.includes("no_topic") || (selectedTopics.length - 1) !== myTopics.length) {
      setSelectedTopics([...myTopics.map((topic) => topic.key), "no_topic"]);
    }
    handleSelectTopic("no_topic", 0);
  };

  // Inline style for the container.
  const containerStyle: React.CSSProperties = {
    width: "300px",
    height: "60px",
    display: "flex",
    flexDirection: "row",
  };

  // Inline style for the slider.
  const sliderStyle: React.CSSProperties = {
    left: sliderLeft + 11 + "px", // Add 11px for padding.
    width: sliderWidth + "px",
    top: "0",
    bottom: "0",
    position: "absolute",
  };

  return (
    <div className={styles.container} style={containerStyle}>
      <div className={styles.topicToggleContainer}>
        {/* Slider (marker) */}
        <div className={styles.slider} style={sliderStyle}>
          <div className={styles.sliderGradient}></div>
        </div>
        <div className={styles.horizontalScroll} ref={scrollRef}>
          {/* "All" button */}
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
            <div className={styles.allButton} style={{ height: isCompact ? 48 : 40 }}>
              <span className={styles.allTopicText}>{t("select_all")}</span>
            </div>
          </button>
          {myTopics.map((topic, index) => {
            const isSelected = selectedTopics.includes(topic.key);
            if (!isSelected && isCompact) return null;
            const rawTranslation = t(`topics.${topic.key}`);
            const emojiOnly = rawTranslation.split(" ")[0];
            let displayText = "";
            if (isSelected && isCompact) {
              displayText = emojiOnly;
            } else if (isSelected && !isCompact) {
              displayText = rawTranslation;
            } else if (!isSelected && !isCompact) {
              displayText = rawTranslation.replace(/[\u{1F600}-\u{1F64F}]/gu, "").trim();
            }
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
                      fontSize: isSelected ? (isCompact ? 30 : 14) : (isCompact ? 22 : 12),
                      color: isSelected ? "#F8F8FE" : "#888",
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
  );
};

export default TopicSlider;
