import type { TargetRoleLibraryItem } from "@/types";

export const ROLE_LIBRARY_STORAGE_KEY = "resume-professor-role-library";
const DELETED_KEYS_STORAGE = "resume-professor-role-library-deleted";

/** 与 extension/shared/constants.js 对齐 */
export const EXT_SOURCE = "resume-professor-extension";
export const WEB_SOURCE = "resume-professor-web";

export const EXT_MSG = {
  PING: "RP_EXT_PING",
  PONG: "RP_EXT_PONG",
  GET_ROLES: "RP_EXT_GET_ROLES",
  MERGE_ROLES: "RP_EXT_MERGE_ROLES",
  DELETE_ROLE: "RP_EXT_DELETE_ROLE",
  REPLACE_ROLES: "RP_EXT_REPLACE_ROLES",
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

function urlKey(item: Pick<TargetRoleLibraryItem, "note">): string | null {
  const note = (item.note || "").replace(/\/$/, "").toLowerCase().trim();
  return note ? `url:${note}` : null;
}

function pairKey(
  item: Pick<TargetRoleLibraryItem, "companyName" | "targetRole">
): string | null {
  const company = (item.companyName || "").toLowerCase().trim();
  const role = (item.targetRole || "").toLowerCase().trim();
  if (!company && !role) return null;
  return `pair:${company}|${role}`;
}

/** 用于墓碑 / 去重的稳定键（优先 URL） */
export function roleIdentityKeys(item: TargetRoleLibraryItem): string[] {
  const keys: string[] = [];
  const u = urlKey(item);
  const p = pairKey(item);
  if (u) keys.push(u);
  if (p) keys.push(p);
  if (item.id) keys.push(`id:${item.id}`);
  return keys;
}

function isRoleItem(x: unknown): x is TargetRoleLibraryItem {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return typeof o.id === "string" && typeof o.targetRole === "string";
}

function loadDeletedKeys(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_KEYS_STORAGE);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return new Set(Array.isArray(parsed) ? (parsed as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveDeletedKeys(keys: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DELETED_KEYS_STORAGE, JSON.stringify([...keys]));
  } catch {
    // ignore
  }
}

/** 用户删除岗位：写入墓碑，防止插件刷新把条目合并回来 */
export function markRolesDeleted(items: TargetRoleLibraryItem[]): void {
  const deleted = loadDeletedKeys();
  for (const item of items) {
    for (const k of roleIdentityKeys(item)) deleted.add(k);
  }
  saveDeletedKeys(deleted);
}

/** 用户主动重新保存某岗位时，清除对应墓碑 */
export function clearRolesDeleted(items: TargetRoleLibraryItem[]): void {
  const deleted = loadDeletedKeys();
  let changed = false;
  for (const item of items) {
    for (const k of roleIdentityKeys(item)) {
      if (deleted.delete(k)) changed = true;
    }
  }
  if (changed) saveDeletedKeys(deleted);
}

function isTombstoned(item: TargetRoleLibraryItem, deleted: Set<string>): boolean {
  return roleIdentityKeys(item).some((k) => deleted.has(k));
}

/**
 * 查找已有条目：
 * - 有相同 URL → 同一条
 * - 不同 URL → 视为不同岗位（即使公司+岗位名相同，避免覆盖）
 * - 仅当 incoming 无 URL 时，才用「公司+岗位」匹配（含匹配无 URL 的手建条目）
 */
export function findExistingId(
  items: TargetRoleLibraryItem[],
  incoming: TargetRoleLibraryItem
): string | null {
  const u = urlKey(incoming);
  const p = pairKey(incoming);

  if (u) {
    for (const item of items) {
      if (urlKey(item) === u) return item.id;
    }
    // 有 URL 的新岗位：只升级「同公司岗位且无来源 URL」的手建条目
    if (p) {
      for (const item of items) {
        if (!urlKey(item) && pairKey(item) === p) return item.id;
      }
    }
    return null;
  }

  if (p) {
    for (const item of items) {
      if (pairKey(item) === p) return item.id;
    }
  }
  return null;
}

export type MergeRoleOptions = {
  /** 默认 true：跳过用户已删除的墓碑条目 */
  respectTombstones?: boolean;
  /** 合并前仅清除这些条目的墓碑（例如用户刚从插件主动保存） */
  clearTombstonesFor?: TargetRoleLibraryItem[];
};

/**
 * 将插件推送的岗位合并进本地库（增量，不整表覆盖）。
 */
export function mergeRoleLibrary(
  current: TargetRoleLibraryItem[],
  incoming: TargetRoleLibraryItem[],
  options?: MergeRoleOptions
): { items: TargetRoleLibraryItem[]; added: number; updated: number } {
  const respectTombstones = options?.respectTombstones !== false;
  if (options?.clearTombstonesFor?.length) {
    clearRolesDeleted(options.clearTombstonesFor.filter(isRoleItem));
  }

  const deleted = respectTombstones ? loadDeletedKeys() : new Set<string>();
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
    if (respectTombstones && isTombstoned(raw, deleted)) continue;

    const existingId = findExistingId(list, raw);
    if (existingId) {
      const prev = byId.get(existingId)!;
      const next: TargetRoleLibraryItem = {
        ...prev,
        ...raw,
        id: prev.id,
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

/** 通知插件删除岗位（与网页删除保持一致） */
export function notifyExtensionDelete(item: TargetRoleLibraryItem): void {
  if (typeof window === "undefined") return;
  window.postMessage(
    {
      source: WEB_SOURCE,
      type: EXT_MSG.DELETE_ROLE,
      payload: {
        id: item.id,
        note: item.note,
        companyName: item.companyName,
        targetRole: item.targetRole,
      },
    },
    "*"
  );
}

/** 把网页岗位库全量写回插件，避免插件侧残留已删条目 */
export function notifyExtensionReplace(items: TargetRoleLibraryItem[]): void {
  if (typeof window === "undefined") return;
  window.postMessage(
    {
      source: WEB_SOURCE,
      type: EXT_MSG.REPLACE_ROLES,
      payload: items,
    },
    "*"
  );
}
