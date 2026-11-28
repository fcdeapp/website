export interface ReaderSelector { type:'TextPositionAndQuote'; offsetUnit:'utf16'; start:number; end:number; exact:string; prefix:string; suffix:string }
export type ReaderAnnotation = {id:string; selector:ReaderSelector} & (
 {kind:'highlight';level:'key'|'critical';reason:string;reviewStatus:string} |
 {kind:'conceptLink';conceptId:string;targetDocumentId:string}
);
export interface ReaderBlock {blockId:string;sourceSha256:string;sourceLengthUtf16:number;annotations:ReaderAnnotation[]}
export interface ReaderDocumentAnnotations {schemaVersion:'1.0.0';documentId:string;offsetBasis:'paragraph.markdown_exact_utf16';blocks:ReaderBlock[]}
export interface ReaderConcept {id:string;label:string;aliases:string[];targetDocumentId:string;relation:'documentTitle'|'explainedIn';annotationReview:string}
export interface ReaderDocument {id:string;title:{ko:string;en?:string};subjectId:string;sourcePath:string;contentState:'available_editorial_draft'}
