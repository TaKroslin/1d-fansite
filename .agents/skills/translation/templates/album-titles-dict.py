"""Bilingual song/video titles for the 5 album pages.

Format: {"English Song Title (as on page)": "中文标题"}

- key 必须与 pages/music/albums/<album>.html 页面原文完全一致
  （大小写敏感，不带 "1. " 等序号前缀）。
- 维护后运行 python tools/translate/translate_albums.py（幂等）。
"""
TRANSLATIONS: dict[str, str] = {
    # ---- Up All Night (2011) ----
    "What Makes You Beautiful": "你如此美丽",
    "Gotta Be You": "只能是你",
    "I Want": "我想要",
    # ---- Four (2014) ----
    "Steal My Girl": "偷走我的心",
    # ...其他专辑与歌曲
}
