# Candidate Skills Registry

> 本阶段只登记名称和边界，不创建 `SKILL.md`，不执行 Skill。后续逐个协商完整流程。

## First candidates

| Skill name | Scope |
|---|---|
| `gallery-build-slideshow` | 新建相册、生成 slideshow、封面卡、图片命名、路径和控件检查 |
| `gallery-update-cover` | 替换 Gallery/首页封面，生成尺寸变体，检查灰度、retinafy 和 Git 跟踪 |
| `blog-create-page` | 新建 Blog Markdown、front matter、构建输出、封面和首页入口同步 |
| `novel-create-chapter` | 新建/修改章节、目录、上下章、进度条和构建检查 |
| `panel-create-component` | 按设计系统新建 Panel，选择 class 组合、结构、状态和响应式规则 |
| `site-qa-release-check` | 静态检查、HTTP 资源审计、CSS 版本、部署资产和必要的浏览器 QA |
| `translation-font-pairing` | 双语结构、翻译注入、中文字体配对、字体加载与缺字检查 |

## Existing project skills detected

以下 Skill 已从 `.opencode/skills/` 迁移到 `.agents/skills/`（仓库内单一源）。该目录同时被 opencode（`agent-compatible`，1.18.15 已支持）和 DSH（`project-agents` 根）扫描，因此**不要再往 `.opencode/skills/` 放同名副本**，否则 opencode 会视为重名冲突。

| Existing directory | Related candidate |
|---|---|
| `.agents/skills/gallery-page/` | `gallery-build-slideshow` / `gallery-update-cover` |
| `.agents/skills/blog-post/` | `blog-create-page` |
| `.agents/skills/new-page/` | `panel-create-component` |
| `.agents/skills/qa-workflow/` | `site-qa-release-check` |
| `.agents/skills/design-system/` | `panel-create-component` / `translation-font-pairing` |
| `.agents/skills/translation/` | `translation-font-pairing` |

后续任务应先读取对应现有 Skill，再决定是补充能力、拆分职责，还是保留原名并更新注册表。

## Naming constraints

- 名称只使用小写字母、数字和连字符。
- 每个 Skill 只负责一个稳定、重复、可验证的工作流。
- 不把一次性创意判断、普通小改动或整份项目手册复制进 Skill。
- 源目录固定为仓库 `.agents/skills/<name>/SKILL.md`；opencode 与 DSH 都直接读取，Codex 再通过同步方式接入。
- frontmatter 按**严格 YAML** 写：`description` 含 `: `、`#`、`{}`、`[]`、`&`、`*` 等字符必须加双引号（见 `METHODS.md` M52）。
