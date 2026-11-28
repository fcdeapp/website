// Adapted from medicine/reader/runtime/annotations.mjs (0.9.1).
// Only addition: injectable platform SHA-256; unsupported crypto still fails closed.
/** Browser/Node ES module. No framework, DOM, filesystem, or raw HTML dependency. */
const ID = /^[A-Za-z0-9._-]+$/;
function safeRoute(route) {
  return typeof route === 'string' && route.startsWith('/') && !route.startsWith('//') && !/[\\\u0000-\u0020]/.test(route);
}
export async function sha256(text) {
  const bytes = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
}
/** No substring search or automatic relocation after an edit: a stale block fails closed. */
export async function prepareBlock(markdown, record, { documentId, concepts, documents, resolveDocumentHref, highlightsEnabled = true, linksEnabled = true, digest = sha256 } = {}) {
  const empty = reason => ({ valid: false, reason, markdown, intervals: [] });
  if (typeof markdown !== 'string' || !record || !Array.isArray(record.annotations)) return empty('missing_record');
  if (record.sourceLengthUtf16 !== markdown.length || record.sourceSha256 !== await digest(markdown)) return empty('stale_source');
  const conceptMap = new Map((concepts?.concepts ?? []).map(c => [c.id, c]));
  const docMap = new Map((documents?.documents ?? []).map(d => [d.id, d]));
  const intervals = [], acceptedLinks = [];
  for (const ann of record.annotations) {
    const s = ann.selector;
    if (!s || s.offsetUnit !== 'utf16' || !Number.isInteger(s.start) || !Number.isInteger(s.end) || s.start < 0 || s.end <= s.start || s.end > markdown.length || markdown.slice(s.start, s.end) !== s.exact) continue;
    if (!markdown.slice(0, s.start).endsWith(s.prefix ?? '') || !markdown.slice(s.end).startsWith(s.suffix ?? '')) continue;
    if (ann.kind === 'highlight' && highlightsEnabled && ['key', 'critical'].includes(ann.level)) {
      intervals.push({ start: s.start, end: s.end, kind: 'highlight', id: ann.id, level: ann.level });
    } else if (ann.kind === 'conceptLink' && linksEnabled) {
      const concept = conceptMap.get(ann.conceptId), target = docMap.get(ann.targetDocumentId);
      if (!concept || concept.targetDocumentId !== ann.targetDocumentId || !target || target.contentState !== 'available_editorial_draft' || target.id === documentId || !ID.test(target.id)) continue;
      if (acceptedLinks.some(a => s.start < a.end && s.end > a.start)) continue;
      const href = resolveDocumentHref?.(target.id);
      if (!safeRoute(href)) continue;
      const item = { start: s.start, end: s.end, kind: 'conceptLink', id: ann.id, conceptId: concept.id, documentId: target.id, label: target.title?.ko ?? target.id, href };
      acceptedLinks.push(item); intervals.push(item);
    }
  }
  return { valid: true, markdown, intervals: intervals.sort((a,b) => a.start - b.start || b.end - a.end) };
}
/** Split one *literal mdast text node* by raw-Markdown UTF-16 positions.
 * Escapes, entities, or parser transformations that changed node.value are skipped, never guessed.
 * Parsed AST positions must refer to the SAME paragraph.markdown passed to prepareBlock.
 */
export function splitLiteralText(value, start, end, plan) {
  if (!plan?.valid || !Number.isInteger(start) || !Number.isInteger(end) || plan.markdown.slice(start, end) !== value) return [{ text: value }];
  const spans = plan.intervals.filter(a => a.start < end && a.end > start);
  const cuts = [...new Set([start, end, ...spans.flatMap(a => [Math.max(start,a.start), Math.min(end,a.end)])])].sort((a,b)=>a-b);
  return cuts.slice(0,-1).map((a,i) => {
    const b = cuts[i+1], active = spans.filter(s => s.start <= a && s.end >= b);
    return { text: plan.markdown.slice(a,b), highlight: active.find(s=>s.kind==='highlight'), link: active.find(s=>s.kind==='conceptLink') };
  });
}
/** Reference mdast transformation, before remark->rehype.
 * custom `readerHighlight` uses standard mdast-util-to-hast data.hName='mark'.
 * Host React/RN renderer may use splitLiteralText directly; never render HTML from data.
 */
export function decorateMdast(tree, plan) {
  const skip = new Set(['link','linkReference','image','imageReference','code','inlineCode','html','definition']);
  function visit(node) {
    if (skip.has(node.type)) return node;
    if (node.type === 'text') {
      const pieces = splitLiteralText(node.value, node.position?.start?.offset, node.position?.end?.offset, plan);
      return pieces.map(piece => {
        let result = { type: 'text', value: piece.text };
        if (piece.highlight) result = { type: 'readerHighlight', data: { hName: 'mark', hProperties: { className: ['reader-highlight'], 'data-level': piece.highlight.level, 'data-annotation-id':piece.highlight.id } }, children: [result] };
        if (piece.link) result = { type: 'link', url: piece.link.href, data: { hProperties: { className: ['reader-concept-link'], 'data-concept-id': piece.link.conceptId, 'data-document-id': piece.link.documentId } }, children: [result] };
        return result;
      });
    }
    return node.children ? { ...node, children: node.children.flatMap(child=>visit(child)) } : node;
  }
  return visit(tree);
}
