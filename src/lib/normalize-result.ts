import type {
  AnalysisResult,
  EvidenceStrength,
  FinalResume,
  FitCapability,
  FitDegree,
  GapCapability,
  GapDegree,
  InterviewMatchResult,
  InterviewPrepResult,
  InterviewQA,
  MatchRow,
  OptimizeRow,
  ProbeCard,
  DiagnosisResult,
  JDParseResult,
} from "@/types";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function asNumber(v: unknown, fallback = 0): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function asBool(v: unknown, fallback = false): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => asString(x)).filter(Boolean);
}

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

const STRENGTHS: EvidenceStrength[] = ["强", "中", "弱", "缺失"];
const FIT: FitDegree[] = ["高适配", "中适配", "弱适配"];
const GAP: GapDegree[] = ["严重缺乏", "明显不足", "可补齐"];

function normalizeJd(raw: unknown): JDParseResult {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const caps = Array.isArray(o.capabilities) ? o.capabilities : [];
  return {
    responsibilities: asStringArray(o.responsibilities),
    hardRequirements: asStringArray(o.hardRequirements),
    softRequirements: asStringArray(o.softRequirements),
    keywords: asStringArray(o.keywords),
    idealCandidate: asString(o.idealCandidate, "（模型未给出理想候选人描述）"),
    capabilities: caps.map((c, i) => {
      const row = (c && typeof c === "object" ? c : {}) as Record<string, unknown>;
      const importance = asString(row.importance, "中");
      return {
        capability: asString(row.capability, `能力 ${i + 1}`),
        importance: (["高", "中", "低"].includes(importance)
          ? importance
          : "中") as "高" | "中" | "低",
        jdSignal: asString(row.jdSignal),
      };
    }),
  };
}

function normalizeDiagnosis(raw: unknown): DiagnosisResult {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const dims = Array.isArray(o.dimensions) ? o.dimensions : [];
  return {
    matchScore: clampScore(asNumber(o.matchScore, 60)),
    dimensions: dims.map((d, i) => {
      const row = (d && typeof d === "object" ? d : {}) as Record<string, unknown>;
      return {
        name: asString(row.name, `维度 ${i + 1}`),
        score: clampScore(asNumber(row.score, 60)),
        comment: asString(row.comment),
      };
    }),
    mainIssues: asStringArray(o.mainIssues),
    priorityFixes: asStringArray(o.priorityFixes),
  };
}

function normalizeMatchRows(raw: unknown): MatchRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const strength = asString(row.strength, "中") as EvidenceStrength;
    return {
      jdRequirement: asString(row.jdRequirement, `要求 ${i + 1}`),
      resumeEvidence: asString(row.resumeEvidence, "未见明确证据"),
      strength: STRENGTHS.includes(strength) ? strength : "中",
      needSupplement: asBool(row.needSupplement, true),
      suggestion: asString(row.suggestion),
    };
  });
}

function normalizeProbes(raw: unknown): ProbeCard[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    return {
      id: asString(row.id, `p${i + 1}`),
      question: asString(row.question, `追问 ${i + 1}`),
      why: asString(row.why),
      answer: "",
      generatedBullet: "",
    };
  });
}

function normalizeOptimizeRows(raw: unknown): OptimizeRow[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    return {
      id: asString(row.id, `o${i + 1}`),
      before: asString(row.before),
      after: asString(row.after),
      reason: asString(row.reason),
      risk: asString(row.risk, "无"),
    };
  });
}

function normalizeFinalResume(raw: unknown): FinalResume {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    personalInfo: asString(o.personalInfo),
    intention: asString(o.intention),
    summary: asString(o.summary),
    coreSkills: asStringArray(o.coreSkills),
    workExperience: asStringArray(o.workExperience),
    projects: asStringArray(o.projects),
    tools: asStringArray(o.tools),
    education: asString(o.education),
  };
}

function normalizeInterviewMatch(raw: unknown): InterviewMatchResult {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const fitRaw = Array.isArray(o.fitPoints) ? o.fitPoints : [];
  const gapRaw = Array.isArray(o.gapPoints) ? o.gapPoints : [];

  const fitPoints: FitCapability[] = fitRaw.map((item, i) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const degree = asString(row.degree, "中适配") as FitDegree;
    return {
      capability: asString(row.capability, `适配点 ${i + 1}`),
      degree: FIT.includes(degree) ? degree : "中适配",
      evidence: asString(row.evidence),
      interviewTip: asString(row.interviewTip),
    };
  });

  const gapPoints: GapCapability[] = gapRaw.map((item, i) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const degree = asString(row.degree, "可补齐") as GapDegree;
    return {
      capability: asString(row.capability, `缺口 ${i + 1}`),
      degree: GAP.includes(degree) ? degree : "可补齐",
      gapReason: asString(row.gapReason),
      howToCompensate: asString(row.howToCompensate),
    };
  });

  const fitOrder: Record<FitDegree, number> = { 高适配: 0, 中适配: 1, 弱适配: 2 };
  const gapOrder: Record<GapDegree, number> = { 严重缺乏: 0, 明显不足: 1, 可补齐: 2 };

  fitPoints.sort((a, b) => fitOrder[a.degree] - fitOrder[b.degree]);
  gapPoints.sort((a, b) => gapOrder[a.degree] - gapOrder[b.degree]);

  return { fitPoints, gapPoints };
}

function normalizeInterviewPrep(raw: unknown): InterviewPrepResult {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    followUps: asStringArray(o.followUps),
    evidenceNeeded: asStringArray(o.evidenceNeeded),
    overclaims: asStringArray(o.overclaims),
    dataToAdd: asStringArray(o.dataToAdd),
    selfIntro: asString(o.selfIntro),
  };
}

function normalizeInterviewQAs(raw: unknown): InterviewQA[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item, i) => {
    const row = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    return {
      id: asString(row.id, `q${i + 1}`),
      question: asString(row.question, `模拟题 ${i + 1}`),
      tip: asString(row.tip),
      userAnswer: "",
      optimizedAnswer: "",
      feedback: "",
    };
  });
}

export function normalizeAnalysisResult(raw: unknown): AnalysisResult {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    jd: normalizeJd(o.jd),
    diagnosis: normalizeDiagnosis(o.diagnosis),
    matchRows: normalizeMatchRows(o.matchRows),
    probes: normalizeProbes(o.probes),
    optimizeRows: normalizeOptimizeRows(o.optimizeRows),
    finalResume: normalizeFinalResume(o.finalResume),
    interviewMatch: normalizeInterviewMatch(o.interviewMatch),
    interviewPrep: normalizeInterviewPrep(o.interviewPrep),
    interviewQAs: normalizeInterviewQAs(o.interviewQAs),
  };
}
