/**
 * 연결 확인(connectivity-check) API.
 *
 * 프론트·DB 왕복을 검증하기 위한 테스트용 엔드포인트를 감싼다.
 * 백엔드는 응답을 { data, meta } 로 감싸 snake_case로 보내며,
 * 언래핑·표기 변환은 client.ts의 request 래퍼가 담당한다 (AGENTS.md 4·5장).
 */
import { request } from "./client";

/** 서버에 저장된 연결 확인 레코드. (백엔드 created_at → createdAt) */
export interface ConnectivityCheck {
  id: number;
  message: string;
  createdAt: string;
}

/** DB 미접근 liveness 응답. */
export interface HealthPing {
  status: string;
}

/** 저장된 연결 확인 레코드 전체를 조회한다. */
export function fetchConnectivityChecks(): Promise<ConnectivityCheck[]> {
  return request<ConnectivityCheck[]>("/api/v1/connectivity-checks", {
    requiresAuth: false,
  });
}

/** message로 새 연결 확인 레코드를 만들고, 생성된 행을 반환한다. */
export function createConnectivityCheck(
  message: string,
): Promise<ConnectivityCheck> {
  return request<ConnectivityCheck>("/api/v1/connectivity-checks", {
    method: "POST",
    body: { message },
    requiresAuth: false,
  });
}

/** DB를 건드리지 않는 기본 liveness 확인. */
export function fetchHealthPing(): Promise<HealthPing> {
  return request<HealthPing>("/api/v1/health/ping", {
    requiresAuth: false,
  });
}
