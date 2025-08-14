"use client";

/* ───────────────────────── Types ───────────────────────── */
interface Choice {
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

type StatusLabel = "smart" | "helper" | "fast";
type CEFR = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
type Scenario =
  | "cafe"
  | "hotel"
  | "directions"
  | "grocery"
  | "clothes"
  | "interview"
  | "meeting"
  | "call"
  | "hospital"
  | "emergency"
  | "dating"
  | "party";
type SupportedLang =
  | "en"
  | "es"
  | "fr"
  | "zh"
  | "ja"
  | "ko"
  | "ar"
  | "de"
  | "hi"
  | "it"
  | "pt"
  | "ru";

interface Issue {
  error: string;
  suggestion: string;
  explanation: string;
  index?: number;
}

/* ───────────────────────── Imports ───────────────────────── */
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import Image from "next/image";
import classNames from "classnames";
import styles from "../../styles/pages/ChattingRoom.module.css";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import io from "socket.io-client";

/* Shared contexts & utils */
import { useConfig } from "../../context/ConfigContext";
import { useTranslation } from "react-i18next";
import * as freqStore from "../../context/freqStore";
import languageFlags from "../../constants/languageFlags";
import useMeasure from "../../hooks/useMeasure";
import { ensureIndexedIssues, applyIssues } from "../../utils/grammarUtils";

/* Reused components */
import MessageBubble from "../../components/MessageBubble";
import MessageInputFormAI from "../../components/MessageInputFormAI";
import BuddyGroupDetailModal from "../../components/BuddyGroupDetailModal";
import InviteOverlay from "../../components/InviteOverlay";
import MultipleChoiceOptions from "../../components/MultipleChoiceOptions";
import GramIsleBadge from "../../components/GramIsleBadge";
import GuideOverlay, { GuideStep } from "../../components/GuideOverlay";
import CustomScenarioModal from "../../components/CustomScenarioModal";
import MoveQuiz from "../../components/MoveQuiz";
import FillQuiz from "../../components/FillQuiz";
import BuddyProfileWithFlag from "../../components/BuddyProfileWithFlag";

/* ───────────────────────── Constants ───────────────────────── */
const defaults: SupportedLang[] = [
  "en",
  "es",
  "fr",
  "zh",
  "ja",
  "ko",
  "ar",
  "de",
  "hi",
  "it",
  "pt",
  "ru",
];

const SCENARIOS: { id: Scenario; icon?: string }[] = [
  { id: "cafe" },
  { id: "hotel" },
  { id: "directions" },
  { id: "grocery" },
  { id: "clothes" },
  { id: "interview" },
  { id: "meeting" },
  { id: "call" },
  { id: "hospital" },
  { id: "emergency" },
  { id: "dating" },
  { id: "party" },
];

const GREETINGS: Record<SupportedLang, string[]> = {
  en: [
    "Hi there! Who are you and what's happening right now?",
    "Hello! Where am I, and who are you?",
    "Hey! Who are you? What's the situation?",
  ],
  es: [
    "¡Hola! ¿Quién eres y qué está pasando ahora?",
    "¡Buenas! ¿Dónde estoy y quién eres tú?",
    "¡Hey! ¿Quién eres y cuál es la situación?",
  ],
  fr: [
    "Salut ! Qui es-tu et que se passe-t-il ?",
    "Bonjour ! Où suis-je et qui es-tu ?",
    "Coucou ! Qui es-tu ? Quelle est la situation ?",
  ],
  zh: ["你好！你是谁？现在是什么情况？", "嗨！我在哪里？你是谁？", "嘿！你是谁？发生了什么事？"],
  ja: [
    "こんにちは！あなたは誰？今はどんな状況？",
    "やあ！ここはどこで、あなたは誰？",
    "ねえ！あなたは誰？今どういう状況？",
  ],
  ko: ["안녕! 넌 누구야? 지금 어떤 상황이야?", "안녕하세요! 여기가 어디고 당신은 누구죠?", "반가워! 지금 상황이 어떻게 돼?"],
  ar: ["مرحباً! من أنت وما الذي يحدث الآن؟", "أهلًا! أين أنا ومن تكون؟", "يا هلا! من أنت؟ وما الوضع؟"],
  de: ["Hi! Wer bist du und was passiert gerade?", "Hallo! Wo bin ich und wer bist du?", "Hey! Wer bist du? Was ist hier los?"],
  hi: [
    "नमस्ते! आप कौन हैं और अभी क्या हो रहा है?",
    "हैलो! मैं कहाँ हूँ और आप कौन हैं?",
    "अरे! आप कौन हैं? स्थिति क्या है?",
  ],
  it: [
    "Ciao! Chi sei e cosa sta succedendo adesso?",
    "Salve! Dove sono e chi sei tu?",
    "Ehi! Chi sei? Qual è la situazione?",
  ],
  pt: ["Oi! Quem é você e o que está acontecendo agora?", "Olá! Onde estou e quem é você?", "Ei! Quem é você? Qual é a situação?"],
  ru: ["Привет! Кто ты и что сейчас происходит?", "Здравствуйте! Где я и кто вы?", "Эй! Кто ты? Какая сейчас ситуация?"],
};

/* model status label → i18n key */
const bannerByLabel =
  (t: (k: string) => string) =>
  (label: StatusLabel) =>
    t(`ai-rt.banner.${label}`);

/* Web Speech typing (vendor prefix) */
declare global {
  interface Window {
    webkitSpeechRecognition?: any;
    SpeechRecognition?: any;
  }
}

/* ───────────────────────── Page Component ───────────────────────── */
export default function ChattingRoomPage() {
  const { SERVER_URL, FEATURE_UNDER_DEV } = useConfig();
  const { t } = useTranslation();
  const router = useRouter();
  const params = useSearchParams();

  /* query params (app parity) */
  const otherUserId = params.get("otherUserId") || undefined;
  const buddyGroupId = params.get("buddyGroupId") || undefined;
  const routeChatId = params.get("chatId") || undefined;

  /* identity & session */
  const [userId, setUserId] = useState<string>("");
  const [chatId, setChatId] = useState<string | null>(routeChatId ?? null);
  const [chat, setChat] = useState<any | null>(null);

  /* header display */
  const [nickname, setNickname] = useState<string>("friend");
  const [chatTitle, setChatTitle] = useState<string>("");

  /* messages */
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [noMessages, setNoMessages] = useState(false);

  /* menu & modals */
  const [menuVisible, setMenuVisible] = useState(false);
  const [inviteOverlayVisible, setInviteOverlayVisible] = useState(false);
  const [buddyGroupDetailVisible, setBuddyGroupDetailVisible] = useState(false);
  const [buddyGroupDetails, setBuddyGroupDetails] = useState<any | null>(null);
  const [buddyDetailLoading, setBuddyDetailLoading] = useState(false);
  const [loginOverlayVisible, setLoginOverlayVisible] = useState(false);
  const [editTitleModalVisible, setEditTitleModalVisible] = useState(false);

  const [grammarIssues, setGrammarIssues] = useState<Record<string, Issue[]>>(
    {}
  );
  const [loadingGrammar, setLoadingGrammar] = useState<Record<string, boolean>>(
    {}
  );
  const [grammarCnt, setGrammarCnt] = useState(0);
  const [expressionCnt, setExpressionCnt] = useState(0);

  /* AI & modes */
  const [difficulty, setDifficulty] = useState<CEFR>("B1");
  const [topic, setTopic] = useState<"none" | "science" | "art" | "law" | "medicine">("none");
  const [isAiMenuExpanded, setIsAiMenuExpanded] = useState(false);
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(false);
  const [isRolePlayMode, setIsRolePlayMode] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario>("cafe");
  const [pendingChoices, setPendingChoices] = useState<Choice[] | null>(null);
  const [enableMCQ, setEnableMCQ] = useState(true);
  const [modelStatus, setModelStatus] = useState<string | null>(null);

  /* language & auto check */
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>("en");
  const [isLanguageExpanded, setIsLanguageExpanded] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<SupportedLang[]>(["en"]);
  const [showDefaultsList, setShowDefaultsList] = useState(false);
  const [isAutoCheckActive, setIsAutoCheckActive] = useState(true);

  /* smart mode (name gradient) w/ daily limit */
  const [isNameGradient, setIsNameGradient] = useState(false);
  const [smartCount, setSmartCount] = useState<number>(0);
  const [smartCountDate, setSmartCountDate] = useState<string>("");

  /* state mirrors from native */
  const isAIChat =
    !otherUserId || otherUserId === "brody-ai" || otherUserId.startsWith("custom-ai");
  const isCustomAI = !!otherUserId?.startsWith("custom-ai");
  const isFullyActive = isVoiceChatMode && isRolePlayMode;

  /* custom-AI saved state */
  const [savedScenario, setSavedScenario] = useState<Scenario | null>(null);
  const [savedAssistant, setSavedAssistant] = useState<string | null>(null);
  const [savedSituationImg, setSavedSituationImg] = useState<string | null>(null);
  const [savedPersona, setSavedPersona] = useState<{
    name?: string;
    personality?: string;
    speakingStyle?: string;
    catchPhrase?: string;
  } | null>(null);
  const [customModalVisible, setCustomModalVisible] = useState(false);

  /* selection/guide measure */
  const [aiBtnRef, aiBtnPos] = useMeasure();
  const [scenarioRef, scenarioPos] = useMeasure();
  const [badgeRef, badgePos] = useMeasure();
  const [langBtnRef, langBtnPos] = useMeasure();
  const [mcqBtnRef, mcqBtnPos] = useMeasure();
  const [bubbleRef, bubblePos] = useMeasure();
  const [sendBtnRef, sendBtnPos] = useMeasure();

  const [showGuide, setShowGuide] = useState(false);
  const storageKey = "chatRoomGuide";

  /* quizzes */
  const [quizMode, setQuizMode] = useState<"move" | "fill" | null>(null);
  const [quizPayload, setQuizPayload] = useState<{
    sentence: string;
    issues: Issue[];
  } | null>(null);

  /* socket */
  const socketRef = useRef<any>(null);

  /* voice recognition / TTS */
  const recognitionRef = useRef<any>(null);
  const voiceTimeoutRef = useRef<any>(null);
  const fullTranscriptRef = useRef<string>("");
  const [voiceBuffer, setVoiceBuffer] = useState("");

  /* friends for invite */
  const [friends, setFriends] = useState<
    { userId: string; nickname: string; profileImage?: string; profileThumbnail?: string }[]
  >([]);

  /* blocked flags */
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [isBlockedBy, setIsBlockedBy] = useState<boolean>(false);

  /* initial fetch flags */
  const hasAutoGreeted = useRef(false);
  const [languageReady, setLanguageReady] = useState(false);
  const [initialMessagesFetched, setInitialMessagesFetched] = useState(false);

  /* ───────── helpers: storage ───────── */
  const lsGet = (k: string) => {
    try {
      const v = localStorage.getItem(k);
      return v;
    } catch {
      return null;
    }
  };
  const lsSet = (k: string, v: string) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  };

