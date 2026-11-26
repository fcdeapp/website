"use client";
import { useState } from "react";
import Link from "next/link";
import type {
  QuestionMediaCollection,
  QuestionMedia as Media,
} from "../_lib/schemas/question-media";
import { mediaAtStage } from "../_lib/questionMedia";
import { Table } from "./Blocks";
import Diagram from "./Diagram";
import SceneViewer from "./SceneViewer";
import { url } from "./UI";
import s from "../daewanggorae.module.css";
export default function QuestionMedia({
  media,
  stage,
}: {
  media?: QuestionMediaCollection;
  stage: Media["stage"];
}) {
  const [open, setOpen] = useState("");
  return (
    <>
      {mediaAtStage(media, stage).map((item) => (
        <figure key={item.id} className={s.figure}>
          {item.type === "table" && (
            <Table
              data={{
                title: item.title,
                columns: item.columns.map(
                  (c) => c.label + (c.unit ? " (" + c.unit + ")" : ""),
                ),
                rows: item.rows.map((r) => r.cells),
              }}
            />
          )}
          {item.type === "diagram" && <Diagram id={item.diagramRef} />}
          {item.type === "anatomy3d" && (
            <>
              <h3>{item.title}</h3>
              <button onClick={() => setOpen(open === item.id ? "" : item.id)}>
                {open === item.id ? "3D 닫기" : "3D로 살펴보기"}
              </button>
              {open === item.id && <SceneViewer sceneId={item.sceneRef} />}
            </>
          )}
          {item.caption && <figcaption>{item.caption}</figcaption>}
          {item.sourceRefs?.map((id, i) => (
            <Link
              key={id}
              className={s.button}
              href={url("sources") + "?id=" + encodeURIComponent(id)}
            >
              자료 출처 {i + 1}
            </Link>
          ))}
        </figure>
      ))}
    </>
  );
}
