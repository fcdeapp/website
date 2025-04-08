"use client";

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useConfig } from '../../context/ConfigContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import _ from 'lodash';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import MessageInputForm from '../../components/MessageInputForm';
import MessageBubble from '../../components/MessageBubble';
import ProfileWithFlag from '../../components/ProfileWithFlag';
import AnimatedMarker from '../../components/AnimatedMarker';
import LoginDecisionOverlay from '../../overlays/LoginDecisionOverlay';
import ReportOverlay from '../../components/ReportOverlay';
import styles from '../../styles/pages/Fullpost.module.css';

// 모든 라우트 파라미터를 문자열로 받도록 타입 정의 (추후 내부에서 변환)
type FullpostRouteParams = {
  id: string;
  author: string;
  time: string;
  meetingTime: string;
  category: string;
  title: string;
  content: string;
  likes: string;
  comments: string;
  visitors: string;
  recruitmentCount: string;
  applicantsCount: string;
  profileImage?: string;
  profileThumbnail?: string;
  image?: string;
  thumbnail?: string;
  nicknameOption: string;
  meetingPlace: string;
  meetingCity: string;
  meetingCountry: string;
  mapboxImage?: string;
  isBuddyPost: string; // "true" 또는 "false" 문자열
  applicants?: string; // applicants의 길이를 나타내는 문자열 (있다면)
};

interface MySendMessagePayload {
  message: string;
}

const HEADER_APPEAR_RANGE = 120;

