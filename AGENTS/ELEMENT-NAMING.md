# FIVE GUYS ONE DIRECTION — Element Naming Registry

> 本文件的第一目标是让作者和 AI 能精准说出“要改哪个元素”。优先使用“真实元素名”，即 HTML 中实际出现的完整 `class` token 或 `id`。

## 使用规则

标准描述：

```text
页面 / 区块 / 真实元素名 / 状态
```

例如：

```text
Home / Latest Blog / panel journal-news homepage-news homepage-blog-card / hover
```

真实元素名必须写成：

```text
panel journal-news homepage-news homepage-blog-card
```

不要只写“首页 Blog 卡片”。后者只能作为人类可读别名，不能替代真实元素名。

## 可视化预览

所有可渲染预览集中在 [ELEMENT-PREVIEWS.md](ELEMENT-PREVIEWS.md)。该文件遵循“一名称、一 iframe、一独立 HTML 文件”规则：每个框只显示一个元素，没有锚点跳转、没有重复整页、没有框内滚动。字体也一字体一页，直接展示中英文样张。

## 记录模板

```markdown
## 页面 / 区块 / 别名

- **真实元素名**：`...`
- **HTML 类型**：`div.panel` / `header#sticky` / `a.more`
- **页面范围**：...
- **状态**：default / hover / focus / active / mobile
- **用途**：...
- **HTML 引用**：

```html
...
```

- **CSS 定位**：`...`
- **可修改**：...
- **禁止修改**：...
- **来源**：手写 HTML / 模板 / 构建脚本
- **相关文件**：...
- **验证**：...
```

## 1. Shared shell

| 真实元素名 | 别名 | 用途 |
|---|---|---|
| `header#sticky` | Sticky Header | 固定顶部 Header |
| `h1.logo` | Site Logo | 首页链接与品牌 Logo |
| `div.button-holder` | Menu Button Holder | 菜单按钮容器 |
| `button.menu` | Mobile Menu Button | 打开/关闭移动菜单 |
| `i.icon-menu` | Menu Icon | 菜单图标 |
| `i.icon-close hide` | Close Icon | 关闭图标 |
| `header#nav` | Navigation Header | 导航区域 |
| `header#nav.mobilised` | Mobile Navigation Overlay | 移动端导航状态 |
| `nav#main` | Main Navigation | 主导航 |
| `ul.menu` | Main Menu List | 菜单列表 |
| `li.hover-cycle` | Menu Item | 菜单项 |
| `a.menu1`–`a.menu6` | Menu Font Variant | 菜单字体变体 |
| `footer` | Site Footer | 页面底部 |
| `div#back-to-top` | Back To Top | 返回顶部 |
| `nav#social` | Social Navigation | 社交链接 |
| `div#credits` | Footer Credits | 版权和署名 |
| `i.icon-*` | Icomoon Icon | 图标字体元素 |

视觉外观见 `ELEMENT-PREVIEWS.md` 中的 Shared / Header / sticky 与 Shared / Navigation / nav main。

## 2. Core panel elements

| 真实元素名 | 别名 | 用途 |
|---|---|---|
| `panel` | Base Panel | 所有内容面板基础类 |
| `panel hero` | Hero Panel | 全屏首页 Hero |
| `panel journal-news homepage-news` | Homepage News Panel | 首页新闻/入口基础面板 |
| `panel journal-news homepage-news homepage-blog-card` | Homepage Blog Card | 首页最新 Blog 卡片 |
| `panel journal-article` | Article Panel | 长文章容器 |
| `panel journal-instagram` | Instagram Panel | Instagram 内容 |
| `panel journal-tweet` | Tweet Panel | Tweet 内容 |
| `panel journal-moments` | Moments Panel | Moments 图文内容 |
| `panel journal-gallery` | Journal Gallery Panel | Journal 图库内容 |
| `panel journal-video` | Journal Video Panel | Journal 视频内容 |
| `panel music-index-item` | Music Index Item | 专辑入口 |
| `panel band-member` | Band Member Panel | 成员介绍 |
| `panel tour-submenu` | Tour Submenu | Tour 分类导航 |
| `panel tour-intro` | Tour Intro | Tour 介绍 |
| `panel tour-listing` | Tour Listing | Tour 日期列表 |
| `panel shop-banner` | Shop Banner | Shop 主横幅 |
| `panel shop-other` | Shop Other Panel | Shop 其他商品 |
| `panel shop-fragrance` | Shop Fragrance | 香水商品 |
| `panel shop-gifts` | Shop Gifts | 礼品商品 |
| `panel shop-merch` | Shop Merch | 周边商品 |
| `panel shop-music` | Shop Music | 音乐商品 |
| `panel tweet` | Tweet Card | Tweet 卡片 |
| `panel gallery-cover` | Gallery Cover Card | 相册封面卡 |
| `panel newsletter` | Newsletter Panel | 邮件订阅 |
| `panel four-zero-four` | 404 Panel | 404 页面 |

