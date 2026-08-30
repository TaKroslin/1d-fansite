#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
bump_zh_version.py — 把全站引用 styles.css 的 ?v= 统一升到指定版本（幂等）。
跳过含 __VER__ 占位符的模板（build 时再填）。不影响引用内的其余内容。
用法: python tools/fonts/bump_zh_version.py <NEWVER>
"""
import glob, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NEW = sys.argv[1] if len(sys.argv) > 1 else '20260830zh3'
PAT = re.compile(r'(styles\.css\?v=)[A-Za-z0-9_.-]*')

files = set(glob.glob(os.path.join(ROOT, 'index.html')))
for root, _dirs, names in os.walk(ROOT):
    if '.git' in root or 'node_modules' in root:
        continue
    for n in names:
        if n.endswith('.html'):
            files.add(os.path.join(root, n))

changed = skipped = 0
for p in sorted(files):
    raw = open(p, encoding='utf-8', errors='ignore').read()
    if '__VER__' in raw:
        skipped += 1
        continue
    new = PAT.sub(lambda m: m.group(1) + NEW, raw)
    if new != raw:
        open(p, 'w', encoding='utf-8').write(new)
        changed += 1
print('files=%d bumped=%d skipped_placeholder=%d version=%s'
      % (len(files), changed, skipped, NEW))

stale = []
for p in files:
    raw = open(p, encoding='utf-8', errors='ignore').read()
    if '__VER__' in raw:
        continue
    if PAT.search(raw) and NEW not in raw:
        stale.append(p)
if stale:
    print('WARN stale(not %s): %d' % (NEW, len(stale)))
    for s in stale[:10]:
        print('  ', s)