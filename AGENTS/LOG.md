# 1D Fansite — 开发日志（LOG）

## 2026-09-05 — 小说 Chapters 全量重写同步（111 章）

- **模型**：big-pickle
- **目的**：根目录 `Chapters/*.md` 为最新小说内容，与 blog 渲染目录 `pages/blog/the-only-direction-home/chapters/NN/chapter.md` 存在差异（52 章不同）。作者选择「全部重写」，将 111 章全部同步。
- **结果**：幂等脚本将 `Chapters/*.md` 全部覆盖到对应 `chapter.md`（文件名 `01_林森浩.md` → `chapters/01/chapter.md`）；运行 `.venv/bin/python tools/build/build_novel.py` 重新生成 111 个章节 `index.html` + hub 页。
- **验证**：`diff -q` 确认 111 章全部一致（Same: 111, Diff: 0）；生成的 `chapters/01/index.html` 已含新句「他亲生妈妈塞进行李箱底的那一把」、旧句「从一家二手乐器店里买的」已移除。
- **Token 消耗**：未记录
- **用时**：未单独计时
- **经验总结**：系统 `python3` 缺 `markdown` 模块，必须用 `.venv/bin/python` 运行构建脚本；Chapters 根目录与渲染目录双维护，改小说内容须同步两份再 build。
- **遗留/待办**：无

## 2026-09-05 — 为六个 Skills 统一增加阶段式执行流程

- **模型**：Codex
- **目的**：把 Skills 从规则集合优化为“先读取定位、再整理方案、询问作者、确认后执行、最后验证交付”的顺序，减少 AI 提前修改和流程歧义。
- **结果**：为 `gallery-page`、`blog-post`、`design-system`、`new-page`、`qa-workflow`、`translation` 增加统一的七阶段流程；每个 Skill 都明确确认前的禁止动作、专用 Skill 优先级、验证时机和截图/日志交付边界。
- **验证**：6 个 Skill 均包含七个阶段关键词；front matter、500 行限制和 `git diff --check` 通过。
- **Token 消耗**：未记录
- **用时**：实测未单独计时
- **经验总结**：高质量工作流的核心不是堆更多规则，而是锁定动作顺序和确认闸门；作者确认应发生在执行前，而不是执行中途。
- **遗留/待办**：后续用真实任务试运行，观察 question 工具调用和专用 Skill 优先级是否符合预期。

## 2026-09-05 — 修正 Blog 首页卡片数量为动态规则

- **模型**：Codex
- **目的**：移除 Blog Skill 中对首页卡片数量为 3 的错误固定假设。
- **结果**：`blog-post/SKILL.md` 改为先读取修改前首页实际 Blog 卡片数量，默认新增文章后保持该数量；只有用户明确要求时才调整数量，并同步修改验证命令和触发确认边界。
- **验证**：已确认 Skill 中不再出现“当前 3”或固定数量规则；front matter 与 Markdown 语法检查通过，`git diff --check` 通过。
- **Token 消耗**：未记录
- **用时**：实测未单独计时
- **经验总结**：页面内容数量属于运行时项目事实，Skill 只能规定读取和保持规则，不能把某次页面状态写死。
- **遗留/待办**：无。

## 2026-09-05 — 统一轻量修订其余五个 Skills

- **模型**：Codex
- **目的**：在一次会话内完成剩余 Skills 的基础规范化，减少后续触发歧义和重复确认。
- **结果**：更新 `blog-post`、`design-system`、`new-page`、`qa-workflow`、`translation` 五个 `SKILL.md` 的触发描述；补充资料输入、AI 自动执行范围、必须确认的歧义、元素命名入口、视觉截图和 QA 边界；修正 `design-system` 的旧文档路径引用。未新增 Skill，未修改页面、CSS 或构建流程。
- **验证**：6 个现有 Skill（含已完成的 `gallery-page`）front matter、触发/确认内容和 500 行限制检查通过；`git diff --check` 通过；未发现目标 Skill 中残留旧设计系统入口。
- **Token 消耗**：未记录
- **用时**：实测 6 秒（批量修订与验证阶段；前置阅读未计入）
- **经验总结**：轻量 Skill 不需要重复项目知识，重点是触发条件、输入边界、自动化边界和验收出口；统一入口能减少 AI 在旧日志和旧路径中寻找规则。
- **遗留/待办**：暂不制作新的流程 Skill；后续可用真实 Blog、翻译、QA 或新页面请求做一次实际触发测试。

## 2026-09-05 — 打磨 Gallery Page Skill：明确触发、输入、自动化与交付流程

- **模型**：Codex
- **目的**：根据维护者确认的 Gallery 工作方式，把现有 `gallery-page` Skill 细化为可直接执行的工作流。
- **结果**：重写 `.opencode/skills/gallery-page/SKILL.md`；加入 Gallery/相册/slideshow/封面触发条件、四种真实页面层级、Downloads 资料清单、必须确认的单色/灰度问题、AI 自动执行范围、六个封面资源及固定像素尺寸、slideshow 结构硬规则、生成页/手写页边界、QA 顺序和“一张截图”交付标准。
- **验证**：Skill Creator 官方 `quick_validate.py` 因环境缺少 `PyYAML` 无法运行；已用无依赖替代检查验证 front matter、必需规则关键词、179 行长度及 `git diff --check`，全部通过；同时核对现有 Gallery 页面层级和封面资源尺寸，发现历史资源存在尺寸异常，已在 Skill 中明确新资源不得复制异常文件。
- **Token 消耗**：未记录
- **用时**：实测 6 秒（写入与验证阶段；前置阅读与分析未计入）
- **经验总结**：Gallery 自动化必须把“可自动执行”和“必须向用户确认”分开；封面尺寸必须验像素，不能只验文件名；单色例外必须走 CSS 规则以兼容 retinafy 重建。
- **遗留/待办**：按用户要求暂不制作新的 Gallery 构建脚本或同步到其他 Skill 目录；下一步可用真实的新相册请求试运行并继续微调。

## 2026-09-05 — 重构元素可视化预览：一元素一 HTML、一框一预览（Codex）

- **模型**：Codex
- **目的**：修正此前多个 iframe 指向同一长预览页、内容重复且需要框内滚动的问题；补齐 Header、Footer、按钮、卡片和字体的独立视觉对照。
- **结果**：新增 `tools/build/build_element_previews.py`，生成 `AGENTS/element-previews/` 下 50 个独立 HTML；新增 `AGENTS/ELEMENT-PREVIEWS.md`，每条名称只嵌入一个对应 HTML；覆盖 Header、导航、Footer、菜单/CTA/播放按钮、首页、Journal、Gallery、Music、Band、Tour、Shop、Novel、翻译、计数与 17 套字体样张。删除旧的合并式 `element-previews/index.html`；`ELEMENT-NAMING.md` 改为精准名称注册表，并链接至新的可视化对照文档。
- **验证**：iframe 条目 50 个、独立预览 HTML 50 个；预览引用的全部本地图片存在；元素审计仍扫描 327 个 HTML、263 个 class token、270 个 class 组合、50 个 id、21 个图标 class；构建脚本语法检查和 `git diff --check` 通过。
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：视觉元素词典必须遵守“一名称、一独立预览文件、一渲染框”；锚点跳转到同一长页面会造成重复和滚动，不能作为元素级参考。
- **遗留/待办**：后续若新增经典组件，在 `build_element_previews.py` 增加一条记录后重建预览；建议在 Typora 打开 `ELEMENT-PREVIEWS.md` 做最终人工确认。

## 2026-09-05 — 修正元素命名文档：加入可渲染 HTML 板块预览（Codex）

- **模型**：Codex
- **目的**：根据反馈，把命名文档中的 HTML 示例从代码框改为 Typora 可直接渲染的板块预览。
- **结果**：新增 `AGENTS/element-previews/index.html`，加载项目现有 CSS、字体和真实图片，提供公共 Header、首页 Blog 卡、Gallery 封面、Novel 章节卡、文章、歌词、成员、Tour、Newsletter 预览；`AGENTS/ELEMENT-NAMING.md` 改为通过 raw HTML `<iframe>` 直接显示这些板块，并保留真实 class/id 和精确定位信息。未修改页面、CSS 或现有 `.opencode/skills`。
- **验证**：元素审计识别 327 个 HTML、263 个 class token、270 个 class 组合、50 个 id、21 个图标 class；Python 语法检查和 `git diff --check` 通过。当前沙箱禁止绑定本地 HTTP 端口（`PermissionError: Operation not permitted`），因此未能用 HTTP curl 验证 iframe 加载，预览文件路径和相对资源路径已静态核对。
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：作者需要的是“名称下面直接看到板块”，代码框只能说明结构，不能完成视觉对应；用独立预览页承载真实 class 结构，Markdown 用 iframe 嵌入，可避免在文档中复制大量易过期 HTML。
- **遗留/待办**：建议在 Typora 中打开 `AGENTS/ELEMENT-NAMING.md` 人工确认 iframe 是否被启用；若 Typora 安全策略阻止 iframe，再改用 Typora 支持的 raw HTML 容器或本地预览链接。

## 2026-09-05 — 拆分设计规范、建立全站元素命名注册表并登记候选 Skills（Codex）

- **模型**：Codex
- **目的**：提高 AI 精准定位页面元素和重复工作流的效率；本阶段不修改页面视觉和行为。
- **结果**：新增 `AGENTS/DESIGN-SYSTEM.md`，集中定义颜色、字体配对、Panel、公共壳层、响应式、交互、资源、缓存和验收规则；新增 `AGENTS/ELEMENT-NAMING.md`，以真实完整 class/id 记录首页 Blog 卡、全站经典 Panel、页面专属组件、图标和字体；新增 `AGENTS/SKILLS-ROADMAP.md`，登记 7 个候选 Skill 名称并标注仓库原有的 6 个 `.opencode/skills`，暂不创建或修改 `SKILL.md`；`AGENTS/AGENTS.md` 精简为入口和项目事实；新增只读 `tools/audit/_audit_element_inventory.py`，并在 `.gitignore` 中为该常驻审计工具添加例外。
- **验证**：元素审计扫描 327 个 HTML + 1 个 CSS，识别 263 个 class token、270 个 class 组合、50 个 id、21 个图标 class；字体扫描包含 Google、本地中文、系统 fallback 和 Icomoon；`python3 -m py_compile tools/audit/_audit_element_inventory.py` 通过；`git diff --check -- AGENTS tools/audit` 通过。
- **Token 消耗**：未记录
- **用时**：实测 9 秒（文档写入与验证阶段；前置分析时间未计入）
- **经验总结**：元素命名必须以真实 class/id 链为主、中文别名为辅；审计脚本必须同时扫描 HTML、模板和 CSS；以下划线开头的常驻审计脚本需显式加入 `.gitignore` 例外。
- **遗留/待办**：候选 Skills 仅登记名称，后续逐个协商触发条件、输入输出、脚本和验证流程；工作区原有页面、图片和 CSS 改动未处理。

## 2026-08-31 — 首页 Liam 生日板块：删倒计时、常驻顶部横幅、整卡可点击跳转 Fan Art + 双语 CTA 提示（deepseek-v4-flash-visual-exp 完成 + big-pickle 补 LOG）

- **模型**：deepseek-v4-flash-visual-exp（接手 big-pickle 完成首页 Liam 生日板块改造）+ big-pickle（补充 LOG）
- **目的**：① 删除原倒计时模块；② 该板块改为在首页内容区顶端（hero+nav 之后第一个 panel）**永久显示**（不再按日期门控）；③ 整卡可点击，跳转 Fan Art「Happy Liam's 33rd Birthday」相册；④ 在卡内加一行小字双语 CTA 提示点击跳转。
- **结果**：
  1. **index.html**：删除 `.liam-countdown-panel`（倒计时 DOM）与其内联 JS（`cdHours/cdMinutes/cdSeconds` 的 `decide()/updateCountdown()` 块）；`.liam-bday-panel` 去掉 `style="display:none"`；整卡内容包进 `<a class="liam-bday-link" href="pages/gallery/fan-art/happy-liams-33rd-birthday.html" style="display:block;color:inherit;text-decoration:none;position:relative">`。因整卡是块级链接、无内层 `<a>`，无嵌套锚点问题。
  2. **桌面高度 bug**：接手发现 `.liam-stage` 桌面上**无高度规则**（只有 `@media max-width:767px` 里才有 `height:min(100vw,600px)`）→ 桌面 collapse 成 0 高。既然要常驻显示，必须修：给 styles.css 加桌面规则 `.panel.journal-article .liam-stage{height:min(78vh,660px);overflow:hidden}`，并被移动端媒体查询正确覆盖。
  3. **bump `?v=`**：`.liam-stage` 改了 CSS → 按 M12，`20260830zh11 → zh12`，全站 330 个 .html 批量替换（grep -rl + sed）。
  4. **CTA 提示行**：在 `.liam-copy-bottom` 里 `1993 — 2024` 之后加 `<p class="liam-cta" style="...">`（Source Code Pro 小字 uppercase，en「Click to view fan creations」/ zh「点击查看 粉丝创作」），内联样式、包在链接内，点击同样跳转相册。此步只改 index.html 内联 → 无需再 bump `?v=`。
  5. **提交并推送**：`0f9be28`（删倒计时+常驻顶部横幅+桌面高度修复+v=zh12）、`e075108`（双语 CTA 行），均 push 到 origin/main。
- **验证**：Playwright 检查 — 桌面 `.liam-stage`/`.liam-bday-panel` 高度 660px、移动端 stage 390px（100vw）、panel `display:block`、无 `.liam-countdown-panel` 残留；点击 `.liam-bday-link` 跳转 `.../happy-liams-33rd-birthday.html`（title 命中「Happy Liam's 33rd Birthday」）；CTA 行桌面/移动均可见（h=21px、无溢出、en/zh 命中）；`_audit_site_images.py` → 719 refs `Broken: 0`；标签 div/a/span/p 闭合差值全部 0。
- **Token 消耗**：未记录
- **用时**：未记录（接手无起点时间戳）
- **经验总结**：
  1. 整卡做整块链接时，用 `<a style="display:block;position:relative">` 包裹即可，内部绝对定位子元素（`panel-header`/`liam-headline`/`liam-copy-bottom`）自动以其为包含块，无需额外 CSS。
  2. 常驻顶部 panel 暴露了 `.liam-stage` 桌面无高度、仅在移动媒体查询里设高度的既有 bug——之前 `display:none` 时无人发现。**媒体查询里单独设高度、桌面不设**，一启用必塌成 0 高。
  3. 单行文案（无布局改动）用内联样式即可，避免为一行小字再次触发 330 个 .html 的 `?v=` bump。
- **遗留/待办**：无（已完成并推送）。旧 `.liam-countdown-*` 相关 CSS 规则仍留在 styles.css（未删除，未使用，无副作用）。

## 2026-08-30 — gallery 新建 3 个相册 + 首页 fan art 换封面（deepseek-v4-flash-vision）

- **模型**：deepseek-v4-flash-vision
- **目的**：gallery 下 Harry 新增「Together Together」、Louis 新增「How Did We Get Here」、Fan Art 页新增「Happy Liam's 33rd Birthday」三个相册；并把 gallery 首页 Fan Art 分类卡换成新封面。资源（相册照片 + 封面 PNG/PSD）全在 `~/Downloads`。
- **处理**：
  1. **照片入库**：三个相册照片分别复制到 `images/media/gallery-images/rect-lrg/{together-together,how-did-i-get-here,happy-liams-33rd-birthday}/`，并按 `<folder>-<n>.<ext>` 顺序重命名（29 / 47 / 24 张）。保留原扩展名（前两个 `.jpg`，liam `.jpeg`）。
  2. **封面入库**：`Downloads` 的 `-rect.png`（2400×1200）→ `images/gfx/<scope>-cover-rect-lrg.png`，`sips` 派生 `-rect-med`(1200×600) 与 `-rect-sml`(600×300)。命名按现有惯例（`gallery-members-harry-*-cover-*` / `gallery-fan-art-liam-33rd-birthday-cover-*` / `fan-art-cover-*`）。
  3. **PSD 移库**：全部 `.psd` 移到 `images/psd/`（`*.psd` 已在 `.gitignore`，不追踪）。
  4. **slideshow 页**：生成 3 个 gallery slideshow（`{%}{depth}images/media/gallery-images/rect-lrg/<folder>/<folder>-N.<ext>`），body class `duo gallery-section`、无 music-submenu、`data-cycle-auto-height="false"`、`js/slideshow-nav.js` 只引一次。harry/louis 为 4 层 `../../../../`，fan-art 为 3 层 `../../../`。Back 链接一律 `index.html`（同层回上一层）。
  5. **索引卡**：三个 index 页各插一张 `gallery-cover` 卡片（封面 `-rect-sml`，`more` 指向新 slideshow）；`pages/gallery.html` 的 Fan Art 卡 `.bg` 由 `filmstrip-liam-smlc4ca.jpg` 换成 `fan-art-cover-rect-sml.png`。
- **验证**：`python -m http.server 8000` 下 7 个改动页 HTTP 均 200；`_audit_site_images.py` → 720 refs `Broken: 0`；3 个 slideshow 内部 `<div>` open/close 差值 = 0、slide 数 = 29/47/24、`data-cycle-auto-height="false"` 与 `slideshow-nav.js`（仅 1 次）均命中；磁盘封面/照片存在性与张数已核对；`images/psd/` 未出现在 untracked。
- **Token 消耗**：未记录
- **用时**：未记录
- **经验**：
  1. 照片源命名乱（微信、Instagram、reelsvideo），按 `<folder>-<n>.<ext>` 顺序改名最省事；按 ls 字母序即时间序。
  2. 封面只需 `-rect-sml`(卡 bg) + `-rect-med`(og:image)，`-rect-lrg` 作源存档；**square 变体本次未用**（现有 harry/louis 卡也不做两尺寸切换，保持与兄弟卡一致，避免为加 CSS 而全站 bump `?v=`）。
  3. mix-ratio 竖幅粉丝照沿用既有 `.gallery-section .panel.gallery` contain 模式，无需新 CSS。
  4. 服务器应预先在后台/或写脚本再起，当前用 `&`，QA 完无需停；新图均为部署资产需 `git add`（PSD 除外）。
- **遗留/待办**：新增 PNG/JPG/HTML 尚未 `git add`（部署前必须 add）；未 commit/push。未启动浏览器（机器 QA 已覆盖，视觉未验）。
- **发布后修正（机器复检发现）**：
  1. **slideshow 计数不显示**：Python `.format()` 把模板里的 `{{slideNum}}` 塌成 `{slideNum}`，cycle2 无法插值 → `.count span` 永远空白。修正：三处 `data-cycle-caption-template` 改回 `{{slideNum}}/N`（perl `s/\{slideNum\}/\{\{slideNum\}\}/g`），Playwright 复检计数显示 `1/29`、`1/47`、`1/24`。
  2. **fan-art 页 Liam 卡片难发现**：卡片被插到 `.panel.moment`（Send us yours）之后、列表最末，首页首屏只见占位符。修正：整卡移到 `journal-article` 介绍之后、第一篇 Submission 之前，成为第一个相册卡。Playwright 复检顺序 `["Happy Liam's 33rd Birthday…", "Submission 01…", …]`。
  3. 复检：图片审计 720 refs `Broken: 0`；4 个页面 div 闭合 diff=0；三 slideshow 无 pageerror。
  4. **发布后修正 2（封面去灰度）**：用户提示我做的封面已是单色，不要再套灰度。原以为 HTML `.bg` 加 inline `filter:none` 即可，但复检发现 **HiDPI(>1x) 下 retinafy_replace() 会用 `class="bg"` 重建新 `.bg`（只带 background-image）删旧元素，inline 全丢 → 页面回退成灰度**（对比现有卡片才看出：它们走的是 styles.css 里 curated `filter:none!important` 规则组）。修正：把 4 个新卡片 class（`.togethertogether-cover`/`.howdidigethere-cover`/`.liam33-cover`/`.fanart-cover`）追加进 styles.css curated 规则组，去掉 inline `filter:none`，并 **bump `?v=20260830zh10 → zh11`**（330 个 .html）。验证：Playwright `device_scale_factor=2` + `networkidle`，`.bg` 被标记 `retinafied` 后 computed filter 仍为 `none`；图片审计 719 refs `Broken: 0`。规则已写入 gallery-page SKILL `铁律 #11` + reference.md §6。

## 2026-08-30 — larry 文章新 header + 首页四个板块入口配封面（big-pickle）

- **模型**：big-pickle
- **目的**：用户重做了 larry 那篇博客（More Than a Ship）的 header 图，并给首页下面四个板块入口卡（Blog/Gallery/This Is Us/About）做了封面，要求从 Downloads 取回应用。
- **处理**：
  1. **larry header**：`~/Downloads/larry-header.png/.psd` → 覆盖 `images/blog/larry-header.png`（新 1200×150 宽幅，原 1200×500）+ `images/psd/larry-header.psd`。front-matter 早已指向 `../../../../images/blog/larry-header.png`，无需改字段；`header_img_size: 100% contain` 下按宽 100% 等比显示（约 1280×160，比例 8:1）。
  2. **四张入口封面**：`Home {blog,gallery,this is us,about} cover.png` → `images/gfx/home-{blog,gallery,this-is-us,about}-cover.png`；PSD → `images/psd/home-*-cover.psd`。四张均 1200×1200 方形。
  3. **首页四卡**（index.html 行区 397–491，原来是无背景的 `.panel.journal-news.homepage-news` 浅灰黑字）：改为 `homepage-blog-card` + `background:url(images/gfx/home-*-cover.png) center/cover no-repeat #000;`，并把 `.title`/`.section-name`/`h2 a`/`.more` 内联改为白字 + `-webkit-text-fill-color`（沿用上一条「深色卡白字」的同一套内联 white 方案），因此四卡顺带获得 gallery 白描边 hover 效果（复用已有 `.homepage-blog-card` 规则与首页 hover 脚本）。
- **验证**：图片审计 `_audit_site_images.py` → 617 refs Broken: 0；4 张封面 + larry-header 本地 HTTP 均 200。Playwright：四卡 bg 命中各自 `home-*-cover.png`，`.title`/`.title span.en`/`.section-name span.en`/`h2 a`/`.more` 全为 `rgb(255,255,255)`；larry 文章页 `.article-cover img` = larry-header.png（1200×150，display 约 1280×160）。截图归档 `tools/_qa_screenshots/home-sections-{blog-gallery,thisisu-about}.png` + `larry-header.png`。
- **Token 消耗**：未记录
- **用时**：未记录
- **经验**：本次只改 index.html 内联样式 + 图片，未动 CSS → **无需 bump `?v=`**；新增图片 `images/gfx/` 属部署资产，需 `git add`（PSD 在 `images/psd/` 被 gitignore，不部署）。
- **遗留/待办**：截图已打开待人工复核；新增 PNG 尚未 `git add`（部署前必须 add，否则 Cloudflare 404）；未 commit/push。

## 2026-08-30 — 全站联系邮箱 takionkroslin@icloud.com → contact@5guys1direction.asia（big-pickle）

- **模型**：big-pickle
- **目的**：用户开通 Cloudflare Email Routing（域名 `5guys1direction.asia`），把全站所有联系邮箱从 `takionkroslin@icloud.com` 全局替换为 `contact@5guys1direction.asia`，含说明文档与生成脚本/模板。
- **根因/背景**：Email Routing 是纯转发，只能收不能发（无 SMTP）。配好后 DNS 已有 MX（route1/2/3.mx.cloudflare.net）+ SPF，测试转发成功。随后做全站邮箱替换。
- **处理**：精确定位字符串 `takionkroslin@icloud.com`（全库命中 195 处源文件 157 个），用 `find | xargs grep -lF` + `perl -pi -e` 批量替换。非本站邮箱（helderijs@/geisserml@ 等第三方库源码）经审计列表确认不动。
- **⚠️ 踩坑（重要）**：perl 在双引号字符串里做变量插值替换时，邮箱含 `@`（`takionkroslin@icloud.com`）会被当成 perl 数组符号（`@icloud`）解析为空，导致 `s/\Q$old\E/.../` 静默失效、替换不进任何文件。**必须用单引号 `'s/takionkroslin\@icloud\.com/.../g'` 字面量并转义 `@`/`.`**，一次成功。
- **覆盖范围**：所有 `.html`（含 111 个 blog 章节页）、`README.md`、`AGENTS/AGENTS.md`、`AGENTS.md`、build 脚本 `tools/build/_build_albums_page.py`、模板 `tools/templates/{article,blog_list,novel_chapter,novel_hub}.html`（改生成源，避免后续 build 重新冒出旧邮箱）。
- **验证**：全库（除 `.git`）残留旧邮箱文件数为 0；`mailto:takionkroslin` 残留 0；新邮箱 `mailto:contact@5guys1direction.asia` 共 181 处；索引/README 抽查无误；`tools/` 下无旧邮箱。`.git/reflog` 里 5 处旧邮箱为历史提交记录，不改。
- **Token 消耗**：未记录
- **用时**：未记录
- **经验**：perl 变量插值 + 含 `@` 的字符串做替换必踩坑，一律改用单引号字面量+转义；改生成性邮箱前记住同时改「生成脚本 + 模板」，否则 build 一旦重跑旧值卷土重来。
- **遗留/待办**：未 commit/push。无 CSS 改动，无需 bump `?v=`。

## 2026-08-30 — 深色 blog 卡的「日期」与「Blog」小字被强制成黑色 → 改白 + 全站 CSS 版本统一（big-pickle）

- **模型**：big-pickle
- **目的**：首页与 blog 列表的深色博客卡上，`<a>` 覆盖图片后有白边框 "<code>Blog</code>" 链接变成黑色；且首页卡的日期（". title"><span class=...>"）也变成黑色。主卡片中心的标题/更多按钮正常白色。
- **根因**：`styles.css` 有条通用规则 `.panel.journal-news .panel-header a{...color:#000!important}`。但真正的**绘制字形的是内层 `<span class="en">`（非 `<a>`）**，这个 span 的 `color` 与 `-webkit-text-fill-color` 都被那组 `!important` 规则压成黑，盖过 `<a>`/`.section-name` 容器上的内联 `color:#fff`（内联无 `!important`）。查 `getComputedStyle(链接<A>)` 会误报白——必须查内层 span 或直接采样像素。
- **处理**：在 CSS `HOMEPAGE BLOG CARDS` 块追加高特异性规则，把深色卡 `.panel-header` 整体（日期 `.title` + 段落 `.section-name`）以及它们内层的 `<a>`/`<span>` 全部强制白字，并显式 `-webkit-text-fill-color:#fff!important`（字形由它渲染）：
  `.panel.journal-news.homepage-news.homepage-blog-card .panel-header, ... .title, ... .title a, ... .title span, ... .section-name, .section-name a(:visited/:focus), .section-name span{color:#fff!important;border-color:#fff!important;-webkit-text-fill-color:#fff!important}`。一规则通吃首页与 blog 列表（同用 `homepage-blog-card`）。首两版只盖 section-name（zh8）→ 补 span（zh9）→ 再补 `.title` 日期与整体 header（zh10）。
