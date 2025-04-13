(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1221],{1065:(e,a,t)=>{"use strict";t.d(a,{s:()=>o,U:()=>c});var n=t(5155),r=t(2115);let l=JSON.parse('{"hl":"1.0.0","SC":"YOUR_INTERSTITIAL_PLACEMENT_ID","O8":"YOUR_BANNER_PLACEMENT_ID"}'),i={SERVER_URL:(()=>{let e="KR";if("undefined"!=typeof navigator&&navigator.language){let a=navigator.language.split("-");a.length>1&&(e=a[1])}let a="";switch(e.toUpperCase()){case"CA":a="ca.";break;case"AU":a="au.";break;case"GB":a="uk.";break;default:a=""}return console.log("domainPrefix: ",a),console.log("region: ",e),"https://beta.fcde.app"})(),APP_VERSION:l.hl,FACEBOOK_INTERSTITIAL_PLACEMENT_ID:l.SC,FACEBOOK_BANNER_PLACEMENT_ID:l.O8},s=(0,r.createContext)(null),o=e=>{let{children:a}=e;return(0,n.jsx)(s.Provider,{value:i,children:a})},c=()=>{let e=(0,r.useContext)(s);if(!e)throw Error("useConfig must be used within a ConfigProvider");return e}},3043:e=>{e.exports={container:"AdminPlan_container___Rrn5",header:"AdminPlan_header__KgIHw",headerTitle:"AdminPlan_headerTitle__wpKut",main:"AdminPlan_main__Back_",fadeIn:"AdminPlan_fadeIn__lgyfq",calendarWrapper:"AdminPlan_calendarWrapper__d_ksB","react-calendar":"AdminPlan_react-calendar__ZItJi","react-calendar__navigation":"AdminPlan_react-calendar__navigation__hezl7","react-calendar__month-view__weekdays":"AdminPlan_react-calendar__month-view__weekdays__Gre9S","react-calendar__month-view__weekdays__weekday":"AdminPlan_react-calendar__month-view__weekdays__weekday__ivwcd","react-calendar__month-view__days__day":"AdminPlan_react-calendar__month-view__days__day__Dm0Mi","react-calendar__tile--now":"AdminPlan_react-calendar__tile--now__b8o9p","react-calendar__tile--active":"AdminPlan_react-calendar__tile--active__adu_w",formContainer:"AdminPlan_formContainer__7tXj2",sectionTitle:"AdminPlan_sectionTitle__jUPKn",scheduleForm:"AdminPlan_scheduleForm__qBNLv",formGroup:"AdminPlan_formGroup__wyIVB",label:"AdminPlan_label__c7S2_",inputField:"AdminPlan_inputField__ulRi4",textareaField:"AdminPlan_textareaField__D5_bf",submitButton:"AdminPlan_submitButton___fB28",scheduleListContainer:"AdminPlan_scheduleListContainer__nuADx",scheduleList:"AdminPlan_scheduleList__gLw09",scheduleItem:"AdminPlan_scheduleItem__Pte4q"}},3331:(e,a,t)=>{"use strict";t.r(a),t.d(a,{default:()=>_});var n=t(5155),r=t(2115),l=t(7471);t(6769);var i=t(3464),s=t(1065),o=t(9707),c=t(3043),d=t.n(c);function _(){let{SERVER_URL:e}=(0,s.U)(),[a,t]=(0,r.useState)(new Date),[c,_]=(0,r.useState)([]),[h,m]=(0,r.useState)({eventDate:"",location:"",title:"",description:""}),[u,p]=(0,r.useState)(null);(0,r.useEffect)(()=>{f()},[]);let f=async()=>{try{let a=await i.A.get("".concat(e,"/adminPlan/schedules?region=ap-northeast-2"),{withCredentials:!0});_(a.data)}catch(e){console.error("Error fetching schedules",e)}},x=async a=>{a.preventDefault();try{let a=new FormData;a.append("eventDate",h.eventDate),a.append("location",h.location),a.append("title",h.title),a.append("description",h.description),a.append("region","ap-northeast-2"),u&&a.append("file",u),await i.A.post("".concat(e,"/adminPlan/schedules"),a,{withCredentials:!0,headers:{"Content-Type":"multipart/form-data"}}),m({eventDate:"",location:"",title:"",description:""}),p(null),f()}catch(e){console.error("Error creating schedule",e)}};return(0,n.jsxs)("div",{className:d().container,children:[(0,n.jsx)("header",{className:d().header,children:(0,n.jsx)("h1",{className:d().headerTitle,children:"Admin Calendar - Schedule Manager"})}),(0,n.jsxs)("main",{className:d().main,children:[(0,n.jsx)("div",{className:d().calendarWrapper,children:(0,n.jsx)(l.Ay,{onChange:e=>{e instanceof Date&&t(e)},value:a,className:d().calendar})}),(0,n.jsxs)("div",{className:d().formContainer,children:[(0,n.jsx)("h2",{className:d().sectionTitle,children:"Add New Schedule"}),(0,n.jsxs)("form",{onSubmit:x,className:d().scheduleForm,children:[(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{className:d().label,children:"Date:"}),(0,n.jsx)("input",{type:"date",value:h.eventDate,onChange:e=>m({...h,eventDate:e.target.value}),required:!0,className:d().inputField})]}),(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{className:d().label,children:"Location:"}),(0,n.jsx)("input",{type:"text",value:h.location,onChange:e=>m({...h,location:e.target.value}),required:!0,className:d().inputField})]}),(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{className:d().label,children:"Title:"}),(0,n.jsx)("input",{type:"text",value:h.title,onChange:e=>m({...h,title:e.target.value}),required:!0,className:d().inputField})]}),(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{className:d().label,children:"Description:"}),(0,n.jsx)("textarea",{value:h.description,onChange:e=>m({...h,description:e.target.value}),className:d().textareaField})]}),(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{className:d().label,children:"File (jpeg, png, pdf):"}),(0,n.jsx)("input",{type:"file",accept:".jpeg,.jpg,.png,.pdf",onChange:e=>{e.target.files&&e.target.files.length>0&&p(e.target.files[0])},className:d().inputField})]}),(0,n.jsx)("button",{type:"submit",className:d().submitButton,children:"Add Schedule"})]})]}),(0,n.jsxs)("div",{className:d().scheduleListContainer,children:[(0,n.jsx)("h2",{className:d().sectionTitle,children:"Current Schedules"}),(0,n.jsx)("ul",{className:d().scheduleList,children:c.map(e=>(0,n.jsxs)("li",{className:d().scheduleItem,children:[(0,n.jsx)("strong",{children:e.title})," -"," ",new Date(e.eventDate).toLocaleDateString()," at"," ",e.location,e.description&&(0,n.jsx)("p",{children:e.description}),e.fileUrl&&(0,n.jsx)("p",{children:(0,n.jsx)("a",{href:e.fileUrl,target:"_blank",rel:"noopener noreferrer",children:"View File"})})]},e._id))})]})]}),(0,n.jsx)(o.A,{})]})}},3582:e=>{e.exports={footer:"WebFooter_footer__2WnVU",footerContainer:"WebFooter_footerContainer__YBtb1",footerSection:"WebFooter_footerSection__nWzpG",footerTitle:"WebFooter_footerTitle__JXcRN",footerText:"WebFooter_footerText__A_iHN",footerLinks:"WebFooter_footerLinks__3TS2Z",socialIcons:"WebFooter_socialIcons__dEzrQ",footerBottom:"WebFooter_footerBottom__SM7KX"}},9688:(e,a,t)=>{Promise.resolve().then(t.bind(t,3331))},9707:(e,a,t)=>{"use strict";t.d(a,{A:()=>o});var n=t(5155),r=t(6874),l=t.n(r),i=t(3582),s=t.n(i);function o(){let e=e=>{localStorage.setItem("termsType",e)};return(0,n.jsxs)("footer",{className:s().footer,children:[(0,n.jsxs)("div",{className:s().footerContainer,children:[(0,n.jsxs)("div",{className:s().footerSection,children:[(0,n.jsx)("h3",{className:s().footerTitle,children:"About Abrody"}),(0,n.jsx)("p",{className:s().footerText,children:"Abrody is dedicated to connecting international minds through cultural exchange and real events. Join our community and explore a world of possibilities."})]}),(0,n.jsxs)("div",{className:s().footerSection,children:[(0,n.jsx)("h3",{className:s().footerTitle,children:"Quick Links"}),(0,n.jsxs)("ul",{className:s().footerLinks,children:[(0,n.jsx)("li",{children:(0,n.jsx)(l(),{href:"/about",children:(0,n.jsx)("a",{children:"About Us"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(l(),{href:"/contact",children:(0,n.jsx)("a",{children:"Contact"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(l(),{href:"/faq",children:(0,n.jsx)("a",{children:"FAQ"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(l(),{href:"/terms",children:(0,n.jsx)("a",{onClick:()=>e("service"),children:"Terms of Service"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(l(),{href:"/terms",children:(0,n.jsx)("a",{onClick:()=>e("privacy"),children:"Privacy Policy"})})})]})]}),(0,n.jsxs)("div",{className:s().footerSection,children:[(0,n.jsx)("h3",{className:s().footerTitle,children:"Follow Us"}),(0,n.jsxs)("div",{className:s().socialIcons,children:[(0,n.jsx)("a",{href:"https://twitter.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/twitter.png",alt:"Twitter"})}),(0,n.jsx)("a",{href:"https://facebook.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/facebook.png",alt:"Facebook"})}),(0,n.jsx)("a",{href:"https://instagram.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/instagram.png",alt:"Instagram"})}),(0,n.jsx)("a",{href:"https://www.tiktok.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/tiktok.png",alt:"TikTok"})}),(0,n.jsx)("a",{href:"https://www.youtube.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/youtube.png",alt:"YouTube"})})]})]})]}),(0,n.jsx)("div",{className:s().footerBottom,children:(0,n.jsxs)("p",{children:["\xa9 ",new Date().getFullYear()," Abrody. All rights reserved."]})})]})}}},e=>{var a=a=>e(e.s=a);e.O(0,[1e3,1146,6874,3464,1551,8441,1684,7358],()=>a(9688)),_N_E=e.O()}]);