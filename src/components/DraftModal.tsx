"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/DraftModal.module.css";

export interface DraftData {
  timestamp: number;
  title: string;
  content: string;
  selectedTopic: string;
  recruitmentCount: string;
  meetingPlace: string;
  meetingCity: string;
  meetingCountry: string;
  commentsOption: string;
  selectedImageUri: string | null;
}

interface DraftModalProps {
  visible: boolean;
  draft: DraftData;
  onRestore: (draft: DraftData) => void;
  onDelete: () => void;
  onClose: () => void;
}

const renderField = (label: string, value?: string, multiline = false) => (
  <div className={styles.fieldRow}>
    <span className={styles.fieldLabel}>{label}</span>
    <span className={`${styles.fieldValue} ${multiline ? styles.multiline : ""}`}>
      {value?.trim() || "-"}
    </span>
  </div>
);

const DraftModal: React.FC<DraftModalProps> = ({
  visible,
  draft,
  onRestore,
  onDelete,
  onClose,
}) => {
  const { t } = useTranslation();
  const formattedTime = new Date(draft.timestamp).toLocaleString();

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.card}>
        <h2 className={styles.title}>{t("draft_modal.title")}</h2>
        <p className={styles.timestamp}>{formattedTime}</p>

        {renderField(t("form_texts.title"), draft.title)}
        {renderField(
          t("form_texts.subject"),
          draft.selectedTopic !== "no_topic"
            ? t(`topics.${draft.selectedTopic}`)
            : t("no_topic")
        )}
        {renderField(t("form_texts.meeting_place"), draft.meetingPlace)}
        {renderField(t("form_texts.recruitment_count"), draft.recruitmentCount)}
        {renderField(t("form_texts.content"), draft.content, true)}

        <div className={styles.buttonContainer}>
          <button
            className={`${styles.actionButton} ${styles.restore}`}
            onClick={() => onRestore(draft)}
          >
            {t("draft_modal.restore")}
          </button>
          <button
            className={`${styles.actionButton} ${styles.delete}`}
            onClick={onDelete}
          >
            {t("draft_modal.delete")}
          </button>
        </div>

        <button className={styles.closeButton} onClick={onClose}>
          {t("close")}
        </button>
      </div>
    </div>
  );
};

export default DraftModal;
