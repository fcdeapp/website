"use client";

import Link from "next/link";
import styles from "../styles/components/WebFooter.module.css";

export default function WebFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>About Facade</h3>
          <p className={styles.footerText}>
            Facade is dedicated to connecting international minds through cultural exchange and real events.
            Join our community and explore a world of possibilities.
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
                <a>Terms of Service</a>
              </Link>
            </li>
            <li>
              <Link href="/privacy">
                <a>Privacy Policy</a>
              </Link>
            </li>
          </ul>
        </div>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Follow Us</h3>
          <div className={styles.socialIcons}>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/twitter.png" alt="Twitter" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/facebook.png" alt="Facebook" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/instagram.png" alt="Instagram" />
            </a>
            <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/tiktok.png" alt="TikTok" />
            </a>
            <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer">
              <img src="/icons/youtube.png" alt="YouTube" />
            </a>
          </div>
        </div>
      </div>
      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} Facade. All rights reserved.</p>
      </div>
    </footer>
  );
}
