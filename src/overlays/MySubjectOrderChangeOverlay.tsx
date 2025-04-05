"use client";

import React, { useState, useEffect, useRef } from "react";
import { useConfig } from "../context/ConfigContext";
import { useTranslation } from "react-i18next";
import styles from "../styles/overlays/MySubjectOrderChangeOverlay.module.css";

// Define the Topic type.
export interface Topic {
  key: string;
  color: string;
}

// Props for the overlay component.
interface MySubjectOrderChangeOverlayProps {
  visible: boolean;
  onClose: () => void;
  myTopics: Topic[];
  setMyTopics: (topics: Topic[]) => void;
}

// Constant list of all topics.
const allTopics: Topic[] = [
  { key: 'language_study', color: '#D8315B' },
  { key: 'cooking_enthusiasts', color: '#F2542D' },
  { key: 'volunteer_activities', color: '#D8315B' },
  { key: 'fitness_group', color: '#F2542D' },
  { key: 'international_food_exchange', color: '#D8315B' },
  { key: 'team_sports', color: '#F2542D' },
  { key: 'hidden_spots_tour', color: '#F2542D' },
  { key: 'photography_group', color: '#0A1045' },
  { key: 'study_cafe', color: '#0A1045' },
  { key: 'cultural_exchange', color: '#D8315B' },
  { key: 'running_mates', color: '#F2542D' },
  { key: 'academy_mates', color: '#0A1045' },
  { key: 'movie_group', color: '#F2542D' },
  { key: 'art_gathering', color: '#D8315B' },
  { key: 'spontaneous_travel', color: '#F2542D' },
  { key: 'karaoke_group', color: '#F2542D' },
  { key: 'bowling_group', color: '#0A1045' },
  { key: 'gaming_group', color: '#D8315B' },
  { key: 'duo_dining', color: '#F2542D' },
  { key: 'board_game_cafe', color: '#D8315B' },
  { key: 'hobby_exchange', color: '#0A1045' },
  { key: 'reading_group', color: '#D8315B' },
  { key: 'bucket_list', color: '#F2542D' },
  { key: 'sports_viewing', color: '#F2542D' },
  { key: 'dog_walking', color: '#D8315B' },
  { key: 'morning_hiking', color: '#0A1045' },
  { key: 'camping_group', color: '#0A1045' },
  { key: 'climbing_group', color: '#F2542D' },
  { key: 'horror_movie_group', color: '#D8315B' },
  { key: 'local_tours', color: '#0A1045' },
  { key: 'bbq_gathering', color: '#F2542D' },
  { key: 'writing_workshop', color: '#F2542D' },
  { key: 'museum_visits', color: '#0A1045' },
  { key: 'film_discussion_club', color: '#D8315B' },
  { key: 'book_swap_club', color: '#0A1045' },
  { key: 'music_jam_session', color: '#D8315B' },
  { key: 'campus_tour_history', color: '#0A1045' }
];

// Group definitions for grouped view.
const topicGroups = [
  {
    groupNameKey: "groups.learning_culture",
    keys: ["language_study", "academy_mates", "reading_group", "library_stroll", "campus_tour_history"],
  },
  {
    groupNameKey: "groups.food_drink",
    keys: ["cooking_enthusiasts", "international_food_exchange", "duo_dining", "bbq_gathering"],
  },
  {
    groupNameKey: "groups.outdoors_active",
    keys: ["morning_hiking", "running_mates", "team_sports", "dog_walking", "camping_group", "climbing_group"],
  },
  {
    groupNameKey: "groups.creative_social",
    keys: ["art_gathering", "movie_group", "film_discussion_club", "music_jam_session", "writing_workshop", "bowling_group", "karaoke_group"],
  },
  {
    groupNameKey: "groups.community_exchange",
    keys: ["cultural_exchange", "volunteer_activities", "hobby_exchange", "book_swap_club", "plant_exchange"],
  },
  {
    groupNameKey: "groups.relaxation_fun",
    keys: ["relaxation", "study_cafe", "board_game_cafe", "gaming_group", "playlist_exchange"],
  },
  {
    groupNameKey: "groups.travel_exploration",
    keys: ["hidden_spots_tour", "local_tours", "spontaneous_travel"],
  },
  {
    groupNameKey: "groups.special_interest",
    keys: ["unusual_food_challenge", "sports_viewing", "bucket_list", "horror_movie_group"],
  },
];

