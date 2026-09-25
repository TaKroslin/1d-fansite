/* =================================================================
   FIVE GUYS ONE DIRECTION — 站点公告条控制器
   -----------------------------------------------------------------
   两个关闭按钮：
     · "ack"（I know）              7 天内不再出现   localStorage 时间戳
     · "off"（Don't show anymore）  永久不再出现     localStorage 标记
   另有 "Send an email"：纯 <a href="mailto:">，不带 data-sn —— 只唤起邮件客户端，
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
			'      <span class="sn-en">Senior year is busy, so <strong>maintenance pauses after 28 September</strong>. The site will keep its <strong>28 September celebration state all year</strong> — the countdown switches to the anniversary edition on its own. Email me anytime; email issues get handled <strong>after the 2027 Tsinghua Strong Foundation Program exam (early July 2027)</strong>.</span>',
			'      <span class="sn-zh">高三学业紧张，站主会在 <strong>9 月 28 日之后暂停维护</strong>。网站会<strong>维持 9 月 28 日的庆祝状态整整一年</strong>，倒计时到点自动换成纪念日版。随时可以发邮件，issue 统一到 <strong>2027 年清华大学强基考试之后（7 月上旬）</strong>再处理。</span>',
			'    </p>',
			'  </div>',
			'  <div class="sn-actions">',
			'    <button type="button" class="sn-btn sn-btn--primary" data-sn="ack">I know</button>',
			'    <button type="button" class="sn-btn sn-btn--ghost" data-sn="off">Don\'t show anymore</button>',
			'    <a class="sn-btn sn-btn--mail" href="mailto:contact@5guys1direction.asia?subject=Site%20maintenance%20pause">Send an email</a>',
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
