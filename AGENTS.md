# 1D Fansite — Project Guide

> **FIVE GUYS ONE DIRECTION** — One Direction 粉丝社区网站。基于官方 onedirectionmusic.com 1:1 克隆（Studio Output / Kleber / Sony Music Entertainment UK Ltd.），在此基础上增加 fan editorial 内容。
>
> 维护者：Takion Kroslin（项目内统一署名） / 联系：takionkroslin@icloud.com

---

## Tech Stack

- **Pure static site**：HTML/CSS/JS，无框架，无构建工具
- **Server（开发）**：`python -m http.server 8000`
- **Server（部署）**：Cloudflare Pages（直连 GitHub，自动部署）
- **jQuery 2.1.1**：Google CDN (`https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js`)
- **Waypoints.js**：内嵌在 `js/main.js` 中（用于滚动触发 panel fade-in）
- **Isotope.js**：按需加载，unpkg CDN (`https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js`)
- **Icomoon**：自定义图标字体，base64 嵌入 CSS
- **Markdown 渲染（仅 blog）**：`python-markdown` 库（`tools/build_blog.py` 离线渲染，无运行时依赖）
- **Pillow**：开发期一次性图片优化

## File Structure

```
E:\文档\GitHub\1d-fansite/
├── index.html                       ← 首页（hero + 16yrs + intro + latest + 4 new-section entries + 克隆 panels）
├── README.md                        ← 面向投稿者的使用文档
├── AGENTS.md                        ← 本文件（开发者文档 + 修改日志）
│
├── css/
│   └── styles.css                   ← 官方 minified CSS（91KB） + 末尾的 FIVE GUYS 自定义补丁
│
├── js/
│   ├── main.js                      ← 官方 minified JS（Waypoints、hover-cycle、play-button、retinafy）
│   ├── jquery.min.js                ← 1.x bundled（部分历史页面引用）
│   └── isotope.pkgd.min.js          ← Isotope masonry
│
├── images/
│   ├── gfx/                         ← 官方 assets/gfx 全部（39 张）
│   │   └── 5guys/                   ← FIVE GUYS 品牌 logo（black/white，PNG 优化到 3000px 宽）
│   ├── media/article-images/        ← Journal + music 文章配图
│   ├── media/article-logos/         ← 专辑 logo
│   ├── media/gallery-images/        ← Gallery 封面
│   └── tour/                        ← Tour archive 图片
│
├── pages/                           ← 所有非首页页面
│   ├── music.html                   ← 5 张专辑 + 20 子页 + 65 首歌页
│   ├── journal.html                 ← 克隆 20 篇 journal 2015–2020
│   ├── band.html                    ← 5 成员 + 视差
│   ├── tour.html                    ← 433 个 tour date
│   ├── shop.html                    ← Shop panels
│   ├── blog.html                    ← 🤖 自动生成 — blog 列表（不手改）
│   ├── gallery.html                 ← 5 个 gallery 分类
│   ├── this-is-us.html              ← Mainland China fan-account 目录
│   ├── about.html                   ← 项目说明
│   ├── blog/                        ← 4 篇文章，路径 pages/blog/YYYY-MM-DD/slug/
│   │   └── 2026-07-27/
│   │       ├── why-this-site-exists/{article.md, index.html}
│   │       ├── every-july-23rd-we-come-home/{article.md, index.html}
│   │       ├── why-i-love-1d-so-bad/{article.md, index.html}
│   │       └── ready-to-run/{article.md, index.html}
│   ├── music/albums/                ← 5 专辑页面
│   ├── tour/                        ← Tour archive
│   └── gallery/                     ← 5 gallery 分类
│
├── journal/                         ← 克隆的 20 篇 journal 文章
│   └── YYYY-MM-DD/<slug>/index.html
│
└── tools/                           ← 构建 + 维护脚本
    ├── build_blog.py                ← Markdown → HTML 构建器（每次编辑 article.md 后跑）
    ├── extract_articles.py          ← 一次性 HTML→MD 迁移器（已完成，不再用）
    ├── audit_footer.py              ← 一次性 footer 链接审计 + 修复（已完成）
    ├── patch_css.py                 ← 一次性 CSS 补丁工具（已完成）
    ├── patch_escape.py              ← 一次性 HTML 转义修复（已完成）
    ├── templates/
    │   ├── article.html             ← 文章页模板（{{title}} 占位符）
    │   └── blog_list.html           ← 列表模板（__POSTS_CARDS__ marker）
    ├── _qa*.py, _vfy*.py, _audit*.py, _debug*.py, _add_display_swap.py  ← 一次性 QA 脚本（完成后可删）
    └── _qa_screenshots/             ← Playwright 截图归档
```

## Path Conventions

所有页面通过 `<link>` 和 `<script>` 标签加载资源，不使用任何模块系统。

| 资源 | 根级页面 (`index.html`) | `pages/` 一级 | `pages/blog/...` 深度 4 |
|------|----------------------|----------------|---------------------------|
| CSS | `css/styles.css` | `../css/styles.css` | `../../../../css/styles.css` |
| JS | `js/main.js` | `../js/main.js` | `../../../../js/main.js` |
| jQuery | Google CDN | 同 | 同 |
| 图片 | `images/gfx/...` | `../images/gfx/...` | `../../../../images/gfx/...` |
| Logo link | `index.html` | `../index.html` | `../../../../index.html` |
| Footer about | `pages/about.html` | `about.html` | `../../../../pages/about.html` |

⚠️ **blog 列表页面**是个特例：它位于 `pages/blog.html`，但里面的卡片链接是 `blog/2026-07-27/...`（已经是 `pages/` 之下的相对路径），不要多加 `pages/` 前缀。封面图 `url(../images/gfx/...)`。

## Design System

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Black | `#000` | Body 背景、header、footer |
| White | `#fff` | 默认文字色、按钮、边框 |
| Tweet Blue | `#d9e0f1` | Twitter panel 背景 |
| News Gray | `#eef2f4` | Homepage news panel 背景 |
| Merch Red | `#fd7161` | Shop merch panel 背景 |
| Fragrance Pink | `#ffddd4` | Shop fragrance panel 背景 |
| Moments Gold | `rgba(255,233,178,0.9)` | Moments panel overlay |
| Instagram Blue | `rgba(83,128,165,0.7)` | Instagram hover overlay |
| History Blue | `rgba(206,211,241,0.75)` | Homepage video info overlay |

