import type { DiagramDocument } from "../schemas/diagram";
import { wrapLabel } from "./geometry";

/** Select authored geometry; never infer new medical edges or change scientific values. */
export function responsiveDiagram(
  document: DiagramDocument,
  width: number,
  fontScale = 1,
): DiagramDocument {
  const r = document.render;
  if (r.type !== "graph") {
    const canvasWidth = Math.max(
      360,
      Math.min(1100, (width * 20) / (14 * fontScale)),
    );
    if (r.type === "line") {
      const plot = {
        x: 85,
        y: 25,
        width: canvasWidth - 115,
        height: Math.max(260, Math.min(420, canvasWidth * 0.6)),
      };
      return {
        ...document,
        render: {
          ...r,
          plot,
          canvas: {
            width: canvasWidth,
            height:
              plot.y +
              plot.height +
              85 +
              wrapLabel(r.xAxis.label, plot.width, 19).length * 23 +
              (r.series.length - 1) * 34 +
              30,
          },
        },
      };
    }
    const plot = {
      x: 20,
      y: 25,
      width: canvasWidth - 55,
      height: r.rows.length * 150,
    };
    const legendCount = new Set(
      r.rows.flatMap((row) => row.segments.map((s) => s.label)),
    ).size;
    return {
      ...document,
      render: {
        ...r,
        plot,
        rows: r.rows.map((row, i) => ({ ...row, y: 65 + i * 150, height: 46 })),
        canvas: {
          width: canvasWidth,
          height:
            plot.y +
            plot.height +
            85 +
            wrapLabel(r.xAxis.label, plot.width, 19).length * 23 +
            (legendCount - 1) * 36 +
            30,
        },
      },
    };
  }
  if (!r.compact || width / fontScale >= 700) return document;
  return {
    ...document,
    nodes: document.nodes!.map((node) => ({
      ...node,
      ...r.compact!.nodes[node.id],
    })),
    edges: document.edges!.map((edge) => ({
      ...edge,
      via: undefined,
      labelPosition: undefined,
      ...r.compact!.edges?.[edge.id],
    })),
    render: {
      ...r,
      compact: undefined,
      canvas: r.compact.canvas,
      fontSize: r.compact.fontSize,
    },
  };
}
