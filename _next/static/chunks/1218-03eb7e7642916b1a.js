(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1218],{70762:e=>{e.exports={area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0}},91218:(e,n,t)=>{"use strict";let r;t.d(n,{xC:()=>U,r9:()=>L,Bd:()=>R});var s=t(12115),a=t(70762),i=t.n(a),l=/\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g;Object.create(null);let o=(e,n,t,r)=>{let s=[t,{code:n,...r||{}}];if(e?.services?.logger?.forward)return e.services.logger.forward(s,"warn","react-i18next::",!0);m(s[0])&&(s[0]=`react-i18next:: ${s[0]}`),e?.services?.logger?.warn?e.services.logger.warn(...s):console?.warn&&console.warn(...s)},u={},c=(e,n,t,r)=>{m(t)&&u[t]||(m(t)&&(u[t]=new Date),o(e,n,t,r))},p=(e,n)=>()=>{if(e.isInitialized)n();else{let t=()=>{setTimeout(()=>{e.off("initialized",t)},0),n()};e.on("initialized",t)}},g=(e,n,t)=>{e.loadNamespaces(n,p(e,t))},d=(e,n,t,r)=>{if(m(t)&&(t=[t]),e.options.preload&&e.options.preload.indexOf(n)>-1)return g(e,t,r);t.forEach(n=>{0>e.options.ns.indexOf(n)&&e.options.ns.push(n)}),e.loadLanguages(n,p(e,r))},f=(e,n,t={})=>n.languages&&n.languages.length?n.hasLoadedNamespace(e,{lng:t.lng,precheck:(n,r)=>{if(t.bindI18n?.indexOf("languageChanging")>-1&&n.services.backendConnector.backend&&n.isLanguageChangingTo&&!r(n.isLanguageChangingTo,e))return!1}}):(c(n,"NO_LANGUAGES","i18n.languages were undefined or empty",{languages:n.languages}),!0),m=e=>"string"==typeof e,h=e=>"object"==typeof e&&null!==e,y=/&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g,N={"&amp;":"&","&#38;":"&","&lt;":"<","&#60;":"<","&gt;":">","&#62;":">","&apos;":"'","&#39;":"'","&quot;":'"',"&#34;":'"',"&nbsp;":" ","&#160;":" ","&copy;":"\xa9","&#169;":"\xa9","&reg;":"\xae","&#174;":"\xae","&hellip;":"…","&#8230;":"…","&#x2F;":"/","&#47;":"/"},b=e=>N[e],E={bindI18n:"languageChanged",bindI18nStore:"",transEmptyNodeValue:"",transSupportBasicHtmlNodes:!0,transWrapTextNodes:"",transKeepBasicHtmlNodesFor:["br","strong","i","p"],useSuspense:!0,unescape:e=>e.replace(y,b)},w=(e={})=>{E={...E,...e}},k=()=>E,x=(e,n)=>{if(!e)return!1;let t=e.props?.children??e.children;return n?t.length>0:!!t},O=e=>{if(!e)return[];let n=e.props?.children??e.children;return e.props?.i18nIsDynamicList?I(n):n},C=e=>Array.isArray(e)&&e.every(isValidElement),I=e=>Array.isArray(e)?e:[e],T=(e,n)=>{let t={...n};return t.props=Object.assign(e.props,n.props),t},v=(e,n,t)=>{let r=e.key||n,s=cloneElement(e,{key:r});return!s.props||!s.props.children||0>t.indexOf(`${n}/>`)&&0>t.indexOf(`${n} />`)?s:createElement(function(){return createElement(Fragment,null,s)},{key:r})},A=(e,n)=>e.map((e,t)=>v(e,t,n)),S=(e,n)=>{let t={};return Object.keys(e).forEach(r=>{Object.assign(t,{[r]:v(e[r],r,n)})}),t},_=e=>{r=e},j=()=>r,L={type:"3rdParty",init(e){w(e.options.react),_(e)}},z=(0,s.createContext)();class F{constructor(){this.usedNamespaces={}}addUsedNamespaces(e){e.forEach(e=>{this.usedNamespaces[e]||(this.usedNamespaces[e]=!0)})}getUsedNamespaces(){return Object.keys(this.usedNamespaces)}}let P=(e,n)=>{let t=(0,s.useRef)();return(0,s.useEffect)(()=>{t.current=n?t.current:e},[e,n]),t.current},$=(e,n,t,r)=>e.getFixedT(n,t,r),D=(e,n,t,r)=>(0,s.useCallback)($(e,n,t,r),[e,n,t,r]),R=(e,n={})=>{let{i18n:t}=n,{i18n:r,defaultNS:a}=(0,s.useContext)(z)||{},i=t||r||j();if(i&&!i.reportNamespaces&&(i.reportNamespaces=new F),!i){c(i,"NO_I18NEXT_INSTANCE","useTranslation: You will need to pass in an i18next instance by using initReactI18next");let e=(e,n)=>m(n)?n:h(n)&&m(n.defaultValue)?n.defaultValue:Array.isArray(e)?e[e.length-1]:e,n=[e,{},!1];return n.t=e,n.i18n={},n.ready=!1,n}i.options.react?.wait&&c(i,"DEPRECATED_OPTION","useTranslation: It seems you are still using the old wait option, you may migrate to the new useSuspense behaviour.");let l={...k(),...i.options.react,...n},{useSuspense:o,keyPrefix:u}=l,p=e||a||i.options?.defaultNS;p=m(p)?[p]:p||["translation"],i.reportNamespaces.addUsedNamespaces?.(p);let y=(i.isInitialized||i.initializedStoreOnce)&&p.every(e=>f(e,i,l)),N=D(i,n.lng||null,"fallback"===l.nsMode?p:p[0],u),b=()=>N,E=()=>$(i,n.lng||null,"fallback"===l.nsMode?p:p[0],u),[w,x]=(0,s.useState)(b),O=p.join();n.lng&&(O=`${n.lng}${O}`);let C=P(O),I=(0,s.useRef)(!0);(0,s.useEffect)(()=>{let{bindI18n:e,bindI18nStore:t}=l;I.current=!0,y||o||(n.lng?d(i,n.lng,p,()=>{I.current&&x(E)}):g(i,p,()=>{I.current&&x(E)})),y&&C&&C!==O&&I.current&&x(E);let r=()=>{I.current&&x(E)};return e&&i?.on(e,r),t&&i?.store.on(t,r),()=>{I.current=!1,i&&e?.split(" ").forEach(e=>i.off(e,r)),t&&i&&t.split(" ").forEach(e=>i.store.off(e,r))}},[i,O]),(0,s.useEffect)(()=>{I.current&&y&&x(b)},[i,u,y]);let T=[w,i,y];if(T.t=w,T.i18n=i,T.ready=y,y||!y&&!o)return T;throw new Promise(e=>{n.lng?d(i,n.lng,p,()=>e()):g(i,p,()=>e())})};function U({i18n:e,defaultNS:n,children:t}){let r=(0,s.useMemo)(()=>({i18n:e,defaultNS:n}),[e,n]);return(0,s.createElement)(z.Provider,{value:r},t)}}}]);