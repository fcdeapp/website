#!/usr/bin/env python3
"""Build domain manifests and portable packages from canonical section files.
All counts include paragraph.markdown once; readers and metadata are excluded.
"""
from pathlib import Path
import argparse,json,zipfile,hashlib,subprocess,sys
from collections import Counter
R=Path(__file__).resolve().parents[1]
def read(path):return json.loads((R/path).read_text())
def save(path,d):
 p=R/path;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def build(output):
 output.mkdir(parents=True,exist_ok=True)
 cur=read('curriculum.json');cov=read('coverage.json');evidence=read('references/lesson-evidence.json');refs=read('references/references.json');globalp=read('progress.json');sceneindex=read('scenes/index.json');diagramindex=read('diagrams/index.json')
 lessons={s['id']:s for p in R.glob('domains/*/subjects/*/chapters/*/sections/*.json') for s in [json.loads(p.read_text())]};summaries=[];packfiles={}
 for row in read('domains/index.json')['domains']:
  d=read(row['path']);gid=d['id'];subjects=set(d['subjectIds']);owned={lid:s for lid,s in lessons.items() if s['subjectId'] in subjects};lids=set(owned);characters=sum(len(b['markdown']) for s in owned.values() for b in s['blocks'] if b['type']=='paragraph');target=d['targetBodyCharacters'];threshold=d['minimumBodyCharactersBeforeNextDomain'];ready=characters>=threshold
  qids={q for s in owned.values() for q in s.get('reviewQuestions',[])};scids={q for s in owned.values() for b in s['blocks'] for q in b.get('sceneRefs',[])};diids={b['diagramRef'] for s in owned.values() for b in s['blocks'] if b['type']=='diagram'};sr=[x for x in sceneindex['scenes'] if x['id'] in scids];dr=[x for x in diagramindex['diagrams'] if x['id'] in diids];es=[x for x in evidence['lessons'] if x['lessonId'] in lids];rids={x['sourceRef'] for z in es for x in z.get('references',[])}|{x for z in es for b in z.get('blocks',[]) for x in b.get('sourceRefs',[])};crossrefs=sorted({x for s in owned.values() for x in s.get('prerequisites',[])+s.get('relatedLessons',[]) if x not in lids})
  # Question-only visual dependencies must travel with the owning domain too.
  for qid in qids:
   question=read('questions/'+qid+'.json')
   for media in question.get('media',{}).get('items',[]):
    if media['type']=='diagram': diids.add(media['diagramRef'])
    if media['type']=='anatomy3d': scids.add(media['sceneRef'])
    rids.update(media.get('sourceRefs',[]))
  sr=[x for x in sceneindex['scenes'] if x['id'] in scids]
  dr=[x for x in diagramindex['diagrams'] if x['id'] in diids]
  assert scids <= {x['id'] for x in sr}, 'Missing question scene'
  assert diids <= {x['id'] for x in dr}, 'Missing question diagram'
  progress=dict(domainId=gid,title=d['title'],bodyCharacters=characters,estimatedPagesAt1500=characters/1500,targetPages=d['targetPages'],targetBodyCharacters=target,proseFraction=characters/target,minimumProseFractionBeforeNextDomain=.1,minimumBodyCharactersBeforeNextDomain=threshold,charactersToMinimum=max(0,threshold-characters),minimumProseGatePassed=ready,contentCoverageFraction=None,contentCoverageStatus='official_objective_crosswalk_incomplete',medicalCompletionStatus='full_manuscript_review_pending',authoredSections=len(owned),fullyVerifiedSections=0,subjectCount=len(subjects))
  base=f'domains/{gid}';save(base+'/progress.json',progress);save(base+'/curriculum.json',dict(schemaVersion='1.0.0',subjects=[s for s in cur['subjects'] if s['id'] in subjects],units=[u for u in cur['units'] if u['subjectId'] in subjects]));save(base+'/coverage.json',dict(status='incomplete',objectives=[x for x in cov['objectives'] if x['subjectId'] in subjects]));save(base+'/references/lesson-evidence.json',dict(schemaVersion='1.0.0',lessons=es));save(base+'/references/references.json',dict(references=[x for x in refs['references'] if x['id'] in rids]));save(base+'/questions/index.json',dict(questions=[dict(id=q,path='questions/'+q+'.json') for q in sorted(qids)]));save(base+'/scenes/index.json',dict(scenes=sr));save(base+'/diagrams/index.json',dict(diagrams=dr))
  d.update(curriculumPath=base+'/curriculum.json',coveragePath=base+'/coverage.json',questionIndex=base+'/questions/index.json',sceneIndex=base+'/scenes/index.json',diagramIndex=base+'/diagrams/index.json',referenceCatalog=base+'/references/references.json',crossDomainLessonRefs=crossrefs,sharedPackage='medical-shared.zip',packageFile=gid+'.zip',requiresOriginalBodyParts3D=True,installRoot='public/medicine',relatedLessonResolution='resolve by stable ID; request another domain when not installed');save(row['path'],d)
  files={p.relative_to(R).as_posix() for p in (R/base).rglob('*') if p.is_file()};files|={'questions/'+q+'.json' for q in qids};files|={x['path'] for x in sr};files|={x[k] for x in dr for k in ['path','svgPath'] if x.get(k)};assert all((R/f).is_file() for f in files)
  # Each owned lesson's local question/scene/diagram dependency must be in its pack.
  for s in owned.values():
   assert s['path'] in files
   assert all('questions/'+q+'.json' in files for q in s.get('reviewQuestions',[]))
  packfiles[gid+'.zip']=files;summaries.append(progress)
 globalp['byDomain']=summaries;globalp['domainMinimumProseGatePassed']=[x['domainId'] for x in summaries if x['minimumProseGatePassed']];globalp['domainMinimumProseGatePending']=[x['domainId'] for x in summaries if not x['minimumProseGatePassed']];globalp['allDomainsMinimumTenPercent']=all(x['minimumProseGatePassed'] for x in summaries);globalp['overallFractionAt1500']=globalp['actualBodyCharacters']/15000000;save('progress.json',globalp)
 save('domains/progress.json',dict(countingRule='paragraph.markdown only; no reader or metadata duplication',domains=summaries,allMinimumGatesPassed=globalp['allDomainsMinimumTenPercent']))
 subprocess.run([sys.executable,str(R/'tools/export_textbook.py')],check=True)
 # Shared package contains metadata, schemas, validation tools and original model indices, never duplicate meshes.
 shared={p.relative_to(R).as_posix() for p in R.rglob('*') if p.is_file() and not p.relative_to(R).as_posix().startswith(('domains/','questions/','scenes/','diagrams/','authoring/','legacy/')) and p.name!='TEXTBOOK.md'}
 shared|={'domains/index.json','domains/progress.json','scenes/index.json','diagrams/index.json','questions/index.json'};packfiles['medical-shared.zip']=shared
 receipts=[]
 for name,files in packfiles.items():
  with zipfile.ZipFile(output/name,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
   for path in sorted(files):z.write(R/path,'public/medicine/'+path)
  with zipfile.ZipFile(output/name) as z:assert z.testzip() is None
  receipts.append(dict(file=name,sizeBytes=(output/name).stat().st_size,sha256=hashlib.sha256((output/name).read_bytes()).hexdigest(),fileCount=len(files)))
 (output/'packages.json').write_text(json.dumps(dict(schemaVersion='1.0.0',shared='medical-shared.zip',domainIndex='public/medicine/domains/index.json',archives=receipts),ensure_ascii=False,indent=2)+'\n')
 print(json.dumps(dict(packages=len(receipts),characters=sum(x['bodyCharacters'] for x in summaries),minimumGatesPassed=globalp['domainMinimumProseGatePassed']),ensure_ascii=False))
if __name__=='__main__':
 ap=argparse.ArgumentParser();ap.add_argument('--output',type=Path,required=True);build(ap.parse_args().output)
