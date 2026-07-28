"""Verify CSS fix applied correctly."""
import subprocess, time, socket
from playwright.sync_api import sync_playwright

# Kill and restart server
try:
    subprocess.run(["taskkill", "/F", "/IM", "python.exe"], capture_output=True)
    time.sleep(1)
except Exception:
    pass

proc = subprocess.Popen(
    ["python", "-m", "http.server", "8765"],
    cwd=r"E:\文档\GitHub\1d-fansite",
    stdout=subprocess.DEVNULL,
    stderr=subprocess.DEVNULL,
)
time.sleep(2)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    page = ctx.new_page()

    page.goto("http://127.0.0.1:8765/pages/blog.html", wait_until="networkidle", timeout=15000)

    info = page.evaluate("""() => {
        const h2 = document.querySelector('.homepage-news h2');
        const s = getComputedStyle(h2);
        return {
            marginTop: s.marginTop,
            top: s.top,
            position: s.position,
        };
    }""")

    print(f"marginTop: {info['marginTop']}")
    print(f"top: {info['top']}")
    print(f"position: {info['position']}")

    if info["marginTop"] == "0px":
        print("\n✅ margin fix WORKING!")
    else:
        print(f"\n❌ margin still {info['marginTop']}")

    ctx.close()
    browser.close()

proc.terminate()
