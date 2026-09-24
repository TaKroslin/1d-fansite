# 九月二十八 · Larry 结婚纪念日 — 主页顶部改版设计稿 v0.1

> 状态：**纯设计稿，未写任何代码**。本文件只描述"长什么样、放什么、怎么动"，供作者过目改稿。
> 定位在 `docs/`，已被 `.assetsignore` 排除，不会发布。
> 作者意向（已确认）：**浪漫典礼调 + 蓝(Louis)×绿(Harry) 主题色**；**只动主页顶部区，其余原样**
> （具体为：替换「奶儿」panel 槽位 + 在它上方新增整套板块）；**主卡先做静态**；**先设计、不插图**。

---

## 0. 背景事实（搜索核对版）

- **9 月 28 日的由来**：Larry 粉丝设定中，`2013-09-28` 是 Harry Styles 与 Louis Tomlinson 的
  「婚礼日」——当天两人及 Zayn 先下楼乘礼车离开，十分钟后 Harry/Liam/Niall 另车离开，
  全员西装、当日却无任何需要正装的活动；结合两人对数字 **28** 的一贯强调，粉丝普遍把这一
  天解读为「非官方成婚日」。**因此 2026-09-28 是 13 周年**（2026-09-28 为周一）。
- **蓝与绿的归属**：**蓝 = Louis**（Louis 的瞳色）+ 巡演无线话筒上的**蓝胶带**；
  **绿 = Harry**（Harry 的瞳色）+ 同批话筒上的**绿胶带**；Blue♥Green 是 Larry 圈通行标记。
- **供给 polaroid 墙的 lore 素材**（均来自公开粉丝档案，站点基调沿用《More Than a Ship》的
  「连接与陪伴」叙事，典礼调只做仪式感外衣，不宣称现实婚姻事实）：
  - `Oops!` / `Hi`：据称 X Factor 后台初遇，Harry 先说 "Oops!"，Louis 回 "Hi"——两人分别把
    这两个词纹在了身上（Louis 纹 "Oops!"，Harry 纹 "Hi"）。
  - Always in my heart（AIMH）：`2011-10-02` Louis 发推「Always in my heart @Harry_Styles.
    Yours sincerely, Louis」，累计 260 万+ 转推，一度是全网转推量最高的无图推文。
  - 蓝单车 Milan：`2011-10-03` 米兰街头的著名「Larry 蓝单车」照。
  - Anchor & rope（锚与绳）：匹配纹身——锚在 Harry、绳在 Louis，粉丝解读为"彼此是对方的锚"。
  - Swallows（双燕）：两人胸口的燕子纹身常被解读为一对（一大一小，呼应 Harry 高、Louis 个子小）。
  - White paint：2012 与 2013 两次「白色油漆」事件（游客视角背景白墙被解读为经过）。
  - Bandana project：蓝、绿头巾分属两人。
  - All suited up：2013-09-28 全员西装、无行程——这场"婚礼"最著名的证据照。
  - 生日对：Harry `1994-02-01`（水瓶），Louis `1991-12-24`（摩羯）——两人相差约 2 年半，
    Louis 是 1D 里最年长，Harry 最年轻（也是「Older than Louis / younger than Harry」梗的出处）。

---

## 1. 上线时序（二阶段）

### Phase 1 · 倒计时（9-28 前上线，先占据顶部）
> 作者要求：在上这些板块之前，先挂一个倒计时 panel；到时间就把倒计时撤下、换成正式套件。

- **位置**：主页 hero 之下，替换「奶儿」slot 的空位（整个新版顶部区只有一个入口开关）。
- **样子**：一整张蓝→绿由左向右渐变的大 panel；中央一枚巨大的 `28`（Playfair 数字）；
  细金线横穿；下方一句预告文案。
