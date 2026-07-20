import type { TargetRoleLibraryItem } from "@/types";

export const ROLE_LIBRARY_STORAGE_KEY = "resume-professor-role-library";

/** 与 extension/shared/constants.js 对齐 */
export const EXT_SOURCE = "resume-professor-extension";
export const WEB_SOURCE = "resume-professor-web";

export const EXT_MSG = {
  PING: "RP_EXT_PING",
  PONG: "RP_EXT_PONG",
  GET_ROLES: "RP_EXT_GET_ROLES",
  MERGE_ROLES: "RP_EXT_MERGE_ROLES",
} as const;

export function loadRoleLibrary(): TargetRoleLibraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ROLE_LIBRARY_STORAGE_KEY);
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
    localStorage.setItem(ROLE_LIBRARY_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota or private mode — ignore
  }
}

function urlKey(item: TargetRoleLibraryItem): string | null {
  const note = (item.note || "").replace(/\/$/, "").toLowerCase().trim();
  return note ? `url:${note}` : null;
}

function pairKey(item: TargetRoleLibraryItem): string | null {
  const company = (item.companyName || "").toLowerCase().trim();
  const role = (item.targetRole || "").toLowerCase().trim();
  if (!company && !role) return null;
  return `pair:${company}|${role}`;
}

function isRoleItem(x: unknown): x is TargetRoleLibraryItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.targetRole === "string";
}

/** 按 URL 或「公司+岗位」查找已有条目 id */
function findExistingId(
  items: TargetRoleLibraryItem[],
  incoming: TargetRoleLibraryItem
): string | null {
  const u = urlKey(incoming);
  const p = pairKey(incoming);
  for (const item of items) {
    if (u && urlKey(item) === u) return item.id;
    if (p && pairKey(item) === p) return item.id;
  }
  return null;
}

/**
 * 将插件推送的岗位合并进本地库。
 * 同 URL（note）或「公司+岗位」视为同一条，以 incoming 覆盖字段并保留原 id。
 */
export function mergeRoleLibrary(
  current: TargetRoleLibraryItem[],
  incoming: TargetRoleLibraryItem[]
): { items: TargetRoleLibraryItem[]; added: number; updated: number } {
  const byId = new Map<string, TargetRoleLibraryItem>();
  for (const item of current) {
    if (!isRoleItem(item)) continue;
    byId.set(item.id, item);
  }

  let added = 0;
  let updated = 0;
  const list = Array.from(byId.values());

  for (const raw of incoming) {
    if (!isRoleItem(raw)) continue;
    const existingId = findExistingId(list, raw);
    if (existingId) {
      const prev = byId.get(existingId)!;
      const next: TargetRoleLibraryItem = {
        ...prev,
        ...raw,
        id: prev.id,
        // 保留更完整的 note（来源 URL）
        note: raw.note || prev.note || "",
        updatedAt: raw.updatedAt || prev.updatedAt || new Date().toISOString(),
      };
      const changed =
        prev.targetRole !== next.targetRole ||
        prev.companyName !== next.companyName ||
        prev.jdText !== next.jdText ||
        prev.industry !== next.industry ||
        prev.companyType !== next.companyType ||
        prev.name !== next.name ||
        prev.note !== next.note;
      if (changed) {
        byId.set(existingId, next);
        // 同步 list 引用供后续 findExistingId
        const idx = list.findIndex((x) => x.id === existingId);
        if (idx >= 0) list[idx] = next;
        updated += 1;
      }
    } else {
      const created: TargetRoleLibraryItem = {
        ...raw,
        updatedAt: raw.updatedAt || new Date().toISOString(),
      };
      byId.set(created.id, created);
      list.push(created);
      added += 1;
    }
  }

  const items = Array.from(byId.values()).sort((a, b) =>
    (b.updatedAt || "").localeCompare(a.updatedAt || "")
  );

  return { items, added, updated };
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

/** 向页面注入的 extension bridge 发起同步请求 */
export function requestExtensionSync(): void {
  if (typeof window === "undefined") return;
  window.postMessage({ source: WEB_SOURCE, type: EXT_MSG.PING }, "*");
}
