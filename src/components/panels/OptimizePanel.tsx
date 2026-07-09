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
  onStyleChange: (style: OptimizeStyle) => void;
}

export function OptimizePanel({ rows, style, onStyleChange }: Props) {
  return (
    <div className="panel">
      <PanelHeader
        title="简历优化"
        description="对照修改前 / 修改后，并说明修改理由与风险提示。可切换不同表达风格重新生成。"
      />

      <div className="style-bar">
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`btn btn-sm ${style === s.id ? "btn-primary" : "btn-secondary"}`}
            onClick={() => onStyleChange(s.id)}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="stack-gap">
        {rows.map((row, idx) => (
          <div className="card" key={row.id}>
            <div className="card-title">优化条目 {idx + 1}</div>
            <div className="compare-grid">
              <div className="compare-block before">
                <strong style={{ display: "block", fontSize: 11, color: "var(--fg-muted)", marginBottom: 6 }}>
                  修改前
                </strong>
                {row.before}
              </div>
              <div className="compare-block after">
                <strong style={{ display: "block", fontSize: 11, color: "var(--fg-muted)", marginBottom: 6 }}>
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
    </div>
  );
}
