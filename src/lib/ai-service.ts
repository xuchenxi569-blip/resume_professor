import type {
  AnalysisResult,
  FinalResume,
  OptimizeRow,
  OptimizeStyle,
  ProbeCard,
  UserInput,
} from "@/types";
import {
  ANALYSIS_SYSTEM,
  ANSWER_SYSTEM,
  BULLET_SYSTEM,
  PROBE_OPTIMIZE_SYSTEM,
  STYLE_SYSTEM,
  buildAnalysisUserPrompt,
  buildProbeOptimizePrompt,
  buildStyleUserPrompt,
} from "@/lib/ai-prompts";
import {
  chatCompletion,
  extractJsonObject,
  isDeepSeekConfigured,
} from "@/lib/deepseek";
import { normalizeAnalysisResult } from "@/lib/normalize-result";
import {
  formatFinalResumeText,
  generateBulletFromAnswer,
  optimizeInterviewAnswer,
  regenerateOptimize,
  runMockAnalysis,
  runMockProbeOptimize,
} from "@/lib/mock-ai";

export type AiProvider = "deepseek" | "mock";

export async function runAnalysis(
  input: UserInput,
  options?: { forceMock?: boolean }
): Promise<{ result: AnalysisResult; provider: AiProvider }> {
  if (options?.forceMock || !isDeepSeekConfigured()) {
    const result = await runMockAnalysis(input);
    return { result, provider: "mock" };
  }

  const content = await chatCompletion({
    system: ANALYSIS_SYSTEM,
    user: buildAnalysisUserPrompt(input),
    temperature: 0.25,
    maxTokens: 8192,
  });

  const parsed = extractJsonObject(content);
  const result = normalizeAnalysisResult(parsed);
  // 分析轮只出诊断/匹配/追问；优化在追问完成后再生成
  result.optimizeRows = [];
  result.finalResume = {
    personalInfo: "",
    intention: "",
    summary: "",
    coreSkills: [],
    workExperience: [],
    projects: [],
    tools: [],
    education: "",
  };
  return { result, provider: "deepseek" };
}

export async function runProbeOptimize(
  input: UserInput,
  probes: ProbeCard[],
  style: OptimizeStyle,
  idealCandidate: string,
  options?: { forceMock?: boolean }
): Promise<{
  optimizeRows: OptimizeRow[];
  finalResume: FinalResume;
  provider: AiProvider;
}> {
  if (options?.forceMock || !isDeepSeekConfigured()) {
    const data = await runMockProbeOptimize(input, probes, style);
    return { ...data, provider: "mock" };
  }

  const content = await chatCompletion({
    system: PROBE_OPTIMIZE_SYSTEM,
    user: buildProbeOptimizePrompt(input, probes, style, idealCandidate),
    temperature: 0.3,
    maxTokens: 8192,
  });

  const parsed = extractJsonObject(content) as Record<string, unknown>;
  const normalized = normalizeAnalysisResult({
    optimizeRows: parsed.optimizeRows,
    finalResume: parsed.finalResume,
  });

  const mockFallback = await runMockProbeOptimize(input, probes, style);

  return {
    optimizeRows: normalized.optimizeRows.length
      ? normalized.optimizeRows
      : mockFallback.optimizeRows,
    finalResume: normalized.finalResume.summary
      ? normalized.finalResume
      : mockFallback.finalResume,
    provider: "deepseek",
  };
}

export async function runStyleOptimize(
  input: UserInput,
  style: OptimizeStyle,
  currentResume: FinalResume,
  options?: { forceMock?: boolean; customRequirement?: string }
): Promise<{
  optimizeRows: OptimizeRow[];
  finalResume: FinalResume;
  provider: AiProvider;
}> {
  const customRequirement = options?.customRequirement?.trim() || "";

  if (options?.forceMock || !isDeepSeekConfigured()) {
    const data = regenerateOptimize(input, style, customRequirement);
    return { ...data, provider: "mock" };
  }

  const content = await chatCompletion({
    system: STYLE_SYSTEM,
    user: buildStyleUserPrompt(
      input,
      style,
      formatFinalResumeText(currentResume),
      customRequirement
    ),
    temperature: 0.3,
    maxTokens: 4096,
  });

  const parsed = extractJsonObject(content) as Record<string, unknown>;
  const normalized = normalizeAnalysisResult({
    optimizeRows: parsed.optimizeRows,
    finalResume: parsed.finalResume,
  });

  const fallback = regenerateOptimize(input, style, customRequirement);

  return {
    optimizeRows: normalized.optimizeRows.length
      ? normalized.optimizeRows
      : fallback.optimizeRows,
    finalResume: normalized.finalResume.summary
      ? normalized.finalResume
      : fallback.finalResume,
    provider: "deepseek",
  };
}

export async function runGenerateBullet(
  question: string,
  answer: string,
  options?: { forceMock?: boolean }
): Promise<{ bullet: string; provider: AiProvider }> {
  if (!answer.trim()) return { bullet: "", provider: "mock" };

  if (options?.forceMock || !isDeepSeekConfigured()) {
    return {
      bullet: generateBulletFromAnswer(question, answer),
      provider: "mock",
    };
  }

  const content = await chatCompletion({
    system: BULLET_SYSTEM,
    user: JSON.stringify({ question, answer }),
    temperature: 0.3,
    maxTokens: 512,
  });

  const parsed = extractJsonObject(content) as { bullet?: string };
  const bullet =
    typeof parsed.bullet === "string" && parsed.bullet.trim()
      ? parsed.bullet.trim()
      : generateBulletFromAnswer(question, answer);

  return { bullet, provider: "deepseek" };
}

export async function runOptimizeAnswer(
  question: string,
  answer: string,
  options?: { forceMock?: boolean }
): Promise<{
  optimizedAnswer: string;
  feedback: string;
  provider: AiProvider;
}> {
  if (!answer.trim()) {
    return {
      optimizedAnswer: "",
      feedback: "请先填写你的回答，再生成优化版。",
      provider: "mock",
    };
  }

  if (options?.forceMock || !isDeepSeekConfigured()) {
    return { ...optimizeInterviewAnswer(question, answer), provider: "mock" };
  }

  const content = await chatCompletion({
    system: ANSWER_SYSTEM,
    user: JSON.stringify({ question, answer }),
    temperature: 0.35,
    maxTokens: 1024,
  });

  const parsed = extractJsonObject(content) as {
    optimizedAnswer?: string;
    feedback?: string;
  };

  if (!parsed.optimizedAnswer) {
    return { ...optimizeInterviewAnswer(question, answer), provider: "deepseek" };
  }

  return {
    optimizedAnswer: parsed.optimizedAnswer,
    feedback: parsed.feedback || "",
    provider: "deepseek",
  };
}
