import type { FinalResume } from "@/types";

const RESUME_CSS = `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  font-weight: normal;
}

body {
  background-color: #f5f5f7;
  color: #111111;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", "PingFang SC", "Lantinghei SC", "Microsoft YaHei", sans-serif;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

h1, h2, h3, strong, b, .item-title, .item-subtitle, .skill-label, .job-intention {
  font-weight: normal;
}

.resume-container {
  background-color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin: 40px auto;
  max-width: 820px;
  min-height: 1160px;
  padding: 50px 60px;
}

header {
  border-bottom: 2px solid #111111;
  margin-bottom: 24px;
  padding-bottom: 16px;
}

.header-top {
  align-items: baseline;
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  gap: 16px;
  flex-wrap: wrap;
}

h1 {
  color: #000000;
  font-size: 26px;
  letter-spacing: 1px;
}

.job-intention {
  color: #333333;
  font-size: 15px;
}

.contact-info {
  color: #444444;
  display: flex;
  flex-wrap: wrap;
  font-size: 13px;
  gap: 12px;
}

.contact-info span:not(:last-child)::after {
  color: #cccccc;
  content: "|";
  margin-left: 12px;
}

.contact-info a {
  color: #111111;
  text-decoration: none;
}

section {
  margin-bottom: 24px;
}

h2 {
  border-bottom: 1px solid #111111;
  color: #111111;
  font-size: 15px;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
  padding-bottom: 4px;
  text-transform: uppercase;
}

.summary-content {
  color: #222222;
  font-size: 13.5px;
  line-height: 1.7;
  text-align: justify;
  white-space: pre-wrap;
}

.item-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
  gap: 12px;
  flex-wrap: wrap;
}

.item-title {
  color: #111111;
}

.item-subtitle {
  color: #222222;
}

.item-details {
  color: #2b2b2b;
  font-size: 13px;
  line-height: 1.6;
  margin-top: 4px;
}

.item-details p {
  margin-bottom: 2px;
}

.item-meta {
  color: #555555;
  font-size: 13px;
  white-space: nowrap;
}

.experience-item {
  margin-bottom: 16px;
}

.experience-item:last-child {
  margin-bottom: 0;
}

.bullet-list {
  list-style-type: none;
  margin-top: 6px;
  padding-left: 12px;
}

.bullet-list li {
  color: #2b2b2b;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 4px;
  position: relative;
  text-align: justify;
}

.bullet-list li::before {
  color: #111111;
  content: "•";
  font-size: 12px;
  left: -12px;
  position: absolute;
  top: -1px;
}

.skills-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skill-group {
  display: flex;
  font-size: 13px;
  gap: 8px;
}

.skill-label {
  min-width: 100px;
  width: 120px;
  flex-shrink: 0;
}

.skill-values {
  color: #2b2b2b;
  flex: 1;
}

.education-item {
  margin-bottom: 8px;
}

.education-item:last-child {
  margin-bottom: 0;
}

@media print {
  body {
    background-color: #ffffff;
    color: #000000;
  }

  .resume-container {
    box-shadow: none;
    margin: 0;
    max-width: 100%;
    min-height: auto;
    padding: 0;
    width: 100%;
  }

  section {
    page-break-inside: avoid;
  }

  @page {
    margin: 18mm 20mm;
    size: A4;
  }
}`;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function splitParts(line: string): string[] {
  return line
    .split(/[｜|]/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function isBulletLine(line: string): boolean {
  return /^[·•\-*\u2022]\s*/.test(line.trim());
}

function stripBullet(line: string): string {
  return line.replace(/^[·•\-*\u2022]\s*/, "").trim();
}

interface ExperienceBlock {
  title: string;
  subtitle: string;
  meta: string;
  bullets: string[];
  /** 教育等补充说明行（相关课程、荣誉等），按普通正文渲染 */
  details: string[];
}

function parseExperienceLines(lines: string[]): ExperienceBlock[] {
  const blocks: ExperienceBlock[] = [];
  let current: ExperienceBlock | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (isBulletLine(line)) {
      if (!current) {
        current = { title: "", subtitle: "", meta: "", bullets: [], details: [] };
        blocks.push(current);
      }
      current.bullets.push(stripBullet(line));
      continue;
    }

    const parts = splitParts(line);
    let title = parts[0] || line;
    let subtitle = "";
    let meta = "";

    if (parts.length >= 3) {
      subtitle = parts.slice(1, -1).join(" · ");
      meta = parts[parts.length - 1] || "";
    } else if (parts.length === 2) {
      const second = parts[1];
      if (/\d{4}/.test(second) || /至今|现在/.test(second)) {
        meta = second;
      } else {
        subtitle = second;
      }
    }

    current = { title, subtitle, meta, bullets: [], details: [] };
    blocks.push(current);
  }

  return blocks;
}

function parsePersonal(personalInfo: string): { name: string; contacts: string[] } {
  const tokens = personalInfo
    .split(/\n|[｜|]/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return { name: "个人简历", contacts: [] };
  }

  return {
    name: tokens[0],
    contacts: tokens.slice(1),
  };
}

function isEducationHeaderLine(line: string): boolean {
  const parts = splitParts(line);
  if (parts.length < 2) return false;
  // 学校｜专业｜学历｜时间，或至少含年份/至今
  return parts.length >= 3 || /\d{4}/.test(line) || /至今|现在/.test(line);
}

function parseEducationHeader(line: string): ExperienceBlock {
  const parts = splitParts(line);
  if (parts.length >= 3) {
    // 常见：学校｜专业｜学历｜时间
    const last = parts[parts.length - 1];
    const hasDate = /\d{4}/.test(last) || /至今|现在/.test(last);
    if (hasDate && parts.length >= 4) {
      return {
        title: parts[0],
        subtitle: parts.slice(1, -1).join(" · "),
        meta: last,
        bullets: [],
        details: [],
      };
    }
    return {
      title: parts[0],
      subtitle: parts.slice(1, -1).join(" · "),
      meta: parts[parts.length - 1],
      bullets: [],
      details: [],
    };
  }
  if (parts.length === 2) {
    const second = parts[1];
    if (/\d{4}/.test(second) || /至今|现在/.test(second)) {
      return { title: parts[0], subtitle: "", meta: second, bullets: [], details: [] };
    }
    return { title: parts[0], subtitle: second, meta: "", bullets: [], details: [] };
  }
  return { title: line, subtitle: "", meta: "", bullets: [], details: [] };
}

function parseEducation(education: string): ExperienceBlock[] {
  const lines = education
    .split(/\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const blocks: ExperienceBlock[] = [];
  let current: ExperienceBlock | null = null;

  for (const line of lines) {
    if (isEducationHeaderLine(line)) {
      current = parseEducationHeader(line);
      blocks.push(current);
      continue;
    }
    // 相关课程、荣誉等：挂到上一条教育经历下，不当成加粗标题
    if (!current) {
      current = { title: line, subtitle: "", meta: "", bullets: [], details: [] };
      blocks.push(current);
    } else {
      current.details.push(line);
    }
  }

  return blocks;
}

function renderItemDetails(details: string[]): string {
  if (details.length === 0) return "";
  return `<div class="item-details">
${details.map((d) => `          <p>${escapeHtml(d)}</p>`).join("\n")}
        </div>`;
}

function renderItemRow(block: ExperienceBlock): string {
  const title = escapeHtml(block.title || "（未填写）");
  const subtitle = block.subtitle
    ? `<span class="item-subtitle">${escapeHtml(block.subtitle)}</span>`
    : "";
  const meta = block.meta
    ? `<span class="item-meta">${escapeHtml(block.meta)}</span>`
    : "";

  return `<div class="item-row">
          <span class="item-title">${title}</span>
          ${subtitle}
          ${meta}
        </div>
        ${renderItemDetails(block.details)}`;
}

function renderExperienceBlocks(blocks: ExperienceBlock[]): string {
  if (blocks.length === 0) {
    return `<p class="summary-content">（暂无）</p>`;
  }

  return blocks
    .map((block) => {
      const bullets =
        block.bullets.length > 0
          ? `<ul class="bullet-list">
${block.bullets
  .map((b) => `          <li>${escapeHtml(b)}</li>`)
  .join("\n")}
        </ul>`
          : "";
      return `      <div class="experience-item">
        ${renderItemRow(block)}
        ${bullets}
      </div>`;
    })
    .join("\n");
}

function renderContactSpans(contacts: string[]): string {
  if (contacts.length === 0) return "";

  return contacts
    .map((c) => {
      const emailMatch = c.match(/([\w.+-]+@[\w.-]+\.\w+)/);
      if (emailMatch) {
        const email = emailMatch[1];
        const [before, ...afterParts] = c.split(email);
        const display =
          escapeHtml(before) +
          `<a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` +
          escapeHtml(afterParts.join(email));
        return `        <span>${display}</span>`;
      }
      return `        <span>${escapeHtml(c)}</span>`;
    })
    .join("\n");
}

function renderSkills(coreSkills: string[], tools: string[]): string {
  const groups: { label: string; values: string }[] = [];
  const cores = coreSkills.map((s) => s.trim()).filter(Boolean);
  const toolList = tools.map((s) => s.trim()).filter(Boolean);

  if (cores.length > 0) {
    groups.push({ label: "核心能力：", values: cores.join(" / ") });
  }
  if (toolList.length > 0) {
    groups.push({ label: "技能工具：", values: toolList.join(" / ") });
  }

  if (groups.length === 0) {
    return `<p class="summary-content">（暂无）</p>`;
  }

  return `<div class="skills-grid">
${groups
  .map(
    (g) => `        <div class="skill-group">
          <span class="skill-label">${escapeHtml(g.label)}</span>
          <span class="skill-values">${escapeHtml(g.values)}</span>
        </div>`
  )
  .join("\n")}
      </div>`;
}

/** 将最终简历渲染为完整 HTML 文档（与 resume.html 模板一致） */
export function formatFinalResumeHtml(resume: FinalResume): string {
  const { name, contacts } = parsePersonal(resume.personalInfo);
  const intention = resume.intention.trim();
  const educationBlocks = parseEducation(resume.education);
  const workBlocks = parseExperienceLines(resume.workExperience);
  const projectBlocks = parseExperienceLines(resume.projects);
  const summary = resume.summary.trim() || "（暂无）";
  const titleParts = [name, intention].filter(Boolean);
  const pageTitle = titleParts.length > 0 ? titleParts.join("_") : "个人简历";

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <style>
${RESUME_CSS}
  </style>
</head>
<body>
  <div class="resume-container">
    <header>
      <div class="header-top">
        <h1>${escapeHtml(name)}</h1>
        ${
          intention
            ? `<div class="job-intention">求职意向：${escapeHtml(intention)}</div>`
            : ""
        }
      </div>
      <div class="contact-info">
${renderContactSpans(contacts)}
      </div>
    </header>

    <section>
      <h2>教育背景</h2>
${
  educationBlocks.length > 0
    ? educationBlocks
        .map(
          (b) => `      <div class="education-item">
        ${renderItemRow(b)}
      </div>`
        )
        .join("\n")
    : `      <p class="summary-content">（暂无）</p>`
}
    </section>

    <section>
      <h2>个人摘要</h2>
      <div class="summary-content">${escapeHtml(summary)}</div>
    </section>

    <section>
      <h2>工作经历</h2>
${renderExperienceBlocks(workBlocks)}
    </section>

    <section>
      <h2>项目经历</h2>
${renderExperienceBlocks(projectBlocks)}
    </section>

    <section>
      <h2>技能工具</h2>
      ${renderSkills(resume.coreSkills, resume.tools)}
    </section>
  </div>
</body>
</html>
`;
}

function safeFileName(raw: string): string {
  return raw
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 60);
}

/** 触发浏览器下载 HTML 简历文件 */
export function downloadFinalResumeHtml(resume: FinalResume): string {
  const html = formatFinalResumeHtml(resume);
  const { name } = parsePersonal(resume.personalInfo);
  const intention = resume.intention.trim();
  const stamp = new Date().toISOString().slice(0, 10);
  const base = safeFileName(
    [name !== "个人简历" ? name : "", intention, "简历", stamp]
      .filter(Boolean)
      .join("_") || `简历_${stamp}`
  );
  const filename = `${base}.html`;

  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return filename;
}
