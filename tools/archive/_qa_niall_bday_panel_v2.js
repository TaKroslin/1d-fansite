const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const out = 'tools/_qa_screenshots/niall-bday-v2-20260914/';
  const R = [];
  const GRAPHEME = `(s) => [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s)].length`;
  const ok = (n, p, d) => R.push(`${p ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`);
  const shoot = async (page, sel, path, pad = 14) => {
    const bb = await page.locator(sel).boundingBox();
    const off = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
    await page.screenshot({ path, clip: { x: Math.max(0, bb.x + off.x - pad), y: Math.max(0, bb.y + off.y - pad),
      width: bb.width + pad * 2, height: bb.height + pad * 2 }, fullPage: true });
  };

  const p = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle' });
  await p.waitForTimeout(1200);

  // ---- 文案 ----
  const txt = await p.evaluate(() => ({
    en: document.querySelector('.niall-headline .en').textContent.trim(),
    zh: document.querySelector('.niall-headline .zh').textContent.trim(),
    hint: document.querySelector('.niall-hint').textContent.trim(),
    sub: document.querySelector('.niall-sub .en').textContent.trim(),
    img: document.querySelector('.niall-photo').getAttribute('src')
  }));
  ok('英文文案 = Happy Birthday / Captain Niall!', txt.en === 'Happy BirthdayCaptain Niall!', JSON.stringify(txt.en));
  ok('中文文案 = 奶儿船长生日快乐！', txt.zh === '奶儿船长生日快乐！', JSON.stringify(txt.zh));
  ok('图片已换为生日图', /niall-bday-2026-square\.png$/.test(txt.img), txt.img);

  // ---- 双爱心 bug：每个元素必须只有一个 emoji ----
  const floats = await p.evaluate(() => {
    const els = [...document.querySelectorAll('.niall-float')];
    const box = el => { const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; };
    return els.map(el => ({ t: el.textContent, len: [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(el.textContent)].length, ...box(el),
                            ff: getComputedStyle(el).fontFamily.split(',')[0], hasIconClass: el.classList.contains('icon-heart') }));
  });
  ok('常驻飘心有元素', floats.length >= 8, `count=${floats.length}`);
  ok('无 .icon-heart 类（不再走伪元素）', floats.every(f => !f.hasIconClass));
  ok('每个元素只含 1 个 emoji（无双重爱心）', floats.every(f => f.len === 1),
     'lengths=' + [...new Set(floats.map(f => f.len))].join(','));
  const emojiSet = [...new Set(floats.map(f => f.t))];
  ok('emoji 为 🧡 或 🇮🇪', emojiSet.every(e => e === '🧡' || e === '🇮🇪'), JSON.stringify(emojiSet));
  ok('emoji 混合出现（随机交替生效）', emojiSet.length === 2, JSON.stringify(emojiSet));
  const maxH = Math.max(...floats.map(f => f.h));
  ok('emoji 未换行成两行（高度合理）', maxH < 40, `maxHeight=${maxH}px（双行会接近翻倍）`);
  ok('emoji 字体栈生效', /Apple Color Emoji|Segoe UI Emoji|Noto Color Emoji/.test(floats[0].ff), floats[0].ff);

  // ---- 图片不被裁切 ----
  const imgBox = await p.evaluate(() => {
    const panel = document.querySelector('.niall-photo-panel'), img = document.querySelector('.niall-photo');
    const pr = panel.getBoundingClientRect(), ir = img.getBoundingClientRect();
    const cs = getComputedStyle(img);
    return { panel: { w: Math.round(pr.width), h: Math.round(pr.height), ar: (pr.width / pr.height).toFixed(4) },
             img: { w: Math.round(ir.width), h: Math.round(ir.height) },
             fit: cs.objectFit, natural: { w: img.naturalWidth, h: img.naturalHeight } };
  });
  ok('右格比例 = 1:1（图已裁成 1200x1200）', Math.abs(imgBox.panel.ar - 1) < 0.01, `panel.ratio=${imgBox.panel.ar}`);
  ok('object-fit = contain（不裁原图）', imgBox.fit === 'contain', imgBox.fit);
  ok('图片为 1200x1200 且完整加载', imgBox.natural.w === 1200 && imgBox.natural.h === 1200,
     `${imgBox.natural.w}x${imgBox.natural.h}`);

  // ---- 交互：点击迸发 ----
  await p.locator('.niall-panel').click({ position: { x: 260, y: 320 } });
  // 瞬时包络不能判定方向：8 个 emoji 时长各异 + 0.06s 递增延迟，同一瞬间它们处在动画不同阶段。
  // 正确做法是跟踪同一批元素在两个时间点的**净位移**。
  await p.waitForTimeout(250);
  const posA = await p.evaluate(() => [...document.querySelectorAll('.niall-panel .niall-heart')]
    .map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y }; }));
  await p.waitForTimeout(1300);
  const burst = await p.evaluate((posA) => {
    const els = [...document.querySelectorAll('.niall-panel .niall-heart')];
    const now = els.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y }; });
    // 逐元素净位移（只比较两帧都在场的元素）
    let dy = [], dx = [];
    for (let i = 0; i < Math.min(posA.length, now.length); i++) {
      dy.push(posA[i].y - now[i].y); dx.push(Math.abs(now[i].x - posA[i].x));
    }
    const avg = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : 0;
    return { n: els.length,
             lens: [...new Set(els.map(e => [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(e.textContent)].length))],
             kinds: [...new Set(els.map(e => e.textContent))],
             avgRiseY: Math.round(avg(dy)), avgDriftX: Math.round(avg(dx)) };
  }, posA);
  ok('点击迸发 emoji', burst.n >= 7, `n=${burst.n}`);
  ok('迸发元素均为单个 emoji', burst.lens.every(l => l === 1), 'lengths=' + burst.lens.join(','));
  ok('迸发 emoji 是 🧡/🇮🇪 混合', burst.kinds.length === 2, JSON.stringify(burst.kinds));
  ok('迸发是温馨上浮（净上升 >> 横向漂移）', burst.avgRiseY > 60 && burst.avgDriftX < burst.avgRiseY * 0.6,
     `平均上升 ${burst.avgRiseY}px / 平均横漂 ${burst.avgDriftX}px`);
  await shoot(p, '.niall-bday-group', out + 'desktop-burst.png');
  await p.waitForTimeout(3200);
  ok('动画结束后节点清理干净', (await p.locator('.niall-heart').count()) === 0);

  await shoot(p, '.niall-bday-group', out + 'desktop.png');

  // 标题换行检查
  const hl = await p.evaluate(() => {
    const e = document.querySelector('.niall-headline'), r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    const panel = document.querySelector('.niall-panel').getBoundingClientRect();
    const bottom = document.querySelector('.niall-copy-bottom').getBoundingClientRect();
    return { lines: Math.round(r.height / parseFloat(cs.lineHeight)), h: Math.round(r.height),
             bottomGap: Math.round(bottom.top - r.bottom), panelBottomGap: Math.round(panel.bottom - bottom.bottom) };
  });
  ok('英文标题 2 行', hl.lines === 2, `lines=${hl.lines} h=${hl.h}px`);
  ok('标题与底部文案不重叠', hl.bottomGap > 20, `gap=${hl.bottomGap}px`);
  ok('底部文案在格内', hl.panelBottomGap > 0, `距格底=${hl.panelBottomGap}px`);

  // ---- 中文模式 ----
  await p.evaluate(() => localStorage.setItem('5guys1d.lang', 'zh'));
  await p.reload({ waitUntil: 'networkidle' });
  await p.waitForTimeout(900);
  const zh = await p.evaluate(() => ({
    hl: document.querySelector('.niall-headline .zh').textContent.trim(),
    vis: (() => { const r = document.querySelector('.niall-headline .zh').getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) }; })(),
    hlBox: (() => { const r = document.querySelector('.niall-headline').getBoundingClientRect(); return Math.round(r.height); })()
  }));
  ok('中文标题正确渲染', zh.hl === '奶儿船长生日快乐！' && zh.vis.w > 100, JSON.stringify(zh));
  await shoot(p, '.niall-bday-group', out + 'desktop-zh.png');

  // ---- 移动端 ----
  const mp = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  mp.on('pageerror', e => errs.push('mobile: ' + e.message));
  await mp.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle' });
  await mp.waitForTimeout(900);
  const m = await mp.evaluate(() => {
    const box = s => { const r = document.querySelector(s).getBoundingClientRect(); return { y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    return { left: box('.niall-panel'), right: box('.niall-photo-panel'), cw: document.documentElement.clientWidth,
             sw: document.documentElement.scrollWidth, hit: [...document.querySelectorAll('.niall-headline')].map(e => Math.round(e.getBoundingClientRect().height)) };
  });
  ok('移动端堆叠', m.right.y >= m.left.y + m.left.h - 1, `${m.left.y}+${m.left.h} -> ${m.right.y}`);
  ok('移动端右格满宽且为正方形', m.right.w === m.cw && Math.abs(m.right.h / m.right.w - 1) < 0.02, `${m.right.w}x${m.right.h}`);
  ok('移动端无横向溢出', m.sw <= m.cw + 1, `${m.sw}/${m.cw}`);
  await shoot(mp, '.niall-panel', out + 'mobile-text.png');
  await shoot(mp, '.niall-photo-panel', out + 'mobile-photo.png');

  ok('无 JS 报错', errs.length === 0, errs.join(' | ') || 'none');
  console.log(R.join('\n'));
  const f = R.filter(r => r.startsWith('FAIL'));
  console.log(`\nTOTAL: ${R.length - f.length}/${R.length} passed`);
  await browser.close(); process.exit(f.length ? 1 : 0);
})();
