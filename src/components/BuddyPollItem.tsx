"use client";

import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import styles from '../styles/components/BuddyPollItem.module.css';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

interface PollOption {
  optionText: string;
  selectedUserIds: string[];
}

interface VoterProfile {
  userId: string;
  profileImage: string;
  nickname: string;
}

interface Poll {
  _id: string;
  createdByUserId: string;
  createdByNickname: string;
  createdAt: string;
  title: string;
  description: string;
  deadline: string;
  isYesNoPoll: boolean;
  isAnonymous: boolean;
  options: PollOption[];
}

interface BuddyPollItemProps {
  poll: Poll;
  buddyGroupId: string;
  onPollUpdate: () => void;
  selectedOptions: { [pollId: string]: string };
  setSelectedOptions: React.Dispatch<React.SetStateAction<{ [pollId: string]: string }>>;
}

// ─────────────────────────────────────────────
// AnimatedPieChart 컴포넌트
// ─────────────────────────────────────────────
interface AnimatedPieChartProps {
  options: PollOption[];
  size?: number;
}

const AnimatedPieChart: React.FC<AnimatedPieChartProps> = ({ options, size = 200 }) => {
  const [animationProgress, setAnimationProgress] = useState(0);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const durationProgress = 1000;
    const durationScale = 800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationProgress, 1);
      setAnimationProgress(progress);
      const scaleVal = Math.min(elapsed / durationScale, 1);
      setScale(scaleVal);
      if (progress < 1 || scaleVal < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, []);

  const totalVotes = options.reduce((sum, opt) => sum + opt.selectedUserIds.length, 0);
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;

  const colors = ["#AEC6CF", "#FFD1DC", "#B39EB5", "#FFB347", "#B5EAD7", "#FFDAC1"];

  let cumulativeAngle = 0;
  const arcs = options.map((opt, index) => {
    const voteCount = opt.selectedUserIds.length;
    const angle = totalVotes > 0 ? (voteCount / totalVotes) * 360 : 0;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;
    return { startAngle, endAngle, color: colors[index % colors.length], optionText: opt.optionText, voteCount };
  });

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    const d = [
      "M", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", x, y,
      "Z"
    ].join(" ");
    return d;
  };

  return (
    <div className={styles.chartContainer}>
      <div
        className={styles.chartWrapper}
        style={{ transform: `scale(${scale})`, width: size, height: size }}
      >
        <svg width={size} height={size}>
          {arcs.map((arc, index) => {
            const animatedEndAngle = arc.startAngle + animationProgress * (arc.endAngle - arc.startAngle);
            const path = describeArc(cx, cy, radius, arc.startAngle, animatedEndAngle);
            return (
              <path
                key={index}
                d={path}
                fill={arc.color}
              />
            );
          })}
        </svg>
      </div>
      <div className={styles.legendContainer}>
        {arcs.map((arc, idx) => (
          <div key={idx} className={styles.legendItem}>
            <div className={styles.legendColorBox} style={{ backgroundColor: arc.color }} />
            <span className={styles.legendText}>{arc.optionText}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// BuddyPollItem 컴포넌트
// ─────────────────────────────────────────────

// 서버에서 가져오는 이미지(URL이 http/https로 시작하는 경우)는 그대로 사용하고,
// 그렇지 않은 경우 모두 public/assets/ 폴더에서 불러오도록 처리하는 헬퍼 함수
const getFullImageUrl = (url: string) =>
  url.startsWith('http') ? url : `/assets/${url}`;

const BuddyPollItem: React.FC<BuddyPollItemProps> = (props) => {
  const { poll, buddyGroupId, onPollUpdate, selectedOptions, setSelectedOptions } = props;
  const currentSelectedOptions = selectedOptions || {};
  const { t } = useTranslation();
  const [voterModalVisible, setVoterModalVisible] = useState(false);
  const [currentOptionVoters, setCurrentOptionVoters] = useState<VoterProfile[]>([]);
  const [isActionsVisible, setIsActionsVisible] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // 각 옵션에 대한 ripple 애니메이션 ref
  const animationRefs = useRef(poll.options.map(() => ({
    rippleScale: 0,
    rippleAnimating: false
  }))).current;

  useEffect(() => {
    // SSR 이슈를 피하기 위해 클라이언트에서 실행
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL || '';

  const formatDeadline = (deadline: string) => {
    const date = new Date(deadline);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pollVoted = currentSelectedOptions[poll._id];
  const isPollCompleted = new Date() > new Date(poll.deadline) || pollVoted;

  const animateOption = (index: number) => {
    animationRefs[index].rippleAnimating = true;
    // 500ms 후 애니메이션 종료
    setTimeout(() => {
      animationRefs[index].rippleAnimating = false;
      // 강제 렌더를 위해 상태 업데이트
      setDummy(prev => prev + 1);
    }, 500);
    // 강제 렌더용 상태 업데이트
    setDummy(prev => prev + 1);
  };

  // 강제 렌더를 위한 dummy state
  const [dummy, setDummy] = useState(0);

  const handleVote = async (pollId: string, optionText: string, index: number) => {
    if (new Date() > new Date(poll.deadline)) {
      alert(t('poll.deadlinePassed') || '투표 마감 시간이 지났습니다.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');
      if (!storedUserId) {
        alert('User ID is not available.');
        return;
      }

      animateOption(index);

      const response = await axios.post(
        `${SERVER_URL}/buddy-polls/${buddyGroupId}/polls/${pollId}/vote`,
        { userId: storedUserId, selectedOptions: [optionText] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        alert(t('poll.voteSuccess'));
        setSelectedOptions((prevState) => ({
          ...prevState,
          [pollId]: optionText,
        }));
        onPollUpdate();
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert(t('poll.voteError'));
    }
  };

  const handleClosePoll = async (pollId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${SERVER_URL}/buddy-polls/${buddyGroupId}/polls/${pollId}/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t('poll.closePollSuccess'));
      onPollUpdate();
    } catch (error) {
      console.error('Error closing poll:', error);
      alert(t('poll.closePollError'));
    }
  };

  const handleDeletePoll = async (pollId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${SERVER_URL}/buddy-polls/${buddyGroupId}/polls/${pollId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(t('poll.deletePollSuccess'));
      onPollUpdate();
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert(t('poll.deletePollError'));
    }
  };

  const handleViewParticipants = async (e: MouseEvent, voterIds: string[], optionText: string) => {
    e.preventDefault(); // 우클릭 메뉴 방지
    if (poll.isAnonymous) {
      alert(t('poll.anonymousPollError'));
      return;
    }

    if (!voterIds.length) {
      alert(t('poll.noParticipants'));
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${SERVER_URL}/users/profiles`,
        { userIds: voterIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCurrentOptionVoters(response.data.users);
      setVoterModalVisible(true);
    } catch (error) {
      console.error('Error fetching voter profiles:', error);
    }
  };

  return (
    <div className={styles.pollItem} onClick={() => setIsActionsVisible(false)}>
      <h2 className={styles.pollTitle}>{poll.title}</h2>
      <p className={styles.pollDescription}>{poll.description}</p>
      <div className={styles.metaContainer}>
        <div className={styles.metaItem}>
          <img src="/assets/buddyMemberIcon.png" alt="member icon" className={styles.metaIcon} />
          <span className={styles.metaText}>{t('poll.createdBy', { nickname: poll.createdByNickname })}</span>
        </div>
        <div className={styles.metaItem}>
          <img src="/assets/buddyCalendarIcon.png" alt="calendar icon" className={styles.metaIcon} />
          <span className={styles.metaText}>{t('poll.deadline', { deadline: formatDeadline(poll.deadline) })}</span>
        </div>
      </div>

      {isPollCompleted ? (
        <div className={styles.resultsContainer}>
          <AnimatedPieChart options={poll.options} size={200} />
        </div>
      ) : (
        poll.options.map((option, index) => {
          const isSelected = currentSelectedOptions[poll._id] === option.optionText;
          // 우클릭(onContextMenu) 시 참여자 목록 보기
          return (
            <div
              key={option.optionText}
              className={`${styles.optionButton} ${isSelected ? styles.selectedOptionButton : ''}`}
              onClick={() => handleVote(poll._id, option.optionText, index)}
              onContextMenu={(e) => handleViewParticipants(e, option.selectedUserIds, option.optionText)}
            >
              {animationRefs[index].rippleAnimating && (
                <div className={styles.rippleEffect} />
              )}
              <span className={`${styles.optionText} ${isSelected ? styles.selectedOptionText : ''}`}>
                {option.optionText}
              </span>
              <span className={`${styles.selectionRate} ${isSelected ? styles.selectedOptionText : ''}`}>
                {poll.options.reduce((sum, opt) => sum + opt.selectedUserIds.length, 0) > 0
                  ? ((option.selectedUserIds.length / poll.options.reduce((sum, opt) => sum + opt.selectedUserIds.length, 0)) * 100).toFixed(1)
                  : "0"}%
              </span>
            </div>
          );
        })
      )}

      <div className={styles.iconContainer}>
        {poll.createdByUserId === userId && !isActionsVisible && (
          <img
            src="/assets/plus-icon.png"
            alt="poll actions"
            className={styles.iconPoll}
            onClick={(e) => {
              e.stopPropagation();
              setIsActionsVisible(true);
            }}
          />
        )}
      </div>

      {isActionsVisible && (
        <div className={styles.actionsContainer}>
          <button className={styles.actionButton} onClick={() => handleClosePoll(poll._id)}>
            {t('poll.closePoll')}
          </button>
          <button className={`${styles.actionButton} ${styles.deleteButton}`} onClick={() => handleDeletePoll(poll._id)}>
            {t('poll.deletePoll')}
          </button>
        </div>
      )}

      {voterModalVisible && (
        <div className={styles.modalBackground}>
          <div className={styles.modalContainer}>
            <h3 className={styles.modalTitle}>{t('poll.participantsList')}</h3>
            <ul>
              {currentOptionVoters.map((item) => (
                <li key={item.userId} className={styles.voterItem}>
                  <img src={getFullImageUrl(item.profileImage)} alt="voter" className={styles.voterImage} />
                  <span>{item.nickname}</span>
                </li>
              ))}
            </ul>
            <button className={styles.closeButton} onClick={() => setVoterModalVisible(false)}>
              {t('poll.close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuddyPollItem;
