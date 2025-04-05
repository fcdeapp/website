"use client";

import React, { useEffect, useState } from "react";
import { useConfig } from "../context/ConfigContext";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useRouter } from "next/navigation";
import ProfileWithFlag from "../components/ProfileWithFlag";
import styles from "../styles/components/BuddyGroupDetailModal.module.css";

interface Member {
  userId: string;
  nickname: string;
  profileImage: string | null;
}

interface BuddyGroupDetails {
  buddyGroupId: string;
  buddyGroupName: string;
  buddyPhoto: string | null;
  buddyPhotoMedium: string | null;
  description: string;
  activityCountry: string;
  activityCity: string;
  latitude: number;
  longitude: number;
  members: Member[];
}

interface BuddyGroupDetailModalProps {
  visible: boolean;
  onClose: () => void;
  buddyGroupId: string;
}

const BuddyGroupDetailModal: React.FC<BuddyGroupDetailModalProps> = ({
  visible,
  onClose,
  buddyGroupId,
}) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();
  const [buddyLoading, setBuddyLoading] = useState<boolean>(false);
  const [buddyGroupDetails, setBuddyGroupDetails] =
    useState<BuddyGroupDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper: 로컬 이미지면 /assets/ 접두어 붙이기
  const getLocalImage = (img: string | null) => {
    if (!img) return null;
    return img.startsWith("http") ? img : `/assets/${img}`;
  };

  // Fetch buddy group details when modal becomes visible
  useEffect(() => {
    const fetchBuddyGroupDetails = async () => {
      if (!buddyGroupId || !visible) return;
      setBuddyLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error(t("modal.noTokenError"));
        }
        const response = await axios.get(
          `${SERVER_URL}/buddy-groups/get/${buddyGroupId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = response.data;
        if (!data) {
          throw new Error(t("modal.dataNotFoundError"));
        }
        setBuddyGroupDetails({
          buddyGroupId: data.buddyGroupId,
          buddyGroupName: data.buddyGroupName,
          // 서버에서 받은 이미지 URL은 그대로 사용하고, 그렇지 않으면 public/assets/에서 불러옴
          buddyPhoto: getLocalImage(data.buddyPhoto),
          buddyPhotoMedium: getLocalImage(data.buddyPhotoMedium),
          description: data.description,
          activityCountry: data.activityCountry,
          activityCity: data.activityCity,
          latitude: data.latitude,
          longitude: data.longitude,
          members: data.members.map((member: any) => ({
            ...member,
            profileImage: getLocalImage(member.profileImage),
          })),
        });
      } catch (err: any) {
        console.error(t("modal.unknownError"), err);
        setError(err.message || t("modal.errorFetchingInfo"));
      } finally {
        setBuddyLoading(false);
      }
    };

    fetchBuddyGroupDetails();
  }, [buddyGroupId, visible, SERVER_URL, t]);

  // Navigate to BuddyPage
  const navigateToBuddyPage = () => {
    if (buddyGroupDetails) {
      onClose();
      router.push(`/buddy?buddyGroupId=${buddyGroupDetails.buddyGroupId}`);
    } else {
      alert(`${t("modal.errorAlert")}: ${t("modal.buddyInfoUnavailable")}`);
    }
  };

  if (!visible) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalContainer}
        onClick={(e) => e.stopPropagation()}
      >
        {buddyLoading ? (
          <div className={styles.buddyGroupLoadingContainer}>
            <div className={styles.spinner}></div>
            <p className={styles.loadingText}>{t("modal.loadingBuddyInfo")}</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
            <button
              className={styles.retryButton}
              onClick={async () => {
                setBuddyGroupDetails(null);
                setBuddyLoading(true);
                try {
                  const token = localStorage.getItem("token");
                  if (!token) {
                    alert(`${t("modal.errorAlert")}: ${t("modal.noTokenError")}`);
                    setBuddyLoading(false);
                    return;
                  }
                  const response = await axios.get(
                    `${SERVER_URL}/buddy-groups/get/${buddyGroupId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                  );
                  const data = response.data;
                  setBuddyGroupDetails({
                    buddyGroupId: data.buddyGroupId,
                    buddyGroupName: data.buddyGroupName,
                    buddyPhoto: getLocalImage(data.buddyPhoto),
                    buddyPhotoMedium: getLocalImage(data.buddyPhotoMedium),
                    description: data.description,
                    activityCountry: data.activityCountry,
                    activityCity: data.activityCity,
                    latitude: data.latitude,
                    longitude: data.longitude,
                    members: data.members.map((member: any) => ({
                      ...member,
                      profileImage: getLocalImage(member.profileImage),
                    })),
                  });
                  setError(null);
                } catch (err: any) {
                  console.error(t("modal.unknownError"), err);
                  setError(err.message || t("modal.errorFetchingInfo"));
                } finally {
                  setBuddyLoading(false);
                }
              }}
            >
              {t("modal.retry")}
            </button>
          </div>
        ) : (
          <div className={styles.detailsContainer}>
            <div className={styles.mapContainer}>
              {/* 지도 이미지: 서버에서 가져오는 이미지가 아니라 public/assets/ 안에 있는 파일 사용 */}
              <div className={styles.map}>
                {buddyGroupDetails &&
                  buddyGroupDetails.latitude &&
                  buddyGroupDetails.longitude && (
                    <img
                      src="/assets/map_buddy.png"
                      alt="map marker"
                      className={styles.customMarkerImage}
                    />
                  )}
              </div>
              <div className={styles.mapOverlay}>
                <p className={styles.mapOverlayText}>
                  {`${buddyGroupDetails?.activityCity || t("modal.unknownCity")}, ${buddyGroupDetails?.activityCountry || t("modal.unknownCountry")}`}
                </p>
              </div>
            </div>

            <div className={styles.headerContainer}>
              <img
                src={
                  buddyGroupDetails?.buddyPhotoMedium
                    ? buddyGroupDetails.buddyPhotoMedium
                    : buddyGroupDetails?.buddyPhoto
                    ? buddyGroupDetails.buddyPhoto
                    : "/assets/groupChat.png"
                }
                alt="group"
                className={styles.groupImage}
              />
              <div className={styles.groupTextContainer}>
                <p className={styles.groupTitle}>
                  {buddyGroupDetails?.buddyGroupName}
                </p>
                <p className={styles.groupDescription}>
                  {buddyGroupDetails?.description || t("modal.defaultDescription")}
                </p>
              </div>
            </div>

            <p className={styles.sectionTitle}>{t("modal.members")}</p>
            <div className={styles.memberList}>
              {buddyGroupDetails?.members.map((member) => (
                <div key={member.userId} className={styles.memberCard}>
                  <ProfileWithFlag
                    userId={member.userId}
                    nickname={member.nickname}
                    profileImage={member.profileImage || undefined}
                    countryName={undefined}
                    size={60}
                  />
                  <p className={styles.memberNickname}>{member.nickname}</p>
                </div>
              ))}
            </div>

            <div className={styles.goToBuddyPageButton}>
              <div className={styles.goToBuddyPageButtonGradient}>
                <button
                  className={styles.goToBuddyPageTouchable}
                  onClick={navigateToBuddyPage}
                >
                  <p className={styles.goToBuddyPageButtonText}>
                    {t("modal.navigateToBuddyPage")}
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuddyGroupDetailModal;
