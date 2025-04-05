"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import { countries } from "../constants/countries";
import styles from "../styles/components/BuddyProfileWithFlag.module.css";

type BuddyProfileWithFlagProps = {
  buddyGroupId: string;
  buddyPhoto?: string;
  buddyPhotoMedium?: string;
  buddyPhotoThumbnail?: string;
  activityCountry: string;
  size: number;
};

const BuddyProfileWithFlag: React.FC<BuddyProfileWithFlagProps> = ({
  buddyGroupId,
  buddyPhoto,
  buddyPhotoMedium,
  buddyPhotoThumbnail,
  activityCountry,
  size,
}) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();

  // 해당 국가의 국기 이미지 (countries 배열에 flag 속성은 이미지 경로(예: "/assets/flag.png")로 정의되어 있다고 가정)
  const countryFlag = countries.find(
    (country) => country.name === activityCountry
  )?.flag;

  // 보여줄 프로필 이미지 결정 (빈 값이면 기본 이미지 사용)
  const resolvedImage = buddyPhotoThumbnail || buddyPhotoMedium || buddyPhoto;
  const defaultImage = "/assets/buddyDefault.png";

  // BuddyInfo 페이지로 이동
  const handlePress = () => {
    router.push(`/buddyInfo?buddyGroupId=${buddyGroupId}`);
  };

  return (
    <div
      onClick={handlePress}
      className={styles.container}
      style={{ width: size, height: size }}
    >
      <img
        src={resolvedImage ? resolvedImage : defaultImage}
        alt="Profile"
        className={styles.profileImage}
        style={{ width: size, height: size, borderRadius: size / 2 }}
      />

      {countryFlag && (
        <div
          className={styles.flagWrapper}
          style={{
            width: size / 3 + 4,
            height: size / 3 + 4,
            borderRadius: size / 6 + 2,
          }}
        >
          <img
            src={countryFlag}
            alt="Flag"
            className={styles.flagImage}
            style={{
              width: size / 3,
              height: size / 3,
              borderRadius: size / 6,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BuddyProfileWithFlag;
