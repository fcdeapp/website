(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[520],{3563:(e,t,s)=>{Promise.resolve().then(s.bind(s,3962))},3962:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>c});var a=s(5155),r=s(2115),n=s(6874),l=s.n(n),i=s(8999),o=s(8217),_=s.n(o);let g=[{label:"Min 8 characters",regex:/^.{8,}$/},{label:"Uppercase letter",regex:/[A-Z]/},{label:"Lowercase letter",regex:/[a-z]/},{label:"Number",regex:/\d/},{label:"Special character",regex:/[^A-Za-z0-9]/}];function c(){let e=(0,i.useRouter)(),[t,s]=(0,r.useState)(""),[n,o]=(0,r.useState)(""),[c,u]=(0,r.useState)(!1),[h,d]=(0,r.useState)(!1),[p,b]=(0,r.useState)(!1),m=g.filter(e=>e.regex.test(n)).length;(0,r.useEffect)(()=>{u(t.length>=6&&m===g.length)},[t,m]);let x=async s=>{if(s.preventDefault(),c)try{let s=await fetch("".concat("https://fcde.app","/auth/web/login"),{method:"POST",headers:{"Content-Type":"application/json"},credentials:"include",body:JSON.stringify({username:t,password:n})}),a=await s.json();s.ok?e.push("/"):alert(a.message||"Login failed")}catch(e){console.error("Login error",e),alert("Network error — please try again.")}};return(0,a.jsx)("main",{className:_().container,children:(0,a.jsxs)("form",{className:_().form,onSubmit:x,noValidate:!0,children:[(0,a.jsx)("h1",{className:_().title,children:"Sign In to Facade"}),(0,a.jsx)("label",{className:_().label,children:"Username"}),(0,a.jsx)("input",{className:_().input,type:"text",value:t,onChange:e=>s(e.target.value)}),(0,a.jsx)("label",{className:_().label,children:"Password"}),(0,a.jsxs)("div",{className:_().passwordWrapper,children:[(0,a.jsx)("input",{className:_().input,type:p?"text":"password",value:n,onChange:e=>o(e.target.value),onFocus:()=>d(!0),onBlur:()=>d(!1)}),(0,a.jsx)("button",{type:"button",className:_().toggleButton,onClick:()=>b(e=>!e),children:p?"Hide Password":"Show Password"})]}),h&&(0,a.jsx)("ul",{className:_().rules,children:g.map(e=>(0,a.jsx)("li",{className:e.regex.test(n)?_().rulePass:_().ruleFail,children:e.label},e.label))}),(0,a.jsx)("div",{className:_().strengthBar,children:(0,a.jsx)("div",{className:_()["strength".concat(m)]})}),(0,a.jsx)("button",{type:"submit",className:_().submit,disabled:!c,children:"Login"}),(0,a.jsxs)("p",{className:_().footer,children:["Don’t have an account?"," ",(0,a.jsx)(l(),{href:"/signup",children:"Sign Up"})]})]})})}},8217:e=>{e.exports={container:"Login_container__9yYxU",form:"Login_form__tGt_D",passwordWrapper:"Login_passwordWrapper__3dMMG",toggleButton:"Login_toggleButton__xWONT",title:"Login_title__BQPlY",label:"Login_label___fL39",input:"Login_input__qKd8b",rules:"Login_rules___HJ4d",rulePass:"Login_rulePass__sMOhx",ruleFail:"Login_ruleFail__lcKj2",strengthBar:"Login_strengthBar__j_tO4",strength0:"Login_strength0__nFpYb",strength1:"Login_strength1__XHSr_",strength2:"Login_strength2__2vb8T",strength3:"Login_strength3__Sw580",strength4:"Login_strength4___spfu",strength5:"Login_strength5__rNgE8",submit:"Login_submit__wr6H4",footer:"Login_footer__ZEN7M"}}},e=>{var t=t=>e(e.s=t);e.O(0,[166,874,441,684,358],()=>t(3563)),_N_E=e.O()}]);