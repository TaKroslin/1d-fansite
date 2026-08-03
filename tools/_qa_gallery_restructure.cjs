// QA: gallery restructure — screenshot gallery.html + 5 sub pages
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const REPO = path.resolve(__dirname, '..');
const OUT = path.join(REPO, 'tools', '_qa_screenshots', 'gallery');
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'http://127.0.0.1:8000';
const URLS = [
  ['gallery-home', '/pages/gallery.html'],
  ['members', '/pages/gallery/members/index.html'],
  ['on-stage', '/pages/gallery/on-stage/index.html'],
  ['behind-the-scenes', '/pages/gallery/behind-the-scenes/index.html'],
  ['press', '/pages/gallery/press/index.html'],
  ['fan-art', '/pages/gallery/fan-art/index.html'],
];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];

  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE: ' + m.text()); });

  for (const [name, p] of URLS) {
    const resp = await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(1200);
    await page.screenshot({ path: path.join(OUT, name + '_desktop.png') });
    console.log(`${name}: status=${resp.status()}`);
  }

  // mobile
  const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const pageM = await ctxM.newPage();
  const respM = await pageM.goto(BASE + '/pages/gallery.html', { waitUntil: 'networkidle', timeout: 20000 });
  await pageM.waitForTimeout(1200);
  await pageM.screenshot({ path: path.join(OUT, 'gallery-home_mobile.png') });
  console.log(`gallery-home mobile: status=${respM.status()}`);

  console.log('JS errors:', errors.length ? errors : 'none');
  await browser.close();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
