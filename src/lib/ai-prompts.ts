import type { UserInput, OptimizeStyle } from "@/types";

export const ANALYSIS_SYSTEM = `你是「简历专家」——面向求职的 JD 定制简历优化与面试准备 Agent。
根据用户提供的岗位 JD、简历与补充信息，输出完整分析结果。
必须只返回一个合法 JSON 对象，不要 Markdown，不要解释文字。
所有文案使用简体中文。
诚实、克制、专业：不要编造用户未提供的量化数据；Demo/个人实践需标明边界。
字段结构必须严格符合用户消息中的 schema。`;

export function buildAnalysisUserPrompt(input: UserInput): string {
  const stageLabel = input.jobStage === "pre_interview" ? "面试前" : "投递前";

  return `求职阶段：${stageLabel}

【目标/面试岗位】
${input.targetRole || "（未填）"}

【行业】
${input.industry || "（未填）"}

【公司类型】
${input.companyType || "（未填）"}

【公司全称】
${input.companyName || "（未填）"}

【希望突出能力】
${input.highlightSkills || "（未填）"}

【目标 JD】
${input.jdText}

【原始简历】
${input.resumeText}

【补充信息】
${input.extraInfo || "（无）"}

【是否声明连接知识库】
${input.useCozeKnowledge ? "是（可参考补充信息中的知识库材料）" : "否"}

请返回如下 JSON schema（键名必须一致）：
{
  "jd": {
    "responsibilities": string[],
    "hardRequirements": string[],
    "softRequirements": string[],
    "keywords": string[],
    "idealCandidate": string,
    "capabilities": [{ "capability": string, "importance": "高"|"中"|"低", "jdSignal": string }]
  },
  "diagnosis": {
    "matchScore": number, // 0-100
    "dimensions": [{ "name": string, "score": number, "comment": string }],
    "mainIssues": string[],
    "priorityFixes": string[]
  },
  "matchRows": [{
    "jdRequirement": string,
    "resumeEvidence": string,
    "strength": "强"|"中"|"弱"|"缺失",
    "needSupplement": boolean,
    "suggestion": string
  }],
  "probes": [{
    "id": string,
    "question": string,
    "why": string,
    "answer": "",
    "generatedBullet": ""
  }], // 5-10 条追问，answer 与 generatedBullet 固定为空字符串
  "optimizeRows": [{
    "id": string,
    "before": string,
    "after": string,
    "reason": string,
    "risk": string
  }], // 至少 4 条，before 尽量来自原简历原句
  "finalResume": {
    "personalInfo": string,
    "intention": string,
    "summary": string,
    "coreSkills": string[],
    "workExperience": string[],
    "projects": string[],
    "tools": string[],
    "education": string
  },
  "interviewMatch": {
    "fitPoints": [{
      "capability": string,
      "degree": "高适配"|"中适配"|"弱适配",
      "evidence": string,
      "interviewTip": string
    }], // 按高适配→弱适配排序
    "gapPoints": [{
      "capability": string,
      "degree": "严重缺乏"|"明显不足"|"可补齐",
      "gapReason": string,
      "howToCompensate": string
    }] // 按严重缺乏→可补齐排序
  },
  "interviewPrep": {
    "followUps": string[], // 10 条
    "evidenceNeeded": string[],
    "overclaims": string[],
    "dataToAdd": string[],
    "selfIntro": string
  },
  "interviewQAs": [{
    "id": string,
    "question": string,
    "tip": string,
    "userAnswer": "",
    "optimizedAnswer": "",
    "feedback": ""
  }] // 6 道模拟题，后三个字段固定为空字符串
}

要求：
1. matchScore 与维度评分要合理，有区分度。
2. probes 针对证据薄弱点提问。
3. finalResume 是完整可投递文本结构，基于原简历改写，不虚构公司名/学历。
4. 若阶段为面试前，interviewMatch / interviewPrep / interviewQAs 仍需完整填写。
5. 若填写了公司全称，自我介绍中可自然提及。`;
}

export const STYLE_SYSTEM = `你是简历表达优化助手。根据指定风格重写「修改对照」与「最终简历」。
只返回合法 JSON，不要 Markdown。使用简体中文。不要编造未提供的事实与数据。`;

export function buildStyleUserPrompt(
  input: UserInput,
  style: OptimizeStyle,
  currentResumeHint: string
): string {
  const styleMap: Record<OptimizeStyle, string> = {
    default: "默认平衡优化：清晰、有结果、可信",
    concise: "更简洁：压缩字数，保留关键信息",
    less_hype: "降低夸张：去掉强结果词，更可核验",
    ai_pm: "更偏 AI 产品：强调场景切分、评测、边界、RAG/Agent",
    tob_saas: "更偏 ToB SaaS：强调交付、多角色协作、方案可控",
  };

  return `风格：${styleMap[style]}（${style}）

【岗位】${input.targetRole}
【JD 摘要】
${input.jdText.slice(0, 2000)}

【原简历】
${input.resumeText.slice(0, 4000)}

【当前最终简历参考】
${currentResumeHint.slice(0, 3000)}

返回 JSON：
{
  "optimizeRows": [{ "id": string, "before": string, "after": string, "reason": string, "risk": string }],
  "finalResume": {
    "personalInfo": string,
    "intention": string,
    "summary": string,
    "coreSkills": string[],
    "workExperience": string[],
    "projects": string[],
    "tools": string[],
    "education": string
  }
}`;
}

export const BULLET_SYSTEM = `你是简历 bullet 改写助手。根据追问与用户回答，生成 1 条可用于简历的中文 bullet。
只返回 JSON：{ "bullet": string }。不要编造数据；以「· 」开头。`;

export const ANSWER_SYSTEM = `你是面试表达教练。根据题目与用户回答，输出优化后的口述表达与简短反馈。
只返回 JSON：{ "optimizedAnswer": string, "feedback": string }。
保留事实，不编造数据；控制在约 90-120 秒口述；对齐 AI 产品/ToB 语境。`;
