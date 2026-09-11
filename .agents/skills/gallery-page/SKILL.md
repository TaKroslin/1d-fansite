---
name: gallery-page
description: "Use for any Gallery page work in 1d-fansite: create an album or sub-page, create or update a slideshow, replace a Gallery cover, or change Gallery text, structure, image behavior, or technical settings. The skill handles asset preparation, page hierarchy, bilingual content, cover panels, slideshow wiring, QA, and delivery screenshot."
---

# Gallery Page

> **跨运行环境工具名**：确认提问 = opencode `question` / DSH `ask_user_question`；看图 = opencode MCP `visionpower` / DSH `read_image`。其余流程术语两者通用。

这是项目的 Gallery 页面专用工作流。Skill 的人类名称是 **Gallery Page**；目录 slug 保持为 `gallery-page`。触发词包括：`gallery page`、Gallery、相册、photoset、slideshow、幻灯片、Gallery 封面、cover，或明确要求修改 Gallery 的技术/文字/图片。

## 标准执行顺序

1. **读取**：读取项目入口、设计系统、元素命名文档和本 Skill；确认当前 Gallery 层级与最近似模板。
2. **定位**：检查目标页面、父级 index、现有 class/id、资源路径和 Downloads 候选资料；此阶段只读，不修改文件。
3. **整理方案**：明确要新增/修改的页面、目标层级、封面来源、六尺寸资源、文字和需要变更的 CSS/JS。
4. **作者确认**：使用 question 工具一次性确认目标路径、是否新建、图片顺序、显示文字，以及封面是否已单色/是否加灰度。信息不全或存在覆盖风险时必须停在这里。
5. **执行**：得到确认后，按最近似模板创建页面、处理资源、接入父级卡片并更新必要样式。
6. **验证**：先做静态和资源审计，再按需做桌面/移动端浏览器检查。
7. **交付**：发送一张最终截图，说明修改路径、验证结果，并写入 `AGENTS/LOG.md`。

作者未确认前，不创建页面、不覆盖既有页面、不替换封面、不批量处理图片。

## 1. 先判断任务类型

把请求归为一个或多个操作，再决定需要修改哪些页面：

| 操作 | 典型结果 |
|---|---|
| 新增 Gallery 分类 | 修改 `pages/gallery.html`，新建 `pages/gallery/<category>/index.html` |
| 新增分类内子集 | 新建或修改 `pages/gallery/<category>/<subset>/index.html` |
| 新增相册/照片集 | 新建一个 slideshow `.html`，并在所属 index 中增加 `.gallery-cover` |
| 修改 slideshow | 修改照片顺序、数量、标题、正文、路径、控件或技术参数 |
| 修改封面 | 替换 panel 使用的资源，必要时同步六个封面尺寸和 CSS |
| 修改文字 | 同步英文 `.en`、中文 `.zh`、`title`、description、Open Graph metadata |
| 修改技术 | 先判断是内容、资源、结构、样式还是交互变更；只有确实需要才改 CSS/JS |

不要把音乐专辑 photos 页面误当成 Gallery 分类页面。`pages/music/albums/.../photos/` 仍属于音乐区，必须保留 `.music-submenu`；`pages/gallery/...` 的 slideshow 使用 `duo gallery-section`，不要添加 `.music-submenu`。

## 2. 开始前必须收集资料

用户资料通常在 `/Users/takionkroslin/Downloads/`。只读目录并选择本次任务的明确文件，不要修改、移动或删除 Downloads 中的原文件。

执行前必须确认以下资料：

1. 封面图，或 slideshow 的全部内容图。若未提供独立封面，默认使用第一张 slideshow 图片作为封面。
2. slideshow 要放在哪个页面、哪个层级，例如 `Gallery / Members / Harry / new-album`。
3. 是否要新建页面；若已有同名页面，必须先确认是更新还是另建页面。
4. 封面上显示的名称，以及英文名、中文名、简介、年份/日期、照片数量和返回链接文字。
5. 图片是否已经按 slideshow 顺序排列；如果文件名不能确定顺序，先询问，不得猜测。

