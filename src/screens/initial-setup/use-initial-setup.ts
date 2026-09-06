import { useState } from "react";
import type { AssetInputField } from "../../components/assets/asset-input-fields";
import type {
  ExplanationDomain,
  InitialSetupActions,
  InitialSetupDraft,
  InitialSetupState,
  InitialSetupStepId,
  InitialSetupSubmission,
} from "./initial-setup-types";

export const INITIAL_SETUP_STEPS: readonly InitialSetupStepId[] = [
  "explanationDomain",
  "assets",
  "riskProfile",
] as const;

function removeSkippedStep(
  skippedSteps: readonly InitialSetupStepId[],
  step: InitialSetupStepId,
): readonly InitialSetupStepId[] {
  return skippedSteps.filter((skippedStep) => skippedStep !== step);
}

function addSkippedStep(
  skippedSteps: readonly InitialSetupStepId[],
  step: InitialSetupStepId,
): readonly InitialSetupStepId[] {
  return skippedSteps.includes(step) ? skippedSteps : [...skippedSteps, step];
}

function hasAssetEntry(draft: InitialSetupDraft): boolean {
  const assets = draft.assets;
  return Boolean(
    assets?.overseasStocks ||
      assets?.foreignCurrencyDeposits ||
      assets?.krwAssets,
  );
}

function canContinueStep(
  step: InitialSetupStepId,
  draft: InitialSetupDraft,
): boolean {
  switch (step) {
    case "explanationDomain":
      return draft.explanationDomain !== undefined;
    case "assets":
      return hasAssetEntry(draft);
    case "riskProfile":
      return false;
  }
}

export function useInitialSetup(
  onComplete: (submission: InitialSetupSubmission) => void,
): { readonly state: InitialSetupState; readonly actions: InitialSetupActions } {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [draft, setDraft] = useState<InitialSetupDraft>({});
  const [skippedSteps, setSkippedSteps] = useState<
    readonly InitialSetupStepId[]
  >([]);

  const currentStep = INITIAL_SETUP_STEPS[currentStepIndex]!;
  const isLastStep = currentStepIndex === INITIAL_SETUP_STEPS.length - 1;

  const selectExplanationDomain = (domain: ExplanationDomain) => {
    setDraft((current) => ({ ...current, explanationDomain: domain }));
    setSkippedSteps((current) =>
      removeSkippedStep(current, "explanationDomain"),
    );
  };

  const changeAsset = (
    field: AssetInputField,
    value: string | undefined,
  ) => {
    setDraft((current) => ({
      ...current,
      assets: { ...current.assets, [field]: value },
    }));
    setSkippedSteps((current) => removeSkippedStep(current, "assets"));
  };

  const goBack = () => {
    setCurrentStepIndex((current) => Math.max(0, current - 1));
  };

  const goNext = () => {
    if (isLastStep) {
      onComplete({ draft, skippedSteps });
      return;
    }
    setCurrentStepIndex((current) => current + 1);
  };

  const skipCurrentStep = () => {
    const nextSkippedSteps = addSkippedStep(skippedSteps, currentStep);
    setSkippedSteps(nextSkippedSteps);
    if (isLastStep) {
      onComplete({ draft, skippedSteps: nextSkippedSteps });
      return;
    }
    setCurrentStepIndex((current) => current + 1);
  };

  return {
    state: {
      currentStep,
      currentStepNumber: currentStepIndex + 1,
      totalSteps: INITIAL_SETUP_STEPS.length,
      canGoBack: currentStepIndex > 0,
      canContinue: canContinueStep(currentStep, draft),
      draft,
      skippedSteps,
    },
    actions: {
      selectExplanationDomain,
      changeAsset,
      goBack,
      goNext,
      skipCurrentStep,
    },
  };
}
