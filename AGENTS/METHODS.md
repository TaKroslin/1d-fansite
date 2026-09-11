# 1D Fansite — 踩坑记录（METHODS）

> 每个坑：**现象 → 根因 → 处理 → 预防**。模型开工前扫一遍相关分类，避免重复踩坑。
> 新坑出现时，日志写完顺手在此追加一条。按类别组织，查找用 Ctrl+F。

---

## 一、图片与颜色

### M1. logo-black.png 是"黑字透明底"，不是反色
- **现象**：`logo-black.png` 叠在 `#000` 黑底卡片上完全隐形，页面看起来像图片加载失败。
- **根因**：该图是黑色文字 + 透明背景（rgba 0,0,0,255），不是"反色"版本。黑底场景必须用 `logo-white.png`（白字透明底）。
- **处理**：列表卡片强制 `if "logo-black" in img: img = img.replace("logo-black", "logo-white")`。
- **预防**：白底用 logo-black，黑底用 logo-white。拿不准先看底色。

### M2. 超宽 logo 在方形容器里被压成窄条
- **现象**：5GUYS 1D logo（3000×548，5.5:1）在 1:1 卡片里用 `background-size:40%` 显示成 ~58px 高的窄条。
- **根因**：`background-size:40%` 按**宽度** 40% 缩放，高度按比例塌缩。
- **处理**：`background-size:center/contain no-repeat`，让图片按比例完整显示。
- **预防**：aspect > 3:1 的图进 1:1 容器，一律 `contain`，不用百分比宽度。

### M3. CSS 视觉不可见，先查颜色对比和比例
- **现象**：`getComputedStyle` 显示 `backgroundImage` 正确，但视觉上看不见。
- **根因**：通常不是层叠/特异性问题，而是颜色对比（黑图黑底）或尺寸比例（窄条/超小）。
- **处理**：先检查颜色对比和比例，再怀疑 CSS 层叠。
- **预防**：见 M1/M2。

### M4. gallery-cover 封面用该 gallery 第一张 slide 的 hash
- **现象**：专辑页底部 photo 入口封面用专辑封面，视觉不对。
- **根因**：官方行为是 gallery-cover 的 `.bg` 用该 gallery 第一张 slide 的图。
- **预防**：photos.html 列表页 + 专辑页 gallery-cover 的封面 = gallery 第一张 slide hash（`rect-lrg`）。

### M5. og:image 用 rect-med，slide 用 rect-lrg
- **现象**：og:image 塞 1.4MB 大图，加载慢。
- **根因**：og:image 是 meta only，不渲染，不需要原图级。
- **预防**：meta og:image 用 rect-med（1200×800）；页面 slide 用 rect-lrg（1500×1000）。

---

## 二、路径与深度

### M6. 相对路径深度表（写脚本批量替换前必查）
- **现象**：图片/脚本 404，页面白屏。
- **根因**：深度差一层。各层级 root 深度：
  - 根级 `index.html`：0 层
  - `pages/*.html`：1 层 → `../`
  - `pages/music/albums/<a>.html`：3 层 → `../../../`
  - `pages/blog/YYYY-MM-DD/slug/index.html`：4 层 → `../../../../`
  - `pages/music/albums/<a>/songs/<s>.html` / `photos/<s>.html`：5 层 → `../../../../../`
- **处理**：改前数层级，改完 grep 抽查 + HTTP 审计。
- **预防**：写脚本时显式写死深度常量，不手工拼。

### M50. 导航「Home」菜单链接容易比 logo 差一层 `../`
- **现象**：用户报部分页面"回主页"按钮重定向到 `/pages/index.html`（404）。专辑页(3 层)/子页(4 层)/歌曲页(5 层)的 `<a class="menu1" ...>Home</a>` 全部少一个 `../`；同一页的 logo 链接却是对的（复制粘贴时只改了 logo）。
- **根因**：导航 Home 是**独立于 logo 的第二处 home 链接**，批量加导航或从模板复制页面时深度算错一层，且很难肉眼发现（本地点着像"跳回首页"其实进了 pages/index.html 或 404）。
- **处理**：对全站每个页面把 logo 链接和 `<a class="menu1">Home</a>` 都按 `os.path.relpath(root/index.html, fp.parent)` 计算正确相对路径，凡解析结果 != 根 `index.html` 就替换（幂等）。共修 121 处导航 Home + 2 处 logo。
- **预防**：写批量路径脚本必须做"相对路径 → resolve 后的绝对路径"校验（`(fp.parent/href).resolve()`），只检查字符串样子会漏；凡是页面含导航的，logo 和 Home 两个 home 链接一起查。

