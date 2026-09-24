#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""从 larry-main-panel.psd 的「图层 1」（干净抠图）重做右格人像：

  1. 黑金双色调（暗部 ≈ 墨黑 #0e1216，亮部 ≈ 站点的金 --larry-gold #c9a86a）；
  2. 人物轮廓**外扩 R 像素**处画一圈**手绘感虚线描边**（沿轮廓的短划，不是斜线排线）；
  3. 输出 1200×1200 透明 PNG。

描边做法：把 alpha 掩膜膨胀 R 像素 → 取该膨胀体的边界（≈ 沿轮廓的 2px 带）
        → 把边界像素按 8 邻域**跟踪成有序路径** → 按弧长切「划/隙」→ 抖动划长与位置
        → 画成金色细虚线。这样虚线是**沿着轮廓走**的，不是斜排线。
"""
import os
import random

import numpy as np
from PIL import Image, ImageFilter
from psd_tools import PSDImage

ROOT = "/Users/takionkroslin/项目/1d-fansite"
PSD = "/Users/takionkroslin/Downloads/larry-main-panel.psd"
OUT = os.path.join(ROOT, "images/gfx/larry-anniv-2026/larry-leader-figures-blackgold.png")

PAD = 60             # 四周留白（像素）：描边在轮廓外 22px + 线粗，不留白就会在画布边缘被切掉
OFFSET = 22          # 描边离人物轮廓的距离（1200 画布）
DASH = 17            # 划长
GAP = 13             # 间隙
STROKE = 6           # 线粗
SEED = 20260924

INK = (14, 18, 22)          # 暗部：比 --larry-ink 更沉一点，压在深绿上才像"黑金"
GOLD = (201, 168, 106)      # --larry-gold


def mask_of(alpha, thr=128):
    return alpha >= thr


def dilate(m, r):
    return None if m is None else m.filter(ImageFilter.MaxFilter(2 * r + 1))


def trace_paths(pts):
    """把边界像素集合跟踪成若干有序路径（8 邻域，贪心）。"""
    pts = set(pts)
    paths = []
    while pts:
        start = min(pts, key=lambda p: (p[1], p[0]))
        path = [start]
        pts.discard(start)
        cur = start
        while True:
            x, y = cur
            nxt = None
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    if dx == 0 and dy == 0:
                        continue
                    c = (x + dx, y + dy)
                    if c in pts:
                        nxt = c
                        break
                if nxt:
                    break
            if nxt is None:
                break
            pts.discard(nxt)
            path.append(nxt)
            cur = nxt
        if len(path) > 12:
            paths.append(path)
    return paths


def main():
    psd = PSDImage.open(PSD)
    layers = list(psd)
    fig = None
    for l in layers:                       # 取"图层 1"（唯一的干净抠图）
        if l.name.strip() == "图层 1":
            fig = l
    if fig is None:
        raise SystemExit("没在 PSD 里找到「图层 1」")
    img = fig.composite(viewport=psd.viewbox).convert("RGBA")
    # ★ 先补四周留白再算描边：原图人物顶到画布上沿（y=8）、下沿（y=1200），
    #   描边往外扩 22px 会直接跑到画布外被丢掉（实测顶行有 21 个描边像素贴边）。
    if PAD:
        padded = Image.new("RGBA", (img.width + 2 * PAD, img.height + 2 * PAD), (0, 0, 0, 0))
        padded.paste(img, (PAD, PAD))
        img = padded
    W, H = img.size
    arr = np.asarray(img).astype(np.float32)
    alpha = arr[..., 3]
    m0 = mask_of(alpha)
    print("基础抠图 %dx%d  覆盖 %.1f%%" % (W, H, 100 * m0.mean()))

    # ---- 1. 黑金双色调 ----
    rgb = arr[..., :3]
    gray = (0.299 * rgb[..., 0] + 0.587 * rgb[..., 1] + 0.114 * rgb[..., 2]) / 255.0
    # S 形提升对比：暗部压到近黑、亮部提到金
    g = np.clip((gray - 0.5) * 1.5 + 0.5, 0, 1)      # 更强对比：黑更黑、金更亮
    g = g ** 1.05
    ink = np.array(INK, np.float32)
    gold = np.array(GOLD, np.float32)
    duo = ink[None, None, :] + (gold - ink)[None, None, :] * g[..., None]
    print("双色调：暗部 %s  亮部 %s  灰阶均值 %.3f" % (INK, GOLD, gray[m0].mean()))

    # ---- 2. 手绘虚线描边（沿轮廓外扩 OFFSET） ----
    mm = Image.fromarray((m0 * 255).astype(np.uint8), "L")
    outer = dilate(mm, OFFSET)
    inner = outer.filter(ImageFilter.MinFilter(3))            # 腐蚀 1px
    o = np.asarray(outer) > 128
    i_ = np.asarray(inner) > 128
    band = o & ~i_                                            # 沿轮廓的 2px 带
    pts = set(zip(*np.where(band)[::-1]))                     # (x,y)
    paths = trace_paths(pts)
    print("轮廓路径 %d 条，最长 %d 点" % (len(paths), max(len(p) for p in paths)))

    rnd = random.Random(SEED)
    ink_mask = np.zeros((H, W), bool)
    for path in paths:
        pos = 0.0
        d_on = DASH + rnd.uniform(-4, 4)
        d_off = GAP + rnd.uniform(-3, 3)
        on = True
        for k in range(1, len(path)):
            x0, y0 = path[k - 1]
            x1, y1 = path[k]
            pos += ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5
            if pos >= (d_on if on else d_off):
                pos = 0.0
                on = not on
                if on:
                    d_on = DASH + rnd.uniform(-4, 4)
                else:
                    d_off = GAP + rnd.uniform(-3, 3)
            if on:
                jx = int(round(x1 + rnd.uniform(-0.9, 0.9)))
                jy = int(round(y1 + rnd.uniform(-0.9, 0.9)))
                if 0 <= jx < W and 0 <= jy < H:
                    ink_mask[jy, jx] = True
    stroke = Image.fromarray((ink_mask * 255).astype(np.uint8), "L").filter(
        ImageFilter.MaxFilter(2 * (STROKE // 2) + 1))
    dash_a = np.asarray(stroke).astype(np.float32) / 255.0
    print("虚线覆盖 %.2f%% 图面（外扩 %dpx，划/隙 ≈ %d/%d，线粗 %d）"
          % (100 * (dash_a > .5).mean(), OFFSET, DASH, GAP, STROKE))

    # ---- 3. 合成：人物（双色调）+ 虚线（金） ----
    out_a = np.maximum(m0.astype(np.float32), dash_a)
    gold_layer = np.broadcast_to(gold[None, None, :], (H, W, 3)).copy()
    fig_rgb = np.where(m0[..., None], duo, 0.0)
    dash_rgb = gold_layer * dash_a[..., None] * (1 - m0[..., None])   # 虚线只在人物外
    out_rgb = fig_rgb + dash_rgb
    out = np.dstack([np.clip(out_rgb, 0, 255), (out_a * 255)]).astype(np.uint8)
    Image.fromarray(out, "RGBA").save(OUT, optimize=True)
    print("已写 %s  %.0f KB" % (os.path.relpath(OUT, ROOT), os.path.getsize(OUT) / 1024))

    # 预览：贴到右格底色（--larry-green-deep）上，并叠一张局部放大
    bgc = (47, 93, 78)
    layer = Image.fromarray(out, "RGBA")
    bg = Image.new("RGB", (W, H), bgc)
    bg.paste(layer, (0, 0), layer)
    bg.resize((760, 760)).save("/tmp/fig-blackgold-view.png")
    bg.crop((230, 240, 710, 720)).save("/tmp/fig-blackgold-zoom.png")


if __name__ == "__main__":
    main()
