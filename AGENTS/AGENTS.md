# 1D Fansite — 项目全貌参考手册

> **FIVE GUYS ONE DIRECTION** — One Direction 粉丝社区网站。基于官方 onedirectionmusic.com 1:1 克隆（Studio Output / Kleber / Sony Music Entertainment UK Ltd.），在此基础上增加 fan editorial 内容。
>
> 维护者：Takion Kroslin（项目内统一署名） / 联系：takionkroslin@icloud.com

本文件是**项目事实的单一来源**（技术栈、结构、设计系统、组件、工作流）。操作规则与踩坑记录不在这里，见同级 `RULES.md` / `METHODS.md` / `COMMANDS.md`。

---

## Tech Stack

- **Pure static site**：HTML/CSS/JS，无框架，无构建工具
- **Server（开发）**：`python -m http.server 8000`
- **Server（部署）**：Cloudflare Workers（静态资源模式，`wrangler.jsonc` 配置，git 集成拉 GitHub main 分支自动构建）
- **线上正式地址（唯一真源）**：`https://www.5guys1direction.asia/` — 所有 og:url / 分享链接 / 文档一律用此域名（带 `www.`，裸 `5guys1direction.asia` 和 `.cn` 均非正式入口）
- **jQuery 2.1.1**：Google CDN (`https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js`)
- **Waypoints.js**：内嵌在 `js/main.js` 中（用于滚动触发 panel fade-in）
- **Isotope.js**：按需加载，unpkg CDN (`https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js`)
- **Icomoon**：自定义图标字体，base64 嵌入 CSS
- **Markdown 渲染（仅 blog）**：`python-markdown` 库（`tools/build/build_blog.py` 离线渲染，无运行时依赖）
- **Pillow**：开发期一次性图片优化

## File Structure

```
E:\文档\GitHub\1d-fansite/
├── index.html                       ← 首页（hero + 16yrs + intro + latest + 4 new-section entries + 克隆 panels）
├── README.md                        ← 面向投稿者的使用文档（人工维护，agent 一般不碰）
├── AGENTS.md                        ← 入口文件（agent 启动必读：文档地图 + 强制阅读顺序）
│
├── AGENTS/                          ← 项目文档体系（模型工作手册）
│   ├── AGENTS.md                    ← 本文件：项目全貌（技术栈/结构/设计系统/组件/工作流）
│   ├── RULES.md                     ← 精细操作规范（开发/检测/部署全流程 + 日志书写规范）
│   ├── METHODS.md                   ← 踩坑记录（现象/根因/处理/预防）
│   ├── LOG.md                       ← 开发日志（含日志书写规范）
│   └── COMMANDS.md                  ← 常用命令速查
│
├── css/
│   └── styles.css                   ← 官方 minified CSS（91KB） + 末尾的 FIVE GUYS 自定义补丁
│
├── js/
│   ├── main.js                      ← 官方 minified JS（Waypoints、hover-cycle、play-button、retinafy）
│   ├── jquery.min.js                ← 1.x bundled（部分历史页面引用）
│   ├── translate.js                 ← 中英翻译控制器（注入 header 按钮，localStorage 持久化）
│   ├── slideshow-nav.js             ← photos 页 slideshow 翻页增强（键盘/滑动/z-index 兜底）
│   └── isotope.pkgd.min.js          ← Isotope masonry
│
├── images/
│   ├── gfx/                         ← 官方 assets/gfx 全部 + 高清 lrg 版（hero、专辑封面、filmstrip）
│   │   └── 5guys/                   ← FIVE GUYS 品牌 logo（black/white，PNG 3000×548）
│   ├── media/article-images/        ← Journal + music 文章配图（本地化 hash 封面）
│   ├── media/article-logos/         ← 专辑 logo
│   ├── media/gallery-images/        ← Gallery 照片（rect-lrg 1500×1000 原图级 / rect-med og 图）
│   ├── yt-thumbs/                   ← YouTube 视频缩略图（img.youtube.com 本地化）
│   └── tour/                        ← Tour archive 图片
│
├── pages/                           ← 所有非首页页面
│   ├── music.html                   ← 5 张专辑入口
│   ├── journal.html                 ← 克隆 20 篇 journal 2015–2020
│   ├── band.html                    ← 5 成员 + 视差
│   ├── tour.html                    ← 433 个 tour date
│   ├── shop.html                    ← 🚫 禁止改动 — 用户明确要求任何时候都不要动（不翻译、不改内容）
│   ├── blog.html                    ← 🤖 自动生成 — blog 列表（不手改）
│   ├── gallery.html                 ← gallery 索引（Albums 分专辑集合 + 5 个分类：members/on-stage/behind-the-scenes/press/fan-art）
│   ├── this-is-us.html              ← Mainland China fan-account 目录
│   ├── about.html                   ← 项目说明
│   ├── blog/                        ← 4 篇文章，路径 pages/blog/YYYY-MM-DD/slug/
│   │   └── 2026-07-27/
│   │       ├── why-this-site-exists/{article.md, index.html}
│   │       ├── every-july-23rd-we-come-home/{article.md, index.html}
│   │       ├── why-i-love-1d-so-bad/{article.md, index.html}
│   │       └── ready-to-run/{article.md, index.html}
│   ├── music/albums/                ← 5 专辑页 + 子页 + 歌曲页
│   │   ├── <album>.html             ← 专辑页（release-header + song-list + release-video + photos 入口）
│   │   ├── <album>/songs/<slug>.html← 歌词页（song-lyrics 双语结构）
│   │   └── <album>/photos/<slug>.html ← 照片 slideshow 页（cycle2 + slideshow-nav.js）
│   ├── tour/                        ← Tour archive
│   └── gallery/                     ← albums.html（🤖 脚本生成的分专辑集合页）+ 5 个分类子页（members/on-stage/behind-the-scenes/press/fan-art，均含 index.html）
│
├── journal/                         ← 克隆的 20 篇 journal 文章
│   └── YYYY-MM-DD/<slug>/index.html
│
└── tools/                           ← 构建 + 维护脚本（分类索引见 tools/README.md）
    ├── build/
    │   ├── build_blog.py            ← Markdown → HTML 构建器（每次编辑 article.md 后跑）
    │   └── _build_albums_page.py    ← 生成 gallery/albums.html 分专辑集合页（幂等）
    ├── translate/
    │   ├── translate_lyrics.py      ← 歌词双语注入（lyric_translations.py 字典 → HTML）
    │   ├── translate_albums.py      ← 专辑页歌名双语注入
    │   ├── translate_tour.py        ← tour 场馆名双语
    │   └── lyric_translations.py    ← 歌词翻译字典（{album: {song: [(en, zh), ...]}}）
    ├── audit/
    │   └── _audit_site_images.py    ← 全站图片审计（需要本地 server，HTTP urljoin 校验）
    ├── templates/
    │   ├── article.html             ← 文章页模板（{{title}} 等占位符）
    │   └── blog_list.html           ← 列表模板（裸 __POSTS_CARDS__ marker）
    ├── archive/                     ← 一次性 QA/调试脚本 + 历史杂物（150+ 个，见 README）
    ├── README.md                    ← tools 工具索引（快速调用速查）
    └── _qa_screenshots/             ← Playwright 截图归档（按任务建子文件夹）
```

