"use client";

import type { InterviewQA } from "@/types";
import { PanelHeader } from "@/components/ui";

interface Props {
  items: InterviewQA[];
  onAnswerChange: (id: string, answer: string) => void;
  onOptimize: (id: string) => void;
}

export function InterviewSimPanel({ items, onAnswerChange, onOptimize }: Props) {
  return (
    <div className="panel">
      <PanelHeader
        title="面试问答模拟与优化"
        description="逐题作答，生成更结构化、对齐 JD 且控制风险的优化表达与反馈。"
      />

      <div className="stack-gap">
        {items.map((qa, idx) => (
          <div className="card qa-card" key={qa.id}>
            <div className="card-title">模拟题 {idx + 1}</div>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{qa.question}</div>
            <div className="tip">提示：{qa.tip}</div>
            <div className="field">
              <label>你的回答</label>
              <textarea
                className="textarea"
                value={qa.userAnswer}
                onChange={(e) => onAnswerChange(qa.id, e.target.value)}
                placeholder="按你的真实经历作答…"
              />
            </div>
            <div className="row-actions" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onOptimize(qa.id)}
                disabled={!qa.userAnswer.trim()}
              >
                生成优化表达
              </button>
            </div>
            {qa.optimizedAnswer ? (
              <div className="bullet-box">{qa.optimizedAnswer}</div>
            ) : null}
            {qa.feedback ? (
              <div className="meta-box" style={{ whiteSpace: "pre-wrap" }}>
                {qa.feedback}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
