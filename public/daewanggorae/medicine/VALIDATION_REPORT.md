# 검증 보고서

구조 검증: **PASS**. 전체 프로젝트: **부분 제작본**.

자동 검증은 의학적 정확성을 보증하지 않으며 전문의 검수는 수행되지 않았습니다.

| 항목 | 결과 |
|---|---:|
| jsonFiles | 992 |
| subjects | 100 |
| subjectsWithProse | 100 |
| draftSections | 203 |
| completedSections | 0 |
| paragraphs | 2252 |
| actualBodyCharacters | 490260 |
| estimatedPagesAt1500 | 326.84 |
| estimatedPageRange | [272.3666666666667, 408.55] |
| unwrittenPlannedUnits | 611 |
| originalQuestions | 203 |
| scenes | 54 |
| concepts | 3432 |
| meshFileRecords | 3492 |
| physicalModelFilesChecked | 3492 |
| duplicateParagraphs | 0 |
| similarParagraphPairs | 0 |

## 오류

[]

## 미완료 및 제한

- Schema and reference integrity checks are not medical verification
- Provisional curriculum is not an exhaustive official outcome crosswalk
- No medical specialist review
- No Next.js/RN runtime or WebGL rendering test
- No full textbook coverage; all existing sections remain drafts

## 검증 경고

- unwritten_units: 611
- target_not_met: {'actual': 490260, 'minimum': 12000000, 'remaining': 11509740}
