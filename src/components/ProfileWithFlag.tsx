"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useConfig } from "../context/ConfigContext";
import { useRouter } from "next/navigation";
import LoginDecisionOverlay from "../overlays/LoginDecisionOverlay";
import { countries } from "../../src/constants/countries";
import styles from "../styles/components/ProfileWithFlag.module.css";

type ProfileWithFlagProps = {
  userId: string;
  nickname?: string;
  profileImage?: string;
  profileThumbnail?: string;
  countryName?: string;
  size: number; // 프로필 이미지의 지름 (픽셀 단위)
  trustBadge?: boolean;
};

  // "안전한 이미지 소스"를 반환하는 헬퍼 함수
  const getSafeImageSource = (imageValue: unknown) => {
    if (typeof imageValue === "string" && imageValue.trim() !== "") {
      return imageValue.startsWith("http") || imageValue.startsWith("/assets/")
        ? imageValue
        : `/assets/${imageValue}`;
    }
    // 기본 이미지 경로 (public 폴더 내에 위치)
    return "/assets/Annonymous.png";
  };

const ProfileWithFlag: React.FC<ProfileWithFlagProps> = ({
  userId,
  nickname,
  profileImage,
  profileThumbnail,
  countryName,
  size,
  trustBadge,
}) => {
  const { SERVER_URL } = useConfig();
  const router = useRouter();
  const [resolvedProfileImage, setResolvedProfileImage] = useState<string | null>(
    profileThumbnail || profileImage || null
  );
  const [resolvedCountryName, setResolvedCountryName] = useState<string | null>(
    countryName || null
  );
  const [resolvedTrustBadge, setResolvedTrustBadge] = useState<boolean>(
    trustBadge || false
  );
  const [loading, setLoading] = useState(false);
  const [myUserId, setMyUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginOverlayVisible, setLoginOverlayVisible] = useState(false);

  // 웹에서는 localStorage를 사용하거나, AsyncStorage polyfill을 사용하는 방법도 있습니다.
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setMyUserId(storedUserId);
  }, []);

  // 필요한 사용자 정보를 서버에서 불러오기 (국가, 프로필 이미지, trustBadge 등)
  useEffect(() => {
    const localLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(localLoggedIn);

    if ((!countryName || (!profileThumbnail && !profileImage) || trustBadge === undefined) && userId) {
      const fetchUserDetails = async () => {
        try {
          setLoading(true);
          if (!localLoggedIn) {
            setLoading(false);
            return;
          }
          const response = await axios.get(`${SERVER_URL}/users/country?userId=${userId}`);
          if (response.status === 200) {
            const data = response.data;
            setResolvedCountryName(data.originCountry);
            // 문자열이 아닌 경우 빈 문자열로 대체
            if (typeof data.profileThumbnail !== "string") {
              data.profileThumbnail = "";
            }
            if (typeof data.profileImage !== "string") {
              data.profileImage = "";
            }
            setResolvedProfileImage(data.profileThumbnail || data.profileImage || "");
            setResolvedTrustBadge(data.trustBadge || false);
          } else {
            console.log("Failed to fetch user details");
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchUserDetails();
    }
  }, [countryName, profileThumbnail, profileImage, trustBadge, userId, SERVER_URL]);

  // 해당 국가의 국기 이미지 URL 찾기
  const country = countries.find((c) => c.name === resolvedCountryName);
  const flagImage = country ? country.flag : null;
  const sourceForProfile = getSafeImageSource(resolvedProfileImage);

  const handlePress = () => {
    if (!isLoggedIn) {
      setLoginOverlayVisible(true);
      return;
    }

    const navigationParams = {
      userId,
      nickname,
      profileImage: profileImage || null,
      profileThumbnail: profileThumbnail || null,
    };

    // 현재 사용자와 프로필 소유자가 같으면 MyProfile, 다르면 Profile 페이지로 이동
    if (userId === myUserId) {
      router.push(`/myProfile?${new URLSearchParams(navigationParams as any).toString()}`);
    } else {
      router.push(`/profile?${new URLSearchParams(navigationParams as any).toString()}`);
    }
  };

  if (loading) {
    return (
      <div className={styles.container} style={{ width: size, height: size }}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  return (
    <>
      <div
        onClick={handlePress}
        className={styles.container}
        style={{ width: size, height: size }}
      >
        {/* 프로필 이미지 */}
        {resolvedTrustBadge ? (
          <div
            className={styles.gradientBorder}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          >
            <img
              src={sourceForProfile}
              alt="Profile"
              className={styles.profileImage}
              style={{
                width: size - 4,
                height: size - 4,
                borderRadius: (size - 4) / 2,
              }}
            />
          </div>
        ) : (
          <img
            src={sourceForProfile}
            alt="Profile"
            className={styles.profileImage}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        )}

        {/* 국기 이미지 */}
        {flagImage && (
          <div
            className={styles.flagWrapper}
            style={{
              width: size / 3 + 4,
              height: size / 3 + 4,
              borderRadius: size / 6 + 2,
            }}
          >
            <img
              src={flagImage}
              alt="Flag"
              className={styles.flagImage}
              style={{
                width: size / 3,
                height: size / 3,
                borderRadius: size / 6,
              }}
            />
          </div>
        )}
      </div>
      {loginOverlayVisible && (
        <div className={styles.modal}>
          <LoginDecisionOverlay
            visible={true}
            onLogin={() => {
              setLoginOverlayVisible(false);
              router.push("/signInLogIn");
            }}
            onBrowse={() => setLoginOverlayVisible(false)}
          />
        </div>
      )}
    </>
  );
};

export default ProfileWithFlag;
