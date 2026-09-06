import { Badge } from "../../components/common/badge";
import { Icon } from "../../components/common/icon";
import { AssetInputFields } from "../../components/assets/asset-input-fields";
import type { AssetInputField } from "../../components/assets/asset-input-fields";
import type {
  ExplanationDomain,
  InitialSetupDraft,
} from "./initial-setup-types";

const EXPLANATION_DOMAIN_OPTIONS: readonly {
  readonly value: ExplanationDomain;
  readonly title: string;
  readonly description: string;
}[] = [
  {
    value: "finance",
    title: "금융·경제",
    description: "시장과 금융 용어를 활용한 설명",
  },
  {
    value: "dev",
    title: "개발·기술",
    description: "구조와 원리를 중심으로 한 설명",
  },
  {
    value: "marketing",
    title: "마케팅·브랜드",
    description: "고객과 흐름을 중심으로 한 설명",
  },
  {
    value: "plain",
    title: "일상적인 설명",
    description: "낯선 용어를 줄인 편안한 설명",
  },
] as const;

// TODO(onboarding-contract): 제품 문서 또는 API fixture에 Q1~Q3의
// questionCode·질문 문구·선택지가 추가되면 이 대기 UI를 실제 문항으로 교체한다.
export const MISSING_RISK_QUESTION_CODES = ["Q1", "Q2", "Q3"] as const;

interface ExplanationDomainStepProps {
  readonly selectedDomain?: ExplanationDomain;
  readonly onSelect: (domain: ExplanationDomain) => void;
}

export function ExplanationDomainStep({
  selectedDomain,
  onSelect,
}: ExplanationDomainStepProps) {
  return (
    <section aria-labelledby="explanation-domain-title">
      <h2
        className="initial-setup__step-title"
        id="explanation-domain-title"
      >
        어떤 분야의 설명이 가장 익숙한가요?
      </h2>
      <p className="initial-setup__step-description">
        같은 내용을 이해하기 편한 표현으로 보여드릴 때 사용합니다.
      </p>
      <div
        className="initial-setup__option-grid"
        role="radiogroup"
        aria-labelledby="explanation-domain-title"
      >
        {EXPLANATION_DOMAIN_OPTIONS.map((option) => (
          <label
            className="initial-setup__choice"
            data-selected={selectedDomain === option.value}
            key={option.value}
          >
            <input
              type="radio"
              name="explanation-domain"
              value={option.value}
              checked={selectedDomain === option.value}
              onChange={() => onSelect(option.value)}
            />
            <span className="initial-setup__choice-mark" aria-hidden="true">
              {selectedDomain === option.value && <Icon name="check" size={14} />}
            </span>
            <span>
              <strong>{option.title}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </div>
    </section>
  );
}

interface AssetEntryStepProps {
  readonly values: InitialSetupDraft["assets"];
  readonly onChange: (
    field: AssetInputField,
    value: string | undefined,
  ) => void;
}

export function AssetEntryStep({ values, onChange }: AssetEntryStepProps) {
  return (
    <section aria-labelledby="asset-entry-title">
      <h2 className="initial-setup__step-title" id="asset-entry-title">
        보유 자산을 알려주세요
      </h2>
      <p className="initial-setup__step-description">
        현재 입력은 화면 안에서만 유지하며 합산하거나 환산하지 않습니다. 단위와
        저장 형식은 최신 API 계약이 확정된 뒤 연결합니다.
      </p>
      <AssetInputFields values={values ?? {}} onChange={onChange} />
    </section>
  );
}

export function RiskProfileStep() {
  return (
    <section aria-labelledby="risk-profile-title">
      <div className="initial-setup__title-row">
        <h2 className="initial-setup__step-title" id="risk-profile-title">
          간편 위험성향 진단
        </h2>
        <Badge variant="warn">문구 연결 대기</Badge>
      </div>
      <p className="initial-setup__step-description">
        Q1~Q3만 이 단계에 표시합니다. 질문과 선택지는 제품 문서 또는 API 계약이
        확정된 뒤 연결됩니다.
      </p>
      <div className="initial-setup__question-placeholders" role="status">
        {MISSING_RISK_QUESTION_CODES.map((questionCode) => (
          <div className="initial-setup__question-placeholder" key={questionCode}>
            <Badge>{questionCode}</Badge>
            <span>질문 문구와 선택지 확정 대기</span>
          </div>
        ))}
      </div>
      <p className="initial-setup__notice">
        프론트에서는 점수나 성향 유형을 계산하지 않습니다. 지금은 이 단계를
        건너뛰어 초기 설정을 마칠 수 있습니다.
      </p>
    </section>
  );
}
