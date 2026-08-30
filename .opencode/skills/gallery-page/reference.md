# Gallery 页面参考（gallery-page / reference）

## 1. 四层结构

### A. 分类索引（pages/gallery.html，1 层 `../`）

每个分类一张 `.gallery-cover` 卡片。链接目标：
- 分类页：`gallery/<cat>/index.html`
- 图片：`../images/gfx/...` 或 `../images/...`

### B. 分类页（pages/gallery/<cat>/index.html，3 层 `../../../`）

- body class：`duo gallery-section`
- 顶部 `.panel.journal-article`：介绍文字（双语）
- 每张照片一个 `.gallery-cover`：
  - `.bg` 封面 = **photoset 第一张 slide hash**（M4）
  - `.panel-header`：`.title`=年份、`.section-name`=分类
  - `.panel-content h2`：名字
  - `.count`：张数
  - `.more` 链接：目标 photoset 页
- 图片路径：`../../../../images/media/gallery-images/rect-lrg/<hash>.jpg`
- 底部 `.journal-archive-link` 回 `../../gallery.html`

### B2. sub-category 多相册页（pages/gallery/<cat>/<sub>/index.html，4 层 `../../../../`）

适用场景：分类下面再分一层（如 `members/harry/`），再列相册/photoset 卡片。结构和 B 完全一样，只是 URL 深度多一层。

- 资源前缀全部用 `../../../../`（CSS、JS、images、logo、footer about `../../../about.html`）
- card `.more` 链接到 `../<sub>/<slug>.html`（与 index 同层）——**Back to <cat> 链接**用 `../index.html`，**不要** 用 `../../index.html`（那是回 gallery.html，不是回上一层 cat）

### C. 照片 slideshow

两种深度都可以，按层级放在 C 上一层 index 的同级：

- `pages/music/albums/<a>/photos/<slug>.html`（5 层）——album photoset
- `pages/gallery/<cat>/<sub>/<slug>.html`（4 层）——gallery photoset（推荐与 sub-category index 同级，路径短）

```html
<div class="panel gallery">
  <div id="slideshow" class="cycle-slideshow"
    data-cycle-swipe=true data-cycle-swipe-fx=scrollHorz data-cycle-fx=scrollHorz
    data-cycle-timeout=2000 data-cycle-caption=".count span"
    data-cycle-caption-template="{{slideNum}}/N"
    data-cycle-slides=">div.slide" data-cycle-manual-speed="100"
    data-cycle-prev=".prevControl" data-cycle-next=".nextControl"
    data-cycle-paused="true" data-cycle-auto-height="false">
    <div class="slide"><div class="bg retinafy" style="background-image: url({depth}images/media/gallery-images/rect-lrg/<hash>.jpg);"></div></div>
    <!-- 每张一个 .slide -->
  </div>
  <span class="prevControl"><i class="icon-carousel-left"></i></span>
  <span class="nextControl"><i class="icon-carousel-right"></i></span>
  <div class="count"><span></span></div>
</div>
<div class="panel gallery-info">…说明、日期、share、Back 链接…</div>
```

**`<div id="slideshow">` 必须显式闭合**（注释 `<!--.cycle-slideshow-->` 之后写 `</div><!--#slideshow-->`），否则 parser auto-close 把 .gallery-info / <footer> 排到 body 外，body 只剩 4 个 children。

### music slideshow vs gallery slideshow

| 字段 | music photoset | gallery photoset |
|------|------|------|
| body class | `duo <album>-campaign music-section` | `duo gallery-section` |
| 顶部 | `.music-submenu`（Videos/Photos/Singles/Fans tabs） | 无（直接 panel.gallery） |
| 返回链接 | 同 album photos.html 列表 | `index.html`（同层，回到 sub-category） |

**不要把 music slideshow 模板直接复制到 gallery slideshow**——会把 Videos/Fans tabs 带到 gallery 页面。

## 2. 图片规范

| 用途 | 规格 | 说明 |
|------|------|------|
| slide `.bg` | `rect-lrg` 或自定义比例 | 1500×1000 是官方；fan 投稿是各种比例（1069×1069、887×800 等），slideshow 用 `contain` 让全图可见 |
| og:image / twitter:image | `rect-med` 或自定义 cover | 1200×800 meta only；fan 站没有 rect-med 可用 cover rect-lrg 代替 |
| gallery-cover 封面 | `rect-lrg` 或官方 hash（M4） | photoset 第一张 hash（M4） |

## 3. photos.html 列表页（4 层）

专辑目录下的 photos 列表：`pages/music/albums/<album>/photos.html`（4 层 `../../../../`）。
每个 photoset 一张 `.gallery-cover`，`.more` 链接 `photos/<slug>.html`，封面 `url(../../../../images/media/gallery-images/rect-lrg/<hash>.jpg)`。

## 4. .gallery-cover panel 比例（重要！）

`.gallery-cover` 面板的形状随视口变化：

- **桌面 `duo`（>767px）**：`padding-top:50%` + 全宽 → **2:1 landscape**（1280×640）
- **移动 `mono`（≤767px）**：`padding-top:50%` + 全宽 → **1:1 square**（390×390）

