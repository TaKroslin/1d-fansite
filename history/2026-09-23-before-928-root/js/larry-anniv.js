/* =================================================================
   Larry 9-28 纪念日 · Phase 1 倒计时
   =================================================================
   - 目标时刻 2026-09-28 00:00 +08:00，精确到秒，原生 JS（零 jQuery）
   - 自我校正对齐整秒，避免 setInterval 的累积漂移
   - 到点后冻结、加 is-live、派发 larry:anniv-live，供 Phase 2 套件接管切换
   - 与 Phase 2 共用全局守卫 window.__5GUYS_LARRY_ANNIV__
   ================================================================= */
(function () {
	"use strict";

	if (window.__5GUYS_LARRY_ANNIV__) return;
	window.__5GUYS_LARRY_ANNIV__ = true;

	/* 常量 epoch：不依赖运行时 locale / 格式解析 */
	var TARGET = Date.parse("2026-09-28T00:00:00+08:00");

	var num = null;
	var timer = null;
	var done = false;

	function pad(n) {
		return (n < 10 ? "0" : "") + n;
	}

	function tick() {
		timer = null;

		var left = TARGET - Date.now();
		if (left < 0) left = 0;

		var sec = Math.floor(left / 1000);
		num.d.textContent = pad(Math.floor(sec / 86400));
		num.h.textContent = pad(Math.floor(sec % 86400 / 3600));
		num.m.textContent = pad(Math.floor(sec % 3600 / 60));
		num.s.textContent = pad(sec % 60);

		if (left === 0) {
			if (!done) {
				done = true;
				document.querySelector(".larry-cd").classList.add("is-live");
				/* Phase 2 正式套件就位后监听此事件即可接管 */
				document.dispatchEvent(new CustomEvent("larry:anniv-live"));
			}
			return;
		}

		timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
	}

	function init() {
		var panel = document.querySelector(".larry-cd");
		if (!panel) return;

		var nodes = document.querySelectorAll(".larry-cd-num[data-unit]");
		var found = {};
		for (var i = 0; i < nodes.length; i++) {
			found[nodes[i].getAttribute("data-unit")] = nodes[i];
		}
		if (!found.d || !found.h || !found.m || !found.s) return;
		num = found;

		/* 后台标签页加载时不跑定时器，回到前台由 visibilitychange 补算 */
		if (document.hidden) return;
		tick();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init);
	} else {
		init();
	}

	/* 后台页的定时器会被浏览器节流；隐藏时停掉，回到前台立即补算 */
	document.addEventListener("visibilitychange", function () {
		if (document.hidden) {
			if (timer) { window.clearTimeout(timer); timer = null; }
		} else if (num && !done && !timer) {
			tick();
		}
	});
}());
