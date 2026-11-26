import type { DiagramDocument, Point, Tone } from "../schemas/diagram";
import {
  axisFraction,
  datum,
  diagramText,
  edgeLabel,
  edgePoints,
  numeric,
  wrapLabel,
} from "./geometry";

export type DiagramPalette = {
  surface: string;
  ink: string;
  muted: string;
  border: string;
  primary: string;
  secondary: string;
  tertiary: string;
};
const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
const n = (value: number) => Number(value.toFixed(4));
const path = (points: Point[]) =>
  points.map((p, i) => `${i ? "L" : "M"}${n(p.x)},${n(p.y)}`).join(" ");

/** Produces vector primitives from validated coordinates/data, never from the legacy SVG. */
export function diagramSvg(
  document: DiagramDocument,
  colors: DiagramPalette,
): string {
  const r = document.render;
  const color = (tone: Tone) => escape(colors[tone]);
  const label = (
    text: string,
    x: number,
    y: number,
    size = 20,
    anchor = "start",
    fill = colors.ink,
  ) =>
    `<text x="${n(x)}" y="${n(y)}" font-size="${size}" text-anchor="${anchor}" fill="${escape(fill)}">${escape(text)}</text>`;
  const stroke = escape(colors.border);
  const line = (x1: number, y1: number, x2: number, y2: number, ink = stroke) =>
    `<path d="M${n(x1)},${n(y1)} L${n(x2)},${n(y2)}" fill="none" stroke="${ink}" stroke-width="1.5"/>`;
  let body = "";
  if (r.type === "graph") {
    const fontSize = r.fontSize || 20;
    const edgeSize = fontSize * 0.85;
    for (const e of document.edges!) {
      const points = edgePoints(document.nodes!, e);
      const end = e.relation === "inhibitory" ? "inhibition" : "arrow";
      body += `<path id="${escape(e.id)}" d="${path(points)}" stroke="${color("primary")}" fill="none" stroke-width="2" marker-end="url(#${end})"${e.relation === "bidirectional" ? ' marker-start="url(#reverse)"' : ""}/>`;
      if (e.label) {
        const width = e.label.length * edgeSize * 0.54 + 12;
        const p = e.labelPosition || edgeLabel(points);
        if (
          !e.labelPosition &&
          points.length === 2 &&
          Math.abs(points[0].y - points[1].y) < 1 &&
          width > Math.abs(points[0].x - points[1].x) - 8
        ) {
          const source = document.nodes!.find((node) => node.id === e.source)!;
          const target = document.nodes!.find((node) => node.id === e.target)!;
          p.y = Math.max(
            edgeSize + 2,
            Math.min(
              source.y - source.height / 2,
              target.y - target.height / 2,
            ) - 12,
          );
        }
        const x = Math.max(
          width / 2 + 4,
          Math.min(r.canvas.width - width / 2 - 4, p.x),
        );
        body += `<rect x="${n(x - width / 2)}" y="${n(p.y - edgeSize)}" width="${width}" height="${edgeSize + 6}" fill="${escape(colors.surface)}"/>`;
        body += label(e.label, x, p.y, edgeSize, "middle", colors.muted);
      }
    }
    for (const node of document.nodes!) {
      if (!node.label) {
        body += `<circle cx="${node.x}" cy="${node.y}" r="3" fill="${color("primary")}"/>`;
        continue;
      }
      body += `<g id="${escape(node.id)}"><rect x="${n(node.x - node.width / 2)}" y="${n(node.y - node.height / 2)}" width="${node.width}" height="${node.height}" rx="3" fill="${escape(colors.surface)}" stroke="${color("primary")}" stroke-width="1.5"/>`;
      const lines = wrapLabel(node.label, node.width - 20, fontSize);
      lines.forEach((text, i) => {
        body += label(
          text,
          node.x,
          node.y +
            (i - (lines.length - 1) / 2) * fontSize * 1.2 +
            fontSize * 0.35,
          fontSize,
          "middle",
        );
      });
      body += "</g>";
    }
  } else {
    const p = r.plot;
    const x = (value: number) => p.x + axisFraction(value, r.xAxis) * p.width;
    const bottom = p.y + p.height;
    const tickStride = Math.max(
      1,
      Math.ceil(r.xAxis.ticks.length / Math.max(2, Math.floor(p.width / 70))),
    );
    r.xAxis.ticks.forEach((tick, i) => {
      body += line(x(tick), p.y, x(tick), bottom);
      if (i % tickStride === 0 || i === r.xAxis.ticks.length - 1)
        body += label(
          String(tick),
          x(tick),
          bottom + 28,
          18,
          "middle",
          colors.muted,
        );
    });
    body += line(p.x, bottom, p.x + p.width, bottom, escape(colors.ink));
    const axisLines = wrapLabel(r.xAxis.label, p.width, 19);
    axisLines.forEach((text, i) => {
      body += label(
        text,
        p.x + p.width / 2,
        bottom + 62 + i * 23,
        19,
        "middle",
      );
    });
    const legendTop = bottom + 85 + axisLines.length * 23;
    if (r.type === "line") {
      const y = (value: number) =>
        bottom - axisFraction(value, r.yAxis) * p.height;
      r.yAxis.ticks.forEach((tick) => {
        body += line(p.x, y(tick), p.x + p.width, y(tick));
        body += label(
          String(tick),
          p.x - 14,
          y(tick) + 6,
          18,
          "end",
          colors.muted,
        );
      });
      body += `<g transform="translate(23 ${n(p.y + p.height / 2)}) rotate(-90)">${label(r.yAxis.label, 0, 0, 19, "middle")}</g>`;
      r.series.forEach((s, i) => {
        const samples = datum(document, s.samplesPath) as Record<
          string,
          number
        >[];
        const points = samples.map((sample) => ({
          x: x(numeric(sample, s.xKey)),
          y: y(numeric(sample, s.yKey)),
        }));
        body += `<path id="${escape(s.id)}" d="${path(points)}" fill="none" stroke="${color(s.tone)}" stroke-width="3"${i > 0 ? ` stroke-dasharray="${i === 1 ? "10 5" : "3 5"}"` : ""}/>`;
        const stacked =
          r.canvas.height >= legendTop + (r.series.length - 1) * 34 + 24;
        const legendX = p.x + (stacked ? 0 : i * 255),
          legendY = legendTop + (stacked ? i * 34 : 0);
        body += `<path d="M${legendX},${legendY - 6} h25" stroke="${color(s.tone)}" stroke-width="3"${i > 0 ? ` stroke-dasharray="${i === 1 ? "10 5" : "3 5"}"` : ""}/>`;
        body += label(s.label, legendX + 32, legendY, 17);
      });
    } else {
      r.rows.forEach((row) => {
        const above = p.x < 100;
        const lines = wrapLabel(
          diagramText(document, row.label),
          above ? p.width - 75 : p.x - 35,
        );
        lines.forEach((text, i) => {
          body += label(
            text,
            above ? p.x : p.x - 20,
            above
              ? row.y - 12 - (lines.length - 1 - i) * 24
              : row.y + row.height / 2 + (i - (lines.length - 1) / 2) * 24 + 7,
            20,
            above ? "start" : "end",
          );
        });
        let sum = 0;
        for (const segment of row.segments) {
          const value = numeric(document, segment.valuePath);
          body += `<rect x="${n(x(sum))}" y="${row.y}" width="${n(x(sum + value) - x(sum))}" height="${row.height}" fill="${color(segment.tone)}"/>`;
          sum += value;
        }
        body += label(
          sum.toLocaleString("ko-KR", { maximumFractionDigits: 2 }),
          x(sum),
          row.y - 10,
          19,
          "end",
        );
      });
      const legend = [
        ...new Map(
          r.rows.flatMap((row) => row.segments).map((s) => [s.label, s]),
        ).values(),
      ];
      legend.forEach((s, i) => {
        const stacked =
          r.canvas.height >= legendTop + (legend.length - 1) * 36 + 24;
        const x = p.x + (stacked ? 0 : i * 340),
          y = legendTop + (stacked ? i * 36 : 0);
        body += `<rect x="${x}" y="${y - 15}" width="20" height="16" fill="${color(s.tone)}"/>`;
        body += label(s.label, x + 30, y, 19);
      });
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${r.canvas.width} ${r.canvas.height}" role="img"><title>${escape(document.title)}</title><defs><marker id="arrow" markerWidth="7" markerHeight="7" refX="7" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" fill="${color("primary")}"/></marker><marker id="reverse" markerWidth="7" markerHeight="7" refX="0" refY="3.5" orient="auto"><path d="M7,0 L0,3.5 L7,7 Z" fill="${color("primary")}"/></marker><marker id="inhibition" markerWidth="3" markerHeight="12" refX="1.5" refY="6" orient="auto"><path d="M1.5,0 L1.5,12" stroke="${color("primary")}" stroke-width="1.5"/></marker></defs><g font-family="sans-serif">${body}</g></svg>`;
}

/** Text alternative uses the same sources as the drawing (also useful to screen readers). */
export function diagramDescription(document: DiagramDocument): string[] {
  const r = document.render;
  if (r.type === "graph")
    return document.edges!.map((edge) => {
      const from = document.nodes!.find((n) => n.id === edge.source)!;
      const to = document.nodes!.find((n) => n.id === edge.target)!;
      const relation =
        edge.relation === "inhibitory"
          ? "억제"
          : edge.relation === "bidirectional"
            ? "양방향 연결"
            : "연결";
      return `${from.label || "연결점"} → ${to.label || "연결점"}${edge.label ? ` (${edge.label})` : ""} · ${relation}`;
    });
  if (r.type === "bars")
    return r.rows.map(
      (row) =>
        `${diagramText(document, row.label)}: ${row.segments.map((s) => `${s.label} ${numeric(document, s.valuePath).toLocaleString("ko-KR", { maximumFractionDigits: 3 })}`).join(", ")}`,
    );
  return r.series.flatMap((s) => [
    s.label,
    ...(datum(document, s.samplesPath) as unknown[]).map(
      (sample) =>
        `${numeric(sample, s.xKey).toPrecision(4)}: ${numeric(sample, s.yKey).toPrecision(4)}`,
    ),
  ]);
}