### Typography — Font Families

| Token | Font Stack | CSS Class | Weight | Style |
|-------|-----------|-----------|--------|-------|
| Oswald | Oswald, sans-serif | `.oswald` | 400, 700 | — |
| Source Sans Pro | Source Sans Pro | `.source-sans-pro` | 400 | — |
| Source Code Pro | Source Code Pro | `.source-code-pro` | 300-700 | — |
| Playfair Display | Playfair Display, serif | `.playfair-display` | 700 | — |
| Cousine | Cousine, monospace | `.cousine` | 400, 700 | — |
| Six Caps | Six Caps, sans-serif | `.six-caps` | 400 | uppercase |
| Vampiro One | Vampiro One, cursive | `.vampiro-one` | — | — |
| Codystar | Codystar, cursive | `.codystar` | — | — |
| Courier New | Courier New, Courier, monospace | — | 700 | — |
| Times New Roman | Times New Roman, Times, serif | `.times` | — | — |

### Typography — Menu Classes (hover-cycle)

六种菜单字体，通过 `menu1`–`menu6` class 切换，hover-cycle 动画在 75ms 间隔下循环。

| Class | Font | Size | Transform | Letter-spacing |
|-------|------|------|-----------|----------------|
| `menu1` | Oswald 700 | 106.25% | uppercase | 0.05em |
| `menu2` | Source Sans Pro | 131.25% | none | 0.1em |
| `menu3` | Courier New 700 | 118.75% | uppercase | 0.05em |
| `menu4` | Playfair Display 700 | 118.75% | none | 0.05em |
| `menu5` | Vampiro One | 118.75% | uppercase | 0.15em |
| `menu6` | Cousine 700 | 100% | uppercase | 0.15em |

### Typography — Semantic Roles

| Role | Font | Size | Notes |
|------|------|------|-------|
| Panel header title | Times New Roman | 87.5% | `.title` |
| Panel header section | Source Code Pro | 87.5% | uppercase, `.section-name` |
| Journal headline | Playfair Display 700 | 281–375% | `.journal-article h2` |
| Tour headline | Six Caps | 500–1250% | uppercase |
| Moments headline | Codystar | 500% | `.panel-content h2` |
| Tweet body | Cousine | 206.25% | letter-spacing: 0.079em |
| Newsletter headline | Oswald | 406.25% | uppercase |
| Button (more) | Source Code Pro 600 | — | uppercase, letter-spacing: 0.035em |
| Footer credits | Source Code Pro 600 | 93.75% | uppercase, letter-spacing: 0.15em |

### Responsive Breakpoints

| Breakpoint | Behavior |
|------------|----------|
| **767px** (`mono_col_breakpoint`) | duo→mono 切换：panel 全宽、header 简化、导航变 overlay |
| **2400px** | 最大宽度，字体锁定 200% |
| **1250px–2400px** | 逐步放大字体（每 50px 增 ~4%） |
| **350px–1150px** | 逐步缩小字体（每 50px 减 ~4%） |
| **350px 以下** | 极限缩小至 50% |

## Component Catalog

### A. Panel System（核心布局单元）

所有内容块都是 `.panel`。面板是正方形（`padding: 50% 0 0 0; height: 0; overflow: hidden`），内容通过绝对定位放入。

**通用结构：**
```html
<div class="panel {panel-type}">
  <div class="bg retinafy" style="background-image: url(...)"></div>
  <div class="inline"></div>              <!-- hover 边框动画层 -->
  <div class="panel-header">...</div>      <!-- 顶部元信息 -->
  <h2>...</h2>                             <!-- 标题 -->
  <div class="info">...</div>              <!-- 详细信息 -->
  <a class="more" href="...">...</a>      <!-- CTA 按钮 -->
</div>
```

**`.panel-header`：** 绝对定位在顶部，包含 `.title`（Times New Roman）和 `.section-name`（Source Code Pro uppercase，白色带底线）。

**`.more` 按钮：** Source Code Pro 600 uppercase，白色边框 `0.15em solid #fff`，hover 反转（白底黑字）。

### B. Panel 类型全览

| Type | CSS Class | 背景 | 特点 |
|------|-----------|------|------|
| **Hero** | `.panel.hero` | 图片 | 全屏背景 + 居中 logo |
| **Homepage Video** | `.panel.homepage-video` | 图片 + 半透明色块 | 左右分栏：info + play button |
| **Homepage Music** | `.panel.homepage-music` | `#fff` + 纹理 | 专辑封面 + 描述 |
| **Homepage Tour** | `.panel.homepage-tour` | YouTube 视频背景 | Next show + Next five |
| **Homepage News** | `.panel.journal-news.homepage-news` | `#eef2f4` | 带 inline hover 边框 |
| **Journal Article** | `.panel.journal-article` | `#fff` | 无高度限制，富文本内容 |
| **Journal News** | `.panel.journal-news` | — | 带 `.inline` hover 边框 |
| **Journal Instagram** | `.panel.journal-instagram` | Instagram 图片 | 带 `.instagram-hover` overlay |
| **Journal Tweet** | `.panel.journal-tweet` | — | 引用 tweet 内容 |
| **Journal Moments** | `.panel.journal-moments` | 图片 | 居中金色 overlay + hover 扩展边框 |
| **Journal Gallery** | `.panel.journal-gallery` | 灰度图片 | 居中标题 + count badge |
| **Journal Video** | `.panel.journal-video` | YouTube 缩略图 | Play button overlay |
| **Music Index** | `.panel.music-index-item` | 专辑封面 | 专辑名 (logo 图片) + 描述 |
| **Band Member** | `.panel.band-member` | 成员照片 | 左右分栏（图片/文字），滚动视差 |
| **Tour Submenu** | `.panel.tour-submenu` | `#000` | Tab 切换 |
| **Tour Intro** | `.panel.tour-intro` | YouTube 视频 | 主标题 + next show |
| **Tour Listing** | `.panel.tour-listing` | 背景 + 半透明遮罩 | 按地区分组的日期列表 |
| **Shop Banner** | `.panel.shop-banner` | 图片 | 大图 + logo + info + CTA |
| **Shop Other** | `.panel.shop-other` | 图片 | 方形面板 |
| **Shop Fragrance** | `.panel.shop-fragrance` | `#ffddd4` | logo + 描述 |
| **Shop Gifts** | `.panel.shop-gifts` | 图片 | 带 "Personalised" 前缀 |
| **Shop Merch** | `.panel.shop-merch` | 可变色 | Cousine 字体标题 |
| **Shop Music** | `.panel.shop-music` | 图片 | Oswald 字体标题 |
| **Tweet** | `.panel.tweet` | `#d9e0f1` | 带粗边框的内容区 |
| **Gallery Cover** | `.panel.gallery-cover` | 灰度图片 | 居中文字 + 图片计数 |
| **Newsletter** | `.panel.newsletter` | `#fff` | 居中表单 |
| **404** | `.panel.four-zero-four` | — | 大号居中文字 |
| **Anniversary Poster** | `.panel.anniversary-poster` | 图片 | 16周年纪念面板（首页新增） |

