(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[8284],{10255:(e,t,n)=>{"use strict";function r(e){let{moduleIds:t}=e;return null}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"PreloadChunks",{enumerable:!0,get:function(){return r}}),n(95155),n(47650),n(85744),n(20589)},17828:(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"workAsyncStorageInstance",{enumerable:!0,get:function(){return r}});let r=(0,n(64054).createAsyncLocalStorage)()},21044:(e,t,n)=>{"use strict";n.r(t),n.d(t,{default:()=>l});var r=n(36645);let l=n.n(r)()(()=>Promise.all([n.e(2577),n.e(6743),n.e(4935),n.e(3464),n.e(1218),n.e(8082),n.e(1935)]).then(n.bind(n,24316)),{loadableGenerated:{webpack:()=>[24316]},ssr:!1})},36645:(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return l}});let r=n(88229)._(n(67357));function l(e,t){var n;let l={};"function"==typeof e&&(l.loader=e);let u={...l,...t};return(0,r.default)({...u,modules:null==(n=u.loadableGenerated)?void 0:n.modules})}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},50833:(e,t,n)=>{Promise.resolve().then(n.bind(n,21044))},62146:(e,t,n)=>{"use strict";function r(e){let{reason:t,children:n}=e;return n}Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"BailoutToCSR",{enumerable:!0,get:function(){return r}}),n(45262)},64054:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),!function(e,t){for(var n in t)Object.defineProperty(e,n,{enumerable:!0,get:t[n]})}(t,{bindSnapshot:function(){return o},createAsyncLocalStorage:function(){return u},createSnapshot:function(){return a}});let n=Object.defineProperty(Error("Invariant: AsyncLocalStorage accessed in runtime where it is not available"),"__NEXT_ERROR_CODE",{value:"E504",enumerable:!1,configurable:!0});class r{disable(){throw n}getStore(){}run(){throw n}exit(){throw n}enterWith(){throw n}static bind(e){return e}}let l="undefined"!=typeof globalThis&&globalThis.AsyncLocalStorage;function u(){return l?new l:new r}function o(e){return l?l.bind(e):r.bind(e)}function a(){return l?l.snapshot():function(e,...t){return e(...t)}}},67357:(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"default",{enumerable:!0,get:function(){return i}});let r=n(95155),l=n(12115),u=n(62146);function o(e){return{default:e&&"default"in e?e.default:e}}n(10255);let a={loader:()=>Promise.resolve(o(()=>null)),loading:null,ssr:!0},i=function(e){let t={...a,...e},n=(0,l.lazy)(()=>t.loader().then(o)),i=t.loading;function s(e){let o=i?(0,r.jsx)(i,{isLoading:!0,pastDelay:!0,error:null}):null,a=!t.ssr||!!t.loading,s=a?l.Suspense:l.Fragment,c=t.ssr?(0,r.jsxs)(r.Fragment,{children:[null,(0,r.jsx)(n,{...e})]}):(0,r.jsx)(u.BailoutToCSR,{reason:"next/dynamic",children:(0,r.jsx)(n,{...e})});return(0,r.jsx)(s,{...a?{fallback:o}:{},children:c})}return s.displayName="LoadableComponent",s}},85744:(e,t,n)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"workAsyncStorage",{enumerable:!0,get:function(){return r.workAsyncStorageInstance}});let r=n(17828)}},e=>{var t=t=>e(e.s=t);e.O(0,[8441,1684,7358],()=>t(50833)),_N_E=e.O()}]);