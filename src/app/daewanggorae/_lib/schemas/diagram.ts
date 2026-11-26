/** Coordinates are diagram-local units; node x/y denote the centre of the box. */
export type Point = { x: number; y: number };
export type Tone = "primary" | "secondary" | "tertiary";
export type DiagramText =
  | string
  | {
      parts: (
        string | { path: string; decimals?: number; multiplier?: number }
      )[];
    };
export type DiagramNode = Point & {
  id: string;
  label: string;
  width: number;
  height: number;
};
export type DiagramEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  relation: "directed" | "inhibitory" | "bidirectional";
  /** Intermediate routing points; endpoints follow the source/target boxes. */
  via?: Point[];
  labelPosition?: Point;
};
export type Axis = {
  min: number;
  max: number;
  scale: "linear" | "log";
  ticks: number[];
  label: string;
};
export type PlotArea = Point & { width: number; height: number };
type Canvas = { width: number; height: number };
export type DiagramRender = {
  canvas: Canvas;
  notes?: DiagramText[];
} & (
  | {
      type: "graph";
      fontSize?: number;
      compact?: {
        canvas: Canvas;
        fontSize: number;
        nodes: Record<string, Point & { width: number; height: number }>;
        edges?: Record<string, { via?: Point[]; labelPosition?: Point }>;
      };
    }
  | {
      type: "line";
      plot: PlotArea;
      xAxis: Axis;
      yAxis: Axis;
      series: {
        id: string;
        label: string;
        samplesPath: string;
        xKey: string;
        yKey: string;
        tone: Tone;
      }[];
    }
  | {
      type: "bars";
      plot: PlotArea;
      xAxis: Axis;
      rows: {
        id: string;
        label: DiagramText;
        y: number;
        height: number;
        segments: { label: string; valuePath: string; tone: Tone }[];
      }[];
    }
);
export interface DiagramDocument {
  schemaVersion: "2.0.0";
  id: string;
  lessonId: string;
  title: string;
  nodes?: DiagramNode[];
  edges?: DiagramEdge[];
  render: DiagramRender;
  limitations: string[];
  /** Existing scientific data and provenance remain at their original keys. */
  [key: string]: unknown;
}
