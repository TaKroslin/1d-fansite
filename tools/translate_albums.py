"""Inject bilingual song/video titles into the 5 album pages.

For each `pages/music/albums/<album>.html`:
  - Add `data-translate="true"` to the .song-list panel (or .panel.release-video
    group for made-in-the-am which has no song-list).
  - Wrap each song name `<span>1. Steal My Girl</span>` in a pair of
    `<span class="en">`/`<span class="zh">` siblings.
  - Add `<script src="../../../js/translate.js"></script>` before </body>.

Idempotent: re-running on an already-translated file is a no-op (detected by
checking for `data-translate` on .song-list).
"""
from __future__ import annotations
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
ALBUM_DIR = REPO / "pages" / "music" / "albums"

# English song title (as in the page) -> Chinese title
# Keys must match the file's exact text (case-sensitive, no leading "1. ").
TRANSLATIONS: dict[str, str] = {
    # ---- Up All Night (2011) ----
    "What Makes You Beautiful": "你如此美丽",
    "Gotta Be You": "只能是你",
    "I Want": "我想要",
    "I Wish": "我希望",
    "Stole My Heart": "偷走我的心",
    "Stand Up": "站起来",
    "Moments": "瞬间",
    "One Thing": "唯一",
    "Everything About You": "关于你的一切",
    "Save You Tonight": "今夜守护你",
    "She Is Not Afraid": "她不害怕",
    "Tell Me A Lie": "告诉我一个谎言",
    "Taken": "被占有",
    "I Should Have Kissed You": "我本该吻你",
    "Same Mistakes": "同样的错",
    "Up All Night": "不眠夜",
    "More Than This": "不止如此",
    "Nobody Compares": "无人能及",
    "Still The One": "依然是你",
    "Heart Attack": "心动",
    "Rock Me": "摇滚我",
    "What A Feeling": "这感觉",
    "I Should Have Kissed You [Bonus Track]": "我本该吻你(加曲)",
    "Moments [Bonus Track]": "瞬间(加曲)",
    "Gotta Be You [Bonus Track]": "只能是你(加曲)",
    # ---- Take Me Home (2012) ----
    "Live While We're Young": "趁我们还年轻",
    "Little Things": "小事",
    "Kiss You": "吻你",
    "C'mon, C'mon": "来吧来吧",
    "Last First Kiss": "初吻之末",
    "Heart Attack": "心动",
    "Rock Me": "摇滚我",
    "Change My Mind": "改变心意",
    "I Would": "我会",
    "Over Again": "再来一次",
    "Back For You": "回到你身边",
    "They Don't Know About Us": "他们不懂我们",
    "Summer Love": "夏日恋情",
    "She's Not Afraid": "她不害怕",
    "Loved You First": "我先爱上你",
    "Nobody Compares": "无人能及",
    "Still The One": "依然是你",
    "Cmon Cmon": "来吧来吧",
    # ---- Midnight Memories (2013) ----
    "Best Song Ever": "最棒的歌",
    "Story Of My Life": "我的人生故事",
    "Diana": "戴安娜",
    "Midnight Memories": "午夜回忆",
    "You & I": "你和我",
    "Don't Forget Where You Belong": "别忘了你属于哪里",
    "Strong": "坚强",
    "Happily": "幸福",
    "Little Black Dress": "小黑裙",
    "Through The Dark": "穿越黑暗",
    "Something Great": "美好的事",
    "Little White Lies": "小谎言",
    "Better Than Words": "比言语更动听",
    "Alive": "活着",
    "Does He Know?": "他知道吗",
    "Half A Heart": "半颗心",
    "Why Don't We Go There": "我们为什么不去那里",
    "You And I": "你和我",
    # ---- Four (2014) ----
    "Steal My Girl": "夺走我的女孩",
    "Ready To Run": "准备出发",
    "Where Do Broken Hearts Go": "心碎该去向何方",
    "18": "十八岁",
    "Girl Almighty": "万能女孩",
    "Fool's Gold": "愚人金",
    "Night Changes": "夜尽天明",
    "No Control": "失控",
    "Fireproof": "防火",
    "Spaces": "空隙",
    "Stockholm Syndrome": "斯德哥尔摩综合症",
    "Clouds": "云",
    "Change Your Ticket [Bonus Track]": "改签(加曲)",
    "Illusion [Bonus Track]": "幻象(加曲)",
    "Once In A Lifetime [Bonus Track]": "一生一次(加曲)",
    "Act My Age [Bonus Track]": "装老成(加曲)",
    "Change Your Ticket": "改签",
    "Illusion": "幻象",
    "Once In A Lifetime": "一生一次",
    "Act My Age": "装老成",
    "Steal My Girl [Bonus Track]": "夺走我的女孩(加曲)",
    # ---- Made In The A.M. (2015) ----
    "Drag Me Down": "拉我下来",
    "Infinity": "无限",
    "History": "历史",
    "Perfect": "完美",
    "End Of The Day": "夜幕降临",
    "Love You Goodbye": "爱你,再见",
    "What A Feeling": "这感觉",
    "Long Way Down": "漫长的下坠",
    "Never Enough": "永远不够",
    "Olivia": "奥莉维亚",
    "A.M.": "A.M.",
    "I Want To Write You A Song": "想为你写一首歌",
    "Walking In The Wind": "风中前行",
    "Wolves": "狼",
    "If I Could Fly": "如果我能飞",
    "Temporary Fix": "暂时的安慰",
    "Home": "家",
    "Hey Angel": "嘿,天使",
    "Na Na Na": "啦啦啦",
    "Steel My Girl [Bonus Track]": "夺走我的女孩(加曲)",  # typo guard
}