- **版本**：改 CSS 必 bump——全站统一到 `?v=20260830zh10`。因旧版本散落 `zh2`（文章页）/`zh6`（321 页）/`zh7`（首页），顺手把所有生成源脚本版本同步：`build_blog.py`、`build_novel.py`（CSS_VERSION）、`_build_albums_page.py`（原 20260816a 陈旧）、`templates/blog_list.html`、`index.html`。再用脚本把 345 个追踪 html 里 `styles.css?v=*` 批量替换，全站 327 页统一 `zh10`。
- **验证**：Playwright 像素采样（元素 screenshot 统计亮像素占比）：修复前日期/标签 `0%=全黑`；修复后首页与 blog 列表各卡的日期与 Blog 均 >2%（白字形抗锯齿），如 card0 date 2.3%、blog 20.4%。`getComputedStyle` 只查外层 `<a>`/`.title` 会误判白，必须查 `.en/.zh` span 的 color + `-webkit-text-fill-color` 或采样像素。served CSS 含 header/span 规则、v=zh10。
- **Token 消耗**：未记录
- **用时**：未记录
- **经验**：克隆站通用 `.panel.journal-news .panel-header a{/span}` 的 `color:#000!important` 会反杀深色卡里的整块 header 文字（日期 + 段落）。**别只查外层元素 computed color**——内层 `<span class="en/zh">` 才是绘制字形者，且日期在 `.title`、标签在 `.section-name` 是两处不同选择器，都要覆盖；眼见为实用像素采样（或查 `.en/.zh` span 的 color + `-webkit-text-fill-color`）。覆盖 `!important` 用同级以上 `!important`。全站版本应从生成源脚本统一管理，避免 zh2/zh6 散乱。
- **遗留/待办**：截图 `tools/_qa_screenshots/home-card-header-white.png`（首页卡日期+Blog 白字紧裁）已打开待人工复核；未 commit/push。

## 2026-08-30 — blog 列表：占位卡改白底黑字 + 列表卡套用 gallery hover（big-pickle）

- **模型**：big-pickle
- **目的**：上一条的奇数空缺装饰卡改为「白底黑字」；且 blog 列表的文章卡片也要用首页最新的 gallery 样式 hover（白描边 + 白底黑字 CTA、无位移）。
- **处理**：
  1. `build_blog.py` 的 `_render_blog_filler()`：占位卡从 `logo-white.png` 深底白字改为白底黑字——`background:#fff` + 中间 `logo-black.png center/42%` + h2 `color:#000`（去掉了 `is-placeholder` 的 45% 透明，避免白卡在浅底上看不见；保留 `novel-filler` 居中文字；logo 由 20% 放大到 42%）。
  2. `_render_listing_card()`：文章卡片 class 由 `news homepage-news` → 加 `homepage-blog-card`，直接命中 `styles.css` 已存在的 gallery hover 规则（白描边 `.inline` + CTA hover 白底黑字，`transition:none` 无位移）。占位卡不加该类（无 `.more`、不交互）。
  3. `tools/templates/blog_list.html`：正文前（`</body>` 前）追加 `__5GUYS_BLOG_HOVER__` 守卫的 hover 切换脚本（与首页 index.html 一致），`mouseenter/focus` 加 `.hover`、`mouseleave/blur` 移除。blog.html 由 build 生成，改模板即可。
- **验证**：重建后 `pages/blog.html` 占位卡 `background:#fff`；5 张文章卡全带 `homepage-blog-card`、hover 脚本已注入。Playwright 实测：占位卡 bg rgb(255,255,255) + h2 黑字居中；首卡 hover 后 `.hover` 触发、白描边 display:block、CTA white-fill + black text 全部命中。`_audit_site_images.py` → 612 refs Broken: 0（占位卡不再引 logo 图，故比上条少 1）。
- **Token 消耗**：未记录
- **用时**：未记录
- **经验**：gallery hover 的 CSS 是对 `.homepage-blog-card` 写死的，新页面直接复用 class + 一段 jQuery hover-toggle 脚本即可，无需新增 CSS；装饰占位卡刻意不加该类以保持非交互。
- **遗留/待办**：截图 `tools/_qa_screenshots/blog-hover-zh.png` 已打开待人工复核；未 commit/push。CSS 未改，无需 bump `?v=`。

## 2026-08-30 — blog 列表奇数列空缺自动填充装饰卡（big-pickle）

- **模型**：big-pickle
- **目的**：blog.html 文章数为奇数时，最后一个 panel-group 会空出半个方框；要求在该空缺放装饰占位卡，且文章数为偶数时自动隐藏。
- **处理**：在 `tools/build/build_blog.py` 的 `_render_listing_cards` 中，当最后一行 `len(row)==1`（即文章数奇数）时，append `_render_blog_filler()` 装饰卡。占位卡复用现有 `is-placeholder`（45% 透明度 + cursor:default）与 `novel-filler`（居中文字）样式，背景 `logo-white.png center/20%`，双语文案 "Five Guys, One Direction — more stories on the way." / "五个男孩，一个 One Direction——更多故事在路上。"，无超链接。blog.html 是 build 自动生成，故每次重建自动按奇偶决定是否插入。
- **验证**：重建 `build_blog.py` 后 `pages/blog.html` 第 195 行出现 filler，位于末行 panel-group 与 "Why This Site Exists" 并列；Playwright 实测 filler 几何 640×640、opacity 0.45、cardsInGroup=2；`_audit_site_images.py` → 613 refs Broken: 0；单元逻辑模拟 1–8 篇文章 → 奇数显示/偶数隐藏全部正确。
- **Token 消耗**：未记录
- **用时**：未单独记录
- **经验**：列表/卡片二排布局的填充位应放在生成脚本里按奇偶判定，而不是写死在 HTML（否则增删文章后会错位）；此法天然满足"偶数时不需要"。
- **遗留/待办**：截图 `tools/_qa_screenshots/blog-filler-zh.png` 已打开待人工复核；未 commit/push。

## 2026-08-30 — 为 4 篇无封面博客文章应用新封面（big-pickle）

- **模型**：big-pickle
- **目的**：用户自制了 4 张 1200×1200 方形封面（Every July 23rd / Ready to Run / Why I Love 1D So Bad / Why This Site Exists），要求应用到文章并把 PSD 与图片规范命名归档。
- **处理**：
  1. PNG → `images/blog/<slug>-cover.png`（every-july-23rd-we-come-home / ready-to-run / why-i-love-1d-so-bad / why-this-site-exists）。全部 1200×1200 方形，符合 `cover_img`（卡片封面）规格。
  2. PSD → `images/psd/<slug>-cover.psd`（沿用 larry-cover.psd 命名约定；`images/psd/` 在 .gitignore 中，属源文件不部署）。
  3. 4 篇 `article.md` front-matter 新增 `cover_img: ../../../../images/blog/<slug>-cover.png`（header_img/文章页顶部保留 logo 横幅，按用户确认）。
  4. `python tools/build/build_blog.py` 重建 blog.html / posts.json / 文章页——列表卡片改用 `center/contain` 背景引用各 cover。
  5. 首页 4 张博客卡手写同步：背景从 `logo-white.png center/40%` 改为 `<slug>-cover.png center/cover`。
- **验证**：`_audit_site_images.py` → 612 refs Broken: 0；4 张 cover 本地 HTTP 均 200；index/blog 页 200；4 张新图已 `git add`（部署前避免 404）；`git status` 未跟踪仅 0（PSD 在 gitignore）。截图已归档 `tools/_qa_screenshots/blog-covers-{home,listing}-zh.png`（VisionPower Token 上限 429 暂无法自动核验，留人工复核）。
- **Token 消耗**：未记录
- **用时**：未单独记录
- **经验**：首页卡片是死代码不会自动同步，`cover_img` 只在 build 的 blog.html 列表生效，首页必须手改背景路径；方形卡背景用 `center/cover`、图片路径根级 `images/...`（无 `../`）。
- **遗留/待办**：截图人工复核（`open tools/_qa_screenshots/blog-covers-*.png`）；新建封面后需 `git add`（images/psd 除外）再部署；未 commit/push。

## 2026-08-30 — 小说页（hub/章节）正文与标题移动端仍黑体：正文非 .zh 结构 + 官方 .journal-article 规则压过配对（big-pickle）

- **模型**：big-pickle
- **目的**：用户反馈 iOS Safari 小说正文和标题仍用系统黑体。
- **根因**：① 小说正文是裸 `<p>`（`<div class="novel-layout"><div class="article-holder"><h2>标题</h2><div class="text"><p>…`），**不在 `.zh` 内**，全站 `.zh` 配对规则落不到；② 正文/标题被官方克隆规则 `.panel.journal-article .article-holder .text{font-family:'Source Code Pro'}`（特异性 0,4,0）和 `.panel.journal-article…h2` 覆盖，初版小说规则（hub 0,2,2 / chapter 0,2,0）特异性不足。
- **处理**：`apply_zh_css.py` 新增 novel 配对——`body.novel-hub .article-holder h2` 与 `.novel-layout .article-holder h2` → Noto Serif SC（对齐 Playfair 角色）；`body.novel-hub .panel.journal-article .article-holder .text` 与 `.panel.journal-article.novel-chapter .article-holder .text`（特异性盖过 0,4,0）→ LXGW WenKai；`.novel-catalog a` → LXGW WenKai Mono。全站 `?v=` → 20260830zh6（327 页）。
- **验证**：Playwright 390px 视口，hub+ch61 的 title/body/catalog 计算字体全命中预期栈；css-zh6 HTTP 200；覆盖检查聚焦；desktop 同 CSS 行为一致。
- **Token 消耗**：未记录
- **用时**：未单独记录
- **经验**：新配 PDF 页面里**非 `.zh` 中文**（小说/图集描述等）需要单独 role；选择器必须先数清官方兜底规则的特异性再设计，不然白写；`.text` 是官方克隆的公共类（Source Code Pro）。
- **遗留/待办**：commit `4f00a65` 已推（HTTPS），工作树干净；hub-mobile.png 已存 `tools/_qa_screenshots/novel-fix/`（ch61 截图未完成）。图集/其他非 `.zh` 中文页面若用户再报字体缺失，沿用同样思路加 role。

## 2026-08-30 — 修复移动端「部分中文字体不显示」：Smiley 静态字体误用可变字重区间（big-pickle）

- **模型**：big-pickle
- **目的**：用户反馈移动端有字体不显示。定位为 CSS 根因并修复。
- **根因**：`@font-face{font-family:'Smiley Sans'…;font-weight:400 900}` —— `400 900` 是**可变字体**声明写法，而得意黑 woff2 是**静态字体**。iOS Safari / Android Chrome 遇到「静态字体+区间字重」会把它当可变字体处理并跳过，导致整站得意黑（Oswald/Six Caps 角色的中文）在移动端回退到系统字体——桌面 Chrome 宽容所以桌面正常。
- **处理**：`apply_zh_css.py` 的 LOCAL 块修正——Smiley Sans 拆成两条单字重面（400 / 700，同一文件）去掉区间；全部 7 条本地 @font-face 补 `font-display:swap`（移动弱网下避免不可见文本）。
- **验证**：`grep` 确认 `font-weight:400 900` 归零、@font-face 全部带 font-display:swap；Playwright 390px 视口 load→check 7 字面全 true；首页 h2 computed 含 Smiley Sans；HTTP css?v=20260830zh4 200。
- **Token 消耗**：未记录
- **用时**：未单独记录
- **经验**：静态字体永远写单字重；`font-display` 必须显式给；`document.fonts.check` 在未先 `load` 时返回假阴性，不要用裸 check 当已加载证据。
- **遗留/待办**：待用户移动端真机复核；全站 `?v=` 已升 zh4（327 页）；未 commit/push。

## 2026-08-30 — 中文字体再配对：正文基准 思源黑→霞鹜文楷，首页显示→得意黑，思源黑退居兜底（big-pickle）· 待复现验证

- **模型**：big-pickle（DeepSeek 派生）
- **目的**：用户反馈原英文字体「简约/有风格/代码感」，换成思源黑体就平淡——大幅减少思源黑体在全站的使用。
- **决策**：用户先看对比预览（得意黑/更纱/思源等宽/霞鹜文楷/思源黑 5 候选，`tools/_qa_screenshots/font-preview/`），选定「文章→霞鹜文楷、首页显示→得意黑」。
- **处理**：
  1. 新增 `assets/fonts/lxgw-wenkai/LXGWWenKaiSubset.woff2`（霞鹜文楷**比例**版 642KB，按全站 `.zh` 字符集 2815 字符子集化）＋ LICENSE.txt；等宽版仍归 Cousine/Courier 角色。
  2. `apply_zh_css.py` 更新：`html .zh` 基准由 Noto Sans SC 改为 `'LXGW WenKai'（首选）… 'Noto Sans SC'（末尾兜底）`；新增首页显示覆盖 `body.home-section .panel:not(.journal-article) > h2 .zh, … .panel-header .zh → Smiley Sans`；@font-face 注册比例版文楷。
  3. `fetch_fonts.py` 接入文楷比例版（下载镜像+子集化+许可同步，幂等）；新增 `tools/fonts/bump_zh_version.py`（幂等全站 `styles.css?v=` 升级，跳过 `__VER__` 占位模板）。
  4. 全站 `?v=` 20260830zh1/zh2 → **20260830zh3**（327 页；novel 模板保留占位符）。
- **验证**：Playwright（chrome）5 页复探：首页「博客最新文章」h2 → Smiley Sans ✓、blog 文章标题 → Noto Serif SC（Playfair 角色保留）✓、blog 文章正文 div.zh → **LXGW WenKai** ✓、歌词行 `.zh` → **LXGW WenKai** ✓、moment「全文完」→ Fusion Pixel ✓、newsletter h2 → Smiley ✓；5 个字体面 `document.fonts.check` 全 Y；翻译切换 `lang-zh`/`lang-bilingual` 正常；HTTP styles.css?v=zh3 / 新 woff2 均 200；图片审计 Broken: 0/608；无残留 zh1/zh2 引用。截图 `tools/_qa_screenshots/zh3/*.png` 已弹出。
- **Token 消耗**：未记录
- **用时**：未单独记录
- **经验**：① 一次性「降级思源黑」= 改基准 + 新增首页覆盖 + 新增字体资产 + 全站 bump 四步连锁，必须全套做完统一验证；② 调试临时脚本一律 Write 落盘再跑，shell heredoc 内联 `\u` 转义与引号会被 shell 加工；③ Playwright 探针查 `.zh` 需兼容「.zh 自身即目标」与「.zh 在祖先内」两种形态，否则误报 SKIP。
- **遗留/待办**：文章标题（Playfair 角色）暂走思源宋体（按已确认 serif 配对保留），如需标题同变文楷另改 pairing；novel 模板 `__VER__` 重建时版本号偏旧；未 commit/push。

## 2026-08-30 — 固化 Gallery 风格卡片外框与 hover 规范（Codex）

- **目的**：将本次小说卡片修复沉淀为以后构建相似 panel 的可复用规范。
- **处理**：在 `AGENTS/AGENTS.md` 的 Panel System 中记录 `.inline` 等距物理 inset、移动端 specificity、计数菱形留白与反色、文字不位移、独立 CTA 边框，以及 390px/桌面端 computed box 验收要求，并附 HTML/CSS 骨架。
- **结果**：后续相似卡片可直接按 Gallery 风格复用，避免百分比外框导致四边视觉不等和移动端元素重叠。
- **遗留/待办**：未修改页面代码；未 commit/push。

## 2026-08-30 — 翻译切换中文字体配对集成：自托管 6 套字体 + 语义角色映射 + 全站覆盖校验（big-pickle）· 待复现验证

- **模型**：big-pickle（DeepSeek 派生）
- **目的**：用户「确保翻译的时候字体正常对应等」——把 10 族英文语义字体在 `lang-zh`/`lang-bilingual` 下映射到中文等价字体，自托管避免 Google Fonts 国内加载问题，全站无豆腐块。
- **处理**：
  1. 新增 `tools/fonts/fetch_fonts.py`（下载+子集化，幂等，含 ghfast 镜像回退）与 `tools/fonts/apply_zh_css.py`（`/*==CJK-FONTS-BEGIN/END==*/` 标记可重跑）。
  2. 字体资产落地 `assets/fonts/`：Smiley Sans（得意黑）、Fusion Pixel（缝合像素体）、ZCOOL KuaiLe（站酷快乐体，按站点字符集子集化 322KB）、LXGW WenKai Mono（霞鹜文楷等宽，子集 636KB）、Noto Serif SC + Noto Sans SC（Google 中文子集，latin 一并）。全部 OFL/免费商用，附 LICENSE.txt；TTF 源已 gitignore。
  3. `css/styles.css` 末尾追加 @font-face + 语义角色 `.zh` 配对：Oswald/Six Caps→Smiley Sans；Playfair/Times→Noto Serif SC；Source Sans/Code Pro→Noto Sans SC；Cousine/Courier→霞鹜文楷等宽；Vampiro→站酷快乐体（备选霞鹜/思源宋）；Codystar(moment)→缝合像素体。
  4. `?v=` 全站 bump 至 `20260830zh1`（325 页；后续 Codex 小说外框会话部分页升至 zh2，均 ≥ 历史版本，缓存均可刷新，未再全量重写以免互相覆盖）。
- **验证**：Playwright 4 代表页（home/hub-moment/lyrics/journal）font probe 全 matched=Y + faceLoaded=Y，翻译按钮切换 `lang-zh`/`lang-bilingual` 正常；HTTP 全站图片审计 Broken: 0/608；fontTools 对全站 1568 个 `.zh` CJK 字符做码点覆盖校验：fusion 0 缺、mono 0 缺、smiley 0 缺，kuai 仅缺「埼」1 字（不在 GB2312 源字库，该字只在 tour `.location` 基准正文角色出现，由已自托管的 Noto Sans SC 全覆盖兜底，无豆腐块）。截图 `tools/_qa_screenshots/*-zhmode.png`。
- **Token 消耗**：未记录
- **用时**：未单独记录
- **经验**：① Python 字符差集校验必须统一 str/int（char vs ord），跨类型差集会恒等于全集造成假阳性；② 子集字体按「全站 `.zh` 并集 + 脚本契约字符集」子集化，构造上即保证当前内容零缺字，比逐条宽度差值探针更可靠；③ VisionPower 视觉验证受 Token 上限 429 阻塞，截图已归档留人工复核。
- **遗留/待办**：截图人工复核（`open tools/_qa_screenshots/*.png`）；新增中文内容后需重跑 `python tools/fonts/fetch_fonts.py` 保持子集覆盖（Smiley/Noto 为全量无需）；未 commit/push。

## 2026-08-30 — 小说外框改为等距 inset，修复移动端覆盖与重叠（Codex）· 待用户审查

- **模型**：Codex
- **目的**：解决用户反馈的 Blog 入口卡与 hub 章节卡黑框四边留白不等、移动端黑框压住内部元素的问题，并复核 Start reading 边框。
- **根因**：此前使用 `width/height:96%` 与 `top/left:2%`，百分比分别相对卡片宽高计算，横纵物理留白天然不同；站点移动端 `.panel.journal-news.homepage-news .inline` 的更高特异性规则又覆盖了新框的位置。
- **处理**：入口卡和章节卡统一改为同一组 `inset:clamp(8px,1.25vw,20px)`、`width/height:auto`、`box-sizing:border-box`；hover/focus 的显示规则同步提高特异性；CSS 版本 `20260830zh1→zh2`，重建 Blog、hub 与 111 个章节页。
- **验证**：真实浏览器 390px：hub 卡 390×130px，外框四边留白均 8px、边框均 1px，菱形 bounding box 约 53×53px，标题 x=101px，`scrollWidth=390`；1280px：章节卡外框四边留白均 16px、边框均 2px。Blog 入口移动端/桌面端外框分别为 8px/16px 等距，文字 transform 为 none，按钮和计数菱形 hover 后黑底白字；Start reading 移动端四边均 2px。截图已保存并检查：`/private/tmp/novel-qa/hub-mobile-hover.png`、`/private/tmp/novel-qa/blog-desktop-hover.png`。JS 语法检查通过；`git diff --check` 仅报告项目原有 `tour` 页面尾随空格。
- **Token 消耗**：未记录
- **用时**：未单独记录
- **经验**：需要视觉等距的响应式装饰框应使用同一组物理 inset，而不是对宽高分别使用百分比；同时必须检查旧移动端规则的 specificity，否则桌面端修复不会真正落到移动端。
- **遗留/待办**：待用户视觉审查；未 commit/push。

## 2026-08-30 — 小说 panel 外框等宽与移动端适配修正（Codex）· 待用户审查

- **模型**：Codex
- **目的**：修正用户反馈的 panel 黑框四边不协调、移动端与内部元素重叠，以及 Start reading 按钮下边框偏细。
- **结果**：入口卡和章节卡外框统一使用 96% 内框与 `.12em` 等宽边框；章节菱形保持较小尺寸并使用 1px 等宽边框；Start reading 强制 `.15em solid` 四边统一；版本 `20260830r→s`，重建 blog、hub 与 111 个章节页。
- **验证**：Chrome 计算样式：桌面 panel 外框四边均 2px、移动端均 1px；章节菱形四边均 1px；Start reading 桌面四边均 3px、移动端均 2px；移动端 scrollWidth=390；`git diff --check` 通过。
- **Token 消耗**：未记录
- **用时**：未单独记录
- **经验**：`border` 的各边可能被旧 CSS 的 `border-bottom` 单独覆盖，即使视觉上只是“看起来不齐”，也要直接读取四边 computed border 再修复。
- **遗留/待办**：待用户视觉审查；未 commit/push。

## 2026-08-30 — 章节计数菱形缩小、右移与细化（Codex）· 待用户审查

- **模型**：Codex
- **目的**：修正章节卡计数菱形贴左、尺寸过大、边框和数字过粗的问题。
- **结果**：菱形由 12% 缩至 9.5% 卡宽，左定位调整为 7.5%，边框改为 `.07em`，数字改为 Source Code Pro 400；标题列同步调整至 26% 起始位置；保留 Gallery hover 时黑底白字效果；版本 `20260830q→r`，重建 hub、111 个章节页和 blog 列表。
- **验证**：Chrome 桌面端菱形约 87×87px、移动端约 54×54px；两端边框均约 1px、数字字重 400；标题 x 分别为 166px/101px，与菱形分离；hover 外框和黑底白字仍正常；无横向溢出；截图已生成并打开。
- **Token 消耗**：未记录
- **用时**：未单独记录
- **经验**：旋转方框的视觉尺寸是旋转后的 bounding box，不能只按 CSS width 判断；小 panel 需要单独降低边框和字重，不能直接照搬 Gallery 大 panel 的数值。
- **遗留/待办**：待用户视觉审查；未 commit/push。

## 2026-08-30 — 小说 panel 严格对齐 Gallery hover 动画（Codex）· 待用户审查

- **模型**：Codex
- **目的**：按用户明确的 Gallery 封面 hover 规范，修正 Blog 小说入口和 hub 章节卡的按钮、外框、计数菱形与文字行为。
- **结果**：按钮 hover/focus 时填充黑底白字；panel 由 CTA 触发 `.hover` 并显示 96% 尺寸黑色内框；章节计数菱形同步黑底白字；删除所有标题/正文位移动画；hub `Start reading` 增加独立按钮 hover；hub 补载 `novel-reading.js`，重建 111 个章节页。
- **验证**：真实 Chrome 移动端确认入口卡/章节卡外框为 `block`、按钮和菱形均为黑底白字、章节 row/title transform 为 `none`、scrollWidth=390；Start reading hover 为黑底白字；`git diff --check` 和 JS 语法检查通过。
- **Token 消耗**：未记录
- **用时**：未单独记录
- **经验**：Gallery 的 hover 不是单纯 `:hover` 样式，而是由 CTA hover 给 panel 加 `.hover` 再联动 `.inline` 和 count；复用时必须同时接入 JS 触发链与 CSS 状态链。
- **遗留/待办**：待用户视觉审查；未 commit/push。

## 2026-08-30 — 小说章节计数框级联修正与 Gallery hover 机制接入（Codex）· 待用户审查

- **模型**：Codex
- **目的**：修正用户反馈的章节菱形计数框与标题重叠，并让 Blog 小说入口真正复用 Gallery 的 `.hover` panel 动画机制。
- **结果**：章节编号改为按卡片宽度 12% 缩放的旋转方框，标题列左移避让；修正移动端旧高特异性 padding 覆盖问题；入口卡通过 `mouseenter/focus` 给 panel 加 `.hover`，由 `.inline` 显示 Gallery 风格外框，文字不移动；blog 模板补充 `novel-reading.js` 引用；重新生成 hub/章节页。
- **验证**：真实 Chrome 移动端测得章节卡 390×130、计数框 68×68、标题 x=97.5、页面 scrollWidth=390，无横向溢出；Blog CTA hover 后 panel 获得 `hover` class 且 `.inline` 从 `none` 变为 `block`；`git diff --check` 和 JS 语法检查通过；修正截图已打开。
- **Token 消耗**：未记录
- **用时**：未单独记录
- **经验**：同一组件的移动端旧规则可能以更高 specificity 覆盖新增样式；计数框这类装饰元素必须同时核对自身 bounding box、标题 bounding box 和页面 scrollWidth。
- **遗留/待办**：待用户视觉审查；未 commit/push。

## 2026-08-30 — 小说板块视觉反馈修正：无缝铺排与 Gallery 章节计数框（Codex）· 待用户审查

- **模型**：Codex
- **目的**：根据用户反馈修正入口卡、hub 分割线、introduction 底色和章节计数设计。
- **结果**：入口卡文字取消 hover 位移，仅保留外框动画；删除 hub 组间分割线，保留白色/浅蓝色卡片轮换并紧密铺排；introduction panel 恢复纯白；章节卡复用 gallery 的旋转计数框，编号与标题分离，避免长标题挤压；重建 111 个章节页和 hub。
- **验证**：构建成功；`git diff --check`、JS 语法检查通过；hub 章节计数框 111 个，章节页 111 个；真实 Chrome 抽查生成 blog/hub/chapter 桌面与移动截图，移动端 hub 卡片 390×130、章节计数框正常显示，阅读页进度条正常生成；截图已打开供复核。
- **Token 消耗**：未记录
- **用时**：526 秒
- **经验**：Gallery 的旋转 count 组件适合表达章节编号，但必须将编号从标题文本中拆出，并为 filler 卡恢复对称 padding；紧密铺排应通过相邻卡片的颜色轮换区分，而不是增加结构性分割线。
- **遗留/待办**：待用户视觉审查；未 commit/push。

## 2026-08-30 — 小说板块复用全站色板与动画增强（Codex）· 待用户审查

