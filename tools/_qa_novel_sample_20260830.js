// QA screenshots: blog novel entry + hub + chapter reading sample (2026-08-30)
const { chromium } = require('playwright');
const path = require('path');
const OUT = path.join(__dirname, '_qa_screenshots', 'novel-sample-20260830');
require('fs').mkdirSync(OUT, { recursive: true });

const BASE = 'http://127.0.0.1:8000';
const shots = [
  ['blog-entry-desktop', '/pages/blog.html', 1280, 1200, false],
  ['hub-desktop', '/pages/blog/the-only-direction-home/index.html', 1280, 1200, false],
  ['chapter-desktop', '/pages/blog/the-only-direction-home/chapters/00-prologue/index.html', 1280, 900, false],
  ['chapter-desktop-scrolled', '/pages/blog/the-only-direction-home/chapters/00-prologue/index.html', 1280, 900, false, 1400],
  ['chapter-mobile', '/pages/blog/the-only-direction-home/chapters/00-prologue/index.html', 390, 844, true],
];

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const errors = [];
  for (const [name, url, w, h, mobile, scrollY] of shots) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, isMobile: mobile });
    page.on('console', m => { if (m.type() === 'error') errors.push(`${name}: ${m.text()}`); });
    page.on('pageerror', e => errors.push(`${name}: ${e.message}`));
    const resp = await page.goto(BASE + url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    if (scrollY) await page.evaluate(y => window.scrollTo(0, y), scrollY);
    await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: !mobile });
    console.log(`${name}: HTTP ${resp.status()}`);
    await page.close();
  }

  // Programmatic checks
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  // 1. blog entry card is first square card, links to hub
  await page.goto(BASE + '/pages/blog.html', { waitUntil: 'networkidle' });
  const blogInfo = await page.$$eval('.blog-section .panel-group .panel.journal-news.homepage-news', els => els.map((e, i) => ({
    i, href: (e.querySelector('a.more') || {}).getAttribute ? e.querySelector('a.more').getAttribute('href') : null,
    novel: e.getAttribute('class'),
  })));
  console.log('first blog card:', JSON.stringify(blogInfo[0]));

  // 2. hub chapter cards render + links
  await page.goto(BASE + '/pages/blog/the-only-direction-home/index.html', { waitUntil: 'networkidle' });
  const hub = await page.$$eval('.blog-section .panel.journal-news.homepage-news', els => els.map(e => ({
    cls: e.getAttribute('class'),
    href: e.querySelector('a.more') ? e.querySelector('a.more').getAttribute('href') : null,
  })));
  console.log('hub cards:', JSON.stringify(hub));

  // 3. chapter page: catalog sticky + active marker + chapter-nav above back-to-top
  await page.goto(BASE + '/pages/blog/the-only-direction-home/chapters/00-prologue/index.html', { waitUntil: 'networkidle' });
  const ch = await page.evaluate(() => {
    const pos = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; };
    const cs = getComputedStyle(document.querySelector('.novel-catalog'));
    return {
      catalog: pos('.novel-catalog'),
      catalogSticky: cs.position,
      catalogTop: cs.top,
      activeCount: document.querySelectorAll('.novel-catalog li.active').length,
      activeText: (document.querySelector('.novel-catalog li.active a') || {}).textContent,
      chapterNav: pos('.chapter-nav'),
      backToTop: pos('#back-to-top'),
      navAboveTop: document.querySelector('.chapter-nav').getBoundingClientRect().bottom < document.querySelector('#back-to-top').getBoundingClientRect().top,
      catalogRightOfText: document.querySelector('.novel-catalog').getBoundingClientRect().x > document.querySelector('.article-holder').getBoundingClientRect().x,
    };
  });
  console.log('chapter layout:', JSON.stringify(ch, null, 1));

  await browser.close();
  if (errors.length) { console.log('CONSOLE ERRORS:'); errors.forEach(e => console.log(' ', e)); }
  else console.log('no console/page errors');
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });