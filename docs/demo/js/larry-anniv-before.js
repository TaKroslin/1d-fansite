/* =================================================================
   Larry 9-28 顶部套件 · 阶段 A：倒计时 panel
   原生 JS，零 jQuery。合并进线上时作为独立文件引入（或并入页面底部脚本）。
   ================================================================= */
(function () {
	"use strict";

	/* 设计稿 §6.3：Phase 1 / Phase 2 共用同一个全局守卫 */
	if (window.__5GUYS_LARRY_ANNIV__) return;
	window.__5GUYS_LARRY_ANNIV__ = true;

	/* 目标时刻：2026-09-28 00:00 +08:00。用常量 epoch，避免本地时区与格式解析差异。 */
	var TARGET = Date.parse("2026-09-28T00:00:00+08:00");

	/* === DEMO ONLY — 合并前删除 ===
	   ?larry-live=1 把目标挪到 1 秒前，用于预览「到点之后」的状态，
	   边界用例不必等到 9-28 才能验证。 */
	if (/[?&]larry-live=1\b/.test(location.search)) TARGET = Date.now() - 1000;

	var panel = document.querySelector(".larry-cd");
	if (!panel) return;

	var num = {};
	var nodes = document.querySelectorAll(".larry-cd-num[data-unit]");
	for (var i = 0; i < nodes.length; i++) {
		num[nodes[i].getAttribute("data-unit")] = nodes[i];
	}
	if (!num.d || !num.h || !num.m || !num.s) return;

	var done = false;

	function pad(n) {
		return (n < 10 ? "0" : "") + n;
	}

	function tick() {
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
				panel.classList.add("is-live");
				/* Phase 2 的切换钩子：正式套件就位后监听这个事件即可，今天不写 Phase 2 逻辑。 */
				document.dispatchEvent(new CustomEvent("larry:anniv-live"));
			}
			return;
		}

		/* 自我校正：对齐到下一个整秒，避免 setInterval 的累积漂移 */
		window.setTimeout(tick, 1000 - (Date.now() % 1000));
	}

	tick();
}());



/* 小说卡：hover 按钮时显示白色外框（gallery 卡由 main.js 处理，
   但 main.js 的选择器只覆盖 .gallery-cover，所以这里补一份同样行为的） */
(function () {
	var panel = document.querySelector('.panel.novel-feature-card');
	if (!panel) return;
	var trigger = panel.querySelector('a.more') || panel;
	trigger.addEventListener('mouseenter', function () { panel.classList.add('hover'); });
	trigger.addEventListener('mouseleave', function () { panel.classList.remove('hover'); });
})();
