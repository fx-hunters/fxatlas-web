import type {
  AssetInputField,
  AssetInputValues,
} from "../../components/assets/asset-input-fields";

export type ExplanationDomain =
  | "finance"
  | "dev"
  | "marketing"
  | "plain";

export type InitialSetupStepId =
  | "explanationDomain"
  | "assets"
  | "riskProfile";

export interface InitialSetupDraft {
  readonly explanationDomain?: ExplanationDomain;
  readonly assets?: AssetInputValues;
}

export interface InitialSetupSubmission {
  readonly draft: InitialSetupDraft;
  readonly skippedSteps: readonly InitialSetupStepId[];
}

export interface InitialSetupState {
  readonly currentStep: InitialSetupStepId;
  readonly currentStepNumber: number;
  readonly totalSteps: number;
  readonly canGoBack: boolean;
  readonly canContinue: boolean;
  readonly draft: InitialSetupDraft;
  readonly skippedSteps: readonly InitialSetupStepId[];
}

export interface InitialSetupActions {
  readonly selectExplanationDomain: (domain: ExplanationDomain) => void;
  readonly changeAsset: (
    field: AssetInputField,
    value: string | undefined,
  ) => void;
  readonly goBack: () => void;
  readonly goNext: () => void;
  readonly skipCurrentStep: () => void;
}
