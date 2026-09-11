---
name: new-page
description: "Use when creating a new 1d-fansite HTML page, landing page, content page, Gallery index, or other static page. Handles template selection, path depth, body class, shared header/footer, assets, bilingual structure, and validation."
---

# 新建页面（new-page）

> **跨运行环境工具名**：确认提问 = opencode `question` / DSH `ask_user_question`；看图 = opencode MCP `visionpower` / DSH `read_image`。其余流程术语两者通用。

## 触发与执行边界

提到新建页面、新增页面、落地页、内容页或静态 HTML 页面时触发。对于 Blog、Gallery、Translation 等已有专用 Skill，专用 Skill 优先，本 Skill 只负责通用页面骨架。开始前确认：页面用途、目标路径、英文/中文标题与正文、页面是否需要加入导航或父级列表、封面/资源资料。AI 可自动选择最近似模板、复制骨架、计算路径、接入导航并验证；如果目标路径已存在、页面类型同时适合多个模板、或会改变公共导航，必须使用 question 工具确认。元素 class/id 必须先从 `AGENTS/ELEMENT-NAMING.md` 选择，不能自行发明同义名称。

## 标准执行顺序

1. **读取**：读取项目入口、设计系统、元素命名文档和最接近的现有页面模板。
2. **定位**：确认目标目录、资源相对路径深度、body class、导航位置和是否存在同名页面；此阶段只读。
3. **整理方案**：列出页面类型、模板文件、英文/中文内容、资源、父级链接和需要登记的新元素。
4. **作者确认**：使用 question 工具确认目标路径、是否覆盖、是否加入导航、页面标题/语言和资源选择。
5. **执行**：得到确认后复制模板、替换内容、接入父级页面并登记新增 class/id。
6. **验证**：检查 HTML 闭合、相对路径、脚本唯一性、图片审计和导航链接。
7. **交付**：报告新页面路径和验证结果；涉及视觉变化时发送一张截图，并写日志。

作者未确认前，不创建目标 HTML、不覆盖同名页面、不改公共导航。

> 这是主流程文档。深度表 → `reference.md`；真实页面 → `examples/`；可复制骨架 → `templates/`。

## 核心原则

- **不手写骨架**：复制现有同类型页面作模板，保留 header/footer/nav/资源引用，再改内容。
- **不引入框架**：纯 HTML/CSS/JS + jQuery（Google CDN 2.1.1）。

## 操作步骤

### 1. 选模板

| 新页面类型 | 复制参考 |
|-----------|---------|
| 内容页（pages/ 一级） | `pages/about.html` 或任意 `pages/*.html` |
| 列表/图库分类 | `pages/gallery/<cat>/index.html` |
| 文章页 | 跑 `tools/build/build_blog.py`（见 blog-post skill），不手写 |
| Gallery 相册 slideshow | 交给 `gallery-page` Skill；不要使用音乐区模板 |
| 音乐专辑 photos slideshow | `pages/music/albums/<a>/photos/<slug>.html`（见 gallery-page skill 的音乐区边界） |

### 2. 定深度 + body class

- 查 `reference.md` §1 深度表确定资源前缀（0/1/3/4/5 层）。
- 查 `reference.md` §2 确认 body class。

### 3. 替换骨架

- `templates/page-skeleton.html`：完整页面骨架（head + header + body + footer），用 `{PREFIX}` 占位前缀，直接复制替换。
- 关键引用：CSS `styles.css?v=YYYYMMDD`、JS `jquery.min.js`+`main.js`+`translate.js`、logo link、footer About link。

### 4. 写内容

- panel 骨架用 design-system skill 的 `templates/`。
- 文本双语用 `.en`/`.zh` 双 span。
- nav 当前页项加 `active` class。

### 5. 验证 + 收尾

```bash
python -m http.server 8000 &
python tools/audit/_audit_site_images.py   # Broken: 0
rg "onedirectionmusiccom-ukprod" pages/   # 应无残留
git status --porcelain | grep "^??"  # 新图片已跟踪（未跟踪 = 线上 404）
```

`AGENTS/LOG.md` 追加日志。

## 铁律

1. `pages/` 内页面互相链接**不要加 `pages/` 前缀**（M7）。
2. blog 列表卡片链接特例写 `blog/...`（不加 pages/）。
3. 独立 JS 文件必须带全局守卫（RULES §2.3）。
4. 修改 CSS 记得 bump `?v=`（M12）。

## 参考资料索引

| 文件 | 内容 |
|------|------|
| `reference.md` | 相对路径深度表、body class 约定、head meta 规范 |
| `examples/about-page.html` | 真实 pages/ 一级页面结构（head/header/body/footer） |
| `templates/page-skeleton.html` | 完整页面骨架模板（含 `{PREFIX}` 占位符） |
| `templates/head-meta.html` | head 部分（title/og/twitter/fonts） |