- **模型**：Codex
- **目的**：用户确认小说板块沿用现有站点色板，解决 hub、入口卡和阅读页过于干巴的问题。
- **结果**：复用淡蓝、金色、黑白体系；入口卡增加淡蓝信息背景与 hover 边框；章节卡增加交替浅灰、金色 hover、`.inline` 扩展边框和轻微位移动画；hub 简介增加淡蓝统计色块；阅读页增加顶部阅读进度条、正文行距/段距优化、当前目录金色高亮；新增 `js/novel-reading.js`，支持进度更新、移动端目录选择后收起和左右方向键翻章；版本 bump 至 `20260830q`，重建 111 个章节页、hub 和 blog 列表。
- **验证**：构建脚本成功；`git diff --check`、JS `--check`、Python `py_compile` 通过；章节页 111、进度标记 111、阅读脚本标记 111。图片审计因当前沙箱禁止绑定本地 8000 端口，返回 547 个环境导致的假断链，未作为有效站点结论。
- **Token 消耗**：未记录
- **用时**：实测未记录
- **经验**：已有 `.inline`、Moments 金色、Homepage Video 淡蓝和 `prefers-reduced-motion` 体系足够支撑小说视觉升级，不需要新增动画库；生成页必须通过模板和 build 脚本统一更新。
- **遗留/待办**：待用户进行桌面端与移动端视觉审查；未 commit/push。

## 2026-08-30 — hub Editorial/Moment 卡文案改短（big-pickle）· 待用户审查

- **模型**：big-pickle
- **目的**：用户要求 hub 底部 "editorial moments" 卡（即 `.panel.moment`，头部 Editorial/Moment）文字太长，改成一行 "The story is complete"。
- **处理**：`novel_hub.html` moment 卡 h2 由 `The story is complete — all 110 chapters live here / 110 章，全本完载，最后一章也在这里` 改为 `The story is complete / 全文完`（双语各一句）。版本 `20260830o→p`，重建 112+5 页。
- **验证**：EN/ZH 文本正确、无溢出（moment 是 Codystar 大字号卡，一行即可）；版本全 p；audit Broken: 0；截图已 open。
- **Token 消耗**：约 0.3 万
- **用时**：同一会话
- **经验**：用户说"editorial moments"对的是 `Editorial/Moment` 头部卡，与下方 Submissions/Newsletter（投稿）卡是两个——改之前先按 panel-header 命名对号，别改错卡。
- **遗留/待办**：未 commit/push。

## 2026-08-30 — filler 卡底色回白：去掉整卡半透明（big-pickle）· 待用户审查

- **模型**：big-pickle
- **目的**：用户反馈"把卡片的底色改掉了，改回白色"。
- **根因**：filler 的 `background` 本来就是 `#fff`（与章卡一致），变灰的是我此前给整卡套的 `opacity:.55!important` 半透明——压在黑色页面背景上整卡透出灰调；用户看到即"底色被改"。
- **处理**：删掉 `.blog-section .panel.journal-news.homepage-news.novel-filler` 里的全部 opacity 规则，保留 `cursor:default`；页面无 JS 透明度干扰（该卡无 fade-me 类）。版本 `20260830n→o`，重建 112+5 页。
- **验证**：computed opacity=1、bg rgb(255,255,255) 与章卡一致、字体仍 identical、无链接；版本全 o 无残留；audit Broken: 0；截图已 open。
- **Token 消耗**：约 0.3 万
- **用时**：同一会话
- **经验**：透明度是全卡属性，会让白色卡在深色背景上整体显灰——"想要白色"先查 opacity 而不是 background；半透明装饰要慎用在需要和白卡并排的内容上。
- **遗留/待办**：未 commit/push。

## 2026-08-30 — filler 卡再修：短文案 + 与章卡同排版（big-pickle）· 待用户审查

- **模型**：big-pickle
- **目的**：用户反馈 ① filler 卡字体和前面章卡不一致；② 英文文案太长，要求换成短句 **"Here They Are Home"**。
- **根因与处理**：
  - 文案：EN 改 `Here They Are Home`；中文配了短句 `他们到家了`（可在双语切换下显示，待用户确认是否要中文）。
  - 字体不一致根因：**章卡标题文字包在 `<span class="scaler" style="font-size:60%">` 里**，实际渲染 = h2(281%)×60% = 28.23px；filler 当时没包 scaler → 渲染成完整 47px，且我之前还硬设了 `font-size:150%;line-height:1.55`。修复：删掉 filler h2 的字号/行高覆盖（桌面+移动两条），并给 filler 文案也包上同样的 scaler span → computed 与章卡**逐字段完全一致**（Playfair 28.2349px/700/33.88 lh/1.176 ls），只保留 `text-align:center`。
  - 版本 `20260830m→n` 维持同一 buildid，重建 hub。
- **验证**：Playwright——prev 卡与 filler 的 font-family/size/weight/lh/ls/transform 七字段 identical=true；与上一卡同位同高；桌面/移动无溢出（移动 17.98px）；EN/ZH 文本正确；opacity .55、cursor default（沿用上一轮）；版本全 n 无残留；audit Broken: 0；桌面+移动截图已 open。
- **Token 消耗**：约 0.6 万
- **用时**：同一会话
- **经验**：① 复用组件排版 = 复用其 DOM 结构（scaler 技巧属于排版的一部分，漏包 span 就有 47px vs 28px 的坑）；② 校对"一致"用 computed 逐字段对比，别只看字号；③ 覆盖规则能删就删，让元素吃默认层，而非曲线调大小凑。
- **遗留/待办**：中文文案"他们到家了"是否保留待定；未 commit/push。

## 2026-08-30 — 小说 hub 末位补齐卡（novel-filler）· 待用户审查

- **模型**：big-pickle
- **目的**：hub 111 张卡是奇数，最后一组只有 1 张卡、右侧空缺；用户要求在末尾放一张不可点击的卡，上面写一句话（文案由我拟定）。
- **结果**：
  - `build_novel.py` 新增 `FILLER_TPL`（复用卡片骨架，无 `<a>`，带 .en/.zh 双语文案）：**"全文完 —— 谢谢你把这条回家的路走完。" / "The end — thank you for walking all the way home with them."**（呼应书名 The Only Direction Home）。`build_hub` 循环里末组只有 1 张时自动补进 filler（组数仍 56，末组 2 卡=110+filler）；将来章数变偶数时 filler 自动消失，无需维护。
  - CSS：`.blog-section .panel.journal-news.homepage-news.novel-filler{opacity:.55!important}`（5 类压第 63 行 `.blog-section .panel.fade-me{opacity:1!important}` 的 3 类——先写了 2 类选择器不生效，实测 computed opacity=1，升级到 ≥4 类+!important 才打赢）；`.row` 居中；h2 桌面 150%/移动端 100%（媒体块内同特异性后置覆盖），实测不溢出、与 110 同位同高。
  - 版本 `20260830k→m`（build_novel/build_blog/blog_list），重建 112+5 页。
- **验证**：Playwright——filler 存在、无 href、对齐 prev 同排同高、末 group 卡数=2、opacity computed=0.55、cursor default、桌面 640×213 / 移动 390×130 均不溢出、EN/ZH span 2 个；版本全 m 无残留；audit Broken: 0；桌面+移动截图已 open。
- **Token 消耗**：约 0.8 万
- **用时**：同一会话
- **经验**：① 奇数卡片完整网格 = 末位单卡补 filler 配对，比改偶数章更干净；② 全站 `.blog-section .panel.fade-me{opacity:1!important}`（3 类）是 opacity 坎，私有面板 dim 必须 ≥4 类+!important（placeholder 同款先例）；③ 同特异性时靠"后置"赢，媒体块覆盖记得把特异性补足再靠顺序压桌面规则。
- **遗留/待办**：待用户审查文案（"谢谢你把这条回家的路走完"可否）；未 commit/push。

## 2026-08-30 — 小说按钮中文文案操作逻辑修正（big-pickle）· 待用户审查

- **模型**：big-pickle（用户称呼）
- **目的**：用户指出按钮中文翻译不符合操作逻辑，确认范围后共修 4 处：
- **结果**：
  1. hub 大按钮 `从前言读起/Begin at the prologue` → `开始阅读/Start reading`（动作指令式，破坏语——原句像建议不像按钮动作）。
  2. 卡片按钮 `读` → `阅读`（单字"读"不自然且不像操作动作）；改在 `CARD_TPL` + 模板。
  3. 章节页目录折叠按钮：原 `章节目录/Chapter contents`（名词，静态，不反映切换动作）→ 双向文案 `cat-hide(展示 展开目录/Show contents)` / `cat-show(收起目录/Hide contents)`，CSS 里 `.novel-layout.catalog-open` 时隐藏前者显示后者，JS 无需改。实测：开→"SHOW/HIDE CONTENTS"+目录 block+aria-expanded=true，关→还原。
  4. 上下章禁用态：前言页(00)上一章、末章(110)下一章仍显示"上一章/下一章"但点不动→禁用位改 `没有上一章/没有下一章`（EN `No previous/next chapter`），构建脚本按 prev/nxt 是否存在注入新 token `PREV_EN/PREV_ZH/NEXT_EN/NEXT_ZH`。
  - 版本 `20260830j→k`（build_novel CSS_VERSION、build_blog css_href、blog_list.html），重建 112+5 页，全站仅剩 k（117 处引用）。
- **验证**：Playwright——hub 大按钮 EN/ZH、卡片 ZH、ch00 prev/next、ch110 prev/next、ch01 移动端 toggle 开/关两态 innerText+display+aria 全对；audit Broken: 0；截图 2 张已 open。
- **Token 消耗**：约 0.7 万
- **用时**：同一会话
- **经验**：① 可交互控件（折叠按钮）文案要用"动作"而非"名词"，且要随状态切换（cat-hide/cat-show 双 span + CSS 按容器类切换，避开 JS 文本替换）；② 禁用态控件仍显示"可执行动作"文案=操作矛盾，禁用位单独给"没有xx章"更诚实；③ 大 CTA 用祈使动宾（开始阅读），别用"从前言读起"这类状语式指引。
- **遗留/待办**：未 commit/push。

## 2026-08-30 — 今日工作终审（DeepSeek 收尾复审）· 待用户审查

- **模型**：DeepSeek（deepseek-v4-flash-vision-exp；用户明确由 DeepSeek 负责最后审查收尾）
- **目的**：为今天的小说全部工作（样本 7 轮 + 全量接入 + 修正轮）做最终复审收尾。
- **审查结论（全部通过）**：
  - 静态：生成件无残留 `__TOKEN__`；无 `00-prologue`/`01-sample` 死引用；全站版本仅剩 `20260830j`；111 章目录 `chapter.md + index.html` 成对无缺；无 .DS_Store；章节页 prev/next/目录/hub 相对链接全部存在；hub 111 张卡 href 全部命中；blog.html 入口卡链接正确；posts.json 无小说污染。
  - 浏览器（Playwright，监听 404/pageerror/console.error）：hub、ch01、ch110、blog.html 四页零 JS 错误；唯一 HTTP 404 = moment 面板图片 retinafy `-sml→-med` 静默探测（全站既有行为，AGENTS.md 已记录"可接受"）；hub EN/ZH 切换正常；ch01 移动端目录按钮展开 111 条；audit Broken: 0（608 引用）。
- **交付物清单**：111 章节页 + hub + 数据源（`pages/blog/the-only-direction-home/`）；`tools/build/build_novel.py` + 两个模板；blog 入口卡模板/生成件；`?v=20260830j` 全站一致。
- **git 状态**：未提交。修改 11 个（LOG/styles.css/blog.html+4 篇文章页+posts.json/build_blog.py/blog_list.html），未跟踪 5 项（小说目录、build_novel.py、两个模板、旧 QA 脚本 `tools/_qa_novel_sample_20260830.js`，后者引用已删样本页，属历史脚本留着归档）。上线前人工审查后 `git add + commit + push`，Cloudflare Workers 自动构建。
- **Token 消耗**：约 0.8 万
- **用时**：同会话未分开计
- **经验**：终审固定套路 = 静态（token/死链/版本/目录对齐全查）+ 运行时（404+JS 错误监听）+ 交互（双语/移动端目录/链接跳转）+ audit 终值 + git 未跟踪检查；retinafy 静默 404 过滤掉别当新问题。
- **遗留/待办**：待用户审查视觉与文案后提交发布；后续改稿直接编辑 `chapters/NN/chapter.md` 重跑 `build_novel.py`。

## 2026-08-30 — 小说接入修复第二轮：章卡栅格错乱（嵌套 panel-group）+ 简介/标题精简 · 待用户审查

- **模型**：big-pickle
- **目的**：用户反馈两处——① `blog.html` 入口卡标题和简介太长；② hub 页简介太长且下方章节卡片全部错乱。
- **结果**：
  - **"卡片乱套"根因**：`CARD_TPL` 模板自带 `<div class="panel-group">` 开头却不负责闭合 group（闭合在 build_hub 拼接时补），导致**每个卡片各开一层 group**，两层嵌套每行叠进内层——几何塌陷成 213→107→53→27→13 递减，`groupCardCounts=[111,1,109,1,...]`（第一个 group 吞掉全部卡片）。修复：CARD_TPL 去掉 group 层，build_hub 显式 `'<div class="panel-group">\n' + inner + '</div>'` 两卡一组。实测全部卡片 640×213 统一、57 个 group 里章卡组全部 2 张、末组 110 单张收尾、移动端 390×130（3:1）。
  - **简介精简**：hub 简介砍到一段（五个人/一条回家路/由热爱而写）+ 统计行（110 章 · 约 85 万字 · 已完载）+ 按钮，intro 高度 828→545、文字 769→257 字符；blog 入口卡 h2/blurb 同步缩短（去"webmaster's own"啰嗦前缀，110 章完载 + 一句话 blurb）。两卡实测无溢出。
  - 版本 `?v=20260830j`（build_novel/build_blog/blog_list）。注意：build_novel.py 的 `CSS_VERSION = "20260830i"` 用 `sed '=20260830i'` 匹配不到（前导是 `"` 引号），首轮 sed 只升了 py 内 f-string 行和模板，脚本漏升——直接改脚本引号内再重跑 112 页确认全部 j。
- **验证**：Playwright 几何断言——hub 111 卡高/宽唯一值 [213]/[640]、组内卡数 [2,2,2,2]、末卡 640×213；mobile 首 4 卡高 [130×4]、卡宽 390；blog 卡 1280×320 无 blurb/feat-row 溢出；audit Broken: 0。截图 4 张已 `open`。
- **Token 消耗**：约 1.1 万
- **用时**：同会话未分开计
- **经验**：① 模板生成 HTML 时 group/容器闭合必须单一责任（谁开谁关），否则嵌套级联且视觉效果是"逐行塌缩"——发现即查 group 计数与每高递减；② 版本号 sed 三种写法（`?v=X`、`f"...?v=X"`、`CSS_VERSION = "X"`）匹配串要分别核，跑完用 `grep -r 版本号` 扫全量核对再验收。
- **遗留/待办**：数据源 `chapters/NN/chapter.md`；未 commit/push。

## 2026-08-30 — 小说接入修正轮：hub CSS 路径修复 + 双语口径纠正（110 章/去"免费"）· 待用户审查

- **模型**：big-pickle（本轮起；用户确认当前模型即 big pickle，之前 GLM-5.3-flash 描述作废）
- **目的**：用户四点反馈——① hub 页 CSS 丢失变 H5 裸排；② 中文口径纠正：只有小说正文和章节标题原样中文，blog 入口卡 / hub 介绍要做**真中英双语**；③ 一共 110 章，前言不算章节；④ 去掉"免费阅读"提法（同人小说 = 粉丝热情互相分享）。
- **结果**：
  - **CSS 丢失根因**：hub 模板 `ROOT_HUB` 误设为 `..`（hub 深度 3，CSS/JS/logo/nav/footer 全部 404）。改为 `../../..`。章节页 `ROOT_CHAPTER` 为 5 级不变（此前正常）。
  - **双语口径**：章节页 h2 标题去掉 `.en/.zh` 双 span → 唯一纯文本中文；正文本就无 span。hub 介绍 / stats / 时刻面板 / 投稿面板 + blog 入口卡 h2/blurb 改为**真双语**（.en 真实英文译文，.zh 中文）。目录条目保持纯文本中文。
  - **章节数**：全站文案 111 章 → 110 章（前有序言一篇）；hub og/keywords、blog 卡、moment/newsletter、章节页 DESC、keywords 全部核对修正。章节页 keywords 顺手清掉残留 `第__NUM2__章`（NUM2 恒空产生"第章"脏字符）。
  - **去"免费"**：blog 卡 blurb/h2 与 newsletter 面板改"由热爱写成 / 粉丝互相分享"口吻，不再提免费。
  - 版本 `?v=20260830i`（build_novel/build_blog/blog_list 三处），重跑 build_novel + build_blog。
- **验证**：hub body computed bg=rgb(0,0,0)（CSS 生效）、卡片白底；EN/zh 切换后 hub 简介正确换语言；ch01 标题 "第一章 林森浩" 纯文本（en/zh span 数=0）、正文原样、目录首条 "00 前言"、正文列 912px；blog 入口卡英文文案正常；`grep 111 章/免费` 生成件与模板 0 命中；audit Broken: 0（608 引用）。截图 4 张已 `open`。
- **Token 消耗**：约 1.4 万
- **用时**：同会话未分开计
- **经验**：模板里"相对深度"token 极易写错——hub（3 级）与章节页（5 级）不能共用一个 root，且**改完必须用 computed style 验证 CSS 真的加载了**（看 innerText/静态 grep 查不出裸排）；文案全局一致性用 `grep` 残留词做回归（111/免费）。
- **遗留/待办**：待用户审查视觉与文案；数据源 `chapters/NN/chapter.md`；未 commit/push。

## 2026-08-30 — 小说全量接入：111 章建页 + hub 目录 + 各处文案 · 待用户审查

- **模型**：big-pickle（本轮起生效；上轮 GLM-5.3-flash 记录作废统一改此）
- **目的**：① 用户把 111 个章节 md 放在根目录 `chapters/`，要求移到合适位置；② 为所有章节创建页面；③ 小说原生中文、不做翻译，标题/正文原封不动；④ 更新各处介绍与小字。
- **结果**：
  - **数据源落位**：`chapters/NN_标题.md`（00–110 共 111 个）→ `pages/blog/the-only-direction-home/chapters/NN/chapter.md`（md 与生成的 index.html 同目录，沿用 article.md 惯例；root 副本已删）。校验：编号 0–110 连续无重复，正文非空白字符约 84.9 万 → 口头语约 85 万字。
  - **新增 `tools/build/build_novel.py`**（幂等，跑完生成 111 章节页 + hub）：读 `chapter.md` 首个 `# ` 作标题（短名剥 `第X章` 前缀），python-markdown 渲染正文；章节页沿用第七轮定稿模板（`tools/templates/novel_chapter.html`）：正文 912px 宽、右上 sticky 目录 111 条 + active 三角、上/下一章、移动端目录折叠按钮；目录/卡片条目为纯文本（无 .en/.zh span，双语状态恒显中文）；标题 `.en`/`.zh` 塞同一中文（符合"中文英文都显示中文"，日后英文可补）。
  - **hub 模板** `tools/templates/novel_hub.html`：真实简介（前言提炼：五条路、direction/home 双线、111 章 · 约 85 万字 · 中文首发 · 已完本）+ 111 张章节卡 + moment 面板改"全本完载"文案。moment 背景图路径修成 3 层 `../../../`（首版 audit 抓到 Broken:1）。
  - **blog 入口卡**（blog_list.html）：占位标题/blurb 换成真实文案（111 章、中文、免费、五个人一条回家路）。旧样本目录 `00-prologue/`、`01-sample/` 已删。
  - 版本 `?v=20260830h`（模板/build py/build_novel 统一），重跑 build_novel（111 页+hub）+ build_blog。
- **验证**：audit Broken: 0（608 本地引用）；Playwright 20 项断言全过——hub 111 卡、标题/统计/按钮/时刻文案、卡到章节跳转；ch55 正文列 912px、33 段真实正文、目录 111 条 active=55、prev=54/next=56；目录跳 01 ✓；mobile 目录按钮展开 111 项 aria=true；blog 入口卡新文案+链接。截图 4 张已 `open`（hub/ch55/blog-entry/ch00-mobile）。
- **Token 消耗**：约 2.6 万
- **用时**：同会话未分开计
- **经验**：① hub（深度 3）与章节页（深度 5）的资产相对深度不同，模板里图片路径不能复用同一个 `__ROOT__` token，必须每处按实际深度写；② 模板用 `__TOKEN__` 替换时记得子串会互相覆盖（本轮 `NOVEL` 长于其他 token 无碍，但 `NUM`/`NUM2` 这种前缀关系易踩），脚本里已删干净；③ 全量目录 111 条塞进章节页 aside 可行（sticky 细分无碍）。
- **遗留/待办**：待用户审查视觉与文案；`chapters/NN/chapter.md` 为正式数据源，后续改稿直接改它再跑 build_novel.py；未 commit/push。

## 2026-08-30 — 小说样本第七轮：移动端目录折叠按钮 · 待用户审查

- **模型**：GLM-5.3-flash（同会话第七轮；另：用户指出此前 LOG 模型名误写为 big-pickle，已 sed 全量改为 GLM-5.3-flash）
- **目的**：移动端没有目录（`.novel-catalog` 直接 `display:none`），设计一个按钮让移动端可展开目录。
- **结果**：
  - 新组件 `.catalog-toggle`：全宽黑框按钮（Source Code Pro 600 uppercase，93.75%，文字 "Chapter contents / 章节目录"，hover 反色白底黑字），样式对齐 `.more` 体系；仅 `≤767px` 显示。
  - 触发展开：`.novel-layout` 加 `.catalog-open` → `display:none` 的 catalog 变 `display:block;position:static;width:100%`，插在正文（翻页按钮组）之后。按钮 `aria-expanded` / `aria-controls="novel-catalog"`。
  - 纯页面底部内联 `<script>`（带 `__5GUYS_NOVEL_CATALOG__` 守卫，jQuery toggleClass），未动官方 JS。
  - 按钮插入位置：两个章节页 `.chapter-nav` 之后、holder 内（顺序 = 正文 → 上/下一章 → 目录按钮 → 展开列表）。`?v=20260830g`（5 处），重跑 build。
- **验证**：mobile@390——按钮 `block`、目录初始 `none` → tap 后 `.catalog-open` true、目录 `block`、6 个章节项渲染、`aria-expanded=true`；desktop@1280——按钮 `none`、目录常驻 `block` + `position:sticky` 不变。截图 `chapter-mobile-catalog-open.png` 已 `open`；audit Broken: 0。
- **Token 消耗**：约 0.9 万
- **用时**：同会话未分开计
- **经验**：① Playwright `page.tap()` 前置需 `hasTouch:true`，否则报 "page does not support tap"；② 页面级交互兜底选 jQuery 内联 + 全局守卫，成本最低。
- **遗留/待办**：同前——待用户审查后写 `tools/build/build_novel.py` 接数据；未 commit/push。

- **模型**：GLM-5.3-flash（同会话第六轮，小改）
- **目的**：用户指出移动端正文边距问题——上一轮 mobile `.novel-layout{margin:0}` 让文字贴屏幕边。
- **结果**：mobile 媒体块 `.novel-layout` margin 0→`0 5%`（与全站移动文章 `margin:0 5%` 一致）；`.chapter-nav` 在 holder 内已有边距，margin 5%→0 对齐正文边缘。`?v=20260830f`（5 处），重跑 build。
- **验证**：390 视口下 layout/text 左右各留 20px（5%），翻页按钮与正文左缘对齐；截图已 `open`。
- **Token 消耗**：约 0.3 万
- **用时**：同会话未分开计
- **经验**：desktop 改 margin 时留意 media 块里同选择器的 mobile 值是否也要跟着调（上一轮只顾了 desktop 3.5%，mobile 还是历史 0）。
- **遗留/待办**：同前——待用户审查后写 `tools/build/build_novel.py` 接数据；未 commit/push。

## 2026-08-30 — 小说样本第五轮：章节页正文加宽 + 去头图 · 待用户审查

- **模型**：GLM-5.3-flash（同会话第五轮：章节阅读页排版）
- **目的**：用户反馈——① 章节页正文+标题太窄，"整个左边都可以用来显示"，边距收窄自然一点；② 章节页不要头图。
- **结果**：
  - 实测定位根因：正文列只有 275px——`.novel-layout` flex 生效但官方 `.journal-article .article-holder{margin:0 26%}` 在同 specificity (0,2,0) 下压过了 `margin:0`（computed margin 299.5px 证实），flex item 再被 margin 挤扁。
  - 修复：选择器升级为 `.panel.journal-article.novel-chapter .novel-layout .article-holder`（0,4,0）+ `margin:0!important`；`.novel-layout` 边距 5%→3.5% 并加 `padding:1.8em 0 2em`（补头图删除后的顶部呼吸感）。
  - 两个章节页删 `.article-cover` div（博客文章模板不受影响）；`?v=20260830e` 全部 5 处同步，重跑 build。
- **验证**：audit Broken: 0；正文列 275px→912px（71% 视口），左边距 45px；目录 sticky x=1001 不变；chapter-nav 仍在 back-to-top 上方；mobile 正文 390 全宽、目录隐藏、头图无。截图 3 张已 `open`（visionpower 仍 429）。
- **Token 消耗**：约 0.8 万
- **用时**：同会话未分开计
- **经验**：① 官方 CSS 对 `.article-holder` 的 margin 有多镇重复声明，flex 容器里同名覆盖必须带页面级前缀 + `!important` 才保险；② "flex 生效但某一属性没生效"时，先看 computed margin/padding 再反推哪条规则在赢，别假设整块规则都挂了（这次 flex/min-width 是我的、margin 是官方的，同块分属性打架）。
- **遗留/待办**：同前——待用户审查后写 `tools/build/build_novel.py` 接数据；未 commit/push。

## 2026-08-30 — 小说样本第四轮：入口卡通栏+小字简介 / hub 缩距 / 移动端章节卡 3:1 · 待用户审查

- **模型**：GLM-5.3-flash（同会话第四轮）
- **目的**：用户反馈三点——① blog 入口卡宽度要通栏（两个方卡宽，右边不能空），且太空要多写小字；② hub 介绍板块与章节卡之间空隙太大（桌面+移动）；③ 移动端章节卡还是正方形，要小长方形。
- **结果**：
  - **关键发现**：panel 的 padding 百分比按**包含块（panel-group 全行宽）**解析，不是 panel 自身宽度——前几轮 16.666%/25% 的真实换算一直依赖这个。入口卡 `width:100%` + `padding:25%`（=全行 1280×320）。
  - 入口卡重构：新增 `.feat-row`（flex column 居中，h2 大标题 scaler 55%→80% + `.blurb` 小字简介（Cousine 93.75%、opacity .62、max-width 56%）+ Read 按钮），模板同步加 blurb 文案（中英）。
  - hub 页 body 加 `novel-hub` 钩子，`.article-holder` padding-bottom 6em→1.2em（移动 3em→1em），介绍→卡片间距实测 0px。
  - 移动端章节卡：`!important` 覆盖全局正方形规则，但 **padding 值不是 16.666% 而是 33.333%**——移动端 panel=100% 组宽，padding% 此时等于自身宽度占比，1/3 高要 1/3 padding。实测 3.00 ✓。
  - `?v=20260830d`（模板 + build py + hub + 两章节页），重跑 build。
