# MDEET 학습 데이터 확장판 — 초안 (2026-11-25)

## 설치
이 ZIP의 `website/public/mdeet/`를 기존 프로젝트의 동일 경로에 복사한다. 기존 2023–2027 문항 ID와 개별 JSON 형식은 유지된다. React 페이지나 서버 코드, package.json은 포함하거나 변경하지 않는다.

## 현재 데이터
- 확보된 자연과학 시험 세트 58개, 문항 레코드 2125개 (공통/MEET/DEET 및 예비검사 포함, 동일 문제의 중복 출제는 별도 레코드).
- 학년도 2005–2027 중 2009 원본 문제지 누락. 첨부 원본의 범위 내 추출이며 모든 실제 시행 시험의 존재를 보증하지 않는다.
- 정답 전사 1310개, 정답 미전사 815개, 복수 인정 정답 6개. 미전사 정답은 원본 정답표 이미지가 있는 경우 source.answerSheetUrls를 표시하고 자동 채점하지 않는다.
- 48개 단원, 107개 실제 학습 절, 본문·표 분리 지식 레코드 1693개, Q/A 카드 234개. 이론 본문은 일반 학술 지식으로 새로 작성한 초안이며 모든 개념의 완전한 수록이나 전문 검수는 완료하지 못했다.
- 사용자 제공 2023·2024 생물학 해설 자료의 자동 추출 노트 60개는 `source-notes/`에서 별도로 제공한다. 열 순서와 장 경계 검수 필요. 원본의 오류까지 그대로 포함할 수 있으므로 검증된 교과서로 표시하지 말 것.

## 파일 및 API
| 경로 | 용도 |
|---|---|
| `/mdeet/index.json` | 문항 메타데이터 및 문항 URL |
| `/mdeet/units.json` | 기존 분류 단원 및 문항 ID |
| `/mdeet/exams.json` | 시험 세트, 과목 구성, 시간, 배점(미확인 null) |
| `/mdeet/questions/{id}.json` | 개별 문제, 5개 선지, 정답 정보, 이미지 위치 |
| `/mdeet/assets/...` | 원본 그래픽 WebP |
| `/mdeet/answer-sheets/...` | 원본 정답표 이미지 |
| `/mdeet/textbook/index.json` | 교과서 과목/대단원/세부 절 목차 및 URL |
| `/mdeet/textbook/sections/{unit}--{slug}.json` | 교과서 본문, 표, 복습 문제, 지식 ID, 관련 기출 후보 |
| `/mdeet/textbook/chapters/{unit}.json` | 단원별 절 목록 및 기출 ID |
| `/mdeet/knowledge/index.json` | 전체 본문·표의 지식 데이터 인덱스 |
| `/mdeet/knowledge/sections/{unit}--{slug}.json` | 해당 절의 지식 항목 |
| `/mdeet/flashcards/index.json` | 명시적 Q/A 복습 카드 인덱스 |
| `/mdeet/textbook/question-links.json` | 문항 ID → 세부 절 후보(검수 전) |
| `/mdeet/textbook/scope-crosswalk.json` | 공개 출제 범위 안내와 대단원 대응표 |
| `/mdeet/textbook/sources.json` | 참고 도서, 실제 접근·검수 수준 |
| `/mdeet/source-notes/index.json` | 사용자 제공 해설 노트 인덱스 |
| `/mdeet/validation.json` | 자동 무결성 검사 및 남은 검수 항목 |
| `/mdeet/types.d.ts` | TypeScript 스키마 |

## 앱에서의 렌더링
`textbook/index.json`에서 `books`, `chapters`, `sections`를 읽고 사용자가 선택한 `sections[].url`만 fetch한다. 절의 `blocks`는 `paragraph`(text), `keyFacts`(items), `table`(headers, rows)로 구성된다. 모든 본문과 표를 읽을 수 있게 구현한다. 중요 항목만 숨겨서 제공하지 않는다. `knowledgeIds`는 지식 복습에 활용하며, 자동으로 분리한 문장·표 행에는 중복과 문맥 의존성이 있을 수 있다. `flashcards`는 별도로 실제 질문/답변이 작성된 항목이다.

```ts
const index = await fetch('/mdeet/textbook/index.json').then(r => r.json());
const section = await fetch(index.sections[0].url).then(r => r.json());
const knowledge = await fetch('/mdeet/knowledge/sections/' + section.id.replace('/', '--') + '.json').then(r=>r.json());
```

## 채점과 원본 배치
```ts
const accepted = q.acceptedAnswers ?? (q.answer == null ? [] : [q.answer]);
const result = accepted.length ? accepted.includes(selectedOption) : null;
```
정답이 null이면 미확인 또는 복수 정답일 수 있으므로 반드시 `acceptedAnswers` 우선 처리. `points=null`인 문항에 임의 배점을 부여하지 않는다. 시험 점수는 정답/배점 미확인 문항을 따로 표시한다. 과거 시험은 `exams.json`에 실제 저장된 시험 세트의 문항 순서를 사용한다. 현행 화학과 과거 자연과학II의 물리·통계는 구분한다.

`layout[]`은 영역별 SVG viewBox 0 0 width height. `bbox`는 [x,y,width,height], `origin`은 [x,baselineY]. image item을 먼저 렌더링하고 `assetId`를 `assets[].id`에 연결한다. 그 위에 text spans를 표시한다. 전용 수식 글자는 과거 문항에서 원본 그래픽 fallback으로 보존될 수 있다. `stem` 및 `options[].text`는 검색용이며 수식/표 배치를 완전히 복원하지 않는다. `reviewFlags`가 있는 문항은 반드시 검수 표시한다.

## 미리보기
Next.js 서버 실행 후 `/mdeet/preview.html`에서 문항 보기, `/mdeet/textbook/preview.html`에서 학습 본문을 열 수 있다. 브라우저 실제 렌더링 및 앱 통합 테스트는 수행하지 않았다.

## 정확성·재배포
`validation.json`의 `integrityErrors`는 기계적 참조 무결성만 검증한다. 문항 원본 및 정답표 전체의 육안 대조, 세부 주제와 선지별 매핑, 교과서 전체 범위의 누락 여부, 수식의 의미 정확성은 추가 검수해야 한다. `verificationStatus`가 draft인 콘텐츠는 검수 완료로 표시하지 않는다. 공개 서비스에서 기출문제와 그림을 재배포하기 전 권리 확인이 필요하다. 모든 정답은 공개 JSON에 있으므로 보안이 필요한 시험 서비스에 사용할 때 서버로 분리한다.
