# 작업 재개 절차

progress.json과 domains/progress.json 및 실제 절 파일부터 읽고 기존 본문과 안정 ID를 보존한다. 현재 본문은 490,260자, 203절이며 1쪽1,500자 기준 326.84쪽이다. 공식 학습성과의 전수 대조와 전체 의학 검수는 미완료이다. 출처의 선택 주장 대조는 65건이며 전체 절 검수·전문의 검수 완료 절은 0개이다.

활성 분야는 01-anatomy이다. 현재 143,296자이며 분야별 목표의 10%인 180,000자까지 36,704자가 더 필요하다. 이 최소 기준 전에는 다른 분야 집필로 전환하지 않는다. 10-prevention-clerkships는 63,237자로 최소60,000자 분량 기준을 충족했으나 전체 교육과정이 완성된 것은 아니다. 전체 10% 중간 목표는 1,500,000자이며 아직 1,009,740자가 필요하다.

canonical 경로는 domains/<domainId>/subjects/<subjectId>/chapters/<chapterId>/sections/*.json이다. subjects/를 medicine 바로 아래에 재생성하지 않는다. 합본·메타데이터·문제·패키지 중복본은 본문 분량에 합산하지 않는다. import_manuscript.py는 새 ID만 허용한다. manuscript-55~59의 15절은 이미 저장되었으며 다시 import하지 않는다.

다음 미작성 주제는 anatomy.head-neck.ear-temporal-bone, anatomy.head-neck.nose-paranasal, neuroanatomy.forebrain.basal-ganglia, embryology.pharyngeal.arches-pouches이다. 이전에 끝낸 무릎·종아리·발·두개바닥·목근막·후두·갑상샘·구강·인두·안와·두 조직학 절·세 신경해부학 절은 이유 없이 재생성하지 않는다.

출처는 references/references.json 및 references/lesson-evidence.json에만 두고 본문·읽기용 합본에는 인용·URL·제작 안내를 삽입하지 않는다. 새 장면은 실제 첨부 FMA·OBJ·경계상자·파일 해시를 확인했다. 갑상연골을 갑상샘 대신 사용하지 않는다. 미세구조·신경·동적 기능의 누락은 validation/new-section-visualization-gaps.json 및 scene의 제한에 기록했다. 새 SVG 2개는 독립 제작하였으며 렌더링 후 시각 확인했다. Next.js/RN 및 WebGL 실행은 검증하지 않았다.

작성 뒤 sync_progress.py, build_domain_packages.py --output <배포폴더>, validate.py --model-root <bodyparts3d의 상위폴더>를 실행한다. --require-complete 종료2는 목표 미달과 의학 검수 미완료를 뜻하며 구조 오류와 구분한다. 전체 ZIP은 분야별 ZIP 및 공통 ZIP을 병합한 canonical 바이트·본문 글자 수와 일치하도록 재생성한다. 출처 원문·번역·사진·도표는 수록하지 않았으며 OpenStax A&P 2e의 현재 공개 서문은 CC BY-NC-SA 4.0이다.
