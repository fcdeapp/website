#!/usr/bin/env python3
"""Publish the app's answer-free content package, never authoring source or grading keys."""
import argparse, hashlib, json, pathlib, shutil
WEB=pathlib.Path(__file__).resolve().parents[4]
p=argparse.ArgumentParser();p.add_argument('--app',default=str(WEB.parent/'daewanggorae'));a=p.parse_args()
APP=pathlib.Path(a.app).resolve();PUBLIC=WEB/'public/daewanggorae';OUT=PUBLIC/'runtime';manifest=json.loads((APP/'generated/manifest.json').read_text())
# Validate the complete package before altering the public directory.
for key, entry in manifest['files'].items():
 if any(s in key for s in ['answers.private','preview.html','exam.html','question-system-v2/']):raise ValueError('Private authoring file in manifest')
 raw=(APP/'generated/content'/entry['file']).read_bytes()
 if hashlib.sha256(raw).hexdigest()!=entry['sha256']:raise ValueError('Hash mismatch: '+key)
 if key.startswith('questions/') or key.startswith('compiled/candidates/'):
  q=json.loads(raw)
  if any(k in q for k in ['answer','explanation','optionRationales','correctOption','rationales']):raise ValueError('Answer in display payload: '+key)
# Additional display-only resources use the same hash-verified lazy content transport.
extras={}
def add(key,value):
 raw=json.dumps(value,ensure_ascii=False,separators=(',',':')).encode()
 sha=hashlib.sha256(raw).hexdigest(); filename=sha+'.medical'
 manifest['files'][key]={'file':filename,'sha256':sha,'bytes':len(raw),'kind':'json'}
 extras[filename]=raw
for folder in ['question-evidence','question-presentation']:
 for file in sorted((APP/'generated'/folder).glob('*.json')):
  add('compiled/'+folder+'/'+file.name,json.loads(file.read_text()))
add('compiled/question-presentation-index.json',json.loads((APP/'generated/question-presentation-index.json').read_text()))
add('compiled/materials.json',json.loads((APP/'generated/materials.json').read_text()))
for name in ['question-evidence-contracts.json','question-evidence-css.json']:
 target=pathlib.Path(__file__).resolve().parents[1]/'_lib/questions/generated'/name
 target.parent.mkdir(parents=True,exist_ok=True)
 shutil.copy2(APP/'generated'/name,target)

manifest['fingerprint']=hashlib.sha256(json.dumps(manifest['files'],sort_keys=True).encode()).hexdigest()
# Preserve old source and hashed assets outside all public/build output roots.
backup=pathlib.Path('/private/tmp/daewanggorae-web-backups');backup.mkdir(parents=True,exist_ok=True)
oldversion=json.loads((OUT/'manifest.json').read_text())['version'] if (OUT/'manifest.json').exists() else 'unknown'
target=backup/('website-content-'+oldversion)
if not pathlib.Path(str(target)+'.zip').exists():
 with __import__('zipfile').ZipFile(str(target)+'.zip','w',__import__('zipfile').ZIP_DEFLATED) as z:
  for folder in [PUBLIC/'medicine',OUT/'content']:
   if folder.exists():
    for file in folder.rglob('*'):
     if file.is_file():z.write(file,file.relative_to(PUBLIC))
# Original source remains in the independent app; never expose it through Next public/.
if (PUBLIC/'medicine').exists():shutil.rmtree(PUBLIC/'medicine')
(OUT/'content').mkdir(parents=True,exist_ok=True)
valid={e['file'] for e in manifest['files'].values()}
for name in valid:
 if name in extras:(OUT/'content'/name).write_bytes(extras[name])
 else:shutil.copy2(APP/'generated/content'/name,OUT/'content'/name)
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for file in (OUT/'content').iterdir():
 if file.is_file() and file.name not in valid:file.unlink()
print(json.dumps({'version':manifest['version'],'files':len(valid),'privateAnswersPublished':False,'backup':str(target)+'.zip'}))
