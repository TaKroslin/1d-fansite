// 一次性 QA 截图（DPR=1）：Niall 封面换新后的实际渲染。
// 功能断言在 tools/archive/_qa_niall_cover_20260915.js 里以 DPR=2 跑（retinafy 路径），
// 截图必须用 DPR=1 —— DPR=2 下 element/clip 截图会出黑图（METHODS 已记）。
// 运行：NODE_PATH=$(npm root -g) node tools/archive/_qa_niall_cover_shot.js
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8000';
const SHOT = 'tools/_qa_screenshots/niall-cover-update';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  for (const [label, viewport] of [['desktop-1440', { width: 1440, height: 900 }],
                                   ['mobile-390', { width: 390, height: 844 }]]) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/pages/gallery/members/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(900);
    const card = page.locator('.panel.gallery-cover.niall-cover').first();
    await card.scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await card.screenshot({ path: `${SHOT}/card-${label}.png` });
    console.log(`saved ${SHOT}/card-${label}.png`);
    await ctx.close();
  }
  await browser.close();
  process.exit(0);
})();
