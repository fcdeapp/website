// src/components/Header.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Header() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 로그인 상태 체크: /auth/status 엔드포인트 호출 (쿠키 전송을 위해 withCredentials:true 사용)
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await axios.get("/authStatus/status", { withCredentials: true });
        setIsLoggedIn(res.data.loggedIn);
      } catch (err) {
        console.error("Failed to check login status", err);
        setIsLoggedIn(false);
      }
    };
    checkStatus();
  }, []);

  // 로그아웃 핸들러: /auth/logout 호출 후 로그인 상태 업데이트 및 홈으로 이동
  const handleLogout = async () => {
    try {
      await axios.post("/authStatus/logout", {}, { withCredentials: true });
      setIsLoggedIn(false);
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
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
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
          width: 80px;
          height: auto;
        }
        .nav-links {
          display: flex;
          gap: 20px;
        }
        .nav-link {
          text-decoration: none;
          color: inherit;
          padding: 5px 10px;
          border-radius: 5px;
          transition: background-color 0.3s ease;
        }
        .nav-link:hover {
          background-color: #f0f0f0;
        }
        .action-buttons a,
        .logout-button {
          text-decoration: none;
          margin-left: 15px;
          padding: 8px 16px;
          border-radius: 25px;
          font-weight: bold;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          cursor: pointer;
          border: none;
        }
        .action-buttons a:hover,
        .logout-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .login-button {
          background-color: #0a1045;
          color: #fff;
          border: 1px solid #0a1045;
        }
        .login-button:hover {
          background-color: #0a1045;
          opacity: 0.9;
        }
        .signup-button {
          background-color: #fff;
          color: #0a1045;
          border: 1px solid #0a1045;
        }
        .signup-button:hover {
          background-color: #f7f7f7;
        }
        .logout-button {
          background-color: #fff;
          color: #0a1045;
          border: 1px solid #0a1045;
        }
        .logout-button:hover {
          background-color: #f7f7f7;
        }
      `}</style>
    </header>
  );
}
