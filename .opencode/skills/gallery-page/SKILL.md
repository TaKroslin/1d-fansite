---
name: gallery-page
description: 在 1d fansite 新增 gallery 分类页 / sub-category 多相册页 / photoset 照片集页面——四种页面层级（分类索引、分类内 cover 列表、sub-category 多相册、单照片 slideshow）+ 图片规范 + 验证。
---

# Gallery / Photoset 页面工作流（gallery-page）

> 这是主流程文档。详细结构 → `reference.md`；真实页面 → `examples/`；可复制骨架 → `templates/`。

## 四种层级

| 层级 | 路径 | 结构 |
|------|------|------|
| A. 分类索引 | `pages/gallery.html` | N 个 `.gallery-cover` 入口卡片 |
| B. 分类页 | `pages/gallery/<cat>/index.html`（3 层） | 顶部 `journal-article` 介绍 + N 个 `.gallery-cover`（成员/相册列表） |
| **B2. sub-category 多相册页** | `pages/gallery/<cat>/<sub>/index.html`（4 层） | 当 `<cat>` 下有多种相册/成员（如 members→harry→headband），B2 用 B 的模板列出 sub-album 卡片 |
| C. 照片 slideshow | `pages/gallery/<cat>/<sub>/<slug>.html`（4 层）或 `pages/music/albums/<a>/photos/<slug>.html`（5 层） | cycle2 slideshow + gallery-info |

> **B2 与 B 的区别**：B 是"分类下面直接列封面卡片"；B2 是"分类下面先按成员/系列再分一层，每层再列相册"。两种结构都用 `.panel.journal-article` 顶部介绍 + `.gallery-cover` 卡片列表——模板完全一样，只是 URL 深度多一层。**B2 实际存在过**：`pages/gallery/members/harry/index.html`（Harry 分类下做多相册展示）。

## 操作步骤

### 新增分类（A + B）

1. `mkdir pages/gallery/<cat>/` + 复制现有分类页 `pages/gallery/<cat>/index.html` 作模板。
2. 改 meta/title/og:url、body class（`duo gallery-section`）、3 层资源前缀、双语介绍。
3. 填 `.gallery-cover` 卡片（模板见 `templates/gallery-cover.html`）——**封面 = photoset 第一张 slide hash**（M4）。
4. `pages/gallery.html` 加对应分类入口卡片（og 封面、count、链接）。

### 新增 sub-category 多相册页（B2）

1. `mkdir pages/gallery/<cat>/<sub>/` + 复制 B 层模板（`pages/gallery/<cat>/index.html`）改写。
2. 改 meta/title/og:url、body class（`duo gallery-section`）、**4 层**资源前缀、双语介绍。
3. 填 `.gallery-cover` 卡片（标题改成 sub-category 名，比如 "Harry" 而非 "Members"）。
4. card 链接 target：`<slug>.html`（与 index 同层）。
5. 底部 `.journal-archive-link` 回到上一层：`../index.html`（B2→B 的"Back to <cat>"）。

### 新增 photoset slideshow（C）

复制现有 slideshow 页（优先用同 gallery-section 的，避免 music-section 样式冲突）改：
- 每张照片一个 `.slide`（背景 `rect-lrg/<hash>.jpg` 或 fan 自定义路径）。
- `data-cycle-caption-template` 里 N 改成真实张数。
- 同步 og:image / twitter:image:src（`rect-med`）+ gallery-info 说明。
- **保留**：`data-cycle-auto-height="false"`（M45）、`.bg` + slide `position:relative`（M46）、`slideshow-nav.js` 只引一次（M14）。
- **gallery slideshow vs music slideshow 关键区别**：music slideshow 顶部有 `.music-submenu`（Videos/Photos/Singles/Fans tabs）；gallery slideshow **不要**复制 submenu，直接 `panel.gallery` 起手，否则就是"分专辑页面克隆"。

### slideshow 两种 body class 区分

| body class | 场景 | 顶部 |
|------|------|------|
| `duo four-campaign music-section`（或同系列） | 专辑 photos 页（night-changes 等） | 含 `.music-submenu` |
| `duo gallery-section` | gallery 分类下的 photoset | 无 submenu，干净 |

**误用会污染全站**——album photos 页如果换成 `gallery-section` 就丢了 Videos/Fans tabs。

### 图片来源

官方：`www.onedirectionmusic.com/onedirectionmusiccom-ukprod/media/gallery-images/rect-lrg/<hash>.jpg`；本地：`images/media/gallery-images/rect-lrg/`。
**fan 投稿**：放 `images/media/gallery-images/rect-lrg/`（保持 skill 目录约定），文件名保留原命名（`hlsd-hb1.jpeg` 等可读名）。**新照片先 `git add`**（未跟踪 = 线上 404）。

