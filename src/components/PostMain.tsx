"use client";

import React, { useState, useEffect, useCallback, useRef, UIEvent } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useConfig } from '../context/ConfigContext';
import { useTranslation } from 'react-i18next';
import ProfileWithFlag from '../components/ProfileWithFlag';
import { formatTimeDifference, formatTimeUntil } from '../utils/timeUtils';
import { calculateDistance } from '../utils/distanceUtils';
import styles from '../styles/components/PostMain.module.css'; 

// ─────────────────────────────────────────────────────────────
// Helper: 동적 이미지 URL 처리 함수
// 서버에서 가져오는 URL( http:// 또는 https:// )이면 그대로 사용하고, 
// 그렇지 않으면 /assets/ 경로를 접두어로 붙입니다.
const getFullImageUrl = (url: string | undefined): string => {
  if (!url) return '';
  return url.startsWith('http') || url.startsWith('/assets/')
    ? url
    : `/assets/${url}`;
};

// ─────────────────────────────────────────────────────────────
// MarqueeText 컴포넌트 (웹용)
// ─────────────────────────────────────────────────────────────
interface MarqueeTextProps {
  text: string;
  style?: React.CSSProperties;
  containerStyle?: React.CSSProperties;
  speed?: number;       // 애니메이션 속도 (ms)
  repeatSpacer?: number; // 반복 간격 (px)
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
  // 간단한 CSS 애니메이션으로 marquee 효과 구현
  return (
    <div style={{ ...containerStyle, whiteSpace: 'nowrap', overflow: 'hidden' }}>
      <div
        style={{
          ...style,
          display: 'inline-block',
          animation: `marquee ${speed}ms linear infinite`,
        }}
      >
        {text}
        <span style={{ paddingLeft: repeatSpacer }}>{text}</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PostMain 컴포넌트 (웹용)
// ─────────────────────────────────────────────────────────────
interface PostMainProps {
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
  commentList: Array<{ author: string; time: string; content: string; profileImage: string; }>;
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

const formatDateToLocalTimezone = (isoDateString: string): string => {
  try {
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) return 'unknown';
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    };
    return new Intl.DateTimeFormat(undefined, options).format(date);
  } catch (error) {
    console.error('Error formatting ISO date:', error);
    return 'unknown';
  }
};

const truncateText = (text: string | undefined, maxLength: number): string => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

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

