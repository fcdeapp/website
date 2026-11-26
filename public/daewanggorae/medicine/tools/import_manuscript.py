#!/usr/bin/env python3
"""Import NEW editorial draft sections only; existing lessons are never overwritten."""
from pathlib import Path
import argparse,json,re,hashlib
ap=argparse.ArgumentParser();ap.add_argument('manuscript',type=Path);args=ap.parse_args();root=Path(__file__).resolve().parents[1]
def read(p):return json.loads((root/p).read_text())
def save(p,x):
 f=root/p;f.parent.mkdir(parents=True,exist_ok=True);f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
cur=read('curriculum.json');cov=read('coverage.json');search=read('search/section-index.json');pending=[];subject_dirs={s['id']:str(Path(s['path']).parent) for s in cur['subjects']}
progress=read('progress.json');active=progress.get('activeDomain');subject_domains={s['id']:s.get('domainId') for s in cur['subjects']};active_count=0;active_minimum=0
if active:
 active_manifest=read('domains/'+active+'/manifest.json');active_minimum=active_manifest['minimumBodyCharactersBeforeNextDomain']
 for unit in cur['units']:
  if unit.get('path') and subject_domains.get(unit['subjectId'])==active:
   section=read(unit['path']);active_count+=sum(len(b['markdown']) for b in section['blocks'] if b['type']=='paragraph')
for chunk in args.manuscript.read_text(encoding='utf-8').split('@@')[1:]:
 lines=chunk.strip().splitlines();lid,sid,cid,ko,en=lines.pop(0).split('|');goals=lines.pop(0).removeprefix('!').split(';')
 if active and subject_domains.get(sid)!=active and active_count<active_minimum:raise SystemExit(f'Active domain {active} has {active_count}/{active_minimum} minimum prose characters; finish its minimum before another domain.')
 path=f'{subject_dirs[sid]}/chapters/{cid}/sections/{lid}.json'
 if (root/path).exists() or any(u['id']==lid for u in cur['units']):raise SystemExit('Existing section left unchanged: '+lid)
 if sid not in {s['id'] for s in cur['subjects']}:raise SystemExit('Unknown subject: '+sid)
 blocks=[]
 for piece in re.split(r'\n(?=## )|\n\s*\n','\n'.join(lines).strip()):
  for part in piece.split('\n',1) if piece.startswith('## ') else [piece]:
   bid=lid+'.b.'+hashlib.sha256(part.encode()).hexdigest()[:12];blocks.append(dict(id=bid,type='heading',level=2,text=part[3:]) if part.startswith('## ') else dict(id=bid,type='paragraph',markdown=part,verificationStatus='editorial_draft_claim_check_pending'))
 objectives=[dict(id=lid+f'.lo.{i:02}',text=g) for i,g in enumerate(goals,1)]
 s=dict(schemaVersion='1.0.0',id=lid,subjectId=sid,chapterId=cid,title=dict(ko=ko,en=en),learningObjectives=objectives,blocks=blocks,verification=dict(status='draft',lastChecked=None,unresolvedIssues=['전체 문장별 출처 대조 미완료','전문의 검수 미실시','전체 과목 또는 완결 교과서의 대체로 승인되지 않음']),path=path,copyrightStatus='independent_editorial_draft_not_a_translation');pending.append(s)
for s in pending:
 save(s['path'],s);sid=s['subjectId'];cid=s['chapterId'];lid=s['id'];entry=dict(id=lid,title=s['title'],path=s['path']);cp=f'{subject_dirs[sid]}/chapters/{cid}/chapter.json';chapter=read(cp) if (root/cp).exists() else dict(id=sid+'.chapter.'+cid,subjectId=sid,sections=[],status='partial');chapter['sections'].append(entry);save(cp,chapter)
 manifest=read(f'{subject_dirs[sid]}/manifest.json');manifest['status']='partial';chentry=dict(id=chapter['id'],path=cp)
 if chentry not in manifest['chapters']:manifest['chapters'].append(chentry)
 manifest['plannedUnits'].append(lid);save(f'{subject_dirs[sid]}/manifest.json',manifest)
 textbook=read(f'{subject_dirs[sid]}/textbook.json');textbook['status']='partial';textbook['sections'].append(dict(id=lid,path=s['path']));save(f'{subject_dirs[sid]}/textbook.json',textbook)
 cur['units'].append(dict(id=lid,subjectId=sid,title=s['title']['ko'],status='partial',objectiveIds=[g['id'] for g in s['learningObjectives']],path=s['path'],planningBasis='authored_draft',scopeExpansionRequired=True))
 for g in s['learningObjectives']:cov['objectives'].append(dict(objectiveId=g['id'],subjectId=sid,text=g['text'],status='draft_covered_not_verified',basis='editorial_learning_objective',lessonRefs=[lid]))
 search['sections'].append(dict(id=lid,title=s['title'],subjectId=sid,path=s['path'],bodySearchPath=s['path']))
save('curriculum.json',cur);save('coverage.json',cov);save('search/section-index.json',search)
progress=read('progress.json');progress['totalPlannedUnits']=len(cur['units']);progress['totalLearningObjectives']=sum(x['basis']=='editorial_learning_objective' for x in cov['objectives']);progress['totalUnitCountMeaning']='611개의 잠정 범위 노드와 '+str(sum(u['status']=='partial' for u in cur['units']))+'개의 세부 초안 노드. 범위가 중첩되므로 완성도 백분율의 분모로 사용하지 않음.';save('progress.json',progress)
print('Imported new draft sections:',len(pending));print('Run sync_progress.py and validate.py after adding references/questions/scenes.')
