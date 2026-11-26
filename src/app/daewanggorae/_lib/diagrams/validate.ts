import type {
  Axis,
  DiagramDocument,
  DiagramText,
  Point,
} from "../schemas/diagram";
import { datum, numeric, edgePoints, diagramText, wrapLabel } from "./geometry";
import { responsiveDiagram } from "./responsive";

function ensure(ok: unknown): asserts ok {
  if (!ok)
    throw new Error(
      "도표 데이터를 읽을 수 없습니다. 콘텐츠를 업데이트한 뒤 다시 시도해 주세요.",
    );
}
function object(value: unknown): asserts value is Record<string, unknown> {
  ensure(value && typeof value === "object" && !Array.isArray(value));
}
function number(
  value: unknown,
  min: number,
  max: number,
): asserts value is number {
  ensure(
    typeof value === "number" &&
      Number.isFinite(value) &&
      value >= min &&
      value <= max,
  );
}
function text(value: unknown, max = 2000): asserts value is string {
  ensure(typeof value === "string" && value.length <= max);
}
function array(value: unknown, max: number): asserts value is unknown[] {
  ensure(Array.isArray(value) && value.length <= max);
}
function point(
  value: unknown,
  width: number,
  height: number,
): asserts value is Point & Record<string, unknown> {
  object(value);
  number(value.x, 0, width);
  number(value.y, 0, height);
}
function axis(value: unknown): asserts value is Axis {
  object(value);
  number(value.min, -1e12, 1e12);
  number(value.max, -1e12, 1e12);
  ensure(
    value.max > value.min && ["linear", "log"].includes(String(value.scale)),
  );
  ensure(value.scale !== "log" || value.min > 0);
  text(value.label, 160);
  array(value.ticks, 30);
  value.ticks.forEach((tick) =>
    number(tick, value.min as number, value.max as number),
  );
}
function boundText(
  value: unknown,
  document: DiagramDocument,
): asserts value is DiagramText {
  if (typeof value === "string") {
    text(value);
    return;
  }
  object(value);
  array(value.parts, 40);
  value.parts.forEach((part) => {
    if (typeof part === "string") {
      text(part);
      return;
    }
    object(part);
    text(part.path, 200);
    if (part.decimals !== undefined) {
      number(part.decimals, 0, 8);
      ensure(Number.isInteger(part.decimals));
    }
    if (part.multiplier !== undefined) number(part.multiplier, -1e9, 1e9);
    numeric(document, part.path);
  });
  text(diagramText(document, value as DiagramText));
}
function tone(value: unknown) {
  ensure(["primary", "secondary", "tertiary"].includes(String(value)));
}

