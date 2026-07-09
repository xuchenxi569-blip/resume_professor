"use client";

import type { ProbeCard } from "@/types";
import { PanelHeader } from "@/components/ui";

interface Props {
  probes: ProbeCard[];
  onAnswerChange: (id: string, answer: string) => void;
  onGenerateBullet: (id: string) => void;
  onGenerateAll: () => void;
}

export function ProbePanel({
  probes,
  onAnswerChange,
  onGenerateBullet,
  onGenerateAll,
}: Props) {
  return (
    <div className="panel">
      <PanelHeader
        title="经历追问"
        description="针对证据薄弱点生成追问。填写回答后可生成可用于简历的 bullet。"
      />

      <div className="row-actions" style={{ marginTop: 0, marginBottom: 12 }}>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onGenerateAll}>
          一键生成全部 bullet
        </button>
      </div>

      <div className="probe-grid">
        {probes.map((p, idx) => (
          <div className="card probe-card" key={p.id}>
            <div className="card-title">
              <span>
                追问 {idx + 1}
              </span>
            </div>
            <div className="q">{p.question}</div>
            <div className="why">为何追问：{p.why}</div>
            <div className="field">
              <label>你的回答</label>
              <textarea
                className="textarea"
                value={p.answer}
                onChange={(e) => onAnswerChange(p.id, e.target.value)}
                placeholder="用事实回答：你做了什么、边界是什么、结果如何…"
              />
            </div>
            <div className="row-actions" style={{ marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onGenerateBullet(p.id)}
                disabled={!p.answer.trim()}
              >
                生成简历 bullet
              </button>
            </div>
            {p.generatedBullet ? (
              <div className="bullet-box">{p.generatedBullet}</div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
