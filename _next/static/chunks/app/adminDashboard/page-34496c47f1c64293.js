(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[502],{397:e=>{e.exports={overlay:"Licenses_overlay__UcZSv",modalContent:"Licenses_modalContent__Bq1I3",header:"Licenses_header__1g1fA",pickerContainer:"Licenses_pickerContainer__Bx4QL",picker:"Licenses_picker__th3C_",closeButton:"Licenses_closeButton__yZ2E0",closeButtonText:"Licenses_closeButtonText__a53zz",loadingContainer:"Licenses_loadingContainer__b4z3m",spinner:"Licenses_spinner__jcIlC",spin:"Licenses_spin__cXu_I",scrollContent:"Licenses_scrollContent__oMBUW",licenseItem:"Licenses_licenseItem__otTs6",libraryName:"Licenses_libraryName__P66Kp",licenseType:"Licenses_licenseType__yy7WB",licenseDetails:"Licenses_licenseDetails__JSJyc",noDataText:"Licenses_noDataText__cjo77"}},1065:(e,t,a)=>{"use strict";a.d(t,{s:()=>l,U:()=>c});var s=a(5155),r=a(2115);let n=JSON.parse('{"hl":"1.0.0","SC":"YOUR_INTERSTITIAL_PLACEMENT_ID","O8":"YOUR_BANNER_PLACEMENT_ID"}'),o={SERVER_URL:(()=>{let e="KR";if("undefined"!=typeof navigator&&navigator.language){let t=navigator.language.split("-");t.length>1&&(e=t[1])}let t="";switch(e.toUpperCase()){case"CA":t="ca.";break;case"AU":t="au.";break;case"GB":t="uk.";break;default:t=""}return console.log("domainPrefix: ",t),console.log("region: ",e),"https://beta.fcde.app"})(),APP_VERSION:n.hl,FACEBOOK_INTERSTITIAL_PLACEMENT_ID:n.SC,FACEBOOK_BANNER_PLACEMENT_ID:n.O8},i=(0,r.createContext)(null),l=e=>{let{children:t}=e;return(0,s.jsx)(i.Provider,{value:o,children:t})},c=()=>{let e=(0,r.useContext)(i);if(!e)throw Error("useConfig must be used within a ConfigProvider");return e}},3582:e=>{e.exports={footer:"WebFooter_footer__2WnVU",footerContainer:"WebFooter_footerContainer__YBtb1",footerSection:"WebFooter_footerSection__nWzpG",footerTitle:"WebFooter_footerTitle__JXcRN",footerText:"WebFooter_footerText__A_iHN",footerLinks:"WebFooter_footerLinks__3TS2Z",socialIcons:"WebFooter_socialIcons__dEzrQ",footerBottom:"WebFooter_footerBottom__SM7KX"}},5924:e=>{e.exports={container:"AdminDashboard_container__JLNKn",header:"AdminDashboard_header__WJb6S",opaque:"AdminDashboard_opaque__EV7_t",backButton:"AdminDashboard_backButton__WgbS5",headerTitle:"AdminDashboard_headerTitle__iFYpN",logoutButton:"AdminDashboard_logoutButton___3syv",mainTabContainer:"AdminDashboard_mainTabContainer__euwAc",mainTabButton:"AdminDashboard_mainTabButton__L3l4U",activeTab:"AdminDashboard_activeTab__Jxtcw",dashboardContent:"AdminDashboard_dashboardContent__GSBD7",reportsContent:"AdminDashboard_reportsContent__J_Idw",loader:"AdminDashboard_loader__ANpI_",error:"AdminDashboard_error__EFQZg",noDataText:"AdminDashboard_noDataText__jqXDV",dashboardSection:"AdminDashboard_dashboardSection__W7Oia",card:"AdminDashboard_card__TKj8v",statText:"AdminDashboard_statText__WZwaW",chartCard:"AdminDashboard_chartCard__2Fevt",pickerContainer:"AdminDashboard_pickerContainer__fbV6T",picker:"AdminDashboard_picker__z61sx",reportsContainer:"AdminDashboard_reportsContainer__E91Xs",reportItem:"AdminDashboard_reportItem__kaJFh",countryButton:"AdminDashboard_countryButton__nKbp9",countryText:"AdminDashboard_countryText__bxvMc",modalOverlay:"AdminDashboard_modalOverlay__jQTnh",modalContent:"AdminDashboard_modalContent__re76I",chartContainer:"AdminDashboard_chartContainer__1Qt8k",headerContainer:"AdminDashboard_headerContainer__gFdgF",backIcon:"AdminDashboard_backIcon__YzqRN",headerText:"AdminDashboard_headerText__JqDUw",input:"AdminDashboard_input__jBX6a",modalButtonContainer:"AdminDashboard_modalButtonContainer__CAUyD",modalButton:"AdminDashboard_modalButton__YzRxK",modalCancelButton:"AdminDashboard_modalCancelButton___1lb1",modalButtonText:"AdminDashboard_modalButtonText__WshiS",threeToggleContainer:"AdminDashboard_threeToggleContainer__gu382",threeToggleButton:"AdminDashboard_threeToggleButton__vWz_M",threeToggleButtonText:"AdminDashboard_threeToggleButtonText__V4iPF",threeToggleButtonTextActive:"AdminDashboard_threeToggleButtonTextActive__lG7ez",threeToggleIndicator:"AdminDashboard_threeToggleIndicator__YVhRr"}},7200:(e,t,a)=>{"use strict";a.d(t,{A:()=>d});var s=a(5155),r=a(2115),n=a(1065),o=a(1218),i=a(3464),l=a(397),c=a.n(l);let d=e=>{let{onClose:t}=e,{SERVER_URL:a}=(0,n.U)(),{t:l}=(0,o.Bd)(),[d,h]=(0,r.useState)({frontend:[],backend:[],resources:[],apis:[]}),[_,m]=(0,r.useState)(!0),[u,p]=(0,r.useState)("frontend");(0,r.useEffect)(()=>{(async()=>{try{console.log("Fetching licenses from:","".concat(a,"/api/licenses"));let e=await i.A.get("".concat(a,"/api/licenses"));console.log("Licenses received:",e.data),h(e.data)}catch(e){console.error("Error fetching licenses:",e),window.alert(l("error")+": "+l("failed_to_load_licenses"))}finally{m(!1)}})()},[a,l]);let x=d[u];return(0,s.jsx)("div",{className:c().overlay,children:(0,s.jsxs)("div",{className:c().modalContent,children:[(0,s.jsxs)("div",{className:c().header,children:[(0,s.jsx)("div",{className:c().pickerContainer,children:(0,s.jsxs)("select",{className:c().picker,value:u,onChange:e=>p(e.target.value),children:[(0,s.jsx)("option",{value:"frontend",children:l("frontend")}),(0,s.jsx)("option",{value:"backend",children:l("backend")}),(0,s.jsx)("option",{value:"resources",children:l("resources")}),(0,s.jsx)("option",{value:"apis",children:l("external_apis")})]})}),(0,s.jsx)("button",{className:c().closeButton,onClick:t,children:l("close")})]}),_?(0,s.jsx)("div",{className:c().loadingContainer,children:(0,s.jsx)("div",{className:c().spinner})}):(0,s.jsx)("div",{className:c().scrollContent,children:x.map((e,t)=>(0,s.jsxs)("div",{className:c().licenseItem,children:[(0,s.jsx)("p",{className:c().libraryName,children:e.name}),e.version&&(0,s.jsxs)("p",{className:c().licenseType,children:[l("version"),": ",e.version]}),e.license&&(0,s.jsxs)("p",{className:c().licenseType,children:[l("license"),": ",e.license]}),e.details&&(0,s.jsx)("p",{className:c().licenseDetails,children:e.details.startsWith("http")?(0,s.jsx)("a",{href:e.details,target:"_blank",rel:"noopener noreferrer",style:{color:"blue"},children:e.details}):e.details}),e.type&&(0,s.jsxs)("p",{className:c().licenseType,children:[l("type"),": ",e.type]}),e.description&&(0,s.jsx)("p",{className:c().licenseDetails,children:e.description}),e.purpose&&(0,s.jsxs)("p",{className:c().licenseType,children:[l("purpose"),": ",e.purpose]}),e.url&&(0,s.jsx)("p",{className:c().licenseDetails,children:(0,s.jsx)("a",{href:e.url,target:"_blank",rel:"noopener noreferrer",style:{color:"blue"},children:e.url})}),e.note&&(0,s.jsx)("p",{className:c().licenseDetails,children:e.note})]},t))})]})})}},8060:(e,t,a)=>{Promise.resolve().then(a.bind(a,8592))},8592:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>p});var s=a(5155),r=a(2115),n=a(3464),o=a(5695),i=a(4065),l=a(2502),c=a(1065),d=a(1218),h=a(5924),_=a.n(h),m=a(9707),u=a(7200);l.t1.register(l.PP,l.kc,l.FN,l.No,l.Bs,l.hE,l.m_,l.s$);let p=()=>{let{SERVER_URL:e}=(0,c.U)(),{t}=(0,d.Bd)(),a=(0,o.useRouter)(),[l,h]=(0,r.useState)(90),[p,x]=(0,r.useState)(!1),[b,g]=(0,r.useState)(!1);(0,r.useEffect)(()=>{let e=()=>{h(Math.max(90-window.scrollY,0)),x(window.scrollY>50)};return window.addEventListener("scroll",e),()=>window.removeEventListener("scroll",e)},[]);let[j,f]=(0,r.useState)("dashboard"),[N,v]=(0,r.useState)([]),[A,C]=(0,r.useState)(null),[T,D]=(0,r.useState)(null),[y,k]=(0,r.useState)(0),[S,B]=(0,r.useState)(0),[R,w]=(0,r.useState)(0),[E,L]=(0,r.useState)(0),[I,F]=(0,r.useState)(0),[U,W]=(0,r.useState)(!0),[q,O]=(0,r.useState)("error"),P=["All Regions","ap-northeast-2","ap-southeast-2"],[M,J]=(0,r.useState)("All Regions"),[Y,z]=(0,r.useState)([]),[K,V]=(0,r.useState)([]),[Q,G]=(0,r.useState)([]),[X,Z]=(0,r.useState)(!0),[H,$]=(0,r.useState)(!1),[ee,et]=(0,r.useState)(!1),[ea,es]=(0,r.useState)(""),[er,en]=(0,r.useState)(""),[eo,ei]=(0,r.useState)(null),[el,ec]=(0,r.useState)("combined");(0,r.useEffect)(()=>{let t=async()=>{W(!0);try{let t=(await n.A.get("".concat(e,"/api/admin/stats"))).data.allStats||[];if(v(t),t.length>0){let e=t[0];C(e.combined),D(e.byRegion),k(e.retentionRateD7),B(e.retentionRateD30),w(e.viralCoefficient),L(e.networkEffect),F(e.organicGrowthRate)}}catch(e){console.error("Error fetching dashboard data:",e)}finally{W(!1)}};"dashboard"===j&&t()},[e,j]),(0,r.useEffect)(()=>{let t=async()=>{Z(!0);try{if(["error","report","inquiry"].includes(q)){let t=await n.A.get("".concat(e,"/api/admin/reports"));z(t.data.regions||[])}else if("notifications"===q){let t="".concat(e,"/api/admin/nl/adminNotifications");"All Regions"!==M&&(t+="?region=".concat(M));let a=await n.A.get(t);G(a.data||[])}else if("disabledUsers"===q){let t="".concat(e,"/api/admin/users/disabled");"All Regions"!==M&&(t+="?region=".concat(M));let a=await n.A.get(t);V(a.data.regions||[])}}catch(e){console.error("Error fetching reports data:",e)}finally{Z(!1)}};"reports"===j&&t()},[e,q,M,j]);let ed=e=>isNaN(e)||null==e?0:e,eh=e=>isNaN(e)||e===1/0?"N/A":"".concat(e.toFixed(1),"%"),e_=e=>{f(e)},em=["All Regions",...Array.from(new Set(["error","report","inquiry"].includes(q)?Y&&Y.length>0?Y.map(e=>e.region):P:"disabledUsers"===q&&K&&K.length>0?K.map(e=>e.region):P))];return(0,s.jsxs)("div",{className:_().container,children:[(0,s.jsxs)("header",{className:"".concat(_().header," ").concat(p?_().opaque:""),style:{top:"".concat(l,"px")},children:[(0,s.jsx)("button",{className:_().backButton,onClick:()=>{a.back()},children:(0,s.jsx)("img",{src:"/assets/back-light.png",alt:"Back",width:24,height:24})}),(0,s.jsx)("h1",{className:_().headerTitle,children:t("dashboard")}),(0,s.jsx)("button",{className:_().logoutButton,children:t("more")})]}),(0,s.jsxs)("div",{className:_().mainTabContainer,children:[(0,s.jsx)("button",{className:"".concat(_().mainTabButton," ").concat("dashboard"===j?_().activeTab:""),onClick:()=>e_("dashboard"),children:"Dashboard"}),(0,s.jsx)("button",{className:"".concat(_().mainTabButton," ").concat("reports"===j?_().activeTab:""),onClick:()=>e_("reports"),children:"Reports"})]}),"dashboard"===j?(0,s.jsx)("div",{className:_().dashboardContent,children:(()=>{if(U)return(0,s.jsx)("div",{className:_().loader,children:"Loading Dashboard..."});if(!A)return(0,s.jsx)("div",{className:_().error,children:"No dashboard data available"});let e=N.length>0?[...N].reverse():[],t=e.map(e=>e.date.split("T")[0]),a=e.map(e=>ed(e.combined.users.dau)),r=e.map(e=>ed(e.combined.users.mau)),n=e.map(e=>isNaN(100*e.retentionRateD7)?0:100*e.retentionRateD7),o=e.map(e=>isNaN(100*e.retentionRateD30)?0:100*e.retentionRateD30);return(0,s.jsxs)("div",{className:_().dashboardSection,children:[(0,s.jsxs)("div",{className:_().card,children:[(0,s.jsx)("h2",{children:"User Statistics"}),(0,s.jsxs)("p",{children:["Total Users: ",ed(A.users.total)]}),(0,s.jsxs)("p",{children:["DAU: ",ed(A.users.dau)]}),(0,s.jsxs)("p",{children:["MAU: ",ed(A.users.mau)]})]}),(0,s.jsxs)("div",{className:_().chartCard,children:[(0,s.jsx)("h3",{children:"DAU & MAU Trends"}),(0,s.jsx)(i.N1,{data:{labels:t,datasets:[{label:"DAU",data:a,borderColor:"#6C63FF",fill:!1},{label:"MAU",data:r,borderColor:"#FF6B6B",fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1}})]}),(0,s.jsxs)("div",{className:_().chartCard,children:[(0,s.jsx)("h3",{children:"Retention Rates"}),(0,s.jsx)(i.N1,{data:{labels:t,datasets:[{label:"D7 Retention (%)",data:n,borderColor:"#6C63FF",fill:!1},{label:"D30 Retention (%)",data:o,borderColor:"#FF6B6B",fill:!1}]},options:{responsive:!0,maintainAspectRatio:!1}})]}),(0,s.jsxs)("div",{className:_().card,children:[(0,s.jsx)("h3",{children:"Additional Metrics"}),(0,s.jsxs)("p",{children:["D7 Retention Rate: ",eh(100*y)]}),(0,s.jsxs)("p",{children:["D30 Retention Rate: ",eh(100*S)]}),(0,s.jsxs)("p",{children:["Viral Coefficient: ",isNaN(R)?"N/A":R.toFixed(2)]}),(0,s.jsxs)("p",{children:["Network Effect: ",isNaN(E)?"N/A":E.toFixed(2)]}),(0,s.jsxs)("p",{children:["Organic Growth: ",eh(100*I)]})]})]})})()}):(0,s.jsxs)("div",{className:_().reportsContent,children:[(0,s.jsxs)("div",{className:_().pickerContainer,children:[(0,s.jsxs)("select",{className:_().picker,value:q,onChange:e=>O(e.target.value),children:[(0,s.jsx)("option",{value:"error",children:"Error Logs"}),(0,s.jsx)("option",{value:"report",children:"Reports"}),(0,s.jsx)("option",{value:"inquiry",children:"Inquiries"}),(0,s.jsx)("option",{value:"notifications",children:"Notifications"}),(0,s.jsx)("option",{value:"disabledUsers",children:"Disabled Users"})]}),(0,s.jsx)("select",{className:_().picker,value:M,onChange:e=>J(e.target.value),children:em.map(e=>(0,s.jsx)("option",{value:e,children:"All Regions"===e?"All Regions":e},e))})]}),(()=>{if(X)return(0,s.jsx)("div",{className:_().loader,children:"Loading Reports..."});if("error"===q||"report"===q||"inquiry"===q){let e=[];if("All Regions"===M)Y.forEach(t=>{"error"===q?e=e.concat(t.errorLogs||[]):"report"===q?e=e.concat((t.reports||[]).filter(e=>"report"===e.type)):"inquiry"===q&&(e=e.concat((t.reports||[]).filter(e=>"inquiry"===e.type)))});else{let t=Y.find(e=>e.region===M);t&&("error"===q?e=t.errorLogs||[]:"report"===q?e=(t.reports||[]).filter(e=>"report"===e.type):"inquiry"===q&&(e=(t.reports||[]).filter(e=>"inquiry"===e.type)))}return(0,s.jsx)("div",{className:_().reportsContainer,children:0===e.length?(0,s.jsx)("div",{className:_().noDataText,children:"No data available for selected category and region."}):e.map((e,t)=>(0,s.jsxs)("div",{className:_().reportItem,children:[(0,s.jsx)("p",{children:e.message}),(0,s.jsx)("button",{onClick:()=>alert("Respond functionality here"),children:"Respond"})]},t))})}if("notifications"===q)return(0,s.jsx)("div",{className:_().reportsContainer,children:0===Q.length?(0,s.jsx)("div",{className:_().noDataText,children:"No notifications available."}):Q.map((e,t)=>(0,s.jsxs)("div",{className:_().reportItem,children:[(0,s.jsxs)("p",{children:["Title: ",e.title]}),(0,s.jsxs)("p",{children:["Message: ",e.message]}),(0,s.jsxs)("p",{children:["Type: ",e.type]})]},t))});if("disabledUsers"===q){let e=[];if("All Regions"===M)e=K.reduce((e,t)=>e.concat(t.disabledUsers||[]),[]);else{let t=K.find(e=>e.region===M);e=(null==t?void 0:t.disabledUsers)||[]}return(0,s.jsx)("div",{className:_().reportsContainer,children:0===e.length?(0,s.jsx)("div",{className:_().noDataText,children:"No disabled users found."}):e.map((e,t)=>(0,s.jsx)("div",{className:_().reportItem,children:(0,s.jsxs)("p",{children:[e.nickname," (",e.email,")"]})},t))})}return null})()]}),(0,s.jsx)(m.A,{}),b&&(0,s.jsx)("div",{className:_().modalOverlay,onClick:()=>g(!1),children:(0,s.jsx)("div",{className:_().modalContent,onClick:e=>e.stopPropagation(),children:(0,s.jsx)(u.A,{onClose:()=>g(!1)})})})]})}},9707:(e,t,a)=>{"use strict";a.d(t,{A:()=>l});var s=a(5155),r=a(6874),n=a.n(r),o=a(3582),i=a.n(o);function l(){let e=e=>{localStorage.setItem("termsType",e)};return(0,s.jsxs)("footer",{className:i().footer,children:[(0,s.jsxs)("div",{className:i().footerContainer,children:[(0,s.jsxs)("div",{className:i().footerSection,children:[(0,s.jsx)("h3",{className:i().footerTitle,children:"About Abrody"}),(0,s.jsx)("p",{className:i().footerText,children:"Abrody is dedicated to connecting international minds through cultural exchange and real events. Join our community and explore a world of possibilities."})]}),(0,s.jsxs)("div",{className:i().footerSection,children:[(0,s.jsx)("h3",{className:i().footerTitle,children:"Quick Links"}),(0,s.jsxs)("ul",{className:i().footerLinks,children:[(0,s.jsx)("li",{children:(0,s.jsx)(n(),{href:"/about",children:(0,s.jsx)("a",{children:"About Us"})})}),(0,s.jsx)("li",{children:(0,s.jsx)(n(),{href:"/contact",children:(0,s.jsx)("a",{children:"Contact"})})}),(0,s.jsx)("li",{children:(0,s.jsx)(n(),{href:"/faq",children:(0,s.jsx)("a",{children:"FAQ"})})}),(0,s.jsx)("li",{children:(0,s.jsx)(n(),{href:"/terms",children:(0,s.jsx)("a",{onClick:()=>e("service"),children:"Terms of Service"})})}),(0,s.jsx)("li",{children:(0,s.jsx)(n(),{href:"/terms",children:(0,s.jsx)("a",{onClick:()=>e("privacy"),children:"Privacy Policy"})})})]})]}),(0,s.jsxs)("div",{className:i().footerSection,children:[(0,s.jsx)("h3",{className:i().footerTitle,children:"Follow Us"}),(0,s.jsxs)("div",{className:i().socialIcons,children:[(0,s.jsx)("a",{href:"https://twitter.com",target:"_blank",rel:"noopener noreferrer",children:(0,s.jsx)("img",{src:"/icons/twitter.png",alt:"Twitter"})}),(0,s.jsx)("a",{href:"https://facebook.com",target:"_blank",rel:"noopener noreferrer",children:(0,s.jsx)("img",{src:"/icons/facebook.png",alt:"Facebook"})}),(0,s.jsx)("a",{href:"https://instagram.com",target:"_blank",rel:"noopener noreferrer",children:(0,s.jsx)("img",{src:"/icons/instagram.png",alt:"Instagram"})}),(0,s.jsx)("a",{href:"https://www.tiktok.com",target:"_blank",rel:"noopener noreferrer",children:(0,s.jsx)("img",{src:"/icons/tiktok.png",alt:"TikTok"})}),(0,s.jsx)("a",{href:"https://www.youtube.com",target:"_blank",rel:"noopener noreferrer",children:(0,s.jsx)("img",{src:"/icons/youtube.png",alt:"YouTube"})})]})]})]}),(0,s.jsx)("div",{className:i().footerBottom,children:(0,s.jsxs)("p",{children:["\xa9 ",new Date().getFullYear()," Abrody. All rights reserved."]})})]})}}},e=>{var t=t=>e(e.s=t);e.O(0,[651,659,647,874,464,218,431,441,684,358],()=>t(8060)),_N_E=e.O()}]);