import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../api/client";
import type {
  SimulateResponse,
  StressResponse,
  XrayBundle,
} from "../../api/generated/divurve-api";
import {
  applyStressScenario,
  fetchXrayBundle,
  simulateDiversification,
} from "../../api/xray";
import { XRAY_STRESS_PRESETS } from "../../api/fixtures/xray-api-scenarios";

export type XrayApiState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "empty" }
  | { readonly status: "success"; readonly data: XrayBundle };

type ActionState<T> =
  | { readonly status: "idle" }
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "success"; readonly data: T };

export interface XrayApiDependencies {
  readonly load: typeof fetchXrayBundle;
  readonly stress: typeof applyStressScenario;
  readonly simulate: typeof simulateDiversification;
}

const DEFAULT_DEPENDENCIES: XrayApiDependencies = {
  load: fetchXrayBundle,
  stress: applyStressScenario,
  simulate: simulateDiversification,
};

function errorMessage(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "자산 분석 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.";
}

export function useXrayApi(
  dependencies: XrayApiDependencies = DEFAULT_DEPENDENCIES,
) {
  const [state, setState] = useState<XrayApiState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);
  const [stressState, setStressState] = useState<ActionState<StressResponse>>({
    status: "idle",
  });
  const [simulationState, setSimulationState] = useState<
    ActionState<SimulateResponse>
  >({ status: "idle" });

  useEffect(() => {
    let isActive = true;
    setState({ status: "loading" });
    void dependencies
      .load()
      .then((data) => {
        if (!isActive) return;
        setState(
          data.overview.exposure.length === 0
            ? { status: "empty" }
            : { status: "success", data },
        );
      })
      .catch((error: unknown) => {
        if (isActive) setState({ status: "error", message: errorMessage(error) });
      });
    return () => {
      isActive = false;
    };
  }, [dependencies, reloadKey]);

  const runStress = useCallback(
    async (presetId: string) => {
      const preset = XRAY_STRESS_PRESETS.find((item) => item.id === presetId);
      if (!preset) return;
      setStressState({ status: "loading" });
      try {
        setStressState({
          status: "success",
          data: await dependencies.stress(preset.request),
        });
      } catch (error) {
        setStressState({ status: "error", message: errorMessage(error) });
      }
    },
    [dependencies],
  );

  const runSimulation = useCallback(
    async (currencyCode: string, deltaShare: number) => {
      setSimulationState({ status: "loading" });
      try {
        setSimulationState({
          status: "success",
          data: await dependencies.simulate({ currencyCode, deltaShare }),
        });
      } catch (error) {
        setSimulationState({ status: "error", message: errorMessage(error) });
      }
    },
    [dependencies],
  );

  return {
    state,
    stressState,
    simulationState,
    reload: () => setReloadKey((key) => key + 1),
    runStress,
    runSimulation,
  };
}
