import type {
  AnalysisResult,
  FinalResume,
  OptimizeRow,
  OptimizeStyle,
  ProbeCard,
  UserInput,
} from "@/types";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildFinalResume(
  input: UserInput,
  style: OptimizeStyle = "default"
): FinalResume {
  const nameLine = "张明｜AI 产品经理方向｜4 年 B 端产品经验｜杭州";
  const contact = "电话：138****0000｜邮箱：zhangming@example.com";

  const summaries: Record<OptimizeStyle, string> = {
    default:
      "4 年 B 端产品经验，深耕 ERP / WMS / 经营数据报表场景，擅长需求拆解、跨部门推进与数据验证。近期完成 AI 客服 Agent、Prompt 助手等落地实践，熟悉 RAG / Workflow / 效果评测闭环，目标转型 AI 产品经理，服务 ToB AI SaaS 场景。",
    concise:
      "4 年 B 端产品，覆盖 ERP/WMS/经营报表。有 AI 客服 Agent 与 Prompt 实践，熟悉 RAG/Workflow，目标 AI 产品经理。",
    less_hype:
      "具备 4 年企业信息化产品经验，参与过 ERP、WMS 与经营报表相关需求与落地。自学并完成 AI 客服、Prompt 工具等个人实践项目，正在系统补齐 AI 产品方法论与效果评测能力，希望从事 AI 产品经理工作。",
    ai_pm:
      "B 端产品背景 + AI 应用实践。能把业务问题拆成可评测的 AI 场景：曾设计客服 Agent 的订单查询/推荐 MVP、知识库检索与转人工策略，并关注准确率与完成率。熟悉 Prompt、RAG、Workflow，目标成为能推动 AI 能力上线的产品经理。",
    tob_saas:
      "熟悉 ToB 交付语境：需求澄清、优先级、验收与跨角色协作。有 ERP/WMS/经营分析业务理解，能把 AI 能力映射到可售卖、可交付的解决方案。目标加入 AI SaaS 团队，负责场景定义、PRD 与效果迭代。",
  };

  const work: Record<OptimizeStyle, string[]> = {
    default: [
      "某制造企业信息化部｜产品经理｜2022.03 - 至今",
      "· 负责 ERP 采购/库存模块需求全流程：业务访谈 → 方案拆解 → 排期协同 → 验收，保障版本按节奏交付。",
      "· 参与 WMS 上线，梳理出入库与异常处理流程，降低现场操作歧义，提升仓配协同效率。",
      "· 搭建经营数据报表（库存周转、采购执行等），支撑管理层周会决策，形成「指标定义 → 取数 → 复盘」闭环。",
      "· 协调供应链、财务、IT 多方利益，推动高优先级需求落地，积累 ToB 跨部门推进经验。",
      "某物流科技公司｜产品助理/产品经理｜2021.07 - 2022.02",
      "· 协助输出仓储相关需求文档与原型，跟进缺陷修复与上线验证。",
    ],
    concise: [
      "某制造企业｜产品经理｜2022.03 - 至今",
      "· ERP 采购/库存需求管理与验收；参与 WMS 上线流程梳理。",
      "· 搭建经营报表，支撑管理层看库存周转与采购执行。",
      "某物流科技｜产品｜2021.07 - 2022.02｜仓储需求与上线验证。",
    ],
    less_hype: [
      "某制造企业信息化部｜产品经理｜2022.03 - 至今",
      "· 负责 ERP 采购与库存相关需求对接、文档与验收跟进。",
      "· 参与 WMS 上线过程中的流程梳理与问题跟进。",
      "· 参与经营数据报表需求，协助管理层查看库存与采购相关指标。",
      "某物流科技公司｜产品助理/产品经理｜2021.07 - 2022.02",
      "· 协助仓储需求文档、原型与上线验证。",
    ],
    ai_pm: [
      "某制造企业信息化部｜产品经理｜2022.03 - 至今",
      "· 将业务诉求转化为可验收需求：在 ERP/WMS 场景中明确规则、异常路径与验收标准，为后续 AI 场景拆解打基础。",
      "· 用经营报表验证「指标是否被使用」：推动库存周转等指标进入周会，形成数据驱动的优先级讨论。",
      "· 跨部门推进经验可迁移到 AI 产品：对齐业务期望、算法边界与工程成本。",
      "某物流科技公司｜产品助理/产品经理｜2021.07 - 2022.02",
      "· 完成需求文档与上线验证，熟悉从方案到上线的基本闭环。",
    ],
    tob_saas: [
      "某制造企业信息化部｜产品经理｜2022.03 - 至今",
      "· ToB 场景：对接多角色（供应链/财务/IT），完成需求澄清、优先级与验收，贴近 SaaS 交付协作方式。",
      "· 业务域资产：ERP 采购库存、WMS 出入库、经营分析指标，可作为 AI 解决方案的行业切入点。",
      "· 结果导向：报表进入管理层周会，说明需求不止上线，还要被使用。",
      "某物流科技公司｜产品助理/产品经理｜2021.07 - 2022.02",
      "· 仓储产品需求与上线验证，理解仓配业务语言。",
    ],
  };

  const projects: Record<OptimizeStyle, string[]> = {
    default: [
      "AI 智能客服 Agent（个人实践｜电商场景）",
      "· 基于 Coze 搭建订单查询 + 推荐 MVP；设计 Workflow、知识库检索与转人工策略。",
      "· 明确先做高频可结构化场景，控制幻觉与人工接管边界。",
      "经营数据报表",
      "· 定义核心指标与取数口径，推动 BI 落地并进入管理层周会。",
      "Prompt 助手",
      "· 模板化与版本管理，提升 Prompt 复用与迭代效率。",
    ],
    concise: [
      "AI 客服 Agent：订单查询/推荐 MVP，Workflow + 知识库 + 转人工。",
      "经营报表：指标口径 → BI → 周会使用。",
      "Prompt 助手：模板与版本管理。",
    ],
    less_hype: [
      "AI 智能客服 Demo：用 Coze 做订单查询与推荐流程，并设计转人工规则。",
      "经营数据报表：参与指标梳理与 BI 落地。",
      "Prompt 助手：个人工具，用于模板与版本记录。",
    ],
    ai_pm: [
      "AI 智能客服 Agent｜场景定义与效果闭环",
      "· MVP 切分：优先订单查询（结构化）与推荐；延后复杂售后。",
      "· 能力组合：RAG 知识库 + Workflow + 转人工；关注幻觉与接管时机。",
      "· 可讲述点：为何不上大而全、如何评测、如何迭代 Prompt/知识库。",
      "经营报表｜数据验证习惯",
      "· 指标被周会使用，证明「定义 → 落地 → 复盘」能力。",
      "Prompt 助手｜评测与版本意识",
      "· 将 Prompt 当产品资产做版本管理。",
    ],
    tob_saas: [
      "AI 客服 Agent｜可演示的解决方案切片",
      "· 面向业务痛点（咨询成本/响应时效）给出可交付 MVP，而非模型炫技。",
      "· 明确边界与人工兜底，符合 ToB 对可控性与风险的要求。",
      "经营报表 + ERP/WMS｜行业 know-how",
      "· 可作为 AI SaaS 进入制造/供应链客户的业务翻译层。",
    ],
  };

  return {
    personalInfo: `${nameLine}\n${contact}`,
    intention: input.targetRole || "AI 产品经理",
    summary: summaries[style],
    coreSkills: [
      "B 端需求分析与优先级",
      "ERP / WMS / 经营分析业务理解",
      "跨部门协作与验收推进",
      "AI 应用：RAG / Agent / Workflow / Prompt",
      "数据验证与效果指标意识",
    ],
    workExperience: work[style],
    projects: projects[style],
    tools: [
      "文档/协作：飞书、Axure",
      "数据：Excel、SQL（基础）、SmartBI",
      "AI：Coze、Cursor、Prompt、RAG 实践",
    ],
    education: "某大学｜信息管理与信息系统｜本科｜2017-2021",
  };
}

