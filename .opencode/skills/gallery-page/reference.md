# Gallery 页面参考（gallery-page / reference）

## 1. 三层结构

### A. 分类索引（pages/gallery.html，1 层 `../`）

每个分类一张 `.gallery-cover` 卡片。链接目标：
- 分类页：`gallery/<cat>/index.html`
- 图片：`../images/gfx/...` 或 `../images/media/...`

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

### C. 照片 slideshow（pages/music/albums/<a>/photos/<slug>.html，5 层 `../../../../../`）

```html
<div class="panel gallery">
  <div id="slideshow" class="cycle-slideshow"
    data-cycle-swipe=true data-cycle-swipe-fx=scrollHorz data-cycle-fx=scrollHorz
    data-cycle-timeout=2000 data-cycle-caption=".count span"
    data-cycle-caption-template="{{slideNum}}/N"
    data-cycle-slides=">div.slide" data-cycle-manual-speed="100"
    data-cycle-prev=".prevControl" data-cycle-next=".nextControl"
    data-cycle-paused="true" data-cycle-auto-height="false">
    <div class="slide"><div class="bg retinafy" style="background-image: url({5层}images/media/gallery-images/rect-lrg/<hash>.jpg);"></div></div>
    <!-- 每张一个 .slide -->
  </div>
  <span class="prevControl"><i class="icon-carousel-left"></i></span>
  <span class="nextControl"><i class="icon-carousel-right"></i></span>
  <div class="count"><span></span></div>
</div>
<div class="panel gallery-info">…说明、日期…</div>
```

## 2. 图片规范

| 用途 | 规格 | 说明 |
|------|------|------|
| slide `.bg` | `rect-lrg` | 1500×1000 原图级 |
| og:image / twitter:image | `rect-med` | 1200×800，meta only 不渲染（M5） |
| gallery-cover 封面 | `rect-lrg` | photoset 第一张 hash（M4） |

## 3. photos.html 列表页（4 层）

专辑目录下的 photos 列表：`pages/music/albums/<album>/photos.html`（4 层 `../../../../`）。
每个 photoset 一张 `.gallery-cover`，`.more` 链接 `photos/<slug>.html`，封面 `url(../../../../images/media/gallery-images/rect-lrg/<hash>.jpg)`。

## 4. 关键坑

| 编号 | 坑 | 预防 |
|------|----|------|
| M4 | cover 封面用错图 | 用 photoset 第一张 slide hash |
| M5 | og:image 塞大图 | 用 rect-med |
| M14 | slideshow-nav.js 引两次 | 键盘翻两页；只引一次 |
| M45 | 无 data-cycle-auto-height="false" | 插 sentinel 克隆首图，移动端双首图+缝隙 |
| M46 | 删 .bg / slide 改 static | retinafy 克隆 bg 整页盖住；保留 .bg + position:relative |
