"""Build every blog article from its article.md source.

Each article lives at:
    pages/blog/<YYYY-MM-DD>/<slug>/article.md

The first thing in article.md is an HTML comment block (front matter) that
defines:  title, date, author, header_img, header_img_size, header_img_position,
description, keywords, og_image, slug, canonical_url, scaler.

Everything after the front matter is Markdown body content.  This script:

  1. Parses the front-matter (a literal <!-- key: value --> block) with the
     Python `markdown` library.
  2. Wraps the rendered HTML in tools/templates/article.html.
  3. Writes pages/blog/<date>/<slug>/index.html.
  4. Aggregates every post's metadata into pages/blog/posts.json so the
     listing page (pages/blog.html) can render cards without JS.
  5. Re-emits pages/blog.html from tools/templates/blog_list.html with the
     fresh posts list.

Idempotent — re-running produces the same bytes for the same source.

Usage:
    python tools/build_blog.py            # build all
    python tools/build_blog.py <slug>     # build one
    python tools/build_blog.py --watch     # rebuild on save (no watchdog needed;
                                            uses a simple polling loop)
"""
from __future__ import annotations

import argparse
import datetime as _dt
import html
import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import markdown as _markdown

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
BLOG_DIR = REPO_ROOT / "pages" / "blog"
LISTING_PATH = BLOG_DIR.parent / "blog.html"
POSTS_JSON = BLOG_DIR / "posts.json"
TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"

# ---------------------------------------------------------------------------
# front-matter parsing
# ---------------------------------------------------------------------------

FRONT_MATTER_RE = re.compile(
    r"^\s*<!--\s*(.*?)\s*-->\s*",
    re.DOTALL,
)


@dataclass
class Post:
    """In-memory representation of one blog article."""

    date: str  # e.g. "2026-07-27"
    slug: str
    source_path: Path  # absolute path to article.md
    title: str = ""
    title_zh: str = ""  # 中文标题（意译）；为空则 h2 只显示英文
    date_display: str = ""  # pretty form, e.g. "27th July 2026"
    author: str = ""
    header_img: str = ""  # relative path used in HTML
    header_img_size: str = "50% contain"
    header_img_position: str = "center"
    description: str = ""
    keywords: str = ""
    og_image: str = ""
    body_md: str = ""  # raw markdown (after front matter)
    body_zh: str = ""  # raw Chinese markdown (loaded from sibling article.zh.md)
    extra: dict[str, str] = field(default_factory=dict)

    @property
    def out_dir(self) -> Path:
        return BLOG_DIR / self.date / self.slug

    @property
    def out_path(self) -> Path:
        return self.out_dir / "index.html"

    @property
    def rel_url(self) -> str:
        return f"pages/blog/{self.date}/{self.slug}/index.html"


def _parse_front_matter(text: str) -> tuple[dict[str, str], str]:
    m = FRONT_MATTER_RE.match(text)
    if not m:
        return {}, text
    block = m.group(1)
    body = text[m.end():]
    out: dict[str, str] = {}
    for line in block.splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if ":" not in line:
            continue
        key, _, value = line.partition(":")
        out[key.strip().lower()] = value.strip()
    return out, body


def _pretty_date(iso: str) -> str:
    """'2026-07-27' -> '27th July 2026'."""
    try:
        d = _dt.date.fromisoformat(iso)
    except ValueError:
        return iso
    day = d.day
    if 11 <= day <= 13:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")
    return f"{day}{suffix} {d.strftime('%B %Y')}'"


