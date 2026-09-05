# FIVE GUYS ONE DIRECTION — Design System

> 本文件是页面设计与实现的唯一规范。先读本文件，再改 HTML/CSS/JS。真实元素名称见 `ELEMENT-NAMING.md`，操作流程见 `RULES.md`。

## 1. Design direction

- 视觉基准：官方 `onedirectionmusic.com` 的黑白、网格、编辑档案风格。
- 技术边界：纯静态 HTML/CSS/JS + jQuery；不引入框架、组件库或打包器。
- 页面内容：官方克隆结构与 FIVE GUYS ONE DIRECTION 的粉丝编辑内容并存。
- 修改原则：复用现有结构和 class；新增样式追加到 `css/styles.css` 末尾的 additions 区域。
- 页面定位：用真实完整 `class`/`id` 定位，不为文档方便擅自改名。

## 2. Tokens

### Color

| Token | Value | Use |
|---|---|---|
| `black` | `#000` | body、header、footer、深色卡片 |
| `white` | `#fff` | 默认文字、边框、按钮 |
| `tweet-blue` | `#d9e0f1` | Tweet panel |
| `news-gray` | `#eef2f4` | Homepage/Blog news panel |
| `merch-red` | `#fd7161` | Shop merch |
| `fragrance-pink` | `#ffddd4` | Shop fragrance |
| `moments-gold` | `rgba(255,233,178,.9)` | Moments overlay |
| `instagram-blue` | `rgba(83,128,165,.7)` | Instagram hover overlay |
| `history-blue` | `rgba(206,211,241,.75)` | Homepage video overlay |

不得为同一语义重复创建近似颜色；新颜色必须先更新本表。

### Typography

| Font token | CSS class / selector | English role | Chinese pairing |
|---|---|---|---|
| `Oswald` | `.oswald`, `.menu1` | display、newsletter、menu | `Smiley Sans` |
| `Source Sans Pro` | `.source-sans-pro` | neutral sans | `Noto Sans SC` |
| `Source Code Pro` | `.source-code-pro` | section、CTA、credits | `LXGW WenKai Mono` |
| `Playfair Display` | `.playfair-display`, `.menu4` | serif headline | `Noto Serif SC` |
| `Cousine` | `.cousine`, `.menu6` | monospace content | `LXGW WenKai Mono` |
| `Six Caps` | `.six-caps` | tour/display uppercase | `Smiley Sans` |
| `Vampiro One` | `.vampiro-one`, `.menu5` | hand-display | `ZCOOL KuaiLe` |
| `Codystar` | `.codystar` | pixel/display | `Fusion Pixel` |
| `Courier New` | `.menu3`, `.courier-bold` | bold mono menu | `LXGW WenKai Mono` |
| `Times New Roman` | `.times`, `.title` | panel metadata title | `Noto Serif SC` |

本地中文字体还包括 `LXGW WenKai`、`Noto Sans SC`、`Noto Serif SC`、`Smiley Sans`、`ZCOOL KuaiLe`、`Fusion Pixel` 和 `LXGW WenKai Mono`。Icomoon 是图标字体，不用于正文。

## 3. Naming and HTML structure

标准描述格式：

```text
页面 / 区块 / 真实元素名 / 状态
```

经典卡片的真实元素名必须保留所有 class token。例如：

```html
<div class="panel journal-news homepage-news homepage-blog-card">
  <div class="bg retinafy"></div>
  <div class="inline"></div>
  <div class="panel-header">...</div>
  <h2>...</h2>
  <div class="info"><a class="more" href="...">More</a></div>
</div>
```

## 4. Panel rules

- 所有内容块优先使用 `.panel`；普通方形 panel 使用 `padding:50% 0 0`、`height:0`、`overflow:hidden`。
- `.bg` 负责背景图；引用 `-lrg` 时保留完整 `-lrg` URL，引用 `-sml` 时确认对应 `-med/-lrg` 变体存在或接受 retinafy 的静默探测。
- `.panel-header` 放顶部元信息：`.title` 是日期/品牌元数据，`.section-name` 是栏目名。
- `h2` 是主标题；`.info` 是说明和操作区域；`.more` 是 CTA。
- hover 外框使用独立 `.inline`，不允许让标题、正文或整卡位移。
- 外框使用相同物理 inset：`inset:clamp(8px,1.25vw,20px)`，并设置 `width:auto;height:auto;box-sizing:border-box`。
- focus 状态使用 `:focus-within` 与 hover 同等可见；不能只支持鼠标。
- 计数菱形必须独立控制尺寸，保持在外框内，并在 hover 时黑底白字。
- 新增选择器必须覆盖移动端高 specificity 规则；不能只在桌面端有效。