### M51. 克隆站批量修链接：journal 双目录结构 + territory 死链整段跳过
- **现象**：全站扫描内部 `.html` 链接发现 journal 克隆区导航/面包屑/前后篇链接普遍差一层（`../../music.html` 解析到 `journal/music.html`、`../2015-08-21/x.html` 解析到 `journal/<当日>/2015-08-21/x.html`）；gallery/albums.html 导航缺 `../`。
- **根因**：克隆自官方，每篇 journal 文章同时存在 `journal/<date>/<slug>/index.html`、`journal/<date>/<slug>.html/index.html`、`journal/<date>/<slug>.html`（文件）三种拷贝；页面里的相对链接只按其中一种结构写，其余全错。官方还有 territory 国家页选择器（`<a class="territory">` → `xx/index.html` / `xx/home.html`），这些国家页克隆里根本没有。
- **处理**：① 统一规范目标：站内页 `pages/<name>.html`（tour→`pages/tour.html`）、home→根 `index.html`、archive→`pages/tour.html`、journal 文章→`journal/<date>/<slug>/index.html`（以 `journal/archive.html` 列表用的结构为准）；② 对每条 broken 链接按 basename→canonical 计算 `os.path.relpath` 重写；③ **territory 链接整段跳过**（`class="territory"` 或路径含国家码 `ar/au/at/…`），不当作层级错误处理。
- **预防**：克隆站做全站链接审计前，先摸清目标区的目录结构（尤其同文多拷贝）；区分"层级错误"（目标文件存在、路径差层）与"死功能"（目标从未存在）；territory/404 等官方遗留先归类再决定是否动。

### M7. blog.html 卡片链接不加 `pages/` 前缀
- **现象**：blog 列表卡片链接 404。
- **根因**：blog.html 自己就在 `pages/`，卡片链接写 `pages/blog/...` 就多了一层。
- **处理**：`if url.startswith("pages/"): url = url[len("pages/"):]`。
- **预防**：凡是 `pages/` 内的页面互相链接，确认是否需保留 `pages/` 前缀。

### M8. QA 图片路径必须用 HTTP urljoin，不能 Path.resolve()
- **现象**：`Path.resolve()` 报 MISSING，但浏览器正常加载。
- **根因**：HTTP URL 的 `..` 超过 host 根会被**截断**（`/pages/music/albums/../../../../images/` → `/images/`），文件系统 resolve 会越过仓库根解析到上级目录。
- **预防**：`tools/audit/_audit_site_images.py` 用真实 HTTP 请求验证（需要本地 server 8000）。

### M9. 批量替换时 album 页（3 层）vs songs 页（5 层）容易差层
- **现象**：专辑页 yt-thumbs 图片 404。
- **根因**：songs 页模板的深度直接套到 album 页，差一层。
- **预防**：替换脚本对 album 页和 songs 页分别处理，用 HTTP 审计抓出。

---

## 三、CSS 与 z-index

### M10. CSS 多余 `}` 吞掉后续选择器
- **现象**：DevTools 显示元素匹配了选择器但属性不生效（如 zayn `.image .bg` 背景不显示）。
- **根因**：前面某条规则末尾多了个孤立 `}`，CSS parser 把其后的注释+选择器当成语法错误。
- **处理**：删除多余 `}`。
- **预防**：追加 CSS 时检查花括号配对；规则块之间不要裸放 `}`。

### M11. cycle2 inline z-index 压过控件（翻页按钮点不到）
- **现象**：photos 页翻页按钮不可见/不可点，只能看第一张。
- **根因**：cycle2 给 active slide 写 inline `z-index:100`（其余递减），控件 CSS 也是 z-index:100，inline 优先把按钮盖住。`elementFromPoint` 命中 `.bg`。
- **处理**：控件和 `.count` 提到 `z-index:9999!important` + `pointer-events:auto!important`（inline 无法覆盖 !important）。
- **预防**：跟 inline style 打架就用 9999!important，别用 200/100 中间值。

### M12. 纯静态站 CSS 缓存：改完必须 bump `?v=`
- **现象**：CSS 改完，用户（真实浏览器）看不到效果。
- **根因**：无 cache-control，浏览器启发式缓存旧 CSS。
- **处理**：`<link href="css/styles.css?v=YYYYMMDD">` 更新版本参数。
- **预防**：每次改 CSS，同步 bump 引用页面的 `?v=`。这也是"改了但用户看不到"的头号排查方向。

### M13. styles.css 是单行 minified：只追加，不重排
- **现象**：重排/格式化 styles.css 造成巨大 diff 或破坏官方规则。
- **预防**：新规则追加到文件末尾 `/* FIVE GUYS ONE DIRECTION additions */` 块；修 bug 也只动目标行。

