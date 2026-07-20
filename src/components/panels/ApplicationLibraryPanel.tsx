"use client";

import { useMemo, useState } from "react";
import type {
  ApplicationRecord,
  ApplicationStatus,
  ResumeLibraryItem,
  TargetRoleLibraryItem,
} from "@/types";
import { APPLICATION_STATUSES } from "@/types";
import { PanelHeader } from "@/components/ui";

interface Props {
  items: ApplicationRecord[];
  onChange: (items: ApplicationRecord[]) => void;
  roleLibrary: TargetRoleLibraryItem[];
  resumeLibrary: ResumeLibraryItem[];
}

function todayYmd() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function newRecord(): ApplicationRecord {
  return {
    id: Math.random().toString(36).slice(2),
    companyName: "",
    targetRole: "",
    roleLibraryId: "",
    resumeLibraryId: "",
    status: "待投递",
    appliedAt: "",
    note: "",
    updatedAt: new Date().toISOString(),
  };
}

type EditorState = { item: ApplicationRecord; isNew: boolean } | null;

function statusClass(status: ApplicationStatus) {
  if (status === "已录用") return "app-status app-status-success";
  if (status === "已拒绝" || status === "已放弃") return "app-status app-status-muted";
  if (status === "已投递" || status === "笔试中" || status === "面试中")
    return "app-status app-status-info";
  return "app-status";
}