通用子元素：

| 真实元素名 | 用途 |
|---|---|
| `div.bg retinafy` | 背景图片层 |
| `div.inline` | hover/focus 外框层 |
| `div.panel-header` | 面板顶部信息 |
| `div.title` | 日期/品牌元数据 |
| `div.section-name` | 栏目名称 |
| `h2` | 主标题 |
| `div.info` | 说明与 CTA 容器 |
| `a.more` | More/CTA 按钮 |
| `div.count` | 计数徽章 |
| `div.panel-content` | 面板正文 |
| `div.panel-content-inner` | 面板正文内层 |

## 3. Home

| 真实元素名 | 别名 | 备注 |
|---|---|---|
| `body.duo.home-section` | Home Page | 首页 body |
| `panel.hero` | Home Hero | 首页首屏 |
| `panel.homepage-video` | Home Video | 首页视频板块 |
| `panel.homepage-music` | Home Music | 首页音乐板块 |
| `panel.homepage-tour` | Home Tour | 首页巡演板块 |
| `panel.journal-news.homepage-news.homepage-blog-card` | Latest Blog Card | 首页最新 Blog 卡 |
| `panel.journal-article.liam-bday-panel` | Liam Birthday Panel | Liam 生日板块 |
| `a.liam-bday-link` | Liam Birthday Link | 整卡跳转链接 |
| `p.liam-cta` | Liam CTA Hint | 生日板块提示 |
| `panel.journal-news.homepage-news` | Home Section Entry | Blog/Gallery/About 等入口基础卡 |

视觉外观见 `ELEMENT-PREVIEWS.md` 中的 Home / Latest Blog / homepage blog card。

注意：首页 Blog 卡是手写内容，不会自动读取 `posts.json`。

## 4. Blog / Journal / Novel

| 真实元素名 | 别名 | 来源 |
|---|---|---|
| `body.duo.blog-section` | Blog Section Body | 手写/模板 |
| `panel journal-article` | Blog Article | `article.html` 模板 |
| `div.article-cover` | Article Cover | `article.html` 模板 |
| `div.article-holder` | Article Holder | 文章正文容器 |
| `div.text` | Article Text | 文章正文 |
| `span.en` | English Text | 英文显示层 |
| `span.zh` | Chinese Text | 中文显示层 |
| `panel journal-news homepage-news novel-feature-card` | Novel Feature Card | `novel_hub.html` |
| `panel journal-news homepage-news novel-chapter-card` | Novel Chapter Card | `build_novel.py` |
| `panel journal-news homepage-news novel-chapter-card novel-filler` | Novel Filler Card | 小说占位卡 |
| `panel journal-article novel-chapter` | Novel Chapter Reading Page | `novel_chapter.html` |
| `div.novel-layout` | Novel Reading Layout | 正文+目录布局 |
| `div.novel-catalog` | Novel Catalog | 章节目录 |
| `div.novel-progress` | Novel Progress | 阅读进度容器 |
| `span.novel-progress-bar` | Novel Progress Bar | 阅读进度条 |
| `div.chapter-nav` | Chapter Navigation | 上下章导航 |
| `a.novel-start-reading` | Start Reading CTA | 开始阅读按钮 |

## 5. Music

| 真实元素名 | 别名 |
|---|---|
| `body.duo.music-section` | Music Section |
| `panel music-index-item` | Album Index Card |
| `div.release-header` | Album Release Header |
| `div.release-header-mono` | Mobile Album Header |
| `div.release-menu` | Album Menu |
| `div.song-list` | Song List |
| `panel journal-article song-lyrics` | Song Lyrics Page |
| `div.song-header` | Song Header |
| `div.lyric-line` | Lyric Line |
| `div.release-video` | Release Video |
| `div.release-buy` | Buy Links |
| `div.packshot` | Album Packshot |

## 6. Gallery and slideshow

| 真实元素名 | 别名 |
|---|---|
| `body.duo.gallery-section` | Gallery Section |
| `panel gallery-cover` | Gallery Cover Card |
| `panel gallery` | Gallery Slideshow Panel |
| `div.gallery-info` | Gallery Info |
| `div.cycle-slideshow` | Slideshow Container |
| `div.slide` | Slideshow Slide |
| `div.prevControl` | Previous Control |
| `div.nextControl` | Next Control |
| `div.count` | Slide Counter |
| `a.prev` | Previous Link |
| `a.next` | Next Link |
| `div.gallery-section` | Gallery Page Wrapper |

