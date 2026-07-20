# 简历专家 · 岗位采集（Chrome 扩展）

从 Boss 直聘、猎聘、LinkedIn Jobs 等页面自动识别岗位信息，保存到简历专家「目标岗位库」。

## 安装（开发者模式）

1. 打开 Chrome → `chrome://extensions/`
2. 开启右上角「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择本仓库的 `extension` 目录

## 使用

1. 打开招聘岗位详情页（如 Boss / 猎聘 / LinkedIn Jobs）
2. 页面右下角出现 **「保存岗位」** 浮动按钮，或点击浏览器工具栏扩展图标
3. 在弹窗中确认/编辑岗位名、公司、JD，点击 **保存到岗位库**
4. 打开 [http://localhost:3000](http://localhost:3000)（需先 `npm run dev`）
5. 插件经 bridge 合并进「目标岗位库」；侧栏「目标岗位库」可见新条目（顶栏状态旁也会 toast 同步提示）

### 通用兜底

任意网页：选中 JD 文本 → 右键 **「保存选中文本到简历专家岗位库」** → 再点扩展图标填写岗位名并保存。

## 架构

```
招聘页 Content Script（适配器抽取）
        ↓
Background（chrome.storage + 去重）
        ↓
localhost Bridge（postMessage）
        ↓
Web App mergeRoleLibrary → 目标岗位库
```

- 数据结构对齐 Web 端 `TargetRoleLibraryItem`
- 去重键：来源 URL（`note`），否则「公司 + 岗位名」
- 同步：插件 → Web（打开简历专家或保存时推送）

## 支持站点

| 站点 | 匹配 |
|------|------|
| Boss 直聘 | `zhipin.com` |
| 猎聘 | `liepin.com` |
| LinkedIn Jobs | `linkedin.com/jobs` |
| 其他 | 选中文本 / 手动粘贴 |

站点改版可能导致选择器失效，可在 `content/adapters/` 中调整。

## 目录

```
extension/
  manifest.json
  background.js
  shared/constants.js
  content/          # 招聘页注入
  bridge/           # localhost 同步桥
  popup/            # 确认保存 UI
  icons/
```

## 权限说明

- `storage`：保存岗位库
- `activeTab` / 站点 host：读取当前招聘页 DOM
- `contextMenus`：右键保存选中文本
- `localhost`：与本地简历专家同步

不会上传 JD 到第三方服务器；数据仅存本机浏览器。
