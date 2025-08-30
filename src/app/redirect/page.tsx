// pages/redirect.tsx
import React from "react";
import { GetServerSideProps, NextPage } from "next";

const IOS_APP_URL = "https://apps.apple.com/kr/app/id6743047157";
const ANDROID_APP_URL = "https://play.google.com/store/apps/details?id=com.fcdeapp.facade";
const FALLBACK_URL = "https://website.fcde.app/about-kr";

/**
 * 간단한 서버사이드 User-Agent 기반 OS 감지 (헤더 문자열만 사용)
 * iPad의 경우 일부 UA가 Macintosh로 나오므로 'macintosh' + 'mobile' 조합으로 보완함.
 */
function detectOSFromUA(ua?: string | string[] | null): "ios" | "android" | "other" {
  const s = Array.isArray(ua) ? ua.join(" ") : (ua || "");
  const u = s.toLowerCase();

  const isiPhoneIPadIPod = /iphone|ipad|ipod/.test(u);
  // 일부 iPadOS는 'Macintosh'로 나오지만 'Mobile'이 포함되는 경우가 있어 보완
  const isiPadOnMac = /macintosh/.test(u) && /mobile/.test(u);
  const isIOS = isiPhoneIPadIPod || isiPadOnMac;
  const isAndroid = /android/.test(u);

  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "other";
}

/**
 * 서버사이드에서 UA를 보고 바로 리디렉트(HTTP) 응답을 반환합니다.
 * 광고/크롤러 검증 목적상 permanent: false (302 계열)을 권장합니다.
 */
export const getServerSideProps: GetServerSideProps = async (context) => {
  try {
    const ua = context.req.headers["user-agent"];
    const os = detectOSFromUA(ua);

    let destination = FALLBACK_URL;
    if (os === "ios") destination = IOS_APP_URL;
    else if (os === "android") destination = ANDROID_APP_URL;

    // 서버사이드에서 곧바로 리디렉트 응답
    return {
      redirect: {
        destination,
        permanent: false,
      },
    };
  } catch (err) {
    // 실패 시 안전한 폴백 페이지로 이동
    return {
      redirect: {
        destination: FALLBACK_URL,
        permanent: false,
      },
    };
  }
};

/**
 * 이 컴포넌트는 서버에서 리디렉트할 때는 거의 렌더되지 않지만,
 * 사용자가 직접 이 페이지를 열었을 때 깔끔한 폴백 UI를 보여줍니다.
 */
const RedirectPage: NextPage = () => {
  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>잠시만 기다려 주세요…</h1>
        <p style={styles.lead}>앱 스토어로 이동 중입니다. 자동으로 이동하지 않으면 아래 버튼을 눌러주세요.</p>

        <div style={styles.buttons}>
          <a style={styles.primaryBtn} href={IOS_APP_URL} aria-label="iOS 앱스토어로 이동">
            iOS 앱스토어로 이동
          </a>
          <a style={styles.primaryBtn} href={ANDROID_APP_URL} aria-label="안드로이드 플레이스토어로 이동">
            안드로이드 플레이스토어로 이동
          </a>
          <a style={styles.secondaryBtn} href={FALLBACK_URL} aria-label="웹페이지로 이동">
            웹페이지로 이동
          </a>
        </div>

        <p style={styles.note}>
          문제가 계속되면 <a href="mailto:info@fcde.app" style={styles.link}>info@fcde.app</a> 로 연락 주시거나
          웹사이트에서 직접 확인해 주세요.
        </p>
      </div>
    </main>
  );
};

export default RedirectPage;

/* ---------- 스타일 ---------- */
const styles: { [k: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f7f8fb",
    padding: "32px 16px",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans KR'",
    color: "#0f172a",
  },
  card: {
    maxWidth: 720,
    width: "100%",
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
    padding: "32px",
    textAlign: "center",
  },
  title: {
    margin: 0,
    fontSize: 24,
    fontWeight: 700,
    color: "#0b1220",
  },
  lead: {
    marginTop: 8,
    marginBottom: 20,
    color: "#475569",
  },
  buttons: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 18,
  },
  primaryBtn: {
    display: "inline-block",
    padding: "12px 18px",
    background: "#0b1220",
    color: "#fff",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
    minWidth: 160,
    textAlign: "center",
  },
  secondaryBtn: {
    display: "inline-block",
    padding: "10px 16px",
    background: "#fff",
    color: "#0b1220",
    borderRadius: 10,
    textDecoration: "none",
    fontWeight: 600,
    border: "1px solid #e6eef8",
    minWidth: 140,
    textAlign: "center",
  },
  note: {
    marginTop: 12,
    fontSize: 13,
    color: "#6b7280",
  },
  link: {
    color: "#0b1220",
    textDecoration: "underline",
  },
};
