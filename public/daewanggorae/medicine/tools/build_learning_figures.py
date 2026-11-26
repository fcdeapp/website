"""Build original quantitative teaching figures; never count diagram text as prose."""
from pathlib import Path
import json
R=Path(__file__).resolve().parents[1]
def read(p):return json.loads((R/p).read_text())
def save(p,d):(R/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
def frame(title,desc,body,height=720):
 return f'''<svg xmlns="http://www.w3.org/2000/svg" width="1100" height="{height}" viewBox="0 0 1100 {height}" role="img" aria-labelledby="title desc"><title id="title">{title}</title><desc id="desc">{desc}</desc><style>text{{font-family:'Noto Sans CJK KR','Noto Sans',sans-serif;fill:#1f2937}}.h{{font-size:29px;font-weight:700}}.s{{font-size:20px}}.v{{font-size:26px;font-weight:700}}.small{{font-size:17px}}</style><rect width="1100" height="{height}" fill="#fff"/><text class="h" x="52" y="58">{title}</text>{body}</svg>'''
figures=[
dict(id='diagram.oxygen-content',lessonId='emergency-medicine.resuscitation.oxygen-delivery',title='같은 산소포화도, 다른 산소함량',visualizationKind='original_calculated_comparison',sourceImageUsed=False,assumptions=dict(SaO2=.98,PaO2_mmHg=100,bindingCoefficient_mL_per_g=1.34,solubility_mL_per_dL_per_mmHg=.003),samples=[dict(Hb_g_per_dL=h,boundOxygen_mL_per_dL=1.34*h*.98,dissolvedOxygen_mL_per_dL=.003*100,totalOxygen_mL_per_dL=1.34*h*.98+.003*100) for h in [15,7.5]],limitations=['계산 예시이며 실제 환자 자료가 아니다. 이상헤모글로빈과 측정 오차는 포함하지 않는다.','산소함량 비교이며 심박출량이나 미세순환을 측정한 그림이 아니다.']),
dict(id='diagram.bayes-positive',lessonId='internal-medicine.diagnosis.probability',title='낮은 사전확률에서 양성 결과의 구성',visualizationKind='original_calculated_frequency_chart',sourceImageUsed=False,assumptions=dict(population=10000,prevalence=.01,sensitivity=.9,specificity=.95),counts=dict(disease=100,noDisease=9900,truePositive=90,falseNegative=10,falsePositive=495,trueNegative=9405),positivePredictiveValue=90/585,limitations=['독립적으로 계산한 가상 집단이며 실제 검사의 임상 성능 자료가 아니다.','동일한 민감도와 특이도도 환자군과 측정 조건에 따라 달라질 수 있다.'])]
index=read('diagrams/index.json')
for f in figures:
 fid=f['id'];svg='diagrams/'+fid+'.svg';data='diagrams/'+fid+'.json'
 if fid=='diagram.oxygen-content':
  body='<text class="s" x="52" y="105">두 경우 모두 SaO₂ 98%, PaO₂ 100 mmHg로 가정</text>'
  for j,d in enumerate(f['samples']):
   y=180+j*170;bound=d['boundOxygen_mL_per_dL'];diss=d['dissolvedOxygen_mL_per_dL'];scale=31
   body+=f'<text class="v" x="52" y="{y}">Hb {d["Hb_g_per_dL"]} g/dL</text><rect x="260" y="{y-30}" width="{bound*scale}" height="55" rx="3" fill="#7c65a9"/><rect x="{260+bound*scale}" y="{y-30}" width="{diss*scale}" height="55" fill="#aeb8c5"/><text class="v" x="260" y="{y+65}">CaO₂ {d["totalOxygen_mL_per_dL"]:.2f} mL O₂/dL</text>'
  body+='<rect x="52" y="465" width="23" height="18" fill="#7c65a9"/><text class="s" x="88" y="482">헤모글로빈 결합 산소</text><rect x="440" y="465" width="23" height="18" fill="#aeb8c5"/><text class="s" x="476" y="482">혈액에 용해된 산소</text><text class="s" x="52" y="545">CaO₂ = 1.34 × Hb × SaO₂ + 0.003 × PaO₂</text><text class="s" x="52" y="588">포화도가 같아도 헤모글로빈 농도가 낮으면 산소함량이 감소한다.</text><text class="small" x="52" y="646">계산 예시 · 실제 환자 측정값 아님 · 산소운반량에는 심박출량도 관여</text>'
 else:
  body='<text class="s" x="52" y="105">가상 집단 10,000명 · 유병률 1% · 민감도 90% · 특이도 95%</text>'
  labels=[('질환 있음',100,'양성 90명 / 음성 10명'),('질환 없음',9900,'양성 495명 / 음성 9,405명')]
  for j,(label,n,note) in enumerate(labels):
   x=52+j*510;body+=f'<rect x="{x}" y="145" width="480" height="125" rx="8" fill="#f5f3f8" stroke="#c7bfd6"/><text class="v" x="{x+25}" y="188">{label} {n:,}명</text><text class="s" x="{x+25}" y="237">{note}</text>'
  body+='<text class="v" x="52" y="327">검사 양성 585명의 구성</text><rect x="52" y="355" width="144.6153846" height="72" fill="#7c65a9"/><rect x="196.6153846" y="355" width="795.3846154" height="72" fill="#c8cdd5"/><text class="s" x="67" y="399" fill="#fff" style="fill:#fff">참양성 90</text><text class="s" x="460" y="399">위양성 495</text><text class="v" x="52" y="494">양성예측도 = 90 / 585 ≈ 15.4%</text><text class="s" x="52" y="552">양성 결과의 의미는 검사 성능과 사전확률을 함께 반영한다.</text><text class="small" x="52" y="620">독립 계산 예시 · 실제 검사나 환자 자료 아님</text><text class="small" x="52" y="654">막대 길이는 양성 집단 내 구성비를 나타낸다.</text>'
 (R/svg).write_text(frame(f['title'],f['limitations'][0],body),encoding='utf-8');save(data,f)
 if not any(d['id']==fid for d in index['diagrams']):index['diagrams'].append(dict(id=fid,path=data,svgPath=svg,lessonId=f['lessonId']))
 p=next(p for p in R.glob('domains/*/subjects/*/chapters/*/sections/*.json') if json.loads(p.read_text())['id']==f['lessonId']);s=json.loads(p.read_text());bid=f['lessonId']+'.figure.'+fid.split('.')[-1]
 if not any(b['id']==bid for b in s['blocks']):
  needle='헤모글로빈이 15' if fid=='diagram.oxygen-content' else '가령 유병률';pos=next(i for i,b in enumerate(s['blocks']) if needle in b.get('markdown',''))+1;s['blocks'].insert(pos,dict(id=bid,type='diagram',diagramRef=fid,path=svg,alt=f['title']))
 p.write_text(json.dumps(s,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
save('diagrams/index.json',index)
print('Figures',len(index['diagrams']))