# release-video titles for made-in-the-am
VIDEO_TITLES: dict[str, str] = {
    "History": "历史",
    "Perfect": "完美",
    "Drag Me Down": "拉我下来",
}

# ---------------------------------------------------------------------------

_SONG_LINK_RE = re.compile(
    r'(<li>\s*<a [^>]+>\s*<span>)([^<]+)(</span>\s*</a>\s*</li>)',
    re.DOTALL,
)


def _strip_prefix(name: str) -> str:
    """Remove leading 'N. ' or 'N. ' from a song entry."""
    m = re.match(r"^\s*\d+\.\s*(.+)$", name)
    if m:
        return m.group(1).strip()
    return name.strip()


def _wrap_song(en_inner: str, en_text: str) -> str:
    """Build the bilingual span for a single song entry.

    The text in the file is like "1. Steal My Girl". We keep the number prefix
    outside the toggle so it stays the same in both languages, and translate
    just the song name.
    """
    # Split "1. Steal My Girl" into number + name
    m = re.match(r"^(\s*\d+\.\s*)(.+)$", en_text, re.DOTALL)
    if not m:
        # No number prefix (e.g. some bonus tracks use a different format)
        zh = TRANSLATIONS.get(en_text.strip(), en_text.strip())
        return (
            f'{en_inner[:-1] if en_inner.endswith(">") else en_inner}'
            f'<span class="en">{en_text}</span>'
            f'<span class="zh">{zh}</span>'
            f'</span>'
        )
    num, name = m.group(1), m.group(2).strip()
    zh_name = TRANSLATIONS.get(name, name)
    # Re-emit as "1. <en>Name</en><zh>中文</zh>"
    return f'{en_inner}<span class="en">{num}{name}</span><span class="zh">{num}{zh_name}</span></span>'


def translate_song_list(html: str) -> str:
    """Replace each song entry's inner <span> with the bilingual structure."""
    def repl(m: re.Match) -> str:
        prefix, inner, suffix = m.group(1), m.group(2), m.group(3)
        return _wrap_song(prefix, inner)
    return _SONG_LINK_RE.sub(repl, html)


