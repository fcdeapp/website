# 대왕고래 웹

기존 대왕고래 앱의 콘텐츠 계약과 학습 기록 형식을 사용하는 Next.js 웹 화면입니다. 수정 범위는 `website/src/app/daewanggorae/`, `website/public/daewanggorae/`입니다. 다른 서비스의 코드·저장소·인증 토큰을 가져오지 않습니다.

## 화면

| 주소 | 기능 |
| --- | --- |
| `/daewanggorae` | 이어서 읽기, 학습 계획, 분야 탐색 |
| `/daewanggorae/textbook` | 분야별 교과서 |
| `/daewanggorae/subject?id=anatomy` | 과목 목차, 미작성 범위 |
| `/daewanggorae/chapter?id=anatomy.chapter.thorax` | 챕터 목차 |
| `/daewanggorae/lesson?id=anatomy.thorax.heart` | 전체 본문, 목표·표·수식·도표·3D, 북마크·메모·강조·읽기 위치 |
| `/daewanggorae/anatomy` | 3D 장면 / 구조 검색; `?scene=…`, `?concept=…` 직접 연결 |
| `/daewanggorae/questions` | 분야·과목·단원·풀이 상태 필터, 랜덤 10문항 |
| `/daewanggorae/quiz?ids=…` | 제출·해설·오답 기록·연속 풀이, 문항별 표·도표·3D |
| `/daewanggorae/search` | 한국어·영어·FMA 검색 |
| `/daewanggorae/study` | 학습 관리 |
| `/daewanggorae/review` | 예정 문항·핵심 지식의 간격 반복 |
| `/daewanggorae/bookmarks` | 북마크·메모·하이라이트 |
| `/daewanggorae/plan` | 학습 목표 작성·완료·삭제 |
| `/daewanggorae/statistics` | 실제 기록 기반 열람 시간·풀이·과목 진도 |
| `/daewanggorae/account` | 가입·로그인·이메일 인증·복구·동기화·선택적 어브로디 연결·탈퇴 |
| `/daewanggorae/settings` | 글자 크기·다크모드·과목 자료 저장·캐시 관리 |
| `/daewanggorae/terms` | 한국어 약관; `?kind=privacy` 개인정보 처리방침 |
| `/daewanggorae/sources` | 출처·라이선스·국시 공개 자료 안내 |

기존 웹의 `output: export`를 유지하기 위해 가변 콘텐츠 ID는 쿼리로 전달합니다. 새로운 단원마다 라우트 파일을 추가하지 않아도 됩니다.

## 개발·검증

`website/`에서 실행합니다. 기존 의존성을 사용하며 패키지 추가는 없습니다.

```sh
npm run dev
npx tsc --noEmit --incremental false
npx eslint src/app/daewanggorae
node --test src/app/daewanggorae/_tests/content.test.cjs
npm run build
```

## GitHub Pages 배포

CI는 `npm run build`로 만든 `out/`에서 `npm run prepare:pages`를 실행해 `out-pages/`를 만들고 이 폴더만 배포합니다. `public/`과 `out/` 원본은 변경하지 않습니다.

- `daewanggorae/bodyparts3d/`와 `daewanggorae/medicine/`은 제작용 원본이므로 배포에서 제외합니다. Git LFS 추적과 소스 파일은 유지합니다.
- 웹에서 사용하는 `daewanggorae/runtime/`의 GLB, 교과서·문항·도표, 라이선스 및 `sw.js`는 그대로 포함합니다.
- 일반 Git 파일 100 MiB 제한, 사이트 총 1 GB 제한, 미다운로드된 LFS 포인터를 배포 전에 검사합니다. 초과 파일을 임의로 누락시키지 않고 실패시킵니다.
- `npm run test:pages`로 배포 규칙과 전체 런타임 콘텐츠·모델의 해시 및 참조를 검사합니다.

실패한 과거 Actions 실행을 재실행하면 과거 배포 설정을 사용합니다. 수정된 워크플로가 포함된 커밋을 `main`에 push해 새 배포를 시작합니다. 원격 브랜치 이력 재작성은 필요하지 않습니다.

