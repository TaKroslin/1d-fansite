# 设计系统参考（design-system / reference）

> 完整项目事实的单一来源是 `AGENTS/AGENTS.md`。本表为可复用速查，加载设计任务时直接用。

## 1. 设计 Token

### 1.1 颜色

| Token | Value | 用途 |
|-------|-------|------|
| Black | `#000` | body 背景、header、footer |
| White | `#fff` | 默认文字、按钮、边框 |
| Tweet Blue | `#d9e0f1` | twitter panel 背景 |
| News Gray | `#eef2f4` | homepage news panel 背景 |
| Merch Red | `#fd7161` | shop merch panel 背景 |
| Fragrance Pink | `#ffddd4` | shop fragrance panel 背景 |
| Moments Gold | `rgba(255,233,178,0.9)` | moments panel overlay |
| Instagram Blue | `rgba(83,128,165,0.7)` | instagram hover overlay |
| History Blue | `rgba(206,211,241,0.75)` | homepage video info overlay |

### 1.2 字体家族

| Class | Font Stack | Weight |
|-------|-----------|--------|
| `.oswald` | Oswald, sans-serif | 400, 700 |
| `.source-sans-pro` | Source Sans Pro | 400 |
| `.source-code-pro` | Source Code Pro | 300-700 |
| `.playfair-display` | Playfair Display, serif | 700 |
| `.cousine` | Cousine, monospace | 400, 700 |
| `.six-caps` | Six Caps, sans-serif | 400 (uppercase) |
| `.vampiro-one` | Vampiro One, cursive | — |
| `.codystar` | Codystar, cursive | — |
| `.times` | Times New Roman, Times, serif | — |

### 1.3 语义角色

| Role | Font | Size |
|------|------|------|
| Panel header title | Times New Roman | 87.5% (`.title`) |
| Panel header section | Source Code Pro | 87.5% uppercase (`.section-name`) |
| Journal headline | Playfair Display 700 | 281–375% |
| Tour headline | Six Caps | 500–1250% uppercase |
| Moments headline | Codystar | 500% |
| Tweet body | Cousine | 206.25%, letter-spacing 0.079em |
| Newsletter headline | Oswald | 406.25% uppercase |
| Button (more) | Source Code Pro 600 | uppercase, letter-spacing 0.035em |
| Footer credits | Source Code Pro 600 | 93.75%, letter-spacing 0.15em |

### 1.4 菜单 hover-cycle 字体

| Class | Font | Size | Transform | Letter-spacing |
|-------|------|------|-----------|----------------|
| `menu1` | Oswald 700 | 106.25% | uppercase | 0.05em |
| `menu2` | Source Sans Pro | 131.25% | none | 0.1em |
| `menu3` | Courier New 700 | 118.75% | uppercase | 0.05em |
| `menu4` | Playfair Display 700 | 118.75% | none | 0.05em |
| `menu5` | Vampiro One | 118.75% | uppercase | 0.15em |
| `menu6` | Cousine 700 | 100% | uppercase | 0.15em |

## 2. Panel 类型全览

