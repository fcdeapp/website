"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  UIEvent,
} from "react";
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
// CSS keyframes 애니메이션은 PostMain.module.css에 정의되어 있음
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
// 앱 버전과 동일한 기능 및 디자인을 구현하며, 블러와 모집 완료 배지는 cardContainer 내부에 적용됩니다.
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
  // 지도 애니메이션 관련 (웹에서는 state와 CSS 전환)
  const [mapSlide, setMapSlide] = useState<number>(window.innerWidth);
  const [mapOpacity, setMapOpacity] = useState<number>(0);
  const [mapHeight, setMapHeight] = useState<number>(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  // 부모 컨테이너 너비 (MarqueeText에 전달)
  const [parentWidth, setParentWidth] = useState<number>(0);
  // distance 상태 (setDistance 오류 해결)
  const [distance, setDistance] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const lastLikePressTime = useRef(0);

  // 모집률 및 텍스트 계산 (앱 버전 동일)
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
      setIsCheckingStatus(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found, skipping status check.");
        setIsCheckingStatus(false);
        return;
      }
      try {
        const { data: visitorData } = await axios.post(
          `${SERVER_URL}/posts/${postId}/visit`,
          { id: postId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVisitorCount(visitorData.visitors);
        const { data: postData } = await axios.get(`${SERVER_URL}/posts/${postId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setLiked(postData.likedUsers.includes(userId));
        setLikeCount(postData.likes);
        setCommented(postData.commentList.some((comment: any) => comment.author === userId));
      } catch (error) {
        console.error("Error updating status:", error);
      } finally {
        setIsCheckingStatus(false);
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
          const token = localStorage.getItem("token");
          if (!token) {
            console.log("No token found");
            return;
          }
          const { data } = await axios.post(
            `${SERVER_URL}/users/profiles`,
            { userIds: applicants },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
          setApplicantsProfiles(data.users);
          return;
        } catch (error) {
          console.error("Error fetching applicants profiles:", error);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000 * (4 - attempts)));
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
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const { data } = await axios.get(`${SERVER_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMyUserId(data.userId);
          setNickname(data.nickname);
        } catch (error) {
          console.log("Error fetching user data:", error);
        }
      } else {
        console.log("No token found");
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

  // 지도 보이기/숨기기 (웹: setState + CSS 전환)
  const startMapAnimation = () => {
    setMapSlide(0);
    setMapOpacity(1);
    setMapHeight(200);
    setShowMap(true);
  };

  const showMapHandler = () => {
    if (!latitude || !longitude) return;
    startMapAnimation();
  };

  const hideMapHandler = () => {
    setMapOpacity(0);
    setMapSlide(screenWidth);
    setMapHeight(0);
    setTimeout(() => {
      setShowMap(false);
    }, 500);
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
    const token = localStorage.getItem("token");
    if (!token) {
      alert(t("noToken"));
      setIsTranslating(false);
      return;
    }
    try {
      const language = localStorage.getItem("language");
      const url = `${SERVER_URL}/translate/posts/${postId}?targetLanguage=${language}`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
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
    if (isLiking || isCheckingStatus) return;
    const token = localStorage.getItem("token");
    if (!token) return;
    setIsLiking(true);
    try {
      setLiked(!liked);
      generateFloatingHeart();
      const baseUrl = isBuddyPost ? `${SERVER_URL}/buddyPosts` : `${SERVER_URL}/posts`;
      const method = liked ? "delete" : "post";
      const { data } = await axios({
        url: `${baseUrl}/${postId}/like`,
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikeCount(data.likes);
    } catch (error) {
      console.error("Error liking post:", error);
    } finally {
      setIsLiking(false);
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

  // 게시물 클릭 시 FullPost 페이지로 이동 (쿼리스트링 전달)
  const handlePostPress = async () => {
    if (isCheckingStatus) return;
    try {
      const token = localStorage.getItem("token");
      const baseUrl = isBuddyPost ? `${SERVER_URL}/buddy-post` : `${SERVER_URL}/posts`;
      let updatedVisitorCount = visitorCount;
      if (token) {
        try {
          const { data } = await axios.post(
            `${baseUrl}/${postId}/visit`,
            null,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          updatedVisitorCount = data.visitors;
          setVisitorCount(updatedVisitorCount);
        } catch (error) {
          console.error("Failed to update visitor count", error);
        }
      } else {
        console.log("Token not found, skipping visitor update.");
      }
      const params = new URLSearchParams({
        id: postId,
        author,
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
        visitors: visitorCount.toString(),
        profileImage: getFullImageUrl(profileImage),
        image: getFullImageUrl(image),
        thumbnail: getFullImageUrl(thumbnail),
        recruitmentCount: recruitmentCount.toString(),
        applicantsCount: applicantsCount.toString(),
        applicants: JSON.stringify(applicants),
        isBuddyPost: isBuddyPost ? "true" : "false",
        latitude: latitude?.toString() || "",
        longitude: longitude?.toString() || "",
      });
      router.push(`/fullPost?${params.toString()}`);
    } catch (error) {
      console.error("Error visiting post:", error);
    }
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
        <div className={styles.postMain} style={{ boxShadow: "0px 2px 4px rgba(0,0,0,0.2)" }}>
          <div className={`${styles.postContent} ${showMap ? styles.transparentBackground : ""}`}>
            <div className={styles.textContent}>
              <div className={styles.authorInformation}>
                <div className={styles.profileImage}>
                  {nicknameOption === "AI" ? (
                    <img
                      src={getFullImageUrl("AI.png")}
                      alt="AI"
                      style={{ width: 48, height: 48, borderRadius: 24, objectFit: "cover" }}
                    />
                  ) : (
                    <ProfileWithFlag
                      userId={userId}
                      nickname={author}
                      profileImage={getFullImageUrl(profileImage) || getFullImageUrl("Annonymous.png")}
                      profileThumbnail={getFullImageUrl(profileThumbnail)}
                      size={48}
                      countryName={undefined}
                    />
                  )}
                </div>
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
                      <p className={styles.recruitmentCompleteText}>{t("recruitment_status_complete")}</p>
                    </>
                  ) : (
                    <div className={styles.circleWrapper}>
                      <div
                        className={styles.circle}
                        style={{
                          background: `conic-gradient(#D8315B ${recruitmentRate * 100}%, #fff ${recruitmentRate * 100}%)`,
                        }}
                      ></div>
                    </div>
                  )}
                  <p
                    className={styles.recruitmentText}
                    style={{
                      color: applicantsCount < recruitmentCount && showApplicants ? "#1a1045" : "transparent",
                      fontSize: applicantsCount < recruitmentCount && showApplicants ? 12 : 1,
                      marginTop: applicantsCount < recruitmentCount && showApplicants ? 5 : 0,
                    }}
                  >
                    {getRecruitmentText()}
                  </p>
                </div>
              </div>
              <div className={styles.postTextImageSet}>
                <div className={styles.postTextSet} style={{ width: image ? "60%" : "100%" }}>
                  <p className={styles.postTitle}>{translatedText.title}</p>
                  <div className={styles.meetingRow}>
                    <p className={styles.meetingTime}>{formatDateToLocalTimezone(meetingTime)}</p>
                    <div className={styles.meetingStatus}>
                      <p className={styles.meetingStatusText}>{formatTimeUntil(meetingTime, t)}</p>
                    </div>
                  </div>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsContentExpanded((prev) => !prev);
                    }}
                  >
                    <p className={styles.postContents}>
                      {truncateText(translatedText.content, isContentExpanded ? 1000 : 100)}
                    </p>
                  </div>
                </div>
                {thumbnail || image ? (
                  <div className={styles.postImageCover}>
                    <img
                      className={styles.postImage}
                      src={getFullImageUrl(thumbnail || image)}
                      alt="post"
                      onError={(e) => console.warn("Failed to load image:", e)}
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
                  <img src={getFullImageUrl("eye-colored.png")} alt="visitor" className={styles.icon} />
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
                    src={liked ? getFullImageUrl("like-colored.png") : getFullImageUrl("like-icon.png")}
                    alt="like"
                    className={styles.icon}
                  />
                  <p className={styles.iconText}>{likeCount}</p>
                </div>
                <div className={styles.floatingHeartsContainer}>
                  {floatingHearts.map((id) => (
                    <FloatingHeart key={id} width={screenWidth} height={screenHeight} />
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
                  <img src={getFullImageUrl("comment-icon.png")} alt="comment" className={styles.icon} />
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
                    <img src={getFullImageUrl("plus-icon.png")} alt="plus" className={styles.icon} />
                  </div>
                </div>
              </div>
            )}
            {showMap ? (
              <div
                className={styles.placeRow}
                style={{
                  transform: `translateX(${mapSlide}px)`,
                  opacity: mapOpacity,
                  zIndex: 10,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div onClick={hideMapHandler}>
                  <img src={getFullImageUrl("map-colored.png")} alt="map" className={styles.mapIcon} />
                </div>
                <div onClick={hideMapHandler} style={{ maxWidth: screenWidth * 0.6 }}>
                  <MarqueeText
                    text={meetingPlace || t("defaultMeetingPlace")}
                    style={undefined}
                    parentWidth={parentWidth || 0}
                    containerStyle={{ maxWidth: screenWidth * 0.6, alignSelf: "flex-start" }}
                    speed={6000}
                    repeatSpacer={80}
                  />
                </div>
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
                  <img src={getFullImageUrl("map-icon.png")} alt="map icon" className={styles.icon} />
                </div>
                <div onClick={(e) => { e.stopPropagation(); handleApplicantsToggle(); }}>
                  <img src={getFullImageUrl("participants-icon.png")} alt="participants icon" className={styles.icon} />
                </div>
                <div
                  onClick={(e) => { e.stopPropagation(); toggleTranslation(); }}
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
            <div className={styles.blurOverlay}>
              {/* 블러 효과는 이 영역(cardContainer) 내에서만 적용 */}
            </div>
            <div className={styles.recruitmentBadge}>
              <img
                src={getFullImageUrl("checkedComponent.png")}
                alt="badge"
                className={styles.badgeIcon}
              />
              <p className={styles.recruitmentBadgeText}>{t("recruitment_status_complete")}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PostMain;
