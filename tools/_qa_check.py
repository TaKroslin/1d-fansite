"""Numeric QA verification — check critical CSS values."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

BASE = "http://127.0.0.1:8765"


async def check_mobile(page, name, checks):
    """Run CSS checks and report results."""
    results = []
    for label, js in checks:
        try:
            val = await page.evaluate(js)
            results.append((label, val))
        except Exception as e:
            results.append((label, f"ERROR: {e}"))
    return results


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        ctx = await browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True, has_touch=True,
        )
        page = await ctx.new_page()

        # --- HOME PAGE ---
        print("=" * 60)
        print("MOBILE HOME PAGE")
        print("=" * 60)
        await page.goto(f"{BASE}/", wait_until="networkidle", timeout=15000)

        checks = [
            ("panel-header display (should be none)", """
                (() => {
                    const el = document.querySelector('.homepage-news .panel-header');
                    if (!el) return 'NO ELEMENT';
                    const s = getComputedStyle(el);
                    return `display:${s.display}`;
                })()
            """),
            ("blog card h2 position top", """
                (() => {
                    const el = document.querySelector('.homepage-news h2');
                    if (!el) return 'NO ELEMENT';
                    const rect = el.getBoundingClientRect();
                    const parent = el.closest('.panel');
                    const pRect = parent ? parent.getBoundingClientRect() : null;
                    const pct = pRect ? ((rect.top - pRect.top) / pRect.height * 100).toFixed(1) : 'N/A';
                    return `top:${rect.top.toFixed(0)}px, parentTop:${pRect?.top.toFixed(0)}, pct:${pct}%`;
                })()
            """),
            ("blog card 'more' button position bottom", """
                (() => {
                    const el = document.querySelector('.homepage-news .more');
                    if (!el) return 'NO ELEMENT';
                    const rect = el.getBoundingClientRect();
                    const parent = el.closest('.panel');
                    const pRect = parent ? parent.getBoundingClientRect() : null;
                    const pct = pRect ? ((pRect.bottom - rect.bottom) / pRect.height * 100).toFixed(1) : 'N/A';
                    return `bottomDist:${pRect ? (pRect.bottom - rect.bottom).toFixed(0) : 'N/A'}px, pct:${pct}%`;
                })()
            """),
            ("h2 to button gap", """
                (() => {
                    const h2 = document.querySelector('.homepage-news h2');
                    const btn = document.querySelector('.homepage-news .more');
                    if (!h2 || !btn) return 'NO ELEMENTS';
                    const h2Bottom = h2.getBoundingClientRect().bottom;
                    const btnTop = btn.getBoundingClientRect().top;
                    return `${(btnTop - h2Bottom).toFixed(0)}px`;
                })()
            """),
        ]
        for label, val in await check_mobile(page, "home", checks):
            print(f"  {label}: {val}")

        # --- BLOG LIST ---
        print("\n" + "=" * 60)
        print("MOBILE BLOG LIST")
        print("=" * 60)
        await page.goto(f"{BASE}/pages/blog.html", wait_until="networkidle", timeout=15000)

        checks = [
            ("panel-header display", """
                (() => {
                    const el = document.querySelector('.homepage-news .panel-header');
                    if (!el) return 'NO ELEMENT';
                    return `display:${getComputedStyle(el).display}`;
                })()
            """),
            ("first card h2 position top%", """
                (() => {
                    const el = document.querySelector('.homepage-news h2');
                    if (!el) return 'NO ELEMENT';
                    const rect = el.getBoundingClientRect();
                    const parent = el.closest('.panel');
                    const pRect = parent.getBoundingClientRect();
                    return `${((rect.top - pRect.top) / pRect.height * 100).toFixed(1)}%`;
                })()
            """),
            ("first card more button bottom%", """
                (() => {
                    const el = document.querySelector('.homepage-news .more');
                    if (!el) return 'NO ELEMENT';
                    const rect = el.getBoundingClientRect();
                    const parent = el.closest('.panel');
                    const pRect = parent.getBoundingClientRect();
                    return `${((pRect.bottom - rect.bottom) / pRect.height * 100).toFixed(1)}%`;
                })()
            """),
        ]
        for label, val in await check_mobile(page, "blog_list", checks):
            print(f"  {label}: {val}")

        # --- BLOG DETAIL ---
        print("\n" + "=" * 60)
        print("MOBILE BLOG DETAIL (why-i-love-1d)")
        print("=" * 60)
        await page.goto(
            f"{BASE}/pages/blog/2026-07-27/why-i-love-1d-so-bad/",
            wait_until="networkidle", timeout=15000,
        )

        checks = [
            ("article-cover padding-top (should be ~50%)", """
                (() => {
                    const el = document.querySelector('.article-cover');
                    if (!el) return 'NO ELEMENT';
                    return getComputedStyle(el).paddingTop;
                })()
            """),
            ("panel-header display (should be none)", """
                (() => {
                    const el = document.querySelector('.journal-article .panel-header');
                    if (!el) return 'NO ELEMENT';
                    return `display:${getComputedStyle(el).display}`;
                })()
            """),
            ("h2 margin-bottom (should be ~0.6em)", """
                (() => {
                    const el = document.querySelector('.journal-article h2');
                    if (!el) return 'NO ELEMENT';
                    return getComputedStyle(el).marginBottom;
                })()
            """),
            ("cover image aspect ratio (width/height)", """
                (() => {
                    const el = document.querySelector('.article-cover');
                    if (!el) return 'NO ELEMENT';
                    const rect = el.getBoundingClientRect();
                    return `${rect.width.toFixed(0)}x${rect.height.toFixed(0)} (ratio:${(rect.width/rect.height).toFixed(2)})`;
                })()
            """),
        ]
        for label, val in await check_mobile(page, "blog_detail", checks):
            print(f"  {label}: {val}")

        # --- FOOTER CHECK ---
        print("\n" + "=" * 60)
        print("FOOTER LINKS CHECK")
        print("=" * 60)
        await page.goto(f"{BASE}/pages/blog.html", wait_until="networkidle", timeout=15000)
        footer_links = await page.evaluate("""() => {
            const links = document.querySelectorAll('footer a');
            return Array.from(links).map(a => ({
                text: a.textContent.trim().slice(0, 30),
                href: a.getAttribute('href')
            }));
        }""")
        for l in footer_links:
            print(f"  {l['text']}: {l['href']}")

        await ctx.close()
        await browser.close()


asyncio.run(main())
