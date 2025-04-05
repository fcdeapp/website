(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[177],{347:()=>{},2066:e=>{e.exports={overlay:"PasswordExpiredModal_overlay__uqqzV",modalContainer:"PasswordExpiredModal_modalContainer__EMm5b",title:"PasswordExpiredModal_title__RQIQd",message:"PasswordExpiredModal_message__4wptN",buttonContainer:"PasswordExpiredModal_buttonContainer__zWDo_",button:"PasswordExpiredModal_button__cbXxj",buttonText:"PasswordExpiredModal_buttonText__L4gMg",closeButton:"PasswordExpiredModal_closeButton__YRj8a",closeText:"PasswordExpiredModal_closeText__7UocI"}},2234:e=>{e.exports={container:"ErrorBoundaryWrapper_container__whHWH",text:"ErrorBoundaryWrapper_text__ZQSpk"}},2554:(e,t,a)=>{Promise.resolve().then(a.bind(a,3392))},3392:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>I});var r=a(5155),n=a(2115),s=a(1065),o=a(1218),i=a(2533),l=a(3464),c=a(2234),d=a.n(c);let u=e=>{let{children:t}=e,{SERVER_URL:a}=(0,s.U)();class o extends n.Component{static getDerivedStateFromError(e){return{hasError:!0}}componentDidCatch(e,t){if(console.error("Captured Error:",e),!this.errorLogSent){var r;this.errorLogSent=!0,l.A.post("".concat(a,"/api/logs/error"),{errorDetails:{message:e.toString(),stack:null===(r=t.componentStack)||void 0===r?void 0:r.slice(0,150),source:"React Component",timestamp:new Date().toISOString()}}).catch(e=>{console.error("Failed to send error log:",e)})}}render(){return this.state.hasError?(0,r.jsx)("div",{className:d().container,children:(0,r.jsx)("span",{className:d().text,children:"Something went wrong."})}):this.props.children}constructor(e){super(e),this.errorLogSent=!1,this.state={hasError:!1}}}return(0,r.jsx)(o,{children:t})};var h=a(5185),m=a.n(h);let p=e=>{let{visible:t,onRetry:a}=e,{t:n}=(0,o.Bd)();return t?(0,r.jsx)("div",{className:m().overlay,children:(0,r.jsxs)("div",{className:m().container,children:[(0,r.jsx)("h2",{className:m().title,children:n("maintenance.title")}),(0,r.jsx)("p",{className:m().message,children:n("maintenance.message")}),(0,r.jsx)("p",{className:m().support,children:n("maintenance.support_contact",{email:"support@fcde.app"})}),(0,r.jsx)("button",{className:m().button,onClick:a,children:(0,r.jsx)("span",{className:m().buttonText,children:n("maintenance.retry")})})]})}):null};var _=a(2066),g=a.n(_);let x=e=>{let{visible:t,onPressChange:a,onClose:n}=e,{t:s}=(0,o.Bd)();return t?(0,r.jsx)("div",{className:g().overlay,children:(0,r.jsxs)("div",{className:g().modalContainer,children:[(0,r.jsx)("h2",{className:g().title,children:s("password_expired_title")}),(0,r.jsx)("p",{className:g().message,children:s("password_expired_message")}),(0,r.jsx)("div",{className:g().buttonContainer,children:(0,r.jsx)("button",{className:g().button,onClick:a,children:(0,r.jsx)("span",{className:g().buttonText,children:s("change_now")})})}),n&&(0,r.jsx)("button",{className:g().closeButton,onClick:n,children:(0,r.jsx)("span",{className:g().closeText,children:s("close")})})]})}):null};var v=a(7768),w=a(5695),j=a(6874),f=a.n(j);function N(){return(0,r.jsx)("header",{className:"header",children:(0,r.jsxs)("nav",{className:"header-nav",children:[(0,r.jsx)(f(),{href:"/",children:(0,r.jsx)("img",{src:"/FacadeWebLogo.png",alt:"Facade Logo",className:"logo"})}),(0,r.jsxs)("div",{className:"nav-links",children:[(0,r.jsx)(f(),{href:"/about",children:"About"}),(0,r.jsx)(f(),{href:"/posts",children:"Posts"}),(0,r.jsx)(f(),{href:"/terms",children:"Terms"})]}),(0,r.jsxs)("div",{className:"action-buttons",children:[(0,r.jsx)(f(),{href:"/login",children:(0,r.jsx)("a",{className:"login-button",children:"Login"})}),(0,r.jsx)(f(),{href:"/signup",children:(0,r.jsx)("a",{className:"signup-button",children:"Sign Up"})})]})]})})}a(347);var b=a(3768),E=a.n(b),y=a(9509);let I=e=>{let{children:t}=e;(0,w.useRouter)();let[a,c]=(0,n.useState)(!0),[d,h]=(0,n.useState)(!1),[m,_]=(0,n.useState)(!1),[g,j]=(0,n.useState)(!1),f=(0,n.useRef)(null);(0,n.useRef)(null);let b="https://fcde.app",I=async()=>{try{await fetch("".concat(b,"/health")),h(!1)}catch(e){h(!0)}},S=async()=>{try{let e=y.env.NEXT_PUBLIC_APP_BUILD||"1.0.0",t=localStorage.getItem("userId")||"anonymous",a=await l.A.post("".concat(b,"/api/version/check"),{buildNumber:e,userId:t});if(a.data.deactivationInfo&&a.data.deactivationInfo.isDeactivated){window.location.href="/deactivatedUser";return}a.data.passwordExpired&&(_(!0),j(!0))}catch(e){console.error("Version check error:",e)}},C=async()=>{let e=localStorage.getItem("currentCountry")||"Unknown",t=(()=>{switch(e){case"Canada":return"ca-central-1";case"Australia":return"ap-southeast-2";case"United Kingdom":return"eu-west-2";default:return"ap-northeast-2"}})();return{userId:localStorage.getItem("userId")||"anonymous",deviceInfo:{deviceType:navigator.userAgent,os:navigator.platform,appVersion:y.env.NEXT_PUBLIC_APP_VERSION||"1.0.0"},networkStatus:{isConnected:navigator.onLine,networkType:"Unknown"},locationData:{country:e,region:t},additionalContext:{sessionId:localStorage.getItem("sessionId")||"Unknown"}}},M=async e=>{try{let t=await C();await l.A.post("".concat(b,"/api/logs/error"),{...t,errorDetails:e})}catch(e){console.error("Failed to send error log:",e)}};return(0,n.useEffect)(()=>{let e=e=>{var t;M({message:e.message,stack:e.error?null===(t=e.error.stack)||void 0===t?void 0:t.slice(0,200):"No stack trace",source:"Global",timestamp:new Date().toISOString(),isFatal:!1})};return window.addEventListener("error",e),()=>window.removeEventListener("error",e)},[]),(0,n.useEffect)(()=>{(async()=>{let e=localStorage.getItem("region");if(!e)try{navigator.geolocation?navigator.geolocation.getCurrentPosition(async t=>{let{latitude:a,longitude:r}=t.coords,n=await (0,v.LF)(a,r,b),s=n?n.country:"Unknown";e="Canada"===s?"ca-central-1":"Australia"===s?"ap-southeast-2":"United Kingdom"===s?"eu-west-2":"ap-northeast-2",localStorage.setItem("region",e)},t=>{console.error("Geolocation error:",t),e="ap-northeast-2",localStorage.setItem("region",e)}):(e="ap-northeast-2",localStorage.setItem("region",e))}catch(t){console.error("Error determining region:",t),e="ap-northeast-2",localStorage.setItem("region",e)}l.A.interceptors.request.use(t=>(t.headers["x-region"]=e,t))})()},[]),(0,n.useEffect)(()=>{(async()=>{try{await Promise.all([I(),S()])}catch(e){console.error("Initialization error:",e)}finally{c(!1)}})()},[]),(0,n.useEffect)(()=>{let e=()=>{f.current&&clearTimeout(f.current),f.current=setTimeout(()=>{I(),f.current=null},5e3)};return window.addEventListener("online",e),window.addEventListener("offline",()=>h(!0)),()=>{window.removeEventListener("online",e),window.removeEventListener("offline",()=>h(!0))}},[]),(0,r.jsx)("html",{lang:"en",className:E().className,children:(0,r.jsx)("body",{children:(0,r.jsx)(s.s,{children:(0,r.jsx)(u,{children:(0,r.jsxs)(o.xC,{i18n:i.Ay,children:[d&&(0,r.jsx)(p,{visible:d,onRetry:()=>{f.current&&clearTimeout(f.current),f.current=setTimeout(()=>{I(),f.current=null},5e3)}}),g&&(0,r.jsx)(x,{visible:g,onPressChange:()=>{j(!1),window.location.href="/signInLogIn?showChangePasswordModal=true"},onClose:()=>j(!1)}),(0,r.jsx)(N,{}),(0,r.jsx)("main",{children:t})]})})})})})}},3768:e=>{e.exports={style:{fontFamily:"'pretendard', 'pretendard Fallback'"},className:"__className_a7a14f",variable:"__variable_a7a14f"}},5185:e=>{e.exports={overlay:"MaintenanceModal_overlay__mpQUQ",container:"MaintenanceModal_container__JRIx_",title:"MaintenanceModal_title__Cxtzd",message:"MaintenanceModal_message__9gh38",support:"MaintenanceModal_support__UIsl5",button:"MaintenanceModal_button__STWON",buttonText:"MaintenanceModal_buttonText__TMEvk"}}},e=>{var t=t=>e(e.s=t);e.O(0,[504,935,874,218,452,794,565,768,441,684,358],()=>t(2554)),_N_E=e.O()}]);