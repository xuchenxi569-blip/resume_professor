import { NextResponse } from "next/server";
import type { OptimizeStyle, ProbeCard, UserInput } from "@/types";
import { runProbeOptimize } from "@/lib/ai-service";
import { DeepSeekError } from "@/lib/deepseek";

export const runtime = "nodejs";
export const maxDuration = 90;

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      input?: UserInput;
      probes?: ProbeCard[];
      style?: OptimizeStyle;
      idealCandidate?: string;
      forceMock?: boolean;
    };

    if (!body.input || !body.probes || !body.style) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    const data = await runProbeOptimize(
      body.input,
      body.probes,
      body.style,
      body.idealCandidate || "",
      { forceMock: body.forceMock }
    );

    return NextResponse.json(data);
  } catch (err) {
    const message =
      err instanceof DeepSeekError
        ? err.message
        : err instanceof Error
          ? err.message
          : "追问后优化失败";
    console.error("[optimize-probe]", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