function buildOptimizeRows(style: OptimizeStyle): OptimizeRow[] {
  const variants: Record<OptimizeStyle, OptimizeRow[]> = {
    default: [
      {
        id: "o1",
        before: "负责 ERP 采购与库存模块需求管理，对接业务与研发，推动版本迭代",
        after:
          "负责 ERP 采购/库存模块需求全流程（访谈→拆解→排期→验收），保障版本按节奏交付，沉淀可复用的需求与验收标准",
        reason: "补齐动作链路与结果，体现产品闭环而非「对接」空词",
        risk: "避免写成「独立从 0 搭建 ERP」——你是模块负责人而非整套系统 owner",
      },
      {
        id: "o2",
        before: "搭建经营数据报表，支持管理层看库存周转与采购执行情况",
        after:
          "定义库存周转/采购执行等核心指标与口径，推动经营报表进入管理层周会，形成指标复盘习惯",
        reason: "强调「被使用」与口径，贴近数据驱动叙事",
        risk: "不要夸大个人独立完成全部取数开发；突出产品侧定义与推动",
      },
      {
        id: "o3",
        before: "基于 Coze 搭建电商客服 Agent，覆盖订单查询与推荐场景",
        after:
          "以订单查询+推荐为 MVP，设计 Workflow、知识库检索与转人工策略，验证高结构化场景优先落地的路径",
        reason: "突出场景切分与 AI 产品决策，而非工具名堆砌",
        risk: "标注为个人实践/Demo，避免暗示已大规模商业化上线",
      },
      {
        id: "o4",
        before: "近期自学并实践 RAG、Agent、Prompt 工程，希望转型 AI 产品经理",
        after:
          "通过 AI 客服与 Prompt 助手等实践，补齐 RAG/Agent/效果边界认知，目标转型 AI 产品经理（ToB AI SaaS）",
        reason: "把学习转化为可验证项目证据，并对齐目标赛道",
        risk: "不要写「精通大模型底层」；保持应用层产品定位",
      },
    ],
    concise: [
      {
        id: "o1",
        before: "负责 ERP 采购与库存模块需求管理，对接业务与研发，推动版本迭代",
        after: "负责 ERP 采购/库存需求：访谈、拆解、排期、验收",
        reason: "更短、信息密度更高",
        risk: "过短可能丢失业务域亮点，面试时需口头补充",
      },
      {
        id: "o2",
        before: "搭建经营数据报表，支持管理层看库存周转与采购执行情况",
        after: "推动经营报表（库存周转/采购执行）进入管理层周会",
        reason: "一句说清结果",
        risk: "口径与协作细节需在面试准备",
      },
      {
        id: "o3",
        before: "基于 Coze 搭建电商客服 Agent，覆盖订单查询与推荐场景",
        after: "AI 客服 MVP：订单查询+推荐；Workflow/知识库/转人工",
        reason: "压缩工具叙事，保留能力关键词",
        risk: "仍需标明个人实践",
      },
      {
        id: "o4",
        before: "希望转型 AI 产品经理",
        after: "目标：AI 产品经理｜ToB AI SaaS",
        reason: "意向更具体",
        risk: "无",
      },
    ],
    less_hype: [
      {
        id: "o1",
        before: "保障版本按节奏交付，沉淀可复用的需求与验收标准",
        after: "跟进 ERP 采购/库存相关需求的文档、排期沟通与验收",
        reason: "降低「保障/沉淀」等强结果词，更可核验",
        risk: "表达偏保守，匹配分可能略降，但面试更稳",
      },
      {
        id: "o2",
        before: "形成指标复盘习惯",
        after: "参与经营报表需求，报表被用于管理层周会",
        reason: "用事实替代习惯宣称",
        risk: "无",
      },
      {
        id: "o3",
        before: "验证高结构化场景优先落地的路径",
        after: "完成客服订单查询与推荐的 Demo 流程设计，并设定转人工规则",
        reason: "去掉方法论口吻，保留可演示事实",
        risk: "无",
      },
      {
        id: "o4",
        before: "补齐 RAG/Agent/效果边界认知",
        after: "通过个人项目了解 RAG、Agent 与 Prompt 的基本用法与局限",
        reason: "避免「补齐认知」这类难验证表述",
        risk: "无",
      },
    ],
    ai_pm: [
      {
        id: "o1",
        before: "负责 ERP 采购与库存模块需求管理",
        after:
          "在 ERP 场景中将业务规则与异常路径产品化，输出可验收需求——可迁移到 AI 场景的「问题定义与边界」能力",
        reason: "显式建立传统产品 → AI 产品的能力迁移桥",
        risk: "迁移叙事需有项目例证，否则显空",
      },
      {
        id: "o2",
        before: "搭建经营数据报表",
        after:
          "以「指标是否被决策使用」验证需求价值，为后续 AI 效果指标（准确率/完成率）建立同一套验证习惯",
        reason: "对齐 JD 对数据验证的要求",
        risk: "不要把报表项目直接说成 AI 评测经验",
      },
      {
        id: "o3",
        before: "覆盖订单查询与推荐场景",
        after:
          "按频率与结构化程度切 MVP；用 RAG+Workflow 处理可检索问题，不确定时转人工，控制幻觉风险",
        reason: "体现 AI 产品经理核心决策：切场景、选能力、控风险",
        risk: "技术细节点到为止，避免假装算法背景",
      },
      {
        id: "o4",
        before: "Prompt 助手提升写 Prompt 效率",
        after:
          "将 Prompt 模板化并做版本管理，形成「改 Prompt → 抽检 → 回写」的小闭环",
        reason: "对应 JD 加分项：Prompt/评测闭环",
        risk: "规模是个人工具，表述需诚实",
      },
    ],
    tob_saas: [
      {
        id: "o1",
        before: "对接业务与研发",
        after:
          "在多角色（业务/IT/财务）间澄清需求与优先级，按 ToB 交付方式推进验收",
        reason: "强化 SaaS/ToB 协作语言",
        risk: "无",
      },
      {
        id: "o2",
        before: "参与 WMS 上线",
        after:
          "梳理仓配出入库与异常流程，沉淀可对外讲清的业务语言，便于映射 AI 解决方案",
        reason: "把业务域变成售前/方案资产",
        risk: "不要暗示有完整行业解决方案售卖经验",
      },
      {
        id: "o3",
        before: "AI 客服 Agent",
        after:
          "针对咨询成本与响应时效痛点，交付可演示的 MVP 切片，并明确人工兜底——符合 ToB 对可控性的要求",
        reason: "从客户价值与风险可控叙事",
        risk: "Demo ≠ 客户交付案例",
      },
      {
        id: "o4",
        before: "希望转型 AI 产品经理",
        after: "目标加入 AI SaaS 团队，负责场景定义、PRD 与效果迭代",
        reason: "岗位语言更 ToB 产品化",
        risk: "无",
      },
    ],
  };
  return variants[style];
}

