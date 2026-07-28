"""Quick CSS verification using file:// protocol."""
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    
    path = r"file:///E:/文档/GitHub/1d-fansite/pages/blog.html"
    page.goto(path, wait_until="networkidle", timeout=15000)

    mt = page.evaluate("getComputedStyle(document.querySelector('.homepage-news h2')).marginTop")
    tp = page.evaluate("getComputedStyle(document.querySelector('.homepage-news h2')).top")
    pos = page.evaluate("getComputedStyle(document.querySelector('.homepage-news h2')).position")

    print(f"marginTop: {mt}")
    print(f"top: {tp}")
    print(f"position: {pos}")

    if mt == "0px":
        print("PASS!")
    else:
        print(f"FAIL: margin is {mt}")

    ctx.close()
    browser.close()
