"use client";

import React, {
  ChangeEvent,
  MouseEvent as ReactMouseEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../../styles/pages/GraphicStatics.module.css";

type ToolMode = "select" | "add-node" | "add-member";
type SupportType = "none" | "hinge" | "roller" | "fixed";
type ForceDiagramMode = "joint-polygons" | "global-overview";

type NodeData = {
  id: string;
  label: string;
  x: number;
  y: number; // screen coordinates (SVG): y downward positive
};

type MemberData = {
  id: string;
  label: string;
  startNodeId: string;
  endNodeId: string;
};

type NodeLoad = {
  nodeId: string;
  fx: number; // structural axis: +x right
  fy: number; // structural axis: +y up
};

type SupportData = {
  nodeId: string;
  type: SupportType;
  reactionAngleDeg?: number; // for roller only
};

type MemberResult = {
  memberId: string;
  label: string;
  force: number;
  state: "Tension" | "Compression" | "Zero";
};

type ReactionResult = {
  nodeId: string;
  nodeLabel: string;
  type: SupportType;
  rx: number;
  ry: number;
  magnitude: number;
};

type AnalysisResult = {
  ok: boolean;
  message: string;
  determinateMessage: string;
  memberResults: MemberResult[];
  reactionResults: ReactionResult[];
};

type LocalVector = {
  label: string;
  vx: number;
  vy: number;
  kind: "member" | "load" | "reaction";
  state?: "Tension" | "Compression" | "Zero";
};

type JointPolygon = {
  nodeId: string;
  nodeLabel: string;
  vectors: LocalVector[];
};

type GlobalForceSegment = {
  id: string;
  label: string;
  vx: number;
  vy: number;
  kind: "member" | "load" | "reaction";
  state?: "Tension" | "Compression" | "Zero";
};

const DEFAULT_CANVAS_WIDTH = 1200;
const DEFAULT_CANVAS_HEIGHT = 720;

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = A.length;
  if (n === 0) return null;
  const m = A[0].length;
  if (n !== m) return null;

  const M = A.map((row, i) => [...row, b[i]]);

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let maxAbs = Math.abs(M[col][col]);

    for (let r = col + 1; r < n; r++) {
      const val = Math.abs(M[r][col]);
      if (val > maxAbs) {
        maxAbs = val;
        pivotRow = r;
      }
    }

    if (maxAbs < 1e-10) {
      return null;
    }

    if (pivotRow !== col) {
      [M[col], M[pivotRow]] = [M[pivotRow], M[col]];
    }

    const pivot = M[col][col];
    for (let c = col; c <= n; c++) {
      M[col][c] /= pivot;
    }

    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = M[r][col];
      if (Math.abs(factor) < 1e-12) continue;
      for (let c = col; c <= n; c++) {
        M[r][c] -= factor * M[col][c];
      }
    }
  }

  return M.map((row) => row[n]);
}

function getNodeById(nodes: NodeData[], nodeId: string) {
  return nodes.find((n) => n.id === nodeId) || null;
}

function getLoadForNode(loads: NodeLoad[], nodeId: string): NodeLoad {
  return loads.find((l) => l.nodeId === nodeId) || { nodeId, fx: 0, fy: 0 };
}

function getSupportForNode(
  supports: SupportData[],
  nodeId: string
): SupportData {
  return (
    supports.find((s) => s.nodeId === nodeId) || {
      nodeId,
      type: "none",
      reactionAngleDeg: 90,
    }
  );
}

function setOrReplaceLoad(
  loads: NodeLoad[],
  nodeId: string,
  next: Partial<NodeLoad>
): NodeLoad[] {
  const current = getLoadForNode(loads, nodeId);
  const merged: NodeLoad = { ...current, ...next, nodeId };
  const filtered = loads.filter((l) => l.nodeId !== nodeId);

  if (Math.abs(merged.fx) < 1e-12 && Math.abs(merged.fy) < 1e-12) {
    return filtered;
  }

  return [...filtered, merged];
}

function setOrReplaceSupport(
  supports: SupportData[],
  nodeId: string,
  next: Partial<SupportData>
): SupportData[] {
  const current = getSupportForNode(supports, nodeId);
  const merged: SupportData = {
    ...current,
    ...next,
    nodeId,
  };
  const filtered = supports.filter((s) => s.nodeId !== nodeId);

  if (merged.type === "none") return filtered;
  return [...filtered, merged];
}

function getMemberUnitVector(
  member: MemberData,
  nodes: NodeData[],
  fromNodeId: string
) {
  const a = getNodeById(nodes, member.startNodeId);
  const b = getNodeById(nodes, member.endNodeId);
  if (!a || !b) return null;

  let dx = 0;
  let dy = 0;

  if (fromNodeId === a.id) {
    dx = b.x - a.x;
    dy = -(b.y - a.y); // screen -> structural
  } else {
    dx = a.x - b.x;
    dy = -(a.y - b.y);
  }

  const L = Math.hypot(dx, dy);
  if (L < 1e-9) return null;

  return {
    ux: dx / L,
    uy: dy / L,
  };
}

