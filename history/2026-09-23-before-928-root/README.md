# 历史存档：9-28 纪念日「倒计时版」根首页（Phase 1）

**日期**：2026-09-23
**内容**：根首页 `index.html` 在「Larry 9-28 纪念日」倒计时 panel 上线之后、节日改造
**之前**的那一版完整快照（HTML + CSS + JS）。

---

## 这是什么

2026-09-22 的 `d6aebe1` 把根首页的 Niall 生日 panel 换成 Larry 9-28 倒计时 panel（Phase 1）。
2026-09-23 的 `edb2ac1` 准备把根首页换成节日版（即现在 `docs/demo/index-demo-before-928.html`
的那套内容），换版之前把当时挂在线上的那一版根首页备份到本文件夹。

> **别搞混**：本存档是**倒计时版**（有 `.panel.larry-cd` / `js/larry-anniv.js`），
> **不是**「倒计时出现之前」的 Niall 版。Niall 版另有存档 →
> `history/2026-09-14-niall-birthday-panel/`。

## 文件

| 文件 | 说明 | 出处 |
|------|------|------|
| `index.html` | 根首页快照，**只改了资源引用路径**（见下），标记与文案一字未动 | `d6aebe1` |
| `css/styles.css` | 与 `index.html` 对应的那一版 CSS，**只改了内部 `url()` 的层级** | `d6aebe1` |
| `js/larry-anniv.js` | 倒计时脚本（Phase 1）。它是这一版首页的专用交互，故一并冻结 | `d6aebe1` |
| `README.md` | 本文件 | — |

## 资源引用怎么接的

存档放在 `history/2026-09-23-before-928-root/`，比仓库根目录**深两层**，所以引用项目里的
现成资源时统一加 `../../`：

| 资源 | 项目里的位置 | 存档里的引用 |
|------|-------------|-------------|
| 样式 | `css/styles.css` | **存档本地** `css/styles.css`（见下方说明） |
| 倒计时脚本 | `js/larry-anniv.js` | **存档本地** `js/larry-anniv.js` |
| 共享脚本 | `js/jquery.min.js` / `js/main.js` / `js/translate.js` | `../../js/*.js` |
| 图片 | `images/**` | `../../images/**` |
| 站内页面 | `pages/**` | `../../pages/**` |
| 首页 logo 回链 | `index.html` | `../../index.html`（回**活的**首页） |
| 字体 | `assets/fonts/**` | `../../../assets/fonts/**`（由 CSS 内部引用） |

- **图片一个都没有复制**：hero 大图、9 张板块封面、倒计时的两个手写 motif
  （`images/gfx/larry-anniv-2026/motif-oops.png` / `motif-hi.png`，CSS `mask` 引用）全部
  指向项目里的原件。
- **字体也没有复制**：`css/styles.css` 里的 `@font-face` 已引用 `../assets/fonts/...`
  （自托管：得意黑 / 霞鹜文楷 / 舟游像素 / 站酷快乐体 / 思源黑·宋），存档里的 CSS 副本
  把这段前缀从 `../` 调成 `../../../`（因它比项目的 `css/` 又深了一层），中文字体照常生效。
- 样式表链接去掉了 `?v=` 查询串：本地快照不走浏览器缓存，`?v=` 只对线上发布有意义。

### 与另两个存档的**一处刻意不同**

`history/2026-09-14-niall-birthday-panel/` 与 `2026-08-31-liam-33rd-birthday/` 的做法是
「存一份 CSS 快照，但页面链的是仓库里**活的** `../../css/styles.css`」。

本存档改为**链存档内冻结的那一份**（`css/styles.css`）。理由：`.larry-cd` / `.larry-cd-stripes`
这一整套规则在 9-28 合并时会被重写或删除，若链活的那份，这个存档迟早会变成"有 HTML 没样式"
—— 而它存在的意义正是留住换版前那一刻的样子。

## 出处（Git）

| 内容 | 来源 |
|------|------|
| `index.html` | 提交 `d6aebe115fc8d2e826f77d77d4fc6cceb81cffeb`（2026-09-22，`feat(home): Larry 9-28 倒计时 panel 上线，奈尔面板下线并归档`）中的 `index.html` |
| `css/styles.css` | 同一提交中的 `css/styles.css` |
| `js/larry-anniv.js` | 同一提交中的 `js/larry-anniv.js` |

