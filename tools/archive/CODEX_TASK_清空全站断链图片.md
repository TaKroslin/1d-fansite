# Codex 任务书：清空 1D Fansite 全站断链图片（目标：0 broken）

> 本任务书由 Mavis 整理，所有信息均基于 2026-08-01 的实际磁盘检查与审计输出。请先通读全文再动手。

---

## 0. 任务目标

整个网站不能有任何加载不出来的图片（HTTP 断链 = 0）。涉及本地图片引用，目标是把 `python tools/_audit_site_images.py` 的 Broken 数量清零（排除已删除的 shop 页面）。

---

## 1. 项目背景

- 项目根目录：`E:\文档\GitHub\1d-fansite`（纯静态站，HTML/CSS/JS，无框架无构建）
- 站点是官方 onedirectionmusic.com 的 1:1 克隆 + FIVE GUYS ONE DIRECTION 品牌改造
- 本地预览：`python -m http.server 8000`，从项目根启动
- 部署：Cloudflare Pages（GitHub 自动部署），所以**所有图片必须本地化，不能依赖已死的 CDN**
- 项目文档：根目录 `AGENTS.md`（路径约定、组件规范、修改日志都在里面，先读）

### 已死的 CDN（不要尝试访问）
- `cdn.smehost.net` —— 全部下线，任何 `/media/article-images/` 路径均 404
- `scontent*.cdninstagram.com`（2015 年 Instagram 图片）—— 已过期

---

## 2. 环境准备（重要，先做这个）

本地 HTTP 服务器（端口 8000）**多次出现僵尸进程占用端口导致 RemoteDisconnected**，表现为：`task_query` 显示任务 running，但 `urllib.request.urlopen('http://localhost:8000/')` 报 `Remote end closed connection without response`。

**正确启动流程：**
```powershell
# 1. 查 8000 端口监听者
Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue | Select-Object OwningProcess
# 2. 杀掉所有监听进程（每次都是卡死的 python）
Get-Process python -ErrorAction SilentlyContinue | Stop-Process -Force
# 3. 确认端口空闲
Get-NetTCPConnection -LocalPort 8000 -ErrorAction SilentlyContinue
# 4. 后台启动
cd E:\文档\GitHub\1d-fansite
python -m http.server 8000 --bind 127.0.0.1
# 5. 验证
python -c "import urllib.request; print(urllib.request.urlopen('http://127.0.0.1:8000/', timeout=8).status)"
```

⚠️ 如果 `localhost` 连不上，**改用 `127.0.0.1`** 测试（本机 http.server 有时只绑定 v6 或连接被代理干扰）。

---

## 3. 审计工具

```powershell
cd E:\文档\GitHub\1d-fansite
python tools/_audit_site_images.py
```

- 需要本地服务器在 8000 端口活着才能跑（它用真实 HTTP `urljoin` + 请求验证，**不要用 `Path.resolve()` 判断**——HTTP URL 的 `..` 超过 host 根会被浏览器截断，文件系统 resolve 会越界误报 MISSING）
- 输出格式：`Total local image refs checked: N` / `Broken: M` / 每行一条 `http://... <- 引用页面`
- 脚本已升级：现在同时抓 `src="..."`、`background-image: url(...)`、`background: url(...)` 三种形式（原版漏了 `background:` 不带 `-image` 的，gallery 子页面全漏报）

**先跑一次审计拿到当前真实 Broken 清单**（此前 Mavis 的审计可能混入了服务器故障误报，一切以你自己重跑的结果为准），再按下面分类逐项修。

---

## 4. 断链分类与修复方案（按优先级）

### A. 专辑页 gallery-cover × 4（简单，先修）

4 个专辑页引用不存在的 gallery 图，**替换为对应专辑封面**：

| 页面 | 当前引用（缺失） | 替换为 |
|------|----------------|--------|
| `pages/music/albums/up-all-night.html` | `../../../images/media/gallery-images/rect-sml/b2e6c5e8b1cc551d97c5f92150f0e9fd.jpg` | `../../../images/gfx/music-up-all-night-colour-square-sml.jpg` |
| `pages/music/albums/take-me-home.html` | `.../rect-sml/01308bcb5ee5a8d1373e96ef2c8930e0.jpg` | `../../../images/gfx/music-take-me-home-colour-square-sml.jpg` |
| `pages/music/albums/midnight-memories.html` | `.../rect-sml/346ca7ebfaa544f98b6f48e23105ee25.jpg` | `../../../images/gfx/music-midnight-memories-colour-square-sml.jpg` |
| `pages/music/albums/four.html` | `.../rect-sml/c38cb98709656a3d91be0cf3d4267664.jpg` | `../../../images/gfx/music-four-colour-square-sml.jpg` |

