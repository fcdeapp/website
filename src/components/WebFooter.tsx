"use client";

import Link from "next/link";
import styles from "../styles/components/WebFooter.module.css";

type TermsType = "service" | "privacy" | "community";

const quickLinks = [
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const legalLinks: Array<{
  label: string;
  type: TermsType;
}> = [
  { label: "Terms of Service", type: "service" },
  { label: "Privacy Policy", type: "privacy" },
  { label: "Community Guidelines", type: "community" },
];

const socialLinks = [
  {
    href: "https://x.com/facadeconnect/status/1934952417680150568",
    label: "X",
    icon: "/icons/twitter.png",
  },
  {
    href: "https://www.facebook.com/share/1HrNxiJxV8/?mibextid=wwXIfr",
    label: "Facebook",
    icon: "/icons/facebook.png",
  },
  {
    href: "https://www.instagram.com/abrody.app?igsh=MWo2ajQyMWZpdXFxNg%3D%3D&utm_source=qr",
    label: "Instagram",
    icon: "/icons/instagram.png",
  },
  {
    href: "https://www.tiktok.com/@abrody.language.m/video/7516879247135509778?is_from_webapp=1&sender_device=pc&web_id=7516889198793377298",
    label: "TikTok",
    icon: "/icons/tiktok.png",
  },
  {
    href: "https://youtu.be/0-ZbuoKICVQ",
    label: "YouTube",
    icon: "/icons/youtube.png",
  },
];

export default function WebFooter() {
  const handleTermsClick = (type: TermsType) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("termsType", type);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerGlowOne} />
      <div className={styles.footerGlowTwo} />
      <div className={styles.footerGrid} />

      <div className={styles.footerShell}>
        <div className={styles.brandPanel}>
          <div className={styles.brandMark}>
            <span>A</span>
          </div>

          <div>
            <p className={styles.kicker}>Abrody</p>
            <h2 className={styles.brandTitle}>
              Learn from the moments you actually live.
            </h2>
          </div>

          <p className={styles.brandText}>
            Abrody turns your real life into real language learning — whenever
            you want, in 12 supported languages. Just snap a photo and get
            instant, personalized lessons tailored to your daily moments.
          </p>

          <div className={styles.brandPills} aria-label="Abrody features">
            <span>Image Vocab</span>
            <span>Situation Practice</span>
            <span>Daily Drills</span>
          </div>
        </div>

        <div className={styles.footerColumns}>
          <section className={styles.footerSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionDot} />
              <h3 className={styles.footerTitle}>Quick Links</h3>
            </div>

            <ul className={styles.footerLinks}>
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={styles.footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.footerSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionDot} />
              <h3 className={styles.footerTitle}>Legal</h3>
            </div>

            <ul className={styles.footerLinks}>
              {legalLinks.map((item) => (
                <li key={item.type}>
                  <Link
                    href="/terms"
                    className={styles.footerLink}
                    onClick={() => handleTermsClick(item.type)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className={styles.footerSection}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionDot} />
              <h3 className={styles.footerTitle}>Follow Us</h3>
            </div>

            <p className={styles.socialText}>
              Follow Abrody updates, product videos, and language-learning
              stories.
            </p>

            <div className={styles.socialIcons}>
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialIcon}
                  aria-label={item.label}
                >
                  <img src={item.icon} alt="" />
                </a>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>
          ⓒ {new Date().getFullYear()} Abrody, operated by FacadeConnect Co.,
          Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}