⚠️ 未 git 跟踪目录：`onedirectionmusiccom-ukprod/`（3.9MB 死克隆，建议加 .gitignore，勿 `git add -A` 误纳入）。

## Path Conventions

所有页面通过 `<link>` 和 `<script>` 标签加载资源，不使用任何模块系统。

| 资源 | 根级页面 (`index.html`) | `pages/` 一级 | `pages/music/albums/<a>.html`（3 层） | `pages/gallery/<cat>/index.html`（3 层） | `pages/blog/...` 深度 4 | `pages/music/albums/<a>/songs/<s>.html`（5 层） |
|------|----------------------|----------------|---------------------------------------|----------------------------------------|---------------------------|----------------------------------------------|
| CSS | `css/styles.css` | `../css/styles.css` | `../../../css/styles.css` | `../../../css/styles.css` | `../../../../css/styles.css` | `../../../../../css/styles.css` |
| JS | `js/main.js` | `../js/main.js` | `../../../js/main.js` | `../../../js/main.js` | `../../../../js/main.js` | `../../../../../js/main.js` |
| jQuery | Google CDN | 同 | 同 | 同 | 同 | 同 |
| 图片 | `images/gfx/...` | `../images/gfx/...` | `../../../images/gfx/...` | `../../../images/gfx/...` | `../../../../images/gfx/...` | `../../../../../images/gfx/...` |
| Logo link | `index.html` | `../index.html` | `../../../index.html` | `../../../index.html` | `../../../../index.html` | `../../../../../index.html` |
| Footer about | `pages/about.html` | `about.html` | `../../../pages/about.html` | `../../../pages/about.html` | `../../../../pages/about.html` | `../../../../../pages/about.html` |

⚠️ **blog 列表页面**是个特例：它位于 `pages/blog.html`，但里面的卡片链接是 `blog/2026-07-27/...`（已经是 `pages/` 之下的相对路径），不要多加 `pages/` 前缀。封面图 `url(../images/gfx/...)`。

⚠️ **photos.html 列表页**在 `pages/music/albums/<album>/photos.html`（4 层），封面图 `url(../../../../images/media/gallery-images/rect-lrg/<hash>.jpg)`。

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

**可复用卡片 hover / 外框规范（Gallery 风格）：**

