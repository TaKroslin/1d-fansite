"""Check article cover image at top of article page."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for vp_name, vp in [("MOBILE", {"width": 390, "height": 844}), ("DESKTOP", {"width": 1280, "height": 800})]:
        is_mobile = vp_name == "MOBILE"
        ctx = browser.new_context(viewport=vp, is_mobile=is_mobile, has_touch=is_mobile)
        page = ctx.new_page()
        page.goto("http://localhost:8000/pages/blog/2026-07-27/why-i-love-1d-so-bad/", wait_until="domcontentloaded", timeout=15000)
        time.sleep(0.5)
        page.screenshot(path=f"tools/_qa_screenshots/article_top_{vp_name.lower()}.png", full_page=False)

        info = page.evaluate("""() => {
            const c = document.querySelector('.article-cover');
            if (!c) return null;
            const cs = getComputedStyle(c);
            const r = c.getBoundingClientRect();
            return {
                style: c.getAttribute('style'),
                paddingTop: cs.paddingTop,
                bgSize: cs.backgroundSize,
                bgPos: cs.backgroundPosition,
                w: r.width, h: r.height,
            };
        }""")
        print(f"\n=== {vp_name} ===")
        if info:
            for k, v in info.items():
                print(f"  {k}: {v}")
        page.close()
        ctx.close()
    browser.close()
