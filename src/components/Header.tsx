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
                <img src="/AbrodyWebIcon.png" alt="Abrody Logo" />
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
          font-weight: 400;
          background: linear-gradient(90deg, #d8315b, #f2542d);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-decoration: underline;
          text-decoration-color: #ffffff;
        }

        /* 모바일에서 텍스트 숨김 */
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
        .action-buttons .login-button,
        .action-buttons .signup-button,
        .action-buttons .logout-button {
          font-size: 0.9rem;
          padding: 0.5rem 1.2rem;
          border-radius: 20px;
          border: 2px solid transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
        }
        .login-button {
          color: #d8315b;
          background: transparent;
        }
        .login-button:hover {
          color: #fff;
          background: linear-gradient(90deg, #d8315b, #f2542d);
        }

        .signup-button {
          color: #fff;
          background: linear-gradient(90deg, #d8315b, #f2542d);
        }
        .signup-button:hover {
          opacity: 0.85;
        }

        .logout-button {
          color: #d8315b;
          background: transparent;
        }
        .logout-button:hover {
          color: #fff;
          background: linear-gradient(90deg, #d8315b, #f2542d);
        }

        /* 본문이 헤더 아래에서 시작하도록 여유 주기 */
        :global(body) {
          padding-top: 64px;
        }
      `}</style>
    </>
  );
}