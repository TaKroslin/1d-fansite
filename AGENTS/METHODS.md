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

### M54. `Path.rglob('*.html')` 会命中「名字以 `.html` 结尾的目录」，批量改版本号时中途崩掉
- **现象**：批量脚本把全站 `styles.css?v=` 从旧版本改成新版本，跑到一半 `IsADirectoryError: [Errno 21] Is a directory: 'journal/2015-05-06/extra-tickets-released-for-otra-cardiff-shows.html'`，前面若干文件已改、后面没改，全站 `?v=` 处于**半新半旧**状态。
- **根因**：`journal/` 克隆区同时存在**两种**目录布局 —— `.../extra-tickets-released-for-otra-cardiff-shows/index.html` 和 `.../extra-tickets-released-for-otra-cardiff-shows.html/index.html`（后者目录名本身以 `.html` 结尾）。`rglob` 的 `*.html` 按**名字**匹配，不区分文件与目录，于是把这些目录也返回了，`read_text()` 直接抛 `IsADirectoryError`。
- **处理**：循环里加 `if not p.is_file(): continue`。脚本写成幂等的（`str.replace` 对已替换过的内容是无操作），所以**修好重跑一次**即收敛，不必回滚。
- **预防**：① 任何遍历 HTML 的批量脚本，读文件前一律 `p.is_file()` 过滤，不要假定 `rglob` 的 pattern 只匹配文件；② 批量改全站文件时脚本要幂等，这样中途异常只需重跑而不是手工回滚；③ 改完先数一数：`grep -rl "styles\.css?v=<新版本>" --include="*.html" . | wc -l`，并确认旧版本命中数为 **0**，用计数证明没有半途而废的文件。

### M55. 复用已被占用的封面 class：后面的 `!important` 静默赢掉，全套审计仍是绿的
- **现象**：给新相册封面写了 `.panel.gallery-cover.liam-cover .bg{...}`，`members/index.html` 的 **Liam 成员卡移动端封面变成了相册封面**。而图片审计 `Broken: 0`、7 个页面 div 全配对、24 个资源全 HTTP 200 —— **所有廉价检查都是绿的**。
- **根因**：成员卡早就占用了 `liam-cover`（`members/index.html` + `styles.css` 第 533/547 行），新规则落在文件末尾（第 910/919 行）。两条选择器 **特异性完全相同**（`.panel.gallery-cover.liam-cover .bg`），媒体查询条件也相同，又都带 `!important` → **后出现的那条胜出**。这不是"新增样式"，是"静默覆盖既有样式"。
- **处理**：相册封面改用未被占用的 class（`liamandlouis-cover`），成员卡保持 `liam-cover` 不动。新建 class 前先查占用：
  ```bash
  grep -c "<候选class>" css/styles.css   # 0=可新建；≥1 说明已被占用，换名
  ```
- **预防**：① **新封面 class 一律先 `grep` 查占用**，`liam-cover` / `niall-cover` / `zayn-cover` / `harry-cover` / `louis-cover` / `fiveguys-cover` 都已被 `members/index.html` 的成员卡占用，新相册不能复用；② 同类名冲突**静态审计和图片审计都发现不了**，唯一可靠的验证是**按 class 逐个查 `getComputedStyle(bg).backgroundImage`**，确认每张卡都指向自己的 asset（本次做法：移动端 9 个 class 逐个断言，含对照组）；③ 改 CSS 后不要只看"页面 200 / 图片不断"，要回答"**这条规则有没有覆盖到别的东西**"。

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
- **处理**：`wrangler.jsonc` 加 `"build": { "command": "rm -rf .git" }`，让 wrangler deploy 在扫描 assets 前先删掉 `.git`（构建环境每次全新 clone，删 .git 不影响后续）。已验证：push `cfdfc4c` 后构建成功，线上 `www.5guys1direction.asia` 全站新版本上线、资源全部 200。
- **⚠️ 后续更正（2026-09-11）**：这个 `build.command` 补丁**已移除**，改用 `.assetsignore`（见 RULES §4.2）。原因：① 它在本地跑 wrangler 时会真的 `rm -rf .git`，把开发者的版本库删掉（事故见 M53）；② `.assetsignore` 同样能排除 `.git/` 且**不会删任何东西**。移除前已在临时 clone 里做过对照验证：有 `.assetsignore` → 构建收集正常，无 `.assetsignore` → `Asset too large`。
- **预防**：wrangler.jsonc 必须常驻 main 根目录；任何 `assets.*` 新字段先确认当前 wrangler 版本支持（4.118 仅支持 directory/binding/html_handling/not_found_handling/run_worker_first/experimental_serve_directly）。**排除上传内容一律用 `.assetsignore`，不用 `assets.exclude`，也不用 `build.command`。**

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
- **预防**：① **不要在本地跑 `wrangler deploy`**（不加 `--dry-run` 会真的发布上线），要验证上传内容就 `git clone` 到临时目录再跑；② `.assetsignore` 已排除 `.git/`，`build.command` 已于 2026-09-11 移除，本地 `--dry-run` 不再有破坏性；③ 恢复 `.git` 这类操作先复制备份、再动手，且恢复后必须做 fsck + 逐字节比对，别只看 `git status` 干净就以为好了；④ 遇到 `Operation not permitted` 先 `ls -lO` 查 flags，别条件反射怪沙箱/权限模式——`uchg` 的表现和它一模一样。


