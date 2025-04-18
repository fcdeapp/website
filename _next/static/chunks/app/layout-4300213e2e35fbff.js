(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7177],{2066:e=>{e.exports={overlay:"PasswordExpiredModal_overlay__uqqzV",modalContainer:"PasswordExpiredModal_modalContainer__EMm5b",title:"PasswordExpiredModal_title__RQIQd",message:"PasswordExpiredModal_message__4wptN",buttonContainer:"PasswordExpiredModal_buttonContainer__zWDo_",button:"PasswordExpiredModal_button__cbXxj",buttonText:"PasswordExpiredModal_buttonText__L4gMg",closeButton:"PasswordExpiredModal_closeButton__YRj8a",closeText:"PasswordExpiredModal_closeText__7UocI"}},3392:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>N});var s=r(95155),n=r(12115),o=r(61065),i=r(91218),a=r(72533),l=r(23464),c=r(94283),d=r.n(c);let u=e=>{let{children:t}=e,{SERVER_URL:r}=(0,o.U)();class i extends n.Component{static getDerivedStateFromError(e){return{hasError:!0}}componentDidCatch(e,t){if(console.error("Captured Error:",e),!this.errorLogSent){var s;this.errorLogSent=!0,l.A.post("".concat(r,"/api/logs/error"),{errorDetails:{message:e.toString(),stack:null===(s=t.componentStack)||void 0===s?void 0:s.slice(0,150),source:"React Component",timestamp:new Date().toISOString()}}).catch(e=>{console.error("Failed to send error log:",e)})}}render(){return this.state.hasError?(0,s.jsx)("div",{className:d().container,children:(0,s.jsx)("span",{className:d().text,children:"Something went wrong."})}):this.props.children}constructor(e){super(e),this.errorLogSent=!1,this.state={hasError:!1}}}return(0,s.jsx)(i,{children:t})};var h=r(55185),f=r.n(h);let p=e=>{let{visible:t,onRetry:r}=e,{t:n}=(0,i.Bd)();return t?(0,s.jsx)("div",{className:f().overlay,children:(0,s.jsxs)("div",{className:f().container,children:[(0,s.jsx)("h2",{className:f().title,children:n("maintenance.title")}),(0,s.jsx)("p",{className:f().message,children:n("maintenance.message")}),(0,s.jsx)("p",{className:f().support,children:n("maintenance.support_contact",{email:"support@fcde.app"})}),(0,s.jsx)("button",{className:f().button,onClick:r,children:(0,s.jsx)("span",{className:f().buttonText,children:n("maintenance.retry")})})]})}):null};var m=r(2066),g=r.n(m);let x=e=>{let{visible:t,onPressChange:r,onClose:n}=e,{t:o}=(0,i.Bd)();return t?(0,s.jsx)("div",{className:g().overlay,children:(0,s.jsxs)("div",{className:g().modalContainer,children:[(0,s.jsx)("h2",{className:g().title,children:o("password_expired_title")}),(0,s.jsx)("p",{className:g().message,children:o("password_expired_message")}),(0,s.jsx)("div",{className:g().buttonContainer,children:(0,s.jsx)("button",{className:g().button,onClick:r,children:(0,s.jsx)("span",{className:g().buttonText,children:o("change_now")})})}),n&&(0,s.jsx)("button",{className:g().closeButton,onClick:n,children:(0,s.jsx)("span",{className:g().closeText,children:o("close")})})]})}):null};var _=r(7768),b=r(35695),y=r(11518),v=r.n(y),w=r(6874),j=r.n(w),S=r(32649);function k(){let e=(0,b.useRouter)(),[t,r]=(0,n.useState)(!1),[o,i]=(0,n.useState)(""),[a,c]=(0,n.useState)(""),[d,u]=(0,n.useState)("");(0,n.useEffect)(()=>{(async()=>{try{let e=await l.A.get("".concat("https://fcde.app","/authStatus/status"),{withCredentials:!0});r(e.data.loggedIn),localStorage.setItem("isLoggedIn",e.data.loggedIn?"true":"false")}catch(e){console.error("Failed to check login status",e),r(!1)}})()},[]),(0,n.useEffect)(()=>{let e=async()=>{try{let e=await l.A.get("".concat("https://fcde.app","/users/me"),{withCredentials:!0}),t=e.data.userId||"";i(t),localStorage.setItem("userId",t),c(e.data.profileImage||""),u(e.data.profileThumbnail||"")}catch(e){console.error("Error fetching user details in header",e)}};t&&e()},[t]);let h=async()=>{try{await l.A.post("".concat("https://fcde.app","/authStatus/logout"),{},{withCredentials:!0}),r(!1),localStorage.setItem("isLoggedIn","false"),e.push("/")}catch(e){console.error("Logout failed",e)}};return(0,s.jsxs)("header",{className:"jsx-ef0c370ec12ed751 header",children:[(0,s.jsxs)("nav",{className:"jsx-ef0c370ec12ed751 header-nav",children:[(0,s.jsx)(j(),{href:"/",children:(0,s.jsx)("img",{src:"/FacadeWebLogo.png",alt:"Facade Logo",className:"jsx-ef0c370ec12ed751 logo"})}),(0,s.jsxs)("div",{className:"jsx-ef0c370ec12ed751 nav-links",children:[(0,s.jsx)(j(),{href:"/about",children:(0,s.jsx)("a",{className:"jsx-ef0c370ec12ed751 nav-link",children:"About"})}),(0,s.jsx)(j(),{href:"/posts",children:(0,s.jsx)("a",{className:"jsx-ef0c370ec12ed751 nav-link",children:"Posts"})}),(0,s.jsx)(j(),{href:"/terms",children:(0,s.jsx)("a",{className:"jsx-ef0c370ec12ed751 nav-link",children:"Terms"})}),(0,s.jsx)(j(),{href:"/searchPage",children:(0,s.jsx)("a",{className:"jsx-ef0c370ec12ed751 nav-link",children:"Search"})})]}),(0,s.jsx)("div",{className:"jsx-ef0c370ec12ed751 action-buttons",children:t?(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("button",{onClick:h,className:"jsx-ef0c370ec12ed751 logout-button",children:"Logout"}),(0,s.jsx)("div",{style:{marginLeft:"10px"},className:"jsx-ef0c370ec12ed751",children:(0,s.jsx)(S.A,{userId:o,profileImage:a||void 0,profileThumbnail:d||void 0,size:48})})]}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(j(),{href:"/login",children:(0,s.jsx)("a",{className:"jsx-ef0c370ec12ed751 login-button",children:"Login"})}),(0,s.jsx)(j(),{href:"/signUpForm",children:(0,s.jsx)("a",{className:"jsx-ef0c370ec12ed751 signup-button",children:"Sign Up"})})]})})]}),(0,s.jsx)(v(),{id:"ef0c370ec12ed751",children:".header-nav.jsx-ef0c370ec12ed751{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;padding:10px 20px}.logo.jsx-ef0c370ec12ed751{width:50px;height:auto;margin:10px 0;-webkit-transition:-webkit-transform.3s ease;-moz-transition:-moz-transform.3s ease;-o-transition:-o-transform.3s ease;transition:-webkit-transform.3s ease;transition:-moz-transform.3s ease;transition:-o-transform.3s ease;transition:transform.3s ease}.logo.jsx-ef0c370ec12ed751:hover{-webkit-transform:scale(1.333);-moz-transform:scale(1.333);-ms-transform:scale(1.333);-o-transform:scale(1.333);transform:scale(1.333)}.nav-links.jsx-ef0c370ec12ed751{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;gap:20px}.nav-link.jsx-ef0c370ec12ed751{text-decoration:none;color:inherit;padding:5px 10px;-webkit-border-radius:5px;-moz-border-radius:5px;border-radius:5px;-webkit-transition:background-color.3s ease;-moz-transition:background-color.3s ease;-o-transition:background-color.3s ease;transition:background-color.3s ease}.nav-link.jsx-ef0c370ec12ed751:hover{background-color:#f0f0f0}.action-buttons.jsx-ef0c370ec12ed751 a.jsx-ef0c370ec12ed751,.logout-button.jsx-ef0c370ec12ed751,.login-button.jsx-ef0c370ec12ed751,.signup-button.jsx-ef0c370ec12ed751{text-decoration:none;margin-left:15px;display:-webkit-inline-box;display:-webkit-inline-flex;display:-moz-inline-box;display:-ms-inline-flexbox;display:inline-flex;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;-webkit-box-pack:center;-webkit-justify-content:center;-moz-box-pack:center;-ms-flex-pack:center;justify-content:center;height:36px;padding:0 16px;-webkit-border-radius:25px;-moz-border-radius:25px;border-radius:25px;font-weight:bold;-webkit-transition:-webkit-transform.2s ease,box-shadow.2s ease;-moz-transition:-moz-transform.2s ease,box-shadow.2s ease;-o-transition:-o-transform.2s ease,box-shadow.2s ease;transition:-webkit-transform.2s ease,box-shadow.2s ease;transition:-moz-transform.2s ease,box-shadow.2s ease;transition:-o-transform.2s ease,box-shadow.2s ease;transition:transform.2s ease,box-shadow.2s ease;cursor:pointer;border:none;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.action-buttons.jsx-ef0c370ec12ed751 a.jsx-ef0c370ec12ed751:hover,.logout-button.jsx-ef0c370ec12ed751:hover,.login-button.jsx-ef0c370ec12ed751:hover,.signup-button.jsx-ef0c370ec12ed751:hover{-webkit-transform:translatey(-2px);-moz-transform:translatey(-2px);-ms-transform:translatey(-2px);-o-transform:translatey(-2px);transform:translatey(-2px);-webkit-box-shadow:0 4px 12px rgba(0,0,0,.1);-moz-box-shadow:0 4px 12px rgba(0,0,0,.1);box-shadow:0 4px 12px rgba(0,0,0,.1)}.login-button.jsx-ef0c370ec12ed751{background-color:#0a1045;color:#fff;border:1px solid#0a1045}.login-button.jsx-ef0c370ec12ed751:hover{background-color:#0a1045;opacity:.9}.signup-button.jsx-ef0c370ec12ed751{background-color:#fff;color:#0a1045;border:1px solid#0a1045}.signup-button.jsx-ef0c370ec12ed751:hover{background-color:#f7f7f7}.logout-button.jsx-ef0c370ec12ed751{background-color:#fff;color:#0a1045;border:1px solid#0a1045;margin-top:4px}.logout-button.jsx-ef0c370ec12ed751:hover{background-color:#f7f7f7}"})]})}r(30347),r(72130);var I=r(13768),C=r.n(I),z=r(49509);let N=e=>{let{children:t}=e;(0,b.useRouter)();let r=(0,b.usePathname)(),[c,d]=(0,n.useState)(!0),[h,f]=(0,n.useState)(!1),[m,g]=(0,n.useState)(!1),[y,v]=(0,n.useState)(!1),w=(0,n.useRef)(null);(0,n.useRef)(null);let j="https://fcde.app",S=async()=>{try{await fetch("".concat(j,"/health")),f(!1)}catch(e){f(!0)}},I=async()=>{try{let e=z.env.NEXT_PUBLIC_APP_BUILD||"1.0.0",t=localStorage.getItem("userId")||"anonymous",r=await l.A.post("".concat(j,"/api/version/check"),{buildNumber:e,userId:t});if(r.data.deactivationInfo&&r.data.deactivationInfo.isDeactivated){window.location.href="/deactivatedUser";return}r.data.passwordExpired&&(g(!0),v(!0))}catch(e){console.error("Version check error:",e)}},N=async()=>{let e=localStorage.getItem("currentCountry")||"Unknown",t=(()=>{switch(e){case"Canada":return"ca-central-1";case"Australia":return"ap-southeast-2";case"United Kingdom":return"eu-west-2";default:return"ap-northeast-2"}})();return{userId:localStorage.getItem("userId")||"anonymous",deviceInfo:{deviceType:navigator.userAgent,os:navigator.platform,appVersion:z.env.NEXT_PUBLIC_APP_VERSION||"1.0.0"},networkStatus:{isConnected:navigator.onLine,networkType:"Unknown"},locationData:{country:e,region:t},additionalContext:{sessionId:localStorage.getItem("sessionId")||"Unknown"}}},F=async e=>{try{let t=await N();await l.A.post("".concat(j,"/api/logs/error"),{...t,errorDetails:e})}catch(e){console.error("Failed to send error log:",e)}};return(0,n.useEffect)(()=>{let e=e=>{var t;F({message:e.message,stack:e.error?null===(t=e.error.stack)||void 0===t?void 0:t.slice(0,200):"No stack trace",source:"Global",timestamp:new Date().toISOString(),isFatal:!1})};return window.addEventListener("error",e),()=>window.removeEventListener("error",e)},[]),(0,n.useEffect)(()=>{(async()=>{let e=localStorage.getItem("region");if(!e)try{navigator.geolocation?navigator.geolocation.getCurrentPosition(async t=>{let{latitude:r,longitude:s}=t.coords,n=await (0,_.LF)(r,s,j),o=n?n.country:"Unknown";e="Canada"===o?"ca-central-1":"Australia"===o?"ap-southeast-2":"United Kingdom"===o?"eu-west-2":"ap-northeast-2",localStorage.setItem("region",e)},t=>{console.error("Geolocation error:",t),e="ap-northeast-2",localStorage.setItem("region",e)}):(e="ap-northeast-2",localStorage.setItem("region",e))}catch(t){console.error("Error determining region:",t),e="ap-northeast-2",localStorage.setItem("region",e)}l.A.interceptors.request.use(t=>(t.withCredentials=!0,t.headers["x-region"]=e,t))})()},[]),(0,n.useEffect)(()=>{(async()=>{try{await Promise.all([S(),I()])}catch(e){console.error("Initialization error:",e)}finally{d(!1)}})()},[]),(0,n.useEffect)(()=>{let e=()=>{w.current&&clearTimeout(w.current),w.current=setTimeout(()=>{S(),w.current=null},5e3)};return window.addEventListener("online",e),window.addEventListener("offline",()=>f(!0)),()=>{window.removeEventListener("online",e),window.removeEventListener("offline",()=>f(!0))}},[]),(0,s.jsx)("html",{lang:"en",className:C().className,children:(0,s.jsx)("body",{children:(0,s.jsx)(o.s,{children:(0,s.jsx)(u,{children:(0,s.jsxs)(i.xC,{i18n:a.Ay,children:[h&&(0,s.jsx)(p,{visible:h,onRetry:()=>{w.current&&clearTimeout(w.current),w.current=setTimeout(()=>{S(),w.current=null},5e3)}}),y&&(0,s.jsx)(x,{visible:y,onPressChange:()=>{v(!1),window.location.href="/signInLogIn?showChangePasswordModal=true"},onClose:()=>v(!1)}),"/posts"!==r&&(0,s.jsx)(k,{}),(0,s.jsx)("main",{children:t})]})})})})})}},11518:(e,t,r)=>{"use strict";e.exports=r(82269).style},11772:e=>{e.exports={container:"ProfileWithFlag_container__fXJUY",profileImage:"ProfileWithFlag_profileImage__kvu3h",gradientBorder:"ProfileWithFlag_gradientBorder__c_Y4a",flagWrapper:"ProfileWithFlag_flagWrapper__C0EJW",flagImage:"ProfileWithFlag_flagImage__mZNJt",spinner:"ProfileWithFlag_spinner__j6Bkl",spin:"ProfileWithFlag_spin__7po5D",modal:"ProfileWithFlag_modal__KzG8T"}},12554:(e,t,r)=>{Promise.resolve().then(r.bind(r,3392))},13768:e=>{e.exports={style:{fontFamily:"'pretendard', 'pretendard Fallback'"},className:"__className_a7a14f",variable:"__variable_a7a14f"}},30347:()=>{},32649:(e,t,r)=>{"use strict";r.d(t,{A:()=>f});var s=r(95155),n=r(12115),o=r(23464),i=r(61065),a=r(35695),l=r(50802),c=r(7926),d=r(11772),u=r.n(d);let h=e=>"string"==typeof e&&""!==e.trim()?e.startsWith("http")||e.startsWith("/assets/")?e:"/assets/".concat(e):"/assets/Annonymous.png",f=e=>{let{userId:t,nickname:r,profileImage:d,profileThumbnail:f,countryName:p,size:m,trustBadge:g}=e,{SERVER_URL:x}=(0,i.U)(),_=(0,a.useRouter)(),[b,y]=(0,n.useState)(f||d||null),[v,w]=(0,n.useState)(p||null),[j,S]=(0,n.useState)(g||!1),[k,I]=(0,n.useState)(!1),[C,z]=(0,n.useState)(null),[N,F]=(0,n.useState)(!1),[R,E]=(0,n.useState)(!1);(0,n.useEffect)(()=>{z(localStorage.getItem("userId"))},[]),(0,n.useEffect)(()=>{let e="true"===localStorage.getItem("isLoggedIn");F(e),p&&(f||d)&&void 0!==g||!t||(async()=>{try{if(I(!0),!e){I(!1);return}let r=await o.A.get("".concat(x,"/users/country?userId=").concat(t));if(200===r.status){let e=r.data;w(e.originCountry),"string"!=typeof e.profileThumbnail&&(e.profileThumbnail=""),"string"!=typeof e.profileImage&&(e.profileImage=""),y(e.profileThumbnail||e.profileImage||""),S(e.trustBadge||!1)}else console.log("Failed to fetch user details")}catch(e){console.error("Error fetching user details:",e)}finally{I(!1)}})()},[p,f,d,g,t,x]);let T=c.X.find(e=>e.name===v),A=T?T.flag:null,P=h(b);return k?(0,s.jsx)("div",{className:u().container,style:{width:m,height:m},children:(0,s.jsx)("div",{className:u().spinner})}):(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)("div",{onClick:()=>{if(!N){E(!0);return}let e={userId:t,nickname:r,profileImage:d||null,profileThumbnail:f||null};t===C?_.push("/myProfile?".concat(new URLSearchParams(e).toString())):_.push("/profile?".concat(new URLSearchParams(e).toString()))},className:u().container,style:{width:m,height:m},children:[j?(0,s.jsx)("div",{className:u().gradientBorder,style:{width:m,height:m,borderRadius:m/2},children:(0,s.jsx)("img",{src:P,alt:"Profile",className:u().profileImage,style:{width:m-4,height:m-4,borderRadius:(m-4)/2}})}):(0,s.jsx)("img",{src:P,alt:"Profile",className:u().profileImage,style:{width:m,height:m,borderRadius:m/2}}),A&&(0,s.jsx)("div",{className:u().flagWrapper,style:{width:m/3+4,height:m/3+4,borderRadius:m/6+2},children:(0,s.jsx)("img",{src:A,alt:"Flag",className:u().flagImage,style:{width:m/3,height:m/3,borderRadius:m/6}})})]}),R&&(0,s.jsx)("div",{className:u().modal,children:(0,s.jsx)(l.A,{visible:!0,onLogin:()=>{E(!1),_.push("/signInLogIn")},onBrowse:()=>E(!1)})})]})}},50802:(e,t,r)=>{"use strict";r.d(t,{A:()=>n});var s=r(95155);r(12115);let n=e=>{let{visible:t,onLogin:r,onBrowse:n}=e;if(!t)return null;let o={backgroundColor:"transparent",padding:"12px 20px",border:"2px solid #0A1045",borderRadius:"30px",cursor:"pointer"},i={...o,borderColor:"#355C7D"},a={color:"#0A1045",fontSize:"16px",fontWeight:700,margin:0};return(0,s.jsx)("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:999,display:"flex",justifyContent:"center",alignItems:"center"},children:(0,s.jsx)("div",{style:{width:"100vw",height:"100vh",background:"linear-gradient(45deg, rgba(0, 0, 0, 0.7), rgba(50, 50, 50, 0.7))",display:"flex",justifyContent:"center",alignItems:"center"},children:(0,s.jsx)("div",{style:{width:"90%",maxWidth:"500px",borderRadius:"30px",overflow:"hidden",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)"},children:(0,s.jsxs)("div",{style:{backgroundColor:"rgba(255, 255, 255, 0.85)",borderRadius:"30px",padding:"30px 25px",textAlign:"center",boxShadow:"0 8px 20px rgba(0, 0, 0, 0.35)"},children:[(0,s.jsx)("h2",{style:{fontSize:"28px",fontWeight:800,color:"#0A1045",marginBottom:"15px"},children:"Welcome to Abrody"}),(0,s.jsx)("p",{style:{fontSize:"16px",color:"#333",marginBottom:"30px",lineHeight:"24px"},children:"To see announcements and recommendations, please log in."}),(0,s.jsxs)("div",{style:{display:"flex",justifyContent:"center",gap:"16px"},children:[(0,s.jsx)("button",{style:o,onClick:r,children:(0,s.jsx)("span",{style:a,children:"Log In"})}),(0,s.jsx)("button",{style:i,onClick:n,children:(0,s.jsx)("span",{style:a,children:"Continue as Guest"})})]})]})})})})}},55185:e=>{e.exports={overlay:"MaintenanceModal_overlay__mpQUQ",container:"MaintenanceModal_container__JRIx_",title:"MaintenanceModal_title__Cxtzd",message:"MaintenanceModal_message__9gh38",support:"MaintenanceModal_support__UIsl5",button:"MaintenanceModal_button__STWON",buttonText:"MaintenanceModal_buttonText__TMEvk"}},68375:()=>{},72130:()=>{},82269:(e,t,r)=>{"use strict";var s=r(49509);r(68375);var n=r(12115),o=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(n),i=void 0!==s&&s.env&&!0,a=function(e){return"[object String]"===Object.prototype.toString.call(e)},l=function(){function e(e){var t=void 0===e?{}:e,r=t.name,s=void 0===r?"stylesheet":r,n=t.optimizeForSpeed,o=void 0===n?i:n;c(a(s),"`name` must be a string"),this._name=s,this._deletedRulePlaceholder="#"+s+"-deleted-rule____{}",c("boolean"==typeof o,"`optimizeForSpeed` must be a boolean"),this._optimizeForSpeed=o,this._serverSheet=void 0,this._tags=[],this._injected=!1,this._rulesCount=0;var l="undefined"!=typeof window&&document.querySelector('meta[property="csp-nonce"]');this._nonce=l?l.getAttribute("content"):null}var t=e.prototype;return t.setOptimizeForSpeed=function(e){c("boolean"==typeof e,"`setOptimizeForSpeed` accepts a boolean"),c(0===this._rulesCount,"optimizeForSpeed cannot be when rules have already been inserted"),this.flush(),this._optimizeForSpeed=e,this.inject()},t.isOptimizeForSpeed=function(){return this._optimizeForSpeed},t.inject=function(){var e=this;if(c(!this._injected,"sheet already injected"),this._injected=!0,"undefined"!=typeof window&&this._optimizeForSpeed){this._tags[0]=this.makeStyleTag(this._name),this._optimizeForSpeed="insertRule"in this.getSheet(),this._optimizeForSpeed||(i||console.warn("StyleSheet: optimizeForSpeed mode not supported falling back to standard mode."),this.flush(),this._injected=!0);return}this._serverSheet={cssRules:[],insertRule:function(t,r){return"number"==typeof r?e._serverSheet.cssRules[r]={cssText:t}:e._serverSheet.cssRules.push({cssText:t}),r},deleteRule:function(t){e._serverSheet.cssRules[t]=null}}},t.getSheetForTag=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]},t.getSheet=function(){return this.getSheetForTag(this._tags[this._tags.length-1])},t.insertRule=function(e,t){if(c(a(e),"`insertRule` accepts only strings"),"undefined"==typeof window)return"number"!=typeof t&&(t=this._serverSheet.cssRules.length),this._serverSheet.insertRule(e,t),this._rulesCount++;if(this._optimizeForSpeed){var r=this.getSheet();"number"!=typeof t&&(t=r.cssRules.length);try{r.insertRule(e,t)}catch(t){return i||console.warn("StyleSheet: illegal rule: \n\n"+e+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),-1}}else{var s=this._tags[t];this._tags.push(this.makeStyleTag(this._name,e,s))}return this._rulesCount++},t.replaceRule=function(e,t){if(this._optimizeForSpeed||"undefined"==typeof window){var r="undefined"!=typeof window?this.getSheet():this._serverSheet;if(t.trim()||(t=this._deletedRulePlaceholder),!r.cssRules[e])return e;r.deleteRule(e);try{r.insertRule(t,e)}catch(s){i||console.warn("StyleSheet: illegal rule: \n\n"+t+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),r.insertRule(this._deletedRulePlaceholder,e)}}else{var s=this._tags[e];c(s,"old rule at index `"+e+"` not found"),s.textContent=t}return e},t.deleteRule=function(e){if("undefined"==typeof window){this._serverSheet.deleteRule(e);return}if(this._optimizeForSpeed)this.replaceRule(e,"");else{var t=this._tags[e];c(t,"rule at index `"+e+"` not found"),t.parentNode.removeChild(t),this._tags[e]=null}},t.flush=function(){this._injected=!1,this._rulesCount=0,"undefined"!=typeof window?(this._tags.forEach(function(e){return e&&e.parentNode.removeChild(e)}),this._tags=[]):this._serverSheet.cssRules=[]},t.cssRules=function(){var e=this;return"undefined"==typeof window?this._serverSheet.cssRules:this._tags.reduce(function(t,r){return r?t=t.concat(Array.prototype.map.call(e.getSheetForTag(r).cssRules,function(t){return t.cssText===e._deletedRulePlaceholder?null:t})):t.push(null),t},[])},t.makeStyleTag=function(e,t,r){t&&c(a(t),"makeStyleTag accepts only strings as second parameter");var s=document.createElement("style");this._nonce&&s.setAttribute("nonce",this._nonce),s.type="text/css",s.setAttribute("data-"+e,""),t&&s.appendChild(document.createTextNode(t));var n=document.head||document.getElementsByTagName("head")[0];return r?n.insertBefore(s,r):n.appendChild(s),s},function(e,t){for(var r=0;r<t.length;r++){var s=t[r];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(e,s.key,s)}}(e.prototype,[{key:"length",get:function(){return this._rulesCount}}]),e}();function c(e,t){if(!e)throw Error("StyleSheet: "+t+".")}var d=function(e){for(var t=5381,r=e.length;r;)t=33*t^e.charCodeAt(--r);return t>>>0},u={};function h(e,t){if(!t)return"jsx-"+e;var r=String(t),s=e+r;return u[s]||(u[s]="jsx-"+d(e+"-"+r)),u[s]}function f(e,t){"undefined"==typeof window&&(t=t.replace(/\/style/gi,"\\/style"));var r=e+t;return u[r]||(u[r]=t.replace(/__jsx-style-dynamic-selector/g,e)),u[r]}var p=function(){function e(e){var t=void 0===e?{}:e,r=t.styleSheet,s=void 0===r?null:r,n=t.optimizeForSpeed,o=void 0!==n&&n;this._sheet=s||new l({name:"styled-jsx",optimizeForSpeed:o}),this._sheet.inject(),s&&"boolean"==typeof o&&(this._sheet.setOptimizeForSpeed(o),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),this._fromServer=void 0,this._indices={},this._instancesCounts={}}var t=e.prototype;return t.add=function(e){var t=this;void 0===this._optimizeForSpeed&&(this._optimizeForSpeed=Array.isArray(e.children),this._sheet.setOptimizeForSpeed(this._optimizeForSpeed),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),"undefined"==typeof window||this._fromServer||(this._fromServer=this.selectFromServer(),this._instancesCounts=Object.keys(this._fromServer).reduce(function(e,t){return e[t]=0,e},{}));var r=this.getIdAndRules(e),s=r.styleId,n=r.rules;if(s in this._instancesCounts){this._instancesCounts[s]+=1;return}var o=n.map(function(e){return t._sheet.insertRule(e)}).filter(function(e){return -1!==e});this._indices[s]=o,this._instancesCounts[s]=1},t.remove=function(e){var t=this,r=this.getIdAndRules(e).styleId;if(function(e,t){if(!e)throw Error("StyleSheetRegistry: "+t+".")}(r in this._instancesCounts,"styleId: `"+r+"` not found"),this._instancesCounts[r]-=1,this._instancesCounts[r]<1){var s=this._fromServer&&this._fromServer[r];s?(s.parentNode.removeChild(s),delete this._fromServer[r]):(this._indices[r].forEach(function(e){return t._sheet.deleteRule(e)}),delete this._indices[r]),delete this._instancesCounts[r]}},t.update=function(e,t){this.add(t),this.remove(e)},t.flush=function(){this._sheet.flush(),this._sheet.inject(),this._fromServer=void 0,this._indices={},this._instancesCounts={}},t.cssRules=function(){var e=this,t=this._fromServer?Object.keys(this._fromServer).map(function(t){return[t,e._fromServer[t]]}):[],r=this._sheet.cssRules();return t.concat(Object.keys(this._indices).map(function(t){return[t,e._indices[t].map(function(e){return r[e].cssText}).join(e._optimizeForSpeed?"":"\n")]}).filter(function(e){return!!e[1]}))},t.styles=function(e){var t,r;return t=this.cssRules(),void 0===(r=e)&&(r={}),t.map(function(e){var t=e[0],s=e[1];return o.default.createElement("style",{id:"__"+t,key:"__"+t,nonce:r.nonce?r.nonce:void 0,dangerouslySetInnerHTML:{__html:s}})})},t.getIdAndRules=function(e){var t=e.children,r=e.dynamic,s=e.id;if(r){var n=h(s,r);return{styleId:n,rules:Array.isArray(t)?t.map(function(e){return f(n,e)}):[f(n,t)]}}return{styleId:h(s),rules:Array.isArray(t)?t:[t]}},t.selectFromServer=function(){return Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]')).reduce(function(e,t){return e[t.id.slice(2)]=t,e},{})},e}(),m=n.createContext(null);m.displayName="StyleSheetContext";var g=o.default.useInsertionEffect||o.default.useLayoutEffect,x="undefined"!=typeof window?new p:void 0;function _(e){var t=x||n.useContext(m);return t&&("undefined"==typeof window?t.add(e):g(function(){return t.add(e),function(){t.remove(e)}},[e.id,String(e.dynamic)])),null}_.dynamic=function(e){return e.map(function(e){return h(e[0],e[1])}).join(" ")},t.style=_},94283:e=>{e.exports={container:"ErrorBoundary_container__bkBqW",text:"ErrorBoundary_text__nbkLF"}}},e=>{var t=t=>e(e.s=t);e.O(0,[6743,2521,4935,3464,6874,1218,2452,8082,2533,3986,8441,1684,7358],()=>t(12554)),_N_E=e.O()}]);