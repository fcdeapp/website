(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[66],{3582:e=>{e.exports={footer:"WebFooter_footer__2WnVU",footerContainer:"WebFooter_footerContainer__YBtb1",footerSection:"WebFooter_footerSection__nWzpG",footerTitle:"WebFooter_footerTitle__JXcRN",footerText:"WebFooter_footerText__A_iHN",footerLinks:"WebFooter_footerLinks__3TS2Z",socialIcons:"WebFooter_socialIcons__dEzrQ",footerBottom:"WebFooter_footerBottom__SM7KX"}},4053:(e,r,s)=>{Promise.resolve().then(s.bind(s,7036))},4248:e=>{e.exports={container:"Terms_container___nM20",header:"Terms_header__eNurL",slideDown:"Terms_slideDown__VtaGq",title:"Terms_title__f2bmc",controls:"Terms_controls__WsqyM",selectWrapper:"Terms_selectWrapper__Xg5OR",select:"Terms_select__YnqRB",main:"Terms_main__DIzFV",fadeInContent:"Terms_fadeInContent__1PMRL",content:"Terms_content__eJS8s",loading:"Terms_loading__fPAlc",footer:"Terms_footer__FDANY",slideUp:"Terms_slideUp__6hbSR"}},7036:(e,r,s)=>{"use strict";s.r(r),s.d(r,{default:()=>i});var o=s(5155),t=s(2115),l=s(4248),n=s.n(l),a=s(9707);let c=[{code:"ar",label:"Arabic"},{code:"de",label:"German"},{code:"en",label:"English"},{code:"es",label:"Spanish"},{code:"fr",label:"French"},{code:"hi",label:"Hindi"},{code:"it",label:"Italian"},{code:"ja",label:"Japanese"},{code:"ko",label:"Korean"},{code:"pt",label:"Portuguese"},{code:"ru",label:"Russian"},{code:"zh",label:"Chinese"}];function i(){let[e,r]=(0,t.useState)(""),[s,l]=(0,t.useState)(!1),[i,d]=(0,t.useState)("en"),[h,m]=(0,t.useState)("privacy");(0,t.useEffect)(()=>{{let e=localStorage.getItem("termsType");e&&(m(e),localStorage.removeItem("termsType"))}},[]);let _=async(e,s)=>{l(!0);try{let o=await fetch("".concat("https://fcde.app","/api/terms/").concat(s,"/").concat(e));if(!o.ok)throw Error("Failed to load terms");let t=await o.json();r(t.content)}catch(e){console.error("Error fetching terms:",e)}finally{l(!1)}};return(0,t.useEffect)(()=>{_(i,h)},[i,h]),(0,o.jsxs)("div",{className:n().container,children:[(0,o.jsxs)("header",{className:n().header,children:[(0,o.jsx)("h1",{className:n().title,children:"service"===h?"en"===i?"Terms of Service":"서비스 이용약관":"privacy"===h?"en"===i?"Privacy Policy":"개인정보처리방침":"en"===i?"Community Guidelines":"커뮤니티 이용약관"}),(0,o.jsxs)("div",{className:n().controls,children:[(0,o.jsxs)("div",{className:n().selectWrapper,children:[(0,o.jsx)("label",{htmlFor:"termsType",children:"Type: "}),(0,o.jsxs)("select",{id:"termsType",className:n().select,value:h,onChange:e=>{m(e.target.value)},children:[(0,o.jsx)("option",{value:"service",children:"en"===i?"Terms of Service":"서비스 이용약관"}),(0,o.jsx)("option",{value:"privacy",children:"en"===i?"Privacy Policy":"개인정보처리방침"}),(0,o.jsx)("option",{value:"community",children:"en"===i?"Community Guidelines":"커뮤니티 이용약관"})]})]}),(0,o.jsxs)("div",{className:n().selectWrapper,children:[(0,o.jsx)("label",{htmlFor:"language",children:"Language: "}),(0,o.jsx)("select",{id:"language",className:n().select,value:i,onChange:e=>{d(e.target.value)},children:c.map(e=>(0,o.jsx)("option",{value:e.code,children:e.label},e.code))})]})]})]}),(0,o.jsx)("main",{className:n().main,children:s?(0,o.jsx)("p",{className:n().loading,children:"Loading terms..."}):(0,o.jsx)("section",{className:n().content,children:(0,o.jsx)("p",{children:e})})}),(0,o.jsx)(a.A,{})]})}},9707:(e,r,s)=>{"use strict";s.d(r,{A:()=>c});var o=s(5155),t=s(6874),l=s.n(t),n=s(3582),a=s.n(n);function c(){let e=e=>{localStorage.setItem("termsType",e)};return(0,o.jsxs)("footer",{className:a().footer,children:[(0,o.jsxs)("div",{className:a().footerContainer,children:[(0,o.jsxs)("div",{className:a().footerSection,children:[(0,o.jsx)("h3",{className:a().footerTitle,children:"About Facade"}),(0,o.jsx)("p",{className:a().footerText,children:"Facade is dedicated to connecting international minds through cultural exchange and real events. Join our community and explore a world of possibilities."})]}),(0,o.jsxs)("div",{className:a().footerSection,children:[(0,o.jsx)("h3",{className:a().footerTitle,children:"Quick Links"}),(0,o.jsxs)("ul",{className:a().footerLinks,children:[(0,o.jsx)("li",{children:(0,o.jsx)(l(),{href:"/about",children:(0,o.jsx)("a",{children:"About Us"})})}),(0,o.jsx)("li",{children:(0,o.jsx)(l(),{href:"/contact",children:(0,o.jsx)("a",{children:"Contact"})})}),(0,o.jsx)("li",{children:(0,o.jsx)(l(),{href:"/faq",children:(0,o.jsx)("a",{children:"FAQ"})})}),(0,o.jsx)("li",{children:(0,o.jsx)(l(),{href:"/terms",children:(0,o.jsx)("a",{onClick:()=>e("service"),children:"Terms of Service"})})}),(0,o.jsx)("li",{children:(0,o.jsx)(l(),{href:"/terms",children:(0,o.jsx)("a",{onClick:()=>e("privacy"),children:"Privacy Policy"})})})]})]}),(0,o.jsxs)("div",{className:a().footerSection,children:[(0,o.jsx)("h3",{className:a().footerTitle,children:"Follow Us"}),(0,o.jsxs)("div",{className:a().socialIcons,children:[(0,o.jsx)("a",{href:"https://twitter.com",target:"_blank",rel:"noopener noreferrer",children:(0,o.jsx)("img",{src:"/icons/twitter.png",alt:"Twitter"})}),(0,o.jsx)("a",{href:"https://facebook.com",target:"_blank",rel:"noopener noreferrer",children:(0,o.jsx)("img",{src:"/icons/facebook.png",alt:"Facebook"})}),(0,o.jsx)("a",{href:"https://instagram.com",target:"_blank",rel:"noopener noreferrer",children:(0,o.jsx)("img",{src:"/icons/instagram.png",alt:"Instagram"})}),(0,o.jsx)("a",{href:"https://www.tiktok.com",target:"_blank",rel:"noopener noreferrer",children:(0,o.jsx)("img",{src:"/icons/tiktok.png",alt:"TikTok"})}),(0,o.jsx)("a",{href:"https://www.youtube.com",target:"_blank",rel:"noopener noreferrer",children:(0,o.jsx)("img",{src:"/icons/youtube.png",alt:"YouTube"})})]})]})]}),(0,o.jsx)("div",{className:a().footerBottom,children:(0,o.jsxs)("p",{children:["\xa9 ",new Date().getFullYear()," Facade. All rights reserved."]})})]})}}},e=>{var r=r=>e(e.s=r);e.O(0,[751,874,441,684,358],()=>r(4053)),_N_E=e.O()}]);