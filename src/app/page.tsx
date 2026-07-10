"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AnalysisResult,
  ApplyStep,
  InterviewStep,
  JobStage,
  OptimizeStyle,
  UserInput,
} from "@/types";
import { APPLY_STEPS, INTERVIEW_STEPS, SAMPLE_INPUT } from "@/lib/sample-data";
import { formatFinalResumeText } from "@/lib/mock-ai";
import { InputPanel } from "@/components/panels/InputPanel";
import { JdParsePanel } from "@/components/panels/JdParsePanel";
import { DiagnosisPanel } from "@/components/panels/DiagnosisPanel";
import { MatchPanel } from "@/components/panels/MatchPanel";
import { ProbePanel } from "@/components/panels/ProbePanel";
import { OptimizePanel } from "@/components/panels/OptimizePanel";
import { FinalResumePanel } from "@/components/panels/FinalResumePanel";
import { ExportPanel } from "@/components/panels/ExportPanel";
import { InterviewPrepPanel } from "@/components/panels/InterviewPrepPanel";
import { InterviewSimPanel } from "@/components/panels/InterviewSimPanel";
import { InterviewMatchPanel } from "@/components/panels/InterviewMatchPanel";

const emptyInput: UserInput = {
  targetRole: "",
  industry: "",
  companyType: "",
  companyName: "",
  jobStage: "pre_apply",
  highlightSkills: "",
  jdText: "",
  resumeText: "",
  extraInfo: "",
  useCozeKnowledge: false,
};

