#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_fonts.py — 一键落地中文字体资产（幂等，可重复跑）
把全站 6 套免费可商用中文字体装进 assets/fonts/：
  source-han-serif  (Noto Serif SC 子集族, weights 400/700)
  source-han-sans   (Noto Sans  SC 子集族, weights 400/600/700)
  smiley-sans       (得意黑, 全量 woff2)
  fusion-pixel      (缝合像素体 12px zh_hans, 全量 woff2)
  zcool-kuaile      (站酷快乐体, 按全站 .zh 字符集子集化 → woff2)
  lxgw-wenkai-mono  (霞鹜文楷等宽, 按全站 .zh 字符集子集化 → woff2)
  lxgw-wenkai       (霞鹜文楷比例, 中文正文基准, 按全站 .zh 字符集子集化 → woff2)
并同步每个字体的 OFL / 免费商用 许可文件。
用法: python tools/fonts/fetch_fonts.py
"""
import json, os, re, sys, urllib.request, shutil, glob

ROOT      = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ASSETS    = os.path.join(ROOT, 'assets', 'fonts')
VER       = '5.3.0'
CDN       = 'https://cdn.jsdelivr.net/npm/@fontsource/'

# 复用全站 .zh 文案计算字符集（与站点实际内容同步）
def site_charset():
    ch = set()
    hanzi_re = re.compile(r'[\u2e80-\u9fff\u3000-\u303f\uff00-\uffef\u2000-\u206f\u00a0-\u00ff0-9a-zA-Z]')
    for path in glob.glob(os.path.join(ROOT, '**/*.html'), recursive=True):
        if '.git' in path:
            continue
        try:
            text = open(path, encoding='utf-8', errors='ignore').read()
        except Exception:
            continue
        if 'class="zh"' not in text:
            continue
        ch |= set(hanzi_re.findall(text))
    # 常用标点兜底
    ch |= set('，。、；：？！“”‘’《》（）【】—…·　')
    return ''.join(sorted(ch))

def fetch(url, out, tries=3):
    if os.path.exists(out) and os.path.getsize(out) > 0:
        return True
    os.makedirs(os.path.dirname(out), exist_ok=True)
    tmp = out + '.download'
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 fetch_fonts'})
            with urllib.request.urlopen(req, timeout=60) as rsp, open(tmp, 'wb') as f:
                shutil.copyfileobj(rsp, f)
            os.replace(tmp, out)
            return True
        except Exception as e:
            if i == tries - 1:
                print('  FAIL', url, e)
                return False
    return False

def source_han(fam, weights, outdir):
    """下载 fontsource 中文/拉丁子集 css + 对应 woff2，返回 css 内容"""
    base = os.path.join(ASSETS, outdir)
    os.makedirs(base, exist_ok=True)
    consumed_woff = []
    css_parts = []
    for w in weights:
        for sub in ('chinese-simplified', 'latin'):
            cssname = f'{sub}-{w}.css'
            cssurl = f'{CDN}{fam}@{VER}/{cssname}'
            cssp = os.path.join(base, cssname)
            if not fetch(cssurl, cssp):
                continue
            css = open(cssp, encoding='utf-8').read()
            for m in re.finditer(r'url\((?:\./)?files/([^)]+\.woff2)\)', css):
                woff = m.group(1)
                if woff in consumed_woff:
                    continue
                consumed_woff.append(woff)
                fetch(f'{CDN}{fam}@{VER}/files/{woff}', os.path.join(base, 'files', woff))
            css_parts.append(css)
        print(f'  {outdir} w{w} done')
    return css_parts

def subset_font(src, out, charset, font_family=None):
    """用 fonttools 子集化并转 woff2"""
    from fontTools.subset import Subsetter, Options
    from fontTools.ttLib import TTFont, sfnt
    tmp_ttf = out.replace('.woff2', '.subset.ttf')
    opts = Options()
    opts.flavor = None
    opts.layout_features = ['*']
    opts.recalc_bounds = True
    opts.notdef_outline = True
    opts.recommended_glyphs = True
    font = TTFont(src, recalcBBoxes=False, recalcTimestamp=False)
    st = Subsetter(options=opts)
    st.populate(text=charset)
    st.subset(font)
    font.save(tmp_ttf)
    font.close()
    t = TTFont(tmp_ttf)
    t.flavor = 'woff2'
    t.save(out)
    t.close()
    os.remove(tmp_ttf)
    print(f'  subset {out.split("/")[-1]} -> {os.path.getsize(out)} bytes')

def main():
    print('1/6 source-han-serif (Noto Serif SC 400/700)')
    source_han('noto-serif-sc', ['400', '700'], 'source-han-serif')
    print('2/6 source-han-sans (Noto Sans SC 400/600/700)')
    source_han('noto-sans-sc', ['400', '600', '700'], 'source-han-sans')

    # 已备好全量文件的本地源（本会话下载；smiley/fusion 全量入库，ttf 仅作子集化源）
    local = {
        'smiley-sans/SmileySans-Oblique.woff2': os.path.join(
            '/var/folders/sg/jrhfxbz11gv_6c41m5trhxp80000gn/T/opencode/font-sample/fonts',
            'SmileySans-Oblique.woff2'),
        'fusion-pixel/fusion-pixel-12px-proportional-zh_hans.woff2': os.path.join(
            '/var/folders/sg/jrhfxbz11gv_6c41m5trhxp80000gn/T/opencode/font-sample/fonts',
            'fusion-pixel-12px-proportional-zh_hans.otf.woff2'),
    }
    mono_ttf_rel = 'lxgw-wenkai-mono/LXGWWenKaiMono-Regular.ttf'
    mono_ttf = os.path.join(ASSETS, mono_ttf_rel)
    wenkai_ttf_rel = 'lxgw-wenkai/LXGWWenKai-Regular.ttf'
    wenkai_ttf = os.path.join(ASSETS, wenkai_ttf_rel)
    for ttf, rel in [(mono_ttf, mono_ttf_rel), (wenkai_ttf, wenkai_ttf_rel)]:
        if os.path.exists(ttf) and os.path.getsize(ttf) >= 1000000:
            print('  exists', rel)
            continue
        name = 'LXGWWenKai' if 'Mono' not in rel else 'LXGWWenKaiMono'
        print(f'  download {name} TTF (mirrors)')
        src_url = f'https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/fonts/TTF/{name}-Regular.ttf'
        done = False
        for prefix in ('https://ghfast.top/', 'https://raw.gitmirror.com/', ''):
            if not fetch(prefix + src_url, ttf) or os.path.getsize(ttf) < 1000000:
                continue
            done = True
            break
        if not done:
            print('  WARN: %s TTF unavailable — rerun later to build subset' % name)
    print('3/6 copy full fonts (smiley / fusion / wenkai-mono ttf)')
    for rel, src in local.items():
        dst = os.path.join(ASSETS, rel)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if os.path.exists(src) and not os.path.exists(dst):
            shutil.copy2(src, dst)
            print('  copy', rel)
        elif os.path.exists(dst):
            print('  exists', rel)

    print('4/6 zcool-kuaile TTF (googlefonts repo)')
    kuaile_ttf = os.path.join(ASSETS, 'zcool-kuaile', 'ZCOOLKuaiLe-Regular.ttf')
    fetch('https://cdn.jsdelivr.net/gh/googlefonts/zcool-kuaile@main/fonts/ttf/ZCOOLKuaiLe-Regular.ttf',
          kuaile_ttf)

    print('5/6 subset decorative fonts -> woff2 (site .zh charset: %d chars)' % len(site_charset()))
    charset = site_charset()
    subset_font(kuaile_ttf,
                os.path.join(ASSETS, 'zcool-kuaile', 'ZCOOLKuaiLe-Subset.woff2'), charset or '素')
    subset_font(mono_ttf,
                os.path.join(ASSETS, 'lxgw-wenkai-mono', 'LXGWWenKaiMono-Subset.woff2'), charset or '素')
    subset_font(wenkai_ttf,
                os.path.join(ASSETS, 'lxgw-wenkai', 'LXGWWenKaiSubset.woff2'), charset or '素')

    print('6/6 licenses')
    ofl_src = {
        'smiley-sans': 'https://raw.githubusercontent.com/atelier-anchor/smiley-sans/main/LICENSE',
        'zcool-kuaile': 'https://cdn.jsdelivr.net/gh/googlefonts/zcool-kuaile@main/OFL.txt',
        'lxgw-wenkai-mono': 'https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/OFL.txt',
        'lxgw-wenkai': 'https://raw.githubusercontent.com/lxgw/LxgwWenKai/main/OFL.txt',
    }
    for fam, url in ofl_src.items():
        dst = os.path.join(ASSETS, fam, 'LICENSE.txt')
        if not fetch(url, dst):
            open(dst, 'w').write(
                'This font is licensed under the SIL Open Font License 1.1 — see\n'
                'https://openfontlicense.org/open-font-license-official-text/'
            )
        print('  lic', fam)
    # fusion-pixel 自带 OFL 文本（作者双协议 LICENSE-OFL）
    fp = os.path.join(ASSETS, 'fusion-pixel', 'LICENSE.txt')
    if not os.path.exists(fp):
        open(fp, 'w').write(
            'Fusion Pixel Font — SIL OFL 1.1 & MIT (dual-licensed).\n'
            'See https://github.com/TakWolf/fusion-pixel-font/tree/master/license'
        )
    print('DONE ->', ASSETS)

if __name__ == '__main__':
    sys.exit(main())