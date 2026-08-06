---
name: blog-post
description: 在 1d fansite 新增/编辑/删除 blog 文章的完整流程——article.md front-matter、图片规范、build_blog.py 构建、首页卡片手动同步、视频卡片、双语。
---

# Blog 文章工作流（blog-post）

> 这是主流程文档。字段表 → `reference.md`；真实文章 → `examples/`；可复制模板 → `templates/`。

## 工作原理

文章用 Markdown 写，`tools/build/build_blog.py` 离线渲染成完整 HTML（无运行时 JS 依赖）。文章页 + 列表页 + `posts.json` 都是**自动生成**，首页卡片是**手动同步**。

⚠️ **build 脚本已全 front-matter 驱动**：所有元数据直接读 `article.md` 的 front-matter，`tools/build/build_blog.py` **没有** META/SCALERS 字典（旧文档已作废，不要去找）。

## 文件结构

```
pages/blog/YYYY-MM-DD/<slug>/
  article.md       ← 源（手改，含 front-matter）
  article.zh.md    ← 中文版（可选，无 front matter，纯正文）
  index.html       ← 🤖 自动生成（不手改）
```

## 新增文章 checklist

1. **建目录 + 写 `article.md`**：复制 `templates/article.md`，改 front-matter + 正文。字段说明见 `reference.md` §1。
2. **准备图片（如有）**：见下方「图片规范」。默认封面用 `images/gfx/5guys/logo-black.png`（文章页）/`logo-white.png`（黑底卡片自动换）。
3. **中文版（可选）**：`templates/article.zh.md` —— 无 front-matter，纯正文。段落数可与英文不同（build 会自动 fallback 成 `.en`/`.zh` 两大块，见 reference.md §4）。
4. **构建**：
   ```bash
   python tools/build/build_blog.py
   ```
5. **手改 `index.html` 首页卡片**：见下方「首页卡片更新规则」。无自动同步机制。
6. **如有视频**：正文尾部按「视频卡片方案」插入（见下）。
7. 跑验证（`python tools/audit/_audit_site_images.py` → Broken: 0），`AGENTS/LOG.md` 追加日志。

## 图片规范

| 用途 | 位置 | 命名 | 建议尺寸 |
|------|------|------|---------|
| 文章页顶部横幅（`header_img`） | `images/blog/` | `<slug>-header.png` | 1200×500 横幅 |
| 首页/blog 列表卡片封面（`cover_img`） | `images/blog/` | `<slug>-cover.png` | 1200×1200 方形 |
| 视频卡片封面（可选） | `images/blog/` | `<slug>-bilibili-cover.png` | 1920×1080 16:9 |

- 命名一律小写连字符；自定义图统一放 `images/blog/`（不要塞进 `images/gfx/5guys/`，那是品牌 logo 目录）。
- front-matter 引用深度 4 层：`../../../../images/blog/xxx.png`。
- `header_img` 用于文章页顶部 cover；`cover_img`（自定义字段）用于首页 + blog 列表卡片背景，缺省回退到 `header_img`。**横幅 vs 方形最好都提供**，否则列表卡片会被横幅拉出黑边。
- 改 CSS/图片后记得 bump `?v=`（见 RULES §2.2）。

## 首页卡片更新规则

首页 blog 卡片在 `index.html` 的 `.blog-section` 区域（约行 224–335），结构为多个 `panel-group`（每行两张卡），是**手写死代码**，build 不碰。

**规则：只保留最新 N 篇（当前 N=3），新文章插最前，最旧的一篇从首页删除。** 文章本身仍在 `pages/blog/`，删的只是首页展示卡。

具体操作（以新增 slug=foo 为例）：

1. **找最新卡位置**：首页第一张 blog 卡是"最新"卡（现在是上排右边），新文章卡片替换到该位置。
2. **顺移**：原最新卡顺移到第二排，第二排靠后那张（最旧的）从首页删掉。
3. **卡片内容**：复制 `templates/home-card.html`，替换 `{date_display}`/`{中文日期}`/`{date}`/`{slug}`/`{title}`/`{title_zh}`/`{scaler}`/封面图。
   - 封面背景图：方形图用 `center/cover`（如 `images/blog/foo-cover.png`）；品牌 logo 用 `center/40%`（如 `images/gfx/5guys/logo-white.png`）。
   - `scaler`：与 blog 列表页生成值保持一致（`grep "foo-slug" pages/blog.html` 看 `font-size: XX%`）。
