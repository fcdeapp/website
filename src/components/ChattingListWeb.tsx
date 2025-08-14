"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import styles from "../styles/components/ChattingListWeb.module.css";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

/* 외부(앱과 공통) 컴포넌트/훅/유틸이 이미 존재한다고 가정 */
import { useConfig } from "../context/ConfigContext";
import GuideOverlay, { GuideStep } from "../components/GuideOverlay";
import useMeasure from "../hooks/useMeasure";
import BuddyProfileWithFlag from "../components/BuddyProfileWithFlag";
import ProfileWithFlag from "../components/ProfileWithFlag";
import BuddyGroupDetailModal from "../components/BuddyGroupDetailModal";
import BuddyCreateModal from "../components/BuddyCreateModal";
import { formatTimeDifference } from "../utils/timeUtils";
import { getDistrictNameFromCoordinates } from "../utils/locationUtils";

/* ───────────────────── Types ───────────────────── */
type TabKey = "personal" | "buddy" | "region" | "search";

interface Chat {
  _id: string;
  userIds: string[];
  userDetails: {
    userId: string;
    nickname: string;
    profileImage?: string | null;
    profileThumbnail?: string | null;
  }[];
  lastMessage: string;
  lastMessageTime: string;
  type: "personal" | "group";
  title: string;
}

interface BuddyGroup {
  buddyGroupId: string;
  buddyGroupName: string;
  isAdminBuddy: boolean;
  buddyJoinedAt: string;
  buddyPhoto?: string;
  buddyPhotoMedium?: string;
  buddyPhotoThumbnail?: string;
  description: string;
  activityCountry?: string;
  members: {
    userId: string;
    nickname: string;
    profileImage?: string;
    profileThumbnail?: string;
  }[];
  lastMessage: string;
  lastMessageTime: string;
}

type SelectPayload =
  | { type: "ai"; otherUserId: "brody-ai" }
  | { type: "custom-ai"; otherUserId: string; chatId?: string }
  | { type: "personal"; chatId: string; otherUserId: string }
  | { type: "group"; buddyGroupId: string }
  | { type: "region"; district: string };

interface Props {
  /** 좌측 패널 오픈/클로즈 */
  open: boolean;
  /** 패널 닫기 콜백 */
  onClose?: () => void;
  /** 항목 선택 시 (채팅방 변경) 콜백 */
  onSelectChat: (payload: SelectPayload) => void;
}

/* ───────────────────── Helpers ───────────────────── */
const TABS: { key: TabKey; i18n: string }[] = [
  { key: "personal", i18n: "personal" },
  { key: "buddy", i18n: "buddy" },
  { key: "region", i18n: "region" },
  { key: "search", i18n: "search.search" },
];

const ls = {
  get: (k: string) => {
    try {
      return typeof window !== "undefined" ? window.localStorage.getItem(k) : null;
    } catch {
      return null;
    }
  },
  set: (k: string, v: string) => {
    try {
      if (typeof window !== "undefined") window.localStorage.setItem(k, v);
    } catch {}
  },
};