def _load_post(md_path: Path) -> Post:
    text = md_path.read_text(encoding="utf-8")
    fm, body = _parse_front_matter(text)
    date = fm.get("date", md_path.parent.parent.name)
    slug = fm.get("slug", md_path.parent.name)
    post = Post(
        date=date,
        slug=slug,
        source_path=md_path,
        title=fm.get("title", slug.replace("-", " ").title()),
        title_zh=fm.get("title_zh", ""),
        date_display=fm.get("date_display") or _pretty_date(date),
        author=fm.get("author", "Takion Kroslin"),
        header_img=fm.get("header_img", "../../../../images/gfx/5guys/logo-black.png"),
        header_img_size=fm.get("header_img_size", "50% contain"),
        header_img_position=fm.get("header_img_position", "center"),
        description=fm.get("description", ""),
        keywords=fm.get("keywords", ""),
        og_image=fm.get("og_image", fm.get("header_img", "")),
        body_md=body,
    )
    # Optional Chinese sibling: <slug>/article.zh.md (no front matter — just body)
    zh_path = md_path.parent / "article.zh.md"
    if zh_path.exists():
        try:
            post.body_zh = zh_path.read_text(encoding="utf-8").strip("\n")
        except OSError:
            post.body_zh = ""
    # Stash any unknown keys so authors can add custom metadata later.
    for k, v in fm.items():
        if k not in {
            "date", "slug", "title", "title_zh", "date_display", "author",
            "header_img", "header_img_size", "header_img_position",
            "description", "keywords", "og_image",
        }:
            post.extra[k] = v
    return post


# ---------------------------------------------------------------------------
# markdown -> HTML
# ---------------------------------------------------------------------------

_MD = _markdown.Markdown(
    extensions=[
        "extra",        # tables, fenced code, footnotes, abbr, attr_list
        "smarty",       # smart quotes / dashes
        "sane_lists",
    ],
    output_format="html5",
)


def _render_markdown(body_md: str) -> str:
    """Render markdown and post-process the output for the article layout."""
    _MD.reset()
    html_body = _MD.convert(body_md)
    # Indent every line so the template's <div class="text"> block is readable.
    indented = "\n".join("			" + line if line else "" for line in html_body.splitlines())
    return "\n" + indented + "\n\t\t"


def _wrap_bilingual(en_html: str, zh_md: str) -> str:
    """Render Chinese markdown and pair the two HTML trees for the toggle UI.

    We pair top-level block elements (p, h1-h6, ul, ol, blockquote, hr, table)
    so each pair can be wrapped in inline <span class="en"> / <span class="zh">
    siblings. This way the CSS rule `html.lang-zh .en{display:none}` cleanly
    swaps each paragraph without breaking the layout of the surrounding <p>.

    Falls back to a side-by-side div render if block counts don't match (e.g.
    the user translated only part of the post — the rest stays English).
    """
    if not zh_md or not zh_md.strip():
        return en_html
    zh_html = _render_markdown(zh_md)
    en_blocks = _split_top_level(en_html)
    zh_blocks = _split_top_level(zh_html)
    if not en_blocks or len(en_blocks) != len(zh_blocks):
        return (
            '\n\n			<div class="en">'
            + en_html.strip("\n")
            + '\n			</div>\n\n			<div class="zh">'
            + zh_html.strip("\n")
            + '\n			</div>\n\n\t\t'
        )
    paired: list[str] = []
    for en_block, zh_block in zip(en_blocks, zh_blocks):
        paired.append(_pair_block(en_block, zh_block))
    body = "\n\n			".join(paired)
    return "\n\n			" + body + "\n\n\t\t"


def _pair_block(en_block: str, zh_block: str) -> str:
    """Pair one English block with one Chinese block.

    For a block like `<p class="foo">Hello</p>`, we produce
    `<p class="foo"><span class="en">Hello</span><span class="zh">你好</span></p>`.

    For self-closing blocks like `<hr />` we just keep the English one and let
    the Chinese side render nothing (the swap still works because the .hr
    doesn't need translation).
    """
    en = en_block.strip()
    zh = zh_block.strip()
    # Find the first opening tag's `>` and the last `</` for the closing tag
    open_end = en.find(">")
    if open_end < 0:
        return en  # not a block element
    last_close = en.rfind("</")
    if last_close < 0:
        # Self-closing or void element
        return en
    # Closing tag name
    close_tag = en[last_close + 2:-1] if en.endswith(">") else ""
    # Skip the closing tag of nested elements (we want the outermost)
    # The last </ close in a block is the matching outer close
    inner_en = en[open_end + 1:last_close]
    # For zh, find the corresponding inner content
    zh_open_end = zh.find(">")
    zh_last_close = zh.rfind("</")
    if zh_open_end < 0 or zh_last_close < 0:
        return en
    inner_zh = zh[zh_open_end + 1:zh_last_close]
    # Build the paired block: keep the English opening tag, replace inner with
    # paired spans, and use the original closing tag
    opening = en[:open_end + 1]
    closing = en[last_close:]
    return (
        f'{opening}<span class="en">{inner_en}</span><span class="zh">{inner_zh}</span>{closing}'
    )


