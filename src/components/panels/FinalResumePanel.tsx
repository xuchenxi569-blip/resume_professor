"use client";

import type { FinalResume } from "@/types";
import { PanelHeader } from "@/components/ui";

export function FinalResumePanel({
  resume,
  onChange,
  onCopy,
  onSaveToLibrary,
}: {
  resume: FinalResume;
  onChange: (next: FinalResume) => void;
  onCopy: () => void;
  onSaveToLibrary?: () => void;
}) {
  const setField = <K extends keyof FinalResume>(key: K, value: FinalResume[K]) => {
    onChange({ ...resume, [key]: value });
  };

  return (
    <div className="panel">
      <PanelHeader
        title="最终简历"
        description="可直接编辑各段落内容，修改会立即生效；编辑完成后可复制或保存到简历库。"
      />

      <div className="row-actions" style={{ marginTop: 0, marginBottom: 12 }}>
        <button type="button" className="btn btn-primary btn-sm" onClick={onCopy}>
          复制最终简历
        </button>
        {onSaveToLibrary ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onSaveToLibrary}
          >
            保存到简历库
          </button>
        ) : null}
      </div>

      <div className="card resume-preview resume-editable">
        <div className="resume-section">
          <h3>个人信息</h3>
          <textarea
            className="textarea"
            rows={2}
            value={resume.personalInfo}
            onChange={(e) => setField("personalInfo", e.target.value)}
            placeholder="姓名｜岗位｜年限｜城市｜联系方式…"
          />
        </div>
        <div className="resume-section">
          <h3>求职意向</h3>
          <input
            className="input"
            value={resume.intention}
            onChange={(e) => setField("intention", e.target.value)}
            placeholder="只写一个目标岗位"
          />
        </div>
        <div className="resume-section">
          <h3>职业摘要</h3>
          <textarea
            className="textarea"
            rows={4}
            value={resume.summary}
            onChange={(e) => setField("summary", e.target.value)}
            placeholder="核心品牌与关键词…"
          />
        </div>
        <div className="resume-section">
          <h3>核心能力</h3>
          <p className="resume-edit-hint">每行一条</p>
          <textarea
            className="textarea"
            rows={4}
            value={resume.coreSkills.join("\n")}
            onChange={(e) => setField("coreSkills", e.target.value.split("\n"))}
            placeholder="能力点，每行一条"
          />
        </div>
        <div className="resume-section">
          <h3>工作经历</h3>
          <p className="resume-edit-hint">按行编辑；公司/职位行与 bullet 可穿插</p>
          <textarea
            className="textarea tall"
            value={resume.workExperience.join("\n")}
            onChange={(e) => setField("workExperience", e.target.value.split("\n"))}
            placeholder="工作经历，每行一条"
          />
        </div>
        <div className="resume-section">
          <h3>项目经历</h3>
          <p className="resume-edit-hint">每行一条</p>
          <textarea
            className="textarea tall"
            value={resume.projects.join("\n")}
            onChange={(e) => setField("projects", e.target.value.split("\n"))}
            placeholder="项目经历，每行一条"
          />
        </div>
        <div className="resume-section">
          <h3>技能工具</h3>
          <p className="resume-edit-hint">每行一条</p>
          <textarea
            className="textarea"
            rows={3}
            value={resume.tools.join("\n")}
            onChange={(e) => setField("tools", e.target.value.split("\n"))}
            placeholder="技能工具，每行一条"
          />
        </div>
        <div className="resume-section">
          <h3>教育背景</h3>
          <textarea
            className="textarea"
            rows={2}
            value={resume.education}
            onChange={(e) => setField("education", e.target.value)}
            placeholder="学校｜专业｜学历｜时间"
          />
        </div>
      </div>
    </div>
  );
}
