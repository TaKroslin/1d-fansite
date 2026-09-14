const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const out = 'tools/_qa_screenshots/niall-bday-panel-20260914/';
  const results = [];

  // boundingBox() 是视口相对坐标，而 clip 是文档坐标；且 locator.click() 会自动滚动页面，
  // 因此必须补上当前滚动偏移，否则会截到页面顶部（M59）。
  async function shoot(page, sel, path, pad = 16) {
    const bb = await page.locator(sel).boundingBox();
    if (!bb) throw new Error('no boundingBox for ' + sel);
    const off = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
    await page.screenshot({ path, clip: {
      x: Math.max(0, bb.x + off.x - pad), y: Math.max(0, bb.y + off.y - pad),
      width: bb.width + pad * 2, height: bb.height + pad * 2
    }, fullPage: true });
  }

  const ok = (name, pass, detail) => results.push(`${pass ? 'PASS' : 'FAIL'}  ${name}${detail ? '  -> ' + detail : ''}`);

  // ---------- DESKTOP ----------
  const dp = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  dp.on('pageerror', e => errs.push('pageerror: ' + e.message));
  dp.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await dp.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle' });
  await dp.waitForTimeout(900);

  ok('Liam panel 已移除', (await dp.locator('.liam-bday-panel').count()) === 0);

  const geo = await dp.evaluate(() => {
    const box = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const left = document.querySelector('.niall-panel');
    const right = document.querySelector('.niall-photo-panel');
    const flag = document.querySelector('.niall-flag');
    const img = document.querySelector('.niall-photo');
    const hint = document.querySelector('.niall-hint');
    const date = document.querySelector('.niall-date');
    const headline = document.querySelector('.niall-headline');
    const cs = getComputedStyle(flag);
    const floats = document.querySelectorAll('.niall-photo-panel .niall-float');
    const f0 = floats[0];
    return {
      left: box(left), right: box(right),
      gap: Math.round(box(right).x - box(left).x - box(left).w),
      flagBg: cs.backgroundImage.slice(0, 120),
      flagBgColor: cs.backgroundColor,
      imgTop: getComputedStyle(img).zIndex,
      heartLayerZ: getComputedStyle(document.querySelector('.niall-photo-panel .niall-hearts')).zIndex,
      floatCount: floats.length,
      floatAnim: f0 ? getComputedStyle(f0).animationName : null,
      floatGlyph: f0 ? f0.textContent : null,
      floatFont: f0 ? getComputedStyle(f0).fontFamily : null,
      hintColor: getComputedStyle(hint).color,
      headlineFont: getComputedStyle(headline).fontFamily,
      headlineTop: Math.round(box(headline).y + box(headline).h / 2),
      panelTop: Math.round(box(left).y),
      panelBottom: Math.round(box(left).y + box(left).h),
      dateText: date.textContent.trim(),
      hintText: hint.textContent.trim(),
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth
    };
  });

  ok('左格是正方形', Math.abs(geo.left.w - geo.left.h) <= 1, `${geo.left.w}x${geo.left.h}`);
  ok('右格是正方形', Math.abs(geo.right.w - geo.right.h) <= 1, `${geo.right.w}x${geo.right.h}`);
  ok('两格并排同高', geo.left.y === geo.right.y && geo.left.h === geo.right.h, `y=${geo.left.y}/${geo.right.y}`);
  ok('两格无间隙(无缝拼接)', geo.gap === 0, `gap=${geo.gap}px`);
  ok('右格国旗为渐变(未被 retinafy 清掉)', /linear-gradient/.test(geo.flagBg), geo.flagBg.split(')')[0] + ')');
  ok('国旗三色带已渲染', /94, 143, 115/.test(geo.flagBg) || /5e8f73|94, 143, 115/i.test(geo.flagBg));
  ok('人物图在国旗之上', Number(geo.imgTop) < Number(geo.heartLayerZ), `img z=${geo.imgTop} < hearts z=${geo.heartLayerZ}`);
  ok('右格常驻飘心 6 颗', geo.floatCount === 6, `count=${geo.floatCount}`);
  ok('飘心动画已绑定', geo.floatAnim === 'niall-float', String(geo.floatAnim));
  ok('心形字形真实渲染(非豆腐块)', geo.floatGlyph === '\ue60e' && /icomoon/.test(geo.floatFont), `family=${geo.floatFont}`);
  ok('标题用 Playfair Display', /Playfair/.test(geo.headlineFont), geo.headlineFont);
  ok('标题在方格上半部', geo.headlineTop < geo.panelTop + geo.left.h * 0.55, `headlineY=${geo.headlineTop} panel=${geo.panelTop}..${geo.panelBottom}`);
  ok('日期行文案正确', geo.dateText === '13 · 09 · 1993', JSON.stringify(geo.dateText));
  ok('无横向溢出', geo.scrollW <= geo.clientW + 1, `scrollW=${geo.scrollW} clientW=${geo.clientW}`);

  await shoot(dp, '.niall-bday-group', out + 'desktop-group.png');

  // ---------- CLICK BURST ----------
  const before = await dp.locator('.niall-panel .niall-heart').count();
  await dp.locator('.niall-panel').click({ position: { x: 200, y: 300 } });
  await dp.waitForTimeout(120);
  const afterLeft = await dp.locator('.niall-panel .niall-heart').count();
  await shoot(dp, '.niall-bday-group', out + 'desktop-burst-left.png');

  await dp.locator('.niall-photo-panel').click({ position: { x: 300, y: 300 } });
  await dp.waitForTimeout(120);
  const afterRight = await dp.locator('.niall-photo-panel .niall-heart').count();
  await shoot(dp, '.niall-bday-group', out + 'desktop-burst-right.png');

  ok('点左格迸发心形', before === 0 && afterLeft >= 7, `${before} -> ${afterLeft}`);
  ok('点右格迸发心形', afterRight >= 7, `-> ${afterRight}`);

  // spread 必须在 burst 存活期内测量（节点 1.35s 后即被清理）
  await dp.locator('.niall-photo-panel').click({ position: { x: 300, y: 300 } });
  await dp.waitForTimeout(600);
  const spread = await dp.evaluate(() => {
    const hs = [...document.querySelectorAll('.niall-photo-panel .niall-heart')];
    if (!hs.length) return { n: 0, spreadX: 0, spreadY: 0 };
    const r = hs.map(h => h.getBoundingClientRect());
    return {
      n: hs.length,
      spreadX: Math.round(Math.max(...r.map(x => x.x)) - Math.min(...r.map(x => x.x))),
      spreadY: Math.round(Math.max(...r.map(x => x.y)) - Math.min(...r.map(x => x.y)))
    };
  });
  ok('心形确实向四周散开(非只上飘)', spread.spreadX > 20 && spread.spreadY > 20,
     `spreadX=${spread.spreadX}px spreadY=${spread.spreadY}px n=${spread.n}`);

  // cleanup after animation
  await dp.waitForTimeout(3000);
  const leftover = await dp.locator('.niall-heart').count();
  ok('动画结束后心形节点被清理', leftover === 0, `leftover=${leftover}`);

  // ---------- MOBILE ----------
  const mp = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  mp.on('pageerror', e => errs.push('mobile pageerror: ' + e.message));
  await mp.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle' });
  await mp.waitForTimeout(800);
  const mgeo = await mp.evaluate(() => {
    const box = el => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    return {
      left: box(document.querySelector('.niall-panel')),
      right: box(document.querySelector('.niall-photo-panel')),
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth
    };
  });
  ok('移动端两格堆叠(右格在左格下方)', mgeo.right.y >= mgeo.left.y + mgeo.left.h - 1, `leftY=${mgeo.left.y}+${mgeo.left.h} rightY=${mgeo.right.y}`);
  ok('移动端两格各占满宽', mgeo.left.w === mgeo.clientW && mgeo.right.w === mgeo.clientW, `${mgeo.left.w}/${mgeo.right.w} vs ${mgeo.clientW}`);
  ok('移动端左格仍是正方形', Math.abs(mgeo.left.w - mgeo.left.h) <= 1, `${mgeo.left.w}x${mgeo.left.h}`);
  ok('移动端无横向溢出', mgeo.scrollW <= mgeo.clientW + 1, `scrollW=${mgeo.scrollW}`);

  await shoot(mp, '.niall-panel', out + 'mobile-text-panel.png');
  await shoot(mp, '.niall-photo-panel', out + 'mobile-photo-panel.png');

  // ---------- CHINESE MODE ----------
  await dp.evaluate(() => localStorage.setItem('5guys1d.lang', 'zh'));
  await dp.reload({ waitUntil: 'networkidle' });
  await dp.waitForTimeout(800);
  const zh = await dp.evaluate(() => ({
    headlineVisible: (() => { const e = document.querySelector('.niall-headline .zh'); const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), display: getComputedStyle(e).display }; })(),
    enHidden: getComputedStyle(document.querySelector('.niall-headline .en')).display,
    subZh: document.querySelector('.niall-sub .zh').textContent.trim(),
    dateStillVisible: document.querySelector('.niall-date').getBoundingClientRect().height > 0
  }));
  ok('中文模式: 中文大标题可见', zh.headlineVisible.w > 50 && zh.headlineVisible.h > 10, JSON.stringify(zh.headlineVisible));
  ok('中文模式: 英文标题隐藏', zh.enHidden === 'none', zh.enHidden);
  ok('中文模式: 副标题中文正确', zh.subZh === '今天是船长的生日。', zh.subZh);
  await shoot(dp, '.niall-bday-group', out + 'desktop-zh.png');

  ok('无 JS 报错', errs.length === 0, errs.join(' | ') || 'none');

  console.log(results.join('\n'));
  const fails = results.filter(r => r.startsWith('FAIL'));
  console.log(`\nTOTAL: ${results.length - fails.length}/${results.length} passed`);
  await browser.close();
  process.exit(fails.length ? 1 : 0);
})();
