"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import ProfileWithFlag from "../components/ProfileWithFlag";

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [profileImage, setProfileImage] = useState<string>("");
  const [profileThumbnail, setProfileThumbnail] = useState<string>("");

  // 로그인 상태 체크: 절대 URL을 사용하여 API 호출 (withCredentials:true)
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/authStatus/status`,
          { withCredentials: true }
        );
        setIsLoggedIn(res.data.loggedIn);
        localStorage.setItem("isLoggedIn", res.data.loggedIn ? "true" : "false");
      } catch (err) {
        console.error("Failed to check login status", err);
        setIsLoggedIn(false);
      }
    };
    checkStatus();
  }, []);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_URL}/users/me`,
          { withCredentials: true }
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

  // 로그아웃 핸들러: 로그아웃 API 호출 후 상태 업데이트
  const handleLogout = async () => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/authStatus/logout`,
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      localStorage.setItem("isLoggedIn", "false"); 
      router.push("/");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <>
      <header>
        <nav>
          <div className="left">
            <Link href="/">
              <a className="logo">
                <img src="/AbrodyFoxGRA.png" alt="Abrody Logo" />
                <span className="logo-text">Abrody</span>
              </a>
            </Link>
          </div>

          <div className="center nav-links">
            <Link href="/about"><a>About</a></Link>
            <Link href="/business"><a>IR</a></Link>
            <Link href="/terms"><a>Terms</a></Link>
          </div>

          <div className="right action-buttons">
            {isLoggedIn ? (
              <>
                <button onClick={handleLogout} className="logout-button">
                  Logout
                </button>
                <ProfileWithFlag
                  userId={userId}
                  profileImage={profileImage || undefined}
                  profileThumbnail={profileThumbnail || undefined}
                  size={40}
                />
              </>
            ) : (
              <>
                <Link href="/login">
                  <a className="login-button">Login</a>
                </Link>
                <Link href="/signUpForm">
                  <a className="signup-button">Sign Up</a>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <style jsx>{`
        header {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          backdrop-filter: saturate(180%) blur(20px);
          background: rgba(255, 255, 255, 0.85);
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          z-index: 1000;
        }
        nav {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 1.5rem;
        }
        .left .logo {
          display: flex;
          align-items: center;
        }
        .left .logo img {
          height: 40px;
          transition: transform 0.3s ease;
        }
        .left .logo:hover img {
          transform: scale(1.1);
        }
        .logo-text {
          margin-left: 8px;
          font-size: 1.2rem;
          font-weight: 500;
          letter-spacing: -0.02em;
          background: linear-gradient(90deg, #6b7280 0%, #111827 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: underline;
          text-decoration-color: #ffffff;
          opacity: .92;
          text-shadow: 0 1px 12px rgba(17,24,39,0.08);
          transition: opacity .2s ease, filter .2s ease, transform .2s ease;
        }
        .left .logo:hover .logo-text {
          opacity: 1;
          filter: contrast(105%);
          transform: translateY(-1px);
        }
          
        @media (max-width: 640px) {
          .logo-text {
            display: none;
          }
        }

        .center.nav-links {
          display: flex;
          gap: 2rem;
        }
        .nav-links a {
          position: relative;
          font-size: 0.95rem;
          font-weight: 400;
          color: #333;
          text-decoration: none;
          padding: 0.25rem 0;
          transition: color 0.3s ease;
        }
        .nav-links a::after {
          content: "";
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #d8315b, #f2542d);
          transition: width 0.3s ease;
        }
        .nav-links a:hover {
          color: #d8315b;
        }
        .nav-links a:hover::after {
          width: 100%;
        }

        .right.action-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
          
        @media (max-width: 640px) {
          .right.action-buttons {
            display: none !important;
          }
        }

        .action-buttons .login-button,
        .action-buttons .signup-button,
        .action-buttons .logout-button {
          font-size: 0.9rem;
          padding: 0.5rem 1.1rem;
          border-radius: 999px;
          border: 1px solid rgba(17, 24, 39, 0.14);   /* 중립 윤곽 */
          background: rgba(255,255,255,0.55);         /* 헤더의 blur와 어울리게 */
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #111827;
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
          text-decoration: none;
          transition: transform .16s ease, box-shadow .16s ease, background .16s ease, color .16s ease, border-color .16s ease;
        }

        .login-button,
        .logout-button {
          background: rgba(255,255,255,0.4);
          color: #374151; /* Gray-700 */
        }
        .login-button:hover,
        .logout-button:hover {
          background: rgba(255,255,255,0.75);
          border-color: rgba(17,24,39,0.22);
          color: #111827; /* Gray-900 */
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.10);
        }

        .signup-button {
          background: linear-gradient(180deg, rgba(243,244,246,0.9), rgba(229,231,235,0.9)); /* Gray-100→200 */
          color: #111827;
          border-color: rgba(17,24,39,0.12);
        }
        .signup-button:hover {
          background: linear-gradient(180deg, rgba(229,231,235,0.95), rgba(209,213,219,0.95)); /* 살짝만 진하게 */
          border-color: rgba(17,24,39,0.2);
          transform: translateY(-1px);
          box-shadow: 0 10px 24px rgba(0,0,0,0.10);
        }

        .action-buttons .login-button:active,
        .action-buttons .signup-button:active,
        .action-buttons .logout-button:active {
          transform: translateY(0);
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
        }

        @media (prefers-color-scheme: dark) {
          .action-buttons .login-button,
          .action-buttons .signup-button,
          .action-buttons .logout-button {
            background: rgba(17,17,20,0.4);
            color: #e5e7eb; /* Gray-200 */
            border-color: rgba(255,255,255,0.16);
          }
          .login-button:hover,
          .logout-button:hover {
            background: rgba(24,24,28,0.6);
            color: #f3f4f6;
            border-color: rgba(255,255,255,0.24);
          }
          .signup-button {
            background: linear-gradient(180deg, rgba(31,31,36,0.8), rgba(24,24,28,0.8));
            color: #f3f4f6;
          }
          .signup-button:hover {
            background: linear-gradient(180deg, rgba(36,36,42,0.85), rgba(28,28,33,0.85));
          }
        }

        :global(body) {
          padding-top: 64px;
        }
      `}</style>
    </>
  );
}