export function ApplicationLibraryPanel({
  items,
  onChange,
  roleLibrary,
  resumeLibrary,
}: Props) {
  const [editor, setEditor] = useState<EditorState>(null);
  const [draft, setDraft] = useState<ApplicationRecord | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const roleMap = useMemo(() => {
    const m = new Map<string, TargetRoleLibraryItem>();
    roleLibrary.forEach((r) => m.set(r.id, r));
    return m;
  }, [roleLibrary]);

  const resumeMap = useMemo(() => {
    const m = new Map<string, ResumeLibraryItem>();
    resumeLibrary.forEach((r) => m.set(r.id, r));
    return m;
  }, [resumeLibrary]);

  const openNew = () => {
    const item = newRecord();
    setDraft(item);
    setEditor({ item, isNew: true });
  };

  const openEdit = (item: ApplicationRecord) => {
    setDraft({ ...item });
    setEditor({ item, isNew: false });
  };

  const applyRoleLink = (roleId: string, base: ApplicationRecord) => {
    const role = roleMap.get(roleId);
    if (!role) {
      return { ...base, roleLibraryId: "" };
    }
    return {
      ...base,
      roleLibraryId: roleId,
      companyName: role.companyName || base.companyName,
      targetRole: role.targetRole || base.targetRole,
    };
  };

  const saveEditor = () => {
    if (!draft || !editor) return;
    const saved: ApplicationRecord = {
      ...draft,
      companyName: draft.companyName.trim(),
      targetRole: draft.targetRole.trim(),
      note: draft.note.trim(),
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

  const patchRow = (id: string, patch: Partial<ApplicationRecord>) => {
    onChange(
      items.map((x) =>
        x.id === id
          ? { ...x, ...patch, updatedAt: new Date().toISOString() }
          : x
      )
    );
  };

  const markApplied = (id: string) => {
    patchRow(id, {
      status: "已投递",
      appliedAt: todayYmd(),
    });
  };

  return (
    <div className="panel">
      <PanelHeader
        title="投递记录库"
        description="以表格跟踪投递进度，可关联目标岗位库与简历库中的条目。"
      />

      <div className="row-actions" style={{ marginBottom: 16, marginTop: 0 }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={openNew}>
          + 新建投递记录
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 0" }}>
          <p>还没有投递记录，点击「新建投递记录」开始跟踪。</p>
        </div>
      ) : (
        <div className="app-table-wrap">
          <table className="app-table">
            <thead>
              <tr>
                <th>公司 / 岗位</th>
                <th>关联岗位库</th>
                <th>关联简历</th>
                <th>进度</th>
                <th>投递时间</th>
                <th>备注</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const role = item.roleLibraryId
                  ? roleMap.get(item.roleLibraryId)
                  : undefined;
                const resume = item.resumeLibraryId
                  ? resumeMap.get(item.resumeLibraryId)
                  : undefined;
                return (
                  <tr key={item.id}>
                    <td>
                      <div className="app-cell-title">
                        {item.companyName || role?.companyName || "（未填公司）"}
                      </div>
                      <div className="app-cell-sub">
                        {item.targetRole || role?.targetRole || "（未填岗位）"}
                      </div>
                    </td>
                    <td>
                      <select
                        className="select app-table-select"
                        value={item.roleLibraryId}
                        onChange={(e) => {
                          const roleId = e.target.value;
                          const roleItem = roleMap.get(roleId);
                          patchRow(item.id, {
                            roleLibraryId: roleId,
                            companyName:
                              roleItem?.companyName || item.companyName,
                            targetRole: roleItem?.targetRole || item.targetRole,
                          });
                        }}
                      >
                        <option value="">未关联</option>
                        {roleLibrary.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="select app-table-select"
                        value={item.resumeLibraryId}
                        onChange={(e) =>
                          patchRow(item.id, { resumeLibraryId: e.target.value })
                        }
                      >
                        <option value="">未关联</option>
                        {resumeLibrary.map((r) => (
                          <option key={r.id} value={r.id}>
                            {r.name}
                          </option>
                        ))}
                      </select>
                      {resume ? (
                        <div className="app-cell-sub">{resume.name}</div>
                      ) : null}
                    </td>
                    <td>
                      <select
                        className={`select app-table-select ${statusClass(item.status)}`}
                        value={item.status}
                        onChange={(e) =>
                          patchRow(item.id, {
                            status: e.target.value as ApplicationStatus,
                          })
                        }
                      >
                        {APPLICATION_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        className="input app-table-input"
                        type="date"
                        value={item.appliedAt}
                        onChange={(e) =>
                          patchRow(item.id, { appliedAt: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <input
                        className="input app-table-input"
                        value={item.note}
                        placeholder="备注…"
                        onChange={(e) =>
                          patchRow(item.id, { note: e.target.value })
                        }
                      />
                    </td>
                    <td>
                      <div className="app-row-actions">
                        {item.status === "待投递" ? (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => markApplied(item.id)}
                          >
                            标记已投递
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
                          onClick={() => setDeleteId(item.id)}
                        >
                          删除
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editor && draft ? (
        <div className="dialog-backdrop" onClick={() => setEditor(null)}>
          <div className="dialog dialog-wide" onClick={(e) => e.stopPropagation()}>
            <h2>{editor.isNew ? "新建投递记录" : "编辑投递记录"}</h2>
            <div className="form-grid">
              <div className="field">
                <label>关联目标岗位库</label>
                <select
                  className="select"
                  value={draft.roleLibraryId}
                  onChange={(e) =>
                    setDraft(applyRoleLink(e.target.value, draft))
                  }
                >
                  <option value="">不关联</option>
                  {roleLibrary.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>关联简历库</label>
                <select
                  className="select"
                  value={draft.resumeLibraryId}
                  onChange={(e) =>
                    setDraft({ ...draft, resumeLibraryId: e.target.value })
                  }
                >
                  <option value="">不关联</option>
                  {resumeLibrary.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>公司</label>
                <input
                  className="input"
                  value={draft.companyName}
                  onChange={(e) =>
                    setDraft({ ...draft, companyName: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label>岗位</label>
                <input
                  className="input"
                  value={draft.targetRole}
                  onChange={(e) =>
                    setDraft({ ...draft, targetRole: e.target.value })
                  }
                />
              </div>
              <div className="field">
                <label>投递进度</label>
                <select
                  className="select"
                  value={draft.status}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      status: e.target.value as ApplicationStatus,
                    })
                  }
                >
                  {APPLICATION_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>投递时间</label>
                <input
                  className="input"
                  type="date"
                  value={draft.appliedAt}
                  onChange={(e) =>
                    setDraft({ ...draft, appliedAt: e.target.value })
                  }
                />
              </div>
              <div className="field" style={{ gridColumn: "1 / -1" }}>
                <label>备注</label>
                <textarea
                  className="textarea"
                  value={draft.note}
                  onChange={(e) => setDraft({ ...draft, note: e.target.value })}
                  placeholder="渠道、内推人、注意事项等…"
                />
              </div>
            </div>
            <div className="row-actions" style={{ marginTop: 16 }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={saveEditor}>
                保存
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditor(null);
                  setDraft(null);
                }}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteId ? (
        <div className="dialog-backdrop" onClick={() => setDeleteId(null)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2>确认删除</h2>
            <p>删除后不可恢复，确定删除这条投递记录吗？</p>
            <div className="row-actions" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  onChange(items.filter((x) => x.id !== deleteId));
                  setDeleteId(null);
                }}
              >
                删除
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
      ) : null}
    </div>
  );
}
