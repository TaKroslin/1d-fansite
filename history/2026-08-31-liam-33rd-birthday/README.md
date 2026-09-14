# 历史存档：Liam 33 岁生日首页卡片

**日期**：2026-08-31
**内容**：首页（`index.html`）Liam Payne 生日横幅版本的静态存档。

---

## 这是什么

2026-09-13 是 Niall 生日。9-14 把首页的 Liam 生日横幅换成 Niall 生日 panel 时，
把当时的首页存了一份到 `history/`，但**只存了 HTML、漏了它引用的 CSS** ——
结果是页面在 `history/` 里裸奔（无样式）。

本文件夹补齐那份存档：**HTML + CSS 存在这里，图片和字体沿用项目里已有的那份**（不重复复制）。

## 文件

| 文件 | 说明 |
|------|------|
| `index.html` | 2026-08-31 首页快照，**只改了资源引用路径**，标记与文案一字未动 |
| `css/styles.css` | 与 `index.html` 对应的那一版 CSS，**只改了内部 `url()` 的层级**（见下） |
| `README.md` | 本文件 |

## 资源引用怎么接的

存档放在 `history/2026-08-31-liam-33rd-birthday/`，比仓库根目录**深两层**，
所以引用项目里的现成资源时统一加 `../../`：

| 资源 | 项目里的位置 | 存档里的引用 |
|------|-------------|-------------|
| 样式 | `css/styles.css` | `../../css/styles.css` |
| 图片 | `images/**` | `../../images/**` |
| 脚本 | `js/*.js` | `../../js/*.js` |
| 字体 | `assets/fonts/**` | `../../assets/fonts/**`（由 CSS 内部引用） |

- **图片一个都没有复制**，`liam-bday-2026-rect.png` / `-square.png`、首页 hero、
  板块封面等全部指向项目里的原件。
- **字体也没有复制**：`css/styles.css` 里的 `@font-face` 已经引用了
  `../assets/fonts/...`（自托管中文字体）与 Google Fonts；存档里的 CSS 副本把这段前缀
  从 `../` 调成 `../../../`（因为它比项目的 `css/` 又深了一层），因此中文字体照常生效。
- 顺手修好了存档页里原本会 404 的 3 个 JS 引用（`jquery.min.js` / `main.js` / `translate.js`）：
  现在**中英切换按钮和 `retinafy` 高清背景都能正常工作**。

> 代价：`index.html` 与 `css/styles.css` 不再与 Git 里的原版**逐字节相同**（改了路径），
> 但正文标记、文案、样式规则本身完全一致 —— 已用 diff 核对：把路径前缀还原后，
> 与本存档来源的提交内容**逐行相同**（唯一差异是上面的 `og:image` 路径和样式版本号 `?v=`）。

## 出处（Git）

| 内容 | 来源 |
|------|------|
| `index.html` | 提交 `e075108`（2026-08-31 11:21，`feat(home): add bilingual 'click to view fan creations' CTA line`）中的 `index.html`，即最后添加双语 CTA 那行之后的版本 |
| `css/styles.css` | 同一提交 `e075108` 中的 `css/styles.css` |

> 存档里的样式表链接去掉了 `?v=` 查询串：本地快照不走浏览器缓存，`?v=` 只对线上发布有意义。

## 日期为什么是 8-31

Liam 生日是 **8 月 29 日**。这套横幅版本的时间线：

| 时间 | 做了什么 |
|------|---------|
| 08-23 | 首页 Liam 生日 panel + 倒计时上线（`e5a2c1b`） |
| 08-30 23:34 | 建 Liam 生日 Fan Art 相册（`fd75ee4`） |
| 08-31 11:18 | 删掉倒计时，改成**常驻顶部横幅**并整卡链到 Fan Art 相册（`0f9be28`） |
| 08-31 11:21 | 横幅底部加双语「点击查看 粉丝创作」提示行（`e075108`）← **本存档就是这一版** |

即：Liam 生日当天（8/29）首页上还是倒计时版，**生日卡片文案是生日过了之后才补做的** ——
和 Niall 这次「忘了当天、第二天补」是一模一样的情况。
本存档取**最后一次改动它的提交日 2026-08-31**。

## 这个版本长什么样

一块整页宽的白色生日横幅（`liam-bday-panel`），整块可点击，跳转到 Fan Art 相册
`pages/gallery/fan-art/happy-liams-33rd-birthday.html`：

- 抬头：`29th August 1993 / BIRTHDAY 生日纪念`
- 大标题：`Happy Birthday Liam!` / `Liam，生日快乐！`
- 副文案：`You're always the cutest guy.` / `你永远是最可爱的男孩。`
- 年份：`1993 — 2024`（悼念语义）
- 底部：双语「点击查看 粉丝创作」提示

CSS 实现集中在 `css/styles.css` 里的 `.liam-*` 规则（`.liam-bday-panel` / `.liam-stage` /
`.liam-headline` / `.liam-copy-bottom` 等）。

## 已知限制

- 本页依赖仓库根目录的 `css/` `js/` `images/` `assets/`，**不能把这个文件夹单独拎出去用**。
  推荐从仓库根目录起 server 后访问 `/history/2026-08-31-liam-33rd-birthday/index.html`。
- **双击用 `file://` 打开也能看**（样式与字体正常，`../../` 相对路径照常解析）；
  但 `js/main.js` 的 `retinafy` 高清图升级走 XHR，在 `file://` 下会被跨源拦截，
  于是**图片退回普通清晰度**（不是坏掉、是略糊）。要高清就用上面的 server 方式。
- **字体说明**：字体全部来自项目原有的两处来源，存档没有自己的字体文件 ——
  `@font-face` 指向 `assets/fonts/**`（自托管：得意黑 / 霞鹜文楷 / 舟游像素 / 站酷快乐体 /
  思源黑·宋），拉丁字形走 Google Fonts。实测存档页与项目当前页**加载的字体族完全一致**
  （Playfair Display / Cousine / Source Code Pro / Oswald / Source Sans Pro / Vampiro One / icomoon）。
- `css/styles.css` 里另有 12 条历史遗留的失效引用（`.woff` / `.eot` 兜底格式与
  `images/gfx/filmstrip.html`）—— 项目自己的 `css/styles.css` 里同样是失效的，
  现代浏览器只会取 `.woff2`，**不是本存档引入的问题**。
- 线上（Cloudflare Workers）整个仓库都会部署，所以这个文件夹在线上也能直接访问。
  它**不参与站点导航**，没有页面链接到它；日后整理站点可整体删除或加 `.assetsignore` 排除。
