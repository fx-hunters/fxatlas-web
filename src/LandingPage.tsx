import { useState, useEffect, useRef } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Icon } from "./components/common/icon";

export interface LandingPageProps {
  readonly onEnter: () => void;
  readonly isDark: boolean;
  readonly setIsDark: (v: boolean) => void;
  readonly onLogin?: () => void;
  readonly onSignup?: () => void;
}

export function formatLandingTooltipValue(v: unknown): [string] {
  return [typeof v === "number" ? `₩${v.toLocaleString()}` : String(v)];
}

// 스크롤 진입 애니메이션용 커스텀 훅
export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
        }
      },
      { threshold }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return { ref, inView };
}

// 스파크라인 컴포넌트
interface SparkProps {
  readonly data: readonly { readonly v: number }[];
  readonly color: string;
}

export function Spark({ data, color }: SparkProps) {
  const gradientId = `sg-${color.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div style={{ width: "100%", height: "40px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data as unknown as Record<string, unknown>[]} margin={{ top: 2, right: 0, bottom: 2, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 히어로 팬 차트 목 데이터
const HERO_FAN_DATA = [
  { t: "1월", price: 1312 },
  { t: "2월", price: 1324 },
  { t: "3월", price: 1318 },
  { t: "4월", price: 1335 },
  { t: "5월", price: 1342 },
  { t: "6월", price: 1338 },
  { t: "7월", price: 1350 },
  { t: "8월", price: 1348, p_hi: 1348, p_lo: 1348, p_mid: 1348 },
  { t: "9월", p_hi: 1385, p_lo: 1325, p_mid: 1355 },
  { t: "10월", p_hi: 1410, p_lo: 1310, p_mid: 1362 },
  { t: "11월", p_hi: 1435, p_lo: 1295, p_mid: 1368 },
  { t: "12월", p_hi: 1460, p_lo: 1280, p_mid: 1375 },
];

// 미니 티커 데이터
const TICKER_DATA = [
  {
    code: "USD/KRW",
    name: "미국 달러",
    price: "1,348.50",
    change: "+4.20 (+0.31%)",
    isUp: true,
    color: "var(--usd)",
    spark: [{ v: 1338 }, { v: 1342 }, { v: 1340 }, { v: 1345 }, { v: 1344 }, { v: 1348.5 }],
  },
  {
    code: "JPY/KRW",
    name: "일본 엔 (100엔)",
    price: "892.40",
    change: "-1.80 (-0.20%)",
    isUp: false,
    color: "var(--jpy)",
    spark: [{ v: 898 }, { v: 896 }, { v: 894 }, { v: 895 }, { v: 893 }, { v: 892.4 }],
  },
  {
    code: "EUR/KRW",
    name: "유로",
    price: "1,452.10",
    change: "+2.50 (+0.17%)",
    isUp: true,
    color: "var(--eur)",
    spark: [{ v: 1445 }, { v: 1448 }, { v: 1446 }, { v: 1450 }, { v: 1449 }, { v: 1452.1 }],
  },
];

// 피처 카드 데이터
const FEATURES = [
  {
    id: "forecast",
    icon: "trendingUp" as const,
    title: "몬테카를로 팬 차트 예측",
    eyebrow: "PROBABILISTIC FORECAST",
    desc: "과거 변동성과 거시 경제 지표를 학습한 확률 모델로 50% 및 80% 신뢰구간 환율 범위를 동적으로 산출합니다.",
    tag: "80% 신뢰구간",
  },
  {
    id: "route",
    icon: "planner" as const,
    title: "목표 기반 분할 환전 라우트",
    eyebrow: "SMART ROUTING",
    desc: "단번에 전액을 환전하는 위험을 방지하고, 목표일과 시장 국면에 맞춰 안전 비율(safeRatio) 기반 분할 매수 일정을 수립합니다.",
    tag: "리스크 분산",
  },
  {
    id: "xray",
    icon: "assets" as const,
    title: "외화 자산 리스크 X-Ray",
    eyebrow: "PORTFOLIO DIAGNOSTICS",
    desc: "보유 외화의 손익 구조와 통화별 노출도, 급격한 환율 변동 시나리오에 따른 스트레스 손익을 실시간 진단합니다.",
    tag: "스트레스 테스트",
  },
];

// How it Works 스텝 데이터
const STEPS = [
  {
    num: "01",
    title: "목표 외화 및 기한 설정",
    desc: "여행, 유학, 투자 등 필요한 외화 통화와 수량, 최종 필요 시점을 입력합니다.",
    details: ["통화 선택 (USD / JPY / EUR)", "목표 금액 및 기한 입력", "환전 목적별 예산 배정"],
  },
  {
    num: "02",
    title: "몬테카를로 확률 범위 분석",
    desc: "엔진이 수만 번의 시뮬레이션을 수행해 기한 내 환율의 예상 경로와 상·하단 범위를 계산합니다.",
    details: ["50% 및 80% 신뢰구간 도출", "단기·중기 변동성 백분위 측정", "시장 거시 동인 실시간 반영"],
  },
  {
    num: "03",
    title: "스마트 분할 환전 경로 생성",
    desc: "안전 비율과 유리한 환율 구간에 맞추어 최적의 분할 매수 타이밍과 회차별 추천 수량을 수립합니다.",
    details: ["시장 국면별 safeRatio 조정", "회차별 목표 매수가 제안", "평균 매입 단가 방어 최적화"],
  },
  {
    num: "04",
    title: "실시간 모니터링 & 자산 보호",
    desc: "환율 급변 시 즉각적인 알림과 함께 포트폴리오의 리스크 노출도를 지속적으로 추적 관리합니다.",
    details: ["급변 구간 알림 시스템", "포트폴리오 스트레스 진단", "완료 시점 성과 리포트"],
  },
];

// 통계 데이터
const STATS = [
  { label: "목표 환전 단가 방어율", value: "94.8%", sub: "랜덤워크 대비 평균 +3.8%" },
  { label: "시뮬레이션 누적 연산", value: "1,200만+", sub: "몬테카를로 시나리오 경로" },
  { label: "리스크 노출 방어 효율", value: "4.2배", sub: "일시 환전 대비 손실 완충" },
  { label: "실시간 업데이트 지연", value: "< 0.1s", sub: "초저지연 데이터 파이프라인" },
];

export function LandingPage({ onEnter, isDark, setIsDark, onLogin, onSignup }: LandingPageProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const handleLoginClick = onLogin ?? onEnter;
  const handleSignupClick = onSignup ?? onEnter;

  // 섹션별 useInView 설정
  const etymologySection = useInView(0.2);
  const statsSection = useInView(0.15);
  const featuresSection = useInView(0.15);
  const stepsSection = useInView(0.15);
  const ctaSection = useInView(0.15);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-sans)",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      {/* 배경 장식 그리드 & 라디얼 글로우 */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "900px",
          backgroundImage: `
            linear-gradient(to right, var(--border) 1px, transparent 1px),
            linear-gradient(to bottom, var(--border) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          opacity: 0.25,
          pointerEvents: "none",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 20%, black 40%, transparent 85%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "-150px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1000px",
          height: "600px",
          background: "radial-gradient(ellipse 70% 50% at 50% 40%, rgba(0,255,170,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* --- 네비게이션 헤더 --- */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          backgroundColor: isDark ? "rgba(5, 5, 5, 0.75)" : "rgba(242, 245, 247, 0.75)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "1rem 1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* 로고 */}
          <div
            onClick={onEnter}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onEnter();
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "var(--radius-sm)",
                backgroundColor: "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--primary-content)",
                fontWeight: 900,
                fontSize: "1rem",
                boxShadow: "0 0 16px rgba(0,255,170,0.4)",
              }}
            >
              D
            </div>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "1.25rem",
                letterSpacing: "-0.03em",
                color: "var(--text)",
              }}
            >
              DIVURVE
            </span>
          </div>

          {/* 중앙 네비 메뉴 */}
          <nav className="landing-nav">
            <a href="#features" style={{ transition: "color 0.15s ease" }}>
              기능
            </a>
            <a href="#etymology" style={{ transition: "color 0.15s ease" }}>
              어원
            </a>
            <a href="#how-it-works" style={{ transition: "color 0.15s ease" }}>
              작동 방식
            </a>
            <a href="#stats" style={{ transition: "color 0.15s ease" }}>
              성과 지표
            </a>
          </nav>

          {/* 우측 컨트롤 바 (테마 토글 & 로그인 & 무료 시작 CTA) */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <button
              type="button"
              onClick={() => setIsDark(!isDark)}
              aria-label="테마 전환"
              style={{
                padding: "0.5rem",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
            >
              <Icon name={isDark ? "sun" : "moon"} size={16} />
            </button>

            <button
              type="button"
              onClick={handleLoginClick}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: "transparent",
                border: "1px solid var(--border)",
                color: "var(--text)",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
                fontSize: "0.875rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              로그인
            </button>

            <button
              type="button"
              onClick={handleSignupClick}
              style={{
                padding: "0.5rem 1.25rem",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--primary)",
                color: "var(--primary-content)",
                fontFamily: "var(--font-sans)",
                fontWeight: 700,
                fontSize: "0.875rem",
                boxShadow: "0 0 20px rgba(0,255,170,0.3)",
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                transition: "all 0.15s ease",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "0.9";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.transform = "none";
              }}
            >
              <span>무료 시작</span>
              <Icon name="arrowRight" size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* --- 히어로 섹션 --- */}
      <section
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "5rem 1.5rem 4rem 1.5rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Eyebrow 뱃지 */}
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--primary)",
            backgroundColor: "var(--primary-subtle)",
            border: "1px solid var(--primary-border)",
            borderRadius: "var(--radius-full)",
            padding: "0.375rem 1rem",
            marginBottom: "1.5rem",
            letterSpacing: "0.05em",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            boxShadow: "0 0 16px rgba(0,255,170,0.15)",
          }}
        >
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--primary)" }} />
          <span>AI 기반 외화 분할 환전 & 리스크 엔진</span>
        </div>

        {/* 메인 헤드라인 */}
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: "clamp(2.25rem, 5vw, 3.75rem)",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "var(--text)",
            maxWidth: "900px",
            marginBottom: "1.5rem",
          }}
        >
          외화 목표를 위한 <br />
          <span
            style={{
              background: "linear-gradient(90deg, var(--primary) 0%, #00c8ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            가장 지능적인 환전 타이밍
          </span>
        </h1>

        {/* 서브 설명문 */}
        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--text-muted)",
            maxWidth: "680px",
            lineHeight: 1.6,
            marginBottom: "2.5rem",
          }}
        >
          단순한 환율 조회가 아닌, 몬테카를로 시뮬레이션 기반의 <strong>환율 범위 예측</strong>과
          맞춤형 <strong>분할 환전 경로</strong>를 제안하여 환리스크를 방어합니다.
        </p>

        {/* CTA 버튼 그룹 */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "center",
            marginBottom: "3.5rem",
          }}
        >
          <button
            type="button"
            onClick={onEnter}
            style={{
              padding: "0.875rem 2rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--primary)",
              color: "var(--primary-content)",
              fontWeight: 700,
              fontSize: "1rem",
              boxShadow: "0 0 30px rgba(0,255,170,0.35)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02) translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 0 40px rgba(0,255,170,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 0 30px rgba(0,255,170,0.35)";
            }}
          >
            <span>대시보드 체험하기</span>
            <Icon name="arrowRight" size={16} />
          </button>

          <a
            href="#features"
            style={{
              padding: "0.875rem 1.75rem",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontWeight: 600,
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <span>기능 살펴보기</span>
            <Icon name="sparkles" size={16} />
          </a>
        </div>

        {/* 미니 실시간 환율 티커 카드 3종 */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
            width: "100%",
            maxWidth: "960px",
            marginBottom: "3rem",
          }}
        >
          {TICKER_DATA.map((t) => (
            <div
              key={t.code}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "1rem 1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
                textAlign: "left",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "0.875rem", color: t.color }}>
                    {t.code}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{t.name}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: "1.125rem", color: "var(--text)", fontVariantNumeric: "tabular-nums" }}>
                    ₩{t.price}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      color: t.isUp ? "var(--normal)" : "var(--danger)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {t.change}
                  </div>
                </div>
              </div>
              <Spark data={t.spark} color={t.color} />
            </div>
          ))}
        </div>

        {/* 히어로 팬 차트 데모 카드 (메인 비주얼) */}
        <div
          style={{
            width: "100%",
            maxWidth: "1000px",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-lg)",
            padding: "1.5rem",
            boxShadow: "0 0 80px rgba(0,255,170,0.08), 0 24px 64px rgba(0,0,0,0.5)",
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              borderBottom: "1px solid var(--border-subtle)",
              paddingBottom: "0.75rem",
            }}
          >
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)" }}>
                LIVE PREVIEW
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.125rem", fontWeight: 700, color: "var(--text)" }}>
                USD/KRW 80% 신뢰구간 팬 차트
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--primary)" }} />
                실제 환율
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <span style={{ width: "8px", height: "2px", backgroundColor: "var(--primary)" }} />
                투영 경로
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                <span style={{ width: "8px", height: "8px", backgroundColor: "rgba(0,255,170,0.2)", borderRadius: "2px" }} />
                80% 신뢰밴드
              </span>
            </div>
          </div>

          <div style={{ width: "100%", height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={HERO_FAN_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="hero-price-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" stroke="var(--text-muted)" tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
                <YAxis domain={["dataMin - 20", "dataMax + 20"]} stroke="var(--text-muted)" tick={{ fontSize: 12, fill: "var(--text-muted)" }} hide />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--surface)",
                    borderColor: "var(--border)",
                    color: "var(--text)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={formatLandingTooltipValue}
                />
                <Area dataKey="p_hi" fill="rgba(0,255,170,0.07)" stroke="none" />
                <Area dataKey="p_lo" fill="var(--bg)" stroke="none" />
                <Area dataKey="price" stroke="var(--primary)" strokeWidth={2} fill="url(#hero-price-gradient)" dot={false} />
                <Line dataKey="p_mid" stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* --- 어원(Etymology) 섹션 --- */}
      <section
        id="etymology"
        ref={etymologySection.ref}
        style={{
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "6rem 1.5rem",
          textAlign: "center",
          opacity: etymologySection.inView ? 1 : 0,
          transform: etymologySection.inView ? "none" : "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.75rem",
            fontWeight: 700,
            color: "var(--primary)",
            marginBottom: "0.75rem",
            letterSpacing: "0.05em",
          }}
        >
          NAME ORIGIN
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "2rem",
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: "3rem",
          }}
        >
          DIVURVE의 의미
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
            marginBottom: "2.5rem",
          }}
        >
          {/* DIVISA 블록 */}
          <div
            style={{
              flex: "1 1 240px",
              maxWidth: "280px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.75rem 1.5rem",
              boxShadow: "var(--shadow-sm)",
              transform: etymologySection.inView ? "none" : "translateX(-24px)",
              transition: "transform 0.7s ease 0.1s, opacity 0.7s ease 0.1s",
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, color: "var(--primary)", marginBottom: "0.5rem" }}>
              DIVISA
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
              스페인어로 <strong>외화·외환</strong>을 의미하며 목표 달성을 위한 외화 자산을 상징합니다.
            </div>
          </div>

          {/* + 기호 */}
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 800,
              color: "var(--text-muted)",
              opacity: etymologySection.inView ? 1 : 0,
              transition: "opacity 0.5s ease 0.25s",
            }}
          >
            +
          </div>

          {/* CURVE 블록 */}
          <div
            style={{
              flex: "1 1 240px",
              maxWidth: "280px",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              padding: "1.75rem 1.5rem",
              boxShadow: "var(--shadow-sm)",
              transform: etymologySection.inView ? "none" : "translateX(24px)",
              transition: "transform 0.7s ease 0.1s, opacity 0.7s ease 0.1s",
            }}
          >
            <div style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", fontWeight: 800, color: "#00c8ff", marginBottom: "0.5rem" }}>
              CURVE
            </div>
            <div style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
              확률적 <strong>환율 곡선</strong>과 변동성 궤적을 분석하는 예측 엔진을 뜻합니다.
            </div>
          </div>
        </div>

        {/* = DIVURVE 결과 행 */}
        <div
          style={{
            transform: etymologySection.inView ? "none" : "translateY(12px)",
            opacity: etymologySection.inView ? 1 : 0,
            transition: "all 0.6s ease 0.4s",
            display: "inline-block",
            padding: "1rem 2.5rem",
            borderRadius: "var(--radius-lg)",
            backgroundColor: "var(--surface)",
            border: "1px solid var(--primary-border)",
            boxShadow: "0 0 30px rgba(0,255,170,0.1)",
          }}
        >
          <span style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-muted)", marginRight: "0.75rem" }}>
            =
          </span>
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2rem",
              fontWeight: 900,
              letterSpacing: "-0.02em",
              background: "linear-gradient(90deg, var(--primary) 0%, #00c8ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            DIVURVE
          </span>
          <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            외화(Divisa)의 흐름과 확률 궤적(Curve)을 결합한 스마트 외환 플래너
          </p>
        </div>
      </section>

      {/* --- 주요 기능(Features) 섹션 --- */}
      <section
        id="features"
        ref={featuresSection.ref}
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "5rem 1.5rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--primary)",
              marginBottom: "0.5rem",
              letterSpacing: "0.05em",
            }}
          >
            CORE CAPABILITIES
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.25rem",
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            불확실한 환율 시장의 3대 솔루션
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
            gap: "1.5rem",
          }}
        >
          {FEATURES.map((feat, i) => (
            <div
              key={feat.id}
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-lg)",
                padding: "2rem",
                boxShadow: "var(--shadow-sm)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                opacity: featuresSection.inView ? 1 : 0,
                transform: featuresSection.inView ? "none" : "translateY(24px)",
                transition: `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s, border-color 0.2s ease, box-shadow 0.2s ease`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.boxShadow = "0 0 30px rgba(0,255,170,0.1), var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "var(--shadow-sm)";
              }}
            >
              <div>
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "var(--primary-subtle)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.25rem",
                  }}
                >
                  <Icon name={feat.icon} size={24} />
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "var(--primary)",
                    marginBottom: "0.375rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  {feat.eyebrow}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {feat.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>

              <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-subtle)" }}>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    padding: "0.25rem 0.625rem",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--surface-hover)",
                    color: "var(--text-muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  {feat.tag}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- 작동 방식(How it Works) 섹션 --- */}
      <section
        id="how-it-works"
        ref={stepsSection.ref}
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "5rem 1.5rem",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "var(--primary)",
              marginBottom: "0.5rem",
              letterSpacing: "0.05em",
            }}
          >
            STEP BY STEP
          </div>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "2.25rem",
              fontWeight: 800,
              color: "var(--text)",
            }}
          >
            환전 목표를 달성하는 4단계 흐름
          </h2>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {STEPS.map((step, i) => {
            const isHovered = hoveredStep === i;
            return (
              <div
                key={step.num}
                onMouseEnter={() => setHoveredStep(i)}
                onMouseLeave={() => setHoveredStep(null)}
                style={{
                  backgroundColor: isHovered ? "rgba(0,255,170,0.04)" : "var(--surface)",
                  border: `1px solid ${isHovered ? "rgba(0,255,170,0.35)" : "var(--border)"}`,
                  borderRadius: "var(--radius-lg)",
                  padding: "2rem 1.5rem",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: isHovered
                    ? "0 0 40px rgba(0,255,170,0.08), 0 8px 32px rgba(0,0,0,0.2)"
                    : "var(--shadow-sm)",
                  opacity: stepsSection.inView ? 1 : 0,
                  transform: stepsSection.inView
                    ? isHovered
                      ? "translateY(-6px)"
                      : "none"
                    : "translateY(20px)",
                  transition: `
                    opacity 0.5s ease ${i * 0.1}s,
                    transform 0.35s cubic-bezier(0.34,1.56,0.64,1),
                    border-color 0.25s ease,
                    background 0.25s ease,
                    box-shadow 0.25s ease
                  `,
                }}
              >
                {/* 단계 번호 */}
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    color: isHovered ? "var(--primary)" : "var(--border)",
                    textShadow: isHovered ? "0 0 12px rgba(0,255,170,0.5)" : "none",
                    marginBottom: "0.75rem",
                    transition: "color 0.25s ease, text-shadow 0.25s ease",
                  }}
                >
                  {step.num}
                </div>

                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    color: "var(--text)",
                    marginBottom: "0.5rem",
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
                  {step.desc}
                </p>

                {/* 세부 항목 펼침 리스트 */}
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: isHovered ? "120px" : "0px",
                    opacity: isHovered ? 1 : 0,
                    transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease",
                    marginTop: isHovered ? "1rem" : 0,
                  }}
                >
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    {step.details.map((d) => (
                      <li key={d} style={{ fontSize: "0.75rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "var(--primary)" }} />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 하단 accent 라인 */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    height: "2px",
                    backgroundColor: "var(--primary)",
                    width: isHovered ? "100%" : "0%",
                    transition: "width 0.35s cubic-bezier(0.4,0,0.2,1)",
                  }}
                />
              </div>
            );
          })}
        </div>
      </section>

      {/* --- 성과 통계(Stats) 섹션 --- */}
      <section
        id="stats"
        ref={statsSection.ref}
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "5rem 1.5rem",
          borderTop: "1px solid var(--border-subtle)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "2rem",
            textAlign: "center",
          }}
        >
          {STATS.map((st, i) => (
            <div
              key={st.label}
              style={{
                opacity: statsSection.inView ? 1 : 0,
                transform: statsSection.inView ? "none" : "translateY(16px)",
                transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
                  fontWeight: 800,
                  color: "var(--primary)",
                  letterSpacing: "-0.03em",
                  marginBottom: "0.375rem",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {st.value}
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text)", marginBottom: "0.25rem" }}>
                {st.label}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {st.sub}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- 하단 CTA 섹션 --- */}
      <section
        ref={ctaSection.ref}
        style={{
          maxWidth: "960px",
          margin: "0 auto 6rem auto",
          padding: "4rem 2rem",
          backgroundColor: "var(--surface)",
          border: "1px solid var(--primary-border)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "0 0 60px rgba(0,255,170,0.1), var(--shadow-md)",
          textAlign: "center",
          opacity: ctaSection.inView ? 1 : 0,
          transform: ctaSection.inView ? "none" : "translateY(24px)",
          transition: "opacity 0.6s ease, transform 0.6s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: "linear-gradient(90deg, transparent, var(--primary), transparent)",
          }}
        />

        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)",
            fontWeight: 800,
            color: "var(--text)",
            marginBottom: "1rem",
            letterSpacing: "-0.02em",
          }}
        >
          지능형 외화 환전 관리를 시작하세요
        </h2>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--text-muted)",
            maxWidth: "540px",
            margin: "0 auto 2.5rem auto",
            lineHeight: 1.6,
          }}
        >
          복잡한 환율 예측과 리스크 분석은 DIVURVE 엔진에 맡기고, 여러분의 소중한 외화 목표를 가장 효율적으로 달성해보세요.
        </p>

        <button
          type="button"
          onClick={onEnter}
          style={{
            padding: "0.875rem 2.5rem",
            borderRadius: "var(--radius-full)",
            backgroundColor: "var(--primary)",
            color: "var(--primary-content)",
            fontWeight: 700,
            fontSize: "1.0625rem",
            boxShadow: "0 0 30px rgba(0,255,170,0.4)",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.03) translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 0 45px rgba(0,255,170,0.6)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "0 0 30px rgba(0,255,170,0.4)";
          }}
        >
          <span>대시보드로 바로가기</span>
          <Icon name="arrowRight" size={18} />
        </button>
      </section>

      {/* --- 푸터 --- */}
      <footer
        style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "3rem 1.5rem 2rem 1.5rem",
          backgroundColor: isDark ? "rgba(5,5,5,0.8)" : "var(--surface)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: "1.125rem",
                  color: "var(--text)",
                }}
              >
                DIVURVE
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                AI FX Route & Risk Engine
              </span>
            </div>
            <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              © 2026 DIVURVE. All rights reserved.
            </div>
          </div>

          <div
            style={{
              fontSize: "0.6875rem",
              color: "var(--text-muted)",
              lineHeight: 1.5,
              borderTop: "1px solid var(--border-subtle)",
              paddingTop: "1rem",
            }}
          >
            ⚠️ 본 서비스에서 제공하는 시뮬레이션 결과 및 지표는 몬테카를로 통계 모형에 기반한 참고 정보이며, 특정 금융 상품에 대한 투자 권유나 수익을 보장하지 않습니다.
          </div>
        </div>
      </footer>
    </div>
  );
}
