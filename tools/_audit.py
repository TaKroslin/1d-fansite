"""Full audit of changes — check every page for: image paths, links, fonts, CSS."""
from playwright.sync_api import sync_playwright

PAGES = [
    ("Home", "http://localhost:8000/"),
    ("Blog list", "http://localhost:8000/pages/blog.html"),
    ("Blog/why-i-love", "http://localhost:8000/pages/blog/2026-07-27/why-i-love-1d-so-bad/"),
    ("Blog/ready-to-run", "http://localhost:8000/pages/blog/2026-07-27/ready-to-run/"),
    ("Blog/why-this-site", "http://localhost:8000/pages/blog/2026-07-27/why-this-site-exists/"),
    ("Blog/every-july", "http://localhost:8000/pages/blog/2026-07-27/every-july-23rd-we-come-home/"),
    ("About", "http://localhost:8000/pages/about.html"),
    ("Music", "http://localhost:8000/pages/music.html"),
    ("Journal", "http://localhost:8000/pages/journal.html"),
    ("Gallery", "http://localhost:8000/pages/gallery.html"),
]

issues = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 1280, "height": 800})

    for name, url in PAGES:
        page = ctx.new_page()
        errors = []
        failed_requests = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("requestfailed", lambda r: failed_requests.append(f"{r.url} - {r.failure}"))

        try:
            response = page.goto(url, wait_until="domcontentloaded", timeout=15000)
            status = response.status if response else "no response"

            # Check all <a> hrefs in footer are valid
            footer_about = page.evaluate("""() => {
                const links = document.querySelectorAll('footer a');
                return Array.from(links).map(a => ({
                    text: a.textContent.trim().slice(0, 30),
                    href: a.getAttribute('href'),
                })).filter(l => l.href && l.href.includes('about'));
            }""")

            # Check Google Fonts URL
            gf = page.evaluate("""() => {
                const link = document.querySelector('link[href*="fonts.googleapis"]');
                return link ? link.href : 'NO FONTS LINK';
            }""")

            # Check CSS link
            css = page.evaluate("""() => {
                const link = document.querySelector('link[href*="styles.css"]');
                return link ? link.href : 'NO CSS LINK';
            }""")

            print(f"\n[{name}] status={status}, errors={len(errors)}, failed_req={len(failed_requests)}")
            if failed_requests:
                for fr in failed_requests[:5]:
                    print(f"  FAIL: {fr}")
                    issues.append(f"{name}: failed request {fr}")
            if footer_about:
                for a in footer_about:
                    if "about" in a["href"]:
                        # Check that the path resolves
                        # Convert to absolute URL
                        test = page.evaluate(f"""() => {{
                            const a = document.createElement('a');
                            a.href = '{a["href"]}';
                            return a.href;
                        }}""")
                        print(f"  footer about -> {test}")
            print(f"  fonts: {gf[:80]}...")

        except Exception as e:
            print(f"[{name}] EXCEPTION: {e}")
            issues.append(f"{name}: {e}")

        page.close()

    ctx.close()
    browser.close()

print("\n" + "="*60)
print(f"ISSUES FOUND: {len(issues)}")
for i in issues:
    print(f"  - {i}")
