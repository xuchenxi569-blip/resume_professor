export type JobStage = "pre_apply" | "pre_interview";

export type ApplyStep =
  | "input"
  | "jd_parse"
  | "diagnosis"
  | "match"
  | "probe"
  | "optimize"
  | "final_resume"
  | "export";

export type InterviewStep =
  | "input"
  | "jd_parse"
  | "interview_match"
  | "interview_prep"
  | "interview_sim";

/** 适配程度：高 → 低 */
export type FitDegree = "高适配" | "中适配" | "弱适配";

/** 缺乏程度：重 → 轻 */
export type GapDegree = "严重缺乏" | "明显不足" | "可补齐";

export interface FitCapability {
  capability: string;
  degree: FitDegree;
  evidence: string;
  interviewTip: string;
}

export interface GapCapability {
  capability: string;
  degree: GapDegree;
  gapReason: string;
  howToCompensate: string;
}

export interface InterviewMatchResult {
  fitPoints: FitCapability[];
  gapPoints: GapCapability[];
}

export type StepId = ApplyStep | InterviewStep;

export interface UserInput {
  targetRole: string;
  industry: string;
  companyType: string;
  /** 面试前：公司全称 */
  companyName: string;
  jobStage: JobStage;
  highlightSkills: string;
  jdText: string;
  resumeText: string;
  extraInfo: string;
  useCozeKnowledge: boolean;
}

export interface CapabilityRow {
  capability: string;
  importance: "高" | "中" | "低";
  jdSignal: string;
}

export interface JDParseResult {
  responsibilities: string[];
  hardRequirements: string[];
  softRequirements: string[];
  keywords: string[];
  idealCandidate: string;
  capabilities: CapabilityRow[];
}

export interface DimensionScore {
  name: string;
  score: number;
  comment: string;
}

export interface DiagnosisResult {
  matchScore: number;
  dimensions: DimensionScore[];
  mainIssues: string[];
  priorityFixes: string[];
}

export type EvidenceStrength = "强" | "中" | "弱" | "缺失";

export interface MatchRow {
  jdRequirement: string;
  resumeEvidence: string;
  strength: EvidenceStrength;
  needSupplement: boolean;
  suggestion: string;
}

export interface ProbeCard {
  id: string;
  question: string;
  why: string;
  answer: string;
  generatedBullet: string;
}

export interface OptimizeRow {
  id: string;
  before: string;
  after: string;
  reason: string;
  risk: string;
}

export type OptimizeStyle =
  | "default"
  | "concise"
  | "less_hype"
  | "ai_pm"
  | "tob_saas";

export interface FinalResume {
  personalInfo: string;
  intention: string;
  summary: string;
  coreSkills: string[];
  workExperience: string[];
  projects: string[];
  tools: string[];
  education: string;
}

export interface InterviewPrepResult {
  followUps: string[];
  evidenceNeeded: string[];
  overclaims: string[];
  dataToAdd: string[];
  selfIntro: string;
}

export interface InterviewQA {
  id: string;
  question: string;
  tip: string;
  userAnswer: string;
  optimizedAnswer: string;
  feedback: string;
}

export interface AnalysisResult {
  jd: JDParseResult;
  diagnosis: DiagnosisResult;
  matchRows: MatchRow[];
  probes: ProbeCard[];
  optimizeRows: OptimizeRow[];
  finalResume: FinalResume;
  interviewMatch: InterviewMatchResult;
  interviewPrep: InterviewPrepResult;
  interviewQAs: InterviewQA[];
}
