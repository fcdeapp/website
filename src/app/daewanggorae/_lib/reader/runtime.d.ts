import type { ReaderBlock, ReaderConcept, ReaderDocument } from './types';
export type Interval = { start: number; end: number; kind: 'highlight' | 'conceptLink'; id: string; level?: string; documentId?: string; href?: string; label?: string; conceptId?: string };
export type Plan = { valid: boolean; reason?: string; markdown: string; intervals: Interval[] };
export type Piece = { text: string; highlight?: Interval; link?: Interval };
export function sha256(text: string): Promise<string>;
export function prepareBlock(markdown: string, record: ReaderBlock | undefined, options: {
  documentId: string; concepts: { concepts: ReaderConcept[] }; documents: { documents: ReaderDocument[] };
  resolveDocumentHref: (id: string) => string | undefined; highlightsEnabled?: boolean; linksEnabled?: boolean;
  digest?: (text: string) => Promise<string>;
}): Promise<Plan>;
export function splitLiteralText(value: string, start: number | undefined, end: number | undefined, plan: Plan): Piece[];
export function decorateMdast<T>(tree: T, plan: Plan): T;
