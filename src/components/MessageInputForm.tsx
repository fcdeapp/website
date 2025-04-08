"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";
import { useRouter } from "next/navigation";
import ProfileWithFlag from "./ProfileWithFlag";
import styles from "../styles/components/MessageInputForm.module.css";

interface SendMessagePayload {
  text: string;
  imageUri: string | null;
}

  export interface MessageInputFormProps {
    onSendMessage: (payload: SendMessagePayload) => void;
    showPhotoIcon: boolean;
  }
  
  

const MessageInputForm: React.FC<MessageInputFormProps> = ({
  onSendMessage,
  showPhotoIcon = true,
}) => {
  const { t } = useTranslation();
  const { SERVER_URL } = useConfig();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [isActionAreaVisible, setIsActionAreaVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginOverlayVisible, setLoginOverlayVisible] = useState(false);

  // 파일 input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleSend = () => {
    if (isLoggedIn) {
      if (message.trim() || selectedImage) {
        onSendMessage({ text: message.trim(), imageUri: selectedImage });
        setMessage("");
        setSelectedImage(null);
        setIsPreviewVisible(false);
      }
    } else {
      setLoginOverlayVisible(true);
    }
  };

  // 파일 선택 처리 (이미지 선택)
  const handleSelectPhoto = async () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // 이미지 미리보기 URL 생성
      const imageUrl = URL.createObjectURL(file);
      // (옵션) 실제 업로드 전 리사이징 등 추가 작업 가능 (여기서는 단순 미리보기)
      setSelectedImage(imageUrl);
      setIsPreviewVisible(true);
    }
  };

  return (
    <>
      {loginOverlayVisible && (
        <div className={styles.loginOverlay}>
          {/* 로그인/브라우징 선택 오버레이 */}
          <div className={styles.loginOverlayContent}>
            <p>{t("login_required")}</p>
            <div className={styles.loginOverlayButtons}>
              <button
                onClick={() => {
                  setLoginOverlayVisible(false);
                  router.push("/signInLogIn");
                }}
              >
                {t("login")}
              </button>
              <button onClick={() => setLoginOverlayVisible(false)}>
                {t("browse")}
              </button>
            </div>
          </div>
        </div>
      )}

      {isPreviewVisible && selectedImage && (
        <div className={styles.previewContainer}>
          <div className={styles.previewContent}>
            <img
              src={selectedImage}
              alt="Preview"
              className={styles.previewImage}
            />
            <button
              className={styles.closePreviewButton}
              onClick={() => setSelectedImage(null)}
            >
              <img
                src="/assets/delete-icon-big.png"
                alt="Close Preview"
                className={styles.closeIcon}
              />
            </button>
          </div>
        </div>
      )}

      <div className={styles.chattingFormFrame}>
        {showPhotoIcon ? (
          <button className={styles.photoButton} onClick={handleSelectPhoto}>
            <img
              src="/assets/message-photo-icon.png"
              alt="Select Photo"
              className={styles.chatIcon}
            />
          </button>
        ) : (
          <div className={styles.placeholderIconSpace} />
        )}

        <input
          className={styles.chatInput}
          placeholder={
            isLoggedIn
              ? t("messageInput.placeholder")
              : t("messageInput.login_required")
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />

        <button className={styles.sendButton} onClick={handleSend}>
          <img
            src="/assets/message-send-icon.png"
            alt="Send"
            className={styles.chatIcon}
          />
        </button>
      </div>
      
      {/* Hidden file input for image selection */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </>
  );
};

export default MessageInputForm;
