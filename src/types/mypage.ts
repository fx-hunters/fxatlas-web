export type RiskProfileType = '안정 추구형' | '위험 중립형' | '적극 투자형';

export interface UserProfile {
  readonly name: string;
  readonly email: string;
  readonly riskProfile: RiskProfileType;
  readonly diagnosisDate: string;
}

export type NotificationKey =
  | 'budgetWarning'
  | 'highVolatility'
  | 'opportunityBucket'
  | 'safetyMode';

export interface NotificationOption {
  readonly id: NotificationKey;
  readonly label: string;
}

export interface MyPageSettings {
  readonly bankPreferentialRate: number; // 0 ~ 100 (%)
  readonly notifications: Record<NotificationKey, boolean>;
}
