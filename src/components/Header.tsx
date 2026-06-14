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
          border-bottom: 1px solid rgba(17, 24, 39, 0.06);
          background: rgba(255, 255, 255, 0.82);
          backdrop-filter: blur(22px) saturate(160%);
          -webkit-backdrop-filter: blur(22px) saturate(160%);
          box-shadow:
            0 18px 54px rgba(17, 24, 39, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        .headerGlow {
          position: absolute;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(26px);
          opacity: 0.72;
        }

        .headerGlowOne {
          width: 260px;
          height: 80px;
          left: -90px;
          top: -46px;
          background: rgba(216, 49, 91, 0.07);
        }

        .headerGlowTwo {
          width: 280px;
          height: 90px;
          right: -96px;
          bottom: -62px;
          background: rgba(242, 84, 45, 0.055);
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
          padding: 0.28rem 0.62rem 0.28rem 0.32rem;
          border-radius: 999px;
          color: inherit;
          text-decoration: none;
          transition:
            transform 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease;
        }

        .logoLink:hover {
          transform: translateY(-1px);
          background: rgba(255, 255, 255, 0.86);
          box-shadow:
            0 12px 28px rgba(17, 24, 39, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        .logoIconWrap {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          overflow: hidden;
          border-radius: 18px;
          background:
            linear-gradient(180deg, #ffffff 0%, #f2f4f6 100%);
          border: 1px solid rgba(17, 24, 39, 0.065);
          box-shadow:
            0 12px 28px rgba(17, 24, 39, 0.065),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        .logoIconWrap img {
          width: 34px;
          height: 34px;
          object-fit: contain;
          display: block;
          transition: transform 220ms ease;
        }

        .logoLink:hover .logoIconWrap img {
          transform: scale(1.06) rotate(-2deg);
        }

        .logoText {
          color: #111827;
          font-size: 1.18rem;
          font-weight: 900;
          letter-spacing: -0.06em;
          line-height: 1;
        }

        .navLinks {
          gap: 0.28rem;
          padding: 0.32rem;
          border-radius: 999px;
          background: rgba(248, 250, 252, 0.82);
          border: 1px solid rgba(17, 24, 39, 0.06);
          box-shadow:
            0 12px 28px rgba(17, 24, 39, 0.045),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        .navLinks a {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 74px;
          padding: 0.62rem 0.92rem;
          border-radius: 999px;
          color: #6b7280;
          text-decoration: none;
          font-size: 0.92rem;
          font-weight: 800;
          letter-spacing: -0.035em;
          transition:
            color 180ms ease,
            background 180ms ease,
            box-shadow 180ms ease,
            transform 180ms ease;
        }

        .navLinks a:hover {
          color: #111827;
          transform: translateY(-1px);
          background: #ffffff;
          box-shadow:
            0 10px 24px rgba(17, 24, 39, 0.055),
            inset 0 1px 0 rgba(255, 255, 255, 1);
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
          background: #d8315b;
          opacity: 0;
          transition:
            transform 180ms ease,
            opacity 180ms ease;
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
          outline: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 42px;
          padding: 0.68rem 1.08rem;
          border: 1px solid rgba(17, 24, 39, 0.07);
          border-radius: 999px;
          color: #191f28;
          background:
            linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          box-shadow:
            0 12px 28px rgba(17, 24, 39, 0.055),
            inset 0 1px 0 rgba(255, 255, 255, 1);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 850;
          letter-spacing: -0.035em;
          white-space: nowrap;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            background 180ms ease,
            color 180ms ease,
            border-color 180ms ease;
        }

        .primaryButton {
          color: #111827;
          background:
            linear-gradient(180deg, #ffffff 0%, #f2f4f6 100%);
        }

        .ghostButton:hover,
        .primaryButton:hover {
          transform: translateY(-1px);
          color: #111827;
          border-color: rgba(17, 24, 39, 0.12);
          background: #ffffff;
          box-shadow:
            0 16px 34px rgba(17, 24, 39, 0.075),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        .ghostButton:active,
        .primaryButton:active {
          transform: translateY(0);
          box-shadow:
            0 8px 18px rgba(17, 24, 39, 0.055),
            inset 0 1px 0 rgba(255, 255, 255, 1);
        }

        .profileButton {
          width: 48px;
          height: 48px;
          padding: 0;
          display: grid;
          place-items: center;
          cursor: pointer;
          border: 1px solid rgba(17, 24, 39, 0.07);
          border-radius: 999px;
          background:
            linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          box-shadow:
            0 12px 28px rgba(17, 24, 39, 0.06),
            inset 0 1px 0 rgba(255, 255, 255, 1);
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            border-color 180ms ease;
        }

        .profileButton:hover {
          transform: translateY(-1px) scale(1.02);
          border-color: rgba(17, 24, 39, 0.12);
          box-shadow:
            0 16px 34px rgba(17, 24, 39, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 1);
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