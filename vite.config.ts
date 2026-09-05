/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: { lines: 100, functions: 100, branches: 100, statements: 100 },
      // 측정 대상은 src 소스 코드로 한정 (dist·설정 파일 제외)
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "**/main.tsx",
        "**/api/generated/**",
        "**/*.d.ts",
        // 테스트·셋업 파일
        "**/*.test.*",
        "**/src/test/**",
        // TODO: 아직 구현 전 스텁. 실제 로직이 들어가면 이 제외를 지우고 테스트를 추가한다.
        "**/api/client.ts",
      ],
    },
  },
});
