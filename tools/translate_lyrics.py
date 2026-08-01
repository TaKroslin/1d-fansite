"""Inject bilingual lyrics structure into all 65 song pages.

For each `pages/music/albums/<album>/songs/<song>.html`:
  - Add `data-translate="true"` to the .panel.song-lyrics element.
  - Replace the lyrics .text content with a per-line bilingual structure.
  - Add the translate.js script tag before </body> (or its actual location).

Lyrics translations are looked up in `lyric_translations.LYRICS[<album>][<song>]`.
Lines with empty zh are filled with `待译: <english>` so the user can see what
still needs work.
"""
from __future__ import annotations
import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(Path(__file__).resolve().parent))
from lyric_translations import LYRICS

SONGS_ROOT = REPO / "pages" / "music" / "albums"

# How deep is the page from repo root?  All song pages are at
# pages/music/albums/<album>/songs/<song>.html — that's 5 levels deep.
SCRIPT_PREFIX = "../../../../../"


_SENTINEL = "\x00"


def split_lyrics_html(text_html: str) -> list[str]:
    """Split the .text contents by `<br />` into line strings.

    We replace every `<br>` / `<br/>` / `<br />` with a sentinel character and
    split on that — this avoids the false empty lines that `\\n`-based splitting
    creates from HTML indentation / newlines between `<br />` tags.

    Empty lines (intentional `<br />` tags with nothing else) are preserved as
    empty strings.  Leading and trailing empty strings (from indentation before
    the first `<br />` and after the last `<br />`) are dropped.
    """
    # Replace each <br /> with sentinel
    norm = re.sub(r"<br\s*/?>", _SENTINEL, text_html, flags=re.IGNORECASE)
    parts = [p.strip() for p in norm.split(_SENTINEL)]
    # Drop leading empty (HTML indentation before the first <br />)
    while parts and not parts[0]:
        parts.pop(0)
    # Drop trailing empty (after the last <br />)
    while parts and not parts[-1]:
        parts.pop()
    return parts


def _zh_text(entry) -> str:
    """Pull the Chinese string out of a (en, zh) tuple or a plain string."""
    if entry is None:
        return ""
    if isinstance(entry, tuple):
        return entry[1] if len(entry) > 1 else ""
    return str(entry)


def _is_passage(zh_data) -> bool:
    """Passage mode: zh_data is a single free-translation string for the whole song.

    Line-by-line literal mode: zh_data is a list of (en, zh) tuples.
    """
    return isinstance(zh_data, str)


def build_bilingual_lines(en_lines: list[str], zh_data) -> str:
    """Build a string of `<span class="lyric-line">` blocks.

    Two modes:

    * **Passage mode** (`zh_data` is a str): render every English line as
      `<span class="lyric-line"><span class="en">…</span></span>` (no per-line
      zh), then append a `<div class="lyric-passage"><span class="zh">…</span></div>`
      at the end holding the whole-song free translation.

    * **Literal mode** (`zh_data` is a list of (en, zh) tuples or plain strings):
      per-line `<span class="lyric-line"><span class="en">…</span><span class="zh">…</span></span>`.
      Lines that have no Chinese translation get a `[待译: <english>]` placeholder.
    """
    if _is_passage(zh_data):
        out: list[str] = []
        for en in en_lines:
            if not en.strip():
                out.append('<span class="lyric-line">&nbsp;</span>')
            else:
                out.append(
                    f'<span class="lyric-line"><span class="en">{en}</span></span>'
                )
        out.append(
            f'<div class="lyric-passage"><span class="zh">{zh_data}</span></div>'
        )
        return "\n".join(out)

    # literal / line-by-line mode
    out = []
    if not zh_data:
        zh_data = []
    for i, en in enumerate(en_lines):
        zh = _zh_text(zh_data[i]) if i < len(zh_data) else ""
        if not en and not zh:
            # Pure blank line — keep as a blank line for spacing
            out.append('<span class="lyric-line">&nbsp;</span>')
            continue
        if not zh:
            zh = f"[待译: {en}]" if en else ""
        out.append(
            f'<span class="lyric-line"><span class="en">{en}</span><span class="zh">{zh}</span></span>'
        )
    return "\n".join(out)


