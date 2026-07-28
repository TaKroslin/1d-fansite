"""Audit and fix footer credits links across the site.

Walks every .html file in the repo, finds the first <li> inside
<nav id="credits"> that contains an <a> pointing to about.html, and checks
whether the relative path actually resolves to pages/about.html.  Reports
broken files, then (with --fix) rewrites them with the correct path.

Usage:
    python tools/audit_footer.py           # dry run, just report
    python tools/audit_footer.py --fix     # apply fixes
"""
from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
TARGET = "pages/about.html"  # what every credits link SHOULD resolve to

# The original template.  Two variants show up in the repo:
#   Variant A (3-li layout used in most pages):
#       <li><a target="_blank" href="REL">About</a></li>
#       <li>&copy; <span id="footerDate"></span> <a target="_blank" href="REL">Takion Kroslin &amp; 5 GUYS 1 DIRECTION</a></li>
#       <li><a href="mailto:...">Contact</a></li>
#   Variant B (2-li layout used on home + a few pages):
#       <li>&copy; <span id="footerDate"></span> <a target="_blank" href="REL">Takion Kroslin &amp; 5 GUYS 1 DIRECTION</a></li>
#       <li><a href="mailto:...">Contact</a></li>
# In both cases, every "REL" must point to pages/about.html.

# Match any href="X" inside <nav id="credits">…</nav>  (greedy until closing nav)
CREDITS_RE = re.compile(
    r'(<nav id="credits">.*?</nav>)',
    re.DOTALL,
)
HREF_RE = re.compile(r'href="([^"]+)"')


def resolve(rel_from_file: Path, href: str) -> Path:
    """Return the absolute path that the given href would land on."""
    if href.startswith(("http://", "https://", "mailto:", "tel:", "#")):
        return None  # external / anchor
    base = (rel_from_file.parent / href).resolve()
    return base


def is_correct_about_link(html_file: Path, href: str) -> bool:
    """True iff the given href from html_file resolves to pages/about.html."""
    resolved = resolve(html_file, href)
    if resolved is None:
        return False
    return resolved == (REPO_ROOT / TARGET).resolve()


def find_broken(html_file: Path) -> list[tuple[str, int, str]]:
    """Return list of (href, line_no, reason) for every credits href that
    is supposed to point at pages/about.html but doesn't."""
    text = html_file.read_text(encoding="utf-8", errors="replace")
    m = CREDITS_RE.search(text)
    if not m:
        return []
    nav_block = m.group(1)
    out: list[tuple[str, int, str]] = []
    for href_m in HREF_RE.finditer(nav_block):
        href = href_m.group(1)
        if href.startswith("mailto:"):
            continue
        if "about.html" not in href:
            continue
        line_no = text[: m.start() + href_m.start()].count("\n") + 1
        if not is_correct_about_link(html_file, href):
            out.append((href, line_no, "resolves to " + str(resolve(html_file, href))))
    return out


def correct_href_for(html_file: Path) -> str:
    """Return the relative path from html_file to pages/about.html."""
    rel = (REPO_ROOT / "pages" / "about.html").relative_to(html_file.parent, walk_up=True)
    return rel.as_posix()


def patch_file(html_file: Path) -> int:
    """Replace every 'about.html' href inside the credits nav with the correct
    relative path.  Returns the number of substitutions made."""
    text = html_file.read_text(encoding="utf-8", errors="replace")
    correct = correct_href_for(html_file)

    def replace_in_nav(m: re.Match[str]) -> str:
        block = m.group(1)
        new_block = re.sub(
            r'href="[^"]*about\.html"',
            f'href="{correct}"',
            block,
        )
        return new_block

    new_text, count = CREDITS_RE.subn(replace_in_nav, text)
    if count and new_text != text:
        html_file.write_text(new_text, encoding="utf-8")
    return count


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--fix", action="store_true", help="apply fixes in place")
    args = parser.parse_args()

    broken_total = 0
    fixed_total = 0
    for html_file in REPO_ROOT.rglob("*.html"):
        # Skip generated .git folders and anything that isn't a real file
        # (some folders in the repo end in .html — they confuse rglob)
        if ".git" in html_file.parts:
            continue
        if not html_file.is_file():
            continue
        broken = find_broken(html_file)
        if not broken:
            continue
        broken_total += len(broken)
        rel = html_file.relative_to(REPO_ROOT)
        for href, line, reason in broken:
            print(f"  BROKEN  {rel}:{line}  href={href!r}  ({reason})")
        if args.fix:
            fixed = patch_file(html_file)
            fixed_total += fixed
            print(f"  FIXED   {rel}  ({fixed} replacement(s))")

    print()
    print(f"Broken hrefs: {broken_total}")
    if args.fix:
        print(f"Fixed files:  {fixed_total}")
        return 0
    if broken_total:
        print("Re-run with --fix to apply.")
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
