# 简历专家（Resume Professor）

JD 定制简历优化 Agent + 面试模拟考 Agent。基于 Next.js，可选接入 DeepSeek 大模型；未配置密钥时自动回退本地 Mock。

## 快速开始

```bash
npm install
cp .env.example .env.local
# 编辑 .env.local，填入 DEEPSEEK_API_KEY
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)（若端口被占用会自动换端口）。

## 环境变量

| 变量 | 说明 |
|------|------|
| `DEEPSEEK_API_KEY` | 必填才走大模型；仅服务端读取，不会暴露到浏览器 |
| `DEEPSEEK_BASE_URL` | 默认 `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 默认 `deepseek-chat`；也可用 `deepseek-reasoner` |
| `AI_FORCE_MOCK` | 设为 `true` 时强制走本地 Mock |

1. 在 [DeepSeek 开放平台](https://platform.deepseek.com) 创建 API Key  
2. 将 `.env.example` 复制为 `.env.local` 并填入密钥  
3. **重启** `npm run dev`（环境变量只在启动时加载）  
4. 右上角应显示 `DeepSeek · deepseek-chat`；未配置时显示 Mock

> **安全提示**：`.env.local` 已在 `.gitignore` 中忽略，请勿把真实密钥写入源码或提交到仓库。

## 功能

- **投递前**：输入材料 → JD 解析 → 简历诊断 → 匹配分析 → 经历追问 → 简历优化 → 最终简历 → 导出
- **面试前**：输入材料 → JD 解析 → 匹配分析 → 面试准备 → 面试问答模拟与优化

## 目录结构

```
src/
  app/api/analyze          # 主分析（DeepSeek / Mock）
  app/api/optimize-style   # 简历风格重写
  app/api/generate         # bullet / 面试回答优化
  lib/deepseek.ts          # DeepSeek HTTP 客户端
  lib/ai-service.ts        # 业务编排
  lib/ai-prompts.ts        # Prompt
  lib/mock-ai.ts           # 本地 Mock 回退
```

## 技术栈

- Next.js 15（App Router）
- React 19
- TypeScript
- DeepSeek Chat Completions（OpenAI 兼容）

## License

Private / 按需自行添加开源协议。