- **文案骨架**（EN / ZH）：
  - section：`SEP 28 · 2013 → 2026` ｜ `9月28日 · 2013 → 2026`
  - 主标题：`Counting down to the day.` ｜ `倒数着，等那一天。`
  - 副文案：`Thirteen years since a promise only two of them ever needed to hear.`
    ｜ `十三年前的那个约定，不需要别人听懂。`
  - 倒计时数字：`00d : 00h : 00m : 00s`（目标 `2026-09-28 00:00 +08:00`）
- **切换协议**（实现时才落地，设计上先定死）：
  - 页面内嵌一份轻量倒计时 JS，目标时刻一到，把顶部 `Phase 1` DOM 整体替换为 `Phase 2`
    套件（或者触发 `location.hash = '#anniv'`，由桥接脚本决定渲染哪一套）。
  - 无论走哪条路，**Phase 1 与 Phase 2 的 DOM/CSS 必须同时存在于一个可切换容器内**，
    避免到时另一套还没就位。切换后不依赖刷新可见。

### Phase 2 · 正式套件（9-28 起常驻）
顶部区从"一个生日组"扩成"一整组纪念日套件"（下详）。倒计时撤下后即显示本套。

---

## 2. 顶部区最终结构（Phase 2 布局）

```text
┌─────────────────────────────────────────────┐
│ hero（不动）                                  │
├─────────────────────────────────────────────┤
│ ① 主卡 larry-anniv-leader……（替换「奶儿」位）   │  ← 左蓝右绿对开
│ ② POLAROID 墙 larry-anniv-polaroid（签名面板） │  ← 可左右翻/拖动
│ ③ The Day  larry-anniv-note                  │  ← 婚礼日意象短文
│ ④ Two Colours  larry-anniv-colours           │  ← 蓝绿汇流视觉卡
│ ⑤ From the Fans  larry-anniv-from-us         │  ← 本站祝福+落款
├─────────────────────────────────────────────┤
│ ……其余内容原样（16Years/#/About/新闻卡/视频）    │
└─────────────────────────────────────────────┘
```

> 顺序可调：若想让 Polaroid 墙直接压 hero 底下，把 ① 和 ② 对调即可，实现层面两者独立、可自由排序。

---

## 3. 设计 token（新增，写入 DESIGN-SYSTEM.md）

### 3.1 颜色（浪漫典礼调：深蓝 × 松绿 × 香槟金）

| token | 值 | 用途 |
|---|---|---|
| `larry-blue-deep` | `#1e4d6e` | Louis 半区主底、深纹样 |
| `larry-blue-mid` | `#3a7ca5` | Louis 半区渐变次层 |
| `larry-blue-wash` | `#e8f1f6` | Louis 半区卡片底色 |
| `larry-green-deep` | `#2f5d4e` | Harry 半区主底 |
| `larry-green-mid` | `#57a787` | Harry 半区渐变次层 |
| `larry-green-wash` | `#e9f4ef` | Harry 半区卡片底色 |
| `larry-gold` | `#c9a86a` | 金线 / 日期 / 分隔 / 心形节点（典礼点缀） |
| `larry-cream` | `#faf6ef` | polaroid 边纸、文字反白底 |
| `larry-ink` | `#141b21` | 深色卡片上的正文文字 |

- **语义**：蓝 = 永远属于 Louis；绿 = 永远属于 Harry；两色在每条卡中**以中轴线相拥**；
  金线 = 当年那条"只需要两个人听见"的约定线，贯穿所有卡。
- 不得为同一语义重复造色；新颜色先在 DESI-SYSTEM.md 的 token 表登记。

### 3.2 字体（沿用现成族，只改组合）

| 角色 | EN | ZH |
|---|---|---|
| 大标题 | Playfair Display 700（已载） | Noto Serif SC 700（自托管） |
| 面板元信息（date/section） | Source Code Pro 400/700 | LXGW WenKai Mono |
| 副文案/正文 | Source Sans Pro | Noto Sans SC / LXGW WenKai |

