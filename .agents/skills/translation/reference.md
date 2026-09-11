# 翻译参考（translation / reference）

## 1. LYRICS 字典格式（tools/translate/lyric_translations.py）

```python
LYRICS: Dict[str, Dict[str, List[Tuple[str, str]]]] = {
    "<album_slug>": {
        "<song_slug>": [
            ("英文歌词行1", "中文翻译1"),
            ("英文歌词行2", "中文翻译2"),
            # 段落间空行用 ("", "") 或 ("",)
            ("", ""),
            ("英文歌词行3", "中文翻译3"),
        ],
    },
}
```

### 关键规则

- **`en_line` 必须与 HTML 原文严格 1:1 顺序对应**（按 `<br />` 分句）。错位 = 双语错位。
- `zh_line` 可为空字符串 `""` → 脚本自动填 `[待译: <english>]` 占位。
- 空行（段落分隔）用空字符串行保留。
- 脚本 `split_lyrics_html` 用 `<br />` 分句（容忍 `<br>`/`<br/>`），会丢首尾空行——字典行数与分句后行数必须一致。

### 歌词页 HTML 结构（注入后）

```html
<div class="panel song-lyrics" data-translate="true">
  <div class="panel-header">…</div>
  <div class="text">
    <span class="lyric-line"><span class="en">英文行</span><span class="zh">中文行</span></span>
    <span class="lyric-line">&nbsp;</span>          <!-- 空行 -->
  </div>
</div>
```

## 2. TRANSLATIONS 字典格式（tools/translate/translate_albums.py）

```python
TRANSLATIONS: dict[str, str] = {
    # "英文歌名（与页面原文一致）": "中文标题",
    "What Makes You Beautiful": "你如此美丽",
}
```

- key 必须与页面原文**完全一致**（大小写敏感，不带 "1. " 前缀）。
- 脚本按 `.song-list` 里 `<span>1. Steal My Girl</span>` 结构注入 `.en`/`.zh`。

## 3. 普通页面双语结构

```html
<span class="en">English text</span><span class="zh">中文文本</span>
```

- 可拆多个 `.en`/`.zh` 对一一对应。
- panel-header 的 `.title`、`.section-name`、h2、`.more`、footer 里同样适用。
- 纯样式/脚本内容（class、icon、JS 逻辑）不翻译。

## 4. translate.js 行为

- 注入 header 按钮到 `#sticky` 左上角（`left:0`），localStorage 持久化。
- header 变白时按钮自动变黑。
- 普通页：`html.lang-zh` → CSS `.en{display:none}`。
- 歌词页（`data-translate="true"`）：EN↔双语对照（`.zh` 显示在 `.en` 后）。

## 5. 数据源

| 源 | 状态 | 用法 |
|----|------|------|
| 官网 | ✅ | 优先 |
| Genius | ✅ | 第二 |
| AZLyrics | ✅ | 第三 |
| `api.lyrics.ovh/v1/One Direction/<title>` | ✅ | 免费无 key；URL 编码空格 |
| `cdn.smehost.net` / Instagram CDN | ❌ | 已死 |
| Wayback Machine | ⚠️ | 慢，最后手段 |

## 6. 常见坑

| 编号 | 坑 |
|------|----|
| M14 | 同一 JS 引用两次 = 事件双绑（translate.js 同理检查） |
| — | en/zh 行数不一致 → 双语错位；跑完脚本 grep 抽查 |
