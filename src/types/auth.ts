/**
 * 인증 직후 화면 전환에 필요한 최소 정보입니다.
 *
 * 현재 배포 API에 `onboarded`가 없을 수 있으므로 optional로 유지합니다.
 * 최신 계약이 확정되면 API 어댑터가 이 형태로 값을 전달합니다.
 */
export interface AuthSuccessResult {
  readonly isDemo?: boolean;
  readonly onboarded?: boolean;
}
