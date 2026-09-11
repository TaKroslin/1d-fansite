# 1D Fansite — 操作规范（RULES）

> 本文件是**模型的行为准则**：规定"怎么干活、先干什么、怎么验证、怎么收尾"，把踩过的坑固化为流程，避免重复犯错、浪费 token。
>
> 优先级：根 `AGENTS.md`（入口）→ 本文件（怎么做）→ `AGENTS/AGENTS.md`（是什么）→ `METHODS.md`（坑明细）→ `COMMANDS.md`（命令）。

---

## 0. 核心原则（最高优先级）

1. **先查证，后动手**：改任何东西之前，先读相关文件确认现状；不确定就 grep / 查文档，不猜。
2. **小步改，快验证**：每次改动保持最小范围，改完立即跑对应验证，不要攒一堆改动再验证。
3. **非必要不用视觉模型/截图**：能用脚本、HTTP 请求、文本 grep 验证的，绝不启动浏览器截图。**只有需要确认"视觉呈现"（布局、颜色、动画、响应式）时才用 Playwright 截图 + 视觉确认。** 普通的功能正确性（链接 200、图片存在、JS 无错误）一律用低成本检查。
4. **视觉确认按运行环境选看图工具**：DeepSeek 无原生多模态，不要假设模型自带看图能力。**opencode** 下走 MCP `visionpower` 视觉工具；**DSH** 下用内置 `read_image` 直接读图（DSH 不挂载 visionpower）。
5. **批量操作先写脚本**：涉及 10+ 文件的同类修改，写一次性 Python 脚本（放 `tools/`），脚本要幂等、可重跑，改完验证输出。不要手工逐个文件改。
6. **改完必写日志**：`AGENTS/LOG.md` 追加一条（规范见 §6）。经验教训沉淀到 `METHODS.md` / 本文件。

---

## 1. 会话启动流程（每次开工必做）

1. 读根 `AGENTS.md`（入口 + 文档地图，约 1 分钟）
2. 按任务类型读对应文件：
   - **所有任务**：`AGENTS/RULES.md`（本文件）
   - **改页面/样式/组件**：`AGENTS/AGENTS.md` 的设计系统、组件目录、路径约定
   - **图片/资源相关**：`AGENTS/METHODS.md` 图片类坑 + `COMMANDS.md` 审计命令
   - **blog 相关**：`AGENTS/AGENTS.md` 的 Blog Markdown Workflow
   - **歌词/翻译相关**：`AGENTS/AGENTS.md` 翻译说明 + `METHODS.md` 翻译类坑
   - **先加载 Skill**：项目 Skill 源在 `.agents/skills/<name>/SKILL.md`（opencode 与 DSH 共用同一目录）。任务命中某个 Skill 的 description 时，**先用 `skill` 工具加载它**再动手。Skill 定义"这条流水线怎么走"，本文件定义"什么不能做"，两者叠加执行。
3. 确认本地 server 状态（QA 需要）：`python -m http.server 8000` 后台跑起来（127.0.0.1:8000）
4. 读 `AGENTS/LOG.md` 最近 1-3 条，了解"上次做到哪、遗留什么"

> **本地 server 常驻，任务结束不杀掉**：`http.server 8000` 在会话中保持后台运行即可，方便用户随时打开 `http://localhost:8000` 检查效果。结束任务时**不要** `pkill http.server`；只有在用户明确要求重启/停止时才处理。

> 不要每读一个文件就汇报一次。文档读完直接干活，结尾汇报。

---

## 2. 开发规则

### 2.1 通用

- **不引入框架**；纯 HTML/CSS/JS + jQuery。
- **新增页面**：复制现有同类型页面作模板（保留 header/footer/nav/资源引用），再改内容。不手写骨架。
- **改 HTML 时**：注意 body class、`data-translate`、资源相对路径深度（见 AGENTS/AGENTS.md 路径表）。
- **站点 origin 必须带 `www`**：正式域名是 `https://www.5guys1direction.asia`，**`www` 不可省略**。凡写绝对 URL（`canonical`、`og:url`、`twitter:image`、分享链接、sitemap、复制给用户的地址）一律用带 `www` 的完整 origin；裸域 `5guys1direction.asia` 与线上 origin 不一致，会导致 canonical 认错、社交分享/预览图解析失败。相对路径与 `mailto:contact@5guys1direction.asia` 邮箱不受此限（邮箱本就无 `www`）。
- **不要删除官方克隆的结构/资源**：除非确认是死代码（如失效 CDN 引用，替换为本地文件）。