| Type | CSS Class | 背景 | 特点 |
|------|-----------|------|------|
| Hero | `.panel.hero` | 图片 | 全屏背景 + 居中 logo |
| Homepage Video | `.panel.homepage-video` | 图片+半透明色块 | 左右分栏 info + play button |
| Homepage Music | `.panel.homepage-music` | `#fff`+纹理 | 专辑封面 + 描述 |
| Homepage Tour | `.panel.homepage-tour` | YouTube 背景 | Next show + Next five |
| Homepage News | `.panel.journal-news.homepage-news` | `#eef2f4` | inline hover 边框 |
| Journal Article | `.panel.journal-article` | `#fff` | 无高度限制，富文本 |
| Journal News | `.panel.journal-news` | — | `.inline` hover 边框 |
| Journal Instagram | `.panel.journal-instagram` | IG 图片 | `.instagram-hover` overlay |
| Journal Tweet | `.panel.journal-tweet` | — | 引用 tweet |
| Journal Moments | `.panel.journal-moments` | 图片 | 金色 overlay + hover 扩展 |
| Journal Gallery | `.panel.journal-gallery` | 灰度图 | 居中标题 + count badge |
| Journal Video | `.panel.journal-video` | YT 缩略图 | Play button overlay |
| Music Index | `.panel.music-index-item` | 专辑封面 | 专辑名 logo 图 + 描述 |
| Band Member | `.panel.band-member` | 成员照片 | 左右分栏，滚动视差 |
| Tour Submenu | `.panel.tour-submenu` | `#000` | Tab 切换 |
| Tour Intro | `.panel.tour-intro` | YT 视频 | 主标题 + next show |
| Tour Listing | `.panel.tour-listing` | 图+遮罩 | 按地区分组日期列表 |
| Shop Banner | `.panel.shop-banner` | 图片 | 大图 + logo + info + CTA |
| Shop Other | `.panel.shop-other` | 图片 | 方形面板 |
| Shop Fragrance | `.panel.shop-fragrance` | `#ffddd4` | logo + 描述 |
| Shop Gifts | `.panel.shop-gifts` | 图片 | "Personalised" 前缀 |
| Shop Merch | `.panel.shop-merch` | 可变色 | Cousine 标题 |
| Shop Music | `.panel.shop-music` | 图片 | Oswald 标题 |
| Tweet | `.panel.tweet` | `#d9e0f1` | 粗边框内容区 |
| Gallery Cover | `.panel.gallery-cover` | 灰度图 | 居中文字 + 图片计数 |
| Newsletter | `.panel.newsletter` | `#fff` | 居中表单 |
| 404 | `.panel.four-zero-four` | — | 大号居中文字 |
| Anniversary Poster | `.panel.anniversary-poster` | 图片 | 16 周年纪念面板 |

## 3. 响应式断点

| Breakpoint | 行为 |
|------------|------|
| **767px** | duo→mono：panel 全宽、header 简化、导航变 overlay |
| **2400px** | 最大宽度，字体锁 200% |
| 1250–2400px | 每 50px 放大 ~4% |
| 350–1150px | 每 50px 缩小 ~4% |
| <350px | 极限缩至 50% |

## 4. Icomoon 图标

`.icon-{name}` 可用列表：
`menu, close, play, play-text, apple-music, amazon, google-play, facebook, twitter, instagram, pinterest, youtube, spotify, soundcloud, google-plus, heart, caret-up, up-arrow, left-arrow, right-arrow, carousel-left, carousel-right`

## 5. Footer 社交 hover 色

| 平台 | Hover 色 |
|------|---------|
| Facebook / Twitter | `#c4d2f2` |
| Pinterest / YouTube | `#f9c0bf` |
| SoundCloud | `#ffd4b2` |
| Spotify | `#caecd7` |
| Instagram | `#b2cade` |
| Apple Music | `#c5c5c5` |

## 6. 动画速查

| 动画 | Trigger | 实现 |
|------|---------|------|
| Panel fade-in | 滚动到可视区 | Waypoints：opacity 0→1，250ms |
| Menu hover-cycle | 悬停菜单 | 75ms 循环 menu1→menu6 |
| Gallery hover | 悬停 gallery-cover | parent `.hover` toggle |
| Moments hover | 悬停 journal-moments | 边框扩展 + 缩放 1.33 |
| Instagram hover | 悬停 journal-instagram | overlay opacity 0→1 |
| Inline video | 点击 play-button | 创建 iframe fadeIn 500ms |
| Mobile menu | 点击 menu button | `#nav.mobilised` toggle |
| Back to top | 点击 #back-to-top | animate scrollTop 500ms |
| Band parallax | 滚动 | bg background-position 循环 |
| 翻译切换 | 点击 header 按钮 | EN↔ZH 250ms fade |
| Slideshow 翻页 | 点击/键盘/滑动 | cycle2 + slideshow-nav.js |
