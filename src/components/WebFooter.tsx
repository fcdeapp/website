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
      <div className={styles.footerShell}>
        <div className={styles.brandPanel}>
          <Link href="/" className={styles.wordmark}>
            Abrody.
          </Link>
          <p className={styles.brandText}>
            Language learning through photos,
            <br />
            short lessons, and everyday practice.
          </p>
        </div>
        <div className={styles.footerColumns}>
          <section>
            <h2 className={styles.footerTitle}>Abrody</h2>
            <ul className={styles.footerLinks}>
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className={styles.footerTitle}>Legal</h2>
            <ul className={styles.footerLinks}>
              {legalLinks.map((item) => (
                <li key={item.type}>
                  <Link
                    href="/terms"
                    onClick={() => handleTermsClick(item.type)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className={styles.footerTitle}>Follow</h2>
            <ul className={styles.footerLinks}>
              {socialLinks.map((item) => (
                <li key={item.label}>
                  <a href={item.href} target="_blank" rel="noopener noreferrer">
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} FacadeConnect Co., Ltd.</p>
        <span>Abrody</span>
      </div>
    </footer>
  );
}
