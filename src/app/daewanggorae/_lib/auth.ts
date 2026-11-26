"use client";
import { useSyncExternalStore } from "react";
import { study } from "./store";
import bundled from "./policies.ko.json";
export const API = "https://kr.fcde.app/api/daewanggorae";
export type User = {
  id: string;
  email: string;
  username?: string;
  verified: boolean;
  linked?: boolean;
};
type Session = { user: User; accessToken: string; refreshToken: string };
let session: Session | null = null;
const listeners = new Set<() => void>();
export const useUser = () =>
  useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => session?.user || null,
    () => null,
  );
const notify = () => listeners.forEach((f) => f());
export async function request<T>(
  path: string,
  body?: unknown,
  method = "POST",
  token?: string,
): Promise<T> {
  const c = new AbortController(),
    timer = setTimeout(() => c.abort(), 12000);
  try {
    const r = await fetch(API + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-region": "ap-northeast-2",
        ...(token ? { Authorization: "Bearer " + token } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: c.signal,
    });
    const data =
      r.status === 204 ? undefined : await r.json().catch(() => undefined);
    if (!r.ok)
      throw Object.assign(
        new Error(data?.error?.message || "요청을 처리하지 못했습니다."),
        { status: r.status },
      );
    return data as T;
  } catch (e) {
    if (
      e instanceof TypeError ||
      (e instanceof Error && e.name === "AbortError")
    )
      throw new Error(
        "서버에 연결할 수 없습니다. 로그인 없이 학습은 계속 이용할 수 있습니다.",
      );
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
export type Policies = typeof bundled;
export async function policies() {
  try {
    const p = await request<Policies>("/v1/terms", undefined, "GET");
    if (p.language !== "ko" || !p.terms?.version || !p.privacy?.version)
      throw new Error();
    return { data: p, offline: false };
  } catch {
    return { data: bundled, offline: true };
  }
}
export async function login(
  identifier: string,
  password: string,
  p: Policies,
  abrody = false,
) {
  const next = await request<Session>(
    abrody ? "/v1/auth/abrody" : "/v1/auth/login",
    {
      identifier,
      password,
      consent: {
        terms: p.terms.version,
        privacy: p.privacy.version,
        age14: true,
      },
      ...(abrody ? { linkConsent: true } : {}),
    },
  );
  await study.switchAccount("user:" + next.user.id);
  session = next;
  notify();
}
export async function logout() {
  const old = session;
  session = null;
  notify();
  await study.switchAccount("guest");
  if (old)
    await request("/v1/auth/logout", { refreshToken: old.refreshToken }).catch(
      () => {},
    );
}
let refreshing: Promise<void> | null = null;
export async function authenticated<T>(
  path: string,
  body?: unknown,
  method = "GET",
): Promise<T> {
  if (!session) throw new Error("로그인이 필요합니다.");
  const old = session;
  try {
    return await request<T>(path, body, method, old.accessToken);
  } catch (e) {
    if ((e as { status?: number }).status !== 401) throw e;
    refreshing ||= request<Session>("/v1/auth/refresh", {
      refreshToken: old.refreshToken,
    })
      .then((next) => {
        if (session === old) {
          session = next;
          notify();
        }
      })
      .finally(() => {
        refreshing = null;
      });
    await refreshing;
    if (!session || session.user.id !== old.user.id)
      throw new Error("계정이 변경되었습니다.");
    return request<T>(path, body, method, session.accessToken);
  }
}
export const currentUser = () => session?.user || null;
export async function linkAbrody(identifier: string, password: string) {
  const before = session;
  const user = await authenticated<User>(
    "/v1/account/link",
    { identifier, password, linkConsent: true },
    "POST",
  );
  if (before && session === before) {
    session = { ...before, user };
    notify();
  }
}
export async function unlinkAbrody(password: string) {
  await authenticated("/v1/account/link", { password }, "DELETE");
  await logout();
}
export async function deleteAccount(password: string) {
  await authenticated("/v1/me", { password }, "DELETE");
  await study.erase();
  await logout();
}
