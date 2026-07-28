"""Find the actual home card with bg image (not the first one with no inline style)."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.goto("http://localhost:8000/", wait_until="domcontentloaded", timeout=15000)
    time.sleep(2)

    info = page.evaluate("""() => {
        const cards = document.querySelectorAll('.homepage-news');
        return Array.from(cards).map((c, i) => {
            const cs = getComputedStyle(c);
            const rect = c.getBoundingClientRect();
            return {
                i,
                style: c.getAttribute('style') ? c.getAttribute('style').substring(0, 100) : 'NONE',
                bg: cs.backgroundImage.substring(0, 80),
                bgColor: cs.backgroundColor,
                opacity: cs.opacity,
                faded: c.classList.contains('faded'),
                w: rect.width, h: rect.height,
            };
        });
    }""")
    print("HOME cards (mobile):")
    for c in info:
        print(f"  [{c['i']}] faded={c['faded']} op={c['opacity']} bgColor={c['bgColor']}")
        print(f"       style: {c['style']}")
        print(f"       bg: {c['bg']}")

    # Scroll to the second card area to see if it has the logo
    page.evaluate('window.scrollTo(0, 800)')
    time.sleep(1)
    page.screenshot(path="tools/_qa_screenshots/home_after_scroll.png", full_page=False)

    ctx.close()
    browser.close()
