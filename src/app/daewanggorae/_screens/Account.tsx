"use client";
import Link from "next/link";
import { useState } from "react";
import {
  useUser,
  login,
  logout,
  policies,
  request,
  deleteAccount,
  linkAbrody,
  unlinkAbrody,
} from "../_lib/auth";
import { sync, importGuest } from "../_lib/sync";
import { useLoad } from "../_lib/hooks";
import { Heading, url } from "../_components/UI";
import s from "../daewanggorae.module.css";
type Mode = "login" | "register" | "verify" | "forgot" | "reset" | "abrody";
const titles: Record<Mode, string> = {
  login: "로그인",
  register: "회원가입",
  verify: "이메일 인증",
  forgot: "비밀번호 찾기",
  reset: "비밀번호 재설정",
  abrody: "어브로디로 로그인",
};
export default function Account() {
  const user = useUser(),
    p = useLoad(policies, "policies");
  const [mode, setMode] = useState<Mode>("login"),
    [identifier, setIdentifier] = useState(""),
    [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [token, setToken] = useState(""),
    [consent, setConsent] = useState(false),
    [busy, setBusy] = useState(false),
    [status, setStatus] = useState(""),
    [confirm, setConfirm] = useState(""),
    [linkId, setLinkId] = useState(""),
    [linkPassword, setLinkPassword] = useState(""),
    [linkConsent, setLinkConsent] = useState(false);
  async function run(action: () => Promise<unknown>, message: string) {
    if (busy) return;
    setBusy(true);
    setStatus("");
    try {
      await action();
      setStatus(message);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
      if ((e as { status?: number }).status === 409) {
        setConsent(false);
        p.retry();
      }
    } finally {
      setBusy(false);
    }
  }
  const change = (m: Mode) => {
    setMode(m);
    setPassword("");
    setToken("");
    setConsent(false);
    setStatus("");
  };
  const needsConsent = ["login", "register", "abrody"].includes(mode);
  return (
    <div className={s.form}>
      <Heading
        title={user ? "내 계정" : titles[mode]}
        detail={user ? user.email : "학습은 로그인 없이도 계속할 수 있습니다."}
      />
      {user ? (
        <>
          <button
            disabled={busy}
            className={s.primary}
            onClick={() => void run(sync, "학습 기록을 동기화했습니다.")}
          >
            학습 기록 동기화
          </button>
          <div className={s.actions}>
            <button
              disabled={busy}
              onClick={() => setConfirm(confirm === "merge" ? "" : "merge")}
            >
              게스트 기록 가져오기
            </button>
          </div>
          {confirm === "merge" && (
            <>
              <p>
                이 브라우저의 게스트 기록을 현재 계정으로 가져옵니다. 겹치는
                항목은 최근 기록을 사용하며 게스트 원본은 유지됩니다.
              </p>
              <button
                disabled={busy}
                onClick={() =>
                  void run(importGuest, "게스트 기록을 가져왔습니다.")
                }
              >
                동의하고 가져오기
              </button>
            </>
          )}
          <h2>어브로디 계정 연결</h2>
          <p className={s.muted}>
            {user.linked
              ? "연결된 어브로디 계정으로도 로그인할 수 있습니다."
              : "원할 때만 연결하세요. 두 서비스의 데이터와 비밀번호는 별도로 유지됩니다."}
          </p>
          {!user.linked ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (linkConsent)
                  void run(async () => {
                    await linkAbrody(linkId.trim(), linkPassword);
                    setLinkPassword("");
                  }, "계정을 연결했습니다.");
              }}
            >
              <label className={s.field}>
                어브로디 아이디 또는 이메일
                <input
                  required
                  value={linkId}
                  onChange={(e) => setLinkId(e.target.value)}
                  autoComplete="username"
                />
              </label>
              <label className={s.field}>
                어브로디 비밀번호
                <input
                  required
                  type="password"
                  value={linkPassword}
                  onChange={(e) => setLinkPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </label>
              <label className={s.check}>
                <input
                  type="checkbox"
                  checked={linkConsent}
                  onChange={(e) => setLinkConsent(e.target.checked)}
                />
                <span>
                  입력한 어브로디 계정을 현재 대왕고래 계정에 연결합니다.
                  게시물과 친구 목록은 가져오지 않습니다.
                </span>
              </label>
              <button disabled={!linkConsent || busy}>
                확인하고 계정 연결
              </button>
            </form>
          ) : (
            <button
              onClick={() => {
                setPassword("");
                setConfirm(confirm === "unlink" ? "" : "unlink");
              }}
            >
              어브로디 연결 해제
            </button>
          )}
          <hr />
          <div className={s.actions}>
            <button
              disabled={busy}
              onClick={() => void run(logout, "로그아웃했습니다.")}
            >
              로그아웃
            </button>
            <button
              onClick={() => {
                setPassword("");
                setConfirm(confirm === "delete" ? "" : "delete");
              }}
            >
              대왕고래 회원 탈퇴
            </button>
          </div>
          {["delete", "unlink"].includes(confirm) && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  if (confirm === "delete") await deleteAccount(password);
                  else await unlinkAbrody(password);
                  setPassword("");
                  setConfirm("");
                }, "처리했습니다.");
              }}
            >
              <p>
                {confirm === "delete"
                  ? "대왕고래 계정과 동기화된 학습 기록을 삭제합니다. 어브로디 계정은 삭제하지 않습니다."
                  : "연결을 해제하고 로그아웃합니다. 대왕고래 계정으로 다시 로그인할 수 있습니다."}
              </p>
              <label className={s.field}>
                대왕고래 비밀번호
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <button disabled={busy || !password}>
                {confirm === "delete" ? "확인하고 탈퇴" : "확인하고 연결 해제"}
              </button>
              <button type="button" onClick={() => setConfirm("")}>
                취소
              </button>
            </form>
          )}
        </>
      ) : (
        <>
          <Link className={s.button} href={url("textbook")}>
            로그인 없이 학습하기
          </Link>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void run(
                async () => {
                  const data = p.data?.data;
                  if (needsConsent && (!consent || !data))
                    throw new Error("약관 동의가 필요합니다.");
                  if (mode === "login" || mode === "abrody") {
                    await login(
                      identifier.trim(),
                      password,
                      data!,
                      mode === "abrody",
                    );
                    setPassword("");
                  } else if (mode === "register") {
                    await request("/v1/auth/register", {
                      username: username.trim(),
                      email: identifier.trim(),
                      password,
                      consent: {
                        terms: data!.terms.version,
                        privacy: data!.privacy.version,
                        age14: true,
                      },
                    });
                    setMode("verify");
                    setPassword("");
                  } else if (mode === "verify") {
                    await request("/v1/auth/verify", { token: token.trim() });
                    change("login");
                  } else if (mode === "forgot") {
                    await request("/v1/auth/forgot", {
                      email: identifier.trim(),
                    });
                    setMode("reset");
                  } else {
                    await request("/v1/auth/reset", {
                      token: token.trim(),
                      password,
                    });
                    change("login");
                  }
                },
                mode === "register"
                  ? "인증 코드를 이메일로 보냈습니다."
                  : mode === "forgot"
                    ? "등록된 이메일이면 복구 코드를 보냈습니다."
                    : mode === "verify" || mode === "reset"
                      ? "완료했습니다. 로그인해 주세요."
                      : "로그인했습니다.",
              );
            }}
          >
            {mode === "register" && (
              <label className={s.field}>
                아이디
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
              </label>
            )}
            {!["verify", "reset"].includes(mode) && (
              <label className={s.field}>
                {mode === "register" || mode === "forgot"
                  ? "이메일"
                  : "아이디 또는 이메일"}
                <input
                  required
                  type={
                    mode === "register" || mode === "forgot" ? "email" : "text"
                  }
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                />
              </label>
            )}
            {["verify", "reset"].includes(mode) && (
              <label className={s.field}>
                이메일로 받은 코드
                <input
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  autoComplete="one-time-code"
                />
              </label>
            )}
            {mode !== "verify" && mode !== "forgot" && (
              <label className={s.field}>
                비밀번호
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={
                    mode === "register" || mode === "reset"
                      ? "new-password"
                      : "current-password"
                  }
                />
              </label>
            )}
            {needsConsent && (
              <>
                <label className={s.check}>
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                  />
                  <span>
                    만 14세 이상이며{" "}
                    <Link href={url("terms")} target="_blank">
                      이용약관
                    </Link>
                    과{" "}
                    <Link href={url("terms") + "?kind=privacy"} target="_blank">
                      개인정보 처리방침
                    </Link>
                    에 동의합니다.
                  </span>
                </label>
                {p.data?.offline && (
                  <p className={s.notice}>
                    저장된 약관을 표시하고 있습니다. 연결 후 최신 내용을 확인해
                    주세요.
                  </p>
                )}
                {mode === "abrody" && (
                  <p className={s.notice}>
                    연결한 어브로디 계정으로 로그인합니다. 처음 연결하는 경우
                    입력한 계정의 연결에 동의합니다.
                  </p>
                )}
              </>
            )}
            <button
              className={s.primary}
              disabled={busy || (needsConsent && (!consent || !p.data))}
            >
              {busy ? "처리 중" : titles[mode]}
            </button>
          </form>
          <div className={s.actions}>
            {mode === "login" ? (
              <>
                <button onClick={() => change("register")}>회원가입</button>
                <button onClick={() => change("forgot")}>비밀번호 찾기</button>
                <button onClick={() => change("verify")}>이메일 인증</button>
                <button onClick={() => change("abrody")}>
                  연결한 어브로디로 로그인
                </button>
              </>
            ) : (
              <button onClick={() => change("login")}>
                로그인으로 돌아가기
              </button>
            )}
          </div>
          {mode === "verify" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void run(
                  () =>
                    request("/v1/auth/resend", { email: identifier.trim() }),
                  "인증이 필요한 계정이면 메일을 보냈습니다.",
                );
              }}
            >
              <label className={s.field}>
                가입한 이메일
                <input
                  required
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </label>
              <button disabled={busy}>인증 메일 재발송</button>
            </form>
          )}
        </>
      )}
      {status && (
        <p className={s.notice} role="status">
          {status}
        </p>
      )}
      <p className={s.notice}>
        브라우저를 새로고침하면 다시 로그인해야 합니다. 게스트 기록과 계정
        기록은 별도로 보관합니다.
      </p>
    </div>
  );
}
