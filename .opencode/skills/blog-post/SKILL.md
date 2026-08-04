---
name: blog-post
description: 在 1d fansite 新增/编辑/删除 blog 文章的完整流程——article.md front-matter、build_blog.py 构建、首页卡片手动同步、双语。
---

# Blog 文章工作流（blog-post）

> 这是主流程文档。字段表 → `reference.md`；真实文章 → `examples/`；可复制模板 → `templates/`。

## 工作原理

文章用 Markdown 写，`tools/build_blog.py` 离线渲染成完整 HTML（无运行时 JS 依赖）。文章页 + 列表页 + `posts.json` 都是**自动生成**，首页卡片是**手动同步**。

## 文件结构

```
pages/blog/YYYY-MM-DD/<slug>/
  article.md       ← 源（手改）
  article.zh.md    ← 中文翻译（可选，无 front matter，纯正文）
  index.html       ← 🤖 自动生成（不手改）
```

## 新增文章 checklist

1. **建目录 + 写 `article.md`**：复制 `templates/article.md`，改 front-matter + 正文。字段说明见 `reference.md` §1。
2. **中文版（可选）**：`templates/article.zh.md` —— 无 front-matter，段落数与英文按 top-level 块配对（build 脚本自动包 `.en`/`.zh`）。
3. **更新 `tools/build_blog.py` 顶部 `META` 字典**（og_image 等 MD 无法完全表达，需手动维护）。
4. **更新 `tools/build_blog.py` 顶部 `SCALERS` 字典**（每个标题字号百分比）。
5. **构建**：
   ```bash
   python tools/build_blog.py
   ```
6. **手改 `index.html` 加首页卡片**（`index.html` 行 240–330 附近；无自动同步机制）。参考 `examples/home-card.html` 的结构。

## 编辑文章

1. 改 `article.md` / `article.zh.md`。
2. 重跑 `python tools/build_blog.py`。
3. 首页卡片如需改文案，手动同步 `index.html`。

## 删除文章

1. 删 `pages/blog/YYYY-MM-DD/<slug>/` 目录。
2. 从 `tools/build_blog.py` 的 `META` / `SCALERS` 移除对应条目。
3. 重跑 `python tools/build_blog.py`。
4. 手改 `index.html` 去掉首页卡片。

## 验证

```bash
python tools/_audit_site_images.py   # Broken: 0（header_img/og_image 路径错误会暴露）
rg "your-slug" index.html            # 确认首页卡片同步
```

`AGENTS/LOG.md` 追加日志。

## 铁律

1. 黑底列表卡片用 `logo-white.png`，白底用 `logo-black.png`（M1）。
2. 模板 marker `__POSTS_CARDS__` 是裸文本，**不要包在 HTML 注释里**（RULES §2.4）。
3. `blog.html` 卡片链接**不加 `pages/` 前缀**（M7）。
4. 首页卡片不会自动同步——新增/删除必改首页（或见遗留 TODO：改 JS 读 posts.json）。

## 参考资料索引

| 文件 | 内容 |
|------|------|
| `reference.md` | front-matter 全字段表、构建产物清单、META/SCALERS 说明 |
| `examples/why-this-site-exists.md` | 真实 article.md（含 title_zh） |
| `examples/home-card.html` | 首页 blog 卡片结构 |
| `templates/article.md` | 新文章模板（front-matter 全字段 + 占位正文） |
| `templates/article.zh.md` | 中文翻译模板 |
