# 1D Fansite — Project Guide

> One Direction 粉丝社区网站。基于官方 onedirectionmusic.com 1:1 克隆，在此基础上添加双语支持和粉丝内容。
> 原始设计：Studio Output / 开发：Kleber / Sony Music Entertainment UK Ltd.

## Tech Stack

- **Pure static site**: HTML/CSS/JS，无框架，无构建工具
- **Server**: `python -m http.server 8000` (开发)
- **jQuery 2.1.1**: Google CDN (`https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js`)
- **Waypoints.js**: 内嵌在 `js/main.js` 中（用于滚动触发 panel fade-in）
- **Isotope.js**: 按需加载，unpkg CDN (`https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js`)
- **Icomoon**: 自定义图标字体，base64 嵌入 CSS

## File Structure

```
E:\文档\GitHub\1d-fansite/
├── index.html              ← 首页 (克隆自官方 gb/home.html)
├── AGENTS.md               ← 本文件
├── css/
│   └── styles.css          ← 完整官方 CSS (91KB)，图片路径已修正为本地 images/
├── js/
│   └── main.js             ← 完整官方 JS (16KB)，含 Waypoints、hover-cycle 等
├── images/                 ← 本地图片资源 (62张，已全量下载)
│   ├── gfx/                ← 官方 assets/gfx 全部图片 (39张)
│   │   ├── 1d-logo.png, diamond.png, hero-*.jpg, ...
│   │   ├── filmstrip-{harry,liam,louis,niall}-smlc4ca.jpg
│   │   ├── music-{four,made-in-the-am,midnight-memories,take-me-home,up-all-night}-*.jpg
│   │   └── tour-listing-indicator.png
│   └── media/              ← 官方 CMS 媒体文件 (23张)
│       ├── article-images/{rect-sml,square-sml,square-med}/
│       ├── article-logos/large/
│       └── gallery-images/{rect-sml,square-sml}/
└── pages/
    ├── music.html          ← Music 页面
    ├── band.html           ← Band 页面
    ├── tour.html           ← Tour 页面 (archive)
    ├── journal.html        ← Journal 页面 (isotope 瀑布流)
    └── shop.html           ← Shop 页面 (isotope 瀑布流)
```

## Path Conventions

所有页面通过 `<link>` 和 `<script>` 标签加载资源，不使用任何模块系统。

| 资源 | 根级页面 (index.html) | pages/ 子页面 |
|------|----------------------|---------------|
| CSS | `css/styles.css` | `../css/styles.css` |
| JS | `js/main.js` | `../js/main.js` |
| jQuery | `https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js` | 同 |
| Isotope | `https://unpkg.com/isotope-layout@3/dist/isotope.pkgd.min.js` | 同 |
| 官方图片 | `images/gfx/...` | `../images/gfx/...` |
| 官方媒体 | `images/media/...` | `../images/media/...` |
| CSS 中图片 | `../images/gfx/...` (由 css/styles.css 引用) | 同 |

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
- **Mobile (<768px)**: `#nav` 隐藏，点击 menu button → `#nav.mobilised` 全屏覆盖
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

## Coding Conventions

- **不要引入框架**：保持纯 HTML/CSS/JS + jQuery
- **修改 CSS 时**：追加新规则而非修改现有规则（除非修复 bug）
- **修改 JS 时**：官方核心逻辑保留，新功能在 `$(document).ready()` 末尾追加
- **新增页面**：复制任意 `pages/*.html` 作为模板，保留 header/footer 结构
- **图片**：新图片放 `images/`；官方图片已全量下载到 `images/gfx/` 和 `images/media/`，CSS/HTML 均使用本地路径
- **双语**：当前全部英文，中文切换功能待加入
- **不使用**：`<base>` 标签、CSS Modules、CSS-in-JS、任何构建/打包工具

## Page-Specific Notes

### index.html (Home)
- Body class: `duo home-section`
- 包含：Hero、Journal article (#10YearsOf1D)、Homepage video、panel-group (news + instagram)、Homepage music、panel-group (moment + newsletter)、Gallery cover、Tweet
- 特殊 header 行为：`home-section` + `mono` 时 header 始终 scrolled

### pages/music.html
- Body class: `duo music-section`
- 5个 `.music-index-item` panel（Made In The A.M.、Four、Midnight Memories、Take Me Home、Up All Night）
- 每个 panel 的 h2 是 album logo（CSS background-image），通过特定 class 匹配

### pages/band.html
- Body class: `duo band-section`
- 4个 `.band-member` panel（Louis、Harry、Liam、Niall）
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
