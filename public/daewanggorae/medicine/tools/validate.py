#!/usr/bin/env python3
"""Structural validation is not medical review. Exit 2 under --require-complete for drafts."""
from pathlib import Path
import argparse,json,sys,hashlib,re,collections,itertools,math
try:from jsonschema import Draft202012Validator
except ImportError:raise SystemExit('Install requirements.txt; schema validation is mandatory, not silently skipped.')
ap=argparse.ArgumentParser();ap.add_argument('--model-root',type=Path,help='Parent containing bodyparts3d/');ap.add_argument('--require-complete',action='store_true');args=ap.parse_args()
ROOT=Path(__file__).resolve().parents[1];errors=[];warnings=[];docs={}
def err(code,detail):errors.append(dict(code=code,detail=str(detail)))
def warn(code,detail):warnings.append(dict(code=code,detail=str(detail)))
for p in sorted(ROOT.rglob('*.json')):
 try:docs[str(p.relative_to(ROOT))]=json.loads(p.read_text(encoding='utf-8'))
 except Exception as e:err('json_parse',str(p)+': '+str(e))
def get(p):return docs.get(p,{})
lesson_schema=get('schemas/section.schema.json');scene_schema=get('schemas/scene.schema.json')
Draft202012Validator.check_schema(lesson_schema);Draft202012Validator.check_schema(scene_schema)
lessons=[x for p,x in docs.items() if '/sections/' in p and p.startswith('domains/') and '/subjects/' in p]
scenes=[x for p,x in docs.items() if p.startswith('scenes/') and 'triggerBlockId' in x]
questions=[x for p,x in docs.items() if p.startswith('questions/') and x.get('kind')=='original_concept_question']
concepts=get('anatomy/concepts.json');models=get('anatomy/model-index.json');sources=get('references/references.json').get('references',[])
source_ids={s['id'] for s in sources};scene_ids={s['id'] for s in scenes};lesson_ids={s['id'] for s in lessons};question_ids={q['id'] for q in questions};diagram_ids={d['id'] for d in get('diagrams/index.json').get('diagrams',[])}
subjects=get('curriculum.json').get('subjects',[]);subject_ids={s['id'] for s in subjects}
registry={};blocks={};paragraphs=[]
def register(id,kind):
 if id in registry:err('duplicate_id',id+' '+registry[id]+' '+kind)
 else:registry[id]=kind
for s in subjects:register(s['id'],'subject')
for r in sources:register(r['id'],'reference')
for c in concepts.values():register(c['id'],'FMA_concept')
for m in models.values():register(m['id'],'mesh')
for d in get('diagrams/index.json').get('diagrams',[]):register(d['id'],'diagram')
for s in lessons:
 register(s['id'],'lesson')
 if s.get('references') or any(b.get('sourceRefs') or b.get('type')=='reference' for b in s['blocks']):err('embedded_source_in_textbook',s['id'])
 for e in Draft202012Validator(lesson_schema).iter_errors(s):err('schema',s['id']+' '+str(list(e.path))+' '+e.message)
 if s['subjectId'] not in subject_ids:err('subject_ref',s['id'])
 if not any(b['type']=='paragraph' and b.get('markdown','').strip() for b in s['blocks']):err('empty_body',s['id'])
 for g in s['learningObjectives']:register(g['id'],'learning_objective')
 for qid in s.get('reviewQuestions',[]):
  if qid not in question_ids:err('question_ref',qid)
 for rid in s.get('relatedLessons',[])+s.get('prerequisites',[]):
  if rid not in lesson_ids:err('lesson_ref',rid)
 for r in s.get('references',[]):
  if r['sourceRef'] not in source_ids:err('reference_ref',r['sourceRef'])
 total=0
 for b in s['blocks']:
  register(b['id'],'block');blocks[b['id']]=dict(lessonId=s['id'],block=b)
  for ref in b.get('sourceRefs',[]):
   if ref not in source_ids:err('source_ref',ref)
  for ref in b.get('sceneRefs',[]):
   if ref not in scene_ids:err('scene_ref',ref)
  for ref in b.get('conceptRefs',[]):
   if ref not in concepts:err('fma_ref',ref)
  if b['type']=='diagram':
   if b['diagramRef'] not in diagram_ids:err('diagram_ref',b['diagramRef'])
   if not (ROOT/b['path']).is_file():err('diagram_file',b['path'])
  if b['type']=='paragraph':
   t=b['markdown'];total+=len(t);paragraphs.append((b['id'],t))
   if re.search(r'TODO|TBD|충분히 상세한 실제 교과서 본문|예시 문장을 입력|여기에.*작성',t):err('template_text',b['id'])
   if re.search(r'(^|\n)## ',t):err('heading_inside_prose',b['id'])
 if total<1200:warn('short_unit',dict(id=s['id'],characters=total))