### M56. 覆盖 `.panel-group{overflow:auto}` 会让整个 group 高度塌成 0，后面所有 panel 上叠
- **现象**：把两个正方形 panel 放进 `.panel-group` 后，Playwright 报 `element is not visible`，元素截图直接超时。量出来 group 的 `offsetHeight` 是 **0**，两个 720×720 的 panel 位置正常但完全脱流，紧随其后的 panel 整体上移了 720px 与之重叠。
- **根因**：`.panel-group{overflow:auto}` 里 `overflow` 不只是滚动设置，它**建立了 BFC 来包含内部的 `float` 子元素**（`.panel-group .panel{width:50%;float:left}`）。我为"避免裁剪"把它改成 `overflow:visible`，BFC 随之消失，浮动子元素不再撑开父容器。
- **处理**：删掉该覆盖，保留基础 `overflow:auto`。
- **验证**：group `offsetHeight` 从 0 恢复到 720，后续 panel 的 `top` 恰好等于 group 的 `bottom`（1546 = 1546），无重叠。
- **预防**：**不要为了"看起来更宽松"去覆盖容器上的 `overflow`**——先确认它是不是在承担 BFC/清浮动职责。判断法：子元素若有 `float`，父元素高度为 0 就是中招。另：这类 bug 让"元素不可见"的报错先于任何视觉断言出现，**Playwright 的不可见报错要当成真 bug 排查，不要急着改截图方式绕过**。

### M57. 给正方形格子套 `.journal-article`，会在两个断点各打一场覆盖战（且必输一场）
- **现象**：新 panel 在桌面是 720×720 正方形正确，**移动端却塌成 390×195（正好半高）**。加上 `padding:50% 0 0 0!important` 后仍然只有 195px，计算值却显示 `padding-top:195px`（=50%×390，说明 padding 其实生效了）。
- **根因**：两层叠加。① `.panel.journal-article{padding-top:0;height:auto}` 是给**长文正文**的（要按内容高度撑开），特异性 (0,2,0) 高于基础的 `.panel{padding:50% 0 0 0;height:0}`，所以正方形被它废掉，得靠自己的规则去覆盖；② 767px 断点有 `.panel{padding-top:100%}`（移动端正方形），而 `.panel.journal-article.niall-panel` 特异性更高，**无 `!important` 时 `padding` 简写反而把移动端的 `padding-top` 重置成 0**，于是只剩基础的 50% 生效。
- **处理**：**根本解法是别套那个类**——这两个格子是图形方块不是文章，改用纯 `.panel`（本身就是 `padding:50% 0 0 0;height:0` 的正方形），桌面/移动天然都成立，`!important` 与所有覆盖全部删掉（CSS 反而更短）。
- **验证**：移动端 390×390 正方形、桌面 720×720，`?v=` 已 bump，27 项断言全绿。
- **预防**：**复用组件类之前先读它为什么存在**。`.journal-article` 的 `height:auto` 是文章语义，用在固定比例方块上等于自己制造特异性冲突。判断法：如果你需要给某个既有类写 `!important` 才能得到想要的比例，先怀疑"这个类本就不该加"。