_BLOCK_OPEN_RE = re.compile(
    r"<(p|h[1-6]|ul|ol|blockquote|hr|table)\b[^>]*?(/?)>",
    re.IGNORECASE,
)


def _split_top_level(html: str) -> list[str]:
    """Split an HTML fragment by top-level block-element tags.

    A "top-level" block is one not nested inside another block. We do a simple
    depth-count walk: at depth 0, each block-opening tag starts a new chunk;
    we find the matching closing tag for that block and emit the chunk.

    Self-closing tags (hr) and void elements end their chunk immediately.
    """
    out: list[str] = []
    pos = 0
    for m in _BLOCK_OPEN_RE.finditer(html):
        if m.start() < pos:
            continue  # nested; skip
        # Find the matching close for this tag
        tag_name = m.group(1).lower()
        is_self_close = m.group(2) == "/" or tag_name == "hr"
        if is_self_close:
            out.append(html[pos:m.end()].strip())
            pos = m.end()
            continue
        # Find the matching </tagname> by scanning forward, accounting for nesting
        depth = 1
        cursor = m.end()
        open_re = re.compile(rf"<{tag_name}\b[^>]*?(/?)>", re.IGNORECASE)
        close_re = re.compile(rf"</{tag_name}\s*>", re.IGNORECASE)
        while depth > 0:
            nxt_open = open_re.search(html, cursor)
            nxt_close = close_re.search(html, cursor)
            if not nxt_close:
                break  # malformed
            if nxt_open and nxt_open.start() < nxt_close.start():
                if nxt_open.group(1) != "/":
                    depth += 1
                cursor = nxt_open.end()
            else:
                depth -= 1
                cursor = nxt_close.end()
        out.append(html[pos:cursor].strip())
        pos = cursor
    # Trailing text
    tail = html[pos:].strip()
    if tail:
        out.append(tail)
    return [c for c in out if c]


# ---------------------------------------------------------------------------
# HTML rendering
# ---------------------------------------------------------------------------

def _relative(depth: int) -> str:
    """Return the relative prefix needed to climb `depth` directories."""
    return "../" * depth


def _build_article_html(post: Post) -> str:
    template = (TEMPLATES_DIR / "article.html").read_text(encoding="utf-8")

    depth = len(Path(post.rel_url).parts) - 1  # number of ".."" needed
    root_prefix = _relative(depth)
    about_href = f"{root_prefix}pages/about.html"
    css_href = f"{root_prefix}css/styles.css?v=20260922a"
    jquery_href = f"{root_prefix}js/jquery.min.js"
    main_js_href = f"{root_prefix}js/main.js"

    body_html = _render_markdown(post.body_md)
    body_html = _wrap_bilingual(body_html, post.body_zh)

    # Cover image: use a real <img> tag (not background) so the image's
    # natural aspect ratio drives the cover's height — it always spans
    # the full page width with the height following from the image.
    cover_src = post.header_img or ""

    # Allow the author to omit a leading newline if body_md is empty
    if not post.body_md.strip():
        body_html = ""

    # 标题：有 title_zh 时输出 en/zh 对，否则只输出英文（兼容旧文章）
    if post.title_zh:
        title_html = (
            f'<span class="en">{html.escape(post.title)}</span>'
            f'<span class="zh">{html.escape(post.title_zh)}</span>'
        )
    else:
        title_html = html.escape(post.title)

    replacements = {
        "title": html.escape(post.title),
        "title_html": title_html,
        "description": html.escape(post.description or post.title, quote=False),
        "keywords": html.escape(post.keywords or "FIVE GUYS ONE DIRECTION, blog", quote=False),
        "author_html": html.escape(post.author, quote=False) + " &amp; FIVE GUYS ONE DIRECTION",
        "og_image": html.escape(post.og_image or post.header_img, quote=False),
        "canonical_url": html.escape(
            f"https://www.5guys1direction.asia/{post.rel_url}"
        ),
        "date_display": html.escape(post.date_display),
        "cover_src": html.escape(cover_src, quote=True),
        "body_html": body_html,
        "root": root_prefix,
        "about_href": about_href,
        "css_href": css_href,
        "js_href": jquery_href,
        "main_js_href": main_js_href,
    }
    rendered = template
    for k, v in replacements.items():
        rendered = rendered.replace("{{" + k + "}}", v)
    return rendered


