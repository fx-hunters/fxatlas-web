import { Card } from "../../components/common/card";
import { Badge } from "../../components/common/badge";
import { ProgressBar } from "../../components/common/progress-bar";
import type { TodayActionData } from "../../types/home";

interface TodayActionCardProps {
  readonly data: TodayActionData;
  readonly onRecordComplete?: () => void;
}

export function TodayActionCard({ data, onRecordComplete }: TodayActionCardProps) {
  return (
    <Card
      title="오늘의 행동 (이번 주 확보액)"
      action={<Badge variant="default">마감일: D-{data.deadlineDday}</Badge>}
      highlight
      className="today-action-card"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: "0.25rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span style={{ fontSize: "2rem", fontWeight: 300, color: "var(--primary)" }}>$</span>
            <span
              style={{
                fontSize: "3.5rem",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "var(--primary)",
                lineHeight: 1,
              }}
            >
              {data.amountUsd.toLocaleString()}
            </span>
          </div>
          <div
            style={{
              fontSize: "0.9375rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              marginTop: "0.5rem",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            약 ₩{data.amountKrw.toLocaleString()}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "var(--text-muted)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span>이번 주 확보율 {Math.round(data.fundedRatio * 100)}%</span>
            <span>남은 회차: {data.remainingRounds}</span>
          </div>
          <ProgressBar ratio={data.fundedRatio} height={8} color="var(--primary)" />
        </div>

        <button
          type="button"
          onClick={onRecordComplete}
          style={{
            marginTop: "0.5rem",
            padding: "0.875rem 1.5rem",
            backgroundColor: "var(--primary)",
            color: "var(--primary-content)",
            borderRadius: "var(--radius-md)",
            fontWeight: 700,
            fontSize: "0.9375rem",
            textAlign: "center",
            boxShadow: "0 4px 10px var(--primary-subtle)",
            transition: "opacity 0.15s ease",
            width: "fit-content",
          }}
        >
          환전 완료 기록
        </button>
      </div>
    </Card>
  );
}