### M58. jQuery 2.1.1 的 `.css()` 不支持 CSS 自定义属性，键值对被静默丢弃
- **现象**：心形迸发动效只**笔直向上**飘，完全不向两侧散开。实测散开宽度 11px、纵向 75px（应两者相当）。
- **根因**：通过 `$el.css({'--dx': '30px', '--dy': '-90px'})` 写自定义属性，jQuery 2.1.1 **不支持**，这两个键被**静默丢掉**（不报错、不抛异常）。元素上只有 `left/top/font-size/animation-delay`，`--dx`/`--dy` 取值为空，于是 `@keyframes` 里的 `var(--dy,110px)` / `var(--dx,0px)` 退回兜底值 —— 看起来"动画能跑"，实际参数全是默认值。
- **处理**：改用原生 DOM + `el.style.setProperty('--dx', ...)`；元素也用 `document.createElement` 创建后 `appendChild`，避免混用。
- **验证**：脚本内 `getComputedStyle(el).getPropertyValue('--dx')` 从空串变为实际值；散开宽度 11px → **68px**，纵向 75px。
- **预防**：**CSS 自定义属性一律走 `style.setProperty()`**，不要经 jQuery `.css()`。这类 bug 的隐蔽性极高：无 JS 报错、无 JS 语法问题、静态检查全绿、图片审计全绿、HTTP 全 200——**必须断言动效的几何量（散开宽度）才能发现**，肉眼看"心在飘"会误判为正常。同类：凡"参数化动画"的效果，都要量参数是否真的落到了元素上。
### M59. `.icon-heart` 自带 `:before` 字形，再写 `textContent` 会渲染出两颗连在一起的心
- **现象**：作者反馈「为什么是两个爱心连在一起的」。每个心形元素位置上都并排出现两颗心。
- **根因**：`css/styles.css` 里 `.icon-heart:before{content:"\e60e"}` 是这个图标字体的**标准用法** —— 字形由伪元素生成，元素本身不需要任何文本。我又用 `el.textContent = '\ue60e'` 塞了同一个码点，于是**伪元素一颗 + 文本节点一颗**，两颗紧挨着渲染。
- **处理**：改用 emoji（`🧡` / `🇮🇪`）+ `textContent`，并**移除 `.icon-heart` 类**，从根上避开伪元素叠加。顺带把字体栈换成 emoji 栈（`Apple Color Emoji` / `Segoe UI Emoji` / `Noto Color Emoji`）。
- **验证**：断言每个元素的 **grapheme cluster 数**为 1（用 `Intl.Segmenter`，不能用 `.length` —— 🇮🇪 由 2 个 regional indicator 码点组成，`.length===2` 会误报），并检查元素不含 `.icon-heart` 类、高度未翻倍（24px 而非 ~48px）。
- **预防**：**给元素写文本前先确认它的图标是不是伪元素生成的**。用图标字体时二者只能选一：要么纯伪元素（元素留空），要么纯文本 + 正确的 `font-family`。判断法：`grep '\''\.类名:before'\'' css/styles.css` 有 `content` 就绝不能再写文本。

### M60. 浮动元素的百分比 `padding` 按**包含块**宽度解析，不是自身宽度
- **现象**：右格用 `.panel` 的 `padding-top:50%` 得到正确的 1:1 正方形（720×720）；为贴合图片比例改成 `padding:101.0824% 0 0 0` 后，格子高度变成 **1455.58px**（正好是 720 的两倍），比例算出来 0.4946 而不是 1.0108。同样的百分比在移动端 390px 宽下却是对的（394px）。
- **根因**：**浮动元素的百分比 padding 相对包含块宽度解析**。`.niall-photo-panel` 是 `width:50%; float:left`，自身宽 720px，但它的包含块是 `body`（1440px），于是 `101.0824% × 1440 = 1455.58px`。桌面下正好是两倍，所以错得很整齐；移动端因为「包含块 = 自身 = 390px」而侥幸正确 —— **只在桌面暴露的 bug**。
- **处理**：改用 `aspect-ratio:1200/1200` + `height:auto` + `padding:0`。注意 `.panel` 自带 `padding:50% 0 0 0` 与 `height:0`，**三者会互相顶掉**，必须一起清干净（此前只加 `aspect-ratio` 而没清 `padding`，实测 `paddingTop` 仍是 720px、`aspect-ratio` 形同虚设）。
- **验证**：`panel.ratio=1.0000`、四个断点（1440/1024/768/390）下右格均为正方形且与左格等高，`getBoundingClientRect` 逐断点核对。
- **预防**：**不要用 padding 百分比做浮动/绝对定位元素的宽高比**，优先 `aspect-ratio`；必须用 padding 技巧时先确认元素自身的包含块是谁。另：这类 bug 在移动端可能完全不复现，**断点验证必须包含桌面**，只测移动端会漏掉。
### M62. 不规则形状的"只有点在图形上才算"——CSS `mask` 与 `clip-path` 在本环境都不可靠，用 JS 读 alpha
- **现象**：四张贴纸按钮都是满格 1200×1200 叠放（这样图片位置才准确），需要"只有点在贴纸图形上才响应，点透明角落要穿透到 panel"。先后试了三种 CSS 方案，**全部失败**：
  1. `clip-path: inset()` 矩形 —— 能裁命中，但只能给矩形；贴纸是不规则形状，透明角落仍吃点击（作者反馈"main 的点击范围太广"）。
  2. `mask: url(sticker.png)` —— **只裁剪绘制，不裁剪命中测试**。满格按钮仍然吃掉整个面板的点击，连纯空白处都命中贴纸。
  3. `clip-path: url(轮廓.svg#c)` —— 外部 SVG 引用**不生效**；改用 **data URI 内联**也不生效，按钮仍是整块矩形命中区。`elementFromPoint` 恒返回同一个元素即为特征。