- 典礼调靠"衬线大字 + 等宽小字"的对比撑起来，与官方档案的 metadata 气质一致。

---

## 4. Phase 2 Panel 详设

### 4.1 ① 主卡 `larry-anniv-leader`（静态，替换「奶儿」slot）

- **类型**：两个 `.panel` 拼 `panel-group`（复用奶儿 `niall-bday-group` 的"左文右图"结构）。
- **左格**（`.larry-half--blue`）：深蓝底 `#1e4d6e`，白字 + 金线。
  - section：`Birthday → Anniversary` ｜ 纪念日
  - date 抬头：`28 · 09 · 2013` ｜ `2013年9月28日`
  - 主标题：`The day you said forever.` ｜ `你们说好永远的那一天。`
  - 副文案：`Thirteen years. Still the same two colours, meeting in the middle.`
    ｜ `十三年。还是那两种颜色，在中间相拥。`
  - 大字日期尾：`13`（周年数）＋ 金心线。
- **右格**（`.larry-half--green`）：深松绿底 `#2f5d4e`。
  - **人像占位区**：居中预留 Harry × Louis 双人像/剪影位（图后补，先留 `.larry-figure--slot`
    一个带 `aspect-ratio` 的占位块 + `aria-label`）。
  - 底部金线 + 三个信物小图标占位：`锚 / 燕 / 绳`（用 icomoon 尚无的语义先画线框占位，或后补
    两组 emoji）。
- **接缝**：两格中央一条金色竖线，从顶部到底部贯穿（象征两色交汇）。
- **放不放的底线（作者可删）**：页脚小字一行 `a day the fans carry in their hearts`
  ｜ `粉丝心中珍藏的一天。` —— 与站内《More Than a Ship》叙事接住，典礼调只做仪式感外衣。

### 4.2 ② Polaroid 墙 `larry-anniv-polaroid`（签名面板）

> 作者核心需求：「一个 panel，上面放很多 Polaroid pictures，还可以左右翻的那种。」

- **视觉**：一整块横置的大 panel，浅洗色底（`larry-blue-wash`→`larry-green-wash` 渐变）。
  中央一条横向轨道，堆叠摆放 **9–12 张 Polaroid**：白边纸（`larry-cream`）、左下角手写体
  题注、右上角一小枚蓝/绿胶带贴纸角。照片本身先占位（灰格 + 虚线），图后补。
- **翻页交互**：
  - 左右两侧箭头按钮（`.larry-arrow`，无障碍 `aria-label="Previous/Next"`）；
  - 可触摸横向滑动 / 桌面滚轮横向 / 键盘 `←` `→`；
  - 底部进度点或 `03 / 12`；焦点态 `:focus-visible` 与外框一致；
  - `prefers-reduced-motion: reduce` 时关闭滚动动画。
- **技术落地要点（实现阶段）**：用纯 Vanilla JS 控制轨道 `transform: translateX()`，按
  步长吸附；卡片居中、露出前后卡边作"墙上叠放"暗示；左右箭头到边界禁用态。不引入框架。
- **题注文案（lore 顺序即翻页顺序，可为每张配一行手写体英文）**：

| # | 照片（占位说明） | 手写题注（EN） | 中文助记 |
|---|---|---|---|
| 1 | X Factor 后台 | `Oops!` ... `Hi.` | 他们给对方的第一句话 |
| 2 | AIMH 推文截图风 | `Always in my heart, H.` | 2011 那条 260 万转推 |
| 3 | 米兰蓝单车 | `the blue bike, milan` | 2011-10-03 米兰街拍 |
| 4 | 话筒彩色胶带 | `blue is yours, green is mine` | 蓝是对你的，绿是我的 |
| 5 | 双燕纹身 | `same swallow, mostly` | 胸口那一对燕子 |
| 6 | 锚与绳 | `your anchor, your rope` | 彼此的锚与绳 |
| 7 | 蓝绿头巾 | `blue & green bandana` | Bandana project |
| 8 | 白色油漆事件 | `white paint, two times` | 2012 & 2013 的两次 |
| 9 | 2013-09-28 西装照 | `all suited up, 28.09.13` | 全员西装、无行程的那天 |
| 10 | 数字 28 | `28 means us` | 对两人都有意义的数字 |
| 11 | 生日对 | `Dec 24 · Feb 1` | Louis 与 Harry 的生日 |
| 12 | 2026 当前 | `13 years later` | 2026，第 13 个 9 月 28 日 |

