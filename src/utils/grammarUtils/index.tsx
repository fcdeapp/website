import escapeStringRegexp from "escape-string-regexp";

export interface Issue {
  error: string;
  suggestion: string;
  explanation: string;
  index?: number;
}

export const tokenize = (s: string) => s.trim().split(/\s+/);

/**
 * ──────────────────────────────────────────────────────────
 *  ensureIndexedIssues
 *  --------------------------------------------------------
 *  ▸ 교체형(error 존재)
 *    1차 : 토큰 비교로 정확히 일치하는 위치 탐색
 *    2차 : 구두점·대소문자를 무시한 RegExp 로 fallback
 *
 *  ▸ 삽입형(error="")
 *    corrected 문장을 함께 넘기면 LCS 스캔으로 정밀 위치 계산
 *    (없으면 문장 끝에 삽입으로 처리)
 * ──────────────────────────────────────────────────────────
 */
export const ensureIndexedIssues = (
  sentence: string,
  issues: Issue[],
  corrected?: string
): Issue[] => {
  const srcTokens = tokenize(sentence);
  const corrTokens = corrected ? tokenize(corrected) : [];

  const findIndexByRegex = (src: string, err: string): number => {
    const re = new RegExp(`\\b${escapeStringRegexp(err)}\\b`, "i");
    const m = re.exec(src);
    if (!m || m.index === undefined) return -1;
    const before = src.slice(0, m.index).trim();
    return before ? before.split(/\s+/).length : 0;
  };

  return issues.map((iss) => {
    // 이미 index 지정
    if (iss.index !== undefined && iss.index >= 0) return iss;

    /** ─────────────── 교체형 ─────────────── */
    if (iss.error.trim()) {
      // 1) 토큰 join 방식
      const errTok = tokenize(iss.error);
      const pos = srcTokens.findIndex((_, i) =>
        srcTokens.slice(i, i + errTok.length).join(" ") === iss.error
      );
      if (pos >= 0) return { ...iss, index: pos };

      // 2) RegExp fallback (대소문자/구두점 tolerant)
      const pos2 = findIndexByRegex(sentence, iss.error);
      return { ...iss, index: pos2 };
    }

    /** ─────────────── 삽입형 ─────────────── */
    const insTok = tokenize(iss.suggestion);
    if (corrTokens.length) {
      let i = 0,
        j = 0;
      while (i < srcTokens.length && j < corrTokens.length) {
        if (srcTokens[i] === corrTokens[j]) {
          i++;
          j++;
          continue;
        }
        const slice = corrTokens.slice(j, j + insTok.length).join(" ");
        if (slice === iss.suggestion.trim()) {
          return { ...iss, index: i };
        }
        j++; // 안전장치
      }
    }
    // 위치를 못 찾으면 문장 끝에 삽입
    return { ...iss, index: srcTokens.length };
  });
};

/**
 * sentence + issues -> 정답 토큰 배열 반환
 * ▸ index==-1 교체형은 RegExp 로라도 1회 치환하여 반영한다.
 */
export const buildCorrectTokens = (sentence: string, issues: Issue[]): string[] => {
  let fallbackSent = sentence;
  const tokens = tokenize(sentence);

  ensureIndexedIssues(sentence, issues)
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .forEach((iss) => {
      const sugTok = tokenize(iss.suggestion);

      if ((iss.index ?? -1) >= 0) {
        const errLen = tokenize(iss.error).length;
        tokens.splice(iss.index!, errLen, ...sugTok);
      } else if (iss.error.trim()) {
        // index 찾기 실패 → 문자열 단위 fallback 치환 (한 번만)
        const re = new RegExp(`\\b${escapeStringRegexp(iss.error)}\\b`, "i");
        fallbackSent = fallbackSent.replace(re, iss.suggestion);
      }
    });

  // fallbackSent 가 변했으면 그것을 다시 tokenize
  return fallbackSent === sentence ? tokens : tokenize(fallbackSent);
};

/** a b c → a <b,d> c 형태로 치환/삽입까지 지원 */
export const applyIssues = (sentence: string, issues: Issue[]): string[] => {
  const result = tokenize(sentence);
  const ordered = [...issues].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  ordered.forEach(({ error, suggestion, index = 0 }) => {
    const sugTok = tokenize(suggestion);
    if (error.trim()) {
      // 교체형
      const errLen = tokenize(error).length;
      result.splice(index, errLen, ...sugTok);
    } else {
      // 삽입형
      result.splice(index, 0, ...sugTok);
    }
  });

  return result;
};
