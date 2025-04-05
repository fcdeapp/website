"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/components/IslandButton.module.css";

interface IslandButtonProps {
  text: string;                  // 확대 상태에서 보여줄 텍스트
  iconSource: string;            // 축소 상태에서 보여줄 아이콘 (URL)
  expanded: boolean;             // 현재 확대/축소 상태
  onPress: () => void;           // 버튼 눌렀을 때 실행할 함수
  bottom?: number;               // 화면 하단 여백 (기본 100)
  shortRightOffset?: number;     // 축소 상태일 때 오른쪽 끝 여백 (기본 20)
  expandedCenterRatio?: number;  // 확대 상태일 때 가로 위치 비율 (0~1, 기본 0.5)
}

const MIN_WIDTH = 50;    // 축소 상태일 때 버튼 너비
const MAX_WIDTH = 200;   // 확대 상태일 때 버튼 너비

const IslandButton: React.FC<IslandButtonProps> = ({
  text,
  iconSource,
  expanded,
  onPress,
  bottom = 100,
  shortRightOffset = 20,
  expandedCenterRatio = 0.5,
}) => {
  // progress: 0이면 축소, 1이면 확대
  const [progress, setProgress] = useState(expanded ? 1 : 0);
  // 텍스트 렌더링 여부: 축소 시 텍스트를 언마운트
  const [renderText, setRenderText] = useState(expanded);

  useEffect(() => {
    let start: number | null = null;
    const duration = 300;
    const initial = progress;
    const target = expanded ? 1 : 0;
    if (expanded) setRenderText(true);
    const animate = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      const newProgress = initial + (target - initial) * Math.min(elapsed / duration, 1);
      setProgress(newProgress);
      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else if (!expanded) {
        setRenderText(false);
      }
    };
    requestAnimationFrame(animate);
  }, [expanded]);

  // 계산된 인터폴레이션 값들
  const width = MIN_WIDTH + (MAX_WIDTH - MIN_WIDTH) * progress;
  const iconOpacity =
    progress < 0.4 ? 1 : Math.max(0, 1 - (progress - 0.4) / 0.6);
  const iconContainerWidth =
    progress < 0.4 ? 36 : Math.max(0, 36 * (1 - (progress - 0.4) / 0.6));
  const textOpacity = progress < 0.7 ? 0 : Math.min(1, (progress - 0.7) / 0.3);
  const screenWidth = typeof window !== "undefined" ? window.innerWidth : 375;
  const posX =
    (screenWidth - MIN_WIDTH - shortRightOffset) +
    (screenWidth * expandedCenterRatio - MAX_WIDTH / 2 - (screenWidth - MIN_WIDTH - shortRightOffset)) *
      progress;

  return (
    <div
      className={styles.container}
      style={{
        width: `${width}px`,
        transform: `translateX(${posX}px)`,
        bottom: `${bottom}px`,
      }}
    >
      <button className={styles.touchArea} onClick={onPress}>
        <div className={styles.gradientBackground}>
          {/* 아이콘 영역 */}
          <div
            className={styles.iconContainer}
            style={{
              width: `${iconContainerWidth}px`,
              opacity: iconOpacity,
            }}
          >
            <img src={iconSource} alt="icon" className={styles.icon} />
          </div>
          {/* 텍스트 영역 */}
          {renderText && (
            <div className={styles.textContainer} style={{ opacity: textOpacity }}>
              <span className={styles.text} title={text}>{text}</span>
            </div>
          )}
        </div>
      </button>
    </div>
  );
};

export default IslandButton;