  const [isTranslated, setIsTranslated] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState({ title, content });
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [visitorCount, setVisitorCount] = useState(visitors);
  const [commented, setCommented] = useState(false);
  const [myUserId, setMyUserId] = useState('');
  const [nickname, setNickname] = useState('');
  const [showApplicants, setShowApplicants] = useState(false);
  const [applicantsProfiles, setApplicantsProfiles] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<string[]>([]);
  const [iconOpacity, setIconOpacity] = useState(1);
  const [mapOpacity, setMapOpacity] = useState(0);
  const [mapSlide, setMapSlide] = useState<number>(window.innerWidth);
  const [mapHeight, setMapHeight] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isContentExpanded, setIsContentExpanded] = useState(false);

  const [parentWidth, setParentWidth] = useState<number | null>(null);
  const [distance, setDistance] = useState<string | null>(null);
  const lastLikePressTime = useRef(0);
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

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

  const handleLayout = useCallback((e: UIEvent<HTMLDivElement>) => {
    const width = e.currentTarget.offsetWidth;
    setParentWidth(width);
  }, []);

  // 지도 애니메이션 및 자산 로드 (간단한 타임아웃 기반)
  const loadMapAssets = async () => {
    try {
      // 서버에서 가져오는 지도 자산이 아닌 경우, public/assets/ 폴더 내 파일로 처리
      const localMap = getFullImageUrl('map-colored.png');
      const img = new Image();
      img.src = localMap;
      img.onload = () => {
        console.log('Map asset loaded');
        startMapAnimation();
      };
      img.onerror = () => {
        console.error('Error loading map asset');
        startMapAnimation();
      };
    } catch (err) {
      console.error('Error loading map assets:', err);
      startMapAnimation();
    }
  };

  const showMapHandler = () => {
    if (!latitude || !longitude) return;
    loadMapAssets(); // 지도 자산을 불러오고 애니메이션을 시작합니다.
  };  

  const startMapAnimation = () => {
    console.log('Show Map Triggered');
    setMapOpacity(0);
    setMapHeight(0);
    setMapSlide(screenWidth);
    setTimeout(() => {
      setMapOpacity(1);
      setMapHeight(200);
    }, 200);
    setTimeout(() => {
      setMapSlide(0);
      setShowMap(true);
    }, 500);
  };

  const hideMapHandler = () => {
    console.log('Hide Map Triggered');
    setMapOpacity(0);
    setMapSlide(screenWidth);
    setMapHeight(0);
    setTimeout(() => {
      setShowMap(false);
    }, 500);
  };

  const handleApplicantsToggle = () => {
    setIsExpanded(false);
    setShowApplicants(!showApplicants);
  };

  const handleExpandToggle = () => {
    setIsExpanded(true);
    setIconOpacity(0);
    setTimeout(() => {
      setIconOpacity(1);
    }, 300);
  };

  const handleIconClick = () => {
    setIsExpanded(false);
    setIconOpacity(1);
  };

  const toggleTranslation = async () => {
    setIsTranslating(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert(t('noToken'));
      setIsTranslating(false);
      return;
    }
    try {
      const language = localStorage.getItem('language');
      const url = `${SERVER_URL}/translate/posts/${postId}?targetLanguage=${language}`;
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTranslatedText(isTranslated ? { title, content } : { title: data.title, content: data.content });
      setIsTranslated(!isTranslated);
    } catch (err) {
      console.error(err);
      alert(t('translateError'));
    } finally {
      setIsTranslating(false);
    }
  };

  // 지원자 프로필 불러오기
  useEffect(() => {
    const fetchApplicantsProfiles = async () => {
      let attempts = 3;
      while (attempts > 0) {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            console.log('No token found');
            return;
          }
          const { data } = await axios.post(
            `${SERVER_URL}/users/profiles`,
            { userIds: applicants },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          setApplicantsProfiles(data.users);
          return;
        } catch (error) {
          console.error('Error fetching applicants profiles:', error);
        }
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - attempts)));
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
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const { data } = await axios.get(`${SERVER_URL}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setMyUserId(data.userId);
          setNickname(data.nickname);
        } catch (error) {
          console.log('Error fetching user data:', error);
        }
      } else {
        console.log('No token found');
      }
    };
    fetchUserId();
  }, [SERVER_URL]);

  const getRecruitmentRate = () => {
    if (nicknameOption === 'AI') {
      return recruitmentCount > 0 ? applicantsCount / recruitmentCount : 0;
    } else {
      return (applicantsCount + 1) / (recruitmentCount + 1);
    }
  };

  const getRecruitmentText = () => {
    if (nicknameOption === 'AI') {
      return `${applicantsCount} / ${recruitmentCount}`;
    } else {
      return `${applicantsCount + 1} / ${recruitmentCount + 1}`;
    }
  };

  const recruitmentRate = getRecruitmentRate();

  useEffect(() => {
    const checkVisitorAndLikeStatus = async () => {
      setIsCheckingStatus(true);
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found, skipping status check.');
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
        console.error('Error updating status:', error);
      } finally {
        setIsCheckingStatus(false);
      }
    };
    checkVisitorAndLikeStatus();
  }, [postId, userId, SERVER_URL]);

  const handlePostPress = async () => {
    if (isCheckingStatus) return;
    try {
      const token = localStorage.getItem('token');
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
          console.error('Failed to update visitor count', error);
        }
      } else {
        console.log('Token not found, skipping visitor update.');
      }
      // 페이지 이동 (쿼리스트링으로 정보 전달)
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
        isBuddyPost: isBuddyPost ? 'true' : 'false',
        latitude: latitude?.toString() || '',
        longitude: longitude?.toString() || '',
      });
      router.push(`/fullPost?${params.toString()}`);
    } catch (error) {
      console.error('Error visiting post:', error);
    }
  };

  const triggerOpacityAnimation = () => {
    setTimeout(() => {
      setFloatingHearts([]);
    }, 2500);
  };

  const heartCounter = useRef(0);

  const generateFloatingHeart = () => {
    heartCounter.current += 1;
    const id = `${Date.now()}_${heartCounter.current}_${Math.random().toString(36).substring(2, 11)}`;
    setFloatingHearts(prev => [...prev, id]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(heartId => heartId !== id));
    }, 2500);
  };

  const handleLikePress = async () => {
    const now = Date.now();
    if (now - lastLikePressTime.current < 500) return;
    lastLikePressTime.current = now;
    if (isLiking || isCheckingStatus) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    setIsLiking(true);
    try {
      setLiked(!liked);
      generateFloatingHeart();
      const baseUrl = isBuddyPost ? `${SERVER_URL}/buddyPosts` : `${SERVER_URL}/posts`;
      const method = liked ? 'delete' : 'post';
      const { data } = await axios({
        url: `${baseUrl}/${postId}/like`,
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      setLikeCount(data.likes);
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // FloatingHeart 컴포넌트 (웹용, CSS 애니메이션으로 처리)
  const FloatingHeart = ({ width, height }: { width: number; height: number }) => {
    const randomLeft = Math.random() * width * 0.8 + width * 0.1;
    const style: React.CSSProperties = {
      position: 'absolute',
      width: 40,
      height: 40,
      left: randomLeft,
      animation: 'floatHeart 2s ease-out forwards',
      pointerEvents: 'none',
    };
    return <img src={getFullImageUrl('like-colored.png')} alt="heart" style={style} />;
  };

  return (
    <div className={styles.box} onClick={handlePostPress} onLoad={handleLayout}>
      <div className={styles.cardContainer}>
        <div className={styles.postMain} style={{ boxShadow: '0px 2px 4px rgba(0,0,0,0.2)' }}>
          <div className={`${styles.postContent} ${showMap ? styles.transparentBackground : ''}`}>
            <div className={styles.textContent}>
              <div className={styles.authorInformation}>
                <div className={styles.profileImage}>
                  {nicknameOption === 'AI' ? (
                    <img
                      src={getFullImageUrl('AI.png')}
                      alt="AI"
                      style={{ width: 48, height: 48, borderRadius: 24, objectFit: 'cover' }}
                    />
                  ) : (
                    <ProfileWithFlag
                      userId={userId}
                      nickname={author}
                      profileImage={getFullImageUrl(profileImage) || getFullImageUrl('Annonymous.png')}
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
                      <p className={styles.recruitmentCompleteText}>{t('recruitment_status_complete')}</p>
                    </>
                  ) : (
                    <div className={styles.circleWrapper}>
                      {/* 간단한 원형 진행바: conic-gradient를 이용 */}
                      <div
                        className={styles.circle}
                        style={{ background: `conic-gradient(#D8315B ${recruitmentRate * 100}%, #fff ${recruitmentRate * 100}%)` }}
                      ></div>
                    </div>
                  )}
                  <p
                    className={styles.recruitmentText}
                    style={{
                      color: applicantsCount < recruitmentCount && showApplicants ? '#1a1045' : 'transparent',
                      fontSize: applicantsCount < recruitmentCount && showApplicants ? 12 : 1,
                      marginTop: applicantsCount < recruitmentCount && showApplicants ? 5 : 0,
                    }}
                  >
                    {getRecruitmentText()}
                  </p>
                </div>
              </div>

              <div className={styles.postTextImageSet}>
                <div className={styles.postTextSet} style={{ width: image ? '60%' : '100%' }}>
                  <p className={styles.postTitle}>{translatedText.title}</p>
                  <div className={styles.meetingRow}>
                    <p className={styles.meetingTime}>{formatDateToLocalTimezone(meetingTime)}</p>
                    <div className={styles.meetingStatus}>
                      <p className={styles.meetingStatusText}>{formatTimeUntil(meetingTime, t)}</p>
                    </div>
                  </div>
                  <div onClick={() => setIsContentExpanded(prev => !prev)}>
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
                      onError={(e) => console.warn('Failed to load image:', e)}
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
              <div className={styles.iconInfoAll} style={{ transform: `translateX(0px)` }}>
                <div className={styles.iconInfo} onClick={handleIconClick} style={{ backgroundColor: 'transparent', borderRadius: 8 }}>
                  <img
                    src={visitedUsers.includes(userId) ? getFullImageUrl('eye-colored.png') : getFullImageUrl('eye-icon.png')}
                    className={styles.icon}
                    alt="visitor"
                  />
                  <p className={styles.iconText}>{visitorCount}</p>
                </div>
                <div className={styles.iconInfo} onClick={handleLikePress} style={{ backgroundColor: 'transparent', borderRadius: 8 }}>
                  <img
                    src={liked ? getFullImageUrl('like-colored.png') : getFullImageUrl('like-icon.png')}
                    className={styles.icon}
                    alt="like"
                  />
                  <p className={styles.iconText}>{likeCount}</p>
                </div>
                <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: iconOpacity }}>
                  {floatingHearts.map((id) => (
                    <FloatingHeart key={id} width={screenWidth} height={screenHeight} />
                  ))}
                </div>
                <div className={styles.iconInfo} onClick={handleIconClick} style={{ backgroundColor: 'transparent', borderRadius: 8 }}>
                  <img
                    src={getFullImageUrl('comment-icon.png')}
                    className={styles.icon}
                    alt="comment"
                  />
                  <p className={styles.iconText}>{comments}</p>
                </div>
              </div>
            ) : (
              <div onClick={() => { handleExpandToggle(); hideMapHandler(); }}>
                <div className={styles.iconInfoAll} style={{ opacity: iconOpacity }}>
                  <div className={styles.iconInfo}>
                    <img src={getFullImageUrl('plus-icon.png')} className={styles.icon} alt="plus" />
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
              >
                <div onClick={hideMapHandler}>
                  <img src={getFullImageUrl('map-colored.png')} className={styles.mapIcon} alt="map" />
                </div>
                <div onClick={hideMapHandler} style={{ maxWidth: screenWidth * 0.6 }}>
                  <MarqueeText
                    text={meetingPlace || t('defaultMeetingPlace')}
                    style={undefined}
                    parentWidth={parentWidth || 0}
                    containerStyle={{ maxWidth: screenWidth * 0.6, alignSelf: 'flex-start' }}
                    speed={6000}
                    repeatSpacer={80}
                  />
                </div>
              </div>
            ) : showApplicants && applicants.length > 0 ? (
              <div className={styles.applicantsContainer} onClick={handleApplicantsToggle}>
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
                  <img src={getFullImageUrl('participants-icon.png')} className={styles.iconColored} alt="participants" />
                  <p className={styles.appilcantsText}>{applicants.length}</p>
                </div>
              </div>
            ) : (
              <div className={styles.iconRow} style={{ opacity: iconOpacity }}>
                <div onClick={() => { if (latitude && longitude) { showMapHandler(); handleIconClick(); } }}>
                  <img src={getFullImageUrl('map-icon.png')} className={styles.icon} alt="map icon" />
                </div>
                <div onClick={handleApplicantsToggle}>
                  <img src={getFullImageUrl('participants-icon.png')} className={styles.icon} alt="participants icon" />
                </div>
                <div onClick={toggleTranslation} className={styles.translateButton} style={{ pointerEvents: isTranslating ? 'none' : 'auto' }}>
                  {isTranslating ? (
                    <div className={styles.spinner}></div>
                  ) : (
                    <img
                      src={getFullImageUrl('translate-icon.png')}
                      className={`${styles.icon} ${isTranslated ? styles.iconTranslated : ''}`}
                      alt="translate icon"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {applicantsCount >= recruitmentCount && (
          <div className={styles.blurOverlay}>
            {/* CSS로 Blur 효과를 준 오버레이 */}
          </div>
        )}
        {applicantsCount >= recruitmentCount && (
          <div className={styles.recruitmentBadge}>
            <img src={getFullImageUrl('checkedComponent.png')} className={styles.badgeIcon} alt="badge" />
            <p className={styles.recruitmentBadgeText}>{t('recruitment_status_complete')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostMain;
