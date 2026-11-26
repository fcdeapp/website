#!/usr/bin/env python3
from pathlib import Path
import json
root=Path(__file__).resolve().parents[1]
p=root/'progress.json';d=json.loads(p.read_text());count=0;by={sid:{'bodyCharacters':0,'draftSections':0,'completedSections':0} for sid in d['bySubject']}
for f in root.glob('domains/*/subjects/*/chapters/*/sections/*.json'):
 s=json.loads(f.read_text());n=sum(len(b.get('markdown','')) for b in s['blocks'] if b['type']=='paragraph');count+=n;by[s['subjectId']]['bodyCharacters']+=n;by[s['subjectId']]['draftSections']+=1
d['actualBodyCharacters']=count;d['bySubject']=by;d['partiallyWrittenUnits']=sum(v['draftSections'] for v in by.values());d['estimatedPages']={f'at{n}':count/n for n in [1200,1500,1800]};d['minimumCharacterTargetProgress']=count/12000000
p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');print(count)
