(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[977],{5348:(e,a,t)=>{Promise.resolve().then(t.bind(t,8983))},7415:e=>{e.exports={container:"Contact_container__XFOe0",hero:"Contact_hero___tmUk",heroOverlay:"Contact_heroOverlay__JclD_",fadeInHero:"Contact_fadeInHero__kcxJX",heroTitle:"Contact_heroTitle__6d9l3",heroSubtitle:"Contact_heroSubtitle__MNG0W",main:"Contact_main__iOfCf",infoSection:"Contact_infoSection__Sa7WQ",sectionTitle:"Contact_sectionTitle__Cy6BB",infoContainer:"Contact_infoContainer__zY0uT",infoItem:"Contact_infoItem___6BoW",formSection:"Contact_formSection__9LNIW",contactForm:"Contact_contactForm__Q1g3L",inputField:"Contact_inputField__pZUqJ",textArea:"Contact_textArea__0IbqJ",submitButton:"Contact_submitButton__RAfDn"}},8983:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>u});var n=t(5155),s=t(8126),o=t.n(s),i=t(2115),r=t(4915),c=t.n(r);t(9537);var l=t(7415),d=t.n(l),h=t(9707);function u(){let[e,a]=(0,i.useState)(""),[t,s]=(0,i.useState)(""),[r,l]=(0,i.useState)("");(0,i.useEffect)(()=>{c().init({duration:1e3,once:!0})},[]);let u=async n=>{n.preventDefault();try{(await fetch("".concat("https://fcde.app","/api/contact"),{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:e,email:t,message:r})})).ok?(alert("Thank you for contacting us!"),a(""),s(""),l("")):alert("Failed to send message. Please try again later.")}catch(e){console.error("Submission error:",e),alert("An error occurred. Please try again later.")}};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(o(),{children:[(0,n.jsx)("meta",{name:"viewport",content:"width=device-width, initial-scale=1.0"}),(0,n.jsx)("title",{children:"Contact Us | Facade"})]}),(0,n.jsxs)("div",{className:d().container,children:[(0,n.jsx)("header",{className:d().hero,"data-aos":"fade-in",children:(0,n.jsxs)("div",{className:d().heroOverlay,children:[(0,n.jsx)("h1",{className:d().heroTitle,"data-aos":"fade-up",children:"Contact Us"}),(0,n.jsx)("p",{className:d().heroSubtitle,"data-aos":"fade-up","data-aos-delay":"300",children:"We're Here to Help"})]})}),(0,n.jsxs)("main",{className:d().main,children:[(0,n.jsxs)("section",{className:d().infoSection,"data-aos":"fade-up",children:[(0,n.jsx)("h2",{className:d().sectionTitle,children:"Get in Touch"}),(0,n.jsxs)("div",{className:d().infoContainer,children:[(0,n.jsxs)("div",{className:d().infoItem,"data-aos":"fade-up","data-aos-delay":"100",children:[(0,n.jsx)("h3",{children:"Email"}),(0,n.jsx)("p",{children:"support@fcde.app"})]}),(0,n.jsxs)("div",{className:d().infoItem,"data-aos":"fade-up","data-aos-delay":"200",children:[(0,n.jsx)("h3",{children:"Phone"}),(0,n.jsx)("p",{children:"+82 (010) 6854-9906"})]}),(0,n.jsxs)("div",{className:d().infoItem,"data-aos":"fade-up","data-aos-delay":"300",children:[(0,n.jsx)("h3",{children:"Address"}),(0,n.jsxs)("p",{children:["Main Branch:",(0,n.jsx)("br",{}),"경기도 용인시 수지구 수지로 342번길 34, 신촌빌딩 4층 A108",(0,n.jsx)("br",{}),"34, Suji-ro 342beon-gil, Suji-gu, Yongin-si, Gyeonggi-do, 4th Floor A108, Sinchon Building"]})]})]})]}),(0,n.jsxs)("section",{className:d().formSection,"data-aos":"fade-up","data-aos-delay":"400",children:[(0,n.jsx)("h2",{className:d().sectionTitle,children:"Send Us a Message"}),(0,n.jsxs)("form",{onSubmit:u,className:d().contactForm,children:[(0,n.jsx)("input",{type:"text",placeholder:"Your Name",value:e,onChange:e=>a(e.target.value),className:d().inputField,required:!0}),(0,n.jsx)("input",{type:"email",placeholder:"Your Email",value:t,onChange:e=>s(e.target.value),className:d().inputField,required:!0}),(0,n.jsx)("textarea",{placeholder:"Your Message",value:r,onChange:e=>l(e.target.value),className:d().textArea,required:!0}),(0,n.jsx)("button",{type:"submit",className:d().submitButton,children:"Send Message"})]})]})]}),(0,n.jsx)(h.A,{})]})]})}}},e=>{var a=a=>e(e.s=a);e.O(0,[96,396,751,874,152,441,684,358],()=>a(5348)),_N_E=e.O()}]);