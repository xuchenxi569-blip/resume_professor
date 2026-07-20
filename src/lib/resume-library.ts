import type { ResumeLibraryItem } from "@/types";

const STORAGE_KEY = "resume-professor-library";

export function loadResumeLibrary(): ResumeLibraryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ResumeLibraryItem[]) : [];
  } catch {
    return [];
  }
}

export function saveResumeLibrary(items: ResumeLibraryItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota or private mode — ignore
  }
}
