import { NextResponse } from "next/server";
import type { FinalResume, OptimizeStyle, UserInput } from "@/types";
import { runStyleOptimize } from "@/lib/ai-service";
import { DeepSeekError } from "@/lib/deepseek";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      input?: UserInput;
      style?: OptimizeStyle;
      currentResume?: FinalResume;
      forceMock?: boolean;
    };

    if (!body.input || !body.style || !body.currentResume) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    const data = await runStyleOptimize(
      body.input,
      body.style,
      body.currentResume,
      { forceMock: body.forceMock }
    );

    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof DeepSeekError
        ? err.message
        : err instanceof Error
          ? err.message
          : "风格优化失败";
    console.error("[optimize-style]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