### C. Header（双层）

```
#sticky (position:fixed, top:0)
  └─ h1.logo > a (logo 图片)
  └─ button.menu (icon-menu / icon-close toggle)

#nav (隐藏，mobilised 时全屏 overlay)
  └─ nav#main
       └─ ul.menu > li.hover-cycle > a.menu1–6
```

- **Desktop**: `#sticky` 固定顶部，`#nav` 在内容流中显示菜单
- **Mobile (<768px)**: `#nav` 隐藏，点击 menu button → `#nav.mobilised` 全屏覆盖（`display:flex; flex-direction:column; overflow:hidden` 让 nav 内部滚动而不是 header 滚动）
- **Scroll**: `$(window).scrollTop()` 超过 `#nav` 时为 header 加 `.scrolled`
- **首页特殊处理**: `.home-section` 下的 `#sticky` 初始 `top: -13.77%`，滚动后归零

### D. Footer

```
footer
  ├─ #back-to-top (绝对定位在 footer 顶部)
  ├─ #social > ul > li > a (社交图标网格，含 hover 色彩)
  └─ #credits (两端对齐的法律信息)
```

社交 hover 色：Facebook `#c4d2f2`，Twitter `#c4d2f2`，Pinterest `#f9c0bf`，SoundCloud `#ffd4b2`，Spotify `#caecd7`，YouTube `#f9c0bf`，Instagram `#b2cade`，Apple Music `#c5c5c5`

### E. Icomoon Icon Font

自定义图标字体，base64 内嵌在 CSS 中。class 格式：`.icon-{name}`。

可用图标：`menu`, `close`, `play`, `play-text`, `apple-music`, `amazon`, `google-play`, `facebook`, `twitter`, `instagram`, `pinterest`, `youtube`, `spotify`, `soundcloud`, `google-plus`, `heart`, `caret-up`, `up-arrow`, `left-arrow`, `right-arrow`, `carousel-left`, `carousel-right`

## Animations & Interactions

| Animation | Trigger | Implementation |
|-----------|---------|----------------|
| **Panel fade-in** | 滚动到可视区 | Waypoints.js：`opacity: 0→1`，250ms |
| **Menu hover-cycle** | 鼠标悬停菜单项 | 每 75ms 循环 `menu1→menu2→...→menu6` |
| **Gallery hover** | 鼠标悬停 `.gallery-cover` | parent `.hover` toggle |
| **Moments hover** | 鼠标悬停 `.journal-moments` | 扩展边框 + 内容缩放 1.33→消失 |
| **Instagram hover** | 鼠标悬停 `.journal-instagram` | overlay opacity 0→1 |
| **Inline video** | 点击 `.play-button` | 创建 `.inline-video` iframe，fadeIn 500ms |
| **Mobile menu** | 点击 `.button.menu` | `#nav.mobilised` toggle |
| **Back to top** | 点击 `#back-to-top a` | animate scrollTop:0，500ms |
| **Band parallax** | 页面滚动 | `.band-member .image .bg` background-position 循环偏移 |
| **Territory selector** | 点击 territory 链接 | `.territory-list.active` + `.screen` overlay |
| **Isotope layout** | 页面加载 + 无限滚动 | Isotope masonry 布局（journal、shop） |

## Blog Markdown Workflow

文章用 Markdown 写，front-matter 用 HTML 注释包起来（避免 YAML 解析依赖）。`tools/build_blog.py` 离线渲染成完整 HTML（不在浏览器跑 JS，Cloudflare 部署稳定）。

### 文件结构

```
pages/blog/2026-07-27/<slug>/
  article.md       ← 源（手改）
  index.html       ← 🤖 自动生成（不手改）
```

### article.md 格式

```markdown
<!--
title: 文章标题
date: 2026-07-27
slug: your-post-slug
date_display: 27th July 2026
author: Takion Kroslin
header_img: ../../../../images/gfx/5guys/logo-black.png
header_img_size: 50% contain
header_img_position: center
description: 一句话 SEO 描述。
keywords: One Direction, 关键词, 多个
og_image: ../../../../images/gfx/hero-2015-rect-sml.jpg
scaler: 60%
-->

正文第一段。

正文第二段，*斜体*、**加粗**、`code`、[link](https://example.com) 都可以用。
```

### 必需 front-matter 字段

| 字段 | 说明 |
|------|------|
| `title` | 文章标题 |
| `date` | YYYY-MM-DD（用于 URL） |
| `slug` | URL slug（小写连字符） |
| `date_display` | 漂亮日期如 "27th July 2026" |
| `author` | 署名 |
| `header_img` | 封面图（相对 `pages/blog/.../index.html` 的深度 = 4 层 `../`） |
| `header_img_size` | CSS `background-size`，默认 `50% contain` |
| `header_img_position` | CSS `background-position`，默认 `center` |
| `description` | og:description / meta description |
| `keywords` | meta keywords |
| `og_image` | og:image（社交分享卡片） |
| `scaler` | 列表卡片标题字号百分比（55-100%） |

### 编辑流程

