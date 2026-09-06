import { request } from "./client";
import type {
  LoginRequest,
  RefreshRequest,
  SignupRequest,
  TokenResponse,
} from "./generated/divurve-api";
import {
  clearApiSession,
  readApiSession,
  saveApiSession,
  type ApiSession,
  type SessionPersistence,
} from "./session";

async function authenticate(
  path: string,
  body: LoginRequest | SignupRequest | RefreshRequest | undefined,
  persistence: SessionPersistence,
): Promise<ApiSession> {
  const session = await request<TokenResponse>(path, {
    method: "POST",
    body,
    requiresAuth: false,
  });
  saveApiSession(session, persistence);
  return session;
}

export function login(
  input: LoginRequest,
  persistence: SessionPersistence = "session",
): Promise<ApiSession> {
  return authenticate("/api/v1/auth/login", input, persistence);
}

export function signup(
  input: SignupRequest,
  persistence: SessionPersistence = "session",
): Promise<ApiSession> {
  return authenticate("/api/v1/auth/signup", input, persistence);
}

export function startDemoSession(): Promise<ApiSession> {
  return authenticate("/api/v1/auth/demo", undefined, "session");
}

export async function refreshSession(): Promise<ApiSession> {
  const current = readApiSession();
  if (!current) {
    throw new Error("갱신할 API 세션이 없습니다.");
  }
  return authenticate(
    "/api/v1/auth/refresh",
    { refreshToken: current.refreshToken },
    "session",
  );
}

export function logout(): void {
  clearApiSession();
}

export type { LoginRequest, SignupRequest } from "./generated/divurve-api";
