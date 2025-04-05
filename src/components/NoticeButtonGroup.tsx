"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/NoticeButtonGroup.module.css";

interface NoticeButtonGroupProps {
  onMapPress: () => void;
  showFriendButton?: boolean;
  showSearchButton?: boolean;
}

const NoticeButtonGroup: React.FC<NoticeButtonGroupProps> = ({
  onMapPress,
  showFriendButton = true,
  showSearchButton = true,
}) => {
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <button className={styles.verticalButton} onClick={onMapPress}>
        <img
          src="/assets/mapComponent.png"
          alt="Map Component"
          className={styles.mapImage}
        />
        <div className={styles.horizontalButton}>
          <img
            src="/assets/map-icon.png"
            alt="Map Icon"
            className={styles.icon}
          />
          <span className={styles.label}>{t("view_map")}</span>
        </div>
      </button>

      {showFriendButton && (
        <button
          className={styles.button}
          onClick={() => router.push("/friendlist")}
        >
          <img
            src="/assets/participants-icon.png"
            alt="Participants Icon"
            className={styles.icon}
          />
          <span className={styles.label}>{t("view_friends")}</span>
        </button>
      )}

      {showSearchButton && (
        <button
          className={styles.button}
          onClick={() => router.push("/search?searchTerm=")}
        >
          <img
            src="/assets/translate-icon.png"
            alt="Translate Icon"
            className={styles.icon}
          />
          <span className={styles.label}>{t("view_search")}</span>
        </button>
      )}
    </div>
  );
};

export default NoticeButtonGroup;
