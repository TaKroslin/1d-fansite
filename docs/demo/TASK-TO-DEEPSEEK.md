# 任务书：Larry 9-28 纪念日顶部套件 — 逐卡实现

> 发给 DeepSeek 的任务说明。**目标：一次性提交一张卡片（HTML 结构 + CSS + 双语文案），
> 由作者在浏览器验收后再做下一张。禁止一次性写完所有卡片。**

---

## 0. 你在帮谁的网站

**FIVE GUYS ONE DIRECTION** —— 一个纯静态的 One Direction 粉丝站
（HTML/CSS/JS + jQuery，视觉和结构复刻官方 onedirectionmusic.com，另加粉丝编辑内容）。
无框架、无打包工具，你不能引入任何新的库。

- 首页：`index.html`；全局样式：`css/styles.css`（官方 minified 主体 + 文件末尾本地追加区）
- 共享字体：Google Fonts（Playfair Display 700、Source Code Pro、Source Sans Pro 已加载）
- 双语约定：站内所有可见文本用 `<span class="en">…</span><span class="zh">…</span>` 成对包裹
- 站点立场：这是**粉丝纪念日**内容，不是对现实婚恋的事实断言（详见站点《More Than a Ship》文章基调）

---

## 1. 当前项目状态（务必先读，现状就是这些）

### 1.1 已经发生的

- 设计稿已定：`docs/larry-9-28-anniversary-design.md`（下称「设计稿」）——**这是你唯一的文案与
  配色依据**，包含：9 个设计 token、字体分工、Phase 2 顶部区 5 个板块（①主卡 ②Polaroid 墙
  ③The Day ④Two Colours ⑤From the Fans）的逐格详设、以及 12 条 Polaroid 题注表格。
- **之前的 demo 代码已全部删除**（含全部 HTML 套件、`css/larry-anniv.css`、`js/larry-anniv.js`）。
- 当前 `docs/demo/index.html` 只是**空白临时骨架**（约 10 行，body 内仅一行注释）。
- 设计稿 §6 要求：先出临时预览稿（放 `docs/demo/`，已被 `.assetsignore` 排除、不会发布），
  作者验收后再合并进真首页 `index.html`。

### 1.2 你接下来要做的

按设计稿顺序，**一张卡一张卡**在 `docs/demo/index.html` 里重建整套顶部专题。
每完成一张：作者在浏览器（桌面 1440 / 移动 390）对照截图验收 → 通过 → 再做下一张。

### 1.3 你手上现有的资源

- 设计稿：`docs/larry-9-28-anniversary-design.md`（token、文案、题注全在里面，**不要另造文案**）
- 真首页范本：`index.html`（它的博客卡/面板结构就是你要复用的官方结构，抄它）
- 官方样式：`css/styles.css`（改 CSS 前先 grep 官方是否已有想用的 class/token，别重造）
- 可用图片（Git 已跟踪，可安全引用）：
  - `images/blog/larry-cover.png`
  - `images/blog/larry-header.png`
  - `images/blog/larry-bilibili-cover.png`
  - `images/gfx/filmstrip-harry-lrgc4ca.jpg`
  - `images/gfx/filmstrip-louis-lrgc4ca.jpg`
  - 设计稿 §5 素材清单 B 提示还可从 `pages/gallery/members/harry|louis` 切片
- 历史参考：`history/2026-09-14-niall-birthday-panel/`（「奶儿」生日组，「左文右图」panel-group
  结构，主卡和它同构）

---

## 2. 硬性规范（违反 = 返工，逐字照做）

### 2.1 官方 class 体系（必须有，禁止自造替代）

| 需求 | 官方做法 |
|---|---|
| 一张 2:1 的面板卡 | `.panel.journal-news.homepage-news` —— 官方自带桌面 `padding:50% 0 0`（2:1）、移动 `max-width:767px` 时 `padding:100% 0 0!important`（1:1）。**不要用自己写的 `padding-top` 或 aspect-ratio 覆盖它** |
| 面板顶部元信息（日期+栏目） | 用 `.panel .panel-header`（官方 Times New Roman 87.5%、absolute）；内层 `.title` + `.section-name` |
| 大标题 | `h2`，官方默认 Playfair Display 700、281%；需要缩小就用 `h2 .scaler`（inline `style="font-size:82%"` 之类），**不要绕开 .scaler 直接写死字号** |
| 按钮 | `a.more`，官方 Source Code Pro 600 uppercase（`padding:.8em 2.6em;letter-spacing:.035em;border:.15em`） |
| 深色图文卡 | `.panel.journal-news.homepage-news.homepage-blog-card` + 面板 inline 背景 `background:url(...) center/cover no-repeat #000` + 面板内文字 inline 白色 |
| 浅色文字卡 | `.panel.journal-news.homepage-news`，默认黑字黑框即可 |

