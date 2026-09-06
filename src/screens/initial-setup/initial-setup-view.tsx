import { Badge } from "../../components/common/badge";
import { Icon } from "../../components/common/icon";
import { ProgressBar } from "../../components/common/progress-bar";
import type {
  InitialSetupActions,
  InitialSetupState,
} from "./initial-setup-types";
import {
  AssetEntryStep,
  ExplanationDomainStep,
  RiskProfileStep,
} from "./initial-setup-steps";

interface InitialSetupViewProps {
  readonly state: InitialSetupState;
  readonly actions: InitialSetupActions;
}

function CurrentStep({
  state,
  actions,
}: InitialSetupViewProps) {
  switch (state.currentStep) {
    case "explanationDomain":
      return (
        <ExplanationDomainStep
          selectedDomain={state.draft.explanationDomain}
          onSelect={actions.selectExplanationDomain}
        />
      );
    case "assets":
      return (
        <AssetEntryStep
          values={state.draft.assets}
          onChange={actions.changeAsset}
        />
      );
    case "riskProfile":
      return <RiskProfileStep />;
  }
}

export function InitialSetupView({ state, actions }: InitialSetupViewProps) {
  const isLastStep = state.currentStepNumber === state.totalSteps;

  return (
    <main className="initial-setup">
      <div className="initial-setup__backdrop" aria-hidden="true" />
      <div className="initial-setup__shell">
        <header className="initial-setup__header">
          <div className="initial-setup__brand" aria-label="DIVURVE">
            <span className="initial-setup__brand-mark" aria-hidden="true">
              D
            </span>
            <span>DIVURVE</span>
          </div>
          <Badge variant="primary">초기 설정</Badge>
        </header>

        <section className="initial-setup__progress" aria-label="초기 설정 진행률">
          <div className="initial-setup__progress-copy">
            <span>내게 맞는 화면 준비</span>
            <strong>
              {state.currentStepNumber} / {state.totalSteps}
            </strong>
          </div>
          <ProgressBar ratio={state.currentStepNumber / state.totalSteps} />
        </section>

        <div
          className="initial-setup__panel"
          key={state.currentStep}
          aria-live="polite"
        >
          <CurrentStep state={state} actions={actions} />
        </div>

        <footer className="initial-setup__actions">
          <button
            className="initial-setup__button initial-setup__button--quiet"
            type="button"
            onClick={actions.skipCurrentStep}
          >
            {isLastStep ? "이 단계 건너뛰고 마치기" : "건너뛰기"}
          </button>
          <div className="initial-setup__action-group">
            <button
              className="initial-setup__button initial-setup__button--secondary"
              type="button"
              onClick={actions.goBack}
              disabled={!state.canGoBack}
            >
              이전
            </button>
            <button
              className="initial-setup__button initial-setup__button--primary"
              type="button"
              onClick={actions.goNext}
              disabled={!state.canContinue}
            >
              <span>{isLastStep ? "초기 설정 마치기" : "다음"}</span>
              {!isLastStep && <Icon name="arrowRight" size={17} />}
            </button>
          </div>
        </footer>
      </div>
    </main>
  );
}