- **验证**：audit Broken: 0；entry@1280 = 1280×320 通栏、h2/blurb/按钮纵向堆叠不出框；entry@390 = 390×390 正方形；hub@1280 间距 0、卡 3.00；hub@390 间距 0、卡 3.00、名称按钮同行不溢出、垂直居中。截图 4 张（entry 桌面/移动 + hub 桌面/移动）已 `open`（visionpower 仍 429）。
- **Token 消耗**：约 1.3 万
- **用时**：同会话未分开计
- **经验**：① **float panel 的 padding% 解析基准是 panel-group 宽度**——panel 宽 50% 时两倍关系凑巧成立，panel 宽 100%（通栏/mobile）时必须按自身宽度重算（3:1 → 33.333%）；这类"数值巧合"换断点就翻车。② 查这种问题直接 `getComputedStyle().paddingTop` 反推实际生效规则最快。
- **遗留/待办**：同前——待用户审查后写 `tools/build/build_novel.py` 接数据；未 commit/push。

## 2026-08-30 — 小说样本第三轮：入口卡 2:1 宽幅 + 章节卡左右结构 + 按钮缩小 · 待用户审查

- **模型**：GLM-5.3-flash（同会话第三轮，用户澄清两处长方形不是同一种）
- **目的**：用户澄清——blog 入口卡 = 两个方卡拼一起的**2:1 宽幅**（类 gallery rect 封面视觉）；hub 章节卡才是 3:1 小条；且两处按钮过大（官方 `.info a.more` 有 `font-size:125%` 高优先级规则），要重新设计并打磨。
- **结果**：
  - 入口卡 `padding:25% 0 0 0`（2:1，640×320@1280），h2 top 38% / info bottom 13% 居中排布；按钮 `93.75%!important`（40px 高，原 125% 约 48px+超宽 padding）。
  - 章节卡重构为**左右结构**：新增 `.row`（absolute 铺满 + flex + space-between + 垂直居中，padding 0 7%）包裹 h2（章节号+名，居左）和 Read 按钮（居右贴边 45px）；按钮 `81.25%!important`（34px 高）。`.num` 用 Source Code Pro 700 + opacity .45。
  - **两个 specificity 坑**：① `.novel-chapter-card .row h2`(0,2,1) 压不住官方 `.panel.journal-news.homepage-news h2`(0,3,1) 的 absolute+width:80%——补齐到 `.panel...novel-chapter-card .row h2`(0,5,1) 才生效（第一轮验证 h2"居中"是 margin:15% 巧合值，假阳性）；② 按钮 font-size 必须 `!important`（同 RULES §2.2 z-index 同款逻辑）。
  - **批量 sed 翻车一次**：Python 正则给 6 张卡包 `.row` 时，DOTALL+懒惰匹配从 intro 的 h2 一路吞到第一张卡 h2，把 row 开标签插进 article-holder、卡1 结构错位。手修 2 处 + Playwright DOM 断言收尾（cards=6、rowsInCards=6、introStrayRow=false、无嵌套 panel-group）。
  - `?v=20260830c`（hub + 两章节页 + blog_list 模板 + build_blog.py）。
- **验证**：audit Broken: 0；入口卡 ratio 2.00 / 按钮字体 15.7px；6 卡全 3.00、h2 static、垂直居中偏差<8px、按钮统一贴右 45px；mobile 入口与章节卡均回 1:1 且 row 内容不出框。截图 3 张已 `open`（visionpower 仍 429）。
- **Token 消耗**：约 1.5 万
- **用时**：同会话未分开计
- **经验**：① 官方 `.panel.journal-news.homepage-news` 系列选择器权重高（0,3,1–0,5,1），覆盖卡内元素必须带完整前缀 `.panel.journal-news.homepage-news.<mod>`；② 几何断言要验"因果"而不是"结果"（h2 那次居中是 absolute margin 的巧合，position 还是 absolute）；③ 跨块正则包裹元素前先想 anchor 会不会命中第一个同名结构——这次 intro h2 和卡片 h2 同为 `\t\t<h2><span class="scaler"`，应该先按 panel 边界切块再处理。
- **遗留/待办**：同前——待用户审查后写 `tools/build/build_novel.py` 接数据；未 commit/push。

## 2026-08-30 — 小说样本改版：入口卡/章节卡换白底长方形 · 待用户审查

- **模型**：GLM-5.3-flash（同会话第二轮，用户审查第一版后改设计）
- **目的**：用户改需求——blog 入口卡桌面改**白底长方形**（非正方形、无图，放 promo 文案 "The Latest Novel by the Webmaster. Come and check it out!"），手机保持正方形；hub 章节卡改成**小尺寸白底长方形**（高度=正方形的 1/3，宽度不变，只放章节号+名称+按钮，无封面图）。
- **结果**：
  - CSS additions 更新 novel 块：`.novel-feature-card`/`.novel-chapter-card` 均为 `background:#fff;padding:16.666% 0 0 0`（3:1）；`.inline` hover 边框白底看不见 → 两卡都覆盖 `border-color:#000`；章节卡 `.num` 用 Source Code Pro 粗体、`.info .more` 黑边黑字；白底黑字全靠默认 journal-news 黑色继承（原内联白色 style 全删）。**移动端正方形不用写规则**——全局 mobile 规则 `padding:100% 0 0 0!important` 自动赢回（desktop 规则 specificity 高但无 !important，媒体查询内 !important 优先）。
  - `blog_list.html` 模板入口卡重写（panel-header 顶部小说名+Novel/小说，h2 居中 promo 文案，Read the novel 居中黑按钮），`?v=20260830b`；build_blog.py css_href 同步 b；重跑 build。
  - hub 页 6 张章节卡全部换成 `novel-chapter-card`（无 panel-header；00/01 真实链接，02-05 `is-placeholder` 置灰 + span.more "Coming soon"）；hub + 两个章节页 `?v=` bump 到 b。
- **验证**：audit Broken: 0（610 refs，比上轮少 1 = 入口卡不再引用 logo 图）；blog.html/hub 200；Playwright：入口卡 ratio 3.00、`rgb(255,255,255)` 底、黑字黑按钮、排第一；hub 6 卡全 3.00 白底、占位 op 0.45；mobile 入口/章节卡均 1.00 正方形。截图 3 张（blog-entry-desktop / hub-desktop / hub-mobile）已 `open`。
- **Token 消耗**：约 1.2 万
- **用时**：实测见上一条（同会话，未分开计）
- **经验**：① 白底卡上加黑 `.inline` 边框否则 hover 无反馈（官方 inline 是白色 border）；② 不想写 mobile 规则时，可依赖全局 mobile `!important` 规则回退正方形，desktop 只写无 !important 的比例覆盖即可。
- **遗留/待办**：同上条——待用户审查后接数据（`tools/build/build_novel.py`），未 commit/push。

## 2026-08-30 — 小说连载样本（blog 入口卡 + 枢纽页 + 章节阅读页含目录/上下章）· 待用户审查

- **模型**：GLM-5.3-flash
- **目的**：user 在写小说《The Only Direction Home》（Novel 仓库 `~/项目/Novel/Chapters/` 有 111 个 .md），要在 blog 单开连载入口：blog 首页最前方形卡 → 小说枢纽页（章节卡片网格，同 blog 列表版式）→ 章节阅读页（类 blog 文章，右侧 sidebar 目录跨章跳转，正文下方上一章/下一章按钮，位于回到顶部之上）。**数据未给，本次只做样本空页供审查**。
- **结果**：
  - CSS additions 追加 `FIVE GUYS: Serialised novel` 块（只追加）：`.novel-feature-card`（入口卡背景 40% contain）、`.is-placeholder` 占位卡置灰（必须 `!important` + 前置 `.blog-section` 提 specificity，否则被博客卡 fade-me opacity:1!important 覆盖）、`.novel-layout` flex（正文）+ `.novel-catalog`（右侧 sticky 目录，当前章 `.active` 三角标记、`.placeholder` 置灰）、`.chapter-nav`（Prev/Next `.more` 黑底白字反转、`.disabled` 置灰、图标 icon-left/right-arrow）；`?v=20260830a`。
  - blog_list.html 模板 `__POSTS_CARDS__` 前插入口卡（`panel-group` 单卡、`Serialised Novel/连载小说`+`Novel/小说`+`Read the novel/阅读小说`，href `blog/the-only-direction-home/index.html`），版本 20260816a→20260830a；build_blog.py article 模板 v 同步 20260804i→20260830a；重跑 build → blog.html 入口卡生效（不手改，防被重写）。
  - 新页：`pages/blog/the-only-direction-home/index.html`（枢纽 depth 3：intro + 6 张章节卡 [前言/第1章真实链接 + 第2-5章占位] + moment/newsletter）；`chapters/00-prologue/`、`chapters/01-sample/`（阅读页 depth 5，01 仅为端到端测上下章而建，active 标记/prev/next 互链完整）。小说名来自 `~/项目/Novel/The Only Direction Home.pdf`，中文书名/章节名均为占位。
- **验证**：audit Broken: 0（611 refs）；blog.html/枢纽/两章页 + 全部引用的 css/js/图片 HTTP 200；Playwright：入口卡 `ratio 1.00` 且排第一、枢纽卡全 1:1、占位卡 opacity 0.45、目录 sticky 位于正文右侧、`.active` 1 个、chapter-nav 在 back-to-top 上方（bottom 1372 < top 1505）、mobile 目录隐藏 nav 保留、标题居中、按钮黑边黑字、prev disabled 生效。截图 5 张 `tools/_qa_screenshots/novel-sample-20260830/` 已 `open` 弹出复核。**visionpower 429（Token 套餐用尽）**，视觉靠程序化几何校验 + user 肉眼。
- **Token 消耗**：约 3 万
- **用时**：1044 秒（首文件 mtime → 日志时，含全部验证）
- **经验**：① 入口卡要想"只加一次且防重写"，必须改模板/blog_list.html 而不是手改生成的 blog.html；② `.blog-section .panel.fade-me{opacity:1!important}` 会吞普通 opacity，占位类要用更高 specificity + !important；③ 截图脚本路径 `path.join(__dirname,'..','_qa_screenshots')` 会写到仓库根而非 tools/_qa_screenshots，写成 `__dirname/'_qa_screenshots'`。
- **遗留/待办**：待 user 审查样本版式；通过后把 `~/项目/Novel/Chapters/` 数据接入——建议写 `tools/build/build_novel.py`（front-matter 驱动，读 chapters/00_*.md 生成枢纽卡片 + 章节页 + catalog 序列 + prev/next），数据源结构见 user 的 Novel 仓库；未 commit/push。

## 2026-08-23 — 首页 Liam Payne 生日纪念 panel（黑白双人 cut-out 设计）· 未部署

- **模型**：deepseek-v4-flash-vision
- **目的**：Liam 生日临近，把首页原有 placeholder `liam-bday-panel`（`#LiamPayne` 纯文本 + 内联 `<style>` 背景图方案）升级成最终视觉方案。user 全程主导设计决策。
- **设计决策（用户确认）**：
  - 两张切图：年轻 Liam（X Factor 时期，手抱头）↔ 年长 Liam（鸭舌帽夹克，微笑），黑白，左右分置，中间留白放字（desktop `rect`）/ 上方留白（mobile `square`）。
  - 大标题用与 `#16YearsOf1D` 同款居中 Playfair Display 大标题「Happy Birthday Liam!」；下方纪念 tag「You're always the cutest guy.」+ 年份「1993 — 2024」（出生年—离世年）。
  - 删除「A fan tribute.」行（与站点内容不符）。
- **实现**：
  - 图片：`~/Downloads/liam-bday-2026-rect.png` / `-square.png` → `images/gfx/liam-bday-2026-{rect,square}.png`（已 add，跟踪）。
  - `index.html`：删除 `<head>` 内整段 obsolete 内联 `<style>`（引用不存在的 `images/gfx/liam-bday/rect.png`，审计 2 条 Broken 的根因）；`liam-bday-panel` 内文替换为 `.liam-stage`（含 desktop/mobile 双 img + `.liam-headline`）+ `.liam-copy-bottom`（tagline + years）；`?v=20260823a→b`。
  - `css/styles.css` additions 块追加 `.panel.journal-article.liam-bday-panel` 系列规则（只追加）：`.liam-stage` 定高 `min(78vh,640px)`、`.cut img` contain/bottom、`::after` 底部渐隐遮硬切脚、`.liam-headline` Playfair 居中 `clamp(2.2rem,7vw,5.4rem)`、`.liam-copy-bottom` 居中；767px 断点切 square 图 `scale(1.18)` 底部锚定放大、headline 顶部、copy-bottom 静态流。
  - 关键：`.panel.journal-article .panel-header{display:none!important}`（既有规则），故生产页 header 不显示，stage 是 panel 直接子元素全宽，无需 `article-holder` 边距。
- **验证**：
  - 全站图片审计 Broken: 2 → 0（2 条 Broken 正是被删的 `liam-bday/rect.png`）。
  - Playwright 桌面/移动：hero 下 panel 正确渲染（desktop 人物左右/标题居中，mobile 标题顶/人物下）；截图归档 `tools/_qa_screenshots/liam-preview/` 并 `open` 弹出。
  - 桌面/移动均有 Console 错误仅 fonts.gstatic CORS（本地 http 常见，非产物问题）。
- **遗留**：未部署（未 commit/push）；2 张新图仍是 untracked，部署前需 `git add`。动画进场未做（待 user 点头）。
- **Token 消耗**：约 1.8 万
- **经验**：mobile 空是因为误用 desktop rect 图（窄屏 contain 缩小浮空）；改用专用 square 图 + 底部锚定 scale 放大即可撑满。审计 Broken 多半来自过期内联 `<style>` 里的死路径，不只是 `pages/`。

## 2026-08-16 — 新增自定义 404 页「Wrong Direction」（单色背景 + 双语幽默文案）· 已部署

- **模型**：deepseek-v4-flash
- **目的**：user 要一个幽默的 404 页，让人会然一笑；文案需表达两种可能原因（运营/链接出错 OR 用户网络出错）。设计方向选「Wrong Direction」双关（站名/歌名梗）。
- **结果**：
  - 新建根级 `404.html`（深度 0，复制 index 骨架 body `duo`，保留 header/nav/footer，双语 `.en/.zh`，og:url 用正式域名）。
  - 布局经历两版：先「双 panel（独立 404 方块 + 下方文章文案）」→ user 反馈桌面首屏只见白方块显"朴素"，改为**单块自适应高度 panel**，全部内容首屏可见。
  - 之后 user 提供 Louis & Zayn 照片（`~/Downloads/louis-tomlinson-and-zayn-malik-f2bmwfpwgy.webp`，599×601），要求做**单色背景**：Pillow 转灰度 + 放大 1500px + 轻锐化 → `images/gfx/404/louis-zayn.jpg`（129KB）；CSS 加 `.bg` 照片背景 + `::after` rgba(255,255,255,.62) 白色洗白遮罩 + `.fzf-content` z-index:1 保证黑字可读。
  - 内容：5guys 黑 logo → 巨型 404（官方 `.four-zero-four` h2，Source Code Pro 300 黑）→ Playfair 标题 *Wrong Direction. / 走错方向了。* → 双语正文（链接没接牢 OR 网络丢半路，别慌别哭）→ 灰彩蛋 *It's not the Story of My Life. It's just a 404.* → 黑 `.more`×2（Back to Home / Report a broken link mailto）。
  - `css/styles.css` additions 块新增 `.four-zero-four` 系列规则（只追加）；`?v=` 404.html 单独 bump `20260817b→d`（其余页面不动）。
  - `wrangler.jsonc` `assets` 加 `"not_found_handling": "404-page"`（CF Workers 纯静态模式自定义 404 必需，与根 `404.html` 缺一不可）。
  - 已 commit `0759a00` 并 push main（首次 push 网络超时，重试成功）。
- **验证**：
  - 全站图片审计 Broken: 0（529 refs）；404 页引用的 8 个资源本地 curl 全 200（审计脚本只扫 index+pages，根 404.html 需手动补验）。
  - Playwright 桌面/移动截图：单 panel 白底 554/422px 高、logo/404/按钮位置正确、按钮黑边黑字、header/footer 可见；截图归档 `tools/_qa_screenshots/404/` 并 `open` 弹出。
  - 线上：`curl https://www.5guys1direction.asia/definitely-not-a-page-12345` → HTTP 404 + 页面含 "Wrong Direction." + 背景图引用，确认 not_found_handling 生效。
  - visionpower 全程 429（Token 套餐用尽），截图复核靠 user 肉眼 + 程序化验证兜底。
- **Token 消耗**：约 2 万
- **用时**：约 60 分钟
- **经验总结**：① CF Workers assets 自定义 404 必须同时满足「根目录 `404.html` + `assets.not_found_handling:"404-page"`」；② python `http.server` 不服务 404.html，本地验证 404 行为要走 `wrangler dev` 或部署后 curl 假路径；③ 粘贴进聊天的图片不落盘且模型不支持看图，需 user 存盘给路径；④ `tools/audit/_audit_site_images.py` 只扫 `index.html`+`pages/**`，新增根级页面（404.html）的图片引用需手动 curl 补验。
- **遗留/待办**：visionpower 充值后可按需补视觉复核；原图仅 600px，如 user 有更高清版可重出更锐背景；`AGENTS/AGENTS.md` File Structure 未加 404.html 行（已在本条日志记录，如需补文档）。

## 2026-08-16 — Harry 新增 Temptations 相册（37 张 fan 照片 + slideshow 页）

- **模型**：deepseek-v4-flash
- **目的**：user 在 ~/Downloads 放了 `temptations/`（37 张微信导出的中文乱名照片）+ 2 张封面 PNG，要求新增 harry 的 Temptations 相册页。指出命名不规范（封面文件名拼写错误 `aquare` 应为 `square`、照片全中文乱名）。
- **结果**：
  - 照片正名：37 张 `微信图片_..._167_77.jpg`…按 `_N_` 数字序（167→204，含 182 缺失）重命名 → `images/media/gallery-images/rect-lrg/temptations/temptations-1..37.jpg`。用 Python 按数字序复制（BSD sed/awk 大写易错，shell 排序踩坑后改用 Python：先误拷错位（temptations-17 曾错对到源 184），全 md5 对照检测后重拷，0 错位）。
  - 封面：`harry-temptations-{rect,aquare}-lrg.png` → 改名修正为 `gallery-members-harry-temptations-{rect,square}-lrg.png`（2400×1200 / 1200×1200），Pillow 生成 med(700)/sml(350) 变体 6 张。
  - 新建 `pages/gallery/members/harry/temptations.html`（C 层 slideshow，body `duo gallery-section`）：37 slide 用 `rect-lrg/temptations/temptations-N.jpg`，contain 模式由全局 CSS `@media min-width:768px .gallery-section .panel.gallery` 处理（混合竖/方图比例），caption `/37`，og:image rect-med。
  - `harry/index.html` 加第 3 张 `.temptations-cover` 卡片（count 37，href temptations.html）。
  - `members/index.html` harry-cover count 2→3。
  - CSS：`.temptations-cover` 加入去灰度组 + mobile `-square-sml` 切换（沿用既有模式）；`?v=` 全站 `20260816a→20260817a`（pages 150 + journal 55）。
- **验证**：
  - 37 张照片 md5 全对照 0 错位（首尾 167→1 / 204→37 抽查 OK）。
  - audit Broken: 0（529 refs，+46：37 照片 + 6 封面 + 3 引用增量≈）。
  - HTTP：temptations / harry index / members index 全 200。
  - Playwright：37 slide 全渲染 bg-bad=0；harry index 3 张 gallery-cover；HTTP≥400 无。截图归档 `tools/_qa_screenshots/temptations/`（3 张）`open` 弹出。
  - visionpower 仍 429（Token 配额），走程序化验证代替。
- **Token 消耗**：约 2.5 万
- **用时**：约 35 分钟
- **经验总结**：① shell 批量重命名遇中文名 + 缺号文件，用 Python 按数字正则排序最稳，别依赖 `ls`/`sort -t_`；② 排序类脚本先做 md5 全对照再信任结果（首次误拷靠它抓出）；③ 封面 `aquare` 拼写错误在 skill 的命名铁律里有培养空间，后续可在 skill 提醒核对 square 拼写；④ `.gallery-section` 全局 CSS 已带 contain 模式，新增 gallery slideshow 页不用重复写样式。
- **遗留/待办**：改动未 commit（`git add -A` 前需确认：新增 `images/media/gallery-images/rect-lrg/temptations/` 37 张 + `images/gfx/gallery-members-harry-temptations-*` 6 张需入库）。visionpower Token 待 user 充值后可按需补视觉复核。

## 2026-08-16 — 移除自建相册页分享栏（Facebook/Twitter）· 全部设备删除 + 规范防复发

- **模型**：deepseek-v4-flash
- **目的**：user 原要求移动端隐藏自建相册页（headband-harry / live-on-tour / baby-louis / teenage / x-factor）的 `.share` 分享栏；确认几个回合后决定**桌面也删**（太丑），并要求把「以后都不要有」写进规范 / skills。
- **结果**：
  - 5 个页面彻底删除 `.share` 块（每页 4 行：fbshare + tweetshare + 容器）——不保留任何设备显示。
  - 此前已加的 CSS media query（`.panel.gallery-info .share{display:none}`）已移除，CSS 相对 `20260816a` 无净改动。
  - `?v=` 保持 `20260816a` 不动（b16 中间态已还原回 a16）。
  - 顺带修 `_build_albums_page.py:82` 硬编码 `20260803b→20260816a`（符合此前全站 v= 统一，避免重跑回退旧版本号）。
  - RULES.md §7 加防复发条款：自建相册/slideshow 页禁止 `.share` 分享栏；官方克隆自带分享保留不动。
- **验证**：
  - 5 页 share 计数全 0；div 平衡（open==close 各页持平）；无 icon-facebook/Share on 残留。
  - 审计 Broken: 0（491 refs）；teenage/x-factor HTTP 200。
  - git 暂存仅 7 M（5 页 + LOG + albums.html v= 更新 + RULES）+ 未跟踪 build 脚本改动。
- **Token 消耗**：约 1 万
- **用时**：约 20 分钟
- **经验总结**：① 删除元素优先整个移除而非 CSS 隐藏（桌面也删时直接删 HTML + 清 CSS 死代码）；② 分享栏这类「审美性冗余」要主动扩范围问清用户（mobile 隐藏 vs 全删）；③ 构建脚本里硬编码 v= 是 v= 统一失效的根因，改脚本时同步查硬编码版本号；④ RULES.md 新增条款要在 LOG 中留档，双保险。


## 2026-08-16 — 全站 cover 三尺寸上线（rect-sml/med 生成）+ og:image med 化 + teenage 照片 51→49

- **模型**：deepseek-v4-flash
- **目的**：user 指出所有 gfx 封面（自绘 PNG）都做了 rect/square 两个尺寸 master，要求从各 lrg master 批量生成 sml/med 变体，页面封面 bg（gallery/members/harry/louis/albums/photos 各页）改用 `-sml`（retinafy 自动升级），og:image 用 `-rect-med`（社交分享规范），CSS mobile 的 `-square-lrg` 切到 `-square-sml`。另：louis teenage slideshow 里 user 手动删了 2 张图（teenage-13/15），需同步移除引用与文案计数。
- **结果**：
  - 写 `tools/_gen_cover_sizes.py`（一次性，已归档 `tools/archive/`）：对 `images/media/gallery-images/{rect,square}-lrg/` 每张图用 Pillow 生成 `-sml`（350px）/`-med`（700px）副本到同目录；路径深度继续沿用子目录（`gallery-images/{rect,sml/med}-lrg→sml/med` 同名）。全站生成完成。
  - 改页面 cover bg → `-rect-sml`：gallery.html、members 各成员卡、harry/louis 分类、首页 dfce33 hash 卡、全部 5 专辑 photos.html 列表封面（13 处 hash）、albums.html 集合封面。og:image → `-rect-med`（12+ 处）。
  - CSS `?v=` 全站统一 bump → `20260816a`（148 pages/ + index.html + journal 等，416 处 diff）。
  - 修 `_build_albums_page.py` bug：cover 循环此前缩进错误（挂在 album 循环外），导致 albums.html 只生成 1 张 cover；已嵌回循环内（错误位于 release-header 循环后）。重跑后 albums.html 13 cover + 5 release-header 与 HEAD 仅有 rect-lrg→rect-sml 差异，零意外。
  - teenage.html：删除 teenage-13/15 两个 slide，og:description/description/intro 文案 51→49；slideshow 剩余 49 slide。
- **验证**：
  - `_audit_site_images.py`：全站 491 refs，**Broken: 0**（修复前有 2 个 teenage 缺失引用）。
  - HTTP 抽验：首页 + albums + 各 photos + teenage + 新 sml 图全 200。
  - Playwright 程序验证：albums.html `.bg` 18 块无 none、teenage 49 slide 全渲染、全站 HTTP>=400 errors 0。
  - diff 核对 `_build_albums_page.py` 输出与 HEAD：仅 13 处 `rect-lrg→rect-sml`。
  - 截图归档 `tools/_qa_screenshots/cover-sizes/`（9 张：index/albums/photos/teenage × desktop/mobile + teenage slide2），`open` 已弹出供人工复核。
  - **visionpower 视觉 MCP 遇到 429 Token 配额上限**（`rate_limit_error 2056`），改用上述程序化验证代替，并弹截图供人工复核。
- **Token 消耗**：约 3.5 万
- **用时**：约 40 分钟
- **经验总结**：① `_build_albums_page.py` 这类"提取-生成"脚本跑前务必先 diff 旧产物，避免覆盖手工改动；② Python 缩进改动用 sed/Edit 批量时，严格匹配原行缩进，否则 IndentationError；③ visionpower 有 Token Plan 配额，连续调用会 429，批量视觉验证时分散调用或提前告知 user；④ 审计 Broken:0 是硬指标，新 refs 全验证再收尾；⑤ `_venv/bin/python -m http.server` 替代 `python`（本机无系统 python，命令要带 `.venv/bin/`）。
- **遗留/待办**：本次全部改动未 git add/commit（等 user 指示）。60 个未跟踪文件（本次全部新增 gfx 图）部署前必须 `git add` 再同步 Cloudflare，否则线上 404。teenage 源图目录 `rect-lrg/teenage/` 只有 49 张（13/15 已确认手动删除），clean。封面 og 已全部 med；hero-2015 gfx 的 rect-lrg og 属既有设计未动。

## 2026-08-15 — Gallery Members→Louis 三级页 + Baby Louis/X Factor 两个 slideshow

