"use client";

import { useEffect, useState } from "react";
import type {
  AnalysisResult,
  AppStep,
  ApplyStep,
  InterviewStep,
  JobStage,
  OptimizeStyle,
  ResumeLibraryItem,
  TargetRoleLibraryItem,
  UserInput,
  ApplicationRecord,
} from "@/types";
import { APPLY_STEPS, INTERVIEW_STEPS, SAMPLE_INPUT } from "@/lib/sample-data";
import { formatFinalResumeText } from "@/lib/mock-ai";
import { loadResumeLibrary, saveResumeLibrary } from "@/lib/resume-library";
import {
  loadApplicationLibrary,
  saveApplicationLibrary,
} from "@/lib/application-library";
import {
  EXT_MSG,
  EXT_SOURCE,
  loadRoleLibrary,
  markRolesDeleted,
  mergeRoleLibrary,
  notifyExtensionDelete,
  notifyExtensionReplace,
  requestExtensionSync,
  saveRoleLibrary,
} from "@/lib/role-library";
import { InputPanel } from "@/components/panels/InputPanel";
import { JdParsePanel } from "@/components/panels/JdParsePanel";
import { DiagnosisPanel } from "@/components/panels/DiagnosisPanel";
import { MatchPanel } from "@/components/panels/MatchPanel";
import { ProbePanel } from "@/components/panels/ProbePanel";
import { OptimizePanel } from "@/components/panels/OptimizePanel";
import { FinalResumePanel } from "@/components/panels/FinalResumePanel";
import { ResumeLibraryPanel } from "@/components/panels/ResumeLibraryPanel";
import { RoleLibraryPanel } from "@/components/panels/RoleLibraryPanel";
import { ApplicationLibraryPanel } from "@/components/panels/ApplicationLibraryPanel";
import { InterviewPrepPanel } from "@/components/panels/InterviewPrepPanel";
import { InterviewSimPanel } from "@/components/panels/InterviewSimPanel";
import { InterviewMatchPanel } from "@/components/panels/InterviewMatchPanel";

const LIBRARY_STEPS: AppStep[] = [
  "role_library",
  "resume_library",
  "application_library",
];
const isLibraryStep = (id: AppStep) => LIBRARY_STEPS.includes(id);

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
};

