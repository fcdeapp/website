(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[362],{397:e=>{e.exports={overlay:"Licenses_overlay__UcZSv",modalContent:"Licenses_modalContent__Bq1I3",header:"Licenses_header__1g1fA",pickerContainer:"Licenses_pickerContainer__Bx4QL",picker:"Licenses_picker__th3C_",closeButton:"Licenses_closeButton__yZ2E0",closeButtonText:"Licenses_closeButtonText__a53zz",loadingContainer:"Licenses_loadingContainer__b4z3m",spinner:"Licenses_spinner__jcIlC",spin:"Licenses_spin__cXu_I",scrollContent:"Licenses_scrollContent__oMBUW",licenseItem:"Licenses_licenseItem__otTs6",libraryName:"Licenses_libraryName__P66Kp",licenseType:"Licenses_licenseType__yy7WB",licenseDetails:"Licenses_licenseDetails__JSJyc",noDataText:"Licenses_noDataText__cjo77"}},802:(e,s,i)=>{"use strict";i.d(s,{A:()=>t});var n=i(5155);i(2115);let t=e=>{let{visible:s,onLogin:i,onBrowse:t}=e;if(!s)return null;let l={backgroundColor:"transparent",padding:"12px 20px",border:"2px solid #0A1045",borderRadius:"30px",cursor:"pointer"},r={...l,borderColor:"#355C7D"},o={color:"#0A1045",fontSize:"16px",fontWeight:700,margin:0};return(0,n.jsx)("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:999,display:"flex",justifyContent:"center",alignItems:"center"},children:(0,n.jsx)("div",{style:{width:"100vw",height:"100vh",background:"linear-gradient(45deg, rgba(0, 0, 0, 0.7), rgba(50, 50, 50, 0.7))",display:"flex",justifyContent:"center",alignItems:"center"},children:(0,n.jsx)("div",{style:{width:"90%",maxWidth:"500px",borderRadius:"30px",overflow:"hidden",backdropFilter:"blur(10px)",WebkitBackdropFilter:"blur(10px)"},children:(0,n.jsxs)("div",{style:{backgroundColor:"rgba(255, 255, 255, 0.85)",borderRadius:"30px",padding:"30px 25px",textAlign:"center",boxShadow:"0 8px 20px rgba(0, 0, 0, 0.35)"},children:[(0,n.jsx)("h2",{style:{fontSize:"28px",fontWeight:800,color:"#0A1045",marginBottom:"15px"},children:"Welcome to Facade"}),(0,n.jsx)("p",{style:{fontSize:"16px",color:"#333",marginBottom:"30px",lineHeight:"24px"},children:"To see announcements and recommendations, please log in."}),(0,n.jsxs)("div",{style:{display:"flex",justifyContent:"center",gap:"16px"},children:[(0,n.jsx)("button",{style:l,onClick:i,children:(0,n.jsx)("span",{style:o,children:"Log In"})}),(0,n.jsx)("button",{style:r,onClick:t,children:(0,n.jsx)("span",{style:o,children:"Continue as Guest"})})]})]})})})})}},1336:e=>{e.exports={container:"MyProfile_container__55BMO",header:"MyProfile_header__f1sEC",backButton:"MyProfile_backButton___PnGi",headerTitle:"MyProfile_headerTitle__4LNy7",logoutButton:"MyProfile_logoutButton__HedHP",main:"MyProfile_main__cnAPJ",fadeInContent:"MyProfile_fadeInContent__7PWYd",profileSection:"MyProfile_profileSection__wb4Qr",profileInfo:"MyProfile_profileInfo__X1ML4",nickname:"MyProfile_nickname__hCAE2",trustBadge:"MyProfile_trustBadge___BkYL",infoSections:"MyProfile_infoSections__i3Tml",infoSection:"MyProfile_infoSection__HxKfX",infoTitle:"MyProfile_infoTitle__cixnn",infoText:"MyProfile_infoText__DLPYB",quickMenu:"MyProfile_quickMenu__0JB1o",quickMenuButton:"MyProfile_quickMenuButton__3UwXa",licensesButton:"MyProfile_licensesButton__U37GZ",date:"MyProfile_date__X5GkN",email:"MyProfile_email__eMElC",content:"MyProfile_content__reWlf",select:"MyProfile_select__dE7tm",selectLabel:"MyProfile_selectLabel__dOXxi"}},1772:e=>{e.exports={container:"ProfileWithFlag_container__fXJUY",profileImage:"ProfileWithFlag_profileImage__kvu3h",gradientBorder:"ProfileWithFlag_gradientBorder__c_Y4a",flagWrapper:"ProfileWithFlag_flagWrapper__C0EJW",flagImage:"ProfileWithFlag_flagImage__mZNJt",spinner:"ProfileWithFlag_spinner__j6Bkl",spin:"ProfileWithFlag_spin__7po5D",modal:"ProfileWithFlag_modal__KzG8T"}},2649:(e,s,i)=>{"use strict";i.d(s,{A:()=>u});var n=i(5155),t=i(2115),l=i(3464),r=i(1065),o=i(5695),a=i(802),c=i(7926),d=i(1772),h=i.n(d);let f=e=>"string"==typeof e&&""!==e.trim()?e.startsWith("http")||e.startsWith("/assets/")?e:"/assets/".concat(e):"/assets/Annonymous.png",u=e=>{let{userId:s,nickname:i,profileImage:d,profileThumbnail:u,countryName:_,size:m,trustBadge:x}=e,{SERVER_URL:p}=(0,r.U)(),g=(0,o.useRouter)(),[j,y]=(0,t.useState)(u||d||null),[N,b]=(0,t.useState)(_||null),[v,k]=(0,t.useState)(x||!1),[T,S]=(0,t.useState)(!1),[C,B]=(0,t.useState)(null),[I,P]=(0,t.useState)(!1),[w,L]=(0,t.useState)(!1);(0,t.useEffect)(()=>{B(localStorage.getItem("userId"))},[]),(0,t.useEffect)(()=>{_&&(u||d)&&void 0!==x||!s||(async()=>{try{S(!0);let e=localStorage.getItem("token");if(!e){S(!1);return}let i=await l.A.get("".concat(p,"/users/country?userId=").concat(s),{headers:{Authorization:"Bearer ".concat(e)}});if(200===i.status){let e=i.data;b(e.originCountry),"string"!=typeof e.profileThumbnail&&(e.profileThumbnail=""),"string"!=typeof e.profileImage&&(e.profileImage=""),y(e.profileThumbnail||e.profileImage||""),k(e.trustBadge||!1)}else console.log("Failed to fetch user details")}catch(e){console.error("Error fetching user details:",e)}finally{S(!1)}})()},[_,u,d,x,s,p]);let M=c.X.find(e=>e.name===N),W=M?M.flag:null,F=f(j);return((0,t.useEffect)(()=>{P(!!localStorage.getItem("token"))},[]),T)?(0,n.jsx)("div",{className:h().container,style:{width:m,height:m},children:(0,n.jsx)("div",{className:h().spinner})}):(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)("div",{onClick:()=>{if(!I){L(!0);return}let e={userId:s,nickname:i,profileImage:d||null,profileThumbnail:u||null};s===C?g.push("/myProfile?".concat(new URLSearchParams(e).toString())):g.push("/profile?".concat(new URLSearchParams(e).toString()))},className:h().container,style:{width:m,height:m},children:[v?(0,n.jsx)("div",{className:h().gradientBorder,style:{width:m,height:m,borderRadius:m/2},children:(0,n.jsx)("img",{src:F,alt:"Profile",className:h().profileImage,style:{width:m-4,height:m-4,borderRadius:(m-4)/2}})}):(0,n.jsx)("img",{src:F,alt:"Profile",className:h().profileImage,style:{width:m,height:m,borderRadius:m/2}}),W&&(0,n.jsx)("div",{className:h().flagWrapper,style:{width:m/3+4,height:m/3+4,borderRadius:m/6+2},children:(0,n.jsx)("img",{src:W,alt:"Flag",className:h().flagImage,style:{width:m/3,height:m/3,borderRadius:m/6}})})]}),w&&(0,n.jsx)("div",{className:h().modal,children:(0,n.jsx)(a.A,{visible:!0,onLogin:()=>{L(!1),g.push("/signInLogIn")},onBrowse:()=>L(!1)})})]})}},3582:e=>{e.exports={footer:"WebFooter_footer__2WnVU",footerContainer:"WebFooter_footerContainer__YBtb1",footerSection:"WebFooter_footerSection__nWzpG",footerTitle:"WebFooter_footerTitle__JXcRN",footerText:"WebFooter_footerText__A_iHN",footerLinks:"WebFooter_footerLinks__3TS2Z",socialIcons:"WebFooter_socialIcons__dEzrQ",footerBottom:"WebFooter_footerBottom__SM7KX"}},4129:(e,s,i)=>{Promise.resolve().then(i.bind(i,4636))},4636:(e,s,i)=>{"use strict";i.r(s),i.d(s,{default:()=>x});var n=i(5155),t=i(2115),l=i(6766),r=i(5695),o=i(3464),a=i(1065),c=i(1218),d=i(2649),h=i(9707),f=i(7200),u=i(1336),_=i.n(u);let m=[{title:"My Posts",route:"/my-posts"},{title:"Manage Buddies",route:"/buddy-list"},{title:"Manage Friends",route:"/friend-list"},{title:"Settings",route:"/settings"}],x=()=>{var e,s,i;let{SERVER_URL:u}=(0,a.U)(),{t:x}=(0,c.Bd)(),p=(0,r.useRouter)(),[g,j]=(0,t.useState)(null),[y,N]=(0,t.useState)(!0),[b,v]=(0,t.useState)(!1),k="true"===localStorage.getItem("isLoggedIn");(0,t.useEffect)(()=>{(async()=>{try{if(!k){p.push("/login");return}let e=await o.A.get("".concat(u,"/users/me"),{withCredentials:!0});j(e.data)}catch(e){console.error("Error fetching user data:",e)}finally{N(!1)}})()},[u,p]);let T=async()=>{try{await o.A.post("".concat(u,"/authStatus/logout"),{},{withCredentials:!0}),localStorage.removeItem("isLoggedIn"),p.push("/login")}catch(e){console.error("Logout failed",e)}};return y?(0,n.jsx)("div",{className:_().loadingContainer,children:(0,n.jsx)("p",{children:x("loading_profile")})}):g?(0,n.jsxs)("div",{className:_().container,children:[(0,n.jsxs)("header",{className:_().header,children:[(0,n.jsx)("button",{className:_().backButton,onClick:()=>p.back(),children:"←"}),(0,n.jsx)("h1",{className:_().headerTitle,children:x("my_profile")}),(0,n.jsx)("button",{className:_().logoutButton,onClick:T,children:x("logout")})]}),(0,n.jsxs)("main",{className:_().main,children:[(0,n.jsxs)("div",{className:_().profileSection,children:[(0,n.jsx)(d.A,{userId:null!==(e=g.userId)&&void 0!==e?e:"",profileImage:null!==(s=g.profileImage)&&void 0!==s?s:void 0,profileThumbnail:null!==(i=g.profileThumbnail)&&void 0!==i?i:void 0,size:120}),(0,n.jsxs)("div",{className:_().profileInfo,children:[(0,n.jsx)("h2",{className:_().nickname,children:g.nickname||x("set_nickname")}),g.trustBadge&&(0,n.jsx)("div",{className:_().trustBadge,children:(0,n.jsx)(l.default,{src:"assets/TrustBadge.png",alt:"Trust Badge",width:24,height:24})})]})]}),(0,n.jsxs)("div",{className:_().infoSections,children:[(0,n.jsxs)("div",{className:_().infoSection,children:[(0,n.jsx)("h3",{className:_().infoTitle,children:x("origin_country")}),(0,n.jsx)("p",{className:_().infoText,children:g.originCountry||x("unknown")})]}),(0,n.jsxs)("div",{className:_().infoSection,children:[(0,n.jsx)("h3",{className:_().infoTitle,children:x("main_language")}),(0,n.jsx)("p",{className:_().infoText,children:g.mainLanguage||x("unknown")})]}),(0,n.jsxs)("div",{className:_().infoSection,children:[(0,n.jsx)("h3",{className:_().infoTitle,children:x("current_country")}),(0,n.jsx)("p",{className:_().infoText,children:g.currentCountry||x("unknown")})]}),(0,n.jsxs)("div",{className:_().infoSection,children:[(0,n.jsx)("h3",{className:_().infoTitle,children:x("current_city")}),(0,n.jsx)("p",{className:_().infoText,children:g.currentCity||x("unknown")})]}),(0,n.jsxs)("div",{className:_().infoSection,children:[(0,n.jsx)("h3",{className:_().infoTitle,children:x("learning_languages")}),(0,n.jsx)("p",{className:_().infoText,children:g.learningLanguage&&g.learningLanguage.join(", ")||x("none")})]}),(0,n.jsxs)("div",{className:_().infoSection,children:[(0,n.jsx)("h3",{className:_().infoTitle,children:x("hobbies_title")}),(0,n.jsx)("p",{className:_().infoText,children:g.hobbies&&g.hobbies.join(", ")||x("none")})]}),(0,n.jsxs)("div",{className:_().infoSection,children:[(0,n.jsx)("h3",{className:_().infoTitle,children:x("skills_title")}),(0,n.jsx)("p",{className:_().infoText,children:g.skills&&g.skills.join(", ")||x("none")})]}),(0,n.jsxs)("div",{className:_().infoSection,children:[(0,n.jsx)("h3",{className:_().infoTitle,children:x("description")}),(0,n.jsx)("p",{className:_().infoText,children:g.description||x("no_description")})]})]}),(0,n.jsx)("div",{className:_().quickMenu,children:m.map((e,s)=>(0,n.jsx)("button",{className:_().quickMenuButton,onClick:()=>p.push(e.route),children:e.title},s))}),(0,n.jsx)("button",{className:_().licensesButton,onClick:()=>v(!0),children:x("view_licenses")})]}),(0,n.jsx)(h.A,{}),b&&(0,n.jsx)(f.A,{onClose:()=>v(!1)})]}):(0,n.jsx)("div",{className:_().error,children:(0,n.jsx)("p",{children:x("error_loading_profile")})})}},7200:(e,s,i)=>{"use strict";i.d(s,{A:()=>d});var n=i(5155),t=i(2115),l=i(1065),r=i(1218),o=i(3464),a=i(397),c=i.n(a);let d=e=>{let{onClose:s}=e,{SERVER_URL:i}=(0,l.U)(),{t:a}=(0,r.Bd)(),[d,h]=(0,t.useState)({frontend:[],backend:[],resources:[],apis:[]}),[f,u]=(0,t.useState)(!0),[_,m]=(0,t.useState)("frontend");(0,t.useEffect)(()=>{(async()=>{try{console.log("Fetching licenses from:","".concat(i,"/api/licenses"));let e=await o.A.get("".concat(i,"/api/licenses"));console.log("Licenses received:",e.data),h(e.data)}catch(e){console.error("Error fetching licenses:",e),window.alert(a("error")+": "+a("failed_to_load_licenses"))}finally{u(!1)}})()},[i,a]);let x=d[_];return(0,n.jsx)("div",{className:c().overlay,children:(0,n.jsxs)("div",{className:c().modalContent,children:[(0,n.jsxs)("div",{className:c().header,children:[(0,n.jsx)("div",{className:c().pickerContainer,children:(0,n.jsxs)("select",{className:c().picker,value:_,onChange:e=>m(e.target.value),children:[(0,n.jsx)("option",{value:"frontend",children:a("frontend")}),(0,n.jsx)("option",{value:"backend",children:a("backend")}),(0,n.jsx)("option",{value:"resources",children:a("resources")}),(0,n.jsx)("option",{value:"apis",children:a("external_apis")})]})}),(0,n.jsx)("button",{className:c().closeButton,onClick:s,children:a("close")})]}),f?(0,n.jsx)("div",{className:c().loadingContainer,children:(0,n.jsx)("div",{className:c().spinner})}):(0,n.jsx)("div",{className:c().scrollContent,children:x.map((e,s)=>(0,n.jsxs)("div",{className:c().licenseItem,children:[(0,n.jsx)("p",{className:c().libraryName,children:e.name}),e.version&&(0,n.jsxs)("p",{className:c().licenseType,children:[a("version"),": ",e.version]}),e.license&&(0,n.jsxs)("p",{className:c().licenseType,children:[a("license"),": ",e.license]}),e.details&&(0,n.jsx)("p",{className:c().licenseDetails,children:e.details.startsWith("http")?(0,n.jsx)("a",{href:e.details,target:"_blank",rel:"noopener noreferrer",style:{color:"blue"},children:e.details}):e.details}),e.type&&(0,n.jsxs)("p",{className:c().licenseType,children:[a("type"),": ",e.type]}),e.description&&(0,n.jsx)("p",{className:c().licenseDetails,children:e.description}),e.purpose&&(0,n.jsxs)("p",{className:c().licenseType,children:[a("purpose"),": ",e.purpose]}),e.url&&(0,n.jsx)("p",{className:c().licenseDetails,children:(0,n.jsx)("a",{href:e.url,target:"_blank",rel:"noopener noreferrer",style:{color:"blue"},children:e.url})}),e.note&&(0,n.jsx)("p",{className:c().licenseDetails,children:e.note})]},s))})]})})}},9707:(e,s,i)=>{"use strict";i.d(s,{A:()=>a});var n=i(5155),t=i(6874),l=i.n(t),r=i(3582),o=i.n(r);function a(){let e=e=>{localStorage.setItem("termsType",e)};return(0,n.jsxs)("footer",{className:o().footer,children:[(0,n.jsxs)("div",{className:o().footerContainer,children:[(0,n.jsxs)("div",{className:o().footerSection,children:[(0,n.jsx)("h3",{className:o().footerTitle,children:"About Facade"}),(0,n.jsx)("p",{className:o().footerText,children:"Facade is dedicated to connecting international minds through cultural exchange and real events. Join our community and explore a world of possibilities."})]}),(0,n.jsxs)("div",{className:o().footerSection,children:[(0,n.jsx)("h3",{className:o().footerTitle,children:"Quick Links"}),(0,n.jsxs)("ul",{className:o().footerLinks,children:[(0,n.jsx)("li",{children:(0,n.jsx)(l(),{href:"/about",children:(0,n.jsx)("a",{children:"About Us"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(l(),{href:"/contact",children:(0,n.jsx)("a",{children:"Contact"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(l(),{href:"/faq",children:(0,n.jsx)("a",{children:"FAQ"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(l(),{href:"/terms",children:(0,n.jsx)("a",{onClick:()=>e("service"),children:"Terms of Service"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(l(),{href:"/terms",children:(0,n.jsx)("a",{onClick:()=>e("privacy"),children:"Privacy Policy"})})})]})]}),(0,n.jsxs)("div",{className:o().footerSection,children:[(0,n.jsx)("h3",{className:o().footerTitle,children:"Follow Us"}),(0,n.jsxs)("div",{className:o().socialIcons,children:[(0,n.jsx)("a",{href:"https://twitter.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/twitter.png",alt:"Twitter"})}),(0,n.jsx)("a",{href:"https://facebook.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/facebook.png",alt:"Facebook"})}),(0,n.jsx)("a",{href:"https://instagram.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/instagram.png",alt:"Instagram"})}),(0,n.jsx)("a",{href:"https://www.tiktok.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/tiktok.png",alt:"TikTok"})}),(0,n.jsx)("a",{href:"https://www.youtube.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/youtube.png",alt:"YouTube"})})]})]})]}),(0,n.jsx)("div",{className:o().footerBottom,children:(0,n.jsxs)("p",{children:["\xa9 ",new Date().getFullYear()," Facade. All rights reserved."]})})]})}}},e=>{var s=s=>e(e.s=s);e.O(0,[434,874,464,218,212,82,441,684,358],()=>s(4129)),_N_E=e.O()}]);