# ---------------------------------------------------------------------------
# listing page
# ---------------------------------------------------------------------------

def _serialize_post(post: Post) -> dict[str, Any]:
    return {
        "title": post.title,
        "title_zh": post.title_zh,
        "slug": post.slug,
        "date": post.date,
        "date_display": post.date_display,
        "author": post.author,
        "description": post.description,
        "url": post.rel_url,
        "header_img": post.header_img,
        "scaler": post.extra.get("scaler", "100%"),
    }


def _write_posts_json(posts: list[Post]) -> None:
    payload = {
        "generated_at": _dt.datetime.utcnow().isoformat() + "Z",
        "posts": [_serialize_post(p) for p in sorted(
            posts, key=lambda p: p.date, reverse=True
        )],
    }
    POSTS_JSON.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )


def _build_listing_html(posts: list[Post]) -> str:
    """Render pages/blog.html from the templates.

    The template embeds a `__POSTS_CARDS__` marker.  We replace that marker
    with a chunk of HTML containing all post cards, grouped two per row (so
    the layout matches the previous hand-written page).  Cards are pre-built
    in the HTML so the listing works on networks where the JS bundle is
    slow to load — Cloudflare only needs to serve a single static HTML file.
    """
    template = (TEMPLATES_DIR / "blog_list.html").read_text(encoding="utf-8")
    posts_sorted = sorted(posts, key=lambda p: p.date, reverse=True)
    cards_html = _render_listing_cards(posts_sorted)
    return template.replace("__POSTS_CARDS__", cards_html)


def _render_listing_cards(posts: list[Post]) -> str:
    """Render <div class="panel-group"> blocks, two cards per row, plus
    an embedded <script> tag that re-derives scaler font sizes client-side
    so titles always fit the available width."""
    chunks: list[str] = []
    # Group posts in pairs
    for i in range(0, len(posts), 2):
        row = posts[i:i + 2]
        chunks.append('<div class="panel-group">')
        for post in row:
            scaler = post.extra.get("scaler", _auto_scaler(post.title))
            chunks.append(_render_listing_card(post, scaler))
        # When the article count is odd, the last row has a single card; add
        # a decorative filler so the panel-group isn't left with an empty half.
        if len(row) == 1:
            chunks.append(_render_blog_filler())
        chunks.append('</div>')
    if not chunks:
        chunks.append("<!-- no posts yet -->")
    return "\n\n\n" + "\n".join(chunks) + "\n\n\n"


def _render_blog_filler() -> str:
    """Decorative placeholder card for the odd-card (left-over) half of the
    last panel-group on the blog listing.  It links nowhere; `is-placeholder`
    dims it to 45% and `novel-filler` centers its text.  The build only emits
    it when the article count is odd (see _render_listing_cards), so when the
    count is even the slot simply doesn't exist."""
    return '''<div class="panel journal-news homepage-news novel-filler" style="background:url(../images/gfx/5guys/logo-black.png) center/42% no-repeat #fff;">

		<div class="inline"></div>

		<h2 style="color:#000;"><span class="scaler" style="font-size: 80%;"><span class="en">Five Guys, One Direction — more stories on the way.</span><span class="zh">五个男孩，一个 One Direction——更多故事在路上。</span></span></h2>

	</div>'''


def _auto_scaler(title: str) -> str:
    """Pick a default font-size percentage based on title length so it fits
    the same 60-px-when-half-as-wide headline area.  Matches the heuristic
    the original page used: 100% for ≤ 12 chars, 70% for ≤ 22 chars, etc."""
    n = len(title)
    if n <= 12:
        return "100%"
    if n <= 22:
        return "70%"
    if n <= 32:
        return "60%"
    if n <= 42:
        return "55%"
    return "50%"


