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
      <header className="headerShell">
        <div className="headerGlow headerGlowOne" />
        <div className="headerGlow headerGlowTwo" />

        <nav className="navWrap" aria-label="Primary navigation">
          <div className="leftArea">
            <Link href="/" legacyBehavior>
              <a className="logoLink" aria-label="Go to Abrody home">
                <span className="logoIconWrap">
                  <img src="/AbrodyLogo3D.png" alt="Abrody Logo" />
                </span>
                <span className="logoText">Abrody</span>
              </a>
            </Link>
          </div>

          <div className="centerArea navLinks">
            <Link href="/about" legacyBehavior>
              <a>About</a>
            </Link>
            <Link href="/business" legacyBehavior>
              <a>IR</a>
            </Link>
            <Link href="/terms" legacyBehavior>
              <a>Terms</a>
            </Link>
          </div>

          <div className="rightArea actionButtons">
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="ghostButton"
                >
                  Logout
                </button>

                <button
                  type="button"
                  className="profileButton"
                  aria-label="Profile"
                  onClick={() => router.push("/myPage")}
                >
                  <ProfileWithFlag
                    userId={userId}
                    profileImage={profileImage || undefined}
                    profileThumbnail={profileThumbnail || undefined}
                    size={40}
                  />
                </button>
              </>
            ) : (
              <>
                <Link href="/login" legacyBehavior>
                  <a className="ghostButton">Login</a>
                </Link>

                <Link href="/signUpForm" legacyBehavior>
                  <a className="primaryButton">Sign Up</a>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <style jsx>{`
        .headerShell {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1000;
          overflow: hidden;
          border-bottom: 1px solid rgba(255, 255, 255, 0.72);
          background:
            linear-gradient(
              135deg,
              rgba(255, 252, 254, 0.88) 0%,
              rgba(255, 244, 249, 0.78) 44%,
              rgba(255, 255, 255, 0.84) 100%
            );
          backdrop-filter: blur(24px) saturate(170%);
          -webkit-backdrop-filter: blur(24px) saturate(170%);
          box-shadow:
            0 18px 60px rgba(216, 49, 91, 0.08),
            0 6px 22px rgba(15, 23, 42, 0.045),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .headerGlow {
          position: absolute;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(24px);
          opacity: 0.65;
        }

        .headerGlowOne {
          width: 240px;
          height: 80px;
          left: -70px;
          top: -42px;
          background: rgba(255, 137, 178, 0.32);
        }

        .headerGlowTwo {
          width: 260px;
          height: 90px;
          right: -86px;
          bottom: -58px;
          background: rgba(242, 84, 45, 0.14);
        }

        .navWrap {
          position: relative;
          max-width: 1180px;
          height: 72px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 1rem;
        }

        .leftArea {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          min-width: 0;
        }

        .centerArea {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .rightArea {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          min-width: 0;
        }

        .logoLink {
          display: inline-flex;
          align-items: center;
          gap: 0.62rem;
          text-decoration: none;
          color: inherit;
          border-radius: 999px;
          padding: 0.28rem 0.55rem 0.28rem 0.32rem;
          transition:
            transform 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease;
        }

        .logoLink:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.48);
          box-shadow:
            0 10px 28px rgba(216, 49, 91, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.92);
        }

        .logoIconWrap {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.95),
              rgba(255, 235, 244, 0.72)
            );
          box-shadow:
            0 10px 24px rgba(216, 49, 91, 0.11),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
          overflow: hidden;
        }

        .logoIconWrap img {
          width: 34px;
          height: 34px;
          object-fit: contain;
          display: block;
          transition: transform 220ms ease;
        }

        .logoLink:hover .logoIconWrap img {
          transform: scale(1.07) rotate(-2deg);
        }

        .logoText {
          font-size: 1.18rem;
          font-weight: 800;
          letter-spacing: -0.055em;
          color: #666;
          line-height: 1;
          text-shadow:
            -1px -1px 0 rgba(255, 255, 255, 0.95),
            1px -1px 0 rgba(255, 255, 255, 0.95),
            -1px 1px 0 rgba(255, 255, 255, 0.95),
            1px 1px 0 rgba(255, 255, 255, 0.95),
            0 8px 22px rgba(216, 49, 91, 0.12);
        }

        .navLinks {
          gap: 0.35rem;
          padding: 0.32rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.44);
          border: 1px solid rgba(255, 255, 255, 0.76);
          box-shadow:
            0 10px 28px rgba(15, 23, 42, 0.04),
            inset 0 1px 0 rgba(255, 255, 255, 0.85);
        }

        .navLinks a {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 74px;
          padding: 0.62rem 0.9rem;
          border-radius: 999px;
          color: #777;
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 700;
          letter-spacing: -0.035em;
          transition:
            color 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease,
            transform 180ms ease;
        }

        .navLinks a::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          opacity: 0;
          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.98),
              rgba(255, 232, 241, 0.92)
            );
          box-shadow:
            0 8px 22px rgba(216, 49, 91, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.92);
          transition: opacity 180ms ease;
        }

        .navLinks a:hover {
          color: #d8315b;
          transform: translateY(-1px);
        }

        .navLinks a:hover::before {
          opacity: 1;
        }

        .navLinks a {
          overflow: hidden;
        }

        .navLinks a :global(*) {
          position: relative;
          z-index: 1;
        }

        .navLinks a {
          z-index: 0;
        }

        .navLinks a::after {
          content: "";
          position: absolute;
          left: 50%;
          bottom: 7px;
          width: 14px;
          height: 3px;
          border-radius: 999px;
          transform: translateX(-50%) scaleX(0);
          transform-origin: center;
          background: linear-gradient(90deg, #ff8ab5, #f2542d);
          opacity: 0;
          transition:
            transform 180ms ease,
            opacity 180ms ease;
          z-index: 1;
        }

        .navLinks a:hover::after {
          transform: translateX(-50%) scaleX(1);
          opacity: 1;
        }

        .actionButtons {
          gap: 0.72rem;
        }

        .ghostButton,
        .primaryButton {
          appearance: none;
          border: 0;
          outline: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0.68rem 1.06rem;
          border-radius: 999px;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 800;
          letter-spacing: -0.035em;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            background 180ms ease,
            color 180ms ease,
            border-color 180ms ease;
          white-space: nowrap;
        }

        .ghostButton {
          color: #666;
          border: 1px solid rgba(255, 255, 255, 0.82);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.78),
              rgba(255, 246, 250, 0.58)
            );
          box-shadow:
            0 10px 24px rgba(15, 23, 42, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.92);
        }

        .ghostButton:hover {
          color: #d8315b;
          transform: translateY(-1px);
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.96),
              rgba(255, 235, 244, 0.76)
            );
          box-shadow:
            0 14px 30px rgba(216, 49, 91, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
        }

        .primaryButton {
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.8);
          background:
            radial-gradient(
              circle at 25% 20%,
              rgba(255, 255, 255, 0.78) 0%,
              rgba(255, 255, 255, 0) 28%
            ),
            linear-gradient(135deg, #ff8ab5 0%, #d8315b 54%, #f2542d 100%);
          box-shadow:
            0 16px 34px rgba(216, 49, 91, 0.22),
            0 8px 18px rgba(242, 84, 45, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.55);
        }

        .primaryButton:hover {
          transform: translateY(-1px);
          box-shadow:
            0 20px 42px rgba(216, 49, 91, 0.28),
            0 10px 24px rgba(242, 84, 45, 0.14),
            inset 0 1px 0 rgba(255, 255, 255, 0.62);
        }

        .ghostButton:active,
        .primaryButton:active {
          transform: translateY(0);
          box-shadow:
            0 8px 18px rgba(15, 23, 42, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
        }

        .profileButton {
          width: 48px;
          height: 48px;
          padding: 0;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 999px;
          background:
            linear-gradient(
              145deg,
              rgba(255, 255, 255, 0.9),
              rgba(255, 235, 244, 0.68)
            );
          box-shadow:
            0 12px 28px rgba(216, 49, 91, 0.12),
            inset 0 1px 0 rgba(255, 255, 255, 0.94);
          display: grid;
          place-items: center;
          cursor: pointer;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease;
        }

        .profileButton:hover {
          transform: translateY(-1px) scale(1.02);
          box-shadow:
            0 16px 34px rgba(216, 49, 91, 0.16),
            inset 0 1px 0 rgba(255, 255, 255, 0.96);
        }

        @media (max-width: 820px) {
          .navWrap {
            grid-template-columns: auto 1fr auto;
            height: 68px;
            padding: 0 1rem;
          }

          .navLinks {
            gap: 0.18rem;
            justify-self: center;
          }

          .navLinks a {
            min-width: auto;
            padding: 0.56rem 0.68rem;
            font-size: 0.86rem;
          }

          .logoText {
            display: none;
          }

          .logoIconWrap {
            width: 44px;
            height: 44px;
            border-radius: 17px;
          }
        }

        @media (max-width: 640px) {
          .navWrap {
            grid-template-columns: auto 1fr;
            gap: 0.7rem;
          }

          .centerArea {
            justify-content: flex-end;
          }

          .rightArea {
            display: none;
          }

          .navLinks {
            max-width: calc(100vw - 92px);
            overflow-x: auto;
            scrollbar-width: none;
          }

          .navLinks::-webkit-scrollbar {
            display: none;
          }

          .navLinks a {
            padding: 0.54rem 0.66rem;
          }
        }

        @media (max-width: 390px) {
          .navLinks a {
            font-size: 0.8rem;
            padding: 0.5rem 0.55rem;
          }

          .logoIconWrap {
            width: 42px;
            height: 42px;
          }

          .logoIconWrap img {
            width: 31px;
            height: 31px;
          }
        }

        :global(body) {
          padding-top: 72px;
        }

        @media (max-width: 820px) {
          :global(body) {
            padding-top: 68px;
          }
        }
      `}</style>
    </>
  );
}