### 2.2 CSS

- `css/styles.css` 是单行 minified（91KB）。**新规则追加到文件末尾 `/* FIVE GUYS ONE DIRECTION additions */` 块内**，绝不重排/重写现有行。
- 修 bug 才动现有规则；加样式一律追加。
- **改完 CSS 必须 bump 版本参数**：相关页面 `<link href="css/styles.css?v=YYYYMMDD">` 更新日期。纯静态站无 cache-control，浏览器启发式缓存会让用户一直看到旧 CSS——这是"改了但看不到效果"的头号原因。
- 与 inline style 或 JS 写入的 z-index 打架时，直接 `z-index:9999!important`，别用 200/100 这类中间值。

### 2.3 JS

- 官方 `js/main.js` 保持不动；新功能放页面底部 `<script>` 或独立 JS 文件。
- **独立 JS 文件必须加全局守卫**防重复绑定：
  ```js
  if (window.__5GUYS_XXX__) return; window.__5GUYS_XXX__ = true;
  ```
- 页面 `<script>` 引用只写一次（重复引用 = 事件绑定两次 = 行为翻倍，教训见 METHODS.md）。
- 新增交互 JS 时检查：jQuery 是否已加载（页面用 Google CDN 的 2.1.1）。

### 2.4 Python 脚本（tools/）

- **常驻工具按功能分目录**：`tools/build/`（构建）、`tools/translate/`（翻译）、`tools/audit/`（审计）、`tools/templates/`（模板）。调用方式见 `tools/README.md` 索引。
- **一次性脚本加 `_` 前缀，完成后移入 `tools/archive/`**：根目录不长期保留一次性脚本；archive 内确无用时删除。
- 读文件统一 `encoding='utf-8'`（Windows 下 PowerShell 默认 ANSI，Python 默认也可能出问题）；JSON 中间文件可能带 BOM，用 `utf-8-sig` 读。
- **不要用 `dict.get(key, default)` 传需要求值的默认值**（`default` 会先求值，key 缺失时直接抛错）。用 `d[k] if k in d else fallback`。
- 批量替换用 `str.replace` 时，模板里的 marker 必须是**裸文本**，不要包在 HTML 注释 `<!-- -->` 里（replace 会命中注释里的那次）。
- 脚本要幂等：重复跑结果一致；输出带统计（改了 N 个文件）。
- 用正则处理 HTML 时，注意 `.` 不匹配换行、`*` 贪婪匹配等陷阱；复杂的多段拼接用独立 capture group 再重组，别用 group(1) 直接粘（教训见 METHODS.md）。

### 2.5 歌词/翻译

- 歌词页结构：`.lyric-line` 双语（en + `<span class="zh">`），页面带 `data-translate="true"`，并引用 translate.js。
- 注入歌词用 `tools/translate/translate_lyrics.py`（从 `lyric_translations.py` 字典读），**不要手工改 67 个歌页 HTML**。
- 翻译字典结构：`{album: {song: [(en, zh), ...]}}`，en 必须与 HTML 原文严格 1:1（顺序对应），zh 可为 `[待译: <english>]` 占位。
- 非单曲歌词页（MIA 14 首）：Song 类型 + Written by + prev/next 相邻曲目；无 release-buy/release-video。

### 2.6 blog 正文视频卡片（bilibili 等第三方视频）

- **结构**：封面背景 + 居中 play 图标，点击才注入 iframe（**默认不自动播放**，无 `autoplay` 参数）。
  ```html
  <div class="bilibili-card" style="background-image:url(../../../../images/blog/<cover>.png);">
    <a class="bilibili-play" href="#" data-bilibili-src="//player.bilibili.com/player.html?...">
      <i class="icon-play"></i><i class="icon-play-text"></i>
    </a>
  </div>
  ```
