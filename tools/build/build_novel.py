#!/usr/bin/env python3
"""FIVE GUYS ONE DIRECTION — Serialised novel builder.

Reads chapter sources at pages/blog/the-only-direction-home/chapters/NN/chapter.md
and generates:
  - every chapter reading page  pages/blog/the-only-direction-home/chapters/NN/index.html
  - the hub page               pages/blog/the-only-direction-home/index.html

Chinese-native novel: each chapter's h1 + body go in verbatim; chapter titles
are duplicated into the .en/.zh spans (both show Chinese today, English
translation can be dropped in later if ever needed).
"""
import glob
import os
import re
import sys

import markdown

NOVEL = os.path.join("pages", "blog", "the-only-direction-home")
CHAPTERS = os.path.join(NOVEL, "chapters")
NOVEL_TITLE = "The Only Direction Home"
SITE = "FIVE GUYS ONE DIRECTION"
CANON = "https://www.5guys1direction.asia"
CSS_VERSION = "20260830p"
CLI_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATES = os.path.join(CLI_DIR, "..", "templates")

ROOT_HUB = "../../.."
ROOT_CHAPTER = "../../../../.."

CARD_TPL = """<div class="panel journal-news homepage-news novel-chapter-card">

		<div class="inline"></div>

		<div class="row">

		<h2><span class="scaler" style="font-size: 60%;"><a href="chapters/{num}/index.html"><span class="num">{num}</span>&nbsp;{short}</a></span></h2>

		<div class="info">
			<a href="chapters/{num}/index.html" class="more"><span class="en">Read</span><span class="zh">阅读</span></a>
		</div>

		</div>

	</div>
"""

CATALOG_TPL = ('				<li{active}><a href="../{num}/index.html">'
               '<span class="num">{num}</span> {short}</a></li>\n')

# Odd chapter count (111) leaves a single card in the last group; the filler
# card completes the pair. It is NOT clickable — just a closing line.
FILLER_TPL = """<div class="panel journal-news homepage-news novel-chapter-card novel-filler">

		<div class="inline"></div>

		<div class="row">

		<h2><span class="scaler" style="font-size: 60%;"><span class="en">Here They Are Home</span><span class="zh">他们到家了</span></span></h2>

		</div>

	</div>
"""


def load_chapters():
    """Return sorted [{num, title, short, body_html}]. Folders are NN (00..110)."""
    dirs = [os.path.basename(d) for d in glob.glob(os.path.join(CHAPTERS, "*"))
            if os.path.isdir(d) and os.path.basename(d).isdigit()]
    dirs.sort(key=lambda s: (len(s), s))
    items = []
    for num in dirs:
        with open(os.path.join(CHAPTERS, num, "chapter.md"), encoding="utf-8") as fh:
            text = fh.read()
        lines = text.split("\n")
        title = re.sub(r"^#\s*", "", lines[0]).strip()
        short = re.sub(r"^第[零一二三四五六七八九十百千]+章\s*", "", title).strip()
        body_html = markdown.markdown("\n".join(lines[1:]).strip("\n"))
        items.append({"num": num, "title": title, "short": short, "body": body_html})
    return items


def render(template, **kw):
    for k, v in kw.items():
        template = template.replace("__%s__" % k, v)
    return template


def build_chapters(chapters):
    with open(os.path.join(TEMPLATES, "novel_chapter.html"), encoding="utf-8") as fh:
        tpl = fh.read()
    for idx, item in enumerate(chapters):
        num = item["num"]
        prev = chapters[idx - 1] if idx > 0 else None
        nxt = chapters[idx + 1] if idx < len(chapters) - 1 else None
        catalog = "".join(
            CATALOG_TPL.format(num=c["num"], short=c["short"],
                               active=" class=\"active\"" if j == idx else "")
            for j, c in enumerate(chapters)
        )
        html = render(
            tpl,
            TITLE=item["title"],
            NOVEL=NOVEL_TITLE,
            SITE=SITE,
            ROOT=ROOT_CHAPTER,
            CANON=CANON,
            VER=CSS_VERSION,
            NUM=num,
            NUM2="",
            SHORT=item["short"],
            SCALER="80%" if len(item["title"]) <= 8 else "60%",
            BODY=item["body"],
            CATALOG=catalog,
            PREV="../%s/index.html" % prev["num"] if prev else "#",
            NEXT="../%s/index.html" % nxt["num"] if nxt else "#",
            PREVDIS="disabled" if not prev else "",
            NEXTDIS="disabled" if not nxt else "",
            PREV_EN="Prev chapter" if prev else "No previous chapter",
            PREV_ZH="上一章" if prev else "没有上一章",
            NEXT_EN="Next chapter" if nxt else "No next chapter",
            NEXT_ZH="下一章" if nxt else "没有下一章",
            DESC="《%s》 · %s · 中文原创同人连载，全书完载。" % (NOVEL_TITLE, item["title"]),
        )
        with open(os.path.join(CHAPTERS, num, "index.html"), "w", encoding="utf-8") as fh:
            fh.write(html)
    return len(chapters)


def build_hub(chapters):
    with open(os.path.join(TEMPLATES, "novel_hub.html"), encoding="utf-8") as fh:
        tpl = fh.read()
    groups = []
    for i in range(0, len(chapters), 2):
        chunk = chapters[i:i + 2]
        inner = "".join(CARD_TPL.format(num=c["num"], short=c["short"]) for c in chunk)
        if len(chunk) == 1:
            inner += FILLER_TPL
        groups.append('<div class="panel-group">\n' + inner + '</div>\n')
    html = render(
        tpl,
        NOVEL=NOVEL_TITLE,
        SITE=SITE,
        ROOT=ROOT_HUB,
        CANON=CANON,
        VER=CSS_VERSION,
        DESC="一部 One Direction 宇宙背景的中文原创同人小说，共 110 章（另有前言一篇），约 85 万字，由站长 Takion Kroslin 创作，全书完载。",
        CARDS="".join(groups),
    )
    with open(os.path.join(NOVEL, "index.html"), "w", encoding="utf-8") as fh:
        fh.write(html)
    return len(chapters)


def main():
    root = os.path.abspath(os.path.join(CLI_DIR, "..", ".."))
    sys.path.insert(0, root)
    os.chdir(root)
    chapters = load_chapters()
    n1 = build_chapters(chapters)
    n2 = build_hub(chapters)
    print("Built %d chapter page(s) + hub | v=%s" % (n1, CSS_VERSION))


if __name__ == "__main__":
    main()