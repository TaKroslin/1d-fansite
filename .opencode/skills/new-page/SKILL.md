---
name: new-page
description: 在 1d fansite 新建 HTML 页面的完整流程——复制模板、相对路径深度表、body class、header/footer 骨架、资源引用与验证。
---

# 新建页面（new-page）

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
| 文章页 | 跑 `tools/build_blog.py`（见 blog-post skill），不手写 |
| 相册 slideshow | `pages/music/albums/<a>/photos/<slug>.html`（见 gallery-page skill） |

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
python tools/_audit_site_images.py   # Broken: 0
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
