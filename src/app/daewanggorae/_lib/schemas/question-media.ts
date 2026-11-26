/** Optional, additive contract. Legacy questions without media remain valid. */
type MediaBase = {
  id: string;
  stage: "question" | "explanation";
  caption?: string;
  sourceRefs?: string[];
};
export type QuestionMedia = MediaBase &
  (
    | {
        type: "table";
        title: string;
        columns: { id: string; label: string; unit?: string }[];
        rows: { id: string; cells: (string | number)[] }[];
      }
    | { type: "diagram"; diagramRef: string }
    | { type: "anatomy3d"; title: string; sceneRef: string }
  );
export type QuestionMediaCollection = {
  schemaVersion: "1.0.0";
  items: QuestionMedia[];
};