- **处理**：改为 **JS 逐像素命中判定** —— 把每张贴纸缩小画到 150×150 离屏 canvas，取 alpha 通道，点击/`pointermove` 时按坐标采样 alpha，`> 24` 才算命中贴纸，否则穿透去冒 emoji。`cursor` 与 hover 反馈也由该判定切换 `.is-on-sticker`。命中区域**精确等于贴纸轮廓**（实测贴纸实体占各自矩形面积：main 43%、小贴纸 2%），且不依赖任何裁剪特性。
- **验证**：4 张贴纸实体上点击 → 对应贴纸动、不冒 emoji（4/4）；6 个实测 alpha 全为 0 的空白点 → 冒 emoji、贴纸不动（6/6）；hover 光标只在贴纸实体上变 `pointer`。
- **预防**：① **别默认 CSS 裁剪会裁命中** —— `mask` 明确不裁，`clip-path` 在外部 SVG / data URI 场景下也可能静默失效；判断法是 `document.elementFromPoint()` 扫一圈，若恒返回同一元素就说明裁剪没生效。② 需要精确的不规则命中区域时，**读 alpha 做命中判定是最可控的方案**，不要和 CSS 特性死磕。③ 做轮廓追踪（marching squares / Moore 邻接）容易写出提前退出的 bug，我的两版实现都只走出 2 个点；**"矩形并集"（同行连续段 + 纵向合并）是更简单且可校验的表示法**，且可用覆盖计数证明无空洞。

### M63. `outline` 是矩形盒，给非矩形贴纸加焦点环会露出方形框
- **现象**：作者反馈"外面为什么会有一个方形的框框"。鼠标点击贴纸后出现一个橙色方框。
- **根因**：`outline` 贴着**元素矩形盒**绘制。贴纸按钮满格 1200×1200 且图形不规则，焦点环自然呈方形；`border-radius` 也救不了不规则轮廓。另外 `:focus` 在鼠标点击后同样成立，所以"点了就出现"。
- **处理**：去掉 `outline`，键盘焦点改用轻微放大（`:focus-visible{--hover-scale:1.06}`）作为提示 —— 形状天然跟着贴纸轮廓走。
- **预防**：**任何非矩形的可聚焦元素都不要用 `outline` 做焦点提示**；用小位移/缩放/阴影等"跟随形状"的反馈。无障碍上仍保留 `<button>` 语义与 `aria-label`，Tab 可达。

### M64. 重复触发动画时，未取消的 `setTimeout` 会把下一次的动画腰斩
- **现象**：作者反馈"连续点击的时候，会出现重复的情况，没有办法完成动画"。
- **根因**：`pop()` 每次点击都 `setTimeout(removeClass, 1200)` 却**从不取消前一个**。连点两次时，第一次的定时器会在 1200ms 把**第二次正在播的动画类**摘掉，动画中途消失；多个定时器互相打架，表现为"重复 + 完不成"。注意 `animationend` 那条清理路径本身是对的，问题只出在兜底定时器上。
- **处理**：用 `WeakMap` 按元素保存定时器句柄，每次触发前 `clearTimeout` 上一个；`animationend` 清理时也一并清掉句柄。
- **验证**：连点 3 次（间隔 190ms）后读 `img.getAnimations()[0].currentTime`，仍为小值（183ms）且动画数=1，说明每次都从头重放；随后能正常结束并摘类。
- **预防**：**凡"重启动画 + 兜底定时器"的组合，定时器必须按元素保管并先清后设**。判定方法不要只看"类在不在"，要看真实动画进度（`getAnimations()`），否则"类还在但动画已被打断"的情况测不出来。

