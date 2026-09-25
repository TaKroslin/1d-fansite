/* 小红书宣发截图抓取（一次性脚本）
   产出 raw 图到 tools/_qa_screenshots/xhs-928/raw/
   - before 套（9-28 前，真实当前状态：倒计时）
   - after  套（把 Date 前移 4 天，模拟 9-28 后）
   运行：NODE_PATH=/opt/homebrew/lib/node_modules/openclaw/node_modules node tools/_qa_xhs_capture.js
*/
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '_qa_screenshots', 'xhs-928', 'raw');
const BASE = 'http://127.0.0.1:8000/index.html';
const DSF = 1.25;   // 1440 * 1.5 = 2160 宽，PIL 再降到 1080 更锐利

const TIME_SHIFT = () => {
  const OFFSET = 4 * 24 * 3600 * 1000;
  const R = Date;
  const D = function (...a) { return a.length ? new R(...a) : new R(R.now() + OFFSET); };
  D.prototype = R.prototype; D.now = () => R.now() + OFFSET;
  D.parse = R.parse; D.UTC = R.UTC;
  window.Date = D;
};

async function settle(page) {
  // 兜掉 waypoints 淡入 / 图片懒加载 / 字体
  await page.evaluate(async () => {
    const step = Math.round(window.innerHeight * 0.6);
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise(r => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise(r => setTimeout(r, 400));
  });
  // 注意：img.decode() 对未进入视口的 lazy 图会永远 pending，不能 await（会把脚本挂死）
  await page.evaluate(() => new Promise(res => {
    const pend = Array.from(document.images).filter(i => !i.complete);
    if (!pend.length) return res();
    let n = pend.length;
    const done = () => { if (--n <= 0) res(); };
    pend.forEach(i => { i.addEventListener('load', done, { once: true }); i.addEventListener('error', done, { once: true }); });
    setTimeout(res, 6000);
  }));
  // 停掉 fade-me / 任何 opacity 过渡，截图不要半透明
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation-duration:0s!important} .js .panel.fade-me{opacity:1!important}' });
  await page.waitForTimeout(600);
}

async function fullShot(ctx, name, init) {
  const page = await ctx.newPage();
  if (init) await page.addInitScript(init);
  await page.goto(BASE, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1200);
  await settle(page);
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  await page.setViewportSize({ width: 1440, height: Math.min(h, 30000) });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT, name), fullPage: true });
  console.log(name, 'height=', h, 'htmlClass=', await page.evaluate(() => document.documentElement.className));
  await page.close();
  return h;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  // ---------- BEFORE ----------
  const ctxB = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: DSF });
  await fullShot(ctxB, 'before-full.png', null);

  // before 首屏（窗口高 1920 = 2×960，正好覆盖倒计时 panel 的 720px + 露出下一段）
  const p1 = await ctxB.newPage();
  await p1.goto(BASE, { waitUntil: 'load', timeout: 30000 });
  await p1.waitForTimeout(1500);
  await settle(p1);
  await p1.screenshot({ path: path.join(OUT, 'before-hero.png') });
  await p1.close();

  // before 桌面首屏（更真实的"打开网站第一眼"）
  const ctxB2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: DSF });
  const p2 = await ctxB2.newPage();
  await p2.goto(BASE, { waitUntil: 'load', timeout: 30000 });
  await p2.waitForTimeout(1500);
  await settle(p2);
  await p2.screenshot({ path: path.join(OUT, 'before-firstscreen.png') });
  await p2.close();
  await ctxB2.close();

  // ---------- AFTER ----------
  const ctxA = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: DSF });
  await fullShot(ctxA, 'after-full.png', TIME_SHIFT);

  // after polaroid 墙单独一屏（滚动到该 panel 顶部）
  const pa = await ctxA.newPage();
  await pa.addInitScript(TIME_SHIFT);
  await pa.goto(BASE, { waitUntil: 'load', timeout: 30000 });
  await pa.waitForTimeout(1500);
  await settle(pa);
  await pa.evaluate(() => { const el = document.querySelector('.larry-pola'); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY); });
  await pa.waitForTimeout(1500);
  await pa.screenshot({ path: path.join(OUT, 'after-pola-panel.png') });
  await pa.close();

  // ---------- 手机（after，390） ----------
  const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  const pm = await ctxM.newPage();
  await pm.addInitScript(TIME_SHIFT);
  await pm.goto(BASE, { waitUntil: 'load', timeout: 30000 });
  await pm.waitForTimeout(1500);
  await settle(pm);
  await pm.screenshot({ path: path.join(OUT, 'after-mobile-hero.png') });
  await pm.evaluate(() => { const el = document.querySelector('.larry-pola'); window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY); });
  await pm.waitForTimeout(1600);
  await pm.screenshot({ path: path.join(OUT, 'after-mobile-pola.png') });
  await pm.close();
  await ctxM.close();

  await browser.close();
  console.log('done ->', OUT);
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
