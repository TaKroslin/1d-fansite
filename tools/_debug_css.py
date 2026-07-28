"""Debug: find which CSS rule is setting margin on homepage-news h2."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.goto("http://127.0.0.1:8765/pages/blog.html", wait_until="networkidle", timeout=15000)

    result = page.evaluate("""() => {
        const h2 = document.querySelector('.homepage-news h2');
        const matched = [];
        for (const sheet of document.styleSheets) {
            try {
                for (const rule of sheet.cssRules) {
                    if (rule instanceof CSSMediaRule && window.matchMedia(rule.conditionText).matches) {
                        for (const inner of rule.cssRules) {
                            if (inner.selectorText && h2.matches(inner.selectorText)) {
                                const margin = inner.style.margin;
                                const marginTop = inner.style.marginTop;
                                if (margin || marginTop) {
                                    matched.push({
                                        selector: inner.selectorText,
                                        margin: margin || '-',
                                        marginTop: marginTop || '-',
                                        parentRule: rule.conditionText
                                    });
                                }
                            }
                        }
                    } else if (rule.selectorText && h2.matches(rule.selectorText)) {
                        const margin = rule.style.margin;
                        const marginTop = rule.style.marginTop;
                        if (margin || marginTop) {
                            matched.push({
                                selector: rule.selectorText,
                                margin: margin || '-',
                                marginTop: marginTop || '-',
                                parentRule: '-'
                            });
                        }
                    }
                }
            } catch(e) {}
        }
        return matched;
    }""")

    for r in result:
        print(f"{r['parentRule']} | {r['selector']} | margin:{r['margin']} marginTop:{r['marginTop']}")

    ctx.close()
    browser.close()