### M65. 用正则从 `class` 里抠修饰名会被同前缀的类名抢先命中
- **现象**：三张小贴纸的命中/动画全部失灵（点上去只冒 emoji，贴纸不动），但主人物正常。
- **根因**：class 形如 `niall-figure niall-figure--sm niall-figure--top`，我用 `/niall-figure--(\w+)/` 取修饰名，**`niall-figure--` 先匹配上了 `--sm` 那一段**，三张小贴纸的名字全部解析成 `sm` —— `hitData` 互相覆盖（只剩最后一张的 alpha），`pop()` 也作用在错误元素上。
- **处理**：改为精确匹配已知修饰名 `/niall-figure--(main|top|left|right)\b/`。
- **预防**：**共享前缀的类名不要用 `--(\w+)` 这种宽松捕获**，要么精确枚举，要么用 `classList.contains()` 逐个判断。调试提示：`document.elementFromPoint` 看起来"命中了元素"但回调里拿到的名字不对，就是这类解析 bug 的典型特征。
### M66. 满格叠放的图层不要用 `ev.target` 判定命中；一个功能不要硬塞进一套共用逻辑
- **现象**：生日 panel 两格（左文字格 / 右图片格）都要"点空白冒 emoji"。修好左格之后，作者立刻发现**右格贴纸整体失效**（点上去没反应，连 emoji 也不冒）。
- **根因（两层，都是我的实现问题）**：
  1. **`ev.target` 在满格叠放时没有分辨力**。4 个贴纸按钮都是满格 1200×1200 叠放（这样图片才能按原位置 1:1 摆放），指针永远被**最后一个满格按钮**接住 —— 实测 `document.elementFromPoint()` 在任意点都返回 `.niall-figure--right`，哪怕那一点落在它自己的透明区域里。于是"只认 `ev.target`"的写法下，点主人物时 target 是 `right`、`right` 在该点的 alpha 为 0 → 判定成空白 → 贴纸整体点不动。
  2. **把两格的需求硬塞进一套共用逻辑**。左格只需要"点哪都冒 emoji"，右格需要"先做 alpha 命中判定、命中就只动贴纸"。我为了同时满足两者，改写了共用的命中函数，结果每修一边就压坏另一边，来回反复。
- **处理**：**拆成两套互不干扰的 handler**：左格（`.niall-panel`）直接冒 emoji；右格（`.niall-photo-panel`）先 `hitTest()`（遍历所有贴纸、按坐标查 alpha 找出"该点不透明的那一张"）再决定。同时把误改的右格命中函数**从已推送的提交里原样取回**（`git show <commit>:index.html`），不凭记忆重写。
- **验证**：右格 11/11（4 张贴纸实体各触发自身动画且 emoji=0、6 个 alpha=0 空白点全部穿透冒 emoji）、左格 6/6、完整回归 18/18、hover 衔接 6/6、中文排版 16/16。
- **预防**：① **满格叠放 + 透明区域命中**的场景，命中判定必须查"哪一层在该点不透明"，不能信 `ev.target`；判断法：`document.elementFromPoint()` 在多个位置返回同一个元素，就说明该元素铺满了整个区域，`target` 不可用。② **两个区域需求不同就写两套 handler**，不要为了"统一"去改共用函数 —— 共用逻辑改动的爆炸半径会同时波及两边，导致修 A 坏 B 的反复。③ 把已推送的正常实现改坏时，**先用 `git show <commit>:<file>` 取回原版**再动手，比凭记忆重写安全得多。

---

## 附：本机 / 本环境的已知坑（原 HANDOFF.md 独有内容，2026-09-14 并入）

> 这几条不属于"某次踩坑"，而是**每次开工都相关的环境事实**，顺手记在这里避免随交接文档一起丢失。

- **`python` 不存在，只有 `python3`**。文档里的 `python xxx.py` 一律按 `python3` 跑。需要 Pillow / 图像处理时用仓库自带虚拟环境：`.venv/bin/python`（系统 python3 没有 Pillow）。
- **bash 沙箱会虚拟化 `/tmp` 写入**：`curl -o /tmp/x` 可能"静默不落盘"（后续 `[ -f /tmp/x ]` 判定失败），但 `/dev/null` 与 `python3 - <<EOF` 正常。**要落文件就写进仓库内**，或改用管道。曾因此误判过两次验证结果。
- **`web_fetch` 打不开的部分站点**：`wikipedia.org`（含 `en.m` / `simple`）、`britannica.com`、`abc.net.au`、`legacyrecordings.com`（403）。绕法：bash 走 **Wikimedia REST API** —— `curl -s "https://api.wikimedia.org/core/v1/wikipedia/en/page/<标题>"` 取 `source`（wikitext）再用正则提日期；`last.fm` 的 `/+wiki` 页可正常 fetch，适合查生日/出生地。
- **Playwright 固定用法**：`NODE_PATH=$(npm root -g) node script.js`，且必须 `chromium.launch({ channel: 'chrome' })`（本机已装 Chrome，无需下载 headless shell）。脚本结尾要 `await browser.close(); process.exit(0)`，否则命令挂起。
- **截图坐标铁律**：`page.screenshot({ fullPage: true, clip })` 在 **DPR=2 下会多出黑色填充带**，且 `boundingBox()` 是视口相对坐标 —— 必须补 `scrollX/scrollY`，且**用 DPR=1 截图**才能得到与 clip 一致的尺寸（M59 相关）。
- **字体问题先要求复现**：存档/克隆页"字体不一样"的反馈已查证过一次，结论是**无差异**（字体文件逐条相同、两页 FontFace 请求一致、用同一份 CSS 渲染的截图 SHA-256 完全相同）。`file://` 下 `document.styleSheets[].cssRules` 报 BLOCKED 只是 JS 跨源限制，**样式依然生效**；真正的差异是 `retinafy` 走 XHR 被拦、高清图退回普通清晰度，**字体不受影响**。再遇到同类反馈：**先要截图 + 打开方式（双击 / localhost:8000 / 线上域名）+ 浏览器缩放，不要在没有复现的情况下"顺手修字体"。**