def _render_listing_card(post: Post, scaler: str) -> str:
    # blog.html lives at /pages/, posts at /pages/blog/...; strip the
    # leading "pages/" so hrefs are correct relative to blog.html.
    url = post.rel_url
    if url.startswith("pages/"):
        url = url[len("pages/"):]
    # Card background image: the blog.html file sits in /pages/, so an asset
    # at /images/foo.jpg is reached via ../images/foo.jpg.  The header_img
    # stored in the .md front-matter is already a depth-correct relative
    # path for an article (../../../../images/...).  We rebuild the path
    # from the listing page's depth (one "..").
    img = post.extra.get("cover_img") or post.header_img
    if "images/" in img:
        img = "../images/" + img.split("images/", 1)[1]
    # The card background is a #000 black panel.  If the article's
    # header_img is a black-on-transparent logo (e.g. logo-black.png),
    # the logo is invisible.  Force the white logo variant for cards.
    if "logo-black" in img:
        img = img.replace("logo-black", "logo-white")
    # Match the home page's card markup exactly (index.html line ~243).
    # Use `center / contain` (not `40%`) so the wide logo is scaled to
    # fit the square card without being cropped: the logo is 3000x548
    # (aspect ratio ~5.5:1) and a 1:1 card would otherwise show a thin
    # strip at 40% width.
    if post.title_zh:
        title_span = (
            f'<span class="en">{html.escape(post.title)}</span>'
            f'<span class="zh">{html.escape(post.title_zh)}</span>'
        )
    else:
        title_span = html.escape(post.title)
    return f'''<div class="panel journal-news homepage-news homepage-blog-card" style="background:url({html.escape(img)}) center/contain no-repeat #000;">

		<div class="inline"></div>

		<div class="panel-header">
			<div class="title" style="color:#fff;">{html.escape(post.date_display)}</div>
			<div class="section-name" style="color:#fff;border-color:#fff;"><a style="color:#fff;border-color:#fff;" href="{html.escape(url)}"><span class="en">Blog</span><span class="zh">博客</span></a></div>
		</div>

		<h2 style="color:#fff;"><span class="scaler" style="font-size: {html.escape(scaler)};"><a style="color:#fff;border-color:transparent;" href="{html.escape(url)}">{title_span}</a></span></h2>

		<div class="info">
			<a style="color:#fff;border-color:#fff;" href="{html.escape(url)}" class="more"><span class="en">Read more</span><span class="zh">阅读更多</span></a>
		</div>

	</div>'''


# ---------------------------------------------------------------------------
# driver
# ---------------------------------------------------------------------------

def _iter_article_paths() -> list[Path]:
    return sorted(BLOG_DIR.glob("*/**/article.md"))


def build_one(md_path: Path) -> Post:
    post = _load_post(md_path)
    out_html = _build_article_html(post)
    post.out_dir.mkdir(parents=True, exist_ok=True)
    post.out_path.write_text(out_html, encoding="utf-8")
    return post


def build_all() -> int:
    paths = _iter_article_paths()
    if not paths:
        print("No article.md files found under pages/blog/.")
        return 1
    posts = [build_one(p) for p in paths]
    _write_posts_json(posts)
    listing_html = _build_listing_html(posts)
    LISTING_PATH.write_text(listing_html, encoding="utf-8")
    print(f"Built {len(posts)} article(s) + {POSTS_JSON.name} + {LISTING_PATH.name}.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("slug", nargs="?", help="only rebuild the post with this slug")
    args = parser.parse_args()
    if args.slug:
        matches = [p for p in _iter_article_paths() if p.parent.name == args.slug]
        if not matches:
            print(f"No article.md with slug={args.slug!r} found.", file=sys.stderr)
            return 1
        for m in matches:
            build_one(m)
        # Refresh posts.json + listing too, since the listing embeds the data
        return build_all()
    return build_all()


if __name__ == "__main__":
    sys.exit(main())
