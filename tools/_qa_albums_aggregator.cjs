// QA: gallery albums aggregator — DOM assertions + 404 capture
const { chromium } = require('playwright');
const path = require('path');
const REPO = path.resolve(__dirname, '..');
const fs = require('fs');
const OUT = path.join(REPO, 'tools', '_qa_screenshots', 'gallery');
fs.mkdirSync(OUT, { recursive: true });

const BASE = 'http://127.0.0.1:8000';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const fails = [];
  const notFound = new Set();
  const pageErrs = [];
  page.on('response', (r) => { if (r.status() === 404) notFound.add(r.url().replace(BASE, '')); });
  page.on('pageerror', (e) => pageErrs.push(e.message));

  // ===== albums.html =====
  const r1 = await page.goto(BASE + '/pages/gallery/albums.html', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1000);

  const headers = await page.locator('.panel.release-header-mono').count();
  const covers  = await page.locator('.panel.gallery-cover').count();
  const counts  = await page.locator('.panel.gallery-cover .count').count();
  const moreBtns= await page.locator('.panel.gallery-cover .info a.more').count();
  const h2s     = await page.locator('.panel.gallery-cover .panel-content h2').count();
  const linksOK = await page.evaluate(() => {
    // every "View images" link must be a real page (HTTP 200), and target a music photo slideshow
    return Promise.all([...document.querySelectorAll('.panel.gallery-cover .info a.more')].map(async (a) => {
      const r = await fetch(a.href, { method: 'HEAD' });
      return { href: a.getAttribute('href'), status: r.status };
    }));
  });
  const allLinksOK = linksOK.every((l) => l.status === 200);
  const goodLinks = linksOK.filter((l) => l.status === 200).length;
  const noGroups  = await page.locator('.panel-group').count();

  console.log(`albums.html: status=${r1.status()} headers=${headers} covers=${covers} counts=${counts} h2=${h2s} more=${moreBtns} panel-group=${noGroups}`);
  console.log(`  links: ${goodLinks}/${linksOK.length} HTTP 200, allOK=${allLinksOK}`);
  if (headers !== 5) fails.push(`albums: expected 5 release headers, got ${headers}`);
  if (covers !== 13) fails.push(`albums: expected 13 covers, got ${covers}`);
  if (counts !== 13) fails.push(`albums: expected 13 counts, got ${counts}`);
  if (h2s !== 13) fails.push(`albums: expected 13 h2s, got ${h2s}`);
  if (moreBtns !== 13) fails.push(`albums: expected 13 buttons, got ${moreBtns}`);
  if (noGroups !== 0) fails.push(`albums: should have no panel-group, got ${noGroups}`);
  if (!allLinksOK) fails.push(`albums: some links not 200: ${JSON.stringify(linksOK.filter(l => l.status !== 200))}`);

  // layout: each cover 2:1
  const w = await page.locator('.panel.gallery-cover').first().evaluate((el) => el.getBoundingClientRect().width);
  const h = await page.locator('.panel.gallery-cover').first().evaluate((el) => el.getBoundingClientRect().height);
  const ratio = Math.abs(w - 2 * h) / (2 * h) < 0.05;
  console.log(`  cover ratio 2:1: ${Math.round(w)}x${Math.round(h)} ok=${ratio}`);
  if (!ratio) fails.push(`albums: cover not 2:1 (${w}x${h})`);

  // image 200 check: every .bg url in cover must resolve to 200 (relative to current page)
  const coverImgs = await page.evaluate(() => {
    return [...document.querySelectorAll('.panel.gallery-cover .bg')].map(b => {
      const m = (b.getAttribute('style') || '').match(/url\((['"]?)([^)'"]+)\1\)/);
      return m ? new URL(m[2], location.href).href : null;
    }).filter(Boolean);
  });
  const imgResults = await page.evaluate((urls) => Promise.all(urls.map(async (u) => {
    try { const r = await fetch(u, { method: 'HEAD' }); return { u, s: r.status }; }
    catch (e) { return { u, s: 'ERR' }; }
  })), coverImgs);
  const okImgs = imgResults.filter(r => r.s === 200).length;
  console.log(`  cover images: ${okImgs}/${imgResults.length} HTTP 200`);
  if (okImgs !== imgResults.length) {
    fails.push(`albums: ${imgResults.length - okImgs} cover images not 200: ${imgResults.filter(r => r.s !== 200).map(r => r.u).join(', ')}`);
  }

  await page.screenshot({ path: path.join(OUT, 'albums_desktop.png') });
  await page.screenshot({ path: path.join(OUT, 'albums_desktop_full.png'), fullPage: true });

  // ===== gallery.html (should now have 6 covers) =====
  const r2 = await page.goto(BASE + '/pages/gallery.html', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1000);
  const gCovers = await page.locator('.panel.gallery-cover').count();
  const gAlbums = await page.locator('.panel.gallery-cover').filter({ hasText: 'Albums' }).count();
  console.log(`gallery.html: status=${r2.status()} covers=${gCovers} (expected 6), hasAlbums=${gAlbums}`);
  if (gCovers !== 6) fails.push(`gallery: expected 6 covers (incl. Albums), got ${gCovers}`);
  if (gAlbums !== 1) fails.push(`gallery: Albums cover not present, hasAlbums=${gAlbums}`);

  // ===== mobile =====
  const m = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await m.goto(BASE + '/pages/gallery/albums.html', { waitUntil: 'networkidle', timeout: 20000 });
  await m.waitForTimeout(1000);
  const mw = await m.locator('.panel.gallery-cover').first().evaluate((el) => el.getBoundingClientRect().width);
  const mh = await m.locator('.panel.gallery-cover').first().evaluate((el) => el.getBoundingClientRect().height);
  const mSquare = Math.abs(mw - mh) / Math.max(mw, mh) < 0.05;
  console.log(`albums mobile: cover ${Math.round(mw)}x${Math.round(mh)} square=${mSquare}`);
  if (!mSquare) fails.push(`albums mobile: cover not 1:1 (${mw}x${mh})`);
  await m.screenshot({ path: path.join(OUT, 'albums_mobile.png') });

  console.log('--- 404 resources ---');
  if (notFound.size) [...notFound].forEach((u) => console.log('  404:', u));
  else console.log('  none');
  console.log('--- JS errors ---');
  console.log(pageErrs.length ? pageErrs.join('\n') : '  none');

  console.log(fails.length ? `\nFAILS (${fails.length}):\n  - ${fails.join('\n  - ')}` : '\nALL PASS');
  await browser.close();
  process.exit(fails.length || pageErrs.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
