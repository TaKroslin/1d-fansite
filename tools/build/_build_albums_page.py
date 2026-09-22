"""Build pages/gallery/albums.html: aggregated album photos entry.

Style: matches gallery-section — uses .panel.release-header (per-album divider)
+ .panel.gallery-cover (per-photoset card) like music photos pages. Body class
"duo gallery-section" to keep the official duo layout + grayscale cover hover.

Structure (no panel-group wrapper; matches gallery.html):
  intro (panel journal-article)
  for each of 5 albums (chronological by release):
    panel.release-header-mono.header-<slug> + <h2><a>Album Name</a></h2>
    for each photoset: panel.gallery-cover (bg from photoset cover, count, link)
  journal-archive-link (back to gallery.html)
  footer

Paths from pages/gallery/albums.html (2 levels deep): all resources ../../.
"""
import re
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent
ALBUMS = [
    ('up-all-night',     'Up All Night',     'Up All Night'),
    ('take-me-home',     'Take Me Home',     'Take Me Home'),
    ('midnight-memories','Midnight Memories','Midnight Memories'),
    ('four',             'Four',             'Four'),
    ('made-in-the-am',   'Made In The A.M.', 'Made In The A.M.'),
]

# Extract each album's photosets from its existing photos.html
def parse_album(slug):
    p = REPO / 'pages' / 'music' / 'albums' / slug / 'photos.html'
    text = p.read_text(encoding='utf-8')
    chunks = text.split('<div class="panel gallery-cover">')
    sets = []
    for c in chunks[1:]:
        img = re.search(r'url\(([^)]+)\)', c)
        h2  = re.search(r'<h2>([^<]+)</h2>', c)
        cnt = re.search(r'class="count"><span>(\d+)</span>', c)
        link= re.search(r'href="(photos/[^"]+)"', c)
        if img and h2 and cnt and link:
            img_path = img.group(1).replace('../../../../images/', '')
            sets.append({
                'title': h2.group(1).strip(),
                'count': cnt.group(1),
                'img':   img_path,
                'link':  link.group(1),  # e.g. photos/one-thing.html
            })
    return sets

albums_data = [(slug, title_en, parse_album(slug)) for slug, title_en, _ in [(s, t, s) for s, t, _ in ALBUMS]]
# Re-bind display title
albums_data = []
for slug, title_en, header_title in ALBUMS:
    sets = parse_album(slug)
    albums_data.append((slug, title_en, header_title, sets))

