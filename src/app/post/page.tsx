"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
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
const homeOwlAnimation = "/assets/HomeOwlPink.json";

const getScreenWidth = () => (typeof window !== "undefined" ? window.innerWidth : 375);
const POSTS_CACHE_KEY = "@cached_posts";

const Post: React.FC = () => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();

  // State for posts, topics, and various UI controls
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [screenWidth, setScreenWidth] = useState(getScreenWidth());
  const [isTablet, setIsTablet] = useState(screenWidth >= 768);
  const [flatListKey, setFlatListKey] = useState("default");
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  const [isCompact, setIsCompact] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginOverlayVisible, setLoginOverlayVisible] = useState<boolean>(false);

  // Topics (for TopicSlider)
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

  // Posts state
  const [postData, setPostData] = useState<any[]>([]);
  const [allPosts, setAllPosts] = useState<any[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // User/location state
  const [regionInfo, setRegionInfo] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileThumbnail, setProfileThumbnail] = useState<string | null>(null);
  const [originCountry, setOriginCountry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [cachedLocation, setCachedLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Idle timer logic
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

  // Check login status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  // Update screen width on resize
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

  // Simulate post fetching (replace with real API calls)
  useEffect(() => {
    setTimeout(() => {
      const fakePosts = [
        {
          _id: "1",
          author: "John Doe",
          time: "2023-04-01T12:00:00Z",
          meetingTime: "2023-04-02T15:00:00Z",
          meetingPlace: "Central Park",
          meetingCity: "New York",
          meetingCountry: "USA",
          category: "tech",
          title: "Post Title 1",
          content: "This is the content of post 1.",
          likes: 10,
          comments: 5,
          visitors: 100,
          nicknameOption: "default",
          profileImage: "/assets/default-profile.png",
          profileThumbnail: "/assets/default-profile-thumb.png",
          image: "/assets/post1.jpg",
          thumbnail: "/assets/post1-thumb.jpg",
          likedUsers: [],
          visitedUsers: [],
          commentList: [],
          applicantsCount: 2,
          recruitmentCount: 5,
          userId: "1",
          applicants: [],
          isBuddyPost: false,
          meetingLatitude: 40.7128,
          meetingLongitude: -74.0060,
        },
        // Add more posts as needed
      ];
      setAllPosts(fakePosts);
      setPostData(fakePosts);
      setInitialLoadComplete(true);
    }, 1000);
  }, []);

  // Handle scroll for compact header
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const offsetY = e.currentTarget.scrollTop;
    setIsCompact(offsetY > 50);
  };

  // Navigate to search page
  const handleSearch = () => {
    if (searchTerm.trim()) {
      router.push(`/search?searchTerm=${encodeURIComponent(searchTerm)}`);
    }
  };

  // Render a post using PostMain component
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
        applicants={post.applicants.map((a: any) => a.userId) || []}
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
      {/* Fixed Header */}
      <div className={styles.fixedHeader}>
        <div className={styles.header}>
          <button className={styles.logoButton} onClick={() => { /* Owl click animation */ }}>
            <Lottie
              animationData={homeOwlAnimation}
              loop={false}
              className={styles.owlAnimation}
              onComplete={() => {}}
            />
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

      {/* Post List */}
      <div className={styles.flatList} key={flatListKey}>
        {allPosts.map((post) => renderPost(post))}
      </div>

      {/* Topic Slider and Filter Controls */}
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

      {/* Filter Overlay */}
      <FilterOverlay
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        sortOption={sortOption}
        setSortOption={setSortOption}
        nearbyOption={nearbyOption}
        setNearbyOption={setNearbyOption}
        countryOption={countryOption}
        setCountryOption={setCountryOption}
        currentCountry={""}
        currentCity={""}
      />

      {/* Subject Order Overlay */}
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
