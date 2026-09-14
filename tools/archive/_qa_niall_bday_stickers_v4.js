const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const R = []; const ok = (n, p, d) => R.push(`${p ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`);
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle' });
  await p.locator('.niall-photo-panel').scrollIntoViewIfNeeded();
  await p.waitForFunction(() => document.querySelector('.niall-photo-panel').classList.contains('faded'), null, { timeout: 15000 });
  await p.waitForTimeout(1400);
  const pb = await p.locator('.niall-photo-panel').boundingBox();

  const click = async (x, y) => {
    await p.evaluate(() => document.querySelectorAll('.niall-heart').forEach(e => e.remove()));
    await p.mouse.move(pb.x + x, pb.y + y);
    await p.mouse.down(); await p.mouse.up();
    await p.waitForTimeout(200);
    return p.evaluate(() => ({
      emoji: document.querySelectorAll('.niall-photo-panel .niall-heart').length,
      fig: [...document.querySelectorAll('.niall-figure')].filter(e => /is-(wiggle|pulse)/.test(e.className))
             .map(e => e.classList.contains('is-pulse') ? 'main' : (['top','left','right'].find(n => e.classList.contains('niall-figure--'+n)) || '?'))
    }));
  };

  // 1) 贴纸实体上：只动贴纸，不冒 emoji
  const onSticker = { top: [268, 70], left: [123, 255], right: [590, 215], main: [368, 425] };
  for (const [name, [x, y]] of Object.entries(onSticker)) {
    const r = await click(x, y);
    const expect = name === 'main' ? 'pulse' : 'wiggle';
    ok(`点 ${name} 实体：贴纸动、不冒 emoji`,
       r.fig.length === 1 && r.fig[0] === name && r.emoji === 0,
       `动画=${JSON.stringify(r.fig)} emoji=${r.emoji}` + (expect ? '' : ''));
    await p.waitForTimeout(1100);
  }

  // 2) 透明角落：应穿透，冒 emoji，贴纸不动
  // 实测所有贴纸 alpha 均为 0 的真空白点（原先我误把贴纸实体当成了透明角落）
  const transparent = [[30, 300], [700, 300], [400, 30], [700, 700], [60, 600], [650, 600]];
  let pass = 0, detail = [];
  for (const [x, y] of transparent) {
    const r = await click(x, y);
    const good = r.emoji > 0 && r.fig.length === 0;
    if (good) pass++;
    detail.push(`(${x},${y})${good ? '✓' : '✗'}`);
    await p.waitForTimeout(1200);
  }
  ok('点空白穿透到 panel（冒 emoji、贴纸不动）', pass === 6, `${pass}/6  ${detail.join(' ')}`);

  // 3) 命中区域应明显小于矩形 bbox
  const ratio = await p.evaluate(() => {
    const out = {};
    for (const c of ['main', 'top', 'left', 'right']) {
      const btn = document.querySelector('.niall-figure--' + c);
      const box = btn.getBoundingClientRect();
      const layer = document.querySelector('.niall-photo-panel');
      let inside = 0;
      // 用与页面相同的 alpha 判定：直接复用 canvas 采样
      const img = btn.querySelector('img');
      const cv = document.createElement('canvas'); cv.width = 150; cv.height = 150;
      const ctx = cv.getContext('2d'); ctx.drawImage(img, 0, 0, 150, 150);
      const d = ctx.getImageData(0, 0, 150, 150).data;
      let solid = 0;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 24) solid++;
      out[c] = { solidRatio: Math.round(solid / (150 * 150) * 100) };
    }
    return out;
  });
  ok('贴纸实体占自身矩形面积的比例（应远小于 100%）',
     ['main', 'top', 'left', 'right'].every(c => ratio[c].solidRatio < 90),
     Object.entries(ratio).map(([k, v]) => `${k}=${v.solidRatio}%`).join(' '));

  // 4) 连点不再互相打断：连点 3 次后动画仍在跑且进度小
  for (const [name, [x, y]] of [['main', [368, 425]], ['right', [590, 215]]]) {
    await p.mouse.move(pb.x + x, pb.y + y);
    await p.waitForTimeout(400);
    for (let i = 0; i < 3; i++) { await p.mouse.down(); await p.mouse.up(); await p.waitForTimeout(190); }
    const st = await p.evaluate(n => {
      const img = document.querySelector('.niall-figure--' + n).querySelector('img');
      const anims = img.getAnimations ? img.getAnimations() : [];
      return { n: anims.length, t: anims.length ? Math.round(anims[0].currentTime) : -1 };
    }, name);
    ok(`${name} 连点 3 次后动画仍在正常播放`, st.n > 0 && st.t >= 0 && st.t < 1500, `动画数=${st.n} 进度=${st.t}ms`);
    await p.waitForTimeout(1600);
  }

  // 5) 光标提示：贴纸上 pointer，空白 default
  await p.mouse.move(pb.x + 368, pb.y + 425); await p.waitForTimeout(150);
  const c1 = await p.evaluate(() => getComputedStyle(document.querySelector('.niall-figure--main')).cursor);
  await p.mouse.move(pb.x + 40, pb.y + 40); await p.waitForTimeout(150);
  const c2 = await p.evaluate(() => document.querySelectorAll('.niall-figure.is-on-sticker').length);
  ok('贴纸上显示 pointer', c1 === 'pointer', c1);
  ok('空白处不显示可点状态', c2 === 0, `is-on-sticker 数=${c2}`);

  ok('无 JS 报错', errs.length === 0, errs.join(' | ') || 'none');
  console.log(R.join('\n'));
  const f = R.filter(x => x.startsWith('FAIL'));
  console.log(`\nTOTAL: ${R.length - f.length}/${R.length} passed`);
  await b.close(); process.exit(f.length ? 1 : 0);
})();
