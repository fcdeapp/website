"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useConfig } from "../../context/ConfigContext";
import { useTranslation } from "react-i18next";

// 앱과 동일한 컴포넌트 및 오버레이 임포트
import ProfileWithFlag from "../../components/ProfileWithFlag";
import WebFooter from "../../components/WebFooter";
import Licenses from "../../components/Licenses";
import HobbiesSelectionOverlay from "../../overlays/HobbiesSelectionOverlay";
import SkillsSelectionOverlay from "../../overlays/SkillsSelectionOverlay";

// 국가 및 언어 플래그 (앱과 동일한 데이터)
import countryFlags from "../../constants/countryFlags";
import languageFlags from "../../constants/languageFlags";

import styles from "../../styles/pages/MyProfile.module.css";

// 사용자 응답 타입 (앱과 동일)
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
  { title: "Settings", route: "/setting" },
];

const MyProfile: React.FC = () => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();
  const [userData, setUserData] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 추가 모달 및 토글 관련 상태
  const [showLicenses, setShowLicenses] = useState(false);
  const [showEditNickname, setShowEditNickname] = useState(false);
  const [newNickname, setNewNickname] = useState("");
  const [showEditDescription, setShowEditDescription] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [showOriginCountryModal, setShowOriginCountryModal] = useState(false);
  const [accountPublic, setAccountPublic] = useState(true);
  const [messageEnabled, setMessageEnabled] = useState(true);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [headerOpaque, setHeaderOpaque] = useState(false);
  const [headerOffset, setHeaderOffset] = useState(90);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => {
      // window.scrollY가 0부터 90px까지는 offset이 (90 - scrollY)로 감소하고,
      // 90px 이상일 경우 0으로 고정합니다.
      setHeaderOffset(Math.max(90 - window.scrollY, 0));
      setHeaderOpaque(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 로그인 체크 (로컬스토리지에 isLoggedIn 값 확인)
  const isLoggedIn =
    typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true";
  useEffect(() => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    // 유저 정보 fetch (서버에서 데이터를 받아옴)
    const fetchUserData = async () => {
      try {
        const res = await axios.get(`${SERVER_URL}/users/me`, { withCredentials: true });
        const data = res.data as UserResponse;
        setUserData(data);
        setAccountPublic(data.isAccountPublic);
        setMessageEnabled(data.newMessageEnabled);
        setSelectedLanguages(data.learningLanguage || []);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [SERVER_URL, router, isLoggedIn]);

  // 스크롤 이벤트 – 헤더 배경 애니메이션 (스크롤 50px 이상 시 불투명 처리)
  useEffect(() => {
    const onScroll = () => {
      setHeaderOpaque(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 로그아웃 처리
  const handleLogout = async () => {
    try {
      await axios.post(`${SERVER_URL}/authStatus/logout`, {}, { withCredentials: true });
      localStorage.removeItem("isLoggedIn");
      router.push("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // 프로필 이미지 변경 – 파일 선택 후 업로드
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0 || !userData) return;
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append("profileImage", file);
    try {
      const res = await axios.put(
        `${SERVER_URL}/api/my-profile/select-character/${userData.userId}`,
        formData,
        { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.status === 200) {
        const updatedUser = res.data.user;
        setUserData((prev) =>
          prev
            ? {
                ...prev,
                profileImage: updatedUser.profileImage,
                profileThumbnail: updatedUser.profileThumbnail,
              }
            : prev
        );
      }
    } catch (error) {
      console.error("Error updating profile image:", error);
    }
  };

  // 파일 선택 창을 열기 위해 숨겨진 파일 input 클릭
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 닉네임 변경 – 모달에서 입력 후 서버 업데이트
  const updateNickname = async () => {
    if (!userData || newNickname.trim() === "") return;
    try {
      const res = await axios.put(
        `${SERVER_URL}/api/my-profile/select-character/${userData.userId}`,
        { nickname: newNickname },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setUserData((prev) => (prev ? { ...prev, nickname: newNickname } : prev));
        setShowEditNickname(false);
      }
    } catch (error) {
      console.error("Error updating nickname:", error);
    }
  };

  // 설명(Description) 업데이트 – 모달에서 편집 후 저장
  const updateDescription = async () => {
    if (!userData) return;
    try {
      const res = await axios.put(
        `${SERVER_URL}/users/settings`,
        { description: newDescription },
        { withCredentials: true }
      );
      if (res.status === 200) {
        setUserData((prev) => (prev ? { ...prev, description: newDescription } : prev));
        setShowEditDescription(false);
      }
    } catch (error) {
      console.error("Error updating description:", error);
    }
  };

  // 학습 언어 토글 – 선택한 언어 업데이트 후 서버에 저장
  const toggleLanguageSelection = (languageCode: string) => {
    setSelectedLanguages((prevSelectedLanguages) => {
      const updatedLanguages = prevSelectedLanguages.includes(languageCode)
        ? prevSelectedLanguages.filter((code) => code !== languageCode)
        : [...prevSelectedLanguages, languageCode];
      axios
        .put(
          `${SERVER_URL}/users/settings`,
          { learningLanguage: updatedLanguages },
          { withCredentials: true }
        )
        .catch((error) => console.error("Error updating learning languages:", error));
      return updatedLanguages;
    });
  };

  // 계정 공개 토글 변경
  const handleAccountToggle = async () => {
    const newStatus = !accountPublic;
    setAccountPublic(newStatus);
    try {
      await axios.put(
        `${SERVER_URL}/users/settings`,
        { isAccountPublic: newStatus },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error updating account public status:", error);
    }
  };

  // 메시지 수신 허용 토글 변경
  const handleMessageToggle = async () => {
    const newStatus = !messageEnabled;
    setMessageEnabled(newStatus);
    try {
      await axios.put(
        `${SERVER_URL}/users/settings`,
        { newMessageEnabled: newStatus },
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Error updating message enabled status:", error);
    }
  };

  // 브라우저 geolocation API를 통해 위치 업데이트 (현재 위치 기반 정보 업데이트)
  const updateLocation = () => {
    if (!navigator.geolocation) {
      alert(t("geolocation_not_supported"));
      return;
    }
    setUpdatingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await axios.put(
            `${SERVER_URL}/users/update-location`,
            { latitude, longitude },
            { withCredentials: true }
          );
          const { currentCountry, currentCity } = res.data;
          setUserData((prev) =>
            prev ? { ...prev, currentCountry, currentCity } : prev
          );
        } catch (error) {
          console.error("Error updating location:", error);
        } finally {
          setUpdatingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert(t("location_permission_denied"));
        setUpdatingLocation(false);
      }
    );
  };

  // ------------------------ 모달 컴포넌트 ------------------------

  // 닉네임 편집 모달
  const renderEditNicknameModal = () => (
    <div className={styles.modalOverlay} onClick={() => setShowEditNickname(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3>{t("edit_nickname")}</h3>
        <input
          type="text"
          className={styles.modalInput}
          value={newNickname}
          onChange={(e) => setNewNickname(e.target.value)}
          placeholder={t("enter_new_nickname")}
        />
        <button className={styles.saveButton} onClick={updateNickname}>
          {t("save")}
        </button>
      </div>
    </div>
  );

  // 설명 편집 모달
  const renderEditDescriptionModal = () => (
    <div className={styles.modalOverlay} onClick={() => setShowEditDescription(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3>{t("edit_description")}</h3>
        <textarea
          className={styles.modalTextarea}
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder={t("enter_description")}
        />
        <button className={styles.saveButton} onClick={updateDescription}>
          {t("save")}
        </button>
      </div>
    </div>
  );

  // 학습 언어 선택 모달
  const renderLanguageModal = () => (
    <div className={styles.modalOverlay} onClick={() => setShowLanguageModal(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3>{t("select_languages")}</h3>
        <div className={styles.languageOptions}>
          {Object.keys(languageFlags).map((lang) => (
            <button
              key={lang}
              className={`${styles.languageButton} ${
                selectedLanguages.includes(lang) ? styles.selectedLanguage : ""
              }`}
              onClick={() => toggleLanguageSelection(lang)}
            >
              <img
                src={languageFlags[lang as keyof typeof languageFlags]}
                alt={t(lang)}
                width={24}
                height={24}
              />
              <span className={styles.languageText}>{t(lang)}</span>
            </button>
          ))}
        </div>
        <button className={styles.saveButton} onClick={() => setShowLanguageModal(false)}>
          {t("confirm")}
        </button>
      </div>
    </div>
  );
  
  // 원산지 국가 선택 모달 – 앱과 동일한 로직: countryFlags 객체를 순회
  const renderOriginCountryModal = () => (
    <div className={styles.modalOverlay} onClick={() => setShowOriginCountryModal(false)}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h3>{t("select_origin_country")}</h3>
        <div className={styles.countryOptions}>
          {Object.keys(countryFlags).map((country) => (
            <button
              key={country}
              className={styles.countryButton}
              onClick={async () => {
                try {
                  await axios.put(
                    `${SERVER_URL}/users/settings`,
                    { originCountry: country },
                    { withCredentials: true }
                  );
                  setUserData((prev) =>
                    prev ? { ...prev, originCountry: country } : prev
                  );
                  setShowOriginCountryModal(false);
                } catch (error) {
                  console.error("Error updating origin country:", error);
                }
              }}
            >
              <img src={countryFlags[country as keyof typeof countryFlags]} alt={t(country)} width={24} height={24} />
              <span className={styles.countryText}>{t(country)}</span>
            </button>
          ))}
        </div>
        <button className={styles.saveButton} onClick={() => setShowOriginCountryModal(false)}>
          {t("confirm")}
        </button>
      </div>
    </div>
  );

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
      <header
        className={`${styles.header} ${headerOpaque ? styles.opaque : ""}`}
        style={{ top: `${headerOffset}px` }}
      >
        <button className={styles.backButton} onClick={() => router.back()}>
          <img src="/assets/back-light.png" alt="Back" width={24} height={24} />
        </button>
        <h1 className={styles.headerTitle}>{t("my_profile")}</h1>
        <button className={styles.logoutButton} onClick={handleLogout}>
          {t("logout")}
        </button>
      </header>

      <main className={styles.main}>
        <div className={styles.profileSection}>
          <div className={styles.imageWrapper}>
            <ProfileWithFlag
              userId={userData.userId ?? ""}
              profileImage={userData.profileImage ?? undefined}
              profileThumbnail={userData.profileThumbnail ?? undefined}
              size={120}
            />
            <button className={styles.changeImageButton} onClick={triggerFileInput}>
              {t("change_image")}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className={styles.fileInput}
              onChange={handleFileChange}
            />
          </div>
          <div className={styles.profileInfo}>
            <h2
              className={styles.nickname}
              onClick={() => {
                setNewNickname(userData.nickname || "");
                setShowEditNickname(true);
              }}
            >
              {userData.nickname || t("set_nickname")}
            </h2>
            {userData.trustBadge && (
              <div className={styles.trustBadge}>
                <img src="/assets/TrustBadge.png" alt="Trust Badge" width={24} height={24} />
              </div>
            )}
          </div>
        </div>

        {/* 정보 카드 */}
        <div className={styles.infoSections}>
          <div className={styles.infoSection} onClick={() => setShowOriginCountryModal(true)}>
            <h3 className={styles.infoTitle}>{t("origin_country")}</h3>
            <p className={styles.infoText}>
              {userData.originCountry || t("unknown")}
            </p>
          </div>
          <div className={styles.infoSection} onClick={() => setShowLanguageModal(true)}>
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
          <div className={styles.infoSection} onClick={() => setShowLanguageModal(true)}>
            <h3 className={styles.infoTitle}>{t("learning_languages")}</h3>
            <p className={styles.infoText}>
              {selectedLanguages.length > 0 ? selectedLanguages.join(", ") : t("none")}
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
          <div className={styles.infoSection} onClick={() => {
              setNewDescription(userData.description || "");
              setShowEditDescription(true);
            }}>
            <h3 className={styles.infoTitle}>{t("description")}</h3>
            <p className={styles.infoText}>
              {userData.description || t("no_description")}
            </p>
          </div>
        </div>

        {/* 설정 토글 */}
        <div className={styles.settingsSection}>
          <div className={styles.toggleRow}>
            <span>{t("account_visible")}</span>
            <label className={styles.switch}>
              <input type="checkbox" checked={accountPublic} onChange={handleAccountToggle} />
              <span className={styles.slider}></span>
            </label>
          </div>
          <div className={styles.toggleRow}>
            <span>{t("new_message_enabled")}</span>
            <label className={styles.switch}>
              <input type="checkbox" checked={messageEnabled} onChange={handleMessageToggle} />
              <span className={styles.slider}></span>
            </label>
          </div>
        </div>
        {/* 퀵 메뉴  추가 액션 버튼 */}
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
          {/* Update Location */}
          <button
            className={styles.quickMenuButton}
            onClick={updateLocation}
            disabled={updatingLocation}
          >
            {updatingLocation ? t("updating_location") : t("update_location")}
          </button>
          {/* View Licenses */}
          <button
            className={styles.quickMenuButton}
            onClick={() => setShowLicenses(true)}
          >
            {t("view_licenses")}
          </button>
        </div>
      </main>

      <WebFooter />

      {/* 모달들 */}
      {showEditNickname && renderEditNicknameModal()}
      {showEditDescription && renderEditDescriptionModal()}
      {showLanguageModal && renderLanguageModal()}
      {showOriginCountryModal && renderOriginCountryModal()}
      {/* 앱에서 제공하는 Hobbies/Skills 오버레이 – 웹에서는 별도 인터페이스가 이미 있으므로 동일하게 처리 */}
      <HobbiesSelectionOverlay visible={false} onClose={() => {}} selectedHobbies={[]} setSelectedHobbies={() => {}} />
      <SkillsSelectionOverlay visible={false} onClose={() => {}} selectedSkills={[]} setSelectedSkills={() => {}} />
      {showLicenses && <Licenses onClose={() => setShowLicenses(false)} />}
    </div>
  );
};

export default MyProfile;
