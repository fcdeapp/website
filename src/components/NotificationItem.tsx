"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import { useRouter } from "next/navigation";
import ProfileWithFlag from "./ProfileWithFlag";
import { formatTimeDifference } from "../utils/timeUtils"; // 반드시 올바른 경로로 import
import styles from "../styles/components/NotificationItem.module.css";

export interface Participant {
  profileImage: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  image?: string;
  buddyGroupImage?: string;
  buddyGroupName?: string;
  buddyGroupId?: string;
  meetingDetails?: {
    meetingPlace: string;
    meetingTime: string;
    title: string;
    content: string;
  };
  participantInfo?: Participant[];
  createdAt?: string;
}

export interface NotificationItemProps {
  notification: Notification;
  expanded?: boolean;
  onToggle: () => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();

  const [expanded, setExpanded] = useState(false);
  const [meetingFeedback, setMeetingFeedback] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const formattedTime = moment(notification.createdAt).local().format("YYYY-MM-DD HH:mm");

  const toggleNotification = () => {
    setExpanded(!expanded);
  };

  const hideNotification = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const endpoint = notification.buddyGroupId
        ? `${SERVER_URL}/buddy-notifications/${notification.buddyGroupId}/notifications/${notification._id}/hide`
        : `${SERVER_URL}/api/admin/nl/notifications/${notification._id}/hide`;

      await axios.put(endpoint, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      window.alert(t("notification.hiddenSuccess"));
      // 로컬 캐시 업데이트 (필요 시 구현)
    } catch (error: any) {
      console.error("Error hiding notification:", error);
      window.alert(t("notification.hideError") + ": " + error.message);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!meetingFeedback.trim()) {
      window.alert(t("placeholderFeedback"));
      return;
    }
    setSubmittingFeedback(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("auth_token_missing"));

      const url = `${SERVER_URL}/trust-badge/feedback/${notification._id}`;
      await axios.post(url, { feedback: meetingFeedback }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      window.alert(t("feedbackSuccess"));
      setMeetingFeedback("");
    } catch (error: any) {
      window.alert(t("feedbackError"));
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const navigateToBuddyInfo = () => {
    if (notification.buddyGroupId) {
      router.push(`/buddy?buddyGroupId=${notification.buddyGroupId}`);
    }
  };

  const renderParticipants = () => {
    if (
      !notification.participantInfo ||
      !Array.isArray(notification.participantInfo) ||
      notification.participantInfo.length === 0
    ) {
      return <p className={styles.noParticipantsText}>{t("notification.noParticipants")}</p>;
    }
    return (
      <div className={styles.participantsContainer}>
        {notification.participantInfo.map((participant, index) => (
          <img
            key={index}
            src={participant.profileImage}
            alt="Participant"
            className={styles.participantImage}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={styles.noticeFrame}>
      <button className={styles.noticeRow} onClick={toggleNotification}>
        <button className={styles.buddyInfoButton} onClick={navigateToBuddyInfo}>
          <img
            src={
              notification.buddyGroupImage
                ? notification.buddyGroupImage
                : "/assets/noticeGroupIcon.png"
            }
            alt="Group Icon"
            className={styles.noticeGroupIcon}
          />
        </button>
        <span className={styles.noticeTitle}>
          {notification.title.length > 30 && !expanded
            ? `${notification.title.substring(0, 30)}...`
            : notification.title}
        </span>
      </button>

      {expanded && (
        <div className={styles.noticeFull}>
          {notification.buddyGroupName && (
            <button className={styles.buddyInfoButton} onClick={navigateToBuddyInfo}>
              <span className={styles.buddyGroupName}>{notification.buddyGroupName}</span>
            </button>
          )}
          <p className={styles.noticeDescription}>{notification.message}</p>
          {notification.image && (
            <img src={notification.image} alt="Notification" className={styles.noticeImageExample} />
          )}
          {notification.meetingDetails && (
            <div className={styles.meetingDetails}>
              <p className={styles.meetingDetailTitle}>{notification.meetingDetails.meetingPlace}</p>
              <p className={styles.meetingDetailTitle}>{notification.meetingDetails.meetingTime}</p>
              <p className={styles.meetingDetailTitle}>{notification.meetingDetails.title}</p>
              <p className={styles.meetingDetailContent}>{notification.meetingDetails.content}</p>
            </div>
          )}
          {notification.meetingDetails && renderParticipants()}
          {notification.meetingDetails && (
            <div className={styles.feedbackForm}>
              <textarea
                className={styles.feedbackInput}
                placeholder={t("notification.placeholderFeedback")}
                value={meetingFeedback}
                onChange={(e) => setMeetingFeedback(e.target.value)}
                rows={3}
              />
              <button
                className={styles.feedbackButton}
                onClick={handleFeedbackSubmit}
                disabled={submittingFeedback}
              >
                {t("notification.submitFeedback")}
              </button>
            </div>
          )}
          {notification.createdAt && (
            <span className={styles.timeText}>
              {formatTimeDifference(notification.createdAt, t)}
            </span>          
          )}
          <div className={styles.detailDelete}>
            <button className={styles.deleteButton} onClick={hideNotification}>
              {t("notification.delete")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