- 卡片外框使用独立的 `.inline` 层，不要让标题、正文或整行内容发生位移；hover 只负责显示外框和切换 CTA 状态。
- 外框四边必须使用同一组**物理 inset**，推荐 `inset:clamp(8px,1.25vw,20px)`，并同时设置 `width:auto;height:auto;box-sizing:border-box`。不要用 `width/height:96%` 配合 `top/left:2%`，因为宽高百分比会造成横向和纵向留白不一致。
- 移动端已有 `.panel.journal-news.homepage-news .inline` 高特异性规则，新增卡片外框选择器必须达到同等或更高特异性；hover 的 `display:block` 也要同步提高特异性，否则会出现桌面端有效、移动端被覆盖的情况。
- 有计数时，计数菱形单独控制尺寸与字重，必须留在外框内部并与标题保持间距；hover 时菱形填充黑色、数字反色。小卡片不要直接照搬 Gallery 大卡片的粗边框和大字号。
- 外框与计数框的边框四边必须读取 computed style 验证，不能只凭截图判断；至少检查 390px 和桌面宽度下的四边 inset、元素 bounding box 与 `document.documentElement.scrollWidth`。
- 独立的顶部 CTA（如 `Start reading`）可以有自己的 hover，但必须显式设置 `border-style:solid` 和统一 `border-width`，不要依赖旧规则中可能单独覆盖 `border-bottom` 的写法。

推荐结构：
```html
<div class="panel panel-card">
  <div class="inline"></div>
  <div class="count"><span>01</span></div>
  <div class="row">...</div>
</div>
```

推荐 CSS 骨架：
```css
.panel.panel-card .inline {
  position:absolute;
  inset:clamp(8px,1.25vw,20px);
  width:auto;
  height:auto;
  box-sizing:border-box;
  border:.12em solid #000;
  display:none;
}
.panel.panel-card.hover .inline,
.panel.panel-card:focus-within .inline { display:block; }
```

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
- **翻译按钮**: `js/translate.js` 注入 `#sticky` 左上角（`left:0`，纯文字），header 变白时自动变黑

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
| **Slideshow 翻页** | 点击/键盘 ←→/touch 滑动 | cycle2 + `js/slideshow-nav.js`（键盘/滑动原生实现，z-index 9999 兜底） |
| **翻译切换** | 点击 header 按钮 | `js/translate.js`：EN↔ZH 250ms fade；歌词页 EN↔双语对照 |

## Blog Markdown Workflow

文章用 Markdown 写，front-matter 用 HTML 注释包起来（避免 YAML 解析依赖）。`tools/build/build_blog.py` 离线渲染成完整 HTML（不在浏览器跑 JS，Cloudflare 部署稳定）。

### 文件结构

```
pages/blog/2026-07-27/<slug>/
  article.md       ← 源（手改）
  article.zh.md    ← 中文翻译（可选，无 front matter）
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
og_image: ../../../../images/gfx/hero-2015-rect-lrg.jpg
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
2. `cd E:\文档\GitHub\1d-fansite && python tools/build/build_blog.py`
3. 自动生成 3 个文件：
   - `pages/blog/.../index.html`（文章页）
   - `pages/blog.html`（列表）
   - `pages/blog/posts.json`（元数据聚合）
   - （首页 blog 卡片是手写在 `index.html` 里的，**不会自动同步** —— 见下方注意事项）

⚠️ **首页 blog 卡片是手写的**（`index.html` 行 240–330 附近），新增/删除文章需要同步改首页（或者把首页卡片改成 JS 读取 `posts.json` 渲染，TODO）。

### 新增文章 checklist

1. 创建 `pages/blog/YYYY-MM-DD/<slug>/article.md`（复制现有 article.md 改 front-matter + 正文）
2. 跑 `python tools/build/build_blog.py`（build 脚本已改为**全 front-matter 驱动**，不再有 META/SCALERS 字典；所有字段直接读 article.md front-matter）
3. **手改 `index.html` 添加首页卡片**（目前没有自动同步机制）
4. 如正文含第三方视频，按下方「正文视频卡片」规范处理

### 正文视频卡片（bilibili 等）

文章正文想插视频（YouTube/bilibili），用「封面 + play 按钮」卡片，点击才加载 iframe（不自动播放）。详见 `AGENTS/RULES.md §2.6`。核心 HTML 片段：

```html
<div class="bilibili-card" style="background-image:url(../../../../images/blog/<cover>.png);">
  <a class="bilibili-play" href="#" data-bilibili-src="//player.bilibili.com/player.html?...">
    <i class="icon-play"></i><i class="icon-play-text"></i>
  </a>
