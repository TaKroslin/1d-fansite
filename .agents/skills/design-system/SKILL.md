---
name: design-system
description: "Use for any 1d-fansite UI work: create or modify a page, panel, card, header, footer, navigation, typography, icon, animation, responsive rule, color, or CSS. Defines the design tokens, real element names, and safe CSS workflow."
---

# 设计系统（FIVE GUYS ONE DIRECTION）

> **跨运行环境工具名**：确认提问 = opencode `question` / DSH `ask_user_question`；看图 = opencode MCP `visionpower` / DSH `read_image`。其余流程术语两者通用。

## 触发与执行边界

提到设计规范、UI、组件、Panel、字体、颜色、图标、布局、响应式或 CSS 时触发。它只负责视觉与样式决策；如果任务同时是 Blog、Gallery 或新建页面，先执行对应专用 Skill，再由本 Skill 提供样式约束。先查 `AGENTS/DESIGN-SYSTEM.md` 判断规则，再查 `AGENTS/ELEMENT-NAMING.md` 和 `AGENTS/ELEMENT-PREVIEWS.md` 找真实 class/id 与视觉样例。AI 可自动复用已有结构并追加最小 CSS；新增标志性元素、改变既有视觉语义、覆盖既有 class 或无法判断设计意图时必须使用 question 工具确认。交付必须说明使用了哪个真实元素名和验证方式。

## 标准执行顺序

1. **读取**：读取设计系统、元素命名、对应预览和当前 CSS 规则。
2. **定位**：找到真实 HTML 元素、现有选择器、字体、断点和状态；确认是否已有可复用组件。
3. **整理方案**：明确使用的真实 class/id、token、修改文件、是否需要新增 CSS、是否需要 bump 版本。
4. **作者确认**：涉及新视觉、覆盖既有样式、字体替换、颜色语义变化或响应式行为变化时，使用 question 工具确认方案。
5. **执行**：确认后复用现有结构，CSS 只追加到 additions 区；不重命名既有 class/id。
6. **验证**：检查 specificity、z-index、缓存版本和页面结构；布局/颜色/响应式变化再做浏览器截图。
7. **交付**：说明真实元素名、修改的 token/规则、验证结果和截图（若需要），并写日志。

没有作者确认时，只允许做只读定位和方案分析，不直接改变视觉规则。

> 这是主流程文档。详细表格 → `reference.md`；真实代码 → `examples/`；可复制骨架 → `templates/`。

## 什么时候用

- 新建页面 / panel / 卡片
- 改 CSS 布局、颜色、字体
- 判断某个视觉元素是否符合站点规范

## 核心概念：Panel 系统

所有内容块都是 `.panel`（正方形 `padding:50% 0 0 0; height:0`，内容绝对定位）。

```html
<div class="panel {panel-type}">
  <div class="bg retinafy" style="background-image: url(...)"></div>
  <div class="inline"></div>         <!-- hover 边框动画层 -->
  <div class="panel-header">…</div>  <!-- .title + .section-name -->
  <h2>…</h2>
  <div class="info">…</div>
  <a class="more" href="…">…</a>    <!-- CTA 按钮 -->
</div>
```

面板类型速查（完整列表见 `reference.md` §2）：

| 类型 | CSS Class | 背景 |
|------|-----------|------|
| 文章正文 | `.panel.journal-article` | `#fff`，无高度限制 |
| 新闻卡 | `.panel.journal-news` | 带 `.inline` hover 边框 |
| 图库封面 | `.panel.gallery-cover` | 灰度图，居中文字 + `.count` |
| Hero | `.panel.hero` | 全屏图 + 居中 logo |
| 成员 | `.panel.band-member` | 左右分栏 + 视差 |
| Moment | `.panel.journal-moments` | 居中金色 overlay |

## 操作步骤

1. **找参照**：确认要加的 panel 类型 → 看 `templates/` 或 `examples/` 里对应骨架。
2. **写 HTML**：套 `.panel` 结构 + 对应 CSS class + 双语 `.en`/`.zh`。
3. **改 CSS**：新规则**只追加**到 `css/styles.css` 末尾 `/* FIVE GUYS ONE DIRECTION additions */` 块（文件是单行 minified，不重排）。字体/颜色用 `reference.md` §1 的 token。
4. **bump `?v=`**：`<link href="css/styles.css?v=YYYYMMDD">` 更新日期——纯静态站无 cache-control，不 bump 用户看不到（M12）。
5. **验证**：布局/颜色改动 → qa-workflow 第 3 层 Playwright 截图确认；只改文本/路径 → 第 1+2 层。

## 铁律（防踩坑）

1. `css/styles.css` 是 91KB 单行 minified → **只追加，不重排**（M13）。
2. **改完 CSS 必须 bump `?v=`**（M12）。
3. z-index 跟 inline style / JS 打架 → 直接 `9999!important`，别用中间值（M11）。
4. FIVE GUYS 补丁块（`AGENTS/DESIGN-SYSTEM.md` 与 `AGENTS/METHODS.md` 中记录的项目级修复）是项目级修复，**不要删**。
5. 超宽 logo（3000×548）进 1:1 容器 → `background-size: contain`，别用百分比宽度（M2）。
6. 黑底用 `logo-white.png`，白底用 `logo-black.png`（M1）。

## 参考资料索引

| 文件 | 内容 |
|------|------|
| `reference.md` | 颜色/字体/菜单 class/语义角色/断点/图标/社交色 完整表格 |
| `examples/` | 真实页面里的 panel / header / footer 代码节选 |
| `templates/` | 可直接复制的 panel / header / footer 骨架 |

详细项目事实见 `AGENTS/DESIGN-SYSTEM.md`、`AGENTS/ELEMENT-NAMING.md` 和 `AGENTS/ELEMENT-PREVIEWS.md`。