以下情况不能自动猜测，必须先向用户确认：目标层级缺失、多个候选图片集、封面与第一张 slide 的关系不清、覆盖既有页面、需要删除或替换既有内容。

## 3. 必须询问的单色确认

拿到封面后，在处理封面之前必须使用宿主提供的 `question` 工具确认：

> 这张 Gallery 封面本身已经是单色/黑白了吗？需要保留它的原始单色效果，还是需要添加网站的单色遮罩/灰度效果？

问题至少要能区分：

- 已经是单色，保留原图，不再叠加灰度；
- 是彩色，使用网站默认灰度效果；
- 是彩色，但需要保持彩色，不加灰度；
- 不确定，先生成预览后再决定。

如果当前环境没有可调用的 question 工具，不能默选；应暂停并向用户提出同一个确认问题。

## 4. Gallery 页面层级

项目当前实际使用以下四种层级：

| 层级 | 真实路径 | 页面职责 | 必须的主要结构 |
|---|---|---|---|
| A | `pages/gallery.html` | 全站 Gallery 分类入口 | `.panel.gallery-cover` |
| B | `pages/gallery/<category>/index.html` | 分类介绍和相册/成员卡片 | `.panel.journal-article` + `.panel.gallery-cover` |
| B2 | `pages/gallery/<category>/<subset>/index.html` | 分类下的子集/成员/系列 | `.panel.journal-article` + `.panel.gallery-cover` |
| C | `pages/gallery/<category>/<subset>/<slug>.html` | 单一照片集 slideshow | `.panel.gallery` + `#slideshow` + `.panel.gallery-info` |

现有 B2 示例包括 `members/harry/`、`members/louis/`；现有 C 示例包括 `members/five-guys/costume.html` 和 `members/harry/together-together.html`。新增页面必须复制最近似的现有页面作为模板，不能从空白文件手写整套 header/footer。

层级决定相对路径深度：

- A：资源通常 `../...`；
- B：资源通常 `../../../...`；
- B2/C：资源通常 `../../../../...`；
- 音乐区 5 层 photos 页面：资源通常 `../../../../../...`。

复制模板后逐项检查 `styles.css`、图片、JS、返回链接、`og:url` 和 `twitter:image:src`，不要只做字符串替换。

## 5. AI 自动完成的工作

资料和必要选项确认后，以下机械工作由 AI 直接完成：

1. 从 Downloads 复制并规范化本次资源；不改动原始资料。
2. 创建或更新正确层级的 Gallery index、cover panel 和 slideshow。
3. 生成封面所需的 `rect/square × sml/med/lrg` 六个资源。
4. 把 slideshow 卡片接入正确的父级页面，并更新数量、标题、链接、双语文字和 metadata。
5. 计算各层级相对路径，保留模板已有 header、navigation、footer 和脚本顺序。
6. 检查 `retinafy`、灰度规则、计数器、翻页控件和 slideshow 的图片顺序。
7. 运行静态检查、图片审计和必要的浏览器检查。
8. 生成一张与本次变更最相关的最终页面截图，作为交付物。

用户未要求时，不自动删除旧图片、旧页面或 Downloads 原文件；覆盖已有页面属于需要确认的操作。

## 6. 封面资源规范

### 6.1 六个输出文件

自制 Gallery 封面统一放在 `images/gfx/`，命名：

```text
<gallery-scope>-cover-rect-sml.png
<gallery-scope>-cover-rect-med.png
<gallery-scope>-cover-rect-lrg.png
<gallery-scope>-cover-square-sml.png
<gallery-scope>-cover-square-med.png
<gallery-scope>-cover-square-lrg.png
```

新资源的固定像素尺寸：

| 方向 | sml | med | lrg | 用途 |
|---|---:|---:|---:|---|
| `rect` 桌面横图 | 600×300 | 1200×600 | 2400×1200 | desktop Gallery cover / metadata |
| `square` 移动方图 | 300×300 | 600×600 | 1200×1200 | mobile Gallery cover |