export async function runMockAnalysis(input: UserInput): Promise<AnalysisResult> {
  await delay(900);

  const role = input.targetRole || "AI 产品经理";

  const probes: ProbeCard[] = [
    {
      id: "p1",
      question: "经营报表里，你亲自定义了哪些指标？口径争议如何解决？",
      why: "把「搭建报表」落到可验证的产品决策",
      answer: "",
      generatedBullet: "",
    },
    {
      id: "p2",
      question: "WMS 上线中，你负责的边界是什么？最难推动的一次对齐是什么？",
      why: "澄清贡献度，避免面试被追问虚报",
      answer: "",
      generatedBullet: "",
    },
    {
      id: "p3",
      question: "AI 客服为何先做订单查询而不是售后？你如何向「业务方」解释？",
      why: "检验 AI 场景切分与优先级能力",
      answer: "",
      generatedBullet: "",
    },
    {
      id: "p4",
      question: "转人工规则怎么定？有没有误伤或漏转的例子？",
      why: "对应 JD 对 AI 边界与风险的要求",
      answer: "",
      generatedBullet: "",
    },
    {
      id: "p5",
      question: "你如何评测客服 Agent 效果？现在有哪些指标，还缺什么？",
      why: "对齐「效果指标而非堆功能」",
      answer: "",
      generatedBullet: "",
    },
    {
      id: "p6",
      question: "ERP 需求里，你做过最漂亮的一次优先级取舍是什么？",
      why: "迁移传统产品判断力到 AI 排期",
      answer: "",
      generatedBullet: "",
    },
    {
      id: "p7",
      question: "Prompt 助手解决了你自己的什么具体痛点？有无前后对比？",
      why: "把工具项目讲成问题-方案-验证",
      answer: "",
      generatedBullet: "",
    },
    {
      id: "p8",
      question: "如果入职后 30 天，你打算先输出什么来证明价值？",
      why: "面试高频；也可反写进简历意向/摘要",
      answer: "",
      generatedBullet: "",
    },
  ];

  return {
    jd: {
      responsibilities: [
        "负责 AI 产品规划与迭代，输出 PRD 与验收标准",
        "协同算法/工程/设计，推动 RAG、Agent、Workflow 落地",
        "基于反馈与指标优化准确率、完成率、满意度等",
        "竞品与趋势研究，沉淀 AI 产品方法论",
        "理解 ToB 业务痛点，将 AI 转化为可交付方案",
      ],
      hardRequirements: [
        "3-5 年产品经理经验",
        "B 端 / SaaS / 企业数字化背景优先",
        "有 AI 应用落地项目经验（对话/知识库/Agent 等）",
        "需求分析、优先级与跨部门推动能力",
        "能用数据验证假设，关注效果指标",
      ],
      softRequirements: [
        "能向业务解释 AI 能力边界与风险",
        "从 Demo 推进到可上线的意识",
        "供应链/ERP/WMS/经营分析等业务域加分",
        "Prompt / 评测 / 抽检闭环加分",
        "沟通清晰、结果导向、克制不夸张",
      ],
      keywords: [
        "AI 产品经理",
        "RAG",
        "Agent",
        "Workflow",
        "PRD",
        "效果评测",
        "ToB",
        "SaaS",
        "跨部门协作",
        "数据驱动",
        "MVP",
        "转人工",
      ],
      idealCandidate: `理想候选人是具备 ${input.industry || "企业服务"} 语境下的 B 端产品功底，能独立完成 AI 场景拆解与验收，并用指标证明效果；同时诚实标注 Demo 与正式项目边界，能与算法/工程高效协作。对「${role}」岗位，业务域经验（如 ERP/WMS）是加分项，但核心仍是 AI 产品闭环能力。`,
      capabilities: [
        {
          capability: "AI 场景定义与 MVP 切分",
          importance: "高",
          jdSignal: "从 0 到 1 / 迭代规划、问题拆解",
        },
        {
          capability: "RAG / Agent / Workflow 产品化",
          importance: "高",
          jdSignal: "推动能力落地",
        },
        {
          capability: "效果指标与评测闭环",
          importance: "高",
          jdSignal: "准确率/完成率/满意度",
        },
        {
          capability: "ToB 需求与跨部门推动",
          importance: "高",
          jdSignal: "B 端背景、协作、验收",
        },
        {
          capability: "业务域理解（供应链/ERP 等）",
          importance: "中",
          jdSignal: "加分项",
        },
        {
          capability: "Prompt 与知识库运营",
          importance: "中",
          jdSignal: "加分项：Prompt/评测集",
        },
      ],
    },
    diagnosis: {
      matchScore: 72,
      dimensions: [
        {
          name: "目标岗位匹配",
          score: 70,
          comment: "方向正确，但正式 AI PM 经历偏弱，需靠项目叙事补齐",
        },
        {
          name: "硬性门槛",
          score: 78,
          comment: "年限与 B 端背景达标；AI 落地有 Demo，需写清边界",
        },
        {
          name: "关键词覆盖",
          score: 65,
          comment: "RAG/Agent 有提及，PRD/评测/效果指标偏少",
        },
        {
          name: "量化与证据",
          score: 58,
          comment: "结果描述偏定性，缺少可核对数字与使用证据",
        },
        {
          name: "表达可信度",
          score: 80,
          comment: "整体较实，注意避免「精通」「独立从 0 搭建」类风险词",
        },
        {
          name: "结构完整度",
          score: 75,
          comment: "模块齐全；摘要与项目可按 JD 重排优先级",
        },
      ],
      mainIssues: [
        "AI 相关经历以个人实践为主，未在摘要中主动管理「Demo vs 正式项目」预期",
        "传统 B 端成果缺少量化与「被使用」证据，迁移故事不够强",
        "JD 高优词（PRD、效果评测、能力边界）在简历中出现不足",
        "项目顺序未把 AI 实践前置，HR/业务官第一眼仍像传统信息化产品",
      ],
      priorityFixes: [
        "重写职业摘要：B 端功底 + AI 实践 + 目标赛道（ToB AI SaaS）一句话对齐",
        "AI 客服项目补齐：MVP 切分、转人工、评测意识三条子弹",
        "经营报表改为「口径 + 周会使用」证据链，服务数据驱动叙事",
        "全文替换空词（负责/参与/对接）为动作与结果，并加风险提示避免夸张",
      ],
    },
    matchRows: [
      {
        jdRequirement: "3-5 年产品经验 + B 端背景",
        resumeEvidence: "4 年产品；ERP/WMS/报表",
        strength: "强",
        needSupplement: false,
        suggestion: "在意向与摘要首句写清年限与 B 端域，减少误判为运营/实施",
      },
      {
        jdRequirement: "AI 应用落地（RAG/Agent 等）",
        resumeEvidence: "客服 Agent、Prompt 助手（个人实践）",
        strength: "中",
        needSupplement: true,
        suggestion: "补充场景切分、知识库、转人工与评测；标注 Demo 边界",
      },
      {
        jdRequirement: "效果指标与数据验证",
        resumeEvidence: "经营报表被周会使用（定性）",
        strength: "弱",
        needSupplement: true,
        suggestion: "补 1-2 个数字或使用频次；AI 项目写清计划中的评测指标",
      },
      {
        jdRequirement: "PRD 与验收标准",
        resumeEvidence: "需求文档/验收有提及但弱",
        strength: "弱",
        needSupplement: true,
        suggestion: "选一条 ERP 需求写清验收标准；AI 项目补「完成定义」",
      },
      {
        jdRequirement: "跨部门推动",
        resumeEvidence: "协调供应链/财务/IT",
        strength: "中",
        needSupplement: true,
        suggestion: "追问一次冲突与取舍，写成 STAR 再压成 bullet",
      },
      {
        jdRequirement: "业务域加分（ERP/WMS）",
        resumeEvidence: "ERP 采购库存、WMS 上线",
        strength: "强",
        needSupplement: false,
        suggestion: "保留为差异化，但不要压过 AI 主叙事",
      },
      {
        jdRequirement: "解释 AI 边界与风险",
        resumeEvidence: "转人工策略有提及",
        strength: "中",
        needSupplement: true,
        suggestion: "经历追问中补「何时转人工/幻觉处理」并写入项目",
      },
      {
        jdRequirement: "ToB 解决方案转化",
        resumeEvidence: "偏内部信息化，对外方案弱",
        strength: "弱",
        needSupplement: true,
        suggestion: "用客服痛点→MVP 切片叙事，贴近 ToB 方案语言",
      },
    ],
    probes,
    optimizeRows: [],
    finalResume: {
      personalInfo: "",
      intention: "",
      summary: "",
      coreSkills: [],
      workExperience: [],
      projects: [],
      tools: [],
      education: "",
    },
    interviewMatch: {
      fitPoints: [
        {
          capability: "B 端 / 企业数字化产品经验（年限达标）",
          degree: "高适配",
          evidence: "4 年产品经验，覆盖 ERP 采购库存、WMS、经营报表等 ToB 场景",
          interviewTip: "开场用年限 + 业务域一句话对齐 JD 硬门槛，再过渡到 AI",
        },
        {
          capability: "跨部门需求澄清与验收推进",
          degree: "高适配",
          evidence: "协调供应链、财务、IT 多方推进排期与验收",
          interviewTip: "准备一次冲突取舍的 STAR，证明能推动而非只写文档",
        },
        {
          capability: "业务域加分（ERP / WMS / 经营分析）",
          degree: "高适配",
          evidence: "JD 明确加分；简历有模块级落地与报表被周会使用",
          interviewTip: "作为差异化，但控制篇幅，避免听起来像传统信息化岗",
        },
        {
          capability: "AI 应用实践（Agent / Workflow / 知识库）",
          degree: "中适配",
          evidence: "客服 Agent、Prompt 助手等个人实践，覆盖订单查询与推荐 MVP",
          interviewTip: "主动声明 Demo 边界，重点讲场景切分与转人工，而非工具名",
        },
        {
          capability: "数据验证与「是否被使用」意识",
          degree: "中适配",
          evidence: "经营报表进入管理层周会，有指标口径意识",
          interviewTip: "迁移到 AI：说明你会用准确率/完成率/转人工率同类逻辑",
        },
        {
          capability: "AI 风险与能力边界意识",
          degree: "弱适配",
          evidence: "有转人工策略提及，但缺少系统化评测与案例深度",
          interviewTip: "面试中补「幻觉场景 + 接管规则 + 抽检」三句话，可升为中适配叙事",
        },
      ],
      gapPoints: [
        {
          capability: "正式 AI 产品经理经历 / 线上效果数据",
          degree: "严重缺乏",
          gapReason: "AI 项目以个人 Demo 为主，缺少线上用户量、效果指标与商业化交付",
          howToCompensate:
            "诚实标注 Demo；用小样本抽检、流程设计、迭代日志证明产品闭环；强调可迁移的 B 端推进力",
        },
        {
          capability: "效果评测体系（评测集 / 抽检 / 指标看板）",
          degree: "明显不足",
          gapReason: "简历未体现离线集、人工抽检通过率、线上完成率等评测设计",
          howToCompensate:
            "面试准备一页「若上线会如何评测」方案；Prompt 助手可讲版本对比作为雏形",
        },
        {
          capability: "PRD 与 AI 验收标准表达",
          degree: "明显不足",
          gapReason: "有需求文档经验，但缺少面向 AI 场景的完成定义与验收写法",
          howToCompensate:
            "用客服 MVP 补写：输入/工具/拒答/转人工/成功标准；带一份脱敏验收清单进面试",
        },
        {
          capability: "ToB AI 解决方案对外转化",
          degree: "可补齐",
          gapReason: "经历偏内部信息化，缺少对外售前/方案叙事",
          howToCompensate:
            "把客服痛点→MVP 切片讲成可交付方案；结合公司业务（若已知）做 1 个场景假设",
        },
        {
          capability: "与算法协作的专业语言",
          degree: "可补齐",
          gapReason: "未体现和算法同学对齐目标、数据与边界的具体协作方式",
          howToCompensate:
            "准备「产品定场景与指标，算法定方案与上限」的分工表述，避免越界谈模型细节",
        },
      ],
    },
    interviewPrep: {
      followUps: [
        "你没有正式 AI PM title，为什么认为自己能胜任？",
        "客服 Agent 是 Demo 还是线上？用户量与效果数据？",
        "如何评价一次 AI 需求该不该做？",
        "RAG 与微调你会怎么选？依据是什么？",
        "讲一次你推动多方对齐失败或艰难成功的例子",
        "经营报表的指标口径谁定的？有没有吵过？",
        "如果幻觉导致错误订单答复，产品侧怎么设计？",
        "入职 30/60/90 天你的产出计划？",
        "你和技术（算法/工程）如何分工？",
        "为什么不做纯技术或继续传统 ERP 产品？",
      ],
      evidenceNeeded: [
        "AI 客服：流程截图、知识库结构、转人工规则、抽检记录",
        "经营报表：指标字典、周会使用反馈、前后对比（哪怕定性）",
        "ERP/WMS：你负责模块的需求文档目录或验收清单",
        "Prompt 助手：版本记录与一次改进前后对比",
        "跨部门：一次排期冲突的邮件/纪要要点（可脱敏）",
      ],
      overclaims: [
        "「从 0 搭建 ERP/WMS/BI」——实际是模块/参与，需降级表述",
        "「精通 RAG/Agent」——改为「有实践、理解边界」",
        "「显著提升效率 XX%」——若无数据不要写死数字",
        "「独立完成算法方案」——避免；保持产品定位",
      ],
      dataToAdd: [
        "报表：覆盖多少指标、多少角色使用、周会频率",
        "WMS：上线仓数/流程节点数/你跟进的缺陷数（可脱敏）",
        "AI 客服：场景数、测试问句量、人工抽检通过率（即使是小样本）",
        "协作：对接系统数、版本节奏（双周/月）",
      ],
      selfIntro: `面试官你好，我是张明，有 4 年 B 端产品经验，主要在 ERP、WMS 和经营数据报表场景里做需求与跨部门推进。我的特点是能把业务问题拆清楚，并用「是否被使用、能否验收」来判断价值。过去一段时间我通过 AI 客服 Agent、Prompt 助手等实践，补齐了 RAG、Workflow、转人工和效果边界这些 AI 应用产品能力。我目前求职 ${role}${input.companyName ? `，面试公司是${input.companyName}` : ""}，希望加入 ${input.companyName || input.companyType || "ToB AI SaaS"} 团队，把业务理解与 AI 场景落地结合起来，从可评测的 MVP 做起，持续把效果做上去。`,
    },
    interviewQAs: [
      {
        id: "q1",
        question: "请做一分钟自我介绍，并说明为什么适合这个 AI 产品经理岗位。",
        tip: "结构：背景 → AI 实践 → 与 JD 三点对齐 → 求职动机",
        userAnswer: "",
        optimizedAnswer: "",
        feedback: "",
      },
      {
        id: "q2",
        question: "讲一个你最有代表性的项目（建议讲 AI 客服），按 STAR。",
        tip: "S 业务痛点；T 目标与约束；A MVP/能力选型；R 结果与反思",
        userAnswer: "",
        optimizedAnswer: "",
        feedback: "",
      },
      {
        id: "q3",
        question: "如果业务要求「先做一个能回答所有售后问题的机器人」，你怎么回应？",
        tip: "展现边界意识、切分与风险，而不是直接说 yes",
        userAnswer: "",
        optimizedAnswer: "",
        feedback: "",
      },
      {
        id: "q4",
        question: "你如何设计 AI 客服的效果评测？",
        tip: "离线集 + 人工抽检 + 线上完成率/转人工率",
        userAnswer: "",
        optimizedAnswer: "",
        feedback: "",
      },
      {
        id: "q5",
        question: "传统 ERP 经验如何迁移到 AI 产品工作中？",
        tip: "问题定义、验收、跨部门、数据验证四条桥",
        userAnswer: "",
        optimizedAnswer: "",
        feedback: "",
      },
      {
        id: "q6",
        question: "描述一次跨部门冲突，你如何推动？",
        tip: "目标对齐 → 选项与代价 → 小步验证 → 结论",
        userAnswer: "",
        optimizedAnswer: "",
        feedback: "",
      },
    ],
  };
}