export default function HomePage() {
  const [stage, setStage] = useState<JobStage>("pre_apply");
  const [step, setStep] = useState<string>("input");
  const [input, setInput] = useState<UserInput>(emptyInput);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizeStyle, setOptimizeStyle] = useState<OptimizeStyle>("default");
  const [toast, setToast] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [providerLabel, setProviderLabel] = useState("检测中…");
  const [busy, setBusy] = useState(false);

  const steps = stage === "pre_apply" ? APPLY_STEPS : INTERVIEW_STEPS;
  const analyzed = Boolean(result);

  useEffect(() => {
    fetch("/api/analyze")
      .then((r) => r.json())
      .then((d: { configured?: boolean; provider?: string; model?: string }) => {
        if (d.configured) {
          setProviderLabel(`DeepSeek · ${d.model || "deepseek-chat"}`);
        } else {
          setProviderLabel("Mock AI（未配置密钥）");
        }
      })
      .catch(() => setProviderLabel("Mock AI"));
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const copyText = async (text: string, okMsg: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(okMsg);
    } catch {
      showToast("复制失败，请手动选择文本");
    }
  };

  const handleStageChange = (next: JobStage) => {
    setStage(next);
    setInput((prev) => ({ ...prev, jobStage: next }));
    setStep("input");
  };

  const handleLoadSample = () => {
    setInput({ ...SAMPLE_INPUT, jobStage: stage });
    showToast("已填入示例数据");
  };

  const handleClearData = () => {
    setInput({ ...emptyInput, jobStage: stage });
    setResult(null);
    setOptimizeStyle("default");
    setStep("input");
    showToast("已清空数据");
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: { ...input, jobStage: stage } }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "分析失败");
      setResult(data.result);
      setOptimizeStyle("default");
      setStep("jd_parse");
      setProviderLabel(
        data.provider === "deepseek" ? "DeepSeek" : "Mock AI"
      );
      showToast(
        data.provider === "deepseek" ? "DeepSeek 分析完成" : "Mock 分析完成"
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : "分析失败");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStepClick = (id: string) => {
    if (id === "input") {
      setStep(id);
      return;
    }
    if (!analyzed) return;
    setStep(id);
  };

  const updateProbeAnswer = (id: string, answer: string) => {
    if (!result) return;
    setResult({
      ...result,
      probes: result.probes.map((p) => (p.id === id ? { ...p, answer } : p)),
    });
  };

  const generateProbeBullet = async (id: string) => {
    if (!result || busy) return;
    const probe = result.probes.find((p) => p.id === id);
    if (!probe?.answer.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bullet",
          question: probe.question,
          answer: probe.answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "生成失败");
      setResult({
        ...result,
        probes: result.probes.map((p) =>
          p.id === id ? { ...p, generatedBullet: data.bullet } : p
        ),
      });
      showToast("已生成 bullet");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "生成失败");
    } finally {
      setBusy(false);
    }
  };

  const generateAllBullets = async () => {
    if (!result || busy) return;
    setBusy(true);
    try {
      const next = [...result.probes];
      for (let i = 0; i < next.length; i++) {
        const p = next[i];
        if (!p.answer.trim()) continue;
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "bullet",
            question: p.question,
            answer: p.answer,
          }),
        });
        const data = await res.json();
        if (res.ok && data.bullet) {
          next[i] = { ...p, generatedBullet: data.bullet };
        }
      }
      setResult({ ...result, probes: next });
      showToast("已为已填写追问生成 bullet");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "生成失败");
    } finally {
      setBusy(false);
    }
  };

  const handleStyleChange = async (style: OptimizeStyle) => {
    if (!result || busy) return;
    setBusy(true);
    setOptimizeStyle(style);
    try {
      const res = await fetch("/api/optimize-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          style,
          currentResume: result.finalResume,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "风格优化失败");
      setResult({
        ...result,
        optimizeRows: data.optimizeRows,
        finalResume: data.finalResume,
      });
      showToast("已按风格重写");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "风格优化失败");
    } finally {
      setBusy(false);
    }
  };

  const updateInterviewAnswer = (id: string, answer: string) => {
    if (!result) return;
    setResult({
      ...result,
      interviewQAs: result.interviewQAs.map((q) =>
        q.id === id ? { ...q, userAnswer: answer } : q
      ),
    });
  };

  const optimizeQA = async (id: string) => {
    if (!result || busy) return;
    const qa = result.interviewQAs.find((q) => q.id === id);
    if (!qa?.userAnswer.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "interview_answer",
          question: qa.question,
          answer: qa.userAnswer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "优化失败");
      setResult({
        ...result,
        interviewQAs: result.interviewQAs.map((q) =>
          q.id === id
            ? {
                ...q,
                optimizedAnswer: data.optimizedAnswer,
                feedback: data.feedback,
              }
            : q
        ),
      });
      showToast("已生成优化表达");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "优化失败");
    } finally {
      setBusy(false);
    }
  };

  const reportText = useMemo(() => {
    if (!result) return "";
    return [
      `【简历专家 · 分析摘要】`,
      `目标岗位：${input.targetRole}`,
      `匹配度：${result.diagnosis.matchScore}/100`,
      "",
      "主要问题：",
      ...result.diagnosis.mainIssues.map((x, i) => `${i + 1}. ${x}`),
      "",
      "优先修改：",
      ...result.diagnosis.priorityFixes.map((x, i) => `${i + 1}. ${x}`),
    ].join("\n");
  }, [result, input.targetRole]);

  const renderMain = () => {
    if (step === "input") {
      return (
        <InputPanel
          value={input}
          onChange={(next) => {
            setInput(next);
            if (next.jobStage !== stage) {
              setStage(next.jobStage);
              setStep("input");
            }
          }}
          onLoadSample={handleLoadSample}
          onAnalyze={handleAnalyze}
          onClear={handleClearData}
          analyzing={analyzing}
          stage={stage}
          hasResult={analyzed}
        />
      );
    }

    if (!result) {
      return (
        <div className="empty-state">
          <h2>尚未开始分析</h2>
          <p>请先在「输入材料」中填写信息，或使用示例数据后点击开始分析。</p>
        </div>
      );
    }

    if (step === "jd_parse") return <JdParsePanel data={result.jd} />;

    if (stage === "pre_apply") {
      const s = step as ApplyStep;
      if (s === "diagnosis") return <DiagnosisPanel data={result.diagnosis} />;
      if (s === "match") return <MatchPanel rows={result.matchRows} />;
      if (s === "probe")
        return (
          <ProbePanel
            probes={result.probes}
            onAnswerChange={updateProbeAnswer}
            onGenerateBullet={generateProbeBullet}
            onGenerateAll={generateAllBullets}
          />
        );
      if (s === "optimize")
        return (
          <OptimizePanel
            rows={result.optimizeRows}
            style={optimizeStyle}
            onStyleChange={handleStyleChange}
          />
        );
      if (s === "final_resume")
        return (
          <FinalResumePanel
            resume={result.finalResume}
            onCopy={() =>
              copyText(formatFinalResumeText(result.finalResume), "最终简历已复制")
            }
          />
        );
      if (s === "export")
        return (
          <ExportPanel
            onCopyResume={() =>
              copyText(formatFinalResumeText(result.finalResume), "最终简历已复制")
            }
            onCopyReport={() => copyText(reportText, "分析摘要已复制")}
            onOpenExportDialog={() => setExportOpen(true)}
          />
        );
    }

    if (stage === "pre_interview") {
      const s = step as InterviewStep;
      if (s === "interview_match")
        return <InterviewMatchPanel data={result.interviewMatch} />;
      if (s === "interview_prep")
        return (
          <InterviewPrepPanel
            data={result.interviewPrep}
            onCopyIntro={() =>
              copyText(result.interviewPrep.selfIntro, "自我介绍已复制")
            }
          />
        );
      if (s === "interview_sim")
        return (
          <InterviewSimPanel
            items={result.interviewQAs}
            onAnswerChange={updateInterviewAnswer}
            onOptimize={optimizeQA}
          />
        );
    }

    return null;
  };

  const stepReached = (id: string) => {
    if (id === "input") return true;
    return analyzed;
  };

  return (
    <div className="app-shell">
      <header className="topnav">
        <div className="brand">
          <div className="brand-mark">简</div>
          <div className="brand-text">
            <div className="brand-name">简历专家</div>
            <div className="brand-sub">JD 定制简历优化 Agent</div>
          </div>
        </div>

        <div className="stage-switch" role="tablist" aria-label="求职阶段">
          <button
            type="button"
            className={`stage-btn ${stage === "pre_apply" ? "active" : ""}`}
            onClick={() => handleStageChange("pre_apply")}
          >
            投递前
          </button>
          <button
            type="button"
            className={`stage-btn ${stage === "pre_interview" ? "active" : ""}`}
            onClick={() => handleStageChange("pre_interview")}
          >
            面试前
          </button>
        </div>

        <div className="topnav-right">
          <span>{analyzed ? "已分析" : "待分析"}</span>
          <span>·</span>
          <span>{providerLabel}</span>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidenav">
          <div className="sidenav-title">
            {stage === "pre_apply" ? "投递前流程" : "面试前流程"}
          </div>
          <ul className="step-list">
            {steps.map((s) => {
              const done =
                analyzed &&
                steps.findIndex((x) => x.id === step) > steps.findIndex((x) => x.id === s.id);
              const active = step === s.id;
              const enabled = stepReached(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`step-item ${active ? "active" : ""} ${done ? "done" : ""}`}
                    disabled={!enabled}
                    onClick={() => handleStepClick(s.id)}
                  >
                    <span className="step-index">{s.index}</span>
                    <span className="step-label">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="sidenav-actions">
            <button
              type="button"
              className="btn btn-primary btn-sm"
              style={{ width: "100%" }}
              onClick={handleAnalyze}
              disabled={
                analyzing || !input.jdText.trim() || !input.resumeText.trim()
              }
            >
              {analyzing ? "分析中…" : analyzed ? "重新分析" : "开始分析"}
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: "100%" }}
              onClick={handleClearData}
              disabled={analyzing}
            >
              清空数据
            </button>
          </div>
        </aside>

        <main className="main">{renderMain()}</main>
      </div>

      {exportOpen && (
        <div className="dialog-backdrop" onClick={() => setExportOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2>导出功能占位</h2>
            <p>
              PDF / Word / Markdown 导出将在后续版本接入真实文件生成。当前请使用「复制最终简历」或「复制分析摘要」。
            </p>
            <div className="row-actions" style={{ marginTop: 0 }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setExportOpen(false)}
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
