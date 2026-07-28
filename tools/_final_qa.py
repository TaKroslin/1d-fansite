"""Final QA verification — all pages, both viewports."""
from playwright.sync_api import sync_playwright

PAGES = [
    ("Home", "file:///E:/文档/GitHub/1d-fansite/index.html"),
    ("Blog List", "file:///E:/文档/GitHub/1d-fansite/pages/blog.html"),
    ("Blog Detail", "file:///E:/文档/GitHub/1d-fansite/pages/blog/2026-07-27/why-i-love-1d-so-bad/index.html"),
    ("Blog Ready", "file:///E:/文档/GitHub/1d-fansite/pages/blog/2026-07-27/ready-to-run/index.html"),
    ("About", "file:///E:/文档/GitHub/1d-fansite/pages/about.html"),
]

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    for vp_name, vp in [("DESKTOP", {"width": 1600, "height": 900}), ("MOBILE", {"width": 390, "height": 844})]:
        is_mobile = vp_name == "MOBILE"
        ctx = browser.new_context(viewport=vp, is_mobile=is_mobile, has_touch=is_mobile)
        page = ctx.new_page()

        print(f"\n{'='*60}")
        print(f"  {vp_name} ({vp['width']}x{vp['height']})")
        print(f"{'='*60}")

        for name, url in PAGES:
            page.goto(url, wait_until="load", timeout=15000)
            
            checks = page.evaluate("""() => {
                const results = [];
                
                // Check for homepage-news cards
                const card = document.querySelector('.homepage-news');
                if (card) {
                    const h2 = card.querySelector('h2');
                    const btn = card.querySelector('.more');
                    const panelHeader = card.querySelector('.panel-header');
                    
                    if (h2) {
                        const hs = getComputedStyle(h2);
                        results.push('h2:pos=' + hs.position + ' top=' + hs.top + ' mTop=' + hs.marginTop);
                        if (btn) {
                            const h2r = h2.getBoundingClientRect();
                            const btnr = btn.getBoundingClientRect();
                            results.push('h2-btn-gap:' + (btnr.top - h2r.bottom).toFixed(0) + 'px');
                        }
                    }
                    if (panelHeader) {
                        results.push('panelHeader:display=' + getComputedStyle(panelHeader).display);
                    }
                }
                
                // Check article-cover
                const cover = document.querySelector('.article-cover');
                if (cover) {
                    const cs = getComputedStyle(cover);
                    const rect = cover.getBoundingClientRect();
                    results.push('cover:padding=' + cs.paddingTop + ' size=' + rect.width.toFixed(0) + 'x' + rect.height.toFixed(0));
                }
                
                // Check blog detail h2
                const artH2 = document.querySelector('.journal-article h2');
                if (artH2) {
                    const s = getComputedStyle(artH2);
                    results.push('artH2:mBottom=' + s.marginBottom + ' fontSize=' + s.fontSize);
                }
                
                // Check footer about link
                const footerLinks = document.querySelectorAll('footer a');
                const aboutLinks = [];
                footerLinks.forEach(a => {
                    if (a.textContent.trim().includes('About') || a.textContent.trim().includes('Takion')) {
                        aboutLinks.push(a.getAttribute('href'));
                    }
                });
                if (aboutLinks.length) results.push('footer:about=' + aboutLinks.join(', '));
                
                return results;
            }""")

            print(f"\n  {name}:")
            for c in checks:
                print(f"    {c}")

        ctx.close()

    browser.close()
    print("\n✅ QA complete")
