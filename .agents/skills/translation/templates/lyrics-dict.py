"""Bilingual lyrics translations for One Direction songs.

Format: {album_slug: {song_slug: [(en_line, zh_line), ...]}}

- en_line 必须与 pages/music/albums/<album>/songs/<song>.html 里
  .panel.song-lyrics .text 中的歌词（按 <br /> 分句）严格 1:1 顺序对应。
- zh_line 为空字符串 "" 时，脚本自动填 [待译: <english>] 占位。
- 段落间空行保留为 ("", "") 行。

维护方式：
1. 新增/修改翻译条目。
2. 运行 python tools/translate/translate_lyrics.py（幂等，重复跑 no-op）。
"""
from __future__ import annotations
from typing import Dict, List, Tuple

LYRICS: Dict[str, Dict[str, List[Tuple[str, str]]]] = {
    "up-all-night": {
        "what-makes-you-beautiful": [
            ("You're insecure, don't know what for", "你总缺乏安全感 不知为何"),
            ("You're turning heads when you walk through the door", "你一进门就让人目不转睛"),
            ("Don't need make-up to cover up", "你无需化妆遮盖"),
            ("Being the way that you are is enough", "你本来的样子就足够美"),
        ],
        # 其他歌曲...
    },
    # 其他专辑...
}
