import { NextResponse } from "next/server";
import { parseResumeFile } from "@/lib/parse-resume";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "请上传文件（字段名 file）" }, { status: 400 });
    }

    const result = await parseResumeFile(file);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({
      text: result.text,
      filename: result.filename,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "上传解析失败" },
      { status: 500 }
    );
  }
}