- **两个图标都要放**：`icon-play`（居中大播放符）+ `icon-play-text`（PLAY 字样）——hover 动画靠两个图标切换（play 右移淡出 + PLAY 淡入），缺一个就没有官方效果。
- **依赖**：文章页必须引用 `js/bilibili-video.js`（build 模板已自动加，勿删）；CSS `.bilibili-card`/`.bilibili-play` 已加在 styles.css additions 块末尾。
- **层级铁律**：遮罩用 `::before`（z-index 1），glyph `i` 必须 `z-index:2` + `color:#fff!important`。正文链接通用规则 `.article-holder .text a:visited:hover{color:#666}` specificity 更高，会覆盖继承色让 PLAY 文字发灰（M48）。
- **尺寸**：Play 图标与 PLAY 文字 `font-size:1000%`（实测 ~198px），绝对定位 `top:50%;left:50%` + `translate(-50%,-50%)` 居中于 16:9 框内；不要照抄官方 `a.play-button` 的 `2000%/3200%`（那是方形 panel 设计，进 16:9 框会溢出）。
- **封面图**：放 `images/blog/`，沿用小写连字符命名（如 `larry-bilibili-cover.png`）。封面方形图给列表卡片用 `cover_img` 字段，横幅给文章页 `header_img`（见 §Blog 工作流）。
- **双语**：en/zh 各放一份同结构卡片，build fallback 成 `.en`/`.zh` 两块，切换语言各自生效。

---

## 3. 检测 / QA 规则（分层检测，从便宜到贵）

**原则：能用便宜的手段就不用贵的。视觉确认是最后手段，不是默认手段。**

### 第 1 层：静态检查（每次改动后必做，秒级）
- 修改的 HTML/JS 语法自查（读一遍，看引用/闭合/路径）。
- `grep` 确认没有残留错误引用（如 `onedirectionmusiccom-ukprod` 页面级引用、`.jpg.jpg`、重复 `<script>` 行）。
- 相对路径深度对照 AGENTS/AGENTS.md 路径表自查。

### 第 2 层：HTTP 级验证（本地 server + 脚本，分钟级）
- 启动 `python -m http.server 8000`（127.0.0.1:8000）。
- 全站图片审计：`python tools/audit/_audit_site_images.py` → 目标 `Broken: 0`。
- 页面 200 / 资源 200 检查：写一次性 Python 脚本 `requests.get` 或 `urllib` 遍历。
- **QA 图片路径必须用真实 HTTP urljoin + 请求验证，不能用 `Path.resolve()`**（HTTP 的 `..` 超过根会被截断，文件系统 resolve 会误报）。

### 第 3 层：浏览器验证（仅当需要确认视觉呈现时才用）
- 需要确认**布局/颜色/动画/响应式/交互行为**时才启动 Playwright。
- 典型场景：CSS 改动后的视觉效果、mobile 断点、slideshow 翻页交互、hover 动画。
- 截图归档到 `tools/_qa_screenshots/`，**按任务分类存放**：每个任务建一个子文件夹（如 `gallery-vision-test/`、`blog-list/`），截图直接写进对应任务文件夹，不要散落在根目录。根目录只允许放任务文件夹。
- **看图默认走 MCP `visionpower`**：截图后用 `visionpower` 的视觉工具分析图片（布局/颜色/是否居中/文字可读性），**不依赖模型原生多模态**（DeepSeek 无此能力）。
- **视觉验证完必须把截图发用户复核**：DeepSeek 无多模态，图片无法在聊天框内联渲染（Read 图片会报错）。视觉验证结束后**用 `open <截图路径>`（macOS）一键弹出关键截图**给用户人工复核，不要只报文字结论。关键截图 3-4 张为上限，不要一次弹一堆。
- **Playwright 默认用 Node**（Python API 本机未装）。全局包在 npm global，本机已装 Chrome：
  ```bash
  # 脚本用 CommonJS require('playwright')，运行时加 NODE_PATH：
  NODE_PATH=$(npm root -g) node tools/_qa_xxx.js
  # 启动必须 channel:'chrome'（本机已装 Chrome，无需下载 headless shell）：
  const browser = await chromium.launch({ channel: 'chrome' });
  ```
- 脚本结束时 `await browser.close()` 或 `process.exit(0)`，否则 chromium 不释放、命令挂起报 timeout。
- 优先 headless；真实浏览器问题（如缓存）需 channel=chrome + `?v=` 版本参数排查。
- **不写截图脚本也能验证几何/颜色**：用 Playwright 读 `boundingBox()` 和 `getComputedStyle`（如图标是否居中、hover 后 opacity/color/z-index），比肉眼看截图更精确，且模型可直接读数值。

