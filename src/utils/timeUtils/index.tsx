// utils/timeUtils.ts
export const formatTimeDifference = (time: string, t: (key: string, params?: any) => string): string => {
  const postTime = new Date(time).getTime();
  if (isNaN(postTime)) {
    return t('unknown');
  }
  
  const now = Date.now();
  const difference = now - postTime;
  const minutes = Math.floor(difference / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return t('just_now');
  } else if (minutes < 60) {
    return t('minutes_ago', { count: minutes });
  } else if (hours < 24) {
    return t('hours_ago', { count: hours });
  } else {
    return t('days_ago', { count: days });
  }
};

/** 미래(모임시간) 표시 — 신규 함수 */
export const formatTimeUntil = (time: string, t: (key: string, params?: any) => string): string => {
  const target = new Date(time).getTime();
  if (isNaN(target)) return t('unknown');

  const now = Date.now();
  const diffMs = target - now;
  const absMinutes = Math.floor(Math.abs(diffMs) / (1000 * 60));
  const absHours = Math.floor(absMinutes / 60);

  if (diffMs > 0) {
    if (absHours < 1) return t('minutes_remaining', { count: absMinutes });
    if (absHours < 24) return t('hours_remaining', { count: absHours });
    return t('days_remaining', { count: Math.floor(absHours / 24) });
  }
  return t('meeting_passed');
};