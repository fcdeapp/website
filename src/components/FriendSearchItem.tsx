"use client";

import React, { useState, useEffect } from "react";
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
  userId: string;
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
  const [showDeactivateForm, setShowDeactivateForm] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState("");
  const [deactivationDuration, setDeactivationDuration] = useState<number | null>(null);

  const getAuthHeader = async () => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    return { Authorization: `Bearer ${token}` };
  };

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

  const handleToggleMapImage = () => {
    setShowMapImage((prev) => !prev);
  };

  const handleLongPress = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsLongPressed((prev) => !prev);
  };

  // 채팅 시작
  const handleChat = async () => {
    try {
      const headers = await getAuthHeader();
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

  // 친구 요청 보내기
  const handleSendFriendRequest = async () => {
    if (!userId || !friend.userId) {
      alert("User information is missing.");
      return;
    }
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(
        `${SERVER_URL}/friend/friend-request`,
        { senderId: userId, receiverId: friend.userId },
        { headers: { "Content-Type": "application/json", ...headers } }
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

  const handleCancelFriendRequest = async () => {
    if (!userId || !friend.userId) {
      alert("User information is missing.");
      return;
    }
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(
        `${SERVER_URL}/friend/friend-request/cancel`,
        { senderId: userId, receiverId: friend.userId },
        { headers: { "Content-Type": "application/json", ...headers } }
      );
      if (response.status === 200) {
        alert(t("friendSearch.cancelRequestSuccess"));
      } else {
        alert(t("friendSearch.cancelRequestError") + " " + response.data.message);
      }
    } catch (error) {
      console.error("Error cancelling friend request:", error);
      alert(t("friendSearch.cancelRequestError"));
    }
  };

  const handleAcceptRequest = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(
        `${SERVER_URL}/friend/friend-request/accept`,
        { receiverId: userId, senderId: friend.userId, accept: true },
        { headers: { "Content-Type": "application/json", ...headers } }
      );
      if (response.status === 200) {
        alert(t("friendSearch.acceptRequestSuccess"));
      } else {
        alert(t("friendSearch.acceptRequestError") + " " + response.data.message);
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
      alert(t("friendSearch.acceptRequestError"));
    }
  };

  const handleRemoveFriend = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(
        `${SERVER_URL}/friend/remove`,
        { userId: userId, friendId: friend.userId },
        { headers: { "Content-Type": "application/json", ...headers } }
      );
      if (response.status === 200) {
        alert(t("friendSearch.removeFriendSuccess"));
      } else {
        alert("Error: " + response.data.message);
      }
    } catch (error) {
      console.error("Error removing friend:", error);
      alert(t("friendSearch.removeFriendError"));
    }
  };

  const handleAcceptJoinRequest = async () => {
    if (!buddyGroupId) return;
    try {
      const headers = await getAuthHeader();
      await axios.post(
        `${SERVER_URL}/buddy-groups/join-request/accept`,
        { buddyGroupId, userId: friend.userId },
        { headers }
      );
      alert(t("friendSearch.joinAcceptSuccess"));
    } catch (error) {
      console.error("Error accepting join request:", error);
      alert(t("friendSearch.joinAcceptError"));
    }
  };

  const handleRejectJoinRequest = async () => {
    if (!buddyGroupId) return;
    try {
      const headers = await getAuthHeader();
      await axios.post(
        `${SERVER_URL}/buddy-groups/join-request/reject`,
        { buddyGroupId, userId: friend.userId },
        { headers }
      );
      alert(t("friendSearch.joinRejectSuccess"));
    } catch (error) {
      console.error("Error rejecting join request:", error);
      alert(t("friendSearch.joinRejectError"));
    }
  };

  const handleReactivateUser = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(
        `${SERVER_URL}/api/admin/users/reactivate`,
        { userId: friend.userId },
        { headers }
      );
      if (response.status === 200) {
        alert(t("friendSearch.reactivateUser"));
        refreshUserStatus();
      } else {
        alert("Failed to reactivate user account.");
      }
    } catch (error) {
      console.error("Error reactivating user:", error);
      alert("An error occurred while reactivating the account.");
    }
  };

  const handleDeactivateUser = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.post(
        `${SERVER_URL}/api/admin/users/deactivate`,
        { userId: friend.userId, reason: deactivationReason, durationInDays: deactivationDuration },
        { headers }
      );
      if (response.status === 200) {
        alert(t("friendSearch.deactivateUserSuccess"));
        refreshUserStatus();
      } else {
        alert("Failed to deactivate user account.");
      }
      setShowDeactivateForm(false);
    } catch (error) {
      console.error("Error deactivating user:", error);
      alert("An error occurred while deactivating the account.");
    }
  };

  const refreshUserStatus = async () => {
    try {
      const headers = await getAuthHeader();
      const response = await axios.get(`${SERVER_URL}/users/members/${friend.userId}`, { headers });
      if (response.data) {
        setIsDeactivated(response.data.isDeactivated);
        setMemberDetails(response.data);
      }
    } catch (error) {
      console.error("Error refreshing user status:", error);
    }
  };

  useEffect(() => {
    // Check admin status
    const checkAdminStatus = async () => {
      try {
        const headers = await getAuthHeader();
        const response = await axios.get(`${SERVER_URL}/users/me`, { headers });
        if (response.data) {
          setIsAdmin(response.data.isAdmin);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };
    checkAdminStatus();
  }, [SERVER_URL]);

  return (
    <div className={styles.friendItem} onContextMenu={handleLongPress}>
      <div className={styles.rowContainer} onClick={toggleExpansion}>
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
                src={
                    memberDetails.originCountry
                    ? countryFlags[memberDetails.originCountry as keyof typeof countryFlags]
                    : defaultInfoImage
                }
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
                src={
                    memberDetails.mainLanguage
                    ? languageFlags[memberDetails.mainLanguage as keyof typeof languageFlags]
                    : defaultInfoImage
                }
                alt={memberDetails.mainLanguage || t("unknown")}
                className={styles.flagIcon}
                />
                <span className={styles.infoText}>
                  {memberDetails.mainLanguage || t("unknown")}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoBlock}>
              <span className={styles.sectionTitle}>{t("learning_languages")}</span>
              <div className={styles.languageList}>
                {memberDetails.learningLanguage && memberDetails.learningLanguage.length > 0 ? (
                  memberDetails.learningLanguage.map((lang) => (
                    <div key={lang} className={styles.languageItem}>
                    <img
                    src={
                        lang
                        ? languageFlags[lang as keyof typeof languageFlags]
                        : defaultInfoImage
                    }
                    alt={lang}
                    className={styles.flagIcon}
                    />
                      <span className={styles.infoText}>{lang}</span>
                    </div>
                  ))
                ) : (
                  <span className={styles.infoText}>{t("none")}</span>
                )}
              </div>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.sectionTitle} onClick={handleToggleMapImage} style={{ cursor: "pointer" }}>
                {t("current_country")}
              </span>
              <div className={styles.infoRow}>
                <img
                src={
                    memberDetails.currentCountry
                    ? countryFlags[memberDetails.currentCountry as keyof typeof countryFlags]
                    : defaultInfoImage
                }
                alt={memberDetails.currentCountry || t("unknown")}
                className={styles.flagIcon}
                />
                <span className={styles.infoText}>
                  {memberDetails.currentCountry || t("unknown")}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoBlock}>
              <span className={styles.sectionTitle} onClick={handleToggleMapImage} style={{ cursor: "pointer" }}>
                {t("current_city")}
              </span>
              <span className={styles.infoText}>{memberDetails.currentCity || t("unknown")}</span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.sectionTitle}>{t("profile.hobbies")}</span>
              <span className={styles.infoText}>
                {memberDetails.hobbies && memberDetails.hobbies.length > 0
                  ? memberDetails.hobbies.join(", ")
                  : t("profile.info_none")}
              </span>
            </div>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoBlock}>
              <span className={styles.sectionTitle}>{t("profile.skills")}</span>
              <span className={styles.infoText}>
                {memberDetails.skills && memberDetails.skills.length > 0
                  ? memberDetails.skills.join(", ")
                  : t("profile.info_none")}
              </span>
            </div>
            <div className={styles.infoBlock}>
              <span className={styles.sectionTitle}>{t("description")}</span>
              <span className={styles.infoText}>{memberDetails.description || t("none")}</span>
            </div>
          </div>

          {showMapImage && memberDetails.locationMapImage && (
            <div className={styles.mapImageContainer}>
              <img src={memberDetails.locationMapImage} alt="Map" className={styles.mapImage} />
            </div>
          )}

          <div className={styles.buttonRow}>
            {buddyGroupId ? (
              <>
                <button className={styles.button} onClick={handleAcceptJoinRequest}>
                  {t("friendSearch.acceptJoin")}
                </button>
                <button className={styles.button} onClick={handleRejectJoinRequest}>
                  {t("friendSearch.rejectJoin")}
                </button>
              </>
            ) : (
              <>
                {isFriend ? (
                  isLongPressed ? (
                    <button className={styles.button} onClick={handleRemoveFriend}>
                      {t("friendSearch.removeFriend")}
                    </button>
                  ) : (
                    <button className={styles.button} onClick={handleChat}>
                      {t("friendSearch.chat")}
                    </button>
                  )
                ) : hasReceivedRequest ? (
                  <button className={styles.button} onClick={handleAcceptRequest}>
                    {t("friendSearch.acceptFriendRequest")}
                  </button>
                ) : hasSentRequest ? (
                  <div>
                    <span className={styles.pendingRequestText}>{t("friendSearch.pendingFriendRequest")}</span>
                    <button className={styles.button} onClick={handleCancelFriendRequest}>
                      {t("friendSearch.cancelFriendRequest")}
                    </button>
                  </div>
                ) : (
                  <button className={styles.button} onClick={handleSendFriendRequest}>
                    {t("friendSearch.sendFriendRequest")}
                  </button>
                )}
              </>
            )}
          </div>

          {isAdmin && (
            isDeactivated ? (
              <button className={styles.reactivateButton} onClick={handleReactivateUser}>
                {t("friendSearch.reactivateUser")}
              </button>
            ) : (
              <button className={styles.deactivateButton} onClick={() => setShowDeactivateForm(!showDeactivateForm)}>
                {t("friendSearch.deactivateUser")}
              </button>
            )
          )}

          {showDeactivateForm && (
            <div className={styles.formContainer}>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter reason for deactivation"
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
              />
              <select
                className={styles.picker}
                value={deactivationDuration !== null ? deactivationDuration : ""}
                onChange={(e) =>
                  setDeactivationDuration(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Select duration</option>
                <option value={1}>1 Day</option>
                <option value={7}>7 Days</option>
                <option value={30}>30 Days</option>
                <option value="">Permanent</option>
              </select>
              <button className={styles.confirmButton} onClick={handleDeactivateUser}>
                {t("friendSearch.confirmDeactivation")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FriendSearchItem;
