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
    <header className="header">
      <nav className="header-nav">
        {/* Left: Logo */}
        <Link href="/">
          <img
            src="/FacadeWebLogo.png"
            alt="Facade Logo"
            className="logo"
          />
        </Link>

        {/* Center: Nav Links */}
        <div className="nav-links">
          <Link href="/about">
            <a className="nav-link">About</a>
          </Link>
          <Link href="/posts">
            <a className="nav-link">Posts</a>
          </Link>
          <Link href="/terms">
            <a className="nav-link">Terms</a>
          </Link>
          <Link href="/searchPage">
            <a className="nav-link">Search</a>
          </Link>
        </div>

        {/* Right: Action Buttons */}
        <div className="action-buttons">
          {isLoggedIn ? (
            <>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
              <div style={{ marginLeft: "10px" }}>
                <ProfileWithFlag
                  userId={userId}
                  profileImage={profileImage || undefined}
                  profileThumbnail={profileThumbnail || undefined}
                  size={48}
                />
              </div>
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
      <style jsx>{`
        .header-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 20px;
        }
        .logo {
          width: 50px; /* 크기를 기존보다 줄임 */
          height: auto;
          margin: 10px 0; /* 상하에 마진 추가 */
          transition: transform 0.3s ease;
        }
        .logo:hover {
          transform: scale(1.333);
        }
        .nav-links {
          display: flex;
          gap: 20px;
        }
        .nav-link {
          text-decoration: none;
          color: #555555;
          padding: 5px 10px;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }
        .nav-link:hover {
          background-color: #f0f0f0;
        }
        /* 공통 버튼 스타일: 높이 및 패딩 통일 */
        .action-buttons a,
        .logout-button,
        .login-button,
        .signup-button {
          text-decoration: none;
          margin-left: 15px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 36px; /* 버튼 높이 설정 */
          padding: 0 16px; /* 좌우 패딩, 상하는 height로 고정 */
          border-radius: 25px;
          font-weight: bold;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          border: none;
          box-sizing: border-box;
        }
        .action-buttons a:hover,
        .logout-button:hover,
        .login-button:hover,
        .signup-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .login-button {
          background-color: rgba(216, 49, 91, 0.1);
          color: #D8315B; 
          border: 1px solid #555555;
        }
        .login-button:hover {
          background-color: rgba(216, 49, 91, 0.15);
          opacity: 0.9;
        }
        .signup-button {
          background-color: #fff;
          color: rgba(216, 49, 91, 0.65);
          border: 1px solid rgba(216, 49, 91, 0.65);
        }
        .signup-button:hover {
          background-color: #f7f7f7;
        }
        .logout-button {
          background-color: #fff;
          color: rgba(216, 49, 91, 0.65);
          border: 1px solid rgba(216, 49, 91, 0.65);
          margin-top: 4px;
        }
        .logout-button:hover {
          background-color: #f7f7f7;
        }
      `}</style>
    </header>
  );
}
