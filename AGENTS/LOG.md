# 1D Fansite — 开发日志（LOG）

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
