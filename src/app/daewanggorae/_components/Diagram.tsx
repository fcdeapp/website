"use client";
import { useEffect, useRef, useState } from "react";
import { content } from "../_lib/content";
import { useLoad } from "../_lib/hooks";
import { parseDiagram } from "../_lib/diagrams/validate";
import { responsiveDiagram } from "../_lib/diagrams/responsive";
import { diagramSvg } from "../_lib/diagrams/svg";
import { useRecords } from "../_lib/store";
import { State } from "./UI";
import s from "../daewanggorae.module.css";
export default function Diagram({ id, alt }: { id: string; alt?: string }) {
  const result = useLoad(async () => {
    const index = await content.read<{
      diagrams: { id: string; path: string }[];
    }>("diagrams/index.json");
    const entry = index.diagrams.find((d) => d.id === id);
    if (!entry) throw new Error("도표를 찾을 수 없습니다.");
    return parseDiagram(await content.read(entry.path), id);
  }, "diagram:" + id);
  const ref = useRef<HTMLDivElement>(null),
    [width, setWidth] = useState(700),
    [zoom, setZoom] = useState(false);
  const records = useRecords();
  const scale = Number(records["preference:settings"]?.data.fontScale) || 1;
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver((e) =>
      setWidth(e[0].contentRect.width),
    );
    observer.observe(node);
    const shell = node.closest("[data-theme]");
    const update = () => setDark(shell?.getAttribute("data-theme") === "dark");
    update();
    const theme = new MutationObserver(update);
    if (shell)
      theme.observe(shell, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    return () => {
      observer.disconnect();
      theme.disconnect();
    };
  }, []);
  const d = result.data && responsiveDiagram(result.data, width, scale);
  const xml = d
    ? diagramSvg(d, {
        surface: dark ? "#172431" : "#ffffff",
        ink: dark ? "#edf2f5" : "#17212b",
        muted: dark ? "#a4b3c0" : "#657482",
        border: dark ? "#334350" : "#e4e8ed",
        primary: dark ? "#8ab8d4" : "#467d9e",
        secondary: "#7a939d",
        tertiary: "#ad8064",
      })
    : "";
  return (
    <figure className={s.figure}>
      <div ref={ref}>
        {d ? (
          <>
            <div className={s.diagramScroll}>
              <div
                role="img"
                aria-label={alt || id}
                className={s.diagramCanvas}
                style={{ width: zoom ? "160%" : "100%" }}
                dangerouslySetInnerHTML={{ __html: xml }}
              />
            </div>
            <button onClick={() => setZoom(!zoom)}>
              {zoom ? "크기 맞춤" : "확대"}
            </button>
          </>
        ) : (
          <State error={result.error} retry={result.retry} />
        )}
      </div>
      {alt && <figcaption>{alt}</figcaption>}
    </figure>
  );
}
