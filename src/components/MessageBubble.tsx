'use client';

import React, {
  memo,
  useState,
  useEffect,
  useCallback,
  CSSProperties,
} from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import Lottie from 'lottie-react';

import styles from '../styles/components/MessageBubble.module.css';
import ProfileWithFlag from './ProfileWithFlag';
import { useTranslation } from 'react-i18next';
import { formatTimeDifference } from '@/utils/timeUtils';
import {
  getCurrentLanguage,
  getWordFrequency,
  setWordFrequency,
  getZipf,
} from '@/context/freqStore';

/* ---------------- types ---------------- */
export type MessageType = 'buddy' | 'regional' | 'normal' | 'ai';
export interface Issue { error: string; suggestion: string; explanation: string; }
export interface MessageBubbleProps {
  content: string;
  isMine: boolean;
  timestamp: string;
  messageType?: MessageType;
  issues?: Issue[];
  profileImage?: string | null;
  profileThumbnail?: string | null;
  nickname?: string;
  userId?: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  isImageUploading?: boolean;
  isTextUploading?: boolean;
  containerStyle?: CSSProperties;
  _id?: string;
  chatContextId?: string;
  onDelete?: (id: string) => void;
  onOpenQuiz?: (mode: 'move' | 'fill', sentence: string, issues: Issue[]) => void;
}

const LOW_FREQ_THRESHOLD = 4.0;
const isImageMessage = (u?: string | null) => !!u && /^https?:\/\//.test(u);

