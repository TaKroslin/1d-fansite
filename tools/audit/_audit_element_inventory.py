#!/usr/bin/env python3
"""Read-only inventory for HTML/CSS/template element naming coverage."""
from __future__ import annotations

import re
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOC = ROOT / "AGENTS" / "ELEMENT-NAMING.md"
SCAN_DIRS = (ROOT / "pages", ROOT / "journal", ROOT / "tools" / "templates", ROOT / "index.html", ROOT / "css" / "styles.css")


def files_to_scan():
    for item in SCAN_DIRS:
        if item.is_file():
            yield item
        elif item.exists():
            yield from (path for path in item.rglob("*.html") if path.is_file())


def main() -> int:
    class_counts = Counter()
    id_counts = Counter()
    locations = defaultdict(set)
    font_names = set()
    icon_names = set()

    scanned = list(files_to_scan())
    html_count = sum(1 for path in scanned if path.suffix.lower() == ".html")
    for path in scanned:
        text = path.read_text(encoding="utf-8", errors="ignore")
        for match in re.finditer(r'class=["\']([^"\']+)', text):
            tokens = tuple(match.group(1).split())
            if not tokens:
                continue
            class_counts.update(tokens)
            canonical = " ".join(tokens)
            locations[canonical].add(str(path.relative_to(ROOT)))
            icon_names.update(t for t in tokens if t.startswith("icon-"))
        for match in re.finditer(r'id=["\']([^"\']+)', text):
            id_counts[match.group(1)] += 1
        for match in re.finditer(r"font-family\s*:\s*([^;}{]+)", text, re.I):
            for value in match.group(1).split(","):
                value = value.strip().strip("'\"")
                if value and value.lower() not in {"inherit", "initial", "unset"}:
                    font_names.add(value)

    documented = set(re.findall(r"`([^`]+)`", DOC.read_text(encoding="utf-8")))
    canonical_classes = {name for name in locations if " " in name}
    undocumented = sorted(name for name in canonical_classes if name not in documented)

    print(f"Files scanned: {len(scanned)} (HTML: {html_count})")
    print(f"Unique class tokens: {len(class_counts)}")
    print(f"Unique class combinations: {len(locations)}")
    print(f"Unique ids: {len(id_counts)}")
    print(f"Icon classes: {len(icon_names)}")
    print("Fonts found:")
    for name in sorted(font_names):
        print(f"  - {name}")
    print("\nMost common class tokens:")
    for name, count in class_counts.most_common(30):
        print(f"  {count:4d}  {name}")
    print(f"\nClass combinations not literally present in naming doc: {len(undocumented)}")
    for name in undocumented[:80]:
        print(f"  - {name}  [{len(locations[name])} files]")
    if len(undocumented) > 80:
        print(f"  ... {len(undocumented) - 80} more")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