### 各场景默认验证方案
| 场景 | 默认验证 | 是否要视觉 |
|------|---------|-----------|
| 改文本/链接/路径 | 第 1+2 层 | 否 |
| 加图片 | 第 2 层（审计 0 断链） | 否 |
| 改 CSS 布局/颜色 | 第 1+2 层 + 第 3 层截图确认 | 是（截图确认视觉） |
| 改 JS 交互 | 第 3 层（Playwright 点击/键盘/滑动断言） | 是（必要时截图） |
| 改 blog/重建页面 | 第 1+2 层 | 否 |
| 批量重建页面 | 脚本幂等检查 + 第 2 层全量审计 | 抽查 1-2 张截图 |

---

## 4. 部署规则（Cloudflare Workers 静态资源 / git 集成）

1. **Cloudflare Workers git 集成拉取 GitHub main 分支部署**：本地 `git push` 到 main 后，Workers 构建（`npx wrangler deploy`，静态资源模式 `assets.directory: "."`）→ 线上 `https://www.5guys1direction.asia/`。
2. **排除不部署的仓库内容：用 `.assetsignore`，不是 `assets.exclude`**：`assets.directory: "."` 意味着**整个仓库**默认都会被托管上线（开发手册 / Skills / 构建脚本 / 原始 Markdown 全部公开可访问，线上 `AGENTS/RULES.md` 一度可 200 直接下载）。排除表放在 assets 根目录的 `.assetsignore`（语法同 `.gitignore`）。⚠️ wrangler **没有** `assets.exclude` 字段，写了既不报错也不生效（详见 M37）。当前排除：`.git/`、`node_modules/`、`.venv/`、`AGENTS/`、`AGENTS.md`、`.agents/`、`.opencode/`、`tools/`、`Chapters/`、`docs/`、`README.md`、`wrangler.jsonc`、`.gitignore`。
   - `.git/` 既已被 `.assetsignore` 排除，`wrangler.jsonc` 里的 `"build": { "command": "rm -rf .git" }`（M37 的旧补丁）已属冗余，可择机移除。
   - **禁止在本地跑 `wrangler deploy` / `wrangler deploy --dry-run`**：wrangler 会执行 `build.command`，也就是真的 `rm -rf .git`，把本地版本库删掉（详见 M53）。要验证上传内容，先 `git clone` 到临时目录再在那边跑。
3. **推送前检查**：
   - `git status`：确认**所有引用的新图片/新文件都已 `git add`**。⚠️ 引用未跟踪目录 = 线上 404（血泪教训：`images/media/article-images/square-sml/`、`images/yt-thumbs/`、`images/media/gallery-images/`、`images/gfx/*-lrg.jpg` 都曾是未跟踪的）。
   - `.gitignore` 应包含 `onedirectionmusiccom-ukprod/`（3.9MB 死克隆，防止 `git add -A` 误纳入）。
4. **推送后**：Workers 控制台（项目 `5guys1direction`）看构建日志；构建成功验证 `https://www.5guys1direction.asia/` 首页 + 关键资源 200。构建失败最常见原因：wrangler.jsonc 缺失（见 §4.2）、单文件 >25MiB。
5. **改 CSS 记得 bump `?v=`**（见 §2.2）。
6. 未完成事项见 `AGENTS/LOG.md` 最新条目"待办"，不要重复创建任务。

---

## 5. 效率 / 成本规则（token 节约）

1. **不要重复读文件**：本次会话读过的文件不重读（除非怀疑被改动）。
2. **并行调用**：无依赖的读/查/检查放同一个回合并行执行。
3. **不做无关检查**：验证只覆盖改动影响面 + 全站审计（审计脚本一次跑完），不逐页点开。
4. **用 grep 定位，不整文件读**：大文件（styles.css 91KB、index.html）只读相关片段。
5. **批量操作写脚本**：脚本一次跑完，不循环手工操作。
6. **报告要短**：交付时给结论 + 关键证据（数字/路径），不贴大段日志。
7. **翻译/长文本生成**：用后台 agent 并行（BYOK），别占用主会话上下文。
8. **非必要不用视觉**（见 §3）：截图 = token 贵，能脚本验证就不截图。

---

## 6. 日志书写规范（写入 AGENTS/LOG.md）

每次任务完成后**必须**写一条。放在文件顶部（最新在上）。

### 6.1 条目模板

