"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import styles from "../styles/components/SlideBanner.module.css";

export interface SlideItem {
  uri: string; // public/assets 내 이미지 URL (예: "/assets/slide1.jpg")
  title?: string;
  description?: string;
  linkTo?: string;
}

export interface SlideBannerProps {
  slides: SlideItem[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
  width?: number;
  height?: number;
}

const SlideBanner: React.FC<SlideBannerProps> = ({
  slides,
  autoSlide = true,
  autoSlideInterval = 4000,
  width = window.innerWidth - 30,
  height = 200,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slideCount = slides.length;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 수동 스크롤 후 현재 인덱스 업데이트 (디바운스 처리)
  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const offsetX = scrollRef.current.scrollLeft;
      const index = Math.round(offsetX / width);
      setCurrentIndex(index);
    }
  }, [width]);

  // 자동 슬라이드 기능
  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const nextIndex = prev + 1 >= slideCount ? 0 : prev + 1;
        goToSlide(nextIndex);
        return nextIndex;
      });
    }, autoSlideInterval);
  }, [autoSlideInterval, slideCount]);

  const stopAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToSlide = (index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: index * width, behavior: "smooth" });
    }
  };

  const toggleSlide = () => {
    setIsPaused((prev) => !prev);
  };

  // 자동 슬라이드 on/off
  useEffect(() => {
    if (autoSlide && !isPaused) {
      startAutoSlide();
    } else {
      stopAutoSlide();
    }
    return () => {
      stopAutoSlide();
    };
  }, [autoSlide, isPaused, startAutoSlide, stopAutoSlide]);

  // 수동 스크롤 이벤트 리스너 (디바운스 효과 포함)
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    let timeout: NodeJS.Timeout;
    const onScroll = () => {
      clearTimeout(timeout);
      timeout = setTimeout(handleScroll, 100);
    };
    scrollContainer.addEventListener("scroll", onScroll);
    return () => {
      clearTimeout(timeout);
      scrollContainer.removeEventListener("scroll", onScroll);
    };
  }, [handleScroll]);

  // 슬라이드 클릭 시 linkTo가 있으면 해당 페이지로 이동
  const handlePressSlide = (item: SlideItem) => {
    if (item.linkTo) {
      router.push(item.linkTo);
    }
  };

  return (
    <div className={styles.container} style={{ width, height }}>
      <div
        className={styles.scrollContainer}
        ref={scrollRef}
        style={{ width, height }}
      >
        {slides.map((item, index) => {
          const hasTitleOrDesc = item.title || item.description;
          return (
            <button
              key={`slide_${index}`}
              className={styles.slide}
              style={{ width, height }}
              onClick={() => handlePressSlide(item)}
            >
              <img
                src={item.uri}
                alt={`Slide ${index + 1}`}
                className={styles.slideImage}
                style={{ width, height }}
              />
              {hasTitleOrDesc && (
                <div className={styles.textOverlay}>
                  {item.title && <p className={styles.title}>{item.title}</p>}
                  {item.description && <p className={styles.description}>{item.description}</p>}
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.indicatorContainer}>
        <span className={styles.counterText}>{`${currentIndex + 1} / ${slideCount}`}</span>
        <button className={styles.pauseButton} onClick={toggleSlide}>
          <img
            src={
              isPaused
                ? "/assets/continue-icon.png"
                : "/assets/pause-icon.png"
            }
            alt={isPaused ? "Continue" : "Pause"}
            className={styles.pauseIcon}
          />
        </button>
      </div>
    </div>
  );
};

export default SlideBanner;