（made-in-the-am.html 的 gallery-cover `dfce33...` 已在本地存在，不用动）

### B. photos 子页 + photos.html 列表页（~10 个文件，约 60 处引用）

**问题**：photos 系列页引用 `images/media/gallery-images/rect-sml/<hash>.jpg`，但（1）相对路径深度错误（2）本地根本没有这些文件（gallery-images 目录下只有一个 `dfce33...`）。

**方案：所有 photos 图片引用替换为对应专辑封面。**

涉及文件：
- `pages/music/albums/{up-all-night,take-me-home,midnight-memories,four,made-in-the-am}/photos.html`（列表页，每个含多张缩略图）
- `pages/music/albums/up-all-night/photos/one-thing.html`
- `pages/music/albums/take-me-home/photos/kiss-you.html`
- `pages/music/albums/midnight-memories/photos/you-and-i.html`
- `pages/music/albums/four/photos/night-changes.html`
- `pages/music/albums/made-in-the-am/photos/drag-me-down.html`

**路径深度规则（核心，容易错）：**
- `pages/music/albums/<album>/photos.html` → 到根是 **4 层**：`../../../../images/gfx/music-<album>-colour-square-sml.jpg`
- `pages/music/albums/<album>/photos/<song>.html` → 到根是 **5 层**：`../../../../../images/gfx/music-<album>-colour-square-sml.jpg`

照片墙里重复的缩略图可以用同一张专辑封面（用户接受"凑凑"），但建议同一页面内至少第一张用专辑封面、其余保持同图即可。

### C. videos.html × 5（专辑视频列表页）

**问题**：引用 `../../images/media/article-images/square-sml/<hash>-col.jpg`，路径深度错（少一层）+ `-col.jpg` 文件不在站点目录。

**关键事实**：15 个 `-col.jpg`（单曲封面彩版）**真实存在于** `onedirectionmusiccom-ukprod/media/article-images/square-sml/`（共 30 个文件：`<hash>.jpg` + `<hash>-col.jpg`），但站点目录 `images/media/article-images/square-sml/` 里没有 `-col` 变体。

**修复**：
1. 把 `onedirectionmusiccom-ukprod/media/article-images/square-sml/*-col.jpg`（15 个）复制到 `images/media/article-images/square-sml/`
2. 修正 5 个 `videos.html` 的路径深度：`../../` → `../../../`（videos.html 在 `pages/music/albums/<album>/`，到根 3 层）

涉及文件：`pages/music/albums/{up-all-night,take-me-home,midnight-memories,four,made-in-the-am}/videos.html`

### D. fans.html × 4（YouTube 缩略图）

**问题**：引用克隆路径 `vi/<id>/0.jpg`（相对路径解析到站点根，全部 404）。

**修复**：
1. 下载 `https://img.youtube.com/vi/<id>/hqdefault.jpg` 到 `images/yt-thumbs/<id>.jpg`（GFW 下可直连；404 时试 `0.jpg` / `mqdefault.jpg`）
2. 页面里 `vi/<id>/0.jpg` 替换为 `../../../images/yt-thumbs/<id>.jpg`（fans.html 在 `pages/music/albums/<album>/`，3 层）

涉及文件与 vid 清单：
- `pages/music/albums/up-all-night/fans.html`：`3AGMNcaOjDg` `GuuaRRFO0AA` `Ke3n3xvKa7Q` `MJm6hg-IFAA` `lNRoTq1Sgt4` `ntRj31g_tRw` `qlrLsN7dKVc` `xzorV7BGsgw`
- `pages/music/albums/take-me-home/fans.html`：`1Vzq6nmlm_Q` `7le2iwqFVl0` `NX1NWAGPaqA` `OR_BHBXTaAc` `fX5O6VhZ7C8` `nPLMvVLt65o`
- `pages/music/albums/midnight-memories/fans.html`：`CWKrDLioncY` `ROlMJgF37qc` `VsmDFBFSXNo` `aSkUsrLQDrc` `qpOZ3h5r0D8` `tcBnfmhvaaQ` `xI8z4BWmJiY`
- `pages/music/albums/four/fans.html`：`KFL1E_MtD2Q` `hP7Yv7ur1NY`
- （made-in-the-am/fans.html 无此引用）