/* ───────────────────── Component ───────────────────── */
export default function ChattingListWeb({ open, onClose, onSelectChat }: Props) {
  const { SERVER_URL } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedTab, setSelectedTab] = useState<TabKey>("personal");

  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>("");

  const [chats, setChats] = useState<Chat[]>([]);
  const [buddyGroups, setBuddyGroups] = useState<BuddyGroup[]>([]);
  const [buddyGroupsLoading, setBuddyGroupsLoading] = useState(true);

  // Guide anchors
  const [toggleRef, toggleTarget] = useMeasure<HTMLDivElement>();
  const [aiRef, aiTarget] = useMeasure<HTMLDivElement>();
  const [friendsRef, friendsTarget] = useMeasure<HTMLDivElement>();
  const [buddyRef, buddyTarget] = useMeasure<HTMLDivElement>();
  const [regionRef, regionTarget] = useMeasure<HTMLDivElement>();

  const [showChatGuide, setShowChatGuide] = useState(false);
  const CHAT_GUIDE_KEY = "overlay_chatlist_web_v1";

  /* Region (district) */
  const [district, setDistrict] = useState<string>("");
  const geoAbortRef = useRef<number | null>(null);

  const chatGuideSteps: GuideStep[] = useMemo(() => {
    const base = [
      { tgt: toggleTarget, key: "chatGuide.step1" },
      { tgt: aiTarget, key: "chatGuide.step2" },
      { tgt: friendsTarget, key: "chatGuide.step3" },
      { tgt: buddyTarget, key: "chatGuide.step4" },
      { tgt: regionTarget, key: "chatGuide.step5" },
    ];
    return base.filter(({ tgt }) => !!tgt).map(({ tgt, key }) => ({ key, target: tgt! }));
  }, [toggleTarget, aiTarget, friendsTarget, buddyTarget, regionTarget]);

  /* ───────── Login/Me ───────── */
  useEffect(() => {
    const token = ls.get("token");
    setIsLoggedIn(!!token);
    (async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await axios.get(`${SERVER_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserId(me.data?.userId || "");
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [SERVER_URL]);

  /* ───────── First-time guide ───────── */
  useEffect(() => {
    const v = ls.get(CHAT_GUIDE_KEY);
    if (v === null) setShowChatGuide(true);
  }, []);

  /* ───────── Data loaders ───────── */
  const fetchChats = async (): Promise<Chat[]> => {
    const token = ls.get("token");
    if (!token) return [];

    const { data } = await axios.get(`${SERVER_URL}/chats/get-with-ai`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const { chatSummaries, aiSummary } = data;
    const normalized: Chat[] = chatSummaries.map((chat: Chat) => ({
      ...chat,
      userDetails: chat.userDetails.map((u) => ({
        ...u,
        profileImage: u.profileImage || null,
        profileThumbnail: u.profileThumbnail || null,
      })),
    }));

    if (aiSummary) {
      normalized.unshift({
        _id: "brody-ai",
        userIds: ["brody-ai"],
        userDetails: [
          {
            userId: "brody-ai",
            nickname: "Brody (AI Chat)",
            profileImage: "/assets/AIProfile.png",
          } as any,
        ],
        lastMessage: aiSummary.lastMessage,
        lastMessageTime: aiSummary.lastMessageTime,
        type: "personal",
        title: "Brody (AI)",
      });
    }
    return normalized;
  };

  const fetchCustomAIChats = async (): Promise<Chat[]> => {
    const token = ls.get("token");
    if (!token) return [];
    const { data } = await axios.get(`${SERVER_URL}/ai-chat/sessions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const sessions = data.sessions || [];
    return sessions
      .filter((s: any) => typeof s.otherUserId === "string" && s.otherUserId.startsWith("custom-ai-"))
      .map(
        (s: any): Chat => ({
          _id: s.sessionId,
          userIds: [s.otherUserId],
          userDetails: [
            {
              userId: s.otherUserId,
              nickname: s.assistantName || "AI Chat",
              profileImage: "/assets/AIProfile.png",
            },
          ],
          lastMessage: s.lastMessage,
          lastMessageTime: s.lastMessageTime,
          type: "personal",
          title: s.assistantName || "AI Chat",
        })
      );
  };

  const fetchBuddyGroups = async (): Promise<BuddyGroup[]> => {
    const token = ls.get("token");
    if (!token) return [];
    const res = await axios.get(`${SERVER_URL}/buddy-groups/user-groups`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const bg = (res.data?.buddyGroups || []).map((g: any) => ({
      ...g,
      buddyPhoto: g.buddyPhoto,
      buddyPhotoMedium: g.buddyPhotoMedium,
      buddyPhotoThumbnail: g.buddyPhotoThumbnail,
    }));
    return bg;
  };

  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      try {
        setLoading(true);
        const [base, custom, groups] = await Promise.all([fetchChats(), fetchCustomAIChats(), fetchBuddyGroups()]);
        // custom AI + base chats (중복 없이 앞쪽에 custom 우선)
        const customIds = new Set(custom.map((c) => c._id));
        const merged = [...custom, ...base.filter((b) => !customIds.has(b._id))];
        setChats(merged);
        setBuddyGroups(groups);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
        setBuddyGroupsLoading(false);
      }
    })();
  }, [isLoggedIn]);

  /* ───────── Region (get district) ───────── */
  const getDistrict = async () => {
    const token = ls.get("token");
    if (!token) {
      setDistrict(t("login_required"));
      return;
    }

    const cachedDistrict = ls.get("cachedDistrict");
    if (cachedDistrict) {
      setDistrict(cachedDistrict);
    }

    const geo = navigator.geolocation;
    if (!geo) {
      setDistrict(t("location_not_available"));
      return;
    }

    // geolocation timeout (20s)
    const timeoutId = window.setTimeout(() => {
      geoAbortRef.current = null;
      console.warn("Geolocation timeout");
    }, 20000);
    geoAbortRef.current = timeoutId;

    geo.getCurrentPosition(
      async (pos) => {
        if (geoAbortRef.current) {
          clearTimeout(geoAbortRef.current);
          geoAbortRef.current = null;
        }
        const { latitude, longitude } = pos.coords;
        try {
          const info = await getDistrictNameFromCoordinates(latitude, longitude, SERVER_URL);
          if (info?.city) {
            setDistrict(info.city);
            ls.set("cachedDistrict", info.city);
            ls.set("cachedLocation", JSON.stringify({ latitude, longitude }));
          } else {
            setDistrict("Unknown City");
          }
        } catch (e) {
          console.error(e);
          setDistrict("Unknown City");
        }
      },
      (err) => {
        if (geoAbortRef.current) {
          clearTimeout(geoAbortRef.current);
          geoAbortRef.current = null;
        }
        console.error(err);
        setDistrict(t("location_permission_denied"));
      },
      { enableHighAccuracy: true }
    );
  };

  useEffect(() => {
    if (selectedTab === "region" && !district) {
      getDistrict();
    }
  }, [selectedTab]);

  /* ───────── Derived ───────── */
  const hasAIChat = useMemo(() => chats.some((c) => c.userIds.includes("brody-ai")), [chats]);

  const formatChatTitle = (chat: Chat): string => {
    if (chat.type === "group") {
      const memberCountText = `(${chat.userDetails.length})`;
      return chat.title ? `${chat.title} ${memberCountText}` : `group ${memberCountText}`;
    }
    const other = chat.userDetails.find((u) => u.userId !== userId);
    return other ? other.nickname : t("unknown");
  };

  const getProfileImage = (chat: Chat, me: string): string => {
    if (chat.type === "group") return "/assets/groupChat.png";
    const other = chat.userDetails.find((u) => u.userId !== me);
    return other?.profileImage || "/assets/Annonymous.png";
  };

  /* ───────── Render ───────── */
  return (
    <>
      <div className={classNames(styles.backdrop, { [styles.backdropOpen]: open })} onClick={onClose} />
      <aside className={classNames(styles.panel, { [styles.panelOpen]: open })} aria-hidden={!open}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.iconBtn} onClick={onClose} aria-label="Close">
            <img src="/assets/BackIcon.png" alt="close" width={24} height={24} />
          </button>
          <div className={styles.headerTitle}>{t("chatting_list")}</div>
          <button
            className={styles.iconBtn}
            onClick={() => {
              if (!isLoggedIn) return onClose?.();
              router.push("/friend-list");
            }}
            aria-label="New chat"
          >
            <img src="/assets/newChat.png" alt="new" width={24} height={24} />
          </button>
        </div>

        {/* Tabs */}
        <div ref={toggleRef} className={styles.tabs}>
          <div className={styles.slider} style={{ "--tab-index": TABS.findIndex((t) => t.key === selectedTab) } as any} />
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={classNames(styles.tabBtn, { [styles.tabBtnActive]: selectedTab === tab.key })}
              onClick={() => {
                if (tab.key === "search") {
                  // 검색 페이지로 이동 (패널은 닫지 않음)
                  router.push("/search");
                  return;
                }
                setSelectedTab(tab.key);
              }}
            >
              {t(tab.i18n)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {/* PERSONAL */}
          {selectedTab === "personal" && (
            <div className={styles.list}>
              {/* AI Quick Start */}
              {!hasAIChat && (
                <div ref={aiRef} className={styles.item}>
                  <img className={styles.avatar} src="/assets/AIProfile.png" alt="AI" width={48} height={48} />
                  <div className={styles.itemMain} onClick={() => onSelectChat({ type: "ai", otherUserId: "brody-ai" })}>
                    <div className={styles.nickname}>Brody (AI)</div>
                    <div className={styles.message}>{t("start_ai_chat")}</div>
                  </div>
                  <div className={styles.time}>{formatTimeDifference(new Date().toISOString(), t)}</div>
                </div>
              )}

              {/* 내 채팅 목록 */}
              <div ref={friendsRef}>
                {loading ? (
                  <div className={styles.spinner} />
                ) : chats.length === 0 ? (
                  <div className={styles.empty}>
                    <img src="/assets/no_globe.png" alt="" width={120} height={120} />
                    <div className={styles.emptyText}>{t("no_personal_chats")}</div>
                    <button className={styles.ctaBtn} onClick={() => router.push("/search")}>
                      <img src="/assets/plus-icon.png" alt="" width={16} height={16} />
                      <span>{t("search_friends")}</span>
                    </button>
                  </div>
                ) : (
                  chats.map((chat) => {
                    const isAI = chat.userIds.includes("brody-ai") || chat.userIds.some((id) => id.startsWith("custom-ai-"));
                    const otherUserId =
                      chat.userIds.find((id) => id !== userId) || chat.userIds[0] || "unknown";

                    return (
                      <div
                        key={chat._id}
                        className={styles.item}
                        onClick={() => {
                          if (chat.userIds.includes("brody-ai")) {
                            onSelectChat({ type: "ai", otherUserId: "brody-ai" });
                            return;
                          }
                          if (chat.userIds.some((id) => id.startsWith("custom-ai-"))) {
                            onSelectChat({ type: "custom-ai", otherUserId, chatId: chat._id });
                            return;
                          }
                          onSelectChat({ type: "personal", chatId: chat._id, otherUserId });
                        }}
                      >
                        {isAI ? (
                          <img className={styles.avatar} src="/assets/AIProfile.png" alt="AI" width={48} height={48} />
                        ) : (
                          <ProfileWithFlag
                            userId={otherUserId}
                            profileImage={getProfileImage(chat, userId)}
                            size={48}
                          />
                        )}
                        <div className={styles.itemMain}>
                          <div className={styles.nickname}>{formatChatTitle(chat)}</div>
                          <div className={styles.message}>
                            {chat.lastMessage
                              ? chat.lastMessage.includes("https://")
                                ? t("click_view_photo")
                                : chat.lastMessage
                              : t("first_chat_prompt")}
                          </div>
                        </div>
                        <div className={styles.time}>{formatTimeDifference(chat.lastMessageTime, t)}</div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* BUDDY (그룹) */}
          {selectedTab === "buddy" && (
            <div ref={buddyRef} className={styles.list}>
              {buddyGroupsLoading ? (
                <div className={styles.spinner} />
              ) : buddyGroups.length === 0 ? (
                <div className={styles.empty}>
                  <img src="/assets/no_globe.png" alt="" width={120} height={120} />
                  <div className={styles.emptyText}>{t("no_buddy_groups")}</div>
                  <CreateBuddyButton />
                </div>
              ) : (
                buddyGroups.map((bg) => (
                  <div key={bg.buddyGroupId} className={styles.item} onClick={() => onSelectChat({ type: "group", buddyGroupId: bg.buddyGroupId })}>
                    <BuddyProfileWithFlag
                      buddyGroupId={bg.buddyGroupId}
                      buddyPhoto={bg.buddyPhoto || ""}
                      buddyPhotoMedium={bg.buddyPhotoMedium || ""}
                      buddyPhotoThumbnail={bg.buddyPhotoThumbnail || ""}
                      activityCountry={bg.activityCountry || ""}
                      size={48}
                    />
                    <div className={styles.itemMain}>
                      <div className={styles.nickname}>{bg.buddyGroupName}</div>
                      <div className={styles.message}>
                        {bg.lastMessage ? (bg.lastMessage.includes("https://") ? t("view_photo") : bg.lastMessage) : t("no_new_conversations")}
                      </div>
                    </div>
                    <div className={styles.time}>{bg.lastMessageTime ? formatTimeDifference(bg.lastMessageTime, t) : ""}</div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* REGION */}
          {selectedTab === "region" && (
            <div ref={regionRef} className={styles.regionSection}>
              <div className={styles.regionHero}>
                <img src="/assets/foxBackground.png" alt="" />
                <div className={styles.regionOverlay} />
                <div className={styles.regionContent}>
                  <div className={styles.regionTitle}>{district ? `${district} ${t("chat_room")}` : t("regional_chat")}</div>
                  <div className={styles.regionDesc}>{t("join_regional_chat_desc")}</div>
                  <button
                    className={styles.ctaPrimary}
                    disabled={!district || district === "Unknown City" || district === t("location_permission_denied")}
                    onClick={() => onSelectChat({ type: "region", district: district || "Unknown City" })}
                  >
                    {t("enter")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SEARCH 탭은 즉시 라우팅해서 별도 UI 불필요 */}
        </div>

        {/* 가이드 */}
        <GuideOverlay
          visible={showChatGuide && chatGuideSteps.length > 0}
          steps={chatGuideSteps}
          storageKey={CHAT_GUIDE_KEY}
          onClose={() => setShowChatGuide(false)}
        />
      </aside>
    </>
  );
}

/* 하단: 보조 버튼 (버디 그룹 만들기) */
function CreateBuddyButton() {
  const { t } = useTranslation();
  const router = useRouter();
  const onClick = () => {
    router.push("/posting"); // 앱의 Posting 라우트에 맞춰 조정
  };
  return (
    <button className={styles.ctaBtn} onClick={onClick}>
      <img src="/assets/plus-icon.png" alt="" width={16} height={16} />
      <span>{t("create_buddy_group")}</span>
    </button>
  );
}
