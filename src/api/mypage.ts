import { ApiError, request } from "./client";
import type {
  MyPageBundle,
  NotificationsResponse,
  ProfileResponse,
  RiskProfileResponse,
  SettingsResponse,
  SettingsUpdateRequest,
} from "./generated/divurve-api";

async function fetchRiskProfile(): Promise<RiskProfileResponse | null> {
  try {
    return await request<RiskProfileResponse>("/api/v1/me/risk-profile");
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function fetchMyPageBundle(): Promise<MyPageBundle> {
  const [profile, settings, riskProfile, notifications] = await Promise.all([
    request<ProfileResponse>("/api/v1/me"),
    request<SettingsResponse>("/api/v1/me/settings"),
    fetchRiskProfile(),
    request<NotificationsResponse>("/api/v1/notifications"),
  ]);
  return { profile, settings, riskProfile, notifications };
}

export function updateSettings(
  input: SettingsUpdateRequest,
): Promise<SettingsResponse> {
  return request<SettingsResponse>("/api/v1/me/settings", {
    method: "PUT",
    body: input,
  });
}