这里的 `small / middle / large` 对应文件名中的 `sml / med / lrg`。不能仅凭文件名判断尺寸；生成后必须读取实际像素并报告六张图均通过。历史资源中有尺寸异常文件，新任务不得复制异常尺寸；除非用户明确要求修复旧资源，否则不批量重做旧封面。

**`-cover-` 标记不可省，`<gallery-scope>` 要展开成真实层级路径**（2026-09-11 踩过）：

`<gallery-scope>` 是**资源路径去掉 `pages/gallery/` 前缀后、把斜杠换成连字符**，而不是"随手起的整个前缀"。成员相册必须写成：

```text
gallery-members-<subset>-<album>-cover-<rect|square>-<sml|med|lrg>.png
例：pages/gallery/members/niall/dinner-table.html
 -> images/gfx/gallery-members-niall-dinner-table-cover-rect-sml.png
```

两个必须遵守的点：

1. **`-cover-` 一定要有**。members 层级里成员卡封面叫 `gallery-members-<subset>-cover-*`（如 `gallery-members-liam-cover-rect-sml.png`）。省掉 `-cover-` 写成 `gallery-members-liam-liam-rect-sml.png`，就和成员卡封面同形，光看文件名分不清是卡片封面还是相册封面。
2. **一个页面上不能有两个卡片共用同一个 cover class**。成员卡已经占用了 `liam-cover` / `niall-cover` / `zayn-cover`（见 `pages/gallery/members/index.html` 与 `css/styles.css` 的既有规则）。新建**相册**封面要么用独立 class（如 `liamandlouis-cover`），要么先确认该类没被占用：

   ```bash
   grep -c "<候选class>" css/styles.css   # 必须是 0（新建）或 2（已有的桌面+移动规则）
   ```

   同类名会让两条 `.panel.gallery-cover.X .bg` 规则**特异性完全相同**，写在文件后面的那条 `!important` 胜出——成员卡在移动端会显示成相册封面。这个冲突静态审计和图片审计都发现不了，只有按 class 逐个查 `getComputedStyle(bg).backgroundImage` 才能暴露。

桌面 panel 是 2:1，移动端 panel 是 1:1。桌面默认使用 `rect`，移动端通过对应 cover class 的媒体规则切换到 `square`。如果沿用第一张官方照片作为封面，遵守官方资源的 `rect-sml/med/lrg` 规则，并在文档中注明它不是自制六尺寸封面。

### 6.1b 照片集目录与文件命名

slideshow 的照片放在 `images/media/gallery-images/rect-lrg/<set-dir>/`，**文件夹名 = 文件 stem**，序号从 1 开始且无前导零：

```text
rect-lrg/checked-shirt/checked-shirt-1.jpg ... checked-shirt-54.jpg
rect-lrg/liam/liam-1.jpg ... liam-10.jpg
```

`<set-dir>` 由作者指定时**必须照用**，不要自行改写成更"通顺"的名字（把作者说的 `liam` 改成 `louis-with-liam` 属于擅自改动需求）。slideshow 页里 `data-cycle-slides=">div.slide"`、`data-cycle-caption-template="{{slideNum}}/<真实数量>"` 必须与该目录实际文件数一致。

### 6.2 单色与 retinafy

`.panel.gallery-cover .bg` 默认可能有 `grayscale(100%)`。单色/彩色选择必须落实到 CSS 规则，而不能只写在 `.bg` 的 inline style：`retinafy_replace()` 在高 DPI 下会重建 `.bg`，inline 样式会丢失。

若该封面需要保留原色或原始单色：

1. 使用卡片专属 class，例如 `.newalbum-cover`；
2. 在 `css/styles.css` 的 additions 区追加 `filter:none!important` 规则；
3. 更新所有引用该 CSS 的页面 `styles.css?v=`；
4. 用 DPR=2 的浏览器检查重建后的 `.bg`。

