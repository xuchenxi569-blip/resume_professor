"use client";

import { PanelHeader } from "@/components/ui";

interface Props {
  onCopyResume: () => void;
  onCopyReport: () => void;
  onOpenExportDialog: () => void;
}

export function ExportPanel({
  onCopyResume,
  onCopyReport,
  onOpenExportDialog,
}: Props) {
  return (
    <div className="panel">
      <PanelHeader
        title="导出结果"
        description="导出能力暂以复制到剪贴板与 Dialog 占位为主，后续可接 PDF / Word / 飞书文档。"
      />

      <div className="grid-2">
        <div className="card">
          <div className="card-title">复制最终简历</div>
          <p style={{ fontSize: 13, color: "var(--fg-secondary)", marginBottom: 12 }}>
            将优化后的完整简历文本复制到剪贴板。
          </p>
          <button type="button" className="btn btn-primary btn-sm" onClick={onCopyResume}>
            复制最终简历
          </button>
        </div>
        <div className="card">
          <div className="card-title">复制分析摘要</div>
          <p style={{ fontSize: 13, color: "var(--fg-secondary)", marginBottom: 12 }}>
            复制匹配分、主要问题与优先修改建议的简要报告。
          </p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onCopyReport}>
            复制分析摘要
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">导出文件（占位）</div>
        <p style={{ fontSize: 13, color: "var(--fg-secondary)", marginBottom: 12 }}>
          PDF / Word / Markdown 导出将在后续版本接入。当前点击打开占位 Dialog。
        </p>
        <button type="button" className="btn btn-secondary btn-sm" onClick={onOpenExportDialog}>
          打开导出 Dialog
        </button>
      </div>
    </div>
  );
}
