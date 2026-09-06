import { useState, useEffect, useCallback } from "react";
import { Icon } from "./components/common/icon";

export interface TourStep {
  readonly target?: string;
  readonly tab?: string;
  readonly title: string;
  readonly desc: string;
}

export interface OnboardingTourProps {
  readonly onComplete: () => void;
  readonly onNavigate: (tab: string) => void;
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    title: "DIVURVE에 오신 것을 환영합니다",
    desc: "외화 목표를 위한 지능형 분할 환전 및 리스크 관리 솔루션입니다. 핵심 기능을 빠르게 둘러보실 수 있도록 안내해 드릴게요.",
  },
  {
    target: "tour-home",
    tab: "home",
    title: "홈 대시보드",
    desc: "실시간 시장 요약, 이번 주 권장 환전 행동, 그리고 외화 보유 현황을 한눈에 확인할 수 있는 메인 대시보드입니다.",
  },
  {
    target: "tour-range",
    tab: "range",
    title: "환율 범위 예측",
    desc: "몬테카를로 시뮬레이션 기반의 50% 및 80% 확률 신뢰구간 팬 차트로 환율의 예상 변동 범위를 분석합니다.",
  },
  {
    target: "tour-assets",
    tab: "assets",
    title: "내 자산",
    desc: "보유 중인 외화 포트폴리오의 비중과 손익 구조, 급변 시나리오별 스트레스 테스트를 정밀 진단합니다.",
  },
  {
    target: "tour-planner",
    tab: "planner",
    title: "환전 플래너",
    desc: "목표 외화와 기한에 맞추어 최적의 안전 비율(safeRatio) 기반 분할 매수 일정을 수립하고 추적합니다.",
  },
  {
    target: "tour-mypage",
    tab: "mypage",
    title: "마이페이지",
    desc: "알림 설정, 리스크 선호도, 기본 통화 등 개인화된 외환 관리 환경을 구성할 수 있습니다.",
  },
  {
    target: "tour-theme",
    title: "다크/라이트 모드",
    desc: "언제든 선호하는 화면 테마로 자유롭게 전환하여 편안하게 이용하실 수 있습니다.",
  },
];

const PAD = 10;
const TOOLTIP_W = 296;

