"use client";

import { useRef } from "react";
import type {
  UserInput,
  JobStage,
  ResumeLibraryItem,
  TargetRoleLibraryItem,
} from "@/types";
import { PanelHeader } from "@/components/ui";

interface Props {
  value: UserInput;
  onChange: (next: UserInput) => void;
  onLoadSample: () => void;
  analyzing: boolean;
  stage: JobStage;
  libraryItems?: ResumeLibraryItem[];
  onPickResume?: (text: string) => void;
  roleLibraryItems?: TargetRoleLibraryItem[];
  selectedRoleId?: string;
  onPickRole?: (item: TargetRoleLibraryItem) => void;
  onOpenRoleLibrary?: () => void;
  onUploadResume?: (file: File) => void | Promise<void>;
  uploadingResume?: boolean;
  uploadedResumeName?: string | null;
}

export function InputPanel({
  value,
  onChange,
  onLoadSample,
  analyzing,
  stage,
  libraryItems = [],
  onPickResume,
  roleLibraryItems = [],
  selectedRoleId = "",
  onPickRole,
  onOpenRoleLibrary,
  onUploadResume,
  uploadingResume = false,
  uploadedResumeName = null,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof UserInput>(key: K, v: UserInput[K]) =>
    onChange({ ...value, [key]: v });

  const isInterview = stage === "pre_interview";
  const busy = analyzing || uploadingResume;

  const selectedStillExists = roleLibraryItems.some((x) => x.id === selectedRoleId);
  const roleSelectValue = selectedStillExists ? selectedRoleId : "";

  const resumeUpload = onUploadResume ? (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,.docx,.pdf,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void onUploadResume(file);
        }}
      />
      <button
        type="button"
        className="btn btn-secondary btn-sm"
        disabled={busy}
        onClick={() => fileInputRef.current?.click()}
      >
        {uploadingResume ? "解析中…" : "上传文件"}
      </button>
    </>
  ) : null;

  const resumeUploadHint = onUploadResume ? (
    <p className="hint" style={{ marginBottom: 10, color: "var(--fg-muted)", fontSize: 12 }}>
      支持 .txt / .md / .docx / .pdf（≤5MB）。扫描版 PDF 可能抽不出文字，建议用可复制文本的文件或直接粘贴。
      {uploadedResumeName ? (
        <>
          {" "}
          最近导入：<span style={{ color: "var(--fg)" }}>{uploadedResumeName}</span>
        </>
      ) : null}
    </p>
  ) : null;

  const rolePicker = onPickRole ? (
    <div className="field library-import" style={{ marginBottom: 12 }}>
      <label>从目标岗位库导入</label>
      <div className="library-import-row">
        <select
          className="select"
          value={roleSelectValue}
          disabled={busy || roleLibraryItems.length === 0}
          onChange={(e) => {
            const item = roleLibraryItems.find((x) => x.id === e.target.value);
            if (item) onPickRole(item);
          }}
        >
          <option value="">
            {roleLibraryItems.length === 0
              ? "暂无保存的岗位"
              : `选择岗位（共 ${roleLibraryItems.length} 个）…`}
          </option>
          {roleLibraryItems.map((item) => (
            <option
              key={item.id}
              value={item.id}
              disabled={!item.targetRole.trim() && !item.jdText.trim()}
            >
              {item.name}
            </option>
          ))}
        </select>
        {onOpenRoleLibrary ? (
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={onOpenRoleLibrary}
            disabled={busy}
          >
            {roleLibraryItems.length === 0 ? "去添加" : "管理"}
          </button>
        ) : null}
      </div>
    </div>
  ) : null;

  const libraryPicker =
    libraryItems.length > 0 && onPickResume ? (
      <div className="library-pick">
        <div className="library-pick-label">从简历库选用：</div>
        {libraryItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => onPickResume(item.resumeText)}
            disabled={busy || !item.resumeText.trim()}
            title={item.note || item.name}
          >
            {item.name}
          </button>
        ))}
      </div>
    ) : null;

  return (
    <div className="panel">
      <PanelHeader
        title="输入材料"
        description={
          isInterview
            ? "填写面试岗位、JD、公司与简历信息。分析后将生成面试准备材料与问答模拟。"
            : "填写目标岗位与 JD、原始简历等信息。分析后将生成诊断、匹配与经历追问；完成追问后再生成优化简历。"
        }
      />

      {isInterview ? (
        <>
          <div className="card">
            <div className="card-title">
              <span>基本信息</span>
              <div className="card-title-actions">
                {onOpenRoleLibrary ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onOpenRoleLibrary}
                    disabled={busy}
                  >
                    目标岗位库
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onLoadSample}
                  disabled={busy}
                >
                  使用示例数据
                </button>
              </div>
            </div>
            {rolePicker}
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
                <label>公司名称</label>
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
              {resumeUpload}
            </div>
            {resumeUploadHint}
            {libraryPicker}
            <div className="field">
              <textarea
                className="textarea tall"
                value={value.resumeText}
                onChange={(e) => set("resumeText", e.target.value)}
                placeholder="粘贴简历文本，或上传文件自动导入…"
                disabled={uploadingResume}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-title">补充信息</div>
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
              <div className="card-title-actions">
                {onOpenRoleLibrary ? (
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={onOpenRoleLibrary}
                    disabled={busy}
                  >
                    目标岗位库
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={onLoadSample}
                  disabled={busy}
                >
                  使用示例数据
                </button>
              </div>
            </div>
            {rolePicker}
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
                <label>公司名称</label>
                <input
                  className="input"
                  value={value.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  placeholder="如：星河智能科技（杭州）有限公司"
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
              {resumeUpload}
            </div>
            {resumeUploadHint}
            {libraryPicker}
            <div className="field">
              <textarea
                className="textarea tall"
                value={value.resumeText}
                onChange={(e) => set("resumeText", e.target.value)}
                placeholder="粘贴原始简历文本，或上传文件自动导入…"
                disabled={uploadingResume}
              />
            </div>
          </div>

          <div className="card">
            <div className="card-title">补充信息</div>
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
        <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>
          分析与清空请用顶部导航右侧按钮。已配置 DeepSeek 密钥则走大模型，否则自动 Mock。
        </span>
      </div>

      {(analyzing || uploadingResume) && (
        <div className="loading-bar">
          <span />
        </div>
      )}
    </div>
  );
}