```markdown
## YYYY-MM-DD — <一句话标题>

- **模型**：deepseek-v4-flash / Codex / 其他（多模型协作写 "X + Y 复核"）
- **目的**：这次改什么、为什么改
- **结果**：改了什么、怎么改的（关键文件 + 关键手法，3-8 条要点）
- **验证**：怎么验证的（命令 + 结果数字，如 "Broken: 0"）
- **Token 消耗**：约 X 万（估算，主会话 + 后台 agent 分开写）；历史未记录写"未记录"
- **用时**：**实测，不估算**（估算常误差 10 倍）。方法：任务开始时记时间戳，写日志前算差值——
  ```bash
  # 任务开始（或想起时补记）：
  date +%s > /tmp/td_start
  # 写日志前：
  echo "用时 $(( $(date +%s) - $(cat /tmp/td_start) )) 秒"
  ```
  时间戳写在 `/tmp/`（跨工具调用持久），一个任务算一次，多条并发命令不重复计。忘了记起点就用最后一次 bash 命令的 `time` 或 `date` 输出推导，宁写实测数字也不拍脑袋。
- **经验总结**：1-3 条最关键的经验（简短）；详细版写到 RULES.md / METHODS.md
- **遗留/待办**：未完成事项（要能在下次会话直接续做）
```

### 6.2 要求

- **模型名**：必填。多模型接力时写清楚谁做了什么。
- **用时**：必填且**必须实测**（见 §6.1），禁止凭感觉写"约 X 分钟"。实测方法：`date +%s > /tmp/td_start` 记起点，写完日志前 `echo $(( $(date +%s) - $(cat /tmp/td_start) ))` 算秒。
- **Token 消耗**：估算即可（输入+输出），后台 agent 分开列。
- **经验总结**：LOG 里只写简短结论；**详细的坑（现象/根因/处理/预防）写到 METHODS.md**，可复用的流程规则写到 RULES.md。一个坑不要同时在三个文件重复全文。
- **新增坑**：日志写完顺手在 METHODS.md 补一条（若确是新坑）。
- 历史日志按此规范迁移过一次（见 LOG.md 顶部说明）。

---

## 7. 数据源与外部资源规则

- **官网图片**：`www.onedirectionmusic.com/assets/gfx/<name>-lrg.jpg`（高清原图）；⚠️ 不要用 `assets/images/`（同名文件是 3617 字节占位/错误页）。
- **官网 gallery 照片**：`www.onedirectionmusic.com/onedirectionmusiccom-ukprod/media/gallery-images/{rect-sml,rect-med,rect-lrg}/<hash>.jpg`（600×400 / 1200×800 / 1500×1000）。
- **iTunes Search API**（无 key，可靠）：`https://itunes.apple.com/search?term=<query>&entity=song`。找**单曲封面**必须过滤 `collectionName` 含 `- Single` 且 `trackName` 含歌名，或 `collectionName == trackName`；没有就用标准版专辑封面兜底。`artworkUrl100` 的 `100x100bb` 换 `600x600bb` 得高清。
- **YouTube 缩略图**：`https://img.youtube.com/vi/<vid>/hqdefault.jpg`（GFW 可直连；404 试 `0.jpg`/`mqdefault.jpg`），本地化到 `images/yt-thumbs/`。
- **歌词源**：官网 > Genius > AZLyrics > lyrics.ovh（免费无 key 最可靠；`api.lyrics.ovh` 需 URL 编码空格，歌名变体可能决定命中）。
- **已死数据源**：`cdn.smehost.net` 全死；Instagram CDN（scontent-lhr8-1.cdninstagram.com）失效；Wayback Machine 慢且不稳。
- **web_search 可能 402**（plan 余额用完）：此时用后台 agent（BYOK）替代，或直接访问已知 URL。
- **自建相册/slideshow 页不放 `.share` 分享栏**：自建 gallery 相册页（如 gallery/members/* 下的 slideshow）禁止加 Facebook/Twitter `.share` 分享按钮（视觉冗余，坏了审美）。2026-08-16 已从全部 5 个相册页移除。新建相册页时不要在内容区加 `.share` 块；官方克隆页（journal 等）自带的分享元素保留不动。

---

## 8. 沟通 / 交付规则

- 用中文汇报（用户默认中文）。
- 交付给结论 + 关键证据，不贴大段日志。
- 完成的改动报：改了哪些文件（关键）、验证结果（数字）、是否已写日志。
- 需要用户决策时给**建议 + 理由**，不列 pros/cons 让用户选。
- 发现与任务无关但明显坏掉的东西（死链、错误路径），顺手修或在汇报里提一句，不假装没看见。
