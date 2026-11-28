/* eslint-disable @typescript-eslint/no-require-imports */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript');
require.extensions['.ts']=(m,f)=>m._compile(ts.transpileModule(fs.readFileSync(f,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,f);
const {LegacyQuestionAdapter,V2QuestionAdapter}=require('../_lib/questions/model.ts');
const {printDocument}=require('../_lib/questions/render.ts');
const root=path.resolve(__dirname,'../../../../public/daewanggorae'),manifest=require(root+'/runtime/manifest.json');
const read=p=>JSON.parse(fs.readFileSync(root+'/runtime/content/'+manifest.files[p].file));
const index=read('compiled/question-revisions.json'),catalog=read('compiled/catalog.json');
global.fetch=async url=>{
 const value=String(url);if(value.endsWith('/manifest.json'))return Response.json(manifest);
 const file=value.split('/').pop();return new Response(fs.readFileSync(root+'/runtime/content/'+file));
};
const {prepareEvidence}=require('../_lib/questions/compiledEvidence.ts');
const {questionPresentation,presentationFingerprint,safeNoteLink}=require('../_lib/questions/presentation.ts');
test('unified web catalog uses actual preferred revisions and preserves every evidence',async()=>{
 assert.equal(new Set(catalog.questions.map(q=>q.id)).size,catalog.questions.length);
 for(const entry of catalog.questions){
  const preferred=index.candidates.find(e=>e.id===entry.id),meta=index.legacy[entry.id];
  const q=preferred?V2QuestionAdapter(read(preferred.path),preferred.lessonId,preferred.fingerprint):LegacyQuestionAdapter(read(entry.path),meta.revision,meta.fingerprint);
  if(preferred){await prepareEvidence(q.evidence);q.presentation=await questionPresentation(read(preferred.path));assert.equal(index.preferred[q.id],q.revision);assert.equal(q.review.medicalExpertReviewed,false);const html=printDocument([q]);assert.equal((html.match(/data-evidence-id=/g)||[]).length,q.evidence.length);assert.ok(!html.includes('승인 대기'));}
 }
});
test('public tree contains neither private authoring source nor orphaned answer payloads',()=>{
 assert.ok(!fs.existsSync(root+'/medicine'));
 const files=fs.readdirSync(root+'/runtime/content');
 assert.deepEqual(files.sort(),[...new Set(Object.values(manifest.files).map(f=>f.file))].sort());
 for(const [p,file]of Object.entries(manifest.files)){
  assert.ok(!/answers.private|exam.html|preview.html/.test(p));
  if(p.startsWith('questions/')||p.startsWith('compiled/candidates/')){
   const q=JSON.parse(fs.readFileSync(root+'/runtime/content/'+file.file));
   for(const k of ['answer','explanation','optionRationales','correctOption','rationales']) assert.equal(q[k],undefined,p);
  }
 }
});

test('0.9.2 notes fail closed on changed source and never enter attempt snapshots',async()=>{
 const notes=read('compiled/question-presentation-index.json');
 let count=0,total=0;
 for(const [id,entry] of Object.entries(notes)){
  const item=index.candidates.find(q=>q.id===id),raw=read(item.path);
  assert.equal(presentationFingerprint(raw),entry.fingerprint);
  const p=await questionPresentation(raw);assert.ok(p,id);assert.equal(p.evidenceMarkup.length,raw.evidence.length);
  assert.ok(p.notes.every(n=>(n.links||[]).every(l=>safeNoteLink(l.href))));
  count++;total+=p.notes.length;
 }
 assert.equal(count,Object.keys(notes).length);assert.ok(total>count);
 const first=index.candidates.find(q=>notes[q.id]),raw=read(first.path);
 assert.equal(await questionPresentation({...raw,stem:raw.stem+' changed'}),undefined);
 assert.equal(safeNoteLink('javascript:alert(1)'),false);
 const {attemptSnapshot}=require('../_lib/questions/model.ts');
 const q=V2QuestionAdapter(raw,first.lessonId,first.fingerprint);q.presentation=await questionPresentation(raw);
 const saved=attemptSnapshot(q,{answer:q.options[0].id});
 assert.equal(saved.question.presentation,undefined);assert.equal(saved.question.prompt,raw.stem);
 console.log('Verified presentations:',count,'notes:',total);
});
