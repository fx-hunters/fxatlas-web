import "./initial-setup-screen.css";
import type { InitialSetupSubmission } from "./initial-setup-types";
import { InitialSetupView } from "./initial-setup-view";
import { useInitialSetup } from "./use-initial-setup";

interface InitialSetupScreenProps {
  readonly onComplete: (submission: InitialSetupSubmission) => void;
}

export function InitialSetupScreen({ onComplete }: InitialSetupScreenProps) {
  const { state, actions } = useInitialSetup(onComplete);
  return <InitialSetupView state={state} actions={actions} />;
}

export type { InitialSetupSubmission } from "./initial-setup-types";