## 콘텐츠 갱신

읽기 전용 원본은 `public/daewanggorae/medicine/`입니다. 앱 원본이 갱신되면 해당 자료를 이 위치에 동기화한 뒤 실행합니다.

```sh
python3 src/app/daewanggorae/_scripts/build_content.py
node --test src/app/daewanggorae/_tests/content.test.cjs
```

`domains/index.json → 분야 → 과목 → 챕터 → 학습 절`을 순회하고 문항·장면·해부학 개념 인덱스를 연결합니다. `runtime/manifest.json`과 SHA-256 파일명으로 된 `runtime/content/`를 생성합니다. UI의 수치는 이 카탈로그에서 계산합니다. 생성 스크립트는 원본 데이터를 수정하거나 기존 런타임 파일을 삭제하지 않습니다.

3D 자산과 Markdown/KaTeX 렌더러를 다시 만들 때는 **이미 의존성과 모델이 준비된** 독립 앱 경로를 사용합니다. 일반 웹 빌드에는 이 앱 경로가 필요하지 않습니다.

```sh
node src/app/daewanggorae/_scripts/build_assets.cjs ../daewanggorae
python3 src/app/daewanggorae/_scripts/build_content.py
```

Three.js 뷰어와 Markdown/KaTeX는 앱의 잠금된 의존성에서 번들링한 정적 자산입니다. `runtime/THIRD_PARTY_LICENSES.txt`에 라이선스를 포함합니다. GLB는 앱에서 변환한 파일을 복사하며 원본 좌표·상대 위치를 유지합니다. 각 모델은 필요할 때만 다운로드하고 크기·SHA-256을 검증합니다. 장면 이탈 시 요청을 취소하고 GPU 자원을 정리합니다. 전체 원본 ZIP을 브라우저에서 열지 않습니다.

앱의 기존 자료를 참고해 순수 TypeScript 로직(데이터 캐시, 도표 생성, 채점, 복습, 기록 병합)을 웹 내부에 복사했습니다. 앱 코드가 바뀌면 이 복사본과 계약 테스트도 함께 검토해야 합니다. 런타임에는 앱 디렉터리에 의존하지 않습니다.

## 저장·계정

- 브라우저 키: `com.fcde.daewanggorae.web.v1:guest`, `…:user:<id>`.
- 학습 기록은 원본과 분리하며 앱의 `LearningRecord` 필드와 ID 규칙을 유지합니다.
- 로그인은 선택 사항입니다. 토큰은 메모리에만 저장하고 새로고침 시 다시 로그인합니다.
- 한국 API 고정: `https://kr.fcde.app/api/daewanggorae`.
- 앱과 같은 API 계약으로 회원가입·인증·로그인·복구·탈퇴·어브로디 연결을 제공합니다.
- 기록 동기화와 게스트 기록 가져오기는 계정 화면에서 명시적으로 실행합니다. 게스트 원본은 유지하며 충돌은 최신 수정 시각 기준으로 병합합니다.
- 약관 API에 연결되지 않으면 앱과 동일한 한국어 약관 사본을 표시하고 저장된 약관임을 안내합니다. 서버는 제출한 약관 버전을 다시 확인합니다.
- 실제 API의 배포 상태와 이메일 발송 설정은 별도입니다. 웹 구현만으로 운영 인증 성공을 보장하지 않습니다.

## 오프라인

프로덕션에서만 `/daewanggorae/sw.js`를 등록합니다. 범위는 `/daewanggorae/`이며 다른 서비스나 API 응답을 캐싱하지 않습니다. 자료·정적 청크는 캐시 우선, 방문한 HTML은 네트워크 우선 후 캐시로 복구합니다. 개발 서버에서는 Next.js의 변경되는 청크가 오래 남지 않도록 등록하지 않습니다.

