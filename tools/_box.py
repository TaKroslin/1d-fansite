"""Check box model for blog card vs home card."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)

    for label, url in [("home (card with bg)", "http://localhost:8000/"), ("blog (first card)", "http://localhost:8000/pages/blog.html")]:
        page = ctx.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=15000)
        # Scroll to find a card with bg image
        for y in range(0, 3000, 200):
            page.evaluate(f"window.scrollTo(0, {y})")
            time.sleep(0.2)
        time.sleep(1)

        info = page.evaluate("""() => {
            const cards = document.querySelectorAll('.homepage-news');
            // Find one with inline background-image
            let card = null;
            for (const c of cards) {
                if (c.getAttribute('style') && c.getAttribute('style').includes('url(')) {
                    card = c;
                    break;
                }
            }
            if (!card) return {error: 'no card with bg'};
            const cs = getComputedStyle(card);
            return {
                boxSizing: cs.boxSizing,
                height: cs.height,
                width: cs.width,
                paddingTop: cs.paddingTop,
                paddingBottom: cs.paddingBottom,
                overflow: cs.overflow,
                backgroundColor: cs.backgroundColor,
                backgroundAttachment: cs.backgroundAttachment,
                backgroundOrigin: cs.backgroundOrigin,
                backgroundClip: cs.backgroundClip,
                position: cs.position,
            };
        }""")
        print(f"\n=== {label} ===")
        if "error" in info:
            print(f"  {info['error']}")
        else:
            for k, v in info.items():
                print(f"  {k}: {v}")
        page.close()

    ctx.close()
    browser.close()