export default function HomePage() {
  const [stage, setStage] = useState<JobStage>("pre_apply");
  const [step, setStep] = useState<AppStep>("input");
  const [input, setInput] = useState<UserInput>(emptyInput);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [optimizeStyle, setOptimizeStyle] = useState<OptimizeStyle>("default");
  const [optimizeReady, setOptimizeReady] = useState(false);
  const [customOptimizeReq, setCustomOptimizeReq] = useState("");
  const [resumeLibrary, setResumeLibrary] = useState<ResumeLibraryItem[]>([]);
  const [roleLibrary, setRoleLibrary] = useState<TargetRoleLibraryItem[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");
  const [applicationLibrary, setApplicationLibrary] = useState<
    ApplicationRecord[]
  >([]);
  const [libraryReady, setLibraryReady] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [providerLabel, setProviderLabel] = useState("检测中…");
  const [busy, setBusy] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadedResumeName, setUploadedResumeName] = useState<string | null>(
    null
  );

  const steps = stage === "pre_apply" ? APPLY_STEPS : INTERVIEW_STEPS;
  const analyzed = Boolean(result);

  useEffect(() => {
    setResumeLibrary(loadResumeLibrary());
    setRoleLibrary(loadRoleLibrary());
    setApplicationLibrary(loadApplicationLibrary());
    setLibraryReady(true);
    // 若已安装岗位采集插件，请求同步
    requestExtensionSync();
  }, []);

  useEffect(() => {
    if (!libraryReady) return;
    saveResumeLibrary(resumeLibrary);
  }, [resumeLibrary, libraryReady]);

  useEffect(() => {
    if (!libraryReady) return;
    saveRoleLibrary(roleLibrary);
  }, [roleLibrary, libraryReady]);

  useEffect(() => {
    if (!libraryReady) return;
    saveApplicationLibrary(applicationLibrary);
  }, [applicationLibrary, libraryReady]);

  // 接收 Chrome 插件 bridge 推送的岗位库
  useEffect(() => {
    if (!libraryReady) return;

    const onMessage = (event: MessageEvent) => {
      if (event.source !== window) return;
      const data = event.data as {
        source?: string;
        type?: string;
        payload?: unknown;
        mode?: string;
        latest?: TargetRoleLibraryItem | null;
      } | null;
      if (!data || data.source !== EXT_SOURCE) return;
      if (data.type !== EXT_MSG.MERGE_ROLES) return;
      if (!Array.isArray(data.payload)) return;

      const incoming = data.payload as TargetRoleLibraryItem[];
      const latest =
        data.latest && typeof data.latest === "object" ? data.latest : null;
      setRoleLibrary((prev) => {
        const { items, added, updated } = mergeRoleLibrary(prev, incoming, {
          respectTombstones: true,
          clearTombstonesFor:
            data.mode === "save" && latest ? [latest] : undefined,
        });
        if (added === 0 && updated === 0) return prev;
        const parts: string[] = [];
        if (added > 0) parts.push(`新增 ${added} 条`);
        if (updated > 0) parts.push(`更新 ${updated} 条`);
        queueMicrotask(() => {
          setToast(`插件同步：${parts.join("，")}`);
          window.setTimeout(() => setToast(null), 2200);
        });
        return items;
      });
    };

    window.addEventListener("message", onMessage);
    const t1 = window.setTimeout(() => requestExtensionSync(), 800);
    const t2 = window.setTimeout(() => requestExtensionSync(), 2500);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [libraryReady]);

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
    setResult(null);
    setOptimizeStyle("default");
    setOptimizeReady(false);
    setCustomOptimizeReq("");
    setStep("input");
  };

  const applyRoleFromLibrary = (item: TargetRoleLibraryItem) => {
    setSelectedRoleId(item.id);
    setInput((prev) => ({
      ...prev,
      targetRole: item.targetRole || prev.targetRole,
      companyName: item.companyName || prev.companyName,
      jdText: item.jdText || prev.jdText,
    }));
  };

  const handleLoadSample = () => {
    setSelectedRoleId("");
    setUploadedResumeName(null);
    setInput({ ...SAMPLE_INPUT, jobStage: stage });
    showToast("已填入示例数据");
  };

  const handleClearData = () => {
    setSelectedRoleId("");
    setUploadedResumeName(null);
    setInput({ ...emptyInput, jobStage: stage });
    setResult(null);
    setOptimizeStyle("default");
    setOptimizeReady(false);
    setCustomOptimizeReq("");
    setStep("input");
    showToast("已清空数据");
  };

  const handleUploadResume = async (file: File) => {
    if (uploadingResume || analyzing) return;
    setUploadingResume(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/parse-resume", {
        method: "POST",
        body: form,
      });
      const data = (await res.json()) as {
        text?: string;
        filename?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error || "解析失败");
      if (!data.text?.trim()) throw new Error("未能提取到文本");
      setInput((prev) => ({ ...prev, resumeText: data.text! }));
      setUploadedResumeName(data.filename || file.name);
      showToast("已从文件导入");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "上传解析失败");
    } finally {
      setUploadingResume(false);
    }
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
      setOptimizeReady(false);
      setCustomOptimizeReq("");
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

  const needsOptimizeReady = (id: string) =>
    stage === "pre_apply" && (id === "optimize" || id === "final_resume");

  const handleStepClick = (id: AppStep) => {
    if (isLibraryStep(id) || id === "input") {
      setStep(id);
      return;
    }
    if (!analyzed) return;
    if (needsOptimizeReady(id) && !optimizeReady) return;
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

  const handleProbeToOptimize = async () => {
    if (!result || busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/optimize-probe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: { ...input, jobStage: stage },
          probes: result.probes,
          style: optimizeStyle,
          idealCandidate: result.jd.idealCandidate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "简历优化失败");
      setResult({
        ...result,
        optimizeRows: data.optimizeRows,
        finalResume: data.finalResume,
      });
      setOptimizeReady(true);
      setStep("optimize");
      setProviderLabel(
        data.provider === "deepseek" ? "DeepSeek" : "Mock AI"
      );
      showToast(
        data.provider === "deepseek"
          ? "已基于追问结果生成优化简历"
          : "Mock 已生成优化简历"
      );
    } catch (e) {
      showToast(e instanceof Error ? e.message : "简历优化失败");
    } finally {
      setBusy(false);
    }
  };

  const runOptimizeRewrite = async (
    style: OptimizeStyle,
    customRequirement: string,
    okMsg: string
  ) => {
    if (!result || busy || !optimizeReady) return;
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
          customRequirement: customRequirement.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "优化失败");
      setResult({
        ...result,
        optimizeRows: data.optimizeRows,
        finalResume: data.finalResume,
      });
      showToast(okMsg);
    } catch (e) {
      showToast(e instanceof Error ? e.message : "优化失败");
    } finally {
      setBusy(false);
    }
  };

  const handleStyleChange = (style: OptimizeStyle) => {
    void runOptimizeRewrite(
      style,
      customOptimizeReq,
      customOptimizeReq.trim() ? "已按风格与自定义需求重写" : "已按风格重写"
    );
  };

  const handleApplyCustomOptimize = () => {
    if (!customOptimizeReq.trim()) {
      showToast("请先填写自定义优化需求");
      return;
    }
    void runOptimizeRewrite(
      optimizeStyle,
      customOptimizeReq,
      "已按自定义需求重新优化"
    );
  };

  const updateFinalResume = (next: AnalysisResult["finalResume"]) => {
    if (!result) return;
    setResult({ ...result, finalResume: next });
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

  const renderMain = () => {
    if (step === "role_library") {
      return (
        <RoleLibraryPanel
          items={roleLibrary}
          onChange={(next) => {
            const removed = roleLibrary.filter(
              (old) => !next.some((n) => n.id === old.id)
            );
            if (removed.length > 0) {
              markRolesDeleted(removed);
              removed.forEach((item) => notifyExtensionDelete(item));
              // 全量回写插件，避免残留条目在刷新时再次合并进来
              notifyExtensionReplace(next);
            }
            setRoleLibrary(next);
          }}
          onUse={(item) => {
            applyRoleFromLibrary(item);
            setStep("input");
            showToast("已填入目标岗位与 JD");
          }}
          onCopy={(text) => copyText(text, "岗位信息已复制")}
        />
      );
    }

    if (step === "resume_library") {
      return (
        <ResumeLibraryPanel
          items={resumeLibrary}
          onChange={setResumeLibrary}
          onUse={(text) => {
            setInput((prev) => ({ ...prev, resumeText: text }));
            setStep("input");
            showToast("已填入输入材料");
          }}
          onCopy={(text) => copyText(text, "简历已复制")}
        />
      );
    }

    if (step === "application_library") {
      return (
        <ApplicationLibraryPanel
          items={applicationLibrary}
          onChange={setApplicationLibrary}
          roleLibrary={roleLibrary}
          resumeLibrary={resumeLibrary}
        />
      );
    }

    if (step === "input") {
      return (
        <InputPanel
          value={input}
          onChange={(next) => {
            setInput(next);
            if (next.jobStage !== stage) {
              setStage(next.jobStage);
              setResult(null);
              setOptimizeStyle("default");
              setOptimizeReady(false);
              setCustomOptimizeReq("");
              setStep("input");
            }
          }}
          onLoadSample={handleLoadSample}
          analyzing={analyzing}
          stage={stage}
          libraryItems={resumeLibrary}
          onPickResume={(text) => {
            setInput((prev) => ({ ...prev, resumeText: text }));
            showToast("已从简历库填入");
          }}
          roleLibraryItems={roleLibrary}
          selectedRoleId={selectedRoleId}
          onPickRole={(item) => {
            applyRoleFromLibrary(item);
            showToast("已从目标岗位库填入");
          }}
          onOpenRoleLibrary={() => setStep("role_library")}
          onUploadResume={handleUploadResume}
          uploadingResume={uploadingResume}
          uploadedResumeName={uploadedResumeName}
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
            onNextStep={handleProbeToOptimize}
            nextLoading={busy}
          />
        );
      if (s === "optimize")
        return (
          <OptimizePanel
            rows={result.optimizeRows}
            style={optimizeStyle}
            customRequirement={customOptimizeReq}
            onCustomRequirementChange={setCustomOptimizeReq}
            onStyleChange={handleStyleChange}
            onApplyCustom={handleApplyCustomOptimize}
            ready={optimizeReady}
            busy={busy}
          />
        );
      if (s === "final_resume")
        return (
          <FinalResumePanel
            resume={result.finalResume}
            onChange={updateFinalResume}
            onCopy={() =>
              copyText(formatFinalResumeText(result.finalResume), "最终简历已复制")
            }
            onSaveToLibrary={() => {
              const text = formatFinalResumeText(result.finalResume).trim();
              if (!text) {
                showToast("简历内容为空，无法保存");
                return;
              }
              const role =
                input.targetRole.trim() ||
                result.finalResume.intention.trim() ||
                "未命名";
              const now = new Date();
              const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
              setResumeLibrary((prev) => [
                {
                  id: Math.random().toString(36).slice(2),
                  name: `${role} · 优化版 ${stamp}`,
                  updatedAt: now.toISOString(),
                  resumeText: text,
                  note: "由最终简历一键保存",
                },
                ...prev,
              ]);
              showToast("已保存到简历库");
            }}
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

  const stepReached = (id: AppStep) => {
    if (isLibraryStep(id) || id === "input") return true;
    if (!analyzed) return false;
    if (needsOptimizeReady(id)) return optimizeReady;
    return true;
  };

  return (
    <div className="app-shell">
      <header className="topnav">
        <div className="topnav-left">
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
        </div>

        <div className="topnav-right">
          <span className="topnav-status">
            {analyzed ? "已分析" : "待分析"}
            <span className="topnav-status-sep">·</span>
            {providerLabel}
          </span>
          <button
            type="button"
            className="btn btn-primary btn-sm"
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
            onClick={handleClearData}
            disabled={analyzing}
          >
            清空数据
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidenav">
          <ul className="step-list sidenav-fixed">
            <li>
              <button
                type="button"
                className={`step-item step-item-fixed ${step === "role_library" ? "active" : ""}`}
                onClick={() => handleStepClick("role_library")}
              >
                <span className="step-index step-index-icon">岗</span>
                <span className="step-label">目标岗位库</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`step-item step-item-fixed ${step === "resume_library" ? "active" : ""}`}
                onClick={() => handleStepClick("resume_library")}
              >
                <span className="step-index step-index-icon">库</span>
                <span className="step-label">简历库</span>
              </button>
            </li>
            <li>
              <button
                type="button"
                className={`step-item step-item-fixed ${step === "application_library" ? "active" : ""}`}
                onClick={() => handleStepClick("application_library")}
              >
                <span className="step-index step-index-icon">投</span>
                <span className="step-label">投递记录库</span>
              </button>
            </li>
          </ul>

          <div className="sidenav-divider" />

          <div className="sidenav-title">
            {stage === "pre_apply" ? "投递前流程" : "面试前流程"}
          </div>
          <ul className="step-list">
            {steps.map((s) => {
              const flowIndex = steps.findIndex((x) => x.id === step);
              const selfIndex = steps.findIndex((x) => x.id === s.id);
              const done =
                analyzed && flowIndex > selfIndex && !isLibraryStep(step);
              const active = step === s.id;
              const enabled = stepReached(s.id as AppStep);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`step-item ${active ? "active" : ""} ${done ? "done" : ""}`}
                    disabled={!enabled}
                    onClick={() => handleStepClick(s.id as AppStep)}
                  >
                    <span className="step-index">{s.index}</span>
                    <span className="step-label">{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <main className="main">{renderMain()}</main>
      </div>

      {toast ? <div className="toast">{toast}</div> : null}
    </div>
  );
}