for s in scenes:
 register(s['id'],'scene')
 for e in Draft202012Validator(scene_schema).iter_errors(s):err('scene_schema',s['id']+': '+e.message)
 if s['triggerBlockId'] not in blocks:err('trigger_block',s['id'])
 elif s['id'] not in blocks[s['triggerBlockId']]['block'].get('sceneRefs',[]):err('scene_backlink',s['id'])
 for cid in s['primaryStructures']+s['contextStructures']:
  if cid not in concepts:err('scene_fma',cid)
 if len(s['modelIds'])!=len(s['modelPaths']):err('scene_model_path_count',s['id'])
 for mid,path in zip(s['modelIds'],s['modelPaths']):
  if mid not in models or models[mid]['path']!=path:err('scene_obj_ref',path)
 if s['cameraUp']!=[0,0,1]:err('camera_up',s['id'])
 for key in ['cameraPosition','cameraTarget','cameraUp']:
  if not all(math.isfinite(v) for v in s[key]):err('nonfinite_camera',s['id'])
for q in questions:
 register(q['id'],'question')
 ids=[o['id'] for o in q['options']]
 if q['lessonId'] not in lesson_ids or q['answer'] not in ids or len(ids)!=len(set(ids)):err('question_integrity',q['id'])
 if set(ids)!=set(q['optionRationales']) or not all(q['optionRationales'].values()):err('missing_option_explanation',q['id'])
for entry in get('references/lesson-evidence.json').get('lessons',[]):
 if entry['lessonId'] not in lesson_ids:err('external_evidence_lesson',entry['lessonId'])
 for ref in entry.get('references',[]):
  if ref['sourceRef'] not in source_ids:err('external_evidence_source',ref['sourceRef'])
 for item in entry.get('blocks',[]):
  if item['blockId'] not in blocks:err('external_evidence_block',item['blockId'])
  elif blocks[item['blockId']]['lessonId']!=entry['lessonId']:err('external_evidence_scope',item['blockId'])
  for rid in item.get('sourceRefs',[]):
   if rid not in source_ids:err('external_evidence_source',rid)
reader=ROOT/'TEXTBOOK.md'
if reader.is_file():
 t=reader.read_text(encoding='utf-8')
 if re.search(r'https?://|^#{1,6}\s*(参考文献|참고문헌|References|Bibliography)',t,re.M|re.I):err('source_citation_in_reader','TEXTBOOK.md')
for cid,c in concepts.items():
 if cid!=c['id'] or cid!=c['fmaId']:err('concept_id_mismatch',cid)
 for tree,mids in c['meshes'].items():
  for mid in mids:
   if mid not in models:err('concept_mesh_ref',mid)
 for tree in ['partof','isa']:
  for child in c['children'][tree]:
   if child not in concepts or cid not in concepts[child]['parents'][tree]:err('relation_backlink',cid+' '+child)
for tree in ['partof','isa']:
 for rel in get('anatomy/'+tree+'-relations.json'):
  if rel['parentId'] not in concepts or rel['childId'] not in concepts:err('relation_endpoint',rel)
model_files_checked=0
if args.model_root:
 root=args.model_root.resolve()
 for mid,m in models.items():
  p=(root/m['path']).resolve()
  if not p.is_relative_to(root):err('unsafe_model_path',m['path']);continue
  if not p.is_file():err('missing_obj',m['path']);continue
  if hashlib.sha256(p.read_bytes()).hexdigest()!=m['sha256']:err('obj_hash',m['path'])
  model_files_checked+=1
else:warn('external_models_not_checked','Re-run with --model-root pointing to parent of bodyparts3d/. Metadata references alone were checked.')
for p,d in docs.items():
 if p.startswith('domains/') and '/subjects/' in p and p.endswith(('manifest.json','textbook.json','chapter.json')):
  for x in d.get('chapters',[])+d.get('sections',[]):
   if x.get('path') not in docs:err('missing_json_ref',x.get('path'))
# Domain packaging and the minimum prose gate are checked independently of medical completeness.
registered_domains=get('domains/index.json').get('domains',[]);domain_subjects=[];domain_count=0
for row in registered_domains:
 d=get(row['path']);domain_subjects+=d.get('subjectIds',[])
 for issue in Draft202012Validator(get('schemas/domain.schema.json')).iter_errors(d):err('domain_schema',row['id']+' '+issue.message)
 for item in d.get('subjects',[]):
  if item['path'] not in docs:err('domain_subject_path',item['path'])
 for key in ['progressPath','curriculumPath','coveragePath','questionIndex','sceneIndex','diagramIndex','referenceCatalog','evidencePath']:
  if d.get(key) not in docs:err('domain_file',str(d.get(key)))
 owned=[s for s in lessons if s['subjectId'] in d.get('subjectIds',[])];n=sum(len(b['markdown']) for s in owned for b in s['blocks'] if b['type']=='paragraph');domain_count+=n;dp=get(d.get('progressPath',''))
 if dp.get('bodyCharacters')!=n:err('domain_count',row['id'])
 if dp.get('minimumProseGatePassed')!=(n>=d['minimumBodyCharactersBeforeNextDomain']):err('domain_gate',row['id'])
 if d['minimumBodyCharactersBeforeNextDomain']!=d['targetBodyCharacters']*0.1:err('domain_threshold',row['id'])
 if not (ROOT/d['readerPath']).is_file():err('domain_reader',row['id'])
 elif re.search(r'https?://|^#{1,6}\s*(참고문헌|References)',(ROOT/d['readerPath']).read_text(),re.M|re.I):err('domain_reader_embedded_source',row['id'])