const MySubjectOrderChangeOverlay: React.FC<MySubjectOrderChangeOverlayProps> = ({
  visible,
  onClose,
  myTopics,
  setMyTopics,
}) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();

  // Animation states for slide and fade
  const [slide, setSlide] = useState<number>(visible ? 0 : 200);
  const [fade, setFade] = useState<number>(visible ? 1 : 0);
  // For each topic, manage animation values for position (itemAnim) and scale (scaleAnim)
  const [itemAnimValues, setItemAnimValues] = useState<number[]>(allTopics.map(() => -200));
  const [scaleValues, setScaleValues] = useState<number[]>(allTopics.map(() => 1));
  const [isGroupedView, setIsGroupedView] = useState<boolean>(false);
  const isFirstRender = useRef(true);

  // Animate overlay open/close based on "visible"
  useEffect(() => {
    if (visible) {
      // Opening: slide to 0 and fade to 1; animate each item from -200 to 0 staggered.
      setSlide(0);
      setFade(1);
      allTopics.forEach((_, index) => {
        setTimeout(() => {
          setItemAnimValues((prev) => {
            const newValues = [...prev];
            newValues[index] = 0;
            return newValues;
          });
        }, index * 100);
      });
    } else {
      // Closing: slide to 200 and fade to 0; animate each item from 0 to -200.
      setSlide(200);
      setFade(0);
      allTopics.forEach((_, index) => {
        setTimeout(() => {
          setItemAnimValues((prev) => {
            const newValues = [...prev];
            newValues[index] = -200;
            return newValues;
          });
        }, index * 100);
      });
      setTimeout(() => {
        onClose();
      }, 300);
    }
  }, [visible, onClose]);

  // When isGroupedView changes, animate items back to 0.
  useEffect(() => {
    if (!isFirstRender.current) {
      allTopics.forEach((_, index) => {
        setTimeout(() => {
          setItemAnimValues((prev) => {
            const newValues = [...prev];
            newValues[index] = 0;
            return newValues;
          });
          setScaleValues((prev) => {
            const newValues = [...prev];
            newValues[index] = 1;
            return newValues;
          });
        }, 150);
      });
    } else {
      isFirstRender.current = false;
    }
  }, [isGroupedView]);

  const saveTopics = async (topics: Topic[]) => {
    try {
      localStorage.setItem("myTopics", JSON.stringify(topics));
    } catch (e) {
      console.error("Failed to save topics:", e);
    }
  };

  const handleTopicSelect = (topicKey: string, index: number) => {
    let updatedTopics: Topic[] | undefined;
    if (myTopics.some((topic) => topic.key === topicKey)) {
      // Deselect: animate scale to 0.98 then back to 1.
      setScaleValues((prev) => {
        const newValues = [...prev];
        newValues[index] = 0.98;
        return newValues;
      });
      setTimeout(() => {
        setScaleValues((prev) => {
          const newValues = [...prev];
          newValues[index] = 1;
          return newValues;
        });
      }, 150);
      updatedTopics = myTopics.filter((topic) => topic.key !== topicKey);
    } else {
      // Select: animate scale to 0.95 then back to 1.
      setScaleValues((prev) => {
        const newValues = [...prev];
        newValues[index] = 0.95;
        return newValues;
      });
      setTimeout(() => {
        setScaleValues((prev) => {
          const newValues = [...prev];
          newValues[index] = 1;
          return newValues;
        });
      }, 150);
      const selectedTopic = allTopics.find((topic) => topic.key === topicKey);
      if (selectedTopic) {
        updatedTopics = [...myTopics, selectedTopic];
      }
    }
    if (updatedTopics) {
      setMyTopics(updatedTopics);
      saveTopics(updatedTopics);
    }
  };

  // Group topics into rows of 4 items each.
  const topicRows = [];
  for (let i = 0; i < allTopics.length; i += 4) {
    topicRows.push(allTopics.slice(i, i + 4));
  }

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.overlayBackground} />
      <div
        className={styles.overlayContainer}
        style={{ transform: `translateY(${slide}px)`, opacity: fade }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h2 className={styles.headerTitle}>{t("change_topic_order")}</h2>
            <button className={styles.toggleViewButton} onClick={() => setIsGroupedView((prev) => !prev)}>
              <span className={styles.toggleViewButtonText}>
                {isGroupedView ? t("toggle_ungroup_view") : t("toggle_group_view")}
              </span>
            </button>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <img src="/assets/delete-icon-big.png" alt="Close" className={styles.deleteIcon} />
          </button>
        </div>

        {/* Scrollable Topics */}
        <div className={styles.scrollContent}>
          {isGroupedView ? (
            topicRows.map((row, rowIndex) => (
              <div key={rowIndex} className={styles.groupContainer}>
                {row.map((topic) => {
                  const isSelected = myTopics.some((selected) => selected.key === topic.key);
                  const index = allTopics.findIndex((item) => item.key === topic.key);
                  return (
                    <div
                      key={topic.key}
                      className={styles.topicItem}
                      style={{ transform: `scale(${scaleValues[index]})`, margin: "4px 0" }}
                    >
                      <button className={styles.topicButton} onClick={() => handleTopicSelect(topic.key, index)}>
                        <span className={styles.topicText}>{t(`topics.${topic.key}`)}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          ) : (
            allTopics.map((topic, index) => (
              <div
                key={topic.key}
                className={styles.topicButtonWrapper}
                style={{
                  transform: `translateX(${itemAnimValues[index]}px) scale(${scaleValues[index]})`,
                }}
              >
                <button className={styles.topicButton} onClick={() => handleTopicSelect(topic.key, index)}>
                  <span className={styles.topicText}>{t(`topics.${topic.key}`)}</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MySubjectOrderChangeOverlay;