export function regenerateOptimize(
  input: UserInput,
  style: OptimizeStyle,
  customRequirement = ""
): { optimizeRows: OptimizeRow[]; finalResume: FinalResume } {
  const base = {
    optimizeRows: buildOptimizeRows(style),
    finalResume: buildFinalResume(input, style),
  };

  const req = customRequirement.trim();
  if (!req) return base;

  const preview = req.length > 80 ? `${req.slice(0, 80)}…` : req;
  return {
    optimizeRows: [
      {
        id: "custom-req",
        before: "（按用户自定义优化需求调整）",
        after: `已按需求调整表达与结构侧重：${preview}`,
        reason: `响应用户自定义优化需求：${preview}`,
        risk: "自定义需求若含未证实事实，请人工核对后再投递",
      },
      ...base.optimizeRows,
    ].slice(0, 8),
    finalResume: {
      ...base.finalResume,
      summary: `${base.finalResume.summary}\n（已参考自定义需求：${preview}）`,
    },
  };
}

export async function runMockProbeOptimize(
  input: UserInput,
  probes: ProbeCard[],
  style: OptimizeStyle = "default"
): Promise<{ optimizeRows: OptimizeRow[]; finalResume: FinalResume }> {
  await delay(700);
  const base = regenerateOptimize(input, style);
  const bullets = probes
    .map((p) =>
      p.generatedBullet.trim()
        ? p.generatedBullet.trim()
        : p.answer.trim()
          ? generateBulletFromAnswer(p.question, p.answer)
          : ""
    )
    .filter(Boolean);

  if (bullets.length > 0) {
    base.finalResume.projects = [
      ...base.finalResume.projects,
      "追问补强论据",
      ...bullets,
    ];
    const extraRows: OptimizeRow[] = bullets.slice(0, 2).map((b, i) => ({
      id: `probe-${i + 1}`,
      before: "（原简历证据薄弱，追问后补充）",
      after: b,
      reason: "将追问回答转化为可核验简历论据，支撑「非我不可」论点",
      risk: "需确保与面试口述一致，避免过度包装",
    }));
    base.optimizeRows = [...extraRows, ...base.optimizeRows].slice(0, 8);
  }

  return base;
}

