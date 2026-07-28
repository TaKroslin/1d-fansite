"""Final visual check."""
from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()
    page.goto("http://localhost:8000/pages/blog.html", wait_until="domcontentloaded", timeout=15000)
    page.evaluate('document.querySelector(".homepage-news").scrollIntoView({block:"center"})')
    time.sleep(1)
    page.screenshot(path="tools/_qa_screenshots/blog_final_check.png", full_page=False)
    print("Mobile screenshot saved")

    # Also desktop
    ctx2 = browser.new_context(viewport={"width": 1280, "height": 800})
    page2 = ctx2.new_page()
    page2.goto("http://localhost:8000/pages/blog.html", wait_until="domcontentloaded", timeout=15000)
    page2.evaluate('document.querySelector(".homepage-news").scrollIntoView({block:"center"})')
    time.sleep(1)
    page2.screenshot(path="tools/_qa_screenshots/blog_final_desktop.png", full_page=False)
    print("Desktop screenshot saved")

    ctx.close()
    ctx2.close()
    browser.close()
