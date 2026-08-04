# 1D Fansite — 开发日志（LOG）

## 日志书写规范

每次任务完成后**必须**在此文件顶部追加一条。字段要求：

| 字段 | 必填 | 说明 |
|------|------|------|
| **模型** | ✅ | Mavis / Codex / 其他；多模型接力写 "X + Y 复核" |
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

## 2026-08-04 — 移动端相册（photos 页）改为垂直堆叠浏览

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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis + 后台 agent ×5（翻译）
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

- **模型**：Mavis
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

- **模型**：Mavis
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
- **经验总结**：见 Mavis 复核日志（下条）
- **遗留**：见下条

## 2026-08-01 (Mavis 复核) — 部署安全修复 + onedir 残留确认

- **模型**：Codex + Mavis 复核
- **目的**：Codex 断链清零后，Mavis 复核发现两处部署安全漏洞（引用未 git 跟踪目录 = 线上 404）。
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis
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

- **模型**：Mavis + 后台 agent ×2（翻译）
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
