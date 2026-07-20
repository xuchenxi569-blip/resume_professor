import type { ApplyStep, InterviewStep, UserInput } from "@/types";

export const SAMPLE_INPUT: UserInput = {
  targetRole: "AI 产品经理",
  industry: "企业服务 / AI SaaS",
  companyType: "ToB SaaS 创业公司 / 成长期",
  companyName: "星河智能科技（杭州）有限公司",
  jobStage: "pre_apply",
  highlightSkills:
    "B端产品经验、ERP/WMS、经营数据报表、需求分析、跨部门协作、数据驱动决策、AI 产品实践（RAG/Agent/Prompt）",
  jdText: `岗位名称：AI 产品经理

岗位职责：
1. 负责 AI 产品从 0 到 1 或迭代规划，定义问题、拆解场景、输出 PRD 与验收标准；
2. 与算法、工程、设计协作，推动 RAG / Agent / Workflow 等能力落地；
3. 基于用户反馈与数据指标持续优化产品效果（准确率、完成率、满意度等）；
4. 调研竞品与行业趋势，沉淀可复用的 AI 产品方法论；
5. 面向 ToB 客户理解业务痛点，将 AI 能力转化为可交付的解决方案。

任职要求：
1. 3-5 年产品经理经验，有 B 端 / SaaS / 企业数字化相关背景优先；
2. 熟悉 AI 应用产品形态（对话、知识库、Agent、工具调用等），有落地项目经验；
3. 具备良好的需求分析、优先级判断与跨部门推动能力；
4. 能用数据验证假设，关注效果指标而非只堆功能；
5. 沟通表达清晰，能向业务方解释 AI 能力边界与风险。

加分项：
- 有供应链、ERP、WMS、经营分析等业务域经验；
- 能独立完成 Prompt / 评测集 / 人工抽检闭环；
- 有从 Demo 到可上线产品的推进经验。`,
  resumeText: `张明 | 产品经理 | 4年经验 | 杭州
电话：138****0000 | 邮箱：zhangming@example.com

求职意向：AI 产品经理

个人摘要：
4年 B 端产品经验，熟悉 ERP、WMS 与经营数据报表场景，擅长需求拆解与跨部门协作。近期自学并实践 RAG、Agent、Prompt 工程，希望转型 AI 产品经理。

工作经历：
某制造企业信息化部 | 产品经理 | 2022.03 - 至今
- 负责 ERP 采购与库存模块需求管理，对接业务与研发，推动版本迭代
- 参与 WMS 上线，梳理出入库流程，减少现场操作混乱
- 搭建经营数据报表，支持管理层看库存周转与采购执行情况
- 协调供应链、财务、IT 多方，推进需求排期与验收

某物流科技公司 | 产品助理 / 产品经理 | 2021.07 - 2022.02
- 协助完成仓储相关需求文档与原型
- 跟进缺陷修复与上线验证

项目经历：
1. 经营数据报表项目
- 梳理核心指标，输出报表需求，推动 BI 落地
- 报表被管理层周会使用

2. AI 智能客服 Demo（个人实践）
- 基于 Coze 搭建电商客服 Agent，覆盖订单查询与推荐场景
- 设计 Workflow、知识库检索与转人工策略

3. Prompt 助手（个人实践）
- 做 Prompt 模板与版本管理小工具，提升自己写 Prompt 的效率

技能：
Axure、飞书文档、SQL（基础）、Excel、SmartBI、Coze、Cursor、Prompt、RAG 概念

教育：
某大学 | 信息管理与信息系统 | 本科 | 2017-2021`,
  extraInfo: `补充信息：
- 目标：从传统 B 端产品转向 AI 产品经理，优先 AI SaaS / ToB。
- 优势：懂业务、能拆需求、有跨部门推进经验；有 AI Demo 可讲。
- 短板：正式 AI 产品经理经历不足；PRD 与效果评测体系还需加强。
- 可连接扣子知识库：个人项目说明、STAR 案例、FAQ 面试问答。`,
  useCozeKnowledge: true,
};

export const APPLY_STEPS: { id: ApplyStep; label: string; index: number }[] = [
  { id: "input", label: "输入材料", index: 1 },
  { id: "jd_parse", label: "JD 解析", index: 2 },
  { id: "diagnosis", label: "简历诊断", index: 3 },
  { id: "match", label: "匹配分析", index: 4 },
  { id: "probe", label: "经历追问", index: 5 },
  { id: "optimize", label: "简历优化", index: 6 },
  { id: "final_resume", label: "最终简历", index: 7 },
  { id: "export", label: "导出结果", index: 8 },
];

export const INTERVIEW_STEPS: {
  id: InterviewStep;
  label: string;
  index: number;
}[] = [
  { id: "input", label: "输入材料", index: 1 },
  { id: "jd_parse", label: "JD 解析", index: 2 },
  { id: "interview_match", label: "匹配分析", index: 3 },
  { id: "interview_prep", label: "面试准备", index: 4 },
  { id: "interview_sim", label: "面试问答模拟与优化", index: 5 },
];
