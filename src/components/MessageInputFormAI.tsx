"use client";

import React, {
  useState,
  useEffect,
  useRef,
  ChangeEvent,
  KeyboardEvent,
} from "react";
import Image from "next/image";
import classNames from "classnames";
import styles from "../styles/components/MessageInputFormAI.module.css";

import { useTranslation } from "react-i18next";
import LoginDecisionOverlay from "../overlays/LoginDecisionOverlay";

export interface MessageArgs {
  text?: string;
  imageUri?: string;
}

interface Props {
  onSendMessage: (args: MessageArgs) => Promise<void> | void;
  /** 기본값 true */
  showPhotoIcon?: boolean;
  value: string;
  onChangeText: (txt: string) => void;
  /** AI 채팅인지 여부 – 음성버튼 노출 판별용 (기본값 false) */
  isAIChat?: boolean;
  /** 음성챗 모드 on/off (기본값 false) */
  isVoiceChatMode?: boolean;
  onToggleVoiceChatMode?: () => void;
}

const MAX_HEIGHT = 240;

const MessageInputFormAI: React.FC<Props> = ({
  onSendMessage,
  showPhotoIcon = true,
  value,
  onChangeText,
  isAIChat = false,
  isVoiceChatMode = false,
  onToggleVoiceChatMode = () => {},
}) => {
  const { t } = useTranslation();

  /* ─────────────── 상태 ─────────────── */
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  /* ─────────────── refs ─────────────── */
  const fileRef = useRef<HTMLInputElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  /* ─────────────── 로그인 여부 확인 ─────────────── */
  const isLoggedIn =
    typeof window !== "undefined" && !!localStorage.getItem("token");

  /* ─────────────── 입력 높이 auto‑resize ─────────────── */
  const resize = () => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    const h = Math.min(el.scrollHeight, MAX_HEIGHT);
    el.style.height = `${h}px`;
  };
  useEffect(resize, [value]);

  /* ─────────────── 전송 ─────────────── */
  const handleSend = async () => {
    if (sending) return;
    if (!isLoggedIn) {
      setLoginOpen(true);
      return;
    }
    const txt = value.trim();
    if (!txt && !selectedImage) return;

    setSending(true);
    try {
      await onSendMessage({ text: txt, imageUri: selectedImage || undefined });
      onChangeText("");
      setSelectedImage(null);
      setPreviewOpen(false);
      // textarea 높이 초기화
      if (taRef.current) taRef.current.style.height = "40px";
    } catch (e) {
      /* eslint-disable-next-line no-console */
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  /* ─────────────── 사진 선택 ─────────────── */
  const pickImage = () => fileRef.current?.click();

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setSelectedImage(url);
    setPreviewOpen(true);
  };

  /* ─────────────── 단축키: Ctrl+Enter 전송 ─────────────── */
  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ------------- 로그인 유도 오버레이 ------------- */}
      {loginOpen && (
        <LoginDecisionOverlay
          visible
          onLogin={() => {
            setLoginOpen(false);
            window.location.href = "/sign-in"; // 경로는 프로젝트 구조에 맞게 바꿔주세요
          }}
          onBrowse={() => setLoginOpen(false)}
        />
      )}

      {/* ------------- 이미지 미리보기 ------------- */}
      {previewOpen && selectedImage && (
        <div className={styles.previewOverlay} onClick={() => setPreviewOpen(false)}>
          <div
            className={styles.previewCard}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="preview"
              fill
              style={{ objectFit: "cover", borderRadius: 10 }}
            />
            <button
              className={styles.previewClose}
              onClick={() => {
                setSelectedImage(null);
                setPreviewOpen(false);
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ------------- 메인 입력 영역 ------------- */}
      <div className={styles.frame}>
        {/* 사진 선택 */}
        {showPhotoIcon ? (
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className={styles.hiddenFile}
              onChange={onFileChange}
            />
            <button
              className={styles.iconBtn}
              disabled={sending}
              onClick={pickImage}
            >
              <img
                src="/assets/chatInputImage.png"
                alt="img"
                width={24}
                height={24}
              />
            </button>
          </>
        ) : (
          <div className={styles.iconPlaceholder} />
        )}

        {/* 텍스트 입력 */}
        <textarea
          ref={taRef}
          className={styles.input}
          value={value}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={
            isLoggedIn
              ? t("messageInput.placeholder")
              : t("messageInput.login_required")
          }
          onKeyDown={onKeyDown}
          disabled={sending}
        />

        {/* 전송 / 음성 */}
        {isAIChat && value.trim() === "" ? (
          <button
            className={styles.iconBtn}
            onClick={onToggleVoiceChatMode}
            disabled={sending}
          >
            <img
              src={
                isVoiceChatMode
                  ? "/assets/chatInputPlayOn.png"
                  : "/assets/chatInputPlay.png"
              }
              alt="voice"
              width={24}
              height={24}
            />
          </button>
        ) : (
          <button
            className={classNames(styles.iconBtn, {
              [styles.sending]: sending,
            })}
            onClick={handleSend}
            disabled={sending}
          >
            <Image
              src="/assets/chatInputSend.png"
              alt="send"
              width={24}
              height={24}
            />
          </button>
        )}
      </div>
    </>
  );
};

export default MessageInputFormAI;