### M49. 官方高特异性 `span{display:*}` 会漏出翻译默认隐藏（中英混排）
- **现象**：用户报"移动端没点翻译开关也显示中文翻译（中英混排）"。实测 141 页中 13 页英文态 `.zh` computed display ≠ none（index/blog 博客卡片、5 专辑页+singles 的"视频/照片/单曲"菜单、tour 场馆名）。
- **根因**：翻译切换完全依赖 `.zh{display:none}`（0,1,0）与 `html.lang-zh .en{display:none}`（0,2,0）两个默认规则。官方 CSS 里更高优先级的 span 布局规则会覆盖它们：`.panel.journal-news.homepage-news h2 span{display:block}`（移动端媒体查询，0,3,2）、`.panel.release-menu ul li a span{display:table-cell}`（0,4,2，全部视口）、`.panel.tour-listing ul li .location span{display:block}`（移动端）。于是英文态漏中文、中文态也漏英文（同一批规则同时压过 `.en` 隐藏）。
- **处理**：样式块末尾追加 `!important` 补丁——`.zh{display:none!important}`、`html.lang-zh .zh{display:inline!important}`、`html.lang-zh .en{display:none!important}`，并给 `.lyric-line`/`.lyric-passage` 的 zh/en 显示规则同加 `!important`（否则会被默认 hide 反杀）。同时修 `js/translate.js`：非歌词页遇存储 `"bilingual"` 回退 `"en"`（原 `"zh"`），杜绝歌词页双语态污染普通页。改完必 bump `?v=`。
- **预防**：凡是页面里新增任何 `span{display:*}` 布局（尤其移动端），先想会不会跟 `.zh`/`.en` 默认隐藏打架；排查"没点开关也有中文/混排"先做全站 computed display 扫描定位泄漏选择器，再决定用 `!important` 兜底。`!important` 必须成对（hide + show），否则会破坏中文态。

---

## 四、JS 与交互

### M14. 同一个 JS 文件被引用两次 = 事件绑定两次
- **现象**：photos 页按一次左右键翻两页，视觉像"少图/跳页"。
- **根因**：13 个页面把 `slideshow-nav.js` 引用了两次（相邻两行），keydown 绑定两次。
- **处理**：批量删除重复 `<script>` 行 + JS 文件顶部加全局守卫 `if (window.__5GUYS_XXX__) return; ... = true;`。
- **预防**：新增独立 JS 必须带全局守卫；生成页面时检查 script 引用唯一。

### M15. cycle2 核心不含 keyboard/swipe 插件
- **现象**：`data-cycle-swipe=true` 是死属性，键盘/滑动翻页不生效。
- **根因**：keyboard/swipe 是 cycle2 单独插件，克隆站没加载。
- **处理**：`js/slideshow-nav.js` 原生实现 keydown（←→）+ touchstart/touchend（|dx|>40 且 |dx|>|dy|）。
- **预防**：别假设插件存在；JS 交互先验证依赖。

### M45. cycle2 autoheight 插件会在 init 后 30ms 插入 `.cycle-sentinel` 克隆首图
- **现象**：移动端把 slideshow 改成垂直堆叠后，首图出现两遍 + 首张后 22px 缝隙。
- **根因**：autoheight 插件（`autoHeight` 默认 `0`，属 number ≥ 0）在 `cycle-initialized` 后 `setTimeout(…,30)` 克隆当前 slide 作测量 sentinel，恰好躲过我们的 DOM-ready 清理，事后才插入 DOM。
- **处理**：slideshow 元素加 `data-cycle-auto-height="false"`，禁用整个 autoheight 插件（桌面端无任何可见影响，sentinel 本来就是隐藏测量用）。
- **预防**：任何用 cycle2 且会重构 DOM 的场景，先禁用 `auto-height`。

### M46. 官方 `retinafy` 会在 window.load 给每个 `.retinafy` 元素克隆一个新 `.bg` div
- **现象**：移动端把 slide 改成 `position:static` 后，首图被放大成巨大覆盖层。
- **根因**：`main.js` retinafy 对每个 `.retinafy` 元素 HEAD 校验后 `retinafy_replace`：插一个 `position:absolute;width:100%;height:100%` 的新 `.bg` 并删原 `.bg`。原 slide 一旦脱离 `position:absolute`（变 static），新 `.bg` 的绝对定位祖先变成外层 `.panel.gallery`（此时高度=全部堆叠照片），`background-size:cover` 把图放大到整页。
- **处理**：移动端让 `.slide` 保持 `position:relative!important`（成为 `.bg` 的定位祖先），`.bg` 保留 absolute 填满 slide，不删不移。`-lrg` 图无 `-sml` 后缀，retinafy 的替换是同 URL 克隆，视觉无差异。
- **预防**：不要删/移动 slide 内的 `.bg`；改 slide 定位时先想 `.bg` 的定位祖先会变成谁。

### M47. 固定 `aspect-ratio:3/2` 遇到不同比例图片必然 letterbox 黑缝
- **现象**：移动端垂直堆叠照片，部分页两张照片之间有黑缝/黑带。
- **根因**：照片真实比例不一（`rect-lrg` 有 1920×1080=16:9、2400×1200=2:1、1500×1000=3:2，甚至 160px 缩略图），固定 `aspect-ratio` 盒子 + `background-size:100% auto` 时，比例更扁的图在盒子里留出上下黑带。
- **处理**：JS 按 `Image().naturalWidth/naturalHeight` 给每张 slide 设内联 `aspect-ratio`（`w + ' / ' + h`），并缓存 URL→ratio；CSS 只放 `3/2` 兜底。
- **预防**：静态站背景图做自适应比例必须知道真实图片比例，别写死；QA 时抽查不同 album 的首张 ratio。

