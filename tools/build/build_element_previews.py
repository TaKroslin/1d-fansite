#!/usr/bin/env python3
"""Build one self-contained visual HTML preview per named site element."""
from __future__ import annotations

from pathlib import Path
from textwrap import dedent

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "AGENTS" / "element-previews"
DOC = ROOT / "AGENTS" / "ELEMENT-PREVIEWS.md"
CSS = "../../css/styles.css?v=20260922a"
FONTS = "https://fonts.googleapis.com/css?family=Playfair+Display:700|Codystar|Cousine:400,700|Source+Code+Pro:300,400,500,600,700|Source+Sans+Pro:400|Oswald:400,700|Vampiro+One|Six+Caps&display=swap"


def panel(classes: str, content: str, style: str = "") -> str:
    return f'<div class="panel {classes}" style="{style}">{content}</div>'


def shell(title: str, body: str) -> str:
    return dedent(f"""\
    <!doctype html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>{title}</title>
      <link rel="stylesheet" href="{CSS}">
      <link rel="stylesheet" href="{FONTS}">
      <style>
        html,body{{margin:0;min-height:100%;background:#d8d8d8;overflow:hidden}}
        body{{padding:14px}}
        .preview-stage{{max-width:760px;margin:0 auto}}
        .preview-stage>.panel{{width:100%;margin:0 auto}}
        .preview-stage .panel.journal-article{{height:auto;min-height:360px}}
        .preview-stage .panel.band-member{{height:440px}}
        .preview-stage .panel.tour-listing{{height:420px}}
        .preview-stage .panel.newsletter{{height:380px}}
        .preview-stage .panel.journal-article.song-lyrics{{min-height:420px}}
        .preview-stage #sticky,.preview-stage #nav{{position:relative!important;top:auto!important;left:auto!important}}
        .preview-stage #nav{{display:block!important}}
        .preview-stage footer{{position:relative!important}}
        .font-card{{padding:30px;background:#fff;color:#000;min-height:150px}}
        .font-card .en{{display:block;font-size:38px;line-height:1.1}}
        .font-card .zh{{display:block;font-size:30px;line-height:1.3;margin-top:12px}}
        .button-stage{{height:150px;background:#000;display:flex;align-items:center;justify-content:center}}
      </style>
    </head>
    <body><main class="preview-stage">{body}</main></body>
    </html>
    """)


HEADER = '''<header id="sticky"><h1 class="logo"><a href="#">FIVE GUYS ONE DIRECTION</a></h1><div class="button-holder"><button class="menu"><i class="icon-menu"></i><i class="icon-close hide"></i></button></div></header>'''
NAV = '''<header id="nav"><nav id="main"><ul class="menu"><li class="alpha hover-cycle"><a class="menu1" href="#">Home</a></li><li class="hover-cycle"><a class="menu2" href="#">Music</a></li><li class="hover-cycle"><a class="menu3" href="#">Journal</a></li><li class="hover-cycle"><a class="menu4" href="#">Band</a></li><li class="hover-cycle"><a class="menu5" href="#">Tour</a></li><li class="hover-cycle active"><a class="menu6" href="#">Blog</a></li></ul></nav></header>'''
PANEL_HEADER = '''<div class="panel-header"><div class="title">4th August 2026</div><div class="section-name"><a href="#">Blog</a></div></div>'''

