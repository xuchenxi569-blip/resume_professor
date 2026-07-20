import type { TargetRoleLibraryItem } from "@/types";

const STORAGE_KEY = "resume-professor-role-library";

export function loadRoleLibrary(): TargetRoleLibraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as TargetRoleLibraryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveRoleLibrary(items: TargetRoleLibraryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota or private mode — ignore
  }
}

export function formatRoleLibraryText(item: TargetRoleLibraryItem): string {
  return [
    item.targetRole && `目标岗位：${item.targetRole}`,
    item.industry && `行业：${item.industry}`,
    item.companyType && `公司类型：${item.companyType}`,
    item.companyName && `公司：${item.companyName}`,
    item.jdText && `\n【JD】\n${item.jdText}`,
  ]
    .filter(Boolean)
    .join("\n");
}