这意味着：2:1 图（2400×1200）桌面完美贴合，**不要怀疑被裁切**——1:1 图桌面会裁左右，移动 1:1 完美贴合。

## 5. gallery slideshow 桌面端 contain 模式（fan mixed-ratio photos）

官方 music slideshow 用 3:2 `cover` 裁切（适合官方 1500×1000 照片）。**fan 投稿比例不统一**，必须改用 contain + 全高容器：

```css
@media only screen and (min-width:768px){
  .gallery-section .panel.gallery{
    padding-top:0!important;
    height:calc(100vh - 5.85em);  /* 留出 header#nav (~93px = 5.85em) */
    overflow:hidden;
    background:#000;  /* 显式纯黑，不依赖 body 透传 */
  }
  .gallery-section .panel.gallery #slideshow,
  .gallery-section .panel.gallery #slideshow .slide{
    position:absolute;
    width:100%;
    height:100%;
    top:0;
    left:0;
  }
  .gallery-section .panel.gallery #slideshow .slide .bg{
    background-size:contain!important;
    background-repeat:no-repeat!important;
    background-position:center center!important;
  }
  /* gallery-info 纯黑配白字，与 slideshow 风格一致 */
  .gallery-section .panel.gallery-info{
    background:#000;
    color:#fff;
  }
  .gallery-section .panel.gallery-info .panel-header,
  .gallery-section .panel.gallery-info h2{color:#fff;}
  .gallery-section .panel.gallery-info .share a,
  .gallery-section .panel.gallery-info .share a:visited,
  .gallery-section .panel.gallery-info .journal-archive-link a.more{
    color:#fff; border-color:#fff;
  }
  .gallery-section .panel.gallery-info .share a:hover,
  .gallery-section .panel.gallery-info .journal-archive-link a.more:hover{
    background:#fff; color:#000;
  }
}
```

**作用域**：用 `.gallery-section` 前缀，不影响 music-section 的 album slideshow。retinafy 克隆的 `.bg` 仍带 `class="bg"`，会被 `.slide .bg` 选择器覆盖，**无需针对 retinafy 写补丁**。

## 6. 两尺寸 cover 模式（custom 封面）

当 cover 不是官方 hash，而是用户提供的 PNG 时，文件命名：
- `<scope>-cover-rect-lrg.png`（2400×1200，2:1，desktop 默认）
- `<scope>-cover-square-lrg.png`（1200×1200，1:1，mobile 切换）

CSS 模式（参考 `.albums-cover` 已有的两尺寸切换）：

```css
.panel.gallery-cover.<scope>-cover .bg{
  -webkit-filter:none!important;
  filter:none!important;  /* curated cover 去灰度 */
}
@media (max-width: 767px){
  .panel.gallery-cover.<scope>-cover .bg{
    background-image:url(../images/gfx/<scope>-cover-square-lrg.png)!important;
  }
}
```

HTML `.bg` 默认引用 `-rect-lrg`，mobile media query 切换到 `-square-lrg`。

> **⚠️ 去灰度必须写在 CSS 里，不能只加 inline `filter:none`**：`js/main.js` 的 `retinafy_replace()`（HiDPI >1x 时触发，用 `-sml → -lrg/-med`）会用 `class="bg"` 重建一颗新 `.bg`（只带 background-image）并删除旧元素——**inline 样式会被一起丢掉**，页面随即"回退成灰度"。所以 `<scope>-cover` 这个 class 必须加进 styles.css 的 curated `filter:none!important` 规则组。验证要模拟 retinafy：Playwright `device_scale_factor=2` + `wait_until=networkidle`，断言 `.bg` 变 `retinafied` 后 computed `filter` 仍为 `none`。

## 7. 关键坑

| 编号 | 坑 | 预防 |
|------|----|------|
| M4 | cover 封面用错图 | 用 photoset 第一张 slide hash（或用户提供的设计图） |
| M5 | og:image 塞大图 | 用 rect-med |
| M14 | slideshow-nav.js 引两次 | 键盘翻两页；只引一次 |
| M45 | 无 data-cycle-auto-height="false" | 插 sentinel 克隆首图，移动端双首图+缝隙 |
| M46 | 删 .bg / slide 改 static | retinafy 克隆 bg 整页盖住；保留 .bg + position:relative |
| 🆕 | `<div id="slideshow">` 没闭合 | 写 37 张 slide 之前先把 `</div><!--#slideshow-->` 写好；验证 opens=closes |
| 🆕 | 把 music slideshow 模板直接复制到 gallery slideshow | gallery slideshow 顶部**不**要 `.music-submenu`；用 body class `gallery-section` |
| 🆕 | 误判 `.gallery-cover` 是 1:1 方形 | 实测：桌面 2:1 landscape、移动 1:1 square |
| 🆕 | fan mixed-ratio 照片用 `cover` 桌面端被裁 | 桌面端用 `contain` + 全高容器 + 黑底 letterbox（见 §5） |
| 🆕 | 新建页面 back 链接 depth 算错 | 按 path 表实测，harry 页是 4 层 → `../index.html` 回上一层 cat，不是 `../../index.html` |
| 🆕 | `#slideshow` 闭合丢，body 只剩 4 children | 见 §1 C 节 |