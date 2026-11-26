from pathlib import Path
import json
R=Path(__file__).resolve().parents[1]
def read(p):return json.loads((R/p).read_text())
def write(p,t):(R/p).write_text(t,encoding='utf-8')
ls={s['id']:s for p in R.glob('domains/*/subjects/*/chapters/*/sections/*.json') for s in [json.loads(p.read_text())]}
subjectpaths={s['id']:s['path'] for s in read('curriculum.json')['subjects']};subjectorder=list(subjectpaths)
def render(subjectorder, title='의학', asset_prefix=''):
 text='# '+title+'\n\n'
 for sid in subjectorder:
  sectionids=[entry['id'] for chapter in read(subjectpaths[sid])['chapters'] for entry in read(chapter['path'])['sections']]
  sections=[ls[lid] for lid in sectionids]
  if not sections:continue
  title=next(s['title']['ko'] for s in read('curriculum.json')['subjects'] if s['id']==sid);text+='\n# '+title+'\n\n'
  for s in sections:
   text+='## '+s['title']['ko']+'\n\n### 학습목표\n\n'+'\n'.join('- '+g['text'] for g in s['learningObjectives'])+'\n\n'
   for b in s['blocks']:
    if b['type']=='heading':text+='### '+b['text']+'\n\n'
    elif b['type']=='paragraph':text+=b['markdown']+'\n\n'
    elif b['type']=='equation':text+='$$\n'+b['latex']+'\n$$\n\n'+'; '.join(k+': '+v for k,v in b['variables'].items())+'\n\n'
    elif b['type']=='comparison':
     d=b['data'];text+='#### '+d['title']+'\n\n| '+' | '.join(d['columns'])+' |\n|'+'|'.join('---' for _ in d['columns'])+'|\n'+'\n'.join('| '+' | '.join(row)+' |' for row in d['rows'])+'\n\n'+d.get('notes','')+'\n\n'
    elif b['type']=='diagram':text+='!['+s['title']['ko']+']('+asset_prefix+b['path']+')\n\n'
    elif b['type']=='clinicalCase':
     d=b['data'];text+='#### 증례: '+d['title']+'\n\n'+' '.join(str(v) for v in d['presentation'].values())+'\n\n'+d['discussion']+'\n\n'
   if s.get('reviewQuestions'):
    text+='### 확인 문제\n\n'
    for qid in s['reviewQuestions']:
     q=read(f'questions/{qid}.json');text+=q['prompt']+'\n\n'+'\n'.join(o['id']+'. '+o['text'] for o in q['options'])+'\n\n**정답: '+q['answer']+'**\n\n'+q['explanation']+'\n\n'
     text+='**오답 해설**\n\n'+'\n\n'.join(o['id']+': '+q['optionRationales'][o['id']] for o in q['options'] if o['id']!=q['answer'])+'\n\n'
 return text
write('TEXTBOOK.md',render(subjectorder))
for domain in read('domains/index.json')['domains']:
 d=read(domain['path']);write(d['readerPath'],render(d['subjectIds'], d['title']['ko'], '../../'))
old=R/'TEXTBOOK_DRAFT.md'
if old.exists():old.unlink()