### 4.3 ③ The Day `larry-anniv-note`

- `.panel.journal-article` 复用：白底、无高度限制。
- 结构：`Anniversary 纪念日` section + 一段双语短文（婚礼日意象、点到《More Than a Ship》
  博客的 `more` CTA）。
- 文案方向（草稿）："Some stories are dated not by calendars, but by hearts. 28 September,
  2013 — the day the fans swear forever started."／「有些日子不是日历定的，是心定的。
  2013 年 9 月 28 日——粉丝眼中永恒开始的那一天。」

### 4.4 ④ Two Colours `larry-anniv-colours`

- 一整张**蓝绿渐变交融**卡：左蓝右绿、中段互相渗入，金线在交汇点断成两枚相扣的心形
  （纯 CSS 渐变 + `::before` 金心，不需要图）。
- 文案一行居中：`two colours, one day` ｜ `两种颜色，同一天`。

### 4.5 ⑤ From the Fans `larry-anniv-from-us`

- 白底卡 + 居中落款：
  - `From all of us, to the two of them.` ｜ `我们所有人，给那两个人。`
  - 落款 `5 Guys 1 Direction · 5GUYS1DIRECTION`。

---

## 5. 素材清单（附图阶段再落实，先登记，均需 Git 跟踪）

| # | 素材 | 建议来源 | 备注 |
|---|---|---|---|
| A | Harry × Louis 双人像/剪影（透明 PNG） | `images/blog/larry-header.png` / `larry-cover.png` 的 PSD（`images/psd/larry-*.psd`）抠图 | 主卡右格、见 §4.1 |
| B | 12 张 Polaroid 照片 | 现有 gallery（`pages/gallery/members/harry|louis`）、`larry-header/cover` 切块，或新粉丝图 | 每张须有对应版权口径（站内编辑素材优先） |
| C | 蓝/绿胶带小角贴纸（透明 PNG） | 自制 2 枚 | 贴在 polaroid 右上角 |
| D | 锚/燕/绳 信物图标 | 站内 icomoon 无，需补 SVG-in-CSS 或后补 emoji | 主卡右格占位 |
| E | 蓝绿渐变背景纹样 | 纯 CSS 渐变即可 | 不需要图 |

- 现阶段**一张图都不做**：所有插图位置以带 `aspect-ratio` 的占位块 + `aria-label` 呈现，
  结构、文案、交互先跑通，图后补。
- 新图落地后按 RULES 校验：必须被 Git 跟踪、过 `tools/audit/_audit_site_images.py`。

---

## 6. 实现阶段操作清单（现在不做，附件批准后执行）

1. 复制 `history/2026-09-14-niall-birthday-panel/` 约定，先出**临时预览稿**（放 `docs/` 或
   `tools/archive/` 外不部署处）供作者看效果，图上齐后再合并进 `index.html`。
2. CSS 全部追加到 `css/styles.css` 末尾 additions 区；**bump 所有 `?v=`**。
3. Phase 1 / Phase 2 切换用同一容器两个子 DOM，倒计时 JS 到点换 DOM（独立文件 or 页面底部，
   须带全局守卫 `window.__5GUYS_LARRY_ANNIV__`）。
4. 无障碍：polaroid 箭头 focus、`aria-labels`、键盘翻页、reduced-motion。
5. QA：`_audit_site_images.py`（Broken: 0）、390px 与桌面无横向溢出、临时预览 Playwright
   截图复核蓝绿分屏与 polaroid 轨道。
