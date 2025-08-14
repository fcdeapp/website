'use client';

import React, {
  memo,
  useState,
  useEffect,
  useCallback,
  CSSProperties,
  useMemo,
} from 'react';
import Image from 'next/image';
import classNames from 'classnames';
import Lottie from 'lottie-react';
import axios from 'axios';

import styles from '../styles/components/MessageBubble.module.css';
import ProfileWithFlag from './ProfileWithFlag';
import { useTranslation } from 'react-i18next';
import { formatTimeDifference } from '../utils/timeUtils';
import {
  getCurrentLanguage,
  getWordFrequency,
  setWordFrequency,
  getZipf,
} from '../context/freqStore';
import { useConfig } from '../context/ConfigContext';

/* ---- CEFR 사전(util) : 앱과 동일한 헬퍼 사용 ---- */
import {
  LANGS_WITH_CEFR,
  findEntries,
  cefrRank,
  tokenizeForCEFR,
  hasCEFRAtOrAbove,
  type SupportedLang,
  type CEFR as CEFRTier,
  type CEntry,
} from '../utils/cefrDict';

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
  chatContextId?: string;          // ← web 컴파일 오류 방지 (string | undefined 허용)
  onDelete?: (id: string) => void;
  onOpenQuiz?: (mode: 'move' | 'fill', sentence: string, issues: Issue[]) => void;

  /** 앱 parity 추가 */
  selectedLanguage?: SupportedLang; // ← 추가
  learningCEFR?: CEFRTier;          // ← 추가
}

const LOW_FREQ_THRESHOLD = 4.0;
const isHttpImage = (u?: string | null) => !!u && /^https?:\/\//.test(u);

/* HTML 엔티티 디코딩 (번역 결과 정리용) */
const decodeHTMLEntities = (str: string) => {
  if (!str) return str;
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#(\d+);/g, (_m, d: string) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, h: string) => String.fromCharCode(parseInt(h, 16)));
};

