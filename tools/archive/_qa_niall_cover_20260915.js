// 一次性 QA：验证 Niall 封面六个 tier 换新后，页面实际加载的是哪一张、尺寸对不对。
// 运行：NODE_PATH=$(npm root -g) node tools/archive/_qa_niall_cover_20260915.js
const { chromium } = require('playwright');

const BASE = 'http://127.0.0.1:8000';
const SHOT = 'tools/_qa_screenshots/niall-cover-update';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const results = [];
  const ok = (name, pass, detail) => {
    results.push({ name, pass, detail });
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}  ${detail}`);
  };

  const cardSel = '.panel.gallery-cover.niall-cover .bg';

  async function probe(label, viewport, expectTier) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    await page.goto(`${BASE}/pages/gallery/members/index.html`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(700); // 等 retinafy 的 fadeIn 完成

    const info = await page.$eval(cardSel, el => {
      const cs = getComputedStyle(el);
      const m = cs.backgroundImage.match(/url\("?([^")]+)"?\)/);
      return { url: m ? m[1] : null, filter: cs.filter };
    });

    const url = info.url;
    const file = url ? url.split('/').pop() : '(none)';
    ok(`${label} 加载的是 ${expectTier}`, file === expectTier, `实际 = ${file}`);
    ok(`${label} 灰度例外仍生效 (filter:none)`, info.filter === 'none', `filter=${info.filter}`);

    // 真去请求一次，确认 200 且像素正确
    const abs = url.startsWith('http') ? url : BASE + (url.startsWith('/') ? '' : '/pages/gallery/members/') + url;
    const resp = await page.request.get(abs);
    ok(`${label} 封面 HTTP 200`, resp.status() === 200, `${resp.status()} ${abs.split('/').pop()}`);
    const buf = await resp.body();
    ok(`${label} 封面字节数 > 0`, buf.length > 0, `${buf.length} 字节`);

    await page.locator('.panel.gallery-cover.niall-cover').first().screenshot({ path: `${SHOT}/${label}.png` });
    ok(`${label} 无 JS 报错`, errs.length === 0, errs.join('; ') || '0 个错误');
    await ctx.close();
  }

  await probe('desktop-1440', { width: 1440, height: 900 }, 'gallery-members-niall-cover-rect-lrg.png');
  await probe('mobile-390', { width: 390, height: 844 }, 'gallery-members-niall-cover-square-sml.png');

  // 元素页（og:image 用 rect-med）
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const resp = await page.goto(`${BASE}/pages/gallery/members/niall/index.html`, { waitUntil: 'domcontentloaded' });
  ok('Niall 成员页 HTTP 200', resp.status() === 200, String(resp.status()));
  const og = await page.getAttribute('meta[property="og:image"]', 'content');
  // og:image 是相对页面目录的 ../../../../images/...，交给浏览器按真实 URL 解析
  const ogAbs = new URL(og, 'http://127.0.0.1:8000/pages/gallery/members/niall/index.html').href;
  const ogResp = await page.request.get(ogAbs);
  ok('og:image (rect-med) HTTP 200', ogResp.status() === 200, `${ogResp.status()} ${ogAbs.split('/').pop()}`);
  await ctx.close();

  await browser.close();

  const failed = results.filter(r => !r.pass);
  console.log(`\n===== ${results.length - failed.length}/${results.length} 通过 =====`);
  if (failed.length) { failed.forEach(f => console.log(`  FAIL ${f.name}: ${f.detail}`)); process.exit(1); }
  process.exit(0);
})();
