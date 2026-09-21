# 历史存档：Niall「奶儿船长」生日首页 panel

**日期**：2026-09-14
**内容**：首页（`index.html`）Niall 生日 panel 版本的静态存档。

---

## 这是什么

2026-09-13 是 Niall 生日。`224b6c2` 把首页的 Liam 生日横幅换成 Niall「奶儿船长」生日 panel。
本文件夹是这版首页的完整快照（HTML + CSS），沿用 `history/2026-08-31-liam-33rd-birthday/`
的存档约定：**HTML + CSS 存在这里，图片和字体沿用项目里已有的那份**（不重复复制）。

**存档动机**：计划在 2026-09-28 把这个生日 panel 换成 Harry 和 Louis 的结婚纪念日 panel。
换卡前先把现版存下来，日后想还原或对照都有出处。

## 文件

| 文件 | 说明 |
|------|------|
| `index.html` | 2026-09-14 首页快照，**只改了资源引用路径**，标记与文案一字未动 |
| `css/styles.css` | 与 `index.html` 对应的那一版 CSS，**只改了内部 `url()` 的层级**（见下） |
| `README.md` | 本文件 |

## 资源引用怎么接的

存档放在 `history/2026-09-14-niall-birthday-panel/`，比仓库根目录**深两层**，
所以引用项目里的现成资源时统一加 `../../`：

| 资源 | 项目里的位置 | 存档里的引用 |
|------|-------------|-------------|
| 样式 | `css/styles.css` | `../../css/styles.css` |
| 图片 | `images/**` | `../../images/**` |
| 脚本 | `js/*.js` | `../../js/*.js` |
| 字体 | `assets/fonts/**` | `../../../assets/fonts/**`（由 CSS 内部引用） |

- **图片一个都没有复制**，`images/gfx/niall-bday-2026/`（`bg.png` / `main.png` /
  `sticker-top.png` / `sticker-left.png` / `sticker-right.png`）、首页 hero、板块封面等
  全部指向项目里的原件。
- **字体也没有复制**：`css/styles.css` 里的 `@font-face` 已引用 `../assets/fonts/...`
  （自托管：得意黑 / 霞鹜文楷 / 舟游像素 / 站酷快乐体 / 思源黑·宋），存档里的 CSS 副本
  把这段前缀从 `../` 调成 `../../../`（因它比项目的 `css/` 又深了一层），中文字体照常生效。
- **本卡片的交互是内联 `<script>`**（心形/国旗 emoji 上浮、贴纸 alpha 命中判定、触屏适配）
  就写在 `index.html` 里，随 HTML 一起走，无需额外的 JS 文件。
- `js/` 三件套（`jquery.min.js` / `main.js` / `translate.js`）与 `css/` 已加 `../../`，
  中英切换按钮和 `retinafy` 高清背景在存档页可正常工作。

> 代价：`index.html` 与 `css/styles.css` 不再与 Git 里的原版**逐字节相同**（改了路径），
> 但正文标记、文案、样式规则本身完全一致 —— 已用 diff 核对：把路径前缀还原后，
> 与本存档来源的提交内容**逐行相同**（唯一差异是上面的 `og:image` 路径和样式版本号 `?v=`）。

## 出处（Git）

| 内容 | 来源 |
|------|------|
| `index.html` | 提交 `466956d`（2026-09-14，`feat(home): 移动端触屏适配，修掉点击时整张卡片闪一下`）中的 `index.html` |
| `css/styles.css` | 同一提交 `466956d` 中的 `css/styles.css` |

> 已用 `git diff 466956d HEAD -- index.html css/styles.css` 核对：当前文件与 `466956d`
> 逐字节相同，本存档就是那一版。存档里的样式表链接去掉了 `?v=` 查询串：本地快照不走
> 浏览器缓存，`?v=` 只对线上发布有意义。

## 日期为什么是 9-14

Niall 生日是 **9 月 13 日**（1993-09-13）。这套 panel 版本的时间线：