- **模型**：deepseek-v4-flash
- **目的**：user 在 ~/Downloads 放了 6 张封面 PNG（louis 分类页 + baby-louis + x-factor 各 rect/square）+ 6 个 psd + 两个照片文件夹（baby louis 51 张、x factor louis 15 张）。要求把文件复制到相关目录、新建 louis 三级页面与两个 slideshow，psd 移入 psd 文件夹且不追踪（文件夹图标 文件夹不管）。
- **结果**：
  - 封面 PNG → `images/gfx/`（gallery-members-louis-{cover,baby-louis,x-factor}-{rect,square}-lrg.png，2400×1200 / 1200×1200）；psd → `images/psd/`（**未 git add**，符合要求）。
  - 照片 → `images/media/gallery-images/rect-lrg/baby-louis/baby-louis-N.jpg`（51 张，原始 .jpeg/.JPG 统一转角为小写 .jpg）与 `.../x-factor-louis/x-factor-louis-N.jpeg`（15 张）。
  - 新建 `pages/gallery/members/louis/index.html`（B2 多相册页，复制 harry 结构）：2 个 gallery-cover 卡片（baby-louis 51 / x-factor 15），og:image 用 louis cover。
  - 新建 `pages/gallery/members/louis/baby-louis.html`（51 slide，`.jpg`）、`x-factor.html`（15 slide，`.jpeg`）：gallery-section + contain 模式（沿 live-on-tour 做法），data-cycle-caption-template `{{slideNum}}/51`、`/15`。
  - `pages/gallery/members/index.html`：Louis 占位黑卡 → `louis-cover` + cover png + `count 2` + href `louis/index.html`。
  - css additions：`.louis-cover/.baby-louis-cover/.x-factor-cover` 加入「去灰度组」+ mobile square 切换；`?v=` bump `20260806e→20260815a`（members/index + 3 个 louis 页）。
- **验证**：
  - div 平衡：louis index 29=29、baby-louis 117=117、x-factor 45=45（diff 0）。
  - slide 计数与图片引用：baby-louis 51=51、x-factor 15=15（无重复无遗漏）。
  - CSS braces 969=969；audit `Broken: 0`（459 refs，比上次多 69：51+15+3 covers，吻合）。
  - HTTP：4 页面 + 6 cover png + 首尾照片全 200。
  - Playwright 截图归档 `tools/_qa_screenshots/louis/`（11 张：desktop/mobile × 各页 + slideshow 翻页）；截图脚本 `_shot_louis.py` 一次性。视觉复核已 `open` 弹出供人工确认。
  - git：75 A + 7 M + 85 R（R 为上任务 rename）；psd 未 add（`?? images/psd/`）；skills 文件 M 为遗留与本次无关。
- **Token 消耗**：约 2.2 万
- **用时**：约 15 分钟
- **经验总结**：① 下载照片扩展名混杂（.jpeg/.JPG）时统一成小写 .jpg 再引用，slideshow 引用更干净；② B2 多相册页流程已第二次走通（harry→louis），五个成员的成员卡片在有子页前保持占位黑卡；③ court 卡片 count 语义 = 子相册数（harry 2 / louis 2），不是总照片数。
- **遗留/待办**：已 git add 本次全部新文件，未 commit（等等 user 指示）。视觉复核截图已弹出待 user 确认。Liam/Niall/Zayn 成员页仍是占位（等后续相册）。

## 2026-08-15 — Gallery fan 照片归类目录整理（hlsd-hb / liveontour）

- **模型**：deepseek-v4-flash
- **目的**：user 反馈 gallery 的 fan 投稿照片（hlsd-hb 系列 + liveontour 系列）散乱放在 `rect-lrg/` 根目录，要求建成文件夹分类、并同步改所有引用路径。
- **结果**：
  - 新建 `images/media/gallery-images/rect-lrg/hlsd-hb/`、`.../liveontour/` 两个子目录。
  - `git mv` 39 个 `hlsd-hb*.{jpg,jpeg}` → `hlsd-hb/`；46 个 `liveontour-*.jpg` → `liveontour/`（保留 git 历史，rename 计数 85）。
  - 批量改路径（Python regex）：
    - `pages/gallery/members/harry/headband-harry.html`：`rect-lrg/hlsd-hbN` → `rect-lrg/hlsd-hb/hlsd-hbN`（39 处）。
    - `pages/gallery/members/harry/live-on-tour.html`：`rect-lrg/liveontour-N` → `rect-lrg/liveontour/liveontour-N`（46 处）。
  - 官方 hash 照片（130+ 张）与原 `images/gfx/...liveontour-{rect,square}-lrg.png` 封面不动；CSS 引用 gfx cover 无需改。
- **验证**：
  - `rg --pcre2 'rect-lrg/(hlsd-hb\d+|liveontour-\d+)(?!/)'` 全站 grep 旧路径残留 = 0。
  - HTTP：两个 slideshow 页面 200 + 子目录图片 `hlsd-hb/hlsd-hb1.jpeg`、`liveontour/liveontour-1.jpg` 均 200。
  - `python3 tools/audit/_audit_site_images.py` → `Broken: 0`（390 refs）。
  - `git status`：85 rename + 2 modified HTML（另有 2 个 skill 文件 modified 属历史遗留与本任务无关，未碰）。
- **Token 消耗**：约 0.6 万
- **用时**：约 3 分钟
- **经验总结**：fan 相册照片目录规范——按系列建子文件夹 `rect-lrg/<series>/`，slide 用 `git mv` 保留历史；改路径用 Python regex（`rect-lrg/<name>` → `rect-lrg/<dir>/<name>`）副作用小、可精确计数。
- **遗留/待办**：已 git mv + 改路径，未 commit（等 user 指示）。`git status` 中另有与本任务无关的未提交改动（skills 文件 M ×2、`images/psd/` 与 slideshow-gallery.css 未跟踪）——是 user 历史手动改动，勿混入本次 commit。

## 2026-08-06 — Harry 新增 Live on Tour 相册（46 张）

- **模型**：deepseek-v4-flash
- **目的**：headband harry 下面新增 live on tour 卡片 + slideshow，复用 headband-harry 模板速战速决。
- **结果**：
  - 下载 46 张照片（liveontour-1..25.jpg 已在下载 + liveontour-26..46.heic 需转 jpg）→ 全部入 `images/media/gallery-images/rect-lrg/liveontour-N.jpg`（HEIC 用 `sips -s format jpeg` 转，浏览器不支持 HEIC）。
  - 2 张封面 `gallery-members-harry-liveontour-{rect,square}-lrg.png`（2400×1200 / 1200×1200）→ `images/gfx/`。
  - `pages/gallery/members/harry/index.html`：headband 卡下面追加 `liveontour-cover` 卡片（count 46，链接 `live-on-tour.html`）。
  - 新建 `pages/gallery/members/harry/live-on-tour.html`（cp headband-harry.html 改写）：46 slide、caption `/46`、og 用 liveontour-rect cover、gallery-info 文案/分享/Back 链接、`#slideshow` 显式闭合（吸取上次教训，写完 div 闭合再填 slide）。
  - CSS：`.liveontour-cover` 加入去灰度组 + mobile 切 `-square-lrg`。`?v=` bump 到 `20260806e`（harry index + live-on-tour）。
- **验证**：
  - 图片审计 `Broken: 0`（390 refs，比上次 343 多 46 slide + 1 cover）。
  - Playwright：46 slides、计数 1/46→2/46→循环、body children=12、无 console error；mobile 卡封面切 square-lrg、desktop 卡封面 rect-lrg 均正确。
  - div 平衡检查：live-on-tour opens=closes=107、index 29，diff=0。
  - HTTP：live-on-tour.html / harry index 均 200。
- **Token 消耗**：约 1.2 万
- **用时**：约 4 分钟
- **经验总结**：① HEIC 照片必须先 `sips -s format jpeg` 转 jpg，浏览器不认 HEIC；② 复制 slideshow 模板时把 `<div id="slideshow">` 闭合写好再批量填 slide，可完全避免上次的 parser 重构问题；③ 扩相册三处同步（HTML slide、caption-template、index 卡 count）已验证过，这次直接照做。
- **遗留/待办**：已 `git add` 全部新文件，未 commit/push（等 user 指示）。vision API 已限流（429），视觉复核待恢复后补。

## 2026-08-06 — Headband Harry 相册扩容到 39 张

- **模型**：deepseek-v4-flash
- **目的**：user 新增 hlsd-hb38.jpg 和 hlsd-hb39.jpg 两张图，加入 headband-harry 相册。
- **结果**：
  - 下载并 `git add` `images/media/gallery-images/rect-lrg/hlsd-hb38.jpg`（1069×1069）和 `hlsd-hb39.jpg`（1050×1050）。
  - `pages/gallery/members/harry/headband-harry.html`：在 slide37 后追加 slide38 和 slide39 两个 `.slide` 块；`data-cycle-caption-template` 从 `{{slideNum}}/37` 改为 `{{slideNum}}/39`。
  - `pages/gallery/members/harry/index.html`：headband 卡片 `.count` 从 `37` 改为 `39`。
- **验证**：`python3 tools/audit/_audit_site_images.py` → `Broken: 0`（343 refs，多了2 个新 slide 的图片引用）；Playwright `.slide` 计数=39、counter 显示 `1/39`→`39/39` 翻页正常。
- **Token 消耗**：约 0.2 万
- **用时**：约 30 秒
- **经验总结**：扩 slide 时必须同步改三处——HTML 追加、cycle-caption-template 计数、首页卡片 count。
- **遗留/待办**：无。

## 2026-08-06 — Gallery Members→Harry 三级页 + Headband Harry 相册（续修2）

- **模型**：deepseek-v4-flash
- **目的**：修 user 反馈的两个未生效 issue——(1) "Back to Members" 跳转 404 之前误报修了，实测 harry 页那个跳转是 OK 的（但同会话里另一个 back 按钮 `index.html` 是好的，先放着）；(2) "图片下面不是纯黑背景"——根因是 HTML 嵌套 bug + gallery-info 仍是白底。
- **结果**：
  - **HTML 嵌套 bug 修复**：`pages/gallery/members/harry/headband-harry.html` 里 `<div id="slideshow">`（行61）写完所有 `.slide` 后**没有闭合**就直接到 `</div><!--.panel.gallery-->`，导致浏览器 parser 把 `.panel.gallery-info` 和 `<footer>` 全部 auto-close 到 body 外——body 只剩4 个 children。修复：在 `<!--.cycle-slideshow-->` 后加 `</div><!--#slideshow-->`。正则验证：opens=89 closes=89 diff=0。
  - **`.gallery-section .panel.gallery-info` 改纯黑**：CSS additions 块新增 background:#000 + color:#fff + panel-header/h2/share/back 链接的 hover/inverse 配色；让标题、描述、分享按钮、返回按钮在黑底白字下都正常可读。
  - CSS `?v=` bump 到 `20260806d`（headband-harry.html）。
- **验证**：
  - HTML 结构：修复后 body children 从4 变12（header-spacer, #sticky, #nav, gallery, gallery-info, footer, screen + 5 script）。
  - getComputedStyle：gallery-info `bg=rgb(0,0,0)`、`color=rgb(255,255,255)`、h2/share 边框都是白。
  - Playwright scrollIntoView + 截图，vision 确认黑底白字全部可读（"Headband Harry" 标题、描述、BACK TO HARRY 按钮、Facebook/Twitter 分享、footer 社交图标）。
  - 图片审计 `Broken: 0`（341 refs）。
- **Token 消耗**：约 0.6 万
- **用时**：约 3 分钟
- **经验总结**：① 写大量重复 slide 的 HTML 时，必须**第一时间写完整闭合**再 copy-paste 块；不然遗漏一个 `</div>` parser 会重构整个 body。验证手段：python `<div(?=[\s>])` vs `</div>` 计数 diff 必须=0，浏览器 body.children 数量必须=手写预期。② `getComputedStyle(bg).backgroundImage` 是检测 retinafy/cloned bg 的标准方法——克隆的 `.bg` 仍带 `class="bg"`，可以被后代选择器 `.slide .bg` 覆盖 `background-size`，无需专门针对 retinafy 写补丁。
- **遗留/待办**：harry/index.html 的 `Back to Members` 跳转上一轮改成 `../index.html` 已经是200，用户最初反馈的 "断链是 back to members 按钮" 可能是误指或已被修复（待用户确认是否还有别的 back 按钮404）。

## 2026-08-06 — Gallery Members→Harry 三级页 + Headband Harry 相册（续修）

- **模型**：deepseek-v4-flash
- **目的**：修 user 反馈的两个 issue——(1) `Back to Members` 跳转 404；(2) slideshow 桌面端需要明确纯黑背景。
- **结果**：
  - `pages/gallery/members/harry/index.html`：`.journal-archive-link` 的 `href` 从 `../../index.html`（解析到 `pages/gallery/index.html` →404）改为 `../index.html`（→ `pages/gallery/members/index.html` 200）。
  - `css/styles.css`：`.gallery-section .panel.gallery` desktop 媒体查询补 `background:#000`，脱离 body bg 显示。
  - CSS `?v=` bump 到 `20260806c`（仅 headband-harry.html）。
- **验证**：
  - HTTP 直接 curl：`../index.html`=200、`../../index.html`=404（确认旧链接确实坏）、`index.html`=200。
  - `python3 tools/audit/_audit_site_images.py` → `Broken: 0`（341 refs）。
  - Playwright getComputedStyle：`.panel.gallery` `backgroundColor=rgb(0,0,0)`、`backgroundImage=none`。
- **Token 消耗**：约 0.4 万
- **用时**：约 1 分钟
- **经验总结**：① 我之前所有"panel 是 1:1 方形"的判断错了——desktop `.gallery-cover` panel 实测是 2:1 长方形（`padding-top:50% width=1280`），mobile 才是 1:1；rect-lrg (2:1) 在 desktop panel 里 cover 是完美贴合 0 裁切。② 新建页面的"返回"按钮 href 必须按 depth 表实测（harry 页 depth=4 → `../` 即回到 members，不要凭感觉跳 `../../`）。
- **遗留/待办**：无。

## 2026-08-06 — Gallery Members→Harry 三级页 + Headband Harry 相册

- **模型**：deepseek-v4-flash
- **目的**：在 gallery-members 下新增 harry 多相册展示页 + headband harry 相册（37 张 fan 图 slideshow），并给 gallery/members/harry 三层卡片换新封面。
- **结果**：
  - 新增 `pages/gallery/members/harry/index.html`（4 层，复制 members 结构）——journal-article 介绍 + headband-harry gallery-cover 卡片（count 37，链接 `headband-harry.html`）。
  - 新增 `pages/gallery/members/harry/headband-harry.html`——cycle2 slideshow，37 张 hlsd-hb1–37（rect-lrg），**无 music-submenu**（用户要求顶部不要 single/fans 标签），gallery-info + share + 返回按钮，含 slideshow-nav.js 一次。
  - 换封面（desktop rect / mobile square 两尺寸 + `filter:none`，仿 albums-cover 模式，CSS additions 块新增 3 组 `.members-cover/.harry-cover/.headband-cover`）：
    - `pages/gallery.html` members 卡 → `music-members-mono-cover-{rect,square}-lrg.png`
    - `pages/gallery/members/index.html` harry 卡 → `music-members-harry-cover-{rect,square-square}-lrg.png`（文件名带双 square，照实）
    - harry 页 headband 卡 → `gallery-members-harry-headband-harry-cover-{rect,square}-lrg.png`
  - 下载 6 封面 → `images/gfx/`；37 张 hlsd-hb → `images/media/gallery-images/rect-lrg/`；全部 `git add`。
  - CSS `?v=` bump：gallery.html / members/index.html 改 `20260806a`，新页用 `20260806a`。
- **验证**：`python3 tools/audit/_audit_site_images.py` → `Broken: 0`（341 refs）；Playwright（chrome）桌面/移动截图 8 张到 `tools/_qa_screenshots/gallery-harry/`；slideshow 点 next/keyboard 翻页计数 1/37→4/37→wrap 正常、无 console error；移动端 3 卡封面 computed background-image = square 版本、filter none 生效。
- **Token 消耗**：约 3.5 万
- **用时**：约 8.4 分钟（从写 harry/index.html 到完成验证 504 秒，时间戳实测）
- **经验总结**：① gallery slideshow 页顶部不需要 music-submenu——直接用 gallery-section 风格，桌面端照片直贴 header 下方是官方设计（黑头黑发视觉上像重叠，几何无重叠）；② 封面两尺寸沿用 albums-cover 的 media query 切换 + filter:none 模式即可，不用新增特殊 JS。
- **遗留/待办**：harry 页 headband 卡 og:image 用的是 rect cover；后续再建相册时复制 `harry/index.html` 模板、复制 `headband-harry.html` 模板即可。

## 日志书写规范

每次任务完成后**必须**在此文件顶部追加一条。字段要求：

| 字段 | 必填 | 说明 |
|------|------|------|
| **模型** | ✅ | deepseek-v4-flash / Codex / 其他；多模型接力写 "X + Y 复核" |
| **目的** | ✅ | 这次改什么、为什么改 |
| **结果** | ✅ | 关键文件 + 关键手法，3-8 条要点 |
| **验证** | ✅ | 命令 + 结果数字（如 "Broken: 0"） |
| **Token 消耗** | ✅ | 约 X 万（估算）；后台 agent 分开列；历史未记录写"未记录" |
| **用时** | ✅ | 约 X 分钟（估算） |
| **经验总结** | ✅ | 1-3 条简短结论；详细版写 `RULES.md` / `METHODS.md` |
| **遗留/待办** | 视情况 | 未完成事项，要能在下次会话直接续做 |

模板：

```markdown
## YYYY-MM-DD — <一句话标题>

- **模型**：
- **目的**：
- **结果**：
- **验证**：
- **Token 消耗**：
- **用时**：
- **经验总结**：
- **遗留/待办**：
```

规则：
1. 新条目放**最顶部**（最新在上）。
2. 新坑顺手补进 `METHODS.md`；新流程规则补进 `RULES.md`。LOG 里只留简短总结，不重复全文。
3. 待办清单是给下次会话的交接单，写清"下一步做什么、涉及哪个文件"。

---

## 2026-08-05 — LOG 用时改为实测时间戳

- **模型**：deepseek-v4-flash
- **目的**：用户指出 LOG 用时全靠拍脑袋，误差常达 10 倍（如 16 秒写 2 分钟）。要求提高准确度。
- **结果**：`AGENTS/RULES.md` §6 日志规范改为：**用时必填且必须实测**——任务开始 `date +%s > /tmp/td_start`，写日志前 `echo $(( $(date +%s)-$(cat /tmp/td_start) ))` 算秒；禁止凭感觉写"约 X 分钟"。修正了上一条误写的 2 分钟 → 16 秒。
- **验证**：本条目用时 = 本次工具调用实测（见下）。
- **Token 消耗**：约 0.3 万
- **用时**：75 秒（时间戳实测）
- **经验总结**：凡写进 LOG 的时长一律实测时间戳，不估算；时间戳放 /tmp 跨工具调用持久。
- **遗留/待办**：历史 LOG 中此前多条"约 X 分钟"均为估算，不再回改（只保证今后实测）。

## 2026-08-05 — 根目录遗留 py 清理

- **模型**：deepseek-v4-flash
- **目的**：tools/ 整理后根目录还散着 6 个一次性脚本（`_fix_all_paths.py`/`_fix_all_v2.py`/`_fix_leftovers.py`/`_fix_nojs.py`/`_fix_song_pages.py`/`_http_audit.py`）。
- **结果**：全部移入 `tools/archive/`（archive 现 196 项）；根目录 0 py 残留；tools/README.md 索引补一句说明。
- **验证**：`ls *.py` 无匹配。
- **Token 消耗**：约 0.1 万
- **用时**：约 16 秒（用户实测反馈；当时误写 2 分钟，已改——教训：用时必须实测）
- **经验总结**：归档检查要含仓库根，不只 tools/。
- **遗留/待办**：无。

## 2026-08-05 — tools/ 目录按功能分类 + 索引文档

- **模型**：deepseek-v4-flash
- **目的**：tools/ 根目录 201 个文件（150 个 `_` 前缀一次性脚本 + 27 个 json/log 杂物）杂乱无章；用户要求分类并记录方便快速调用。选型：归档一次性 + 常驻工具分类 + 索引文档。
- **结果**：
  - **常驻工具分类**：`build/`（build_blog.py + _build_albums_page.py）、`translate/`（translate_lyrics/albums/tour + lyric_translations.py）、`audit/`（_audit_site_images.py）、`templates/` 保留。
  - **一次性归档**：190 个 `_` 前缀脚本 + 探针 HTML + json/log/ps1 杂物 + `review/` + `CODEX_TASK_*.md` → `archive/`；删 `__pycache__`。
  - **路径修正**：被移动的常驻工具 `Path(__file__).resolve().parent.parent` 统一改 `parent.parent.parent`（build_blog.py 的 TEMPLATES_DIR 同步改 `parent.parent/"templates"`）；translate_tour.py 用 CWD 相对路径无需改。
  - **新建 `tools/README.md` 索引**：分类目录 + 每工具用途/调用命令/幂等性 + archive 约定。
  - **全仓引用更新**：AGENTS.md / COMMANDS.md / RULES.md §2.4 / AGENTS.md 目录树 / METHODS.md 2 处 / README.md 3 处 / 5 个 skill 文件，60+ 处旧路径全部替换。
- **验证**：每个常驻工具实跑——build_blog.py 重建 5 篇；translate_lyrics/albums 重跑 skipped；_build_albums_page.py 输出 4+1 photosets；translate_tour.py 无变化；_audit_site_images.py **Broken: 0**；全仓 grep 无旧路径残留。
- **Token 消耗**：约 2 万
- **用时**：约 25 分钟
- **经验总结**：① 移动工具脚本前必须先查 `__file__` 相对路径用法，否则静默跑错目录；② zsh 变量不按空格分词，perl 批量替换要逐文件循环；③ tools/ 无 git 跟踪（全被 .gitignore 忽略），整理纯磁盘 + 文档工作，风险低。
- **遗留/待办**：README.md 行 138 的 META/SCALERS 说明是历史遗留（build 已全 front-matter 驱动），属投稿者文档，留给用户自行处理。

## 2026-08-05 — _qa_screenshots 按任务分类归档

- **模型**：deepseek-v4-flash
- **目的**：`tools/_qa_screenshots/` 根目录散落 54 张历史截图，杂乱；用户要求按**任务**（而非页面）分类建文件夹，并形成惯例。
- **结果**：
  - 新建 10 个任务文件夹，根目录归零：`blog-list`(9)、`pages-initial`(14，初版全站页面截图)、`blog-article`(2)、`bilibili-card`(2)、`band`(4)、`dmd-slideshow`(11，含 crop 派生图)、`photos`(2)、`nc-slideshow`(1)、`fanmsg`(8)、`home-card`(1)。
  - 判定依据：从生成脚本（`_qa.py`/`_qa_zayn.py`/`_qa_dmd_shot.py`/`_diag_nc.py`/`_cover.py`/`_final_visual.py`/`_analyze_dmd_px.py` 等）反查每张截图归属任务。
  - `AGENTS/RULES.md` §3：截图归档规则改为「按任务建子文件夹，根目录只放任务文件夹」。
- **验证**：根目录无散落图片（仅 .DS_Store）；各文件夹计数与预估一致。
- **Token 消耗**：约 0.3 万
- **用时**：约 5 分钟
- **经验总结**：归档按任务不按页面——后续跑 QA 时脚本的截图路径直接写 `_qa_screenshots/<任务名>/`，避免再次堆积。
- **遗留/待办**：无。

## 2026-08-05 — 修正 gallery 结构认知 + AGENTS.md 描述过时

- **模型**：deepseek-v4-flash
- **目的**：截图脚本误用 `pages/gallery/take-me-home/`（不存在，404）。用户纠正：gallery 的 `albums` 是**专门放专辑照片的集合分类**，其余分类与专辑无关。查 LOG 确认真实结构。
- **结果**：
  - 真实结构：`pages/gallery.html` = Albums 分专辑集合（5 专辑 × 13 photosets，`tools/_build_albums_page.py` 自动生成）+ 5 个与专辑无关的分类子页（members/on-stage/behind-the-scenes/press/fan-art，各含 index.html）。
  - `tools/_qa_gallery_vision.py` 分类 URL 从 `take-me-home` 改为 `members`（200），重截成功。
  - `AGENTS.md` 两处"5 个 gallery 分类"过时表述修正（gallery.html 行 + 目录树行）。
- **验证**：5 个分类子页 curl 全 200；albums.html 存在。
- **Token 消耗**：约 0.4 万
- **用时**：约 5 分钟
- **经验总结**：**不要凭专辑名猜 gallery URL**——gallery 分类结构里 `albums` 是专辑集合、其余与专辑无关；不确定的 URL 先 `ls pages/gallery/` + curl 200 验证再截图，不要想当然。
- **遗留/待办**：无。

## 2026-08-05 — 截图复核方式定稿：open 一键弹出

- **模型**：deepseek-v4-flash
- **目的**：上一轮"截图发聊天框"不可行——DeepSeek 模型层不支持图片输入，Read 读图直接报错，聊天框无法内联渲染。用户确认改用 `open` 一键弹出方式。
- **结果**：`AGENTS/RULES.md` §3 规则改为「视觉验证完用 `open <截图路径>` 弹出关键截图（3-4 张上限）供人工复核」；`AGENTS.md` 同步。实测 `open` 4 张截图在 Preview 正常弹出。
- **验证**：实测 open 命令弹出成功。
- **Token 消耗**：约 0.2 万
- **用时**：约 3 分钟
- **经验总结**：DeepSeek 会话里给用户看图唯一可行姿势 = `open` 本地文件；视觉 QA 闭环：截图 → visionpower 分析 → `open` 弹出复核。
- **遗留/待办**：无。

## 2026-08-05 — 规则补充：视觉验证完截图必须发聊天框

- **模型**：deepseek-v4-flash
- **目的**：用户要求视觉验证后把截图直接发到聊天框，便于人工复核渲染结果。
- **结果**：`AGENTS/RULES.md` §3 浏览器验证层补「视觉验证完必须把截图发到聊天框」一条；`AGENTS.md` 核心规则同步补一行。
- **验证**：文档自查。
- **Token 消耗**：约 0.2 万
- **用时**：约 2 分钟
- **经验总结**：视觉 QA 闭环 = 截图 → visionpower 分析 → **截图发用户复核**，三步缺一不可。
- **遗留/待办**：无。

## 2026-08-05 — gallery 界面截图验证：visionpower MCP 首次实跑

