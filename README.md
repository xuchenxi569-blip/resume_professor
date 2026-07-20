# 简历专家（Resume Professor）

JD 定制简历优化 Agent + 面试模拟考 Agent。基于 Next.js，可选接入 DeepSeek；未配置密钥时自动回退本地 Mock。

## 快速开始

```bash
npm install
cp .env.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)（端口占用时会自动换端口）。

Chrome 岗位采集插件：见 [`extension/README.md`](extension/README.md)（开发者模式加载 `extension/` 目录）。

## 环境变量

| 变量 | 说明 |
|------|------|
| `DEEPSEEK_API_KEY` | 有值才走大模型；仅服务端读取 |
| `DEEPSEEK_BASE_URL` | 默认 `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 默认 `deepseek-chat`；也可用 `deepseek-reasoner` |
| `AI_FORCE_MOCK` | 设为 `true` 时强制本地 Mock |

1. 在 [DeepSeek 开放平台](https://platform.deepseek.com) 创建 API Key  
2. 复制 `.env.example` → `.env.local` 并填入密钥  
3. **重启** `npm run dev`（环境变量只在启动时加载）  
4. 顶栏右侧应显示 `DeepSeek · …`；未配置时显示 Mock  

> **安全**：`.env.local` 已在 `.gitignore`，勿把真实密钥写入源码或提交仓库。

## 功能

- **投递前**：输入材料 → JD 解析 → 诊断 → 匹配 → 经历追问 → 优化 → 最终简历 → 导出  
- **面试前**：输入材料 → JD 解析 → 匹配 → 面试准备 → 模拟问答  
- **目标岗位库 / 简历库**：`localStorage` 本地保存，输入页可选用  
- **投递记录库**：表格跟踪进度（关联岗位库/简历库、状态、投递时间、备注）  
- **Chrome 插件**：Boss / 猎聘 / LinkedIn Jobs 抽 JD，经 bridge 合并进岗位库  
- **顶栏操作**：阶段切换（左）、待分析·模型名 / 开始分析 / 清空数据（右）

## 本地存储键

| Key | 内容 |
|-----|------|
| `resume-professor-role-library` | 目标岗位库 |
| `resume-professor-library` | 简历库 |
| `resume-professor-application-library` | 投递记录库 |
| 插件 `chrome.storage`：`resume-professor-role-library-ext` | 插件侧岗位副本 |

## 目录结构

```
src/
  app/                 # Next App Router 页面与 API
  app/api/analyze      # 主分析
  app/api/optimize-style
  app/api/optimize-probe
  app/api/generate
  components/panels/   # 各流程面板（含 ApplicationLibraryPanel）
  lib/ai-service.ts    # 业务编排
  lib/ai-prompts.ts    # System / User Prompt
  lib/deepseek.ts
  lib/mock-ai.ts
  lib/role-library.ts  # 岗位库 + 插件 merge
  lib/resume-library.ts
  lib/application-library.ts
  types/index.ts
extension/             # Chrome MV3 岗位采集（无构建步骤，直接加载）
public/                # favicon 等静态资源
```

## 技术栈

- Next.js 15（App Router）+ React 19 + TypeScript  
- DeepSeek Chat Completions（OpenAI 兼容）  
- 浏览器 `localStorage` / 扩展 `chrome.storage`（无后端数据库）

## License

Private / 按需自行添加开源协议。