function analyseTruss(
  nodes: NodeData[],
  members: MemberData[],
  loads: NodeLoad[],
  supports: SupportData[],
  zeroTolerance = 1e-6
): AnalysisResult {
  if (nodes.length < 2) {
    return {
      ok: false,
      message: "절점을 2개 이상 추가하세요.",
      determinateMessage: "",
      memberResults: [],
      reactionResults: [],
    };
  }

  if (members.length < 1) {
    return {
      ok: false,
      message: "부재를 1개 이상 추가하세요.",
      determinateMessage: "",
      memberResults: [],
      reactionResults: [],
    };
  }

  const nodeIndex = new Map<string, number>();
  nodes.forEach((node, index) => nodeIndex.set(node.id, index));

  const reactionUnknowns: {
    nodeId: string;
    label: string;
    ux: number;
    uy: number;
  }[] = [];

  supports.forEach((support) => {
    const node = getNodeById(nodes, support.nodeId);
    if (!node || support.type === "none") return;

    if (support.type === "hinge" || support.type === "fixed") {
      reactionUnknowns.push({
        nodeId: support.nodeId,
        label: `R${node.label}x`,
        ux: 1,
        uy: 0,
      });
      reactionUnknowns.push({
        nodeId: support.nodeId,
        label: `R${node.label}y`,
        ux: 0,
        uy: 1,
      });
    } else if (support.type === "roller") {
      const angle = degToRad(support.reactionAngleDeg ?? 90);
      reactionUnknowns.push({
        nodeId: support.nodeId,
        label: `R${node.label}`,
        ux: Math.cos(angle),
        uy: Math.sin(angle),
      });
    }
  });

  const bCount = members.length;
  const rCount = reactionUnknowns.length;
  const jCount = nodes.length;
  const unknownCount = bCount + rCount;
  const eqCount = 2 * jCount;

  const determinateMessage = `정정성 체크: b + r = ${bCount} + ${rCount} = ${unknownCount}, 2j = 2 × ${jCount} = ${eqCount}`;

  if (unknownCount !== eqCount) {
    return {
      ok: false,
      message:
        "현재 모델은 정정 트러스 조건(b + r = 2j)을 만족하지 않습니다. 부재 수 또는 지점조건을 조정하세요.",
      determinateMessage,
      memberResults: [],
      reactionResults: [],
    };
  }

  const A = Array.from({ length: eqCount }, () =>
    Array(unknownCount).fill(0)
  );
  const b = Array(eqCount).fill(0);

  for (let col = 0; col < members.length; col++) {
    const member = members[col];
    const n1 = getNodeById(nodes, member.startNodeId);
    const n2 = getNodeById(nodes, member.endNodeId);

    if (!n1 || !n2) {
      return {
        ok: false,
        message: `부재 ${member.label}에 연결된 절점을 찾을 수 없습니다.`,
        determinateMessage,
        memberResults: [],
        reactionResults: [],
      };
    }

    const dx = n2.x - n1.x;
    const dy = -(n2.y - n1.y);
    const L = Math.hypot(dx, dy);

    if (L < 1e-9) {
      return {
        ok: false,
        message: `부재 ${member.label}의 길이가 0입니다.`,
        determinateMessage,
        memberResults: [],
        reactionResults: [],
      };
    }

    const ux = dx / L;
    const uy = dy / L;

    const i = nodeIndex.get(member.startNodeId)!;
    const j = nodeIndex.get(member.endNodeId)!;

    A[2 * i][col] += ux;
    A[2 * i + 1][col] += uy;
    A[2 * j][col] -= ux;
    A[2 * j + 1][col] -= uy;
  }

  for (let k = 0; k < reactionUnknowns.length; k++) {
    const col = members.length + k;
    const reaction = reactionUnknowns[k];
    const i = nodeIndex.get(reaction.nodeId)!;
    A[2 * i][col] += reaction.ux;
    A[2 * i + 1][col] += reaction.uy;
  }

  nodes.forEach((node, i) => {
    const load = getLoadForNode(loads, node.id);
    b[2 * i] = -load.fx;
    b[2 * i + 1] = -load.fy;
  });

  const x = solveLinearSystem(A, b);

  if (!x) {
    return {
      ok: false,
      message:
        "연립방정식을 풀 수 없습니다. 구조가 불안정하거나 동일선상/중복 조건 등으로 인해 특이행렬이 발생했습니다.",
      determinateMessage,
      memberResults: [],
      reactionResults: [],
    };
  }

  const memberResults: MemberResult[] = members.map((member, idx) => {
    const force = x[idx];
    let state: MemberResult["state"] = "Zero";

    if (force > zeroTolerance) state = "Tension";
    else if (force < -zeroTolerance) state = "Compression";

    return {
      memberId: member.id,
      label: member.label,
      force,
      state,
    };
  });

  const reactionByNode = new Map<
    string,
    { rx: number; ry: number; type: SupportType }
  >();

  supports.forEach((support) => {
    if (support.type === "none") return;
    reactionByNode.set(support.nodeId, {
      rx: 0,
      ry: 0,
      type: support.type,
    });
  });

  reactionUnknowns.forEach((reaction, idx) => {
    const scalar = x[members.length + idx];
    const prev = reactionByNode.get(reaction.nodeId);
    if (!prev) return;
    prev.rx += scalar * reaction.ux;
    prev.ry += scalar * reaction.uy;
  });

  const reactionResults: ReactionResult[] = Array.from(reactionByNode.entries())
    .map(([nodeId, value]) => {
      const node = getNodeById(nodes, nodeId)!;
      return {
        nodeId,
        nodeLabel: node.label,
        type: value.type,
        rx: value.rx,
        ry: value.ry,
        magnitude: Math.hypot(value.rx, value.ry),
      };
    })
    .sort((a, b) => a.nodeLabel.localeCompare(b.nodeLabel));

  return {
    ok: true,
    message:
      "해석 완료. 부재력은 + = 인장, - = 압축 기준입니다. 고정지지는 현재 트러스 해석 모드에서 Rx, Ry로 처리됩니다.",
    determinateMessage,
    memberResults,
    reactionResults,
  };
}

function buildJointPolygons(
  nodes: NodeData[],
  members: MemberData[],
  loads: NodeLoad[],
  supports: SupportData[],
  analysis: AnalysisResult
): JointPolygon[] {
  if (!analysis.ok) return [];

  const memberMap = new Map<string, MemberResult>();
  analysis.memberResults.forEach((m) => memberMap.set(m.memberId, m));

  const reactionMap = new Map<string, ReactionResult>();
  analysis.reactionResults.forEach((r) => reactionMap.set(r.nodeId, r));

  const polygons: JointPolygon[] = nodes.map((node) => {
    const vectors: LocalVector[] = [];

    const load = getLoadForNode(loads, node.id);
    if (Math.abs(load.fx) > 1e-9 || Math.abs(load.fy) > 1e-9) {
      vectors.push({
        label: `P@${node.label}`,
        vx: load.fx,
        vy: load.fy,
        kind: "load",
      });
    }

    const reaction = reactionMap.get(node.id);
    if (reaction) {
      vectors.push({
        label: `R@${node.label}`,
        vx: reaction.rx,
        vy: reaction.ry,
        kind: "reaction",
      });
    }

    members.forEach((member) => {
      if (member.startNodeId !== node.id && member.endNodeId !== node.id) return;
      const memberResult = memberMap.get(member.id);
      if (!memberResult) return;

      const unit = getMemberUnitVector(member, nodes, node.id);
      if (!unit) return;

      const F = memberResult.force;
      const vx = F * unit.ux;
      const vy = F * unit.uy;

      vectors.push({
        label: member.label,
        vx,
        vy,
        kind: "member",
        state: memberResult.state,
      });
    });

    const filtered = vectors.filter((v) => Math.hypot(v.vx, v.vy) > 1e-8);

    filtered.sort((a, b) => {
      const aa = Math.atan2(a.vy, a.vx);
      const bb = Math.atan2(b.vy, b.vx);
      return aa - bb;
    });

    return {
      nodeId: node.id,
      nodeLabel: node.label,
      vectors: filtered,
    };
  });

  return polygons.filter((p) => p.vectors.length > 0);
}

