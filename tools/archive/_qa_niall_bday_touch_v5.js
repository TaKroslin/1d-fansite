const { chromium } = require('playwright');

(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const R = [];
  const ok = (n, p, d) => R.push(`${p ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`);

  // ---------- A) 触屏路径（移动模拟 + 真实触摸）----------
  const ctx = await b.newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true
  });
  const p = await ctx.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push('mobile: ' + e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push('mobile console: ' + m.text()); });
  await p.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'domcontentloaded' });
  await p.evaluate(() => localStorage.setItem('5guys1d.lang', 'en'));
  await p.reload({ waitUntil: 'domcontentloaded' });
  // 站点有 html{scroll-behavior:smooth}，会让 scrollIntoView 变成动画、测量拿到中间态 -> 先关掉
  await p.addStyleTag({ content: 'html{scroll-behavior:auto !important}' });
  await p.waitForFunction(() => document.querySelector('.niall-photo-panel').classList.contains('faded'), null, { timeout: 15000 });
  await p.evaluate(() => document.querySelector('.niall-photo-panel').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await p.waitForTimeout(1500);

  // 移动端适配层是否生效
  const css = await p.evaluate(() => {
    const fig = document.querySelector('.niall-figure--right');
    const cs = getComputedStyle(fig);
    return { tapHighlight: cs.webkitTapHighlightColor, touchAction: cs.touchAction,
             panelTapHighlight: getComputedStyle(document.querySelector('.niall-photo-panel')).webkitTapHighlightColor,
             coarse: matchMedia('(pointer:coarse)').matches, noHover: matchMedia('(hover:none)').matches };
  });
  ok('移动端: tap-highlight 已关闭', /rgba\(0, 0, 0, 0\)|transparent/.test(css.tapHighlight), css.tapHighlight);
  ok('移动端: 面板层 tap-highlight 已关闭', /rgba\(0, 0, 0, 0\)|transparent/.test(css.panelTapHighlight), css.panelTapHighlight);
  ok('移动端: touch-action=manipulation', css.touchAction === 'manipulation', css.touchAction);
  ok('媒体查询命中触屏', css.coarse || css.noHover, `pointer:coarse=${css.coarse} hover:none=${css.noHover}`);

  // 触摸点击：贴纸动、不冒 emoji
  const tapLook = async () => p.evaluate(() => ({
    anim: [...document.querySelectorAll('.niall-figure')].filter(e => /is-(wiggle|pulse)/.test(e.className))
            .map(e => e.classList.contains('is-pulse') ? 'main' : ['top','left','right'].find(n => e.classList.contains('niall-figure--' + n))),
    emoji: document.querySelectorAll('.niall-photo-panel .niall-heart').length
  }));
  const centerPanel = async () => {
    await p.evaluate(() => document.querySelector('.niall-photo-panel').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForTimeout(300);
  };
  const tapAt = async (label, x, y, expectFig) => {
    await centerPanel();
    await p.evaluate(() => document.querySelectorAll('.niall-heart').forEach(e => e.remove()));
    const box = await p.locator('.niall-photo-panel').boundingBox();
    await p.touchscreen.tap(box.x + x, box.y + y);
    await p.waitForTimeout(220);
    const r = await tapLook();
    ok(`触摸·${label}`, r.anim.length === 1 && r.anim[0] === expectFig && r.emoji === 0,
       `动画=${JSON.stringify(r.anim)} emoji=${r.emoji}`);
    await p.waitForTimeout(1100);
  };
  // 用各贴纸在原图 1200 坐标下的**实测实体点**（bbox 中心对不规则形状可能是透明的）
  const K = 390 / 1200;   // 移动端：面板 390 / 原图 1200
  await tapAt('主人物', 613 * K, 707 * K, 'main');
  await tapAt('顶部小贴纸', 446 * K, 117 * K, 'top');
  await tapAt('左侧小贴纸', 205 * K, 425 * K, 'left');
  await tapAt('右侧小贴纸', 987 * K, 358 * K, 'right');

  // 触摸点空白 -> 冒 emoji
  await centerPanel();
  await p.evaluate(() => document.querySelectorAll('.niall-heart').forEach(e => e.remove()));
  const ebox = await p.locator('.niall-photo-panel').boundingBox();
  await p.touchscreen.tap(ebox.x + 30 * K, ebox.y + 300 * K);
  await p.waitForTimeout(250);
  const emptyTap = await p.evaluate(() => document.querySelectorAll('.niall-photo-panel .niall-heart').length);
  ok('触摸·点空白冒 emoji', emptyTap >= 3, `emoji=${emptyTap}`);

  // 左格触摸 -> 冒 emoji
  await p.evaluate(() => document.querySelector('.niall-panel').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await p.waitForTimeout(400);
  const lb = await p.locator('.niall-panel').boundingBox();
  await p.evaluate(() => document.querySelectorAll('.niall-heart').forEach(e => e.remove()));
  await p.touchscreen.tap(lb.x + 195, lb.y + 195);
  await p.waitForTimeout(250);
  const leftTap = await p.evaluate(() => document.querySelectorAll('.niall-panel .niall-heart').length);
  ok('触摸·左格冒 emoji', leftTap >= 3, `emoji=${leftTap}`);

  // 连续快速触摸 3 次，动画应仍在跑
  await p.evaluate(() => document.querySelector('.niall-photo-panel').scrollIntoView({ block: 'center', behavior: 'instant' }));
  await p.waitForTimeout(400);
  const pb2 = await p.locator('.niall-photo-panel').boundingBox();
  for (let i = 0; i < 3; i++) {
    await p.touchscreen.tap(pb2.x + 613 * K, pb2.y + 707 * K);
    await p.waitForTimeout(180);
  }
  const rapid = await p.evaluate(() => {
    const img = document.querySelector('.niall-figure--main img');
    const a = img.getAnimations ? img.getAnimations() : [];
    return { n: a.length, t: a.length ? Math.round(a[0].currentTime) : -1 };
  });
  ok('触摸·连点 3 次动画仍正常', rapid.n > 0 && rapid.t >= 0 && rapid.t < 1500, `动画数=${rapid.n} 进度=${rapid.t}ms`);

  await ctx.close();

  // ---------- B) 桌面路径回归（鼠标）----------
  const d = await b.newPage({ viewport: { width: 1440, height: 900 } });
  d.on('pageerror', e => errs.push('desktop: ' + e.message));
  d.on('console', m => { if (m.type() === 'error') errs.push('desktop console: ' + m.text()); });
  await d.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle' });
  await d.locator('.niall-bday-group').scrollIntoViewIfNeeded();
  await d.waitForFunction(() => document.querySelector('.niall-photo-panel').classList.contains('faded'), null, { timeout: 15000 });
  await d.waitForTimeout(1000);
  const db = await d.locator('.niall-photo-panel').boundingBox();
  const desk = await d.evaluate(() => {
    const fig = document.querySelector('.niall-figure--right');
    return { tapHighlight: getComputedStyle(fig).webkitTapHighlightColor,
             touchAction: getComputedStyle(fig).touchAction,
             coarse: matchMedia('(pointer:coarse)').matches };
  });
  ok('桌面未被触屏适配影响（仍是浏览器默认值）',
     !/rgba\(0, 0, 0, 0\)/.test(desk.tapHighlight) && desk.touchAction === 'auto' && !desk.coarse,
     `tapHighlight=${desk.tapHighlight} touchAction=${desk.touchAction} coarse=${desk.coarse}`);

  const deskLook = async () => d.evaluate(() => ({
    anim: [...document.querySelectorAll('.niall-figure')].filter(e => /is-(wiggle|pulse)/.test(e.className))
            .map(e => e.classList.contains('is-pulse') ? 'main' : ['top','left','right'].find(n => e.classList.contains('niall-figure--' + n))),
    emoji: document.querySelectorAll('.niall-photo-panel .niall-heart').length
  }));
  const mouseAt = async (label, x, y, expect) => {
    await d.evaluate(() => document.querySelectorAll('.niall-heart').forEach(e => e.remove()));
    await d.mouse.move(db.x + x, db.y + y);
    await d.mouse.down(); await d.mouse.up();
    await d.waitForTimeout(220);
    const r = await deskLook();
    ok(`桌面鼠标·${label}`, r.anim.length === 1 && r.anim[0] === expect && r.emoji === 0,
       `动画=${JSON.stringify(r.anim)} emoji=${r.emoji}`);
    await d.waitForTimeout(1100);
  };
  await mouseAt('主人物', 368, 425, 'main');
  await mouseAt('右侧小贴纸', 593, 215, 'right');
  await d.evaluate(() => document.querySelectorAll('.niall-heart').forEach(e => e.remove()));
  await d.mouse.click(db.x + 30, db.y + 300);
  await d.waitForTimeout(250);
  const deskEmpty = await d.evaluate(() => document.querySelectorAll('.niall-photo-panel .niall-heart').length);
  ok('桌面鼠标·点空白冒 emoji', deskEmpty >= 3, `emoji=${deskEmpty}`);
  const dl = await d.locator('.niall-panel').boundingBox();
  await d.evaluate(() => document.querySelectorAll('.niall-heart').forEach(e => e.remove()));
  await d.mouse.click(dl.x + 300, dl.y + 300);
  await d.waitForTimeout(250);
  const deskLeft = await d.evaluate(() => document.querySelectorAll('.niall-panel .niall-heart').length);
  ok('桌面鼠标·左格冒 emoji', deskLeft >= 3, `emoji=${deskLeft}`);

  ok('无 JS 报错', errs.length === 0, errs.join(' | ') || 'none');

  console.log(R.join('\n'));
  const f = R.filter(x => x.startsWith('FAIL'));
  console.log(`\nTOTAL: ${R.length - f.length}/${R.length} passed`);
  await b.close();
  process.exit(f.length ? 1 : 0);
})();
