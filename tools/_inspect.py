import pathlib
for p in sorted(pathlib.Path('pages/blog').glob('*/**/article.md')):
    text = p.read_text(encoding='utf-8')
    body = text.split('-->', 1)[1]
    last = body.strip().splitlines()[-3:] if body.strip() else []
    rel = p.relative_to(pathlib.Path('pages/blog'))
    print('===', rel, '===')
    for l in last:
        print('  ', repr(l))
