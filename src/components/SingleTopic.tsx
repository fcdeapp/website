"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/SingleTopic.module.css";

export interface Topic {
  key: string;
  color: string;
}

interface SingleTopicProps {
  topics: Topic[];
  selectedTopic: string;
  onTopicChange: (topicKey: string) => void;
}

const ITEM_WIDTH = 60;

const SingleTopic: React.FC<SingleTopicProps> = ({ topics, selectedTopic, onTopicChange }) => {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [buttonLayouts, setButtonLayouts] = useState<{ [index: number]: { x: number; width: number } }>({});
  const [markerLeft, setMarkerLeft] = useState(0);
  const [markerWidth, setMarkerWidth] = useState(0);
  const [markerColor, setMarkerColor] = useState("#0A1045");
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 측정: 각 버튼의 레이아웃 정보를 저장
  const measureLayouts = useCallback(() => {
    if (scrollRef.current) {
      const containerRect = scrollRef.current.getBoundingClientRect();
      const layouts: { [index: number]: { x: number; width: number } } = {};
      buttonRefs.current.forEach((btn, index) => {
        if (btn) {
          const rect = btn.getBoundingClientRect();
          layouts[index] = { x: rect.left - containerRect.left, width: rect.width };
        }
      });
      setButtonLayouts(layouts);
    }
  }, []);

  // 레이아웃 측정 (마운트 및 창 크기 변경 시)
  useEffect(() => {
    measureLayouts();
    window.addEventListener("resize", measureLayouts);
    return () => window.removeEventListener("resize", measureLayouts);
  }, [measureLayouts, topics]);

  // 선택된 토픽에 따른 marker 업데이트
  useEffect(() => {
    let index = 0;
    if (selectedTopic === "no_topic") {
      index = 0;
      setMarkerColor("#0A1045");
    } else {
      const foundIndex = topics.findIndex((topic) => topic.key === selectedTopic);
      if (foundIndex !== -1) {
        index = foundIndex + 1; // 첫 번째 버튼은 "no_topic"
        setMarkerColor(topics[foundIndex].color);
      }
    }
    if (buttonLayouts[index]) {
      setMarkerLeft(buttonLayouts[index].x);
      setMarkerWidth(buttonLayouts[index].width);
      // 스크롤 컨테이너 중앙으로 이동
      if (scrollRef.current) {
        const targetScroll = Math.max(
          0,
          buttonLayouts[index].x + buttonLayouts[index].width / 2 - scrollRef.current.offsetWidth / 2
        );
        scrollRef.current.scrollTo({ left: targetScroll, behavior: "smooth" });
      }
    }
  }, [selectedTopic, buttonLayouts, topics]);

  const handleButtonClick = (topicKey: string, index: number) => {
    onTopicChange(topicKey);
  };

  return (
    <div className={styles.container}>
      <div className={styles.topicToggleContainer}>
        {/* 머커: CSS transition을 사용해 부드럽게 이동 */}
        <div
          className={styles.topicMarker}
          style={{
            left: markerLeft + 11, // 수평 스크롤 패딩 고려
            width: markerWidth,
            backgroundColor: markerColor,
          }}
        />
        <div className={styles.horizontalScroll} ref={scrollRef}>
          {/* "no_topic" 버튼 */}
          <button
            ref={(el) => { buttonRefs.current[0] = el; }}
            className={`${styles.topicButton} ${selectedTopic === "no_topic" ? styles.selectedButton : ""}`}
            onClick={() => handleButtonClick("no_topic", 0)}
          >
            <span className={styles.topicText}>{t("no_topic")}</span>
          </button>
          {topics.map((topic, index) => (
            <button
              key={topic.key}
              ref={(el) => { buttonRefs.current[index + 1] = el; }}
              className={`${styles.topicButton} ${selectedTopic === topic.key ? styles.selectedButton : ""}`}
              onClick={() => handleButtonClick(topic.key, index + 1)}
            >
              <span
                className={styles.topicText}
                style={{
                  fontSize: selectedTopic === topic.key ? 16 : 14,
                  color: selectedTopic === topic.key ? "#FAFAFA" : topic.color,
                }}
              >
                {t(`topics.${topic.key}`)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SingleTopic;