### M48. 想支持桌面↔移动 resize 平滑切换，别销毁第三方组件
- **现象**：窗口从桌面拉成移动端后，slideshow 不切换成垂直堆叠，刷新才行。
- **根因**：之前做法在 DOM ready 时 `cycle('destroy')` + 删 `.bg`，状态不可逆，resize 回桌面无法恢复。
- **处理**：CSS `@media(max-width:767px)` 用 `!important` 覆盖 cycle2 内联样式（`position/width/height/visibility/z-index`），cycle2 保持初始化；resize 只增删 per-slide `aspect-ratio`。媒体查询原生响应 resize，无需刷新。
- **预防**：resize 响应式优先"CSS 覆盖 + 保留组件"，不得已才销毁重建。

### M16. Playwright 脚本结束必须 os._exit(0)
- **现象**：脚本逻辑全部跑完但进程挂住，命令报 timeout（结果其实已产出）。
- **根因**：chromium 未完全释放。
- **处理**：`os._exit(0)` 强制退出。
- **预防**：所有 Playwright QA 脚本结尾用 os._exit(0)。

### M17. Playwright touchscreen 无 swipe 方法
- **现象**：想测滑动翻页，`page.touchscreen` 没有 swipe。
- **处理**：手动 `dispatchEvent` TouchEvent（touchstart/touchend 序列）。

### M18. 键盘/滑动/点击测试要在真实 Chrome 验证
- **现象**：headless 通过但真实浏览器仍失败（R3 教训：z-index:200 补丁 headless 通过、真实 Chrome 仍被盖）。
- **预防**：交互类修复用 `channel=chrome` + 真实点击验证；另注意 headless 与真实渲染时序差异。

---

## 五、构建脚本与 Python

### M19. 模板 marker 不要包在 HTML 注释里
- **现象**：build 生成的卡片跑进注释里。
- **根因**：`<!-- __POSTS_CARDS__ : ... -->` 注释 + 下一行裸 marker，`str.replace("__POSTS_CARDS__", cards)` 命中**注释里**那次，`<!--`/`-->` 被撕开。
- **处理**：删注释行，只留裸 marker 一行。
- **预防**：模板里的替换 marker 保持裸文本。

### M20. `dict.get(key, default)` 的 default 会先求值
- **现象**：`entries.get(n, new_entries[n])` 在 key 不存在时抛 KeyError（不是返回默认值）。
- **根因**：Python 先求值所有参数，`new_entries[n]` 直接抛错。
- **处理**：`entries[n] if n in entries else new_entries[n]`。
- **预防**：default 需要计算时用条件表达式，不用 get。

### M21. `.jpg.jpg` 双扩展名：正则匹配不到
- **现象**：批量替换后图片路径变成 `xxx.jpg.jpg`。
- **根因**：正则 `(\.jpg"[^/]*/>)` 期待 `.jpg".../>`，但 HTML 里是 `.jpg.jpg".../>`，第一个 `.jpg` 后跟 `.` 不是 `"`，正则跳过。
- **处理**：不改正则，直接修 HTML 内容去掉多余 `.jpg`。
- **预防**：批量替换后 grep 双扩展名（`\.jpg\.jpg`）。

### M22. 正则拼接路径时 group 串扰
- **现象**：video bg 路径新旧拼在一起（`url(...album-cover` + 新路径）。
- **根因**：`sub` 用 `group(1) + new_path + group(3)`，group(1) 里含了旧 URL 前缀。
- **处理**：用独立 capture groups 分别抓前缀/旧路径/新路径/后缀，`sub(r'\1\3\4')` 重组。
- **预防**：正则替换先打印匹配组检查再写 sub。

### M23. JSON 中间文件带 BOM
- **现象**：`json.load` 报错或 key 对不上。
- **根因**：PowerShell 写出的 JSON 带 UTF-8 BOM。
- **处理**：`open(f, encoding='utf-8-sig')`。
- **预防**：读外部生成的 JSON 一律 utf-8-sig。

### M24. PowerShell 管线不能改文件内容
- **现象**：`Get-Content | Set-Content` 把中文注释写坏（GBK 乱码）。
- **根因**：Windows PowerShell 5.1 默认 ANSI 编码。
- **处理**：文件内容修改用 Python 脚本（`encoding='utf-8'`）或 Edit 工具；PowerShell 只读不写。
- **预防**：涉及文件内容的操作不走 PowerShell 管线。

---

## 六、数据源

### M25. cdn.smehost.net 全死（SMEHOST CDN）
- **现象**：所有 `/media/article-images/` 路径 404。
- **处理**：iTunes Search API 替代（免费无认证，600×600 封面）。
- **预防**：新图一律本地化，不依赖死 CDN。

### M26. iTunes `entity=song` 返回的是专辑封面，不是单曲封面
- **现象**：搜到"单曲"实际是专辑 track，artwork 是专辑封面。
- **处理**：过滤 `collectionName` 含 `- Single` + `trackName` 含歌名；`collectionName == trackName`（专辑名=歌名）也算单曲。
- **坑中坑**：`- Single` 结果会混入 remix/acoustic B-side（如 "Steal My Girl (Live Acoustic Session)" 挂在 "Night Changes - Single" 下），必须要求 trackName 含歌名。
- **兜底**：没有单曲 → 标准版专辑封面（绝不放别的专辑的图）。Takion 可手动指定（Steal My Girl → Four 封面；BSE → This Is Us 单曲封面）。
- **预防**：见 RULES.md §7 数据源规则。

