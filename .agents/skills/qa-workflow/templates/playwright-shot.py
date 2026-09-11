"""Playwright 截图脚本模板：确认视觉呈现（布局/颜色/动画/响应式）。

用法：
  1. 起本地 server（python -m http.server 8000）
  2. python playwright-shot.py
  3. 截图归档到 tools/_qa_screenshots/
注意：结尾必须 os._exit(0)，否则 chromium 不释放、命令挂起 timeout。
"""
import asyncio
import os
from pathlib import Path

from playwright.async_api import async_playwright

SHOTS = Path("tools/_qa_screenshots")
SHOTS.mkdir(parents=True, exist_ok=True)

URLS = [
    "http://127.0.0.1:8000/pages/gallery/members/index.html",
]

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # 桌面端
        ctx = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await ctx.new_page()
        for url in URLS:
            await page.goto(url, wait_until="networkidle")
            await page.wait_for_timeout(500)
            name = url.rsplit("/", 1)[-1].replace(".html", "") or "index"
            await page.screenshot(path=str(SHOTS / f"{name}-desktop.png"), full_page=False)
        await ctx.close()
        # 移动端（断点 767px 以下）
        ctx = await browser.new_context(viewport={"width": 390, "height": 844})
        page = await ctx.new_page()
        for url in URLS:
            await page.goto(url, wait_until="networkidle")
            await page.wait_for_timeout(500)
            name = url.rsplit("/", 1)[-1].replace(".html", "") or "index"
            await page.screenshot(path=str(SHOTS / f"{name}-mobile.png"), full_page=False)
        await ctx.close()
        await browser.close()
    os._exit(0)  # 必须：释放 chromium

if __name__ == "__main__":
    asyncio.run(main())
