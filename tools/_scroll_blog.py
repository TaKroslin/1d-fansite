"""Force waypoints then take screenshot of blog first card."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.goto("http://localhost:8000/pages/blog.html", wait_until="domcontentloaded", timeout=15000)

    # Force-trigger waypoints
    for y in range(0, 3000, 200):
        page.evaluate(f"window.scrollTo(0, {y})")
        time.sleep(0.3)
    time.sleep(1)
    page.evaluate("window.scrollTo(0, 0)")
    time.sleep(1)

    # Scroll to first card
    page.evaluate("document.querySelector('.homepage-news').scrollIntoView({block: 'center'})")
    time.sleep(1)

    info = page.evaluate("""() => {
        const card = document.querySelector('.homepage-news');
        const cs = getComputedStyle(card);
        return {
            style: card.getAttribute('style'),
            bg: cs.backgroundImage,
            opacity: cs.opacity,
            faded: card.classList.contains('faded'),
        };
    }""")
    print("First blog card after scroll:")
    for k, v in info.items():
        print(f"  {k}: {v}")

    page.screenshot(path="tools/_qa_screenshots/blog_first_card_visible.png", full_page=False)
    print("Screenshot saved")

    ctx.close()
    browser.close()