若用户选择网站默认灰度，不增加例外 CSS。

## 7. Slideshow 结构硬规则

新增或修改 Gallery slideshow 时：

- `body` 使用 `class="duo gallery-section"`；
- 每张图一个 `.slide`，照片使用 `rect-lrg` 或本地等价资源；
- `#slideshow` 必须显式闭合，不能依赖注释或浏览器自动修复；
- 保留 `data-cycle-auto-height="false"`；
- `.bg` 和 `.slide` 的定位结构必须保留；
- `slideshow-nav.js` 全页只引用一次；
- `data-cycle-caption-template`、`.count`、标题、简介和 metadata 使用真实照片数量；
- Gallery slideshow 不放 `.music-submenu`；
- fan 投稿的混合比例照片使用 `background-size: contain`，避免裁掉内容；
- 自建 Gallery slideshow 默认不添加 `.share`，除非用户明确要求。

封面卡片应使用真实目标 slideshow 的第一张照片或用户指定的独立封面；不能用无关占位图。`og:image`/Twitter 图片使用 `rect-med`，slideshow 内容图使用 `rect-lrg`。

## 8. 文字、命名和模板边界

- HTML class/id 必须沿用项目真实名称；新增标志性元素时同步登记 `AGENTS/ELEMENT-NAMING.md` 和单元素预览文档。
- 双语页面保留同一 DOM 结构，用 `.en` 与 `.zh` 配对；不可只翻译可见文字而遗漏 metadata。
- 修改现有模板生成的页面时，先判断它是否由脚本产生。生成页面应修改源数据并运行对应 builder；手写 Gallery 页面才直接修改 HTML。
- 不修改官方克隆结构，不随意重命名 class/id，不把一次性视觉决定抽成通用 CSS。
- 修改 CSS 必须 bump 所有受影响页面的 `styles.css?v=`。

## 9. 验证与交付

按便宜到昂贵的顺序验证：

1. 静态：HTML div 配对、路径深度、唯一脚本引用、真实照片数量、`.en/.zh` 配对、六张封面像素尺寸。
2. 资源：`python tools/audit/_audit_site_images.py`，目标 `Broken: 0`；检查新图片不是未跟踪文件。
3. 元素：`python tools/audit/_audit_element_inventory.py`，新增 class/id 有登记。
4. 视觉/交互：涉及布局、灰度、移动端切换或 slideshow 时，用 Playwright 检查桌面和移动端；灰度例外必须用 DPR=2 检查。
5. 交付：只需发用户一张截图。默认截取本次新增或修改后的 Gallery 主要页面桌面视图；如果变更只影响移动端，则截取移动视图。截图应来自最终通过验证的页面，不用草稿图代替。

> **Gallery 相册任务属于「大任务」**，收尾前必须按 `AGENTS/RULES.md` §8.1 完成检查表自查 5 项并逐项给证据：路径规范 / 命名规则 / 链接与路由可达 / 未违反组件规范 / 汇报修改文件列表。其中第 3 项要包含**从父级入口点进新页面的端到端验证**（建了新页面不等于接好了入口），第 4 项要先 `grep -c "<候选class>" css/styles.css` 查 class 占用。

完成后在 `AGENTS/LOG.md` 顶部记录目的、改动、验证、实测用时和遗留事项。

## 10. 参考文件

需要具体 HTML 骨架时读取：

- `reference.md`：真实层级、路径深度和历史坑位；
- `examples/gallery-cover.html`：Gallery cover 实例；
- `examples/slideshow.html`：slideshow 实例；
- `examples/slideshow-gallery.css`：混合比例照片的 contain 规则；
- `templates/gallery-cover.html`：cover 骨架；
- `templates/slideshow.html`：slideshow 骨架；
- `AGENTS/DESIGN-SYSTEM.md`：设计 token、Panel、响应式和状态规范；
- `AGENTS/ELEMENT-NAMING.md`：真实 class/id 精确名称。
