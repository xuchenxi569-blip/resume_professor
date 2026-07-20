"use client";

import { useState } from "react";
import type { ResumeLibraryItem } from "@/types";
import { PanelHeader } from "@/components/ui";

interface Props {
  items: ResumeLibraryItem[];
  onChange: (items: ResumeLibraryItem[]) => void;
  onUse?: (resumeText: string) => void;
  onCopy?: (resumeText: string) => void;
}

function newItem(): ResumeLibraryItem {
  return {
    id: Math.random().toString(36).slice(2),
    name: "未命名简历",
    updatedAt: new Date().toISOString(),
    resumeText: "",
    note: "",
  };
}

type EditorState = { item: ResumeLibraryItem; isNew: boolean } | null;

export function ResumeLibraryPanel({ items, onChange, onUse, onCopy }: Props) {
  const [editor, setEditor] = useState<EditorState>(null);
  const [draft, setDraft] = useState<ResumeLibraryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    const item = newItem();
    setDraft(item);
    setEditor({ item, isNew: true });
  };

  const openEdit = (item: ResumeLibraryItem) => {
    setDraft({ ...item });
    setEditor({ item, isNew: false });
  };

  const saveEditor = () => {
    if (!draft || !editor) return;
    const saved: ResumeLibraryItem = {
      ...draft,
      name: draft.name.trim() || "未命名简历",
      updatedAt: new Date().toISOString(),
    };
    if (editor.isNew) {
      onChange([saved, ...items]);
    } else {
      onChange(items.map((x) => (x.id === saved.id ? saved : x)));
    }
    setEditor(null);
    setDraft(null);
  };

  const cancelEditor = () => {
    setEditor(null);
    setDraft(null);
  };

  const confirmDelete = (id: string) => setDeleteId(id);

  const doDelete = () => {
    if (!deleteId) return;
    onChange(items.filter((x) => x.id !== deleteId));
    setDeleteId(null);
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  return (
    <div className="panel">
      <PanelHeader
        title="简历库"
        description="存放你的原始简历，新建或编辑后可在「输入材料」中直接引用。"
      />

      <div className="row-actions" style={{ marginBottom: 16, marginTop: 0 }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={openNew}>
          + 新建简历
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 0" }}>
          <p>还没有保存的简历，点击「新建简历」开始。</p>
        </div>
      ) : (
        <div className="library-grid">
          {items.map((item) => (
            <div className="library-card" key={item.id}>
              <div className="library-card-header">
                <div className="library-card-name">{item.name}</div>
                <div className="library-card-date">更新：{formatDate(item.updatedAt)}</div>
              </div>
              {item.note && (
                <div className="library-card-note">{item.note}</div>
              )}
              <div className="library-card-preview">
                {item.resumeText
                  ? item.resumeText.slice(0, 120) + (item.resumeText.length > 120 ? "…" : "")
                  : <span style={{ color: "var(--fg-muted)", fontStyle: "italic" }}>（暂无内容）</span>
                }
              </div>
              <div className="library-card-actions">
                {onUse ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onUse(item.resumeText)}
                    disabled={!item.resumeText.trim()}
                  >
                    用于输入
                  </button>
                ) : null}
                {onCopy ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onCopy(item.resumeText)}
                    disabled={!item.resumeText.trim()}
                  >
                    复制
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => openEdit(item)}
                >
                  编辑
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  style={{ color: "var(--danger, #e55)" }}
                  onClick={() => confirmDelete(item.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 编辑弹窗 */}
      {editor && draft && (
        <div className="dialog-backdrop" onClick={cancelEditor}>
          <div
            className="dialog library-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 16 }}>
              {editor.isNew ? "新建简历" : "编辑简历"}
            </h2>

            <div className="field" style={{ marginBottom: 12 }}>
              <label>简历名称</label>
              <input
                className="input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="例：2024 AI 产品经理版本"
              />
            </div>

            <div className="field" style={{ marginBottom: 12 }}>
              <label>备注</label>
              <input
                className="input"
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                placeholder="例：针对飞书投递版"
              />
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label>简历正文</label>
              <textarea
                className="textarea"
                style={{ minHeight: 280 }}
                value={draft.resumeText}
                onChange={(e) => setDraft({ ...draft, resumeText: e.target.value })}
                placeholder="粘贴简历原文（纯文字）…"
              />
            </div>

            <div className="row-actions" style={{ marginTop: 0 }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={saveEditor}>
                保存
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={cancelEditor}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认 */}
      {deleteId && (
        <div className="dialog-backdrop" onClick={() => setDeleteId(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ marginBottom: 12 }}>确认删除？</h2>
            <p style={{ marginBottom: 20, color: "var(--fg-muted)" }}>
              删除后无法恢复。
            </p>
            <div className="row-actions" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn btn-sm"
                style={{ background: "var(--danger, #e55)", color: "#fff" }}
                onClick={doDelete}
              >
                确认删除
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setDeleteId(null)}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
