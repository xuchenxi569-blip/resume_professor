"use client";

import type { OptimizeRow, OptimizeStyle } from "@/types";
import { PanelHeader } from "@/components/ui";

const STYLES: { id: OptimizeStyle; label: string }[] = [
  { id: "default", label: "默认优化" },
  { id: "concise", label: "更简洁" },
  { id: "less_hype", label: "降低夸张" },
  { id: "ai_pm", label: "更偏 AI 产品" },
  { id: "tob_saas", label: "更偏 ToB SaaS" },
];

interface Props {
  rows: OptimizeRow[];
  style: OptimizeStyle;
  customRequirement: string;
  onCustomRequirementChange: (value: string) => void;
  onStyleChange: (style: OptimizeStyle) => void;
  onApplyCustom: () => void;
  ready?: boolean;
  busy?: boolean;
}

export function OptimizePanel({
  rows,
  style,
  customRequirement,
  onCustomRequirementChange,
  onStyleChange,
  onApplyCustom,
  ready = true,
  busy = false,
}: Props) {
  return (
    <div className="panel">
      <PanelHeader
        title="简历优化"
        description="基于经历追问结果生成的修改对照。可切换表达风格，也可填写自定义优化需求后重新生成。"
      />

      {!ready || rows.length === 0 ? (
        <div className="empty-state" style={{ padding: "40px 0" }}>
          <p>尚未生成优化结果。请先在「经历追问」页点击下一步完成优化生成。</p>
        </div>
      ) : (
        <>
          <div className="style-bar">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`btn btn-sm ${style === s.id ? "btn-primary" : "btn-secondary"}`}
                onClick={() => onStyleChange(s.id)}
                disabled={busy}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="card optimize-custom-box">
            <div className="card-title">自定义优化需求</div>
            <div className="field">
              <label>补充你的优化要求（选填）</label>
              <textarea
                className="textarea"
                rows={3}
                value={customRequirement}
                onChange={(e) => onCustomRequirementChange(e.target.value)}
                placeholder="例：突出供应链场景；压缩项目经历到 3 条；弱化工具清单；教育背景放最后…"
                disabled={busy}
              />
            </div>
            <div className="row-actions" style={{ marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onApplyCustom}
                disabled={busy || !customRequirement.trim()}
              >
                {busy ? "优化中…" : "按自定义需求重新优化"}
              </button>
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
                切换风格时也会带上当前自定义需求
              </span>
            </div>
          </div>

          <div className="stack-gap">
            {rows.map((row, idx) => (
              <div className="card" key={row.id}>
                <div className="card-title">优化条目 {idx + 1}</div>
                <div className="compare-grid">
                  <div className="compare-block before">
                    <strong
                      style={{
                        display: "block",
                        fontSize: 11,
                        color: "var(--fg-muted)",
                        marginBottom: 6,
                      }}
                    >
                      修改前
                    </strong>
                    {row.before}
                  </div>
                  <div className="compare-block after">
                    <strong
                      style={{
                        display: "block",
                        fontSize: 11,
                        color: "var(--fg-muted)",
                        marginBottom: 6,
                      }}
                    >
                      修改后
                    </strong>
                    {row.after}
                  </div>
                </div>
                <div className="compare-meta">
                  <div className="meta-box">
                    <strong>修改理由</strong>
                    {row.reason}
                  </div>
                  <div className="meta-box">
                    <strong>风险提示</strong>
                    {row.risk}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