def translate_video_titles(html: str) -> str:
    """For made-in-the-am: wrap each release-video title in en/zh spans."""
    # Pattern: <div class="title">Song Name</div>
    def repl(m: re.Match) -> str:
        title = m.group(1).strip()
        zh = VIDEO_TITLES.get(title, title)
        return f'<div class="title"><span class="en">{title}</span><span class="zh">{zh}</span></div>'
    return re.sub(
        r'<div class="title">([^<]+)</div>',
        repl,
        html,
    )


def add_data_translate(html: str, panel_class: str) -> str:
    """Add data-translate="true" to the first panel matching `panel_class`."""
    # Match `<div class="panel <panel_class>"`
    pat = re.compile(rf'(<div class="panel )({re.escape(panel_class)})(")')
    return pat.sub(rf'\1\2\3 data-translate="true"', html, count=1)


def add_translate_script(html: str, prefix: str) -> str:
    """Add <script src="...translate.js"></script> right before the LAST
    real `</body>` tag. Idempotent: skip if already present as a real
    `<script>` tag (not inside an HTML comment).
    """
    # Strip any `</script>`-ish injection that landed inside an HTML comment
    # (use literal-string state machine so we don't accidentally eat the whole file)
    cleaned: list[str] = []
    i = 0
    while i < len(html):
        cs = html.find("<!--", i)
        if cs < 0:
            cleaned.append(html[i:])
            break
        cleaned.append(html[i:cs])
        ce = html.find("-->", cs + 4)
        if ce < 0:
            cleaned.append(html[cs:])
            break
        comment = html[cs:ce + 3]
        if "js/translate.js" in comment and "<script" in comment:
            # Drop the bad comment
            pass
        else:
            cleaned.append(comment)
        i = ce + 3
    html = "".join(cleaned)

    # Skip if a real script tag already references translate.js
    if '<script src="' in html and 'js/translate.js' in html:
        # Check it's not inside a comment
        idx = html.find('js/translate.js')
        # Look backwards from idx for the nearest <!-- and forward for -->
        last_open = html.rfind("<!--", 0, idx)
        last_close = html.rfind("-->", 0, idx)
        if last_open > last_close:
            # Inside a comment, drop it (above loop should have handled it)
            pass
        else:
            return html

    real_close = html.rfind("</body>")
    if real_close < 0:
        return html
    return (
        html[:real_close]
        + f'<script src="{prefix}js/translate.js"></script>\n\n'
        + html[real_close:]
    )


def process_album_page(path: Path, prefix: str) -> str:
    html = path.read_text(encoding="utf-8")
    original = html
    # Song list panel
    if 'class="panel song-list' in html and 'data-translate' not in html.split('class="panel song-list', 1)[1].split('>', 1)[0]:
        html = add_data_translate(html, "song-list double-up")
        html = translate_song_list(html)
    # release-video titles (made-in-the-am only has these)
    if "release-header-made-in-the-am" in html or "header-made-in-the-am" in html:
        html = translate_video_titles(html)
        # Mark every .panel.release-video for translation so the fade applies
        # to the bilingual video titles.
        html = re.sub(
            r'(<div class="panel release-video")(>)',
            r'\1 data-translate="true"\2',
            html,
        )
    html = add_translate_script(html, prefix)
    if html != original:
        path.write_text(html, encoding="utf-8")
        return "updated"
    return "skipped (already done)"


def main() -> None:
    targets = [
        ("four.html", "../../../"),
        ("midnight-memories.html", "../../../"),
        ("take-me-home.html", "../../../"),
        ("up-all-night.html", "../../../"),
        ("made-in-the-am.html", "../../../"),
    ]
    for name, prefix in targets:
        path = ALBUM_DIR / name
        result = process_album_page(path, prefix)
        print(f"  {name}: {result}")


if __name__ == "__main__":
    main()
