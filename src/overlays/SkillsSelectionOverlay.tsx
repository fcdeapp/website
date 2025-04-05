"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import styles from "../styles/overlays/SkillsSelectionOverlay.module.css";
import { defaultSkills } from "../constants/defaultSkills";

export interface Skill {
  key: string;
  color: string;
}

interface SkillsSelectionOverlayProps {
  visible: boolean;
  onClose: () => void;
  selectedSkills: Skill[];
  setSelectedSkills: (skills: Skill[]) => void;
}

const SkillsSelectionOverlay: React.FC<SkillsSelectionOverlayProps> = ({
  visible,
  onClose,
  selectedSkills,
  setSelectedSkills,
}) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();

  // Maintain a local list of skills (default skills + any custom ones)
  const [allSkillsList, setAllSkillsList] = useState<Skill[]>([...defaultSkills]);
  const [customSkill, setCustomSkill] = useState("");

  // On modal open, merge any selected skills into the allSkillsList if missing.
  useEffect(() => {
    if (visible) {
      const mergedList = [...allSkillsList];
      selectedSkills.forEach((sel) => {
        const exists = mergedList.some(
          (item) => item.key.toLowerCase() === sel.key.toLowerCase()
        );
        if (!exists) {
          mergedList.push(sel);
        }
      });
      setAllSkillsList(mergedList);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, selectedSkills]);

  // Save selected skills to localStorage
  const saveSkills = async (skills: Skill[]) => {
    try {
      localStorage.setItem("skills", JSON.stringify(skills));
    } catch (e) {
      console.error("Failed to save skills:", e);
    }
  };

  // Toggle selection for a given skill
  const handleSkillSelect = (skill: Skill) => {
    let updatedSkills: Skill[];
    if (
      selectedSkills.some(
        (selected) => selected.key.toLowerCase() === skill.key.toLowerCase()
      )
    ) {
      updatedSkills = selectedSkills.filter(
        (selected) => selected.key.toLowerCase() !== skill.key.toLowerCase()
      );
    } else {
      updatedSkills = [...selectedSkills, skill];
    }
    setSelectedSkills(updatedSkills);
    saveSkills(updatedSkills);
  };

  // Add a custom skill and automatically select it
  const handleAddCustomSkill = () => {
    if (!customSkill.trim()) return;
    const skillKey = customSkill.trim().toLowerCase();
    const duplicate = allSkillsList.find(
      (s) => s.key.toLowerCase() === skillKey
    );
    if (duplicate) {
      handleSkillSelect(duplicate);
    } else {
      const newSkill: Skill = { key: customSkill.trim(), color: "#0A1045" };
      const updatedAllSkills = [...allSkillsList, newSkill];
      setAllSkillsList(updatedAllSkills);
      handleSkillSelect(newSkill);
    }
    setCustomSkill("");
  };

  if (!visible) return null;

  return (
    <div className={styles.modal} onClick={onClose}>
      <div
        className={styles.overlayContainer}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 className={styles.headerTitle}>{t("select_skills")}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <img
              src="/assets/delete-icon-big.png"
              alt="Close"
              className={styles.deleteIcon}
            />
          </button>
        </div>
        <div className={styles.scrollContent}>
          <div className={styles.skillSection}>
            {allSkillsList.map((skill, index) => {
              const isSelected = selectedSkills.some(
                (selected) =>
                  selected.key.toLowerCase() === skill.key.toLowerCase()
              );
              return (
                <button
                  key={index}
                  className={styles.skillButton}
                  style={{
                    borderColor: isSelected ? skill.color : "#d9d9d9",
                  }}
                  onClick={() => handleSkillSelect(skill)}
                >
                  <span
                    className={styles.skillText}
                    style={{
                      color: isSelected ? skill.color : "#999",
                    }}
                  >
                    {t(`skills.${skill.key}`, { defaultValue: skill.key })}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div className={styles.addCustomSkillContainer}>
          <input
            className={styles.customSkillInput}
            placeholder={t("add_custom_skill") || "Enter custom skill"}
            value={customSkill}
            onChange={(e) => setCustomSkill(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCustomSkill();
            }}
          />
          <button className={styles.addButton} onClick={handleAddCustomSkill}>
            <span className={styles.addButtonText}>{t("add")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillsSelectionOverlay;
