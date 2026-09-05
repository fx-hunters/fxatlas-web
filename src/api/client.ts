/**
 * API 클라이언트 단일 진입점.
 *
 * 규칙 (CLAUDE.md 4·5장 참조):
 * - baseURL은 환경변수/설정 파일 한 곳에서만 관리한다. URL 하드코딩 금지.
 * - 백엔드는 /api/v1/... URL 버저닝을 사용한다.
 * - 모든 응답은 { data, meta } 로 감싸져 온다. 여기 래퍼에서만 언래핑한다.
 * - 백엔드 응답 필드는 snake_case로 도착한다. 이 파일 한 곳에서만 camelCase로 변환하고,
 *   이후 컴포넌트·훅에서는 항상 camelCase만 사용한다.
 *
 * TODO(미확정): fetch 래퍼 vs axios 중 하나로 통일 (CLAUDE.md 9장).
 */

// 예: const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export {};
