# Blog 文章参考（blog-post / reference）

## 1. article.md front-matter 字段

front-matter 包在 HTML 注释 `<!-- -->` 里（避免 YAML 解析依赖）。

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✅ | 文章标题 |
| `title_zh` | 可选 | 中文标题（意译）；build 脚本自动读 |
| `date` | ✅ | YYYY-MM-DD（用于 URL） |
| `slug` | ✅ | URL slug（小写连字符） |
| `date_display` | ✅ | 漂亮日期 "27th July 2026" |
| `author` | ✅ | 署名 |
| `header_img` | ✅ | 封面图（相对 `pages/blog/.../index.html`，深度 4 层 `../../../../`） |
| `header_img_size` | 可选 | CSS background-size，默认 `50% contain` |
| `header_img_position` | 可选 | CSS background-position，默认 `center` |
| `description` | ✅ | og:description / meta description |
| `keywords` | ✅ | meta keywords |
| `og_image` | ✅ | og:image（社交分享卡片） |
| `scaler` | ✅ | 列表卡片标题字号百分比（55-100%） |

## 2. 构建产物

`python tools/build_blog.py` 生成：

| 文件 | 说明 |
|------|------|
| `pages/blog/<date>/<slug>/index.html` | 文章页（🤖 不手改） |
| `pages/blog.html` | 列表页（🤖 不手改） |
| `pages/blog/posts.json` | 元数据聚合 |

> ⚠️ `index.html` 首页 blog 卡片是**手写死代码**，不会自动同步（新增/删除必须手改）。

## 3. build_blog.py 顶部两个字典

- `META`：手动维护的元数据（每个 slug 一条）。因为 og_image / date_display 等不是 MD 能完全表达的，所以构建脚本不用 front-matter 的读取结果作为唯一来源——两个都要对齐。
- `SCALERS`：每个标题的字号百分比（对应列表卡片 h2 的 `scaler` style）。

新增/编辑文章时必须保持 `article.md` front-matter、`META`、`SCALERS` 三者一致。

## 4. 双语机制

- `article.zh.md`：无 front-matter，纯正文，与英文按 **top-level 块**（`<p>` 等）一一配对。
- build 脚本把每对包成 `<span class="en">` / `<span class="zh">` 兄弟节点，CSS `html.lang-zh .en{display:none}` 切换。
- **段落数必须一致**，否则配对错乱（build 脚本有校验，长度不等会报错）。

## 5. 常见坑

| 编号 | 坑 |
|------|----|
| M1 | logo-black 叠黑底隐形 → 黑底用 logo-white |
| M7 | blog.html 卡片链接多加 pages/ 前缀 → 404 |
| 无 | 首页卡片不自动同步 → 手改 index.html |
