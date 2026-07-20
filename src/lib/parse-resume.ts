import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

const MAX_BYTES = 5 * 1024 * 1024;

const EXT_ALLOW = new Set([".txt", ".md", ".docx", ".pdf"]);

const MIME_ALLOW = new Set([
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream", // browsers sometimes send this
]);

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i).toLowerCase() : "";
}

function normalizeText(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim();
}

async function parseTxt(buffer: Buffer): Promise<string> {
  let text = buffer.toString("utf8");
  if (text.includes("\uFFFD") || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(text.slice(0, 200))) {
    text = buffer.toString("latin1");
  }
  // strip UTF-8 BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  return normalizeText(text);
}

async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return normalizeText(result.value || "");
}

async function parsePdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return normalizeText(result.text || "");
  } finally {
    await parser.destroy().catch(() => undefined);
  }
}

export type ParseResumeResult =
  | { ok: true; text: string; filename: string }
  | { ok: false; error: string; status: number };

export async function parseResumeFile(
  file: File
): Promise<ParseResumeResult> {
  const filename = file.name || "upload";
  const ext = extOf(filename);

  if (!EXT_ALLOW.has(ext)) {
    return {
      ok: false,
      status: 400,
      error: "仅支持 .txt / .md / .docx / .pdf 文件",
    };
  }

  if (file.size <= 0) {
    return { ok: false, status: 400, error: "文件为空" };
  }

  if (file.size > MAX_BYTES) {
    return { ok: false, status: 400, error: "文件过大，请上传不超过 5MB 的文件" };
  }

  if (file.type && !MIME_ALLOW.has(file.type) && !file.type.startsWith("text/")) {
    // soft check: still allow if extension is ok
    if (!EXT_ALLOW.has(ext)) {
      return { ok: false, status: 400, error: "不支持的文件类型" };
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    let text = "";
    if (ext === ".txt" || ext === ".md") {
      text = await parseTxt(buffer);
    } else if (ext === ".docx") {
      text = await parseDocx(buffer);
    } else if (ext === ".pdf") {
      text = await parsePdf(buffer);
    }

    if (!text) {
      return {
        ok: false,
        status: 422,
        error:
          "未能从文件中提取到文本。若为扫描版 PDF，请改用可复制文本的 PDF / Word，或直接粘贴简历内容。",
      };
    }

    return { ok: true, text, filename };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "解析失败";
    if (/password|encrypt/i.test(msg)) {
      return {
        ok: false,
        status: 422,
        error: "文件可能已加密，请先解除保护后再上传",
      };
    }
    return {
      ok: false,
      status: 500,
      error: `解析失败：${msg}。建议改用可复制文本的 PDF / Word，或直接粘贴。`,
    };
  }
}
