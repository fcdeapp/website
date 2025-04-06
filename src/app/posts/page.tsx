"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
import styles from "../../styles/pages/Post.module.css";
import ProfileWithFlag from "../../components/ProfileWithFlag";

const getScreenWidth = () =>
  typeof window !== "undefined" ? window.innerWidth : 375;
const POSTS_CACHE_KEY = "@cached_posts";

const Post: React.FC = () => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();

  /* ─── 기본 상태 ───────────────────────────────────────────── */
  const [screenWidth, setScreenWidth] = useState(getScreenWidth());
  const [isTablet, setIsTablet] = useState(screenWidth >= 768);
  const [flatListKey, setFlatListKey] = useState("default");
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  /* ─── 로그인 및 프로필 ─────────────────────────────────────── */
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginOverlayVisible, setLoginOverlayVisible] = useState<boolean>(false);

  /* ─── 토픽/필터 ────────────────────────────────────────────── */
  const defaultTopics = [
    { key: "language_study", color: "#D8315B" },
    { key: "cooking_enthusiasts", color: "#F2542D" },
    { key: "volunteer_activities", color: "#D8315B" },
    { key: "fitness_group", color: "#F2542D" },
    { key: "international_food_exchange", color: "#D8315B" },
    { key: "team_sports", color: "#F2542D" },
  ];
  const [myTopics, setMyTopics] = useState(defaultTopics);
  const [selectedTopics, setSelectedTopics] = useState<string[]>(defaultTopics.map(t => t.key));
  const [sortOption, setSortOption] = useState<string>(t("popularity"));
  const [nearbyOption, setNearbyOption] = useState<string>(t("nearby-only"));
  const [countryOption, setCountryOption] = useState<string>(t("all_countries"));
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  const [overlayVisible, setOverlayVisible] = useState<boolean>(false);

  /* ─── 게시물 및 페이징 ───────────────────────────────────────── */
  const [postData, setPostData] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /* ─── 사용자/위치 정보 ───────────────────────────────────────── */
  const [regionInfo, setRegionInfo] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileThumbnail, setProfileThumbnail] = useState<string | null>(null);
  const [originCountry, setOriginCountry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [cachedLocation, setCachedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  /* ─── 이전 필터 상태 (비교용) ────────────────────────────────── */
  const [prevSortOption, setPrevSortOption] = useState<string>(sortOption);
  const [prevNearbyOption, setPrevNearbyOption] = useState<string>(nearbyOption);
  const [prevCountryOption, setPrevCountryOption] = useState<string>(countryOption);
  const [prevSelectedTopics, setPrevSelectedTopics] = useState<string[]>(selectedTopics);
  const [prevMyTopics, setPrevMyTopics] = useState(defaultTopics);

  /* ─── 헤더 축소 상태 ────────────────────────────────────────── */
  const [isCompact, setIsCompact] = useState(false);
  const [headerOpacity, setHeaderOpacity] = useState(1);

  /* ─── Idle Timer ───────────────────────────────────────────── */
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

  /* ─── 로그인 상태 체크 ─────────────────────────────────────── */
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  /* ─── 화면 크기 업데이트 ───────────────────────────────────── */
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

  /* ─── 프로필 데이터 fetch ───────────────────────────────────── */
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

  /* ─── Geolocation 및 역지오코딩 ────────────────────────────────── */
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

  /* ─── 게시물 데이터 fetch (필터, 무한 스크롤) ───────────────────── */
  const fetchFilteredPosts = async (pageNumber: number, isRefreshing = false) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const topicsQuery = selectedTopics.join(",");
      const response = await axios.get(`${SERVER_URL}/posts/filter`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
        params: {
          sort: sortOption,
          nearbyOption,
          topics: topicsQuery,
          page: pageNumber,
          limit: 10,
          lat: cachedLocation ? cachedLocation.latitude : 0,
          lng: cachedLocation ? cachedLocation.longitude : 0,
          countryFilter: countryOption === t("same_country") ? originCountry : "",
        },
      });
      const newData = response.data;
      if (isRefreshing) {
        setAllPosts(newData);
        setPostData(newData);
      } else {
        setAllPosts((prev) => {
          const combined = [...prev, ...newData];
          const uniquePosts = Array.from(new Map(combined.map(item => [item._id, item])).values());
          return uniquePosts;
        });
        setPostData((prev) => {
          const combined = [...prev, ...newData];
          const uniquePosts = Array.from(new Map(combined.map(item => [item._id, item])).values());
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
    }
  };

  /* ─── 초기 게시물 fetch ─────────────────────────────────────── */
  useEffect(() => {
    setPage(1);
    fetchFilteredPosts(1, true);
  }, []);

  /* ─── 페이지 번호 변화에 따른 추가 데이터 fetch (무한 스크롤) ───── */
  useEffect(() => {
    if (page > 1) {
      fetchFilteredPosts(page);
    }
  }, [page]);

  /* ─── 필터 오버레이 종료 후 변경 적용 ────────────────────────── */
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
  }, [filterVisible]);

  /* ─── 토픽 순서 오버레이 종료 후 변경 적용 ───────────────────────── */
  useEffect(() => {
    if (!overlayVisible) {
      const hasChanges = JSON.stringify(prevMyTopics) !== JSON.stringify(myTopics);
      if (hasChanges) {
        setPage(1);
        fetchFilteredPosts(1, true);
        setPrevMyTopics(myTopics);
      }
    }
  }, [overlayVisible]);

  /* ─── 스크롤 이벤트: 헤더 축소 및 무한 스크롤 ───────────────────── */
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollTop > 50 && !isCompact) {
      setIsCompact(true);
      setHeaderOpacity(0);
    } else if (scrollTop <= 50 && isCompact) {
      setIsCompact(false);
      setHeaderOpacity(1);
    }
    if (scrollHeight - scrollTop - clientHeight < 100 && !isLoading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  /* ─── 검색 처리 ───────────────────────────────────────────── */
  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    }
  };

  /* ─── 개별 게시물 렌더링 ────────────────────────────────────── */
  const renderPost = (post: any) => (
    <div key={post._id} className={isTablet ? styles.postContainerTablet : styles.postContainer}>
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

  /* ─── 인터리브 데이터 (광고 등 삽입) ───────────────────────────── */
  const getInterleavedData = () => {
    const interleaved: any[] = [];
    postData.forEach((post, index) => {
      interleaved.push({ type: "post", data: post });
      if ((index + 1) % 5 === 0) {
        interleaved.push({ type: "ad", key: `ad-${index}` });
      }
    });
    return interleaved;
  };

  /* ─── 광고 또는 게시물 렌더링 ──────────────────────────────────── */
  const renderItem = (item: any, index: number) => {
    if (item.type === "ad") {
      return (
        <div className={styles.adContainer} key={`ad-${index}`}>
          <p>AD</p>
          {/* 광고 컴포넌트 추가 가능 */}
        </div>
      );
    } else {
      return renderPost(item.data ? item.data : item);
    }
  };
  
  if (isLoading && page === 1) {
    return (
      <div className={styles.loadingContainer}>
        <p className={styles.loadingText}>{t("loading_posts")}</p>
      </div>
    );
  }

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
      <div className={styles.fixedHeader} style={{ opacity: headerOpacity }}>
        <div className={styles.header}>
          <button className={styles.logoButton} onClick={() => {}}>
            <img
              className={styles.logo}
              src={isIdle ? "/assets/sleepingOwl.png" : "/assets/Owl-icon-pink.png"}
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
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            className={styles.profileButton}
            onClick={() => {
              if (!isLoggedIn) setLoginOverlayVisible(true);
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
      <div className={styles.flatList} key={flatListKey}>
        {getInterleavedData().map(renderItem)}
        {isLoading && <div className={styles.loadingIndicator}>{t("loading_posts")}</div>}
      </div>
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
            <button className={styles.changeTopicButton} onClick={() => setFilterVisible(true)}>
              {t("filter")}
            </button>
          </div>
          <button className={styles.changeTopicButton} onClick={() => setOverlayVisible(true)}>
            {t("change_topic_order")}
          </button>
        </div>
      </div>
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