/* ============================================================ */
function MessageBubble(props: MessageBubbleProps) {
  const {
    content,
    isMine,
    timestamp,
    messageType,
    issues = [],
    nickname,
    profileImage,
    profileThumbnail,
    userId,
    imageUrl,
    thumbnailUrl,
    isImageUploading = false,
    isTextUploading = false,
    containerStyle,
    _id,
    onDelete,
    onOpenQuiz,
  } = props;

  const { t } = useTranslation();
  const currentLang = getCurrentLanguage();

  /* ---------------- state ---------------- */
  const [optOpen, setOptOpen]   = useState(false);
  const [editMode, setEdit]     = useState(false);
  const [editTxt , setEditTxt]  = useState(content);
  const [lowFreq, setLowFreq]   = useState<Set<string>>(new Set());
  const [preview, setPreview]   = useState(false);
  const [vocab, setVocab]       = useState<string|null>(null);

  /* ---------------- low‑freq calc ---------------- */
  useEffect(() => {
    const tokens = content
      .replace(/[^a-zA-Z0-9가-힣\s]/g, ' ')
      .split(/\s+/)
      .filter(Boolean);

    (async () => {
      const tmp = new Set<string>();
      for (const w0 of tokens) {
        const w = w0.toLowerCase();
        let z = await getWordFrequency(w);
        if (z == null) {
          z = getZipf(w);
          await setWordFrequency(w, z);
        }
        if (z > 0 && z < LOW_FREQ_THRESHOLD) tmp.add(w);
      }
      setLowFreq(tmp);
    })();
  }, [content]);

  /* ---------------- helpers ---------------- */
  const highlightLowFreq = useCallback(
    (txt: string) =>
      txt.split(/(\s+)/).map((tk, i) => {
        if (/^\s+$/.test(tk)) return tk;
        const key = tk.trim().toLowerCase();
        if (lowFreq.has(key))
          return (
            <button
              key={i}
              className={styles.lowFreq}
              onClick={() => setVocab(key)}
            >
              {tk}
            </button>
          );
        return tk;
      }),
    [lowFreq],
  );

  const highlightIssues = useCallback(
    (nodes: React.ReactNode, txt: string) => {
      if (!issues.length) return nodes;
      const parts: React.ReactNode[] = [];
      let cursor = 0;
      const lower = txt.toLowerCase();

      issues
        .map((iss) => ({ ...iss, pos: lower.indexOf(iss.error.toLowerCase()) }))
        .filter((x) => x.pos >= 0)
        .sort((a, b) => a.pos - b.pos)
        .forEach((iss, k) => {
          if (cursor < iss.pos) parts.push(txt.slice(cursor, iss.pos));
          const end = iss.pos + iss.error.length;
          parts.push(
            <span key={k} className={styles.issueWord}>
              {txt.slice(iss.pos, end)}
            </span>,
          );
          cursor = end;
        });
      if (cursor < txt.length) parts.push(txt.slice(cursor));
      return parts;
    },
    [issues],
  );

  /* ---------------- preview esc key ---------------- */
  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPreview(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [preview]);

  /* ---------------- classes ---------------- */
  const wrapCls   = classNames(styles.container, isMine && styles.toRight);
  const bubbleCls = classNames(
    styles.bubble,
    isMine ? styles.my : styles.their,
    isMine && issues.length > 0 && styles.myIssue,
  );

  /* ---------------- JSX ---------------- */
  /** 텍스트 본체 */
  const textBody = (
    <div
      className={classNames(styles.textWrapper, isTextUploading && styles.uploading)}
      onContextMenu={(e) => {
        e.preventDefault();
        if (isMine) setOptOpen((o) => !o);
      }}
    >
      {isTextUploading && <span className={styles.shimmer} />}
      {editMode ? (
        <input
          className={styles.editInput}
          value={editTxt}
          maxLength={1000}
          onChange={(e) => setEditTxt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && editTxt.trim()) setEdit(false); // TODO PATCH
          }}
          autoFocus
        />
      ) : (
        <span className={styles.content}>
          {highlightIssues(highlightLowFreq(content), content)}
        </span>
      )}
    </div>
  );

  /** 이미지 본체 */
  const imageBody = (
    <div
      className={styles.imageWrap}
      onClick={() => setPreview(true)}
      onContextMenu={(e) => {
        e.preventDefault();
        if (isMine) setOptOpen((o) => !o);
      }}
    >
      {isImageUploading && (
        <div className={styles.imageSkeleton}>
          <Lottie
            animationData={require('@/public/lottie/ActivityIndicator.json')}
            loop
            autoplay
            style={{ width: 80, height: 80 }}
          />
        </div>
      )}
      <Image
        src={thumbnailUrl || imageUrl!}
        alt="chat-img"
        width={160}
        height={160}
        className={styles.chatImage}
      />
    </div>
  );

  return (
    <div className={wrapCls} style={containerStyle}>
      {/* 프로필 (상대) */}
      {!isMine && (
        <ProfileWithFlag
          userId={userId || ''}
          nickname={nickname || ''}
          profileImage={profileImage ?? undefined}
          profileThumbnail={profileThumbnail ?? undefined}
          countryName=""
          size={40}
        />
      )}


      {/* 말풍선 */}
      <div className={bubbleCls}>
        {isImageMessage(imageUrl || thumbnailUrl) ? imageBody : textBody}
      </div>

      {/* 시간 */}
      <span className={classNames(styles.time, isMine && styles.timeRight)}>
        {formatTimeDifference(timestamp, t)}
      </span>

      {/* 옵션 박스 */}
      {isMine && optOpen && (
        <div className={styles.optBox}>
          {!isImageMessage(imageUrl || thumbnailUrl) && (
            <button
              className={styles.optBtn}
              onClick={() => {
                setEdit(true);
                setOptOpen(false);
              }}
            >
              {t('message_edit')}
            </button>
          )}
          {_id && (
            <button
              className={styles.optBtn}
              onClick={() => {
                onDelete?.(_id);
                setOptOpen(false);
              }}
            >
              {t('message_delete')}
            </button>
          )}
        </div>
      )}

      {/* 오류 피드백 + 퀴즈 버튼 */}
      {isMine && issues.length > 0 && (
        <div className={styles.issueArea}>
          {issues.map((it, i) => (
            <p key={i} className={styles.issueLine}>
              • {it.error} → {it.suggestion} (<em>{it.explanation}</em>)
            </p>
          ))}

          <div className={styles.quizRow}>
            <button
              className={styles.quizBtn}
              onClick={() => onOpenQuiz?.('move', content, issues)}
            >
              {t('quizPage_modes.move')}
            </button>
            <button
              className={styles.quizBtn}
              onClick={() => onOpenQuiz?.('fill', content, issues)}
            >
              {t('quizPage_modes.fill')}
            </button>
          </div>
        </div>
      )}

      {/* 이미지 프리뷰 오버레이 */}
      {preview && imageUrl && (
        <div
          className={styles.previewOverlay}
          onClick={() => setPreview(false)}
        >
          <img src={imageUrl} className={styles.previewImg} />
          <button
            className={styles.closePreview}
            onClick={(e) => {
              e.stopPropagation();
              setPreview(false);
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 어휘 모달 */}
      {vocab && (
        <div
          className={styles.vocabOverlay}
          onClick={() => setVocab(null)}
        >
          <div
            className={styles.vocabModal}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>{t('add_to_vocab')}</h4>
            <p className={styles.vocabWord}>{vocab}</p>
            <div className={styles.vocabBtns}>
              <button
                className={styles.vocabCancel}
                onClick={() => setVocab(null)}
              >
                {t('cancel')}
              </button>
              <button
                className={styles.vocabConfirm}
                onClick={() => {
                  /* TODO: 파일에 저장 */
                  setVocab(null);
                }}
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(MessageBubble);
