"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useConfig } from "../../context/ConfigContext";
import TopicSlider from "../../components/TopicSlider";
import PostMain from "../../components/PostMain";
import FilterOverlay from "../../components/FilterOverlay";
import MySubjectOrderChangeOverlay from "../../overlays/MySubjectOrderChangeOverlay";
import LoginDecisionOverlay from "../../overlays/LoginDecisionOverlay";
import { getDistrictNameFromCoordinates } from "../../utils/locationUtils";
import Lottie from "lottie-react";
import styles from "../../styles/pages/Post.module.css";
import ProfileWithFlag from "../../components/ProfileWithFlag";
import homeOwlAnimationData from "../../../public/assets/HomeOwlPink.json";


const getScreenWidth = () =>
  typeof window !== "undefined" ? window.innerWidth : 375;

const Post: React.FC = () => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();

  // UI & 기본 상태
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [screenWidth, setScreenWidth] = useState(getScreenWidth());
  const [isTablet, setIsTablet] = useState(screenWidth >= 768);
  const [flatListKey, setFlatListKey] = useState("default");
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  // 로그인 및 프로필 관련
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginOverlayVisible, setLoginOverlayVisible] = useState<boolean>(false);

  // 토픽/필터 관련
  const defaultTopics = [
    { key: "language_study", color: "#D8315B" },
    { key: "cooking_enthusiasts", color: "#F2542D" },
    { key: "volunteer_activities", color: "#D8315B" },
    { key: "fitness_group", color: "#F2542D" },
    { key: "international_food_exchange", color: "#D8315B" },
    { key: "team_sports", color: "#F2542D" },
  ];
  const [myTopics, setMyTopics] = useState(defaultTopics);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(
    myTopics.map((topic) => topic.key)
  );
  const [sortOption, setSortOption] = useState<string>(t("popularity"));
  const [nearbyOption, setNearbyOption] = useState<string>(t("nearby-only"));
  const [countryOption, setCountryOption] = useState<string>(t("all_countries"));
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [overlayVisible, setOverlayVisible] = useState<boolean>(false);

  // 게시물 및 페이징 관련 상태
  const [postData, setPostData] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 사용자/위치 정보 상태
  const [regionInfo, setRegionInfo] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileThumbnail, setProfileThumbnail] = useState<string | null>(null);
  const [originCountry, setOriginCountry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [cachedLocation, setCachedLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // 이전 필터 상태 (필터 변경 시 비교용)
  const [prevSortOption, setPrevSortOption] = useState<string>(sortOption);
  const [prevNearbyOption, setPrevNearbyOption] = useState<string>(nearbyOption);
  const [prevCountryOption, setPrevCountryOption] = useState<string>(countryOption);
  const [prevSelectedTopics, setPrevSelectedTopics] = useState<string[]>(
    selectedTopics
  );
  const [prevMyTopics, setPrevMyTopics] = useState(myTopics);

  // 헤더 축소 상태
  const [isCompact, setIsCompact] = useState(false);

  // ─── IDLE TIMER ──────────────────────────────────────────────
  const resetIdleTimer = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    setIsIdle(false);
    idleTimer.current = setTimeout(() => setIsIdle(true), 60000);
  };

  useEffect(() => {
    resetIdleTimer();
    const handleActivity = () => resetIdleTimer();
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  // ─── 로그인 상태 체크 (localStorage) ─────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // ─── 화면 크기 업데이트 ─────────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      const updatedWidth = window.innerWidth;
      setScreenWidth(updatedWidth);
      const updatedIsTablet = updatedWidth >= 768;
      if (updatedIsTablet !== isTablet) {
        setIsTablet(updatedIsTablet);
        setFlatListKey(`key-${updatedWidth}`);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isTablet]);

  // ─── 로그인 사용자의 프로필 데이터 fetch ─────────────────────────
  useEffect(() => {
    if (isLoggedIn) {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("userId");
      setUserId(id);
      axios
        .get(`${SERVER_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const { profileImage, profileThumbnail, originCountry } = response.data;
          setProfileImage(profileImage || null);
          setProfileThumbnail(profileThumbnail || null);
          setOriginCountry(originCountry || null);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
          setProfileImage(null);
          setProfileThumbnail(null);
        });
    }
  }, [isLoggedIn, SERVER_URL]);

  // ─── 브라우저 Geolocation을 이용한 위치정보 fetch 및 역지오코딩 ───────
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCachedLocation({ latitude, longitude });
          getDistrictNameFromCoordinates(latitude, longitude, SERVER_URL)
            .then((districtData) => {
              if (districtData) {
                const { country, city } = districtData;
                setOriginCountry(country || null);
                setRegionInfo(city || "");
              } else {
                setRegionInfo(t("location_not_available"));
              }
            })
            .catch((err) => {
              console.error("Error in reverse geocoding:", err);
              setRegionInfo(t("location_not_available"));
            });
        },
        (error) => {
          console.error("Error fetching geolocation:", error);
          setRegionInfo(t("location_not_available"));
        }
      );
    }
  }, [SERVER_URL, t]);

  // ─── 서버에서 필터에 따른 게시물 데이터 fetch ──────────────────────
  const fetchFilteredPosts = async (pageNumber: number, isRefreshing = false) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const topicsQuery = selectedTopics.join(",");
      const response = await axios.get(`${SERVER_URL}/posts/filter`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        params: {
          sort: sortOption,
          nearbyOption,
          topics: topicsQuery,
          page: pageNumber,
          limit: 10,
          lat: cachedLocation ? cachedLocation.latitude : 0,
          lng: cachedLocation ? cachedLocation.longitude : 0,
          countryFilter:
            countryOption === t("same_country") ? originCountry : "",
        },
      });
      const newData = response.data;
      if (isRefreshing) {
        setAllPosts(newData);
        setPostData(newData);
      } else {
        setAllPosts((prev) => {
          const combined = [...prev, ...newData];
          const uniquePosts = Array.from(
            new Map(combined.map((item) => [item._id, item])).values()
          );
          return uniquePosts;
        });
        setPostData((prev) => {
          const combined = [...prev, ...newData];
          const uniquePosts = Array.from(
            new Map(combined.map((item) => [item._id, item])).values()
          );
          // 선택된 토픽에 해당하는 게시물만 필터링
          const filteredPosts = uniquePosts.filter((post) =>
            selectedTopics.includes(post.category)
          );
          return filteredPosts;
        });
      }
      if (newData.length < 10) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoading(false);
      setInitialLoadComplete(true);
    }
  };

  // ─── 컴포넌트 마운트 시 초기 게시물 fetch ───────────────────────────
  useEffect(() => {
    setPage(1);
    fetchFilteredPosts(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── 페이지 번호 증가 시 추가 데이터 fetch (무한 스크롤) ─────────────
  useEffect(() => {
    if (page > 1) {
      fetchFilteredPosts(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // ─── 필터 오버레이 종료 시 변경된 필터 적용 (앱 코드와 동일) ───────
  useEffect(() => {
    if (!filterVisible) {
      const hasChanges =
        prevSortOption !== sortOption ||
        prevNearbyOption !== nearbyOption ||
        prevCountryOption !== countryOption ||
        JSON.stringify(prevSelectedTopics) !== JSON.stringify(selectedTopics);
      if (hasChanges) {
        setPage(1);
        fetchFilteredPosts(1, true);
        setPrevSortOption(sortOption);
        setPrevNearbyOption(nearbyOption);
        setPrevCountryOption(countryOption);
        setPrevSelectedTopics(selectedTopics);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterVisible]);

  // ─── 토픽 순서 오버레이 종료 시 변경 사항 적용 ──────────────────────────
  useEffect(() => {
    if (!overlayVisible) {
      const hasChanges =
        JSON.stringify(prevMyTopics) !== JSON.stringify(myTopics);
      if (hasChanges) {
        setPage(1);
        fetchFilteredPosts(1, true);
        setPrevMyTopics(myTopics);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlayVisible]);

  // ─── 스크롤 이벤트: 헤더 축소 및 무한 스크롤 처리 ─────────────────────
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setIsCompact(scrollTop > 50);
    // 스크롤이 바닥에 근접하면 다음 페이지 로드
    if (scrollHeight - scrollTop - clientHeight < 100 && !isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // ─── 검색 처리 ─────────────────────────────────────────────────────
  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    }
  };

  // ─── 개별 게시물 렌더링 ─────────────────────────────────────────────
  const renderPost = (post: any) => (
    <div
      key={post._id}
      className={isTablet ? styles.postContainerTablet : styles.postContainer}
    >
      <PostMain
        postId={post._id}
        author={post.author}
        time={post.time}
        meetingTime={post.meetingTime}
        meetingPlace={post.meetingPlace}
        meetingCity={post.meetingCity}
        meetingCountry={post.meetingCountry}
        category={post.category}
        title={post.title}
        content={post.content}
        likes={post.likes}
        comments={post.comments}
        visitors={post.visitors}
        nicknameOption={post.nicknameOption}
        profileImage={post.profileImage}
        profileThumbnail={post.profileThumbnail}
        image={post.image}
        thumbnail={post.thumbnail}
        likedUsers={post.likedUsers}
        visitedUsers={post.visitedUsers}
        commentList={post.commentList}
        applicantsCount={post.applicantsCount}
        recruitmentCount={post.recruitmentCount}
        userId={post.userId}
        applicants={post.applicants?.map((a: any) => a.userId) || []}
        isBuddyPost={false}
        latitude={post.meetingLatitude}
        longitude={post.meetingLongitude}
      />
    </div>
  );

  return (
    <div className={styles.container} onScroll={handleScroll}>
      {loginOverlayVisible && (
        <LoginDecisionOverlay
          visible={loginOverlayVisible}
          onLogin={() => {
            setLoginOverlayVisible(false);
            router.push("/signInLogIn");
          }}
          onBrowse={() => setLoginOverlayVisible(false)}
        />
      )}
      {/* ─── Fixed Header ───────────────────────────────────────────── */}
      <div className={styles.fixedHeader}>
        <div className={styles.header}>
          <button
            className={styles.logoButton}
            onClick={() => {
              /* Owl click animation 처리 */
            }}
          >
            <Lottie
              animationData={homeOwlAnimationData}
              loop={false}
              className={styles.owlAnimation}
              onComplete={() => {}}
            />
            <img
              className={styles.logo}
              src={
                isIdle
                  ? "/assets/sleepingOwl.png"
                  : "/assets/Owl-icon-pink.png"
              }
              alt="Logo"
            />
          </button>
          <div className={styles.gradientBorderSearch}>
            <input
              className={styles.searchBar}
              placeholder={t("search_placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={handleSearch}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
            />
          </div>
          <button
            className={styles.profileButton}
            onClick={() => {
              if (!isLoggedIn) {
                setLoginOverlayVisible(true);
              }
            }}
          >
            <ProfileWithFlag
              userId={userId || ""}
              profileImage={profileImage || ""}
              profileThumbnail={profileThumbnail || ""}
              size={48}
            />
          </button>
        </div>
      </div>

      {/* ─── 게시물 리스트 ───────────────────────────────────────────── */}
      <div className={styles.flatList} key={flatListKey}>
        {postData.map((post) => renderPost(post))}
        {isLoading && <div className={styles.loadingIndicator}>{t("loading_posts")}</div>}
      </div>

      {/* ─── 토픽 슬라이더 및 필터 컨트롤 ─────────────────────────────── */}
      <div className={styles.topicSlideContainer}>
        <TopicSlider
          myTopics={myTopics}
          selectedTopics={selectedTopics}
          setSelectedTopics={setSelectedTopics}
          isCompact={isCompact}
          handleSelectTopic={(topicKey, index) => {
            if (topicKey === "no_topic") {
              setSelectedTopics([...myTopics.map((t) => t.key), "no_topic"]);
            } else {
              let updated = selectedTopics.includes(topicKey)
                ? selectedTopics.filter((t) => t !== topicKey)
                : [...selectedTopics, topicKey];
              if (!updated.includes("no_topic")) updated.push("no_topic");
              setSelectedTopics(updated);
            }
          }}
          t={t}
        />
        <div className={styles.sortAndFilterRow}>
          <div className={styles.togglesContainer}>
            <button
              className={styles.changeTopicButton}
              onClick={() => setFilterVisible(true)}
            >
              {t("filter")}
            </button>
          </div>
          <button
            className={styles.changeTopicButton}
            onClick={() => setOverlayVisible(true)}
          >
            {t("change_topic_order")}
          </button>
        </div>
      </div>

      {/* ─── Filter Overlay ─────────────────────────────────────────── */}
      <FilterOverlay
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        sortOption={sortOption}
        setSortOption={setSortOption}
        nearbyOption={nearbyOption}
        setNearbyOption={setNearbyOption}
        countryOption={countryOption}
        setCountryOption={setCountryOption}
        currentCountry={originCountry || ""}
        currentCity={regionInfo}
      />

      {/* ─── Subject Order Overlay ───────────────────────────────────── */}
      {overlayVisible && (
        <MySubjectOrderChangeOverlay
          visible={overlayVisible}
          onClose={() => setOverlayVisible(false)}
          myTopics={myTopics}
          setMyTopics={setMyTopics}
        />
      )}
    </div>
  );
};

export default Post;
