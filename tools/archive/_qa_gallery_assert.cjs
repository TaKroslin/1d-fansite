// QA: gallery restructure — DOM layout assertions (no screenshots)
const { chromium } = require('playwright');
const path = require('path');
const REPO = path.resolve(__dirname, '..');

const BASE = 'http://127.0.0.1:8000';
const URLS = [
  ['gallery-home', '/pages/gallery.html', 5],      // 5 covers + 1 moment (moment is not gallery-cover)
  ['members', '/pages/gallery/members/index.html', 6],
  ['on-stage', '/pages/gallery/on-stage/index.html', 4],
  ['behind-the-scenes', '/pages/gallery/behind-the-scenes/index.html', 4],
  ['press', '/pages/gallery/press/index.html', 4],
  ['fan-art', '/pages/gallery/fan-art/index.html', 3],
];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const fails = [];
  const notFound = new Set();

  page.on('response', (r) => { if (r.status() === 404) notFound.add(r.url()); });

  for (const [name, p, expectCovers] of URLS) {
    await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(800);

    const covers = await page.locator('.panel.gallery-cover').count();
    const counts = await page.locator('.panel.gallery-cover .count').count();
    const h2s = await page.locator('.panel.gallery-cover .panel-content h2').count();
    const moreBtns = await page.locator('.panel.gallery-cover .info a.more').count();
    const bgCount = await page.locator('.panel.gallery-cover .bg').count();
    const leftoverGroups = await page.locator('.panel-group').count();

    // layout: duo mode -> official .panel is 2:1 (width:100%, padding-top:50%), one per row
    const w = await page.locator('.panel.gallery-cover').first().evaluate((el) => el.getBoundingClientRect().width);
    const h = await page.locator('.panel.gallery-cover').first().evaluate((el) => el.getBoundingClientRect().height);
    const x = await page.locator('.panel.gallery-cover').first().evaluate((el) => el.getBoundingClientRect().x);
    const ratioOk = Math.abs(w - 2 * h) / (2 * h) < 0.05;
    const onePerRow = x < 1; // starts at left edge, no 2nd column

    const ok = covers === expectCovers && counts === expectCovers && h2s === expectCovers
      && moreBtns === expectCovers && bgCount === expectCovers && leftoverGroups === 0 && ratioOk && onePerRow;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${name}: covers=${covers}/${expectCovers} counts=${counts} h2=${h2s} more=${moreBtns} bg=${bgCount} panel-group=${leftoverGroups} ratio2:1(${Math.round(w)}x${Math.round(h)})=${ratioOk} row1(x=${Math.round(x)})=${onePerRow}`);
    if (!ok) fails.push(name);
  }

  // mobile: mono mode -> official .panel is 1:1, full width
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(BASE + '/pages/gallery.html', { waitUntil: 'networkidle', timeout: 20000 });
  await m.waitForTimeout(800);
  const mw = await m.locator('.panel.gallery-cover').first().evaluate((el) => el.getBoundingClientRect().width);
  const mh = await m.locator('.panel.gallery-cover').first().evaluate((el) => el.getBoundingClientRect().height);
  const mSquare = Math.abs(mw - mh) / Math.max(mw, mh) < 0.05;
  console.log(`${mSquare ? 'PASS' : 'FAIL'} gallery-home mobile: cover ${Math.round(mw)}x${Math.round(mh)} square=${mSquare}`);

  console.log('--- 404 resources ---');
  notFound.forEach((u) => console.log('404:', u.replace(BASE, '')));
  console.log(fails.length ? `FAILS: ${fails.join(', ')}` : 'ALL PASS');
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
