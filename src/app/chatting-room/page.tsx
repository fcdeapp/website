"use client";

  interface Choice {
    text: string;
    isCorrect: boolean;
    explanation?: string;
  }

/* eslint-disable @next/next/no-img-element */
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import classNames from "classnames";
import styles from "../../styles/pages/ChattingRoom.module.css";

/* ───────────────────────── 공용 컨텍스트 & 상수 ─────────────────────────── */
import { useConfig } from "../../context/ConfigContext";
import { useTranslation } from "react-i18next";
import * as freqStore from "../../context/freqStore";
import languageFlags from "../../constants/languageFlags";

/* ───────────────────────── 모바일 재사용 컴포넌트 ───────────────────────── */
import MessageBubble             from "../../components/MessageBubble";
import MessageInputFormAI        from "../../components/MessageInputFormAI";
import BuddyGroupDetailModal     from "../../components/BuddyGroupDetailModal";
import InviteOverlay             from "../../components/InviteOverlay";
import MultipleChoiceOptions     from "../../components/MultipleChoiceOptions";
import GramIsleBadge             from "../../components/GramIsleBadge";
import GuideOverlay, { GuideStep } from "../../components/GuideOverlay";
import CustomScenarioModal       from "../../components/CustomScenarioModal";
import MoveQuiz                  from "../../components/MoveQuiz";
import FillQuiz                  from "../../components/FillQuiz";
import PersonalChatsPage         from "../../components/PersonalChats";

/* ───────────────────────── 이미지/아이콘 ───────────────────────────────── */
import AIProfilePng     from "../../../public/assets/AIProfile.png";
import BackIconPng      from "../../../public/assets/BackIcon.png";
import MenuIconPng      from "../../../public/assets/full-post-menu-icon.png";
import PlusIconPng      from "../../../public/assets/plus-icon.png";
import FoxBgPng         from "../../../public/assets/foxBackground.png";
import DeleteIconPng    from "../../../public/assets/delete-icon-big.png";

/* ───────────────────────── 타입 정의 ───────────────────────────────────── */
interface Issue {
  error: string; suggestion: string; explanation: string; index?: number;
}
interface Message {
  _id: string; senderId: string; message: string;
  timestamp: string; profileImage?: string;
  imageUrl?: string; isUploading?: boolean;
}
interface ChatUser {
  userId: string; nickname: string; profileImage?: string; profileThumbnail?: string;
}
interface Chat {
  _id: string; userIds: string[]; userDetails: ChatUser[];
  lastMessage: string; lastMessageTime: string; type: "personal" | "group";
  title?: string;
}
type Scenario =
  | "cafe"|"hotel"|"directions"|"grocery"|"clothes"
  | "interview"|"meeting"|"call"|"hospital"|"emergency"
  | "dating"|"party";
const SCENARIOS: { id: Scenario }[] = [
  { id:"cafe" },{ id:"hotel" },{ id:"directions" },{ id:"grocery" },
  { id:"clothes" },{ id:"interview" },{ id:"meeting" },{ id:"call" },
  { id:"hospital" },{ id:"emergency" },{ id:"dating" },{ id:"party" },
];

/* ───────────────────────── 헬퍼들 ──────────────────────────────────────── */
const formatRelative = (iso:string|undefined, t:(k:string,o?:any)=>string) => {
  if (!iso) return ""; const d=(Date.now()-new Date(iso).getTime())/1e3;
  if (d<60)      return t("time.sec_ago",{count:Math.floor(d)});
  if (d<3600)    return t("time.min_ago",{count:Math.floor(d/60)});
  if (d<86400)   return t("time.hr_ago" ,{count:Math.floor(d/3600)});
  return t("time.day_ago",{count:Math.floor(d/86400)});
};
const uuid = () => uuidv4();
const getDeviceId = () => {
  if (typeof window==="undefined") return uuid();
  let id = localStorage.getItem("deviceId");
  if (!id) { id = uuid(); localStorage.setItem("deviceId", id); }
  return id;
};
const addIndexes = (sentence:string, issues:Issue[]):Issue[] => {
  const tokens = sentence.split(/\s+/);
  return issues.map(it=>{
    if (typeof it.index==="number" && it.index>=0) return it;
    const idx = tokens.findIndex((tk,i)=>sentence.indexOf(it.error)>=0 && tk===it.error.split(" ")[0]);
    return { ...it, index: idx };
  });
};

