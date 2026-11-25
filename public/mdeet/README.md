# MDEET question dataset (2023–2027)

## 배치
ZIP을 프로젝트 상위 폴더에서 풀거나 `website/public/mdeet`를 기존 `website/public` 안으로 복사한다.
Next.js에서 `/mdeet/index.json`, `/mdeet/units.json`, `/mdeet/questions/{id}.json` 및 `/mdeet/assets/...` 경로로 접근할 수 있다.
개발 서버 실행 후 `/mdeet/preview.html`로 데이터 미리보기를 열 수 있다. `file://`로 직접 열면 fetch가 차단될 수 있다.

## 스키마 v2
- `index.json`: 300문항 검색용 메타데이터(정답과 본문 제외).
- `units.json`: 과목별 주제 분류 및 문항 ID.
- `questions/`: 각 문항에 대응하는 UTF-8 JSON 파일 하나.
- `assets/`: 원본 PDF에서 네이티브 텍스트를 제거하고 도형·사진·그림·표 선을 보존한 무손실 WebP 조각. 그림 안에 이미 래스터화되어 있던 기호와 레이블은 그림에 남는다.
- `validation.json`: 자동 검증 결과 및 제한 사항.
- `types.d.ts`: TypeScript 형식.
- `preview.html`: 배포 후 fetch 및 원본 배치 확인용 샘플 뷰어.

## 문항 ID
`mdeet-{학년도}-{biology|chemistry}-{2자리 문항번호}`.
예: `mdeet-2024-biology-17`.
학년도는 시험지 표기이며 실제 시행 연도와 다를 수 있다.
`answer`는 1–5(0-based 아님). `points`는 3, 4, 5점.

## 렌더링
`stem`과 `options[].text`는 검색·간단한 텍스트 표시용으로 사용할 수 있다. 복잡한 수식의 분수/첨자, 표 셀 순서 및 도표 레이블은 단순 문자열만으로 완전히 표현되지 않으므로, 실제 문제 풀이 화면은 `layout`을 사용한다.
`layout[]`은 하나 이상의 원본 페이지 영역을 나타낸다. `width`, `height`는 PDF 포인트 단위이며, `bbox`는 영역 내 `[x, y, width, height]`이다.
1. 영역별 SVG viewBox를 `0 0 width height`로 설정한다.
2. 모든 image item을 bbox에 먼저 그린다. `assetId`는 문항의 `assets` 배열과 연결한다.
3. 모든 text item의 `spans`를 그림 위에 그린다. `origin`은 `[x, baselineY]`, `size`는 글자 크기다. `flags`는 PyMuPDF의 글꼴 속성 비트마스크다. PDF에서 추출한 폰트명은 참고 메타데이터이며 폰트 파일은 포함하지 않는다.
4. `options[].textItemIds`, `options[].assetIds`는 개별 선지에 대한 연결 정보다. `stemTextItemIds`, `stemAssetIds`는 본문과 연결된다.
5. `assets[].overlayTextItemIds`는 그림 범위 내부의 원본 텍스트 레이블을 식별하는 보조 정보다. 표와 그래프의 원래 배치를 유지하려면 전체 layout을 렌더링하는 편이 안전하다.
6. 분수/첨자 등을 원본 수식과 대조 검수한 뒤 필요한 경우 의미 기반 LaTeX로 별도 보완한다. 그림을 포함한 레이아웃은 자동 추출이며 모든 문항의 수동 대조는 아직 수행하지 않았다.

## 분류
`unitId`는 주된 출제 주제에 따른 편집 분류이며, 공식 출제 영역 코드가 아니다. `topic`은 개별 문항의 세부 주제다. 문제 하나에 여러 개념이 포함될 수 있으므로 단일 주제 분류를 배포 전에 검토한다.
2023/2024 생물학 해설 PDF는 별도 학습자료이며 이번 문항 데이터에 혼합하지 않았다. 최종 정답은 원본 ZIP에 있는 최종 정답표를 기준으로 한다.

## 주의
정답 JSON이 public에 있으므로 모든 정답은 브라우저에서 직접 열어 볼 수 있다. 시험 보안이 필요하다면 정답을 서버 측으로 분리할 것.
공개 웹사이트에 원본 기출 문항과 그림을 게시하기 전 이용 및 재배포 권한을 확인할 것.
