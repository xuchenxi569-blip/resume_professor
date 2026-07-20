# AGENTS.md — 简历专家

## 定位

面向求职的 JD 定制简历优化与面试准备 Web App；可选 DeepSeek，否则 Mock。

## 怎么跑

```bash
npm install
cp .env.example .env.local   # 填 DEEPSEEK_API_KEY（可选）
npm run dev                  # http://localhost:3000
```

插件：Chrome 开发者模式加载仓库根目录 `extension/`（详见 `extension/README.md`）。

## 技术栈

Next.js 15 App Router · React 19 · TypeScript · DeepSeek（服务端）· 本地 `localStorage` / 扩展 `chrome.storage`。

## 目录与约定

- `src/app/page.tsx`：主壳（侧栏库入口 + 流程步骤 + 顶栏分析操作）
- `src/components/panels/`：各步骤 UI；库类面板含 Role / Resume / Application
- `src/lib/ai-prompts.ts`：分析/优化 Prompt（议论文框架、理想型、雷区）
- `src/lib/*-library.ts`：三类本地库读写；岗位库含插件 `mergeRoleLibrary`
- `extension/`：纯 JS MV3，无打包；与 Web 共用 `TargetRoleLibraryItem` 字段语义
- API 仅服务端读密钥；勿把 `.env.local` 写入文档示例或提交 git

## 当前状态与下一步

已具备：双阶段流程、三类本地库、Chrome 岗位采集与 localhost 同步、顶栏分析/清空。

可选下一步：插件适配更多招聘站、投递记录与分析流程更深联动、多设备同步（需后端）、生产域名加入插件 `host_permissions`。