/* ───────────────────────── 메인 페이지 ─────────────────────────────────── */
function ChattingRoomPage() {
  const router = useRouter();
  const params = useSearchParams();

  const { SERVER_URL } = useConfig();
  const { t }          = useTranslation();

  const otherUserId  = params.get("otherUserId") ?? undefined;
  const buddyGroupId = params.get("buddyGroupId") ?? undefined;
  const routeChatId  = params.get("chatId") ?? undefined;

  const isAIChat = !otherUserId || otherUserId==="brody-ai" || otherUserId?.startsWith("custom-ai");
  const isLoggedIn = typeof window!=="undefined" && localStorage.getItem("isLoggedIn")==="true";

  /* ─────────── state ─────────── */
  const [chatId,setChatId]                   = useState<string|null>(routeChatId && /^[0-9a-f\-]{36}$/i.test(routeChatId)? routeChatId : null);
  const [messages,setMessages]               = useState<Message[]>([]);
  const [nickname,setNickname]               = useState("friend");
  const [chatTitle,setChatTitle]             = useState("");
  const [loading,setLoading]                 = useState(true);
  const [sidebarOpen,setSidebarOpen]         = useState(false);
  const [pendingChoices,setPendingChoices]   = useState<Choice[]|null>(null);
  const [quizMode,    setQuizMode]    = useState<"move" | "fill" | null>(null);
  const [quizPayload, setQuizPayload] = useState<{ sentence: string; issues: Issue[] } | null>(null);
  const cursor = useRef<string | null>(null);


  /* AI‑옵션 */
  const [difficulty,setDifficulty]           = useState<"easy"|"medium"|"hard">("medium");
  const [topic,setTopic]                     = useState<"none"|"science"|"art"|"law"|"medicine">("none");
  const [voiceChat,setVoiceChat]             = useState(false);
  const [rolePlay,setRolePlay]               = useState(false);
  const [selectedScenario,setSelectedScenario]=useState<Scenario>("cafe");

  /* 언어 & 문법 */
  const defaultsLang = ["en","es","fr","zh","ja","ko","ar","de","hi","it","pt","ru"] as const;
  type SupportedLang = typeof defaultsLang[number];
  const [selectedLanguage,setSelectedLanguage] = useState<SupportedLang>("en");
  const [autoCheck,setAutoCheck]             = useState(true);
  const [grammarIssues,setGrammarIssues]     = useState<Record<string,Issue[]>>({});
  const [loadingGrammar,setLoadingGrammar]   = useState<Record<string,boolean>>({});

  /* 카운터(Grammar/Expression) */
  const [grammarCnt,setGrammarCnt]           = useState(0);
  const [expressionCnt,setExpressionCnt]     = useState(0);

  /* 모달들 */
  const [menuOpen,setMenuOpen]               = useState(false);
  const [buddyModal,setBuddyModal]           = useState(false);
  const [inviteOpen,setInviteOpen]           = useState(false);
  const [customModal,setCustomModal]         = useState(false);

  /* 텍스트 입력 */
  const [typing,setTyping]                   = useState("");

  /* 페이지 로드 – 세션 확보 */
  useEffect(()=>{
    const boot = async () => {
      try{
        if(isAIChat){ await ensureAISession(); await fetchAIMessages(true); }
        // 나머지: personal / buddy 그룹
        else if (buddyGroupId){ await fetchBuddySession(); }
        else if (otherUserId){ await fetchPersonalSession(); }
      }finally{ setLoading(false); }
    };
    boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[otherUserId,buddyGroupId]);

  /* 소켓 – AI 제외 */
  useEffect(()=>{
    if(isAIChat||!chatId)return;
    const socket = io(SERVER_URL,{transports:["polling","websocket"]});
    socket.emit("joinRoom",buddyGroupId||chatId);
    socket.on("newMessage",(m:any)=>{
      setMessages(p=>p.some(x=>x._id===m._id)?p:[m,...p]);
    });
    socket.on("newBuddyMessage",(m:any)=>{
      m._id = String(m._id);
      setMessages(p=>p.some(x=>x._id===m._id)?p:[m,...p]);
    });
    return () => {
        socket.disconnect();
    };
  },[SERVER_URL,isAIChat,chatId,buddyGroupId]);

  /* ─────────────────────── API: 세션 확보 ─────────────────────── */
  const ensureAISession = async () => {
    if(chatId) return;
    if(isLoggedIn){
      const { data } = await axios.post(`${SERVER_URL}/ai-chat/session`,
        { otherUserId: otherUserId||"brody-ai" }, { withCredentials:true });
      setChatId(data.sessionId); setChatTitle(data.assistantName||"Brody"); setNickname(data.assistantName||"Brody");
    }else{
      const { data } = await axios.post(`${SERVER_URL}/anon-ai-chat/session`,
        { otherUserId: otherUserId||"anon-ai" }, { headers:{ "X-Device-Id": getDeviceId() }});
      setChatId(data.sessionId); setChatTitle(data.assistantName||"AI"); setNickname(data.assistantName||"AI");
    }
  };

  const fetchAIMessages = async (initial=false) => {
    if(!chatId)return;
    const lim=20; let url=`${SERVER_URL}/ai-chat/session/${chatId}/messages?limit=${lim}`;
    if(!initial && cursor.current) url += `&cursor=${encodeURIComponent(cursor.current)}`;
    const { data } = await axios.get(url, isLoggedIn?{withCredentials:true}:{headers:{"X-Device-Id":getDeviceId()}});
    cursor.current = data.nextCursor||null;
    const norm:Message[] = (data.messages||[]).map((m:any)=>({
      _id:m._id, senderId:m.role==="assistant"?"brody-ai":"me",
      message:m.content, timestamp:m.timestamp,
      profileImage:m.role==="assistant"?AIProfilePng.src:undefined,
    }));
    setMessages(p=>initial?norm.reverse():[...p,...norm.filter(n=>!p.some(x=>x._id===n._id))]);
  };

  /** 개인 채팅 */
  const fetchPersonalSession = async () => {
    const res = await axios.post(`${SERVER_URL}/chats/createOrRetrieveChat`,
      { otherUserId }, { withCredentials:true });
    const cd = res.data.chat; setChatId(cd._id); setChatTitle(cd.title||"chat");
    setMessages((cd.messages||[]).slice().reverse());
    const other = cd.userDetails.find((u:ChatUser)=>u.userId!==res.data.loggedInUserId);
    if(other) setNickname(other.nickname);
  };
  /** 버디 그룹 */
  const fetchBuddySession = async () => {
    const { data } = await axios.get(`${SERVER_URL}/buddy-chat/${buddyGroupId}`, { withCredentials:true })
      .catch(()=>({data:{messages:[]}}));
    setMessages((data.messages||[]).slice().reverse());
    setChatTitle(data.buddyGroupName||t("group"));
  };

 const sendMessage = async ({
   text,
   imageUri
 }: {
   text?: string;
   imageUri?: string;
 }) => {
    if(!text?.trim()&&!imageUri) return;
    if(isAIChat) return sendAIMessage(text||"",imageUri);
    sendNormalMessage(text,imageUri);
  };

 const sendAIMessage = async (
   text: string,
   imageUri?: string
 ) => {
    if(!chatId) return await ensureAISession();
    const tmpId = uuid(); const temp:Message = { _id:tmpId,senderId:"me",message:text,timestamp:new Date().toISOString(),isUploading:true };
    setMessages(p=>[temp,...p]);

    const body = { content:text, difficulty, topic,
      voiceChatMode:voiceChat, rolePlayScenario:rolePlay?selectedScenario:undefined,
      enableMCQ:true, languageCode:selectedLanguage };
    try{
      const res = isLoggedIn
        ? await axios.post(`${SERVER_URL}/ai-chat/session/${chatId}/message`, body,{withCredentials:true})
        : await axios.post(`${SERVER_URL}/anon-ai-chat/session/${chatId}/message`, body,{headers:{"X-Device-Id":getDeviceId()}});
      setMessages(p=>p.map(m=>m._id===tmpId?{...m,isUploading:false}:m));
      const ai:Message={_id:`ai-${Date.now()}`,senderId:"brody-ai",message:res.data.assistantReply||"",timestamp:new Date().toISOString(),profileImage:AIProfilePng.src};
      setMessages(p=>[ai,...p]);
      if(Array.isArray(res.data.choices)&&res.data.choices.length===4) setPendingChoices(res.data.choices);
    }catch{ setMessages(p=>p.filter(m=>m._id!==tmpId)); }
  };

 const sendNormalMessage = async (
   text?: string,
   imageUri?: string
 ) => {
    if(!chatId && !buddyGroupId) return;
    const tmpId=uuid(); const tmp:Message={_id:tmpId,senderId:"me",message:text||"",timestamp:new Date().toISOString(),imageUrl:imageUri,isUploading:true};
    setMessages(p=>[tmp,...p]);

    const form=new FormData();
    form.append("senderId","me"); form.append("timestamp",new Date().toISOString());
    if(text) form.append("message",text);
    if(imageUri){
      const name=imageUri.split("/").pop()||"photo.jpg";
      form.append("file", new File([],name,{type:"image/jpeg"}));
    }
    const url = buddyGroupId ? `${SERVER_URL}/buddy-chat/${buddyGroupId}` : `${SERVER_URL}/chats/${chatId}/message`;
    axios.post(url,form,{withCredentials:true})
      .then(r=>{
        const real:Message={...r.data.message,isUploading:false};
        setMessages(p=>p.map(m=>m._id===tmpId?real:m));
      })
      .catch(()=>setMessages(p=>p.filter(m=>m._id!==tmpId)));
  };

  /* ─────────────────────── 문법 검사 ───────────────────── */
  const checkGrammar = async (sentence:string,bubbleId:string)=>{
    setLoadingGrammar(p=>({...p,[bubbleId]:true}));
    try{
      const { data } = await axios.post(`${SERVER_URL}/api/grammar-check`,
        { text:sentence,languageCode:selectedLanguage,uiLanguage:"en" },{withCredentials:true});
        const issues: Issue[] = addIndexes(sentence, data.grammarIssues || []);
      setGrammarIssues(p=>({...p,[bubbleId]:issues}));
    }finally{ setLoadingGrammar(p=>({...p,[bubbleId]:false})); }
  };

  /* ─────────────────────── 퀴즈 열기 ───────────────────── */
  const openQuiz = (mode:"move"|"fill", sentence:string, issues:Issue[])=>{
    setQuizPayload({ sentence, issues }); setQuizMode(mode);
  };

  /* ─────────────────────── 렌더러 ───────────────────── */
  const renderBubble = (m:Message)=>
    <MessageBubble
      key={m._id} content={m.message} timestamp={m.timestamp}
      userId={m.senderId} isMine={m.senderId==="me"} profileImage={m.profileImage}
      imageUrl={m.imageUrl} isImageUploading={!!m.imageUrl&&m.isUploading}
      isTextUploading={!m.imageUrl&&m.isUploading} _id={m._id}
      messageType={isAIChat ? "ai" : buddyGroupId ? "buddy" : "normal"} 
      chatContextId={buddyGroupId||chatId||undefined}
      onDelete={id=>setMessages(p=>p.filter(b=>b._id!==id))}
      issues={grammarIssues[m._id]||[]} onOpenQuiz={openQuiz}
    />;

  /* ─────────────────────── UI ────────────────────────── */
  if(loading) return <div className={styles.loading}>{t("loading")}</div>;

  return (
    <div className={styles.container}>
      {/* 사이드바 (개인채팅목록) */}
      <aside className={classNames(styles.sidebar,{[styles.open]:sidebarOpen})}>
        <PersonalChatsPage />
      </aside>

      {/* 헤더 */}
      <header className={styles.header}>
        <button className={styles.iconBtn} onClick={()=>router.back()}>
          <Image src={BackIconPng} alt="Back" width={28} height={28}/>
        </button>

        <button className={styles.titleArea} onClick={()=>setSidebarOpen(o=>!o)}>
          <span className={styles.title}>{chatTitle||nickname}</span>
          <Image src={PlusIconPng} alt="▼" width={12} height={12}/>
        </button>

        <button className={styles.iconBtn} onClick={()=>setMenuOpen(true)}>
          <Image src={MenuIconPng} alt="Menu" width={28} height={28}/>
        </button>
      </header>

      {/* 메시지 영역 */}
      <main id="chat-pane" className={styles.chatPane}>
        {messages.map(renderBubble)}
      </main>

      {/* 입력 */}
      <footer className={styles.inputPane}>
        <MessageInputFormAI
          value={typing} onChangeText={setTyping}
          onSendMessage={({text,imageUri})=>{sendMessage({text,imageUri});setTyping("");}}
          isAIChat={isAIChat} isVoiceChatMode={voiceChat}
          onToggleVoiceChatMode={()=>setVoiceChat(v=>!v)}
        />
      </footer>

      {/* ───────── 모달/오버레이───────── */}
      {menuOpen && (
        <div className={styles.overlay} onClick={()=>setMenuOpen(false)}>
          <div className={styles.menuCard} onClick={e=>e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={()=>setMenuOpen(false)}>
              <Image src={DeleteIconPng} alt="x" width={24} height={24}/>
            </button>

            {isAIChat ? (
              <>
                <h4>{t("ai_options")}</h4>
                <section className={styles.row}>
                  <span>{t("difficulty")}:</span>
                  {["easy","medium","hard"].map(l=>(
                    <button key={l}
                      className={classNames(styles.chip,{[styles.chipOn]:difficulty===l})}
                      onClick={()=>setDifficulty(l as any)}
                    >{t(`difficulty_${l}`)}</button>
                  ))}
                </section>
                <section className={styles.row}>
                  <span>{t("topic")}:</span>
                  {["none","science","art","law","medicine"].map(tp=>(
                    <button key={tp}
                      className={classNames(styles.chip,{[styles.chipOn]:topic===tp})}
                      onClick={()=>setTopic(tp as any)}
                    >{t(`topic_${tp}`)}</button>
                  ))}
                </section>
                <section className={styles.row}>
                  <button className={classNames(styles.toggle,{[styles.toggleOn]:voiceChat})}
                          onClick={()=>setVoiceChat(v=>!v)}>
                    {voiceChat? t("disable_voice_chat") : t("enable_voice_chat")}
                  </button>
                  <button className={classNames(styles.toggle,{[styles.toggleOn]:rolePlay})}
                          onClick={()=>setRolePlay(v=>!v)}>
                    {rolePlay? t("disable_roleplay") : t("enable_roleplay")}
                  </button>
                </section>
                {rolePlay && (
                  <section className={styles.scenarioScroll}>
                    {SCENARIOS.map(s=>(
                      <button key={s.id}
                        className={classNames(styles.scenarioChip,{[styles.scenarioOn]:selectedScenario===s.id})}
                        onClick={()=>setSelectedScenario(s.id)}
                      >{t(`scenario_${s.id}`)}</button>
                    ))}
                  </section>
                )}
                <div className={styles.row}>
                  <GramIsleBadge count={grammarCnt} icon="edit-3" accent="#F2542D"/>
                  <div style={{width:12}}/>
                  <GramIsleBadge count={expressionCnt} icon="type" accent="#D8315B"/>
                </div>
              </>
            ) : (
              <>
                {buddyGroupId && (
                  <button className={styles.menuBtn} onClick={()=>setBuddyModal(true)}>
                    {t("buddy_groups")}
                  </button>
                )}
                <button className={styles.menuBtn} onClick={()=>setInviteOpen(true)}>
                  {t("invite")}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Invite Overlay */}
      <InviteOverlay
        visible={inviteOpen} onClose={()=>setInviteOpen(false)}
        friends={[]} chatUserIds={[]} onInvite={()=>{}}
        underDevelopment={false}
      />

      {/* BuddyGroup 상세 */}
      {buddyGroupId && (
        <BuddyGroupDetailModal
          visible={buddyModal} buddyGroupId={buddyGroupId}
          onClose={()=>setBuddyModal(false)}
        />
      )}

      {/* MCQ 옵션 */}
      {pendingChoices && (
        <MultipleChoiceOptions
          choices={pendingChoices}
          onSelect={(picked: Choice) => {
            const correct = pendingChoices.find(c=>c.isCorrect)!;
            let extra:Issue|undefined;
            if(!picked.isCorrect){
              extra={error:picked.text,suggestion:correct.text,explanation:picked.explanation||"",index:-1};
              extra=addIndexes(picked.text,[extra])[0];
            }
            sendMessage({text:picked.text});
            if(extra) setGrammarIssues(p=>({...p,TEMP:[extra]}));
            setPendingChoices(null);
          }}
          onClose={()=>setPendingChoices(null)}
          onDisable={()=>setPendingChoices(null)}
        />
      )}

      {/* Custom Scenario 모달 (AI) */}
      <CustomScenarioModal
        visible={customModal}
        onClose={() => setCustomModal(false)}
        imageUri=""
        scenarioText=""
        // persona={null}
        chatId={chatId || ""}
        onLeave={async () => {
            // 나중에 여기에 leave API 호출 같은 걸 넣으실 수도 있습니다.
        }}
        onShare={async () => {
            // 실제 공유 로직을 async/await 로 여기에 넣으실 수 있습니다.
        }}
      />

      {/* 퀴즈 */}
      {quizMode && quizPayload && (
        <div className={styles.overlay} onClick={()=>setQuizMode(null)}>
          <div className={styles.quizCard} onClick={e=>e.stopPropagation()}>
            {quizMode==="move" && (
              <MoveQuiz
                sentence={quizPayload.sentence} issues={quizPayload.issues}
                started learnLanguage={selectedLanguage}
                onSubmit={()=>setQuizMode(null)}
              />
            )}
            {quizMode==="fill" && (
              <FillQuiz
                sentence={quizPayload.sentence} issues={quizPayload.issues}
                started learnLanguage={selectedLanguage}
                onSubmit={()=>setQuizMode(null)}
              />
            )}
          </div>
        </div>
      )}

      {/* 가이드 오버레이 (필요 시) */}
      <GuideOverlay
        visible={false} steps={[]} storageKey="chatRoomGuide"
        onClose={()=>{}}
      />
    </div>
  );
};

export default dynamic(() => Promise.resolve(ChattingRoomPage), {
    ssr: false,        // 서버‑사이드 렌더링 완전 OFF
  });