### 2.2 已踩透的坑（前人总结，直接规避）

1. **`.panel.journal-news{color:#000}` 是全局的** —— 深色卡里任何"看起来该白"的副文案、计时器、
   自定义组件，都必须**逐个显式设 `color:#fff`**，否则变黑字压深底。别指望那一层"官网白样式"
   会兜住所有子孙元素。
2. **移动端官方会把 `homepage-news` 背景设成 `background-size:40%`** —— 任何 inline 背景必须
   写全 `center/cover no-repeat`，渐变背景同样。
3. **浅灰/浅色照片不能直接当深色卡底**（白字对比不足）—— 深色卡背景若用照片，采用双层 inline
   背景压暗：`background:linear-gradient(rgba(20,27,33,.3|.62|.78),…) ,url(...) center/cover no-repeat #000;`
4. `js/main.js` 会给 `.js .panel` 加 `fade-me` 滚动渐入动画 —— 截图时浅色卡瞬间 opacity:0 属正常，
   不是 bug，**不要为了截图去改动画**。
5. **资源路径**：在 `docs/demo/index.html` 里，一切引用加 `../../` 前缀
   （`../../css/styles.css`、`../../images/...`、`../../pages/...`）。

### 2.3 设计 token（设计稿 §3，照抄）

```css
--larry-blue-deep:#1e4d6e; --larry-blue-mid:#3a7ca5; --larry-blue-wash:#e8f1f6;
--larry-green-deep:#2f5d4e; --larry-green-mid:#57a787; --larry-green-wash:#e9f4ef;
--larry-gold:#c9a86a; --larry-cream:#faf6ef; --larry-ink:#141b21;
```

字体分工：大标题 Playfair Display 700（ZH 用 Noto Serif SC）；面板元信息 Source Code Pro（ZH 用
LXGW WenKai Mono）；副文案/正文 Source Sans Pro（ZH 用 Noto Sans SC / LXGW WenKai）。

### 2.4 文件放置

- 新增 CSS 全部放进 `docs/demo/css/larry-anniv.css`（新建），在 `index.html` 的
  `<link>` 里追加一行引用（`<link href="css/larry-anniv.css" rel="stylesheet">`，
  位置在 `../../css/styles.css` 之后）。
- 新增交互 JS（倒计时、Polaroid 翻页）放 `docs/demo/js/larry-anniv.js`（新建）。
- 不碰 `css/styles.css`、不碰线上 `index.html` 直到作者说「合并/移植」。
- 新增 class 一律 `larry-` 前缀开头，先 grep 确认不重复。

---

## 3. 工作流程（每次只做一张）

### 阶段 A — 主卡（设计稿 §4.1）
设计要求：两个 `.panel` 拼 `panel-group`（照抄「奶儿」`niall-bday-group` 结构），左蓝右绿对开、
中央金竖线；左格白字+金线+大字`13`，右格人像占位块+锚/燕/绳占位。全部文案用设计稿 §4.1。

### 阶段 B — Polaroid 墙（设计稿 §4.2）
12 张、左右箭头翻页、`03/12` 计数、触摸/滚轮/键盘、`prefers-reduced-motion`。
纯 Vanilla JS `transform: translateX()`，不引框架。12 条题注照抄设计稿表格。
照片用 §1.3 现有图循环占位（可 5 张轮换），图后补。

### 阶段 C — The Day（设计稿 §4.3）→ 阶段 D — Two Colours（§4.4）
### 阶段 E — From the Fans（§4.5）

> Phase 1 倒计时（设计稿 §1）先不做，作者会另行安排时机。目前只做 Phase 2 的 ⑤~① 或设计稿 §2 顺序。

---

## 4. 每张卡的提交格式（照此输出，作者按此验收）

1. **实现了哪一张**（阶段字母 + 卡片名）
2. **改动文件清单**（`docs/demo/index.html` / `css/larry-anniv.css` / `js/larry-anniv.js`）
3. **自检清单**（一票否决项）：
   - 桌面 1440：卡片比例 2:1（如用了 homepage-news）；移动 390：1:1
   - 深卡文字全白、浅卡文字全黑（用浏览器 computed style 核对，别靠目测）
   - h2 = Playfair Display；panel-header = Times；按钮 = Source Code Pro uppercase
   - 无 console 报错；图片路径都已存在并被 Git 跟踪
4. **给出验证方法**（跑哪条命令 / 打开哪个 URL / 点哪个按钮测什么）

---

## 5. 边界（红线，别越）

- 不引入任何框架/库/打包工具；不手改官方 `css/styles.css` 和线上页面
- 不擅自改设计稿文案与配色；新文案先问作者
- 不用不存在的图片路径；新图必须确认 Git 跟踪
- 不写注释成堆的代码（本站风格是干净、结构即文档）
- 每次改完代码后验证一次再说「完成」