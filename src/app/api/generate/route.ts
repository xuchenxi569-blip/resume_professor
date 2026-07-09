import { NextResponse } from "next/server";
import { runGenerateBullet, runOptimizeAnswer } from "@/lib/ai-service";
import { DeepSeekError } from "@/lib/deepseek";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      action?: "bullet" | "interview_answer";
      question?: string;
      answer?: string;
      forceMock?: boolean;
    };

    if (!body.question || body.answer === undefined) {
      return NextResponse.json({ error: "缺少 question/answer" }, { status: 400 });
    }

    if (body.action === "interview_answer") {
      const data = await runOptimizeAnswer(body.question, body.answer, {
        forceMock: body.forceMock,
      });
      return NextResponse.json(data);
    }

    const data = await runGenerateBullet(body.question, body.answer, {
      forceMock: body.forceMock,
    });
    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof DeepSeekError
        ? err.message
        : err instanceof Error
          ? err.message
          : "生成失败";
    console.error("[generate]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
