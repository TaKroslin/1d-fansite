#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""重建 硬笔行书（瑞美加张清平）中文子集字体。

背景
----
站点自托管 CJK 字体，不用外部 CDN（jsdelivr 在国内不稳）。
`@chinese-fonts/rmjzqpybxs` 把这款字体切成了 142 个子集；手写体用字
（Polaroid 题注 + 首页 .zh 文案 + 停更公告页 + 站主信件全文）横跨几乎全部
子集 —— 直接引 CDN 要拉上百个文件。
本脚本把需要的子集合并成一个 TTF，再按全部用字重切成**一个 woff2**。

依赖
----
    python3 -m venv --system-site-packages /tmp/fontvenv
    /tmp/fontvenv/bin/pip install brotli        # fontTools 读/写 woff2 需要 brotli
    /tmp/fontvenv/bin/python tools/fonts/subset_hardpen_xingshu.py --apply
    （本仓库的 .venv 里已装好 fontTools + brotli，可直接用 .venv/bin/python）

输出
----
    assets/fonts/zhangqingping-hyx/ZQP-Hardpen-Xingshu-Subset.woff2

注意
----
* 字体授权见 assets/fonts/zhangqingping-hyx/README.txt（免费商用，非 OFL）。
* 用字文本变了（新增汉字）就要重跑本脚本，否则新字会回退到 LXGW WenKai。
"""
import argparse
import os
import re
import subprocess
import tempfile
import urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "assets/fonts/zhangqingping-hyx/ZQP-Hardpen-Xingshu-Subset.woff2")
CDN = ("https://cdn.jsdelivr.net/npm/@chinese-fonts/rmjzqpybxs/dist/"
       + urllib.parse.quote("瑞美加张清平硬笔行书") + "/")

# 所有手写体用字来源：(绝对路径, 抽文本的方式)
SOURCES = [
    (os.path.join(ROOT, "js/larry-anniv-after.js"), "polaroid"),   # Polaroid 题注
    (os.path.join(ROOT, "index.html"), "zh-span"),                # 首页中文文案
    (os.path.join(ROOT, "pages/notice.html"), "zh-span"),         # 停更公告页
    (os.path.join(ROOT, "js/letter-data.js"), "js-string"),       # 信件全文（最大来源）
    (os.path.join(ROOT, "pages/letter.html"), "zh-span"),         # 信件页静态中文
]


def _read(path):
    if not os.path.exists(path):
        return ""
    return open(path, encoding="utf-8").read()


def caption_text():
    """收集全部手写体用字（只收真正会被手写体渲染的文本）。"""
    parts = []
    for path, kind in SOURCES:
        s = _read(path)
        if not s:
            continue
        if kind == "polaroid":
            m = re.search(r"POLAROIDS\s*=\s*\[(.*?)\];", s, re.S)
            if not m:
                continue
            parts += re.findall(r"zh\s*:\s*['\"]([^'\"]+)", m.group(1))
            parts += re.findall(r"title\s*:\s*['\"]([^'\"]+)", m.group(1))
        elif kind == "zh-span":
            parts += re.findall(r'<span class="zh"[^>]*>([^<]*)</span>', s)
            parts += re.findall(r'class="title"[^>]*>\s*([^<]*[一-鿿][^<]*)\s*<', s)
        elif kind == "js-string":
            for a, b in re.findall(r"'([^'\\]*)'|\"([^\"\\]*)\"", s):
                v = a or b
                if re.search(r"[一-鿿]", v):
                    parts.append(v)
    return "".join(parts)


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
