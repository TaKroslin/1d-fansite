/* 一次性探针：量出 9-28 前 / 后两套版式里每个可见板块的几何位置，供小红书截图切片用。 */
const { chromium } = require('playwright-core');

const SEL = [
  '.larry-cd', '.larry-cd-stage', '.larry-cd-logo', '.larry-cd-main', '.larry-cd-clock', '.larry-cd-script',
  '.panel.hero.four', '.larry-hero-tagline',
  '#sticky', '#nav',
  '.larry-anniv-leader', '.larry-leader--blue', '.larry-leader--green',
  '.larry-pola', '.larry-pola-view', '.larry-pola-track',
  '.larry-fanart', '.larry-fan-grid',
  '.larry-928-special', '.larry-928-card',
  '.larry-before-blue', '.larry-before-green', '.homepage-video'
];

async function probe(page) {
  return page.evaluate((sel) => {
    const out = { docHeight: document.documentElement.scrollHeight, es: [] };
    for (const s of sel) {
      const el = document.querySelector(s);
      if (!el) { out.es.push({ s, missing: true }); continue; }
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      out.es.push({
        s, x: Math.round(r.x), y: Math.round(r.y + window.scrollY),
        w: Math.round(r.width), h: Math.round(r.height),
        display: cs.display, vis: cs.visibility
      });
    }
    return out;
  }, SEL);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();

  await page.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  console.log('=== BEFORE (live, 2026-09-25) ===');
  console.log(JSON.stringify(await probe(page), null, 1));

  await page.addInitScript(() => {
    const OFFSET = 4 * 24 * 3600 * 1000;
    const R = Date;
    const D = function (...a) { return a.length ? new R(...a) : new R(R.now() + OFFSET); };
    D.prototype = R.prototype; D.now = () => R.now() + OFFSET;
    D.parse = R.parse; D.UTC = R.UTC;
    window.Date = D;
  });
  await page.goto('http://127.0.0.1:8000/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  console.log('=== AFTER (simulated 2026-09-29) ===');
  console.log(JSON.stringify(await probe(page), null, 1));
  console.log('htmlClass=', await page.evaluate(() => document.documentElement.className));
  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