/** Validate remote content before handing coordinates and values to native SVG. */
export function parseDiagram(
  input: unknown,
  expectedId?: string,
): DiagramDocument {
  object(input);
  ensure(input.schemaVersion === "2.0.0");
  text(input.id, 200);
  ensure(input.id && (!expectedId || input.id === expectedId));
  text(input.lessonId, 200);
  text(input.title, 300);
  array(input.limitations, 30);
  input.limitations.forEach((s) => text(s));
  const r = input.render;
  object(r);
  object(r.canvas);
  number(r.canvas.width, 100, 4000);
  number(r.canvas.height, 100, 4000);
  const { width, height } = r.canvas;
  const document = input as unknown as DiagramDocument;
  if (r.notes !== undefined) {
    array(r.notes, 30);
    r.notes.forEach((n) => boundText(n, document));
  }
  if (r.type === "graph") {
    if (r.fontSize !== undefined) number(r.fontSize, 12, 36);
    const fontSize = (r.fontSize as number | undefined) || 20;
    array(input.nodes, 200);
    ensure(input.nodes.length > 0);
    array(input.edges, 500);
    const ids = new Set<string>();
    input.nodes.forEach((n) => {
      object(n);
      text(n.id, 200);
      ensure(n.id && !ids.has(n.id));
      ids.add(n.id);
      text(n.label, 300);
      point(n, width, height);
      number(n.width, 1, width);
      number(n.height, 1, height);
      ensure(
        n.x - n.width / 2 >= 0 &&
          n.x + n.width / 2 <= width &&
          n.y - n.height / 2 >= 0 &&
          n.y + n.height / 2 <= height,
      );
      ensure(
        !n.label ||
          wrapLabel(n.label, n.width - 20, fontSize).length * fontSize * 1.2 <=
            n.height - 12,
      );
    });
    const edgeIds = new Set<string>();
    input.edges.forEach((e) => {
      object(e);
      text(e.id, 200);
      ensure(e.id && !edgeIds.has(e.id));
      edgeIds.add(e.id);
      text(e.source, 200);
      text(e.target, 200);
      ensure(e.source !== e.target && ids.has(e.source) && ids.has(e.target));
      text(e.label, 160);
      ensure(
        ["directed", "inhibitory", "bidirectional"].includes(
          String(e.relation),
        ),
      );
      if (e.via !== undefined) {
        array(e.via, 30);
        e.via.forEach((p) => point(p, width, height));
      }
      if (e.labelPosition !== undefined) point(e.labelPosition, width, height);
    });
    document.edges!.forEach((e) => {
      const points = edgePoints(document.nodes!, e);
      points
        .slice(1)
        .forEach((p, i) =>
          ensure(Math.hypot(p.x - points[i].x, p.y - points[i].y) > 0),
        );
    });
    if (r.compact !== undefined) {
      object(r.compact);
      object(r.compact.nodes);
      object(r.compact.canvas);
      number(r.compact.fontSize, 12, 36);
      ensure(Object.keys(r.compact.nodes).length === ids.size);
      for (const [id, geometry] of Object.entries(r.compact.nodes)) {
        ensure(ids.has(id));
        object(geometry);
        ensure(
          Object.keys(geometry).every((key) =>
            ["x", "y", "width", "height"].includes(key),
          ),
        );
        for (const key of ["x", "y", "width", "height"])
          ensure(key in geometry);
      }
      if (r.compact.edges !== undefined) {
        object(r.compact.edges);
        for (const [id, geometry] of Object.entries(r.compact.edges)) {
          ensure(edgeIds.has(id));
          object(geometry);
          ensure(
            Object.keys(geometry).every((key) =>
              ["via", "labelPosition"].includes(key),
            ),
          );
        }
      }
      parseDiagram(responsiveDiagram(document, 320), expectedId);
    }
  } else {
    ensure(r.type === "line" || r.type === "bars");
    point(r.plot, width, height);
    object(r.plot);
    number(r.plot.width, 1, width);
    number(r.plot.height, 1, height);
    ensure(
      r.plot.x + r.plot.width <= width && r.plot.y + r.plot.height <= height,
    );
    axis(r.xAxis);
    if (r.type === "line") {
      axis(r.yAxis);
      array(r.series, 20);
      ensure(r.series.length > 0);
      const ids = new Set<string>();
      r.series.forEach((s) => {
        object(s);
        text(s.id, 200);
        ensure(s.id && !ids.has(s.id));
        ids.add(s.id);
        text(s.label, 200);
        text(s.samplesPath, 200);
        text(s.xKey, 100);
        text(s.yKey, 100);
        tone(s.tone);
        const points = datum(document, s.samplesPath);
        array(points, 10000);
        ensure(points.length >= 2);
        points.forEach((p) => {
          const x = numeric(p, s.xKey as string),
            y = numeric(p, s.yKey as string);
          number(x, (r.xAxis as Axis).min, (r.xAxis as Axis).max);
          number(y, (r.yAxis as Axis).min, (r.yAxis as Axis).max);
        });
      });
    } else {
      ensure(r.xAxis.min === 0 && r.xAxis.scale === "linear");
      array(r.rows, 40);
      ensure(r.rows.length > 0);
      const ids = new Set<string>();
      r.rows.forEach((row) => {
        object(row);
        text(row.id, 200);
        ensure(row.id && !ids.has(row.id));
        ids.add(row.id);
        boundText(row.label, document);
        number(row.y, 0, height);
        number(row.height, 1, height);
        ensure(
          row.y + row.height <=
            (r.plot as { y: number; height: number }).y +
              (r.plot as { height: number }).height,
        );
        array(row.segments, 20);
        ensure(row.segments.length > 0);
        let sum = 0;
        row.segments.forEach((s) => {
          object(s);
          text(s.label, 200);
          text(s.valuePath, 200);
          tone(s.tone);
          const v = numeric(document, s.valuePath);
          number(v, 0, (r.xAxis as Axis).max);
          sum += v;
        });
        ensure(sum <= (r.xAxis as Axis).max);
      });
    }
  }
  return document;
}
