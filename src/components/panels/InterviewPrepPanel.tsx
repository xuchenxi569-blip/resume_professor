"use client";

import type { InterviewPrepResult } from "@/types";
import { PanelHeader } from "@/components/ui";

export function InterviewPrepPanel({
  data,
  onCopyIntro,
}: {
  data: InterviewPrepResult;
  onCopyIntro: () => void;
}) {
  return (
    <div className="panel">
      <PanelHeader
        title="面试准备"
        description="基于 JD 与简历，预判追问、准备证据、识别夸张风险，并生成自我介绍。"
      />

      <div className="grid-2">
        <div className="card">
          <div className="card-title">10 个可能追问</div>
          <ul className="list-clean">
            {data.followUps.map((item, i) => (
              <li key={item}>
                {i + 1}. {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="card">
          <div className="card-title">需要准备的证据</div>
          <ul className="list-clean">
            {data.evidenceNeeded.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-title">可能夸大的表达</div>
          <ul className="list-clean">
            {data.overclaims.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <div className="card-title">建议补充的数据</div>
          <ul className="list-clean">
            {data.dataToAdd.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card">
        <div className="card-title">
          <span>自我介绍</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCopyIntro}>
            复制自我介绍
          </button>
        </div>
        <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{data.selfIntro}</p>
      </div>
    </div>
  );
}
