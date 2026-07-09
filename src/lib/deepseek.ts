/**
 * DeepSeek Chat Completions（OpenAI 兼容）
 * Docs: https://api-docs.deepseek.com/
 */

const DEFAULT_BASE = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-chat";

export function isDeepSeekConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY?.trim());
}

export function getDeepSeekConfig() {
  return {
    apiKey: process.env.DEEPSEEK_API_KEY?.trim() || "",
    baseUrl: (process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE).replace(/\/$/, ""),
    model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
  };
}

export class DeepSeekError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "DeepSeekError";
    this.status = status;
  }
}

export async function chatCompletion(options: {
  system: string;
  user: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const { apiKey, baseUrl, model } = getDeepSeekConfig();
  if (!apiKey) {
    throw new DeepSeekError("未配置 DEEPSEEK_API_KEY");
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 8192,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: options.system },
        { role: "user", content: options.user },
      ],
    }),
  });

  const raw = await res.text();
  let data: {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  try {
    data = JSON.parse(raw);
  } catch {
    throw new DeepSeekError(`DeepSeek 返回非 JSON：${raw.slice(0, 200)}`, res.status);
  }

  if (!res.ok) {
    throw new DeepSeekError(
      data.error?.message || `DeepSeek 请求失败 (${res.status})`,
      res.status
    );
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new DeepSeekError("DeepSeek 返回空内容");
  }
  return content;
}

/** 从模型输出中提取 JSON 对象 */
export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    /* continue */
  }

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    return JSON.parse(fence[1].trim());
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return JSON.parse(trimmed.slice(start, end + 1));
  }

  throw new DeepSeekError("无法从模型输出中解析 JSON");
}