과목 자료 저장은 크기와 해시를 확인한 파일만 캐시에 넣습니다. 취소·실패 시 이미 검증된 파일과 학습 기록은 유지합니다. 학습 페이지 자체는 한 번 온라인으로 방문하고 저장이 끝날 때까지 기다려야 합니다. `/daewanggorae` 첫 화면은 서비스워커 범위 바깥이며 오프라인 시작점으로는 방문했던 `/daewanggorae/textbook` 등을 사용합니다. 처음 방문할 페이지, 아직 열지 않은 3D 모델 및 로그인에는 연결이 필요합니다. 웹 브라우저 저장소는 운영체제·사용자에 의해 제거될 수 있습니다. 네이티브 앱과 같은 영구 오프라인 설치를 약속하지 않습니다.

## 상위 웹 레이아웃 제약

`src/app/layout.tsx`는 수정하지 않았습니다. 대왕고래가 마운트된 동안만 경로 범위 CSS로 어브로디 헤더와 어브로디 전용 점검·비밀번호 안내 창을 감춥니다. 다른 경로에서는 해당 CSS가 적용되지 않습니다. 자체 로그인 오류는 대왕고래 계정 화면에서 표시합니다.

상위 레이아웃의 어브로디 초기화, 위치/서버 상태 확인, 분석 스크립트 자체는 계속 실행됩니다. 이를 완전히 분리하려면 향후 사용자가 허용한 범위에서 RootLayout을 경로별로 분기해야 합니다. 로컬 서버에서 기존 `src/config/i18n.ts`의 서버 렌더링 중 `localStorage` 접근 오류도 관찰되었습니다. 이 작업 범위 밖의 파일은 수정하지 않았습니다. 전체 정적 빌드는 이 기존 경고가 출력된 상태에서도 성공했습니다.

## 검증 기록

- 실제 전체 자료의 파일 해시, 모델 해시, 단원·문항·장면 연결, 반응형 도표 SVG, 검색, 학습 기록 격리·복원, 채점·간격 반복, 캐시·안전한 경로: 자동 테스트 8개 통과.
- 웹 TypeScript 검사 및 해당 디렉터리 ESLint 통과.
- 최종 `npm run build` 성공: 사이트 전체 2,493개 정적 페이지 생성, 대왕고래 18개 경로 포함. 기존 공통 i18n의 localStorage 경고와 정적 export의 rewrites 경고는 남아 있습니다.
- 로컬 Next.js와 격리 Chrome에서 실제 원본 데이터로 화면·기능 검사. 운영 API 호출은 차단한 상태입니다.
- 심장 장면 83개 구조 실제 WebGL 렌더링 확인.
- 북마크·메모·학습 완료의 새로고침 복원, 학습 계획, 핵심 지식 복습, 2문항 연속 풀이와 선택 초기화 확인.
- 해설용 표·그래프는 제출 전 미노출, 제출 후 렌더링 확인. 본문 수식·반응형 도표도 실제 화면 검수.
- 390·768·1024·1280·1440px에서 가로 넘침 없음. 다크모드·검색·설정·출처·약관 화면 검수. 최종 브라우저 검사 중 대왕고래 클라이언트 예외 0건.
- 최종 정적 배포 파일을 로컬로 제공해 문단 연결 3D의 83개 구조 로딩·격리/복원, 앱과 동일한 문단 북마크 ID, 목표 체크 저장을 확인했습니다.
- 서비스워커 설치 후 네트워크를 끊고 방문한 교과서를 강제 새로고침하여 본문과 로컬 기록 복원을 확인했습니다.
- 대왕고래 밖의 기존 약관 페이지에서 어브로디 헤더 복원을 확인했습니다.
- 한국 API 고정·토큰 비저장·게스트/계정 분리·401 갱신 후 재시도는 가짜 응답을 사용하는 단위 테스트로 확인했습니다. 실제 운영 로그인·메일·기기 간 동기화는 운영 계정으로 실행하지 않았습니다.

콘텐츠의 구조 검증은 의학 검수와 다릅니다. 초안·검수 상태와 원본 출처는 그대로 표시합니다. Git 커밋·푸시·배포는 수행하지 않습니다.