### M27. 官网 assets/gfx 的 `assets/images/` 是占位文件
- **现象**：从 `assets/images/` 下载到 3617 字节的"图"（错误页）。
- **处理**：用 `assets/gfx/<name>-lrg.jpg`（2400×1200 / 1200×1200 真实高清）。
- **预防**：官网取图只用 `/assets/gfx/` 路径。

### M28. 歌词源优先级与歌词.ovh 细节
- **优先级**：官网 > Genius > AZLyrics > lyrics.ovh。
- **AZLyrics**：reCAPTCHA 反爬，不可直接抓。
- **Genius**：网络不稳（SSL EOF）。
- **lyrics.ovh**：免费无 key 最可靠；`api.lyrics.ovh/v1/One Direction/<title>` 需 `urllib.parse.quote`；歌名变体决定命中（"A.M." 404 → 用 "AM"）。
- **聚合源瑕疵**：个别行可能与官方版有出入（如 Hey Angel "I could me more" 疑为 "be more" 笔误）。

### M29. 已死数据源清单
- `cdn.smehost.net`（全站媒体）— 死
- `scontent-lhr8-1.cdninstagram.com`（2015 年 Instagram CDN）— 死（journal.html 遗留 2 处引用）
- Wayback Machine — 慢且不稳定，只在无替代时用

---

## 七、翻译与歌词

### M30. 歌词提取用 sentinel，不用换行分割
- **现象**：按 `\n` 分割歌词，HTML 缩进产生多余空行，列表错位。
- **处理**：`\x00` 替换 `<br />` 后再分割。
- **预防**：处理 HTML 内嵌文本先想清楚分隔符。

### M31. translate.js 路径深度（5 层歌页）
- **现象**：歌页 translate.js 404。
- **根因**：`SCRIPT_PREFIX` 写成 4 层 `../../../../`，歌页实际 5 层。
- **预防**：按 M6 深度表核对。

### M32. 旧翻译源不匹配自动丢弃
- **现象**：不同歌词源版本的行对不上（如 ready-to-run 完全不同）。
- **处理**：匹配率 <15% 时丢弃旧翻译，重新翻译。
- **预防**：翻译前先核对 en 行与 HTML 原文 1:1。

### M39. 批量翻译脚本必须操作内存 content，禁止重读磁盘
- **现象**：`add_translate_js()` 内部 `open(path)` 重读磁盘文件，把内存中已翻译的结果整个覆盖丢弃——45 个文件翻译 0 生效，只写入了坏的 translate.js 引用行。
- **根因**：脚本先翻译、后补引用，但补引用函数按"文件路径"而非"传入内容"设计，重读时用的是磁盘旧版本。
- **处理**：函数签名改为 `add_translate_js(content)`，只操作传入的字符串；写盘统一在循环末尾一次完成。
- **预防**：批量脚本里任何"读-改-写"三步，函数间传递内存内容，不要各自 open 文件。

### M40. 幂等包裹判断用 occurrence 精确检查，不用窗口截断
- **现象**：`already_wrapped()` 用 60 字符窗口 + `after[gt+1:].strip()` 判断，词紧贴 `>` 后时窗口截断 → 误判未包裹 → 同一词被二次包裹成 `<span class="en"><span class="en">Video</span><span class="zh">视频</span>s</span><span class="zh">视频</span>`（复数 s 也被夹进中间）；44 个文件的导航菜单被误翻。
- **根因**：窗口长度假设文本在 60 字符内闭合，实际不成立。
- **处理**：① `wrapped_at()` 改为精确检查 `text[:pos]` 是否以 `class="en">` / `class="zh">` 结尾（正则 `class="(?:en|zh)"\s*>$`）；② 导航 `<nav id="main">…</nav>` 和 `<title>…</title>` 区间整体跳过；③ 已污染文件用 `tools/_fix_overwrap.py` 修复（先解双重包裹循环到稳定，再还原导航，最后还原 title——顺序敏感）。
- **预防**：写"是否已包裹"判断时逐 occurrence 精确匹配，别用长度窗口；`<title>` 是 RCDATA，被塞 span 会在浏览器标签页字面显示，翻译脚本必须跳过 title 区间。

### M41. 文章标题双语走 build_blog.py 的 title_zh，不要手改 HTML
- **现象**：文章页 h2 标题（`{{title}}`）保持英文，首页卡片标题已意译——两处不一致。
- **处理**：article.md front matter 加 `title_zh`，`build_blog.py` Post 增加 `title_zh` 字段 → `title_html` 变量（有值输出 en/zh 对，空则纯英文），模板 `article.html` h2 用 `{{title_html}}`；列表卡片 `_render_listing_card` 同步输出 en/zh；`<title>`/og:title 继续用 `{{title}}` 保持英文（SEO）。
- **预防**：blog 相关任何标题改动都改 `tools/build/build_blog.py` + `tools/templates/article.html`，然后重建，别直接手改生成的 HTML（会被下次 build 覆盖）。

