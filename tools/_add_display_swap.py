"""Add &display=swap to Google Fonts URLs that don't have it yet."""
import re
from pathlib import Path

root = Path(__file__).resolve().parent.parent

# Match the full href="...fonts.googleapis.com/css?family=..." 
# capturing up to the closing quote
pat = re.compile(
    r'(href=["\'](?:https?:)?//fonts\.googleapis\.com/css\?family=[^"\']+?)(["\'])',
    re.IGNORECASE,
)

patched = 0
skipped = 0
for html_file in root.rglob("*.html"):
    try:
        content = html_file.read_text(encoding="utf-8")
    except (PermissionError, OSError):
        skipped += 1
        continue
    if "fonts.googleapis.com" not in content:
        continue
    if "display=swap" in content:
        continue

    new_content = pat.sub(r'\1&display=swap\2', content)
    if new_content != content:
        html_file.write_text(new_content, encoding="utf-8")
        print(f"  patched: {html_file.relative_to(root)}")
        patched += 1

print(f"\nPatched {patched} files, skipped {skipped} (permission).")
