(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[177],{347:()=>{},1065:(e,t,n)=>{"use strict";n.d(t,{s:()=>l,U:()=>c});var r=n(5155),s=n(2115);let a=JSON.parse('{"hl":"1.0.0","SC":"YOUR_INTERSTITIAL_PLACEMENT_ID","O8":"YOUR_BANNER_PLACEMENT_ID"}'),o={SERVER_URL:(()=>{let e="KR";if("undefined"!=typeof navigator&&navigator.language){let t=navigator.language.split("-");t.length>1&&(e=t[1])}let t="";switch(e.toUpperCase()){case"CA":t="ca.";break;case"AU":t="au.";break;case"GB":t="uk.";break;default:t=""}return console.log("domainPrefix: ",t),console.log("region: ",e),"https://beta.fcde.app"})(),APP_VERSION:a.hl,FACEBOOK_INTERSTITIAL_PLACEMENT_ID:a.SC,FACEBOOK_BANNER_PLACEMENT_ID:a.O8},i=(0,s.createContext)(null),l=e=>{let{children:t}=e;return(0,r.jsx)(i.Provider,{value:o,children:t})},c=()=>{let e=(0,s.useContext)(i);if(!e)throw Error("useConfig must be used within a ConfigProvider");return e}},2066:e=>{e.exports={overlay:"PasswordExpiredModal_overlay__uqqzV",modalContainer:"PasswordExpiredModal_modalContainer__EMm5b",title:"PasswordExpiredModal_title__RQIQd",message:"PasswordExpiredModal_message__4wptN",buttonContainer:"PasswordExpiredModal_buttonContainer__zWDo_",button:"PasswordExpiredModal_button__cbXxj",buttonText:"PasswordExpiredModal_buttonText__L4gMg",closeButton:"PasswordExpiredModal_closeButton__YRj8a",closeText:"PasswordExpiredModal_closeText__7UocI"}},2269:(e,t,n)=>{"use strict";var r=n(9509);n(8375);var s=n(2115),a=function(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}(s),o=void 0!==r&&r.env&&!0,i=function(e){return"[object String]"===Object.prototype.toString.call(e)},l=function(){function e(e){var t=void 0===e?{}:e,n=t.name,r=void 0===n?"stylesheet":n,s=t.optimizeForSpeed,a=void 0===s?o:s;c(i(r),"`name` must be a string"),this._name=r,this._deletedRulePlaceholder="#"+r+"-deleted-rule____{}",c("boolean"==typeof a,"`optimizeForSpeed` must be a boolean"),this._optimizeForSpeed=a,this._serverSheet=void 0,this._tags=[],this._injected=!1,this._rulesCount=0;var l="undefined"!=typeof window&&document.querySelector('meta[property="csp-nonce"]');this._nonce=l?l.getAttribute("content"):null}var t=e.prototype;return t.setOptimizeForSpeed=function(e){c("boolean"==typeof e,"`setOptimizeForSpeed` accepts a boolean"),c(0===this._rulesCount,"optimizeForSpeed cannot be when rules have already been inserted"),this.flush(),this._optimizeForSpeed=e,this.inject()},t.isOptimizeForSpeed=function(){return this._optimizeForSpeed},t.inject=function(){var e=this;if(c(!this._injected,"sheet already injected"),this._injected=!0,"undefined"!=typeof window&&this._optimizeForSpeed){this._tags[0]=this.makeStyleTag(this._name),this._optimizeForSpeed="insertRule"in this.getSheet(),this._optimizeForSpeed||(o||console.warn("StyleSheet: optimizeForSpeed mode not supported falling back to standard mode."),this.flush(),this._injected=!0);return}this._serverSheet={cssRules:[],insertRule:function(t,n){return"number"==typeof n?e._serverSheet.cssRules[n]={cssText:t}:e._serverSheet.cssRules.push({cssText:t}),n},deleteRule:function(t){e._serverSheet.cssRules[t]=null}}},t.getSheetForTag=function(e){if(e.sheet)return e.sheet;for(var t=0;t<document.styleSheets.length;t++)if(document.styleSheets[t].ownerNode===e)return document.styleSheets[t]},t.getSheet=function(){return this.getSheetForTag(this._tags[this._tags.length-1])},t.insertRule=function(e,t){if(c(i(e),"`insertRule` accepts only strings"),"undefined"==typeof window)return"number"!=typeof t&&(t=this._serverSheet.cssRules.length),this._serverSheet.insertRule(e,t),this._rulesCount++;if(this._optimizeForSpeed){var n=this.getSheet();"number"!=typeof t&&(t=n.cssRules.length);try{n.insertRule(e,t)}catch(t){return o||console.warn("StyleSheet: illegal rule: \n\n"+e+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),-1}}else{var r=this._tags[t];this._tags.push(this.makeStyleTag(this._name,e,r))}return this._rulesCount++},t.replaceRule=function(e,t){if(this._optimizeForSpeed||"undefined"==typeof window){var n="undefined"!=typeof window?this.getSheet():this._serverSheet;if(t.trim()||(t=this._deletedRulePlaceholder),!n.cssRules[e])return e;n.deleteRule(e);try{n.insertRule(t,e)}catch(r){o||console.warn("StyleSheet: illegal rule: \n\n"+t+"\n\nSee https://stackoverflow.com/q/20007992 for more info"),n.insertRule(this._deletedRulePlaceholder,e)}}else{var r=this._tags[e];c(r,"old rule at index `"+e+"` not found"),r.textContent=t}return e},t.deleteRule=function(e){if("undefined"==typeof window){this._serverSheet.deleteRule(e);return}if(this._optimizeForSpeed)this.replaceRule(e,"");else{var t=this._tags[e];c(t,"rule at index `"+e+"` not found"),t.parentNode.removeChild(t),this._tags[e]=null}},t.flush=function(){this._injected=!1,this._rulesCount=0,"undefined"!=typeof window?(this._tags.forEach(function(e){return e&&e.parentNode.removeChild(e)}),this._tags=[]):this._serverSheet.cssRules=[]},t.cssRules=function(){var e=this;return"undefined"==typeof window?this._serverSheet.cssRules:this._tags.reduce(function(t,n){return n?t=t.concat(Array.prototype.map.call(e.getSheetForTag(n).cssRules,function(t){return t.cssText===e._deletedRulePlaceholder?null:t})):t.push(null),t},[])},t.makeStyleTag=function(e,t,n){t&&c(i(t),"makeStyleTag accepts only strings as second parameter");var r=document.createElement("style");this._nonce&&r.setAttribute("nonce",this._nonce),r.type="text/css",r.setAttribute("data-"+e,""),t&&r.appendChild(document.createTextNode(t));var s=document.head||document.getElementsByTagName("head")[0];return n?s.insertBefore(r,n):s.appendChild(r),r},function(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}(e.prototype,[{key:"length",get:function(){return this._rulesCount}}]),e}();function c(e,t){if(!e)throw Error("StyleSheet: "+t+".")}var d=function(e){for(var t=5381,n=e.length;n;)t=33*t^e.charCodeAt(--n);return t>>>0},u={};function h(e,t){if(!t)return"jsx-"+e;var n=String(t),r=e+n;return u[r]||(u[r]="jsx-"+d(e+"-"+n)),u[r]}function f(e,t){"undefined"==typeof window&&(t=t.replace(/\/style/gi,"\\/style"));var n=e+t;return u[n]||(u[n]=t.replace(/__jsx-style-dynamic-selector/g,e)),u[n]}var p=function(){function e(e){var t=void 0===e?{}:e,n=t.styleSheet,r=void 0===n?null:n,s=t.optimizeForSpeed,a=void 0!==s&&s;this._sheet=r||new l({name:"styled-jsx",optimizeForSpeed:a}),this._sheet.inject(),r&&"boolean"==typeof a&&(this._sheet.setOptimizeForSpeed(a),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),this._fromServer=void 0,this._indices={},this._instancesCounts={}}var t=e.prototype;return t.add=function(e){var t=this;void 0===this._optimizeForSpeed&&(this._optimizeForSpeed=Array.isArray(e.children),this._sheet.setOptimizeForSpeed(this._optimizeForSpeed),this._optimizeForSpeed=this._sheet.isOptimizeForSpeed()),"undefined"==typeof window||this._fromServer||(this._fromServer=this.selectFromServer(),this._instancesCounts=Object.keys(this._fromServer).reduce(function(e,t){return e[t]=0,e},{}));var n=this.getIdAndRules(e),r=n.styleId,s=n.rules;if(r in this._instancesCounts){this._instancesCounts[r]+=1;return}var a=s.map(function(e){return t._sheet.insertRule(e)}).filter(function(e){return -1!==e});this._indices[r]=a,this._instancesCounts[r]=1},t.remove=function(e){var t=this,n=this.getIdAndRules(e).styleId;if(function(e,t){if(!e)throw Error("StyleSheetRegistry: "+t+".")}(n in this._instancesCounts,"styleId: `"+n+"` not found"),this._instancesCounts[n]-=1,this._instancesCounts[n]<1){var r=this._fromServer&&this._fromServer[n];r?(r.parentNode.removeChild(r),delete this._fromServer[n]):(this._indices[n].forEach(function(e){return t._sheet.deleteRule(e)}),delete this._indices[n]),delete this._instancesCounts[n]}},t.update=function(e,t){this.add(t),this.remove(e)},t.flush=function(){this._sheet.flush(),this._sheet.inject(),this._fromServer=void 0,this._indices={},this._instancesCounts={}},t.cssRules=function(){var e=this,t=this._fromServer?Object.keys(this._fromServer).map(function(t){return[t,e._fromServer[t]]}):[],n=this._sheet.cssRules();return t.concat(Object.keys(this._indices).map(function(t){return[t,e._indices[t].map(function(e){return n[e].cssText}).join(e._optimizeForSpeed?"":"\n")]}).filter(function(e){return!!e[1]}))},t.styles=function(e){var t,n;return t=this.cssRules(),void 0===(n=e)&&(n={}),t.map(function(e){var t=e[0],r=e[1];return a.default.createElement("style",{id:"__"+t,key:"__"+t,nonce:n.nonce?n.nonce:void 0,dangerouslySetInnerHTML:{__html:r}})})},t.getIdAndRules=function(e){var t=e.children,n=e.dynamic,r=e.id;if(n){var s=h(r,n);return{styleId:s,rules:Array.isArray(t)?t.map(function(e){return f(s,e)}):[f(s,t)]}}return{styleId:h(r),rules:Array.isArray(t)?t:[t]}},t.selectFromServer=function(){return Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]')).reduce(function(e,t){return e[t.id.slice(2)]=t,e},{})},e}(),m=s.createContext(null);m.displayName="StyleSheetContext";var _=a.default.useInsertionEffect||a.default.useLayoutEffect,x="undefined"!=typeof window?new p:void 0;function g(e){var t=x||s.useContext(m);return t&&("undefined"==typeof window?t.add(e):_(function(){return t.add(e),function(){t.remove(e)}},[e.id,String(e.dynamic)])),null}g.dynamic=function(e){return e.map(function(e){return h(e[0],e[1])}).join(" ")},t.style=g},2554:(e,t,n)=>{Promise.resolve().then(n.bind(n,3392))},3392:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>N});var r=n(5155),s=n(2115),a=n(1065),o=n(1218),i=n(2533),l=n(3464),c=n(4283),d=n.n(c);let u=e=>{let{children:t}=e,{SERVER_URL:n}=(0,a.U)();class o extends s.Component{static getDerivedStateFromError(e){return{hasError:!0}}componentDidCatch(e,t){if(console.error("Captured Error:",e),!this.errorLogSent){var r;this.errorLogSent=!0,l.A.post("".concat(n,"/api/logs/error"),{errorDetails:{message:e.toString(),stack:null===(r=t.componentStack)||void 0===r?void 0:r.slice(0,150),source:"React Component",timestamp:new Date().toISOString()}}).catch(e=>{console.error("Failed to send error log:",e)})}}render(){return this.state.hasError?(0,r.jsx)("div",{className:d().container,children:(0,r.jsx)("span",{className:d().text,children:"Something went wrong."})}):this.props.children}constructor(e){super(e),this.errorLogSent=!1,this.state={hasError:!1}}}return(0,r.jsx)(o,{children:t})};var h=n(5185),f=n.n(h);let p=e=>{let{visible:t,onRetry:n}=e,{t:s}=(0,o.Bd)();return t?(0,r.jsx)("div",{className:f().overlay,children:(0,r.jsxs)("div",{className:f().container,children:[(0,r.jsx)("h2",{className:f().title,children:s("maintenance.title")}),(0,r.jsx)("p",{className:f().message,children:s("maintenance.message")}),(0,r.jsx)("p",{className:f().support,children:s("maintenance.support_contact",{email:"support@fcde.app"})}),(0,r.jsx)("button",{className:f().button,onClick:n,children:(0,r.jsx)("span",{className:f().buttonText,children:s("maintenance.retry")})})]})}):null};var m=n(2066),_=n.n(m);let x=e=>{let{visible:t,onPressChange:n,onClose:s}=e,{t:a}=(0,o.Bd)();return t?(0,r.jsx)("div",{className:_().overlay,children:(0,r.jsxs)("div",{className:_().modalContainer,children:[(0,r.jsx)("h2",{className:_().title,children:a("password_expired_title")}),(0,r.jsx)("p",{className:_().message,children:a("password_expired_message")}),(0,r.jsx)("div",{className:_().buttonContainer,children:(0,r.jsx)("button",{className:_().button,onClick:n,children:(0,r.jsx)("span",{className:_().buttonText,children:a("change_now")})})}),s&&(0,r.jsx)("button",{className:_().closeButton,onClick:s,children:(0,r.jsx)("span",{className:_().closeText,children:a("close")})})]})}):null};var g=n(7768),v=n(5695),y=n(9137),b=n.n(y),w=n(6874),S=n.n(w);function j(){let e=(0,v.useRouter)(),[t,n]=(0,s.useState)(!1);(0,s.useEffect)(()=>{(async()=>{try{let e=await l.A.get("/authStatus/status",{withCredentials:!0});n(e.data.loggedIn)}catch(e){console.error("Failed to check login status",e),n(!1)}})()},[]);let a=async()=>{try{await l.A.post("/authStatus/logout",{},{withCredentials:!0}),n(!1),e.push("/")}catch(e){console.error("Logout failed",e)}};return(0,r.jsxs)("header",{className:"jsx-77452fca56aa8af3 header",children:[(0,r.jsxs)("nav",{className:"jsx-77452fca56aa8af3 header-nav",children:[(0,r.jsx)(S(),{href:"/",children:(0,r.jsx)("img",{src:"/FacadeWebLogo.png",alt:"Facade Logo",className:"jsx-77452fca56aa8af3 logo"})}),(0,r.jsxs)("div",{className:"jsx-77452fca56aa8af3 nav-links",children:[(0,r.jsx)(S(),{href:"/about",children:(0,r.jsx)("a",{className:"jsx-77452fca56aa8af3 nav-link",children:"About"})}),(0,r.jsx)(S(),{href:"/posts",children:(0,r.jsx)("a",{className:"jsx-77452fca56aa8af3 nav-link",children:"Posts"})}),(0,r.jsx)(S(),{href:"/terms",children:(0,r.jsx)("a",{className:"jsx-77452fca56aa8af3 nav-link",children:"Terms"})}),(0,r.jsx)(S(),{href:"/searchPage",children:(0,r.jsx)("a",{className:"jsx-77452fca56aa8af3 nav-link",children:"Search"})})]}),(0,r.jsx)("div",{className:"jsx-77452fca56aa8af3 action-buttons",children:t?(0,r.jsx)("button",{onClick:a,className:"jsx-77452fca56aa8af3 logout-button",children:"Logout"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(S(),{href:"/login",children:(0,r.jsx)("a",{className:"jsx-77452fca56aa8af3 login-button",children:"Login"})}),(0,r.jsx)(S(),{href:"/signUpForm",children:(0,r.jsx)("a",{className:"jsx-77452fca56aa8af3 signup-button",children:"Sign Up"})})]})})]}),(0,r.jsx)(b(),{id:"77452fca56aa8af3",children:".header-nav.jsx-77452fca56aa8af3{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;-webkit-box-pack:justify;-webkit-justify-content:space-between;-moz-box-pack:justify;-ms-flex-pack:justify;justify-content:space-between;-webkit-box-align:center;-webkit-align-items:center;-moz-box-align:center;-ms-flex-align:center;align-items:center;padding:10px 20px}.logo.jsx-77452fca56aa8af3{width:80px;height:auto}.nav-links.jsx-77452fca56aa8af3{display:-webkit-box;display:-webkit-flex;display:-moz-box;display:-ms-flexbox;display:flex;gap:20px}.nav-link.jsx-77452fca56aa8af3{text-decoration:none;color:inherit;padding:5px 10px;-webkit-border-radius:5px;-moz-border-radius:5px;border-radius:5px;-webkit-transition:background-color.3s ease;-moz-transition:background-color.3s ease;-o-transition:background-color.3s ease;transition:background-color.3s ease}.nav-link.jsx-77452fca56aa8af3:hover{background-color:#f0f0f0}.action-buttons.jsx-77452fca56aa8af3 a.jsx-77452fca56aa8af3,.logout-button.jsx-77452fca56aa8af3{text-decoration:none;margin-left:15px;padding:8px 16px;-webkit-border-radius:25px;-moz-border-radius:25px;border-radius:25px;font-weight:bold;-webkit-transition:-webkit-transform.2s ease,box-shadow.2s ease;-moz-transition:-moz-transform.2s ease,box-shadow.2s ease;-o-transition:-o-transform.2s ease,box-shadow.2s ease;transition:-webkit-transform.2s ease,box-shadow.2s ease;transition:-moz-transform.2s ease,box-shadow.2s ease;transition:-o-transform.2s ease,box-shadow.2s ease;transition:transform.2s ease,box-shadow.2s ease;cursor:pointer;border:none}.action-buttons.jsx-77452fca56aa8af3 a.jsx-77452fca56aa8af3:hover,.logout-button.jsx-77452fca56aa8af3:hover{-webkit-transform:translatey(-2px);-moz-transform:translatey(-2px);-ms-transform:translatey(-2px);-o-transform:translatey(-2px);transform:translatey(-2px);-webkit-box-shadow:0 4px 12px rgba(0,0,0,.1);-moz-box-shadow:0 4px 12px rgba(0,0,0,.1);box-shadow:0 4px 12px rgba(0,0,0,.1)}.login-button.jsx-77452fca56aa8af3{background-color:#0a1045;color:#fff;border:1px solid#0a1045}.login-button.jsx-77452fca56aa8af3:hover{background-color:#0a1045;opacity:.9}.signup-button.jsx-77452fca56aa8af3{background-color:#fff;color:#0a1045;border:1px solid#0a1045}.signup-button.jsx-77452fca56aa8af3:hover{background-color:#f7f7f7}.logout-button.jsx-77452fca56aa8af3{background-color:#fff;color:#0a1045;border:1px solid#0a1045}.logout-button.jsx-77452fca56aa8af3:hover{background-color:#f7f7f7}"})]})}n(347);var k=n(3768),C=n.n(k),E=n(9509);let N=e=>{let{children:t}=e;(0,v.useRouter)();let n=(0,v.usePathname)(),[c,d]=(0,s.useState)(!0),[h,f]=(0,s.useState)(!1),[m,_]=(0,s.useState)(!1),[y,b]=(0,s.useState)(!1),w=(0,s.useRef)(null);(0,s.useRef)(null);let S="https://fcde.app",k=async()=>{try{await fetch("".concat(S,"/health")),f(!1)}catch(e){f(!0)}},N=async()=>{try{let e=E.env.NEXT_PUBLIC_APP_BUILD||"1.0.0",t=localStorage.getItem("userId")||"anonymous",n=await l.A.post("".concat(S,"/api/version/check"),{buildNumber:e,userId:t});if(n.data.deactivationInfo&&n.data.deactivationInfo.isDeactivated){window.location.href="/deactivatedUser";return}n.data.passwordExpired&&(_(!0),b(!0))}catch(e){console.error("Version check error:",e)}},R=async()=>{let e=localStorage.getItem("currentCountry")||"Unknown",t=(()=>{switch(e){case"Canada":return"ca-central-1";case"Australia":return"ap-southeast-2";case"United Kingdom":return"eu-west-2";default:return"ap-northeast-2"}})();return{userId:localStorage.getItem("userId")||"anonymous",deviceInfo:{deviceType:navigator.userAgent,os:navigator.platform,appVersion:E.env.NEXT_PUBLIC_APP_VERSION||"1.0.0"},networkStatus:{isConnected:navigator.onLine,networkType:"Unknown"},locationData:{country:e,region:t},additionalContext:{sessionId:localStorage.getItem("sessionId")||"Unknown"}}},I=async e=>{try{let t=await R();await l.A.post("".concat(S,"/api/logs/error"),{...t,errorDetails:e})}catch(e){console.error("Failed to send error log:",e)}};return(0,s.useEffect)(()=>{let e=e=>{var t;I({message:e.message,stack:e.error?null===(t=e.error.stack)||void 0===t?void 0:t.slice(0,200):"No stack trace",source:"Global",timestamp:new Date().toISOString(),isFatal:!1})};return window.addEventListener("error",e),()=>window.removeEventListener("error",e)},[]),(0,s.useEffect)(()=>{(async()=>{let e=localStorage.getItem("region");if(!e)try{navigator.geolocation?navigator.geolocation.getCurrentPosition(async t=>{let{latitude:n,longitude:r}=t.coords,s=await (0,g.LF)(n,r,S),a=s?s.country:"Unknown";e="Canada"===a?"ca-central-1":"Australia"===a?"ap-southeast-2":"United Kingdom"===a?"eu-west-2":"ap-northeast-2",localStorage.setItem("region",e)},t=>{console.error("Geolocation error:",t),e="ap-northeast-2",localStorage.setItem("region",e)}):(e="ap-northeast-2",localStorage.setItem("region",e))}catch(t){console.error("Error determining region:",t),e="ap-northeast-2",localStorage.setItem("region",e)}l.A.interceptors.request.use(t=>(t.withCredentials=!0,t.headers["x-region"]=e,t))})()},[]),(0,s.useEffect)(()=>{(async()=>{try{await Promise.all([k(),N()])}catch(e){console.error("Initialization error:",e)}finally{d(!1)}})()},[]),(0,s.useEffect)(()=>{let e=()=>{w.current&&clearTimeout(w.current),w.current=setTimeout(()=>{k(),w.current=null},5e3)};return window.addEventListener("online",e),window.addEventListener("offline",()=>f(!0)),()=>{window.removeEventListener("online",e),window.removeEventListener("offline",()=>f(!0))}},[]),(0,r.jsx)("html",{lang:"en",className:C().className,children:(0,r.jsx)("body",{children:(0,r.jsx)(a.s,{children:(0,r.jsx)(u,{children:(0,r.jsxs)(o.xC,{i18n:i.Ay,children:[h&&(0,r.jsx)(p,{visible:h,onRetry:()=>{w.current&&clearTimeout(w.current),w.current=setTimeout(()=>{k(),w.current=null},5e3)}}),y&&(0,r.jsx)(x,{visible:y,onPressChange:()=>{b(!1),window.location.href="/signInLogIn?showChangePasswordModal=true"},onClose:()=>b(!1)}),"/posts"!==n&&(0,r.jsx)(j,{}),(0,r.jsx)("main",{children:t})]})})})})})}},3768:e=>{e.exports={style:{fontFamily:"'pretendard', 'pretendard Fallback'"},className:"__className_a7a14f",variable:"__variable_a7a14f"}},4283:e=>{e.exports={container:"ErrorBoundary_container__bkBqW",text:"ErrorBoundary_text__nbkLF"}},5185:e=>{e.exports={overlay:"MaintenanceModal_overlay__mpQUQ",container:"MaintenanceModal_container__JRIx_",title:"MaintenanceModal_title__Cxtzd",message:"MaintenanceModal_message__9gh38",support:"MaintenanceModal_support__UIsl5",button:"MaintenanceModal_button__STWON",buttonText:"MaintenanceModal_buttonText__TMEvk"}},8375:()=>{},9137:(e,t,n)=>{"use strict";e.exports=n(2269).style}},e=>{var t=t=>e(e.s=t);e.O(0,[181,935,874,464,218,452,533,986,441,684,358],()=>t(2554)),_N_E=e.O()}]);