| 时间 | 做了什么 |
|------|---------|
| 09-13 | Niall 生日当天：`224b6c2` 把 Liam 横幅归档进 history，换成 Niall 生日 panel + 图层化贴纸交互上线 |
| 09-14 | `bc005e7` 左右两格交互拆成两套独立 handler（左格不冒 emoji / 右格贴纸失效 → 修复） |
| 09-14 | `466956d` 移动端触屏适配，修掉点击时整张卡片闪一下 ← **本存档就是这一版** |

即：和 Liam 那次一样，生日卡常驻上线后又改了两次交互细节。本存档取**最后一次改动它
的提交日 2026-09-14**。

## 这个版本长什么样

一块 `panel-group niall-bday-group` 左右两格生日卡：

- **左格 `niall-panel`（文字格）**
  - 抬头：`13th September 1993` / `1993年9月13日`
  - 分类：`Birthday` / `生日纪念`
  - 大标题：`Happy Birthday Captain Niall!` / `奶儿船长 生日快乐！`
  - 副文案：`It's the captain's birthday.` / `今天是船长的生日。`
  - 提示行：`Tap anywhere for hearts` / `点一下，冒颗心`
  - 日期：`13 · 09 · 1993`
- **右格 `niall-photo-panel`（图片格）**
  - 背景 `bg.png` + 四张图层化贴纸按钮：主人物 `main` 与 `top` / `left` / `right`
    三张表情贴纸，PNG alpha 通道逐像素命中判定
  - 踩贴纸 → 贴纸动（主人物 `is-pulse` 鼓一下，小贴纸 `is-wiggle` 晃一下）；
    点空白 → emoji 上浮（🧡 / 🇮🇪 交替，一次一种）
  - 两格都有常驻上浮 emoji 让卡片"活着"
  - 触屏用缓存几何、跳同步布局计算，避免点击闪屏

CSS 实现集中在 `css/styles.css` 里的 `.niall-*` 规则（`.niall-bday-group` / `.niall-panel` /
`.niall-hearts` / `.niall-headline` / `.niall-copy-bottom` / `.niall-photo-panel` /
`.niall-figure` 及 `--main/--sm/--top/--left/--right` 修饰、`is-pulse` / `is-wiggle` /
`is-on-sticker` 态、`.niall-heart` / `.niall-float` 动画、响应式隐藏等）。

## 已知限制

- 本页依赖仓库根目录的 `css/` `js/` `images/` `assets/`，**不能把这个文件夹单独拎出去用**。
  推荐从仓库根目录起 server 后访问
  `/history/2026-09-14-niall-birthday-panel/index.html`。
- **双击用 `file://` 打开也能看**（样式与字体正常，`../../` 相对路径照常解析）；
  但 `js/main.js` 的 `retinafy` 高清图升级走 XHR，在 `file://` 下会被跨源拦截，
  于是**图片退回普通清晰度**（不是坏掉、是略糊）。要高清就用上面的 server 方式。
- **贴纸交互不受影响**：PNG alpha 命中与 emoji 动画都是内联 JS + 本地图片，`file://`
  下照常工作。
- **字体说明**：字体全部来自项目原有的两处来源，存档没有自己的字体文件 ——
  `@font-face` 指向 `assets/fonts/**`（自托管：得意黑 / 霞鹜文楷 / 舟游像素 / 站酷快乐体 /
  思源黑·宋），拉丁字形走 Google Fonts。
- `css/styles.css` 里另有历史遗留的失效引用（`.woff` / `.eot` 兜底格式与
  `images/gfx/filmstrip.html`）—— 项目自己的 `css/styles.css` 里同样是失效的，
  现代浏览器只会取 `.woff2`，**不是本存档引入的问题**。
- 线上（Cloudflare Workers）整个仓库都会部署，所以这个文件夹在线上也能直接访问。
  它**不参与站点导航**，没有页面链接到它；日后整理站点可整体删除或加 `.assetsignore` 排除。