function buildGlobalForceSegments(
  nodes: NodeData[],
  members: MemberData[],
  loads: NodeLoad[],
  analysis: AnalysisResult
): GlobalForceSegment[] {
  if (!analysis.ok) return [];

  const segments: GlobalForceSegment[] = [];

  nodes
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label))
    .forEach((node) => {
      const load = getLoadForNode(loads, node.id);
      if (Math.abs(load.fx) > 1e-9 || Math.abs(load.fy) > 1e-9) {
        segments.push({
          id: `load-${node.id}`,
          label: `P@${node.label}`,
          vx: load.fx,
          vy: load.fy,
          kind: "load",
        });
      }
    });

  analysis.reactionResults
    .slice()
    .sort((a, b) => a.nodeLabel.localeCompare(b.nodeLabel))
    .forEach((reaction) => {
      if (Math.abs(reaction.rx) > 1e-9 || Math.abs(reaction.ry) > 1e-9) {
        segments.push({
          id: `reaction-${reaction.nodeId}`,
          label: `R@${reaction.nodeLabel}`,
          vx: reaction.rx,
          vy: reaction.ry,
          kind: "reaction",
        });
      }
    });

  const memberMap = new Map<string, MemberResult>();
  analysis.memberResults.forEach((m) => memberMap.set(m.memberId, m));

  members
    .slice()
    .sort((a, b) => a.label.localeCompare(b.label))
    .forEach((member) => {
      const result = memberMap.get(member.id);
      if (!result) return;

      const n1 = getNodeById(nodes, member.startNodeId);
      const n2 = getNodeById(nodes, member.endNodeId);
      if (!n1 || !n2) return;

      const dx = n2.x - n1.x;
      const dy = -(n2.y - n1.y);
      const L = Math.hypot(dx, dy);
      if (L < 1e-9) return;

      const ux = dx / L;
      const uy = dy / L;

      segments.push({
        id: `member-${member.id}`,
        label: member.label,
        vx: result.force * ux,
        vy: result.force * uy,
        kind: "member",
        state: result.state,
      });
    });

  return segments.filter((seg) => Math.hypot(seg.vx, seg.vy) > 1e-8);
}

function downloadSvg(svgElement: SVGSVGElement | null, fileName: string) {
  if (!svgElement) return;
  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);

  const blob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadSvgAsPng(
  svgElement: SVGSVGElement | null,
  fileName: string,
  width: number,
  height: number
) {
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  const source = serializer.serializeToString(svgElement);
  const blob = new Blob([source], {
    type: "image/svg+xml;charset=utf-8",
  });

  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    URL.revokeObjectURL(url);

    const pngUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = pngUrl;
    a.download = fileName;
    a.click();
  };

  img.src = url;
}

