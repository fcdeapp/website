"use client";

import React, { useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import BuddyProfileWithFlag from "../components/BuddyProfileWithFlag";
import ProfileWithFlag from "../components/ProfileWithFlag";
import styles from "../styles/components/BuddySearchItem.module.css";

interface Member {
  userId: string;
  profileImage: string;
  nickname: string;
}

interface BuddySearchItemProps {
  buddyPhoto?: string;
  buddyPhotoMedium?: string;
  buddyPhotoThumbnail?: string;
  buddyGroupName: string;
  activityCountry?: string;
  description?: string;
  members?: Member[];
  userId: string; // 현재 로그인한 사용자의 ID
  buddyGroupId: string; // 버디 그룹의 ID
}

const BuddySearchItem: React.FC<BuddySearchItemProps> = ({
  buddyPhoto,
  buddyPhotoMedium,
  buddyPhotoThumbnail,
  buddyGroupName,
  activityCountry,
  description,
  members,
  userId,
  buddyGroupId,
}) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();
  const [isRemoveMode, setIsRemoveMode] = useState(false);

  // 현재 사용자가 이 그룹의 멤버인지 확인
  const isUserAMember = members?.some((member) => member.userId === userId);

  const handleButtonPress = () => {
    if (isRemoveMode) {
      handleRemoveBuddy(buddyGroupId);
    } else if (isUserAMember) {
      // 이미 멤버인 경우, BuddyPage로 이동
      router.push(`/buddy?buddyGroupId=${buddyGroupId}`);
    } else {
      // 멤버가 아닌 경우, 가입 요청 전송
      sendJoinRequest(buddyGroupId);
    }
  };

  const handleRemoveBuddy = async (buddyGroupId: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await axios.post(
        `${SERVER_URL}/buddy-groups/remove`,
        { buddyGroupId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        alert(t("buddySearch.removeBuddySuccess"));
      } else {
        alert(t("buddySearch.removeBuddyError"));
      }
    } catch (error) {
      console.error("Error removing buddy group:", error);
      alert(t("buddySearch.removeBuddyError"));
    }
  };

  const sendJoinRequest = async (buddyGroupId: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await axios.post(
        `${SERVER_URL}/buddy-groups/join-request`,
        { buddyGroupId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        alert(t("buddySearch.joinRequestSuccess"));
      } else {
        alert(t("buddySearch.joinRequestError"));
      }
    } catch (error) {
      console.error("Error sending join request:", error);
      alert(t("buddySearch.joinRequestError"));
    }
  };

  // onContextMenu를 이용하여 long press 효과를 구현 (마우스 오른쪽 클릭 시 실행)
  const handleLongPress = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsRemoveMode((prev) => !prev);
  };

  return (
    <div className={styles.buddySearchItem}>
      {/* Buddy Group 정보 */}
      <div className={styles.buddyInfoContainer}>
        <BuddyProfileWithFlag
          buddyGroupId={buddyGroupId}
          buddyPhoto={buddyPhoto}
          buddyPhotoMedium={buddyPhotoMedium}
          buddyPhotoThumbnail={buddyPhotoThumbnail}
          activityCountry={activityCountry || ""}
          size={60}
        />
        <div className={styles.buddyInfoTextContainer}>
          <p className={styles.buddyGroupName}>{buddyGroupName}</p>
          <p className={styles.buddyGroupDescription}>
            {description ? description : t("buddySearch.descriptionDefault")}
          </p>
          <p className={styles.memberCountText}>
            {t("buddySearch.memberCount", { count: members?.length || 0 })}
          </p>
        </div>
      </div>

      {/* 멤버 프로필 목록 (가로 스크롤) */}
      <div className={styles.memberListContainer}>
        {members?.map((member) => (
          <div key={member.userId} className={styles.memberProfileContainer}>
            <ProfileWithFlag
              userId={member.userId}
              nickname={member.nickname}
              profileImage={member.profileImage}
              size={40}
            />
            <p className={styles.memberNickname}>{member.nickname}</p>
          </div>
        ))}
      </div>

      {/* 조건부 버튼 */}
      <button
        className={
          isRemoveMode
            ? styles.removeBuddyButton
            : isUserAMember
            ? styles.buddyPageButton
            : styles.joinRequestButton
        }
        onClick={handleButtonPress}
        onContextMenu={handleLongPress}
      >
        {isRemoveMode
          ? t("buddySearch.removeBuddy")
          : isUserAMember
          ? t("buddySearch.navigateToBuddy")
          : t("buddySearch.joinRequest")}
      </button>
    </div>
  );
};

export default BuddySearchItem;

// 사용된 useConfig 훅은 아래와 같이 가정합니다.
function useConfig() {
  return { SERVER_URL: process.env.NEXT_PUBLIC_SERVER_URL || "" };
}
