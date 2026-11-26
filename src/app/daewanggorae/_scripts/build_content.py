#!/usr/bin/env python3
"""Compile only runtime assets. Never writes into medicine/ or bodyparts3d/."""
import json, pathlib, hashlib, shutil, re

ROOT=pathlib.Path(__file__).resolve().parents[4]/'public/daewanggorae/runtime'; SRC=ROOT.parent/'medicine'; OUT=ROOT/'content'; OUT.mkdir(parents=True,exist_ok=True)

def read(p): return json.loads((SRC/p).read_text())
def title(x): return x.get('title',{}).get('ko',x.get('id','')) if isinstance(x.get('title'),dict) else x.get('title',x.get('id',''))
files={}; asset_rows=[]
def pack(p):
 p=str(p)
 if p in files:return
 path=(SRC/p).resolve()
 if not path.is_relative_to(SRC.resolve()) or not path.is_file():raise ValueError('Invalid source path '+p)
 data=path.read_bytes();sha=hashlib.sha256(data).hexdigest();name=sha+('.medical' if path.suffix in ['.json','.md','.svg'] else path.suffix)
 (OUT/name).write_bytes(data);files[p]={'file':name,'sha256':sha,'bytes':len(data),'kind':path.suffix}
 asset_rows.append(f'{json.dumps(p)}: require("./content/{name}"),')
cat={'version':read('manifest.json')['version'],'domains':[],'subjects':[],'chapters':[],'lessons':[],'questions':[],'scenes':[],'conceptLessons':{},'planned':read('curriculum.json')['units']}; search=[]
def record(kind,id,label,text='',**extra):search.append({'kind':kind,'id':id,'title':label,'text':text,**extra})
pack('manifest.json');pack('domains/index.json');pack('references/references.json');pack('kmle/index.json')
# JSON is the runtime drawing source. SVG remains available to older readers/exports.
pack('diagrams/index.json')
for diagram in read('diagrams/index.json')['diagrams']:
 pack(diagram['path'])
for f in ['LICENSES.md','SOURCES.md','anatomy/concepts.json','anatomy/model-index.json','anatomy/terminology.json','anatomy/isa-relations.json','anatomy/partof-relations.json','anatomy/model-audit.json','anatomy/unresolved-mappings.json','scenes/animation-specs.json','knowledge/concepts.json']:
 if (SRC/f).exists():pack(f)
for d in read('domains/index.json')['domains']:
 pack(d['path']);dm=read(d['path']);cat['domains'].append(d);record('domain',d['id'],title(d))
 if dm.get('referenceCatalog'):pack(dm['referenceCatalog'])
 for su in dm['subjects']:
  pack(su['path']);s=read(su['path']);meta={'id':s['id'],'title':title(s),'path':su['path'],'domainId':d['id']};cat['subjects'].append(meta);record('subject',s['id'],title(s),domainId=d['id'])
  for ce in s['chapters']:
   pack(ce['path']);c=read(ce['path']);cat['chapters'].append({'id':c['id'],'title':title(c),'subjectId':s['id'],'path':ce['path']});record('chapter',c['id'],title(c),subjectId=s['id'])
   for le in c['sections']:
    pack(le['path']);l=read(le['path']);m={'id':l['id'],'title':title(l),'titleEn':l['title'].get('en',''),'path':le['path'],'chapterId':c['id'],'subjectId':s['id'],'domainId':d['id'],'verification':l['verification']};cat['lessons'].append(m)
    record('lesson',l['id'],title(l),l['title'].get('en',''),subjectId=s['id'])
    for b in l['blocks']:
     if b['type'] in ['diagram','image'] and b.get('path'):pack(b['path'])
     text=b.get('markdown') or b.get('text') or b.get('latex') or json.dumps(b.get('data',{}),ensure_ascii=False)
     record('block',b['id'],title(l),text,lessonId=l['id'],subjectId=s['id'])
     for cid in b.get('conceptRefs',[]):cat['conceptLessons'].setdefault(cid,[]).append({'lessonId':l['id'],'blockId':b['id']})
    for g in l.get('glossary',[]):record('term',l['id']+':'+str(len(search)),title(l),' '.join(str(v) for v in g.values()),lessonId=l['id'])
for q in read('questions/index.json')['questions']:
 pack(q['path']);data=read(q['path']);lesson=next((l for l in cat['lessons'] if l['id']==data['lessonId']),{})
 cat['questions'].append({**q,'lessonId':data['lessonId'],'title':data['prompt'],'subjectId':lesson.get('subjectId'),'domainId':lesson.get('domainId')});record('question',q['id'],data['prompt'],lessonId=data['lessonId'])
for x in read('scenes/index.json')['scenes']:
 pack(x['path']);scene=read(x['path']);cat['scenes'].append({**x,'title':scene['educationalPurpose'],'structures':scene['primaryStructures']})
 for cid in scene['primaryStructures']+scene['contextStructures']:cat['conceptLessons'].setdefault(cid,[]).append({'lessonId':scene['lessonId'],'blockId':scene['triggerBlockId']})
for cid,c in read('anatomy/concepts.json').items():record('anatomy',cid,c.get('nameKo') or c['nameEn'],' '.join([cid,c['nameEn'],*c.get('synonyms',[])]))
for cid,links in cat['conceptLessons'].items():cat['conceptLessons'][cid]=list({(l['lessonId'],l['blockId']):l for l in links}.values())
# Trigram posting lists permit Korean substring search without reopening textbook JSON.
postings={}
for i,r in enumerate(search):
 text=(r['title']+' '+r['text']).casefold()
 for gram in sorted(set(text[j:j+3] for j in range(max(0,len(text)-2)))):postings.setdefault(gram,[]).append(i)
compiled=[('catalog',cat),('search',{'documents':search,'postings':postings})]
if (ROOT/'models.json').exists():compiled.append(('models',json.loads((ROOT/'models.json').read_text())))
for name,data in compiled:
 raw=json.dumps(data,ensure_ascii=False,separators=(',',':')).encode();sha=hashlib.sha256(raw).hexdigest();filename=sha+'.medical';(OUT/filename).write_bytes(raw);key='compiled/'+name+'.json';files[key]={'file':filename,'sha256':sha,'bytes':len(raw),'kind':'.json'};asset_rows.append(f'{json.dumps(key)}: require("./content/{filename}"),')
# Stable content fingerprint changes on bytes, even if the author forgets to bump semantic version.
fingerprint=hashlib.sha256(json.dumps(files,sort_keys=True).encode()).hexdigest();manifest={'version':cat['version'],'fingerprint':fingerprint,'files':files}
(ROOT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')

valid={v['file'] for v in files.values()}

print(json.dumps({'version':cat['version'],'files':len(files),'subjects':len(cat['subjects']),'lessons':len(cat['lessons']),'questions':len(cat['questions']),'scenes':len(cat['scenes']),'searchDocuments':len(search),'runtimeMB':round(sum(x['bytes'] for x in files.values())/1e6,2)}))
