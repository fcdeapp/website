import type {
  Axis,
  DiagramDocument,
  DiagramEdge,
  DiagramNode,
  DiagramText,
  Point,
} from "../schemas/diagram";

/** Data-only paths; no expressions, URLs, prototype access or executable code. */
export function datum(document: unknown, path: string): unknown {
  const keys = path.split("/");
  if (
    !path ||
    keys.some(
      (k) => !k || ["__proto__", "prototype", "constructor"].includes(k),
    )
  )
    throw new Error("도표의 데이터 경로가 올바르지 않습니다.");
  let value = document;
  for (const key of keys) {
    if (!value || typeof value !== "object" || !Object.hasOwn(value, key))
      throw new Error("도표에 필요한 데이터가 없습니다.");
    value = (value as Record<string, unknown>)[key];
  }
  return value;
}
export function numeric(document: unknown, path: string): number {
  const value = datum(document, path);
  if (typeof value !== "number" || !Number.isFinite(value))
    throw new Error("도표의 수치를 확인할 수 없습니다.");
  return value;
}
export function diagramText(
  document: DiagramDocument,
  spec: DiagramText,
): string {
  if (typeof spec === "string") return spec;
  return spec.parts
    .map((part) =>
      typeof part === "string"
        ? part
        : (
            numeric(document, part.path) * (part.multiplier ?? 1)
          ).toLocaleString("ko-KR", {
            minimumFractionDigits: part.decimals ?? 0,
            maximumFractionDigits: part.decimals ?? 0,
          }),
    )
    .join("");
}
export function axisFraction(value: number, axis: Axis): number {
  const transform = axis.scale === "log" ? Math.log10 : (v: number) => v;
  return (
    (transform(value) - transform(axis.min)) /
    (transform(axis.max) - transform(axis.min))
  );
}
/** Intersect the ray with the node rectangle so moving a node moves its arrows. */
function boundary(node: DiagramNode, toward: Point): Point {
  const dx = toward.x - node.x,
    dy = toward.y - node.y;
  if (!dx && !dy) throw new Error("도표의 연결점이 겹쳐 있습니다.");
  const scale = Math.min(
    dx ? node.width / 2 / Math.abs(dx) : Infinity,
    dy ? node.height / 2 / Math.abs(dy) : Infinity,
  );
  return { x: node.x + dx * scale, y: node.y + dy * scale };
}
export function edgePoints(nodes: DiagramNode[], edge: DiagramEdge): Point[] {
  const source = nodes.find((n) => n.id === edge.source);
  const target = nodes.find((n) => n.id === edge.target);
  if (!source || !target)
    throw new Error("도표의 연결 대상을 찾을 수 없습니다.");
  const via = edge.via || [];
  return [
    boundary(source, via[0] || target),
    ...via,
    boundary(target, via[via.length - 1] || source),
  ];
}
export function edgeLabel(points: Point[]): Point {
  const lengths = points
    .slice(1)
    .map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
  let remaining = lengths.reduce((a, b) => a + b, 0) / 2;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] && lengths[i] > 0) {
      const t = remaining / lengths[i];
      return {
        x: points[i].x + t * (points[i + 1].x - points[i].x),
        y: points[i].y + t * (points[i + 1].y - points[i].y) - 12,
      };
    }
    remaining -= lengths[i];
  }
  return points[0];
}
export function wrapLabel(
  text: string,
  width: number,
  fontSize = 20,
): string[] {
  const capacity = Math.max(4, Math.floor(width / (fontSize * 0.57)));
  return text.split("\n").flatMap((paragraph) => {
    const lines: string[] = [];
    let line = "";
    for (const word of paragraph.split(/\s+/)) {
      if (line && line.length + word.length + 1 > capacity) {
        lines.push(line);
        line = "";
      }
      line += (line ? " " : "") + word;
    }
    lines.push(line);
    return lines;
  });
}