### M67. 满格按钮 + 移动端默认点击高亮 = 整张卡片闪一下
- **现象**：桌面端一切正常，但在移动端用触屏点击贴纸/卡片时，**整张卡片会闪一下**。
- **根因**：移动浏览器的默认点击高亮 `-webkit-tap-highlight-color`（Chrome 计算值为 `rgba(51,181,229,0.4)`，Safari 类似）。四张贴纸按钮都是 **满格 1200×1200 叠放**（图片才能按原位置 1:1 摆放），高亮层于是一次铺满整个按钮盒 —— 视觉上就是"整卡一闪"。
- **为什么之前没发现**：此前所有验证都是"390px 视口 + **鼠标**事件"，从没用过真实触摸事件。**视口宽度对了不等于移动端验证过了** —— 触摸路径、点击高亮、`:active` 表现都不是鼠标路径能覆盖的。用 Playwright 复现要显式开 `isMobile: true, hasTouch: true` 并调 `page.touchscreen.tap()`。
- **处理**：新增**触屏专用适配层**（全部包在 `@media (hover:none),(pointer:coarse)` 里，桌面零影响）：
  - `-webkit-tap-highlight-color: transparent`（贴纸按钮与两格面板）
  - `touch-action: manipulation`（去掉 300ms 点击延迟与双击缩放判定带来的抖动）
  - `:active{--hover-scale:1}`（触屏没有 hover，"按下就缩小"只会多一次重绘）
  另外加**触屏专用 JS 路径**：几何量（按钮矩形）在触摸序列内不变，故首次接触时量一次并缓存（`figGeom()` + `pointerdown` 失效），避免每次点击都做 `getBoundingClientRect()`；触屏下也**跳过强制 reflow**（`void el.offsetWidth`）。
- **验证**：Playwright 触屏套件 **17/17**（tap-highlight 计算值 `rgba(0, 0, 0, 0)`、touch-action=manipulation、四张贴纸实体触摸各触发自身动画且 emoji=0、空白触摸冒 emoji、左格触摸冒 emoji、连点 3 次动画仍正常）+ 桌面回归 **5/5 未被影响**（桌面 tap-highlight 仍是默认 `rgba(0,0,0,0.18)`、touch-action=auto、`pointer:coarse` 不命中）。
- **预防**：① **移动端适配必须用真实触摸事件验证**，改视口宽度不算。② 满格叠放的可点区域一定要关 `-webkit-tap-highlight-color`，否则高亮会铺满整块。③ 加媒体查询适配层时**把整段包在 `(hover:none),(pointer:coarse)` 里**，桌面行为一条都不动 —— 这也是作者明确要求的"用新的一套逻辑，不要改原有的东西"。

### M68. 判重要落到内容：文件名两个方向都会骗人，PSD 的字节差也不等于内容差
- **现象**：审查 `~/Downloads` 里「项目已经有同一份」的素材时，按文件名匹配会同时产生**漏判**和**误判**：
  - **同名不同图**：`awards rect.png` 实际是 1200×1200（方图）、`awards square.png` 实际是 2400×1200（横图）—— 作者侧的 rect/square 命名是反的；项目 `images/gfx/gallery-press-awards-cover-{rect,square}-lrg.png` 的命名反而是对的，按名字对会正好对反。
  - **同图不同名**：`liam-rect.png` 与项目 `images/gfx/gallery-members-liam-liam-cover-rect-lrg.png` 文件名毫无关系，却是逐像素同一张。
  - **PSD 字节差 ≠ 内容差**：6 个 PSD 与项目副本差 1,100 字节（只在 Photoshop Image Resources 元数据段），画布、图层、合成图完全一致；反过来 `teen-zayn-square-恢复的.psd` 比原版大 3.1 MB 且**多一个图层**，但合成图仍然完全相同（多出的层被遮挡/隐藏）。
