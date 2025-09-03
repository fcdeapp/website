"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

import { useConfig } from "@/context/ConfigContext";
import { useTranslation } from "react-i18next";

import styles from "../styles/components/PersonalChats.module.css";

interface ChatUser {
  userId: string;
  nickname: string;
  profileImage?: string;
  profileThumbnail?: string;
}

interface Chat {
  _id: string;
  userIds: string[];
  userDetails: ChatUser[];
  lastMessage: string;
  lastMessageTime: string;
  type: "personal" | "group";
  title?: string;
}

const formatRelative = (iso: string | undefined, t: (k: string, o?: any) => string) => {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)     return t("time.sec_ago", { count: Math.floor(diff) });
  if (diff < 3600)   return t("time.min_ago", { count: Math.floor(diff / 60) });
  if (diff < 86400)  return t("time.hr_ago",  { count: Math.floor(diff / 3600) });
  return t("time.day_ago", { count: Math.floor(diff / 86400) });
};

const PersonalChatsPage = () => {
  const { SERVER_URL } = useConfig();
  const { t }          = useTranslation();
  const router         = useRouter();

  const [navOpen, setNavOpen]   = useState(false);
  const [loading, setLoading]   = useState(true);
  const [error,   setError]     = useState(false);
  const [chats,   setChats]     = useState<Chat[]>([]);

  /** 로그인 여부 – 앱과 동일하게 localStorage 플래그 사용 */
  const isLoggedIn =
    typeof window !== "undefined" && localStorage.getItem("isLoggedIn") === "true";

  /** 디바이스 ID – 익명 세션용 */
  const getDeviceId = (): string => {
    // localStorage.getItem 은 string|null
    const stored = localStorage.getItem("deviceId");
    // stored 가 null 이면 새로 생성, 아니면 기존 값 사용 → 항상 string
    const id = stored ?? uuidv4();
    if (!stored) {
      localStorage.setItem("deviceId", id);
    }
    return id;
  };

  /** 데이터 로드 */
  useEffect(() => {
    const fetchChatsLoggedIn = async () => {
      const { data } = await axios.get(`${SERVER_URL}/chats/get-with-ai`, {
        withCredentials: true,
      });
      const personals: Chat[] = data.chatSummaries.filter(
        (c: Chat) => c.type === "personal"
      );
      return personals;
    };

    const fetchChatsAnon = async () => {
      const deviceId = getDeviceId();
      const { data } = await axios.get(`${SERVER_URL}/anon-ai-chat/sessions`, {
        headers: { "X-Device-Id": deviceId },
        withCredentials: true,
      });
      const sessions = data.sessions || [];
      /** anon 세션 → Chat 객체 매핑 */
      const result: Chat[] = sessions.map((s: any) => ({
        _id:         s.sessionId,
        userIds:     [s.otherUserId || "anon-ai"],
        userDetails: [{
          userId:       s.otherUserId || "anon-ai",
          nickname:     s.assistantName || "AI",
          profileImage: "/assets/AbrodyFoxGB.png",
        }],
        lastMessage:     s.lastMessage,
        lastMessageTime: s.lastMessageTime,
        type: "personal",
        title: s.assistantName || "AI",
      }));
      return result;
    };

    (async () => {
      try {
        const data = isLoggedIn
          ? await fetchChatsLoggedIn()
          : await fetchChatsAnon();
        setChats(data);
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [SERVER_URL, isLoggedIn]);

  /** 채팅 클릭 → 채팅방으로 이동 (예: /web-chatting-room) */
  const enterChat = (chat: Chat) => {
    const otherId = chat.userDetails[0]?.userId;
    router.push(`/chatting-room?chatId=${chat._id}&otherUserId=${otherId}`);
  };

  return (
    <div className={styles.container}>
      {/* ───────── Sidebar ───────── */}
      <aside className={`${styles.sidebar} ${navOpen ? styles.open : ""}`}>
        <button className={styles.toggleBtn} onClick={() => setNavOpen(!navOpen)}>
          ☰
        </button>
        <nav className={styles.navMenu}>
          <ul>
            <li className={styles.active}>{t("chat.personal")}</li>
            <li onClick={() => router.push("/buddy-groups")}>{t("buddy_groups")}</li>
            <li onClick={() => router.push("/region-chat")}>{t("regional_chat")}</li>
            <li onClick={() => router.push("/search")}>{t("search.search")}</li>
          </ul>
        </nav>
      </aside>

      {/* ───────── Main ───────── */}
      <main className={styles.main}>
        <h1 className={styles.title}>{t("chat.personal")}</h1>

        {loading && <p className={styles.info}>{t("loading")}</p>}
        {error   && <p className={styles.info}>{t("error_loading_chat")}</p>}
        {!loading && !error && chats.length === 0 && (
          <p className={styles.info}>{t("no_personal_chats")}</p>
        )}

        <ul className={styles.chatList}>
          {chats.map(chat => {
            const user = chat.userDetails[0];
            const avatar =
              user.profileThumbnail || user.profileImage || "/assets/AbrodyFoxGB.png";
            return (
              <li key={chat._id} className={styles.chatItem} onClick={() => enterChat(chat)}>
                <Image
                  src={avatar}
                  alt={user.nickname}
                  width={48}
                  height={48}
                  className={styles.avatar}
                />
                <div className={styles.chatInfo}>
                  <span className={styles.nickname}>{user.nickname}</span>
                  <span className={styles.lastMsg}>
                    {chat.lastMessage?.startsWith("https://")
                      ? t("click_view_photo")
                      : chat.lastMessage || t("first_chat_prompt")}
                  </span>
                </div>
                <span className={styles.time}>
                  {formatRelative(chat.lastMessageTime, t)}
                </span>
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
};

export default PersonalChatsPage;
