export type Subject = 'biology' | 'chemistry';
export type BBox = [number,number,number,number];
export type Span = {text:string; bbox:BBox; origin:[number,number]; size:number; flags:number; font:string};
export type TextItem = {id:string;type:'text';text:string;bbox:BBox;spans:Span[];section:'stem'|'option';optionNumber?:number};
export type ImageItem = {type:'image';assetId:string;bbox:BBox;section:'stem'|'option';optionNumber?:number};
export type LayoutRegion = {page:number;sourceRect:BBox;width:number;height:number;items:(TextItem|ImageItem)[]};
export type Asset = {id:string;src:string;width:number;height:number;region:number;bbox:BBox;role:'stem'|'option';optionNumber?:number;overlayTextItemIds:string[]};
export type Option = {number:1|2|3|4|5;text:string;assetIds:string[];textItemIds:string[]};
export type Question = {
 schemaVersion:2;id:string;exam:'MDEET';year:number;subject:Subject;number:number;points:3|4|5;
 unitId:string;unitLabel:string;topic:string;classificationStatus:string;
 stem:string;stemTextItemIds:string[];stemAssetIds:string[];
 options:Option[];answer:1|2|3|4|5;assets:Asset[];layout:LayoutRegion[];
 source:{questionPdf:string;answerPdf:string;page:number};reviewFlags:string[];
 renderMode:'positioned-text-and-graphics'
};
export type QuestionIndexItem = Pick<Question,'id'|'year'|'subject'|'number'|'points'|'unitId'|'unitLabel'|'topic'|'classificationStatus'|'reviewFlags'> & {url:string;hasImages:boolean};