def extract_en_from_injected(html: str) -> str | None:
    """If the .text div was already injected (contains lyric-line spans), extract
    the original English text by joining the inner .en spans in order.  This
    avoids re-injecting on top of nested lyric-line structures.

    Returns the original English (as it appears between <br /> markers in the
    source) or None if no lyric-line structure is present.
    """
    m = re.search(r'<div class="text">([\s\S]*?)</div>', html)
    if not m or 'class="lyric-line"' not in m.group(1):
        return None
    inner = m.group(1)
    # Find every <span class="en">...</span> in order, using the *innermost* one
    # (because of nesting).  Strategy: repeatedly strip lyric-line wrappers and
    # collect the .en contents.
    en_texts: list[str] = []
    # Walk through, peeling layers from outside in
    pos = 0
    # Find all <span class="lyric-line"> blocks via simple non-greedy scan
    pattern = re.compile(r'<span class="lyric-line">(.*?)</span>(?=\s*(?:<span class="lyric-line"|</div|$))', re.DOTALL)
    # Fallback: just find innermost .en spans via tag stripping
    # Simpler: repeatedly extract the deepest <span class="en">X</span> in the
    # document by tracking positions.
    # For our structure: <span class="lyric-line"><span class="en">X</span><span class="zh">Y</span></span>
    # After first inject: outer wrap = <span class="lyric-line">...inner...</span>
    # To unwrap: find the deepest <span class="en">X</span> at each position.
    # Use a simple iterative approach: split by <span class="lyric-line"> and look at
    # the .en content of each chunk.
    chunks = re.split(r'<span class="lyric-line">', inner)
    out_lines: list[str] = []
    for chunk in chunks:
        # Each chunk starts with either nothing or an inner lyric-line.  We
        # want the deepest .en span inside it.  Iteratively strip lyric-line
        # wrappers until we find .en.
        c = chunk
        # If the chunk contains nested <span class="lyric-line">, recursively
        # extract its .en contents.
        if '&nbsp;' in c.split('</span>')[0]:
            out_lines.append('')
            continue
        # Find first <span class="en">...</span>
        em = re.search(r'<span class="en">(.*?)</span>', c, re.DOTALL)
        if em:
            # Reconstruct: if it still contains nested lyric-line, we need to
            # recurse.  But the simple case: take the em.group(1) and check if
            # it still has <span class="lyric-line"> inside.
            inner_text = em.group(1)
            while '<span class="lyric-line">' in inner_text:
                # Find first nested lyric-line
                nm = re.search(r'<span class="lyric-line">(.*?)</span>\s*<span class="zh">.*?</span>\s*</span>', inner_text, re.DOTALL)
                if nm:
                    inner_text = nm.group(1)
                else:
                    break
            out_lines.append(inner_text.strip())
        else:
            # Blank or non-matching
            if '&nbsp;' in chunk or chunk.strip() == '':
                out_lines.append('')
    # Join with <br /> markers (each lyric-line is one original line)
    return '<br />'.join(out_lines)


def inject_lyrics(html: str, en_text: str, zh_lines: list[str] | None) -> str:
    """Replace the .text inner HTML of .panel.song-lyrics with bilingual lines."""
    en_lines = split_lyrics_html(en_text)
    bilingual = build_bilingual_lines(en_lines, zh_lines)
    # Replace the text div content (between the opening and closing tags)
    # The .text div is inside .panel.song-lyrics. We find the <div class="text"> open
    # and the matching </div><!--text--> or </div> close.
    new_html = re.sub(
        r'(<div class="text">)([\s\S]*?)(</div><!--text-->)',
        lambda m: m.group(1) + "\n\t\t" + bilingual + "\n\t" + m.group(3),
        html,
        count=1,
    )
    if new_html == html:
        # Try without the comment
        new_html = re.sub(
            r'(<div class="text">)([\s\S]*?)(</div>\s*</div><!--\.panel\.song-lyrics-->)',
            lambda m: m.group(1) + "\n\t\t" + bilingual + "\n\t" + m.group(3),
            html,
            count=1,
        )
    return new_html


