"""Verify blog.html renders properly and links work."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.goto("http://localhost:8000/pages/blog.html", wait_until="domcontentloaded", timeout=15000)

    # Check visible cards
    info = page.evaluate("""() => {
        const cards = document.querySelectorAll('.homepage-news');
        const visible = [];
        cards.forEach(c => {
            const rect = c.getBoundingClientRect();
            const h2 = c.querySelector('h2 a');
            visible.push({
                h2_text: h2 ? h2.textContent.trim() : 'N/A',
                h2_href: h2 ? h2.getAttribute('href') : 'N/A',
                width: rect.width.toFixed(0),
                height: rect.height.toFixed(0),
                inViewport: rect.top < window.innerHeight && rect.bottom > 0,
            });
        });
        return { total: cards.length, cards: visible };
    }""")

    print(f"Total .homepage-news cards: {info['total']}")
    for c in info['cards']:
        print(f"  {c['h2_text'][:50]}")
        print(f"    href: {c['h2_href']}")
        print(f"    size: {c['width']}x{c['height']}, inViewport: {c['inViewport']}")

    # Take a screenshot
    page.screenshot(path="tools/_qa_screenshots/blog_list_fixed.png", full_page=False)
    print("\nScreenshot saved")

    # Click the first card and check it navigates
    page.click(".homepage-news h2 a")
    page.wait_for_load_state("domcontentloaded", timeout=15000)
    print(f"\nNavigated to: {page.url}")
    print(f"Title: {page.title()}")

    ctx.close()
    browser.close()
