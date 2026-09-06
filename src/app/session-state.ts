import type { ApiSession } from "../api/session";

/** 계정 종류. BE의 `isDemo` 플래그를 화면이 쓰는 어휘로 옮긴 값이다. */
export type AccountKind = "demo" | "member";

export type SessionState =
  | { readonly status: "bootstrapping" }
  | { readonly status: "ready"; readonly accountKind: AccountKind }
  | { readonly status: "failed"; readonly message: string };

export function toAccountKind(session: ApiSession): AccountKind {
  return session.isDemo ? "demo" : "member";
}
