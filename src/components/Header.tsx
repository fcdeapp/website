"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import axios from "axios";
import ProfileWithFlag from "../components/ProfileWithFlag";
import styles from "../styles/components/Header.module.css";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [profileThumbnail, setProfileThumbnail] = useState<string>("");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/authStatus/status`,
          { withCredentials: true },
        );

        setIsLoggedIn(res.data.loggedIn);
        localStorage.setItem(
          "isLoggedIn",
          res.data.loggedIn ? "true" : "false",
        );
      } catch (err) {
        console.error("Failed to check login status", err);
        setIsLoggedIn(false);
        localStorage.setItem("isLoggedIn", "false");
      }
    };

    checkStatus();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/users/me`,
          { withCredentials: true },
        );

        const fetchedUserId = res.data.userId || "";

        setUserId(fetchedUserId);
        localStorage.setItem("userId", fetchedUserId);
        setProfileImage(res.data.profileImage || "");
        setProfileThumbnail(res.data.profileThumbnail || "");
      } catch (err) {
        console.error("Error fetching user details in header", err);
      }
    };

    if (isLoggedIn) {
      fetchUserDetails();
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/authStatus/logout`,
        {},
        { withCredentials: true },
      );

      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false");
      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <header className={styles.header}>
      <a className={styles.skip} href="#site-content">
        Skip to content
      </a>
      <nav className={styles.inner} aria-label="Primary navigation">
        <Link href="/" className={styles.brand} aria-label="Abrody home">
          Abrody<span>.</span>
        </Link>
        <button
          className={styles.menuButton}
          aria-controls="site-navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
        <div
          className={`${styles.links} ${menuOpen ? styles.open : ""}`}
          id="site-navigation"
        >
          {[
            ["/about", "About"],
            ["/business", "Company"],
            ["/contact", "Contact"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/terms"
            aria-current={pathname === "/terms" ? "page" : undefined}
          >
            Terms
          </Link>
        </div>
        <div className={styles.actions}>
          {isLoggedIn ? (
            <>
              <button
                className={styles.textButton}
                type="button"
                onClick={handleLogout}
              >
                Log out
              </button>
              <button
                type="button"
                className={styles.profile}
                aria-label="Your profile"
                onClick={() => router.push("/myProfile")}
              >
                <ProfileWithFlag
                  userId={userId}
                  profileImage={profileImage || undefined}
                  profileThumbnail={profileThumbnail || undefined}
                  size={32}
                />
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={styles.login}>
                Log in
              </Link>
              <Link href="/signUpForm" className={styles.signup}>
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
