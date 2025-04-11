"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import styles from "../styles/pages/SearchPage.module.css";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { useConfig } from "../context/ConfigContext";

// 앱에서 이미 만들어진 컴포넌트들을 웹에서도 그대로 임포트합니다.
import PostMain from "./PostMain";
import FriendSearchItem from "./FriendSearchItem";
import BuddySearchItem from "./BuddySearchItem";
import LoginDecisionOverlay from "../overlays/LoginDecisionOverlay";
import WebFooter from "./WebFooter";

  interface Post {
    _id: string;
    author: string;
    time: string;
    meetingTime?: string;
    meetingPlace?: string;
    meetingCountry?: string;
    meetingCity?: string;
    recruitmentCount?: number;
    category: string;
    title: string;
    content: string;
    likes: number;
    comments: number;
    commentList?: { 
      author: string; 
      time: string; 
      content: string; 
      profileImage: string; 
    }[];
    visitors: number;
    profileImage?: string;
    profileThumbnail?: string;
    image?: string;
    nicknameOption: string;
    applicantsCount?: number;
    meetingLatitude?: number;
    meetingLongitude?: number;
  }

interface Friend {
  userId: string; 
  profileImage?: string;
  profileThumbnail?: string;
  nickname: string;
}

interface Buddy {
  buddyGroupId: string;
  buddyGroupName: string;
  buddyPhoto?: string;
  buddyPhotoMedium?: string;
  buddyPhotoThumbnail?: string;
  description?: string;
  members?: { 
    userId: string; 
    profileImage?: string;
    profileThumbnail?: string;
    nickname: string;
  }[];
}

