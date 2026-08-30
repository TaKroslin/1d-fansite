#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
apply_zh_css.py — 把中文字体 @font-face + 英文角色的 .zh 配对规则追加进 css/styles.css
幂等：以 `/*==CJK-FONTS-BEGIN==*/ ... /*==CJK-FONTS-END==*/` 为界，重复跑整段替换。
不会碰 styles.css 其余任何内容（minified 单行不重排）。
用法: python tools/fonts/apply_zh_css.py
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STYLES = os.path.join(ROOT, 'css', 'styles.css')
FONTS = os.path.join(ROOT, 'assets', 'fonts')

BEGIN = '/*==CJK-FONTS-BEGIN==*/'
END = '/*==CJK-FONTS-END==*/'

LOCAL = """@font-face{font-family:'Smiley Sans';src:url(../assets/fonts/smiley-sans/SmileySans-Oblique.woff2) format('woff2');font-weight:400;font-display:swap;}
@font-face{font-family:'Smiley Sans';src:url(../assets/fonts/smiley-sans/SmileySans-Oblique.woff2) format('woff2');font-weight:700;font-display:swap;}
@font-face{font-family:'Fusion Pixel';src:url(../assets/fonts/fusion-pixel/fusion-pixel-12px-proportional-zh_hans.woff2) format('woff2');font-weight:400;font-display:swap;}
@font-face{font-family:'ZCOOL KuaiLe';src:url(../assets/fonts/zcool-kuaile/ZCOOLKuaiLe-Subset.woff2) format('woff2');font-weight:400;font-display:swap;}
@font-face{font-family:'LXGW WenKai Mono';src:url(../assets/fonts/lxgw-wenkai-mono/LXGWWenKaiMono-Subset.woff2) format('woff2');font-weight:400;font-display:swap;}
@font-face{font-family:'LXGW WenKai Mono';src:url(../assets/fonts/lxgw-wenkai-mono/LXGWWenKaiMono-Subset.woff2) format('woff2');font-weight:700;font-display:swap;}
@font-face{font-family:'LXGW WenKai';src:url(../assets/fonts/lxgw-wenkai/LXGWWenKaiSubset.woff2) format('woff2');font-weight:400;font-display:swap;}
"""


def source_han_css(fam, outdir):
    """读已下载的 fontsource css，改写 url 并拼进 styles.css"""
    out = []
    for f in sorted(os.listdir(os.path.join(FONTS, outdir))):
        if not f.endswith('.css'):
            continue
        css = open(os.path.join(FONTS, outdir, f), encoding='utf-8').read()
        css = css.replace('url(./files/', f'url(../assets/fonts/{outdir}/files/')
        out.append(css.strip())
    return '\n'.join(out)


def roles_css():
    return """/* 中文基准 = 霞鹜文楷（正文/按钮/菜单…默认），思源黑体退居末尾兜底 */
html .zh{font-family:'LXGW WenKai','LXGW WenKai Mono','Kaiti SC','STKaiti','Noto Serif SC','Noto Sans SC','PingFang SC','Microsoft YaHei',serif;letter-spacing:.02em;}
/* 首页显示：home 非文章面板的标题/面板头 → 得意黑 */
body.home-section .panel:not(.journal-article) > h2 .zh,body.home-section .panel:not(.journal-article) .panel-header .zh{font-family:'Smiley Sans','Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;font-weight:400;letter-spacing:.02em;}
/* DISPLAY：Oswald / Six Caps → 得意黑 */
.oswald .zh,.menu1 .zh,.panel.homepage-video .info .vc .cell .zh,.panel.newsletter h2 .zh,.panel.song-header h2 .zh,.panel.band-member.niall .text h2 .zh,.shop-music h2 .zh,.six-caps .zh,.panel.homepage-tour h2 .zh,.tour-intro h2 .zh,.tour-listing h2 .zh,.panel.journal-archive h2 .zh,.newsletter-intro h2 .zh{font-family:'Smiley Sans','Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;font-weight:400;letter-spacing:.02em;}
.menu1 .zh{font-weight:700;}
/* SERIF：Playfair Display（700）/ Times (panel title, 400) → 思源宋体 */
.playfair-display .zh,.menu4 .zh,.panel.release-menu .menu3 .zh,.panel.band-member.liam .text h2 .zh,.panel.journal-article h2 .zh,.panel.journal-archive ul li a .title .zh,.panel.journal-news.homepage-news h2 .zh,.four-zero-four .fzf-headline .zh,.countdown-timer .zh{font-family:'Noto Serif SC','Source Han Serif SC','Songti SC','SimSun',serif;font-weight:700;letter-spacing:.02em;}
.times .zh,.panel .panel-header .title .zh,.panel.song-list .songs li .zh{font-family:'Noto Serif SC','Source Han Serif SC','Songti SC','SimSun',serif;font-weight:400;letter-spacing:.02em;}
/* MONO：Cousine / Courier New → 霞鹜文楷等宽 */
.cousine .zh,.menu6 .zh,.panel.tweet .panel-content .zh,.fan-twitter .tweet .zh,.panel.journal-instagram .instagram-hover .zh,.shop-merch h2 .zh,.panel.band-member.zayn .text h2 .zh,.countdown-label .zh,.panel.journal-article .liam-sub .zh,.novel-feature-card .feat-row .blurb .zh{font-family:'LXGW WenKai Mono','LXGW WenKai','Noto Sans SC','PingFang SC',monospace;font-weight:400;letter-spacing:.02em;}
.courier-bold .zh,.menu3 .zh,.tour-submenu .zh{font-family:'LXGW WenKai Mono','Noto Sans SC',monospace;font-weight:700;letter-spacing:.02em;}
/* HAND：Vampiro One → 站酷快乐体（备选 霞鹜文楷） */
.vampiro-one .zh,.menu5 .zh,.panel.release-menu .menu2 .zh,.panel.band-member.harry h2 .zh{font-family:'ZCOOL KuaiLe','LXGW WenKai','Noto Serif SC','STKaiti','KaiTi',serif;font-weight:400;letter-spacing:normal;}
/* PIXEL：Codystar（点阵）→ 缝合像素体 */
.codystar .zh,.panel.journal-moments .panel-content h2 .zh,.panel.moment .panel-content h2 .zh{font-family:'Fusion Pixel',monospace;font-weight:400;letter-spacing:normal;}
"""


def main():
    block = (
        BEGIN + '\n/* CJK webfont integration — EN→ZH paired fonts. OFL-1.1 / free for commercial. (2026-08-30)\n'
        '  基准(prose)→LXGW WenKai 霞鹜文楷 · 首页显示+Oswald/Six Caps→Smiley Sans · Playfair/Times→Source Han Serif ·\n'
        '  Vampiro One→ZCOOL KuaiLe · Cousine/Courier→LXGW WenKai Mono · Codystar→Fusion Pixel */\n'
        + LOCAL
        + '\n' + source_han_css('noto-serif-sc', 'source-han-serif')
        + '\n' + source_han_css('noto-sans-sc', 'source-han-sans')
        + '\n' + roles_css()
        + END
    )
    css = open(STYLES, encoding='utf-8').read()
    pat = re.compile(re.escape(BEGIN) + r'.*?' + re.escape(END), re.S)
    if pat.search(css):
        css = pat.sub(block, css)
    else:
        if not css.endswith('\n'):
            css += '\n'
        css = css.rstrip('\n') + '\n\n' + block + '\n'
    open(STYLES, 'w', encoding='utf-8').write(css)
    print(f'styles.css updated: now {os.path.getsize(STYLES)/1024:.0f} KB')


if __name__ == '__main__':
    main()