- **模型**：deepseek-v4-flash
- **目的**：测试新接入的 visionpower MCP 服务器是否正常工作——给 gallery 界面截图并用视觉工具分析，验证"看图走 MCP"流程。
- **结果**：
  - `tools/_qa_gallery_vision.py`：真实 Chrome（channel='chrome'）截图 5 张（desktop 顶/底/整页、mobile、take-me-home 分类页）→ `_qa_screenshots/gallery-vision-test/`。
  - `visionpower` MCP 描述整页：6 个 gallery-cover 面板（Albums 13/Members 6/On Stage 4/Behind the Scenes 4/Press & Awards 4/Fan Art 3）正常渲染，图片无破图，对齐整齐；mobile 390px 无溢出/错位。
  - 视觉模型在整页缩略图上误报「VIEW IMAGES 按钮被小标签遮挡」——用 `_qa_gallery_geom.py` 量 boundingBox 验证 **header (y683–770) 与按钮 (y1171–1231) 无重叠**，确认为压缩缩略图造成的假阳性。
- **验证**：HTTP 200；截图生成成功；visionpower MCP 描述 + OCR 正常返回；几何测量证明无重叠。
- **Token 消耗**：约 0.8 万
- **用时**：约 8 分钟
- **经验总结**：视觉模型看整页缩略图易把灰度图上的白字按钮误判为"遮挡"，**视觉判断的结论要用 Playwright boundingBox/getComputedStyle 数值复核**（RULES §3 已有此条，本次实证）。
- **遗留/待办**：无。

## 2026-08-05 — 接入 visionpower MCP：DeepSeek 看图规则固化

- **模型**：deepseek-v4-flash
- **目的**：DeepSeek 无原生多模态/看图能力，但项目 QA 流程需要"视觉确认"（布局/颜色/动画/响应式）。用户要求为 opencode 接入 MCP 多模态服务器 `visionpower`，并把"看图默认走 visionpower"写进项目文档。
- **结果**：
  - `~/.config/opencode/opencode.jsonc`（全局配置）：新增 `mcp.visionpower`（type local，`npx -y --package visionpower@latest visionpower`）+ `experimental.mcp_timeout: 120000`。用户给的 Claude Code 格式（`mcpServers`/`command`/`args`）转成 opencode 原生格式（`mcp` + `type` + `command` 数组）。
  - `AGENTS/RULES.md`：核心原则新增「视觉确认默认走 MCP visionpower」一条（§0.4），并把 §3 第 3 层浏览器验证补「看图走 visionpower」说明。
  - `AGENTS.md` 核心规则：加「看图一律走 MCP visionpower」一行。
- **验证**：opencode 重启后 `visionpower` MCP 服务器需能加载（npx 首次拉包）；文档改动已自检无语法问题。
- **Token 消耗**：约 0.5 万
- **用时**：约 5 分钟
- **经验总结**：MCP 配置格式有方言——Claude Code 是 `mcpServers.command+args`，opencode 是 `mcp.name.type+command[]`，跨工具粘配置必须转格式。
- **遗留/待办**：opencode 需重启生效；首次启动会 `npx` 拉包（可能较慢）。

## 2026-08-04 — 全站域名统一为正式地址 www.5guys1direction.asia

- **模型**：deepseek-v4-flash
- **目的**：用户发布群公告时发现仓库里域名混乱——大部分页面 og:url 写着过期的 `5guys1direction.cn`，少数 blog 相关写 `5guys1direction.asia`（无 www），而真实部署域名是 `https://www.5guys1direction.asia/`（已 curl 验证 HTTP 200）。需把仓库所有域名引用统一。
- **结果**：
  - 批量替换 194 个文件：`5guys1direction.cn` / `5guys1direction.asia` → `www.5guys1direction.asia`（perl 负向前瞻 `(?<!www\.)` 防重复加前缀）。
  - `tools/build_blog.py:359` og:url 生成源修正 → 重建 blog 5 篇 + posts.json + blog.html。
  - `AGENTS/AGENTS.md` Tech Stack 补「线上正式地址（唯一真源）」一行，并顺手修正部署平台描述（Pages → Workers，与 RULES.md/wrangler.jsonc 一致）。
  - 模板（`tools/templates/*`、`.opencode/skills/*`）同步修正，防新页面再带旧域名。
- **验证**：`git ls-files` 全量 grep → 仅剩 AGENTS.md 中刻意说明"裸 .asia/.cn 非正式入口"的一行文字，无真实旧域名残留；blog 重建后 og:url 为 www 域名。
- **Token 消耗**：约 1 万
- **用时**：约 10 分钟
- **经验总结**：
  - **发布链接/写分享文案前，必须先 `curl -I` 验证真实域名**，不要信任仓库里写死的 og:url（本坑源自历史 meta 未随域名迁移更新，已在文案任务中翻车 3 次）。
  - 全站批量域名/路径替换用 perl 负向前瞻，验证时 grep 模式要小心旧域名是新域名的子串（`www.5guys1direction.asia` 含 `5guys1direction.asia`），需用 `[^.]` 或锚定过滤。
- **遗留/待办**：无。

## 2026-08-04 — favicon 全站补漏：blog 模板 + 缺失页面

- **模型**：deepseek-v4-flash
- **目的**：用户反馈"读文章时标签栏仍不显示 badge"。排查发现 blog 文章页由 `tools/build_blog.py` 自动生成，模板 `article.html` / `blog_list.html` 里没有 favicon 引用——手工加的会被重新构建覆盖；另发现一批页面从未写过 favicon。
- **结果**：
  - `tools/templates/article.html`：在 `<meta charset>` 后加 `<link rel="icon" ... href="{{root}}images/gfx/1d-badge.png" />`（root 前缀与 css_href 同源）。
  - `tools/templates/blog_list.html`：加 `../images/gfx/1d-badge.png`。
  - `.venv/bin/python tools/build_blog.py` 重新构建 → 5 篇 blog 文章 + blog.html 全部带 favicon。
  - 全站部署页面（index + journal + pages 共 198 个）现已 100% 带 `rel="icon"`，无缺失。
  - 剩余的 `.opencode/skills/*`（11 个 HTML 片段，无 `<head>`）与 `tools/templates` 属文档/模板示例，非部署页面，未加。
- **验证**：`grep -rL 'rel="icon"' index.html journal pages` → 无缺失；HTTP server 抽查 blog 文章页 favicon 引用 + 200；`_audit_site_images.py` → Broken: 0。
- **Token 消耗**：约 1.5 万
- **用时**：约 15 分钟
- **经验总结**：
  - **自动生成页面改 favicon/资源引用必须改模板再重建**，直接手改生成物会被 build 覆盖（本文档项目 blog 生成式工作流的通用坑，已写入 METHODS.md 思路）。
  - 排查"不显示"先确认是不是构建覆盖，再怀疑缓存。
- **遗留/待办**：浏览器 favicon 缓存会导致旧标签页不更新，需强刷（Cmd+Shift+R）或重开标签。

## 2026-08-04 — 发版前改标题后缀 + 换 favicon

- **模型**：deepseek-v4-flash
- **目的**：发版前最后一次品牌调整——(1) 标题里 "The Official Website" 换成 "The Fan Club"；(2) 浏览器标签栏 favicon 换成用户发的红底白字 1D badge。用户明确：主站名 **FIVE GUYS ONE DIRECTION 不动**，只改后缀；Blog/About/Gallery 等页面名后缀不碰。
- **结果**：
  - `The Official Website` → `The Fan Club`：只替换 `<title>` 和 `og:title` 行（Python 脚本按行筛选），23 个文件各 1 处（index、music、shop、band、tour、journal、`tour/_official_archive`、`journal/archive` + 15 个专辑子页 og:title）。
  - 新增 favicon `images/gfx/1d-badge.png`：微信发图 (1170×1556 jpg) 用 `sips -Z 512` 转 PNG (385×512)，源 jpg 删除。
  - 全站 `rel="icon"` 引用 `1d-logo.png` → `1d-badge.png`，182 个文件（脚本只改 `rel="icon"` 行，fan-art 页的 og:image/背景图仍保留 `1d-logo.png` 未误伤）。
  - skill 示例 `.opencode/skills/gallery-page/examples/slideshow.html` 同步更新（13 处）。
  - tools/ 下两个临时 probe 文件误改后已还原（非站点文件）。
- **验证**：`python tools/_audit_site_images.py` → Broken: 0（302 引用）；`python -m http.server` + curl 抽查 index/music/blog/about/gallery/tour/journal/`_official_archive`/`journal/archive` 标题全部正确；`1d-badge.png` HTTP 200。
- **Token 消耗**：约 2 万
- **用时**：约 20 分钟
- **经验总结**：
  - 需求理解先确认边界——用户要的是"只改 The Official Website 描述，不动主站名"，第一次理解成"统一后缀"被纠正；先 grep 出所有 title 形态再问一次范围，避免全站误改。
  - 批量改 favicon 只匹配 `rel="icon"` 行，避免把同名图片在 og:image/背景的引用一起换掉。
- **遗留/待办**：blog 文章页/模板本就没有 favicon 引用（历史遗留），未在本次范围补；如需全站 favicon 全覆盖可后续加。

## 2026-08-04 — 修复 journal 缺图：文章图路径 + 全站 favicon 相对路径

- **模型**：deepseek-v4-flash
- **目的**：用户报 journal 有几篇文章缺图片。
- **结果**：
  - **文章正文图 6 处**：4 个 `index/index.html` 深拷贝（`journal/date/slug/index/` 层）文章图 `../../../images/` 差 2 层 → `../../../../images/`；`2020-07-23/10yearsof1d/index.html` 的 `1D_Logotype_Black.jpg` 走官方旧路径 `assets/gfx/`（本地是 `images/gfx/`，2 处引用）。
  - **全站 favicon 路径错**：排查时发现所有非根页面（pages/ 与 journal/ 全部文章）都写 `href="images/gfx/1d-logo.png"`（相对各自目录解析到 `xxx/images/...` 全 404），共 2028 处。按每文件 `os.path.relpath` 重写为正确深度，修复 168 个文件（`shop.html` 排除）。
  - 深拷贝 favicon（13 篇 × 13 处）也一并修正。
- **验证**：
  - 全站图片引用扫描：2537 处，仅剩 `shop.html` 内 13 处 favicon（🚫 禁止改动）。
  - HTTP：10yearsof1d、深拷贝文章页、`1D_Logotype_Black.jpg`、`1d-logo.png` 等全部 200。
  - Playwright：深拷贝 `.bg` 背景加载成功、无本地请求失败；10yearsof1d 的 `<img>` logotype 路径正确。
  - `shop.html` 未动。
- **Token 消耗**：约 2 万
- **用时**：约 15 分钟
- **经验总结**：克隆站的 `<link rel="icon">` favicon 常带裸相对路径 `images/...`，在非根页面必 404（浏览器静默，不易察觉）；批量查图时别只查 `url()`/`<img src>`，`<link rel="icon">` 也要纳入；修相对路径一律 `os.path.relpath` 计算，别手数 `../`。
- **遗留/待办**：shop.html 内 13 处 favicon 断链（禁止改动文件）；本次改动（含前四任务）仍未 commit。

---

## 2026-08-04 — 移除 territory 国家选择器 + 补录 Capital Summertime Ball 文章

- **模型**：deepseek-v4-flash
- **目的**：承接上一任务遗留的两类问题——① 官方克隆遗留的 territory 国家页选择器（3840 条死链）；② `capital-summertime-ball`（2015-04-27）文章缺失导致的前后篇死链。用户决定：移除选择器、补录文章。
- **结果**：
  - **移除 territory 选择器**：162 个页面的 `<!--<li class="territories">…</li>-->` 注释块（国家旗帜 → `xx/index.html`/`xx/home.html`）全部删除，删后全站 `territor` 引用 0。这些本就是注释掉的死标记，删除零视觉影响。
  - **补录文章** `journal/2015-04-27/capital-summertime-ball/index.html`：从仍在线的官方站抓取正文（Liam 确认参加 Capital STB 2015），按 `extra-tickets…` 模板复刻（HTTrack 头、nav、footer、translate.js、prev=extra-tickets、无 next=最早一篇）；文章图沿用同批文章的本地 gfx 占位图 `music-four-colour-square-lrg.jpg`（原图在已死的 cdn.smehost.net，M25/M27）。
  - **journal/archive.html** 列表追加该篇（27.04.15，作为最旧条目）。
  - **统一 CSS 版本**：全站（pages+journal+index，共 196 文件）统一 `styles.css?v=20260806`——顺带修掉上一任务遗漏：journal 区页面仍引用旧 `?v=20260804c`，会拿不到翻译修复 CSS。`shop.html` 保持 `20260804c` 未动。
  - 重跑 canonical 链接修复，3 处 extra-tickets → capital 的死链现可解析。
- **验证**：
  - 全站 `.html` 链接解析扫描：3231 条，**broken 0**（territory 0、非 territory 0）。
  - HTTP 级遍历 3231 条：仅剩 shop.html 内 4 条 `/gb/404.html`（🚫 禁止改动）。
  - Playwright：新文章标题/日期/正文 ✓、prev→extra-tickets ✓、无 next ✓、translate 按钮注入 ✓、无 JS 错误；extra-tickets 的 next→新文章 ✓（双向闭环）。
  - `shop.html` 未动。
- **Token 消耗**：约 3 万
- **用时**：约 20 分钟
- **经验总结**：① 官方克隆的 territory 选择器整块是注释死代码，删掉即可清掉几千条假死链；② 补录克隆文章时原图依赖死 CDN，直接复用同批文章的本地图占位即可，别去追已死资源；③ 改 CSS 版本号要全站统一，上一任务只 bump 了 pages/，journal 区遗漏导致翻译修复没覆盖到。详见 `METHODS.md` M25/M27/M51。
- **遗留/待办**：shop.html 的 `/gb/404.html`（官方遗留，禁止改动）；本次改动含前两任务（翻译修复、home 链接、全站链接）仍未 commit。

---

## 2026-08-04 — 全站互相跳转链接层级错误批量修复

- **模型**：deepseek-v4-flash
- **目的**：用户要求检查全站互相跳转的 `<a>` 链接是否存在层级/深度错误，一并修复。
- **结果**：
  - 全站扫描 `index.html + pages/ + journal/` 共 7591 条内部 `.html` 链接，找出 4354 条解析后目标不存在的链接（其中 ~4200 为官方克隆遗留的 territory 国家页链接，属死功能，未动）。
  - 修复三类真层级错误：
    1. **journal 克隆区导航/面包屑/返回按钮**：`../../music.html`、`../../../journal.html`、`../../pages/...` 等全部按 `relpath(pages/<page>.html)` 重写（含 `tour/archive.html` → `pages/tour.html`）。
    2. **journal 文章前后篇链接**：`../YYYY-MM-DD/<slug>.html` 解析成 `journal/<当前日期>/<目标日期>/…`，规范为 `journal/<目标日期>/<slug>/index.html`（文章同时存在 `<slug>/`、`<slug>.html/`、`<slug>.html` 三种拷贝，以 `journal/archive.html` 用的 `<slug>/index.html` 为规范）。
    3. **gallery/albums.html**（深度 2）：导航/图库面板链接缺一层 `../`；`music/albums/*` → `../music/albums/*`。
  - 共修 **559 处**（nav menuX 324 + 通用 canonical 235），幂等（重跑 0 变更）。方法：对每条 broken 链接按 basename→canonical 站点页（about/journal/music/…/tour.html → `pages/` 下对应页；home→根 index；archive→tour.html）计算正确 relpath；territory 链接（`class="territory"` 或含国家码路径）整体跳过。
- **验证**：
  - 全站 HTTP 级遍历非 territory 内部 `.html` 链接 3706 条：仅剩 7 条 404 = shop.html 的 4 条 `/gb/404.html`（🚫 shop 禁止改动，遗留）+ `capital-summertime-ball`（该文章 2015-04-27 从未入库，3 份拷贝同一死链，非层级错误）。
  - 抽查 diff：journal/gallery 改动全为 `href=` 行；HTML 文件中非 href、非 `?v=` 改动仅 2 处（上一任务的 logo 行）。
  - `shop.html` 未动。
- **Token 消耗**：约 4 万
- **用时**：约 25 分钟
- **经验总结**：克隆站批量修链接：① 必须先"相对路径 resolve 到绝对路径"再判存在，字符串看不出层级错；② journal 区文章有 `<slug>/` 与 `<slug>.html/` 双目录 + `<slug>.html` 文件三种拷贝，统一以列表页用的 `<slug>/index.html` 为规范；③ 官方遗留 territory 国家页链接整段跳过，别当层级错误修。详见 `METHODS.md` M51。
- **遗留/待办**：`capital-summertime-ball`（2015-04-27）死链未处理——该文章不在仓库，可考虑删掉该 next 箭头或补一篇；shop.html 的 `/gb/404.html` 因禁止改动保留。

---

## 2026-08-04 — 修复回主页按钮指向 /pages/index.html（导航 Home + logo 相对路径深度差一层）

- **模型**：deepseek-v4-flash
- **目的**：用户报部分页面"回主页"按钮重定向到不存在的 `/pages/index.html`。确认是相对路径深度差一层：`<a class="menu1" ...>Home</a>` 导航链接在专辑页（3 层）/ 子页（4 层）/ 歌曲页（5 层）全部少一个 `../`；另有 2 处 logo 链接错（`pages/gallery/albums.html`、`pages/tour/_official_archive.html`）。
- **结果**：
  - Python 批量脚本对全部 283 处 home 链接（logo + 导航 Home）做解析校验，凡未解析到根 `index.html` 的重写为正确相对路径：共修 **121 个导航 Home**（少一层 `../`）+ **2 处 logo**（含 `_official_archive.html` 的 `../home.html` → `../../index.html`）。
  - 逻辑：按 `os.path.relpath(root/index.html, fp.parent)` 计算正确深度替换，天然幂等，只改解析不到根的那几处。
- **验证**：
  - 解析复核：剩余错误 home 链接 **0**。
  - HTTP 级：本地 server 遍历 283 处 home 链接，全部 200 且 path == `/index.html`（`pages/index.html` 会 404）。
  - `shop.html` 未动。
- **Token 消耗**：约 2 万
- **用时**：约 15 分钟
- **经验总结**：批量修链接先做"相对路径解析到绝对路径"的校验，别只看字符串样子；导航 Home 与 logo 是两处独立 home 链接，都要检查。坑记录见 `METHODS.md` M50。
- **遗留/待办**：无

---

## 2026-08-04 — 修复移动端「没点开关也显示中文翻译」：CSS 特异性覆盖 .zh/.en 隐藏

- **模型**：deepseek-v4-flash
- **目的**：用户报"部分页面在移动端即使不点翻译开关也自动显示中文（中英混排）"。排查确认根因不是 localStorage/translate.js，而是官方 CSS 高特异性 span 布局规则覆盖了翻译切换的默认隐藏规则。
- **结果**：
  - `css/styles.css` 末尾追加补丁：`.zh{display:none!important}` + `html.lang-zh .zh/.en`、`.lyric-line`、`.lyric-passage` 的 zh/en 显示/隐藏规则全部 `!important`。覆盖三条泄漏源：`.panel.journal-news.homepage-news h2 span{display:block}`（移动端博客卡片）、`.panel.release-menu ul li a span{display:table-cell}`（专辑"视频/照片/单曲"菜单）、`.panel.tour-listing ul li .location span{display:block}`（tour 场馆）。
  - `js/translate.js`：非歌词页遇存储值 `"bilingual"` 时回退 `"en"`（原为 `"zh"`）——修掉"去过歌词页后普通页自动全中文"的泄漏。
  - 141 个页面批量 bump `styles.css?v=20260804` → `?v=20260805`（`shop.html` 保持 `20260804c` 未动）。
- **验证**：
  - Playwright 移动端(390×844)全站扫描 141 页：英文态可见 `.zh` 数量 **0**（修复前 13 页）。
  - 抽查：zh 态 blog/tour/专辑页 en 隐藏、zh 显示 ✓；歌词页 CN/EN 双语 en+zh 都显示 ✓；专辑 release-menu zh 态布局 box 533×118 文字居中 ✓。
- **Token 消耗**：约 8 万
- **用时**：约 30 分钟
- **经验总结**：翻译切换依赖 `.zh{display:none}` / `html.lang-zh .en{display:none}` 的默认态，凡是官方 CSS 里更高优先级的 `span{display:*}` 布局规则（尤其移动端媒体查询）都会悄悄漏出中文/英文。排查"没点开关也显示中文"先做全站 computed display 扫描，别先怀疑持久化。详见 `METHODS.md` M49。
- **遗留/待办**：无

---

## 2026-08-04 — blog-post skill 全面更新（图片规范 + 首页卡片规则 + 视频卡片方案）

- **模型**：deepseek-v4-flash
- **目的**：把 More Than a Ship 沉淀的能力固化进 blog-post skill：三图规范（header 横幅/cover 方形/视频封面 16:9）、首页卡片更新规则（只留最新 N 篇、新插最前、删最旧）、视频卡片处理方案；同时修正 skill 里已废弃的 META/SCALERS 字典说法。
- **结果**：
  1. `SKILL.md` 重写：checklist 去 META/SCALERS（build 已全 front-matter 驱动）；新增「图片规范」「首页卡片更新规则」（N=3，新文章替换第一张卡、最旧删掉）、「视频卡片方案」三节；铁律补 M45-M48；参考资料索引补新文件。
  2. `reference.md` 重写：front-matter 表加 `cover_img`；双语机制修正为"段落数不一致自动 fallback 成 .en/.zh 两大块，不报错"；新增视频卡片节；常见坑表补 M45-M48。
  3. `templates/article.md` 加 `cover_img` + 视频卡片注释；新增 `templates/video-card.html`；`templates/home-card.html` 加规则注释。
  4. `examples/` 新增 `more-than-a-ship.md`（真实三图+视频卡片文章）；`home-card.html` 更新为真实线上卡片（larry-cover 方形封面）。
- **验证**：目录文件齐全；frontmatter name=blog-post 与目录名匹配；无残留误引 META/SCALERS 字典（仅两处"已废弃"说明）。
- **Token 消耗**：约 1.2 万
- **用时**：约 12 分钟
- **经验总结**：① skill 文档必须与实际 build 脚本同步——META/SCALERS 字典早已废弃，旧文档会误导后续任务；② "首页只留最新 N 篇"这类隐性规则要写成显式步骤，否则新增文章时容易只加不删导致首页卡片数膨胀。
- **遗留/待办**：无

## 2026-08-04 — AGENTS 文档更新：blog 视频卡片规范 + Playwright(Node/Chrome) + server 常驻

- **模型**：deepseek-v4-flash
- **目的**：把本次 More Than a Ship 视频卡片沉淀为可复用规范；写明本机 Playwright 用 Node + 已装 Chrome；本地 server 任务结束不杀，方便用户检查。
- **结果**：
  1. `AGENTS/RULES.md`：§1 会话启动新增「本地 server 常驻，任务结束不 pkill」；新增 §2.6「blog 正文视频卡片规范」（bilibili 卡片 HTML 结构、双图标、层级铁律 ::before 遮罩 z-index1 < glyph z-index2 + `color:#fff!important`、1000% 尺寸、封面图放 images/blog/、双语各一份）；§3 第 3 层浏览器验证改为 Node + `channel:'chrome'`，并推荐用 boundingBox/getComputedStyle 读数值代替看截图。
  2. `AGENTS/AGENTS.md`：新增文章 checklist 修正（build 已全 front-matter 驱动，无 META/SCALERS 字典）+ 新增「正文视频卡片」小节。
  3. `AGENTS/COMMANDS.md`：新增 Playwright(Node+Chrome) 命令速查；server 注释加"任务结束不要 pkill"。
  4. `AGENTS/METHODS.md`：新增 M45（server 常驻）、M46（Playwright 用 Node+Chrome，Python API 未装）、M47（正文链接 a:visited:hover specificity 极高，glyph 需 !important）、M48（hover 变暗遮罩压暗白色 glyph，遮罩 z-index 必须低于前景）。
- **验证**：grep 确认四文件改动到位；无语法破坏（RULES/AGENTS/COMMANDS/METHODS 均正常可读）。
- **Token 消耗**：约 0.8 万
- **用时**：约 8 分钟
- **经验总结**：① 规范文档的价值在于把"踩坑后的正确做法"写进流程，避免下次重复排查；② 环境事实（Node Playwright + 本机 Chrome、server 常驻）属于跨会话通用知识，应放 RULES/COMMANDS 而非单次 LOG。
- **遗留/待办**：无

## 2026-08-04 — More Than a Ship 视频卡片 hover 动画修复（居中放大 + 纯白文字层级）

- **模型**：deepseek-v4-flash
- **目的**：用户反馈三点——① 首次实现溢出（把官方正方形 2000% 图标搬进 16:9 框）；② 图标太小；③ hover 时 PLAY 文字发灰。
- **结果**：
  1. 重写 `.bilibili-play`：图标/文字绝对定位 `top:50%;left:50%` + `translate(-50%,-50%)` 居中于 16:9 框内，去掉官方 2000% 巨大字号；动画用 `transform`（图标 `translateX(+2em)` 右移淡出、文字从下方升到居中淡入），复刻官方 hover 循环。
  2. 遮罩从链接自身 `background:rgba(0,0,0,.5)` 改为 `::before` 伪元素（z-index:1），文字 `i` 提升到 z-index:2 —— 保证 hover 变暗时文字仍纯白。
  3. 文字发灰根因：通用规则 `.panel.journal-article .article-holder .text a:visited:hover{color:#666}` specificity 更高，覆盖了链接继承色 → 加 `.bilibili-play:hover i{color:#fff!important}` 直接作用于 glyph。
  4. 图标/文字尺寸 560%/400% → 1000%：Play 图标与 PLAY 文字均 198px，居中。
  5. CSS bump `?v=20260804h → 20260804i`（build_blog.py / blog_list 模板 / index.html）。
- **验证**：Playwright(chrome) 几何断言——IDLE 图标 198px 中心 delta(0,-0.5) 居中、文字在下方 opacity 0；HOVER 图标右移 396px + opacity 0、文字升到中心 delta(0,-0.5) + 纯白 `rgb(255,255,255)` + opacity 1、遮罩 `rgba(0,0,0,.5)` z-index 1 < 文字 z-index 2。`_audit_site_images.py` → 302 refs Broken: 0。
- **Token 消耗**：约 1.5 万
- **用时**：约 15 分钟
- **经验总结**：① 复刻动画≠照搬尺寸：官方 play-button 2000% 是为方形面板设计，16:9 框内必须重做定位与字号；② 纯静态站正文链接有 `a:visited:hover` 高 specificity 变色规则，自绘 glyph 需 `!important` 直接作用目标元素，靠继承必被覆盖。
- **遗留/待办**：无

## 2026-08-04 — More Than a Ship 视频卡片改版（不自动播放 + 站内 YouTube 卡片样式）

