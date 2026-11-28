export type TermRange = { start: number; end: number };
// Conservative typography only: Korean term followed by a Latin gloss/abbreviation.
// Dates, quantities, equations, citations and Korean explanatory asides stay unchanged.
const units = /^(?:mg|g|kg|mL|ml|L|l|mm|cm|m|nm|μm|µm|mmHg|kPa|Pa|Hz|kHz|bpm|mol|mmol|mmol\/L|mEq\/L|IU|U|ms|min|sec|hr|h|s|d|°C)$/;
export function technicalTermRanges(text: string): TermRange[] {
  const ranges: TermRange[] = [];
  const pattern = /[가-힣][ \t]*\(([A-Za-z][A-Za-z0-9α-ωΑ-Ω ,./’'‐‑–-]{1,119})\)/g;
  for (const match of text.matchAll(pattern)) {
    const term = match[1].trim();
    if (units.test(term) || !/[A-Za-z]{2}/.test(term) || /(?:https?|www\.|et al\.|\b(?:19|20)\d{2}\b)/i.test(term)) continue;
    const start = match.index + match[0].indexOf('(');
    ranges.push({ start, end: match.index + match[0].length });
  }
  return ranges;
}
/** UTF-16 boundaries match the reader annotation contract; never normalize text. */
export function splitTechnicalTerms(text: string, offset: number, ranges: TermRange[]) {
  const boundaries = new Set([0, text.length]);
  for (const range of ranges) {
    if (range.start < offset + text.length && range.end > offset) {
      boundaries.add(Math.max(0, range.start - offset));
      boundaries.add(Math.min(text.length, range.end - offset));
    }
  }
  const points = [...boundaries].sort((a, b) => a - b);
  return points.slice(0, -1).map((start, i) => ({
    text: text.slice(start, points[i + 1]),
    term: ranges.some(range => range.start <= offset + start && range.end >= offset + points[i + 1]),
  }));
}
