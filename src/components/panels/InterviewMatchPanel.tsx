"use client";

import type { FitDegree, GapDegree, InterviewMatchResult } from "@/types";
import { Badge, PanelHeader } from "@/components/ui";

function fitTone(degree: FitDegree) {
  if (degree === "高适配") return "strong" as const;
  if (degree === "中适配") return "mid" as const;
  return "weak" as const;
}

function gapTone(degree: GapDegree) {
  if (degree === "严重缺乏") return "missing" as const;
  if (degree === "明显不足") return "warning" as const;
  return "info" as const;
}

export function InterviewMatchPanel({ data }: { data: InterviewMatchResult }) {
  return (
    <div className="panel">
      <PanelHeader
        title="匹配分析"
        description="对照 JD 与简历，列出你适配该岗位的能力点，以及仍缺乏的能力点，并分别按程度排序，便于面试时扬长补短。"
      />

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="card-title" style={{ padding: "16px 18px 12px" }}>
          <span>适配能力点</span>
          <Badge tone="success">按适配程度：高 → 弱</Badge>
        </div>
        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 72 }}>程度</th>
                <th style={{ minWidth: 140 }}>能力点</th>
                <th style={{ minWidth: 160 }}>简历证据</th>
                <th style={{ minWidth: 160 }}>面试建议</th>
              </tr>
            </thead>
            <tbody>
              {data.fitPoints.map((row) => (
                <tr key={row.capability}>
                  <td>
                    <Badge tone={fitTone(row.degree)}>{row.degree}</Badge>
                  </td>
                  <td>{row.capability}</td>
                  <td>{row.evidence}</td>
                  <td>{row.interviewTip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden", marginTop: 12 }}>
        <div className="card-title" style={{ padding: "16px 18px 12px" }}>
          <span>缺乏能力点</span>
          <Badge tone="warning">按缺乏程度：重 → 轻</Badge>
        </div>
        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th style={{ width: 88 }}>程度</th>
                <th style={{ minWidth: 140 }}>能力点</th>
                <th style={{ minWidth: 160 }}>缺口说明</th>
                <th style={{ minWidth: 160 }}>如何补位</th>
              </tr>
            </thead>
            <tbody>
              {data.gapPoints.map((row) => (
                <tr key={row.capability}>
                  <td>
                    <Badge tone={gapTone(row.degree)}>{row.degree}</Badge>
                  </td>
                  <td>{row.capability}</td>
                  <td>{row.gapReason}</td>
                  <td>{row.howToCompensate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