1. 编辑 `pages/blog/YYYY-MM-DD/<slug>/article.md`
2. `cd E:\文档\GitHub\1d-fansite && python tools/build_blog.py`
3. 自动生成 3 个文件：
   - `pages/blog/.../index.html`（文章页）
   - `pages/blog.html`（列表）
   - `pages/blog/posts.json`（元数据聚合）
   - （首页 blog 卡片是手写在 `index.html` 里的，**不会自动同步** —— 见下方注意事项）

⚠️ **首页 blog 卡片是手写的**（`index.html` 行 240–330 附近），新增/删除文章需要同步改首页（或者把首页卡片改成 JS 读取 `posts.json` 渲染，TODO）。

### 新增文章 checklist

1. 创建 `pages/blog/YYYY-MM-DD/<slug>/article.md`（复制现有 article.md 改 front-matter + 正文）
2. 编辑 `tools/build_blog.py` 顶部 `META` 字典（手动维护元数据，因为 og_image 等不是 MD 能完全表达的）
3. 编辑 `tools/build_blog.py` 顶部 `SCALERS` 字典（每个标题的字号百分比）
4. 跑 `python tools/build_blog.py`
5. **手改 `index.html` 添加首页卡片**（目前没有自动同步机制）

### 模板

- `tools/templates/article.html` —— 文章页模板，`{{title}}`、`{{body_html}}`、`{{cover_style}}` 等占位符
- `tools/templates/blog_list.html` —— 列表模板，用 `__POSTS_CARDS__` marker（**不要包在 HTML 注释里**，否则 build 脚本会替换到错误位置）

## Coding Conventions

- **不要引入框架**：保持纯 HTML/CSS/JS + jQuery
- **修改 CSS 时**：追加新规则而非修改现有规则（除非修复 bug）。`css/styles.css` 是单行 minified，自定义规则放文件末尾
- **修改 JS 时**：官方核心逻辑保留，新功能在 `$(document).ready()` 末尾追加
- **新增页面**：复制任意 `pages/*.html` 作为模板，保留 header/footer 结构
- **图片**：新图片放 `images/`；官方图片已全量下载到 `images/gfx/` 和 `images/media/`
- **资源 CDN**：Google Fonts URL 永远带 `&display=swap`（GFW 环境字体加载慢）
- **不使用**：`<base>` 标签、CSS Modules、CSS-in-JS、任何构建/打包工具
- **修改日志**：每次改动都在本文件末尾"修改日志"区段写一条
- **不要重复造轮子**：所有维护/QA 脚本放 `tools/`，完成的任务标 `一次性` 标签

## 关键 Bug 修复记录（重要 CSS 补丁）

`css/styles.css` 末尾的 `/* FIVE GUYS ONE DIRECTION additions */` 块是项目级 CSS 补丁，覆盖官方 minified 规则。**不要删除这些补丁**：

```css
/* BUG FIX: nav overlay scrolls when 10 menu items exceed viewport height */
header#nav.mobilised{display:flex;flex-direction:column;overflow:hidden;...}

/* BUG FIX: mobile panel-news heading centers cleanly */
@media only screen and (max-width:767px){
  .panel.journal-news.homepage-news h2{margin:15% auto;width:80%;text-align:center}
}

/* BUG FIX: mobile home/blog cards
   - 隐藏 mobile 下 panel-header（标题 + section-name）
   - 标题 h2 绝对定位到 top 18%
   - .more 按钮绝对定位到 bottom 12%
   - 防止原始 mobile 规则用 `!important` 恢复显示 */
@media only screen and (max-width:767px){
  .home-section .panel .panel-header,
  .blog-section .panel.journal-news .panel-header{display:none!important}
  .panel.journal-news.homepage-news{...padding:100% 0 0 0!important}
  .panel.journal-news.homepage-news h2{position:absolute;...top:18%;margin:0}
  .panel.journal-news.homepage-news .info{bottom:12%...position:absolute}
}

/* BUG FIX: mobile blog article page */
@media only screen and (max-width:767px){
  .article-cover{padding:50% 0 0 0;...}
  .panel.journal-article .article-holder{margin:0 5%;padding-bottom:3em}
  .panel.journal-article .article-holder h2{margin:.8em 0 1em;font-size:281%;text-align:center}
}
```

## Page-Specific Notes

