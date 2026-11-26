import type { QuestionMediaCollection } from "./question-media";
export type ID = string;
export type Vec3 = [number, number, number];
export type Verification = {
  status: "draft" | "source_checked" | "expert_reviewed";
  lastChecked: string | null;
  unresolvedIssues: string[];
};
type Base = {
  id: ID;
  conceptRefs?: ID[];
  sceneRefs?: ID[];
  sourceRefs?: ID[];
  verificationStatus?: string;
};
type TextKind =
  | "paragraph"
  | "definition"
  | "clinicalPearl"
  | "warning"
  | "memorization"
  | "misconception"
  | "explanation";
type StructuredKind =
  | "table"
  | "comparison"
  | "derivation"
  | "process"
  | "flowchart"
  | "clinicalCase"
  | "diagnosticAlgorithm"
  | "treatmentAlgorithm";
export type ContentBlock = Base &
  (
    | { type: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
    | { type: TextKind; markdown: string }
    | {
        type: "equation";
        latex: string;
        variables: Record<string, string>;
        assumptions: string[];
      }
    | { type: StructuredKind; data: Record<string, unknown> }
    | { type: "anatomy3d"; sceneRef: ID }
    | { type: "diagram"; diagramRef: ID; path: string; alt: string }
    | {
        type: "image";
        path: string;
        alt: string;
        sourceRef: ID;
        license: string;
      }
    | { type: "question"; questionRef: ID }
    | { type: "reference"; sourceRef: ID }
  );
export interface Lesson {
  schemaVersion: "1.0.0";
  id: ID;
  subjectId: ID;
  chapterId: ID;
  title: { ko: string; en: string };
  learningObjectives: { id: ID; text: string }[];
  blocks: ContentBlock[];
  verification: Verification;
  prerequisites?: ID[];
  relatedLessons?: ID[];
  keyFacts?: string[];
  reviewQuestions?: ID[];
  references?: { sourceRef: ID; use: string }[];
  glossary?: Record<string, unknown>[];
  path?: string;
  copyrightStatus?: string;
}
export interface Bounds {
  min: Vec3;
  max: Vec3;
}
export interface Model {
  id: ID;
  elementId: string;
  tree: "partof" | "isa";
  path: string;
  sha256: string;
  bounds: Bounds;
  center: Vec3;
  unit: "mm";
  vertexCount: number;
  faceCount: number;
}
export interface Concept {
  id: ID;
  fmaId: ID;
  nameEn: string;
  nameKo: string | null;
  synonyms: string[];
  preferredTree: "partof" | "isa" | null;
  meshes: Partial<Record<"partof" | "isa", ID[]>>;
  parents: Record<"partof" | "isa", ID[]>;
  children: Record<"partof" | "isa", ID[]>;
  laterality: "left" | "right" | "unspecified";
}
export interface Scene {
  schemaVersion: "1.0.0";
  id: ID;
  sceneId: ID;
  lessonId: ID;
  triggerBlockId: ID;
  primaryStructures: ID[];
  contextStructures: ID[];
  highlightStructures: ID[];
  modelIds: ID[];
  modelPaths: string[];
  cameraPosition: Vec3;
  cameraTarget: Vec3;
  cameraUp: Vec3;
  cameraFovDegrees: number;
  autoFit: boolean;
  bounds: Bounds;
  opacity: { primary: number; context: number };
  color: { primary: string; context: string };
  transitionDuration: number;
  easing: string;
  educationalPurpose: string;
  verificationStatus: string;
  visualizationLimitations: string[];
  dynamicAnatomyIncluded: false;
}
export interface Question {
  id: ID;
  kind: "original_concept_question";
  lessonId: ID;
  prompt: string;
  options: { id: string; text: string }[];
  answer: string;
  explanation: string;
  optionRationales: Record<string, string>;
  verificationStatus: string;
  media?: QuestionMediaCollection;
}
export interface LearnerProgress {
  userId: string;
  lessonId: ID;
  lastBlockId?: ID;
  completedObjectiveIds: ID[];
  answeredQuestionIds: ID[];
  updatedAt: string;
}
