import { NextResponse } from "next/server";
import type { UserInput } from "@/types";
import { runAnalysis } from "@/lib/ai-service";
import { DeepSeekError, isDeepSeekConfigured } from "@/lib/deepseek";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET() {
  return NextResponse.json({
    configured: isDeepSeekConfigured(),
    provider: isDeepSeekConfigured() ? "deepseek" : "mock",
    model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
  });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      input?: UserInput;
      forceMock?: boolean;
    };

    if (!body.input?.jdText?.trim() || !body.input?.resumeText?.trim()) {
      return NextResponse.json(
        { error: "请提供岗位 JD 与简历信息" },
        { status: 400 }
      );
    }

    const { result, provider } = await runAnalysis(body.input, {
      forceMock: body.forceMock,
    });

    return NextResponse.json({ result, provider });
  } catch (err) {
    const message =
      err instanceof DeepSeekError
        ? err.message
        : err instanceof Error
          ? err.message
          : "分析失败";
    console.error("[analyze]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
