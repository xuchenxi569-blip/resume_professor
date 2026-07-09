"use client";

import type { JDParseResult } from "@/types";
import { Badge, PanelHeader } from "@/components/ui";

export function JdParsePanel({ data }: { data: JDParseResult }) {
  return (
    <div className="panel">
      <PanelHeader
        title="JD 解析"
        description="拆解职责、硬性/隐性要求、关键词与理想候选人画像，并输出核心能力表。"
      />

      <div className="grid-2">
        <div className="card">
          <div className="card-title">岗位职责</div>
          <ul className="list-clean">
            {data.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <div className="card-title">硬性要求</div>
          <ul className="list-clean">
            {data.hardRequirements.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-title">隐性要求</div>
        <ul className="list-clean">
          {data.softRequirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="card-title">关键词</div>
        <div className="keyword-row">
          {data.keywords.map((k) => (
            <Badge key={k}>{k}</Badge>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title">理想候选人</div>
        <p style={{ fontSize: 13, lineHeight: 1.65 }}>{data.idealCandidate}</p>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="card-title" style={{ padding: "16px 18px 0" }}>
          核心能力表
        </div>
        <div className="table-wrap" style={{ border: "none", borderRadius: 0 }}>
          <table className="data">
            <thead>
              <tr>
                <th>能力</th>
                <th>重要度</th>
                <th>JD 信号</th>
              </tr>
            </thead>
            <tbody>
              {data.capabilities.map((row) => (
                <tr key={row.capability}>
                  <td>{row.capability}</td>
                  <td>
                    <Badge
                      tone={
                        row.importance === "高"
                          ? "danger"
                          : row.importance === "中"
                            ? "warning"
                            : "default"
                      }
                    >
                      {row.importance}
                    </Badge>
                  </td>
                  <td>{row.jdSignal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