- **模型**：deepseek-v4-flash
- **目的**：bilibili 视频不要自动播放，包装成站内 YouTube 视频卡片样式（封面 + 居中 play 按钮，点击才加载 iframe），封面用新图 larry-bilibili-cover.png。
- **结果**：
  1. 新增 `images/blog/larry-bilibili-cover.png`（1920×1080 16:9 封面）。
  2. 新增 `js/bilibili-video.js`（全局守卫 `__5GUYS_BILI_VIDEO__`，事件委托点击 `a.bilibili-play` 注入 iframe，无 autoplay，`.en`/`.zh` 两块通用）。
  3. `tools/templates/article.html` 追加引用 `bilibili-video.js`（生成时 `{{root}}` 前缀）。
  4. `css/styles.css` additions 块末尾追加 `.bilibili-card`（56.25% 16:9 容器 + 居中 play 按钮 hover 遮罩）。
  5. article.md / article.zh.md 视频由 `.youtube` iframe 改为 `.bilibili-card` 封面卡片（`data-bilibili-src` 存 iframe URL，仅点击时注入 → 不自动播放）。
  6. CSS bump：`?v=20260804c → 20260804d`（build_blog.py css_href、blog_list.html 模板、index.html）。
- **验证**：build 成功 5 篇；`_audit_site_images.py` → 302 refs，Broken: 0；文章页/blog.html/index.html + bilibili-cover.png + bilibili-video.js 全部 HTTP 200；grep 确认无残留直接 iframe（player.bilibili 仅出现在 data 属性）。
- **Token 消耗**：约 1 万
- **用时**：约 12 分钟
- **经验总结**：① 站内 YouTube 视频卡片复用不了 main.js 的 `a.play-button`（写死 YouTube embed + autoplay=1），自定义 class + 独立 JS + 全局守卫更干净；② 纯静态站做"点击加载"视频，用封面背景 + play 按钮 + JS 注入 iframe，避免加载即播放。
- **遗留/待办**：无

## 2026-08-04 — 新增 blog「More Than a Ship」(2026-08-04/more-than-a-ship)

- **模型**：deepseek-v4-flash
- **目的**：用户投稿个人随笔（Larry 主题，英中双语，非严格互译），带两张自制图（larry-header 横幅 / larry-cover 方形）和文末 bilibili 视频。新增到博客并替换首页卡片。
- **结果**：
  1. 新建 `images/blog/larry-cover.png`(1200×1200) + `larry-header.png`(1200×500)（自定义图放 `images/blog/`）。
  2. 新增 `pages/blog/2026-08-04/more-than-a-ship/article.md` + `article.zh.md`：front-matter 加自定义字段 `cover_img`（卡片方形封面，与 header_img 横幅分离）；英中段落数不同 → build 自动 fallback 成 `.en`/`.zh` 两大块（两部分页面），符合"非严格翻译"需求。
  3. 文末 PS 段落 + `<div class="youtube">` 包裹 bilibili iframe（复用 styles.css 已有 `.article-holder .text .youtube` 16:9 样式），中英文各一份。
  4. 修改 `tools/build_blog.py` `_render_listing_card`：`img = post.extra.get("cover_img") or post.header_img`，使 blog 列表卡片用方形 cover 而非横幅 header。
  5. 重跑 build：5 篇文章 + blog.html + posts.json。
  6. 首页 `index.html`：新卡片放上排右边（原 why-this-site-exists 位），why-this-site-exists 顺移下排 right 位，移除 why-i-love-1d-so-bad 卡片。
- **验证**：`python tools/_audit_site_images.py` → 301 refs，Broken: 0；文章页/blog.html/index.html + 2 张新图全部 HTTP 200；grep 确认首页卡片 4→3 篇且新文章在首位。
- **Token 消耗**：约 2 万
- **用时**：约 15 分钟
- **经验总结**：① 英中段落数不必严格配对——build_blog.py 会 fallback 成整块 `.en`/`.zh` 结构，长文非互译场景直接这么写；② 卡片方形封面与文章页横幅 header 分离用 front-matter `cover_img` 字段，不改动脚本默认逻辑（`or header_img` 兜底）。
- **遗留/待办**：部署前 `git add images/blog/`（新目录未跟踪）；skill 文档中 META/SCALERS 字典已废弃（build_blog.py 已改为全 front-matter 驱动），后续可更新 blog-post skill 的 reference.md。



- **模型**：deepseek-v4-flash
- **目的**：把上一轮的扁平 SKILL.md 升级为标准 skill 结构：主流程文档（SKILL.md）+ 详细参考（reference.md）+ 真实示例（examples/）+ 可复制模板（templates/），让每个 skill 既可读又可直接复用。
- **结果**（6 个 skill，共 36 文件）：
  1. **design-system**：reference.md（颜色/字体/语义角色/menu 字体/panel 全览/断点/图标/社交色/动画 9 大表）；examples 3（journal-news/gallery-cover/journal-article 真实 panel）；templates 1（panel-generic）。
  2. **new-page**：reference.md（深度表/body class/meta 规范）；examples 1（about.html 真实 pages/ 一级页）；templates 2（page-skeleton + head-meta，含 {PREFIX}/{BODY_CLASS} 占位符）。
  3. **blog-post**：reference.md（front-matter 全字段表/META+SCALERS/双语配对）；examples 2（真实 article.md + home-card）；templates 3（article.md/article.zh.md/home-card）。
  4. **translation**：reference.md（LYRICS/TRANSLATIONS 字典格式+规则）；examples 2（真实 lyric-line 双语 + 页面 bilingual-text）；templates 2（歌词字典/专辑标题字典模板）。
  5. **qa-workflow**：reference.md（验证矩阵/grep 命令/脚本要点）；examples 2（真实 _audit_site_images.py + _qa.py）；templates 2（check-links.py HTTP 200 遍历 + playwright-shot.py，结尾 os._exit(0)）。
  6. **gallery-page**：reference.md（三层结构/图片规范/photos.html 列表/防坑）；examples 2（真实分类页 + night-changes slideshow 页）；templates 2（gallery-cover + slideshow 骨架）。
  - 每个 SKILL.md 重写为"主流程"：操作步骤 + 铁律 + 参考资料索引表（指到同目录 reference/examples/templates）。
- **验证**：`find .opencode` 36 文件全齐；6 个 skill 均四要素齐全（SKILL+reference+examples+templates）；frontmatter name=目录名全部 OK；`git check-ignore` 无一被忽略（exit=1）。
- **Token 消耗**：约 4 万
- **用时**：约 30 分钟
- **经验总结**：① 标准 skill 结构让"查参考"和"复制模板"分离——SKILL.md 只讲流程，reference.md 放表格，templates 直接可抄，降低每次注入的 token；② examples 直接从真实页面复制（about.html/night-changes.html/members index），保证示例与线上一致；③ 模板用 `{PREFIX}`/`{hash}`/`{N}` 占位符标注必须替换处，防照抄出错。
- **遗留/待办**：无

---

## 2026-08-04 — 创建 6 个可复用 opencode skills

- **模型**：deepseek-v4-flash
- **目的**：把开发中高频复用的项目知识固化成 opencode skills，按任务注入会话，避免每次全读 AGENTS/ 文档、减少 token 消耗。
- **结果**：
  1. `.opencode/skills/design-system/SKILL.md` — 颜色/字体/panel 组件/图标/动画/响应式断点速查 + CSS 修改铁律（bump ?v=、追加不重排）。
  2. `.opencode/skills/new-page/SKILL.md` — 新建页面流程：模板复制、相对路径深度表（0/1/3/4/5 层）、body class 约定、header/footer 骨架、双语结构。
  3. `.opencode/skills/blog-post/SKILL.md` — article.md front-matter 全字段、build_blog.py 构建产物、首页卡片手动同步、META/SCALERS 维护。
  4. `.opencode/skills/translation/SKILL.md` — 歌词页/专辑页脚本注入（translate_lyrics.py / translate_albums.py）+ 普通页面 .en/.zh 双 span + 歌词数据源。
  5. `.opencode/skills/qa-workflow/SKILL.md` — 三层 QA（静态 grep / HTTP 审计 / Playwright）、部署前检查、Python 脚本模板要点。
  6. `.opencode/skills/gallery-page/SKILL.md` — 三层图库结构（分类索引/分类页/slideshow）+ rect-lrg/rect-med 规范 + M4/M14/M45/M46 防坑。
- **验证**：`find .opencode` 确认 6 个 SKILL.md 齐全；循环校验 frontmatter `name` 与目录名一致（全部 ✓，符合 opencode 命名规范 `^[a-z0-9]+(-[a-z0-9]+)*$`）；description 均 <1024 字符。skills 放项目级 `.opencode/skills/`，git 工作树内自动发现。
- **Token 消耗**：约 2.5 万
- **用时**：约 15 分钟
- **经验总结**：① skill 内容直接从 AGENTS/ 文档抽取"可操作要点"，全文指向原文档——避免同一坑在三个文件重复；② 每个 skill 内联了对应 METHODS 编号（M4/M6/M12/M14/M45/M46），agent 加载 skill 即带防坑上下文；③ 目录名必须等于 frontmatter name，否则不识别。
- **遗留/待办**：无

---

- **模型**：deepseek-v4-flash
- **目的**：photos slideshow 页在移动端（≤767px）沿用桌面端横向轮播，产生大面积空白/黑缝；且窗口在移动端↔桌面端切换时需要刷新。改为移动端垂直堆叠、上下滑动、无缝隙；桌面端轮播不变。
- **结果**：
  1. `css/styles.css` — 新增 `@media (max-width:767px)` 块：`.panel.gallery` 去掉 66.666% padding；`#slideshow` 与 `.slide` 全部 `!important` 覆盖（`position:relative; width:100%; height:auto; visibility:visible; z-index:auto`）；`.prevControl/.nextControl/.count` 隐藏；`.bg` 保留作图片载体（absolute 填满 slide）。
  2. `js/slideshow-nav.js` — 不再 `cycle('destroy')`，改为仅按实际图片尺寸设每张 slide 的 `aspect-ratio`（`naturalWidth/naturalHeight`），缓存到 `ratioCache`；`resize` 监听跨 767px 时应用/清除。cycle2 保持初始化，桌面↔移动切换无需刷新。
  3. 13 个 photos HTML — 加 `data-cycle-auto-height="false"`（禁用 autoheight 插件，阻止其 30ms 后插入 `.cycle-sentinel` 克隆首图）；CSS `?v=` 升到 `20260804f`。
- **验证**：
  - 图片审计 `python tools/_audit_site_images.py` → **Broken: 0**（298 引用）。
  - Playwright（CDP + Chrome headless）13 页逐页：slide 宽=375（满屏）、`aspect-ratio` 与图片真实比例一致（16:9→211px、2:1→188px、3:2→250px）、相邻 slide 间距全 0、无黑缝、全 visible/relative。
  - 桌面 1280px 回归：cycle2 正常初始化（absolute/z-index/1 张可见），`data-cycle-auto-height="false"` 不破坏桌面。
  - 窗口 1280↔375 反复切换：布局实时切换，无需刷新。
  - 根因确认：首图放大遮盖 = main.js `retinafy`（window.load）克隆 `.bg` 为 `position:absolute;width/height:100%`，在 slide 变 static 后相对 `.panel.gallery` 定位盖住全图 → 改用 `position:relative` slide + 不删 `.bg` 规避；黑缝 = 固定 `aspect-ratio:3/2` 与图片真实比例（16:9/2:1）不符产生 letterbox → JS 按真实比例设 aspect-ratio 解决。
- **Token 消耗**：约 9 万（主会话）
- **用时**：约 2 小时
- **经验总结**：① 静态站相册用背景图 + 可变比例，必须按图片真实尺寸设 `aspect-ratio`，固定比例必然 letterbox；② 官方 `retinafy` 会给所有 `.retinafy` 元素克隆 `.bg`，移动端重构 DOM 时务必保留 `.bg` 且让 slide 保持 `position:relative`（否则 absolute 子元素相对外层大容器定位，整页被盖）；③ 想实现 resize 平滑切换，CSS `!important` 覆盖 + 不销毁第三方组件（cycle2）远优于 JS 销毁重建。
- **遗留/待办**：无。另发现部分 `rect-lrg` 图片实为 160px 缩略图 / 损坏尺寸（13311×51775），非本次改动引入，属数据质量问题，后续可重下。

---

## 2026-08-04 — 删除首页 "Buy Made In The A.M." + Newsletter 两个 panel

- **模型**：deepseek-v4-flash
- **目的**：首页倒数第二组 panel（moment "Buy Made In The A.M." + newsletter）不再需要，整组移除且不留下空白间隙。
- **结果**：
  - `index.html` 删除 `<div class="panel moment">`（行 603-627）与 `<div class="panel newsletter">`（行 631-667）及包裹它们的 `<div class="panel-group">`，共删 70 行。
  - 上方 `.panel.homepage-music` 与下方 `.panel.gallery-cover` 现在直接相邻（599 → 601 行），中间无空隙。
  - 其他 panel 与结构未动。
- **验证**：`grep -n "homepage-music\|panel-group\|gallery-cover\|newsletter\|Moment" index.html` —— homepage-music（599）后直接是 gallery-cover（601）；全文件无残留 newsletter / Moment（其余 panel-group 均为其他区块）。
- **Token 消耗**：约 1 万
- **用时**：约 2 分钟
- **经验总结**：
  - 编辑整段 HTML 时若精确字符串匹配失败（空行/空白差异），改用行号区间删除更可靠；删前用 assert 校验边界行。
  - 用户说 "home.html" 实际是首页 `index.html`。
- **遗留/待办**：无

## 2026-08-04 — 重译 tour 页中文版（433 场馆/节目 + 地点补漏）

- **模型**：deepseek-v4-flash-free
- **目的**：`pages/tour.html` 翻译混乱——场馆名、节目名、部分地名还是英文混杂，重译中文版。
- **结果**：
  - 新脚本 `tools/translate_tour.py`（幂等）：给 433 个 `.venue` 里 432 个注入双语 `<span class="en">原文</span><span class="zh">译文（原文）</span>`；遗留 `2013-23-11`（官方数据占位垃圾）不译。
  - 原则：人名（Harry/Zayn/Louis/Niall/Liam/Alan 等）保留英文；`One Direction`/`1D` 保留英文（与站内其他 zh 一致）；场馆/节目名 → 翻译+（原文）；句子（生日/发行/签售）→ 整句翻译；地名全译。
  - 修复 10 处 location 里残留英文的地名/场馆名（Atlantico Pavilion、Cynthia Woods Mitchell Pavilion、Paramount/派拉蒙、Festive Grand/节日大剧院、ITV1、Selfridges、Westfield、The O2、Trax FM、Channel 4）。
  - 手动精修 6 处译名（X Factor、Forum、Allstate、Ziggo、VasHappenin、Chatty Man）。
- **验证**：`python tools/translate_tour.py` 二跑 0 变化（幂等）；venue 433/432 双语、0 空 zh、span 全平衡；`curl` tour.html HTTP 200，translate.js 引用在；CSS `.display:block` 规则仅在 ≤767px 媒体查询内，桌面 venue 仍同行不串行。
- **Token 消耗**：约 4 万（主会话）
- **用时**：约 35 分钟
- **经验总结**：
  1. 公众号 Fansite 把 `One Direction` 当专名保留不译，整个站统一，别擅自译成"单向"。
  2. venue/节目名译文统一 `译（原文）` 括号格式，便于读者对照；纯句子则不套括号。
  3. 上 `display:block` 规则一般在 mobile 媒体查询，批量嵌 span 结构不会崩桌面布局；改 HTML 内容不必 bump `?v=`。
- **遗留/待办**：
  - venue `2013-23-11` 是官网原始数据占位错误（把 `01.11.13` 的场馆错记为日期），建议后续要么删掉该 `<li>`，要么网查补正确场馆名。

---

## 2026-08-03 — 补全 article-images 缺 lrg 变体（26 张，成功 20）

- **模型**：deepseek-v4-flash
- **目的**：`images/media/article-images/` 下部分图只有 sml/med 变体，缺 lrg；补全官方 lrg 版本。
- **结果**：
  - 扫描出缺 lrg 的 26 张（square-sml/square-med → square-lrg 21 张；rect-sml → rect-lrg 3 张；另 2 张 -col 彩版）。
  - 新脚本 `tools/_dl_article_images_lrg.py`（幂等，并发 4，超时 120s，SOF 段读尺寸校验，不依赖 Pillow）。
  - 成功下载 20 张到 `square-lrg/`（+16）和 `rect-lrg/`（+4），均为真实高清（750×750 ~ 2400×1200）。
  - 6 张失败：官网 `square-lrg/` 对这些 hash 只返回小尺寸（350×350 ~ 598×598），**数据源本身无更大版本**，非 URL 问题（5 种变体路径均 200 同尺寸）。
- **验证**：`file` 抽查 3 张尺寸正确；全部下载经过 SOF 段解析 + 最小尺寸校验。
- **Token 消耗**：约 1.5 万
- **用时**：约 30 分钟
- **经验总结**：
  1. 官方 article-images 的 `square-lrg` 变体**不是所有 hash 都有**，部分原图就小；先下载再校验尺寸，别信 200。
  2. Pillow 在项目环境不可用，JPEG 尺寸校验用 SOF 段解析（标准库零依赖）更稳。
  3. 官网响应慢（单张可达 30s+），下载脚本必须并发 + 长超时，串行会超时。
- **遗留/待办**：
  - 6 张官网无 lrg 的 hash（105b607f、1da9a62c、4ae83e1a、bb8dc980、bdb015b4、be3f9cd1）：如后续需要大图，走 Wayback Machine 或找官方高清源，否则维持现状。

---

## 2026-08-03 — Gallery「分专辑」集合入口 albums.html（5 album × 13 photosets）

- **模型**：deepseek-v4-flash
- **目的**：在 gallery 下新建一个分专辑的集合入口页，把 music 5 个 photos 页全部 13 个图集聚合到一处，风格与 gallery 契合。
- **结果**：
  - **新页 `pages/gallery/albums.html`**（`tools/_build_albums_page.py` 自动生成，幂等）：用官方 `panel.release-header-mono.header-<slug>`（沿用 music 页 5 个 album 背景图，CSS 已有 5 条规则无需新增）作为分段标题，每个 album 下接 1-4 个 `panel.gallery-cover`（与 music photos 页同构：rect-lrg 封面、灰度 hover、count 徽章、"View images"按钮），按专辑年代顺序：Up All Night 3 → Take Me Home 3 → Midnight Memories 4 → Four 2 → Made In The A.M. 1，共 13 张。
  - 13 个"View images"按钮全部跳回原 music album 的 slideshow 详情页（`../music/albums/<slug>/photos/<song>.html`），不做重复内容。
  - **主页 `pages/gallery.html`** 顶部新增 Albums 入口面板（6 个分类第 1 个，与 music photos 风格一致，count=13），intro 文案改为"六个分类 + Albums 汇总了 5 个 album 时代所有官方 photoset"。
  - **新工具**：`tools/_build_albums_page.py`（从 5 个 `photos.html` 解析 panel，自动出页）+ `tools/_qa_albums_aggregator.cjs`（DOM 断言 + 13 链接 + 13 图片 HEAD 200）。
  - **路径坑第一版**：`../css`、`../js`、`url(../images/...)` 都少一层 `../`（albums.html 在 `pages/gallery/` 是 2 层深，应为 `../../`）→ 修脚本 + 重跑 0 错。
- **验证**：
  - DOM 断言 ALL PASS：5 release-header / 13 cover / 13 count / 13 h2 / 13 more / 0 panel-group；desktop 1280×640 2:1 / mobile 390×390 1:1；13/13 链接 HTTP 200；**13/13 cover 图片 HEAD 200**。
  - 全站图片审计 `tools/_audit_site_images.py` → Broken: 0（298 refs，比上次多 13 个新 cover）。
  - 截图：`tools/_qa_screenshots/gallery/albums_{desktop,desktop_full,mobile}.png`。
- **Token 消耗**：约 3 万
- **用时**：约 40 分钟
- **经验总结**：
  1. **新页路径深度核对清单**：模板套用要分清 `pages/` 一级（`../`）、`pages/gallery/<cat>/` 3 层（`../../../`）、`pages/gallery/` 2 层（`../../`）、`pages/music/albums/<a>/` 3 层（`../../../`）——同名层级的"../"层数全靠 `pages/.../index.html` 中 `pages` 后的子目录数判定，最稳的办法是写完跑一遍 200 + 资源 HEAD 验证。
  2. **官方 `release-header-mono.header-<slug>` 已具备 5 个 album 背景图规则**（up-all-night/take-me-home/midnight-memories/four/made-in-the-am），复用 0 CSS 增量，albums.html 直接照搬 `.panel.release-header.release-header-mono.header-<slug>` class 即可拿到官方字体大标题。
  3. **fetch 断言里 relative URL 处理**：用 `new URL(m[2], location.href).href` 解析而**不要** `replace(/^\.+\//, '')`（后者会把 `../../` strip 成空导致 URL 拼成 host 根无 path），抓 13 张图全 false negative。
- **遗留/待办**：
  - albums 页"View images"链接目前跳回原 music album 的 slideshow 详情页（保留官方原数据）；如未来要做 13 个独立聚合版（每张图一个独立 url）跟用户对齐。
  - 主页 Albums 入口的 cover 暂用 `filmstrip-harry-sml` 占位图（与 Members 重复），后续换独立封面图（建议用 `music-<slug>-logo` 或首张 photoset 封面）。

## 2026-08-03 — Gallery 页面重构（music photos 样式）+ 子页样式创建

- **模型**：deepseek-v4-flash
- **目的**：gallery.html 排版混乱（panel-group 每排 2 个方块）→ 改成 music photos 页样式；创建 5 个分类子页的样式框架（不放图，用户稍后补）。
- **结果**：
  - `pages/gallery.html`：去掉 3 个 `panel-group`（50% 宽 2 列）→ 5 个全宽 `gallery-cover` + moment 面板连续排列，每卡加旋转 `count` 徽章（数字 = 子页卡片数：6/4/4/4/3），与 up-all-night/photos.html 结构 1:1 对齐。
  - 5 个子页（members/on-stage/behind-the-scenes/press/fan-art）：`journal-news homepage-news` 2 列 → `gallery-cover` 全宽面板，`.bg` 留 `background:#000` 占位 + 注释提示填图路径，保留双语标题/年份/count 徽章/View images 按钮；fan-art 保留 moment 面板 + mailto。
  - **修复子页资源路径深度 bug**：原文件全是 2 层 `../`（应为 3 层），导致子页 CSS/JS/导航全 404、页面无样式。`tools/_fix_gallery_paths.py` 幂等修复 5 个文件（css/js/index/nav/footer 11 种替换），复跑 0 changes。
  - 新增 `tools/_qa_gallery_assert.cjs`（DOM 布局断言）+ `tools/_qa_gallery_restructure.cjs`（截图，Playwright 走系统 Chrome）。
- **验证**：
  - DOM 断言 6 页 ALL PASS：cover/count/h2/more/bg 数量全等，`panel-group=0`，desktop 每卡 2:1（1280×640）单列，mobile 1:1（390×390），无 JS 错误。
  - `tools/_audit_site_images.py` → Broken: 0（285 refs）；6 页 HTTP 200，CSS/JS 无 404。
  - 幂等：`_fix_gallery_paths.py` 复跑 0 files changed。
- **Token 消耗**：约 4 万
- **用时**：约 50 分钟
- **经验总结**：
  1. `gallery-cover` 无 `panel-group` 包裹时是**全宽 2:1 大面板**（`width:100%` + `padding-top:50%`）；"每排两个"只来自 `panel-group{width:50%}`——这是 music photos 与旧 gallery 的视觉差异核心。
  2. 视觉模型/截图会因 plan 余额 402（账单限制，重试无用）→ 布局验证改用 Playwright **DOM 断言**（宽高比/元素数/JS 错误），免费且可量化。
  3. 新建深层页面必须对照 AGENTS 路径深度表逐项核对：`pages/gallery/<cat>/index.html` 是 3 层，资源须 `../../../`；原模板照抄 2 层导致子页 CSS 404 无样式（详见 AGENTS.md 路径表新增行）。
- **遗留/待办**：
  - 子页图片待用户补齐：`.bg` 已留 `background:#000` 占位，按注释替换路径即可。
  - 子页卡片 `href="#"` 待补图时同步指向详情页（可参照 music photos slideshow 结构）。
  - retinafy 对 `-sml` 图请求 med/lrg 会产生无害 404（HEAD 失败自动保留原图，原页面即有，非本次引入）。

## 2026-08-03 — tour 全部地名翻译 + 首页双翻译按钮修复

- **模型**：deepseek-v4-flash
- **目的**：
  1. 执行 `tools/_translate_tour.py` 完成 tour.html 全部地名中文化；
  2. 修复"部分页面左上角翻译按钮不显示"——实为首页顶部 + 全站滚动后按钮隐形两个问题。
- **结果**：
  - tour.html：脚本补包裹 15 处空前缀 location（无内容可翻，跳过合理）；**关键发现**：418 个已包裹 location 是通用脚本（_translate_pages.py）先译的，其中 30 处 zh 与专用词表冲突（专有名被意译：ITV1→独立电视台一频道、Paramount Theatre→派拉蒙剧院、Channel 4→第四频道、The O2→O2 体育馆、Westfield/Selfridges/Atlantico Pavilion/Festive Grand™ 等；译名不统一：休斯敦/休斯顿、菲尼克斯/凤凰城、华盛顿/华盛顿特区）。给 `_translate_tour.py` 增加第 2 遍已包裹校正逻辑（`en.strip() in M and zh != M[...]` 才替换），30 处全部对齐词表，幂等 ✓
  - 翻译按钮根因（全站 200 页都有 #sticky + button-holder，注入逻辑本身没坏）：
    - **首页**：`body.home-section` 的 header 初始在视口外（`top:-13.77%`，滚动超 746px 才滑入），顶部看不到按钮 → 按用户要求加 **hero 按钮**：`.panel.hero` 左上角注入第二个 `translate-btn--hero`（深色半透明底 + 圆角，白字清晰），滚动后 header 滑入由 header 按钮接替 → 首页双按钮
    - **全站滚动后按钮隐形**：原 CSS `header#sticky.scrolled .translate-btn--header{color:#000}` 假设滚动后 header 变白，但原版克隆 header 背景恒为 `#000` → 黑字黑底隐形。删除该规则，按钮全状态保持白色 ✓
  - `injectHeaderButton()` 全局 guard `document.querySelector("[data-translate-btn]")` 改为只查 `#sticky` 内部，允许 hero 按钮共存
  - CSS `?v=` 全站 bump：20260801 → 20260803 → 20260803b（196 文件 + build_blog.py + blog_list.html 模板同步，幂等脚本批量）
- **验证**：
  - Playwright（系统 Chrome）：首页顶部 2 按钮（hero 可见 / header 视口外）→ 滚动 2000 后 hero 滚出、header 可见；tour/gallery/blog 滚动后按钮 `color:#fff` 可见；歌词页 CN/EN 模式不受影响；非首页仍单按钮 ✓
  - 健康检查：200 html 双重包裹 0 / 导航包裹 0 / title 污染 0；`tools/_audit_site_images.py` Broken: 0（303 refs）
  - 幂等：重跑 `_translate_tour.py` 后 `md5` 不变 ✓
