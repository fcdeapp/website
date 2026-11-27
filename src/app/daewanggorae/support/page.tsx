import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { Heading } from "../_components/UI";
import s from "./support.module.css";

export const metadata: Metadata = {
  title: "고객지원",
  description: "대왕고래 이용 문의, 교과서·문항 오류 제보 및 계정과 학습 기록 안내.",
};

const email = (subject: string) =>
  `mailto:support@fcde.app?subject=${encodeURIComponent(`[대왕고래] ${subject}`)}`;

const questions = [
  {
    title: "로그인하지 않아도 학습할 수 있나요?",
    answer: "교과서 읽기, 3D 해부학, 문제 풀이 등 주요 학습 기능은 로그인 없이 이용할 수 있습니다. 로그인은 계정과 학습 기록 동기화를 이용할 때 필요합니다.",
  },
  {
    title: "로그인이 되지 않으면 어떻게 하나요?",
    answer: "네트워크 연결을 확인하고 잠시 후 다시 시도해 주세요. 계속 연결되지 않으면 발생 시각과 화면에 표시된 오류 문구를 보내 주세요. 문의하는 동안에도 로그인 없이 학습을 이어갈 수 있습니다. 비밀번호나 인증 코드는 보내지 마세요.",
  },
  {
    title: "학습 기록이 보이지 않아요.",
    answer: "학습했던 기기와 브라우저, 로그인한 계정이 같은지 먼저 확인해 주세요. 로그인 없이 저장한 기록은 해당 기기나 브라우저에 보관됩니다. 앱 삭제나 브라우저 데이터 삭제 전에 문의해 주세요. 기기에만 저장된 기록은 삭제 후 복구가 어려울 수 있습니다.",
  },
  {
    title: "교과서나 문제에서 오류를 발견했어요.",
    answer: "과목·단원명 또는 문항을 식별할 수 있는 정보와 함께, 잘못된 내용과 수정이 필요한 이유를 알려 주세요. 참고한 출처가 있다면 함께 보내 주세요. 현재 콘텐츠에는 전문의 검수 전 초안이 포함되어 있으며, 각 자료의 검수 상태는 학습 화면에서 확인할 수 있습니다.",
  },
  {
    title: "3D 해부학 모델이 나타나지 않아요.",
    answer: "자료를 처음 불러올 때는 시간이 걸릴 수 있습니다. 네트워크 연결을 확인한 뒤 화면을 다시 열어 주세요. 웹에서는 최신 브라우저를 사용해 주세요. 문제가 계속되면 구조나 장면 이름, 기기 모델, 운영체제와 앱 또는 브라우저 버전을 보내 주세요.",
  },
  {
    title: "회원 탈퇴나 개인정보 관련 요청은 어디서 하나요?",
    answer: "회원 탈퇴는 계정 화면에서 요청할 수 있습니다. 계정에 접근할 수 없거나 개인정보 열람·정정·삭제에 관한 문의가 있다면 dpo@fcde.app으로 연락해 주세요. 비밀번호나 신분증 등 민감한 자료를 먼저 보내지 마세요.",
  },
];

export default function SupportPage() {
  return (
    <div className={s.page}>
      <Heading title="고객지원" detail="이용 중 불편한 점이나 학습 자료의 오류를 알려 주세요." />
      <div className={s.layout}>
        <aside className={s.contact} aria-label="문의 안내">
          <h2>이메일로 문의하기</h2>
          <p>이용 문의와 개선 의견을 받습니다.</p>
          <a className={s.email} href={email("이용 문의")}>
            support@fcde.app <ArrowUpRight size={19} aria-hidden="true" />
          </a>
          <p className={s.caption}>선택하면 기기의 메일 앱이 열립니다.</p>
          <div className={s.checklist}>
            <h3>함께 알려주시면 도움이 됩니다</h3>
            <ul>
              <li>문제가 발생한 화면과 시각</li>
              <li>사용 기기와 앱 또는 브라우저 버전</li>
              <li>오류 문구와 재현 방법</li>
            </ul>
            <p>화면을 첨부할 때는 개인정보를 가려 주세요. 비밀번호와 인증 코드는 필요하지 않습니다.</p>
          </div>
          <a className={s.textLink} href={email("교과서·문항 오류 제보")}>
            콘텐츠 오류 제보 <ArrowUpRight size={16} aria-hidden="true" />
          </a>
          <a className={s.textLink} href="mailto:dpo@fcde.app">
            개인정보 문의 <ArrowUpRight size={16} aria-hidden="true" />
          </a>
        </aside>
        <section className={s.faq} aria-labelledby="support-questions">
          <h2 id="support-questions">자주 묻는 질문</h2>
          {questions.map(({ title, answer }) => (
            <details key={title}>
              <summary>{title}<ChevronDown size={18} aria-hidden="true" /></summary>
              <p>{answer}</p>
            </details>
          ))}
          <nav className={s.links} aria-label="관련 안내">
            <Link href="/daewanggorae/account">계정 관리</Link>
            <Link href="/daewanggorae/terms">이용약관</Link>
            <Link href="/daewanggorae/terms?kind=privacy">개인정보 처리방침</Link>
            <Link href="/daewanggorae/sources">출처와 이용 안내</Link>
          </nav>
        </section>
      </div>
    </div>
  );
}
