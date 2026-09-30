/* =================================================================
   FIVE GUYS ONE DIRECTION — 站点公告条控制器
   -----------------------------------------------------------------
   当前公告：2026-10-01 起完全停更 + 源码 MIT 开源（完整版见 pages/notice.html）。
   两个关闭按钮：
     · "ack"（I know）              7 天内不再出现   localStorage 时间戳
     · "off"（Don't show anymore）  永久不再出现     localStorage 标记
   另有 "Read the full announcement"：纯 <a href>，不带 data-sn —— 只跳页，
   不会关掉横条（用户可能还要点 I know）。
   存储读取全部包 try/catch：隐私模式 / 禁用存储时退化为"每次显示"，不报错。
   结构由本脚本注入（不在 index.html 里写死），公告文案改这里一处即可。
   ================================================================= */
(function () {
	"use strict";

	if (window.__5GUYS_SITE_NOTICE__) return;
	window.__5GUYS_SITE_NOTICE__ = true;

	var KEY_OFF = "5guys1d.notice.off";
	var KEY_ACK = "5guys1d.notice.ack";

	/* 源代码仓库 + GitHub 图标（inline SVG，不新增图标字体/图片资源）。
	   fill 用 currentColor，颜色跟着按钮走，hover 时自动反色。 */
	var REPO_URL = "https://github.com/TaKroslin/1d-fansite";
	var GITHUB_SVG =
		'<svg viewBox="0 0 16 16" width="20" height="20" aria-hidden="true" focusable="false">' +
		'<path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 ' +
		'0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53' +
		'.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 ' +
		'0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 ' +
		'2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 ' +
		'3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>' +
		'</svg>';

	/* 点"I know"之后安静的天数 */
	var ACK_DAYS = 7;
	/* 进页面到滑入之间的停顿，避免和首屏 hero 动画抢注意力 */
	var SHOW_DELAY = 1100;

	function read(store, key) {
		try { return store.getItem(key); } catch (e) { return null; }
	}
	function write(store, key, val) {
		try { store.setItem(key, val); return true; } catch (e) { return false; }
	}

	function shouldShow() {
		if (read(localStorage, KEY_OFF)) return false;
		var ack = parseInt(read(localStorage, KEY_ACK), 10);
		if (ack && Date.now() - ack < ACK_DAYS * 24 * 3600 * 1000) return false;
		return true;
	}

	function build() {
		var el = document.createElement("div");
		el.id = "site-notice";
		el.setAttribute("role", "region");
		el.setAttribute("aria-label", "Site notice");
		el.hidden = true;
		el.innerHTML = [
			'<div class="sn-inner">',
			'  <div class="sn-copy">',
			'    <div class="sn-kicker">Notice from the webmaster</div>',
			'    <p class="sn-text">',
			'      <span class="sn-en">Sadly, and with a lot of calm: <strong>5guys1direction stops updating officially on 1 October 2026</strong>, and will not be coming back. Instead of letting the project end with me, the <strong>source code will be open-sourced under the MIT License</strong> — free for anyone to use, modify and build on. If nobody takes it over, I will not renew the domain when it expires and the site will go offline on its own.</span>',
			'      <span class="sn-zh">很遗憾，也很平静地宣布：<strong>5guys1direction 将于 2026 年 10 月 1 日起正式停止更新</strong>，并且不再恢复。我不希望这个项目随着我的离开而结束，因此<strong>网站源代码将以 MIT License 正式开源</strong>，任何人都可以自由使用、修改、二次开发。如果没有人接手，等域名到期后我将不再续费，网站会自然下线。</span>',
			'    </p>',
			'  </div>',
			'  <div class="sn-actions">',
			'    <a class="sn-btn sn-btn--icon" href="' + REPO_URL + '" target="_blank" rel="noopener" aria-label="Source code on GitHub" title="Source code on GitHub">' + GITHUB_SVG + '</a>',
			'    <a class="sn-btn sn-btn--link" href="pages/notice.html"><span class="sn-link-en">Read the full announcement</span><span class="sn-link-zh">查看完整公告</span></a>',
			'    <button type="button" class="sn-btn sn-btn--primary" data-sn="ack">I know</button>',
			'    <button type="button" class="sn-btn sn-btn--ghost" data-sn="off">Don\'t show anymore</button>',
			'  </div>',
			'</div>'
		].join("");
		return el;
	}

	function init() {
		if (!shouldShow()) return;

		var el = build();
		document.body.appendChild(el);

		/* 实测横条高度写进 --sn-h，供 CSS 给 body 补下边距（见 site-notice.css 的"让位"段）。
		   高度会随语言、断点变化，所以用 ResizeObserver 跟踪；窗口缩放也重测一次。 */
		var root = document.documentElement;
		function syncHeight() {
			if (el.hidden) return;
			var h = Math.ceil(el.getBoundingClientRect().height);
			if (h > 0) root.style.setProperty("--sn-h", h + "px");
		}
		function clearHeight() {
			root.style.removeProperty("--sn-h");
		}

		var closed = false;
		function close(mode) {
			if (closed) return;
			closed = true;

			if (mode === "off") write(localStorage, KEY_OFF, "1");
			else write(localStorage, KEY_ACK, String(Date.now()));

			clearHeight();
			el.classList.remove("is-in");
			// 等滑出动画跑完再移除；reduced-motion 下没有过渡，直接移除
			var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
			window.setTimeout(function () {
				if (el.parentNode) el.parentNode.removeChild(el);
			}, reduced ? 0 : 560);
		}

		el.addEventListener("click", function (e) {
			var btn = e.target.closest ? e.target.closest("[data-sn]") : null;
			if (!btn) return;
			close(btn.getAttribute("data-sn"));
		});

		// 先解掉 hidden，下一帧再加 is-in，保证过渡真的触发
		window.setTimeout(function () {
			el.hidden = false;
			syncHeight();
			if (window.ResizeObserver) new window.ResizeObserver(syncHeight).observe(el);
			window.addEventListener("resize", syncHeight);
			window.requestAnimationFrame(function () {
				window.requestAnimationFrame(function () { el.classList.add("is-in"); });
			});
		}, SHOW_DELAY);
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}
}());
