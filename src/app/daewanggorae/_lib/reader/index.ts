import { content, getCatalog, getManifest } from '../content';
import type { ReaderConcept, ReaderDocument, ReaderDocumentAnnotations } from './types';
export type ReaderData = {documentId:string; concepts:{concepts:ReaderConcept[]}; documents:{documents:ReaderDocument[]}; annotations:ReaderDocumentAnnotations};
export async function getReaderDocument(documentId:string):Promise<ReaderData|null> {
 const manifest = await getManifest();
 if (!manifest.files['reader/manifest.json']) return null;
 const [documents, concepts, index, catalog] = await Promise.all([
 content.read<ReaderData['documents']>('reader/documents.json'), content.read<ReaderData['concepts']>('reader/concepts.json'),
 content.read<{documents:{documentId:string;path:string}[]}>('reader/annotation-index.json'),getCatalog()]);
 const entry=index.documents.find(d=>d.documentId===documentId);
 if (!entry || !manifest.files[entry.path]) return null;
 const annotations=await content.read<ReaderDocumentAnnotations>(entry.path);
 if (annotations.documentId!==documentId || annotations.offsetBasis!=='paragraph.markdown_exact_utf16') throw new Error('Reader annotation contract mismatch');
 const paths=new Map(catalog.lessons.map(l=>[l.id,l.path]));
 return {documentId,concepts,documents:{documents:documents.documents.filter(d=>paths.get(d.id)===d.sourcePath && manifest.files[d.sourcePath])},annotations};
}
