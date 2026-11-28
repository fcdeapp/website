"use client";
import { useEffect, useRef, useState } from "react";
import type { Evidence as Item } from "../_lib/questions/model";
import { evidenceDocument } from "../_lib/questions/render";
import { prepareEvidence } from "../_lib/questions/compiledEvidence";
import { State } from './UI';
export default function Evidence({items, markup}: {items: Item[]; markup?: string[]}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(400);
  const [html,setHTML] = useState(''),[error,setError]=useState(''),[retry,setRetry]=useState(0);
  useEffect(()=>{
    let live=true;setHTML('');setError('');
    void prepareEvidence(items).then(()=>{if(live)setHTML(evidenceDocument(items,undefined,markup));}).catch(e=>{if(live)setError(String(e));});
    return()=>{live=false;};
  },[items,markup,retry]);
  useEffect(() => {
    const listener = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data?.daewanggorae) return;
      const h = e.data.payload?.height;
      if (typeof h === "number" && Number.isFinite(h)) setHeight(Math.max(80, Math.min(h, 30000)));
    };
    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);
  if (!items.length) return null;
  if(!html)return <State error={error} retry={()=>setRetry(n=>n+1)} />;
  return <iframe ref={frame} title="문항 자료" srcDoc={html} sandbox="allow-scripts" style={{display:"block",width:"100%",height,border:0,margin:"24px 0"}} />;
}