def has_bilingual_injected(html: str) -> bool:
    """Return True if the .text div already has the bilingual lyric-line structure
    (i.e. the panel has been previously injected)."""
    m = re.search(r'<div class="text">([\s\S]*?)</div>', html)
    if not m:
        return False
    return 'class="lyric-line"' in m.group(1)


def mark_lyrics_panel(html: str) -> str:
    """Add data-translate="true" to .panel.song-lyrics if not present."""
    if 'data-translate' in html.split('class="panel song-lyrics"', 1)[1].split('>', 1)[0]:
        return html
    return re.sub(
        r'(<div class="panel song-lyrics")(>)',
        r'\1 data-translate="true"\2',
        html,
        count=1,
    )


def extract_lyrics_text(html: str) -> str | None:
    """Extract the contents of the .text div inside .panel.song-lyrics."""
    m = re.search(
        r'<div class="text">([\s\S]*?)</div><!--text-->',
        html,
    )
    if not m:
        m = re.search(
            r'<div class="text">([\s\S]*?)</div>\s*</div><!--\.panel\.song-lyrics-->',
            html,
        )
    return m.group(1) if m else None


def ensure_translate_script(html: str) -> str:
    """Make sure <script src="...translate.js"> is present as a real script tag."""
    # Check for an actual <script> tag with translate.js (not inside a comment)
    if '<script src="' in html and 'js/translate.js' in html:
        # Verify it's not inside a comment by checking context
        idx = html.find('js/translate.js')
        last_open = html.rfind("<!--", 0, idx)
        last_close = html.rfind("-->", 0, idx)
        if last_open < last_close:
            return html  # already injected correctly
    # Drop any inside-comment injection first
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
            pass  # drop
        else:
            cleaned.append(comment)
        i = ce + 3
    html = "".join(cleaned)
    # Insert before last </body>
    real_close = html.rfind("</body>")
    if real_close < 0:
        return html
    return (
        html[:real_close]
        + f'<script src="{SCRIPT_PREFIX}js/translate.js"></script>\n\n'
        + html[real_close:]
    )


def process_song(album: str, song: str) -> str:
    path = SONGS_ROOT / album / "songs" / f"{song}.html"
    if not path.exists():
        return f"missing: {path}"
    html = path.read_text(encoding="utf-8")
    en_text = extract_lyrics_text(html)
    if en_text is None:
        return "no .text div found"
    # If already injected, recover the original English from the nested structure
    if has_bilingual_injected(html):
        recovered = extract_en_from_injected(html)
        if recovered is not None:
            en_text = recovered
    zh_lines = LYRICS.get(album, {}).get(song)
    if zh_lines is None:
        zh_lines = []  # will fall back to [待译: <english>]
    new_html = inject_lyrics(html, en_text, zh_lines)
    new_html = mark_lyrics_panel(new_html)
    new_html = ensure_translate_script(new_html)
    if new_html != html:
        path.write_text(new_html, encoding="utf-8")
        return f"updated ({len(zh_lines)} zh lines)"
    return "skipped"


def main() -> None:
    # All song slugs
    targets = []
    for album_dir in SONGS_ROOT.iterdir():
        if not album_dir.is_dir():
            continue
        songs_dir = album_dir / "songs"
        if not songs_dir.is_dir():
            continue
        for song_html in sorted(songs_dir.glob("*.html")):
            targets.append((album_dir.name, song_html.stem))

    for album, song in targets:
        result = process_song(album, song)
        print(f"  {album}/{song}.html: {result}")


if __name__ == "__main__":
    main()
