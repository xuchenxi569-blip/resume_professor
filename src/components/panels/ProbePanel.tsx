"use client";

import type { ProbeCard } from "@/types";
import { PanelHeader } from "@/components/ui";

interface Props {
  probes: ProbeCard[];
  onAnswerChange: (id: string, answer: string) => void;
  onGenerateBullet: (id: string) => void;
  onGenerateAll: () => void;
  onNextStep: () => void;
  nextLoading?: boolean;
}

export function ProbePanel({
  probes,
  onAnswerChange,
  onGenerateBullet,
  onGenerateAll,
  onNextStep,
  nextLoading = false,
}: Props) {
  return (
    <div className="panel">
      <PanelHeader
        title="经历追问"
        description="针对证据薄弱点的追问，所有问题均为非必填。填写回答后可生成简历 bullet，完成后点击底部按钮进入简历优化。"
      />

      <div className="row-actions" style={{ marginTop: 0, marginBottom: 12 }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onGenerateAll}
          disabled={nextLoading}
        >
          一键生成全部 bullet
        </button>
      </div>

      <div className="probe-grid">
        {probes.map((p, idx) => (
          <div className="card probe-card" key={p.id}>
            <div className="card-title">
              <span>追问 {idx + 1}</span>
              <span className="badge badge-info">选填</span>
            </div>
            <div className="q">{p.question}</div>
            <div className="why">为何追问：{p.why}</div>
            <div className="field">
              <label>你的回答（选填）</label>
              <textarea
                className="textarea"
                value={p.answer}
                onChange={(e) => onAnswerChange(p.id, e.target.value)}
                placeholder="用事实回答：你做了什么、边界是什么、结果如何…"
                disabled={nextLoading}
              />
            </div>
            <div className="row-actions" style={{ marginTop: 10 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onGenerateBullet(p.id)}
                disabled={nextLoading || !p.answer.trim()}
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

      <div className="probe-next-bar">
        <p className="probe-next-hint">
          追问均为非必填。填好后点击下方进入简历优化；也可全部跳过，系统将基于当前简历与诊断结果生成优化稿。
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={onNextStep}
          disabled={nextLoading}
        >
          {nextLoading ? "正在生成优化简历…" : "下一步：进入简历优化 →"}
        </button>
      </div>
    </div>
  );
}