推荐结构：

```html
<div class="panel panel-card">
  <div class="inline"></div>
  <div class="count"><span>01</span></div>
  <div class="row">...</div>
</div>
```

```css
.panel.panel-card .inline {
  position:absolute;
  inset:clamp(8px,1.25vw,20px);
  width:auto;height:auto;box-sizing:border-box;
  border:.12em solid #000;display:none;
}
.panel.panel-card.hover .inline,
.panel.panel-card:focus-within .inline { display:block; }
```

## 5. Shared shell

```html
<header id="sticky">...</header>
<header id="nav"><nav id="main"><ul class="menu">...</ul></nav></header>
<footer>...</footer>
```

- Desktop：`#sticky` 固定顶部，`#nav` 显示菜单。
- Mobile（`max-width:767px`）：菜单按钮切换 `#nav.mobilised` 全屏 overlay；内部滚动，不让 header 滚动。
- `menu1`–`menu6` 由 hover-cycle 按 75ms 循环切换。
- 翻译按钮由 `js/translate.js` 注入 `#sticky`，不可重复注入。
- footer 的社交图标使用 `.icon-*`，不得用文字替代已有图标。

## 6. Responsive rules

| Width | Required behavior |
|---|---|
| `<768px` | duo → mono，panel 全宽，导航变 overlay |
| `350–1150px` | 字体逐步缩小 |
| `1250–2400px` | 字体逐步放大 |
| `>2400px` | 锁定最大字号 |
| `<350px` | 极限缩小，仍不得横向溢出 |

所有布局改动至少检查 390px 和桌面宽度；检查 `scrollWidth`、bounding box 和 computed style。

## 7. Interaction rules

| Interaction | Implementation |
|---|---|
| Panel fade-in | Waypoints，250ms |
| Menu hover-cycle | `.hover-cycle`，75ms |
| Card hover | parent `.hover` + `:focus-within` |
| Inline video | 点击后创建 iframe，不自动播放 |
| Mobile menu | `.button.menu` 切换 `#nav.mobilised` |
| Slideshow | cycle2 + `js/slideshow-nav.js`，控件 z-index 9999 |
| Translation | `js/translate.js`，EN/ZH 250ms fade |

## 8. CSS, JS and cache

- `styles.css` 是官方 minified CSS；官方主体不重排，新规则追加到 additions 区域。
- 修改 CSS 后必须统一 bump 所有页面的 `styles.css?v=`，并同步构建脚本和模板中的版本源。
- `js/main.js` 官方核心保持不动；新增功能放独立文件或页面底部。
- 独立 JS 必须有全局守卫，页面不得重复引用同一脚本。
- 交互修复必须验证真实点击、键盘或 touch 行为，不只检查 DOM 存在。

## 9. Assets and page ownership

- 图片放 `images/`；部署所需的新图片必须被 Git 跟踪。
- PSD 放 `images/psd/`，不作为部署资源。
- Blog 文章源是 `article.md`，输出 HTML 不手改；修改后运行 `tools/build/build_blog.py`。
- Novel 章节源是 `chapter.md`，输出 HTML 不手改；修改后运行 `tools/build/build_novel.py`。
- `pages/blog.html`、`pages/blog/posts.json`、文章页和小说章节页属于生成输出。
- `pages/shop.html` 明确禁止修改。

## 10. Acceptance checklist

1. HTML 结构和真实 class/id 与 `ELEMENT-NAMING.md` 一致。
2. 资源相对路径正确，图片审计 `Broken: 0`。
3. CSS 改动已 bump 版本号。
4. 390px 与桌面端无横向溢出。
5. hover、focus、active、翻译和 slideshow 行为符合定义。
6. 生成页面通过对应构建脚本产生，未直接改生成文件。
7. 完成后更新 `AGENTS/LOG.md`。
