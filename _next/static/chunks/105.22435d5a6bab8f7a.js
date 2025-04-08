(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[105],{70:(e,t,a)=>{"use strict";a.d(t,{F:()=>o,S:()=>s});let s=(e,t)=>{let a=new Date(e).getTime();if(isNaN(a))return t("unknown");let s=Math.floor((Date.now()-a)/6e4),o=Math.floor(s/60),n=Math.floor(o/24);return s<1?t("just_now"):s<60?t("minutes_ago",{count:s}):o<24?t("hours_ago",{count:o}):t("days_ago",{count:n})},o=(e,t)=>{let a=new Date(e).getTime();if(isNaN(a))return t("unknown");let s=a-Date.now(),o=Math.floor(Math.abs(s)/6e4),n=Math.floor(o/60);return s>0?n<1?t("minutes_remaining",{count:o}):n<24?t("hours_remaining",{count:n}):t("days_remaining",{count:Math.floor(n/24)}):t("meeting_passed")}},802:(e,t,a)=>{"use strict";a.d(t,{A:()=>o});var s=a(5155);a(2115);let o=e=>{let{visible:t,onLogin:a,onBrowse:o}=e;if(!t)return null;let n={backgroundColor:"transparent",padding:"12px 20px",border:"2px solid #0A1045",borderRadius:"30px",cursor:"pointer"},l={...n,borderColor:"#355C7D"},r={color:"#0A1045",fontSize:"16px",fontWeight:700,margin:0};return(0,s.jsx)("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:999,display:"flex",justifyContent:"center",alignItems:"center"},children:(0,s.jsx)("div",{style:{width:"100vw",height:"100vh",background:"linear-gradient(45deg, rgba(0, 0, 0, 0.7), rgba(50, 50, 50, 0.7))",display:"flex",justifyContent:"center",alignItems:"center"},children:(0,s.jsx)("div",{style:{width:"90%",maxWidth:"500px",borderRadius:"30px",overflow:"hidden",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)"},children:(0,s.jsxs)("div",{style:{backgroundColor:"rgba(255, 255, 255, 0.85)",borderRadius:"30px",padding:"30px 25px",textAlign:"center",boxShadow:"0 8px 20px rgba(0, 0, 0, 0.35)"},children:[(0,s.jsx)("h2",{style:{fontSize:"28px",fontWeight:800,color:"#0A1045",marginBottom:"15px"},children:"Welcome to Facade"}),(0,s.jsx)("p",{style:{fontSize:"16px",color:"#333",marginBottom:"30px",lineHeight:"24px"},children:"To see announcements and recommendations, please log in."}),(0,s.jsxs)("div",{style:{display:"flex",justifyContent:"center",gap:"16px"},children:[(0,s.jsx)("button",{style:n,onClick:a,children:(0,s.jsx)("span",{style:r,children:"Log In"})}),(0,s.jsx)("button",{style:l,onClick:o,children:(0,s.jsx)("span",{style:r,children:"Continue as Guest"})})]})]})})})})}},1772:e=>{e.exports={container:"ProfileWithFlag_container__fXJUY",profileImage:"ProfileWithFlag_profileImage__kvu3h",gradientBorder:"ProfileWithFlag_gradientBorder__c_Y4a",flagWrapper:"ProfileWithFlag_flagWrapper__C0EJW",flagImage:"ProfileWithFlag_flagImage__mZNJt",spinner:"ProfileWithFlag_spinner__j6Bkl",spin:"ProfileWithFlag_spin__7po5D",modal:"ProfileWithFlag_modal__KzG8T"}},2278:e=>{e.exports={chattingFormFrame:"MessageInputForm_chattingFormFrame__KQv0J",chatInput:"MessageInputForm_chatInput__ay52K",chatIcon:"MessageInputForm_chatIcon__XskHJ",photoButton:"MessageInputForm_photoButton__5Fzte",placeholderIconSpace:"MessageInputForm_placeholderIconSpace__C2Km_",sendButton:"MessageInputForm_sendButton__bOLQs",previewContainer:"MessageInputForm_previewContainer__mZrS2",previewContent:"MessageInputForm_previewContent__XawSE",previewImage:"MessageInputForm_previewImage__sQDkS",closePreviewButton:"MessageInputForm_closePreviewButton__gOVp_",closeIcon:"MessageInputForm_closeIcon___IBIO",loginOverlay:"MessageInputForm_loginOverlay__8q7XO",loginOverlayContent:"MessageInputForm_loginOverlayContent__eNRT5",loginOverlayButtons:"MessageInputForm_loginOverlayButtons__H_uSi"}},2649:(e,t,a)=>{"use strict";a.d(t,{A:()=>p});var s=a(5155),o=a(2115),n=a(3464),l=a(1065),r=a(5695),i=a(802),c=a(7926),u=a(1772),m=a.n(u);let d=e=>"string"==typeof e&&""!==e.trim()?e.startsWith("http")||e.startsWith("/assets/")?e:"/assets/".concat(e):"/assets/Annonymous.png",p=e=>{let{userId:t,nickname:a,profileImage:u,profileThumbnail:p,countryName:_,size:h,trustBadge:g}=e,{SERVER_URL:x}=(0,l.U)(),f=(0,r.useRouter)(),[j,b]=(0,o.useState)(p||u||null),[v,y]=(0,o.useState)(_||null),[I,C]=(0,o.useState)(g||!1),[N,B]=(0,o.useState)(!1),[w,k]=(0,o.useState)(null),[F,S]=(0,o.useState)(!1),[T,M]=(0,o.useState)(!1);(0,o.useEffect)(()=>{k(localStorage.getItem("userId"))},[]),(0,o.useEffect)(()=>{_&&(p||u)&&void 0!==g||!t||(async()=>{try{B(!0);let e=localStorage.getItem("token");if(!e){B(!1);return}let a=await n.A.get("".concat(x,"/users/country?userId=").concat(t),{headers:{Authorization:"Bearer ".concat(e)}});if(200===a.status){let e=a.data;y(e.originCountry),"string"!=typeof e.profileThumbnail&&(e.profileThumbnail=""),"string"!=typeof e.profileImage&&(e.profileImage=""),b(e.profileThumbnail||e.profileImage||""),C(e.trustBadge||!1)}else console.log("Failed to fetch user details")}catch(e){console.error("Error fetching user details:",e)}finally{B(!1)}})()},[_,p,u,g,t,x]);let P=c.X.find(e=>e.name===v),A=P?P.flag:null,O=d(j);return((0,o.useEffect)(()=>{S(!!localStorage.getItem("token"))},[]),N)?(0,s.jsx)("div",{className:m().container,style:{width:h,height:h},children:(0,s.jsx)("div",{className:m().spinner})}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("div",{onClick:()=>{if(!F){M(!0);return}let e={userId:t,nickname:a,profileImage:u||null,profileThumbnail:p||null};t===w?f.push("/myProfile?".concat(new URLSearchParams(e).toString())):f.push("/profile?".concat(new URLSearchParams(e).toString()))},className:m().container,style:{width:h,height:h},children:[I?(0,s.jsx)("div",{className:m().gradientBorder,style:{width:h,height:h,borderRadius:h/2},children:(0,s.jsx)("img",{src:O,alt:"Profile",className:m().profileImage,style:{width:h-4,height:h-4,borderRadius:(h-4)/2}})}):(0,s.jsx)("img",{src:O,alt:"Profile",className:m().profileImage,style:{width:h,height:h,borderRadius:h/2}}),A&&(0,s.jsx)("div",{className:m().flagWrapper,style:{width:h/3+4,height:h/3+4,borderRadius:h/6+2},children:(0,s.jsx)("img",{src:A,alt:"Flag",className:m().flagImage,style:{width:h/3,height:h/3,borderRadius:h/6}})})]}),T&&(0,s.jsx)("div",{className:m().modal,children:(0,s.jsx)(i.A,{visible:!0,onLogin:()=>{M(!1),f.push("/signInLogIn")},onBrowse:()=>M(!1)})})]})}},4914:e=>{e.exports={fullpost:"Fullpost_fullpost__RAWXY",fullPostHeaderArea:"Fullpost_fullPostHeaderArea__IZ_ww",fullPostHeader:"Fullpost_fullPostHeader__oMDDi",iconWrapper:"Fullpost_iconWrapper__jQlsF",mapIcon:"Fullpost_mapIcon__vjSzy",mainLogo:"Fullpost_mainLogo__MRieQ",logoImage:"Fullpost_logoImage__HlTw9",menuIcon:"Fullpost_menuIcon__rtQ8M",scrollContainer:"Fullpost_scrollContainer__CTDOm",heroContainer:"Fullpost_heroContainer__TWV0G",heroImage:"Fullpost_heroImage__qiHfb",heroGradient:"Fullpost_heroGradient__f4Jls",backButton:"Fullpost_backButton__SLaDd",backButtonIcon:"Fullpost_backButtonIcon__PmKiX",menuButton:"Fullpost_menuButton____Sow",menuButtonIcon:"Fullpost_menuButtonIcon__EdOR5",heroTextOverlay:"Fullpost_heroTextOverlay__ENo_q",heroTitle:"Fullpost_heroTitle__LqI2K",heroCategory:"Fullpost_heroCategory__M1rd_",fullPostMainFrame:"Fullpost_fullPostMainFrame__vt_x4",recruitmentInfoContainer:"Fullpost_recruitmentInfoContainer___9XAd",recruitmentInfo:"Fullpost_recruitmentInfo__IrrGr",recruitmentText:"Fullpost_recruitmentText__2GnwQ",recruitmentCompleteText:"Fullpost_recruitmentCompleteText__x8_6D",circleContainer:"Fullpost_circleContainer__UYcWK",circle:"Fullpost_circle__wxhKc",applyButton:"Fullpost_applyButton__jFyGm",applyButtonComplete:"Fullpost_applyButtonComplete__r4n5d",applyButtonText:"Fullpost_applyButtonText__98pkZ",disabledButton:"Fullpost_disabledButton__aCYAR",loadingContainer:"Fullpost_loadingContainer__FDqqL",authorInformation:"Fullpost_authorInformation__kQDGf",friendProfileImage:"Fullpost_friendProfileImage__8w6Vv",authorText:"Fullpost_authorText__Mz7Je",author:"Fullpost_author__cN6DB",timeCategoryText:"Fullpost_timeCategoryText__9_kgz",fullPostContents:"Fullpost_fullPostContents__4iWG1",textContent:"Fullpost_textContent__CzA6w",postInformation:"Fullpost_postInformation__tTDEQ",iconInfo:"Fullpost_iconInfo__h23UF",iconText:"Fullpost_iconText__jaA93",icon:"Fullpost_icon__nKk5M",fullApplicantsProfile:"Fullpost_fullApplicantsProfile__Bjgoo",fullMapContents:"Fullpost_fullMapContents__hREfS",fullCommentsTitle:"Fullpost_fullCommentsTitle__a83Td",distanceText:"Fullpost_distanceText__vCh3n",messageInputForm:"Fullpost_messageInputForm__bHhBm",mapPreviewContainer:"Fullpost_mapPreviewContainer__5vbgz",mapImage:"Fullpost_mapImage__WtK34",mapOverlay:"Fullpost_mapOverlay__YWT6b",overlayCityCountry:"Fullpost_overlayCityCountry__Xf53D",overlayDistance:"Fullpost_overlayDistance__5IzJ4",fullPostTitle:"Fullpost_fullPostTitle__lrRoX",fullComments:"Fullpost_fullComments__gSY91",applicantsContainer:"Fullpost_applicantsContainer__POVa1",menuOverlay:"Fullpost_menuOverlay___7zJy",menuContainer:"Fullpost_menuContainer__hyohv",menuItem:"Fullpost_menuItem__u4sER",menuText:"Fullpost_menuText__2GP_J",modalOverlay:"Fullpost_modalOverlay__3V46b",fullScreenMapContainer:"Fullpost_fullScreenMapContainer__jat5k",fullScreenMap:"Fullpost_fullScreenMap__NH45Q",mapBackButton:"Fullpost_mapBackButton__BR0oi",mapBackButtonIcon:"Fullpost_mapBackButtonIcon__QTENc",mapInfoOverlay:"Fullpost_mapInfoOverlay__HS5x9",mapInfoPlace:"Fullpost_mapInfoPlace__agmu6",mapInfoLocation:"Fullpost_mapInfoLocation__zLtch",mapInfoDistance:"Fullpost_mapInfoDistance__Ar1qp",reduceButton:"Fullpost_reduceButton__O_nta",reduceButtonText:"Fullpost_reduceButtonText__BdSrU",commentList:"Fullpost_commentList__iMerQ",iconButton:"Fullpost_iconButton__usLr1"}},5362:e=>{e.exports={myContainer:"MessageBubble_myContainer__YONHp",friendContainer:"MessageBubble_friendContainer__ZiduA",myBubble:"MessageBubble_myBubble__UhB3M",friendBubble:"MessageBubble_friendBubble__lVCA7",myMessageText:"MessageBubble_myMessageText__v0XGx",friendMessageText:"MessageBubble_friendMessageText__IErow",messageTimeRight:"MessageBubble_messageTimeRight__h7joM",messageTimeLeft:"MessageBubble_messageTimeLeft__hKMXY",optionsContainer:"MessageBubble_optionsContainer__jmvS6",optionButton:"MessageBubble_optionButton__HC0_J",editTextInput:"MessageBubble_editTextInput___Nw_q",imageWrapper:"MessageBubble_imageWrapper__FYXm2",overlay:"MessageBubble_overlay__4_UHa",loadErrorText:"MessageBubble_loadErrorText__4_obs",chatImage:"MessageBubble_chatImage__Osjwf",loadingWrapper:"MessageBubble_loadingWrapper__MMliA",buttonRow:"MessageBubble_buttonRow__AZmeW",modalOverlay:"MessageBubble_modalOverlay__lVG2u",imageViewer:"MessageBubble_imageViewer__M7erh",closeButton:"MessageBubble_closeButton__F_ttY",closeButtonText:"MessageBubble_closeButtonText__gE0er",zoomedImage:"MessageBubble_zoomedImage__ZbdIt"}},9105:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>B});var s=a(5155),o=a(2115),n=a(1065),l=a(1218),r=a(3464),i=a(54),c=a.n(i),u=a(5695),m=a(2278),d=a.n(m);let p=e=>{let{onSendMessage:t,showPhotoIcon:a=!0}=e,{t:r}=(0,l.Bd)(),{SERVER_URL:i}=(0,n.U)(),c=(0,u.useRouter)(),[m,p]=(0,o.useState)(""),[_,h]=(0,o.useState)(null),[g,x]=(0,o.useState)(!1),[f,j]=(0,o.useState)(!1),[b,v]=(0,o.useState)(!1),[y,I]=(0,o.useState)(!1),C=(0,o.useRef)(null);(0,o.useEffect)(()=>{v(!!localStorage.getItem("token"))},[]);let N=()=>{b?(m.trim()||_)&&(t({text:m.trim(),imageUri:_}),p(""),h(null),x(!1)):I(!0)},B=async()=>{C.current&&C.current.click()},w=async e=>{if(e.target.files&&e.target.files[0]){let t=e.target.files[0];h(URL.createObjectURL(t)),x(!0)}};return(0,s.jsxs)(s.Fragment,{children:[y&&(0,s.jsx)("div",{className:d().loginOverlay,children:(0,s.jsxs)("div",{className:d().loginOverlayContent,children:[(0,s.jsx)("p",{children:r("login_required")}),(0,s.jsxs)("div",{className:d().loginOverlayButtons,children:[(0,s.jsx)("button",{onClick:()=>{I(!1),c.push("/signInLogIn")},children:r("login")}),(0,s.jsx)("button",{onClick:()=>I(!1),children:r("browse")})]})]})}),g&&_&&(0,s.jsx)("div",{className:d().previewContainer,children:(0,s.jsxs)("div",{className:d().previewContent,children:[(0,s.jsx)("img",{src:_,alt:"Preview",className:d().previewImage}),(0,s.jsx)("button",{className:d().closePreviewButton,onClick:()=>h(null),children:(0,s.jsx)("img",{src:"/assets/delete-icon-big.png",alt:"Close Preview",className:d().closeIcon})})]})}),(0,s.jsxs)("div",{className:d().chattingFormFrame,children:[a?(0,s.jsx)("button",{className:d().photoButton,onClick:B,children:(0,s.jsx)("img",{src:"/assets/message-photo-icon.png",alt:"Select Photo",className:d().chatIcon})}):(0,s.jsx)("div",{className:d().placeholderIconSpace}),(0,s.jsx)("input",{className:d().chatInput,placeholder:r(b?"messageInput.placeholder":"messageInput.login_required"),value:m,onChange:e=>p(e.target.value),onKeyDown:e=>{"Enter"===e.key&&N()}}),(0,s.jsx)("button",{className:d().sendButton,onClick:N,children:(0,s.jsx)("img",{src:"/assets/message-send-icon.png",alt:"Send",className:d().chatIcon})})]}),(0,s.jsx)("input",{type:"file",accept:"image/*",ref:C,style:{display:"none"},onChange:w})]})};var _=a(2649),h=a(5362),g=a.n(h),x=a(70);function f(e){return!!(e&&(e.startsWith("http")||e.startsWith("https")))}let j=e=>{let{content:t,nickname:a,isMine:i,timestamp:c,profileImage:m,profileThumbnail:d,userId:p,imageUrl:h,thumbnailUrl:j,containerStyle:b,isImageUploading:v=!1,messageType:y,_id:I,chatContextId:C,onDelete:N}=e,{t:B}=(0,l.Bd)(),{SERVER_URL:w}=(0,n.U)();(0,u.useRouter)();let[k,F]=(0,o.useState)(!1),[S,T]=(0,o.useState)(!1),[M,P]=(0,o.useState)(t),[A,O]=(0,o.useState)(!1),[E,R]=(0,o.useState)(!1),[L,W]=(0,o.useState)(!1);(0,o.useEffect)(()=>{f(j||h)?O(!0):O(!1),R(!1)},[j,h]);let z=async()=>{if(!C||!I||!y)return;let e="";"normal"===y?e="".concat(w,"/chats/").concat(C,"/message/").concat(I):"buddy"===y?e="".concat(w,"/buddy-chat/").concat(C,"/message/").concat(I):"regional"===y&&(e="".concat(w,"/district-chat/").concat(C,"/message/").concat(I));try{let t=localStorage.getItem("token"),a=await r.A.patch(e,{message:M},{headers:{Authorization:"Bearer ".concat(t)}});200===a.status&&T(!1)}catch(e){console.error("Error updating message:",e)}},D=async()=>{if(!C||!I||!y)return;let e="";"normal"===y?e="".concat(w,"/chats/").concat(C,"/message/").concat(I):"buddy"===y?e="".concat(w,"/buddy-chat/").concat(C,"/message/").concat(I):"regional"===y&&(e="".concat(w,"/district-chat/").concat(C,"/message/").concat(I));try{let t=localStorage.getItem("token"),a=await r.A.delete(e,{headers:{Authorization:"Bearer ".concat(t)}});200===a.status&&N&&I&&N(I)}catch(e){console.error("Error deleting message:",e)}};return(0,s.jsxs)("div",{className:"".concat(i?g().myContainer:g().friendContainer),style:b,onContextMenu:e=>{e.preventDefault(),i&&F(e=>!e)},onClick:()=>{k&&F(!1)},children:[!i&&(0,s.jsx)(_.A,{userId:p||"",nickname:a,profileImage:m||void 0,profileThumbnail:d||void 0,countryName:"",size:40}),(0,s.jsx)("div",{className:i?g().myBubble:g().friendBubble,children:S?(0,s.jsx)("input",{className:g().editTextInput,value:M,onChange:e=>P(e.target.value),onKeyDown:e=>{"Enter"===e.key&&z()},autoFocus:!0}):v?(0,s.jsx)("div",{className:g().loadingWrapper,children:(0,s.jsx)("div",{className:g().spinner})}):f(j||h)?(0,s.jsxs)("div",{className:g().imageWrapper,onClick:()=>{W(!0),k&&F(!1)},onContextMenu:e=>{e.preventDefault(),F(e=>!e)},children:[(0,s.jsx)("img",{src:j||h||"",alt:"Chat",className:g().chatImage,onLoad:()=>O(!1),onError:()=>{O(!1),R(!0)}}),A&&(0,s.jsx)("div",{className:g().overlay,children:(0,s.jsx)("div",{className:g().spinner})}),E&&(0,s.jsx)("p",{className:g().loadErrorText,children:B("image_load_failed")})]}):(0,s.jsx)("p",{className:i?g().myMessageText:g().friendMessageText,children:t||B("no_content")})}),!k&&(0,s.jsx)("span",{className:i?g().messageTimeRight:g().messageTimeLeft,children:(0,x.S)(c,B)}),i&&k&&(0,s.jsxs)("div",{className:g().optionsContainer,children:[!f(j||h)&&(0,s.jsx)("button",{className:g().optionButton,onClick:()=>{T(!0),F(!1)},children:B("message_edit")}),(0,s.jsx)("button",{className:g().optionButton,onClick:D,children:B("message_delete")})]}),L&&(0,s.jsx)("div",{className:g().modalOverlay,onClick:()=>W(!1),children:(0,s.jsxs)("div",{className:g().imageViewer,children:[(0,s.jsx)("button",{className:g().closeButton,onClick:()=>W(!1),children:B("close")}),(0,s.jsx)("img",{src:h||j||"",alt:"Zoomed Chat",className:g().zoomedImage})]})})]})};var b=a(802),v=a(9953),y=a.n(v);let I=e=>{let{visible:t,onClose:a,onSubmit:n,postId:r,targetUserId:i}=e,{t:c}=(0,l.Bd)(),[u,m]=(0,o.useState)(""),d=e=>e.length<=4?e:e.slice(0,e.length-4)+"****";return t?(0,s.jsx)("div",{className:y().modalOverlay,onClick:a,children:(0,s.jsxs)("div",{className:y().modalContainer,onClick:e=>e.stopPropagation(),children:[(0,s.jsx)("h2",{className:y().modalHeader,children:c("report_reason","Report Reason")}),r&&(0,s.jsxs)("div",{className:y().infoContainer,children:[(0,s.jsxs)("span",{className:y().infoLabel,children:[c("post_id","Post ID"),": "]}),(0,s.jsx)("span",{className:y().infoText,children:d(r)})]}),i&&(0,s.jsxs)("div",{className:y().infoContainer,children:[(0,s.jsxs)("span",{className:y().infoLabel,children:[c("target_user_id","Reported User ID"),": "]}),(0,s.jsx)("span",{className:y().infoText,children:d(i)})]}),(0,s.jsx)("textarea",{className:y().modalInput,placeholder:c("enter_report_reason","Type your report reason here..."),value:u,onChange:e=>m(e.target.value),rows:4}),(0,s.jsxs)("div",{className:y().modalButtonContainer,children:[(0,s.jsx)("button",{className:y().primaryButton,onClick:()=>{if(!u.trim()){window.alert(c("error")+": "+c("report_reason_required"));return}n(u),m("")},children:(0,s.jsx)("span",{className:y().buttonText,children:c("submit","Submit")})}),(0,s.jsx)("button",{className:y().cancelButton,onClick:a,children:(0,s.jsx)("span",{className:y().buttonText,children:c("cancel","Cancel")})})]})]})}):null};var C=a(4914),N=a.n(C);console.log("MessageInputForm:",p),console.log("MessageBubble:",j),console.log("ProfileWithFlag:",_.A),console.log("AnimatedMarker:",e=>{let{coordinate:t,title:a,description:n,imageSource:l,onPress:r,mapRef:i,zIndex:c=1}=e,u=l.startsWith("http")?l:"/assets/".concat(l),[m,d]=(0,o.useState)(!1),[p,_]=(0,o.useState)(1),[h,g]=(0,o.useState)(0),x=async()=>{if(d(!m),r&&r(),_(.5),g(-10),setTimeout(()=>{_(1),g(0)},150),(null==i?void 0:i.current)&&"function"==typeof i.current.animateCamera)try{let e={...await i.current.getCamera(),center:{latitude:t.latitude,longitude:t.longitude}};i.current.animateCamera(e,{duration:500})}catch(e){console.error("Error centering map on marker:",e)}};return(0,s.jsxs)("div",{onClick:x,style:{position:"absolute",zIndex:c,transform:"translate(-50%, -100%) scale(".concat(p,") translateY(").concat(h,"px)"),transition:"transform 150ms ease-in-out",cursor:"pointer"},children:[(0,s.jsx)("img",{src:u,alt:"marker",style:{width:40,height:40,objectFit:"contain",display:"block"}}),m&&(0,s.jsxs)("div",{style:{position:"absolute",bottom:50,left:"50%",transform:"translateX(-50%)",backgroundColor:"rgba(255,255,255,0.85)",borderRadius:12,padding:"10px 14px",boxShadow:"0 4px 8px rgba(0,0,0,0.35)",pointerEvents:"none",textAlign:"left"},children:[a&&(0,s.jsx)("div",{style:{fontSize:15,fontWeight:600,color:"#333",marginBottom:4},children:a}),n&&(0,s.jsx)("div",{style:{fontSize:14,color:"#555",lineHeight:"18px"},children:n}),(0,s.jsx)("div",{style:{width:0,height:0,borderLeft:"8px solid transparent",borderRight:"8px solid transparent",borderTop:"10px solid rgba(255,255,255,0.7)",marginTop:4}})]})]})}),console.log("LoginDecisionOverlay:",b.A),console.log("ReportOverlay:",I);let B=()=>{let{SERVER_URL:e}=(0,n.U)(),{t}=(0,l.Bd)(),a=(0,u.useRouter)(),i=(0,u.useSearchParams)(),m=(0,o.useMemo)(()=>Object.fromEntries(i.entries()),[i]),{id:d="",author:h="Anonymous",time:g="",meetingTime:x="",category:f="",title:v="",content:y="",likes:C="0",comments:B="0",visitors:w="0",recruitmentCount:k="0",applicantsCount:F="0",profileImage:S="",profileThumbnail:T="",image:M="",thumbnail:P="",nicknameOption:A="",meetingPlace:O="",meetingCity:E="",meetingCountry:R="",mapboxImage:L="",isBuddyPost:W="false",applicants:z="0"}=m;if(!d)return(0,s.jsx)("div",{children:"Loading..."});let D=Number(C),H=Number(B),U=Number(w),J=Number(k),q=Number(F),G=z?Number(z):q,[X,K]=(0,o.useState)(null),[Y,Q]=(0,o.useState)(G),[V,Z]=(0,o.useState)(!1),[$,ee]=(0,o.useState)(!1),[et,ea]=(0,o.useState)(""),[es,eo]=(0,o.useState)(""),[en,el]=(0,o.useState)(""),[er,ei]=(0,o.useState)([]),[ec,eu]=(0,o.useState)(!1),[em,ed]=(0,o.useState)(!1),[ep,e_]=(0,o.useState)(""),[eh,eg]=(0,o.useState)(!1),[ex,ef]=(0,o.useState)(D),[ej,eb]=(0,o.useState)(U),[ev,ey]=(0,o.useState)(H),[eI,eC]=(0,o.useState)(!1),[eN,eB]=(0,o.useState)(!1),[ew,ek]=(0,o.useState)(h),[eF,eS]=(0,o.useState)(A),[eT,eM]=(0,o.useState)(S),[eP,eA]=(0,o.useState)(T),[eO,eE]=(0,o.useState)(M),[eR,eL]=(0,o.useState)(P),[eW,ez]=(0,o.useState)([]),[eD,eH]=(0,o.useState)(!1),eU="true"===W,eJ=eU?"".concat(e,"/buddy-post"):"".concat(e,"/posts"),[eq,eG]=(0,o.useState)(!1),[eX,eK]=(0,o.useState)(null),[eY,eQ]=(0,o.useState)(null),[eV,eZ]=(0,o.useState)(null),[e$,e0]=(0,o.useState)(null),[e1,e5]=(0,o.useState)(!1),[e2,e4]=(0,o.useState)(!1),[e3,e6]=(0,o.useState)(eR||""),[e8,e9]=(0,o.useState)(!1),[e7,te]=(0,o.useState)(!1),[tt,ta]=(0,o.useState)(!1),[ts,to]=(0,o.useState)(0),tn=()=>localStorage.getItem("token"),tl=Math.min(1,ts/120);(0,o.useEffect)(()=>{{let e=new URLSearchParams(window.location.search).get("ref");e&&K(e)}},[]);let tr=()=>{let t="".concat(e,"/posts/").concat(d,"?ref=").concat(et),a="".concat(window.location.origin,"/post/").concat(d,"?ref=").concat(et);return console.log("web link:",t),console.log("app link:",a),{postLink:t,appLink:a}},ti=async()=>{let{postLink:e}=tr();try{await navigator.clipboard.writeText(e),window.alert("Link copied! Share with your friends."),navigator.share&&await navigator.share({url:e})}catch(e){console.error("Error sharing post:",e)}};(0,o.useEffect)(()=>{navigator.geolocation&&navigator.geolocation.getCurrentPosition(e=>{eZ(e.coords.latitude),e0(e.coords.longitude)},e=>{console.error("Error fetching current location:",e)},{enableHighAccuracy:!0,timeout:2e4})},[]);let tc=()=>{let e;if(null===eX||null===eY||null===eV||null===e$)return"";let t=eV*Math.PI/180,a=eX*Math.PI/180,s=Math.sin((eX-eV)*Math.PI/180/2)**2+Math.cos(t)*Math.cos(a)*Math.sin((eY-e$)*Math.PI/180/2)**2,o=2*Math.atan2(Math.sqrt(s),Math.sqrt(1-s))*6371e3,n=navigator.language;if(!n.includes("en-US")&&!n.includes("en-GB"))return(e=o/1e3)>=10?"".concat(Math.round(e),"km"):e>=1?"".concat(e.toFixed(1),"km"):"".concat(Math.round(o),"m");if((e=o/1609.34)>=6.214)return"".concat(Math.round(e),"mi");if(e>=.6214)return"".concat(e.toFixed(1),"mi");{let t=1609.34*e;return"".concat(Math.round(t),"m")}};(0,o.useEffect)(()=>{(async()=>{let t=tn();if(t)try{let{data:a,status:s}=await r.A.get("".concat(e,"/users/me"),{headers:{Authorization:"Bearer ".concat(t)}});s>=200&&s<300&&(ea(a.userId),a&&a.userId&&z&&Z(String(z).includes(a.userId)))}catch(e){console.error("Error fetching user data:",e)}})()},[z,e]),(0,o.useEffect)(()=>{(async()=>{let t=tn();if(t&&z)try{let a=String(z).split(","),{data:s,status:o}=await r.A.post("".concat(e,"/users/profiles"),{userIds:a},{headers:{Authorization:"Bearer ".concat(t),"Content-Type":"application/json"}});o>=200&&o<300?ez(s.users):console.error("Failed to fetch applicants profiles:",o)}catch(e){console.error("Error fetching applicants profiles:",e)}})()},[z,e]);let tu=async()=>{if(!d){console.error("Error: Missing post ID. Cannot fetch post data."),window.alert(t("error")+": Missing post ID");return}let e=tn();try{let{data:t,status:a}=await r.A.get("".concat(eJ,"/").concat(d),{headers:{Authorization:e?"Bearer ".concat(e):""}});ei(t.commentList),ef(t.likes),eb(t.visitors),ey(t.comments),eg(t.likedByUser),ek(t.author),eo(t.userId),eS(t.nicknameOption),eM(t.profileImage),eA(t.profileThumbnail),eH(t.isRecruitmentComplete),eE(t.image),t.meetingLatitude&&eK(t.meetingLatitude),t.meetingLongitude&&eQ(t.meetingLongitude)}catch(e){console.error("Error fetching post data:",e.message),window.alert(t("error")+": "+t("fetch_post_error"))}},tm=async()=>{let e=tn();if(e)try{let{data:t,status:a}=await r.A.post("".concat(eJ,"/").concat(d,"/visit"),null,{headers:{Authorization:"Bearer ".concat(e)}});if(a>=200&&a<300)eb(t.visitors);else throw Error("Failed to update visitors")}catch(e){console.error("Error updating visitors:",e)}};(0,o.useEffect)(()=>{m&&m.id&&(tu(),tm())},[m]);let td=async()=>{let e=tn();if(e&&!$){ee(!0),Z(!V),Q(V?Y-1:Y+1),V?ez(eW.filter(e=>e.userId!==et)):ez([...eW,{userId:et,profileImage:eT,profileThumbnail:eP}]);try{let t=await (0,r.A)({url:"".concat(eJ,"/").concat(d,"/").concat(V?"removeApplicant":"addApplicant"),method:V?"DELETE":"POST",headers:{Authorization:"Bearer ".concat(e),"Content-Type":"application/json"},data:{userId:et}});if(t.status>=200&&t.status<300)Q(t.data.applicantsCount),Z(!V),tu();else throw Error("Application update failed")}catch(e){Z(!V),Q(V?Y+1:Y-1),ez(V?[...eW,{userId:et,profileImage:eT,profileThumbnail:eP}]:eW.filter(e=>e.userId!==et)),console.error("Error ".concat(V?"removing":"adding"," applicant:"),e),window.alert(t("error")+": "+t("application_error"))}finally{ee(!1)}}},tp="AI"===eF?J>0?Y/J:0:(Y+1)/(J+1);(0,o.useEffect)(()=>{te(!!tn())},[]),(0,o.useCallback)(()=>{eB(!0),tu().finally(()=>eB(!1))},[]);let t_=async()=>{if(!e7){ta(!0);return}let e=tn();if(e)try{let{data:t,status:a}=await r.A.post("".concat(eJ,"/").concat(d,"/like"),null,{headers:{Authorization:"Bearer ".concat(e)}});if(a>=200&&a<300)ef(t.likes),eg(!eh),tu();else throw Error("Failed to update likes")}catch(e){console.error("Error liking post:",e)}},th=async a=>{if(a.trim()){let s=tn();if(s)try{let{data:o,status:n}=await r.A.get("".concat(e,"/users/me"),{headers:{Authorization:"Bearer ".concat(s)}});if(n<200||n>=300)throw Error("Error fetching user information.");let l={author:o.nickname,userId:o.userId,time:new Date().toISOString(),content:a,profileImage:o.profileImage,profileThumbnail:o.profileThumbnail},{status:i}=await r.A.post("".concat(eJ,"/").concat(d,"/comment"),l,{headers:{"Content-Type":"application/json",Authorization:"Bearer ".concat(s)}});i>=200&&i<300?(ei([...er,l]),el(""),ey(ev+1),eC(!0),tu()):window.alert(t("error")+": "+t("add_comment_error"))}catch(e){console.error("Error adding comment:",e),window.alert(t("error")+": "+t("add_comment_error"))}}},tg=async()=>{try{let e=tn();if(!e)return;let{status:s}=await r.A.delete("".concat(eJ,"/").concat(d,"/delete"),{headers:{Authorization:"Bearer ".concat(e)}});s>=200&&s<300?(window.alert(t("delete_success")+": "+t("delete_success_message")),a.back()):window.alert(t("error")+": "+t("delete_error"))}catch(e){console.error("Error deleting post:",e.message)}},tx=()=>{eu(!ec)},tf=(e,t)=>(0,s.jsx)(j,{content:e.content,isMine:e.userId===et,timestamp:e.time,profileImage:e.profileImage,profileThumbnail:e.profileThumbnail,userId:e.userId},t),tj=async()=>{if(!ep.trim()){window.alert(t("error")+": "+t("report_reason_required"));return}try{let a=tn();if(!a){window.alert(t("error")+": "+t("login_required"));return}let s={reason:ep,...d&&{postId:d},...es&&{targetUserId:es}},{status:o}=await r.A.post("".concat(e,"/report/post"),s,{headers:{"Content-Type":"application/json",Authorization:"Bearer ".concat(a)}});o>=200&&o<300?(window.alert(t("report_success")+": "+t("report_success_message")),ed(!1),e_(""),tu()):window.alert(t("error")+": "+t("report_error"))}catch(e){console.error("Error reporting post:",e.message),window.alert(t("error")+": "+t("report_error"))}},tb=async()=>{let e={postId:d,author:ew,userId:es,time:g,meetingTime:x,meetingPlace:O,meetingCity:E,meetingCountry:R,category:f,title:v,content:y,likes:ex,comments:ev,visitors:ej,profileImage:eT,profileThumbnail:eP,image:eO,mapboxImage:L,recruitmentCount:J,applicantsCount:Y,applicants:Y,visitedUsers:eW.map(e=>e.userId),likedUsers:eh?[et]:[],commentList:er,nicknameOption:eF,isBuddyPost:eU};try{let a=localStorage.getItem("bookmarkedPosts"),s=a?JSON.parse(a):[],o=[e,...s];localStorage.setItem("bookmarkedPosts",JSON.stringify(o)),tu(),window.alert(t("bookmark_success")+": "+t("bookmark_success_message"))}catch(e){console.error("Failed to bookmark the post",e.message),window.alert(t("error")+": "+t("bookmark_error"))}},tv=()=>{e5(!e1)},ty=async()=>{let e=tn();try{let{data:a,status:s}=await r.A.post("".concat(eJ,"/").concat(d,"/completeRecruitment"),null,{headers:{Authorization:"Bearer ".concat(e)}});s>=200&&s<300?(window.alert(t("recruitment_complete")+": "+t("recruitment_complete_message")),eH(!0),tu()):window.alert(t("error")+": "+t("recruitment_error"))}catch(e){console.error("Error marking recruitment as complete:",e)}},tI=(0,o.useCallback)(c().debounce(()=>{td()},1e3,{leading:!0,trailing:!1}),[]),tC=(0,o.useCallback)(c().debounce(()=>{ty()},1e3,{leading:!0,trailing:!1}),[]);return(0,s.jsx)(o.Suspense,{fallback:(0,s.jsx)("div",{children:"Loading..."}),children:Object.keys(m).length>0?(0,s.jsxs)("div",{className:N().fullpost,children:[(0,s.jsx)("div",{className:N().fullPostHeaderArea,style:{opacity:tl,transform:"translateY(".concat(30-ts/120*30,"px)")},children:(0,s.jsxs)("div",{className:N().fullPostHeader,children:[(0,s.jsx)("button",{className:N().iconWrapper,onClick:()=>a.back(),children:(0,s.jsx)("img",{className:N().iconWrapper,src:"/assets/BackIcon.png",alt:"Back"})}),(0,s.jsx)("img",{className:N().logoImage,src:"/assets/Owl-icon-pink.png",alt:"Logo"}),(0,s.jsx)("button",{className:N().iconWrapper,onClick:()=>{e7?tx():ta(!0)},children:(0,s.jsx)("img",{src:"/assets/full-post-menu-icon.png",className:N().menuIcon,alt:"Menu"})})]})}),(0,s.jsx)("div",{className:N().scrollContainer,onScroll:e=>{to(e.currentTarget.scrollTop)},children:(0,s.jsxs)("div",{children:[(0,s.jsxs)("div",{className:N().heroContainer,children:[(0,s.jsx)("img",{src:e3||"/assets/leire-cavia-S93RK176PuA-unsplash.jpg",className:N().heroImage,alt:"Hero",onLoad:()=>{e4(!0),e6(eO||"")},onError:e=>console.error("Failed to load image:",e)}),(0,s.jsx)("div",{className:N().heroGradient}),(0,s.jsx)("button",{className:N().backButton,onClick:()=>a.back(),children:(0,s.jsx)("img",{src:"/assets/back-light.png",className:N().backButtonIcon,alt:"Back"})}),(0,s.jsx)("button",{className:N().menuButton,onClick:tx,children:(0,s.jsx)("img",{src:"/assets/menu-light.png",className:N().menuButtonIcon,alt:"Menu"})}),(0,s.jsxs)("div",{className:N().heroTextOverlay,children:[(0,s.jsx)("button",{onClick:()=>e9(!e8),children:(0,s.jsx)("h1",{className:N().heroTitle,style:{display:"-webkit-box",WebkitLineClamp:e8?"none":2,WebkitBoxOrient:"vertical",overflow:"hidden"},children:v})}),(0,s.jsx)("p",{className:N().heroCategory,children:t("topics.".concat(f))})]})]}),(0,s.jsxs)("div",{className:N().fullPostMainFrame,children:[(0,s.jsx)("div",{className:N().recruitmentInfoContainer,children:(0,s.jsxs)("div",{className:N().recruitmentInfo,children:[(0,s.jsx)("p",{className:N().recruitmentText,children:"AI"===eF?"".concat(Y," out of ").concat(J," applied"):"".concat(Y+1," out of ").concat(J+1," applied")}),eD||Y>=J?(0,s.jsx)("p",{className:N().recruitmentCompleteText,children:t("recruitment_status_complete")}):(0,s.jsx)("div",{className:N().circleContainer,children:(0,s.jsx)("div",{className:N().circle,children:(0,s.jsxs)("span",{children:[Math.round(100*tp),"%"]})})})]})}),eD?(0,s.jsx)("button",{className:N().applyButtonComplete,disabled:!0,children:t("recruitment_status_complete")}):et===es?(0,s.jsx)("button",{className:N().applyButton,onClick:tC,children:t("complete_recruitment")}):(0,s.jsx)("button",{className:"".concat(N().applyButton," ").concat(V||Y>=J?N().disabledButton:""),onClick:tI,disabled:$||Y>=J,children:$?t("processing"):V?t("cancel_application"):Y>=J?t("recruitment_status_complete"):t("apply")})]}),(0,s.jsxs)("div",{className:N().fullPostMainFrame,children:[(0,s.jsxs)("div",{className:N().authorInformation,children:["AI"===eF?(0,s.jsx)("img",{className:N().friendProfileImage,src:"/assets/AI.png",alt:"AI"}):(0,s.jsx)(_.A,{userId:es,profileImage:eT,profileThumbnail:eP,size:48}),(0,s.jsxs)("div",{className:N().author,children:[(0,s.jsx)("p",{className:N().authorText,children:ew}),(0,s.jsxs)("p",{className:N().timeCategoryText,children:[t("time"),": ",g," \xb7 ",t("topics.".concat(f))]})]})]}),(0,s.jsx)("div",{className:N().fullPostContents,children:(0,s.jsx)("p",{className:N().textContent,children:y})}),(0,s.jsxs)("div",{className:N().postInformation,children:[(0,s.jsxs)("div",{className:N().iconInfo,children:[(0,s.jsx)("img",{src:"/assets/eye-colored.png",className:N().icon,alt:"Views"}),(0,s.jsx)("p",{className:N().iconText,children:ej})]}),(0,s.jsx)("button",{onClick:t_,className:N().iconButton,children:(0,s.jsxs)("div",{className:N().iconInfo,children:[(0,s.jsx)("img",{src:eh?"/assets/like-colored.png":"/assets/like-icon.png",className:N().icon,alt:"Like"}),(0,s.jsx)("p",{className:N().iconText,children:ex})]})}),(0,s.jsxs)("div",{className:N().iconInfo,children:[(0,s.jsx)("img",{src:eI?"/assets/comment-colored.png":"/assets/comment-icon.png",className:N().icon,alt:"Comment"}),(0,s.jsx)("p",{className:N().iconText,children:ev})]})]})]}),(0,s.jsxs)("div",{className:N().fullApplicantsProfile,children:[(0,s.jsx)("div",{className:N().fullApplicants,children:(0,s.jsxs)("div",{className:N().fullMapContents,children:[(0,s.jsx)("img",{src:"/assets/participants-title-icon.png",className:N().mapIcon,alt:"Applicants"}),(0,s.jsxs)("p",{className:N().fullCommentsTitle,children:[t("applicants_profile")," ",eW.length]})]})}),eW.length>0&&(0,s.jsx)("div",{className:N().applicantsContainer,children:eW.map((e,t)=>(0,s.jsx)(_.A,{userId:e.userId,nickname:e.nickname,profileImage:e.profileImage,profileThumbnail:e.profileThumbnail,size:50},t))})]}),(0,s.jsxs)("div",{className:N().fullPostMainFrame,children:[(0,s.jsxs)("div",{className:N().fullMapContents,children:[(0,s.jsx)("img",{src:"/assets/map-colored.png",className:N().mapIcon,alt:"Map"}),(0,s.jsx)("p",{className:N().fullPostTitle,children:O})]}),eX&&eY?(0,s.jsx)("div",{className:N().fullImage,children:(0,s.jsxs)("button",{className:N().mapPreviewContainer,onClick:tv,children:[(0,s.jsx)("img",{src:"/assets/mapComponent.png",className:N().mapImage,alt:"Map Preview"}),(0,s.jsxs)("div",{className:N().mapOverlay,children:[(0,s.jsxs)("p",{className:N().overlayCityCountry,children:[E,", ",R]}),(0,s.jsxs)("p",{className:N().overlayDistance,children:[t("distance"),": ",tc()]})]})]})}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("div",{className:N().fullPostContents,children:(0,s.jsxs)("p",{className:N().fullPostTitle,children:[E,", ",R]})}),(0,s.jsx)("div",{className:N().fullPostContents,children:(0,s.jsxs)("p",{className:N().distanceText,children:[t("distance"),": ",tc()]})})]}),(0,s.jsx)("div",{className:N().fullPostContents,children:(0,s.jsxs)("p",{className:N().fullPostTitle,children:[E,", ",R]})}),(0,s.jsx)("div",{className:N().fullPostContents,children:(0,s.jsxs)("p",{className:N().distanceText,children:[t("distance"),": ",tc()]})})]}),e1&&(0,s.jsxs)("div",{className:N().fullScreenMapContainer,children:[(0,s.jsx)("div",{className:N().fullScreenMap,children:(0,s.jsx)("iframe",{title:"Full Screen Map",src:"https://www.google.com/maps?q=".concat(eX,",").concat(eY,"&z=15&output=embed"),width:"100%",height:"100%",style:{border:0}})}),(0,s.jsx)("button",{className:N().mapBackButton,onClick:tv,children:(0,s.jsx)("img",{src:"/assets/back-light.png",className:N().mapBackButtonIcon,alt:"Back"})}),(0,s.jsxs)("div",{className:N().mapInfoOverlay,children:[eO&&(0,s.jsx)("img",{src:eO,className:N().mapPostImage,alt:"Post"}),(0,s.jsx)("p",{className:N().mapInfoPlace,children:O}),(0,s.jsxs)("p",{className:N().mapInfoLocation,children:[E,", ",R]}),(0,s.jsxs)("p",{className:N().mapInfoDistance,children:[t("distance"),": ",tc()]})]}),(0,s.jsx)("button",{className:N().reduceButton,onClick:tv,children:(0,s.jsx)("p",{className:N().reduceButtonText,children:t("reduce")})})]}),(0,s.jsxs)("div",{className:N().fullComments,children:[(0,s.jsxs)("div",{className:N().fullMapContents,children:[(0,s.jsx)("img",{src:"/assets/comment-title-icon.png",className:N().mapIcon,alt:"Comments"}),(0,s.jsxs)("p",{className:N().fullCommentsTitle,children:[t("comments")," ",ev]})]}),ev>0&&(0,s.jsx)("div",{className:N().commentList,children:er.map((e,t)=>tf(e,t))})]})]})}),(0,s.jsx)("div",{className:N().messageInputForm,children:(0,s.jsx)(p,{onSendMessage:e=>{th(e.text)},showPhotoIcon:!1})}),(0,s.jsx)(I,{visible:em,onClose:()=>ed(!1),onSubmit:tj,postId:d,targetUserId:es}),ec&&(0,s.jsx)("div",{className:N().menuOverlay,onClick:tx,children:(0,s.jsxs)("div",{className:N().menuContainer,onClick:e=>e.stopPropagation(),children:[(0,s.jsx)("button",{className:N().menuItem,onClick:tx,children:(0,s.jsx)("img",{src:"/assets/delete-icon-big.png",className:N().menuIcon,alt:"Close"})}),et===es&&(0,s.jsx)("button",{className:N().menuItem,onClick:tg,children:(0,s.jsx)("span",{className:N().menuText,children:t("delete")})}),et!==es&&(0,s.jsx)("button",{className:N().menuItem,onClick:()=>{eu(!1),ed(!em)},children:(0,s.jsx)("span",{className:N().menuText,children:t("report")})}),(0,s.jsx)("button",{className:N().menuItem,onClick:ti,children:(0,s.jsx)("span",{className:N().menuText,children:t("share")})}),(0,s.jsx)("button",{className:N().menuItem,onClick:tb,children:(0,s.jsx)("span",{className:N().menuText,children:t("bookmark")})})]})}),tt&&(0,s.jsx)("div",{className:N().modalOverlay,children:(0,s.jsx)(b.A,{visible:!0,onLogin:()=>{ta(!1),a.push("/signin")},onBrowse:()=>{ta(!1)}})})]}):(0,s.jsx)("div",{children:"Loading..."})})}},9953:e=>{e.exports={modalOverlay:"ReportOverlay_modalOverlay__M8vP_",modalContainer:"ReportOverlay_modalContainer__pWJHe",modalHeader:"ReportOverlay_modalHeader__yl8pw",infoContainer:"ReportOverlay_infoContainer__IJi59",infoLabel:"ReportOverlay_infoLabel__vRJyv",infoText:"ReportOverlay_infoText__5kMti",modalInput:"ReportOverlay_modalInput__h5dhH",modalButtonContainer:"ReportOverlay_modalButtonContainer__B47tu",primaryButton:"ReportOverlay_primaryButton__12taJ",cancelButton:"ReportOverlay_cancelButton__6n_XM",buttonText:"ReportOverlay_buttonText__73ko4"}}}]);