4. **验证**：`grep -c "pages/blog/YYYY-MM-DD" index.html` 确认卡片数量 = N（含新增、不含已删）。

## 编辑文章

1. 改 `article.md` / `article.zh.md`。
2. 重跑 `python tools/build/build_blog.py`。
3. 首页卡片如需改文案，手动同步 `index.html`。

## 删除文章

1. 删 `pages/blog/YYYY-MM-DD/<slug>/` 目录。
2. 重跑 `python tools/build/build_blog.py`。
3. 手改 `index.html` 去掉对应首页卡片（参考上方「首页卡片更新规则」反向操作）。
4. 如用了专属图片，一并从 `images/blog/` 删除。

## 视频卡片方案（bilibili / YouTube）

**不要**直接塞 iframe（会加载即自动播放、无封面、无动画）。用「封面 + 居中 play 按钮，点击才注入 iframe」的卡片。完整规范见 `AGENTS/RULES.md §2.6` 和 `AGENTS/METHODS.md M45–M48`。

**模板**（中英文各放一份，放正文末尾做 PS 段）：

```html
<div class="bilibili-card" style="background-image:url(../../../../images/blog/foo-bilibili-cover.png);">
  <a class="bilibili-play" href="#" data-bilibili-src="//player.bilibili.com/player.html?isOutside=true&aid=...&bvid=...&cid=...&p=1">
    <i class="icon-play"></i><i class="icon-play-text"></i>
  </a>
</div>
```

要点：
- **两个图标都要放**（`icon-play` + `icon-play-text`），hover 动画靠它们切换。
- 依赖 `js/bilibili-video.js`（`tools/templates/article.html` 已自动引用，勿删）；CSS `.bilibili-card`/`.bilibili-play` 已在 styles.css additions 块。
- 遮罩用 `::before`（z-index 1），glyph `i` 必须 `z-index:2` + `color:#fff!important`（M47/M48：正文链接 `a:visited:hover` 会把字变灰）。
- 图标 `font-size:1000%`（~198px）居中于 16:9 框内；**不要**照抄官方 `a.play-button` 的 2000%（方形 panel 设计，进 16:9 会溢出）。
- 不自动播放：iframe 在 `data-bilibili-src` 里，点击才注入，无 `autoplay` 参数。

## 验证

```bash
python tools/audit/_audit_site_images.py   # Broken: 0（header_img/og_image/视频封面路径错误会暴露）
grep "your-slug" index.html          # 确认首页卡片同步
grep -c "pages/blog/YYYY-MM-DD" index.html  # 卡片数量 = N（当前 3）
```

`AGENTS/LOG.md` 追加日志。

## 铁律

1. 黑底列表卡片用 `logo-white.png`，白底用 `logo-black.png`（M1）。
2. 模板 marker `__POSTS_CARDS__` 是裸文本，**不要包在 HTML 注释里**（RULES §2.4）。
3. `blog.html` 卡片链接**不加 `pages/` 前缀**（M7）。
4. 首页卡片不会自动同步——新增/删除必改首页，且只保留最新 N 篇、最旧一篇从首页删掉。
5. 视频卡片层级：遮罩 z-index 1 < glyph z-index 2 + `color:#fff!important`（M47/M48）。
6. 本地 server 任务结束不杀（RULES §1）；Playwright 用 Node + `channel:'chrome'`（RULES §3）。

## 参考资料索引

| 文件 | 内容 |
|------|------|
| `reference.md` | front-matter 全字段表（含 cover_img）、构建产物、双语机制、视频卡片、常见坑 |
| `examples/why-this-site-exists.md` | 真实 article.md（含 title_zh） |
| `examples/more-than-a-ship.md` | 真实文章：三图（header/cover/bilibili-cover）+ 视频卡片 + 非严格双语 |
| `examples/home-card.html` | 首页 blog 卡片结构 |
| `templates/article.md` | 新文章模板（front-matter 全字段 + 占位正文） |
| `templates/article.zh.md` | 中文翻译模板 |
| `templates/video-card.html` | 视频卡片 HTML 片段 |
