/* 小红书宣发 · 手机端真机截图（一次性脚本）
   与桌面版不同：这里用 390×844 视口整屏截图（不裁），保证每张都是"一屏手机"。
   跑：NODE_PATH=/opt/homebrew/lib/node_modules/openclaw/node_modules node tools/_qa_xhs_phone.js
*/
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '_qa_screenshots', 'xhs-928', 'raw');
const BASE = 'http://127.0.0.1:8000/index.html';

const TIME_SHIFT = () => {
  const OFFSET = 4 * 24 * 3600 * 1000;
  const R = Date;
  const D = function (...a) { return a.length ? new R(...a) : new R(R.now() + OFFSET); };
  D.prototype = R.prototype; D.now = () => R.now() + OFFSET;
  D.parse = R.parse; D.UTC = R.UTC;
  window.Date = D;
};

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
  });
  const page = await ctx.newPage();
  await page.addInitScript(TIME_SHIFT);
  await page.goto(BASE, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1500);
  // 滚一遍让 lazy 图全部加载
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y); await new Promise(r => setTimeout(r, 140));
    }
  });
  await page.evaluate(() => new Promise(res => {
    const pend = Array.from(document.images).filter(i => !i.complete);
    if (!pend.length) return res();
    let n = pend.length;
    const done = () => { if (--n <= 0) res(); };
    pend.forEach(i => { i.addEventListener('load', done, { once: true }); i.addEventListener('error', done, { once: true }); });
    setTimeout(res, 6000);
  }));
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation-duration:0s!important} .js .panel.fade-me{opacity:1!important}' });
  await page.waitForTimeout(500);

  const shots = [
    ['.larry-anniv-leader', 'm-leader.png'],
    ['.larry-pola', 'm-pola.png'],
    ['.larry-fanart', 'm-fanart.png'],
    ['.larry-928-special', 'm-928.png'],
  ];

  // ① 头图：从顶部整屏
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(OUT, 'm-hero.png') });
  console.log('✓ m-hero.png');

  for (const [sel, name] of shots) {
    const ok = await page.evaluate((s) => {
      const el = document.querySelector(s);
      if (!el) return false;
      el.scrollIntoView({ block: 'start' });
      return true;
    }, sel);
    if (!ok) { console.log('MISS', sel); continue; }
    await page.waitForTimeout(900);
    await page.screenshot({ path: path.join(OUT, name) });
    console.log('✓', name, await page.evaluate(() => Math.round(window.scrollY)));
  }

  // ② 照片墙：翻一张再截一张（左右箭头），拿"另一张牌"
  const nex = await page.$('.larry-pola-arrow--next');
  if (nex) {
    await page.evaluate(() => { const el = document.querySelector('.larry-pola'); el.scrollIntoView({ block: 'start' }); });
    await page.waitForTimeout(600);
    await nex.click({ force: true });
    await page.waitForTimeout(1400);
    await page.screenshot({ path: path.join(OUT, 'm-pola-2.png') });
    console.log('✓ m-pola-2.png');
  }

  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
