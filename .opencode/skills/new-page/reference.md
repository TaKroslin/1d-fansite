# 新建页面参考（new-page / reference）

## 1. 相对路径深度表（M6 防坑）

各页面深度对应的资源前缀：

| 页面位置 | 深度 | 前缀 |
|----------|------|------|
| 根级 `index.html` | 0 | （无前缀） |
| `pages/*.html` | 1 | `../` |
| `pages/music/albums/<a>.html`（3 层） | 3 | `../../../` |
| `pages/gallery/<cat>/index.html`（3 层） | 3 | `../../../` |
| `pages/blog/YYYY-MM-DD/<slug>/index.html` | 4 | `../../../../` |
| `pages/music/albums/<a>/songs/<s>.html`（5 层） | 5 | `../../../../../` |
| `pages/music/albums/<a>/photos/<s>.html`（5 层） | 5 | `../../../../../` |

### 各资源按深度取前缀

| 资源 | 公式 |
|------|------|
| CSS | `{前缀}css/styles.css?v=YYYYMMDD` |
| JS main | `{前缀}js/main.js` |
| JS translate | `{前缀}js/translate.js` |
| jQuery | Google CDN（不随深度变） |
| 图片 | `{前缀}images/gfx/...` 或 `{前缀}images/media/...` |
| Logo link | `{前缀}index.html` |
| Footer About | pages/ 一级：`about.html`；更深：`{前缀}pages/about.html` |

## 2. Body class 约定

| 页面 | Body class |
|------|-----------|
| 首页 | `duo home-section` |
| music | `duo music-section` |
| 专辑页 | `duo album-campaign` |
| journal | `duo journal-section` |
| band | `duo band-section` |
| tour | `duo tour-section` |
| blog | `duo blog-section` |
| gallery | `duo gallery-section` |
| about | `duo about-section` |
| shop | `duo shop-section`（禁止改动） |

## 3. Head meta 规范

每个新页面 head 必须包含（参考 `examples/about-page.html`）：

- `<html class="no-js" lang="en">` + no-js→js 切换 script
- viewport meta：`width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=0`
- charset utf-8
- og:title / og:site_name / og:type / og:image / og:url / og:description
- description / keywords / author meta
- twitter:card / twitter:site / twitter:creator
- Google Fonts link（**永远带 `&display=swap`**）
- CSS link 带 `?v=` 版本参数

og:url 用 `https://5guys1direction.cn/...`，注意相对路径按页面深度换算成完整 URL。

## 4. 常见坑速查

| 编号 | 坑 |
|------|----|
| M6 | 深度差一层 → 资源 404；改前数层级 |
| M7 | blog.html 卡片链接多加 `pages/` → 404 |
| M8 | QA 图片路径用 Path.resolve 误报 → 必须 HTTP urljoin |
| M9 | album 页(3层) vs songs 页(5层) 批量替换容易差层 |
