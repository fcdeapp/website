#!/usr/bin/env python3
"""Extract only verified OBJ bytes from supplied source archives. Never overwrite mismatched existing files."""
import argparse,json,hashlib,zipfile
from pathlib import Path
ap=argparse.ArgumentParser();ap.add_argument('bodyparts_root',type=Path);args=ap.parse_args()
ROOT=Path(__file__).resolve().parents[1];models=json.loads((ROOT/'anatomy/model-index.json').read_text());target=args.bodyparts_root.resolve();handles={};written=skipped=0
try:
 for m in models.values():
  rel=Path(m['path']).relative_to('bodyparts3d');p=(target/rel).resolve()
  if not p.is_relative_to(target):raise ValueError('Unsafe path: '+str(rel))
  if p.exists():
   if hashlib.sha256(p.read_bytes()).hexdigest()!=m['sha256']:raise ValueError('Existing bytes differ; left unchanged: '+str(p))
   skipped+=1;continue
  arc=target/m['archive']
  if arc not in handles:handles[arc]=zipfile.ZipFile(arc)
  data=handles[arc].read(m['archiveEntry'])
  if hashlib.sha256(data).hexdigest()!=m['sha256']:raise ValueError('Archive bytes differ: '+m['id'])
  p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(data);written+=1
finally:
 for z in handles.values():z.close()
print(json.dumps(dict(written=written,existingVerified=skipped)))
