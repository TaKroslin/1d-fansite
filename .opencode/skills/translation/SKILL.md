---
name: translation
description: 1d fansite 中英双语注入工作流——歌词页（translate_lyrics.py）、专辑页歌名（translate_albums.py）、页面文本双语结构、翻译按钮、歌词数据源。
---

# 翻译工作流（translation）

> 这是主流程文档。字典格式 → `reference.md`；真实结构 → `examples/`；可复制模板 → `templates/`。

## 工作原理

`js/translate.js` 注入 header 按钮，localStorage 持久化。用户点按钮 → `html.lang-zh` class → CSS `.en{display:none}` 切换。普通页面是 EN↔ZH；歌词页是 EN↔双语对照。

## 三路翻译，选择其一

### A. 歌词页（不要手工改 67 个歌页）

1. 编辑 `tools/lyric_translations.py` 的 `LYRICS` 字典（格式见 `reference.md` §1）。
2. 跑 `python tools/translate_lyrics.py`。
3. 脚本自动：加 `data-translate="true"`、生成 `.lyric-line` 双语结构、加 `translate.js` 引用。幂等（重复跑 no-op）。

### B. 专辑页歌名

1. 编辑 `tools/translate_albums.py` 顶部 `TRANSLATIONS` 字典：`{"English Song Title": "中文标题"}`。
2. 跑 `python tools/translate_albums.py`（幂等，检测 `data-translate` 即 no-op）。

### C. 普通页面文本（tour/gallery/band 等）

手工加 `.en`/`.zh` 双 span，参考 `examples/bilingual-text.html`。确保页面引用 `translate.js`（前缀按深度，见 new-page skill）。

## 操作步骤（通用）

1. **定位**：歌词页 → A；专辑页 → B；普通页 → C。
2. **查字典格式**：`reference.md` §1（歌词）/ §2（专辑）。
3. **写/填翻译**：歌词 en 必须与 HTML 原文严格 1:1 顺序对应；空 zh 填 `""` 自动变 `[待译: ...]`。
4. **跑脚本** / **手工改**。
5. **验证**：grep `data-translate` 抽查注入；`python tools/_audit_site_images.py` 确认图片无断。

## 歌词数据源（获取英文歌词）

优先级：官网 > Genius > AZLyrics > `api.lyrics.ovh/v1/One Direction/<title>`（URL 编码空格，试歌名变体）。
已死：`cdn.smehost.net`、Instagram CDN。

## 铁律

1. 歌词字典 `en_line` 必须与 HTML 原文严格 1:1（顺序对应）——错行 = 双语错位。
2. 单曲页（Single 类型）有 release-buy/release-video；非单曲页（Song 类型，如 MIA 14 首）无，且带 prev/next 相邻曲目（RULES §2.5）。
3. 翻译长文本用后台 agent 并行（BYOK），别占主会话上下文（RULES §5.7）。

## 参考资料索引

| 文件 | 内容 |
|------|------|
| `reference.md` | LYRICS 字典格式、TRANSLATIONS 字典格式、lyric-line 结构说明 |
| `examples/lyric-line.html` | 真实歌词页 `.lyric-line` 双语结构 |
| `examples/bilingual-text.html` | 普通页面 `.en`/`.zh` 双 span 示例 |
| `templates/lyrics-dict.py` | LYRICS 字典模板 |
| `templates/album-titles-dict.py` | TRANSLATIONS 字典模板 |
