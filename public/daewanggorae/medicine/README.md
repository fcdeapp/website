# 의학 데이터셋 사용 안내

## 분야별 파일 배치

`public/medicine`을 웹 프로젝트의 정적 자산 경로 또는 앱의 동일한 상대 경로로 배치한다. 원본 `public/bodyparts3d`는 별도로 유지한다.

```text
public/medicine/
  manifest.json
  domains/
    index.json
    progress.json
    01-anatomy/
      manifest.json
      curriculum.json
      coverage.json
      progress.json
      TEXTBOOK.md
      subjects/
        anatomy/chapters/.../sections/*.json
        neuroanatomy/
        imaging-anatomy/
        histology/
        embryology/
      references/
      questions/index.json
      scenes/index.json
      diagrams/index.json
    02-biomedical-sciences/
    03-pathology-pharmacology/
    04-immunity-infection/
    05-internal-medicine/
    06-surgery/
    07-obgyn-pediatrics/
    08-neuroscience-psychiatry/
    09-clinical-diagnostics/
    10-prevention-clerkships/
  anatomy/
  questions/
  scenes/
  diagrams/
  references/
  schemas/
  tools/
```

분야별 ZIP은 같은 프로젝트 루트에 병합하여 압축을 푼다. `medical-shared.zip`은 공통 타입·스키마·원본 모델 인덱스·카탈로그를 제공하며 실제 OBJ는 포함하지 않는다. 분야 ZIP에는 해당 분야의 절 JSON과 그 절이 직접 사용하는 문항·장면·도표 및 별도 근거 자료가 들어 있다. 전체 배포 ZIP도 같은 파일트리를 사용한다.

## 필요한 절만 불러오기

`domains/index.json` → 분야 manifest → 과목 manifest → chapter.json → 절 JSON 순서로 필요한 파일을 읽는다. manifest의 모든 `path`는 `medicine` 루트 기준 상대 경로다. `/medicine/`을 경로 앞에 붙이는 웹 어댑터와 앱의 파일·자산 어댑터가 같은 데이터를 사용할 수 있다. React Native의 정적 번들에서 동적인 `require(path)`를 사용하지 말고 빌드 시 자산 목록, 파일 시스템 어댑터 또는 HTTPS 자산 호스트를 사용한다.

분야를 선택 설치한 앱은 실제 설치한 분야의 목록으로 탐색과 검색을 제한한다. 다른 분야의 `relatedLessons`는 안정적인 콘텐츠 ID이며 해당 분야 설치를 요구하는 링크로 처리한다. 경로가 바뀌어도 콘텐츠 ID와 사용자 진도 키를 바꾸지 않는다. 이전 경로의 이동표는 `validation/path-migration-v0.8.json`에 있다.

본문 블록과 장면 타입은 `schemas/medicine.ts`, 분야 타입과 로더 인터페이스는 `schemas/domain.ts`에 있다. JSON Schema는 `schemas/`에 제공한다. 출처는 분야의 `references/` 또는 공통 `references/`에서 조회하고 교과서 화면의 본문과 분리한다.

## 3D 연결

본문의 `sceneRefs`와 장면의 `triggerBlockId`를 연결한다. FMA와 OBJ 경로는 공통 `anatomy/` 인덱스로 해석한다. 원본 좌표는 mm이며 +X는 환자의 왼쪽, +Y는 뒤쪽, +Z는 위쪽이다. 카메라 up은 `[0,0,1]`이다. 개별 메시를 각기 원점으로 옮기지 않는다. 화면 종횡비에 맞춰 합집합 경계로 autoFit하고 겹치는 메시를 중복 로드하지 않는다. 정상 정적 구조의 표현 범위는 각 장면의 `visualizationLimitations`에 기록되어 있다.

## 제작 기준과 검증

분량은 절 JSON의 `paragraph.markdown`만 한 번 집계한다. 합본, 목차, 문제, 출처와 코드 및 다른 배포 ZIP의 같은 본문은 더하지 않는다. 분야별 최소 집필 기준은 목표 본문 글자 수의 10%다. 이를 넘었는지는 `minimumProseGatePassed`, 부족한 양은 `charactersToMinimum`으로 확인한다. 이 값은 교육내용의 충족률이나 의학적 검증률을 뜻하지 않는다. 후자는 별도 상태로 관리한다.

```bash
python public/medicine/tools/sync_progress.py
python public/medicine/tools/build_domain_packages.py --output dist/medicine-domains
python public/medicine/tools/validate.py --model-root public
```

원본 모델 추출이 필요하면 `tools/extract_models.py`를 이용한다. 의존성은 `tools/requirements.txt`에 있다. 새 본문은 기존 ID를 확인한 뒤 `tools/import_manuscript.py`로 추가한다. 검증 기록은 `validation/`, 제작 진도는 `progress.json`에 보관한다. 사용자별 학습 진도는 별도의 앱 저장소에서 관리한다. 라이선스와 출처별 재사용 범위는 `LICENSES.md` 및 서지에 따른다.