export function OnboardingTour({ onComplete, onNavigate }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  const measure = useCallback(() => {
    if (!current?.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${current.target}"]`);
    if (el) {
      setRect(el.getBoundingClientRect());
    } else {
      setRect(null);
    }
  }, [current?.target]);

  useEffect(() => {
    const t = setTimeout(() => {
      measure();
      setMounted(true);
    }, 80);
    return () => clearTimeout(t);
  }, [step, measure]);

  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const goNext = () => {
    if (isLast) {
      onComplete();
      return;
    }
    const next = TOUR_STEPS[step + 1];
    if (next?.tab) {
      onNavigate(next.tab);
    }
    setMounted(false);
    setTimeout(() => {
      setStep((s) => s + 1);
    }, 60);
  };

  const goPrev = () => {
    const prev = TOUR_STEPS[step - 1];
    if (prev?.tab) {
      onNavigate(prev.tab);
    }
    setMounted(false);
    setTimeout(() => {
      setStep((s) => s - 1);
    }, 60);
  };

  // Step 0: 중앙 웰컴 모달
  if (!current?.target || step === 0) {
    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-label="온보딩 웰컴"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 600,
          backgroundColor: "rgba(0, 0, 0, 0.78)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: "460px",
            width: "100%",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--primary-border)",
            borderRadius: "var(--radius-lg)",
            padding: "2.5rem 2rem",
            boxShadow: "0 0 60px rgba(0,255,170,0.15), var(--shadow-lg)",
            textAlign: "center",
            position: "relative",
            zIndex: 602,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(20px) scale(0.97)",
            transition: "transform 0.4s cubic-bezier(0.34,1.2,0.64,1), opacity 0.35s ease",
          }}
        >
          {/* 로고 아이콘 */}
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--primary-subtle)",
              color: "var(--primary)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.25rem",
              boxShadow: "0 0 20px rgba(0,255,170,0.3)",
            }}
          >
            <Icon name="sparkles" size={24} />
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "var(--text)",
              marginBottom: "0.75rem",
              letterSpacing: "-0.02em",
            }}
          >
            {current?.title}
          </h2>

          <p
            style={{
              fontSize: "0.9375rem",
              color: "var(--text-muted)",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            {current?.desc}
          </p>

          {/* 진행 표시 가로 점 바 */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              marginBottom: "2rem",
            }}
          >
            {TOUR_STEPS.map((_, i) => (
              <div
                key={i}
                style={{
                  height: "4px",
                  borderRadius: "2px",
                  width: i === step ? "24px" : "8px",
                  backgroundColor: i === step ? "var(--primary)" : "var(--border)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          {/* 버튼 그룹 */}
          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
            <button
              type="button"
              onClick={onComplete}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                fontWeight: 600,
                transition: "all 0.15s ease",
              }}
            >
              건너뛰기
            </button>

            <button
              type="button"
              onClick={goNext}
              style={{
                padding: "0.625rem 1.75rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--primary)",
                color: "var(--primary-content)",
                fontSize: "0.875rem",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                boxShadow: "0 0 20px rgba(0,255,170,0.35)",
                transition: "all 0.15s ease",
              }}
            >
              <span>투어 시작하기</span>
              <Icon name="arrowRight" size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 1~6: Spotlight + Tooltip Card
  const spot = rect
    ? {
        left: rect.left - PAD,
        top: rect.top - PAD,
        w: rect.width + PAD * 2,
        h: rect.height + PAD * 2,
      }
    : null;

  const winW = window.innerWidth;
  const winH = window.innerHeight;

  // 타겟이 화면 우측 1/3 영역에 있으면 툴팁을 타겟 왼쪽 또는 아래쪽에 배치
  const isRightSide = spot ? spot.left > winW - TOOLTIP_W - 40 : false;
  const tipLeft = spot
    ? isRightSide
      ? spot.left - TOOLTIP_W - 18
      : spot.left + spot.w + 18
    : 100;
  const tipTop = spot ? spot.top + spot.h / 2 : 100;

  const clampedLeft = Math.max(12, Math.min(tipLeft, winW - TOOLTIP_W - 12));
  const clampedTop = Math.max(12, Math.min(tipTop - 80, winH - 240));

  const progress = (step / (TOUR_STEPS.length - 1)) * 100;

  return (
    <>
      {/* 백드롭 (클릭 시 다음 스텝 진행) */}
      <div
        onClick={goNext}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 600,
          pointerEvents: "auto",
        }}
      />

      {/* Spotlight 하이라이트 div */}
      {spot && (
        <div
          style={{
            position: "fixed",
            left: spot.left,
            top: spot.top,
            width: spot.w,
            height: spot.h,
            borderRadius: "var(--radius-md)",
            boxShadow: `
              0 0 0 9999px rgba(0, 0, 0, 0.78),
              0 0 0 2px rgba(0, 255, 170, 0.55),
              0 0 28px rgba(0, 255, 170, 0.22)
            `,
            pointerEvents: "none",
            zIndex: 601,
            opacity: mounted ? 1 : 0,
            transition: `
              left 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              top 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              width 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              height 0.35s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.25s ease
            `,
          }}
        />
      )}

      {/* 툴팁 카드 */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`온보딩 단계 ${step}`}
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          left: clampedLeft,
          top: clampedTop,
          width: TOOLTIP_W,
          backgroundColor: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-lg)",
          padding: "1.25rem",
          boxShadow: "0 12px 36px rgba(0, 0, 0, 0.45), 0 0 24px rgba(0, 255, 170, 0.1)",
          zIndex: 602,
          pointerEvents: "auto",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(8px)",
          transition: "transform 0.25s cubic-bezier(0.34, 1.2, 0.64, 1), opacity 0.25s ease",
        }}
      >
        {/* 방향 화살표 */}
        <div
          style={{
            position: "absolute",
            ...(isRightSide
              ? {
                  right: -7,
                  top: "50%",
                  marginTop: -7,
                  width: 0,
                  height: 0,
                  borderTop: "7px solid transparent",
                  borderBottom: "7px solid transparent",
                  borderLeft: "7px solid var(--surface)",
                }
              : {
                  left: -7,
                  top: "50%",
                  marginTop: -7,
                  width: 0,
                  height: 0,
                  borderTop: "7px solid transparent",
                  borderBottom: "7px solid transparent",
                  borderRight: "7px solid var(--surface)",
                }),
          }}
        />

        {/* 상단 프로그레스 바 */}
        <div
          style={{
            height: "2px",
            backgroundColor: "var(--border)",
            borderRadius: "1px",
            overflow: "hidden",
            marginBottom: "0.75rem",
          }}
        >
          <div
            style={{
              height: "100%",
              backgroundColor: "var(--primary)",
              width: `${progress}%`,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* 스텝 카운터 & 닫기 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.375rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.6875rem",
              fontWeight: 700,
              color: "var(--primary)",
              letterSpacing: "0.05em",
            }}
          >
            STEP {step} / {TOUR_STEPS.length - 1}
          </span>
          <button
            type="button"
            onClick={onComplete}
            aria-label="투어 종료"
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              fontWeight: 600,
            }}
          >
            건너뛰기
          </button>
        </div>

        {/* 제목 & 설명 */}
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "1rem",
            fontWeight: 700,
            color: "var(--text)",
            marginBottom: "0.375rem",
          }}
        >
          {current.title}
        </h3>
        <p
          style={{
            fontSize: "0.8125rem",
            color: "var(--text-muted)",
            lineHeight: 1.5,
            marginBottom: "1rem",
          }}
        >
          {current.desc}
        </p>

        {/* 하단 컨트롤 버튼 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid var(--border-subtle)",
            paddingTop: "0.75rem",
          }}
        >
          <button
            type="button"
            onClick={goPrev}
            disabled={step <= 1}
            style={{
              fontSize: "0.75rem",
              color: step <= 1 ? "var(--border)" : "var(--text-muted)",
              fontWeight: 600,
              cursor: step <= 1 ? "not-allowed" : "pointer",
            }}
          >
            이전
          </button>

          <button
            type="button"
            onClick={goNext}
            style={{
              padding: "0.375rem 0.875rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--primary)",
              color: "var(--primary-content)",
              fontSize: "0.75rem",
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.25rem",
              boxShadow: "0 0 12px rgba(0,255,170,0.3)",
              transition: "all 0.15s ease",
            }}
          >
            <span>{isLast ? "완료" : "다음"}</span>
            <Icon name={isLast ? "check" : "arrowRight"} size={12} />
          </button>
        </div>
      </div>
    </>
  );
}
