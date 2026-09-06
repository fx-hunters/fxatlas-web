import type { AuthSuccessResult } from "../types/auth";

export const INITIAL_SETUP_PATH = "/initial-setup";

export type PostAuthDestination = "home" | "initialSetup";

export function resolvePostAuthDestination(
  result: AuthSuccessResult | void,
): PostAuthDestination {
  if (result?.isDemo === true) {
    return "home";
  }

  return result?.onboarded === false ? "initialSetup" : "home";
}