export function generateBulletFromAnswer(question: string, answer: string): string {
  const trimmed = answer.trim();
  if (!trimmed) return "";

  const short = trimmed.replace(/\s+/g, " ");
  const preview = short.length > 120 ? `${short.slice(0, 120)}…` : short;

  if (question.includes("报表") || question.includes("指标")) {
    return `· 经营报表：${preview}（强调口径共识与使用场景，服务数据驱动决策）`;
  }
  if (question.includes("转人工") || question.includes("幻觉")) {
    return `· AI 风险控制：${preview}（明确接管条件，降低幻觉带来的业务风险）`;
  }
  if (question.includes("订单查询") || question.includes("MVP") || question.includes("售后")) {
    return `· 场景切分：${preview}（优先高结构化高频率场景，控制交付范围）`;
  }
  if (question.includes("评测") || question.includes("效果")) {
    return `· 效果闭环：${preview}（用可观测指标指导迭代，而非只堆功能）`;
  }
  if (question.includes("WMS") || question.includes("边界")) {
    return `· WMS/协作边界：${preview}（写清职责边界与推动难点，提升可信度）`;
  }
  if (question.includes("优先级") || question.includes("取舍")) {
    return `· 优先级判断：${preview}（体现取舍依据与业务影响）`;
  }
  if (question.includes("Prompt")) {
    return `· Prompt 资产化：${preview}（模板与版本管理，支撑持续优化）`;
  }
  if (question.includes("30 天") || question.includes("价值")) {
    return `· 入职价值主张：${preview}（可同步用于面试开场与简历意向补充）`;
  }
  return `· ${preview}`;
}

