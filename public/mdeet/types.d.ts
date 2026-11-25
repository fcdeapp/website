export type Subject = 'biology' | 'chemistry' | 'physics' | 'statistics';
export type BBox = [number,number,number,number];
export type Span = {text:string; bbox:BBox; origin:[number,number]; size:number; flags:number; font:string};
export type TextItem = {id:string;type:'text';text:string;bbox:BBox;spans:Span[];section:'stem'|'option';optionNumber?:number};
export type ImageItem = {type:'image';assetId:string;bbox:BBox;section:'stem'|'option';optionNumber?:number};
export type LayoutRegion = {page:number;sourceRect:BBox;width:number;height:number;items:(TextItem|ImageItem)[]};
export type Asset = {id:string;src:string;width:number;height:number;region:number;bbox:BBox;role:'stem'|'option';optionNumber?:number;overlayTextItemIds:string[]};
export type Option = {number:1|2|3|4|5;text:string;assetIds:string[];textItemIds:string[]};
export type Question = {
 schemaVersion:2;id:string;exam:'MDEET'|'MEET_DEET';year:number;subject:Subject;number:number;points:number|null;
 unitId:string;unitLabel:string;topic:string;classificationStatus:string;
 stem:string;stemTextItemIds:string[];stemAssetIds:string[];
 options:Option[];answer:1|2|3|4|5|null;acceptedAnswers?:AnswerNumber[];answerStatus?:'source-text'|'untranscribed';assets:Asset[];layout:LayoutRegion[];
 source:{questionPdf:string;answerPdf:string|null;page:number;answerPage?:number|null;archiveFolder?:string;answerSheetUrls?:string[]};reviewFlags:string[];
 renderMode:'positioned-text-and-graphics';track?:string;examId?:string;isPreliminary?:boolean;paperSubject?:string;currentScopeStatus?:string;section?:string;classificationCandidates?:unknown[];unmappedMathGlyphs?:string[]
};
export type QuestionIndexItem = Pick<Question,'id'|'year'|'subject'|'number'|'points'|'unitId'|'unitLabel'|'topic'|'classificationStatus'|'reviewFlags'> & {url:string;hasImages:boolean};

export type AnswerNumber=1|2|3|4|5;
export type ContentBlock={type:'paragraph';text:string}|{type:'keyFacts';items:string[]}|{type:'table';title:string;headers:string[];rows:string[][]};
export type TextbookSection={id:string;unitId:string;subject:Subject;book:string;title:string;keywords:string[];scope:string;verificationStatus:string;referenceIds:string[];contentOrigin:string;blocks:ContentBlock[];knowledgeIds:string[];reviewQuestions:{prompt:string;answer:string}[];relatedQuestionIds:string[];relatedQuestionStatus:string};
export type TextbookSectionIndex=Pick<TextbookSection,'id'|'unitId'|'subject'|'book'|'title'|'keywords'|'scope'|'verificationStatus'|'relatedQuestionStatus'>&{url:string;knowledgeCount:number;reviewQuestionCount:number;relatedQuestionCount:number};
export type TextbookChapter={id:string;title:string;subject:Subject;book:string;sections:string[];relatedQuestionIds:string[];relatedQuestionStatus:string;knowledgeCount:number};
export type KnowledgeItem={id:string;sectionId:string;unitId:string;subject:Subject;text:string;kind:'body-derived'|'highlight'|'table-row'|'review-answer';scope:string;verificationStatus:string;referenceIds:string[]};
export type Flashcard={id:string;sectionId:string;unitId:string;knowledgeId:string;front:string;back:string;verificationStatus:string};
export type Exam={id:string;year:number;exam:'MDEET'|'MEET_DEET';track:string;isPreliminary:boolean;paperSubject:string;questionIds:string[];questionCount:number;durationMinutes:number|null;pointsTotal:number|null;source:string;answerKeyStatus:'complete'|'partial'|'untranscribed';subjectCounts:Partial<Record<Subject,number>>};
// For old and new question files: acceptedAnswers ?? (answer == null ? [] : [answer]).
// An empty list means not gradeable. Never grade unanswered-key questions as incorrect.