Slideshow 的独立预览见 `ELEMENT-PREVIEWS.md` 中的 Gallery / Slideshow / panel gallery。

## 7. Tour, Band, Shop and other pages

| 真实元素名 | 别名 |
|---|---|
| `body.duo.tour-section` | Tour Page |
| `div.territories` | Territory Selector |
| `div.territory-list` | Territory List |
| `div.active-territory` | Active Territory |
| `div.tour-listing` | Tour Listing |
| `div.date` | Tour Date |
| `div.venue` | Tour Venue |
| `div.location` | Tour Location |
| `body.duo.band-section` | Band Page |
| `panel band-member` | Band Member |
| `div.image` | Member Image |
| `body.duo.shop-section` | Shop Page |
| `body.duo.this-is-us-section` | This Is Us Page |
| `body.duo.about-section` | About Page |

`shop.html` 为禁止修改页面；其元素只用于识别和 QA，不作为普通修改目标。

## 8. Bilingual and state tokens

| 真实元素名 | 含义 |
|---|---|
| `en` | English copy |
| `zh` | Chinese copy |
| `hide` | Hidden state |
| `active` | Active navigation/filter state |
| `hover` | Script-driven hover state |
| `mobilised` | Mobile navigation open state |
| `disabled` | Disabled control |
| `is-placeholder` | Decorative placeholder |
| `retinafy` | Retina background replacement target |

## 9. Icomoon icon registry

```text
icon-menu, icon-close, icon-play, icon-play-text,
icon-apple-music, icon-amazon, icon-google-play,
icon-facebook, icon-twitter, icon-instagram, icon-pinterest,
icon-youtube, icon-spotify, icon-soundcloud, icon-google-plus,
icon-heart, icon-caret-up, icon-up-arrow,
icon-left-arrow, icon-right-arrow,
icon-carousel-left, icon-carousel-right
```

统一引用方式：

```html
<i class="icon-play"></i>
```

## 10. Font registry

| 真实字体名 | HTML/CSS 名称 | 主要角色 | 中文配对 |
|---|---|---|---|
| `Oswald` | `.oswald`, `.menu1` | Display/menu/newsletter | `Smiley Sans` |
| `Source Sans Pro` | `.source-sans-pro` | Neutral sans | `Noto Sans SC` |
| `Source Code Pro` | `.source-code-pro` | Section/CTA/credits | `LXGW WenKai Mono` |
| `Playfair Display` | `.playfair-display`, `.menu4` | Serif headline | `Noto Serif SC` |
| `Cousine` | `.cousine`, `.menu6` | Monospace | `LXGW WenKai Mono` |
| `Six Caps` | `.six-caps` | Tour display | `Smiley Sans` |
| `Vampiro One` | `.vampiro-one`, `.menu5` | Hand display | `ZCOOL KuaiLe` |
| `Codystar` | `.codystar` | Pixel display | `Fusion Pixel` |
| `Courier New` | `.menu3`, `.courier-bold` | Bold mono | `LXGW WenKai Mono` |
| `Times New Roman` | `.times`, `.title` | Metadata serif | `Noto Serif SC` |
| `Icomoon` | `.icon-*` | Icons only | N/A |
| `Smiley Sans` | `@font-face` | Chinese display | N/A |
| `LXGW WenKai` | `@font-face` | Chinese prose | N/A |
| `LXGW WenKai Mono` | `@font-face` | Chinese mono | N/A |
| `Noto Serif SC` | `@font-face` | Chinese serif | N/A |
| `Noto Sans SC` | `@font-face` | Chinese fallback | N/A |
| `ZCOOL KuaiLe` | `@font-face` | Chinese hand display | N/A |
| `Fusion Pixel` | `@font-face` | Chinese pixel display | N/A |

## 11. Generated ownership

| Source | Generated output | Do not hand-edit |
|---|---|---|
| `article.md` | Blog article `index.html` | Yes |
| `chapter.md` | Novel chapter `index.html` | Yes |
| Blog metadata | `pages/blog.html`, `pages/blog/posts.json` | Yes |
| Gallery source/inventory | Gallery album pages | Yes, after generation |
| `index.html` | Homepage cards | No, homepage is hand-maintained |

## 12. Exact targeting examples

```text
“把首页最新 Blog 卡片的 CTA 改成白底黑字”
→ Home / Latest Blog / panel journal-news homepage-news homepage-blog-card / hover
→ .panel.journal-news.homepage-news.homepage-blog-card .more
```

```text
“把小说阅读页右侧目录的当前章节颜色改掉”
→ Novel / Reading / novel-catalog / active
→ .novel-layout .novel-catalog li.active
```

```text
“把 Gallery 相册的下一张按钮移到可点击层上面”
→ Gallery / Slideshow / nextControl / default
→ .panel.gallery .nextControl
```
