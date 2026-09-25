/* A 套追加两张素材：① 四张纹身封面卡 ② 首页最底部的 B 站视频卡（一次性脚本）
   跑：NODE_PATH=/opt/homebrew/lib/node_modules/openclaw/node_modules node tools/_qa_xhs_extra.js
*/
const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

const OUT = path.join(__dirname, '_qa_screenshots', 'xhs-928', 'raw');
const BASE = 'http://127.0.0.1:8000/index.html';

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.evaluate(async () => {
    const step = Math.round(innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y); await new Promise(r => setTimeout(r, 140));
    }
    scrollTo(0, 0); await new Promise(r => setTimeout(r, 400));
  });
  await page.evaluate(() => new Promise(res => {
    const pend = Array.from(document.images).filter(i => !i.complete);
    if (!pend.length) return res();
    let n = pend.length; const d = () => { if (--n <= 0) res(); };
    pend.forEach(i => { i.addEventListener('load', d, { once: true }); i.addEventListener('error', d, { once: true }); });
    setTimeout(res, 6000);
  }));
  await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation-duration:0s!important} .js .panel.fade-me{opacity:1!important}' });
  await page.waitForTimeout(600);

  // ① 四张纹身封面卡：按 HTML 顺序取第 1/2/7/8 张
  const idx = [0, 1, 6, 7];
  const names = ['tattoo-this-is-us.png', 'tattoo-about.png', 'tattoo-oops.png', 'tattoo-hi.png'];
  const cards = await page.$$('.larry-before-photo-card');
  console.log('tattoo cards found:', cards.length);
  for (let i = 0; i < idx.length; i++) {
    const el = cards[idx[i]];
    if (!el) { console.log('MISS', idx[i]); continue; }
    await el.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await el.screenshot({ path: path.join(OUT, names[i]) });
    console.log('✓', names[i]);
  }

  // ② 视频面板（整个 .homepage-video，含 play 按钮）
  const vp = await page.$('.homepage-video');
  if (vp) {
    await vp.scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await vp.screenshot({ path: path.join(OUT, 'video-panel.png') });
    console.log('✓ video-panel.png');
  } else console.log('MISS .homepage-video');

  await browser.close();
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