# Build HTML
out = []
out.append('<!DOCTYPE html>')
out.append('<html class="no-js" lang="en">')
out.append('<script>document.documentElement.className=document.documentElement.className.replace("no-js","js");</script>')
out.append('<head>')
out.append('    <title>Albums — FIVE GUYS ONE DIRECTION | Gallery</title>')
out.append('    <meta content="width=device-width, initial-scale=1.0, maximum-scale=2.0, user-scalable=0" name="viewport" />')
out.append('\t<meta charset="utf-8" />')
out.append('')
out.append('    <meta property="og:title" content="Albums — FIVE GUYS ONE DIRECTION | Gallery" />')
out.append('    <meta property="og:site_name" content="FIVE GUYS ONE DIRECTION" />')
out.append('    <meta property="og:type" content="website" />')
out.append('    <meta property="og:image" content="../images/gfx/hero-2015-rect-lrg.jpg" />')
out.append('    <meta property="og:url" content="https://www.5guys1direction.asia/pages/gallery/albums.html" />')
out.append('    <meta property="og:description" content="Every photoset from every One Direction album era, in one place. Up All Night through Made In The A.M." />')
out.append('    <meta name="description" content="Every photoset from every One Direction album era, in one place. Up All Night through Made In The A.M." />')
out.append('    <meta name="keywords" content="One Direction, gallery, albums, photos, Up All Night, Take Me Home, Midnight Memories, Four, Made In The A.M." />')
out.append('    <meta name="author" content="Takion Kroslin &amp; FIVE GUYS ONE DIRECTION" />')
out.append('')
out.append('    <meta name="twitter:card" content="summary_large_image" />')
out.append('    <meta name="twitter:site" content="@5guys1direction" />')
out.append('    <meta name="twitter:creator" content="@takionkroslin" />')
out.append('')
out.append('\t<link href="https://fonts.googleapis.com/css?family=Playfair+Display:700|Codystar|Cousine:400,700|Source+Code+Pro:300,400,500,600,700|Source+Sans+Pro:400|Oswald:400,700|Vampiro+One|Six+Caps&display=swap" rel="stylesheet" type="text/css" />')
out.append('\t<link href="../../css/styles.css?v=20260926a" rel="stylesheet" type="text/css" />')
out.append('')
out.append('</head>')
out.append('')
out.append('<body class="duo gallery-section">')
out.append('')
out.append('<div class="header-spacer"></div>')
out.append('')
out.append('')
out.append('<header id="sticky">')
out.append('\t<h1 class="logo">')
out.append('\t\t<a href="../index.html">FIVE GUYS ONE DIRECTION</a>')
out.append('\t</h1>')
out.append('\t<div class="button-holder"><button class="menu"><i class="icon-menu"></i><i class="icon-close hide"></i></button></div>')
out.append('</header>')
out.append('<header id="nav" class="">')
out.append('\t<nav id="main">')
out.append('\t\t<ul class="menu">')
out.append('\t\t\t<li class="alpha hover-cycle"><a class="menu1" href="../index.html">Home</a></li>')
out.append('\t\t\t<li class="hover-cycle"><a class="menu2" href="music.html">Music</a></li>')
out.append('\t\t\t<li class="hover-cycle"><a class="menu3" href="journal.html">Journal</a></li>')
out.append('\t\t\t<li class="hover-cycle"><a class="menu4" href="band.html">Band</a></li>')
out.append('\t\t\t<li class="hover-cycle"><a class="menu5" href="tour.html">Tour</a></li>')
out.append('\t\t\t<li class="hover-cycle"><a class="menu6" href="blog.html">Blog</a></li>')
out.append('\t\t\t<li class="hover-cycle active"><a class="menu1" href="gallery.html">Gallery</a></li>')
out.append('\t\t\t<li class="hover-cycle"><a class="menu2" href="this-is-us.html">This Is Us</a></li>')
out.append('\t\t\t<li class="hover-cycle"><a class="menu3" href="about.html">About</a></li>')
out.append('\t\t</ul>')
out.append('\t\t<span></span>')
out.append('\t</nav>')
out.append('</header>')
out.append('')
out.append('')
out.append('<div class="panel journal-article">')
out.append('')
out.append('\t<div class="panel-header">')
out.append('\t\t<div class="title"><span class="en">Gallery</span><span class="zh">图库</span> / <span class="en">Albums</span><span class="zh">分专辑</span></div>')
out.append('\t\t<div class="section-name"><a href="gallery.html"><span class="en">Gallery</span><span class="zh">图库</span></a></div>')
out.append('\t</div>')
out.append('')
out.append('\t<div class="article-holder">')
out.append('')
out.append('\t\t<h2><span class="scaler" style="font-size: 100%;"><span class="en">Albums</span><span class="zh">分专辑</span></span></h2>')
out.append('')
out.append('\t\t<div class="text">')
out.append('\t\t\t<p><span class="en">Every photoset from every One Direction album era, in one place. Five albums, thirteen photosets — each cover opens the original single-shot gallery on the matching music page.</span><span class="zh">把五张专辑年代的所有照片集合并到一处：五张专辑、十三组照片——每个封面都通向原音乐页的 slideshow。</span></p>')
out.append('\t\t</div>')
out.append('')
out.append('\t</div>')
out.append('')
out.append('</div>')