### M42. 审计脚本跨平台失效：REPO 硬编码 Windows 路径
- **现象**：`tools/audit/_audit_site_images.py` 在 macOS 上输出 `Total local image refs checked: 0`（服务器明明 200）。
- **根因**：脚本头部 `REPO = Path("E:/文档/GitHub/1d-fansite")` 是 Windows 时代硬编码路径，迁移后找不到 HTML 文件 → 0 refs；且 checked 为 0 时不报错，容易误判"审计通过"。
- **处理**：改为 `REPO = Path(__file__).resolve().parent.parent`（动态推导仓库根）。
- **预防**：任何脚本里的仓库根路径一律动态推导（`__file__` 两级），禁止硬编码盘符；审计脚本 checked 为 0 时视作失败而非成功。

---

## 八、git 与部署

### M33. 引用未 git 跟踪目录 = 部署后 404
- **现象**：本地正常，Cloudflare 线上 404。
- **根因**：新图片文件未 `git add`，或引用了未被跟踪的目录（`onedirectionmusiccom-ukprod/` 曾 0 文件被跟踪）。
- **处理**：部署前 `git status` 全量检查；引用路径都指向 `images/` 下已跟踪文件。
- **预防**：RULES.md §4 部署检查清单；`.gitignore` 加 `onedirectionmusiccom-ukprod/`。

### M34. 从 git HEAD 找回被覆盖的原图
- **现象**：本地文件被错误覆盖（如 History 单曲封面被换成 MIA 封面）。
- **处理**：`git log --oneline -- <path>` 找 blob → `git show <blob>:<path>` 恢复。
- **预防**：批量替换图片前先 `git status` 确认原始文件状态；可疑操作先备份。

### M37. Workers 构建失败：`.git/` 被当静态资源上传（Asset too large）
- **现象**：Workers git 集成构建报 `✘ [ERROR] Asset too large`，指向 `.git/objects/pack/*.pack`（147MiB > 25MiB 上限），`✨ Read 745 files` 里含 .git。
- **根因**：main 上没有 wrangler.jsonc 时，wrangler 非交互模式自动生成 `assets.directory: "."`，把整个仓库（含 `.git/`）当静态资源；首次加 `assets.exclude` 修复无效——**wrangler 4.118 不认 `assets.exclude`**（日志 `▲ [WARNING] Unexpected fields found in assets field: "exclude"`，静默忽略）。
- **处理**：`wrangler.jsonc` 加 `"build": { "command": "rm -rf .git" }`，让 wrangler deploy 在扫描 assets 前先删掉 `.git`（构建环境每次全新 clone，删 .git 不影响后续）。已验证：push `cfdfc4c` 后构建成功，线上 `www.5guys1direction.asia` 全站新版本上线、资源全部 200。若 `build.command` 也不生效，备选：把控制台 deploy command 改为 `rm -rf .git && npx wrangler deploy`。
- **预防**：wrangler.jsonc 必须常驻 main 根目录；任何 `assets.*` 新字段先确认当前 wrangler 版本支持（4.118 仅支持 directory/binding/html_handling/not_found_handling/run_worker_first/experimental_serve_directly）。

### M38. 跨平台迁移（Windows→macOS）后 git 假 diff：CRLF + 复制的 .git index
- **现象**：新机器上 `git status` 显示 6 个文件 modified，但 `git diff` 为空、`git diff --summary` 也为空；`git hash-object` 与 HEAD blob 完全一致，`git update-index --refresh` 反复报 "needs update"。
- **根因**：项目目录（含 `.git/`）从 Windows 整目录复制到 macOS：① 复制/编辑器把部分被跟踪文件转成 CRLF 行尾；② `.git/index` 的 stat 缓存（mtime/ctime/ino/mode）全是旧机器的，refresh 修不干净；③ `core.filemode=false` + `core.ignorecase=true` 是 Windows Git 特征，确认 .git 是复制而非 clone。
- **处理**：① 被跟踪 CRLF 文件批量转 LF：`perl -pi -e 's/\r\n/\n/g' <files>`（注意 `file -b` 对 JSON 只报 "JSON data" 不报行尾，用 `grep -c $'\r' <file>` 兜底，否则漏网）；② 重建 index 强制全量重扫：`rm .git/index && git reset -q`；③ 验证 `git status` 干净 + `git diff -w` 无内容差异 + 等几秒复查确认稳定。
- **预防**：新机器优先 `git clone` 而非复制目录，`.git` 不要手动搬；跨平台开发建议根目录加 `.gitattributes`（`* text=auto eol=lf`）统一行尾；若机器上跑着百度网盘等同步工具，确认项目目录不在其同步列表（否则本地改动会被回滚、stat 永远对不上）。

---

## 九、其他

