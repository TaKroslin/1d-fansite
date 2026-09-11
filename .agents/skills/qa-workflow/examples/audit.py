"""Full-site image audit via real HTTP URLs."""
import re
import urllib.request
from urllib.parse import urljoin
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
BASE = "http://127.0.0.1:8000/"

html_files = [REPO / "index.html"] + sorted(REPO.glob("pages/**/*.html"))

def http_ok(url: str) -> bool:
    try:
        r = urllib.request.urlopen(url, timeout=6)
        return r.status == 200
    except Exception:
        return False

fails = {}
checked = 0
for f in html_files:
    rel = f.relative_to(REPO).as_posix()
    try:
        content = f.read_text(encoding="utf-8", errors="ignore")
    except (PermissionError, OSError):
        continue
    content = re.sub(r"<!--.*?-->", "", content, flags=re.DOTALL)
    refs = re.findall(r'src="([^"]+\.(?:jpg|png|gif|jpeg))"', content)
    refs += re.findall(r'background(?:-image)?:\s*url\(([^)]+\.(?:jpg|png|gif|jpeg))\)', content)
    for ref in set(refs):
        if ref.startswith("http") or ref.startswith("//") or ref.startswith("data:"):
            continue
        url = urljoin(BASE + rel, ref)
        if not url.startswith(BASE):
            continue
        checked += 1
        if not http_ok(url):
            fails.setdefault(url, set()).add(rel)

print("Total local image refs checked: {}".format(checked))
print("Broken: {}".format(len(fails)))
for url in sorted(fails):
    print("\n  {} <- {}".format(url, ", ".join(sorted(fails[url])[:3])))