if len(domain_subjects)!=len(set(domain_subjects)) or set(domain_subjects)!=subject_ids:err('domain_subject_partition','each of 100 subjects belongs to one domain')
if domain_count!=sum(len(t) for _,t in paragraphs):err('domain_global_count','domain prose counts differ')
cov=get('coverage.json').get('objectives',[]);covids={o['objectiveId'] for o in cov}
if len(covids)!=len(cov):err('duplicate_coverage_id','coverage')
for s in lessons:
 for lo in s['learningObjectives']:
  if lo['id'] not in covids:err('objective_coverage_missing',lo['id'])
for sid in subject_ids:
 if not any(o['subjectId']==sid for o in cov):err('subject_without_scope',sid)
for u in get('curriculum.json').get('units',[]):
 if u.get('path') and u['path'] not in docs:err('curriculum_file',u['id'])
 for oid in u['objectiveIds']:
  if oid not in covids:err('curriculum_objective',oid)
norm=lambda t:re.sub(r'\s+','',t)
seen={};duplicate=[]
for bid,t in paragraphs:
 n=norm(t)
 if n in seen:duplicate.append([seen[n],bid]);err('duplicate_paragraph',duplicate[-1])
 else:seen[n]=bid
similar=[];shingles=[set(norm(t)[i:i+12] for i in range(0,max(len(norm(t))-11,1),4)) for _,t in paragraphs]
for i,j in itertools.combinations(range(len(paragraphs)),2):
 a,b=shingles[i],shingles[j]
 if min(len(a),len(b))/max(len(a),len(b),1)<0.75:continue
 score=len(a&b)/max(len(a|b),1)
 if score>0.7:similar.append(dict(blockIds=[paragraphs[i][0],paragraphs[j][0]],jaccard=score))
if similar:warn('similar_paragraphs',similar)
count=sum(len(t) for _,t in paragraphs);progress=get('progress.json')
if progress.get('actualBodyCharacters')!=count:err('body_count_mismatch',dict(recorded=progress.get('actualBodyCharacters'),actual=count))
empty_subjects=[sid for sid in sorted(subject_ids) if not any(s['subjectId']==sid for s in lessons)]
unwritten=[u['id'] for u in get('curriculum.json').get('units',[]) if u['status']=='unwritten']
if empty_subjects:warn('subjects_without_prose',empty_subjects)
if unwritten:warn('unwritten_units',len(unwritten))
if count<12000000:warn('target_not_met',dict(actual=count,minimum=12000000,remaining=12000000-count))
report=dict(structuralStatus='PASS' if not errors else 'FAIL',projectStatus='PARTIAL_NOT_COMPLETE',medicalAccuracyGuaranteed=False,specialistReview=False,errorCount=len(errors),errors=errors,warnings=warnings,metrics=dict(jsonFiles=len(docs),subjects=len(subjects),subjectsWithProse=len(subjects)-len(empty_subjects),draftSections=len(lessons),completedSections=0,paragraphs=len(paragraphs),actualBodyCharacters=count,estimatedPagesAt1500=count/1500,estimatedPageRange=[count/1800,count/1200],unwrittenPlannedUnits=len(unwritten),originalQuestions=len(questions),scenes=len(scenes),concepts=len(concepts),meshFileRecords=len(models),physicalModelFilesChecked=model_files_checked,duplicateParagraphs=len(duplicate),similarParagraphPairs=len(similar)),limitations=['Schema and reference integrity checks are not medical verification','Provisional curriculum is not an exhaustive official outcome crosswalk','No medical specialist review','No Next.js/RN runtime or WebGL rendering test','No full textbook coverage; all existing sections remain drafts'])
validation=ROOT/'validation';validation.mkdir(exist_ok=True);(validation/'report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
lines=['# 검증 보고서','',f"구조 검증: **{report['structuralStatus']}**. 전체 프로젝트: **부분 제작본**.",'','자동 검증은 의학적 정확성을 보증하지 않으며 전문의 검수는 수행되지 않았습니다.','', '| 항목 | 결과 |','|---|---:|']
for k,v in report['metrics'].items():lines.append(f'| {k} | {v} |')
lines+=['','## 오류','',json.dumps(errors,ensure_ascii=False,indent=2),'','## 미완료 및 제한','']+['- '+s for s in report['limitations']]+['','## 검증 경고','']+['- '+w['code']+': '+str(w['detail']) for w in warnings]
(ROOT/'VALIDATION_REPORT.md').write_text('\n'.join(lines)+'\n')
print(json.dumps(dict(status=report['structuralStatus'],errors=len(errors),**report['metrics']),ensure_ascii=False))
if errors:sys.exit(1)
if args.require_complete and (unwritten or count<12000000 or progress.get('completedUnits',0)!=len(lessons)):sys.exit(2)
