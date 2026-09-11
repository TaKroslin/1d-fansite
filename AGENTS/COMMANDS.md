# 1D Fansite — 常用命令速查（COMMANDS）

> 给模型的命令速查。全部命令在项目根目录 `E:\文档\GitHub\1d-fansite` 下执行（PowerShell）。

## 本地开发服务器

```powershell
python -m http.server 8000
# 访问 http://localhost:8000/
# QA 脚本用 127.0.0.1:8000
# ⚠️ 任务结束后不要 pkill http.server —— 保持常驻，方便用户随时打开检查
```

## Blog 构建

```powershell
# 编辑 pages/blog/YYYY-MM-DD/<slug>/article.md 后运行
python tools/build/build_blog.py
# 生成：文章页 index.html + pages/blog.html 列表 + pages/blog/posts.json
# ⚠️ 首页 blog 卡片手写，需手动同步 index.html
```

## 全站图片审计（QA 核心）

```powershell
# 需要本地 server 先跑起来
python tools/audit/_audit_site_images.py
# 目标输出：Total local image refs checked: N，Broken: 0
```

## 歌词翻译注入

```powershell
# 编辑 tools/translate/lyric_translations.py 后运行（从字典重新注入全部歌词页）
python tools/translate/translate_lyrics.py

# 专辑页歌名双语注入
python tools/translate/translate_albums.py
```

## Skill 校验

```powershell
# 校验 .agents/skills/*/SKILL.md 的 frontmatter（opencode + DSH 都能注册）
python3 tools/audit/check_skills.py
# 目标输出：全部通过：6/6。exit 0
# 抓的是 METHODS.md M52：description 未加引号且含 ": " → Skill 被静默丢弃
```

## 常用检查（PowerShell）

```powershell
# 找残留引用（页面级不应有 onedirectionmusiccom-ukprod 真实引用）
rg "onedirectionmusiccom-ukprod" pages/ --glob "*.html"
# 注：meta og:image 的 cdn.smehost.net 外链可留，不渲染

# 找重复 script 引用（事件双绑隐患）
rg "slideshow-nav.js" pages/music/albums/ --glob "*.html"

# 找双扩展名残留
rg "\.jpg\.jpg" pages/

# 找 sml 残留（页面层应为 0，R6/R7 后）
rg "gallery-images/rect-sml" pages/

# git 状态（部署前必查：未跟踪文件 = 线上 404 隐患）
git status
git status --porcelain | Select-String "^\?\?"
```

## 部署前检查清单

```powershell
# 1. 全部新图片已跟踪
git status --porcelain | Select-String "^\?\?"

# 2. .gitignore 包含 onedirectionmusiccom-ukprod/
Get-Content .gitignore

# 3. 确认改动范围符合预期
git diff --stat
```

## Playwright 浏览器验证（Node + 本机 Chrome）

```powershell
# 环境：本机已装 Chrome，Playwright 用 Node（Python API 未装）
# 运行脚本（require('playwright') + channel:'chrome'）：
$env:NODE_PATH = (npm root -g); node tools/_qa_xxx.js
# macOS/zsh 写法：
# NODE_PATH=$(npm root -g) node tools/_qa_xxx.js

# 脚本要点：
#   const browser = await chromium.launch({ channel: 'chrome' });  # 用已装 Chrome，免下载
#   结束 await browser.close()
# 可用 boundingBox()/getComputedStyle 验证居中、hover opacity/color/z-index，
#   模型直接读数值，比看截图更精确
```

## 批量修改脚本模板要点（Python）

```python
# -*- coding: utf-8 -*-
# 1. 读写都显式 encoding='utf-8'（读外部 JSON 用 utf-8-sig）
# 2. 脚本幂等：重复跑结果一致，输出统计（改了 N 个文件）
# 3. 相对路径深度用常量，不手工拼
# 4. 正则替换先打印匹配组确认，再 sub
# 5. Playwright 脚本（若用 Python）结尾 os._exit(0)
```

## 已死/可用数据源

| 数据源 | 状态 | 用法 |
|--------|------|------|
| `cdn.smehost.net` | ❌ 死 | 不可用 |
| `scontent-lhr8-1.cdninstagram.com` | ❌ 死 | 不可用 |
| 官网 `www.onedirectionmusic.com/assets/gfx/<name>-lrg.jpg` | ✅ 活 | 高清原图（⚠️ 不要用 assets/images/） |
| 官网 `.../media/gallery-images/{rect-sml,rect-med,rect-lrg}/<hash>.jpg` | ✅ 活 | gallery 照片 |
| iTunes Search API | ✅ 活 | 单曲/专辑封面（过滤 - Single） |
| `img.youtube.com/vi/<vid>/hqdefault.jpg` | ✅ 活（GFW 可直连） | 视频缩略图 → 本地化到 images/yt-thumbs/ |
| lyrics.ovh `api.lyrics.ovh/v1/One Direction/<title>` | ✅ 活 | 歌词（URL 编码空格，试歌名变体） |
| Wayback Machine | ⚠️ 慢 | 最后手段 |
