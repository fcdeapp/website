import { safeNoteLink } from "./presentation";
import { renderCompiledEvidence } from "./compiledEvidence";
import extensionCSS from "./generated/question-evidence-css.json";
import {
  Evidence,
  TableData,
  GraphData,
  DisplayQuestion,
  templates,
  validateEvidence,
  profileLabel,
} from "./model";
export const escapeHTML = (s: unknown) =>
  String(s ?? "—").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const esc = escapeHTML;
const line = (x1: number, y1: number, x2: number, y2: number, extra = "") =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="currentColor" ${extra}/>`;
const label = (x: number, y: number, t: unknown, extra = "") =>
  `<text x="${x}" y="${y}" ${extra}>${esc(t)}</text>`;
function table(d: TableData, type: string) {
  const title = templates[`${type}@1.0.0` as keyof typeof templates];
  return `<div class="table-scroll" tabindex="0" role="region" aria-label="${title}"><table><caption>${title}</caption><thead><tr>${d.headers.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead><tbody>${d.rows.map((row) => `<tr>${row.map((cell, i) => (i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`)).join("")}</tr>`).join("")}</tbody></table></div>`;
}
const dash = ["", "8 5", "2 4", "10 4 2 4"];
function graph(d: GraphData, type: string) {
  const [a, b, c, z] = d.domain,
    log = d.scale === "log";
  const fx = (v: number) =>
    84 +
    ((log ? Math.log10(v / a) : v - a) / (log ? Math.log10(b / a) : b - a)) *
      470;
  const fy = (v: number) => 292 - ((v - c) / (z - c)) * 220;
  const xt = log ? [0.01, 0.1, 1, 10, 100, 1000, 10000] : [0, 50, 100, 150],
    yt = log ? [0, 25, 50, 75, 100] : [0, 40, 80, 120, 160];
  let svg = `<svg viewBox="0 0 640 376" role="img" aria-label="${esc(d.xLabel)}와 ${esc(d.yLabel)}. 자료 표에서 좌표를 확인할 수 있습니다."><g font-size="14" fill="currentColor">`;
  yt.forEach((y) => {
    svg +=
      line(84, fy(y), 554, fy(y), 'opacity=".13"') +
      label(72, fy(y) + 5, y, 'text-anchor="end"');
  });
  xt.forEach((x) => {
    svg +=
      line(fx(x), 292, fx(x), 298) +
      label(fx(x), 321, x, 'text-anchor="middle"');
  });
  svg +=
    line(84, 72, 84, 292) +
    line(84, 292, 554, 292) +
    label(320, 359, d.xLabel, 'text-anchor="middle"') +
    label(
      25,
      182,
      d.yLabel,
      'text-anchor="middle" transform="rotate(-90 25 182)"',
    );
  d.series.forEach((s, i) => {
    const points = s.samples.map(([x, y]) => [fx(x), fy(y)]);
    svg += `<polyline data-series="${i}" points="${points.map((p) => p.join(",")).join(" ")}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="${dash[i]}"/>`;
    // Direction arrows follow the ORIGINAL ordered segments. No smoothing or sorting.
    if (type === "F-G05")
      for (let j = 1; j < points.length; j++) {
        const [x, y] = points[j - 1],
          [u, v] = points[j],
          length = Math.hypot(u - x, v - y);
        if (length < 4 || (points.length > 30 && j % 12 !== 0)) continue;
        const mx = (x + u) / 2,
          my = (y + v) / 2,
          dx = (u - x) / length,
          dy = (v - y) / length;
        svg += `<path data-direction="${j}" d="M${mx - 8 * dx + 4 * dy} ${my - 8 * dy - 4 * dx}L${mx} ${my}L${mx - 8 * dx - 4 * dy} ${my - 8 * dy + 4 * dx}" fill="none" stroke="currentColor" stroke-width="1.8"/>`;
      }
    svg +=
      line(
        84 + i * 118,
        35,
        111 + i * 118,
        35,
        `stroke-width="2" stroke-dasharray="${dash[i]}"`,
      ) + label(119 + i * 118, 40, s.label);
  });
  svg += "</g></svg>";
  return (
    svg +
    `<details><summary>좌표 자료 보기</summary>${d.series.map((s) => table({ headers: [d.xLabel, d.yLabel], rows: s.samples }, "F-T03").replace("<caption>시간에 따른 변화</caption>", `<caption>${esc(s.label)}</caption>`)).join("")}</details>`
  );
}
function bars(d: TableData) {
  const count = d.rows.length,
    slot = 460 / count;
  let svg =
    '<svg viewBox="0 0 640 380" role="img" aria-label="항목별 EDV와 ESV의 용적 비교. 흰 막대 EDV, 빗금 막대 ESV."><defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 6L6 0" stroke="currentColor" stroke-width="1"/></pattern></defs><g fill="currentColor" font-size="15">';
  [0, 50, 100, 150, 200].forEach((v) => {
    const y = 290 - v;
    svg +=
      line(75, y, 560, y, 'opacity=".15"') +
      label(63, y + 5, v, 'text-anchor="end"');
  });
  svg +=
    line(75, 90, 75, 290) +
    line(75, 290, 560, 290) +
    label(75, 30, "심실 용적 (mL)") +
    label(75, 58, "흰 막대 EDV · 빗금 막대 ESV");
  d.rows.forEach((r, i) => {
    const center = 95 + slot * (i + 0.5);
    [1, 2].forEach((c, j) => {
      const value = Number(r[c]),
        x = center - 52 + j * 56;
      svg +=
        `<rect x="${x}" y="${290 - value}" width="40" height="${value}" fill="${j ? "url(#hatch)" : "var(--paper)"}" stroke="currentColor"/>` +
        label(x + 20, 280 - value, value, 'text-anchor="middle"');
    });
    svg += label(center, 322, r[0], 'text-anchor="middle"');
  });
  return (
    svg +
    "</g></svg>" +
    `<details><summary>자료 표 보기</summary>${table(d, "F-T02")}</details>`
  );
}
function follicle(data: { target: string }) {
  let svg =
    '<svg viewBox="0 0 560 270" role="img" aria-label="교육용 조직 모식도. 내강 안의 지점을 X 지시선으로 표시함."><ellipse cx="235" cy="135" rx="125" ry="88" fill="none" stroke="currentColor"/>';
  for (let i = 0; i < 18; i++) {
    const a = (i * Math.PI) / 9,
      x = 235 + 120 * Math.cos(a),
      y = 135 + 82 * Math.sin(a);
    svg += `<ellipse cx="${x}" cy="${y}" rx="14" ry="13" fill="var(--paper)" stroke="currentColor"/><circle cx="${x}" cy="${y}" r="3" fill="currentColor"/>`;
  }
  return (
    svg +
    `<path d="M455 80L267 130l12 -9m-12 9l15 1" fill="none" stroke="currentColor"/>${label(466, 82, data.target, 'font-size="20"')}</svg><p class="caption">교육용 모식도 · 실제 조직사진이 아닙니다.</p>`
  );
}
function pathway(d: { nodes: string[]; edges: number[][] }) {
  const height = d.nodes.length * 86 + 24;
  let svg = `<svg viewBox="0 0 640 ${height}" role="img" aria-label="경로 모식도. 아래 연결 목록에서 각 방향을 확인할 수 있습니다."><defs><marker id="edge-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0 0L7 3L0 6" fill="currentColor"/></marker></defs>`;
  d.edges.forEach(([a, b], i) => {
    const down = b > a,
      y1 = 24 + a * 86 + (down ? 48 : 0),
      y2 = 24 + b * 86 + (down ? 0 : 48);
    const route =
      Math.abs(a - b) === 1
        ? `M320 ${y1}L320 ${y2}`
        : `M520 ${y1 - 24 * (down ? 1 : -1)}H${552 + i * 8}V${y2 + 24 * (down ? 1 : -1)}H520`;
    svg += `<path data-edge="${a}-${b}" d="${route}" fill="none" stroke="currentColor" marker-end="url(#edge-arrow)"/>`;
  });
  d.nodes.forEach((n, i) => {
    svg += `<rect x="120" y="${24 + i * 86}" width="400" height="48" fill="var(--paper)" stroke="currentColor"/>${label(320, 54 + i * 86, n, 'text-anchor="middle" font-size="15"')}`;
  });
  return (
    svg +
    `</svg><details><summary>연결 목록 보기</summary><ul>${d.edges.map(([a, b]) => `<li>${esc(d.nodes[a])} → ${esc(d.nodes[b])}</li>`).join("")}</ul></details>`
  );
}
export function renderEvidence(raw: Evidence): string {
  const e = validateEvidence(raw),
    d = e.data;
  if (e.templateId !== e.type) return renderCompiledEvidence(e);
  switch (e.templateId) {
    case "F-G01":
    case "F-G05":
      return graph(d as GraphData, e.type);
    case "F-G04":
      return bars(d as TableData);
    case "F-D01":
      return follicle(d as { target: string });
    case "F-D02":
      return pathway(d as { nodes: string[]; edges: number[][] });
    default:
      return table(d as TableData, e.type);
  }
}
// Self-contained zoom keeps original image pixels accessible offline in WebView.
const imageViewerScript = `document.addEventListener('click',function(event){var image=event.target.closest('.dataset-evidence img');if(!image)return;event.preventDefault();var dialog=document.createElement('dialog');dialog.className='image-viewer';dialog.setAttribute('aria-label',image.alt||'자료 확대');var close=document.createElement('button');close.textContent='닫기';var scroll=document.createElement('div');var original=image.cloneNode();scroll.append(original);dialog.append(close,scroll);document.body.append(dialog);close.onclick=function(){dialog.close()};dialog.addEventListener('close',function(){dialog.remove()});dialog.showModal();close.focus()});`;
export const editorialCSS = extensionCSS + `article h1{margin:0 0 8px;line-height:1.6}article .metadata{margin:0 0 20px;line-height:1.6}.question-footnotes:target{outline:1px solid #A9C1D1}.question-footnotes{display:flex;gap:8px;margin-top:18px;padding-top:10px;border-top:1px solid #d9dde0;font-size:12px;line-height:1.7;color:#59636c;break-inside:avoid}.question-footnotes ul{list-style:none;margin:0;padding:0;flex:1}.question-footnotes li+li{margin-top:5px}.question-footnotes a{color:inherit;text-decoration:underline}.note-marker{display:inline-flex;min-width:44px;min-height:44px;justify-content:center;text-decoration:none;font-size:16px;color:#59636c}a:focus-visible{outline:2px solid #467D9E;outline-offset:2px}.note-back{min-width:32px}.options{break-after:avoid}@media print{.answer-area{break-inside:avoid-page}.dataset-evidence img{max-height:85mm;width:auto;max-width:100%;object-fit:contain;margin:auto}.question-footnotes{display:block;break-inside:avoid-page}.question-footnotes>span{float:left}.question-footnotes ul{padding-left:14px}.note-marker{min-width:16px;min-height:0}.note-back{display:none}.question-footnotes{font-size:9pt}}
:root{--paper:#fff;--ink:#222}*{box-sizing:border-box}.image-viewer{width:95vw;max-width:none;max-height:90vh;padding:12px;border:1px solid #aaa;background:white;color:#222}.image-viewer>div{overflow:auto;max-height:72vh}.image-viewer img{width:auto;max-width:none;height:auto;display:block}.image-viewer button{margin-bottom:12px}.image-viewer::backdrop{background:#0009}.dataset-evidence img{cursor:zoom-in}.dataset-evidence{background:#fff;color:#222;min-width:0}.dataset-evidence>.evidence{margin:0;padding:0}.dataset-evidence img{max-width:100%;height:auto}.dataset-evidence figure{margin-left:0;margin-right:0}.dataset-evidence svg{color:#222}body{margin:0;color:var(--ink);background:var(--paper);font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;font-size:16px;line-height:1.8}svg{display:block;width:100%;height:auto;max-height:none}table{width:100%;border-collapse:collapse;font-size:14px;line-height:1.65;border-top:2px solid currentColor;border-bottom:1px solid currentColor}caption{text-align:left;font-weight:600;padding:0 0 12px}th,td{text-align:left;padding:10px 12px;border-bottom:1px solid #d9dde0;vertical-align:top;overflow-wrap:anywhere}th{font-weight:600}thead th{background:#f5f6f7}tbody th{font-weight:400}td{font-variant-numeric:tabular-nums}.table-scroll{overflow-x:auto}summary{cursor:pointer;font-size:13px;color:inherit;padding:8px 0}.caption{font-size:12px;color:inherit}details{margin-top:8px}article{max-width:820px;margin:auto;padding:28px}article p{white-space:pre-wrap}.evidence{margin:24px 0;break-inside:avoid}.evidence:first-child{margin-top:0}article .lead{font-weight:600}ol.options{list-style:none;padding:0}ol.options li{display:flex;gap:14px;padding:8px 0}ol.options li span:first-child{flex:none}h1{font-size:23px}h2{font-size:18px}.metadata{font-size:12px;color:#555}.print-tools{padding:16px;text-align:right}button{font:inherit;padding:8px 16px;background:white;border:1px solid #ccc} @media(max-width:420px){article{padding:16px}th,td{padding:8px;font-size:13px}} @media print{@page{size:A4;margin:16mm}body{font-size:11pt}.print-tools,details{display:none}article{padding:0;max-width:none;break-after:page;break-inside:avoid}article:last-child{break-after:auto}.stem,.lead{break-after:avoid}.options,table,svg{break-inside:avoid}thead{display:table-header-group}svg{max-height:100mm}h1{font-size:15pt}article .evidence{margin:12px 0}.multiple-evidence{font-size:10pt;line-height:1.55}.multiple-evidence svg{max-height:62mm}.multiple-evidence th,.multiple-evidence td{padding:5px 8px;font-size:10pt}.multiple-evidence .evidence{margin:8px 0}.multiple-evidence .options li{padding:4px 0}}`;
export function evidenceDocument(
  evidence: Evidence[],
  colors?: { ink: string; surface: string },
  markup?: string[],
) {
  return `<!doctype html><html lang="ko"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${editorialCSS}${colors ? `:root{--ink:${colors.ink};--paper:${colors.surface}}` : ""}</style><body><main id="content">${evidence.map((e, i) => `<section class="evidence">${markup?.[i] ?? renderEvidence(e)}</section>`).join("")}</main><script>${imageViewerScript}function report(){var p={type:'height',height:Math.ceil(document.getElementById('content').getBoundingClientRect().height)+4};if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(p));else parent.postMessage({daewanggorae:true,payload:p},'*')}new ResizeObserver(report).observe(document.getElementById('content'));window.addEventListener('load',report);</script></body></html>`;
}
function printNotes(q: DisplayQuestion, instance: string) {
  const notes = q.presentation?.notes;
  if (!notes?.length) return { marker: '', footer: '' };
  const id = 'note-' + instance.replace(/[^a-zA-Z0-9_-]/g, '-');
  return {
    marker: `<sup><a class="note-marker" id="${id}-ref" href="#${id}" aria-label="문항의 출처와 자료 안내 보기">*</a></sup>`,
    footer: `<aside class="question-footnotes" id="${id}" aria-label="출처와 자료 안내"><span aria-hidden="true">*</span><ul>${notes.map(note => `<li>${esc(note.text)}${(note.links ?? []).filter(link => safeNoteLink(link.href)).map(link => ` <a href="${esc(link.href)}" target="_blank" rel="noopener noreferrer">${esc(link.label)}</a>`).join('')}</li>`).join('')}</ul><a class="note-back" href="#${id}-ref" aria-label="문항으로 돌아가기">↑</a></aside>`,
  };
}
export function printableQuestion(q: DisplayQuestion, n = 1, instance = String(n)) {
  const notes = printNotes(q, instance);
  if (q.format !== "v2")
    throw new Error("기존 문항의 인쇄는 미디어 검증 후 지원합니다.");
  return `<article class="${q.evidence.length > 1 ? "multiple-evidence" : ""}"><h1>${n}번${notes.marker}</h1><p class="metadata">자체 제작 학습 문항 · ${esc(profileLabel(q.profile))}</p><p class="stem">${esc(q.presentation?.displayStem ?? q.prompt)}</p>${q.evidence.map((e, i) => `<div class="evidence" data-evidence-id="${esc(e.id)}">${q.presentation?.evidenceMarkup[i] ?? renderEvidence(e)}</div>`).join("")}<p class="lead">${esc(q.leadIn)}</p><div class="answer-area"><ol class="options">${q.options.map((o, i) => `<li><span>${["①", "②", "③", "④", "⑤"][i]}</span><span>${esc(o.text)}</span></li>`).join("")}</ol>${notes.footer}</div></article>`;
}
export function printDocument(questions: DisplayQuestion[]) {
  return `<!doctype html><html lang="ko"><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>대왕고래 문제풀이</title><style>${editorialCSS}</style><body><nav class="print-tools"><button onclick="window.print()">인쇄 / PDF 저장</button></nav>${questions.map((q, i) => printableQuestion(q, i + 1)).join("")}<script>${imageViewerScript}</script></body></html>`;
}