export function optimizeInterviewAnswer(
  question: string,
  answer: string
): { optimizedAnswer: string; feedback: string } {
  const trimmed = answer.trim();
  if (!trimmed) {
    return {
      optimizedAnswer: "",
      feedback: "请先填写你的回答，再生成优化版。",
    };
  }

  const optimizedAnswer = [
    "【优化表达】",
    `针对「${question.slice(0, 24)}${question.length > 24 ? "…" : ""}」：`,
    `1）先给结论：${trimmed.slice(0, 60)}${trimmed.length > 60 ? "…" : ""}`,
    "2）补结构：背景/目标 → 关键动作（2-3 点）→ 结果或学习。",
    "3）对齐 JD：点出场景切分、效果指标或跨部门推动其中至少两点。",
    "4）风控一句：区分 Demo 与正式项目，说明能力边界。",
  ].join("\n");

  const feedback = [
    "反馈：",
    "- 保留你的事实，不要发明数据；",
    "- 若缺少数字，用「小样本抽检/周会使用」等可核验表述；",
    "- 控制在 90-120 秒口述长度；",
    "- 结尾用一句话回到目标岗位（AI 产品经理 / ToB）。",
  ].join("\n");

  return { optimizedAnswer, feedback };
}

export function formatFinalResumeText(resume: FinalResume): string {
  return [
    "【个人信息】",
    resume.personalInfo,
    "",
    "【求职意向】",
    resume.intention,
    "",
    "【职业摘要】",
    resume.summary,
    "",
    "【核心能力】",
    ...resume.coreSkills.filter((s) => s.trim()).map((s) => `· ${s}`),
    "",
    "【工作经历】",
    ...resume.workExperience.filter((s) => s.trim()),
    "",
    "【项目经历】",
    ...resume.projects.filter((s) => s.trim()),
    "",
    "【技能工具】",
    ...resume.tools.filter((s) => s.trim()).map((s) => `· ${s}`),
    "",
    "【教育背景】",
    resume.education,
  ].join("\n");
}
