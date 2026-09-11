"""HTTP 200 遍历脚本模板：检查改动涉及页面的所有引用 URL。

用法：起本地 server 后运行 python check-links.py
"""
from __future__ import annotations
import re
import urllib.request
from urllib.parse import urljoin
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BASE = "http://127.0.0.1:8000/"

# 只检查这些页面（改动影响面）
TARGETS = [
    "index.html",
    "pages/blog.html",
]

def http_ok(url: str) -> bool:
    try:
        return urllib.request.urlopen(url, timeout=6).status == 200
    except Exception:
        return False

checked = ok = 0
fails = {}
for rel in TARGETS:
    f = REPO / rel
    content = f.read_text(encoding="utf-8", errors="ignore")
    content = re.sub(r"<!--.*?-->", "", content, flags=re.DOTALL)
    refs = re.findall(r'(?:src|href)="([^"]+)"', content)
    refs += re.findall(r'background(?:-image)?:\s*url\(([^)]+)\)', content)
    for ref in set(refs):
        if not ref or ref.startswith(("http", "//", "data:", "#", "mailto:")):
            continue
        url = urljoin(BASE + rel, ref)
        if not url.startswith(BASE):
            continue
        checked += 1
        if http_ok(url):
            ok += 1
        else:
            fails.setdefault(url, set()).add(rel)

print(f"Checked: {checked}, OK: {ok}, Broken: {len(fails)}")
for url, pages in sorted(fails.items()):
    print(f"  BROKEN {url} <- {sorted(pages)}")
