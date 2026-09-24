/* =================================================================
   Larry 9-28 · 阶段 B：Polaroid 照片墙
   -----------------------------------------------------------------
   依据 docs/larry-9-28-polaroid-wall-design.md v1.1 + 作者手绘设计图
   - 一个索引 + 一个轨道，桌面/移动只差 step / 旋转 / z-index
   - 循环用"模运算窗口"实现（不克隆 DOM）：d = ((i-index+N/2)%N)-N/2
   - 卡片不可点，只有底部 CTA 是链接
   原生 JS，零 jQuery（demo 壳里没有 jQuery，线上有也照跑）
   ================================================================= */
(function () {
	"use strict";

	if (window.__5GUYS_LARRY_POLA__) return;
	window.__5GUYS_LARRY_POLA__ = true;

	/* 40 张裁图：pola-NN ↔ 相册 larry-N（顺序完全一致）
	   题注为"与照片相关的短词"（图纸要求；示例 "Love you!" / "Gotcha !"），逐张看图后写。 */
	var IMG_PREFIX = "images/gfx/larry-anniv-2026/pola-";
	var POLAROIDS = [
		{ cap: "arms around",        zh: "勾肩搭背" },
		{ cap: "laughing",           zh: "笑开了" },
		{ cap: "through glass",      zh: "隔着玻璃看你" },
		{ cap: "silly face",         zh: "吐舌头那张" },
		{ cap: "on the balcony",     zh: "倚着栏杆" },
		{ cap: "head down",          zh: "低头笑了" },
		{ cap: "cheek kiss",         zh: "黑白的笑" },
		{ cap: "polaroid booth",     zh: "亲了一下" },
		{ cap: "foreheads",          zh: "眉眼" },
		{ cap: "face to face",       zh: "黑白的吻" },
		{ cap: "big grins",          zh: "笑到变形" },
		{ cap: "cheek kiss",         zh: "大笑那张" },
		{ cap: "just us two",        zh: "脸贴脸" },
		{ cap: "a rose",             zh: "衔着玫瑰" },
		{ cap: "lifted hug",         zh: "把你抱起来" },
		{ cap: "that night",         zh: "张大嘴" },
		{ cap: "your shoulder",      zh: "借你肩膀" },
		{ cap: "matching faces",     zh: "一个表情" },
		{ cap: "back to back",       zh: "背贴背" },
		{ cap: "I'm with him",       zh: "T 恤上写着答案" },
		{ cap: "hand in hand",       zh: "你站着我坐着" },
		{ cap: "chin up",            zh: "托你一下" },
		{ cap: "guess who",          zh: "让我猜猜" },
		{ cap: "same stripes",       zh: "同款条纹同款赞" },
		{ cap: "side by side",       zh: "一起走" },
		{ cap: "braces",             zh: "那条背带" },
		{ cap: "in the water",       zh: "在水里笑" },
		{ cap: "first snow",         zh: "雪场那张" },
		{ cap: "hoodies",            zh: "渔夫帽" },
		{ cap: "on stage",           zh: "侧脸剪影" },
		{ cap: "the long hug",       zh: "长抱" },
		{ cap: "hug on stage",       zh: "台上抱住" },
		{ cap: "sleepy",             zh: "躺在沙发上" },
		{ cap: "eyes closed",        zh: "在车里" },
		{ cap: "with the camera",    zh: "镜中那张" },
		{ cap: "in the dark",        zh: "暗角自拍" },
		{ cap: "singing",            zh: "一起笑" },
		{ cap: "waving",             zh: "朝镜头挥手" },
		{ cap: "arms crossed",       zh: "环着你" },
		{ cap: "on the steps",       zh: "台阶上晒太阳" }
	];

	/* 桌面每张的倾斜与垂直错落：固定表，不用 Math.random（否则每次刷新排布都变） */
	var TILT = [-9, 5, -6, 8];
	var DY   = [10, -8, 14, -6];

	var panel = document.querySelector(".larry-pola");
	if (!panel) return;
	var track = panel.querySelector(".larry-pola-track");
	var view = panel.querySelector(".larry-pola-view");
	var prev = panel.querySelector(".larry-pola-arrow--prev");
	var next = panel.querySelector(".larry-pola-arrow--next");
	if (!track || !view) return;

	var N = POLAROIDS.length;
	var MOBILE = window.matchMedia("(max-width: 767px)");
	var cards = [];
	var leaving = null;      /* 刚翻出去的那张：先滑到牌堆最下层、动画结束再隐藏（不瞬间消失） */
	var order = [];         /* 牌堆顺序：order[0] 是最上面那张（= 参考库数组的末尾） */
	var drag = null;
	var outEls = [];        /* 正在"冲出去"的被甩出卡（两段式：先冲出去、再滑回牌堆位） */
	var wantZ = [];         /* 每张牌"应该"的层叠值；甩牌时延后到两卡互不重叠的那一刻再写 */
	var zTimer = null;
	var prevSlot = [];      /* 桌面用：上一次的槽位 */
	var index = 0;
	var wheelLock = 0;
	var timer = null;
	var done = false;

	/* 相框蓝绿：固定种子的伪随机 + 修正相邻重复 → 蓝绿各半、相邻必不同色
	   （两块同色并排会在轨道上连成一片色块，把"逐张翻看"的节奏压塌） */
	function framePlan(n) {
		var seed = 20260928, out = [];
		for (var i = 0; i < n; i++) {
			seed = (seed * 1103515245 + 12345) & 0x7fffffff;
			out.push((seed >> 16) & 1);
		}
		for (var j = 1; j < n; j++) {
			if (out[j] === out[j - 1]) out[j] = out[j] ^ 1;
		}
		return out;   /* 0 = blue, 1 = green */
	}

	function build() {
		var plan = framePlan(N);
		var frag = document.createDocumentFragment();
		for (var i = 0; i < N; i++) {
			var el = document.createElement("div");
			el.className = "larry-pola-card larry-pola-card--" + (plan[i] ? "green" : "blue");
			var img = document.createElement("img");
			img.className = "larry-pola-img";
			img.loading = "lazy";
			img.draggable = false;
			img.alt = POLAROIDS[i].cap;
			img.src = IMG_PREFIX + ("0" + (i + 1)).slice(-2) + ".jpg";
			var cap = document.createElement("p");
			cap.className = "larry-pola-cap";
			var en = document.createElement("span");
			en.className = "en";
			en.textContent = POLAROIDS[i].cap;
			var zh = document.createElement("span");
			zh.className = "zh";
			zh.textContent = POLAROIDS[i].zh;
			cap.appendChild(en);
			cap.appendChild(zh);
			el.appendChild(img);
			el.appendChild(cap);
			frag.appendChild(el);
			cards.push(el);
		}
		track.appendChild(frag);
	}

	/* 冲出去结束 → 第二段：撤销外冲位移（滑回牌堆位），并装上弧线动画 */
	function clearYield() {
		for (var i = 0; i < N; i++) {
			var el = outEls[i];
			if (!el) continue;
			el.style.setProperty("--dur", ".34s");
			el.style.setProperty("--ease", "cubic-bezier(.3,1.25,.5,1)");
			el.style.setProperty("--drag-x", "0px");
			el.style.setProperty("--lift-max", "10px");
			el.style.setProperty("--over-max", "3deg");
			el.classList.remove("is-arc");
			void el.offsetWidth;
			el.classList.add("is-arc");
			outEls[i] = null;
		}
	}

	function applyZ() {
		if (zTimer) { window.clearTimeout(zTimer); zTimer = null; }
		clearYield();                       /* 层叠一旦落定，让位必然已结束 —— 不允许残留 */
		for (var i = 0; i < N; i++) cards[i].style.zIndex = wantZ[i];
	}

	/* deferZ：不立刻写 z-index，改到 150ms 后。甩牌时卡片正带着动量飞出去，
	   那时它和新中间卡相距约 240px（毫无重叠）⇒ 层叠切换完全看不见。 */
	function render(deferZ) {
		var mobile = MOBILE.matches;
		if (!order.length) for (var k = 0; k < N; k++) order.push(k);
		var half = N / 2;

		/* 移动端扇形要居中：卡片是 left:0 + translateX，d=0 会停在轨道左边缘。
		   偏移量用**量出来的 px**，不用百分比 —— 百分比在 transform/width 两个上下文
		   解析基准不同（就是 --pola-step 那次踩的坑）。自定义属性会从 track 继承到卡片。 */
		var center = 0;
		if (mobile && cards[0]) {
			center = Math.max(0, (track.clientWidth - cards[0].offsetWidth) / 2);
		}
		track.style.setProperty("--pola-center", center + "px");

		for (var i = 0; i < N; i++) {
			var d = ((i - index + half) % N + N) % N - half;
			var el = cards[i];
			var mult, px, tilt, dy, z, hidden, flipping = false;

			/* 移动端：这是"翻卡片"，不是淡入淡出 —— 全程 opacity 恒为 1，
			   进出的卡靠**几何与层叠**隐藏，而不是靠透明度。 */
			if (mobile) {
				/* ★ 牌堆（照搬 image-card-stack）：每张牌的"深度"= 它在牌堆里排第几。
				   层叠变化 = 深度变化（rotateZ 每层 +4°、scale 每层 −6%），而深度是连续可动画的量，
				   所以换牌时其他牌只是轻轻转一点、缩一点，绝不会跳变或乱飞。 */
				var pos = order.indexOf(i);
				var isLeaving = (leaving && leaving.idx === i);
				var deep = isLeaving ? 1 : Math.min(pos, 4);   /* 离场那张：就近让开一格 */
				if (isLeaving) {
					/* 离场那张：留在**自己那一侧的最靠后一槽**（深度 4），动画跑完再隐藏 ——
					   读起来就是"滑到自己那侧的牌堆后面去了"，与方向无关、也不需要特殊坐标。 */
					deep = 4;
					z = 1;
					hidden = false;
					el.style.setProperty("--dur", ".5s");
					el.style.setProperty("--delay", "0ms");
								} else {
					/* 统一时长 + 按层轻错开（级联，不显得"粘在一起"）+ 温和弹簧（不过冲、不抖） */
					el.style.setProperty("--dur", ".46s");
					el.style.setProperty("--delay", (deep * 30) + "ms");
				}
				el.style.setProperty("--ease", "cubic-bezier(.3,1.12,.42,1)");
				mult = 0; px = 0; dy = 0;
				/* ★ 左右对称的扇形（5 张：中间 + 左右各 2）
				   关键：**每张牌的左右侧固定**（按索引奇偶），深度只决定"离中心多远"
				   —— 位置 = ceil(深度/2) 号槽位（近槽 48px / 远槽 88px）。
				   这样翻牌时每张牌只会**朝中心靠近一格，永不横跨到另一侧**
				   （交替布局的旧写法每次有 2~3 张要跨 96~176px，正是作者说的"飞得太远"）。
				   又因为牌序始终是原序列的循环移位，相邻两张索引奇偶必然交替 ⇒ 两侧张数天然相等 ⇒ 完全对称。 */
				var side = (i % 2 === 0) ? -1 : 1;
				var slot = Math.ceil(deep / 2);                       /* 0=中心 1=近 2=远 */
				var FAN = [[0, 0, 0, 1],
				           [side * 48, 7, side * 13, .95],
				           [side * 88, 14, side * 23, .90]];
				var f = FAN[slot];
				el.style.setProperty("--fan-x", f[0] + "px");
				el.style.setProperty("--fan-y", f[1] + "px");
				el.style.setProperty("--fan-rot", f[2] + "deg");
				el.style.setProperty("--fan-scale", String(f[3]));
				/* 叠一点点每张自己的歪斜（桌面那张表的 0.4 倍），扇形才不显得机械 */
				tilt = TILT[((i % 4) + 4) % 4] * 0.4;
				if (!isLeaving) {
					z = N - pos;                   /* 越靠上 z 越高 */
					hidden = pos > 4;              /* 扇形露 5 张：中间 + 左右各 2 */
				}
				el.style.setProperty("--depth", String(deep));
				el.style.setProperty("--depth-scale", "1");
			} else {
				mult = d;                                   /* 桌面：4 张铺满，超出被视口裁掉 */
				px = 0;
				el.style.setProperty("--depth", "0");        /* 桌面必须清零，否则从窄屏切回来会带着堆叠歪斜 */
				el.style.setProperty("--fan-x", "0px");
				el.style.setProperty("--fan-y", "0px");
				el.style.setProperty("--fan-rot", "0deg");
				el.style.setProperty("--fan-scale", "1");
				tilt = TILT[((i % 4) + 4) % 4];
				dy = DY[((i % 4) + 4) % 4];
				z = 1;
				hidden = Math.abs(d) > 5;
			}

			el.style.setProperty("--d", mult);
			el.style.setProperty("--px", px + "px");
			el.style.setProperty("--tilt", tilt + "deg");
			el.style.setProperty("--dy", dy + "px");
			/* 深度缩放：越靠后的牌越小一点（参考 image-card-stack 的 rotateZ/scale 深度关系，
			   那里是每层 6%，我们取 2.5% 更克制，避免和扇形角度打架） */
			el.style.setProperty("--depth-scale", mobile ? String(1 - deep * 0.025) : "1");
			/* 自愈：任何一次 render 都把"不在本次让位、也不在拖拽中"的卡片临时偏移清零。
			   否则上一次让位/拖拽的残留会把布局卡歪（曾出现卡片横穿整个扇形的 bug）。 */
			if (!flipping && !(drag && drag.card === el)) {
				el.style.setProperty("--drag-x", "0px");
				el.style.setProperty("--ry", "0deg");
				el.style.setProperty("--pop", "1");
				el.style.setProperty("--lift", "0px");
			}
			wantZ[i] = z;
			if (!deferZ) el.style.zIndex = z;
			el.style.opacity = 1;

			/* 翻卡弧线 + 分级节奏：只有"真的换了槽位"的牌才抬起来。
			   三张牌**不能同时动**（作者反馈"粘在一起、一点都不自然"）：
			   - 被甩出去的那张：立刻动、时长略长（有动量、在空中待得久）
			   - 顶上来接位的那张：晚 ~110ms 才动（它是被让开后跟上来的）
			   - 从牌堆里钻出来的那张：再晚一点（~190ms），它只挪 2px，是跟随动作
			   这就是动画里的 overlapping action：错开时长与起点，三张牌才是独立的。 */
			if (prevSlot[i] !== undefined && prevSlot[i] !== mult && !mobile) {
				/* 桌面端换槽时挂"抬起→回落"的弧线；移动端是牌堆，节奏统一由上面的 --dur/--delay 控制。 */
				el.style.setProperty("--lift-max", prevSlot[i] === 0 ? "24px" : "13px");
				el.style.setProperty("--over-max", (mult < prevSlot[i] ? "-5deg" : "5deg"));
				el.classList.remove("is-arc");
				void el.offsetWidth;
				el.classList.add("is-arc");
			}
			prevSlot[i] = mult;
			el.style.visibility = hidden ? "hidden" : "visible";
			/* 只有真正远在视口外的卡才关过渡：模运算窗口在边界会把 d 从 +N/2 跳到 -N/2 */
			el.style.transition = hidden ? "none" : "";
			/* will-change 只给真正在动的：牌堆里的可见窗口 + 离场那张。
			   旧写法按 |d| ≤ 3 判定，但牌堆模型里 d 与可见窗口已脱钩 ⇒ 真的在动的牌反而没有合成层（掉帧）。 */
			var moving = mobile ? (pos <= 5 || isLeaving) : (d >= -1 && d <= 5);
			el.style.willChange = moving ? "transform" : "auto";
		}
	}

	function go(step, deferZ) {
		index = ((index + step) % N + N) % N;
		if (deferZ) {
			render(true);
			if (zTimer) window.clearTimeout(zTimer);
			/* 层叠切换放在运动过程中：两张牌都在动的时候换层，比静止时换更不易察觉 */
			/* 两卡相距最远的时刻（外冲到位）切层叠，随后滑回 */
			zTimer = window.setTimeout(function () { clearYield(); applyZ(); }, 190);
		} else {
			render(false);
		}
	}

	function onKey(e) {
		var t = e.target;
		if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
		if (e.key === "ArrowRight") { go(1); e.preventDefault(); }
		else if (e.key === "ArrowLeft") { go(-1); e.preventDefault(); }
	}

	function bind() {
		if (prev) prev.addEventListener("click", function () { go(-1); });
		if (next) next.addEventListener("click", function () { go(1); });

		/* 键盘只在面板至少一半可见时生效，避免劫持整页方向键 */
		if ("IntersectionObserver" in window) {
			new IntersectionObserver(function (entries) {
				var seen = entries[0].isIntersecting;
				if (seen && !done) { document.addEventListener("keydown", onKey); done = true; }
				else if (!seen && done) { document.removeEventListener("keydown", onKey); done = false; }
			}, { threshold: 0.5 }).observe(panel);
		}

		/* 桌面滚轮横向：只在横向意图明显时拦截，纵向手势交还页面 */
		view.addEventListener("wheel", function (e) {
			if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 4) return;
			e.preventDefault();
			var now = Date.now();
			if (now - wheelLock < 260) return;
			wheelLock = now;
			go(e.deltaX > 0 ? 1 : -1);
		}, { passive: false });

		/* 手势：**不跟手**。按下只记录起点，松开时若横向划动超过阈值（≈0.2 卡宽 ≈27px）
		   就翻一张；划得不够就什么都不做。卡片在按下/划动过程中完全不动、也不倾斜 ——
		   作者要求"轻轻一划就可以翻"，不要跟手拖拽的那种黏手感和 3D 倾斜。 */
		var sx = null, sy = null;

		function topCard() { return cards[order[0]]; }

		/* 翻一张（方向感知）：右滑 → 把**左侧**最近那张弄上来；左滑 → 把**右侧**最近那张弄上来。
		   每张牌的左右侧固定（索引奇偶），所以做法是"窗口沿牌堆滑动 1 格或 2 格"
		   —— 目标侧最近的那张若在第 1 层就滑 1 格、在第 2 层就滑 2 格。
		   这样每张牌只在自己那一侧朝中心挪一步，**永不横跨到另一侧**（--fan-x 的符号全程不变）。 */
		function flipDeck(dir) {
			var wantSide = (dir > 0) ? -1 : 1;          /* 右滑要左侧牌(-1)；左滑要右侧牌(+1) */
			var step = 1;
			for (var k = 1; k <= 2; k++) {
				var idx = order[k];
				if (!idx && idx !== 0) break;
				if (((idx % 2 === 0) ? -1 : 1) === wantSide) { step = k; break; }
			}
			var went = order[0];
			for (var m = 0; m < step; m++) order.push(order.shift());
			leaving = { idx: went };
			render();
			window.setTimeout(function () { leaving = null; render(); }, 620);
		}

		view.addEventListener("pointerdown", function (e) {
			if (!MOBILE.matches) { sx = e.clientX; sy = e.clientY; }
			else { sx = e.clientX; sy = e.clientY; }
		});
		view.addEventListener("pointerup", function (e) {
			if (sx === null) return;
			var dx = e.clientX - sx, dy = e.clientY - sy;
			if (MOBILE.matches) {
				var card = topCard();
				var TH = Math.max(22, (card ? card.offsetWidth : 133) * 0.2);   /* 轻扫即翻（≈27px） */
				if (Math.abs(dx) > TH || Math.abs(dy) > TH) flipDeck(dx < 0 ? -1 : 1);   /* 左滑=-1 / 右滑=+1 */
			} else if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
				go(dx < 0 ? 1 : -1);                     /* 桌面：整轨方向判定 */
			}
			sx = null; sy = null;
		});
		view.addEventListener("pointercancel", function () { sx = null; sy = null; });

		/* 断点切换：重算呈现方式（保留当前索引） */
		var onMq = function () { render(); };
		if (MOBILE.addEventListener) MOBILE.addEventListener("change", onMq);
		else if (MOBILE.addListener) MOBILE.addListener(onMq);
		window.addEventListener("resize", function () {
			if (timer) window.clearTimeout(timer);
			timer = window.setTimeout(render, 120);
		});
	}

	build();
	for (var k = 0; k < cards.length; k++) {
		cards[k].addEventListener("animationend", function () { this.classList.remove("is-arc"); this.classList.remove("is-flip"); });
	}
	render();
	bind();
}());
