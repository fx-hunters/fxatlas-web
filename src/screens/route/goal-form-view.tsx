import { useState } from "react";
import type { GoalFormData, GoalPurposeType, CurrencyCode, GoalSummary } from "../../types/route";

interface GoalFormViewProps {
  readonly initialGoal?: GoalSummary | null;
  readonly onSubmit: (formData: GoalFormData) => void;
  readonly onCancel: () => void;
  readonly onDelete?: (goalId: string) => void;
}

export function GoalFormView({
  initialGoal,
  onSubmit,
  onCancel,
  onDelete,
}: GoalFormViewProps) {
  const isEditMode = Boolean(initialGoal);

  const [purposeType, setPurposeType] = useState<GoalPurposeType>(
    initialGoal?.isRecurring ? "recurring" : "recurring",
  );
  const [category, setCategory] = useState<string>(
    initialGoal?.category ?? "해외주식 적립",
  );
  const [name, setName] = useState<string>(initialGoal?.name ?? "");
  const [currency, setCurrency] = useState<CurrencyCode>(
    initialGoal?.currency ?? "USD",
  );
  const [targetAmount, setTargetAmount] = useState<string>(
    initialGoal ? String(initialGoal.targetAmount) : "1000",
  );
  const [targetDate, setTargetDate] = useState<string>(
    initialGoal?.targetDate ?? "2026-09-20",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      purposeType,
      category,
      name: name.trim() || (purposeType === "recurring" ? "정기 외화 매수" : "외화 목표"),
      currency,
      targetAmount: Number(targetAmount) || 1000,
      targetDate,
    });
  };

  return (
    <div
      style={{
        maxWidth: "680px",
        margin: "0 auto",
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-lg)",
        padding: "2rem",
        boxShadow: "var(--shadow-lg)",
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          borderBottom: "1px solid var(--border)",
          paddingBottom: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text)" }}>
          {isEditMode ? "목표 수정" : "새 목표 생성"}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          style={{
            fontSize: "0.875rem",
            fontWeight: 600,
            color: "var(--text-muted)",
            transition: "color 0.15s ease",
          }}
        >
          취소
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        {/* 1. 사용 목적 (목적 함수) */}
        <div
          style={{
            backgroundColor: "var(--bg)",
            padding: "1.25rem",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: "1rem",
            }}
          >
            1. 이 외화를 어떻게 쓰나요?{" "}
            <span style={{ fontSize: "0.75rem", fontWeight: 400, color: "var(--text-muted)" }}>
              (목적 함수 결정)
            </span>
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <button
              type="button"
              onClick={() => setPurposeType("recurring")}
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                textAlign: "left",
                border: purposeType === "recurring" ? "2px solid var(--primary)" : "1px solid var(--border)",
                backgroundColor: purposeType === "recurring" ? "var(--primary-subtle)" : "var(--surface)",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
                정기 매수 (반복)
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                매월 일정한 금액 필요
              </div>
            </button>

            <button
              type="button"
              onClick={() => setPurposeType("single")}
              style={{
                padding: "1rem",
                borderRadius: "var(--radius-md)",
                textAlign: "left",
                border: purposeType === "single" ? "2px solid var(--primary)" : "1px solid var(--border)",
                backgroundColor: purposeType === "single" ? "var(--primary-subtle)" : "var(--surface)",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text)" }}>
                특정일 사용 (단건)
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                정해진 날짜에 한 번 필요
              </div>
            </button>
          </div>
        </div>

        {/* 2. 세부 목적 */}
        <div>
          <label
            htmlFor="goal-category"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            2. 세부 목적
          </label>
          <select
            id="goal-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "0.875rem 1rem",
              borderRadius: "var(--radius-md)",
              color: "var(--text)",
              fontWeight: 600,
              outline: "none",
            }}
          >
            <option value="해외주식 적립">해외주식 적립</option>
            <option value="해외 여행 경비">해외 여행 경비</option>
            <option value="유학/송금">유학/송금</option>
            <option value="기타 외화 지출">기타 외화 지출</option>
          </select>
        </div>

        {/* 3. 목표 이름 */}
        <div>
          <label
            htmlFor="goal-name"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            3. 목표 이름
          </label>
          <input
            id="goal-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="예: QQQ 매월 적립"
            style={{
              width: "100%",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "0.875rem 1rem",
              borderRadius: "var(--radius-md)",
              color: "var(--text)",
              fontWeight: 600,
              outline: "none",
            }}
          />
        </div>

        {/* 4. 통화 및 5. 목표 금액 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label
              htmlFor="goal-currency"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: "0.5rem",
              }}
            >
              4. 통화
            </label>
            <select
              id="goal-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              style={{
                width: "100%",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                padding: "0.875rem 1rem",
                borderRadius: "var(--radius-md)",
                color: "var(--text)",
                fontWeight: 700,
                outline: "none",
              }}
            >
              <option value="USD">USD</option>
              <option value="JPY">JPY</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="goal-target-amount"
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                marginBottom: "0.5rem",
              }}
            >
              5. 목표 금액 (외화)
            </label>
            <input
              id="goal-target-amount"
              type="number"
              min="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="1000"
              style={{
                width: "100%",
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                padding: "0.875rem 1rem",
                borderRadius: "var(--radius-md)",
                color: "var(--text)",
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* 6. 다음 매수일 / 목표일 */}
        <div>
          <label
            htmlFor="goal-target-date"
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              marginBottom: "0.5rem",
            }}
          >
            6. {purposeType === "recurring" ? "다음 매수일 (날짜)" : "목표 사용일 (날짜)"}
          </label>
          <input
            id="goal-target-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            style={{
              width: "100%",
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              padding: "0.875rem 1rem",
              borderRadius: "var(--radius-md)",
              color: "var(--text)",
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
              outline: "none",
            }}
          />
        </div>

        {/* 제출 및 부가 액션 버튼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1rem" }}>
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "1rem",
              backgroundColor: "var(--primary)",
              color: "var(--primary-content)",
              fontSize: "1rem",
              fontWeight: 700,
              borderRadius: "var(--radius-md)",
              boxShadow: "0 4px 12px var(--primary-subtle)",
              transition: "all 0.15s ease",
            }}
          >
            {isEditMode ? "목표 수정 저장" : "계획 수립하기"}
          </button>

          {isEditMode && initialGoal && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(initialGoal.id)}
              style={{
                width: "100%",
                padding: "0.75rem",
                backgroundColor: "transparent",
                color: "var(--danger)",
                fontSize: "0.875rem",
                fontWeight: 600,
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--danger-border)",
                transition: "all 0.15s ease",
              }}
            >
              목표 삭제하기
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
