"use client";
import { ReaderContext } from "./ReaderContext";
import type { ReaderData } from "../_lib/reader";
import { useEffect, useState, useContext } from "react";
import s from "../daewanggorae.module.css";
declare global {
  interface Window {
    DGText?: {
      markdown: (t: string) => string;
      formula: (t: string) => string;
      reader: (t:string, blockId:string, data:ReaderData|null, enabled:boolean) => Promise<string>;
    };
  }
}
let task: Promise<void> | undefined;
function renderer() {
  return (task ||= new Promise<void>((resolve, reject) => {
    if (window.DGText) {
      resolve();
      return;
    }
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "/daewanggorae/runtime/text.css";
    document.head.appendChild(css);
    const script = document.createElement("script");
    script.src = "/daewanggorae/runtime/text.js";
    script.onload = () => resolve();
    script.onerror = () => {
      task = undefined;
      script.remove();
      reject(new Error("본문 렌더러 로딩 실패"));
    };
    document.head.appendChild(script);
  }));
}
export function Text({
  text,
  formula = false,
  blockId,
}: {
  text: string;
  formula?: boolean;
  blockId?: string;
}) {
  const reader = useContext(ReaderContext);
  const [html, setHtml] = useState("");
  useEffect(() => {
    let active = true;
    setHtml("");
    void renderer()
      .then(async () => {
        const result = formula ? window.DGText!.formula(text) : blockId ? await window.DGText!.reader(text, blockId, reader.data, reader.enabled) : window.DGText!.markdown(text);
        if (active) setHtml(result);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [text, formula, blockId, reader.data, reader.enabled]);
  return html ? (
    <div
      className={formula ? s.formula : s.markdown}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  ) : (
    <div className={s.markdown} style={{ whiteSpace: "pre-wrap" }}>
      {text}
    </div>
  );
}
