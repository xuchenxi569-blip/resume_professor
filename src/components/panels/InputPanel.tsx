"use client";

import type { UserInput, JobStage } from "@/types";
import { PanelHeader } from "@/components/ui";

interface Props {
  value: UserInput;
  onChange: (next: UserInput) => void;
  onLoadSample: () => void;
  onAnalyze: () => void;
  onClear?: () => void;
  analyzing: boolean;
  stage: JobStage;
  hasResult?: boolean;
}

export function InputPanel({
  value,
  onChange,
  onLoadSample,
  onAnalyze,
  onClear,
  analyzing,
  stage,
  hasResult = false,
}: Props) {
  const set = <K extends keyof UserInput>(key: K, v: UserInput[K]) =>
    onChange({ ...value, [key]: v });

  const isInterview = stage === "pre_interview";

  return (
    <div className="panel">
      <PanelHeader
        title="输入材料"
        description={
          isInterview
            ? "填写面试岗位、JD、公司与简历信息。分析后将生成面试准备材料与问答模拟。"
            : "填写目标岗位与 JD、原始简历等信息。分析后将生成诊断、匹配、追问与优化简历。"
        }
      />

      {isInterview ? (
        <>
          <div className="card">
            <div className="card-title">
              <span>基本信息</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onLoadSample}>
                使用示例数据
              </button>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>面试岗位</label>
                <input
                  className="input"
                  value={value.targetRole}
                  onChange={(e) => set("targetRole", e.target.value)}
                  placeholder="如：AI 产品经理"
                />
              </div>
              <div className="field">
                <label>公司全称</label>
                <input
                  className="input"
                  value={value.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  placeholder="如：星河智能科技（杭州）有限公司"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title">岗位 JD</div>
            <div className="field">
              <textarea
                className="textarea tall"
                value={value.jdText}
                onChange={(e) => set("jdText", e.target.value)}
                placeholder="粘贴完整岗位 JD…"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <span>简历信息</span>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={value.useCozeKnowledge}
                  onChange={(e) => set("useCozeKnowledge", e.target.checked)}
                />
                连接扣子知识库
              </label>
            </div>
            {value.useCozeKnowledge && (
              <p className="hint" style={{ marginBottom: 10, color: "var(--fg-muted)", fontSize: 12 }}>
                已启用：将从扣子知识库拉取简历事实与项目材料（当前为 Mock 占位，可后续替换真实 API）。
              </p>
            )}
            <div className="field">
              <textarea
                className="textarea tall"
                value={value.resumeText}
                onChange={(e) => set("resumeText", e.target.value)}
                placeholder="粘贴简历文本…"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <span>补充信息</span>
              {value.useCozeKnowledge && <span className="badge badge-info">知识库可同步</span>}
            </div>
            <div className="field">
              <textarea
                className="textarea"
                value={value.extraInfo}
                onChange={(e) => set("extraInfo", e.target.value)}
                placeholder="补充面试轮次、已知面试官信息、想重点准备的项目等…"
              />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="card">
            <div className="card-title">
              <span>基本信息</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={onLoadSample}>
                使用示例数据
              </button>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>目标岗位</label>
                <input
                  className="input"
                  value={value.targetRole}
                  onChange={(e) => set("targetRole", e.target.value)}
                  placeholder="如：AI 产品经理"
                />
              </div>
              <div className="field">
                <label>行业</label>
                <input
                  className="input"
                  value={value.industry}
                  onChange={(e) => set("industry", e.target.value)}
                  placeholder="如：企业服务 / AI SaaS"
                />
              </div>
              <div className="field">
                <label>公司类型</label>
                <input
                  className="input"
                  value={value.companyType}
                  onChange={(e) => set("companyType", e.target.value)}
                  placeholder="如：ToB SaaS 成长期"
                />
              </div>
              <div className="field">
                <label>求职阶段</label>
                <select
                  className="select"
                  value={value.jobStage}
                  onChange={(e) => set("jobStage", e.target.value as JobStage)}
                >
                  <option value="pre_apply">投递前</option>
                  <option value="pre_interview">面试前</option>
                </select>
              </div>
            </div>
            <div className="field" style={{ marginTop: 12 }}>
              <label>希望突出的能力</label>
              <input
                className="input"
                value={value.highlightSkills}
                onChange={(e) => set("highlightSkills", e.target.value)}
                placeholder="用逗号分隔，如：需求分析、RAG、跨部门协作"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-title">目标 JD</div>
            <div className="field">
              <textarea
                className="textarea tall"
                value={value.jdText}
                onChange={(e) => set("jdText", e.target.value)}
                placeholder="粘贴完整岗位 JD…"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <span>原始简历</span>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={value.useCozeKnowledge}
                  onChange={(e) => set("useCozeKnowledge", e.target.checked)}
                />
                连接扣子知识库
              </label>
            </div>
            {value.useCozeKnowledge && (
              <p className="hint" style={{ marginBottom: 10, color: "var(--fg-muted)", fontSize: 12 }}>
                已启用：将从扣子知识库拉取简历事实与项目材料（当前为 Mock 占位，可后续替换真实 API）。
              </p>
            )}
            <div className="field">
              <textarea
                className="textarea tall"
                value={value.resumeText}
                onChange={(e) => set("resumeText", e.target.value)}
                placeholder="粘贴原始简历文本…"
              />
            </div>
          </div>

          <div className="card">
            <div className="card-title">
              <span>补充信息</span>
              {value.useCozeKnowledge && <span className="badge badge-info">知识库可同步</span>}
            </div>
            <div className="field">
              <textarea
                className="textarea"
                value={value.extraInfo}
                onChange={(e) => set("extraInfo", e.target.value)}
                placeholder="补充优势、短板、项目细节、希望强调的故事等…"
              />
            </div>
          </div>
        </>
      )}

      <div className="row-actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={onAnalyze}
          disabled={analyzing || !value.jdText.trim() || !value.resumeText.trim()}
        >
          {analyzing ? "分析中…" : hasResult ? "重新分析" : "开始分析"}
        </button>
        {onClear ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClear}
            disabled={analyzing}
          >
            清空数据
          </button>
        ) : null}
        <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
          已配置 DeepSeek 密钥则走大模型；否则自动使用本地 Mock
        </span>
      </div>

      {analyzing && (
        <div className="loading-bar">
          <span />
        </div>
      )}
    </div>
  );
}
