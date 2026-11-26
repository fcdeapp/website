import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import json
from pathlib import Path
r=Path('deliverable/public/medicine');d=json.loads((r/'diagrams/diagram.pharmacodynamics-curves.json').read_text())
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':10,'svg.fonttype':'none'})
f,ax=plt.subplots(figsize=(8.5,5),layout='constrained')
for s in d['series']:ax.semilogx([x['concentration'] for x in s['samples']],[x['effect'] for x in s['samples']],color=s['color'],lw=2,label=s['label'])
ax.set(xlim=(.01,1000),ylim=(0,105),xlabel='Concentration (arbitrary units, logarithmic scale)',ylabel='Effect (arbitrary units)',title='Efficacy and potency')
ax.spines[['top','right']].set_visible(False);ax.grid(axis='y',color='#e1e3e6');ax.legend(loc='upper left',frameon=False);f.savefig(r/'diagrams/diagram.pharmacodynamics-curves.svg');f.savefig('/tmp/pharmacodynamics-curves.png',dpi=140);plt.close(f)