  const isUUID = (id?: string | null) =>
    !!id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

  /* ───────── identity ───────── */
  const fetchUserData = useCallback(async (): Promise<{ token: string | null; userId: string | null }> => {
    try {
      const token = lsGet("token");
      if (!token) return { token: null, userId: null };

      let storedUserId = lsGet("userId");
      if (!storedUserId) {
        const res = await axios.get(`${SERVER_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        storedUserId = res.data?.userId;
        if (storedUserId) lsSet("userId", storedUserId);
      }
      if (storedUserId) {
        setUserId(storedUserId);
      }
      return { token, userId: storedUserId };
    } catch (e) {
      console.error("fetchUserData error", e);
      return { token: null, userId: null };
    }
  }, [SERVER_URL]);

  const ensureLoggedIn = useCallback(async () => {
    const token = lsGet("token");
    if (!token) {
      setLoginOverlayVisible(true);
      return null;
    }
    return token;
  }, []);

  /* ───────── smart mode count (daily) ───────── */
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const storedDate = lsGet("smartCountDate");
    let count = Number(lsGet("smartCount") || "0");
    if (storedDate !== today) {
      count = 0;
      lsSet("smartCountDate", today);
      lsSet("smartCount", "0");
    }
    setSmartCount(count);
    setSmartCountDate(today);
  }, []);
  const handleToggleSmartMode = async () => {
    if (!isNameGradient && smartCount >= 30) {
      setIsNameGradient(false);
      alert(`${t("smart_limit_reached_title")}\n${t("smart_limit_reached_message")}`);
      return;
    }
    const next = !isNameGradient;
    setIsNameGradient(next);
    if (next) {
      const newCount = smartCount + 1;
      setSmartCount(newCount);
      lsSet("smartCount", String(newCount));
    }
  };

  /* ───────── language hydrate ───────── */
  const isSupportedLang = (s: string): s is SupportedLang =>
    defaults.includes(s as SupportedLang);

  useEffect(() => {
    (async () => {
      const saved = lsGet("autoCheckLanguage");
      if (saved && isSupportedLang(saved)) {
        setSelectedLanguage(saved);
        freqStore.setLanguage(saved);
      }
      setLanguageReady(true);
    })();
  }, []);

  useEffect(() => {
    // persist on change
    if (selectedLanguage) {
      freqStore.setLanguage(selectedLanguage);
      lsSet("autoCheckLanguage", selectedLanguage);
    }
  }, [selectedLanguage]);

  /* ───────── available languages from user prefs ───────── */
  useEffect(() => {
    const mainLang = lsGet("language");
    const learningJson = lsGet("learningLanguage");
    const list: string[] = [];
    if (mainLang) list.push(mainLang);
    if (learningJson) {
      try {
        const arr = JSON.parse(learningJson);
        if (Array.isArray(arr)) list.push(...arr);
      } catch {}
    }
    const unique = Array.from(new Set(list));
    const filtered: SupportedLang[] = unique.filter(isSupportedLang);
    const orderedDefaults = defaults.filter((l) => filtered.includes(l));
    const extras = filtered.filter((l) => !defaults.includes(l));
    const finalList = Array.from(new Set([...orderedDefaults, ...extras]));
    setAvailableLanguages(finalList.length ? finalList : ["en"]);
  }, []);

  /* ───────── init identity ───────── */
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  /* ───────── AI session bootstrap (app parity) ───────── */
  useEffect(() => {
    if (!isAIChat) return;
    (async () => {
      const { token } = await fetchUserData();
      if (!token || chatId) return;

      const { data } = await axios.get(`${SERVER_URL}/ai-chat/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sessions = (data.sessions || []) as { sessionId: string; otherUserId?: string; assistantName?: string }[];

      let target: { sessionId: string; assistantName?: string } | undefined;
      if (otherUserId && otherUserId !== "brody-ai") {
        target = sessions.find((s) => s.otherUserId === otherUserId);
      } else {
        target = sessions.find((s) => !s.otherUserId || s.otherUserId === "brody-ai");
      }

      if (!target) {
        const res = await axios.post(
          `${SERVER_URL}/ai-chat/session`,
          { otherUserId: otherUserId || "brody-ai" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        target = { sessionId: res.data.sessionId, assistantName: "Brody" };
      }
      setChatId(target.sessionId);
      setChatTitle(target.assistantName || "Brody (AI)");
      setNickname(target.assistantName || "Brody");
    })();
  }, [SERVER_URL, isAIChat, chatId, otherUserId, fetchUserData]);

  /* ───────── custom-AI metadata hydrate ───────── */
  useEffect(() => {
    const custom = otherUserId?.startsWith("custom-ai");
    if (!custom || !chatId) return;
    (async () => {
      const { token } = await fetchUserData();
      if (!token) return;
      try {
        const res = await axios.get(`${SERVER_URL}/ai-chat/session/${chatId}/metadata`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const { rolePlayScenario, assistantName, situationImage, persona } = res.data.metadata || {};
        if (rolePlayScenario) setSavedScenario(rolePlayScenario);
        if (assistantName) setSavedAssistant(assistantName);
        if (situationImage) setSavedSituationImg(situationImage);
        if (persona) setSavedPersona(persona);
      } catch (e) {
        console.error("metadata error", e);
      }
    })();
  }, [SERVER_URL, chatId, otherUserId, fetchUserData]);

  /* ───────── non-AI chat bootstrap ───────── */
  useEffect(() => {
    const loadChat = async () => {
      const token = await ensureLoggedIn();
      if (!token) return;
      if (isAIChat) return;

      try {
        if (buddyGroupId) {
          const groupRes = await axios.get(`${SERVER_URL}/buddy-groups/get/${buddyGroupId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const groupData = groupRes.data;
          const buddyPhoto = groupData.buddyPhoto;
          const activityCountry = groupData.activityCountry;

          const chatRes = await axios.get(`${SERVER_URL}/buddy-chat/${buddyGroupId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const chatData = chatRes.data;
          const messagesWithProfile = (chatData.messages || []).map((m: any) => ({
            ...m,
            profileImage: m.profileImage || null,
          }));
          setMessages(messagesWithProfile);
          setChatId(chatData.chatId);
          setChat(chatData.chat);
          setNoMessages(false);

          const chatBuddyGroupName = chatData.buddyGroupName || "";
          if (chatBuddyGroupName && chatBuddyGroupName !== groupData.buddyGroupName) {
            await axios.post(
              `${SERVER_URL}/buddy-chat/${buddyGroupId}/update-name`,
              { buddyGroupName: groupData.buddyGroupName },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          }
          setChatTitle(groupData.buddyGroupName || t("group"));
          setNickname(groupData.buddyGroupName || t("group_chat"));
        } else if (otherUserId) {
          const res = await axios.post(
            `${SERVER_URL}/chats/createOrRetrieveChat`,
            { otherUserId },
            { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
          );
          const chatData = res.data;
          setChat(chatData.chat);
          setChatTitle(chatData.chat?.title || t("group"));
          if (chatData.chat?.messages && chatData.chat?._id) {
            setMessages(chatData.chat.messages || []);
            setChatId(chatData.chat._id);
          }
          setNickname(chatData.otherUserNickname || otherUserId);
        }
      } catch (e: any) {
        if (e?.response?.status === 404 && buddyGroupId) {
          setMessages([]);
          setChatId(null);
          setChat(null);
          setNoMessages(true);
          try {
            const token2 = await ensureLoggedIn();
            if (!token2) return;
            const r = await axios.get(`${SERVER_URL}/buddy-groups/get/${buddyGroupId}`, {
              headers: { Authorization: `Bearer ${token2}` },
            });
            setChatTitle(r.data?.buddyGroupName || t("group"));
            setNickname(r.data?.buddyGroupName || t("group_chat"));
          } catch (err) {
            setChatTitle(t("group"));
            setNickname(t("group_chat"));
          }
          return;
        }
        console.error("loadChat error", e);
        setMessages([]);
      }
    };
    loadChat();
  }, [SERVER_URL, t, ensureLoggedIn, isAIChat, buddyGroupId, otherUserId]);

  /* ───────── block flags for DMs ───────── */
  useEffect(() => {
    if (!otherUserId || isAIChat) return;
    (async () => {
      const token = lsGet("token");
      if (!token) return;
      try {
        const res = await axios.get(`${SERVER_URL}/users/members/${otherUserId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setIsBlocked(res.data.isBlocked);
        setIsBlockedBy(res.data.isBlockedBy);
      } catch (e) {
        console.error("block flags error", e);
      }
    })();
  }, [SERVER_URL, isAIChat, otherUserId]);

  /* ───────── messages (AI or not) initial fetch ───────── */
  const normalizeAIMessage = (m: any) => ({
    _id: m._id,
    senderId: m.role === "assistant" ? "brody-ai" : userId,
    message: m.content,
    timestamp: m.timestamp,
    profileImage: m.role === "assistant" ? "/AIProfile.png" : null,
    imageUrl: null,
  });

  const limit = 20;

  const fetchMessages = useCallback(
    async (isInitial = false) => {
      if (isAIChat) {
        const { token } = await fetchUserData();
        if (!token || !chatId) return;

        let url = `${SERVER_URL}/ai-chat/session/${chatId}/messages?limit=${limit}`;
        if (!isInitial && nextCursor) url += `&cursor=${encodeURIComponent(nextCursor)}`;
        if (isInitial) {
          setMessages([]);
          setNextCursor(null);
        }
        setIsLoadingMore(true);
        try {
          const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
          const raw = res.data.messages || [];
          const newMsgs = raw.map(normalizeAIMessage);
          setNextCursor(res.data.nextCursor || null);
          setHasMoreMessages(!!res.data.nextCursor);
          if (isInitial) {
            setMessages(newMsgs.reverse());
          } else {
            setMessages((prev) => [...prev, ...newMsgs.filter((m) => !prev.some((p) => p._id === m._id))]);
          }
        } catch (e) {
          console.error("fetch AI msgs error", e);
        } finally {
          setIsLoadingMore(false);
        }
        return;
      }

      if (!chatId && !buddyGroupId) return;
      const { token } = await fetchUserData();
      if (!token) return;

      let url = buddyGroupId
        ? `${SERVER_URL}/buddy-chat/${buddyGroupId}?limit=${limit}`
        : `${SERVER_URL}/chats/${chatId}/messages?limit=${limit}`;
      if (!isInitial && nextCursor) url += `&cursor=${encodeURIComponent(nextCursor)}`;

      if (isInitial) {
        setMessages([]);
        setNextCursor(null);
      }
      setIsLoadingMore(true);
      try {
        const res = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
        const newMessages = res.data.messages || [];
        setNextCursor(res.data.nextCursor || null);
        setHasMoreMessages(!!res.data.nextCursor);
        if (isInitial) {
          setMessages(newMessages);
        } else {
          setMessages((prev) => {
            const uniq = newMessages.filter((m: any) => !prev.some((p: any) => p._id === m._id));
            return [...prev, ...uniq];
          });
        }
      } catch (e) {
        console.error("fetch msgs error", e);
      } finally {
        setIsLoadingMore(false);
      }
    },
    [SERVER_URL, isAIChat, chatId, buddyGroupId, nextCursor, fetchUserData]
  );

  useEffect(() => {
    if (isAIChat && chatId && userId) {
      fetchMessages(true)
        .then(() => setInitialMessagesFetched(true))
        .catch(console.error);
    }
  }, [isAIChat, chatId, userId, fetchMessages]);

  useEffect(() => {
    if (!isAIChat && chatId) {
      fetchMessages(true).catch(console.error);
    }
  }, [isAIChat, chatId, fetchMessages]);

  /* ───────── auto greeting (AI) ───────── */
  useEffect(() => {
    if (isAIChat && chatId && initialMessagesFetched && languageReady && messages.length === 0 && !hasAutoGreeted.current) {
      const pool = GREETINGS[selectedLanguage] || GREETINGS.en;
      const greeting = pool[Math.floor(Math.random() * pool.length)];
      hasAutoGreeted.current = true;
      handleSendMessage({ text: greeting }, { skipGrammarCheck: true }).catch(console.error);
    }
  }, [isAIChat, chatId, initialMessagesFetched, languageReady, messages.length, selectedLanguage]);

  /* ───────── sockets ───────── */
  useEffect(() => {
    if (!chatId && !buddyGroupId) return;
    const socket = io(SERVER_URL, { transports: ["websocket", "polling"] });
    socketRef.current = socket;
    const roomId = buddyGroupId ? buddyGroupId : isAIChat ? `ai:${chatId}` : chatId;
    socket.emit("joinRoom", roomId);

    socket.on("newMessage", (newMessage: any) => {
      setMessages((prev) => {
        if (
          newMessage.senderId === userId &&
          prev.some((msg: any) => msg.senderId === userId && msg.message === newMessage.message)
        )
          return prev;
        if (prev.some((m: any) => m._id === newMessage._id)) return prev;
        return [newMessage, ...prev];
      });
    });

    socket.on("newBuddyMessage", (newMessage: any) => {
      newMessage._id = String(newMessage._id);
      setMessages((prev) => {
        if (
          newMessage.senderId === userId &&
          prev.some((msg: any) => msg.senderId === userId && msg.message === newMessage.message)
        )
          return prev;
        if (prev.some((m: any) => m._id === newMessage._id)) return prev;
        return [newMessage, ...prev];
      });
    });

    if (isAIChat && chatId) {
      socket.on("ai:status", (p: { label: StatusLabel }) => {
        setModelStatus(bannerByLabel(t)(p.label));
      });
      socket.on("ai:done", (data: { assistantReply: string; choices?: Choice[] }) => {
        setModelStatus(null);
        const aiMsg = {
          _id: `ai-${Date.now()}`,
          senderId: "brody-ai",
          message: data.assistantReply || "",
          timestamp: new Date().toISOString(),
          profileImage: "/AIProfile.png",
        };
        setMessages((prev) => [aiMsg, ...prev]);
        if (Array.isArray(data.choices) && data.choices.length) {
          setPendingChoices(data.choices);
        }
        if (isVoiceChatMode && data.assistantReply) {
          speakTTS(data.assistantReply);
        }
      });
      socket.on("ai:error", () => {
        setModelStatus("⚠️ Error");
        setTimeout(() => setModelStatus(null), 1200);
      });
    }

    socket.on("connect_error", (err) => console.error("socket error", err));
    return () => {
      socket.disconnect();
    };
  }, [SERVER_URL, t, isAIChat, chatId, buddyGroupId, isVoiceChatMode, userId]);

  /* ───────── badges (localStorage history parity) ───────── */
  useEffect(() => {
    try {
      const g = JSON.parse(lsGet("grammar_history") || "[]");
      const e = JSON.parse(lsGet("expression_history") || "[]");
      setGrammarCnt(Array.isArray(g) ? g.length : 0);
      setExpressionCnt(Array.isArray(e) ? e.length : 0);
    } catch {
      setGrammarCnt(0);
      setExpressionCnt(0);
    }
  }, []);

  /* ───────── Guide overlay show on first time ───────── */
  useEffect(() => {
    const v = lsGet(storageKey);
    if (v !== "hidden") setShowGuide(true);
  }, []);
  const chatRoomGuideSteps: GuideStep[] = useMemo(() => {
    const raw = [
      { key: "chatRoomGuide.step1", tgt: aiBtnPos },
      { key: "chatRoomGuide.step2", tgt: scenarioPos },
      { key: "chatRoomGuide.step3", tgt: badgePos },
      { key: "chatRoomGuide.step4", tgt: langBtnPos },
      { key: "chatRoomGuide.step5", tgt: mcqBtnPos },
      { key: "chatRoomGuide.step6", tgt: bubblePos },
      { key: "chatRoomGuide.step7", tgt: sendBtnPos },
    ];
    return raw.filter(({ tgt }) => tgt && tgt.x !== 0).map(({ key, tgt }) => ({ key, target: tgt! }));
  }, [aiBtnPos, scenarioPos, badgePos, langBtnPos, mcqBtnPos, bubblePos, sendBtnPos]);

  /* ───────── Grammar check (web) ───────── */
  const addIndexes = (sentence: string, issues: Issue[]): Issue[] => {
    const tokens = sentence.split(/\s+/);
    return issues.map((it) => {
      if (typeof it.index === "number" && it.index >= 0) return it;
      const errTokens = it.error.split(/\s+/);
      const idx = tokens.findIndex((_t, i) => tokens.slice(i, i + errTokens.length).join(" ") === it.error);
      return { ...it, index: idx };
    });
  };

  const persistHistory = (
    key: "grammar_history" | "expression_history",
    newItems: any[]
  ) => {
    try {
      const cur = JSON.parse(lsGet(key) || "[]");
      const merged = Array.isArray(cur) ? [...cur, ...newItems] : newItems;
      lsSet(key, JSON.stringify(merged));
      if (key === "grammar_history") setGrammarCnt((c) => c + newItems.length);
      if (key === "expression_history") setExpressionCnt((c) => c + newItems.length);
    } catch (e) {
      console.error("persistHistory error", e);
    }
  };

  const checkGrammarForBubble = async (sentence: string, bubbleId: string, languageCode: string) => {
    if (!sentence.trim() || enableMCQ) return;
    setLoadingGrammar((p) => ({ ...p, [bubbleId]: true }));
    try {
      const token = lsGet("token");
      if (!token) return;
      const uiLanguage = lsGet("language") || "en";

      const resp = await fetch(`${SERVER_URL}/api/grammar-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: sentence, languageCode, uiLanguage, smartMode: isNameGradient }),
      });
      const result = await resp.json();

      let gIssues: Issue[] = Array.isArray(result.grammarIssues)
        ? result.grammarIssues.map((it: any) => ({
            ...it,
            index: typeof it.index === "number" ? it.index : sentence.split(/\s+/).findIndex((w) => w === it.error),
          }))
        : [];
      let eIssues: Issue[] = Array.isArray(result.expressionIssues)
        ? result.expressionIssues.map((it: any) => ({
            ...it,
            index: typeof it.index === "number" ? it.index : sentence.split(/\s+/).findIndex((w) => w === it.error),
          }))
        : [];

      gIssues = addIndexes(sentence, gIssues);
      eIssues = addIndexes(sentence, eIssues);
      const combined = [...gIssues, ...eIssues];
      setGrammarIssues((prev) => ({ ...prev, [bubbleId]: combined }));

      // split by sentences (similar to RN)
      const chunks = sentence.match(/[^\.!\?]+[\.!\?]+/g) || [sentence];
      const now = new Date().toISOString();
      const requestScores = (lsGet("requestScores") || "false") === "true";

      const pack = (issues: Issue[], type: "grammar_history" | "expression_history") => {
        const items: any[] = [];
        for (let i = 0; i < chunks.length; i += 2) {
          const chunk = chunks.slice(i, i + 2).join(" ").trim() || sentence;
          const hit = issues.filter((iss) => chunk.includes(iss.error));
          const corrected = applyIssues(chunk, hit).join(" ").trim();
          if (hit.length > 0) {
            items.push({
              id: `${bubbleId}-${type === "grammar_history" ? "g" : "e"}-${i / 2}`,
              sentence: chunk,
              correctedSentence: corrected,
              issues: hit,
              timestamp: now,
              savedAt: now,
              requestLanguage: languageCode,
              uiLanguage,
              requestScores,
            });
          }
        }
        return items;
      };

      persistHistory("grammar_history", pack(gIssues, "grammar_history"));
      persistHistory("expression_history", pack(eIssues, "expression_history"));
    } catch (e) {
      console.error("grammar check error", e);
    } finally {
      setLoadingGrammar((p) => ({ ...p, [bubbleId]: false }));
    }
  };

  /* ───────── MCQ wrong answer logging ───────── */
  const diffTokens = (wrong: string, correct: string) => {
    const wTok = wrong.trim().split(/\s+/);
    const cTok = correct.trim().split(/\s+/);
    let start = 0;
    while (start < wTok.length && start < cTok.length && wTok[start] === cTok[start]) start++;
    let wEnd = wTok.length - 1;
    let cEnd = cTok.length - 1;
    while (wEnd >= start && cEnd >= start && wTok[wEnd] === cTok[cEnd]) {
      wEnd--;
      cEnd--;
    }
    const err = wTok.slice(start, wEnd + 1).join(" ");
    const sug = cTok.slice(start, cEnd + 1).join(" ");
    return { err, sug };
  };

  const appendWrongMcq = async (wrong: string, correct: string, why: string) => {
    try {
      const { err, sug } = diffTokens(wrong, correct);
      const now = new Date().toISOString();
      const uiLanguage = lsGet("language") || "en";
      const item = {
        id: `mcq-${Date.now()}`,
        sentence: wrong,
        correctedSentence: correct,
        issues: [{ error: err, suggestion: sug, explanation: why, index: -1 }],
        timestamp: now,
        savedAt: now,
        requestLanguage: selectedLanguage,
        uiLanguage,
        requestScores: false,
      };
      persistHistory("grammar_history", [item]);
    } catch (e) {
      console.error("appendWrongMcq error", e);
    }
  };

  /* ───────── Send message ───────── */
  const handleSendMessage = useCallback(
    async (
      { text, imageUri }: { text?: string; imageUri?: string },
      options: { skipGrammarCheck?: boolean; extraIssue?: Issue } = {}
    ) => {
      setNoMessages(false);
      const { userId: me } = await fetchUserData();
      const token = await ensureLoggedIn();
      if (!token) return;

      if (isNameGradient && smartCount >= 30) {
        setIsNameGradient(false);
        alert(`${t("smart_limit_reached_title")}\n${t("smart_limit_reached_message")}`);
        return;
      }

      // AI chat path
      if (isAIChat) {
        const tempId = Date.now().toString();
        const tempMsg = {
          _id: tempId,
          senderId: me,
          message: text || "",
          timestamp: new Date().toISOString(),
          imageUrl: null,
          isUploading: true,
        };
        setMessages((prev) => [tempMsg, ...prev]);
        if (isAutoCheckActive && text?.trim()) {
          checkGrammarForBubble(text, tempId, selectedLanguage);
        }
        const uiLanguage = lsGet("language") || "en";

        try {
          const res = await axios.post(
            `${SERVER_URL}/ai-chat/session/${chatId}/message`,
            {
              content: text,
              realtimeStatus: true,
              difficulty,
              topic,
              voiceChatMode: isVoiceChatMode,
              rolePlayScenario: isCustomAI ? savedScenario : isRolePlayMode ? selectedScenario : null,
              enableMCQ,
              languageCode: selectedLanguage,
              uiLanguage,
              smartMode: isNameGradient,
              persona: savedPersona || undefined,
            },
            { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
          );

          const { assistantReply = "", choices = [] } = res.data || {};
          setMessages((prev) => prev.map((m) => (m._id === tempId ? { ...m, isUploading: false } : m)));
          const aiMessageObj = {
            _id: `ai-${Date.now()}`,
            senderId: "brody-ai",
            message: assistantReply,
            timestamp: new Date().toISOString(),
            profileImage: "/AIProfile.png",
          };
          setMessages((prev) => [aiMessageObj, ...prev]);

          if (options.extraIssue) {
            setGrammarIssues((prev) => ({ ...prev, [tempId]: [options.extraIssue!] }));
          }
          if (Array.isArray(choices) && choices.length === 4) {
            setPendingChoices(choices);
          }
          if (isVoiceChatMode && assistantReply) {
            speakTTS(assistantReply);
          }
        } catch (e) {
          console.error("AI send error", e);
          alert(t("message_send_error"));
          setMessages((prev) => prev.filter((m) => m._id !== tempId));
        }
        return;
      }

      // normal/buddy chat path
      const temporaryId = Date.now().toString();
      const temporaryMessage = {
        _id: temporaryId,
        senderId: me,
        message: text || "",
        timestamp: new Date().toISOString(),
        imageUrl: imageUri || null,
        isUploading: true,
      };
      setMessages((prev) => [temporaryMessage, ...prev]);
      if (isAutoCheckActive && !options.skipGrammarCheck && text?.trim()) {
        checkGrammarForBubble(text, temporaryId, selectedLanguage);
      }

      try {
        const formData = new FormData();
        formData.append("senderId", me || "");
        formData.append("timestamp", new Date().toISOString());
        if (text) formData.append("message", text);
        if (imageUri) {
          const fileName = imageUri.split("/").pop() || "photo.jpg";
          formData.append("file", new File([], fileName));
        }
        const url = buddyGroupId
          ? `${SERVER_URL}/buddy-chat/${buddyGroupId}`
          : `${SERVER_URL}/chats/${chatId}/message`;

        const res = await axios.post(url, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200 || res.status === 201) {
          const serverMessage = res.data.message;
          const rawId = serverMessage._id ?? serverMessage.id;
          serverMessage._id = rawId ? String(rawId) : temporaryId;
          serverMessage.isUploading = false;

          setMessages((prev) => prev.map((m) => (m._id === temporaryId ? serverMessage : m)));
          if (options.extraIssue) {
            setGrammarIssues((prev) => ({ ...prev, [serverMessage._id]: [options.extraIssue!] }));
          }
          if (isAutoCheckActive && serverMessage.message?.trim()) {
            checkGrammarForBubble(serverMessage.message, serverMessage._id, selectedLanguage);
          }
        } else {
          throw new Error("unexpected response");
        }
      } catch (e) {
        console.error("send error", e);
        setMessages((prev) => prev.filter((m) => m._id !== temporaryId));
        alert(t("message_send_error"));
      }
    },
    [
      SERVER_URL,
      t,
      ensureLoggedIn,
      fetchUserData,
      isAIChat,
      chatId,
      buddyGroupId,
      selectedLanguage,
      difficulty,
      topic,
      isVoiceChatMode,
      isRolePlayMode,
      selectedScenario,
      savedScenario,
      savedPersona,
      enableMCQ,
      isNameGradient,
      smartCount,
      isAutoCheckActive,
    ]
  );

  /* ───────── Voice (Web Speech) ───────── */
  const startRecognition = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    if (recognitionRef.current) stopRecognition();

    const rec = new SR();
    rec.lang = languageCodeMap[selectedLanguage] || "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e: any) => {
      let finalText = "";
      let partialText = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const transcript = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += transcript;
        else partialText = transcript;
      }
      if (partialText) {
        setVoiceBuffer(partialText);
      }
      if (finalText) {
        fullTranscriptRef.current = (fullTranscriptRef.current + " " + finalText).trim();
        if (isAutoCheckActive) {
          // wait for silence 1.5s
          if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
          voiceTimeoutRef.current = setTimeout(() => {
            finalizeAndSendVoiceText(fullTranscriptRef.current);
            fullTranscriptRef.current = "";
            setVoiceBuffer("");
          }, 1500);
        }
      }
    };
    rec.onerror = () => {
      stopRecognition();
    };
    rec.onend = () => {
      // restart if still in mode
      if (isVoiceChatMode) startRecognition();
    };

    recognitionRef.current = rec;
    rec.start();
  };

  const stopRecognition = () => {
    try {
      recognitionRef.current?.stop();
    } catch {}
    recognitionRef.current = null;
    if (voiceTimeoutRef.current) {
      clearTimeout(voiceTimeoutRef.current);
      voiceTimeoutRef.current = null;
    }
    setVoiceBuffer("");
  };

  const finalizeAndSendVoiceText = async (text: string) => {
    if (!text.trim()) return;
    await handleSendMessage({ text }, { skipGrammarCheck: false });
  };

  useEffect(() => {
    if (isVoiceChatMode) startRecognition();
    else stopRecognition();
    return () => stopRecognition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVoiceChatMode, selectedLanguage]);

  /* ───────── TTS ───────── */
  const speakTTS = (text: string) => {
    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = languageCodeMap[selectedLanguage] || "en-US";
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.warn("TTS unsupported", e);
    }
  };

  const languageCodeMap: Record<SupportedLang, string> = {
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    zh: "zh-CN",
    ja: "ja-JP",
    ko: "ko-KR",
    ar: "ar-SA",
    de: "de-DE",
    hi: "hi-IN",
    it: "it-IT",
    pt: "pt-PT",
    ru: "ru-RU",
  };

  /* ───────── UI helpers ───────── */
  const openQuiz = (mode: "move" | "fill", sentence: string, issues: Issue[]) => {
    const fixed = addIndexes(sentence, issues);
    setQuizPayload({ sentence, issues: fixed });
    setQuizMode(mode);
  };

  /* ───────── Invite overlay friends ───────── */
  useEffect(() => {
    const fetchFriends = async () => {
      const token = lsGet("token");
      const me = lsGet("userId");
      if (!token || !me) return;
      try {
        const res = await axios.get(`${SERVER_URL}/friend/friends?userId=${me}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFriends(res.data?.friends || []);
      } catch (e) {
        console.error("friends error", e);
      }
    };
    if (inviteOverlayVisible) fetchFriends();
  }, [SERVER_URL, inviteOverlayVisible]);

  const handleInviteFriend = async (friendId: string) => {
    if (!chatId) return alert("No chat ID");
    const token = lsGet("token");
    try {
      const res = await axios.post(
        `${SERVER_URL}/chats/${chatId}/invite`,
        { friendId },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );
      if (res.status === 200) {
        alert(t("friend_invited"));
        setInviteOverlayVisible(false);
      } else {
        alert(t("friend_invite_failed"));
      }
    } catch (e) {
      console.error(e);
      alert(t("friend_invite_failed"));
    }
  };

  /* ───────── Buddy group modal ───────── */
  const handleOpenBuddyGroupDetail = async () => {
    if (!buddyGroupId) return;
    try {
      setBuddyDetailLoading(true);
      const token = lsGet("token");
      if (!token) return setLoginOverlayVisible(true);
      const response = await axios.get(`${SERVER_URL}/buddy-groups/get/${buddyGroupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBuddyGroupDetails(response.data);
    } catch (e) {
      console.error("buddy detail err", e);
    } finally {
      setBuddyDetailLoading(false);
      setBuddyGroupDetailVisible(true);
    }
  };

  /* ───────── Leave / Delete ───────── */
  const handleLeaveChat = async () => {
    if (!chatId) return alert("No chat ID found.");
    try {
      const token = lsGet("token");
      if (!token) return setLoginOverlayVisible(true);
      const res = await axios.delete(`${SERVER_URL}/chats/${chatId}/delete`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 200) {
        alert(t("chat_deleted"));
        router.back();
      } else {
        alert(t("chat_delete_failed"));
      }
    } catch (e) {
      console.error(e);
      alert(t("chat_delete_failed"));
    }
  };

  const handleDeleteAISession = async () => {
    if (!chatId) return;
    try {
      const { token } = await fetchUserData();
      if (!token) return;
      await axios.delete(`${SERVER_URL}/ai-chat/session/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(t("leave_custom_session_success"));
      router.back();
    } catch (e) {
      console.error(e);
      alert(t("leave_custom_session_error"));
    }
  };

  /* ───────── Render helpers ───────── */
  const renderMessage = (item: any) => {
    const isMine = item.senderId === userId;
    const messageType = isAIChat ? "ai" : buddyGroupId ? "buddy" : "normal";
    return (
      <MessageBubble
        content={item.message}
        userId={item.senderId}
        isMine={isMine}
        timestamp={item.timestamp}
        profileImage={item.profileImage || ""}
        imageUrl={item.imageUrl}
        isImageUploading={!!item.imageUrl && item.isUploading}
        isTextUploading={!item.imageUrl && item.isUploading}
        _id={item._id}
        messageType={messageType}
        chatContextId={buddyGroupId ? buddyGroupId : chatId}
        onDelete={(messageId) => setMessages((prev) => prev.filter((m) => m._id !== messageId))}
        issues={grammarIssues[item._id || ""] || []}
        onOpenQuiz={(mode, sentence, rawIssues) => {
          openQuiz(mode, sentence, ensureIndexedIssues(sentence, rawIssues));
        }}
        selectedLanguage={selectedLanguage}
        learningCEFR={difficulty}
      />
    );
  };

  /* ───────── JSX ───────── */
  return (
    <div ref={bubbleRef as any} className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.iconBtn} onClick={() => router.back()} aria-label="Back">
          <Image src="/BackIcon.png" alt="Back" width={28} height={28} />
        </button>

        <button
          className={styles.titleBtn}
          onClick={() => {
            if (isAIChat) return handleToggleSmartMode();
            if (buddyGroupId) return handleOpenBuddyGroupDetail();
            if (otherUserId) return handleToggleSmartMode();
            setEditTitleModalVisible(true);
          }}
        >
          <span
            className={classNames(styles.title, { [styles.titleGradient]: isNameGradient })}
            aria-live="polite"
          >
            {chat?.type === "group"
              ? `${chatTitle} (${chat?.userIds?.length || 0})`
              : savedAssistant || nickname || savedPersona?.name || ""}
          </span>
          <Image src="/chev-down.svg" alt="" width={14} height={14} />
        </button>

        {buddyGroupId ? (
          <BuddyProfileWithFlag buddyGroupId={buddyGroupId} buddyPhoto={""} activityCountry={""} size={32} />
        ) : (
          <button className={styles.iconBtn} onClick={() => setMenuVisible(true)} aria-label="Menu">
            <Image src="/full-post-menu-icon.png" alt="menu" width={28} height={28} />
          </button>
        )}
      </header>

      {/* AI top bar + badges */}
      {isAIChat && !pendingChoices && (
        <>
          <div
            className={classNames(styles.aiBar, { [styles.aiBarExpanded]: isAiMenuExpanded })}
            ref={aiBtnRef as any}
          >
            {!isAiMenuExpanded ? (
              <div className={styles.aiBarCollapsed}>
                {!isCustomAI ? (
                  <button className={styles.aiPlus} onClick={() => setIsAiMenuExpanded(true)}>
                    AI +
                  </button>
                ) : (
                  <button className={styles.aiPlus} onClick={() => setCustomModalVisible(true)} />
                )}

                <div className={styles.scenarioRow} ref={scenarioRef as any}>
                  {!isCustomAI ? (
                    <div className={styles.scenarioScroll}>
                      {SCENARIOS.map((s) => {
                        const selected = isFullyActive && selectedScenario === s.id;
                        const disabled = !isFullyActive;
                        return (
                          <button
                            key={s.id}
                            className={classNames(styles.scenarioChip, {
                              [styles.scenarioChipSelected]: selected,
                              [styles.scenarioChipDisabled]: disabled,
                            })}
                            onClick={() => {
                              if (selectedScenario === s.id) {
                                if (isFullyActive) {
                                  setIsVoiceChatMode(false);
                                  setIsRolePlayMode(false);
                                } else {
                                  setIsVoiceChatMode(true);
                                  setIsRolePlayMode(true);
                                }
                              } else {
                                if (!isFullyActive) {
                                  setIsVoiceChatMode(true);
                                  setIsRolePlayMode(true);
                                }
                                setSelectedScenario(s.id);
                              }
                            }}
                          >
                            {t(`scenario_${s.id}`)}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    savedScenario && (
                      <button className={styles.customScenarioBtn} onClick={() => setCustomModalVisible(true)}>
                        <span className={styles.customScenarioTitle}>{t("scenario")}</span>
                        <span className={styles.customScenarioDesc} title={savedScenario}>
                          {savedScenario}
                        </span>
                      </button>
                    )
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.aiExpanded}>
                <div className={styles.aiExpandedHead}>
                  <span className={styles.aiExpandedTitle}>{t("ai_options")}</span>
                  <button className={styles.collapseBtn} onClick={() => setIsAiMenuExpanded(false)}>
                    –
                  </button>
                </div>

                {/* difficulty */}
                <div className={styles.row}>
                  <span className={styles.label}>{t("difficulty")}:</span>
                  <div className={styles.scrollRow}>
                    {(["A1", "A2", "B1", "B2", "C1", "C2"] as CEFR[]).map((lvl) => (
                      <button
                        key={lvl}
                        className={classNames(styles.pill, { [styles.pillActive]: difficulty === lvl })}
                        onClick={() => setDifficulty(lvl)}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* topic */}
                <div className={styles.row}>
                  <span className={styles.label}>{t("topic")}:</span>
                  <div className={styles.scrollRow}>
                    {["none", "law", "medicine", "science", "art"].map((tp) => (
                      <button
                        key={tp}
                        className={classNames(styles.pill, { [styles.pillActive]: topic === (tp as any) })}
                        onClick={() => setTopic(tp as any)}
                      >
                        {t(`topic_${tp}`)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* voice chat */}
                <div className={styles.centerRow}>
                  <button className={styles.switchBtn} onClick={() => setIsVoiceChatMode((v) => !v)}>
                    {isVoiceChatMode ? t("disable_voice_chat") : t("enable_voice_chat")}
                  </button>
                  {isVoiceChatMode && <div className={styles.voicePulse} />}
                </div>

                {/* role play */}
                <div className={styles.centerCol}>
                  <button className={styles.switchBtn} onClick={() => setIsRolePlayMode((v) => !v)}>
                    {isRolePlayMode ? t("disable_roleplay") : t("enable_roleplay")}
                  </button>

                  {isRolePlayMode && (
                    <>
                      <p className={styles.scenarioDesc}>{t(`scenario_${selectedScenario}_desc`)}</p>
                      <div className={styles.scrollRow}>
                        {SCENARIOS.map((s) => (
                          <button
                            key={s.id}
                            className={classNames(styles.pill, {
                              [styles.pillActive]: selectedScenario === s.id,
                            })}
                            onClick={() => setSelectedScenario(s.id)}
                          >
                            {t(`scenario_${s.id}`)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* badges row */}
          {!isAiMenuExpanded && !pendingChoices && (
            <div className={styles.badges} ref={badgeRef as any}>
              <div className={styles.badgeScroll}>
                <GramIsleBadge count={grammarCnt} icon="edit-3" accent="#F2542D" />
                <GramIsleBadge count={expressionCnt} icon="type" accent="#D8315B" />

                <button
                  className={classNames(styles.langBtn, { [styles.langBtnActive]: isLanguageExpanded })}
                  ref={langBtnRef as any}
                  onClick={() => setIsLanguageExpanded((v) => !v)}
                >
                  <Image
                    src={(languageFlags as any)[selectedLanguage] || "/flags/en.png"}
                    alt={selectedLanguage}
                    width={16}
                    height={16}
                  />
                  <span>{t(`languages.${selectedLanguage}`)}</span>
                </button>

                <button
                  className={classNames(styles.smallPill, styles.smallPillActive)}
                  onClick={() => {
                    setMenuVisible(true);
                  }}
                >
                  {t("difficulty")}: {difficulty}
                </button>

                <button
                  className={classNames(styles.smallPill, { [styles.smallPillActive]: isAutoCheckActive })}
                  onClick={() => setIsAutoCheckActive((v) => !v)}
                >
                  {t("toggle_auto_check")}
                </button>

                <button
                  className={classNames(styles.smallPill, { [styles.smallPillActive]: enableMCQ })}
                  ref={mcqBtnRef as any}
                  onClick={() => setEnableMCQ((v) => !v)}
                >
                  {t("toggle_mcq")}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* model status */}
      {isAIChat && !!modelStatus && modelStatus !== t("ai-rt.banner.undefined") && (
        <p className={styles.modelStatus}>{modelStatus}</p>
      )}

      {/* Messages */}
      <div
        className={styles.list}
        onScroll={(e) => {
          const el = e.currentTarget;
          if (el.scrollTop < 80 && !isLoadingMore && hasMoreMessages) {
            fetchMessages(false);
          }
        }}
      >
        {/* inverted: column-reverse */}
        <div className={styles.listInner}>
          {messages.map((m) => (
            <div key={m._id} className={styles.item}>
              {renderMessage(m)}
            </div>
          ))}

          {noMessages && (
            <div className={styles.empty}>
              <Image src="/plus-icon.png" alt="" width={16} height={16} />
              <span>{t("start_first_message")}</span>
            </div>
          )}

          {isLoadingMore && <div className={styles.loading} />}
        </div>
      </div>

      {/* Input (hidden when MCQ open) */}
      {!pendingChoices && (
        <div ref={sendBtnRef as any}>
          <MessageInputFormAI
            value={voiceBuffer}
            onChangeText={(v: string) => setVoiceBuffer(v)}
            onSendMessage={(msg: { text?: string; imageUri?: string }) => handleSendMessage(msg)}
            isAIChat={isAIChat}
            isVoiceChatMode={isVoiceChatMode}
            onToggleVoiceChatMode={() => setIsVoiceChatMode((v) => !v)}
          />
        </div>
      )}

      {/* Menu modal */}
      {menuVisible && (
        <div className={styles.menuOverlay} onClick={() => setMenuVisible(false)}>
          <div className={styles.menu} onClick={(e) => e.stopPropagation()}>
            {!isAIChat && (
              <>
                <button className={styles.menuBtn} onClick={handleLeaveChat}>
                  {t("leave_chat")}
                </button>
                {otherUserId && (
                  <button
                    className={styles.menuBtn}
                    onClick={async () => {
                      setMenuVisible(false);
                      const token = lsGet("token");
                      if (!token) return setLoginOverlayVisible(true);
                      try {
                        const url = `${SERVER_URL}/users/${isBlocked ? "unblock" : "block"}/${otherUserId}`;
                        const res = await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
                        if (res.status === 200) {
                          setIsBlocked((v) => !v);
                          alert(isBlocked ? t("unblock_successfully") : t("block_successfully"));
                        }
                      } catch (e) {
                        alert(t("server_error"));
                      }
                    }}
                  >
                    {isBlocked ? t("unblock_user") : t("block_user")}
                  </button>
                )}
                <button
                  className={styles.menuBtn}
                  onClick={() => {
                    setMenuVisible(false);
                    setInviteOverlayVisible(true);
                  }}
                >
                  {t("invite")}
                </button>
              </>
            )}

            {isAIChat && (
              <>
                <div className={styles.menuBadges}>
                  <GramIsleBadge count={grammarCnt} icon="edit-3" accent="#F2542D" />
                  <GramIsleBadge count={expressionCnt} icon="type" accent="#D8315B" />
                </div>

                <button className={styles.menuBtn} onClick={() => setIsVoiceChatMode((v) => !v)}>
                  {isVoiceChatMode ? t("voice_record_on") : t("voice_record_off")}
                </button>

                <button className={styles.menuBtn} onClick={() => setIsAutoCheckActive((v) => !v)}>
                  {isAutoCheckActive ? t("auto_check_on") : t("auto_check_off")}
                </button>

                {/* quick difficulty row */}
                <div className={styles.scrollRow}>
                  {(["A1", "A2", "B1", "B2", "C1", "C2"] as CEFR[]).map((lvl) => (
                    <button
                      key={lvl}
                      className={classNames(styles.pill, { [styles.pillActive]: difficulty === lvl })}
                      onClick={() => setDifficulty(lvl)}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                {/* language picker */}
                <button className={styles.menuBtn} onClick={() => setIsLanguageExpanded((v) => !v)}>
                  {t("check_language")}: {t(`languages.${selectedLanguage}`)}
                </button>

                {isLanguageExpanded && (
                  <div className={styles.langGrid}>
                    {(showDefaultsList ? defaults : availableLanguages).map((code) => (
                      <button
                        key={code}
                        className={classNames(styles.langCell, { [styles.langCellActive]: selectedLanguage === code })}
                        onClick={() => {
                          setSelectedLanguage(code);
                          setIsLanguageExpanded(false);
                        }}
                      >
                        <Image
                          src={(languageFlags as any)[code] || "/flags/en.png"}
                          alt={code}
                          width={24}
                          height={24}
                        />
                        <span>{t(`languages.${code}`)}</span>
                      </button>
                    ))}
                    <button className={styles.langCell} onClick={() => setShowDefaultsList((v) => !v)}>
                      {showDefaultsList ? "－" : "＋"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Buddy group detail */}
      <BuddyGroupDetailModal
        visible={buddyGroupDetailVisible}
        onClose={() => setBuddyGroupDetailVisible(false)}
        buddyGroupId={buddyGroupId || ""}
      />

      {/* MCQ */}
      {enableMCQ && pendingChoices && (
        <MultipleChoiceOptions
          choices={pendingChoices}
          onSelect={(picked) => {
            let extra: Issue | undefined;
            const correctText = pendingChoices.find((c) => c.isCorrect)!.text;
            if (!picked.isCorrect) {
              extra = {
                error: picked.text,
                suggestion: correctText,
                explanation: picked.explanation || "",
                index: -1,
              };
              extra = addIndexes(picked.text, [extra])[0];
            }
            if (extra) appendWrongMcq(picked.text, correctText, picked.explanation || "");
            handleSendMessage({ text: picked.text }, { skipGrammarCheck: true, extraIssue: extra });
            setPendingChoices(null);
          }}
          onClose={() => setPendingChoices(null)}
          onDisable={() => {
            setEnableMCQ(false);
            setPendingChoices(null);
          }}
        />
      )}

      {/* Quizzes */}
      {quizMode && quizPayload && (
        <div className={styles.quizOverlay} onClick={() => setQuizMode(null)}>
          <div className={styles.quizCard} onClick={(e) => e.stopPropagation()}>
            {quizMode === "move" ? (
              <MoveQuiz
                sentence={quizPayload.sentence}
                issues={quizPayload.issues}
                started
                learnLanguage={selectedLanguage}
                onSubmit={() => setTimeout(() => setQuizMode(null), 3000)}
              />
            ) : (
              <FillQuiz
                sentence={quizPayload.sentence}
                issues={quizPayload.issues}
                started
                learnLanguage={selectedLanguage}
                onSubmit={() => setTimeout(() => setQuizMode(null), 3000)}
              />
            )}
          </div>
        </div>
      )}

      {/* Custom scenario modal */}
      <CustomScenarioModal
        visible={customModalVisible}
        imageUri={savedSituationImg || ""}
        scenarioText={savedScenario || ""}
        persona={savedPersona || undefined}
        onClose={() => setCustomModalVisible(false)}
        onLeave={handleDeleteAISession}
        onShare={async () => {
          if (!savedScenario || !savedSituationImg) return alert(t("nothing_to_share"));
          const token = lsGet("token");
          if (!token) return setLoginOverlayVisible(true);
          try {
            const meRes = await axios.get(`${SERVER_URL}/users/me`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const me = meRes.data;
            const fd = new FormData();
            fd.append("userId", me.userId);
            fd.append("author", me.nickname || me.userId);
            fd.append("time", new Date().toISOString());
            fd.append("category", "language_study");
            fd.append("title", savedAssistant ? `${savedAssistant} - ${t("shared_scenario")}` : t("shared_scenario"));
            fd.append("content", savedScenario);
            fd.append("isOffline", "false");
            fd.append("recruitmentCount", "1");
            fd.append("visitors", "0");
            fd.append("likes", "0");
            fd.append("comments", "0");
            fd.append("language", selectedLanguage);
            fd.append("meetingTime", new Date().toISOString());
            fd.append("commentsOption", "all");
            fd.append("sameCountryOnly", "false");
            // NOTE: you should fetch the blob yourself; here we append empty File for demo parity
            fd.append("image", new File([], "scenario.jpg", { type: "image/jpeg" }));
            const res = await axios.post(`${SERVER_URL}/posts/create`, fd, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status >= 200 && res.status < 300) alert(t("post_saved_successfully"));
          } catch (e: any) {
            console.error(e);
            alert(e?.message || t("unknown_error"));
          }
        }}
        chatId={chatId || ""}
      />

      {/* Invite overlay */}
      <InviteOverlay
        visible={inviteOverlayVisible}
        onClose={() => setInviteOverlayVisible(false)}
        friends={friends}
        chatUserIds={chat?.userIds || []}
        onInvite={handleInviteFriend}
        underDevelopment={FEATURE_UNDER_DEV}
      />

      {/* Guide */}
      <GuideOverlay
        visible={showGuide && chatRoomGuideSteps.length > 0}
        steps={chatRoomGuideSteps}
        storageKey={storageKey}
        onClose={() => setShowGuide(false)}
      />
    </div>
  );
}