# Per album: release-header-mono + cover cards
for slug, title_en, header_title, sets in albums_data:
    out.append('')
    out.append(f'<div class="panel release-header release-header-mono header-{slug}">')
    out.append('\t<div class="bg retinafy"></div>')
    out.append(f'\t<h2>{title_en}</h2>')
    out.append('')
    out.append('\t')
    out.append('</div><!--.panel.release-header-->')
    for s in sets:
        cover_img = s["img"].replace('rect-lrg', 'rect-sml')
        out.append(f'<div class="panel gallery-cover">')
        out.append(f'\t<div class="bg retinafy" style="background-image: url(../../images/{cover_img});"></div>')
        out.append('')
        out.append(f'\t<div class="inline"></div>')
        out.append('')
        out.append(f'\t<div class="panel-header">')
        out.append(f'\t\t<div class="title">{title_en}</div>')
        out.append(f'\t\t<div class="section-name"><span><span class="en">Gallery</span><span class="zh">图库</span></span></div>')
        out.append(f'\t</div><!--.panel-header-->')
        out.append(f'\t')
        out.append(f'\t<div class="panel-content center-content"><h2>{s["title"]}</h2></div>')
        out.append(f'\t\t<div class="count"><span>{s["count"]}</span></div><!--.count-->')
        out.append('')
        out.append(f'\t<div class="info">')
        out.append(f'\t\t<a class="more" href="../music/albums/{slug}/{s["link"]}"><span class="en">View images</span><span class="zh">查看图片</span></a>')
        out.append(f'\t</div><!--.info-->')
        out.append('')
        out.append(f'</div><!--.panel.gallery-->')

out.append('')
out.append('<div class="journal-archive-link">')
out.append('\t<a class="more" href="gallery.html"><span class="en">Back to <span class="en">Gallery</span><span class="zh">图库</span></span><span class="zh">返回图库</span></a>')
out.append('</div>')
out.append('')
out.append('')
out.append('<footer>')
out.append('')
out.append('\t<div id="back-to-top"><a href="#">Back to top <i class="icon-up-arrow"></i></a></div>')
out.append('')
out.append('\t<nav id="social">')
out.append('\t\t<ul>')
out.append('\t\t\t<li class="twitter"><a target="_blank" href="https://twitter.com/5guys1direction"><i class="icon-twitter"></i><span>Twitter</span></a></li>')
out.append('\t\t\t<li class="instagram"><a target="_blank" href="https://instagram.com/5guys1direction"><i class="icon-instagram"></i><span>Instagram</span></a></li>')
out.append('\t\t\t<li class="youtube"><a target="_blank" href="https://www.youtube.com/@5guys1direction"><i class="icon-youtube"></i><span>YouTube</span></a></li>')
out.append('\t\t\t<li class="spotify"><a target="_blank" href="https://open.spotify.com/user/5guys1direction"><i class="icon-spotify"></i><span>Spotify</span></a></li>')
out.append('\t\t</ul>')
out.append('\t</nav>')
out.append('')
out.append('\t<nav id="credits">')
out.append('\t\t<ul>')
out.append('\t\t\t<li><a target="_blank" href="about.html">About</a></li>')
out.append('\t\t\t<li>&copy; <span id="footerDate"></span> <a target="_blank" href="about.html">Takion Kroslin &amp; 5 GUYS 1 DIRECTION</a></li>')
out.append('\t\t\t<li><a href="mailto:contact@5guys1direction.asia">Contact</a></li>')
out.append('\t\t</ul>')
out.append('\t\t<span></span>')
out.append('\t</nav>')
out.append('')
out.append('</footer>')
out.append('')
out.append('<div class="screen"></div>')
out.append('')
out.append('<script src="../../js/jquery.min.js"></script>')
out.append('<script src="../../js/main.js"></script>')
out.append('<script src="../../js/translate.js"></script>')
out.append('')
out.append('</body>')
out.append('')
out.append('</html>')

target = REPO / 'pages' / 'gallery' / 'albums.html'
target.write_text('\n'.join(out) + '\n', encoding='utf-8')

# Stats
total = sum(len(sets) for _, _, _, sets in albums_data)
print(f"WROTE {target.relative_to(REPO)}: {len(albums_data)} albums, {total} photosets")
for slug, title_en, _, sets in albums_data:
    print(f"  {slug:18s} {len(sets)} photosets")
