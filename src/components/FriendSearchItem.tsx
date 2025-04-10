"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useConfig } from "../context/ConfigContext";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import ProfileWithFlag from "./ProfileWithFlag";
import styles from "../styles/components/FriendSearchItem.module.css";
import countryFlags from "../constants/countryFlags";
import languageFlags from "../constants/languageFlags";

export interface Friend {
  userId: string;
  profileImage?: string;
  profileThumbnail?: string;
  nickname: string;
  originCountry?: string;
  mainLanguage?: string;
  currentCountry?: string;
  currentCity?: string;
  learningLanguage?: string[];
  hobbies?: string[];
  skills?: string[];
  description?: string;
  locationMapImage?: string;
  isDeactivated?: boolean;
}

export interface FriendSearchItemProps {
  friend: Friend;
  userId: string; // 현재 로그인한 사용자의 ID
  isFriend: boolean;
  hasSentRequest: boolean;
  hasReceivedRequest: boolean;
  buddyGroupId?: string;
}

const defaultInfoImage = "/assets/buddyDefault.png";

const FriendSearchItem: React.FC<FriendSearchItemProps> = ({
  friend,
  userId,
  isFriend,
  hasSentRequest,
  hasReceivedRequest,
  buddyGroupId,
}) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();

  const [isAdmin, setIsAdmin] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [memberDetails, setMemberDetails] = useState<Partial<Friend>>({});
  const [showMapImage, setShowMapImage] = useState(false);
  const [isDeactivated, setIsDeactivated] = useState(friend.isDeactivated || false);

  // AsyncStorage 대신 localStorage를 사용
  const getAuthHeader = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return { Authorization: `Bearer ${token}` };
  };

  // 멤버 상세 정보 가져오기 (API 엔드포인트에 맞게 조정)
  const fetchMemberDetails = async (memberId: string) => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.get(`${SERVER_URL}/users/members/${memberId}`, { headers });
      if (response.data) {
        setMemberDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching member details:", error);
    }
  };

  const toggleExpansion = () => {
    setIsExpanded((prev) => !prev);
    if (!isExpanded) {
      fetchMemberDetails(friend.userId);
    }
  };

  // onContextMenu 이벤트를 사용해 long press 효과 시뮬레이션
  const handleLongPress = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLongPressed((prev) => !prev);
  };

  // 채팅 시작 (예시)
  const handleChat = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.post(
        `${SERVER_URL}/chats/one-on-one`,
        { friendId: friend.userId },
        { headers }
      );
      if (response.data && response.data.chatRoomId) {
        router.push(
          `/chat?chatRoomId=${response.data.chatRoomId}&otherUserId=${friend.userId}&nickname=${friend.nickname}`
        );
      } else {
        alert("Failed to retrieve or create a chat room.");
      }
    } catch (error: any) {
      console.error("Error handling chat:", error);
      alert("An error occurred while trying to open the chat.");
    }
  };

  // 친구 요청 보내기 (예시)
  const handleSendFriendRequest = async () => {
    if (!userId || !friend.userId) {
      alert("User information is missing.");
      return;
    }
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
      const response = await axios.post(
        `${SERVER_URL}/friend/friend-request`,
        { senderId: userId, receiverId: friend.userId },
        { headers }
      );
      if (response.status === 200) {
        alert(t("friendSearch.friendRequestSuccess"));
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert(t("friendSearch.friendRequestError"));
    }
  };

  return (
    <div className={styles.friendItem} onContextMenu={handleLongPress}>
      <div onClick={toggleExpansion} className={styles.rowContainer}>
        <ProfileWithFlag
          userId={friend.userId}
          nickname={friend.nickname}
          profileImage={friend.profileImage || undefined}
          profileThumbnail={friend.profileThumbnail || undefined}
          countryName={friend.originCountry || undefined}
          size={50}
        />
        <span className={styles.nickname}>
          {friend.nickname || memberDetails.nickname}
        </span>
      </div>
      {isExpanded && (
        <div className={styles.expandedContent}>
          <div className={styles.infoGrid}>
            <div className={styles.infoBlock}>
              <span className={styles.sectionTitle}>{t("origin_country")}</span>
              <div className={styles.infoRow}>
                <img
                  src={(countryFlags as Record<string, string>)[memberDetails.originCountry || ""] || defaultInfoImage}
                  alt={memberDetails.originCountry || t("unknown")}
                  className={styles.flagIcon}
                />
                <span className={styles.infoText}>
                  {memberDetails.originCountry || t("unknown")}
                </span>
              </div>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.sectionTitle}>{t("main_language")}</span>
              <div className={styles.infoRow}>
                <img
                  src={(languageFlags as Record<string, string>)[memberDetails.mainLanguage || ""] || defaultInfoImage}
                  alt={memberDetails.mainLanguage || t("unknown")}
                  className={styles.flagIcon}
                />
                <span className={styles.infoText}>
                  {memberDetails.mainLanguage || t("unknown")}
                </span>
              </div>
            </div>
          </div>
          <div className={styles.buttonRow}>
            {isFriend ? (
              isLongPressed ? (
                <button className={styles.button} onClick={() => alert(t("friendSearch.removeFriend"))}>
                  {t("friendSearch.removeFriend")}
                </button>
              ) : (
                <button className={styles.button} onClick={handleChat}>
                  {t("friendSearch.chat")}
                </button>
              )
            ) : hasReceivedRequest ? (
              <button className={styles.button} onClick={() => alert(t("friendSearch.acceptFriendRequest"))}>
                {t("friendSearch.acceptFriendRequest")}
              </button>
            ) : hasSentRequest ? (
              <div>
                <span className={styles.pendingRequestText}>{t("friendSearch.pendingFriendRequest")}</span>
                <button className={styles.button} onClick={() => alert(t("friendSearch.cancelFriendRequest"))}>
                  {t("friendSearch.cancelFriendRequest")}
                </button>
              </div>
            ) : (
              <button className={styles.button} onClick={handleSendFriendRequest}>
                {t("friendSearch.sendFriendRequest")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FriendSearchItem;