</div>
```

- 中英文各放一份同结构卡片（`.en`/`.zh` 切换各自生效）。
- 封面图放 `images/blog/`，小写连字符命名。
- 依赖 `js/bilibili-video.js`（article.html 模板已自动引用）与 styles.css additions 块内的 `.bilibili-card` 样式，改文章时勿删。

### 模板

- `tools/templates/article.html` —— 文章页模板，`{{title}}`、`{{body_html}}`、`{{root}}` 等占位符
- `tools/templates/blog_list.html` —— 列表模板，用裸 `__POSTS_CARDS__` marker（**不要包在 HTML 注释里**，否则 build 脚本会替换到错误位置）

## Coding Conventions

- **不要引入框架**：保持纯 HTML/CSS/JS + jQuery
- **修改 CSS 时**：追加新规则而非修改现有规则（除非修复 bug）。`css/styles.css` 是单行 minified，自定义规则放文件末尾的 `/* FIVE GUYS ONE DIRECTION additions */` 块
- **修改 JS 时**：官方核心逻辑保留，新功能在 `$(document).ready()` 末尾追加；页面级 JS 放页面底部 `<script>` 块
- **新增页面**：复制任意 `pages/*.html` 作为模板，保留 header/footer 结构
- **图片**：新图片放 `images/`；官方图片已全量下载到 `images/gfx/` 和 `images/media/`
- **资源 CDN**：Google Fonts URL 永远带 `&display=swap`（GFW 环境字体加载慢）
- **不使用**：`<base>` 标签、CSS Modules、CSS-in-JS、任何构建/打包工具
- **修改日志**：每次改动在 `AGENTS/LOG.md` 写一条（规范见 RULES.md §日志书写规范）
- **不要重复造轮子**：所有维护/QA 脚本放 `tools/`，完成的任务标 `一次性` 标签
- **retinafy 兼容**：引用 `-lrg` 图片时 URL 无 `-sml`，retinafy 不会二次替换，安全；引用 `-sml` 时 retinafy 可能尝试 `-med/-lrg` 变体，变体不存在会静默 404（可接受）

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

/* BUG FIX: slideshow 控件 z-index 9999 + pointer-events（photos 页翻页按钮被 active slide 盖住） */
.panel.gallery .prevControl, .panel.gallery .nextControl, .panel.gallery .count{z-index:9999!important;pointer-events:auto!important}
```

另有两处 CSS 修改历史注意：
- 曾删掉 styles.css 中 2 处重复的 mobile `margin:15% auto` 规则（line 24 和 line 81，覆盖了 `margin:0`）
- 曾删除 FIVE GUYS 补丁块中一个多余 `}`（在 `/* BAND: zayn member */` 前，破坏 zayn 选择器）

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

### pages/music/albums/<album>.html
- Body class: `duo album-campaign`
- release-header（专辑封面 + 元信息）→ song-list（全部曲目链接）→ release-video（方形，yt-thumbs 背景）→ photos 入口 gallery-cover
- 3 层深度（`../../../`），gallery-cover 封面用该 gallery 第一张 slide 的 hash

### pages/music/albums/<album>/songs/<slug>.html
- 5 层深度（`../../../../../`）
- 单曲页：release-header（Single 类型 + release-buy + release-video）→ song-lyrics
- 非单曲页（如 MIA 的 14 首）：release-header（Song 类型 + Written by + prev/next 相邻曲目）→ song-lyrics，无 release-buy/release-video
- song-lyrics 带 `data-translate="true"`，歌词为 `.lyric-line` 双语结构

### pages/music/albums/<album>/photos/<slug>.html
- 5 层深度；cycle2 slideshow，slide 用 `rect-lrg/<hash>.jpg`（1500×1000），og:image 用 `rect-med`
- **必须保留**：`css/styles.css?v=<日期>` + `js/slideshow-nav.js`（键盘/滑动/按钮兜底）
- slideshow-nav.js 有全局守卫（重复引用不会绑两次事件）

### pages/band.html
- Body class: `duo band-section`
- 5个 `.band-member` panel（Louis、Harry、Liam、Niall、Zayn）
- 图片有滚动视差效果；内联 JS 包含 offsets 数组控制视差帧（数组长度 = 成员数 + 1）

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
- 🤖 **自动生成** by `tools/build/build_blog.py`
- 包含：blog 介绍 panel + 文章卡片（panel-group 两两排列） + moment panel + newsletter panel
- 卡片背景使用 `images/gfx/5guys/logo-white.png`（黑底 + 白 logo）

### pages/blog/2026-07-27/<slug>/index.html
- 🤖 **自动生成**
- `.article-cover` 用 front-matter 的 `header_img` 字段（`<img>` 标签，非 background）
- 正文用 python-markdown 渲染；双语内容走 `article.zh.md` + `.lang-zh` span

---

> 本文档只描述"项目是什么"。怎么做、什么不能做、踩过什么坑 → `RULES.md` / `METHODS.md`。开发历史 → `LOG.md`。
