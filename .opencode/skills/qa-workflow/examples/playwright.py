"""Take screenshots of key pages for QA verification."""
import asyncio
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(r"E:\文档\GitHub\1d-fansite")
OUT = ROOT / "tools" / "_qa_screenshots"
OUT.mkdir(exist_ok=True)

BASE = "http://127.0.0.1:8765"

PAGES = [
    ("home", "/"),
    ("blog_list", "/pages/blog.html"),
    ("blog_whyilove", "/pages/blog/2026-07-27/why-i-love-1d-so-bad/"),
    ("blog_ready", "/pages/blog/2026-07-27/ready-to-run/"),
    ("blog_whythissite", "/pages/blog/2026-07-27/why-this-site-exists/"),
    ("blog_everyjuly", "/pages/blog/2026-07-27/every-july-23rd-we-come-home/"),
    ("about", "/pages/about.html"),
]


async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        # Desktop
        ctx = await browser.new_context(viewport={"width": 1600, "height": 900})
        page = await ctx.new_page()
        for name, path in PAGES:
            url = f"{BASE}{path}"
            print(f"Desktop: {name} -> {url}")
            await page.goto(url, wait_until="networkidle", timeout=15000)
            await page.screenshot(path=str(OUT / f"desktop_{name}.png"), full_page=False)
        await ctx.close()

        # Mobile
        ctx = await browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True,
        )
        page = await ctx.new_page()
        for name, path in PAGES:
            url = f"{BASE}{path}"
            print(f"Mobile: {name} -> {url}")
            await page.goto(url, wait_until="networkidle", timeout=15000)
            await page.screenshot(path=str(OUT / f"mobile_{name}.png"), full_page=False)
        await ctx.close()

        await browser.close()

    print(f"\nDone! Screenshots saved to {OUT}")


asyncio.run(main())