### M35. web_search 可能 402（plan 余额用完）
- **现象**：web_search 报 billing limit。
- **处理**：用后台 agent（BYOK）替代搜索/翻译，或直接访问已知 URL。
- **预防**：搜索不可用时别反复重试，立即换路径。

### M36. Homepage video 面板不要乱动
- **现象**：曾把首页 `.panel.homepage-video`（History）背景图换成别的。
- **处理**：Takion 确认首页是对的，恢复原图。
- **预防**：用户明确说"是对的"的地方，改其他部分时别顺手动。

### M43. 翻译按钮"不显示"先查视觉层：黑字黑底隐形
- **现象**：用户报"部分页面左上角翻译按钮不显示"，但 Playwright 注入检查全部通过（按钮存在且在 #sticky 内）。
- **根因**：① 首页 `body.home-section` 的 header 初始在视口外（`top:-13.77%`，滚动超 ~746px 才滑入），顶部天然看不到；② 全站性问题：CSS `header#sticky.scrolled .translate-btn--header{color:#000}` 假设滚动后 header 背景变白，但原版克隆 header 背景恒为 `#000` → 滚动后按钮黑字黑底完全隐形。
- **处理**：① 首页按用户要求在 `.panel.hero` 内嵌第二个 `translate-btn--hero`（absolute 左上角 + 深色半透明底），滚动后 header 滑入接替；② 删除 `color:#000` 的 scrolled 覆盖规则，按钮全状态保持白色。
- **预防**：排查"按钮不显示"时按 注入存在性 → 位置 → 颜色对比度 三层走；`re.subn` 返回计数是匹配次数不是修改次数，幂等验证用 `md5` 前后对比而非输出数字；`injectHeaderButton()` 的全局 guard 要改成只查 `#sticky` 内部，否则 hero 按钮注入后 header 按钮被跳过。

### M44. 页面级专用翻译脚本要加"已包裹校正"第二遍
- **现象**：`_translate_tour.py` 首跑只报 15 处，但 tour.html 里大量 location 的 zh 与专用词表不一致（专有名被通用脚本意译）。
- **根因**：通用脚本 `_translate_pages.py` 已先译过 tour.html（418 个 location 已包裹），专用脚本正则只匹配未包裹形态，跳过了已包裹部分。
- **处理**：脚本加第 2 遍 `re.subn`，匹配 `<span class="location"><span class="en">([^<]*)</span><span class="zh">([^<]*)</span>` 形态，`en.strip() in M and zh != M[en.strip()]` 时才替换 zh；注意 zh 与 `<span class="venue">` 间可能有空格，用 `\s*` 捕获并保留。
- **预防**：新写页面级脚本前先跑一遍全量 diff（对比现有 en/zh 对与词表），别只处理未包裹；专有名（ITV1/Channel 4/The O2/Paramount Theatre 等）一律保留英文，不要意译。

### M45. 本地 server 常驻，任务结束不要 pkill
- **现象**：任务收尾时习惯性 `pkill http.server`，用户每次检查都要重新让 agent 启动 server。
- **根因**：原 RULES 没规定 server 生命周期；误以为"清理环境"= 杀掉所有后台进程。
- **处理**：本地 `http.server 8000` 会话内保持后台运行，任务结束**不杀**；只在用户明确要求重启时才停。
- **预防**：session 里 server 是共享资源，收尾清单只清理临时 QA 脚本，不碰 server 进程。

### M46. Playwright 本机用 Node + Chrome，Python API 未装
- **现象**：`import playwright` 在 python3/venv 都 ModuleNotFoundError；`python -m pip install playwright` 被 PEP 668 拦截。
- **根因**：本机 Playwright 是 npm 全局包（`$(npm root -g)/playwright`），Python 版未安装；且无 system-python 的 playwright wheel。
- **处理**：脚本用 CommonJS `require('playwright')`，运行加 `NODE_PATH=$(npm root -g)`；启动 `chromium.launch({ channel: 'chrome' })` 复用已装 Chrome，免下载 headless shell（`npm root -g` 的 playwright 无 driver node_modules，默认会去找 ms-playwright 缓存里的 headless shell，本机没下载 → 必须 channel:'chrome'）。
- **预防**：浏览器验证一律 Node 脚本；`await browser.close()` 或 `process.exit(0)` 收尾，否则 chromium 不释放、命令挂起。

### M47. 文章正文链接 hover 变色规则 specificity 极高
- **现象**：`.bilibili-play` 自定义 glyph 在 hover 后颜色变 `rgb(102,102,102)`（灰），即使已写了 `color:#fff` 覆盖。
- **根因**：官方克隆正文有通用规则 `.panel.journal-article .article-holder .text a:visited:hover{color:#666}`，specificity（0,6,1）高于 `.article-holder .text .bilibili-play:hover`（0,4,1）；`color` 从 `<a>` 继承给 `<i>`，继承值被直接命中 `<a>` 的规则覆盖。
- **处理**：把 `color:#fff!important` **直接作用于 glyph 元素**（`.bilibili-play:hover i{color:#fff!important}`），不要只设链接继承色。
- **预防**：自绘 glyph 的颜色铁律 = 目标元素 + `!important`，别指望继承；改前 grep 该选择器的全量 specificity。