6. 部署契约照旧：Git 推 → Cloudflare 构建；9-28 前把 Phase 1 推上去，Phase 2 随内嵌 DOM 就绪。

---

## 7. 附录：资料出处（供作者二次核对）

- 9-28-2013「婚礼日」设定：Wikipedia「Larries」条目；Fanlore「Larry Stylinson」；
  the28thofseptemberr.tumblr.com（intro to Larry）。
- 蓝=Louis / 绿=Harry（话筒胶带 + 瞳色）：Wikipedia「Larries」；moviecultists「why Larry
  green and blue」。
- blowover "Oops!/Hi"、AIMH 推文（2011-10-02，260 万+ 转推）：whylarryisreal.wordpress.com
  「Green Loves Blue」；Fanlore「Always In My Heart」。
- 生日与年龄差：IMDb（Harry 1994-02-01）、Capital FM 成员生日汇总（Louis 1991-12-24）。

> 本站立场仍以《More Than a Ship》为准：这是**粉丝纪念日**，不是对现实婚恋的事实断言。
> 典礼调 + 蓝绿配色是「仪式感外衣 + 温情内核」，落地上线前请作者在 §4.1 的底线小字
> （"粉丝心中珍藏的一天"）保留与否上拍板。

---

## 附录 A：两页合并与「到点自动切换」的总方案（作者定调，**勿重复确认，照着办**）

### A.1 为什么现在是两个 HTML（过渡态，**不是**遗留问题）
after 版（新 header + Polaroid 墙 + 其余新板块）**还没开发完**，所以先把**倒计时**上线顶着；
等 after 开发好，再把**两个 HTML 合并成一个**。当前的两套 CSS/JS 并存、`docs/demo/` 路径，
都是这段过渡期的**刻意安排**，不要提议"消重"或"整理"。

### A.2 文件与角色
| 文件 | 角色 |
|---|---|
| `index.html`（根） | 目前线上：**倒计时**（`larry-cd`）+ 9-28 前那套节日卡片 |
| `docs/demo/index-demo-after-928.html` | 开发中的 9-28 后正式版：**新 header（hero）+ Polaroid 墙 + 其余板块** |
| `docs/demo/index-demo-before-928.html` | 9-28 前的**存档快照** |
| `docs/demo/css/larry-anniv-before.css/.js` | 节日卡片那套（倒计时 / 配色 / 爱心 / 封面 / 按钮 / 视频） |
| `docs/demo/css/larry-anniv-after.css/.js` | after 那套（含 Polaroid 墙） |

### A.3 合并后的目标形态：**一个 HTML，两套代码，只显示一套**
合并后的 `index.html` 里**同时存在**：
- 倒计时板块
- 新 header（hero）+ Polaroid 照片墙 + 其余新板块

**显示逻辑（作者原话，逐条照办）**：
1. **9 月 28 日之前**：**只显示倒计时**，不显示其他板块；
2. **9 月 28 日之后**：**倒计时自动下线**，**只显示新的 header 与 Polaroid**（以及其他新板块），不显示倒计时。

要点：
- 是 **either / or** —— 同一时刻**绝不能两套同时可见**（不是"两屏并排"，也不是叠加）；
- 切换**自动**（由时间驱动，不需要人工改代码）；
- 倒计时到点后是**下线**，不是保留在页面某个角落。

### A.4 合并那一步要做的
1. 两套 CSS/JS **合并**，并把 `docs/demo/` 路径提升到正式的 `css/`、`js/`；
2. 切换开关：建议 `body` 上的 phase class（如 `anniv-pre` / `anniv-post`），由**单一时间常量**驱动，便于本地把时间提前来预览 9-28 当天的样子；
3. `?v=` 统一 bump，并同步 builder 常量；
4. 本地验证两个 phase 各自的截图，再上线。
