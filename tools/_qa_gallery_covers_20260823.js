// QA screenshots: gallery covers + new pages (2026-08-23)
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, '..', '_qa_screenshots', 'gallery-covers-20260823');
require('fs').mkdirSync(OUT, { recursive: true });

const BASE = 'http://127.0.0.1:8000';
const shots = [
  ['members-desktop', '/pages/gallery/members/index.html', 1280, 900, false],
  ['members-mobile', '/pages/gallery/members/index.html', 390, 844, true],
  ['harry-index-desktop', '/pages/gallery/members/harry/index.html', 1280, 900, false],
  ['checked-shirt-desktop', '/pages/gallery/members/harry/checked-shirt.html', 1280, 900, false],
  ['fiveguys-index-desktop', '/pages/gallery/members/five-guys/index.html', 1280, 900, false],
  ['costume-desktop', '/pages/gallery/members/five-guys/costume.html', 1280, 900, false],
];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const errors = [];
  for (const [name, url, w, h, mobile] of shots) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, isMobile: mobile });
    page.on('console', m => { if (m.type() === 'error') errors.push(`${name}: ${m.text()}`); });
    page.on('pageerror', e => errors.push(`${name}: ${e.message}`));
    const resp = await page.goto(BASE + url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: false });
    console.log(`${name}: HTTP ${resp.status()}`);
    await page.close();
  }
  // programmatic checks on members index
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + '/pages/gallery/members/index.html', { waitUntil: 'networkidle' });
  const cards = await page.$$eval('.panel.gallery-cover', els => els.map(e => ({
    cls: e.className.replace(/panel gallery-cover ?/, ''),
    bg: e.querySelector('.bg').style.backgroundImage.slice(0, 90),
    count: e.querySelector('.count span') && e.querySelector('.count span').textContent,
    href: e.querySelector('a.more') && e.querySelector('a.more').getAttribute('href'),
  })));
  console.log(JSON.stringify(cards, null, 1));
  // slideshow renders all slides?
  await page.goto(BASE + '/pages/gallery/members/harry/checked-shirt.html', { waitUntil: 'networkidle' });
  const n = await page.$$eval('#slideshow div.slide', els => els.length);
  const badBg = await page.$$eval('#slideshow div.slide .bg', els => els.filter(e => !getComputedStyle(e).backgroundImage.includes('checked-shirt')).length);
  console.log(`checked-shirt slides=${n} badBg=${badBg}`);
  await browser.close();
  if (errors.length) { console.log('CONSOLE ERRORS:'); errors.forEach(e => console.log(' ', e)); }
  else console.log('no console/page errors');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
