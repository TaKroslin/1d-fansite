"""Quick visual QA for the zayn band-member section."""
import asyncio
from playwright.async_api import async_playwright
from pathlib import Path

OUT = Path(r"E:\文档\GitHub\1d-fansite\tools\_qa_screenshots")
OUT.mkdir(parents=True, exist_ok=True)

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        # Desktop
        ctx = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(f"JS ERROR: {e}"))
        page.on("console", lambda m: errors.append(f"CONSOLE {m.type}: {m.text}") if m.type in ("error", "warning") else None)
        failed = []
        page.on("requestfailed", lambda r: failed.append(f"FAIL {r.url}"))
        await page.goto("http://localhost:8000/pages/band.html", wait_until="networkidle", timeout=20000)
        # Scroll to zayn section
        await page.evaluate("document.querySelector('.band-member.zayn').scrollIntoView({block: 'center'})")
        await page.wait_for_timeout(500)
        # Take zayn-specific screenshot
        zayn = page.locator(".band-member.zayn")
        await zayn.screenshot(path=str(OUT / "zayn_desktop.png"))
        # Full page
        await page.screenshot(path=str(OUT / "band_full_desktop.png"), full_page=True)
        await ctx.close()
        # Mobile
        ctx2 = await browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        page2 = await ctx2.new_page()
        await page2.goto("http://localhost:8000/pages/band.html", wait_until="networkidle", timeout=20000)
        await page2.evaluate("document.querySelector('.band-member.zayn').scrollIntoView({block: 'center'})")
        await page2.wait_for_timeout(500)
        await page2.locator(".band-member.zayn").screenshot(path=str(OUT / "zayn_mobile.png"))
        await ctx2.close()
        await browser.close()

        print("=== Errors ===")
        for e in errors:
            print(e)
        print("=== Failed requests ===")
        for f in failed:
            print(f)
        if not errors and not failed:
            print("OK: no errors, no failed requests")

asyncio.run(main())
