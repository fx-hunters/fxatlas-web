import "@testing-library/jest-dom";
import { vi } from "vitest";

// api/client.ts의 resolveApiBaseUrl()은 VITE_API_URL이 없으면 예외를 던진다.
// CI에는 이 값이 주입되지 않으므로 테스트 전역에 더미 오리진을 세워 둔다.
vi.stubEnv("VITE_API_URL", "https://api.test");