### M48. 视频卡片 hover 变暗遮罩会压暗白色 glyph
- **现象**：hover 时 PLAY 文字/图标发灰，以为是颜色设定错，实际是半透明黑遮罩压在 glyph 上。
- **根因**：官方 `a.play-button:hover{background:rgba(0,0,0,.5)}` 的遮罩是链接自身背景，与子元素 glyph 同层渲染。
- **处理**：遮罩改用伪元素 `.bilibili-play::before{...background:rgba(0,0,0,.5);z-index:1}`，glyph `i` 提升 `z-index:2`，保证白色在最上层。
- **预防**：hover 变暗 + 白色前景的组合，遮罩必须低于前景 z-index，否则一律发灰。

### M52. SKILL.md 的 `description` 里带 `: ` 会被严格 YAML 解析器丢弃
- **现象**：`.agents/skills/` 下 6 个 Skill 只有 2 个出现在 DSH 会话目录里，`new-page` / `qa-workflow` 正常，`blog-post` / `design-system` / `gallery-page` / `translation` 完全消失且无报错。opencode 下 6 个全部正常。
- **根因**：YAML 的 plain scalar（未加引号）**不允许包含 `: `**（冒号+空格），它会被当成映射分隔符。这 4 个 description 都是 `Use for any ... work: create ...` 形式，严格解析器直接判非法 → 整个 Skill 被丢掉。opencode 的 frontmatter 解析较宽松，所以掩盖了问题。
- **处理**：把 description 用双引号包起来（`description: "Use for ... work: create ..."`），6 个统一处理；description 内本身不能含 `"`。
- **预防**：Skill frontmatter 一律按严格 YAML 写；description 含 `: `、`#`、`{`、`[`、`&`、`*` 等字符时必须加引号。校验直接跑 `python3 tools/audit/check_skills.py`（纯标准库，本机与 `.venv` 都没有 PyYAML，别用 `import yaml`）。改完 Skill 后确认会话目录里的条目数 = 目录数。

### M53. 本地跑 `wrangler deploy --dry-run` 会执行 `rm -rf .git`，删掉本地版本库
- **现象**：本地执行 `wrangler deploy --dry-run` 想验证上传清单，命令报 `Running custom build 'rm -rf .git' failed`；随后 `git` 报"不是 Git 仓库"。`.git/` 只剩 `objects/`（186MB），`HEAD` / `config` / `index` / `refs` / `packed-refs` 全部消失。**工作树文件完好无损**。
- **根因**：`wrangler.jsonc` 有 `"build": { "command": "rm -rf .git" }`（M37 为绕过 `.git` pack 超 25MiB 上传上限而加的补丁）。wrangler 在**本地**跑 `--dry-run` 时**同样执行 build 命令**，于是真的删了 `.git`。
- **为什么是"半损坏"而不是全删（重要，别再误判为沙箱）**：`.git/objects/` 下 **1724 个对象文件带着 macOS `uchg`（用户不可变）标志**，`rm` 对它们一律返回 `Operation not permitted`；没有该标志的 `HEAD` / `config` / `index` / `refs` / `packed-refs` 则被正常删除。**不可变标志连文件属主也删不掉，与沙箱/权限模式无关**——作者本人在自己终端里跑同样的 `rm -rf` 得到一模一样的报错，才定位到它。排查：`ls -lO <file>`（`-O` 显示 flags 列，出现 `uchg` 即中招）或 `stat -f '%Sf' <file>`。
- **处理**：① 从远端重新 clone，用它的 `.git` 顶替损坏的：`git clone <url> /tmp/re` → `mv .git .git-damaged && cp -R /tmp/re/.git .git`。**必须补 `git config core.fileMode false`**——本工作树文件权限是 700，新 clone 默认 `fileMode=true`，否则 500+ 文件全部假报 modified（实测 502 个纯 mode change，零内容差异）。② 残留的旧对象库：`chflags -R nouchg <dir>` 清掉不可变标志后再 `rm -rf <dir>`。
- **验证**：`git fsck` 无 error；`diff -r` 工作树 vs 远端检出**逐字节一致**；用 `GIT_ALTERNATE_OBJECT_DIRECTORIES` 枚举旧对象库，唯一不可达 commit 与历史中某 commit **主题和父提交完全相同** = 被 amend 掉的旧版本，确认无未推送工作丢失。
- **预防**：① **永远不要在本地跑 `wrangler deploy` / `--dry-run`**，要验证上传内容就 `git clone` 到临时目录再跑；② `.assetsignore` 已排除 `.git/`，`build.command` 已成冗余，移除后本地 dry-run 不再有破坏性；③ 恢复 `.git` 这类操作先复制备份、再动手，且恢复后必须做 fsck + 逐字节比对，别只看 `git status` 干净就以为好了；④ 遇到 `Operation not permitted` 先 `ls -lO` 查 flags，别条件反射怪沙箱/权限模式——`uchg` 的表现和它一模一样。