/* 번역 캐시 */
const textTranslationCache = new Map<string, string>();
const defsTranslationCache = new Map<string, string>();

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
    chatContextId,
    onDelete,
    onOpenQuiz,
    selectedLanguage = 'en',
    learningCEFR = 'B1',
  } = props;

  const { t, i18n } = useTranslation();
  const { SERVER_URL } = useConfig();
  const currentLang = getCurrentLanguage();

  /* ---------------- state ---------------- */
  const [optOpen, setOptOpen] = useState(false);
  const [editMode, setEdit] = useState(false);
  const [editTxt, setEditTxt] = useState(content);

  const [lowFreq, setLowFreq] = useState<Set<string>>(new Set());
  const [vocabOpen, setVocabOpen] = useState(false);
  const [vocabWord, setVocabWord] = useState<string | null>(null);
  const [selectedEntries, setSelectedEntries] = useState<CEntry[] | null>(null);

  const [imgPreview, setImgPreview] = useState(false);

  const [showTranslation, setShowTranslation] = useState(false);
  const [translated, setTranslated] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [translateErr, setTranslateErr] = useState<string | null>(null);

  const baseLang = useMemo(
    () => (selectedLanguage.split('-')[0] as SupportedLang),
    [selectedLanguage]
  );

  /* ---------------- 저빈도/CEFR 계산 ---------------- */
  useEffect(() => {
    const run = async () => {
      const tokens = tokenizeForCEFR(baseLang, content || '');
      const low = new Set<string>();

      if (LANGS_WITH_CEFR.has(baseLang)) {
        // CEFR JSON이 있는 언어: 학습 난이도 이상인 토큰을 하이라이트(앱과 동일)
        const minRank = cefrRank(learningCEFR);
        for (const tk of tokens) {
          const w = tk.trim();
          if (!w) continue;
          if (hasCEFRAtOrAbove(baseLang, w, minRank)) {
            low.add(w.toLowerCase());
          }
        }
        setLowFreq(low);
        return;
      }

      // Zipf 백오프 (ko/hi/ru 등)
      for (const w0 of tokens) {
        const w = w0.toLowerCase();
        let z = await getWordFrequency(w);
        if (z == null) {
          z = getZipf(w);
          await setWordFrequency(w, z);
        }
        if (z > 0 && z < LOW_FREQ_THRESHOLD) low.add(w);
      }
      setLowFreq(low);
    };
    run();
  }, [content, baseLang, learningCEFR]);

  /* ---------------- 텍스트 하이라이트 ---------------- */
  const highlightLowFreq = useCallback(
    (txt: string) => {
      // 중국어/일본어는 토큰화 결과 사이에 시각 간격을 주기 위해 공백을 섞는다
      const tokens = (baseLang === 'zh' || baseLang === 'ja')
        ? tokenizeForCEFR(baseLang, txt).flatMap(w => [w, ' '])
        : txt.split(/(\s+)/);

      return tokens.map((tk, i) => {
        if (/^\s+$/.test(tk)) return tk;
        const key = tk.trim().toLowerCase();
        if (lowFreq.has(key)) {
          return (
            <button
              key={`${tk}-${i}`}
              className={styles.lowFreq}
              onClick={() => {
                setVocabWord(key);
                const entries = findEntries(baseLang, key);
                setSelectedEntries(entries.length ? entries : null);
                setVocabOpen(true);
              }}
              title={t('add_to_vocab') || 'Add to vocab'}
            >
              {tk}
            </button>
          );
        }
        return <React.Fragment key={`${tk}-${i}`}>{tk}</React.Fragment>;
      });
    },
    [lowFreq, baseLang, t]
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
            <span key={`iss-${k}`} className={styles.issueWord}>
              {txt.slice(iss.pos, end)}
            </span>
          );
          cursor = end;
        });
      if (cursor < txt.length) parts.push(txt.slice(cursor));
      return parts;
    },
    [issues]
  );

  /* ---------------- 번역 ---------------- */
  const handleToggleTranslate = async () => {
    if (showTranslation) {
      setShowTranslation(false);
      return;
    }
    const target = (i18n?.language || 'en').split('-')[0];
    const key = `${content}__${target}`;

    if (textTranslationCache.has(key)) {
      setTranslated(textTranslationCache.get(key)!);
      setShowTranslation(true);
      return;
    }
    try {
      setTranslating(true);
      setTranslateErr(null);
      const { data } = await axios.post(
        `${SERVER_URL}/translate/translate`,
        { text: content, targetLanguage: target }
      );
      const raw = data?.translatedText ?? '';
      const decoded = decodeHTMLEntities(raw);
      textTranslationCache.set(key, decoded);
      setTranslated(decoded);
      setShowTranslation(true);
    } catch (e) {
      setTranslateErr('Translation failed');
      setShowTranslation(true);
    } finally {
      setTranslating(false);
    }
  };

  /* ---------------- 메시지 편집/삭제 ---------------- */
  const submitEdit = async () => {
    if (!editTxt.trim() || !_id || !chatContextId || !messageType) {
      setEdit(false);
      return;
    }
    let endpoint = '';
    if (messageType === 'ai') {
      endpoint = `${SERVER_URL}/ai-chat/session/${chatContextId}/message/${_id}`;
    } else if (messageType === 'normal') {
      endpoint = `${SERVER_URL}/chats/${chatContextId}/message/${_id}`;
    } else if (messageType === 'buddy') {
      endpoint = `${SERVER_URL}/buddy-chat/${chatContextId}/message/${_id}`;
    } else if (messageType === 'regional') {
      endpoint = `${SERVER_URL}/district-chat/${chatContextId}/message/${_id}`;
    }
    try {
      const token = localStorage.getItem('token') || '';
      const res = await axios.patch(endpoint, { message: editTxt }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) setEdit(false);
    } catch (e) {
      console.error('update message failed', e);
      setEdit(false);
    }
  };

  const doDelete = async () => {
    if (!_id || !chatContextId || !messageType) return;
    let endpoint = '';
    if (messageType === 'ai') {
      endpoint = `${SERVER_URL}/ai-chat/session/${chatContextId}/message/${_id}`;
    } else if (messageType === 'normal') {
      endpoint = `${SERVER_URL}/chats/${chatContextId}/message/${_id}`;
    } else if (messageType === 'buddy') {
      endpoint = `${SERVER_URL}/buddy-chat/${chatContextId}/message/${_id}`;
    } else if (messageType === 'regional') {
      endpoint = `${SERVER_URL}/district-chat/${chatContextId}/message/${_id}`;
    }
    try {
      const token = localStorage.getItem('token') || '';
      const res = await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) onDelete?.(_id);
    } catch (e) {
      console.error('delete message failed', e);
    }
  };

  /* ---------------- classes ---------------- */
  const wrapCls   = classNames(styles.container, isMine && styles.toRight);
  const bubbleCls = classNames(
    styles.bubble,
    isMine ? styles.my : styles.their,
    isMine && issues.length > 0 && styles.myIssue
  );

  /* ---------------- JSX 파트 ---------------- */
  const textBody = (
    <div
      className={classNames(styles.textWrapper, isTextUploading && styles.uploading)}
      onClick={() => !isImageUploading && !isTextUploading && handleToggleTranslate()}
      onContextMenu={(e) => {
        e.preventDefault();
        if (isMine) setOptOpen((o) => !o);
      }}
      title={t('translate') || 'Translate'}
    >
      {isTextUploading && <span className={styles.shimmer} />}
      {editMode ? (
        <input
          className={styles.editInput}
          value={editTxt}
          maxLength={1000}
          onChange={(e) => setEditTxt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && editTxt.trim()) submitEdit();
            if (e.key === 'Escape') setEdit(false);
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

  const imageBody = (
    <div
      className={styles.imageWrap}
      onClick={() => setImgPreview(true)}
      onContextMenu={(e) => {
        e.preventDefault();
        if (isMine) setOptOpen((o) => !o);
      }}
    >
      {isImageUploading && (
        <div className={styles.imageSkeleton}>
          <Lottie
            animationData={require('../../public/lottie/ActivityIndicator.json')}
            loop
            autoplay
            style={{ width: 80, height: 80 }}
          />
        </div>
      )}
      <Image
        src={(thumbnailUrl || imageUrl || '') as string}
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
        {isHttpImage(imageUrl || thumbnailUrl) ? imageBody : textBody}
      </div>

      {/* 시간 */}
      <span className={classNames(styles.time, isMine && styles.timeRight)}>
        {formatTimeDifference(timestamp, t)}
      </span>

      {/* 옵션 박스 */}
      {isMine && optOpen && (
        <div className={styles.optBox}>
          {!isHttpImage(imageUrl || thumbnailUrl) && (
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
                setOptOpen(false);
                doDelete();
              }}
            >
              {t('message_delete')}
            </button>
          )}
        </div>
      )}

      {/* 이슈 피드백 + 퀴즈 버튼 */}
      {isMine && issues.length > 0 && (
        <div className={styles.issueArea}>
          {issues.map((it, i) => (
            <p key={i} className={styles.issueLine}>
              • {it.error} → {it.suggestion} (<em>{it.explanation}</em>)
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

      {/* 번역 결과 (토글) */}
      {showTranslation && !isHttpImage(imageUrl || thumbnailUrl) && (
        <div
          className={styles.translationBox || styles.issueArea /* 스타일 없으면 issueArea 재사용 */}
          onClick={() => setShowTranslation(false)}
          title={t('close') || 'Close'}
        >
          {translating
            ? (t('translating') || 'Translating...')
            : translateErr
              ? translateErr
              : (translated || '')}
        </div>
      )}

      {/* 이미지 프리뷰 */}
      {imgPreview && imageUrl && (
        <div className={styles.previewOverlay} onClick={() => setImgPreview(false)}>
          <img src={imageUrl} className={styles.previewImg} />
          <button
            className={styles.closePreview}
            onClick={(e) => {
              e.stopPropagation();
              setImgPreview(false);
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* 어휘 모달 (저빈도 단어 클릭) */}
      {vocabOpen && (
        <div className={styles.vocabOverlay} onClick={() => setVocabOpen(false)}>
          <div className={styles.vocabModal} onClick={(e) => e.stopPropagation()}>
            <h4>{t('add_to_vocab')}</h4>
            <p className={styles.vocabWord}>{vocabWord}</p>

            {/* 간단 정의/예문 (있을 때만) */}
            {selectedEntries && selectedEntries.length > 0 && (
              <div style={{ maxHeight: 260, overflowY: 'auto', width: '100%', textAlign: 'left' }}>
                {selectedEntries.map((e, i) => {
                  const defLines =
                    (e.definitions && e.definitions.length > 0)
                      ? e.definitions
                      : ((e as any).en_definitions && (e as any).en_definitions.length > 0)
                        ? (e as any).en_definitions
                        : ((e as any).meaning ? [String((e as any).meaning)] : []);
                  const exLines = (e.examples || []);
                  return (
                    <div key={`${e.form}-${e.CEFR}-${i}`} style={{ marginBottom: 12 }}>
                      <div style={{ fontWeight: 500, marginBottom: 4 }}>
                        {e.form} <span style={{ color: '#D8315B' }}>· {e.CEFR}</span>
                      </div>
                      {defLines.length > 0 && (
                        <>
                          <div style={{ fontSize: 12, color: '#888' }}>{t('definitions') || 'Definitions'}</div>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: 14, lineHeight: '20px' }}>
                            {defLines.map((d, j) => `• ${d}`).join('\n')}
                          </div>
                        </>
                      )}
                      {exLines.length > 0 && (
                        <>
                          <div style={{ fontSize: 12, color: '#888', marginTop: 6 }}>{t('examples') || 'Examples'}</div>
                          <div style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: '18px', fontStyle: 'italic' }}>
                            {exLines.map((x, j) => `• ${x}`).join('\n')}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className={styles.vocabBtns}>
              <button className={styles.vocabCancel} onClick={() => setVocabOpen(false)}>
                {t('cancel')}
              </button>
              <button
                className={styles.vocabConfirm}
                onClick={() => {
                  // NOTE: 웹에선 파일 시스템이 없으니, 별도 저장 로직이 있다면 여기에 연결
                  setVocabOpen(false);
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
