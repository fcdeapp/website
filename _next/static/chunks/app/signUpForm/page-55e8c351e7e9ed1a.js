(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[673],{150:(e,r,a)=>{Promise.resolve().then(a.bind(a,8743))},5695:(e,r,a)=>{"use strict";var t=a(8999);a.o(t,"usePathname")&&a.d(r,{usePathname:function(){return t.usePathname}}),a.o(t,"useRouter")&&a.d(r,{useRouter:function(){return t.useRouter}}),a.o(t,"useSearchParams")&&a.d(r,{useSearchParams:function(){return t.useSearchParams}})},6319:e=>{e.exports={container:"SignUpForm_container__RB_F3",form:"SignUpForm_form__Etc9w",title:"SignUpForm_title__D_Clj",stepIndicator:"SignUpForm_stepIndicator__aY6Y3",stepContainer:"SignUpForm_stepContainer__3MzzI",label:"SignUpForm_label__3eKOM",input:"SignUpForm_input__fEOhG",checkButton:"SignUpForm_checkButton__2I3q7",sendCodeButton:"SignUpForm_sendCodeButton__F2ixQ",verifyCodeButton:"SignUpForm_verifyCodeButton__xGPJ_",verificationContainer:"SignUpForm_verificationContainer__GCZqF",inputWithToggle:"SignUpForm_inputWithToggle__ldiKY",strengthBarContainer:"SignUpForm_strengthBarContainer__xhkAc",strengthBarBackground:"SignUpForm_strengthBarBackground__fuVf7",strengthBarFill:"SignUpForm_strengthBarFill__nZMza",strengthText:"SignUpForm_strengthText__L1Wcl",violationsList:"SignUpForm_violationsList__xUNwE",violationItem:"SignUpForm_violationItem__zUmyA",agreementRow:"SignUpForm_agreementRow__zv_ln",agreementLabel:"SignUpForm_agreementLabel__xfCRM",navigationButtons:"SignUpForm_navigationButtons__4X5pn",navButton:"SignUpForm_navButton__BaU21",warningText:"SignUpForm_warningText__ZTdwv",footer:"SignUpForm_footer__DOodr",footerLink:"SignUpForm_footerLink__v_T4l"}},8743:(e,r,a)=>{"use strict";a.r(r),a.d(r,{default:()=>h});var t=a(5155),s=a(2115),n=a(6874),i=a.n(n),o=a(5695),l=a(3464),c=a(1218),d=a(6319),u=a.n(d);let m=/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,p=/^\d{6}$/,_=(e,r)=>{let a=[];e.length<8&&a.push(r("password_rule_min_length")||"Minimum 8 characters required"),/[A-Z]/.test(e)||a.push(r("password_rule_uppercase")||"At least one uppercase letter required"),/[a-z]/.test(e)||a.push(r("password_rule_lowercase")||"At least one lowercase letter required"),/[0-9]/.test(e)||a.push(r("password_rule_number")||"At least one number required"),/[^A-Za-z0-9]/.test(e)||a.push(r("password_rule_special")||"At least one special character required");let t=5-a.length,s="";return t<=2?s=r("password_strength_weak")||"Weak":3===t||4===t?s=r("password_strength_medium")||"Medium":5===t&&(s=r("password_strength_strong")||"Strong"),{strength:s,progress:t/5*100,violations:a}};function h(){let{t:e}=(0,c.Bd)(),r=(0,o.useRouter)(),[a,n]=(0,s.useState)(1),[d,h]=(0,s.useState)({username:"",email:"",verificationCode:"",password:"",confirmPassword:""}),[g,v]=(0,s.useState)(""),[f,x]=(0,s.useState)(!1),[w,j]=(0,s.useState)(!1),[C,S]=(0,s.useState)(!1),[b,y]=(0,s.useState)(!1),[N,k]=(0,s.useState)({strength:"",progress:0,violations:[]}),[F,B]=(0,s.useState)(!1),[U,P]=(0,s.useState)(!1),[A,q]=(0,s.useState)(!1),[E,T]=(0,s.useState)(!1),[I,L]=(0,s.useState)(!1),R=(e,r)=>{h(a=>({...a,[e]:r}))};(0,s.useEffect)(()=>{d.username.trim().length>=6?x(!0):x(!1)},[d.username]),(0,s.useEffect)(()=>{S(m.test(d.email))},[d.email]),(0,s.useEffect)(()=>{y(p.test(d.verificationCode))},[d.verificationCode]),(0,s.useEffect)(()=>{k(_(d.password,e))},[d.password,e]),(0,s.useEffect)(()=>{L(F&&U&&A)},[F,U,A]);let z=async()=>{if(!C){v(e("invalid_email_format")||"Invalid email format");return}try{await l.A.post("".concat("https://fcde.app","/password/request-register-otp"),{email:d.email},{headers:{"Content-Type":"application/json"}}),v(e("code_sent")||"Verification code sent to your email")}catch(t){var r,a;v((null===(a=t.response)||void 0===a?void 0:null===(r=a.data)||void 0===r?void 0:r.message)||e("error_occurred")||"An error occurred")}},M=async()=>{if(!b){v(e("invalid_code_format")||"Invalid verification code format");return}try{let r=await l.A.post("".concat("https://fcde.app","/password/verify-register-otp"),{email:d.email,otp:d.verificationCode},{headers:{"Content-Type":"application/json"}});200===r.status?(v(e("code_verified")||"Verification code verified"),j(!0)):(v(r.data.message||e("error_occurred")||"An error occurred"),j(!1))}catch(t){var r,a;v((null===(a=t.response)||void 0===a?void 0:null===(r=a.data)||void 0===r?void 0:r.message)||e("error_occurred")||"An error occurred"),j(!1)}},O=async()=>{if(!I){v(e("required_agreements")||"You must agree to all required terms");return}if(d.password!==d.confirmPassword){v(e("passwords_do_not_match")||"Passwords do not match");return}try{let a=await l.A.post("".concat("https://fcde.app","/auth/register"),{username:d.username,email:d.email,password:d.password},{headers:{"Content-Type":"application/json"}});201===a.status?(alert(e("sign_up_success")||"Sign Up Successful! You can now log in."),r.push("/login")):v(a.data.message||e("server_error")||"A server error occurred")}catch(r){var a,t;v((null===(t=r.response)||void 0===t?void 0:null===(a=t.data)||void 0===a?void 0:a.message)||e("server_error")||"A server error occurred")}};return(0,t.jsx)("main",{className:u().container,children:(0,t.jsxs)("form",{className:u().form,onSubmit:e=>{e.preventDefault(),O()},children:[(0,t.jsx)("h1",{className:u().title,children:"Sign Up for Facade"}),(0,t.jsxs)("div",{className:u().stepIndicator,children:["Step ",a," of 3"]}),1===a&&(0,t.jsxs)("div",{className:u().stepContainer,children:[(0,t.jsx)("label",{className:u().label,children:"Username"}),(0,t.jsx)("input",{className:u().input,type:"text",placeholder:"Enter username",value:d.username,onChange:e=>R("username",e.target.value)}),(0,t.jsx)("button",{type:"button",className:u().checkButton,onClick:()=>x(!0),children:e("check_username")||"Check Username"}),(0,t.jsx)("label",{className:u().label,children:"Email"}),(0,t.jsx)("input",{className:u().input,type:"email",placeholder:"Enter email",value:d.email,onChange:e=>R("email",e.target.value)}),(0,t.jsxs)("div",{className:u().verificationContainer,children:[(0,t.jsx)("input",{className:u().input,type:"text",placeholder:"Enter verification code",value:d.verificationCode,onChange:e=>R("verificationCode",e.target.value)}),(0,t.jsx)("button",{type:"button",className:u().sendCodeButton,onClick:z,children:e("send_code")||"Send Code"}),(0,t.jsx)("button",{type:"button",className:u().verifyCodeButton,onClick:M,children:e("verify_code")||"Verify Code"})]})]}),2===a&&(0,t.jsxs)("div",{className:u().stepContainer,children:[(0,t.jsx)("label",{className:u().label,children:"Password"}),(0,t.jsx)("div",{className:u().inputWithToggle,children:(0,t.jsx)("input",{className:u().input,type:"password",placeholder:"Enter password",value:d.password,onChange:e=>R("password",e.target.value)})}),(0,t.jsxs)("div",{className:u().strengthBarContainer,children:[(0,t.jsx)("div",{className:u().strengthBarBackground,children:(0,t.jsx)("div",{className:u().strengthBarFill,style:{width:"".concat(N.progress,"%")}})}),(0,t.jsxs)("div",{className:u().strengthText,children:[e("password_strength"),": ",N.strength]})]}),N.violations.length>0&&(0,t.jsx)("ul",{className:u().violationsList,children:N.violations.map((e,r)=>(0,t.jsxs)("li",{className:u().violationItem,children:["- ",e]},r))}),(0,t.jsx)("label",{className:u().label,children:"Confirm Password"}),(0,t.jsx)("input",{className:u().input,type:"password",placeholder:"Confirm password",value:d.confirmPassword,onChange:e=>R("confirmPassword",e.target.value)})]}),3===a&&(0,t.jsxs)("div",{className:u().stepContainer,children:[(0,t.jsxs)("div",{className:u().agreementRow,children:[(0,t.jsx)("input",{type:"checkbox",id:"privacy",checked:F,onChange:()=>B(e=>!e)}),(0,t.jsx)("label",{htmlFor:"privacy",className:u().agreementLabel,children:e("agree_to_privacy_policy")||"I agree to the Privacy Policy"})]}),(0,t.jsxs)("div",{className:u().agreementRow,children:[(0,t.jsx)("input",{type:"checkbox",id:"service",checked:U,onChange:()=>P(e=>!e)}),(0,t.jsx)("label",{htmlFor:"service",className:u().agreementLabel,children:e("agree_to_service_terms")||"I agree to the Service Terms"})]}),(0,t.jsxs)("div",{className:u().agreementRow,children:[(0,t.jsx)("input",{type:"checkbox",id:"community",checked:A,onChange:()=>q(e=>!e)}),(0,t.jsx)("label",{htmlFor:"community",className:u().agreementLabel,children:e("agree_to_community_terms")||"I agree to the Community Terms"})]}),(0,t.jsxs)("div",{className:u().agreementRow,children:[(0,t.jsx)("input",{type:"checkbox",id:"advertising",checked:E,onChange:()=>T(e=>!e)}),(0,t.jsx)("label",{htmlFor:"advertising",className:u().agreementLabel,children:e("agree_to_advertising_terms")||"I agree to receive Advertising Communications"})]}),(0,t.jsxs)("div",{className:u().agreementRow,children:[(0,t.jsx)("input",{type:"checkbox",id:"all",checked:I,onChange:()=>{let e=!I;B(e),P(e),q(e),L(e)}}),(0,t.jsx)("label",{htmlFor:"all",className:u().agreementLabel,children:e("agree_all")||"Agree to all"})]})]}),(0,t.jsxs)("div",{className:u().navigationButtons,children:[a>1&&(0,t.jsx)("button",{type:"button",className:u().navButton,onClick:()=>{v(""),n(e=>e-1)},children:e("back")||"Back"}),a<3&&(0,t.jsx)("button",{type:"button",className:u().navButton,onClick:()=>{if(1===a){if(!d.username.trim()||!d.email.trim()){v(e("fill_required_fields")||"Please fill in all required fields");return}if(!f){v(e("username_check_required")||"Please check username availability");return}if(d.email.trim()&&!w){v(e("otp_verification_required")||"Please verify your email");return}}if(2===a){if(!d.password||!d.confirmPassword){v(e("fill_required_fields")||"Please fill in all required fields");return}if(d.password!==d.confirmPassword){v(e("passwords_do_not_match")||"Passwords do not match");return}if(N.progress<80){v(e("password_strength_requirement")||"Password must satisfy more rules");return}}v(""),n(e=>e+1)},disabled:1===a&&(!d.username||!d.email)||1===a&&d.email&&!w||2===a&&(!d.password||!d.confirmPassword||d.password!==d.confirmPassword||N.progress<80),children:e("next")||"Next"}),3===a&&(0,t.jsx)("button",{type:"submit",className:u().navButton,children:e("submit")||"Submit"})]}),g&&(0,t.jsx)("p",{className:u().warningText,children:g}),(0,t.jsxs)("div",{className:u().footer,children:[(0,t.jsx)("p",{children:e("already_have_account")||"Already have an account?"}),(0,t.jsx)(i(),{href:"/login",children:(0,t.jsx)("a",{className:u().footerLink,children:e("sign_in")||"Sign In"})})]})]})})}}},e=>{var r=r=>e(e.s=r);e.O(0,[608,874,464,218,441,684,358],()=>r(150)),_N_E=e.O()}]);