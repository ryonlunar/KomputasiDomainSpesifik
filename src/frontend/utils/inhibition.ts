export type InhibitionState = "active" | "partial" | "inhibited";

export function getInhibitionState(level: number): InhibitionState {
  if (level < 0.3) return "active";
  if (level < 0.7) return "partial";
  return "inhibited";
}

export function inhibitionLabel(level: number): string {
  const state = getInhibitionState(level);
  if (state === "active") return "Aktif";
  if (state === "partial") return "Parsial";
  return "Terhambat";
}

export function inhibitionColor(level: number): string {
  const state = getInhibitionState(level);
  if (state === "active") return "#10b981";
  if (state === "partial") return "#f59e0b";
  return "#ef4444";
}

export function inhibitionBadgeClass(level: number): string {
  const state = getInhibitionState(level);
  if (state === "active") return "text-emerald-400 bg-emerald-900/30";
  if (state === "partial") return "text-amber-400 bg-amber-900/30";
  return "text-red-400 bg-red-900/30";
}

export function clampInhibitionLevel(level: number): number {
  return Math.min(Math.max(level, 0), 1);
}
