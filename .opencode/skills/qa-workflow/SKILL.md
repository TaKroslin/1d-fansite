---
name: qa-workflow
description: Use after any 1d-fansite change or when asked to audit, verify, release-check, inspect broken images, check paths, check CSS versions, or visually test a page. Runs layered static, HTTP, and conditional Playwright QA and produces a concise result.
---

# QA 分层验证工作流（qa-workflow）

## 触发与执行边界

任何页面、图片、CSS、JS、构建或翻译修改完成后触发，也响应“检查、审计、验收、发布前检查、截图”。它是收尾 Skill，不负责擅自修复功能问题。开始前确认本次改动范围和目标页面；AI 可自动执行静态检查、图片审计、未跟踪文件检查和必要的 HTTP 检查。只有涉及布局、颜色、动画、响应式或交互时才启动 Playwright。视觉检查完成后默认交付一张最相关截图；纯文本/路径修复不强制截图。发现 Broken、路径错误、重复脚本、CSS 版本过期或页面行为不确定时，输出“未通过 + 具体文件/证据 + 建议修复动作”，不输出发布通过结论；是否自动修复由用户或对应专用 Skill 决定。

## 标准执行顺序

1. **读取**：读取本次改动文件、项目规则和对应专用 Skill 的验证要求。
2. **定位**：确定影响页面、资源、脚本、CSS 版本和是否涉及视觉/交互；先不修复。
3. **整理方案**：选择最低成本的验证层级，并列出检查命令、目标数字和截图条件。
4. **作者确认**：如果发现问题需要修改文件、删除资源或改变行为，使用 question 工具确认是否授权修复；单纯只读审计不需要等待。
5. **执行验证**：按静态 → HTTP → 浏览器顺序执行；仅在前一层通过且确有必要时进入下一层。
6. **处理结果**：通过则生成报告；失败则只报告证据和建议，不擅自把失败改成通过。
7. **交付**：按需发送一张最终截图，给出通过/未通过结论，并写日志。

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
2. 全站图片审计：`python tools/audit/_audit_site_images.py` → `Broken: 0`。
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
