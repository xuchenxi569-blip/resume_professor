"use client";

import type { FinalResume } from "@/types";
import { PanelHeader } from "@/components/ui";

export function FinalResumePanel({
  resume,
  onCopy,
}: {
  resume: FinalResume;
  onCopy: () => void;
}) {
  return (
    <div className="panel">
      <PanelHeader
        title="最终简历"
        description="基于 JD 定制后的完整优化版简历，可直接复制使用。"
      />

      <div className="row-actions" style={{ marginTop: 0, marginBottom: 12 }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={onCopy}>
          复制最终简历
        </button>
      </div>

      <div className="card resume-preview">
        <div className="resume-section">
          <h3>个人信息</h3>
          <div>{resume.personalInfo}</div>
        </div>
        <div className="resume-section">
          <h3>求职意向</h3>
          <div>{resume.intention}</div>
        </div>
        <div className="resume-section">
          <h3>职业摘要</h3>
          <div>{resume.summary}</div>
        </div>
        <div className="resume-section">
          <h3>核心能力</h3>
          <ul className="list-clean">
            {resume.coreSkills.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="resume-section">
          <h3>工作经历</h3>
          <div style={{ whiteSpace: "pre-wrap" }}>{resume.workExperience.join("\n")}</div>
        </div>
        <div className="resume-section">
          <h3>项目经历</h3>
          <div style={{ whiteSpace: "pre-wrap" }}>{resume.projects.join("\n")}</div>
        </div>
        <div className="resume-section">
          <h3>技能工具</h3>
          <ul className="list-clean">
            {resume.tools.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="resume-section">
          <h3>教育背景</h3>
          <div>{resume.education}</div>
        </div>
      </div>
    </div>
  );
}