## 验证

```bash
python3 -m http.server 8000 &
python3 tools/audit/_audit_site_images.py   # Broken: 0
git status --porcelain | grep "^??"  # 新图已跟踪
```

`AGENTS/LOG.md` 写日志。

## 铁律（防坑）

1. **M4**：gallery-cover 封面用该 photoset 第一张 slide 的 hash。
2. **M5**：slide 用 `rect-lrg`（1500×1000）；og:image 用 `rect-med`（1200×800）。
3. **M45**：slideshow 必须 `data-cycle-auto-height="false"`（否则插 sentinel 克隆首图）。
4. **M46**：`.bg` 保留、slide 保持 `position:relative`（retinafy 克隆 bg 会整页盖住）。
5. **M14**：`slideshow-nav.js` 只引一次（键盘翻两页）。
6. **M12**：改 CSS 记得 bump `?v=`。
7. **🆕 gallery-cover panel 比例**（这个最容易搞错）：
   - **桌面端 `duo` body** → panel 是 **2:1 landscape**（1280×640），`padding-top:50% width=full`。
   - **移动端 `mono` body（≤767px）** → panel 是 **1:1 square**。
   - 比例不对的 cover（2:1 图塞 2:1 panel）天然贴合 0 裁切；1:1 图塞 2:1 panel `cover` 会裁左右。
8. **🆕 mixed-ratio fan photos**：fan 投稿照片不是 16:9 标准比例，slideshow 桌面端应改用 **`background-size: contain`**（整图可见、letterbox 黑边），不要沿用官方 3:2 `cover` 裁切。CSS 模板见 `examples/slideshow-gallery.css` 节选。
9. **🆕 写 37 张 slide 前先闭合 `</div>`**：`<div id="slideshow">` 必须显式闭合（注释不算），否则浏览器 parser auto-close 会把后面 `.gallery-info` / `<footer>` 全部排到 body 外——body 只剩 4 个 children，gallery-info 白底"穿透"显示。验证：`python3 -c "import re; s=open(p).read(); print(len(re.findall(r'<div(?=[\s>])', s))-len(re.findall(r'</div>', s)))"` 必须=0。
10. **🆕 两尺寸 cover 模式**（custom 封面替代官方 hash 封面时）：文件命名为 `<name>-cover-{rect,square}-lrg.png`，CSS additions 块加 `[max-width:767px]{ .<class> .bg{ background-image:url(./<name>-cover-square-lrg.png)!important; } }` + 桌面默认 `.bg` 引用 `-rect-lrg`；可参考 `.albums-cover` 已有的两尺寸切换实现。
11. **🆕 curated 封面去灰度（`filter:none!important`）—— 不能用 inline**：`.panel.gallery-cover .bg` 默认 `filter:grayscale(100%)`。若封面本身已是单色/彩图主题（自己做的封面），必须去掉灰度，但**只在 HTML `.bg` 上加 inline `filter:none` 无效**——`js/main.js` 的 `retinafy_replace()` 在 HiDPI(>1x) 下会用 `class="bg"` 重建一颗新 `.bg`（只带 `background-image`）再删旧元素，inline 样式全丢 → 页面"回退成灰度"。**正确做法**：把该卡片的 class（如 `.togethertogether-cover`）追加进 `css/styles.css` FIVE GUYS 块里 curated covers 的 `filter:none!important` 选择器组（参考 `.albums-cover`/`.headband-cover`/`.checkedshirt-cover` 已列），并 **bump `?v=`**（改 CSS 必 bump）。验证必须模拟 retinafy 路径：Playwright `device_scale_factor=2` + `wait_until=networkidle`，确认 `.bg` 被标记 `retinafied` 后 computed `filter` 仍为 `none`（只看 dpr=1 的 `load` 是假通过，会漏掉 retinafy 重建丢 inline 的坑）。

## 参考资料索引

| 文件 | 内容 |
|------|------|
| `reference.md` | 三/四层结构详细说明、图片规范、photos.html 列表页链接、gallery slideshow CSS 模板 |
| `examples/gallery-cover.html` | 分类页真实 gallery-cover 卡片 |
| `examples/slideshow.html` | 真实 music 幻灯片页（night-changes）节选 |
| `examples/slideshow-gallery.css` | 🆕 gallery slideshow 桌面端 contain 模式 CSS 模板 |
| `templates/gallery-cover.html` | 可复制 gallery-cover 骨架 |
| `templates/slideshow.html` | 可复制 slideshow 骨架 |