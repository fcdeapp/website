(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[66],{3582:e=>{e.exports={footer:"WebFooter_footer__2WnVU",footerContainer:"WebFooter_footerContainer__YBtb1",footerSection:"WebFooter_footerSection__nWzpG",footerTitle:"WebFooter_footerTitle__JXcRN",footerText:"WebFooter_footerText__A_iHN",footerLinks:"WebFooter_footerLinks__3TS2Z",socialIcons:"WebFooter_socialIcons__dEzrQ",footerBottom:"WebFooter_footerBottom__SM7KX"}},4053:(e,r,t)=>{Promise.resolve().then(t.bind(t,7036))},4248:e=>{e.exports={container:"Terms_container___nM20",header:"Terms_header__eNurL",title:"Terms_title__f2bmc",controls:"Terms_controls__WsqyM",toggleButton:"Terms_toggleButton__mSiqn",select:"Terms_select__YnqRB",main:"Terms_main__DIzFV",content:"Terms_content__eJS8s",footer:"Terms_footer__FDANY"}},7036:(e,r,t)=>{"use strict";t.r(r),t.d(r,{default:()=>a});var o=t(5155),s=t(2115),n=t(4248),i=t.n(n),c=t(9707);function a(){let[e,r]=(0,s.useState)(""),[t,n]=(0,s.useState)(!1),[a,l]=(0,s.useState)("en"),[h,d]=(0,s.useState)("privacy");(0,s.useEffect)(()=>{{let e=localStorage.getItem("termsType");e&&(d(e),localStorage.removeItem("termsType"))}},[]);let m=async(e,t)=>{n(!0);try{let o=await fetch("".concat("https://fcde.app","/api/terms/").concat(t,"/").concat(e));if(!o.ok)throw Error("Failed to load terms");let s=await o.json();r(s.content)}catch(e){console.error("Error fetching terms:",e)}finally{n(!1)}};return(0,s.useEffect)(()=>{m(a,h)},[a,h]),(0,o.jsxs)("div",{className:i().container,children:[(0,o.jsxs)("header",{className:i().header,children:[(0,o.jsx)("h1",{className:i().title,children:"service"===h?"en"===a?"Terms of Service":"서비스 이용약관":"privacy"===h?"en"===a?"Privacy Policy":"개인정보처리방침":"en"===a?"Community Guidelines":"커뮤니티 이용약관"}),(0,o.jsxs)("div",{className:i().controls,children:[(0,o.jsx)("button",{onClick:()=>{l(e=>"en"===e?"ko":"en")},className:i().toggleButton,children:"en"===a?"View in Korean":"View in English"}),(0,o.jsxs)("select",{className:i().select,value:h,onChange:e=>{d(e.target.value)},children:[(0,o.jsx)("option",{value:"service",children:"en"===a?"Terms of Service":"서비스 이용약관"}),(0,o.jsx)("option",{value:"privacy",children:"en"===a?"Privacy Policy":"개인정보처리방침"}),(0,o.jsx)("option",{value:"community",children:"en"===a?"Community Guidelines":"커뮤니티 이용약관"})]})]})]}),(0,o.jsx)("main",{className:i().main,children:t?(0,o.jsx)("p",{children:"Loading terms..."}):(0,o.jsx)("section",{className:i().content,children:(0,o.jsx)("p",{children:e})})}),(0,o.jsx)(c.A,{})]})}},9707:(e,r,t)=>{"use strict";t.d(r,{A:()=>a});var o=t(5155),s=t(6874),n=t.n(s),i=t(3582),c=t.n(i);function a(){let e=e=>{localStorage.setItem("termsType",e)};return(0,o.jsxs)("footer",{className:c().footer,children:[(0,o.jsxs)("div",{className:c().footerContainer,children:[(0,o.jsxs)("div",{className:c().footerSection,children:[(0,o.jsx)("h3",{className:c().footerTitle,children:"About Facade"}),(0,o.jsx)("p",{className:c().footerText,children:"Facade is dedicated to connecting international minds through cultural exchange and real events. Join our community and explore a world of possibilities."})]}),(0,o.jsxs)("div",{className:c().footerSection,children:[(0,o.jsx)("h3",{className:c().footerTitle,children:"Quick Links"}),(0,o.jsxs)("ul",{className:c().footerLinks,children:[(0,o.jsx)("li",{children:(0,o.jsx)(n(),{href:"/about",children:(0,o.jsx)("a",{children:"About Us"})})}),(0,o.jsx)("li",{children:(0,o.jsx)(n(),{href:"/contact",children:(0,o.jsx)("a",{children:"Contact"})})}),(0,o.jsx)("li",{children:(0,o.jsx)(n(),{href:"/faq",children:(0,o.jsx)("a",{children:"FAQ"})})}),(0,o.jsx)("li",{children:(0,o.jsx)(n(),{href:"/terms",children:(0,o.jsx)("a",{onClick:()=>e("service"),children:"Terms of Service"})})}),(0,o.jsx)("li",{children:(0,o.jsx)(n(),{href:"/terms",children:(0,o.jsx)("a",{onClick:()=>e("privacy"),children:"Privacy Policy"})})})]})]}),(0,o.jsxs)("div",{className:c().footerSection,children:[(0,o.jsx)("h3",{className:c().footerTitle,children:"Follow Us"}),(0,o.jsxs)("div",{className:c().socialIcons,children:[(0,o.jsx)("a",{href:"https://twitter.com",target:"_blank",rel:"noopener noreferrer",children:(0,o.jsx)("img",{src:"/icons/twitter.png",alt:"Twitter"})}),(0,o.jsx)("a",{href:"https://facebook.com",target:"_blank",rel:"noopener noreferrer",children:(0,o.jsx)("img",{src:"/icons/facebook.png",alt:"Facebook"})}),(0,o.jsx)("a",{href:"https://instagram.com",target:"_blank",rel:"noopener noreferrer",children:(0,o.jsx)("img",{src:"/icons/instagram.png",alt:"Instagram"})}),(0,o.jsx)("a",{href:"https://www.tiktok.com",target:"_blank",rel:"noopener noreferrer",children:(0,o.jsx)("img",{src:"/icons/tiktok.png",alt:"TikTok"})}),(0,o.jsx)("a",{href:"https://www.youtube.com",target:"_blank",rel:"noopener noreferrer",children:(0,o.jsx)("img",{src:"/icons/youtube.png",alt:"YouTube"})})]})]})]}),(0,o.jsx)("div",{className:c().footerBottom,children:(0,o.jsxs)("p",{children:["\xa9 ",new Date().getFullYear()," Facade. All rights reserved."]})})]})}}},e=>{var r=r=>e(e.s=r);e.O(0,[751,874,441,684,358],()=>r(4053)),_N_E=e.O()}]);