另有一批 yt-thumbs 断链 `images/yt-thumbs/{AbPED9bisSc,Ho32Oh6b4jc,Jwgf3wmiA04,QJO3ROT-A4E,T4cdfRohhcg,UpsKGvPjAgw,W-TE_Ys4iwM,Y1xs_xPb46M,_kqQDCxRCzM,bkx9kCdaaMg,nvfejaHz-o0,o_v9MY_FMcw,syFZfO_wfMQ,xGPeNN9S0Fg,yjmp8CoZBIo}.jpg` 来自 singles.html / songs 页引用，同样下载补齐到 `images/yt-thumbs/`。

### E. gallery.html + gallery 子页面（路径深度 + 缺图）

**问题**：`pages/gallery/<cat>/index.html` 在 `pages/gallery/` 下一层（到根 2 层），但引用写的是 `../../images/...`（实际应该 `../../../images/...`）——**所有 gallery 子页面的图片路径都少了一层**。gallery.html（列表页）本身路径对，但有 2 张图文件缺失。

**修复 gallery.html（`pages/gallery.html`，路径 `../` 是对的）：**
- `Behind the Scenes` panel 引用 `../images/media/article-images/square-sml/dfce33b787ff3ec44499e16b242251be.jpg`（缺失）→ 文件真实存在于 `../images/media/gallery-images/square-sml/dfce33b787ff3ec44499e16b242251be.jpg`（以及 rect-sml 变体），改路径即可
- `Press & Awards` panel 引用 `../images/media/article-images/rect-sml/2aef032aae73e39c7f3547a28fc157e4.jpg`（rect-sml 下缺失）→ 文件真实存在于 `../images/media/article-images/square-sml/2aef032aae73e39c7f3547a28fc157e4.jpg`（138KB），改路径即可

**修复 gallery 子页面（`pages/gallery/{members,on-stage,behind-the-scenes,press,fan-art}/index.html`）：**
- 所有 `../../images/` 前缀改为 `../../../images/`（子页面在 `pages/gallery/<cat>/`，到根 3 层）
- 缺图处理（改完路径后仍缺的）：
  - `square-sml/dfce33...jpg` → 用 `../../../images/media/gallery-images/square-sml/dfce33...jpg`
  - `rect-sml/2aef032a...jpg` → 用 `../../../images/media/article-images/square-sml/2aef032a...jpg`
  - `rect-sml/6d0f8a76...jpg`、`square-sml/435c4d4a...jpg`、`square-sml/7db2f106...jpg` 本地都存在（在 `images/media/article-images/rect-sml/` 和 `square-sml/`），改路径后即可
  - `images/gfx/filmstrip-{harry,louis,liam,niall}-smlc4ca.jpg` 本地都存在，改路径后即可
  - `fan-art/index.html` 引用的 `../../images/gfx/diamond.png` → 磁盘上 `images/gfx/diamond.png` 不存在！查一下是否误拼（可能是 `images/gfx/` 下别的文件），没有就换一张已有 gfx 图

### F. tour/_official_archive.html（1 处）

引用 `../../onedirectionmusiccom-ukprod/media/article-images/rect-sml/7e1b6356e3649778b07b7971df194ada.jpg`：
- 路径写法错误（不该指向 `onedirectionmusiccom-ukprod/` 前缀）
- 文件真实存在于 `../../images/media/article-images/rect-sml/7e1b6356e3649778b07b7971df194ada.jpg`
- 直接改路径（tour/_official_archive.html 在 `pages/tour/`，到根 2 层，`../../` 深度正确）

### G. singles.html × 5

引用 `onedirectionmusiccom-ukprod/media/article-images/square-sml/<hash>.jpg`（15 个）：这 15 个 hash 文件**真实存在于** `onedirectionmusiccom-ukprod/media/article-images/square-sml/`（30 个文件里），但页面引用带 `onedirectionmusiccom-ukprod/` 前缀且可能深度错。**修复：路径改指向 `images/media/article-images/square-sml/<hash>.jpg`**（先把对应 `<hash>.jpg` 非 col 版本复制到 `images/media/article-images/square-sml/`，缺哪个复制哪个）。涉及：`pages/music/albums/{up-all-night,take-me-home,midnight-memories,four,made-in-the-am}/singles.html`