- **根因**：① 文件名的命名权在作者手里，工作名与发布名从来不是一套；② PSD 是容器格式，Photoshop 每次存盘都会重写缩略图/版本标记等段，字节必然漂移；③ 「合成图相同」只能证明**可见结果**相同，不能证明图层结构相同（隐藏层、被完全遮挡的层都不影响合成图）。
- **处理**：把判重写成一条逐级加严的流水线 —— **md5（先按文件大小预筛，避免全量哈希）→ 尺寸 → 逐像素（`ImageChops.difference` 的直方图，`sum(hist)-hist[0]` 就是不同像素数）→ PSD 四项齐平（画布 + 图层数 + 图层名 + 合成图）**。任何一级判为"等价"都要记下依据，**删除前再重新校验一次**。另注意 `figure-*.png` 这类"裁剪前原图"，要靠 `crop()` 后逐像素比对才能认定，不能因为尺寸不同就判为不同素材。
- **验证**：64 项全部通过删除前复校验；`_audit_site_images.py` 776 refs / Broken: 0。
- **预防**：① **永远不要用文件名判重**：同名的可能是两张图，异名的可能是同一张。② **PSD 比对不要用 md5**，用「画布 + 图层数 + 图层名 + 合成图」。③ 解析 PSD 图层记录时，`blend mode signature(4) + key(4)` 后面还有 **opacity/clipping/flags/filler 共 4 字节**；漏掉会整体错位，症状是**图层名解析成乱码、层数也数错**，而且因为两边用同一个错误解析器还会"一致地错"，看起来像"图层完全相同"（本次就先踩了一次，靠交叉验证才发现）。④ macOS 恢复出来的 `-恢复的` 副本可能是原件的**超集**，不能一律当重复删掉，必须先按内容比对再决定。

### M70. Cloudflare `not_found_handling: "404-page"` 不会重写 URL —— 404 页必须用根绝对路径
- **现象**：访问站内任意不存在的深层路径（如 `/pages/blog/.../chapters/999/`），返回的 404 页**完全没有 CSS**、退化成浏览器默认 HTML 样式（Times 字体、蓝链）；同一份 `404.html` 在根路径打开却是正常的。
- **根因**：`wrangler.jsonc` 的 `assets.not_found_handling = "404-page"` 只是把 **`404.html` 的响应体**按原请求 URL 返回，**不重写 URL、也不改 `<base>`**。于是 404 页里所有**相对路径**（`css/styles.css`、`images/...`、`js/...`、`pages/xxx.html`）都以**用户请求的那个深层目录**为基准解析 → 全部 404。线上实测：`/pages/.../chapters/00/css/styles.css` → 404，而 `/css/styles.css` → 200。
- **处理**：把 `404.html` 里所有资源/导航引用改成**根绝对路径**（`/css/styles.css?v=...`、`/images/...`、`/js/...`、`/pages/xxx.html`、`/index.html`），`og:image` 用带 `www` 的完整 origin。
- **验证**：写一个模拟 Cloudflare 行为的本地 server（命中不到就按原 URL 返回 `404.html` 且状态码 404），用 Playwright 打开深层不存在路径：`status 404`、`document.styleSheets.length = 2`、`.four-zero-four` 计算样式生效、背景图与 logo 均 200、除被请求的 404 本身外无失败请求。
- **预防**：① **404 页/错误页是唯一会被在任意路径下渲染的页面**，其中任何相对路径都视为 bug，一律写 `/` 开头。② 本地 `python -m http.server` 用的是自己的 404，**复现不了这个问题**，必须用模拟 server 或线上验证。③ 判断"路径该写相对还是绝对"的口诀：会被 rewrite/原地服务的页面（404、`_redirects` 目标、`_headers` 无关）用绝对；正常静态页仍按深度表用相对。

