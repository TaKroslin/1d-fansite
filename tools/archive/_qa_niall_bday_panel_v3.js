const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ channel: 'chrome' });
  const out = 'tools/_qa_screenshots/niall-bday-v4-20260914/';
  const R = []; const ok = (n, p, d) => R.push(`${p ? 'PASS' : 'FAIL'}  ${n}${d ? '  -> ' + d : ''}`);
  const p = await b.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => localStorage.setItem('5guys1d.lang', 'en'));
  await p.reload({ waitUntil: 'networkidle' });
  await p.locator('.niall-photo-panel').scrollIntoViewIfNeeded();
  await p.waitForFunction(() => document.querySelector('.niall-photo-panel').classList.contains('faded')
    && parseFloat(getComputedStyle(document.querySelector('.niall-photo-panel')).opacity) > 0.999, null, { timeout: 15000 });
  await p.waitForTimeout(600);

  // 1) 几何：按钮满格，图片 1:1（不再被压进小框）
  const g = await p.evaluate(() => {
    const pb = document.querySelector('.niall-photo-panel').getBoundingClientRect();
    const out = { panel: [Math.round(pb.width), Math.round(pb.height)], figs: {} };
    for (const c of ['main', 'top', 'left', 'right']) {
      const el = document.querySelector('.niall-figure--' + c);
      const r = el.getBoundingClientRect();
      const img = el.querySelector('img').getBoundingClientRect();
      out.figs[c] = { box: [Math.round(r.width), Math.round(r.height)], img: [Math.round(img.width), Math.round(img.height)],
                      clip: getComputedStyle(el).clipPath, z: getComputedStyle(el).zIndex };
    }
    out.heartsZ = getComputedStyle(document.querySelector('.niall-photo-panel .niall-hearts')).zIndex;
    return out;
  });
  ok('面板为正方形 720x720', g.panel[0] === 720 && g.panel[1] === 720, g.panel.join('x'));
  const allFull = Object.values(g.figs).every(f => f.box[0] === 720 && f.box[1] === 720 && f.img[0] === 720 && f.img[1] === 720);
  ok('4 个按钮均满格且图片 1:1（位置不再被压偏）', allFull,
     Object.entries(g.figs).map(([k, v]) => `${k}:${v.box}=img${v.img}`).join(' '));
  ok('每个按钮都有 clip-path 点击区', Object.values(g.figs).every(f => /inset/.test(f.clip)),
     Object.entries(g.figs).map(([k, v]) => k + '=' + v.clip.replace(/\s+/g, '')).join(' '));
  ok('emoji 图层在最顶（z=6 > 人物 3/4）', +g.heartsZ > 4, `hearts z=${g.heartsZ}, main z=${g.figs.main.z}, sm z=${g.figs.top.z}`);

  // 2) 位置还原：截图 vs canvas 合成
  const bb = await p.locator('.niall-photo-panel').boundingBox();
  const off = await p.evaluate(() => ({ x: scrollX, y: scrollY }));
  await p.screenshot({ path: out + 'photo-panel.png', fullPage: true,
    clip: { x: Math.round(bb.x + off.x), y: Math.round(bb.y + off.y), width: 720, height: 720 } });
  await p.evaluate(() => document.querySelectorAll('.niall-float').forEach(e => e.style.animationPlayState = 'paused'));
  const comp = await p.evaluate(async () => {
    const srcs = ['.niall-photo', '.niall-figure--main img', '.niall-figure--top img', '.niall-figure--left img', '.niall-figure--right img']
      .map(s => document.querySelector(s).getAttribute('src'));
    const c = document.createElement('canvas'); c.width = 1200; c.height = 1200;
    const ctx = c.getContext('2d');
    for (const s of srcs) {
      const bmp = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
      ctx.drawImage(bmp, 0, 0, 1200, 1200);
    }
    return c.toDataURL('image/png');
  });
  require('fs').writeFileSync('/tmp/stacked.png', Buffer.from(comp.split(',')[1], 'base64'));
  await p.evaluate(() => document.querySelectorAll('.niall-float').forEach(e => e.style.animationPlayState = ''));

  // 3) 点空白 -> 冒 emoji（先清掉常驻飘心，只看 burst）
  const countBurst = () => p.evaluate(() => {
    const els = [...document.querySelectorAll('.niall-photo-panel .niall-heart')];
    return { n: els.length, kinds: [...new Set(els.map(e => e.textContent))] };
  });
  await p.mouse.click(bb.x + 680, bb.y + 680); // 实测空白点（避开全部 4 个贴纸）
  await p.waitForTimeout(220);
  const c1 = await countBurst();
  ok('点空白冒 emoji', c1.n >= 3, `n=${c1.n}`);
  ok('一次点击只有一种 emoji', c1.kinds.length === 1, JSON.stringify(c1.kinds));
  ok('数量收敛（3–5 颗）', c1.n >= 3 && c1.n <= 5, `n=${c1.n}`);
  const first = c1.kinds[0];
  await p.waitForTimeout(3400);
  await p.mouse.click(bb.x + 680, bb.y + 680);
  await p.waitForTimeout(220);
  const c2 = await countBurst();
  ok('第二次点击换成另一种 emoji（交替）', c2.kinds.length === 1 && c2.kinds[0] !== first,
     `第1次=${first}  第2次=${c2.kinds[0]}`);
  await p.waitForTimeout(3400);
  await p.mouse.click(bb.x + 680, bb.y + 680);
  await p.waitForTimeout(220);
  const c3 = await countBurst();
  ok('第三次又回到第一种（严格交替）', c3.kinds[0] === first, `第3次=${c3.kinds[0]}`);

  // 4) 点贴纸 -> 只动贴纸，不冒 emoji
  await p.waitForTimeout(3400);
  // 坐标按 720 面板重算：面板 = 原图 1200 的 0.6 倍，取各 bbox 中心
  const hits = { main: [368, 425], top: [268, 70], left: [123, 255], right: [593, 215] };
  for (const [name, [x, y]] of Object.entries(hits)) {
    const before = await p.locator('.niall-photo-panel .niall-heart').count();
    await p.mouse.click(bb.x + x, bb.y + y);
    await p.waitForTimeout(200);
    const st = await p.evaluate(n => {
      const el = document.querySelector('.niall-figure--' + n);
      return { cls: el.className, anim: getComputedStyle(el).animationName };
    }, name);
    const after = await p.locator('.niall-photo-panel .niall-heart').count();
    const expect = name === 'main' ? 'niall-pulse' : 'niall-wiggle';
    ok(`点 ${name}：贴纸动起来（${expect}）且不冒 emoji`, st.anim === expect && after - before === 0,
       `anim=${st.anim} emoji新增=${after - before}`);
    await p.waitForTimeout(900);
  }

  // 5) 点贴纸外面一点点（clip 掉的区域）应穿透到 panel
  await p.waitForTimeout(2600);
  const beforeOut = await p.locator('.niall-photo-panel .niall-heart').count();
  await p.mouse.click(bb.x + 680, bb.y + 680);  // 实测空白点
  await p.waitForTimeout(220);
  const afterOut = await p.locator('.niall-photo-panel .niall-heart').count();
  ok('空白区域点击穿透到 panel 并冒 emoji', afterOut - beforeOut >= 3, `新增 ${afterOut - beforeOut}`);

  ok('无 JS 报错', errs.length === 0, errs.join(' | ') || 'none');
  console.log(R.join('\n'));
  const f = R.filter(x => x.startsWith('FAIL'));
  console.log(`\nTOTAL: ${R.length - f.length}/${R.length} passed`);
  await b.close(); process.exit(f.length ? 1 : 0);
})();
