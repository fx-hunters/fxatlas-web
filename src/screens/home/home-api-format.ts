export function formatReferenceTime(value: string | undefined): string {
  if (!value) return "기준 시각 미제공";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("ko-KR", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}
