#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""重建 Polaroid 题注中文子集字体（瑞美加张清平硬笔行书）。

背景
----
站点自托管 CJK 字体，不用外部 CDN（jsdelivr 在国内不稳）。
`@chinese-fonts/rmjzqpybxs` 把这款字体切成了 142 个子集；Polaroid 题注只用到
102 个汉字，却横跨 53 个子集 —— 直接引 CDN 要拉 53 个文件 / 1.9 MB。
本脚本把 53 个子集合并成一个 TTF，再按题注文本重切成**一个 38.4 KB 的 woff2**。

依赖
----
    python3 -m venv --system-site-packages /tmp/fontvenv
    /tmp/fontvenv/bin/pip install brotli        # fontTools 读/写 woff2 需要 brotli
    /tmp/fontvenv/bin/python tools/fonts/subset_hardpen_xingshu.py --apply

输出
----
    assets/fonts/zhangqingping-hyx/ZQP-Hardpen-Xingshu-Subset.woff2

注意
----
* 字体授权见 assets/fonts/zhangqingping-hyx/README.txt（免费商用，非 OFL）。
* 题注文本变了（新增汉字）就要重跑本脚本，否则新字会回退到 LXGW WenKai。
"""
import argparse
import glob
import os
import re
import subprocess
import tempfile
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
JS = os.path.join(ROOT, "docs/demo/js/larry-anniv-after.js")
HTML = os.path.join(ROOT, "docs/demo/index-demo-after-928.html")
OUT = os.path.join(ROOT, "assets/fonts/zhangqingping-hyx/ZQP-Hardpen-Xingshu-Subset.woff2")
CDN = ("https://cdn.jsdelivr.net/npm/@chinese-fonts/rmjzqpybxs/dist/"
       + urllib.parse.quote("瑞美加张清平硬笔行书") + "/")


def caption_text():
    """Polaroid 题注（JS 渲染）+ 页面上所有 .zh 文案（粉丝创作面板的题注/按钮等）。
    后者也要收进来，否则新加的中文会回退到霞鹜文楷，与硬笔题注混字体。"""
    js = open(JS, encoding="utf-8").read()
    blk = re.search(r"POLAROIDS\s*=\s*\[(.*?)\];", js, re.S).group(1)
    zh = re.findall(r"zh\s*:\s*['\"]([^'\"]+)", blk)
    if not zh:
        raise SystemExit("没从 %s 抽到 zh 题注" % JS)
    html = open(HTML, encoding="utf-8").read()
    zh += re.findall(r'<span class="zh">([^<]*)</span>', html)
    return "".join(zh)


def curl(url, out=None):
    cmd = ["curl", "-s", "-L", "--max-time", "60"]
    if out:
        cmd += ["-o", out]
    cmd.append(url)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise SystemExit("curl 失败: %s" % url)
    return None if out else r.stdout


def unicode_range(spec):
    cps = set()
    for part in spec.split(","):
        part = part.strip().upper().replace("U+", "")
        if not part:
            continue
        if "-" in part:
            a, b = part.split("-")
            cps.update(range(int(a, 16), int(b, 16) + 1))
        else:
            cps.add(int(part, 16))
    return cps


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="真的下载并写文件")
    args = ap.parse_args()

    from fontTools.ttLib import TTFont
    from fontTools.merge import Merger
    from fontTools import subset

    text = caption_text()
    need = set(map(ord, text))
    print("题注去重字符: %d" % len(need))

    css = curl(CDN + "result.css")
    picked = []
    for b in re.findall(r"@font-face\s*\{([^}]*)\}", css):
        fn = re.search(r'url\("\./([0-9a-f]{32}\.woff2)"\)', b)
        ur = re.search(r"unicode-range:([^;}]+)", b)
        if fn and ur and (unicode_range(ur.group(1)) & need):
            picked.append(fn.group(1))
    print("需要 %d 个 CDN 子集" % len(picked))
    if not args.apply:
        print("（dry-run）")
        return

    with tempfile.TemporaryDirectory() as tmp:
        ttfs = []
        for i, fn in enumerate(picked):
            p = os.path.join(tmp, fn)
            curl(CDN + fn, out=p)
            t = TTFont(p)
            o = os.path.join(tmp, "%03d.ttf" % i)
            t.save(o)
            ttfs.append(o)
        merged = Merger().merge(ttfs)
        mpath = os.path.join(tmp, "merged.ttf")
        merged.save(mpath)
        print("合并后 %d 字形 / %.1f MB" % (len(merged.getGlyphOrder()),
                                        os.path.getsize(mpath) / 1e6))

        opts = subset.Options()
        opts.flavor = "woff2"
        opts.desubroutinize = True
        opts.layout_features = ["*"]
        font = TTFont(mpath)
        s = subset.Subsetter(options=opts)
        s.populate(text=text)
        s.subset(font)
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        font.flavor = "woff2"
        font.save(OUT)

        chk = TTFont(OUT)
        cmap = chk.getBestCmap()
        missing = sorted(map(chr, need - set(cmap)))
        print("已写 %s  %.1f KB  形%d  cmap%d" % (
            os.path.relpath(OUT, ROOT), os.path.getsize(OUT) / 1024,
            len(chk.getGlyphOrder()), len(cmap)))
        print("覆盖 %d/%d" % (len(need) - len(missing), len(need)),
              "缺字:", "".join(missing) or "无")


if __name__ == "__main__":
    main()
