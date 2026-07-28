"""Patch the CSS to add mobile fixes for home/blog cards and blog article pages.

Idempotent: re-running is a no-op once the marker has been inserted.
"""
from pathlib import Path
import sys

CSS = Path(r"E:\文档\GitHub\1d-fansite\css\styles.css")
MARKER = "/* BUG FIX: same specificity as the original rule, so source order wins */"

INSERTION = r"""/* === BUG FIX: mobile home/blog cards =====================================
   The original mobile breakpoint (in the minified CSS) re-shows .panel-header
   on .panel.journal-news .panel-header, which overrides the desktop rule
   .home-section .panel .panel-header{display:none}.  As a result, the
   "27th July 2026 / Blog" date strip re-appears in every blog card on the
   home page and on blog.html, pushing the title down and crowding the
   "Read more" button.  On top of that, the title's massive 15% top/bottom
   margin pushes it well below the centered cover image, so it looks like
   the title is "drifting below" the cover.

   Fix:
     1. On .home-section and .blog-section, keep the panel-header hidden on
        mobile too (matches desktop).
     2. Anchor the h2 to the top of the panel and the .info to the bottom;
        the panel keeps its 1:1 aspect (panel height = padding-top 100% as
        set on .panel in the original mobile rule) so the cover image still
        sits in the middle, the title in the upper third, the button in the
        lower third.
     3. Reserve enough breathing room between the title and the button.

   Note: the original mobile rule uses `!important` on padding-top/height, so
   we must use `!important` too in order to win the cascade. */
@media only screen and (max-width:767px){
  .home-section .panel .panel-header,
  .blog-section .panel.journal-news .panel-header{display:none!important}
  .panel.journal-news.homepage-news{position:relative;overflow:hidden;height:0!important;padding:100% 0 0 0!important;background-position:center;background-size:40% no-repeat}
  .panel.journal-news.homepage-news h2,
  .panel.journal-news.homepage-news .inline{position:absolute;left:10%;width:80%;margin:0;text-align:center}
  .panel.journal-news.homepage-news h2{top:18%;font-size:281%;line-height:120%;letter-spacing:.025em;height:auto}
  .panel.journal-news.homepage-news h2 span{display:block;margin:0 auto}
  .panel.journal-news.homepage-news .info{bottom:12%;left:17.5%;width:65%;position:absolute}
}

/* === BUG FIX: mobile blog article page ====================================
   The default .article-cover on mobile uses 33% padding-top which makes the
   cover band look thin, then a 3em margin-bottom + .article-holder margin
   creates a visible gap before the title — so the title appears "below"
   the cover, very far from it.  Also the .panel-header is absolutely
   positioned over the cover, partially hiding the cover image.

   Fix:
     1. Hide the panel-header on mobile (the cover image already serves
        as the visual header — the date strip belongs to the listing card
        style, not the article style).
     2. Make the cover image a full-width band (50% aspect, contains
        background image so it never crops).
     3. Pull the title up close to the cover so it doesn't drift down. */
@media only screen and (max-width:767px){
  .panel.journal-article .panel-header{display:none!important}
  .article-cover{padding:50% 0 0 0;background-size:50% contain;margin-bottom:.6em;border-bottom-width:0}
  .panel.journal-article .article-holder{margin:0 5%;padding-bottom:3em}
  .panel.journal-article .article-holder h2{margin:.4em 0 1em;font-size:281%;text-align:center;letter-spacing:0}
}

"""


def main() -> int:
    text = CSS.read_text(encoding="utf-8")
    if "BUG FIX: mobile home/blog cards" in text:
        # Update the insertion in place if the version is older
        if "padding:100% 0 0 0!important" in text:
            print("Already patched (v2).")
            return 0
        # Strip the older version and re-insert
        start = text.index("/* === BUG FIX: mobile home/blog cards")
        end_marker = "/* === BUG FIX: mobile blog article page ================="
        end = text.index(end_marker, start)
        end_close = text.index("*/", end) + 2
        text = text[:start] + text[end_close:]
        print("Removed older patch.")
    if MARKER not in text:
        print("ERROR: marker not found, refusing to patch.", file=sys.stderr)
        return 1
    new_text = text.replace(MARKER, INSERTION + MARKER, 1)
    CSS.write_text(new_text, encoding="utf-8")
    print(f"Patched. New file size: {len(new_text)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