export default function GraphicStaticsPage() {
  const formSvgRef = useRef<SVGSVGElement | null>(null);
  const forceSvgRef = useRef<SVGSVGElement | null>(null);
  const bgFileInputRef = useRef<HTMLInputElement | null>(null);
  const jsonInputRef = useRef<HTMLInputElement | null>(null);

  const [toolMode, setToolMode] = useState<ToolMode>("select");
  const [forceDiagramMode, setForceDiagramMode] =
    useState<ForceDiagramMode>("joint-polygons");

  const [canvasWidth, setCanvasWidth] = useState(DEFAULT_CANVAS_WIDTH);
  const [canvasHeight, setCanvasHeight] = useState(DEFAULT_CANVAS_HEIGHT);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.6);

  const [snapEnabled, setSnapEnabled] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [zeroTolerance, setZeroTolerance] = useState(1e-6);

  const [nodes, setNodes] = useState<NodeData[]>([]);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [loads, setLoads] = useState<NodeLoad[]>([]);
  const [supports, setSupports] = useState<SupportData[]>([]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [pendingMemberStartId, setPendingMemberStartId] = useState<string | null>(
    null
  );
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);

  const selectedNode = selectedNodeId ? getNodeById(nodes, selectedNodeId) : null;
  const selectedMember = selectedMemberId
    ? members.find((m) => m.id === selectedMemberId) || null
    : null;

  const selectedNodeLoad = selectedNode
    ? getLoadForNode(loads, selectedNode.id)
    : null;

  const selectedNodeSupport = selectedNode
    ? getSupportForNode(supports, selectedNode.id)
    : null;

  const analysis = useMemo(
    () => analyseTruss(nodes, members, loads, supports, zeroTolerance),
    [nodes, members, loads, supports, zeroTolerance]
  );

  const jointPolygons = useMemo(
    () => buildJointPolygons(nodes, members, loads, supports, analysis),
    [nodes, members, loads, supports, analysis]
  );

  const globalForceSegments = useMemo(
    () => buildGlobalForceSegments(nodes, members, loads, analysis),
    [nodes, members, loads, analysis]
  );

  const memberResultMap = useMemo(() => {
    const map = new Map<string, MemberResult>();
    analysis.memberResults.forEach((m) => map.set(m.memberId, m));
    return map;
  }, [analysis]);

  const reactionResultMap = useMemo(() => {
    const map = new Map<string, ReactionResult>();
    analysis.reactionResults.forEach((r) => map.set(r.nodeId, r));
    return map;
  }, [analysis]);

  function snapPoint(x: number, y: number) {
    if (!snapEnabled) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    };
  }

  function getSvgPoint(evt: ReactMouseEvent<SVGElement>) {
    const svg = formSvgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const x = ((evt.clientX - rect.left) / rect.width) * canvasWidth;
    const y = ((evt.clientY - rect.top) / rect.height) * canvasHeight;
    return { x, y };
  }

  function handleBackgroundUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const img = new Image();
      img.onload = () => {
        setCanvasWidth(img.width || DEFAULT_CANVAS_WIDTH);
        setCanvasHeight(img.height || DEFAULT_CANVAS_HEIGHT);
        setBackgroundImage(dataUrl);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  function clearAll() {
    setNodes([]);
    setMembers([]);
    setLoads([]);
    setSupports([]);
    setSelectedNodeId(null);
    setSelectedMemberId(null);
    setPendingMemberStartId(null);
    setDraggingNodeId(null);
  }

  function handleSvgClick(evt: ReactMouseEvent<SVGSVGElement>) {
    const rawPt = getSvgPoint(evt);
    const pt = snapPoint(rawPt.x, rawPt.y);

    if (toolMode === "add-node") {
      const nextIndex = nodes.length + 1;
      const newNode: NodeData = {
        id: uid("node"),
        label: `N${nextIndex}`,
        x: pt.x,
        y: pt.y,
      };
      setNodes((prev) => [...prev, newNode]);
      setSelectedNodeId(newNode.id);
      setSelectedMemberId(null);
      return;
    }

    if (toolMode === "select") {
      setSelectedNodeId(null);
      setSelectedMemberId(null);
      setPendingMemberStartId(null);
    }
  }

  function handleNodeMouseDown(
    evt: ReactMouseEvent<SVGCircleElement>,
    nodeId: string
  ) {
    evt.stopPropagation();

    if (toolMode === "add-member") {
      if (!pendingMemberStartId) {
        setPendingMemberStartId(nodeId);
        setSelectedNodeId(nodeId);
        setSelectedMemberId(null);
        return;
      }

      if (pendingMemberStartId === nodeId) {
        setPendingMemberStartId(null);
        return;
      }

      const alreadyExists = members.some(
        (m) =>
          (m.startNodeId === pendingMemberStartId && m.endNodeId === nodeId) ||
          (m.startNodeId === nodeId && m.endNodeId === pendingMemberStartId)
      );

      if (!alreadyExists) {
        const nextIndex = members.length + 1;
        const newMember: MemberData = {
          id: uid("member"),
          label: `M${nextIndex}`,
          startNodeId: pendingMemberStartId,
          endNodeId: nodeId,
        };
        setMembers((prev) => [...prev, newMember]);
        setSelectedMemberId(newMember.id);
        setSelectedNodeId(null);
      }

      setPendingMemberStartId(null);
      return;
    }

    setSelectedNodeId(nodeId);
    setSelectedMemberId(null);

    if (toolMode === "select") {
      setDraggingNodeId(nodeId);
    }
  }

  function handleSvgMouseMove(evt: ReactMouseEvent<SVGSVGElement>) {
    if (!draggingNodeId) return;
    const rawPt = getSvgPoint(evt);
    const pt = snapPoint(rawPt.x, rawPt.y);

    setNodes((prev) =>
      prev.map((node) =>
        node.id === draggingNodeId ? { ...node, x: pt.x, y: pt.y } : node
      )
    );
  }

  function handleSvgMouseUp() {
    setDraggingNodeId(null);
  }

  function handleMemberClick(
    evt: ReactMouseEvent<SVGLineElement>,
    memberId: string
  ) {
    evt.stopPropagation();
    setSelectedMemberId(memberId);
    setSelectedNodeId(null);
    setPendingMemberStartId(null);
  }

  function deleteSelectedNode() {
    if (!selectedNode) return;
    const nodeId = selectedNode.id;

    setMembers((prev) =>
      prev.filter((m) => m.startNodeId !== nodeId && m.endNodeId !== nodeId)
    );
    setLoads((prev) => prev.filter((l) => l.nodeId !== nodeId));
    setSupports((prev) => prev.filter((s) => s.nodeId !== nodeId));
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setSelectedNodeId(null);
  }

  function deleteSelectedMember() {
    if (!selectedMember) return;
    setMembers((prev) => prev.filter((m) => m.id !== selectedMember.id));
    setSelectedMemberId(null);
  }

  function exportJSON() {
    const payload = {
      canvasWidth,
      canvasHeight,
      backgroundImage,
      backgroundOpacity,
      snapEnabled,
      gridSize,
      zeroTolerance,
      nodes,
      members,
      loads,
      supports,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "graphic-statics-model.json";
    a.click();

    URL.revokeObjectURL(url);
  }

  function importJSON(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result || "{}"));
        setCanvasWidth(parsed.canvasWidth ?? DEFAULT_CANVAS_WIDTH);
        setCanvasHeight(parsed.canvasHeight ?? DEFAULT_CANVAS_HEIGHT);
        setBackgroundImage(parsed.backgroundImage ?? null);
        setBackgroundOpacity(parsed.backgroundOpacity ?? 0.6);
        setSnapEnabled(parsed.snapEnabled ?? false);
        setGridSize(parsed.gridSize ?? 20);
        setZeroTolerance(parsed.zeroTolerance ?? 1e-6);
        setNodes(parsed.nodes ?? []);
        setMembers(parsed.members ?? []);
        setLoads(parsed.loads ?? []);
        setSupports(parsed.supports ?? []);
        setSelectedNodeId(null);
        setSelectedMemberId(null);
        setPendingMemberStartId(null);
      } catch {
        alert("JSON 파일을 읽을 수 없습니다.");
      }
    };
    reader.readAsText(file);
  }

  const forceCellWidth = 320;
  const forceCellHeight = 240;
  const forceCols = 2;
  const forceRows = Math.max(1, Math.ceil(jointPolygons.length / forceCols));
  const jointForceSvgWidth = forceCellWidth * forceCols;
  const jointForceSvgHeight = forceCellHeight * forceRows;

  const jointForceScale = useMemo(() => {
    let maxMag = 1;
    jointPolygons.forEach((poly) => {
      let cx = 0;
      let cy = 0;
      poly.vectors.forEach((v) => {
        cx += v.vx;
        cy += v.vy;
        maxMag = Math.max(maxMag, Math.hypot(cx, cy), Math.hypot(v.vx, v.vy));
      });
    });
    return Math.min(forceCellWidth, forceCellHeight) * 0.3 / maxMag;
  }, [jointPolygons]);

  const globalForceSvgWidth = 900;
  const globalForceSvgHeight = 520;

  const globalForceScale = useMemo(() => {
    let cx = 0;
    let cy = 0;
    let maxAbsX = 1;
    let maxAbsY = 1;

    globalForceSegments.forEach((seg) => {
      cx += seg.vx;
      cy += seg.vy;
      maxAbsX = Math.max(maxAbsX, Math.abs(cx), Math.abs(seg.vx));
      maxAbsY = Math.max(maxAbsY, Math.abs(cy), Math.abs(seg.vy));
    });

    const sx = (globalForceSvgWidth * 0.35) / maxAbsX;
    const sy = (globalForceSvgHeight * 0.35) / maxAbsY;
    return Math.min(sx, sy);
  }, [globalForceSegments]);

  const activeForceSvgWidth =
    forceDiagramMode === "joint-polygons"
      ? jointForceSvgWidth
      : globalForceSvgWidth;

  const activeForceSvgHeight =
    forceDiagramMode === "joint-polygons"
      ? jointForceSvgHeight
      : globalForceSvgHeight;

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.titleGroup}>
          <h1 className={styles.pageTitle}>
            Graphic Statics – Form / Force Diagram Tool
          </h1>
          <p className={styles.pageSubtitle}>
            배경 이미지 위에 절점을 찍고 부재를 연결하면, 하중/지점조건을 바탕으로
            반력·부재력·Force Diagram을 자동으로 생성합니다.
          </p>
        </div>

        <div className={styles.topbarActions}>
          <button
            className={styles.secondaryButton}
            onClick={() => bgFileInputRef.current?.click()}
          >
            배경 이미지 업로드
          </button>
          <input
            ref={bgFileInputRef}
            type="file"
            accept="image/*"
            onChange={handleBackgroundUpload}
            className={styles.hiddenInput}
          />

          <button className={styles.secondaryButton} onClick={exportJSON}>
            JSON 내보내기
          </button>

          <button
            className={styles.secondaryButton}
            onClick={() => jsonInputRef.current?.click()}
          >
            JSON 불러오기
          </button>
          <input
            ref={jsonInputRef}
            type="file"
            accept=".json"
            onChange={importJSON}
            className={styles.hiddenInput}
          />

          <button className={styles.dangerButton} onClick={clearAll}>
            전체 초기화
          </button>
        </div>
      </div>

      <div className={styles.contentGrid}>
        <aside className={styles.sidebar}>
          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>툴</h2>
            <div className={styles.toolGroup}>
              <button
                className={`${styles.toolButton} ${
                  toolMode === "select" ? styles.toolButtonActive : ""
                }`}
                onClick={() => {
                  setToolMode("select");
                  setPendingMemberStartId(null);
                }}
              >
                선택 / 이동
              </button>

              <button
                className={`${styles.toolButton} ${
                  toolMode === "add-node" ? styles.toolButtonActive : ""
                }`}
                onClick={() => {
                  setToolMode("add-node");
                  setPendingMemberStartId(null);
                }}
              >
                절점 추가
              </button>

              <button
                className={`${styles.toolButton} ${
                  toolMode === "add-member" ? styles.toolButtonActive : ""
                }`}
                onClick={() => {
                  setToolMode("add-member");
                  setPendingMemberStartId(null);
                }}
              >
                부재 연결
              </button>
            </div>

            <div className={styles.helperTextBox}>
              <p>
                현재 모드: <strong>{toolMode}</strong>
              </p>
              <ul className={styles.helperList}>
                <li>절점 추가: 배경 위 빈 곳 클릭</li>
                <li>부재 연결: 절점 2개를 순서대로 클릭</li>
                <li>선택/이동: 절점 클릭 후 드래그</li>
              </ul>

              {pendingMemberStartId && (
                <p className={styles.pendingText}>
                  시작 절점 선택됨:{" "}
                  <strong>
                    {getNodeById(nodes, pendingMemberStartId)?.label}
                  </strong>
                </p>
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>표시 / 해석 옵션</h2>

            <div className={styles.formGridSingle}>
              <label className={styles.field}>
                <span>배경 투명도</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={backgroundOpacity}
                  onChange={(e) =>
                    setBackgroundOpacity(Number(e.target.value))
                  }
                />
              </label>

              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={snapEnabled}
                  onChange={(e) => setSnapEnabled(e.target.checked)}
                />
                <span>Grid Snap 사용</span>
              </label>

              <label className={styles.field}>
                <span>Grid Size</span>
                <input
                  type="number"
                  min={5}
                  value={gridSize}
                  onChange={(e) => setGridSize(Number(e.target.value) || 20)}
                />
              </label>

              <label className={styles.field}>
                <span>Zero-force tolerance</span>
                <input
                  type="number"
                  step="0.000001"
                  value={zeroTolerance}
                  onChange={(e) =>
                    setZeroTolerance(Number(e.target.value) || 1e-6)
                  }
                />
              </label>
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>모델 정보</h2>
            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span>절점</span>
                <strong>{nodes.length}</strong>
              </div>
              <div className={styles.metaItem}>
                <span>부재</span>
                <strong>{members.length}</strong>
              </div>
              <div className={styles.metaItem}>
                <span>하중</span>
                <strong>{loads.length}</strong>
              </div>
              <div className={styles.metaItem}>
                <span>지점</span>
                <strong>{supports.length}</strong>
              </div>
            </div>

            <div
              className={`${styles.statusBox} ${
                analysis.ok ? styles.statusOk : styles.statusError
              }`}
            >
              <p className={styles.statusTitle}>
                {analysis.ok ? "해석 가능" : "해석 불가"}
              </p>
              <p>{analysis.message}</p>
              {analysis.determinateMessage && (
                <p className={styles.smallMuted}>
                  {analysis.determinateMessage}
                </p>
              )}
            </div>
          </section>

          {selectedNode && (
            <section className={styles.panel}>
              <div className={styles.panelHeaderRow}>
                <h2 className={styles.panelTitle}>
                  절점 편집: {selectedNode.label}
                </h2>
                <button
                  className={styles.deleteMiniButton}
                  onClick={deleteSelectedNode}
                >
                  삭제
                </button>
              </div>

              <div className={styles.formGridSingle}>
                <label className={styles.field}>
                  <span>절점 이름</span>
                  <input
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === selectedNode.id ? { ...n, label } : n
                        )
                      );
                    }}
                  />
                </label>
              </div>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>X</span>
                  <input
                    type="number"
                    value={round2(selectedNode.x)}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === selectedNode.id ? { ...n, x: v } : n
                        )
                      );
                    }}
                  />
                </label>

                <label className={styles.field}>
                  <span>Y</span>
                  <input
                    type="number"
                    value={round2(selectedNode.y)}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === selectedNode.id ? { ...n, y: v } : n
                        )
                      );
                    }}
                  />
                </label>
              </div>

              <h3 className={styles.subTitle}>절점 하중 (kN)</h3>

              <div className={styles.formGrid}>
                <label className={styles.field}>
                  <span>Fx (+→)</span>
                  <input
                    type="number"
                    value={selectedNodeLoad?.fx ?? 0}
                    onChange={(e) => {
                      const fx = Number(e.target.value);
                      setLoads((prev) =>
                        setOrReplaceLoad(prev, selectedNode.id, {
                          fx,
                          fy: selectedNodeLoad?.fy ?? 0,
                        })
                      );
                    }}
                  />
                </label>

                <label className={styles.field}>
                  <span>Fy (+↑)</span>
                  <input
                    type="number"
                    value={selectedNodeLoad?.fy ?? 0}
                    onChange={(e) => {
                      const fy = Number(e.target.value);
                      setLoads((prev) =>
                        setOrReplaceLoad(prev, selectedNode.id, {
                          fx: selectedNodeLoad?.fx ?? 0,
                          fy,
                        })
                      );
                    }}
                  />
                </label>
              </div>

              <h3 className={styles.subTitle}>지점조건</h3>

              <div className={styles.formGridSingle}>
                <label className={styles.field}>
                  <span>Support Type</span>
                  <select
                    value={selectedNodeSupport?.type ?? "none"}
                    onChange={(e) => {
                      const type = e.target.value as SupportType;
                      setSupports((prev) =>
                        setOrReplaceSupport(prev, selectedNode.id, {
                          type,
                          reactionAngleDeg:
                            selectedNodeSupport?.reactionAngleDeg ?? 90,
                        })
                      );
                    }}
                  >
                    <option value="none">없음</option>
                    <option value="hinge">힌지 (Rx, Ry)</option>
                    <option value="roller">롤러 (1 reaction)</option>
                    <option value="fixed">
                      고정 (현재 트러스 모드에서는 Rx, Ry로 처리)
                    </option>
                  </select>
                </label>

                {(selectedNodeSupport?.type ?? "none") === "roller" && (
                  <label className={styles.field}>
                    <span>롤러 반력각 (deg)</span>
                    <input
                      type="number"
                      value={selectedNodeSupport?.reactionAngleDeg ?? 90}
                      onChange={(e) => {
                        const ang = Number(e.target.value);
                        setSupports((prev) =>
                          setOrReplaceSupport(prev, selectedNode.id, {
                            type: "roller",
                            reactionAngleDeg: ang,
                          })
                        );
                      }}
                    />
                  </label>
                )}
              </div>

              {analysis.ok && reactionResultMap.get(selectedNode.id) && (
                <div className={styles.infoCard}>
                  <p className={styles.infoTitle}>반력 결과</p>
                  <p>
                    Rx = {round2(reactionResultMap.get(selectedNode.id)!.rx)} kN
                  </p>
                  <p>
                    Ry = {round2(reactionResultMap.get(selectedNode.id)!.ry)} kN
                  </p>
                  <p>
                    |R| ={" "}
                    {round2(reactionResultMap.get(selectedNode.id)!.magnitude)}{" "}
                    kN
                  </p>
                </div>
              )}
            </section>
          )}

          {selectedMember && (
            <section className={styles.panel}>
              <div className={styles.panelHeaderRow}>
                <h2 className={styles.panelTitle}>
                  부재 편집: {selectedMember.label}
                </h2>
                <button
                  className={styles.deleteMiniButton}
                  onClick={deleteSelectedMember}
                >
                  삭제
                </button>
              </div>

              <div className={styles.formGridSingle}>
                <label className={styles.field}>
                  <span>부재 이름</span>
                  <input
                    type="text"
                    value={selectedMember.label}
                    onChange={(e) => {
                      const label = e.target.value;
                      setMembers((prev) =>
                        prev.map((m) =>
                          m.id === selectedMember.id ? { ...m, label } : m
                        )
                      );
                    }}
                  />
                </label>
              </div>

              <div className={styles.infoCard}>
                <p>
                  시작 절점:{" "}
                  <strong>
                    {getNodeById(nodes, selectedMember.startNodeId)?.label}
                  </strong>
                </p>
                <p>
                  끝 절점:{" "}
                  <strong>
                    {getNodeById(nodes, selectedMember.endNodeId)?.label}
                  </strong>
                </p>

                {analysis.ok && memberResultMap.get(selectedMember.id) && (
                  <>
                    <p>
                      부재력:{" "}
                      <strong>
                        {round2(memberResultMap.get(selectedMember.id)!.force)}{" "}
                        kN
                      </strong>
                    </p>
                    <p>
                      상태:{" "}
                      <strong>
                        {memberResultMap.get(selectedMember.id)!.state}
                      </strong>
                    </p>
                  </>
                )}
              </div>
            </section>
          )}

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>절점 목록</h2>
            <div className={styles.listBox}>
              {nodes.length === 0 ? (
                <p className={styles.emptyText}>아직 절점이 없습니다.</p>
              ) : (
                nodes.map((node) => (
                  <button
                    key={node.id}
                    className={`${styles.listRowButton} ${
                      selectedNodeId === node.id
                        ? styles.listRowButtonActive
                        : ""
                    }`}
                    onClick={() => {
                      setSelectedNodeId(node.id);
                      setSelectedMemberId(null);
                    }}
                  >
                    <span>{node.label}</span>
                    <span>
                      ({round2(node.x)}, {round2(node.y)})
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>부재 결과</h2>
            <div className={styles.tableWrap}>
              <table className={styles.resultTable}>
                <thead>
                  <tr>
                    <th>부재</th>
                    <th>력(kN)</th>
                    <th>상태</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.memberResults.length === 0 ? (
                    <tr>
                      <td colSpan={3} className={styles.tableEmpty}>
                        결과 없음
                      </td>
                    </tr>
                  ) : (
                    analysis.memberResults.map((row) => (
                      <tr key={row.memberId}>
                        <td>{row.label}</td>
                        <td>{round2(row.force)}</td>
                        <td
                          className={
                            row.state === "Tension"
                              ? styles.tension
                              : row.state === "Compression"
                              ? styles.compression
                              : styles.zeroForce
                          }
                        >
                          {row.state}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.panel}>
            <h2 className={styles.panelTitle}>지점반력 결과</h2>
            <div className={styles.tableWrap}>
              <table className={styles.resultTable}>
                <thead>
                  <tr>
                    <th>절점</th>
                    <th>Rx</th>
                    <th>Ry</th>
                    <th>|R|</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.reactionResults.length === 0 ? (
                    <tr>
                      <td colSpan={4} className={styles.tableEmpty}>
                        결과 없음
                      </td>
                    </tr>
                  ) : (
                    analysis.reactionResults.map((row) => (
                      <tr key={row.nodeId}>
                        <td>{row.nodeLabel}</td>
                        <td>{round2(row.rx)}</td>
                        <td>{round2(row.ry)}</td>
                        <td>{round2(row.magnitude)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </aside>

        <main className={styles.mainArea}>
          <section className={styles.canvasPanel}>
            <div className={styles.panelHeaderRow}>
              <div>
                <h2 className={styles.panelTitle}>Form Diagram</h2>
                <p className={styles.smallMuted}>
                  배경 이미지 위에 절점을 찍고, 부재를 연결하세요.
                </p>
              </div>

              <div className={styles.headerButtonGroup}>
                <button
                  className={styles.secondaryButton}
                  onClick={() =>
                    downloadSvg(formSvgRef.current, "form-diagram.svg")
                  }
                >
                  Form SVG 저장
                </button>
                <button
                  className={styles.secondaryButton}
                  onClick={() =>
                    downloadSvgAsPng(
                      formSvgRef.current,
                      "form-diagram.png",
                      canvasWidth,
                      canvasHeight
                    )
                  }
                >
                  Form PNG 저장
                </button>
              </div>
            </div>

            <div className={styles.canvasOuter}>
              <svg
                ref={formSvgRef}
                className={styles.formSvg}
                viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
                onClick={handleSvgClick}
                onMouseMove={handleSvgMouseMove}
                onMouseUp={handleSvgMouseUp}
                onMouseLeave={handleSvgMouseUp}
              >
                <defs>
                  <marker
                    id="loadArrowHead"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="4"
                    orient="auto"
                  >
                    <path d="M0,0 L8,4 L0,8 Z" fill="#ef4444" />
                  </marker>

                  <marker
                    id="reactionArrowHead"
                    markerWidth="8"
                    markerHeight="8"
                    refX="6"
                    refY="4"
                    orient="auto"
                  >
                    <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
                  </marker>
                </defs>

                {backgroundImage && (
                  <image
                    href={backgroundImage}
                    x={0}
                    y={0}
                    width={canvasWidth}
                    height={canvasHeight}
                    preserveAspectRatio="none"
                    opacity={backgroundOpacity}
                  />
                )}

                {snapEnabled &&
                  Array.from({
                    length: Math.ceil(canvasWidth / gridSize) + 1,
                  }).map((_, i) => (
                    <line
                      key={`grid-x-${i}`}
                      x1={i * gridSize}
                      y1={0}
                      x2={i * gridSize}
                      y2={canvasHeight}
                      className={styles.gridLine}
                    />
                  ))}

                {snapEnabled &&
                  Array.from({
                    length: Math.ceil(canvasHeight / gridSize) + 1,
                  }).map((_, i) => (
                    <line
                      key={`grid-y-${i}`}
                      x1={0}
                      y1={i * gridSize}
                      x2={canvasWidth}
                      y2={i * gridSize}
                      className={styles.gridLine}
                    />
                  ))}

                {members.map((member) => {
                  const a = getNodeById(nodes, member.startNodeId);
                  const b = getNodeById(nodes, member.endNodeId);
                  if (!a || !b) return null;

                  const result = memberResultMap.get(member.id);
                  const memberClass =
                    result?.state === "Tension"
                      ? styles.memberTension
                      : result?.state === "Compression"
                      ? styles.memberCompression
                      : styles.memberZero;

                  return (
                    <g key={member.id}>
                      <line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        className={`${styles.memberLine} ${memberClass} ${
                          selectedMemberId === member.id
                            ? styles.memberSelected
                            : ""
                        }`}
                      />
                      <line
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        className={styles.memberHitArea}
                        onClick={(evt) => handleMemberClick(evt, member.id)}
                      />
                      <text
                        x={(a.x + b.x) / 2}
                        y={(a.y + b.y) / 2 - 10}
                        className={styles.memberLabel}
                      >
                        {member.label}
                      </text>
                    </g>
                  );
                })}

                {nodes.map((node) => {
                  const load = getLoadForNode(loads, node.id);
                  if (Math.abs(load.fx) < 1e-9 && Math.abs(load.fy) < 1e-9) {
                    return null;
                  }

                  const scale = 2.1;
                  const dx = load.fx * scale;
                  const dy = -load.fy * scale;

                  return (
                    <g key={`load-${node.id}`}>
                      <line
                        x1={node.x - dx}
                        y1={node.y - dy}
                        x2={node.x}
                        y2={node.y}
                        className={styles.loadArrow}
                        markerEnd="url(#loadArrowHead)"
                      />
                      <text
                        x={node.x - dx}
                        y={node.y - dy - 8}
                        className={styles.loadLabel}
                      >
                        P ({round2(load.fx)}, {round2(load.fy)})
                      </text>
                    </g>
                  );
                })}

                {analysis.ok &&
                  analysis.reactionResults.map((reaction) => {
                    const node = getNodeById(nodes, reaction.nodeId);
                    if (!node) return null;

                    const scale = 2.1;
                    const dx = reaction.rx * scale;
                    const dy = -reaction.ry * scale;

                    return (
                      <g key={`reaction-${reaction.nodeId}`}>
                        <line
                          x1={node.x}
                          y1={node.y}
                          x2={node.x + dx}
                          y2={node.y + dy}
                          className={styles.reactionArrow}
                          markerEnd="url(#reactionArrowHead)"
                        />
                        <text
                          x={node.x + dx + 6}
                          y={node.y + dy - 6}
                          className={styles.reactionLabel}
                        >
                          R ({round2(reaction.rx)}, {round2(reaction.ry)})
                        </text>
                      </g>
                    );
                  })}

                {nodes.map((node) => {
                  const support = getSupportForNode(supports, node.id);
                  if (support.type === "none") return null;

                  const x = node.x;
                  const y = node.y + 20;

                  return (
                    <g key={`support-${node.id}`}>
                      {support.type === "hinge" && (
                        <>
                          <polygon
                            points={`${x - 12},${y} ${x + 12},${y} ${x},${
                              y - 16
                            }`}
                            className={styles.supportShape}
                          />
                          <line
                            x1={x - 18}
                            y1={y + 8}
                            x2={x + 18}
                            y2={y + 8}
                            className={styles.supportGround}
                          />
                        </>
                      )}

                      {support.type === "roller" && (
                        <>
                          <polygon
                            points={`${x - 12},${y} ${x + 12},${y} ${x},${
                              y - 16
                            }`}
                            className={styles.supportShape}
                          />
                          <circle
                            cx={x - 7}
                            cy={y + 8}
                            r={4}
                            className={styles.supportWheel}
                          />
                          <circle
                            cx={x + 7}
                            cy={y + 8}
                            r={4}
                            className={styles.supportWheel}
                          />
                          <line
                            x1={x - 18}
                            y1={y + 16}
                            x2={x + 18}
                            y2={y + 16}
                            className={styles.supportGround}
                          />
                        </>
                      )}

                      {support.type === "fixed" && (
                        <>
                          <rect
                            x={x - 10}
                            y={y - 16}
                            width={20}
                            height={16}
                            className={styles.supportShape}
                          />
                          {Array.from({ length: 6 }).map((_, i) => (
                            <line
                              key={i}
                              x1={x - 14 + i * 5}
                              y1={y}
                              x2={x - 22 + i * 5}
                              y2={y + 12}
                              className={styles.supportHatch}
                            />
                          ))}
                        </>
                      )}
                    </g>
                  );
                })}

                {nodes.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isPending = pendingMemberStartId === node.id;

                  return (
                    <g key={node.id}>
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={8}
                        className={`${styles.nodeCircle} ${
                          isSelected ? styles.nodeSelected : ""
                        } ${isPending ? styles.nodePending : ""}`}
                        onMouseDown={(evt) => handleNodeMouseDown(evt, node.id)}
                      />
                      <text
                        x={node.x + 10}
                        y={node.y - 10}
                        className={styles.nodeLabel}
                      >
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </section>

          <section className={styles.canvasPanel}>
            <div className={styles.panelHeaderRow}>
              <div>
                <h2 className={styles.panelTitle}>Force Diagram</h2>
                <p className={styles.smallMuted}>
                  절점별 Force Polygon 또는 Global Force Overview를 볼 수 있습니다.
                </p>
              </div>

              <div className={styles.headerRightStack}>
                <div className={styles.modeButtonRow}>
                  <button
                    className={`${styles.smallModeButton} ${
                      forceDiagramMode === "joint-polygons"
                        ? styles.smallModeButtonActive
                        : ""
                    }`}
                    onClick={() => setForceDiagramMode("joint-polygons")}
                  >
                    절점별 Force Polygon
                  </button>
                  <button
                    className={`${styles.smallModeButton} ${
                      forceDiagramMode === "global-overview"
                        ? styles.smallModeButtonActive
                        : ""
                    }`}
                    onClick={() => setForceDiagramMode("global-overview")}
                  >
                    Global Overview
                  </button>
                </div>

                <div className={styles.headerButtonGroup}>
                  <button
                    className={styles.secondaryButton}
                    onClick={() =>
                      downloadSvg(forceSvgRef.current, "force-diagram.svg")
                    }
                  >
                    Force SVG 저장
                  </button>
                  <button
                    className={styles.secondaryButton}
                    onClick={() =>
                      downloadSvgAsPng(
                        forceSvgRef.current,
                        "force-diagram.png",
                        activeForceSvgWidth,
                        activeForceSvgHeight
                      )
                    }
                  >
                    Force PNG 저장
                  </button>
                </div>
              </div>
            </div>

            <div className={styles.forceDiagramWrap}>
              {!analysis.ok ? (
                <div className={styles.forceEmpty}>
                  <p>해석이 가능해야 Force Diagram이 생성됩니다.</p>
                  <p className={styles.smallMuted}>
                    정정조건(b + r = 2j)과 안정성을 먼저 만족시켜 주세요.
                  </p>
                </div>
              ) : forceDiagramMode === "joint-polygons" ? (
                <svg
                  ref={forceSvgRef}
                  className={styles.forceSvg}
                  viewBox={`0 0 ${jointForceSvgWidth} ${jointForceSvgHeight}`}
                >
                  {jointPolygons.map((poly, index) => {
                    const col = index % forceCols;
                    const row = Math.floor(index / forceCols);
                    const cellX = col * forceCellWidth;
                    const cellY = row * forceCellHeight;

                    let currentX = 0;
                    let currentY = 0;
                    const points = [{ x: 0, y: 0 }];

                    poly.vectors.forEach((vector) => {
                      currentX += vector.vx;
                      currentY += vector.vy;
                      points.push({ x: currentX, y: currentY });
                    });

                    const xs = points.map((p) => p.x);
                    const ys = points.map((p) => p.y);
                    const minX = Math.min(...xs);
                    const maxX = Math.max(...xs);
                    const minY = Math.min(...ys);
                    const maxY = Math.max(...ys);

                    const offsetX =
                      cellX +
                      forceCellWidth / 2 -
                      ((minX + maxX) / 2) * jointForceScale;

                    const offsetY =
                      cellY +
                      forceCellHeight / 2 +
                      ((minY + maxY) / 2) * jointForceScale;

                    const pathD = points
                      .map((p, i) => {
                        const sx = offsetX + p.x * jointForceScale;
                        const sy = offsetY - p.y * jointForceScale;
                        return `${i === 0 ? "M" : "L"} ${sx} ${sy}`;
                      })
                      .join(" ");

                    const endPt = points[points.length - 1];
                    const residual = Math.hypot(endPt.x, endPt.y);

                    return (
                      <g key={poly.nodeId}>
                        <rect
                          x={cellX + 10}
                          y={cellY + 10}
                          width={forceCellWidth - 20}
                          height={forceCellHeight - 20}
                          className={styles.forceCell}
                        />

                        <text
                          x={cellX + 20}
                          y={cellY + 28}
                          className={styles.forceCellTitle}
                        >
                          Joint {poly.nodeLabel}
                        </text>

                        <path d={pathD} className={styles.forcePath} />

                        {points.map((p, i) => {
                          const sx = offsetX + p.x * jointForceScale;
                          const sy = offsetY - p.y * jointForceScale;
                          return (
                            <circle
                              key={i}
                              cx={sx}
                              cy={sy}
                              r={3.5}
                              className={styles.forcePoint}
                            />
                          );
                        })}

                        {poly.vectors.map((vector, idx) => {
                          const p1 = points[idx];
                          const p2 = points[idx + 1];
                          const x1 = offsetX + p1.x * jointForceScale;
                          const y1 = offsetY - p1.y * jointForceScale;
                          const x2 = offsetX + p2.x * jointForceScale;
                          const y2 = offsetY - p2.y * jointForceScale;
                          const mx = (x1 + x2) / 2;
                          const my = (y1 + y2) / 2;

                          const vectorClass =
                            vector.kind === "load"
                              ? styles.forceVectorLoad
                              : vector.kind === "reaction"
                              ? styles.forceVectorReaction
                              : vector.state === "Tension"
                              ? styles.forceVectorTension
                              : vector.state === "Compression"
                              ? styles.forceVectorCompression
                              : styles.forceVectorZero;

                          return (
                            <g key={`${poly.nodeId}-${idx}`}>
                              <line
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                className={vectorClass}
                              />
                              <text
                                x={mx + 6}
                                y={my - 4}
                                className={styles.forceVectorLabel}
                              >
                                {vector.label}
                              </text>
                            </g>
                          );
                        })}

                        {residual > zeroTolerance && (
                          <text
                            x={cellX + 20}
                            y={cellY + forceCellHeight - 18}
                            className={styles.forceResidual}
                          >
                            residual: {round2(residual)}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <svg
                  ref={forceSvgRef}
                  className={styles.forceSvg}
                  viewBox={`0 0 ${globalForceSvgWidth} ${globalForceSvgHeight}`}
                >
                  <rect
                    x={18}
                    y={18}
                    width={globalForceSvgWidth - 36}
                    height={globalForceSvgHeight - 36}
                    className={styles.globalFrame}
                  />

                  <text x={34} y={40} className={styles.forceCellTitle}>
                    Global Force Overview (beta)
                  </text>
                  <text x={34} y={60} className={styles.globalSubText}>
                    외력, 반력, 부재력 벡터를 전체적으로 연속 표시한 개요도
                  </text>

                  {(() => {
                    const originX = globalForceSvgWidth / 2;
                    const originY = globalForceSvgHeight / 2;

                    let currentX = 0;
                    let currentY = 0;

                    return (
                      <>
                        <line
                          x1={40}
                          y1={originY}
                          x2={globalForceSvgWidth - 40}
                          y2={originY}
                          className={styles.axisLine}
                        />
                        <line
                          x1={originX}
                          y1={80}
                          x2={originX}
                          y2={globalForceSvgHeight - 40}
                          className={styles.axisLine}
                        />

                        {globalForceSegments.map((seg, idx) => {
                          const x1 = originX + currentX * globalForceScale;
                          const y1 = originY - currentY * globalForceScale;

                          currentX += seg.vx;
                          currentY += seg.vy;

                          const x2 = originX + currentX * globalForceScale;
                          const y2 = originY - currentY * globalForceScale;

                          const mx = (x1 + x2) / 2;
                          const my = (y1 + y2) / 2;

                          const cls =
                            seg.kind === "load"
                              ? styles.forceVectorLoad
                              : seg.kind === "reaction"
                              ? styles.forceVectorReaction
                              : seg.state === "Tension"
                              ? styles.forceVectorTension
                              : seg.state === "Compression"
                              ? styles.forceVectorCompression
                              : styles.forceVectorZero;

                          return (
                            <g key={seg.id}>
                              <line x1={x1} y1={y1} x2={x2} y2={y2} className={cls} />
                              <circle cx={x1} cy={y1} r={3} className={styles.forcePoint} />
                              <circle cx={x2} cy={y2} r={3} className={styles.forcePoint} />
                              <text x={mx + 6} y={my - 6} className={styles.forceVectorLabel}>
                                {seg.label}
                              </text>

                              {idx === globalForceSegments.length - 1 && (
                                <text
                                  x={x2 + 8}
                                  y={y2 - 8}
                                  className={styles.forceResidual}
                                >
                                  end ({round2(currentX)}, {round2(currentY)})
                                </text>
                              )}
                            </g>
                          );
                        })}
                      </>
                    );
                  })()}
                </svg>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}