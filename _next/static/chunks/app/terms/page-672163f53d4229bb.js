(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[66],{397:e=>{e.exports={overlay:"Licenses_overlay__UcZSv",modalContent:"Licenses_modalContent__Bq1I3",header:"Licenses_header__1g1fA",pickerContainer:"Licenses_pickerContainer__Bx4QL",picker:"Licenses_picker__th3C_",closeButton:"Licenses_closeButton__yZ2E0",closeButtonText:"Licenses_closeButtonText__a53zz",loadingContainer:"Licenses_loadingContainer__b4z3m",spinner:"Licenses_spinner__jcIlC",spin:"Licenses_spin__cXu_I",scrollContent:"Licenses_scrollContent__oMBUW",licenseItem:"Licenses_licenseItem__otTs6",libraryName:"Licenses_libraryName__P66Kp",licenseType:"Licenses_licenseType__yy7WB",licenseDetails:"Licenses_licenseDetails__JSJyc",noDataText:"Licenses_noDataText__cjo77"}},1065:(e,s,n)=>{"use strict";n.d(s,{s:()=>c,U:()=>i});var r=n(5155),t=n(2115);let l=JSON.parse('{"hl":"1.0.0","SC":"YOUR_INTERSTITIAL_PLACEMENT_ID","O8":"YOUR_BANNER_PLACEMENT_ID"}'),a={SERVER_URL:(()=>{let e="KR";if("undefined"!=typeof navigator&&navigator.language){let s=navigator.language.split("-");s.length>1&&(e=s[1])}let s="";switch(e.toUpperCase()){case"CA":s="ca.";break;case"AU":s="au.";break;case"GB":s="uk.";break;default:s=""}return console.log("domainPrefix: ",s),console.log("region: ",e),"https://beta.fcde.app"})(),APP_VERSION:l.hl,FACEBOOK_INTERSTITIAL_PLACEMENT_ID:l.SC,FACEBOOK_BANNER_PLACEMENT_ID:l.O8},o=(0,t.createContext)(null),c=e=>{let{children:s}=e;return(0,r.jsx)(o.Provider,{value:a,children:s})},i=()=>{let e=(0,t.useContext)(o);if(!e)throw Error("useConfig must be used within a ConfigProvider");return e}},3582:e=>{e.exports={footer:"WebFooter_footer__2WnVU",footerContainer:"WebFooter_footerContainer__YBtb1",footerSection:"WebFooter_footerSection__nWzpG",footerTitle:"WebFooter_footerTitle__JXcRN",footerText:"WebFooter_footerText__A_iHN",footerLinks:"WebFooter_footerLinks__3TS2Z",socialIcons:"WebFooter_socialIcons__dEzrQ",footerBottom:"WebFooter_footerBottom__SM7KX"}},4053:(e,s,n)=>{Promise.resolve().then(n.bind(n,7036))},4248:e=>{e.exports={container:"Terms_container___nM20",header:"Terms_header__eNurL",slideDown:"Terms_slideDown__VtaGq",title:"Terms_title__f2bmc",controls:"Terms_controls__WsqyM",selectWrapper:"Terms_selectWrapper__Xg5OR",selectLabel:"Terms_selectLabel__fhEBd",select:"Terms_select__YnqRB",main:"Terms_main__DIzFV",fadeInContent:"Terms_fadeInContent__1PMRL",content:"Terms_content__eJS8s",firstLine:"Terms_firstLine__Xflk_",listLine:"Terms_listLine__ck6wz",bodyText:"Terms_bodyText__ffsxn",date:"Terms_date__eVn66",email:"Terms_email__pRG1d",licensesButton:"Terms_licensesButton__7vxDr",footer:"Terms_footer__FDANY",slideUp:"Terms_slideUp__6hbSR"}},7036:(e,s,n)=>{"use strict";n.r(s),n.d(s,{default:()=>_});var r=n(5155),t=n(2115),l=n(4248),a=n.n(l),o=n(9707),c=n(7200);let i=[{code:"ar",label:"Arabic"},{code:"de",label:"German"},{code:"en",label:"English"},{code:"es",label:"Spanish"},{code:"fr",label:"French"},{code:"hi",label:"Hindi"},{code:"it",label:"Italian"},{code:"ja",label:"Japanese"},{code:"ko",label:"Korean"},{code:"pt",label:"Portuguese"},{code:"ru",label:"Russian"},{code:"zh",label:"Chinese"}],d=e=>e.split(/\r?\n/).map((e,s)=>{let n="";return(n=(n=0===s?'<span class="'.concat(a().firstLine,'">').concat(e,"</span>"):/^\d+\.\s+/.test(e)?'<span class="'.concat(a().listLine,'">').concat(e,"</span>"):'<span class="'.concat(a().bodyText,'">').concat(e,"</span>")).replace(/(\d{4}-\d{2}-\d{2})/g,'<span class="'.concat(a().date,'">$1</span>'))).replace(/([\w\.-]+@[\w\.-]+\.[A-Za-z]{2,6})/g,'<span class="'.concat(a().email,'">$1</span>'))}).join("<br/>");function _(){let[e,s]=(0,t.useState)(""),[n,l]=(0,t.useState)(""),[_,h]=(0,t.useState)(!1),[m,p]=(0,t.useState)("en"),[u,x]=(0,t.useState)("privacy"),[f,j]=(0,t.useState)(!1);(0,t.useEffect)(()=>{{let e=localStorage.getItem("termsType");e&&(x(e),localStorage.removeItem("termsType"))}},[]);let b=async(e,n)=>{h(!0);try{let r=await fetch("".concat("https://fcde.app","/api/terms/").concat(n,"/").concat(e));if(!r.ok)throw Error("Failed to load terms");let t=await r.json();s(t.content)}catch(e){console.error("Error fetching terms:",e)}finally{h(!1)}};return(0,t.useEffect)(()=>{b(m,u)},[m,u]),(0,t.useEffect)(()=>{l(d(e))},[e]),(0,r.jsxs)("div",{className:a().container,children:[(0,r.jsxs)("header",{className:a().header,children:[(0,r.jsx)("h1",{className:a().title,children:"service"===u?"ko"!==m?"Terms of Service":"서비스 이용약관":"privacy"===u?"ko"!==m?"Privacy Policy":"개인정보처리방침":"ko"!==m?"Community Guidelines":"커뮤니티 이용약관"}),(0,r.jsxs)("div",{className:a().controls,children:[(0,r.jsxs)("div",{className:a().selectWrapper,children:[(0,r.jsx)("label",{htmlFor:"termsType",className:a().selectLabel,children:"Type"}),(0,r.jsxs)("select",{id:"termsType",className:a().select,value:u,onChange:e=>{x(e.target.value)},children:[(0,r.jsx)("option",{value:"service",children:"ko"!==m?"Terms of Service":"서비스 이용약관"}),(0,r.jsx)("option",{value:"privacy",children:"ko"!==m?"Privacy Policy":"개인정보처리방침"}),(0,r.jsx)("option",{value:"community",children:"ko"!==m?"Community Guidelines":"커뮤니티 이용약관"})]})]}),(0,r.jsxs)("div",{className:a().selectWrapper,children:[(0,r.jsx)("label",{htmlFor:"language",className:a().selectLabel,children:"Language"}),(0,r.jsx)("select",{id:"language",className:a().select,value:m,onChange:e=>{p(e.target.value)},children:i.map(e=>(0,r.jsx)("option",{value:e.code,children:e.label},e.code))})]})]})]}),(0,r.jsxs)("main",{className:a().main,children:[_?(0,r.jsx)("p",{className:a().loading,children:"Loading terms..."}):(0,r.jsx)("section",{className:a().content,children:(0,r.jsx)("p",{dangerouslySetInnerHTML:{__html:n}})}),(0,r.jsx)("button",{className:a().licensesButton,onClick:()=>{j(e=>!e)},children:f?"Close Licenses":"View Licenses"})]}),(0,r.jsx)(o.A,{}),f&&(0,r.jsx)(c.A,{onClose:()=>j(!1)})]})}},7200:(e,s,n)=>{"use strict";n.d(s,{A:()=>d});var r=n(5155),t=n(2115),l=n(1065),a=n(1218),o=n(3464),c=n(397),i=n.n(c);let d=e=>{let{onClose:s}=e,{SERVER_URL:n}=(0,l.U)(),{t:c}=(0,a.Bd)(),[d,_]=(0,t.useState)({frontend:[],backend:[],resources:[],apis:[]}),[h,m]=(0,t.useState)(!0),[p,u]=(0,t.useState)("frontend");(0,t.useEffect)(()=>{(async()=>{try{console.log("Fetching licenses from:","".concat(n,"/api/licenses"));let e=await o.A.get("".concat(n,"/api/licenses"));console.log("Licenses received:",e.data),_(e.data)}catch(e){console.error("Error fetching licenses:",e),window.alert(c("error")+": "+c("failed_to_load_licenses"))}finally{m(!1)}})()},[n,c]);let x=d[p];return(0,r.jsx)("div",{className:i().overlay,children:(0,r.jsxs)("div",{className:i().modalContent,children:[(0,r.jsxs)("div",{className:i().header,children:[(0,r.jsx)("div",{className:i().pickerContainer,children:(0,r.jsxs)("select",{className:i().picker,value:p,onChange:e=>u(e.target.value),children:[(0,r.jsx)("option",{value:"frontend",children:c("frontend")}),(0,r.jsx)("option",{value:"backend",children:c("backend")}),(0,r.jsx)("option",{value:"resources",children:c("resources")}),(0,r.jsx)("option",{value:"apis",children:c("external_apis")})]})}),(0,r.jsx)("button",{className:i().closeButton,onClick:s,children:c("close")})]}),h?(0,r.jsx)("div",{className:i().loadingContainer,children:(0,r.jsx)("div",{className:i().spinner})}):(0,r.jsx)("div",{className:i().scrollContent,children:x.map((e,s)=>(0,r.jsxs)("div",{className:i().licenseItem,children:[(0,r.jsx)("p",{className:i().libraryName,children:e.name}),e.version&&(0,r.jsxs)("p",{className:i().licenseType,children:[c("version"),": ",e.version]}),e.license&&(0,r.jsxs)("p",{className:i().licenseType,children:[c("license"),": ",e.license]}),e.details&&(0,r.jsx)("p",{className:i().licenseDetails,children:e.details.startsWith("http")?(0,r.jsx)("a",{href:e.details,target:"_blank",rel:"noopener noreferrer",style:{color:"blue"},children:e.details}):e.details}),e.type&&(0,r.jsxs)("p",{className:i().licenseType,children:[c("type"),": ",e.type]}),e.description&&(0,r.jsx)("p",{className:i().licenseDetails,children:e.description}),e.purpose&&(0,r.jsxs)("p",{className:i().licenseType,children:[c("purpose"),": ",e.purpose]}),e.url&&(0,r.jsx)("p",{className:i().licenseDetails,children:(0,r.jsx)("a",{href:e.url,target:"_blank",rel:"noopener noreferrer",style:{color:"blue"},children:e.url})}),e.note&&(0,r.jsx)("p",{className:i().licenseDetails,children:e.note})]},s))})]})})}},9707:(e,s,n)=>{"use strict";n.d(s,{A:()=>c});var r=n(5155),t=n(6874),l=n.n(t),a=n(3582),o=n.n(a);function c(){let e=e=>{localStorage.setItem("termsType",e)};return(0,r.jsxs)("footer",{className:o().footer,children:[(0,r.jsxs)("div",{className:o().footerContainer,children:[(0,r.jsxs)("div",{className:o().footerSection,children:[(0,r.jsx)("h3",{className:o().footerTitle,children:"About Abrody"}),(0,r.jsx)("p",{className:o().footerText,children:"Abrody is dedicated to connecting international minds through cultural exchange and real events. Join our community and explore a world of possibilities."})]}),(0,r.jsxs)("div",{className:o().footerSection,children:[(0,r.jsx)("h3",{className:o().footerTitle,children:"Quick Links"}),(0,r.jsxs)("ul",{className:o().footerLinks,children:[(0,r.jsx)("li",{children:(0,r.jsx)(l(),{href:"/about",children:(0,r.jsx)("a",{children:"About Us"})})}),(0,r.jsx)("li",{children:(0,r.jsx)(l(),{href:"/contact",children:(0,r.jsx)("a",{children:"Contact"})})}),(0,r.jsx)("li",{children:(0,r.jsx)(l(),{href:"/faq",children:(0,r.jsx)("a",{children:"FAQ"})})}),(0,r.jsx)("li",{children:(0,r.jsx)(l(),{href:"/terms",children:(0,r.jsx)("a",{onClick:()=>e("service"),children:"Terms of Service"})})}),(0,r.jsx)("li",{children:(0,r.jsx)(l(),{href:"/terms",children:(0,r.jsx)("a",{onClick:()=>e("privacy"),children:"Privacy Policy"})})})]})]}),(0,r.jsxs)("div",{className:o().footerSection,children:[(0,r.jsx)("h3",{className:o().footerTitle,children:"Follow Us"}),(0,r.jsxs)("div",{className:o().socialIcons,children:[(0,r.jsx)("a",{href:"https://twitter.com",target:"_blank",rel:"noopener noreferrer",children:(0,r.jsx)("img",{src:"/icons/twitter.png",alt:"Twitter"})}),(0,r.jsx)("a",{href:"https://facebook.com",target:"_blank",rel:"noopener noreferrer",children:(0,r.jsx)("img",{src:"/icons/facebook.png",alt:"Facebook"})}),(0,r.jsx)("a",{href:"https://instagram.com",target:"_blank",rel:"noopener noreferrer",children:(0,r.jsx)("img",{src:"/icons/instagram.png",alt:"Instagram"})}),(0,r.jsx)("a",{href:"https://www.tiktok.com",target:"_blank",rel:"noopener noreferrer",children:(0,r.jsx)("img",{src:"/icons/tiktok.png",alt:"TikTok"})}),(0,r.jsx)("a",{href:"https://www.youtube.com",target:"_blank",rel:"noopener noreferrer",children:(0,r.jsx)("img",{src:"/icons/youtube.png",alt:"YouTube"})})]})]})]}),(0,r.jsx)("div",{className:o().footerBottom,children:(0,r.jsxs)("p",{children:["\xa9 ",new Date().getFullYear()," Abrody. All rights reserved."]})})]})}}},e=>{var s=s=>e(e.s=s);e.O(0,[487,659,874,464,218,441,684,358],()=>s(4053)),_N_E=e.O()}]);