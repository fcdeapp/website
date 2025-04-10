"use client";

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import { useRouter } from "next/navigation";
import ProfileWithFlag from "./ProfileWithFlag";
import styles from "../styles/components/MessageBubble.module.css";
import { formatTimeDifference } from "../utils/timeUtils";

// 유틸 함수: imageUrl이 http/https로 시작하는지 확인
function isImageMessage(imageUrl?: string | null): boolean {
  return Boolean(imageUrl && (imageUrl.startsWith("http") || imageUrl.startsWith("https")));
}

export type MessageType = "buddy" | "regional" | "normal";

export interface MessageBubbleProps {
  content: string;
  nickname?: string;
  isMine: boolean;
  timestamp: string;
  profileImage?: string | null;
  profileThumbnail?: string | null;
  userId?: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  containerStyle?: React.CSSProperties;
  isImageUploading?: boolean;
  messageType?: MessageType;
  _id?: string;
  chatContextId?: string;
  onDelete?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  content,
  nickname,
  isMine,
  timestamp,
  profileImage,
  profileThumbnail,
  userId,
  imageUrl,
  thumbnailUrl,
  containerStyle,
  isImageUploading = false,
  messageType,
  _id,
  chatContextId,
  onDelete,
}) => {
  const { t } = useTranslation();
  const { SERVER_URL } = useConfig();
  const router = useRouter();
  const [isOptionsVisible, setOptionsVisible] = useState(false);
  const [isEditing, setEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isOverlayVisible, setOverlayVisible] = useState(false);

  // 이미지 업로드 시 로딩 상태 처리
  useEffect(() => {
    if (isImageMessage(thumbnailUrl || imageUrl)) {
      setLoading(true);
      setError(false);
    } else {
      setLoading(false);
      setError(false);
    }
  }, [thumbnailUrl, imageUrl]);

  // 메시지 수정 API 호출 (PATCH)
  const handleEditSubmit = async () => {
    if (!chatContextId || !_id || !messageType) return;
    let endpoint = "";
    if (messageType === "normal") {
      endpoint = `${SERVER_URL}/chats/${chatContextId}/message/${_id}`;
    } else if (messageType === "buddy") {
      endpoint = `${SERVER_URL}/buddy-chat/${chatContextId}/message/${_id}`;
    } else if (messageType === "regional") {
      endpoint = `${SERVER_URL}/district-chat/${chatContextId}/message/${_id}`;
    }
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await axios.patch(
        endpoint,
        { message: editedContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setEditing(false);
        // 필요 시 부모에게 수정 결과 알림
      }
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  // 메시지 삭제 API 호출 (DELETE)
  const handleDelete = async () => {
    if (!chatContextId || !_id || !messageType) return;
    let endpoint = "";
    if (messageType === "normal") {
      endpoint = `${SERVER_URL}/chats/${chatContextId}/message/${_id}`;
    } else if (messageType === "buddy") {
      endpoint = `${SERVER_URL}/buddy-chat/${chatContextId}/message/${_id}`;
    } else if (messageType === "regional") {
      endpoint = `${SERVER_URL}/district-chat/${chatContextId}/message/${_id}`;
    }
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 200 && onDelete && _id) {
        onDelete(_id);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  // 메시지 내용 렌더링
  const renderContent = () => {
    if (isEditing) {
      return (
        <input
          className={styles.editTextInput}
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleEditSubmit();
            }
          }}
          autoFocus
        />
      );
    }

    if (isImageUploading) {
      return (
        <div className={styles.loadingWrapper}>
          <div className={styles.spinner}></div>
        </div>
      );
    }

    if (isImageMessage(thumbnailUrl || imageUrl)) {
      return (
        <div
          className={styles.imageWrapper}
          onClick={() => {
            setOverlayVisible(true);
            if (isOptionsVisible) setOptionsVisible(false);
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            setOptionsVisible((prev) => !prev);
          }}
        >
          <img
            src={thumbnailUrl || imageUrl || ""}
            alt="Chat"
            className={styles.chatImage}
            onLoad={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
          {loading && (
            <div className={styles.overlay}>
              <div className={styles.spinner}></div>
            </div>
          )}
          {error && (
            <p className={styles.loadErrorText}>{t("image_load_failed")}</p>
          )}
        </div>
      );
    }

    return (
      <p className={isMine ? styles.myMessageText : styles.friendMessageText}>
        {content || t("no_content")}
      </p>
    );
  };

  return (
    <div
      className={`${isMine ? styles.myContainer : styles.friendContainer}`}
      style={containerStyle}
      onContextMenu={(e) => {
        e.preventDefault();
        if (isMine) {
          setOptionsVisible((prev) => !prev);
        }
      }}
      onClick={() => {
        if (isOptionsVisible) setOptionsVisible(false);
      }}
    >
      {!isMine && (
        <ProfileWithFlag
          userId={userId || ""}
          nickname={nickname}
          profileImage={profileImage || undefined}
          profileThumbnail={profileThumbnail || undefined}
          countryName={""}
          size={40}
        />
      )}
      <div className={isMine ? styles.myBubble : styles.friendBubble}>
        {renderContent()}
      </div>
      {!isOptionsVisible && (
        <span className={isMine ? styles.messageTimeRight : styles.messageTimeLeft}>
          {formatTimeDifference(timestamp, t)}
        </span>
      )}

      {isMine && isOptionsVisible && (
        <div className={styles.optionsContainer}>
          {!isImageMessage(thumbnailUrl || imageUrl) && (
            <button
              className={styles.optionButton}
              onClick={() => {
                setEditing(true);
                setOptionsVisible(false);
              }}
            >
              {t("message_edit")}
            </button>
          )}
          <button className={styles.optionButton} onClick={handleDelete}>
            {t("message_delete")}
          </button>
        </div>
      )}

      {isOverlayVisible && (
        <div className={styles.modalOverlay} onClick={() => setOverlayVisible(false)}>
          <div className={styles.imageViewer}>
            <button className={styles.closeButton} onClick={() => setOverlayVisible(false)}>
              {t("close")}
            </button>
            <img
              src={imageUrl || thumbnailUrl || ""}
              alt="Zoomed Chat"
              className={styles.zoomedImage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
