import pathlib, sys
sys.path.insert(0, r'E:\文档\GitHub\1d-fansite\tools')
from extract_articles import _html_to_markdown, _build_md

# Test the ready-to-run article
md = _build_md('2026-07-27/ready-to-run')
print('=== raw body last 8 lines ===')
body = md.split('-->', 1)[1] if '-->' in md else md
for i, line in enumerate(body.splitlines()[-8:]):
    print(i, repr(line))
print()
print('=== after byline removal last 8 lines ===')
# Re-run the byline filter to see what survives
lines = body.splitlines()
out = []
skipping = False
for line in lines:
    stripped = line.strip()
    if skipping:
        if stripped == "":
            skipping = False
        continue
    if (
        stripped.startswith("— Takion")
        or stripped.startswith("- Takion")
        or stripped == "Founder of 5GUYS1DIRECTION"
        or stripped == "July 23, 2026"
        or stripped == "27th July 2026"
        or ('"The best journeys' in line and 'forward, together' in line)
    ):
        skipping = True
        continue
    out.append(line)
print('\n'.join(out).rstrip())

