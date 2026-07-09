"use client";

import type { DiagnosisResult } from "@/types";
import { PanelHeader, Progress } from "@/components/ui";

export function DiagnosisPanel({ data }: { data: DiagnosisResult }) {
  return (
    <div className="panel">
      <PanelHeader
        title="简历诊断"
        description="综合匹配度评分、分维度评估，以及主要问题与优先修改建议。"
      />

      <div className="card">
        <div className="score-hero">
          <div>
            <div className="score-number">
              {data.matchScore}
              <span> / 100</span>
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 6 }}>
              与目标 JD 的综合匹配度
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <Progress value={data.matchScore} label="匹配度" right={`${data.matchScore}%`} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">维度评分</div>
        <div className="dim-list">
          {data.dimensions.map((d) => (
            <div key={d.name}>
              <Progress value={d.score} label={d.name} right={`${d.score}`} />
              <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 4 }}>{d.comment}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">主要问题</div>
          <ul className="list-clean">
            {data.mainIssues.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <div className="card-title">优先修改建议</div>
          <ul className="list-clean">
            {data.priorityFixes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