PREVIEWS = [
    ("header-sticky", "Shared / Header / sticky", "header#sticky", 100, HEADER),
    ("navigation-main", "Shared / Navigation / nav main", "header#nav + nav#main", 150, NAV),
    ("menu-button", "Shared / Header / button menu", "button.menu", 120, '<div class="button-stage"><div class="button-holder"><button class="menu"><i class="icon-menu"></i><i class="icon-close hide"></i></button></div></div>'),
    ("footer", "Shared / Footer / footer", "footer", 240, '''<footer><div id="back-to-top"><a href="#">Back to top <i class="icon-up-arrow"></i></a></div><nav id="social"><ul><li><a href="#"><i class="icon-facebook"></i></a></li><li><a href="#"><i class="icon-twitter"></i></a></li><li><a href="#"><i class="icon-instagram"></i></a></li><li><a href="#"><i class="icon-youtube"></i></a></li><li><a href="#"><i class="icon-spotify"></i></a></li></ul></nav><div id="credits">FIVE GUYS ONE DIRECTION</div></footer>'''),
    ("panel-header", "Shared / Panel / panel header", "div.panel-header", 130, panel("journal-news homepage-news", PANEL_HEADER, "height:100px")),
    ("more-button", "Shared / CTA / more", "a.more", 150, '<div class="button-stage"><a class="more" href="#">Read more</a></div>'),
    ("play-button", "Shared / Video / play button", "a.play-button", 150, '<div class="button-stage"><a class="play-button" href="#"><i class="icon-play"></i><i class="icon-play-text"></i></a></div>'),
    ("home-hero", "Home / Hero / panel hero", "panel hero", 520, panel("hero", '<div class="bg retinafy" style="background-image:url(../../images/gfx/hero-2026-rect-lrg.jpg)"></div><div class="panel-content center-content"><h2>FIVE GUYS<br>ONE DIRECTION</h2></div>')),
    ("home-blog-card", "Home / Latest Blog / homepage blog card", "panel journal-news homepage-news homepage-blog-card", 520, panel("journal-news homepage-news homepage-blog-card", '<div class="inline"></div>'+PANEL_HEADER+'<h2 style="color:#fff"><span class="scaler" style="font-size:70%"><a style="color:#fff" href="#"><span class="en">More Than a Ship</span><span class="zh">不只是嗑 CP</span></a></span></h2><div class="info"><a class="more" href="#" style="color:#fff;border-color:#fff">Read more</a></div>', "background:url(../../images/blog/larry-cover.png) center/cover no-repeat #000")),
    ("home-video", "Home / Video / homepage video", "panel homepage-video", 520, panel("homepage-video", '<div class="bg retinafy" style="background-image:url(../../images/gfx/hero-2026-rect-lrg.jpg)"></div><div class="info"><h2>History</h2><a class="play-button" href="#"><i class="icon-play"></i></a></div>')),
    ("article-panel", "Blog / Article / journal article", "panel journal-article", 520, panel("journal-article", PANEL_HEADER+'<div class="article-holder"><h2>Why This Site Exists</h2><div class="text"><p>This is the editorial article area. 这是文章正文区域。</p><p><a href="#">A text link</a> lives inside the article body.</p></div></div>')),
    ("journal-news", "Journal / News / journal news", "panel journal-news", 520, panel("journal-news", '<div class="bg retinafy" style="background-image:url(../../images/gfx/hero-2026-rect-lrg.jpg)"></div><div class="inline"></div>'+PANEL_HEADER+'<h2>Journal headline</h2><div class="info"><a class="more" href="#">Read more</a></div>')),
    ("journal-instagram", "Journal / Instagram / journal instagram", "panel journal-instagram", 520, panel("journal-instagram", '<div class="bg retinafy" style="background-image:url(../../images/gfx/hero-2026-rect-lrg.jpg)"></div><div class="instagram-hover"><span>Instagram</span></div>')),
    ("journal-tweet", "Journal / Tweet / journal tweet", "panel journal-tweet", 420, panel("journal-tweet", '<div class="panel-content"><p>“A Directioner archive for every era.”</p><span>@5guys1direction</span></div>')),
    ("journal-moments", "Journal / Moments / journal moments", "panel journal-moments", 520, panel("journal-moments", '<div class="bg retinafy" style="background-image:url(../../images/gfx/hero-2026-rect-lrg.jpg)"></div><div class="panel-content center-content"><h2>Moments</h2></div>')),
    ("journal-video", "Journal / Video / journal video", "panel journal-video", 520, panel("journal-video", '<div class="bg retinafy" style="background-image:url(../../images/yt-thumbs/xGPeNN9S0Fg.jpg)"></div><a class="play-button" href="#"><i class="icon-play"></i></a>')),
    ("gallery-cover", "Gallery / Cover / gallery cover harry", "panel gallery-cover harry-cover", 520, panel("gallery-cover harry-cover", '<div class="bg retinafy" style="background-image:url(../../images/gfx/music-members-harry-cover-rect-sml.png)"></div><div class="inline"></div>'+PANEL_HEADER+'<div class="panel-content center-content"><h2>Harry</h2></div><div class="count"><span>4</span></div><div class="info"><a class="more" href="#">View images</a></div>')),
    ("gallery-slideshow", "Gallery / Slideshow / panel gallery", "panel gallery", 520, panel("gallery", '<div id="slideshow" class="cycle-slideshow"><div class="slide"><img src="../../images/media/gallery-images/rect-lrg/cb6818918bec86d980ccc677c675115f.jpg" alt=""></div></div><div class="prevControl"><a class="prev" href="#"><i class="icon-left-arrow"></i></a></div><div class="nextControl"><a class="next" href="#"><i class="icon-right-arrow"></i></a></div><div class="count"><span>1/4</span></div>')),
    ("music-index-card", "Music / Album / music index item", "panel music-index-item", 520, panel("music-index-item", '<div class="bg retinafy" style="background-image:url(../../images/gfx/music-four-colour-rect-lrg.jpg)"></div><div class="panel-content"><h2>FOUR</h2><div class="info"><a class="more" href="#">Explore album</a></div></div>')),
    ("release-header", "Music / Album / release header", "div.release-header", 420, '<div class="release-header"><div class="packshot"><img src="../../images/gfx/music-four-colour-square-lrg.jpg" alt="FOUR"></div><h2>FOUR</h2><p>Released 2014</p></div>'),
    ("song-lyrics", "Music / Lyrics / song lyrics", "panel journal-article song-lyrics", 520, panel("journal-article song-lyrics", '<div class="song-header"><h2><span class="en">What Makes You Beautiful</span><span class="zh">你让自己如此美丽</span></h2></div><div class="text"><div class="lyric-line"><span class="en">You\'re insecure</span><span class="zh">你缺乏自信</span></div><div class="lyric-line"><span class="en">Don\'t know what for</span><span class="zh">却不知道为什么</span></div></div>')),
    ("band-member", "Band / Member / band member harry", "panel band-member harry", 520, panel("band-member harry", '<div class="image"><div class="bg" style="background-image:url(../../images/gfx/music-members-harry-cover-rect-lrg.png)"></div></div><div class="text"><h2><span class="en">Harry</span><span class="zh">哈里</span></h2><p><span class="en">Member profile</span><span class="zh">成员介绍</span></p></div>')),
    ("tour-listing", "Tour / Dates / tour listing", "panel tour-listing", 520, panel("tour-listing", PANEL_HEADER+'<h2>On The Road Again</h2><div class="date">24 JUL <span class="venue">Wembley Stadium</span> <span class="location">London</span></div>')),
    ("territory-selector", "Tour / Territory / territory list", "div.territory-list", 260, '<div class="territories"><div class="active-territory">Europe</div><ul class="territory-list"><li><a href="#">Europe</a></li><li><a href="#">North America</a></li><li><a href="#">Asia</a></li></ul></div>'),
    ("shop-banner", "Shop / Banner / shop banner", "panel shop-banner", 520, panel("shop-banner", '<div class="bg retinafy" style="background-image:url(../../images/gfx/hero-2026-rect-lrg.jpg)"></div><div class="panel-content center-content"><h2>Official Shop</h2><a class="more" href="#">Shop now</a></div>')),
    ("shop-fragrance", "Shop / Fragrance / shop fragrance", "panel shop-fragrance", 520, panel("shop-fragrance", '<div class="panel-content center-content"><h2>Between Us</h2><p>Fragrance</p><a class="more" href="#">Discover</a></div>')),
    ("newsletter", "Shared / Newsletter / newsletter", "panel newsletter", 420, panel("newsletter", '<div class="panel-content center-content"><h2>Newsletter</h2><form><input type="email" placeholder="Email address"><button class="more" type="button">Subscribe</button></form></div>')),
    ("novel-feature", "Novel / Hub / novel feature card", "panel journal-news homepage-news novel-feature-card", 520, panel("journal-news homepage-news novel-feature-card", '<div class="inline"></div>'+PANEL_HEADER+'<div class="feat-row"><h2><span class="en">Read my latest novel</span><span class="zh">看我最新的小说</span></h2><div class="info"><a class="more" href="#">Read the novel</a></div></div>')),
    ("novel-chapter-card", "Novel / Hub / novel chapter card", "panel journal-news homepage-news novel-chapter-card", 300, panel("journal-news homepage-news novel-chapter-card", '<div class="inline"></div><div class="row"><div class="count"><span>01</span></div><h2><span class="en">Chapter 01</span><span class="zh">第一章</span></h2><div class="info"><a class="more" href="#">Read</a></div></div>')),
    ("novel-reading", "Novel / Reading / novel chapter", "panel journal-article novel-chapter", 620, panel("journal-article novel-chapter", '<div class="novel-progress"><span class="novel-progress-bar" style="width:45%"></span></div>'+PANEL_HEADER+'<div class="novel-layout"><div class="article-holder"><h2>第一章</h2><div class="text"><p>小说正文区域。</p><p>这里展示中文连载内容。</p></div><div class="chapter-nav"><a class="more" href="#">下一章</a></div></div><aside class="novel-catalog"><h3>目录</h3><ol><li class="active"><a href="#">01 第一章</a></li><li><a href="#">02 第二章</a></li></ol></aside></div>')),
    ("this-is-us-card", "This Is Us / Platform / this is us platform", "panel this-is-us-platform", 520, panel("this-is-us-platform", '<div class="bg retinafy" style="background-image:url(../../images/gfx/hero-2026-rect-lrg.jpg)"></div><div class="panel-content center-content"><h2>Fan Account</h2><a class="more" href="#">Open profile</a></div>')),
    ("bilingual-text", "Shared / Translation / en zh", "span.en + span.zh", 180, '<div class="font-card"><span class="en">English text layer</span><span class="zh">中文文本层</span></div>'),
    ("count-badge", "Shared / Counter / count", "div.count", 180, '<div class="button-stage"><div class="count"><span>04</span></div></div>'),
]