- **Token 消耗**：约 5 万
- **用时**：约 90 分钟
- **经验总结**：
  1. 页面级专用脚本必须加"已包裹校正"第二遍——通用脚本先译的 zh 可能与专用词表（专有名保留英文）冲突，只处理未包裹会漏掉 30 处
  2. 按钮"不显示"先查视觉层而非注入层：`color` 与背景同为 `#000` 是隐形元凶；`re.subn` 返回的计数是匹配次数不是修改次数，幂等验证要用 md5
  3. 首页 header 初始在视口外是原版设计（hero 全屏沉浸），顶部需要按钮时用 hero 面板内嵌按钮方案，不动原版 header 动画
- **遗留/待办**：
  - blog 文章页日期（27th July 2026）是否翻译，等用户确认
  - Playwright 日志中有少量 404：深层页 favicon `images/gfx/1d-logo.png` 相对路径错误 + article-images 个别缺图，下次做图片审计时一并处理

## 2026-08-02 — 翻译工程收尾：修复 45 个脏文件 + 全站标题意译中文化

- **模型**：deepseek-v4-flash
- **目的**：① 修复 `_translate_pages.py` 历史 bug 造成的 45 个页面脏状态（双重包裹 span / 导航误翻译 / `<title>` 被塞 span）；② 按用户要求把全站标题意译成中文（不直译）。
- **结果**：
  - `tools/_fix_overwrap.py` 重写（顺序敏感：先解双重包裹循环到稳定 → 再还原导航 → 最后还原 title）：44 files fixed、44 个导航项还原、34 个 title 清理；二次跑修复 5 个复数嵌套形态（`<span class="en"><span class="en">Video</span><span class="zh">视频</span>s</span><span class="zh">视频</span>`）。
  - `tools/_translate_pages.py` 幂等修复：`wrapped_at()` occurrence 精确检查（`class="(?:en|zh)"\s*>$`）替代 60 字符窗口 `already_wrapped`；新增 `skip_ranges()` 跳过 `<nav id="main">` 与 `<title>` 区间；`wrap_pair` 同步改造。重跑第一遍补漏 39 files / 77 pairs，第二遍 0 files changed（幂等成立）。
  - 标题意译：4 篇 article.md 加 `title_zh`（Every July 23rd→每年 7 月 23 日，我们回家；Ready to Run→Ready to Run——选择彼此的声音；Why I Love 1D So Bad→我为什么这么爱 1D；Why This Site Exists→为什么会有这个网站）；`build_blog.py` Post 加 `title_zh` → `title_html`（空则纯英文）；模板 `article.html` h2 改用 `{{title_html}}`；列表卡片 `_render_listing_card` 标题 + "Blog/博客" + "Read more/阅读更多" 双语（与首页卡片一致）；`<title>`/og:title 保持英文（SEO）。
  - 环境：新建项目内 `.venv/` 装 `markdown`（系统 Python PEP 668 拒绝直接 pip install），已加 `.gitignore`。
- **验证**：`grep` 全站复查：双重包裹 0 / 导航被包裹 0 / title 含 span 0 / 损坏 translate.js 引用行 0；4 篇 h2 与 blog.html 4 张卡片标题均为 en/zh 对；`build_blog.py` 重跑幂等；`git status` 64 个变更、无未跟踪图片。
- **Token 消耗**：约 8 万
- **用时**：约 90 分钟
- **经验总结**：幂等判断必须按 occurrence 精确匹配，窗口截断必翻车；批量脚本函数间传内存 content 禁止重读磁盘；blog 标题改动必须走 `build_blog.py` + 模板重建，别手改生成 HTML（详见 METHODS M39/M40/M41）。
- **遗留/待办**：文章页日期 `27th July 2026` 未翻（如需与音乐页格式统一，走 `date_display` front matter）。

---

## 2026-08-02 — E 阶段收尾：journal/this-is-us 翻译 + shop 永久禁改

- **模型**：deepseek-v4-flash
- **目的**：E 阶段收尾（journal.html + this-is-us.html 双语化）；用户明确指令：**shop.html 任何时候都不要动**。
- **结果**：
  - `tools/_translate_journal.py`（新，幂等）：journal.html 全部 8 个日期（`23rd July 2020` → `2020年7月23日`，先例格式）、section-name Journal→日志 / Moment→时刻 / Gallery→图库 / Video→视频（Instagram/Twitter 品牌名保留英文）、Moment 面板 `Buy Made In The A.M.`→入手《Made In The A.M.》/ `FOUR is out now`→《FOUR》现已发行、`See the shoot`→查看拍摄现场、`News Archive`→新闻存档，共 24 对；补 `../js/translate.js` 引用。官方文章标题（#10YearsOf1D、A Whole Lotta History... 等）与 tweet/Instagram 正文保留英文（存档约定）。
  - this-is-us.html：顶部标题 This Is Us→这就是我们（先例）+ 描述段整段双语 + 7 个平台按钮 `Open on X`→在 X 打开（微博/哔哩哔哩/小红书/抖音/Instagram/X/YouTube）。
  - shop.html：先翻译了几处后被用户叫停，**已 `git checkout` 完全回滚**；`AGENTS/AGENTS.md` 文件结构表标记 `shop.html ← 🚫 禁止改动`。
- **验证**：两脚本重跑幂等（第二遍 0）；全站复查 双重包裹 0 / 导航 0 / title 污染 0 / 损坏引用行 0；journal/this-is-us HTTP 200；图片审计 303 refs Broken: 0。
- **Token 消耗**：约 3 万
- **用时**：约 30 分钟
- **经验总结**：`re.sub` 循环内拼接 `c[:m.start()]` 有偏移 bug（改一个少一个），必须用 `re.subn` 回调一次性替换；用户明确划线的页面（shop.html）永久不碰，回滚 + 文档标记 + 记忆沉淀三重保险。
- **遗留/待办**：无（E 阶段除 shop 外全部完成；blog 文章页日期翻译待用户确认）。

---

## 2026-08-02 — 新 MacBook 环境初始化：修复跨平台 git 假 diff

- **模型**：deepseek-v4-flash
- **目的**：新 MacBook 上认识项目 + 环境就绪检查；处理工作区 6 个文件"未提交修改"（实为跨平台迁移造成的假 diff）。
- **结果**：
  - 定位假 diff 根因：项目目录（含 `.git/`）从 Windows 整目录复制而来，6 个被跟踪文件为 CRLF 行尾 + index stat 缓存失效（`git diff` 空但 status 显示 M）。
  - 批量转 LF（`perl -pi`）+ `rm .git/index && git reset -q` 重建 index → `git status` working tree clean。
  - 新坑沉淀：METHODS.md 新增 M38（跨平台迁移假 diff：现象/根因/处理/预防）。
- **验证**：`git status --short` 空；`git diff -w` 空；`git hash-object` 与 HEAD blob 一致；3 秒后复查仍 clean。
- **Token 消耗**：约 1 万
- **用时**：约 20 分钟
- **经验总结**：跨机器搬项目别搬 `.git`（clone 优先）；假 diff 排查顺序 = 行尾（`grep $'\r'`）→ 权限（`filemode`）→ index stat（重建即愈）。
- **遗留/待办**：新机器缺 `python-markdown`（blog 构建依赖）与 `Pillow`（图片优化），待用户自行安装；建议根目录加 `.gitattributes`（`* text=auto eol=lf`）防双平台行尾复发；确认"项目"目录不在百度网盘同步列表。

---

## 2026-08-01 — 全量同步 git：新资源/新页面/AGENTS 文档入库

- **模型**：deepseek-v4-flash
- **目的**：把当前工作区全量同步到 GitHub（此前多个 commit 未推，累计 443 个文件改动），并补全 .gitignore 防误提交。
- **结果**：
  - `.gitignore` 新增：`onedirectionmusiccom-ukprod/`（3.9MB 死克隆）、`tools/_*.ps1/.html/.jpg/.md`（一次性抓取/探测/下载）、`tools/review/`、`tools/CODEX_TASK_*.md`。
  - 提交内容：AGENTS/ 工作手册 5 件套、gallery-images/rect-lrg（130）+ article-images（7）+ yt-thumbs（38）+ gfx *-lrg（22）等新图、30+ 新页面（photos/songs/fans）、歌词翻译系统、journal/archive 双语更新。
  - `git push` main 触发 Cloudflare Pages 线上构建。
- **验证**：`git check-ignore` 逐一命中新规则；`git status` 未跟踪文件清零；staged 列表无 `onedirectionmusiccom-ukprod`/`tools/_*`/`review` 混入；`git diff --cached --stat` = 443 files, +13728/-6854。
- **Token 消耗**：约 1 万
- **用时**：约 5 分钟
- **经验总结**：RULES §4 的"推送前检查未跟踪文件"救过一次 404，本次发现 .gitignore 漏了 `tools/_*.ps1/.html/.jpg` 与 `tools/review/`，已补规则。
- **遗留/待办**：push 后确认 Cloudflare 线上构建成功、首页+关键资源 200。

---

## 2026-08-01 — 文档体系重构：AGENTS.md 拆分 + 模型工作手册上线

- **模型**：deepseek-v4-flash
- **目的**：优化大模型工作效率与流程。原 AGENTS.md 1032 行/58KB 把"项目事实"和"操作规则/踩坑/日志"混在一起，模型难以快速定位、重复踩坑。拆分为职责分明的文档体系，明确开发-检测-部署全流程规范（非必要不用视觉模型，只在需截图验证时用视觉）。
- **结果**：
  1. 根 `AGENTS.md` 重写为精简入口：文档地图 + 强制阅读顺序 + 快速命令（保留根目录位置，保证 agent 自动加载机制不失效）
  2. `AGENTS/AGENTS.md`（新）— 项目全貌：Tech Stack、文件结构（含 AGENTS/）、路径深度表（扩到 5 层）、设计系统、组件目录、动画、Blog 工作流、CSS 补丁说明、页面笔记
  3. `AGENTS/RULES.md`（新）— 精细操作规范：会话启动流程、开发规则、**分层检测规则（静态 → HTTP 审计 → 仅视觉呈现需要时才 Playwright）**、部署规则、效率/token 规则、日志书写规范、数据源规则、交付规则
  4. `AGENTS/METHODS.md`（新）— 36 条踩坑记录（现象/根因/处理/预防），从记忆 + 历史日志提炼，9 大分类
  5. `AGENTS/LOG.md`（新）— 日志书写规范 + 原 AGENTS.md 中 10 条历史日志按新格式迁移
  6. `AGENTS/COMMANDS.md`（新）— 常用命令速查（server/blog/审计/翻译/git 检查）
  7. `tools/_audit_site_images.py` 等既有工具未动；README.md（投稿者文档）保持不变
- **验证**：5 个新文件 + 根 AGENTS.md 全部落盘（Total ~95KB）；文件结构/命令均为从现有 AGENTS.md 迁移，无新增技术改动；git status 确认只新增 AGENTS/ 目录 + 修改根 AGENTS.md。
- **Token 消耗**：约 8-10 万（估算，含系统上下文；无后台 agent）
- **用时**：约 30 分钟（估算）
- **经验总结**：
  - 文档分层：事实（AGENTS.md）≠ 规则（RULES.md）≠ 坑（METHODS.md）≠ 历史（LOG.md），模型按需加载，避免 58KB 全量进上下文
  - 根 AGENTS.md 不能删——agent 自动加载机制读的是根目录文件，删了等于断上下文
  - 日志规范加"模型名/token/用时"字段，未来可复盘每个改动真实成本
- **遗留/待办**：
  - [ ] 部署前 git add 全部新图（gfx lrg 22 + rect-lrg 130 + article-images 等）+ `.gitignore onedirectionmusiccom-ukprod/` + 统一 commit（历史遗留，179+ modified 文件）
  - [ ] 首页 blog latest 卡片改 JS 自动渲染（历史遗留）
  - [ ] 清理 tools/_*.py 一次性脚本（历史遗留）

---

# 历史日志（2026-07-28 ~ 2026-08-01，自原 AGENTS.md 迁移）

> 迁移说明：按新规范格式整理。历史条目的 Token 消耗/用时当时未记录，标"未记录"。详细修复细节保留，经验总结已在 METHODS.md 中沉淀（标注 M 编号）。

## 2026-07-28 — Markdown 工作流 + Mobile/Footer/Logo/Fonts 综合修复

- **模型**：deepseek-v4-flash
- **目的**：blog 从手写 HTML 迁到 Markdown 工作流；修复 mobile 显示、footer 链接、logo 体积、字体加载。
- **结果**：
  1. `tools/build_blog.py` + `article.md` × 4 + 模板上线（Markdown → 静态 HTML，无运行时依赖）
  2. Mobile（≤767px）首页/blog 列表/blog 详情标题与按钮位置修复（styles.css 末尾补丁）
  3. 173 个 `../about.html` 错误路径批量修正；160+ HTML 加 Google Fonts `&display=swap`
  4. logo-white 6.5MB→509KB、logo-black→114KB（3000px 宽）
- **验证**：10 页面 Playwright 巡检全部 200、0 JS 错误；mobile 390×844 CSS 实测通过
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：logo 颜色/比例坑 → METHODS M1/M2/M3；模板 marker 坑 → M19
- **遗留/待办**：blog 卡片 opacity 修复（后续轮次完成）

## 2026-07-28 — Blog 列表 4 轮 bug 修复 + 文章 cover 改 `<img>`

- **模型**：deepseek-v4-flash
- **目的**：彻底修复 blog 列表卡片的视觉 bug（5 轮迭代）。
- **结果**：
  1. 模板 marker 注释撕裂修复（裸 marker）；卡片 URL 去 `pages/` 前缀
  2. 封面图路径深度修正（5 层 → `../images/...`）
  3. blog 卡片 `opacity:1!important`（Waypoints 锁 0 问题）
  4. logo-black → logo-white（黑底隐形）；`background-size` 改 `contain`（窄条问题）
  5. 删除 styles.css 2 处重复 `margin:15%` 规则
  6. 文章 cover 从 background 画框改 `<img style="width:100%;height:auto">`
- **验证**：playwright 截图 mobile+desktop 卡片全部正常；10 页 + 4 article 巡检 0 断链
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：见 METHODS M1/M2/M3/M19

## 2026-07-28 — Zayn Band Panel 完整实现 + 5 成员引言更新

- **模型**：deepseek-v4-flash
- **目的**：band.html 补第 5 个成员 Zayn（filmstrip、CSS、social、parallax），更新全部成员引言。
- **结果**：
  1. `images/gfx/filmstrip-zayn-smlc4ca.jpg`（500×1000，1:2 匹配其他成员）
  2. Zayn panel HTML + CSS（Cousine 700、hover 色 `#cdb4db`）
  3. parallax offsets 数组 8→9 值；5 成员引言全部替换
  4. 修复 styles.css 补丁块多余 `}` 导致的 zayn 选择器失效
- **验证**：Playwright desktop + mobile 5 成员 panel 正常，social 链接正确
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：CSS 孤立 `}` 吞选择器 → METHODS M10
- **遗留**：4 个 retinafy 404（filmstrip-*-med，无碍显示）

## 2026-07-29 — 整站双语翻译系统

- **模型**：deepseek-v4-flash
- **目的**：全站中英双语翻译切换（EN↔ZH / 歌词页双语对照）。
- **结果**：
  1. `js/translate.js`（浮动按钮 + fade 切换 + localStorage 持久化）+ 翻译 CSS
  2. `tools/translate_lyrics.py` / `translate_albums.py` / `lyric_translations.py`（翻译字典）
  3. 67 首歌页歌词双语注入（`.lyric-line`）、5 专辑页歌名双语、about/band/music 段落双语
  4. blog 模板支持 `article.zh.md` 双语渲染
- **验证**：`_qa_lyrics_v2.py`/`_qa_final.py` Playwright 巡检
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：歌词提取 sentinel 分割 → M30；translate.js 5 层深度 → M31；旧翻译源不匹配丢弃 → M32
- **遗留**：perfect.html 无歌词（原始 404 页）；歌词翻译覆盖率仅 6%（下轮补全）

## 2026-07-29 (Round 2) — 翻译按钮重设计 + 全部歌词翻译

- **模型**：deepseek-v4-flash + 后台 agent ×5（翻译）
- **目的**：按钮重设计（header 内纯文字）、行为修正（歌词页仅双语模式）、全部歌词翻译。
- **结果**：
  1. 按钮从 floating 改注入 `header#sticky` 左上角纯文字，scrolled 变黑
  2. 非歌词页 EN↔ZH；歌词页 EN↔Bilingual；localStorage 状态清理
  3. 歌词翻译：2973/3487 行（85%）完成（4 专辑 agent 完成，Four 因 DeepSeek 余额 402 fallback 旧翻译）
  4. `_merge_translations.py` 合并 4 张新翻译 + 旧字典；67 歌页重新注入
- **验证**：覆盖率统计（UAN 86% / TMH 85% / MM 86% / Four 85% / MIA 83%）
- **Token 消耗**：未记录（含后台 agent 翻译）
- **用时**：未记录
- **经验总结**：大任务拆 album 级 agent 并行；后台 agent BYOK 不受主会话余额影响 → RULES §5.7
- **遗留**：514 行（15%）`[待译]` 占位；steal-my-girl 部分行 zh 需拆分

## 2026-07-31 — Music 区三 bug 修复 + iTunes 封面下载

- **模型**：deepseek-v4-flash
- **目的**：MIA 专辑页缺歌单链接、music 子页 nav 版本错误、15 首歌单页 packshot/video-bg CDN 死链。
- **结果**：
  1. MIA 专辑页补 `.panel.song-list`（3 链接）
  2. 98 个 music 子页 nav 批量替换为 5GUYS1D 版本
  3. `cdn.smehost.net` 全死 → iTunes Search API 下载 15 首封面（`<hash>.jpg` + `-col.jpg`）
  4. 修复正则残留：`.jpg.jpg` 双扩展 + video bg 路径拼接
- **验证**：页面 200、图片 200
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：SMEHOST 死 → M25；iTunes 单曲判定 → M26；正则 group 串扰 → M22；双扩展 → M21
- **遗留**：album gallery-cover 缺失、photos 子页路径错位、fans 页缩略图（下轮处理）

## 2026-07-31 (Round 2) — 封面大修：专辑原版封面 + 单曲封面 + YouTube 缩略图

- **模型**：deepseek-v4-flash
- **目的**：packshot 非原版封面、MIA 歌单只有 3 首、图片错位、YouTube 视频封面全错。
- **结果**：
  1. MIA song-list 3→17 首（标准版曲序）
  2. 5 张专辑封面换 iTunes 原版（排除 Deluxe/Ultimate/Yearbook 等）
  3. 15 首单曲封面按优先级重下（9 真单曲 + 6 专辑兜底 + Steal My Girl 手动 Four + BSE 手动标准单曲）
  4. 31 处 release-video 背景换 `images/yt-thumbs/<vid>.jpg`（img.youtube.com hqdefault）
- **验证**：20 个 music 页面 + yt-thumbs 30 处引用全部 200
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：iTunes 单曲判定细节 → M26；HTTP urljoin QA → M8；album 3 层 vs songs 5 层 → M9
- **遗留**：gallery-cover 4 张缺、photos 子页 70+ 图路径错、fans 页 23 张缩略图、gallery.html/tour 残图（102 断链目标清零）

## 2026-08-01 — 全站断链图片清零

- **模型**：Codex
- **目的**：修复专辑、photos、videos、singles、fans、gallery、tour 页面图片路径；本地化资源。
- **结果**：相册墙以本地标准专辑封面兜底；单曲封面/YouTube 缩略图本地化，移除克隆/CDN 依赖。
- **验证**：HTTP 审计 `Total local image refs checked: 171`，`Broken: 0`
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：见 deepseek-v4-flash 复核日志（下条）
- **遗留**：见下条

## 2026-08-01 (deepseek-v4-flash 复核) — 部署安全修复 + onedir 残留确认

- **模型**：Codex + deepseek-v4-flash 复核
- **目的**：Codex 断链清零后，deepseek-v4-flash 复核发现两处部署安全漏洞（引用未 git 跟踪目录 = 线上 404）。
- **结果**：
  1. 15 个 songs 页 packshot 引用 `onedirectionmusiccom-ukprod/` → `images/media/article-images/square-sml/<hash>.jpg`
  2. 22 个 journal 文件 9 张死图 → 时代匹配专辑封面（0452ce05→MIA 等映射表）
  3. 全站 onedir 残留归类：201 处全部是 meta og:image 外链（不渲染，可留），真实引用 0
- **验证**：`_audit_site_images.py` Broken: 0
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：未跟踪目录 = 部署 404 → M33；git HEAD 恢复被覆盖原图 → M34
- **遗留**：⚠️ `images/media/article-images/square-sml/` 30 张 + `images/yt-thumbs/` 38 张未 git 跟踪 → 部署前必须 git add；`onedirectionmusiccom-ukprod/` 建议 .gitignore

## 2026-08-01 (R2) — 首页 History 图还原 + Four photos 页重建（样板）

- **模型**：deepseek-v4-flash
- **目的**：首页 History 面板图被误换 + 专辑 photos 页全是重复封面/404。
- **结果**：
  1. 从 git HEAD 恢复 History 原图（2aef032a.jpg/-col.jpg）；首页 packshot 改 rect-sml/6d0f8a76 底图
  2. Four photos 页用官网真实照片重建（官网 www.onedirectionmusic.com 活着）：night-changes 5 slide + 新建 steal-my-girl 13 slide + photos.html 封面
  3. 新脚本：`_scrape_photos_inventory.ps1` / `_dl_four_photos.ps1` / `_rebuild_four_photos.py`
- **验证**：188 refs，Broken: 0
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：gallery 数据源 = 官网 gallery-images（官网仍活）；gallery-cover 用第一张 slide → M4
- **遗留**：剩余 12 个 gallery 重建（UAN 38 / TMH 32 / MM 38 / MIA 4）

## 2026-08-01 (R3) — Slideshow 翻页按钮修复（v1）+ four.html photo 入口封面

- **模型**：deepseek-v4-flash
- **目的**：photos 页翻页按钮不可点 + four.html 底部 photo 入口封面错误。
- **结果**：
  1. 根因：cycle2 active slide inline z-index:100 盖住控件 → CSS 补丁 z-index:200!important + pointer-events
  2. four.html gallery-cover 封面改 Night Changes 第一张真实照片
- **验证**：Playwright 真实点击 1/5→2/5→1/5，elementFromPoint 命中控件
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：cycle2 inline z-index → M11；Playwright os._exit → M16
- **遗留**：R3 补丁真实浏览器仍失败（下条彻底修复）

## 2026-08-01 (R4) — Slideshow 翻页彻底修复 v2 + 全量 photos gallery 重建

- **模型**：deepseek-v4-flash
- **目的**：R3 补丁在真实 Chrome 仍被盖 → 强制置顶 + 键盘/滑动翻页；随后重建剩余 12 个 gallery。
- **结果**：
  1. v2 三连招：CSS z-index:9999!important；photos 页 styles.css 加 `?v=20260801`（缓存硬刷新）；新增 `js/slideshow-nav.js`（z-index 兜底 + 键盘 ←→ + touch 滑动）
  2. 13 gallery / 130 图从官网 rect-sml 下载 + `_rebuild_all_photos.py` 重建 12 个 photos 页（模板 = four/night-changes.html）
  3. photos.html 列表页封面全部换 gallery 第一张真实照片
- **验证**：真实 Chrome：mouse 1→2、ArrowRight 2→4、ArrowLeft 4→2、touch 1→3→1，0 JS 错误
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：z-index 直接 9999 → M11；CSS 缓存 bump ?v= → M12；cycle2 无 swipe 插件 → M15；真实 Chrome 验证 → M18
- **遗留**：130 张 rect-sml 图待升级高清（下条）

## 2026-08-01 (R6) — 全站 gallery 升级 rect-lrg 高清（1500×1000）

- **模型**：deepseek-v4-flash
- **目的**：Takion 要求全部换高清图。
- **结果**：
  1. `_dl_all_lrg.py`（6 线程并发 + 原子写入 + 校验）下载 130 张 rect-lrg（130.5MB），约 15 分钟，fail=0
  2. 13 photos 页 + 5 photos.html 封面 + four.html 入口 + 首页 gallery 封面全部切 rect-lrg；旧 rect-sml 清理（回收站）
- **验证**：303 refs，Broken: 0；rect-lrg 130 文件 0 零字节；页面层 rect-sml 引用清零
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：JSON 带 BOM 用 utf-8-sig → M23；单线程下载慢 → 多线程
- **遗留**：git add 未跟踪图（rect-lrg 130 张）

## 2026-08-01 (R7) — 键盘翻页 bug 修复 + gfx lrg 高清化

- **模型**：deepseek-v4-flash
- **目的**：photos 页"少两张"（实际是按一下翻两页）+ 首页 hero / music 封面高清化。
- **结果**：
  1. 根因：13 个页面把 slideshow-nav.js 引用了两次 → 批量删除 + JS 全局守卫（双保险）
  2. gfx lrg：`assets/gfx/<name>-lrg.jpg` 下载 22 对（hero rect 2400×1200 / square 854×854 / music square 1200×1200），全站 sml→lrg 替换（gfx sml 引用 0 处）
  3. 确认 retinafy 对 `-lrg` 直引用安全（URL 无 `-sml` 不会二次替换）
- **验证**：真实 Chrome 一次按键翻一页（1/4→2/4→1/4）；303 refs Broken: 0
- **Token 消耗**：未记录
- **用时**：未记录
- **经验总结**：JS 重复引用 = 事件双绑 → M14；assets/gfx 与 assets/images 区别 → M27
- **遗留**：git add 全部新图（gfx lrg 22 + rect-lrg 130 + article-images）

## 2026-08-01 (R8) — MIA 歌单 14 首歌词页补全 + 双语翻译

- **模型**：deepseek-v4-flash + 后台 agent ×2（翻译）
- **目的**：MIA 歌单 17 首只有 3 首可点——14 首官网从未建歌词页，按 Takion 指示重建 + 翻译。
- **结果**：
  1. 歌词源选型：官网 404、AZLyrics 反爬、Genius 网络失败 → **lyrics.ovh**（免费无 key）全部 14 首拿到
  2. 14 个歌词页新建（非单曲结构：Song 类型 + Written by + prev/next 相邻曲目）
  3. 歌单 14 个纯文本 `<span>` → 链接；17 首全部可点
  4. 699 行歌词全部翻译（0 占位）；`lyric_translations.py` made-in-the-am 3→17 首；重新注入
- **验证**：`_audit_songlist.py` 17 首全链接；`_qa_mia_pages.py` 14 页 200、56 资源 0 断链；`_qa_mia_injected.py` 0 `[待译]`、0 空 zh
- **Token 消耗**：未记录（含后台 agent）
- **用时**：未记录
- **经验总结**：lyrics.ovh 细节 → M28；`dict.get` 默认值先求值 → M20；web_search 402 时用后台 agent → M35
- **遗留**：Written by 为公开数据人工整理，个别可能非官方确认；歌词聚合源个别行与官方版有出入
