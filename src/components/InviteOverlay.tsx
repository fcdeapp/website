"use client";

import React, { MouseEvent } from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/InviteOverlay.module.css";

interface Friend {
  userId: string;
  profileImage?: string;
  profileThumbnail?: string;
  nickname: string;
}

interface Props {
  /** 오버레이 표시 여부 */
  visible: boolean;
  /** 로그인한 사용자의 친구 목록 */
  friends: Friend[];
  /** 이미 채팅방에 참여 중인 userId 집합 */
  chatUserIds: string[];
  /** 초대 버튼 클릭 */
  onInvite: (friendId: string) => void;
  /** 바깥 영역 또는 [닫기] 클릭 */
  onClose: () => void;
  /** 개발 중 메시지 표시 여부 */
  underDevelopment: boolean;
}

const InviteOverlay: React.FC<Props> = ({
  visible,
  friends,
  chatUserIds,
  onInvite,
  onClose,
  underDevelopment,
}) => {
  const { t } = useTranslation();
  if (!visible) return null;

  /** 채팅 참여자가 아닌 친구만 추려서 초대 리스트로 사용 */
  const nonParticipants = friends.filter(
    (f) => !chatUserIds.includes(f.userId)
  );

  /** 카드 내부 클릭 버블링 방지 */
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.wrapper} onClick={stop}>
        {/* 흐림 효과 레이어 (개발용 차단) */}
        {underDevelopment && <div className={styles.blurLayer} />}

        {/* 메인 카드 */}
        <div className={styles.card}>
          <h3 className={styles.title}>{t("invite_friends")}</h3>

          <div className={styles.list}>
            {nonParticipants.length === 0 && (
              <p className={styles.empty}>{t("no_friends_left")}</p>
            )}
            {nonParticipants.map((f) => (
              <div className={styles.item} key={f.userId}>
                <Image
                  src={
                    f.profileThumbnail ||
                    f.profileImage ||
                    "/assets/Anonymous.png"
                  }
                  alt={f.nickname}
                  width={40}
                  height={40}
                  className={styles.avatar}
                />
                <span className={styles.name}>{f.nickname}</span>
                <button
                  className={styles.inviteBtn}
                  onClick={() => onInvite(f.userId)}
                >
                  {t("invite")}
                </button>
              </div>
            ))}
          </div>

          <button className={styles.closeBtn} onClick={onClose}>
            {t("close")}
          </button>
        </div>

        {/* “준비 중” 배지 */}
        {underDevelopment && (
          <div className={styles.devBadge}>{t("under_development")}</div>
        )}
      </div>
    </div>
  );
};

export default InviteOverlay;