const SearchPage = () => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const querySearchTerm = searchParams.get("searchTerm") || "";

  const [userId, setUserId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchType, setSearchType] = useState<"post" | "friend" | "buddy">("post");
  const [searchResults, setSearchResults] = useState<Post[] | Friend[] | Buddy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [overlayVisible, setOverlayVisible] = useState<boolean>(false);

  const lastSearchTimeRef = useRef<number>(0);
  const SEARCH_THROTTLE_MS = 1000;

  useEffect(() => {
    if (querySearchTerm) {
      setSearchTerm(querySearchTerm);
    }
  }, [querySearchTerm]);

  const handleSearch = async (page = 1) => {
    if (typeof window === "undefined") return;
    const now = Date.now();
    if (now - lastSearchTimeRef.current < SEARCH_THROTTLE_MS) return;
    lastSearchTimeRef.current = now;
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    try {
      const searchEndpoint =
        searchType === "post"
          ? "posts"
          : searchType === "friend"
          ? "users"
          : "buddies";
      const limit = searchType === "friend" ? 20 : 10;
      const response = await axios.get(
        `${SERVER_URL}/search/${searchEndpoint}?query=${encodeURIComponent(
          searchTerm
        )}&page=${page}&limit=${limit}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true, 
        }
      );
      if (response.status !== 200) {
        console.error("Error fetching search results:", response.statusText);
        setIsLoading(false);
        return;
      }
      const data = response.data;
      let newResults: any[] = [];
      if (searchType === "friend") {
        newResults = data.friends || [];
      } else if (searchType === "post") {
        newResults = data.posts || [];
      } else {
        newResults = data.results || [];
      }
      if (page > 1) {
        setSearchResults((prev) => [...prev, ...newResults]);
      } else {
        setSearchResults(newResults);
      }
      setHasMore(page < data.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchTerm.length > 0) {
      setCurrentPage(1);
      setSearchResults([]);
      handleSearch(1);
    }
  }, [searchTerm, searchType]);

  // 로그인 상태 체크
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(localStorage.getItem("isLoggedIn") === "true");
    }
  }, []);

  // 로그인 상태에 따라 오버레이 표시 여부를 결정합니다.
  useEffect(() => {
    if (isLoggedIn) {
      setOverlayVisible(false);
    } else {
      setOverlayVisible(true);
    }
  }, [isLoggedIn]);

  // 사용자 정보 fetch
  useEffect(() => {
    const fetchUserId = async () => {
      if (typeof window !== "undefined") {
          try {
            const response = await axios.get(`${SERVER_URL}/users/me`, {
              headers: { 
                "Content-Type": "application/json",
              },
              withCredentials: true, 
            });
            if (response.status === 200) {
              setUserId(response.data.userId);
            }
          } catch (error) {
            console.error("Error fetching user data:", error);
          }
      }
    };
    fetchUserId();
  }, []);

  const renderResult = (item: Post | Friend | Buddy) => {
    if ("_id" in item) {
      const post = item as Post;
      return (
        <PostMain
          key={post._id}
          postId={post._id}
          author={post.author}
          time={post.time}
          meetingTime={post.meetingTime || ""}
          meetingPlace={post.meetingPlace || ""}
          meetingCountry={post.meetingCountry || ""}
          meetingCity={post.meetingCity || ""}
          category={post.category}
          title={post.title}
          content={post.content}
          likes={post.likes}
          comments={post.comments}
          visitors={post.visitors}
          commentList={post.commentList || []}
          visitedUsers={(post as any).visitedUsers || []}
          likedUsers={(post as any).likedUsers || []}
          recruitmentCount={post.recruitmentCount || 0}
          applicantsCount={(post as any).applicantsCount || 0}
          profileImage={post.profileImage || ""}
          profileThumbnail={post.profileThumbnail || ""}
          image={post.image}
          thumbnail={(post as any).thumbnail || undefined}
          nicknameOption={post.nicknameOption}
          userId={(post as any).userId || post._id}
          applicants={(post as any).applicants || []}
          isBuddyPost={false}
          latitude={post.meetingLatitude}
          longitude={post.meetingLongitude}
        />
      );
    } else if ("userId" in item) {
      const friend = item as Friend;
      return (
        <FriendSearchItem
          key={friend.userId}
          friend={friend}
          userId={userId}
          isFriend={false}
          hasSentRequest={false}
          hasReceivedRequest={false}
        />
      );
    } else if ("buddyGroupId" in item) {
      const buddy = item as Buddy;
      return (
        <BuddySearchItem
          key={buddy.buddyGroupId}
          buddyPhoto={buddy.buddyPhoto}
          buddyPhotoMedium={buddy.buddyPhotoMedium}
          buddyPhotoThumbnail={buddy.buddyPhotoThumbnail}
          buddyGroupName={buddy.buddyGroupName}
          description={buddy.description}
          members={
            buddy.members?.map((m) => ({
              ...m,
              profileImage: m.profileImage || "",
            })) || []
          }
          userId={userId}
          buddyGroupId={buddy.buddyGroupId}
        />
      );
    }
    return null;
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoading) {
      handleSearch(currentPage + 1);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img
            src="/assets/Owl-icon-pink.png"
            alt="Owl Logo"
            className={styles.logo}
          />
        </div>
        <div className={styles.searchBarContainer}>
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchBar}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") handleSearch(1);
            }}
          />
          {searchTerm && (
            <button
              className={styles.clearButton}
              onClick={() => setSearchTerm("")}
            >
              <img
                src="/assets/cancel-icon.png"
                alt="Clear"
                className={styles.clearIcon}
              />
            </button>
          )}
          <button
            className={styles.searchButton}
            onClick={() => handleSearch(1)}
          >
            Search
          </button>
        </div>
        <div className={styles.toggleWrapper}>
          {["post", "friend", "buddy"].map((type) => (
            <button
              key={type}
              className={`${styles.toggleButton} ${
                searchType === type ? styles.activeToggle : ""
              }`}
              onClick={() => setSearchType(type as "post" | "friend" | "buddy")}
            >
              {t(`search.types.${type}`)}
            </button>
          ))}
        </div>
      </header>

      {!isLoggedIn && overlayVisible && (
        <LoginDecisionOverlay
          visible={overlayVisible}
          onLogin={() => router.push("/login")}
          onBrowse={() => setOverlayVisible(false)}
        />
      )}

      {isLoading && currentPage === 1 ? (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingIndicator}></div>
          <p className={styles.loadingText}>{t("loading_search_results")}</p>
        </div>
      ) : (
        <div className={styles.resultsContainer}>
          {searchResults.map((item) => renderResult(item))}
          {hasMore && !isLoading && (
            <button className={styles.loadMoreButton} onClick={handleLoadMore}>
              {t("load_more")}
            </button>
          )}
        </div>
      )}

      <footer className={styles.footer}>
        <WebFooter />
      </footer>
    </div>
  );
};

export default SearchPage;