### M71. `.assetsignore` 匹配**不分大小写**：`Chapters/` 把成品 `chapters/` 一起干掉，111 章线上全 404
- **现象**：作者反馈「小说（blog 内页）全变 404」。线上 `pages/blog/the-only-direction-home/`（小说目录页）**200**，但它下面的 `chapters/00/` … `chapters/110/` **111 个章节页连同 `chapter.md` 全部 404**；同一时间普通 blog 内页（`/pages/blog/2026-08-04/more-than-a-ship/`）正常 200。本地文件完好、`git ls-files` 也都在版本控制里，本地 `python -m http.server` 全部 200 —— **只有线上坏，而且只坏这一棵子树**。
- **根因**：`.assetsignore` 里为排除仓库根的**小说原始 Markdown** 写了裸规则 `Chapters/`。wrangler 内部用 `ignore` npm 包做匹配，而 wrangler 调 `ignore()` 时**不传 options**，走该包默认值 **`ignorecase: true`**（`makeRegex` 给正则加 `i` 标志）。而 gitignore 语义里不带前导斜杠的 `Chapters/` 本来就匹配**任意层级**的同名目录 —— 两个"宽松"叠加，成品目录 `pages/blog/the-only-direction-home/chapters/` 被一并排除，从未上传。该规则与小说成品同在 2026-09-11 那批提交里（`.assetsignore` 21:07 / 小说成品 22:31），所以章节页**从上线起就没成功出现过**。
- **处理**：仓库根目录的规则一律加**前导斜杠锚定** → `/Chapters/`；顺带把其余根规则（`/AGENTS/`、`/docs/`、`/tools/`、`/README.md`、`/wrangler.jsonc` …）全部锚定，消除同类误伤面。子目录开发说明另用 `**/README.md` 显式排除，保持与原行为一致。
- **验证**：**单变量 A/B，走 wrangler 自己的资源管线**。往 `pages/blog/the-only-direction-home/chapters/00/` 放一个 26 MiB 探针文件，只切换 `Chapters/` ↔ `/Chapters/`：
  - 规则**未锚定**（= 线上现状）→ `wrangler deploy --dry-run` **完全不报错**，探针"消失" ⇒ 整棵树被排除，复现线上 404；
  - 规则**锚定**后 → 同一命令报 `Asset too large ... chapters/00/_probe.bin`，探针可见 ⇒ 章节回到上传集。

  另跑本地 `python -m http.server` 全量请求 **111 个章节目录 = 200/200**（目录页 200）。探针已删除、`.assetsignore` 已还原（`git status` 无残留）。
- **预防**：① **`.assetsignore` 的规则匹配是大小写不敏感的，根目录规则必须写 `/xxx/`**，永远不要写裸 `Chapters/`。② 这类 bug **本地 100% 复现不了**（本地没有过滤层）：唯一可靠的验证手段是 `wrangler deploy --dry-run` + 往目标目录塞一个 **>25 MiB 的探针文件** —— 探针"被报错"说明该目录**在**上传集里，探针"消失"说明**整棵目录树**都不上传。③ `WRANGLER_LOG=debug` 打印的文件清单是**过滤前**的原始 walk 结果（连 `/.DS_Store`、`/.assetsignore` 都在里面），**不能用它判断"到底传了什么"**。④ 「本地好好的、线上 404」优先怀疑**部署过滤层**，而不是文件缺失或路径写错。

### M72. `images/psd/` 只进了 `.gitignore` 没进 `.assetsignore` —— 单文件超 25 MiB 让**整个 deploy 失败**
- **现象**：修好 M71 后跑 `wrangler deploy --dry-run`，整包直接失败：`Asset too large. Cloudflare Workers supports assets with sizes of up to 25 MiB. We found a file .../images/psd/dinnertable-rect.psd with a size of 29.1 MiB.`
- **根因**：`images/psd/`（663 MB）与 `images/gfx/psd/`（76 MB）写在 `.gitignore` 里，但 `.assetsignore` 里没有。`wrangler.jsonc` 的 `assets.directory` 是 **`.`（整个仓库）**，所以 **git 忽略不等于不上传** —— 这两张排除表互相独立、要各自维护。其中 `dinnertable-rect.psd`（29.1 MiB）与 `hero-rect.psd`（25.5 MiB）都超过 Cloudflare **每个资源 25 MiB** 的上限，触发的是**整包失败**（不是跳过那一个文件）。`AGENTS/AGENTS.md` 早就写明「`images/psd/` 为不部署源文件」，只是这条约定没落到 `.assetsignore`。
- **处理**：`.assetsignore` 补上 `/images/psd/` 与 `/images/gfx/psd/`，与 `.gitignore` 对齐。
- **验证**：补规则前 `wrangler deploy --dry-run` 退出码 **1**（Asset too large）；补后退出码 **0**、`Total Upload: 0.34 KiB`。同时线上探测 `/images/psd/hero-rect.psd`、`/images/psd/dinnertable-rect.psd`、`/images/gfx/psd/liam-rect.psd` 均 **404**（尚未泄漏）。
- **预防**：① **新增"不发布的目录"要同时改两张表**：`.gitignore`（不进版本库）+ `.assetsignore`（不上传）。② 定期跑 `find . -type f -not -path "./.git/*" -size +25M`，任何命中都必须是已被 `.assetsignore` 排除的路径。③ 部署失败先读**第一行错误**：`Asset too large` 是资源体积问题，跟代码/配置无关。④ `.venv/lib/.../playwright/driver/node`（115 MB）因为 `.venv/` 已被排除所以不触发 —— 这正好反证**体积检查跑在过滤之后**。
