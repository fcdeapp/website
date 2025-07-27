"use client";

import React, { useEffect, useState, MouseEvent } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

import styles from "../styles/components/CustomScenarioModal.module.css";

export interface Persona {
  name?: string;
  personality?: string;
  speakingStyle?: string;
  catchPhrase?: string;
}

interface Props {
  visible: boolean;
  imageUri: string;
  scenarioText: string;
  persona?: Persona;
  onClose: () => void;
  onLeave: () => void;
  onShare: () => Promise<void>;
  chatId: string;
}

const CustomScenarioModal: React.FC<Props> = ({
  visible,
  imageUri,
  scenarioText,
  persona,
  onClose,
  onLeave,
  onShare,
  chatId,
}) => {
  const { t } = useTranslation();

  /* ------------------------------------------------------------------ */
  /* early‑exit                                                          */
  /* ------------------------------------------------------------------ */
  if (!visible) return null;

  /* ------------------------------------------------------------------ */
  /* state                                                               */
  /* ------------------------------------------------------------------ */
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [hasShared, setHasShared] = useState(false);

  useEffect(() => {
    const flag = localStorage.getItem(`shared_chat_${chatId}`) === "true";
    setHasShared(flag);
  }, [chatId]);

  /* ------------------------------------------------------------------ */
  /* handlers                                                            */
  /* ------------------------------------------------------------------ */
  const handleLeave = async () => {
    if (isLeaving) return;
    setIsLeaving(true);
    try {
      await onLeave();
    } finally {
      setIsLeaving(false);
    }
  };

  const handleShare = async () => {
    if (isSharing || hasShared) return;
    setIsSharing(true);
    try {
      await onShare();
      localStorage.setItem(`shared_chat_${chatId}`, "true");
      setHasShared(true);
    } catch (err) {
      /* eslint-disable-next-line no-console */
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  /* ------------------------------------------------------------------ */
  /* portal root                                                         */
  /* ------------------------------------------------------------------ */
  const portalRoot =
    typeof document !== "undefined"
      ? (document.getElementById("__next") as HTMLElement)
      : undefined;
  if (!portalRoot) return null;

  /* ------------------------------------------------------------------ */
  /* click‑outside – stop propagation when clicking inside the card      */
  /* ------------------------------------------------------------------ */
  const stop = (e: MouseEvent) => e.stopPropagation();

  /* ------------------------------------------------------------------ */
  /* render                                                              */
  /* ------------------------------------------------------------------ */
  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.card} onClick={stop}>
        {/* background image */}
        <div
          className={styles.image}
          style={{ backgroundImage: `url(${imageUri})` }}
        >
          <div className={styles.gradient} />

          <div className={styles.textWrap}>
            <h3 className={styles.title}>{t("scenario")}</h3>
            <p className={styles.scenario}>{scenarioText}</p>

            {persona && (
              <div className={styles.personaBox}>
                {persona.personality && (
                  <p className={styles.personaTrait}>{persona.personality}</p>
                )}
                {persona.speakingStyle && (
                  <p className={styles.personaTrait}>{persona.speakingStyle}</p>
                )}
                {persona.catchPhrase && (
                  <p className={styles.personaCatch}>{persona.catchPhrase}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* buttons */}
        <div className={styles.btnRow}>
          <button
            className={classNames(styles.btnLeave, {
              [styles.disabled]: isLeaving,
            })}
            onClick={handleLeave}
            disabled={isLeaving}
          >
            {t("leave_custom_session")}
          </button>

          {hasShared ? (
            <button className={classNames(styles.btn, styles.disabled)} disabled>
              {t("shared_label")}
            </button>
          ) : (
            <button
              className={classNames(styles.btn, {
                [styles.disabled]: isSharing,
              })}
              onClick={handleShare}
              disabled={isSharing}
            >
              {t("share")}
            </button>
          )}
        </div>
      </div>
    </div>,
    portalRoot
  );
};

export default CustomScenarioModal;
