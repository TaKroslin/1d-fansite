---
name: qa-workflow
description: 1d fansite 分层 QA 验证流程——静态检查、HTTP 级验证（server + 审计脚本）、Playwright 浏览器验证（仅视觉需要时）。改完任何东西后按此收尾。
---

# QA 分层验证工作流（qa-workflow）

> 这是主流程文档。验证矩阵 → `reference.md`；真实脚本 → `examples/`；可复制模板 → `templates/`。

## 核心原则

**能用便宜的手段就不用贵的。** 视觉确认（Playwright 截图）是最后手段，不是默认手段。截图 = token 贵。

## 三层验证

### 第 1 层：静态检查（每次改动后必做，秒级）

- HTML/JS 语法自查（引用、闭合、路径）。
- 相对路径深度对照 new-page skill `reference.md` §1。
- 残留引用排查（命令见 `reference.md` §3）：
  `onedirectionmusiccom-ukprod`、`.jpg.jpg`、重复 `slideshow-nav.js`、`rect-sml` 残留。

### 第 2 层：HTTP 级验证（本地 server + 脚本，分钟级）

1. 启动 server：`python -m http.server 8000`（QA 脚本用 127.0.0.1:8000）。
2. 全站图片审计：`python tools/_audit_site_images.py` → `Broken: 0`。
3. 页面/资源 200 检查：写一次性脚本遍历（模板见 `templates/check-links.py`）。

> ⚠️ **必须 HTTP urljoin，不能 Path.resolve()**（M8）——HTTP 的 `..` 超根会截断，文件系统 resolve 会误报 MISSING。

### 第 3 层：浏览器验证（仅视觉/交互需要时）

只有需要确认**布局/颜色/动画/响应式/交互行为**才用 Playwright。模板见 `templates/playwright-shot.py`。

```python
# Playwright 模板要点：
# 1. 结尾 os._exit(0) —— 否则 chromium 不释放、命令挂起（结果其实已产出）
# 2. 截图归档到 tools/_qa_screenshots/
# 3. 优先 headless；缓存问题用 channel=chrome + ?v= 排查
```

## 按改动类型选验证（完整矩阵见 reference.md §1）

| 场景 | 默认验证 |
|------|---------|
| 改文本/链接/路径 | 第 1+2 层 |
| 加图片 | 第 2 层（审计 0 断链） |
| 改 CSS 布局/颜色 | 第 1+2 层 + 第 3 层截图 |
| 改 JS 交互 | 第 3 层（点击/键盘/滑动断言） |
| 改 blog/重建页面 | 第 1+2 层 |
| 批量重建 | 幂等检查 + 全量审计 + 抽查 1-2 张截图 |

## 部署前检查

```bash
git status --porcelain | grep "^??"   # 未跟踪文件 = 线上 404 隐患
git diff --stat
# .gitignore 必须含 onedirectionmusiccom-ukprod/
```

## 收尾必做

- 改 CSS 记得 bump `?v=`（M12）。
- `AGENTS/LOG.md` 追加日志。

## 参考资料索引

| 文件 | 内容 |
|------|------|
| `reference.md` | 验证矩阵、常用 grep 命令、脚本编写要点 |
| `examples/audit.py` | 真实 `_audit_site_images.py` 核心逻辑 |
| `examples/playwright.py` | 真实 `_qa.py` Playwright 用法 |
| `templates/check-links.py` | HTTP 200 遍历脚本模板 |
| `templates/playwright-shot.py` | Playwright 截图脚本模板 |
