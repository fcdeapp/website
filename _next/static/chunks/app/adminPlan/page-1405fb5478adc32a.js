(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1221],{1065:(e,t,a)=>{"use strict";a.d(t,{s:()=>i,U:()=>c});var n=a(5155),l=a(2115);let s=JSON.parse('{"hl":"1.0.0","SC":"YOUR_INTERSTITIAL_PLACEMENT_ID","O8":"YOUR_BANNER_PLACEMENT_ID"}'),o={SERVER_URL:(()=>{let e="KR";if("undefined"!=typeof navigator&&navigator.language){let t=navigator.language.split("-");t.length>1&&(e=t[1])}let t="";switch(e.toUpperCase()){case"CA":t="ca.";break;case"AU":t="au.";break;case"GB":t="uk.";break;default:t=""}return console.log("domainPrefix: ",t),console.log("region: ",e),"https://beta.fcde.app"})(),APP_VERSION:s.hl,FACEBOOK_INTERSTITIAL_PLACEMENT_ID:s.SC,FACEBOOK_BANNER_PLACEMENT_ID:s.O8},r=(0,l.createContext)(null),i=e=>{let{children:t}=e;return(0,n.jsx)(r.Provider,{value:o,children:t})},c=()=>{let e=(0,l.useContext)(r);if(!e)throw Error("useConfig must be used within a ConfigProvider");return e}},3043:e=>{e.exports={container:"AdminPlan_container___Rrn5",header:"AdminPlan_header__KgIHw",headerTitle:"AdminPlan_headerTitle__wpKut",main:"AdminPlan_main__Back_",fadeIn:"AdminPlan_fadeIn__lgyfq",topControls:"AdminPlan_topControls___fa_H",controlRow:"AdminPlan_controlRow__TdhY3",addButtonRow:"AdminPlan_addButtonRow__Dx_mO",calendar:"AdminPlan_calendar__J5pvF",viewToggleVertical:"AdminPlan_viewToggleVertical__r5gF3",toggleButton:"AdminPlan_toggleButton__Jn6ZJ",active:"AdminPlan_active__ahAtg",addScheduleButton:"AdminPlan_addScheduleButton__ke8_W",scheduleListContainer:"AdminPlan_scheduleListContainer__nuADx",sectionTitle:"AdminPlan_sectionTitle__jUPKn",noSchedule:"AdminPlan_noSchedule__x2oVn",scheduleGroup:"AdminPlan_scheduleGroup__ezFn5",groupTitle:"AdminPlan_groupTitle__gam42",scheduleList:"AdminPlan_scheduleList__gLw09",scheduleItem:"AdminPlan_scheduleItem__Pte4q",scheduleHeader:"AdminPlan_scheduleHeader__VPCJl",scheduleTitle:"AdminPlan_scheduleTitle__MOPBt",scheduleLocation:"AdminPlan_scheduleLocation__mds1k",scheduleDescription:"AdminPlan_scheduleDescription__Awn9L",scheduleTag:"AdminPlan_scheduleTag__zDbnC",scheduleAmount:"AdminPlan_scheduleAmount__6IIBW",scheduleFile:"AdminPlan_scheduleFile__3bcLn",analysisContainer:"AdminPlan_analysisContainer__wXbqT",analysisTable:"AdminPlan_analysisTable__0ME_E",chartContainer:"AdminPlan_chartContainer__Fne5p"}},3582:e=>{e.exports={footer:"WebFooter_footer__2WnVU",footerContainer:"WebFooter_footerContainer__YBtb1",footerSection:"WebFooter_footerSection__nWzpG",footerTitle:"WebFooter_footerTitle__JXcRN",footerText:"WebFooter_footerText__A_iHN",footerLinks:"WebFooter_footerLinks__3TS2Z",socialIcons:"WebFooter_socialIcons__dEzrQ",footerBottom:"WebFooter_footerBottom__SM7KX"}},8152:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>x});var n=a(5155),l=a(2115),s=a(7471),o=a(3464),r=a(1065),i=a(9707),c=a(9637),d=a.n(c);let h=e=>{let{onClose:t,onScheduleAdded:a}=e,{SERVER_URL:s}=(0,r.U)(),[i,c]=(0,l.useState)({eventDate:"",location:"",title:"",description:"",tag:"",amount:""}),[h,u]=(0,l.useState)(null),[m,_]=(0,l.useState)(""),p=async e=>{e.preventDefault();try{let e=new FormData;e.append("eventDate",i.eventDate),e.append("location",i.location),e.append("title",i.title),e.append("description",i.description),e.append("tag",i.tag),e.append("amount",i.amount),e.append("region","ap-northeast-2"),h&&e.append("file",h),await o.A.post("".concat(s,"/api/adminPlan/schedules"),e,{withCredentials:!0,headers:{"Content-Type":"multipart/form-data"}}),c({eventDate:"",location:"",title:"",description:"",tag:"",amount:""}),u(null),a(),t()}catch(e){console.error("Error creating schedule",e),_("일정 생성에 실패했습니다. 다시 시도해주세요.")}};return(0,n.jsx)("div",{className:d().modalOverlay,children:(0,n.jsxs)("div",{className:d().modal,children:[(0,n.jsx)("h2",{children:"Add New Schedule"}),m&&(0,n.jsx)("p",{className:d().error,children:m}),(0,n.jsxs)("form",{onSubmit:p,className:d().scheduleForm,children:[(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{children:"Date:"}),(0,n.jsx)("input",{type:"date",value:i.eventDate,onChange:e=>c({...i,eventDate:e.target.value}),required:!0})]}),(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{children:"Location:"}),(0,n.jsx)("input",{type:"text",value:i.location,onChange:e=>c({...i,location:e.target.value}),required:!0})]}),(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{children:"Title:"}),(0,n.jsx)("input",{type:"text",value:i.title,onChange:e=>c({...i,title:e.target.value}),required:!0})]}),(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{children:"Description:"}),(0,n.jsx)("textarea",{value:i.description,onChange:e=>c({...i,description:e.target.value})})]}),(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{children:"Tag:"}),(0,n.jsx)("input",{type:"text",value:i.tag,onChange:e=>c({...i,tag:e.target.value}),placeholder:"예: 행사, 모임 등"})]}),(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{children:"Amount (KRW):"}),(0,n.jsx)("input",{type:"number",value:i.amount,onChange:e=>c({...i,amount:e.target.value}),placeholder:"예: 10000"})]}),(0,n.jsxs)("div",{className:d().formGroup,children:[(0,n.jsx)("label",{children:"File (jpeg, jpg, png, pdf, zip, eml):"}),(0,n.jsx)("input",{type:"file",accept:".jpeg,.jpg,.png,.pdf,.zip,.eml",onChange:e=>{e.target.files&&e.target.files.length>0&&u(e.target.files[0])}})]}),(0,n.jsxs)("div",{className:d().buttonGroup,children:[(0,n.jsx)("button",{type:"button",onClick:t,className:d().cancelButton,children:"Cancel"}),(0,n.jsx)("button",{type:"submit",className:d().submitButton,children:"Add Schedule"})]})]})]})})};var u=a(3043),m=a.n(u),_=a(2502),p=a(4065);function x(){let{SERVER_URL:e}=(0,r.U)(),[t,a]=(0,l.useState)(new Date),[c,d]=(0,l.useState)([]),[u,_]=(0,l.useState)(!1),[x,g]=(0,l.useState)("daily");(0,l.useEffect)(()=>{j()},[]);let j=async()=>{try{let t=await o.A.get("".concat(e,"/api/adminPlan/schedules?region=ap-northeast-2"),{withCredentials:!0});d(t.data)}catch(e){console.error("Error fetching schedules",e)}},b={};"daily"===x?b=(()=>{let e={};return c.forEach(t=>{let a=new Date(t.eventDate).toLocaleDateString();e[a]||(e[a]=[]),e[a].push(t)}),e})():"weekly"===x?b=(()=>{let e={};return c.forEach(t=>{let a=new Date(t.eventDate),n=a.getDay(),l=new Date(a);l.setDate(a.getDate()-n);let s=l.toLocaleDateString();e[s]||(e[s]=[]),e[s].push(t)}),e})():"monthly"===x&&(b=(()=>{let e={};return c.forEach(t=>{let a=new Date(t.eventDate),n="".concat(a.getFullYear(),"-").concat((a.getMonth()+1).toString().padStart(2,"0"));e[n]||(e[n]=[]),e[n].push(t)}),e})());let f=(()=>{let e={};return c.forEach(t=>{if(t.amount){let a=new Date(t.eventDate),n="".concat(a.getFullYear(),"-").concat((a.getMonth()+1).toString().padStart(2,"0")),l=parseFloat(t.amount);isNaN(l)||(e[n]=(e[n]||0)+l)}}),e})(),v=(()=>{let e={};return c.forEach(t=>{if(t.amount&&t.tag){let a=parseFloat(t.amount);isNaN(a)||(e[t.tag]=(e[t.tag]||0)+a)}}),e})(),N={labels:Object.keys(f),datasets:[{label:"Monthly Total Amount (KRW)",data:Object.values(f),backgroundColor:"rgba(0, 112, 243, 0.6)"}]},y={labels:Object.keys(v),datasets:[{label:"Tag Total Amount (KRW)",data:Object.values(v),backgroundColor:"rgba(255, 102, 0, 0.6)"}]};return(0,n.jsxs)("div",{className:m().container,children:[(0,n.jsx)("header",{className:m().header,children:(0,n.jsx)("h1",{className:m().headerTitle,children:"Admin Calendar - Schedule Manager"})}),(0,n.jsxs)("main",{className:m().main,children:[(0,n.jsxs)("div",{className:m().topControls,children:[(0,n.jsxs)("div",{className:m().controlRow,children:[(0,n.jsx)(s.Ay,{onChange:e=>{e instanceof Date&&a(e)},value:t,className:m().calendar}),(0,n.jsxs)("div",{className:m().viewToggleVertical,children:[(0,n.jsx)("button",{onClick:()=>g("daily"),className:"".concat(m().toggleButton," ").concat("daily"===x?m().active:""),children:"Daily View"}),(0,n.jsx)("button",{onClick:()=>g("weekly"),className:"".concat(m().toggleButton," ").concat("weekly"===x?m().active:""),children:"Weekly View"}),(0,n.jsx)("button",{onClick:()=>g("monthly"),className:"".concat(m().toggleButton," ").concat("monthly"===x?m().active:""),children:"Monthly View"}),(0,n.jsx)("button",{onClick:()=>g("analysis"),className:"".concat(m().toggleButton," ").concat("analysis"===x?m().active:""),children:"Analysis Mode"})]})]}),(0,n.jsx)("div",{className:m().addButtonRow,children:(0,n.jsx)("button",{onClick:()=>_(!0),className:m().addScheduleButton,children:"Add New Schedule"})})]}),(0,n.jsx)("div",{className:m().scheduleListContainer,children:"analysis"!==x?(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)("h2",{className:m().sectionTitle,children:"daily"===x?"Schedules by Day":"weekly"===x?"Schedules by Week":"Schedules by Month"}),0===Object.keys(b).length&&(0,n.jsx)("p",{className:m().noSchedule,children:"No schedules available."}),Object.keys(b).map(e=>(0,n.jsxs)("div",{className:m().scheduleGroup,children:[(0,n.jsx)("h3",{className:m().groupTitle,children:"daily"===x?"Date: ".concat(e):"weekly"===x?"Week Starting: ".concat(e):"Month: ".concat(e)}),(0,n.jsx)("ul",{className:m().scheduleList,children:b[e].map(e=>(0,n.jsxs)("li",{className:m().scheduleItem,children:[(0,n.jsxs)("div",{className:m().scheduleHeader,children:[(0,n.jsx)("span",{className:m().scheduleTitle,children:e.title}),(0,n.jsx)("span",{className:m().scheduleLocation,children:e.location})]}),e.description&&(0,n.jsx)("p",{className:m().scheduleDescription,children:e.description}),e.tag&&(0,n.jsxs)("p",{className:m().scheduleTag,children:["Tag: ",e.tag]}),e.amount&&(0,n.jsxs)("p",{className:m().scheduleAmount,children:["Amount: ",e.amount," KRW"]}),e.fileUrl&&(0,n.jsx)("p",{className:m().scheduleFile,children:(0,n.jsx)("a",{href:e.fileUrl,target:"_blank",rel:"noopener noreferrer",children:"View File"})})]},e._id))})]},e))]}):(0,n.jsxs)("div",{className:m().analysisContainer,children:[(0,n.jsx)("h2",{className:m().sectionTitle,children:"Monthly Payment Analysis"}),0===Object.keys(f).length?(0,n.jsx)("p",{className:m().noSchedule,children:"No payment data available."}):(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)("table",{className:m().analysisTable,children:[(0,n.jsx)("thead",{children:(0,n.jsxs)("tr",{children:[(0,n.jsx)("th",{children:"Month"}),(0,n.jsx)("th",{children:"Total Amount (KRW)"})]})}),(0,n.jsx)("tbody",{children:Object.entries(f).map(e=>{let[t,a]=e;return(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:t}),(0,n.jsx)("td",{children:a.toLocaleString()})]},t)})})]}),(0,n.jsx)("div",{className:m().chartContainer,children:(0,n.jsx)(p.yP,{data:N,options:{responsive:!0,plugins:{legend:{position:"top"}}}})})]}),(0,n.jsx)("h2",{className:m().sectionTitle,children:"Tag Payment Analysis"}),0===Object.keys(v).length?(0,n.jsx)("p",{className:m().noSchedule,children:"No tag data available."}):(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)("table",{className:m().analysisTable,children:[(0,n.jsx)("thead",{children:(0,n.jsxs)("tr",{children:[(0,n.jsx)("th",{children:"Tag"}),(0,n.jsx)("th",{children:"Total Amount (KRW)"})]})}),(0,n.jsx)("tbody",{children:Object.entries(v).map(e=>{let[t,a]=e;return(0,n.jsxs)("tr",{children:[(0,n.jsx)("td",{children:t}),(0,n.jsx)("td",{children:a.toLocaleString()})]},t)})})]}),(0,n.jsx)("div",{className:m().chartContainer,children:(0,n.jsx)(p.yP,{data:y,options:{responsive:!0,plugins:{legend:{position:"top"}}}})})]})]})})]}),u&&(0,n.jsx)(h,{onClose:()=>_(!1),onScheduleAdded:j}),(0,n.jsx)(i.A,{})]})}_.t1.register(_.PP,_.kc,_.E8,_.hE,_.m_,_.s$)},9637:e=>{e.exports={modalOverlay:"ScheduleModal_modalOverlay__p6yFE",modal:"ScheduleModal_modal__5apLe",slideDown:"ScheduleModal_slideDown__zOiO8",scheduleForm:"ScheduleModal_scheduleForm__UKb8z",formGroup:"ScheduleModal_formGroup__ogiZW",buttonGroup:"ScheduleModal_buttonGroup__Mueb8",cancelButton:"ScheduleModal_cancelButton__UbQW7",submitButton:"ScheduleModal_submitButton__AoRC2",error:"ScheduleModal_error__Wp89Y"}},9688:(e,t,a)=>{Promise.resolve().then(a.bind(a,8152))},9707:(e,t,a)=>{"use strict";a.d(t,{A:()=>i});var n=a(5155),l=a(6874),s=a.n(l),o=a(3582),r=a.n(o);function i(){let e=e=>{localStorage.setItem("termsType",e)};return(0,n.jsxs)("footer",{className:r().footer,children:[(0,n.jsxs)("div",{className:r().footerContainer,children:[(0,n.jsxs)("div",{className:r().footerSection,children:[(0,n.jsx)("h3",{className:r().footerTitle,children:"About Abrody"}),(0,n.jsx)("p",{className:r().footerText,children:"Abrody is dedicated to connecting international minds through cultural exchange and real events. Join our community and explore a world of possibilities."})]}),(0,n.jsxs)("div",{className:r().footerSection,children:[(0,n.jsx)("h3",{className:r().footerTitle,children:"Quick Links"}),(0,n.jsxs)("ul",{className:r().footerLinks,children:[(0,n.jsx)("li",{children:(0,n.jsx)(s(),{href:"/about",children:(0,n.jsx)("a",{children:"About Us"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(s(),{href:"/contact",children:(0,n.jsx)("a",{children:"Contact"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(s(),{href:"/faq",children:(0,n.jsx)("a",{children:"FAQ"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(s(),{href:"/terms",children:(0,n.jsx)("a",{onClick:()=>e("service"),children:"Terms of Service"})})}),(0,n.jsx)("li",{children:(0,n.jsx)(s(),{href:"/terms",children:(0,n.jsx)("a",{onClick:()=>e("privacy"),children:"Privacy Policy"})})})]})]}),(0,n.jsxs)("div",{className:r().footerSection,children:[(0,n.jsx)("h3",{className:r().footerTitle,children:"Follow Us"}),(0,n.jsxs)("div",{className:r().socialIcons,children:[(0,n.jsx)("a",{href:"https://twitter.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/twitter.png",alt:"Twitter"})}),(0,n.jsx)("a",{href:"https://facebook.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/facebook.png",alt:"Facebook"})}),(0,n.jsx)("a",{href:"https://instagram.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/instagram.png",alt:"Instagram"})}),(0,n.jsx)("a",{href:"https://www.tiktok.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/tiktok.png",alt:"TikTok"})}),(0,n.jsx)("a",{href:"https://www.youtube.com",target:"_blank",rel:"noopener noreferrer",children:(0,n.jsx)("img",{src:"/icons/youtube.png",alt:"YouTube"})})]})]})]}),(0,n.jsx)("div",{className:r().footerBottom,children:(0,n.jsxs)("p",{children:["\xa9 ",new Date().getFullYear()," Abrody. All rights reserved."]})})]})}}},e=>{var t=t=>e(e.s=t);e.O(0,[4813,5647,6874,3464,6693,7471,8441,1684,7358],()=>t(9688)),_N_E=e.O()}]);