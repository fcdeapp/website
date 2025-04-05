"use client";

import React, { useState, useEffect } from "react";
import { useConfig } from "../context/ConfigContext";
import { useTranslation } from "react-i18next";
import styles from "../styles/overlays/TopicSelectorOverlay.module.css";

export interface Topic {
  key: string;
  color: string;
}

interface TopicSelectorOverlayProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (selectedTopic: string) => void;
  allTopics: Topic[];
  initialSelectedTopic?: string;
}

const TopicSelectorOverlay: React.FC<TopicSelectorOverlayProps> = ({
  visible,
  onClose,
  onSelect,
  allTopics,
  initialSelectedTopic,
}) => {
  const { t } = useTranslation();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  useEffect(() => {
    setSelectedTopic(initialSelectedTopic || null);
  }, [initialSelectedTopic]);

  const handleSelectTopic = (topicKey: string) => {
    setSelectedTopic(topicKey);
  };

  const handleConfirm = () => {
    if (selectedTopic) {
      onSelect(selectedTopic);
      onClose();
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.overlayContainer} onClick={onClose}>
      <div className={styles.contentContainer} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles.title}>{t("select_topic")}</h2>
        <div className={styles.topicList}>
          {allTopics.map((item) => (
            <button
              key={item.key}
              className={styles.topicButton}
              style={{
                borderColor: item.color,
                backgroundColor: selectedTopic === item.key ? item.color : "transparent",
              }}
              onClick={() => handleSelectTopic(item.key)}
            >
              <span
                className={styles.topicText}
                style={{
                  color: selectedTopic === item.key ? "#FFFFFF" : item.color,
                }}
              >
                {t(`topics.${item.key}`)}
              </span>
            </button>
          ))}
        </div>
        <div className={styles.buttonGroup}>
          <button className={styles.cancelButton} onClick={onClose}>
            {t("cancel")}
          </button>
          <button
            className={`${styles.confirmButton} ${!selectedTopic ? styles.disabledButton : ""}`}
            onClick={handleConfirm}
            disabled={!selectedTopic}
          >
            {t("continue")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TopicSelectorOverlay;
