import { useCallback, useEffect, useState } from "react";
import { ApiError } from "../../api/client";
import type {
  MyPageBundle,
  SettingsResponse,
  SettingsUpdateRequest,
} from "../../api/generated/divurve-api";
import { fetchMyPageBundle, updateSettings } from "../../api/mypage";

export type MyPageApiState =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "success"; readonly data: MyPageBundle };

export type SettingsSaveState =
  | { readonly status: "idle" }
  | { readonly status: "saving" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "saved" };

export interface MyPageApiDependencies {
  readonly load: typeof fetchMyPageBundle;
  readonly saveSettings: typeof updateSettings;
}

const DEFAULT_DEPENDENCIES: MyPageApiDependencies = {
  load: fetchMyPageBundle,
  saveSettings: updateSettings,
};

function messageFrom(error: unknown): string {
  return error instanceof ApiError
    ? error.message
    : "마이페이지 정보를 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.";
}

export function useMyPageApi(
  dependencies: MyPageApiDependencies = DEFAULT_DEPENDENCIES,
) {
  const [state, setState] = useState<MyPageApiState>({ status: "loading" });
  const [saveState, setSaveState] = useState<SettingsSaveState>({
    status: "idle",
  });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isActive = true;
    setState({ status: "loading" });
    void dependencies
      .load()
      .then((data) => {
        if (isActive) setState({ status: "success", data });
      })
      .catch((error: unknown) => {
        if (isActive) setState({ status: "error", message: messageFrom(error) });
      });
    return () => {
      isActive = false;
    };
  }, [dependencies, reloadKey]);

  const saveSettings = useCallback(
    async (input: SettingsUpdateRequest) => {
      setSaveState({ status: "saving" });
      try {
        const settings: SettingsResponse = await dependencies.saveSettings(input);
        setState((current) =>
          current.status === "success"
            ? {
                status: "success",
                data: { ...current.data, settings },
              }
            : current,
        );
        setSaveState({ status: "saved" });
      } catch (error) {
        setSaveState({ status: "error", message: messageFrom(error) });
      }
    },
    [dependencies],
  );

  return {
    state,
    saveState,
    reload: () => setReloadKey((key) => key + 1),
    saveSettings,
  };
}