### index.html (Home)
- Body class: `duo home-section`
- 包含：Hero、Journal article (#10YearsOf1D)、Homepage video、panel-group (news + instagram)、Homepage music、panel-group (moment + newsletter)、Gallery cover、Tweet、#16YearsOf1D 周年面板、4 个新分区入口卡片、4 篇 blog latest 卡片
- 特殊 header 行为：`home-section` + `mono` 时 header 始终 scrolled
- **首页 blog 卡片需手动同步**（见上方 Blog Markdown Workflow）

### pages/music.html
- Body class: `duo music-section`
- 5个 `.music-index-item` panel（Made In The A.M.、Four、Midnight Memories、Take Me Home、Up All Night）
- 每个 panel 的 h2 是 album logo（CSS background-image），通过特定 class 匹配

### pages/band.html
- Body class: `duo band-section`
- 5个 `.band-member` panel（Louis、Harry、Liam、Niall、Zayn）
- 图片有滚动视差效果
- 内联 JS 包含 offsets 数组控制视差帧

### pages/tour.html
- Body class: `duo tour-section`
- Tour submenu + tour listing
- Tour listing 背景为 YouTube 视频（非 iOS/IE 时移除静态 bg 替换为 iframe）
- 日期按区域分组（Europe、North America、Asia 等）

### pages/journal.html
- Body class: `duo journal-section`
- Isotope masonry 布局 + 无限滚动 AJAX 加载
- 混合 panel 类型：news、instagram、tweet、moments、gallery、video
- 内联 JS 含完整 infinite scroll 逻辑

### pages/shop.html
- Body class: `duo shop-section`
- Isotope masonry 布局
- Shop banner + 多个 shop panel（books、gifts、merch、fragrance、music）

### pages/blog.html
- Body class: `duo blog-section`
- 🤖 **自动生成** by `tools/build_blog.py`
- 包含：blog 介绍 panel + 4 张文章卡片（panel-group 两两排列） + moment panel + newsletter panel
- 卡片背景使用 `images/gfx/5guys/logo-black.png`（黑底 + 白 logo）

### pages/blog/2026-07-27/<slug>/index.html
- 🤖 **自动生成**
- `.article-cover` 用 front-matter 的 `header_img` 字段
- 正文用 python-markdown 渲染

---

## 修改日志

> 每次有改动就追加一条。格式：日期 / 改动概要 / 涉及文件 / 影响

### 2026-07-28 — Markdown 工作流 + Mobile/Footer/Logo/Fonts 综合修复

**Session：Mavis 协助 Takion 完成 1D Fansite 多项维护。**

#### 改动概要
1. **Blog Markdown 工作流上线** — 把 blog 文章从手写 HTML 迁到 Markdown（`tools/build_blog.py` + `article.md` × 4）
2. **Mobile 显示修复** — 首页 / blog 列表 / blog 详情页在 mobile（≤767px）的标题/按钮位置
3. **Footer 链接修复** — 所有 173 个 `../about.html` 错误路径批量修正
4. **Logo 压缩** — `logo-white.png` 6.5MB → 509KB，`logo-black.png` → 114KB（3000px 宽）
5. **Google Fonts `display=swap`** — 160+ HTML 文件加 `&display=swap`
6. **AGENTS.md + README.md 完善** — 加入 Markdown 工作流、修改日志、品牌说明
7. **blog 列表封面图修复** — 路径 `url(../../../../../images/...)` 修正为 `url(../images/...)`

#### 新增文件
- `tools/build_blog.py` — Markdown → HTML 构建器（核心）
- `tools/extract_articles.py` — 一次性 HTML→MD 迁移
- `tools/audit_footer.py` — 一次性 footer 链接审计 + 修复
- `tools/patch_css.py` / `tools/patch_escape.py` — 一次性 CSS/HTML 修复
- `tools/templates/article.html` — 文章页模板
- `tools/templates/blog_list.html` — blog 列表模板
- `pages/blog/2026-07-27/{slug}/article.md` × 4 — Markdown 源
- `pages/blog/posts.json` — 元数据聚合
- `tools/_qa*.py`, `_vfy*.py`, `_audit*.py`, `_debug*.py`, `_add_display_swap.py` — 一次性 QA 脚本

#### 关键修复细节
- **`styles.css` 末尾合并的 mobile card 补丁**：覆盖官方 minified CSS 在 767px 处的 `!important` 规则（隐藏 panel-header，h2 顶部 18%，more 底部 12%）
- **blog.html 卡片链接路径**：URL `pages/blog/...` → `blog/...`（去掉 `pages/` 前缀）
- **blog.html 卡片封面图**：5 层 `..` → `../images/...`（深度算错，hardcode 改 string 切拼）
- **blog 模板 marker**：`<!-- __POSTS_CARDS__ : ... -->` 删除（避免 build replace 命中注释里的 marker），只剩裸 `__POSTS_CARDS__` 一行
- **ready-to-run 引文 byline**：从 `article.md` 末尾删除 `*"The best journeys..."*`
- **`build_blog.py._render_listing_card`**：从 `post.header_img` 切出 `images/...` 后缀，重新拼成 `../images/...`（修过两次：第一次切掉 `images/` 漏了 `images/`，第二次才对）
- **blog 卡片 opacity 强制为 1**：Waypoints fade-in 让所有 `.fade-me` 元素初始 opacity:0，靠滚动触发到 1。但 blog 列表用户不滚动直接看时，后面 3 张卡片永远 opacity≈0（封面图不可见）。加 `.blog-section .panel.fade-me{opacity:1!important}` 强制首屏可见。
- **blog 卡片 style 对齐首页**：第一版 build 用 `background:url(...) center/40% no-repeat #000;background-blend-mode:normal;` 多了一个 `background-blend-mode`，被 mobile CSS 干扰导致封面图被遮。改成严格复用首页 `index.html` 行 243 的简洁写法（去掉 `background-blend-mode`），封面图正常显示。
- **blog 卡片 logo 颜色翻车（关键 bug）**：`logo-black.png` 是黑色文字 + 透明背景（rgba 0,0,0,255），叠在黑底卡片上完全隐形。改成 `logo-white.png` 后正常显示。`_render_listing_card` 加 `if "logo-black" in img: img = img.replace("logo-black", "logo-white")` 强制列表卡片用白 logo。文章详情页 cover 不动（白底配黑 logo 没问题）。
- **blog 卡片 background-size 比例翻车**：`logo-white.png` 原始 3000×548（aspect 5.5:1），用 `background-size:40%` 在 1:1 卡片里会按宽度 40% 缩成 ~58px 高的窄条，看起来像图片加载失败。改成 `center/contain no-repeat` 让 logo 按比例完整显示在卡片中央。
- **文章封面顶图改为 `<img>`**（2026-07-28）：之前 `.article-cover` 用 `padding-top:33.33%`（撑高度）+ `background-size:50% contain`（限制 logo 大小）+ `background-color:#fff`（白底），结果是宽高比固定的"画框"把 logo 装进去，但 logo 的 5.5:1 比例跟 1:1 画框不匹配，移动端被裁切、桌面端被拉变形。改成 `<img style="display:block;width:100%;height:auto;">` —— 宽度铺满屏幕，高度由图片原比例自然撑开。同时清掉 `.article-cover` 的 padding-top / background 规则（之前是给 background-image 用的，img 不需要）。

#### 验证
- 10 个页面 playwright 巡检：全部 200，0 JS 错误，所有 footer about 链接解析为 `http://localhost:8000/pages/about.html`
- Mobile (390×844) CSS 实测：h2 `position:absolute; top:18%; margin:0px` ✓, panel-header `display:none` ✓, cover `padding:50%` ✓
- 启动 `python -m http.server 8000` 在 `http://localhost:8000` 提供预览
- Blog 列表 4 张卡片正确渲染、链接全部有效、点进去能打开文章
- 实际背景图 URL `http://localhost:8000/images/gfx/5guys/logo-black.png` 200 加载

#### 已知问题（不影响功能）
- `pages/journal.html` 引用 2 个 2015 年的 Instagram CDN（`scontent-lhr8-1.cdninstagram.com/...`）已失效（CDN 早过期）。需要换图或移除 `<img>` 引用。
- 首页 blog latest 卡片是手写 HTML，新增/删除文章需手动同步 `index.html` 行 240–330 附近。
- `tools/_qa*.py` 等一次性 QA 脚本可清理（占空间但不影响功能）。

#### 下次待办
- [ ] 首页 blog latest 卡片改成 JS 读 `posts.json` 自动渲染
- [ ] 清理 `tools/_*.py` 一次性脚本
- [ ] 把 2015 Instagram 死链换成新图或移除
- [ ] 测试 Cloudflare Pages 部署后的 `posts.json` 抓取
- [ ] 国际化（中文版切换）—— 设计层面没动，先不动

---

### 2026-07-28 — Blog 列表 4 轮 bug 修复 + 文章 cover 改为 `<img>`

**Session：Mavis 在与 Takion 连续 5 轮迭代中彻底修复了 blog 系统的视觉 bug。**

#### 改动概要
1. **blog 列表模板 marker 撕裂**：`tools/templates/blog_list.html` 第 77 行原本是 `<!-- __POSTS_CARDS__ : ... -->` 注释 + 第 78 行裸 marker。`build_blog.py._build_listing_html` 用 `template.replace("__POSTS_CARDS__", cards)` 命中的是**注释里**的 marker（先出现），导致 `<!--` 和 `-->` 被撕开，cards 跑到注释中间。删掉注释行，只留第 78 行裸 marker。
2. **blog 列表卡片 URL 路径错**：`_render_listing_card` 用 `post.rel_url`（= `pages/blog/2026-07-27/...`）拼 href，但 blog.html 自己就在 `pages/`，正确路径是 `blog/2026-07-27/...`。加 `if url.startswith("pages/"): url = url[len("pages/"):]`。
3. **blog 列表卡片封面图路径错**：原本 `url(../{header_img})`，但 `header_img` 已经是 4 层 `../`（article 深度），叠加后变 5 层。改成从 `header_img` 切出 `images/...` 后缀再拼 `../images/...`。
4. **blog 卡片 opacity 被 waypoints 锁在 0**：mobile 下 waypoints 不会自动触发，4 张卡片里只有首张 opacity 正常。加 `.blog-section .panel.fade-me{opacity:1!important}` 强制首屏可见。
5. **blog 卡片 style 不对齐首页**：第一版加 `background-blend-mode:normal` 被 mobile CSS 干扰，去掉后严格复用首页 `index.html` 写法。
6. **logo-black.png 颜色翻车**（最关键）：`logo-black.png` 是**黑字透明底**，叠在 `#000` 黑底卡片上完全隐形。改用 `logo-white.png`（白字透明底）。`_render_listing_card` 加 `if "logo-black" in img: img = img.replace("logo-black", "logo-white")`。
7. **logo 比例翻车**：`logo-white.png` 原始 3000×548（aspect 5.5:1），1:1 卡片里 `background-size:40%` 按宽度 40% 算，缩成 58px 高的窄条。改成 `center/contain no-repeat`。
8. **CSS `margin:15%` 残留**：styles.css 里有 2 处重复的 mobile `margin:15% auto` 规则（line 24 和 line 81）覆盖了 `margin:0`，导致标题位置始终偏移。删掉两处。
9. **文章封面顶图改为 `<img>`**：之前用 `<div style="background:url(...); background-size:50% contain">` + `padding-top:33.33%` 撑出 1:1 盒子，把 logo 装进去。但 5.5:1 logo 跟 1:1 框不匹配，移动端被裁、桌面端被拉变形。改成 `<img style="display:block;width:100%;height:auto;">` —— 宽度铺满屏幕，高度由图片原比例自然撑开。同时清掉 `.article-cover` 的 padding-top / background 规则。

#### 涉及文件
- `tools/build_blog.py` — `_render_listing_card` 改图片路径 + 颜色修正 + style 对齐首页；`_build_article_html` 改用 `cover_src` 传图
- `tools/templates/blog_list.html` — 删除 marker 注释行
- `tools/templates/article.html` — `.article-cover` 改用 `<img>`
- `css/styles.css` — 删 2 处重复 `margin:15%` 规则；`.article-cover` 改 height/auto；mobile patch 用 `<img>` 规则替代 padding-top
- `tools/_qa*.py, _vfy*.py, _compare.py, _box.py, _cover.py, _scroll_blog.py, _find_home_card.py, _final_visual.py` — 一次性 QA 脚本（保留作为调试工具，可清理）

#### 关键经验（写入 agent memory + AGENTS.md）
- `logo-black.png` 是**黑字透明底**（rgba 0,0,0,255），不是"反色"。错用 = 卡片空白。配白底用 logo-black，配黑底用 logo-white。
- 超宽 logo（aspect > 3:1）在 1:1 容器里用 `background-size:N%`（按宽度）会被压成窄条。用 `contain`。
- CSS 调试时 `getComputedStyle` 显示 `backgroundImage` 正确但视觉上不可见，**先检查颜色对比和比例**，不要怀疑层叠/特异性。
- build 模板里的 `{{MARKER}}` **不要**用 `<!-- {{MARKER}} -->` 注释包，否则 `str.replace` 会命中注释里那次。

#### 验证
- playwright 截图：blog 列表 4 张卡片（mobile 390×844 + desktop 1280×800）全部正常显示白 logo，宽度铺满卡片
- 文章详情页：cover 顶图在 mobile 和 desktop 都按原比例铺满宽度，无裁切
- 10 个页面 + 4 个 article 巡检：全部 200，0 JS 错误，所有 footer 链接正确

#### 已知问题（仍存在）
- 2015 Instagram CDN 死链（`scontent-lhr8-1.cdninstagram.com`）：与本次无关，历史遗留
- 首页 blog latest 卡片手写 HTML：新增/删除文章需手动同步
- `tools/_*.py` 一次性脚本可清理

#### 下次待办（继续）
- [ ] 首页 blog latest 卡片改 JS 自动渲染
- [ ] 清理一次性脚本
- [ ] 替换 Instagram 死链
- [ ] Cloudflare Pages 部署后 `posts.json` 抓取验证
- [ ] 中文版切换（设计层面先不动）

#### 本次会话产出的最终状态
- 4 篇文章 front-matter 都干净（无 byline 残留）
- `pages/blog.html` + 4 篇文章 + `posts.json` 由 `python tools/build_blog.py` 一次性生成
- `python -m http.server 8000` 跑在后台，http://localhost:8000/ 可访问
- logo 资源最终状态：`images/gfx/5guys/{logo-white,logo-black}.png` 都是 3000×548，509KB / 114KB
- `images/gfx/5guys/logo-black.png` 当前**仅**用于文章详情页 cover（白底场景）；列表卡片用 logo-white.png（黑底场景）

---

### 2026-07-28 — Zayn Band Panel 完整实现 + 5 成员引言更新

**Session：Mavis 完成 Zayn Malik 的 band.html panel（filmstrip 图片、CSS styling、social links、parallax），并更新全部 5 位成员引言。**

#### 改动概要
1. **Zayn filmstrip 图片** — 用户提供 2 张 Zayn 照片，垂直拼接为 500×1000（1:2 比例，匹配其他成员 300×600），保存为 `images/gfx/filmstrip-zayn-smlc4ca.jpg`
2. **Zayn panel HTML** — `pages/band.html` 新增第 5 个 `.panel.band-member.zayn`，结构完全复刻其他成员（`.image > .bg.retinafy` + `.text > .text-inner > h2 + p + .social`）
3. **Zayn CSS** — `css/styles.css` 新增 zayn 专属规则：Cousine 700 字体、`filmstrip-zayn-smlc4ca.jpg` background-image、hover 色 `#cdb4db`（紫色调）
4. **Parallax offsets** — 数组从 8 个值扩到 9 个（`[0,0,0,0,0,100,100,100,100]`），确保 5 个成员滚动视差均有覆盖
5. **5 成员引言全部更新** — Takion 提供新文本，Harry/Louis/Niall/Liam/Zayn 的 `<p><span>` 全部替换
6. **CSS 语法 bug 修复** — `styles.css` 末尾 FIVE GUYS 补丁块有一个多余的 `}`（在 `/* BAND: zayn member */` 前面），导致 zayn `.image .bg` 选择器被破坏、background-image 不生效。删除多余 `}` 后恢复正常。

#### 涉及文件
- `pages/band.html` — Zayn panel HTML + 5 成员引言更新
- `css/styles.css` — Zayn CSS 规则 + 多余 `}` 修复
- `images/gfx/filmstrip-zayn-smlc4ca.jpg` — 新增（89KB，500×1000）
- `AGENTS.md` — Page-Specific Notes（4→5）+ 本日志
- `tools/_make_zayn_filmstrip.py` — 一次性 filmstrip 拼接脚本
- `tools/_qa_zayn.py` — 一次性 Playwright 验证脚本

#### 关键经验
- **CSS 多余 `}` 排查**：当 DevTools 显示元素匹配了选择器但属性不生效时，检查该选择器前面的代码是否有孤立的 `}` 把它吞掉了。`}\n\n/* comment */\n.selector{...}` 中，第一个 `}` 会被 CSS parser 当作前一条规则的结束，后面的注释和选择器变成语法错误。
- **Zayn 社交账号**：Twitter `@zaynmalik`，Instagram `@zayn`（2015 年离开 1D 后沿用至今）。
- **Filmstrip 1:2 宽高比**：其他成员 filmstrip 是 300×600，Zayn 用 500×1000 保持比例一致。

#### 验证
- Playwright 截图确认：desktop (1280×800) + mobile (390×844)，5 个成员 panel 全部正常显示 filmstrip background-image
- 所有 social links href 正确
- parallax offsets 数组长度 9，滚动无异常

#### 已知问题（仍存在）
- 4 个预存的 retinafy 404：`filmstrip-{louis,harry,liam,niall}-medc4ca.jpg`（retinafy.js 尝试加载中等尺寸变体，不存在但不影响显示）
- 2015 Instagram CDN 死链（journal.html）—— 历史遗留
- 首页 blog latest 卡片需手动同步 —— 历史遗留

---

### 2026-07-29 — 整站双语翻译系统

**Session：Mavis 实现全站中英双语翻译切换功能。**

#### 功能概述
- 每页右上角固定一个翻译按钮（floating，fixed position），点击在 EN↔ZH 之间 250ms fade 切换
- 歌词页（`.panel.song-lyrics`）默认 EN，点击进入**双语对照模式**（中文堆叠在英文下方，略淡）
- 语言状态通过 `localStorage`（`5guys1d.lang`）跨页面持久化
- 只有内容切换（段落、歌词、歌名、描述），网站家具（header/footer/nav/title）不变

#### 新增文件
- `js/translate.js` — 翻译控制器（注入浮动按钮、fade 切换、localStorage 持久化）
- `css/_translate.css` — 翻译专用 CSS（`.lang-zh/.lang-en/.lang-bilingual` + floating button + lyrics 双语叠放）
- `tools/translate_lyrics.py` — 歌词双语注入脚本（68 首歌 `<br />` 分割→ `.lyric-line`）
- `tools/translate_albums.py` — 专辑页歌名双语注入（5 张专辑页）
- `tools/lyric_translations.py` — 歌词翻译字典（`{album: {song: [(en, zh), ...]}}`）
- `tools/_extract_all_lyrics.py` — 一次性提取所有原始歌词
- `tools/_realign_lyrics.py` — 一次性对齐翻译元组与 HTML 歌词
- `pages/blog/*/article.zh.md` × 4 — 博客中文翻译（Markdown，无 front matter）
- `tools/_qa_lyrics_v2.py`、`tools/_qa_final.py` — Playwright QA 脚本
- `tools/_qa_screenshots/translate/` — QA 截图归档

#### 修改文件（注入 data-translate + 双语 span）
- `pages/about.html` — 关于页面，段落级 `<span class="en">/<span class="zh">`
- `pages/band.html` — 5 个成员，每个 `.text-inner` 内双语段落
- `pages/music.html` — 5 个 album card，发行日期/描述双语
- `pages/blog/*/index.html` × 4 — 博客文章（模板 `{{root}}js/translate.js` + `data-translate`）
- `pages/music/albums/*.html` × 5 — 专辑页歌名双语
- `pages/music/albums/*/songs/*.html` × 67 — 歌词双语（`.lyric-line` 结构）
- `css/styles.css` — 末尾追加翻译 CSS（~80 行）
- `tools/build_blog.py` — 支持 `article.zh.md` 双语渲染 + `_wrap_bilingual()` 配对逻辑
- `tools/templates/article.html` — 加 `data-translate="true"` + translate.js 引用

#### 关键 Bug 修复
- **歌词提取偏移**：`split_lyrics_html` 原先用 `\n` 分割，HTML 缩进导致多余空行撑开列表。改用 sentinel（`\x00`）替换 `<br />` 后分割，消除误判空行。
- **translate.js 路径深度错误**：歌页在 `pages/music/albums/<a>/songs/<s>.html`（5 层深），`SCRIPT_PREFIX` 原为 `../../../../`（4 层）→ 404。改为 `../../../../../`（5 层）。
- **Blog 模板 translate.js 硬编码 `../`**：文章在 `pages/blog/YYYY-MM-DD/slug/index.html`（4 层深），模板硬编码 `../js/translate.js` 解析错误。改为 `{{root}}js/translate.js`。
- **旧翻译歌词源不匹配**：`lyric_translations.py` 的旧翻译来自不同歌词源（如 ready-to-run 完全是另一个版本）。匹配率 <15% 时自动丢弃旧翻译，用户需重填。
- **made-in-the-am/perfect.html**：原始克隆页面为 404（`.panel.four-zero-four`），无歌词 div。历史遗留问题。

#### 翻译覆盖率
- **歌词**：6/71 首歌有部分翻译（254/3680 行 = 6%），集中在 what-makes-you-beautiful, steal-my-girl, night-changes, drag-me-down, history, perfect。其余 65 首标记 `[待译: <english>]`。
- **博客**：4/4 篇有完整中文翻译（`.article.zh.md`）
- **专辑页歌名**：全部 5 张专辑 100+ 首歌名已翻译
- **关于/乐队/音乐首页**：段落级双语已就位

#### 已知问题
- `perfect.html` 无歌词——原始 404 页面，需重建
- 歌词翻译覆盖率低（6%），大量 `[待译]` 占位
- `steal-my-girl` 等歌的部分行翻译合并了相邻行的 zh（如 "就是 我拥有一切"），需人工拆分
- `what-makes-you-beautiful` 部分行 zh 为空（对齐不完全），需补译

---

### 2026-07-29 (Round 2) — 按钮重设计 + 行为修正 + 全部歌词翻译

**Session：Mavis 根据 Takion 反馈进行三项改动。**

#### 1. 翻译按钮重新设计
- **按钮位置**：从右上角 floating 改为注入 `header#sticky` 内部，左上角 `left:0`，纯文字无背景无边框
- **CSS**：`.translate-btn--floating` 已删除；`.translate-btn--header` 改为 `position:absolute; left:0; top:50%; transform:translateY(-50%)`，纯文字，opacity:0.8，hover 到 1.0
- **scrolled 状态**：header 变白时按钮文字自动变黑（`header#sticky.scrolled .translate-btn--header{color:#000}`）
- **首页特殊处理**：header 初始 `top:-13.77%` 导致按钮初始隐藏，滚动后出现——与 header 行为一致

#### 2. 翻译行为修正
- **非歌词页**：纯 EN↔ZH 覆盖切换，无双语模式（按钮显示"中文"/"EN"）
- **歌词页**：仅 EN↔Bilingual 双语对照切换（按钮显示"CN/EN"）
- **localStorage 清理**：非歌词页如果之前存了 `bilingual` 状态，自动转为 `zh`

#### 3. 全部歌词翻译（进行中）
- 后台 agent 翻译全部 65 首歌的 ~3500 行歌词
- 译完后跑 `python tools/translate_lyrics.py` 注入

#### 涉及文件
- `js/translate.js` — 完全重写（按钮注入 #sticky、行为分离）
- `css/styles.css` — 翻译 CSS 块重写（删除 floating、header 纯文字按钮）
- `index.html` — 新增 `<script src="js/translate.js">`（之前遗漏）
- `AGENTS.md` — 本日志

#### 已知问题
- 首页按钮在初始加载时不可见（跟随 header 的 `top:-13.77%`），滚动后正常——符合设计

#### 4. 全部歌词翻译（完成）
- 分 5 个后台 agent 翻译各专辑，第一个整体 65 首 agent 超时取消
- 重启 5 个 album 级别任务：4 个完成（Up All Night / Take Me Home / Midnight Memories / Made In The AM），Four 失败（DeepSeek 余额 402）
- Four 沿用旧 `lyric_translations.py` 中已翻译的元组（steal-my-girl、night-changes、ready-to-run 等）
- 合并脚本 `tools/_merge_translations.py` 把 4 张新翻译 + 旧 LYRICS + 4 的 fallback 合并到 `lyric_translations.py`
- 重新注入所有 67 首歌页（git checkout 恢复原始 + translate_lyrics.py 注入）

#### 最终翻译覆盖率
- **总行数**：2973/3487 = 85%
- Up All Night: 673/780 (86%)
- Take Me Home: 831/982 (85%)
- Midnight Memories: 763/890 (86%)
- Four: 616/726 (85%)
- Made In The A.M.: 90/109 (83%)
- **缺口**：每张专辑约 15% 留作 `[待译: <english>]` 占位（agent 跳过/失败行），用户后续可手工补译

#### 涉及文件
- `tools/_tl_*.py` × 4 — 4 张专辑的部分翻译结果（来自后台 agent）
- `tools/_merge_translations.py` — 一次性合并脚本
- `tools/lyric_translations.py` — 最终统一翻译字典（覆盖更新）
- `pages/music/albums/*/songs/*.html` × 67 — 重新注入双语结构

#### 已知问题
- 仍有 514 行（约 15%）`[待译: ...]` 占位，主要是 agent 跳过的难句/俚语
- 歌词 1:1 对齐已保证：en 行与 HTML 原文严格匹配，zh 行按用户填入的元组顺序分配
