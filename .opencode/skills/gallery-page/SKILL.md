---
name: gallery-page
description: 在 1d fansite 新增 gallery 分类页 / photoset 照片集页面——三种页面层级（分类索引、分类内 cover 列表、单照片 slideshow）+ 图片 hash 引用 + 验证。
---

# Gallery / Photoset 页面工作流（gallery-page）

> 这是主流程文档。详细结构 → `reference.md`；真实页面 → `examples/`；可复制骨架 → `templates/`。

## 三种层级

| 层级 | 路径 | 结构 |
|------|------|------|
| A. 分类索引 | `pages/gallery.html` | N 个 `.gallery-cover` 入口卡片 |
| B. 分类页 | `pages/gallery/<cat>/index.html`（3 层） | 顶部 `journal-article` 介绍 + N 个 `.gallery-cover` |
| C. 照片 slideshow | `pages/music/albums/<a>/photos/<slug>.html`（5 层） | cycle2 slideshow + gallery-info |

## 操作步骤

### 新增分类（A + B）

1. `mkdir pages/gallery/<cat>/` + 复制现有分类页 `pages/gallery/<cat>/index.html` 作模板。
2. 改 meta/title/og:url、body class（`duo gallery-section`）、3 层资源前缀、双语介绍。
3. 填 `.gallery-cover` 卡片（模板见 `templates/gallery-cover.html`）——**封面 = photoset 第一张 slide hash**（M4）。
4. `pages/gallery.html` 加对应分类入口卡片（og 封面、count、链接）。

### 新增 photoset slideshow（C）

复制现有 slideshow 页（如 `pages/music/albums/four/photos/night-changes.html`）改：
- 每张照片一个 `.slide`（背景 `rect-lrg/<hash>.jpg`）。
- `data-cycle-caption-template` 里 N 改成真实张数。
- 同步 og:image / twitter:image:src（`rect-med`）+ gallery-info 说明。
- **保留**：`data-cycle-auto-height="false"`（M45）、`.bg` + slide `position:relative`（M46）、`slideshow-nav.js` 只引一次（M14）。

### 图片来源

官方：`www.onedirectionmusic.com/onedirectionmusiccom-ukprod/media/gallery-images/rect-lrg/<hash>.jpg`；本地：`images/media/gallery-images/rect-lrg/`。**新照片先 `git add`**（未跟踪 = 线上 404）。

## 验证

```bash
python -m http.server 8000 &
python tools/audit/_audit_site_images.py   # Broken: 0
git status --porcelain | grep "^??"  # 新图已跟踪
```

`AGENTS/LOG.md` 写日志。

## 铁律（防坑）

1. **M4**：gallery-cover 封面用该 photoset 第一张 slide 的 hash。
2. **M5**：slide 用 `rect-lrg`（1500×1000）；og:image 用 `rect-med`（1200×800）。
3. **M45**：slideshow 必须 `data-cycle-auto-height="false"`（否则插 sentinel 克隆首图）。
4. **M46**：`.bg` 保留、slide 保持 `position:relative`（retinafy 克隆 bg 会整页盖住）。
5. **M14**：`slideshow-nav.js` 只引一次（键盘翻两页）。
6. 改 CSS 记得 bump `?v=`（M12）。

## 参考资料索引

| 文件 | 内容 |
|------|------|
| `reference.md` | 三层结构详细说明、图片规范、photos.html 列表页链接 |
| `examples/gallery-cover.html` | 分类页真实 gallery-cover 卡片 |
| `examples/slideshow.html` | 真实 slideshow 页（night-changes）节选 |
| `templates/gallery-cover.html` | 可复制 gallery-cover 骨架 |
| `templates/slideshow.html` | 可复制 slideshow 骨架 |
