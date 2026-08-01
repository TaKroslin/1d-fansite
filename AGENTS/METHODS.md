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

### M7. blog.html 卡片链接不加 `pages/` 前缀
- **现象**：blog 列表卡片链接 404。
- **根因**：blog.html 自己就在 `pages/`，卡片链接写 `pages/blog/...` 就多了一层。
- **处理**：`if url.startswith("pages/"): url = url[len("pages/"):]`。
- **预防**：凡是 `pages/` 内的页面互相链接，确认是否需保留 `pages/` 前缀。

### M8. QA 图片路径必须用 HTTP urljoin，不能 Path.resolve()
- **现象**：`Path.resolve()` 报 MISSING，但浏览器正常加载。
- **根因**：HTTP URL 的 `..` 超过 host 根会被**截断**（`/pages/music/albums/../../../../images/` → `/images/`），文件系统 resolve 会越过仓库根解析到上级目录。
- **预防**：`tools/_audit_site_images.py` 用真实 HTTP 请求验证（需要本地 server 8000）。

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
- **处理**：`wrangler.jsonc` 加 `"build": { "command": "rm -rf .git" }`，让 wrangler deploy 在扫描 assets 前先删掉 `.git`（构建环境每次全新 clone，删 .git 不影响后续）。若 `build.command` 也不生效，备选：把控制台 deploy command 改为 `rm -rf .git && npx wrangler deploy`。
- **预防**：wrangler.jsonc 必须常驻 main 根目录；任何 `assets.*` 新字段先确认当前 wrangler 版本支持（4.118 仅支持 directory/binding/html_handling/not_found_handling/run_worker_first/experimental_serve_directly）。

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