const Fullpost: React.FC = () => {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = searchParams ? Object.fromEntries([...searchParams.entries()]) as FullpostRouteParams : {} as FullpostRouteParams;
  
  // 라우트 파라미터 추출
  const {
    id,
    author: routeAuthor,
    time,
    meetingTime,
    category,
    title,
    content,
    likes,
    comments,
    visitors,
    recruitmentCount,
    applicantsCount,
    profileImage: routeProfileImage,
    profileThumbnail: routeProfileThumbnail,
    image: routeImage,
    thumbnail: routeThumbnail,
    nicknameOption: routeNicknameOption,
    meetingPlace,
    meetingCity,
    meetingCountry,
    mapboxImage,
    isBuddyPost,
    applicants: routeApplicants,
  } = params;

  if (!id) {
    return <div>Loading...</div>;
  }

  // 문자열을 숫자로 변환
  const initialLikes = Number(likes);
  const initialComments = Number(comments);
  const initialVisitors = Number(visitors);
  const initialRecruitmentCount = Number(recruitmentCount);
  const initialApplicantsCount = Number(applicantsCount);
  const initialApplicants = routeApplicants ? Number(routeApplicants) : initialApplicantsCount;

  // 상태값들
  const [referrer, setReferrer] = useState<string | null>(null);
  const [applicants, setApplicants] = useState<number>(initialApplicants);
  const [hasApplied, setHasApplied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [postUserId, setPostUserId] = useState('');
  const [commentText, setCommentText] = useState('');
  const [commentList, setCommentList] = useState<any[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState<number>(initialLikes);
  const [visitorCount, setVisitorCount] = useState<number>(initialVisitors);
  const [commentCount, setCommentCount] = useState<number>(initialComments);
  const [commented, setCommented] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [postAuthor, setPostAuthor] = useState(routeAuthor);
  const [postNicknameOption, setPostNicknameOption] = useState(routeNicknameOption);
  const [profileImage, setProfileImage] = useState(routeProfileImage);
  const [profileThumbnail, setProfileThumbnail] = useState(routeProfileThumbnail);
  const [image, setImage] = useState(routeImage);
  const [thumbnail, setThumbnail] = useState(routeThumbnail);
  const [applicantsProfiles, setApplicantsProfiles] = useState<any[]>([]);
  const [isRecruitmentComplete, setIsRecruitmentComplete] = useState(false);

  // isBuddyPost가 문자열이므로 boolean 변환
  const isBuddyPostBool = isBuddyPost === 'true';
  const baseUrl = isBuddyPostBool ? `${SERVER_URL}/buddy-post` : `${SERVER_URL}/posts`;

  // 클라이언트 전용 상태/변수
  const [isPlayingOwlAnimation, setIsPlayingOwlAnimation] = useState(false); // 사용하지 않지만 남겨둔 상태 (필요 시 제거)
  const [meetingLatitude, setMeetingLatitude] = useState<number | null>(null);
  const [meetingLongitude, setMeetingLongitude] = useState<number | null>(null);
  const [currentLatitude, setCurrentLatitude] = useState<number | null>(null);
  const [currentLongitude, setCurrentLongitude] = useState<number | null>(null);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>(thumbnail || '');
  const fallbackImage = '/assets/leire-cavia-S93RK176PuA-unsplash.jpg';
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginOverlayVisible, setLoginOverlayVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // 헤더 애니메이션 계산
  const headerOpacity = Math.min(1, scrollY / HEADER_APPEAR_RANGE);
  const headerTranslateY = 30 - (scrollY / HEADER_APPEAR_RANGE) * 30;

  // MessageInputForm에 전달하는 함수 (SendMessagePayload와 일치)
  const handleAddCommentWrapper = (payload: { text: string; imageUri: string | null }): void => {
    void handleAddComment(payload.text);
  };

  // URL 쿼리에서 referrer 추출
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const query = new URLSearchParams(window.location.search);
      const ref = query.get('ref');
      if (ref) setReferrer(ref);
    }
  }, []);

  const createWebLink = () => {
    const postLink = `${SERVER_URL}/posts/${id}?ref=${userId}`;
    const appLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/post/${id}?ref=${userId}`;
    console.log('web link:', postLink);
    console.log('app link:', appLink);
    return { postLink, appLink };
  };

  const handleSharePost = async () => {
    const { postLink } = createWebLink();
    try {
      if (typeof window !== 'undefined') {
        await navigator.clipboard.writeText(postLink);
        window.alert('Link copied! Share with your friends.');
        if (navigator.share) {
          await navigator.share({ url: postLink });
        }
      }
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  // 브라우저 geolocation API 사용 (클라이언트 전용)
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLatitude(position.coords.latitude);
          setCurrentLongitude(position.coords.longitude);
        },
        (error) => {
          console.error('Error fetching current location:', error);
        },
        { enableHighAccuracy: true, timeout: 20000 }
      );
    }
  }, []);

  const getDistanceString = () => {
    if (
      meetingLatitude === null ||
      meetingLongitude === null ||
      currentLatitude === null ||
      currentLongitude === null
    ) {
      return '';
    }
    const R = 6371e3;
    const lat1 = (currentLatitude * Math.PI) / 180;
    const lat2 = (meetingLatitude * Math.PI) / 180;
    const deltaLat = ((meetingLatitude - currentLatitude) * Math.PI) / 180;
    const deltaLng = ((meetingLongitude - currentLongitude) * Math.PI) / 180;
    const a =
      Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceInMeters = R * c;

    const deviceLocale = typeof window !== 'undefined' ? navigator.language : 'en-US';
    const isMetric = !deviceLocale.includes('en-US') && !deviceLocale.includes('en-GB');
    let distanceValue: number;
    if (!isMetric) {
      distanceValue = distanceInMeters / 1609.34;
      if (distanceValue >= 6.214) {
        return `${Math.round(distanceValue)}mi`;
      } else if (distanceValue >= 0.6214) {
        return `${distanceValue.toFixed(1)}mi`;
      } else {
        const meters = distanceValue * 1609.34;
        return `${Math.round(meters)}m`;
      }
    } else {
      distanceValue = distanceInMeters / 1000;
      if (distanceValue >= 10) {
        return `${Math.round(distanceValue)}km`;
      } else if (distanceValue >= 1) {
        return `${distanceValue.toFixed(1)}km`;
      } else {
        return `${Math.round(distanceInMeters)}m`;
      }
    }
  };

  // 사용자 정보 불러오기 (localStorage 사용 전 클라이언트 체크)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchUserId = async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const { data, status } = await axios.get(`${SERVER_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (status >= 200 && status < 300) {
              setUserId(data.userId);
              if (data && data.userId && routeApplicants) {
                setHasApplied(String(routeApplicants).includes(data.userId));
              }
            }
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
      };
      fetchUserId();
    }
  }, [routeApplicants, SERVER_URL]);

  // 지원자 프로필 불러오기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const fetchApplicantsProfiles = async () => {
        const token = localStorage.getItem('token');
        if (!token || !routeApplicants) return;
        try {
          const applicantIds = String(routeApplicants).split(',');
          const { data, status } = await axios.post(
            `${SERVER_URL}/users/profiles`,
            { userIds: applicantIds },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            }
          );
          if (status >= 200 && status < 300) {
            setApplicantsProfiles(data.users);
          } else {
            console.error('Failed to fetch applicants profiles:', status);
          }
        } catch (error) {
          console.error('Error fetching applicants profiles:', error);
        }
      };
      fetchApplicantsProfiles();
    }
  }, [routeApplicants, SERVER_URL]);

  const renderAuthorProfile = () => {
    if (postNicknameOption === 'AI') {
      return <img className={styles.friendProfileImage} src="/assets/AI.png" alt="AI" />;
    } else {
      return (
        <ProfileWithFlag
          userId={postUserId}
          profileImage={profileImage}
          profileThumbnail={profileThumbnail}
          size={48}
        />
      );
    }
  };

  const fetchPostData = async () => {
    if (!id) {
        console.error("Error: Missing post ID. Cannot fetch post data.");
        window.alert(t("error") + ": " + "Missing post ID");
        return;
      }
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    try {
      const { data, status } = await axios.get(`${baseUrl}/${id}`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      setCommentList(data.commentList);
      setLikeCount(data.likes);
      setVisitorCount(data.visitors);
      setCommentCount(data.comments);
      setLiked(data.likedByUser);
      setPostAuthor(data.author);
      setPostUserId(data.userId);
      setPostNicknameOption(data.nicknameOption);
      setProfileImage(data.profileImage);
      setProfileThumbnail(data.profileThumbnail);
      setIsRecruitmentComplete(data.isRecruitmentComplete);
      setImage(data.image);
      if (data.meetingLatitude) setMeetingLatitude(data.meetingLatitude);
      if (data.meetingLongitude) setMeetingLongitude(data.meetingLongitude);
    } catch (error: any) {
      console.error('Error fetching post data:', error.message);
      window.alert(t('error') + ': ' + t('fetch_post_error'));
    }
  };

  const addVisitor = async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) return;
    try {
      const { data, status } = await axios.post(`${baseUrl}/${id}/visit`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (status >= 200 && status < 300) {
        setVisitorCount(data.visitors);
      } else {
        throw new Error('Failed to update visitors');
      }
    } catch (error) {
      console.error('Error updating visitors:', error);
    }
  };

  useEffect(() => {
    fetchPostData();
    addVisitor();
  }, []);

  // 지원 신청/취소 처리
  const handleApplication = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    if (isLoading) return;
    setIsLoading(true);
    setHasApplied(!hasApplied);
    setApplicants(!hasApplied ? applicants + 1 : applicants - 1);
    if (!hasApplied) {
      setApplicantsProfiles([...applicantsProfiles, { userId, profileImage, profileThumbnail }]);
    } else {
      setApplicantsProfiles(applicantsProfiles.filter((p: any) => p.userId !== userId));
    }
    try {
      const response = await axios({
        url: `${baseUrl}/${id}/${hasApplied ? 'removeApplicant' : 'addApplicant'}`,
        method: hasApplied ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        data: { userId },
      });
      if (response.status >= 200 && response.status < 300) {
        setApplicants(response.data.applicantsCount);
        setHasApplied(!hasApplied);
        fetchPostData();
      } else {
        throw new Error('Application update failed');
      }
    } catch (error) {
      setHasApplied(!hasApplied);
      setApplicants(hasApplied ? applicants + 1 : applicants - 1);
      setApplicantsProfiles(
        hasApplied
          ? [...applicantsProfiles, { userId, profileImage, profileThumbnail }]
          : applicantsProfiles.filter((p: any) => p.userId !== userId)
      );
      console.error(`Error ${hasApplied ? 'removing' : 'adding'} applicant:`, error);
      window.alert(t('error') + ': ' + t('application_error'));
    } finally {
      setIsLoading(false);
    }
  };

  const getRecruitmentRate = () => {
    const effectiveRecruitmentCount = initialRecruitmentCount;
    if (postNicknameOption === 'AI') {
      return effectiveRecruitmentCount > 0 ? applicants / effectiveRecruitmentCount : 0;
    } else {
      return (applicants + 1) / (effectiveRecruitmentCount + 1);
    }
  };

  const getRecruitmentText = () => {
    const effectiveRecruitmentCount = initialRecruitmentCount;
    if (postNicknameOption === 'AI') {
      return `${applicants} out of ${effectiveRecruitmentCount} applied`;
    } else {
      return `${applicants + 1} out of ${effectiveRecruitmentCount + 1} applied`;
    }
  };

  const recruitmentRate = getRecruitmentRate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPostData().finally(() => setRefreshing(false));
  }, []);

  const handleLikePress = async () => {
    if (!isLoggedIn) {
      setLoginOverlayVisible(true);
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const { data, status } = await axios.post(`${baseUrl}/${id}/like`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (status >= 200 && status < 300) {
        setLikeCount(data.likes);
        setLiked(!liked);
        fetchPostData();
      } else {
        throw new Error('Failed to update likes');
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddComment = async (commentMessage: string) => {
    if (commentMessage.trim()) {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const { data: userData, status: userStatus } = await axios.get(`${SERVER_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userStatus < 200 || userStatus >= 300) {
          throw new Error('Error fetching user information.');
        }
        const newComment = {
          author: userData.nickname,
          userId: userData.userId,
          time: new Date().toISOString(),
          content: commentMessage,
          profileImage: userData.profileImage,
          profileThumbnail: userData.profileThumbnail,
        };
        const { status } = await axios.post(`${baseUrl}/${id}/comment`, newComment, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        if (status >= 200 && status < 300) {
          setCommentList([...commentList, newComment]);
          setCommentText('');
          setCommentCount(commentCount + 1);
          setCommented(true);
          fetchPostData();
        } else {
          window.alert(t('error') + ': ' + t('add_comment_error'));
        }
      } catch (error) {
        console.error('Error adding comment:', error);
        window.alert(t('error') + ': ' + t('add_comment_error'));
      }
    }
  };

  const handleDeletePost = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const { status } = await axios.delete(`${baseUrl}/${id}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (status >= 200 && status < 300) {
        window.alert(t('delete_success') + ': ' + t('delete_success_message'));
        router.back();
      } else {
        window.alert(t('error') + ': ' + t('delete_error'));
      }
    } catch (error: any) {
      console.error('Error deleting post:', error.message);
    }
  };

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  const renderCommentItem = (item: any, index: number) => (
    <MessageBubble
      key={index}
      content={item.content}
      isMine={item.userId === userId}
      timestamp={item.time}
      profileImage={item.profileImage}
      profileThumbnail={item.profileThumbnail}
      userId={item.userId}
    />
  );

  const handleReportPost = async () => {
    if (!reportReason.trim()) {
      window.alert(t('error') + ': ' + t('report_reason_required'));
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.alert(t('error') + ': ' + t('login_required'));
        return;
      }
      const payload = {
        reason: reportReason,
        ...(id && { postId: id }),
        ...(postUserId && { targetUserId: postUserId }),
      };
      const { status } = await axios.post(`${SERVER_URL}/report/post`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      if (status >= 200 && status < 300) {
        window.alert(t('report_success') + ': ' + t('report_success_message'));
        setReportVisible(false);
        setReportReason('');
        fetchPostData();
      } else {
        window.alert(t('error') + ': ' + t('report_error'));
      }
    } catch (error: any) {
      console.error('Error reporting post:', error.message);
      window.alert(t('error') + ': ' + t('report_error'));
    }
  };

  const toggleReportOverlay = () => {
    setMenuVisible(false);
    setReportVisible(!reportVisible);
  };

  const handleBookmarkPost = async () => {
    const bookmarkedPost = {
      postId: id,
      author: postAuthor,
      userId: postUserId,
      time,
      meetingTime,
      meetingPlace,
      meetingCity,
      meetingCountry,
      category,
      title,
      content,
      likes: likeCount,
      comments: commentCount,
      visitors: visitorCount,
      profileImage,
      profileThumbnail,
      image,
      mapboxImage,
      recruitmentCount: initialRecruitmentCount,
      applicantsCount: applicants,
      applicants,
      visitedUsers: applicantsProfiles.map((applicant: any) => applicant.userId),
      likedUsers: liked ? [userId] : [],
      commentList,
      nicknameOption: postNicknameOption,
      isBuddyPost: isBuddyPostBool,
    };
    try {
      const currentBookmarks = localStorage.getItem('bookmarkedPosts');
      const bookmarksArray = currentBookmarks ? JSON.parse(currentBookmarks) : [];
      const updatedBookmarks = [bookmarkedPost, ...bookmarksArray];
      localStorage.setItem('bookmarkedPosts', JSON.stringify(updatedBookmarks));
      fetchPostData();
      window.alert(t('bookmark_success') + ': ' + t('bookmark_success_message'));
    } catch (error: any) {
      console.error('Failed to bookmark the post', error.message);
      window.alert(t('error') + ': ' + t('bookmark_error'));
    }
  };

  // Lottie 관련 코드는 제거되었으며, handleOwlClick은 단순히 fetchPostData()를 호출합니다.
  const handleOwlClick = () => {
    fetchPostData();
  };

  const toggleMapFullScreen = () => {
    setIsMapFullScreen(!isMapFullScreen);
  };

  const handleCompleteRecruitment = async () => {
    const token = localStorage.getItem('token');
    try {
      const { data, status } = await axios.post(`${baseUrl}/${id}/completeRecruitment`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (status >= 200 && status < 300) {
        window.alert(t('recruitment_complete') + ': ' + t('recruitment_complete_message'));
        setIsRecruitmentComplete(true);
        fetchPostData();
      } else {
        window.alert(t('error') + ': ' + t('recruitment_error'));
      }
    } catch (error) {
      console.error('Error marking recruitment as complete:', error);
    }
  };

  const debouncedHandleApplication = useCallback(
    _.debounce(() => {
      handleApplication();
    }, 1000, { leading: true, trailing: false }),
    []
  );

  const debouncedHandleCompleteRecruitment = useCallback(
    _.debounce(() => {
      handleCompleteRecruitment();
    }, 1000, { leading: true, trailing: false }),
    []
  );

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollY(e.currentTarget.scrollTop);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setCurrentImage(image || '');
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
    <div className={styles.fullpost}>
      {/* 헤더 영역 */}
      <div
        className={styles.fullPostHeaderArea}
        style={{ opacity: headerOpacity, transform: `translateY(${headerTranslateY}px)` }}
      >
        <div className={styles.fullPostHeader}>
          <button className={styles.iconWrapper} onClick={() => router.back()}>
            <img className={styles.iconWrapper} src="/assets/BackIcon.png" alt="Back" />
          </button>
          <img className={styles.logoImage} src="/assets/Owl-icon-pink.png" alt="Logo" />
          <button
            className={styles.iconWrapper}
            onClick={() => {
              if (!isLoggedIn) {
                setLoginOverlayVisible(true);
              } else {
                toggleMenu();
              }
            }}
          >
            <img src="/assets/full-post-menu-icon.png" className={styles.menuIcon} alt="Menu" />
          </button>
        </div>
      </div>

      {/* 스크롤 영역 */}
      <div className={styles.scrollContainer} onScroll={handleScroll}>
        <div>
          {/* Hero 영역 */}
          <div className={styles.heroContainer}>
            <img
              src={currentImage ? currentImage : fallbackImage}
              className={styles.heroImage}
              alt="Hero"
              onLoad={handleImageLoad}
              onError={(error) => console.error('Failed to load image:', error)}
            />
            <div className={styles.heroGradient}></div>
            <button className={styles.backButton} onClick={() => router.back()}>
              <img src="/assets/back-light.png" className={styles.backButtonIcon} alt="Back" />
            </button>
            <button className={styles.menuButton} onClick={toggleMenu}>
              <img src="/assets/menu-light.png" className={styles.menuButtonIcon} alt="Menu" />
            </button>
            <div className={styles.heroTextOverlay}>
              <button onClick={() => setIsTextExpanded(!isTextExpanded)}>
                <h1
                  className={styles.heroTitle}
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: isTextExpanded ? 'none' : 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {title}
                </h1>
              </button>
              <p className={styles.heroCategory}>{t(`topics.${category}`)}</p>
            </div>
          </div>

          <div className={styles.fullPostMainFrame}>
            <div className={styles.recruitmentInfoContainer}>
              <div className={styles.recruitmentInfo}>
                <p className={styles.recruitmentText}>{getRecruitmentText()}</p>
                {isRecruitmentComplete || applicants >= initialRecruitmentCount ? (
                  <p className={styles.recruitmentCompleteText}>{t('recruitment_status_complete')}</p>
                ) : (
                  <div className={styles.circleContainer}>
                    <div className={styles.circle}>
                      <span>{Math.round(recruitmentRate * 100)}%</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {isRecruitmentComplete ? (
              <button className={styles.applyButtonComplete} disabled>
                {t('recruitment_status_complete')}
              </button>
            ) : userId === postUserId ? (
              <button className={styles.applyButton} onClick={debouncedHandleCompleteRecruitment}>
                {t('complete_recruitment')}
              </button>
            ) : (
              <button
                className={`${styles.applyButton} ${(hasApplied || applicants >= initialRecruitmentCount) ? styles.disabledButton : ''}`}
                onClick={debouncedHandleApplication}
                disabled={isLoading || applicants >= initialRecruitmentCount}
              >
                {isLoading
                  ? t('processing')
                  : hasApplied
                  ? t('cancel_application')
                  : applicants >= initialRecruitmentCount
                  ? t('recruitment_status_complete')
                  : t('apply')}
              </button>
            )}
          </div>

          <div className={styles.fullPostMainFrame}>
            <div className={styles.authorInformation}>
              {renderAuthorProfile()}
              <div className={styles.author}>
                <p className={styles.authorText}>{postAuthor}</p>
                <p className={styles.timeCategoryText}>
                  {t('time')}: {time} · {t(`topics.${category}`)}
                </p>
              </div>
            </div>
            <div className={styles.fullPostContents}>
              <p className={styles.textContent}>{content}</p>
            </div>
            <div className={styles.postInformation}>
              <div className={styles.iconInfo}>
                <img src="/assets/eye-colored.png" className={styles.icon} alt="Views" />
                <p className={styles.iconText}>{visitorCount}</p>
              </div>
              <button onClick={handleLikePress} className={styles.iconButton}>
                <div className={styles.iconInfo}>
                  <img src={liked ? '/assets/like-colored.png' : '/assets/like-icon.png'} className={styles.icon} alt="Like" />
                  <p className={styles.iconText}>{likeCount}</p>
                </div>
              </button>
              <div className={styles.iconInfo}>
                <img src={commented ? '/assets/comment-colored.png' : '/assets/comment-icon.png'} className={styles.icon} alt="Comment" />
                <p className={styles.iconText}>{commentCount}</p>
              </div>
            </div>
          </div>

          <div className={styles.fullApplicantsProfile}>
            <div className={styles.fullApplicants}>
              <div className={styles.fullMapContents}>
                <img src="/assets/participants-title-icon.png" className={styles.mapIcon} alt="Applicants" />
                <p className={styles.fullCommentsTitle}>
                  {t('applicants_profile')} {applicantsProfiles.length}
                </p>
              </div>
            </div>
            {applicantsProfiles.length > 0 && (
              <div className={styles.applicantsContainer}>
                {applicantsProfiles.map((applicant: any, index: number) => (
                  <ProfileWithFlag
                    key={index}
                    userId={applicant.userId}
                    nickname={applicant.nickname}
                    profileImage={applicant.profileImage}
                    profileThumbnail={applicant.profileThumbnail}
                    size={50}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={styles.fullPostMainFrame}>
            <div className={styles.fullMapContents}>
              <img src="/assets/map-colored.png" className={styles.mapIcon} alt="Map" />
              <p className={styles.fullPostTitle}>{meetingPlace}</p>
            </div>
            {(!meetingLatitude || !meetingLongitude) ? (
              <>
                <div className={styles.fullPostContents}>
                  <p className={styles.fullPostTitle}>
                    {meetingCity}, {meetingCountry}
                  </p>
                </div>
                <div className={styles.fullPostContents}>
                  <p className={styles.distanceText}>
                    {t('distance')}: {getDistanceString()}
                  </p>
                </div>
              </>
            ) : (
              <div className={styles.fullImage}>
                <button className={styles.mapPreviewContainer} onClick={toggleMapFullScreen}>
                  <img src="/assets/mapComponent.png" className={styles.mapImage} alt="Map Preview" />
                  <div className={styles.mapOverlay}>
                    <p className={styles.overlayCityCountry}>{meetingCity}, {meetingCountry}</p>
                    <p className={styles.overlayDistance}>{t('distance')}: {getDistanceString()}</p>
                  </div>
                </button>
              </div>
            )}

            <div className={styles.fullPostContents}>
              <p className={styles.fullPostTitle}>
                {meetingCity}, {meetingCountry}
              </p>
            </div>
            <div className={styles.fullPostContents}>
              <p className={styles.distanceText}>
                {t('distance')}: {getDistanceString()}
              </p>
            </div>
          </div>

          {isMapFullScreen && (
            <div className={styles.fullScreenMapContainer}>
              <div className={styles.fullScreenMap}>
                <iframe
                  title="Full Screen Map"
                  src={`https://www.google.com/maps?q=${meetingLatitude},${meetingLongitude}&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                ></iframe>
              </div>
              <button className={styles.mapBackButton} onClick={toggleMapFullScreen}>
                <img src="/assets/back-light.png" className={styles.mapBackButtonIcon} alt="Back" />
              </button>
              <div className={styles.mapInfoOverlay}>
                {image && (
                  <img src={image} className={styles.mapPostImage} alt="Post" />
                )}
                <p className={styles.mapInfoPlace}>{meetingPlace}</p>
                <p className={styles.mapInfoLocation}>
                  {meetingCity}, {meetingCountry}
                </p>
                <p className={styles.mapInfoDistance}>
                  {t('distance')}: {getDistanceString()}
                </p>
              </div>
              <button className={styles.reduceButton} onClick={toggleMapFullScreen}>
                <p className={styles.reduceButtonText}>{t('reduce')}</p>
              </button>
            </div>
          )}

          <div className={styles.fullComments}>
            <div className={styles.fullMapContents}>
              <img src="/assets/comment-title-icon.png" className={styles.mapIcon} alt="Comments" />
              <p className={styles.fullCommentsTitle}>
                {t('comments')} {commentCount}
              </p>
            </div>
            {commentCount > 0 && (
              <div className={styles.commentList}>
                {commentList.map((item, index) => renderCommentItem(item, index))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 댓글 입력 폼 */}
      <div className={styles.messageInputForm}>
        <MessageInputForm onSendMessage={handleAddCommentWrapper} showPhotoIcon={false} />
      </div>

      <ReportOverlay
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        onSubmit={handleReportPost}
        postId={id}
        targetUserId={postUserId}
      />

      {/* 메뉴 오버레이 */}
      {menuVisible && (
        <div className={styles.menuOverlay} onClick={toggleMenu}>
          <div className={styles.menuContainer} onClick={(e) => e.stopPropagation()}>
            <button className={styles.menuItem} onClick={toggleMenu}>
              <img src="/assets/delete-icon-big.png" className={styles.menuIcon} alt="Close" />
            </button>
            {userId === postUserId && (
              <button className={styles.menuItem} onClick={handleDeletePost}>
                <span className={styles.menuText}>{t('delete')}</span>
              </button>
            )}
            {userId !== postUserId && (
              <button className={styles.menuItem} onClick={toggleReportOverlay}>
                <span className={styles.menuText}>{t('report')}</span>
              </button>
            )}
            <button className={styles.menuItem} onClick={handleSharePost}>
              <span className={styles.menuText}>{t('share')}</span>
            </button>
            <button className={styles.menuItem} onClick={handleBookmarkPost}>
              <span className={styles.menuText}>{t('bookmark')}</span>
            </button>
          </div>
        </div>
      )}

      {/* 로그인 오버레이 */}
      {loginOverlayVisible && (
        <div className={styles.modalOverlay}>
          <LoginDecisionOverlay
            visible={true}
            onLogin={() => {
              setLoginOverlayVisible(false);
              router.push('/signin');
            }}
            onBrowse={() => {
              setLoginOverlayVisible(false);
            }}
          />
        </div>
      )}
    </div>
    </Suspense>
  );
};

export default Fullpost;