> **核对方式**：把存档里加的前缀（`../../images/`、`../../pages/`、`src="../../js/`、
> `href="css/styles.css"`）逐条还原后，与 `d6aebe1:index.html` 做逐行 diff，
> 结果 **0 处实质差异**（只剩一个行尾空行，是备份时就带的）。
> 另外 `796992d`（09-23，Polaroid 墙）当时**没有**动过 `index.html`，所以本存档的内容
> 与 `edb2ac1` 换版前一刻的线上根首页一致。
> `css/styles.css` 自 `d6aebe1` 之后被 `b5ed855` 追加过 25 行（是 Larry 相册的
> `.larry-photos` 规则），与首页无关，故本存档取 `d6aebe1` 那一版。

## 这个版本长什么样

一块 `panel larry-cd` 倒计时面板，替换掉原来的 Niall 生日 panel：

- 背景 `larry-cd-stripes`：`repeating-linear-gradient(90deg, 蓝, 绿)` 竖条纹
  （`--larry-blue-fresh` / `--larry-green-fresh`）
- 抬头：`2026.9.28` / `2026年9月28日` + `Counting down` / `倒计时`
  （移动断点隐藏 `larry-cd-logo`，桌面显示 `5 GUYS 1 DIRECTION` 小 logo）
- 主体：左 `oops!`（Louis）、右 `Hi`（Harry）两个手写 motif + 居中奶油色数字牌
  `03 : 23 : 56 : 26`（天/时/分/秒，`role="timer"`）
- 底注：`Thirteen years since a promise only two of them ever needed to hear.`
  / 「十三年前的那个约定，不需要别人听懂。」

倒计时逻辑在 `js/larry-anniv.js`：目标 `2026-09-28T00:00:00+08:00`，自校正对齐整秒，
到点后冻结、加 `is-live`、派发 `larry:anniv-live`（原设计给 Phase 2 接管），
并用 `window.__5GUYS_LARRY_ANNIV__` 做重复加载守卫。

## 验证（2026-09-24 补资产时实测）

从仓库根起 server 后打开 `http://127.0.0.1:8000/history/2026-09-23-before-928-root/index.html`：

- **仓库内 404：0**（`../../images/**`、`../../js/*.js`、存档本地 `css/` `js/` 全部 200）
- `jQuery` 为 `function`；`window.__5GUYS_LARRY_ANNIV__ === true`
- 倒计时**在走**：`…58min 21sec` → 2 秒后 `…58min 19sec`
- `.panel.larry-cd` 高度 **720px**（1440×900 视口），条纹渐变生效，
  motif `mask` 解析到 `/images/gfx/larry-anniv-2026/motif-oops.png`
- 页面加载的样式表确实是存档本地那份；`document.fonts.status === "loaded"`
- 唯一失败请求是 `fonts.googleapis.com` 的 502（外网抖动；主站同样走这套 Google Fonts 兜底）

## 已知限制

- 本页依赖仓库根目录的 `images/` / `js/` / `assets/` / `pages/`，**不能把这个文件夹单独拎出去用**。
  推荐从仓库根目录起 server 后访问 `/history/2026-09-23-before-928-root/index.html`。
- **双击用 `file://` 打开也能看**（样式与字体正常，`../../` 相对路径照常解析）；
  但 `js/main.js` 的 `retinafy` 高清图升级走 XHR，在 `file://` 下会被跨源拦截，
  于是**图片退回普通清晰度**（不是坏掉、是略糊）。要高清就用上面的 server 方式。
- 倒计时到 2026-09-28 00:00 (+08:00) 会归零并冻结。它派发的 `larry:anniv-live` 本来
  是给 Phase 2 用的，本存档不含 Phase 2，所以到点后就停在 `00 : 00 : 00 : 00`。
- 线上（Cloudflare Workers）整个仓库都会部署，所以这个文件夹在线上也能访问
  （`https://www.5guys1direction.asia/history/2026-09-23-before-928-root/`）。
  它**不参与站点导航**，没有页面链接到它。（`README.md` 被 `.assetsignore` 的
  `**/README.md` 排除，不会对外托管。）
