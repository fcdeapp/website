// src/components/MyProfile.tsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useConfig } from "../../context/ConfigContext";
import { useTranslation } from "react-i18next";

// 기존 앱용 컴포넌트 (웹용으로 이미 제작되어 있다고 가정)
import ProfileWithFlag from "../../components/ProfileWithFlag";
import FriendSearchItem from "../../components/FriendSearchItem";
import WebFooter from "../../components/WebFooter";
import Licenses from "../../components/Licenses";

import styles from "../../styles/pages/MyProfile.module.css";

export interface UserResponse {
  userId: string | null;
  profileImage: string | null;
  profileThumbnail: string | null;
  nickname: string | null;
  isAccountPublic: boolean;
  newMessageEnabled: boolean;
  originCountry: string | null;
  mainLanguage: string | null;
  learningLanguage: string[] | null;
  currentCountry: string | null;
  currentCity: string | null;
  hobbies: string[] | null;
  skills: string[] | null;
  description: string | null;
  trustBadge: boolean;
}

type QuickMenuItem = {
  title: string;
  route: string;
};

const quickMenuItems: QuickMenuItem[] = [
  { title: "My Posts", route: "/my-posts" },
  { title: "Manage Buddies", route: "/buddy-list" },
  { title: "Manage Friends", route: "/friend-list" },
  { title: "Settings", route: "/settings" },
];

const MyProfile: React.FC = () => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [licensesVisible, setLicensesVisible] = useState(false);

  // 유저 데이터 및 로그인 상태 fetch
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }
        const res = await axios.get(`${SERVER_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        setUserData(res.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [SERVER_URL, router]);

  const handleLogout = async () => {
    try {
      await axios.post(`${SERVER_URL}/authStatus/logout`, {}, { withCredentials: true });
      localStorage.removeItem("token");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const handleImageChange = async (newImageUrl: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        `${SERVER_URL}/api/my-profile/select-character/${userData?.userId}`,
        { profileImage: newImageUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        setUserData((prev) =>
          prev
            ? {
                ...prev,
                profileImage: res.data.user.profileImage,
                profileThumbnail: res.data.user.profileThumbnail,
              }
            : prev
        );
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <p>{t("loading_profile")}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className={styles.error}>
        <p>{t("error_loading_profile")}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => router.back()}>
          &larr;
        </button>
        <h1 className={styles.headerTitle}>{t("my_profile")}</h1>
        <button className={styles.logoutButton} onClick={handleLogout}>
          {t("logout")}
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.profileSection}>
          <ProfileWithFlag
            userId={userData.userId ?? ""}
            profileImage={userData.profileImage ?? undefined}
            profileThumbnail={userData.profileThumbnail ?? undefined}
            size={120}
          />
          <div className={styles.profileInfo}>
            <h2 className={styles.nickname}>
              {userData.nickname || t("set_nickname")}
            </h2>
            {userData.trustBadge && (
              <div className={styles.trustBadge}>
                <Image
                  src="assets/TrustBadge.png"
                  alt="Trust Badge"
                  width={24}
                  height={24}
                />
              </div>
            )}
          </div>
        </div>

        <div className={styles.infoSections}>
          <div className={styles.infoSection}>
            <h3 className={styles.infoTitle}>{t("origin_country")}</h3>
            <p className={styles.infoText}>
              {userData.originCountry || t("unknown")}
            </p>
          </div>
          <div className={styles.infoSection}>
            <h3 className={styles.infoTitle}>{t("main_language")}</h3>
            <p className={styles.infoText}>
              {userData.mainLanguage || t("unknown")}
            </p>
          </div>
          <div className={styles.infoSection}>
            <h3 className={styles.infoTitle}>{t("current_country")}</h3>
            <p className={styles.infoText}>
              {userData.currentCountry || t("unknown")}
            </p>
          </div>
          <div className={styles.infoSection}>
            <h3 className={styles.infoTitle}>{t("current_city")}</h3>
            <p className={styles.infoText}>
              {userData.currentCity || t("unknown")}
            </p>
          </div>
          <div className={styles.infoSection}>
            <h3 className={styles.infoTitle}>{t("learning_languages")}</h3>
            <p className={styles.infoText}>
              {(userData.learningLanguage && userData.learningLanguage.join(", ")) ||
                t("none")}
            </p>
          </div>
          <div className={styles.infoSection}>
            <h3 className={styles.infoTitle}>{t("hobbies_title")}</h3>
            <p className={styles.infoText}>
              {(userData.hobbies && userData.hobbies.join(", ")) || t("none")}
            </p>
          </div>
          <div className={styles.infoSection}>
            <h3 className={styles.infoTitle}>{t("skills_title")}</h3>
            <p className={styles.infoText}>
              {(userData.skills && userData.skills.join(", ")) || t("none")}
            </p>
          </div>
          <div className={styles.infoSection}>
            <h3 className={styles.infoTitle}>{t("description")}</h3>
            <p className={styles.infoText}>
              {userData.description || t("no_description")}
            </p>
          </div>
        </div>

        <div className={styles.quickMenu}>
          {quickMenuItems.map((item, index) => (
            <button
              key={index}
              className={styles.quickMenuButton}
              onClick={() => router.push(item.route)}
            >
              {item.title}
            </button>
          ))}
        </div>
        <button
          className={styles.licensesButton}
          onClick={() => setLicensesVisible(true)}
        >
          {t("view_licenses")}
        </button>
      </main>

      <WebFooter />

      {licensesVisible && <Licenses onClose={() => setLicensesVisible(false)} />}
    </div>
  );
};

export default MyProfile;
