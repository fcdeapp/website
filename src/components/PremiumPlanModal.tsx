"use client";

import React from "react";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import styles from "../styles/components/PremiumPlanModal.module.css";

interface PremiumPlanModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}

const PremiumPlanModal: React.FC<PremiumPlanModalProps> = ({ isVisible, onClose, onSubscribe }) => {
  const { t } = useTranslation();
  const { SERVER_URL } = useConfig();

  if (!isVisible) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
        <img src="/assets/premium_icon.png" alt="Premium Icon" className={styles.icon} />
        <h2 className={styles.title}>{t("premium.title")}</h2>
        <p className={styles.description}>{t("premium.description")}</p>
        <div className={styles.featureList}>
          <p className={styles.featureItem}>{t("premium.feature1")}</p>
          <p className={styles.featureItem}>{t("premium.feature2")}</p>
          <p className={styles.featureItem}>{t("premium.feature3")}</p>
          <p className={styles.featureItem}>{t("premium.feature4")}</p>
        </div>
        <div className={styles.gradientButtonContainer}>
          <button className={styles.subscribeButton} onClick={onSubscribe}>
            <span className={styles.subscribeButtonText}>{t("premium.subscribeButton")}</span>
          </button>
        </div>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            <span className={styles.closeButtonText}>{t("premium.closeButton")}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default PremiumPlanModal;
