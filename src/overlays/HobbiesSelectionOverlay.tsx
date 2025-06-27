"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import styles from "../styles/overlays/HobbiesSelectionOverlay.module.css";
import { defaultHobbies } from "../constants/defaultHobbies";

export interface Hobby {
  key: string;
  color: string;
}

interface HobbiesSelectionOverlayProps {
  visible: boolean;
  onClose: () => void;
  selectedHobbies: Hobby[];
  setSelectedHobbies: (hobbies: Hobby[]) => void;
}

const HobbiesSelectionOverlay: React.FC<HobbiesSelectionOverlayProps> = ({
  visible,
  onClose,
  selectedHobbies,
  setSelectedHobbies,
}) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();

  // Local state for all hobbies list and custom hobby input
  const [allHobbiesList, setAllHobbiesList] = useState<Hobby[]>([...defaultHobbies]);
  const [customHobby, setCustomHobby] = useState("");

  useEffect(() => {
    // Additional local logic can be added here if needed
  }, []);

  if (!visible) return null;

  const saveHobbies = async (hobbies: Hobby[]) => {
    try {
      localStorage.setItem("hobbies", JSON.stringify(hobbies));
    } catch (e) {
      console.error("Failed to save hobbies:", e);
    }
  };

  const handleHobbySelect = (hobby: Hobby) => {
    let updatedHobbies: Hobby[];
    if (selectedHobbies.some((selected) => selected.key === hobby.key)) {
      // If the hobby is already selected, remove it.
      updatedHobbies = selectedHobbies.filter((selected) => selected.key !== hobby.key);
    } else {
      // Otherwise, add it.
      updatedHobbies = [...selectedHobbies, hobby];
    }
    setSelectedHobbies(updatedHobbies);
    saveHobbies(updatedHobbies);
  };

  const handleAddCustomHobby = () => {
    if (!customHobby.trim()) return;
    const hobbyKey = customHobby.trim().toLowerCase();
    const duplicateHobby = allHobbiesList.find((h) => h.key.toLowerCase() === hobbyKey);
    if (duplicateHobby) {
      // If the hobby already exists, simply toggle selection.
      handleHobbySelect(duplicateHobby);
    } else {
      const newHobby: Hobby = { key: customHobby.trim(), color: "#120C3A" };
      const updatedAllHobbies = [...allHobbiesList, newHobby];
      setAllHobbiesList(updatedAllHobbies);
      handleHobbySelect(newHobby);
    }
    setCustomHobby("");
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.overlayContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>{t("select_hobbies")}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <img src="/assets/delete-icon-big.png" alt="Close" className={styles.deleteIcon} />
          </button>
        </div>

        <div className={styles.scrollContent}>
          <div className={styles.hobbySection}>
            {allHobbiesList.map((hobby, index) => {
              const isSelected = selectedHobbies.some(
                (selected) => selected.key === hobby.key
              );
              return (
                <button
                  key={index}
                  className={styles.hobbyButton}
                  style={{
                    borderColor: isSelected ? hobby.color : "#d9d9d9",
                  }}
                  onClick={() => handleHobbySelect(hobby)}
                >
                  <span
                    className={styles.hobbyText}
                    style={{ color: isSelected ? hobby.color : "#999" }}
                  >
                    {t(`hobbies.${hobby.key}`, { defaultValue: hobby.key })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.addCustomHobbyContainer}>
          <input
            className={styles.customHobbyInput}
            placeholder={t("add_custom_hobby") || "Enter custom hobby"}
            value={customHobby}
            onChange={(e) => setCustomHobby(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCustomHobby();
            }}
          />
          <button className={styles.addButton} onClick={handleAddCustomHobby}>
            <span className={styles.addButtonText}>{t("add")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HobbiesSelectionOverlay;
