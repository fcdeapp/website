"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useConfig } from "../context/ConfigContext";
import { useTranslation } from "react-i18next";
import ProfileWithFlag from "../components/ProfileWithFlag";
import { formatTimeDifference, formatTimeUntil } from "../utils/timeUtils";
import { calculateDistance } from "../utils/distanceUtils";
import styles from "../styles/components/PostMain.module.css";

// ─────────────────────────────────────────────────────────────
// Helper: 동적 이미지 URL 처리 함수  
const getFullImageUrl = (url: string | undefined): string => {
  if (!url) return "";
  return url.startsWith("http") || url.startsWith("/assets/")
    ? url
    : `/assets/${url}`;
};

// ─────────────────────────────────────────────────────────────
// MarqueeText 컴포넌트 (웹용)
// (이 컴포넌트는 앱용 코드와 동일한 MarqueeText 효과를 위해 남겨두었으나, 현재 지도 영역에는 사용하지 않습니다.)
interface MarqueeTextProps {
  text: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  speed?: number;
  repeatSpacer?: number;
  parentWidth: number;
}
const MarqueeText: React.FC<MarqueeTextProps> = ({
  text,
  style,
  containerStyle,
  speed = 6000,
  repeatSpacer = 80,
  parentWidth,
}) => {
  const [textWidth, setTextWidth] = useState<number>(0);
  const [shouldScroll, setShouldScroll] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const handleTextLayout = () => {
    if (textRef.current) {
      const width = textRef.current.offsetWidth;
      setTextWidth(width);
      setShouldScroll(width > parentWidth * 0.6);
    }
  };

  useEffect(() => {
    handleTextLayout();
  }, [text, parentWidth]);

  return (
    <div
      className={styles.marqueeContainer}
      style={{ ...containerStyle, whiteSpace: "nowrap", overflow: "hidden" }}
    >
      {shouldScroll ? (
        <div
          className={styles.marqueeWrapper}
          style={{
            animation: `marquee ${speed}ms linear infinite`,
            width: textWidth * 2 + repeatSpacer,
          }}
        >
          <div className={styles.marqueeText} style={style} ref={textRef}>
            {text}
          </div>
          <div style={{ paddingLeft: repeatSpacer }} />
          <div className={styles.marqueeText} style={style}>
            {text}
          </div>
        </div>
      ) : (
        <div className={styles.marqueeText} style={style} ref={textRef}>
          {text}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// 날짜 및 텍스트 유틸 함수
const formatDateToLocalTimezone = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return "unknown";
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };
    return new Intl.DateTimeFormat(undefined, options).format(date);
  } catch (error) {
    console.error("Error formatting ISO date:", error);
    return "unknown";
  }
};

const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return "";
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// ─────────────────────────────────────────────────────────────
// PostMain 컴포넌트 Props 인터페이스
export interface PostMainProps {
  postId: string;
  author: string;
  time: string;
  meetingTime: string;
  meetingPlace: string;
  meetingCity: string;
  meetingCountry: string;
  category: string;
  title: string;
  content: string;
  likes: number;
  comments: number;
  commentList: Array<{
    author: string;
    time: string;
    content: string;
    profileImage: string;
  }>;
  visitors: number;
  visitedUsers: string[];
  likedUsers: string[];
  nicknameOption: string;
  profileImage: string;
  profileThumbnail: string;
  image?: string;
  thumbnail?: string;
  recruitmentCount: number;
  applicantsCount: number;
  userId: string;
  applicants: string[];
  isBuddyPost: boolean;
  latitude?: number;
  longitude?: number;
}

// ─────────────────────────────────────────────────────────────
// PostMain 컴포넌트 (웹용)
// 앱버전과 동일한 기능 및 디자인을 구현합니다.
// 주요 변경점:  
// 1. 닉네임이 더 아래쪽에 위치 (CSS 수정)  
// 2. 프로필 이미지와 텍스트 사이 간격 보완 (CSS 수정)  
// 3. 아이콘 묶음(지도, 참여자, 번역)은 미활성 상태일 때 오른쪽 정렬됨 (CSS 수정)
// 4. 지도 영역은 iframe으로 표시 (Google Maps URL 이용)
const PostMain: React.FC<PostMainProps> = ({
  postId,
  author,
  time,
  meetingTime,
  meetingPlace,
  meetingCity,
  meetingCountry,
  category,
  title,
  content,
  likes,
  comments,
  commentList,
  visitors,
  visitedUsers = [],
  likedUsers = [],
  nicknameOption,
  profileImage,
  profileThumbnail,
  image,
  thumbnail,
  recruitmentCount,
  applicantsCount,
  userId,
  applicants,
  isBuddyPost,
  latitude,
  longitude,
}) => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();

  // 상태 변수들
  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState({ title, content });
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [visitorCount, setVisitorCount] = useState(visitors);
  const [commented, setCommented] = useState(false);
  const [myUserId, setMyUserId] = useState("");
  const [nickname, setNickname] = useState("");
  const [showApplicants, setShowApplicants] = useState(false);
  const [applicantsProfiles, setApplicantsProfiles] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<string[]>([]);
  // 지도 관련 단순 상태 (이전 애니메이션 관련 state 제거)
  const [screenWidth, setScreenWidth] = useState<number>(0);
  const lastLikePressTime = useRef(0);
  // 부모 컨테이너 너비 (MarqueeText에 전달)
  const [parentWidth, setParentWidth] = useState<number>(0);
  // distance 상태
  const [distance, setDistance] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenWidth(window.innerWidth);
    }
  }, []);

  // 모집률 및 텍스트 계산
  const getRecruitmentRate = () => {
    if (nicknameOption === "AI") {
      return recruitmentCount > 0 ? applicantsCount / recruitmentCount : 0;
    } else {
      return (applicantsCount + 1) / (recruitmentCount + 1);
    }
  };
  const getRecruitmentText = () => {
    if (nicknameOption === "AI") {
      return `${applicantsCount} / ${recruitmentCount}`;
    } else {
      return `${applicantsCount + 1} / ${recruitmentCount + 1}`;
    }
  };
  const recruitmentRate = getRecruitmentRate();

  // 방문자 및 좋아요 상태 확인
  useEffect(() => {
    const checkStatus = async () => {
      if (localStorage.getItem("isLoggedIn") !== "true") {
        console.log("skipping status check.");
        return;
      }
      try {
        const { data: visitorData } = await axios.post(
          `${SERVER_URL}/posts/${postId}/visit`,
          { id: postId }
        );
        setVisitorCount(visitorData.visitors);
        const { data: postData } = await axios.get(`${SERVER_URL}/posts/${postId}`);
        setLiked(postData.likedUsers.includes(userId));
        setLikeCount(postData.likes);
        setCommented(
          postData.commentList.some((comment: any) => comment.author === userId)
        );
      } catch (error) {
        console.error("Error updating status:", error);
      }
    };
    checkStatus();
  }, [postId, userId, SERVER_URL]);

  // 지원자 프로필 불러오기
  useEffect(() => {
    const fetchApplicantsProfiles = async () => {
      let attempts = 3;
      while (attempts > 0) {
        try {
            if (localStorage.getItem("isLoggedIn") !== "true") {
                return;
              }
          const { data } = await axios.post(
            `${SERVER_URL}/users/profiles`,
            { userIds: applicants },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          setApplicantsProfiles(data.users);
          return;
        } catch (error) {
          console.error("Error fetching applicants profiles:", error);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts -= 1;
      }
    };
    if (applicants && applicants.length > 0) {
      fetchApplicantsProfiles();
    }
  }, [applicants, SERVER_URL]);

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserId = async () => {
      if (localStorage.getItem("isLoggedIn") === "true") {
        try {
          const { data } = await axios.get(`${SERVER_URL}/users/me`);
          setMyUserId(data.userId);
          setNickname(data.nickname);
        } catch (error) {
          console.log("Error fetching user data:", error);
        }
      } else {
        console.log("User not logged in, skipping user data fetch.");
      }
    };
    fetchUserId();
  }, [SERVER_URL]);

  // 부모 컨테이너 너비 측정 (MarqueeText에 전달)
  useEffect(() => {
    if (containerRef.current) {
      setParentWidth(containerRef.current.offsetWidth);
    }
  }, []);

  // 거리 계산
  useEffect(() => {
    const fetchDistance = async () => {
      if (latitude && longitude) {
        const result = await calculateDistance(latitude, longitude, t);
        setDistance(result);
      }
    };
    fetchDistance();
  }, [latitude, longitude, t]);

  // 지도 보이기 / 숨기기 (단순 state 토글)
  const showMapHandler = () => {
    if (!latitude || !longitude) return;
    setShowMap(true);
  };
  const hideMapHandler = () => {
    setShowMap(false);
  };

  // 지원자 토글
  const handleApplicantsToggle = () => {
    setIsExpanded(false);
    setShowApplicants((prev) => !prev);
  };

  // 콘텐츠 확장/축소
  const handleExpandToggle = () => {
    setIsExpanded(true);
  };

  const handleIconClick = () => {
    setIsExpanded(false);
  };

  // 번역 토글
  const toggleTranslation = async () => {
    setIsTranslating(true);
    if (localStorage.getItem("isLoggedIn") !== "true") {
        alert(t("not_logged_in", "You must be logged in to translate."));
        setIsTranslating(false);
        return;
      }
    try {
      const language = localStorage.getItem("language");
      const url = `${SERVER_URL}/translate/posts/${postId}?targetLanguage=${language}`;
      const { data } = await axios.get(url);
      setTranslatedText(
        isTranslated ? { title, content } : { title: data.title, content: data.content }
      );
      setIsTranslated(!isTranslated);
    } catch (err) {
      console.error(err);
      alert(t("translateError"));
    } finally {
      setIsTranslating(false);
    }
  };

  // 플로팅 하트 생성
  const heartCounter = useRef(0);
  const generateFloatingHeart = () => {
    heartCounter.current += 1;
    const id = `${Date.now()}_${heartCounter.current}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;
    setFloatingHearts((prev) => [...prev, id]);
    setTimeout(() => {
      setFloatingHearts((prev) => prev.filter((heartId) => heartId !== id));
    }, 2500);
  };

  const handleLikePress = async () => {
    const now = Date.now();
    if (now - lastLikePressTime.current < 500) return;
    lastLikePressTime.current = now;
    if (isTranslating) return;
    if (localStorage.getItem("isLoggedIn") !== "true") return;
    try {
      setLiked(!liked);
      generateFloatingHeart();
      const baseUrl = isBuddyPost ? `${SERVER_URL}/buddyPosts` : `${SERVER_URL}/posts`;
      const method = liked ? "delete" : "post";
      const { data } = await axios({
        url: `${baseUrl}/${postId}/like`,
        method,
      });
      setLikeCount(data.likes);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  // 플로팅 하트 컴포넌트 (CSS 애니메이션은 CSS 파일에서 처리)
  const FloatingHeart = ({ width, height }: { width: number; height: number }) => {
    const randomLeft = Math.random() * width * 0.8 + width * 0.1;
    const style: React.CSSProperties = {
      position: "absolute",
      width: 40,
      height: 40,
      left: randomLeft,
    };
    return (
      <img
        src={getFullImageUrl("like-colored.png")}
        alt="heart"
        className={styles.floatingHeart}
        style={style}
      />
    );
  };

  // 게시물 클릭 시 FullPost 페이지로 이동 (각 정보 querystring 전달)
  const handlePostPress = async () => {
    const baseUrl = isBuddyPost ? `${SERVER_URL}/buddy-post` : `${SERVER_URL}/posts`;
    let updatedVisitorCount = visitorCount;
    if (localStorage.getItem("isLoggedIn") === "true") {
      try {
        const { data } = await axios.post(`${baseUrl}/${postId}/visit`, null);
        updatedVisitorCount = data.visitors;
        setVisitorCount(updatedVisitorCount);
      } catch (error) {
        console.error("Failed to update visitor count", error);
      }
    } else {
      console.log("skipping visitor update.");
    }
    const params = new URLSearchParams({
      id: postId,
      author: nickname || 'Anonymous',
      time,
      meetingTime,
      meetingPlace,
      meetingCity,
      meetingCountry,
      category,
      title,
      content,
      likes: likeCount.toString(),
      comments: comments.toString(),
      visitors: updatedVisitorCount.toString(),
      profileImage: getFullImageUrl(profileImage),
      image: getFullImageUrl(image),
      thumbnail: getFullImageUrl(thumbnail),
      recruitmentCount: recruitmentCount.toString(),
      applicantsCount: applicantsCount.toString(),
      applicants: applicants.join(","),
      isBuddyPost: isBuddyPost ? "true" : "false",
      latitude: latitude?.toString() || "",
      longitude: longitude?.toString() || "",
    });
    router.push(`/fullPost?${params.toString()}`);
  };

  return (
    <div
      className={styles.box}
      onClick={handlePostPress}
      ref={containerRef}
      onLoad={() => {
        if (containerRef.current) {
          setParentWidth(containerRef.current.offsetWidth);
        }
      }}
    >
      <div className={styles.cardContainer}>
        <div className={styles.postMain}>
          <div
            className={`${styles.postContent} ${showMap ? styles.transparentBackground : ""}`}
          >
            <div className={styles.textContent}>
              <div className={styles.authorInformation}>
                <div className={styles.profileImage}>
                  {nicknameOption === "AI" ? (
                    <img
                      src={getFullImageUrl("AI.png")}
                      alt="AI"
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <ProfileWithFlag
                      userId={userId}
                      nickname={author}
                      profileImage={
                        getFullImageUrl(profileImage) ||
                        getFullImageUrl("Annonymous.png")
                      }
                      profileThumbnail={getFullImageUrl(profileThumbnail)}
                      size={48}
                      countryName={undefined}
                    />
                  )}
                </div>
                {/* 수정: 닉네임과 시간 텍스트에 여분의 마진 추가 (아래로 내려짐) */}
                <div className={styles.author}>
                  <p className={styles.authorText}>{author}</p>
                  <p className={styles.timeCategoryText}>
                    {formatTimeDifference(time, t)} · {t(`topics.${category}`)}
                  </p>
                </div>
                <div className={styles.recruitmentInfo}>
                  {applicantsCount >= recruitmentCount ? (
                    <>
                      <p className={styles.checkText}>✓</p>
                      <p className={styles.recruitmentCompleteText}>
                        {t("recruitment_status_complete")}
                      </p>
                    </>
                  ) : (
                    <div className={styles.circleWrapper}>
                      <div
                        className={styles.circle}
                        style={{
                          background: `conic-gradient(#D8315B ${
                            recruitmentRate * 100
                          }%, #fff ${recruitmentRate * 100}%)`,
                        }}
                      ></div>
                    </div>
                  )}
                  <p className={styles.recruitmentText}>
                    {getRecruitmentText()}
                  </p>
                </div>
              </div>
              <div className={styles.postTextImageSet}>
                <div
                  className={styles.postTextSet}
                  style={{ width: image ? "60%" : "100%" }}
                >
                  <p className={styles.postTitle}>{translatedText.title}</p>
                  <div className={styles.meetingRow}>
                    <p className={styles.meetingTime}>
                      {formatDateToLocalTimezone(meetingTime)}
                    </p>
                    <div className={styles.meetingStatus}>
                      <p className={styles.meetingStatusText}>
                        {formatTimeUntil(meetingTime, t)}
                      </p>
                    </div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded((prev) => !prev);
                    }}
                  >
                    <p className={styles.postContents}>
                      {truncateText(
                        translatedText.content,
                        isExpanded ? 1000 : 100
                      )}
                    </p>
                  </div>
                </div>
                {thumbnail || image ? (
                  <div className={styles.postImageCover}>
                    <img
                      className={styles.postImage}
                      src={getFullImageUrl(thumbnail || image)}
                      alt="post"
                      onError={(e) =>
                        console.warn("Failed to load image:", e)
                      }
                    />
                  </div>
                ) : (
                  <div className={styles.postImageCover} />
                )}
              </div>
            </div>
          </div>
          <div className={styles.postInformation}>
            {isExpanded ? (
              <div className={styles.iconInfoAll}>
                <div
                  className={styles.iconInfo}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIconClick();
                  }}
                  style={{ backgroundColor: "transparent", borderRadius: 8 }}
                >
                  <img
                    src={getFullImageUrl("eye-colored.png")}
                    alt="visitor"
                    className={styles.icon}
                  />
                  <p className={styles.iconText}>{visitorCount}</p>
                </div>
                <div
                  className={styles.iconInfo}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLikePress();
                  }}
                  style={{ backgroundColor: "transparent", borderRadius: 8 }}
                >
                  <img
                    src={
                      liked
                        ? getFullImageUrl("like-colored.png")
                        : getFullImageUrl("like-icon.png")
                    }
                    alt="like"
                    className={styles.icon}
                  />
                  <p className={styles.iconText}>{likeCount}</p>
                </div>
                <div className={styles.floatingHeartsContainer}>
                  {floatingHearts.map((id) => (
                    <FloatingHeart key={id} width={window.innerWidth} height={window.innerHeight} />
                  ))}
                </div>
                <div
                  className={styles.iconInfo}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleIconClick();
                  }}
                  style={{ backgroundColor: "transparent", borderRadius: 8 }}
                >
                  <img
                    src={getFullImageUrl("comment-icon.png")}
                    alt="comment"
                    className={styles.icon}
                  />
                  <p className={styles.iconText}>{comments}</p>
                </div>
              </div>
            ) : (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                  hideMapHandler();
                }}
              >
                <div className={styles.iconInfoAll}>
                  <div className={styles.iconInfo}>
                    <img
                      src={getFullImageUrl("plus-icon.png")}
                      alt="plus"
                      className={styles.icon}
                    />
                  </div>
                </div>
              </div>
            )}
            {showMap ? (
              // 지도 보이는 경우: iframe 사용 (Google Maps)
              <div
                className={styles.mapIframeContainer}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className={styles.closeMapButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    hideMapHandler();
                  }}
                >
                  ×
                </button>
                <iframe
                  src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                  title="Meeting Location"
                  className={styles.mapIframe}
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            ) : showApplicants && applicants.length > 0 ? (
              <div
                className={styles.applicantsContainer}
                onClick={(e) => {
                  e.stopPropagation();
                  handleApplicantsToggle();
                }}
              >
                {applicantsProfiles.map((applicant, index) => (
                  <ProfileWithFlag
                    key={applicant.userId ?? index}
                    userId={applicant.userId}
                    nickname={applicant.nickname}
                    profileImage={getFullImageUrl(applicant.profileImage)}
                    profileThumbnail={getFullImageUrl(applicant.profileThumbnail)}
                    size={30}
                  />
                ))}
                <div className={styles.appilcantsContainer}>
                  <img
                    src={getFullImageUrl("participants-icon.png")}
                    alt="participants"
                    className={styles.iconColored}
                  />
                  <p className={styles.appilcantsText}>{applicants.length}</p>
                </div>
              </div>
            ) : (
              // 미활성 상태일 때 아이콘 묶음 오른쪽 정렬
              <div className={styles.iconRow}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (latitude && longitude) {
                      showMapHandler();
                      handleIconClick();
                    }
                  }}
                >
                  <img
                    src={getFullImageUrl("map-icon.png")}
                    alt="map icon"
                    className={styles.icon}
                  />
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplicantsToggle();
                  }}
                >
                  <img
                    src={getFullImageUrl("participants-icon.png")}
                    alt="participants icon"
                    className={styles.icon}
                  />
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleTranslation();
                  }}
                  className={styles.translateButton}
                  style={{ pointerEvents: isTranslating ? "none" : "auto" }}
                >
                  {isTranslating ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <img
                      src={getFullImageUrl("translate-icon.png")}
                      alt="translate icon"
                      className={`${styles.icon} ${isTranslated ? styles.iconTranslated : ""}`}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {applicantsCount >= recruitmentCount && (
          <>
            <div className={styles.blurOverlay}></div>
            <div className={styles.recruitmentBadge}>
              <img
                src={getFullImageUrl("checkedComponent.png")}
                alt="badge"
                className={styles.badgeIcon}
              />
              <p className={styles.recruitmentBadgeText}>
                {t("recruitment_status_complete")}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostMain;
