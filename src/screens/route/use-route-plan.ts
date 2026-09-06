import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../api/client";
import {
  loadRoutePlan,
  type RoutePlanLoader,
} from "../../api/route";
import type { RoutePlanData } from "../../types/route";

export type RoutePlanState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "empty" }
  | { readonly status: "success"; readonly data: RoutePlanData };

interface UseRoutePlanResult {
  readonly state: RoutePlanState;
  readonly reload: () => void;
}

function toRouteErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "환전 계획 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.";
}

export function useRoutePlan(
  loader: RoutePlanLoader = loadRoutePlan,
): UseRoutePlanResult {
  const [state, setState] = useState<RoutePlanState>({ status: "loading" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;

    setState({ status: "loading" });

    const load = async () => {
      try {
        const data = await loader();
        if (!isActive) {
          return;
        }

        setState(data === null ? { status: "empty" } : { status: "success", data });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setState({ status: "error", message: toRouteErrorMessage(error) });
      }
    };

    void load();

    return () => {
      isActive = false;
    };
  }, [loader, reloadKey]);

  const reload = useCallback(() => {
    setReloadKey((currentKey) => currentKey + 1);
  }, []);

  return { state, reload };
}