### H. 首页 index.html + journal.html + blog 文章（少量）

审计中 `index.html` 报的 `images/gfx/filmstrip-harry-smlc4ca.jpg`、`1D_Logotype_Black.jpg`、`5guys/logo-*.png`、`images/media/article-images/square-sml/154524b5...jpg`、`square-med/1da9a62c...jpg`、`article-logos/large/154524b5...png` 等**在磁盘上都真实存在**——大概率是 Mavis 审计时的服务器故障误报，**以你自己重跑的审计为准**；若重跑后仍报，检查引用深度。

`journal.html` 有 2 个本地断链 + 2 个 Instagram CDN 死链（外部 URL，审计会跳过但浏览器里会裂图）：Instagram 死链要么换图要么删除 `<img>` 引用。

blog 文章页（`pages/blog/2026-07-27/*/index.html`）各 1 处断链，重跑审计确认后修。

---

## 5. 硬性规则（不要违反）

1. **单曲页必须用单曲封面；专辑页必须用 iTunes 标准版专辑封面**（不要 Deluxe/Ultimate/Yearbook/Expanded/Souvenir 版本）。没有单曲封面 → 用标准版专辑封面兜底。
2. **专辑封面文件已就位**：`images/gfx/music-{up-all-night,take-me-home,midnight-memories,four,made-in-the-am}-colour-square-sml.jpg`（iTunes 600×600 标准版）——直接引用，不要重新下载。
3. **YouTube 视频背景必须对应真实视频**：用 `images/yt-thumbs/<vid>.jpg`（已下载 15 个 + 按 D 补齐）。
4. **不要动首页 `.panel.homepage-video`**（History 视频，Takion 确认是对的）。只换方形 `.panel.release-video` 和其他断链。
5. **相对路径深度**（最容易出错）：
   - `index.html`（根）：`images/...`
   - `pages/*.html`（一级）：`../images/...`
   - `pages/music/albums/<a>.html`（3 层）：`../../../images/...`
   - `pages/music/albums/<a>/videos|fans|photos|singles.html`（4 层）：`../../../../images/...`
   - `pages/music/albums/<a>/photos/<s>.html`（5 层）：`../../../../../images/...`
   - `pages/gallery/<cat>/index.html`（3 层）：`../../../images/...`
   - `pages/blog/2026-07-27/<slug>/index.html`（4 层）：`../../../../images/...`
6. **QA 验证用真实 HTTP `urljoin`，不要用 `Path.resolve()`**（`..` 越界会被浏览器截断，文件系统 resolve 会误报）。
7. **shop.html 不要管**（用户已删除该页面；若文件还在请忽略其断链，不要修）。

---

## 6. 收尾

1. 全部修完重跑 `python tools/_audit_site_images.py`，Broken 必须 = 0
2. 浏览器抽查（或 Playwright）：
   - `pages/gallery.html` + `pages/gallery/*/index.html` 五个分类页图片正常
   - 一个专辑页 + 一个 photos 子页 + 一个 videos + 一个 fans + 一个 singles 页图片正常
   - 首页 + journal 无裂图
3. 更新 `AGENTS.md` 末尾"修改日志"区段：日期 / 改动概要 / 涉及文件 / 验证结果
4. 一次性 QA 脚本（`tools/_probe_*.py`、`_scan_*.py`、`_dbg_*.py` 等）可清理，也可留作参考（不强制）

---

## 7. 已知教训（来自历史会话，避免重复踩坑）

- `logo-black.png` 是**黑字透明底**（不是反色），叠黑底上完全隐形；白底配 logo-black，黑底配 logo-white
- 超宽 logo（3000×548，5.5:1）在 1:1 卡片里用 `background-size:N%` 会被压成窄条，用 `contain`
- iTunes `entity=song` 返回的是**专辑 track 封面**不是单曲封面；找单曲封面要过滤 `collectionName` 含 `- Single` 且 `trackName` 含歌名
- 审计脚本 stdout 若用 PowerShell 重定向到文件会变 UTF-16（带 BOM），读的时候用 `encoding='utf-8-sig'`
- 服务器端口 8000 的僵尸进程会伪装成"running"但连接即断——**先杀干净再起，起完必测**