FONTS_TO_PREVIEW = [
    ("oswald", "Oswald", "Oswald"), ("source-sans-pro", "Source Sans Pro", "Source Sans Pro"),
    ("source-code-pro", "Source Code Pro", "Source Code Pro"), ("playfair-display", "Playfair Display", "Playfair Display"),
    ("cousine", "Cousine", "Cousine"), ("six-caps", "Six Caps", "Six Caps"),
    ("vampiro-one", "Vampiro One", "Vampiro One"), ("codystar", "Codystar", "Codystar"),
    ("courier-new", "Courier New", "Courier New"), ("times-new-roman", "Times New Roman", "Times New Roman"),
    ("smiley-sans", "Smiley Sans", "Smiley Sans"), ("lxgw-wenkai", "LXGW WenKai", "LXGW WenKai"),
    ("lxgw-wenkai-mono", "LXGW WenKai Mono", "LXGW WenKai Mono"), ("noto-serif-sc", "Noto Serif SC", "Noto Serif SC"),
    ("noto-sans-sc", "Noto Sans SC", "Noto Sans SC"), ("zcool-kuaile", "ZCOOL KuaiLe", "ZCOOL KuaiLe"),
    ("fusion-pixel", "Fusion Pixel", "Fusion Pixel"),
]


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    pages = list(PREVIEWS)
    for slug, label, family in FONTS_TO_PREVIEW:
        pages.append((f"font-{slug}", f"Font / {label}", f"font-family: {family}", 220,
                      f'<div class="font-card" style="font-family:\'{family}\',sans-serif"><span class="en">Five Guys, One Direction</span><span class="zh">五个男孩，一个方向</span></div>'))

    for slug, title, _element, _height, body in pages:
        (OUT / f"{slug}.html").write_text(shell(title, body), encoding="utf-8")

    groups = [
        ("公共壳层、Header、Footer 与按钮", pages[:7]),
        ("首页、文章与 Journal 卡片", pages[7:16]),
        ("Gallery、Music、Band 与 Tour", pages[16:24]),
        ("Shop、Novel、翻译与计数", pages[24:]),
    ]
    lines = ["# FIVE GUYS ONE DIRECTION — Element Visual Preview", "", "> 每一个框只嵌入一个独立 HTML 文件；不会重复加载整份预览页，也不会在框内展示其他元素。真实名称和精确选择器见 `ELEMENT-NAMING.md`。", ""]
    for heading, group in groups:
        lines += [f"## {heading}", ""]
        for slug, title, element, height, _body in group:
            lines += [f"### {title}", "", f"- **真实元素名**：`{element}`", "", f'<iframe src="element-previews/{slug}.html" title="{title}" style="width:100%;height:{height}px;border:1px solid #000;background:#ddd;overflow:hidden"></iframe>', ""]
    DOC.write_text("\n".join(lines), encoding="utf-8")
    print(f"Generated {len(pages)} one-element preview pages in {OUT.relative_to(ROOT)}")
    print(f"Generated {DOC.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
