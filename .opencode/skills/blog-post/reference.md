# Blog 文章参考（blog-post / reference）

## 1. article.md front-matter 字段

front-matter 包在 HTML 注释 `<!-- -->` 里（避免 YAML 解析依赖）。build 脚本全 front-matter 驱动，**所有字段直接读这里**，没有额外的 META/SCALERS 字典。

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 文章标题 |
| `title_zh` | 可选 | 中文标题（意译）；build 脚本自动读 |
| `date` | ✅ | YYYY-MM-DD（用于 URL） |
| `slug` | ✅ | URL slug（小写连字符） |
| `date_display` | ✅ | 漂亮日期 "27th July 2026" |
| `author` | ✅ | 署名 |
| `header_img` | ✅ | 文章页顶部横幅（相对 `pages/blog/.../index.html`，深度 4 层 `../../../../`） |
| `header_img_size` | 可选 | CSS background-size，默认 `50% contain` |
| `header_img_position` | 可选 | CSS background-position，默认 `center` |
| `cover_img` | 可选 | 首页 + blog 列表**卡片封面**（方形 1200×1200）；缺省回退 `header_img` |
| `description` | ✅ | og:description / meta description |
| `keywords` | ✅ | meta keywords |
| `og_image` | ✅ | og:image（社交分享卡片，用方形 cover 较佳） |
| `scaler` | ✅ | 列表卡片标题字号百分比（55-100%） |

> `cover_img` 是 build_blog.py 支持的自定义字段：`_render_listing_card` 里 `img = post.extra.get("cover_img") or post.header_img`。只给 `header_img` 时列表卡片也用横幅，方形卡会出现黑边，建议横幅/方形都提供。

## 2. 构建产物

`python tools/build_blog.py` 生成：

| 文件 | 说明 |
|------|------|
| `pages/blog/<date>/<slug>/index.html` | 文章页（🤖 不手改） |
| `pages/blog.html` | 列表页（🤖 不手改） |
| `pages/blog/posts.json` | 元数据聚合 |

> ⚠️ `index.html` 首页 blog 卡片是**手写死代码**，不会自动同步（新增/删除必须手改，规则见 SKILL.md「首页卡片更新规则」）。

## 3. 双语机制

- `article.zh.md`：无 front-matter，纯正文。
- **段落数一致时**：按 top-level 块逐段配对，每对包成 `<span class="en">` / `<span class="zh">` 兄弟节点，CSS `html.lang-zh .en{display:none}` 切换。
- **段落数不一致时**（非严格翻译）：build **自动 fallback** 成两大块——`<div class="en">`（全部英文）+ `<div class="zh">`（全部中文），切换语言时整块替换。**不报错**。
- 长文 / 非互译场景直接按各自风格分段即可，不用强行对齐。

## 4. 视频卡片（bilibili / YouTube）

正文视频用「封面 + play 按钮」卡片，点击才注入 iframe（不自动播放）。模板见 `templates/video-card.html`，完整规范见 `AGENTS/RULES.md §2.6`。

- 结构：`.bilibili-card`（16:9 背景封面）+ `.bilibili-play`（内两个图标 `icon-play`/`icon-play-text`）。
- 依赖 `js/bilibili-video.js`（article.html 模板自动引用）与 styles.css additions 块样式。
- **层级铁律**：遮罩 `.bilibili-play::before` z-index 1，glyph `i` z-index 2 + `color:#fff!important`（M47：正文 `a:visited:hover` 高 specificity 会把字变灰；M48：遮罩 z-index 低于 glyph）。
- 图标 `font-size:1000%`（~198px），`top:50%;left:50%` + `translate(-50%,-50%)` 居中；不要照抄官方 2000%/3200%（方形 panel 设计，16:9 框会溢出）。

## 5. 常见坑

| 编号 | 坑 | 处理 |
|------|----|------|
| M1 | logo-black 叠黑底隐形 → 黑底用 logo-white | build 列表卡片自动替换；手写首页卡注意底色 |
| M7 | blog.html 卡片链接多加 pages/ 前缀 → 404 | 列表页链接不加前缀 |
| — | 首页卡片不自动同步 | 手改 index.html，只保留最新 N 篇、最旧一篇删掉 |
| M45 | 本地 server 任务结束不要 pkill | 保持常驻方便用户检查 |
| M46 | Playwright 用 Node + `channel:'chrome'` | Python API 本机未装；全局包 `NODE_PATH=$(npm root -g)` |
| M47 | 正文链接 `a:visited:hover` specificity 极高把 glyph 变灰 | `color:#fff!important` 直接作用于 glyph 元素 |
| M48 | hover 变暗遮罩压暗白色 glyph | 遮罩 `::before` z-index 1 < glyph z-index 2 |
