import type {
  AnalysisResult,
  FinalResume,
  OptimizeRow,
  OptimizeStyle,
  UserInput,
} from "@/types";
import {
  ANALYSIS_SYSTEM,
  ANSWER_SYSTEM,
  BULLET_SYSTEM,
  STYLE_SYSTEM,
  buildAnalysisUserPrompt,
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
  return { result, provider: "deepseek" };
}

export async function runStyleOptimize(
  input: UserInput,
  style: OptimizeStyle,
  currentResume: FinalResume,
  options?: { forceMock?: boolean }
): Promise<{
  optimizeRows: OptimizeRow[];
  finalResume: FinalResume;
  provider: AiProvider;
}> {
  if (options?.forceMock || !isDeepSeekConfigured()) {
    const data = regenerateOptimize(input, style);
    return { ...data, provider: "mock" };
  }

  const content = await chatCompletion({
    system: STYLE_SYSTEM,
    user: buildStyleUserPrompt(input, style, formatFinalResumeText(currentResume)),
    temperature: 0.3,
    maxTokens: 4096,
  });

  const parsed = extractJsonObject(content) as Record<string, unknown>;
  const normalized = normalizeAnalysisResult({
    optimizeRows: parsed.optimizeRows,
    finalResume: parsed.finalResume,
  });

  return {
    optimizeRows: normalized.optimizeRows.length
      ? normalized.optimizeRows
      : regenerateOptimize(input, style).optimizeRows,
    finalResume: normalized.finalResume.summary
      ? normalized.finalResume
      : regenerateOptimize(input, style).finalResume,
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
