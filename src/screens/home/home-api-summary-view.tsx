import type { ApiResult } from "../../api/client";
import type { HomeSummaryResponse } from "../../api/generated/divurve-api";
import { Badge } from "../../components/common/badge";
import { Card } from "../../components/common/card";
import { formatReferenceTime } from "./home-api-format";

interface HomeApiSummaryViewProps {
  readonly result: ApiResult<HomeSummaryResponse>;
}

export function HomeApiSummaryView({ result }: HomeApiSummaryViewProps) {
  const { data, meta } = result;
  const referenceTime = data.referenceTime || meta.asOf;

  return (
    <section aria-label="API 홈 요약" style={{ display: "grid", gap: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <Badge variant="primary">Swagger API</Badge>
          <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
            서버가 반환한 홈 요약을 표시합니다.
          </p>
        </div>
        <time style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
          {formatReferenceTime(referenceTime)}
        </time>
      </div>

      <div className="home-dashboard-grid">
        <Card title="오늘의 행동" highlight>
          <strong style={{ color: "var(--primary)", fontSize: "2rem" }}>
            {data.todayAction?.heroAmount || "등록된 행동 없음"}
          </strong>
        </Card>
        <Card title="등록 자산">
          <strong style={{ color: "var(--text)", fontSize: "2rem" }}>
            {data.currencyStatus?.totalAssets ?? 0}건
          </strong>
        </Card>
        <Card title="확인 사항">
          <p style={{ color: "var(--text)", lineHeight: 1.6 }}>
            {data.notice?.message || "확인할 사항이 없습니다."}
          </p>
        </Card>
        <Card title="주간 변화">
          <p style={{ color: "var(--text)", lineHeight: 1.6 }}>
            {data.weeklyChange?.summary || "주간 변화 정보가 없습니다."}
          </p>
        </Card>
        <Card title="시장 요약">
          <p style={{ color: "var(--text)", lineHeight: 1.6 }}>
            {data.marketSummary?.summary || "시장 요약 정보가 없습니다."}
          </p>
        </Card>
      </div>
    </section>
  );
}
