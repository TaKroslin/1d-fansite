"""Deep compare: home card vs blog card — same style, what differs?"""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)

    for vp_name, vp in [("DESKTOP", {"width": 1600, "height": 900}), ("MOBILE", {"width": 390, "height": 844})]:
        is_mobile = vp_name == "MOBILE"
        ctx = browser.new_context(viewport=vp, is_mobile=is_mobile, has_touch=is_mobile)

        # Compare home and blog side by side
        for label, url in [("home", "http://localhost:8000/"), ("blog", "http://localhost:8000/pages/blog.html")]:
            page = ctx.new_page()
            page.goto(url, wait_until="domcontentloaded", timeout=15000)
            time.sleep(1.5)

            info = page.evaluate("""() => {
                const card = document.querySelector('.homepage-news');
                if (!card) return {error: 'no .homepage-news'};
                const cs = getComputedStyle(card);
                const rect = card.getBoundingClientRect();
                // Get all matching CSS rules
                const rules = [];
                for (const sheet of document.styleSheets) {
                    try {
                        for (const rule of sheet.cssRules) {
                            if (rule.selectorText && card.matches(rule.selectorText)) {
                                rules.push(rule.selectorText + ' { ' + rule.style.cssText.slice(0, 300) + ' }');
                            } else if (rule instanceof CSSMediaRule && window.matchMedia(rule.conditionText).matches) {
                                for (const inner of rule.cssRules) {
                                    if (inner.selectorText && card.matches(inner.selectorText)) {
                                        rules.push('@media ' + rule.conditionText + ' | ' + inner.selectorText + ' { ' + inner.style.cssText.slice(0, 200) + ' }');
                                    }
                                }
                            }
                        }
                    } catch(e) {}
                }
                return {
                    style_attr: card.getAttribute('style'),
                    computed: {
                        bg: cs.backgroundImage.substring(0, 80),
                        bgColor: cs.backgroundColor,
                        bgSize: cs.backgroundSize,
                        bgPosition: cs.backgroundPosition,
                        opacity: cs.opacity,
                        display: cs.display,
                        width: rect.width,
                        height: rect.height,
                    },
                    rules: rules.slice(0, 15),
                };
            }""")

            print(f"\n=== {vp_name} | {label} ===")
            if 'error' in info:
                print(f"  ERROR: {info['error']}")
                continue
            print(f"  style attr: {(info.get('style_attr') or 'NONE')[:200]}")
            print(f"  computed: {info['computed']}")
            for r in info['rules']:
                if 'background' in r.lower() or 'opacity' in r.lower() or 'panel' in r.lower() or 'mobile' in r.lower() or 'home' in r.lower() or 'blog' in r.lower():
                    print(f"    RULE: {r}")

            page.close()
        ctx.close()
    browser.close()
