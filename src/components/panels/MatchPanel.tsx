"use client";

import type { MatchRow } from "@/types";
import { Badge, PanelHeader, strengthTone } from "@/components/ui";

export function MatchPanel({ rows }: { rows: MatchRow[] }) {
  return (
    <div className="panel">
      <PanelHeader
        title="匹配分析"
        description="逐条对照 JD 要求与简历证据，评估证据强度，并给出是否补充与优化建议。"
      />

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th style={{ minWidth: 140 }}>JD 要求</th>
                <th style={{ minWidth: 140 }}>简历证据</th>
                <th>证据强度</th>
                <th>是否补充</th>
                <th style={{ minWidth: 180 }}>优化建议</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.jdRequirement}>
                  <td>{row.jdRequirement}</td>
                  <td>{row.resumeEvidence}</td>
                  <td>
                    <Badge tone={strengthTone(row.strength)}>{row.strength}</Badge>
                  </td>
                  <td>
                    <Badge tone={row.needSupplement ? "warning" : "success"}>
                      {row.needSupplement ? "需补充" : "暂可"}
                    </Badge>
                  </td>
                  <td>{row.suggestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
