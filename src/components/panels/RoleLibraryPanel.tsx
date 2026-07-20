"use client";

import { useState } from "react";
import type { TargetRoleLibraryItem } from "@/types";
import { PanelHeader } from "@/components/ui";
import { formatRoleLibraryText } from "@/lib/role-library";

interface Props {
  items: TargetRoleLibraryItem[];
  onChange: (items: TargetRoleLibraryItem[]) => void;
  onUse?: (item: TargetRoleLibraryItem) => void;
  onCopy?: (text: string) => void;
}

function newItem(): TargetRoleLibraryItem {
  return {
    id: Math.random().toString(36).slice(2),
    name: "未命名岗位",
    updatedAt: new Date().toISOString(),
    targetRole: "",
    industry: "",
    companyType: "",
    companyName: "",
    jdText: "",
    note: "",
  };
}

type EditorState = { item: TargetRoleLibraryItem; isNew: boolean } | null;

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function RoleLibraryPanel({ items, onChange, onUse, onCopy }: Props) {
  const [editor, setEditor] = useState<EditorState>(null);
  const [draft, setDraft] = useState<TargetRoleLibraryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openNew = () => {
    const item = newItem();
    setDraft(item);
    setEditor({ item, isNew: true });
  };

  const openEdit = (item: TargetRoleLibraryItem) => {
    setDraft({ ...item });
    setEditor({ item, isNew: false });
  };

  const saveEditor = () => {
    if (!draft || !editor) return;
    const saved: TargetRoleLibraryItem = {
      ...draft,
      name:
        draft.name.trim() ||
        draft.targetRole.trim() ||
        "未命名岗位",
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

  const doDelete = () => {
    if (!deleteId) return;
    onChange(items.filter((x) => x.id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="panel">
      <PanelHeader
        title="目标岗位库"
        description="存放目标岗位与 JD，新建或编辑后可在「输入材料」中直接引用。"
      />

      <div className="row-actions" style={{ marginBottom: 16, marginTop: 0 }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={openNew}>
          + 新建岗位
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 0" }}>
          <p>还没有保存的目标岗位，点击「新建岗位」开始。</p>
        </div>
      ) : (
        <div className="library-grid">
          {items.map((item) => (
            <div className="library-card" key={item.id}>
              <div className="library-card-header">
                <div className="library-card-name">{item.name}</div>
                <div className="library-card-date">更新：{formatDate(item.updatedAt)}</div>
              </div>
              {(item.targetRole || item.companyName || item.industry) && (
                <div className="library-card-note">
                  {[item.targetRole, item.companyName || item.companyType, item.industry]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              )}
              {item.note && <div className="library-card-note">{item.note}</div>}
              <div className="library-card-preview">
                {item.jdText
                  ? item.jdText.slice(0, 120) + (item.jdText.length > 120 ? "…" : "")
                  : (
                    <span style={{ color: "var(--fg-muted)", fontStyle: "italic" }}>
                      （暂无 JD）
                    </span>
                  )}
              </div>
              <div className="library-card-actions">
                {onUse ? (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => onUse(item)}
                    disabled={!item.targetRole.trim() && !item.jdText.trim()}
                  >
                    用于输入
                  </button>
                ) : null}
                {onCopy ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => onCopy(formatRoleLibraryText(item))}
                    disabled={!item.jdText.trim() && !item.targetRole.trim()}
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
                  onClick={() => setDeleteId(item.id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editor && draft && (
        <div className="dialog-backdrop" onClick={cancelEditor}>
          <div
            className="dialog library-dialog"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: 16 }}>
              {editor.isNew ? "新建目标岗位" : "编辑目标岗位"}
            </h2>

            <div className="field" style={{ marginBottom: 12 }}>
              <label>条目名称</label>
              <input
                className="input"
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="例：星河智能 · AI 产品经理"
              />
            </div>

            <div className="grid-2" style={{ marginBottom: 12 }}>
              <div className="field">
                <label>目标岗位</label>
                <input
                  className="input"
                  value={draft.targetRole}
                  onChange={(e) => setDraft({ ...draft, targetRole: e.target.value })}
                  placeholder="如：AI 产品经理"
                />
              </div>
              <div className="field">
                <label>行业</label>
                <input
                  className="input"
                  value={draft.industry}
                  onChange={(e) => setDraft({ ...draft, industry: e.target.value })}
                  placeholder="如：企业服务 / AI SaaS"
                />
              </div>
              <div className="field">
                <label>公司类型</label>
                <input
                  className="input"
                  value={draft.companyType}
                  onChange={(e) => setDraft({ ...draft, companyType: e.target.value })}
                  placeholder="如：ToB SaaS 成长期"
                />
              </div>
              <div className="field">
                <label>公司全称</label>
                <input
                  className="input"
                  value={draft.companyName}
                  onChange={(e) => setDraft({ ...draft, companyName: e.target.value })}
                  placeholder="面试前可用"
                />
              </div>
            </div>

            <div className="field" style={{ marginBottom: 12 }}>
              <label>备注</label>
              <input
                className="input"
                value={draft.note}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                placeholder="例：优先投递 / 内推岗位"
              />
            </div>

            <div className="field" style={{ marginBottom: 16 }}>
              <label>岗位 JD</label>
              <textarea
                className="textarea"
                style={{ minHeight: 240 }}
                value={draft.jdText}
                onChange={(e) => setDraft({ ...draft, jdText: e.target.value })}
                placeholder="粘贴完整岗位 JD…"
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
