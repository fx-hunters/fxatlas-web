export type NavTabId =
  | "home"
  | "planner"
  | "assets"
  | "range"
  | "mypage"
  | "connectivity";

export interface NavItem {
  readonly id: NavTabId;
  readonly label: string;
  readonly iconName: "home" | "planner" | "assets" | "range" | "mypage" | "connectivity";
}

export const NAV_ITEMS: readonly NavItem[] = [
  { id: "home", label: "홈", iconName: "home" },
  { id: "planner", label: "환전 플래너", iconName: "planner" },
  { id: "assets", label: "내 자산", iconName: "assets" },
  { id: "range", label: "환율 범위", iconName: "range" },
  { id: "mypage", label: "마이페이지", iconName: "mypage" },
  { id: "connectivity", label: "연결 확인", iconName: "connectivity" },
] as const;
