"use client";

import Link from "next/link";
import styles from "../styles/components/WebFooter.module.css";

export default function WebFooter() {
  // onClick 핸들러로 클릭 시 선택된 TermsType 값을 localStorage에 저장
  const handleTermsClick = (type: "service" | "privacy") => {
    if (typeof window !== "undefined") {
      localStorage.setItem("termsType", type);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>About Abrody</h3>
          <p className={styles.footerText}>
          Abrody turns your real life into real language learning—any language, any moment. Just snap a photo, and get instant, personalized lessons for the situations you care about.
          </p>
        </div>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Quick Links</h3>
          <ul className={styles.footerLinks}>
            <li>
              <Link href="/about">
                <a>About Us</a>
              </Link>
            </li>
            <li>
              <Link href="/contact">
                <a>Contact</a>
              </Link>
            </li>
            <li>
              <Link href="/faq">
                <a>FAQ</a>
              </Link>
            </li>
            <li>
              <Link href="/terms">
                <a onClick={() => handleTermsClick("service")}>Terms of Service</a>
              </Link>
            </li>
            <li>
              <Link href="/terms">
                <a onClick={() => handleTermsClick("privacy")}>Privacy Policy</a>
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Follow Us</h3>
          <div className={styles.socialIcons}>
            <a href="https://x.com/facadeconnect/status/1934952417680150568" target="_blank" rel="noopener noreferrer">
              <img src="/icons/twitter.png" alt="Twitter" />
            </a>
            <a href="https://www.facebook.com/share/1HrNxiJxV8/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">
              <img src="/icons/facebook.png" alt="Facebook" />
            </a>
            <a href="https://www.instagram.com/abrody.app?igsh=MWo2ajQyMWZpdXFxNg%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer">
              <img src="/icons/instagram.png" alt="Instagram" />
            </a>
            <a href="https://www.tiktok.com/@abrody.language.m/video/7516879247135509778?is_from_webapp=1&sender_device=pc&web_id=7516889198793377298" target="_blank" rel="noopener noreferrer">
              <img src="/icons/tiktok.png" alt="TikTok" />
            </a>
            <a href="https://youtu.be/0-ZbuoKICVQ" target="_blank" rel="noopener noreferrer">
              <img src="/icons/youtube.png" alt="YouTube" />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>ⓒ {new Date().getFullYear()} Abrody, operated by FacadeConnect Co., Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
}
