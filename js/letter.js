/* =================================================================
   FIVE GUYS ONE DIRECTION — 站主信件页控制器（A Letter From Webmaster）
   -----------------------------------------------------------------
   形态参照 taylorswift.com/read-my-letter：一叠信纸，翻页时当前那张
   向右侧滑走、下面的纸升到顶层（1s ease-in-out，见 css/letter.css）。

   分页策略：**把每页写满**（像真的一封信），而不是一段一页。
     · 段落照原样流动，能放几段放几段；
     · 某段放不下时，用**二分查找**量出「这一页还能装它前多少个字」，
       就地切开，剩下的以续排段（.is-cont，不缩进）接到下一页；
     · 断点优先落在句末标点（。！？…）上，其次才硬切 —— 这样翻页处
       读起来像自然的换页，而不是被程序砍断。
   为什么不用"先算每页高度再切"：手写体字宽、行高、正文字号都随视口变，
   `getBoundingClientRect()` 又不含外边距，任何预估都会在某个断点溢出或留白。
   现在页边界完全由浏览器自己说了算（scrollHeight > clientHeight）。

   交互：
     · 点纸面任意处 / "下一页" / → / PageDown / 空格 / 向下滚 / 左滑 = 下一页
     · "上一页" / ← / PageUp / 向上滚 / 右滑                          = 上一页
     · Esc / "关闭信件"                                              = 回首页
   进度存 localStorage（只记读到第几页，不记"看过了"），下次进站接着读。

   全局守卫：防重复绑定（RULES §2.3）
   ================================================================= */
(function () {
  "use strict";

  if (window.__5GUYS_LETTER_CTRL__) return;
  window.__5GUYS_LETTER_CTRL__ = true;

  var data = window.__5GUYS_LETTER__;
  var KEY_PAGE = "5guys1d.letter.page";

  /* 源代码仓库：信件每一页的页脚都会显示（每一页都显示，站点的开源入口之一） */
  var REPO_URL = "https://github.com/TaKroslin/1d-fansite";
  var REPO_LABEL = "github.com/TaKroslin/1d-fansite";
  var GITHUB_SVG =
    '<svg class="gh-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">' +
    '<path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 ' +
    '0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53' +
    '.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 ' +
    '0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 ' +
    '2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 ' +
    '3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>' +
    '</svg>';

  /* 结尾三行：我曾经喜欢过。/ 我曾经认真过。/ 然后现在，我选择离开。 */
  var CLOSING = ["我曾经喜欢过。", "我曾经认真过。", "然后现在，我选择离开。"];
  var SENT_END = "。！？…";
  var TAIL_CHARS = "」』”’）】》";

  function read(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function write(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function readInt(k) { var v = parseInt(read(k), 10); return isNaN(v) ? 0 : v; }
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }

  function el(tag, cls, txt) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (txt != null) e.textContent = txt;
    return e;
  }

  /* ---------------- 纸 ----------------
     每张纸 = 抬头（仅首页）+ 正文区。正文区 .letter-body 的 padding-bottom
     在 CSS 里预留了签名栏的高度，所以每页底部留白一致，末页的签名正好落在
     那块留白里，不需要事后"挪段落腾地方"。 */
  function makeSheet(pageIndex) {
    var sheet = el("article", "letter-page-sheet");
    var inner = el("div", "letter-sheet-inner");

    if (pageIndex === 0) {
      inner.appendChild(el("div", "letter-kicker", data.kicker || "A LETTER FROM THE WEBMASTER"));
      inner.appendChild(el("h1", "letter-title", data.title || ""));
      inner.appendChild(el("div", "letter-date", data.date || ""));
    }

    var body = el("div", "letter-body");
    inner.appendChild(body);
    sheet.appendChild(inner);
    sheet.__body = body;
    sheet.__inner = inner;
    return sheet;
  }

  function makeSign() {
    var sign = el("div", "letter-sheet-sign");
    sign.appendChild(el("span", null, data.sign || "Takion"));
    sign.appendChild(el("span", null, "5guys1direction"));
    return sign;
  }

  function addPara(body, txt, cls) {
    var p = el("p", cls || null, txt);
    body.appendChild(p);
    return p;
  }

  function overflows(body) {
    /* +1 容忍亚像素舍入 */
    return body.scrollHeight > body.clientHeight + 1;
  }

  /* 二分：这一页最多还能装下 text 的前几个字。返回 0 = 一个字都放不下。 */
  function fitPrefix(body, p, text) {
    var lo = 0, hi = text.length, best = 0;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      p.textContent = text.slice(0, mid);
      if (overflows(body)) { hi = mid - 1; } else { best = mid; lo = mid + 1; }
    }
    p.textContent = text.slice(0, best);
    return best;
  }

  /* 让断点落回句末标点：在 n 之前 20% 的范围内往回找；
     找不到就按 n 硬切（中文没有词边界，字间断开是可接受的）。 */
  function gracefulCut(text, n) {
    if (n >= text.length) return n;
    var from = Math.max(0, Math.floor(n * 0.8));
    for (var i = n - 1; i >= from; i--) {
      if (SENT_END.indexOf(text.charAt(i)) !== -1) {
        var j = i + 1;
        while (j < text.length && TAIL_CHARS.indexOf(text.charAt(j)) !== -1) j++;
        return j;
      }
    }
    return n;
  }

  /* -----------------------------------------------------------------
     末页签名栏。
     签名栏是绝对定位的（不参与 flex），所以只能靠给末页的正文加
     `.has-sign`（padding-bottom）来预留位置。加完若这一页装不下，
     就把它的最后一段挪到新的一页 —— 于是新的一页成为末页，循环直到装下。
     好处：**非末页完全不预留**，每页都能写满；只有真正的末页空出那一条。
     ----------------------------------------------------------------- */
  function attachSign(stack, sheets) {
    var guard = 0;
    while (guard++ < 60) {
      var last = sheets[sheets.length - 1];
      last.classList.add("has-sign");
      if (!last.__sign) {
        last.__sign = makeSign();
        last.appendChild(last.__sign);
      }
      if (!overflows(last.__body)) return sheets;

      var ps = last.__body.querySelectorAll("p");
      if (!ps.length) return sheets;   /* 空页仍溢出（不该发生）→ 就此打住 */

      if (ps.length === 1) {
        /* 只剩一段还溢出：就地二分切开，把后半段挪到新页 */
        var only = ps[0];
        var txt = only.textContent;
        var n = fitPrefix(last.__body, only, txt);
        if (n > 0 && n < txt.length) {
          var cut = gracefulCut(txt, n);
          only.textContent = txt.slice(0, cut);
          var restSheet = makeSheet(sheets.length);
          stack.appendChild(restSheet);
          addPara(restSheet.__body, txt.slice(cut), "is-cont");
          sheets.push(restSheet);
          continue;
        }
        return sheets;   /* 切不动了，认了（overflow:hidden 兜底） */
      }

      /* 多段：把最后一段整段挪到新页 */
      var moved = ps[ps.length - 1];
      var mTxt = moved.textContent;
      var mCls = moved.className;
      last.__body.removeChild(moved);
      var nu = makeSheet(sheets.length);
      stack.appendChild(nu);
      addPara(nu.__body, mTxt, mCls);
      sheets.push(nu);
    }
    return sheets;
  }

  /* -----------------------------------------------------------------
     把队列里的内容写满每一页。queue 元素：{ text, cls }
     ----------------------------------------------------------------- */
  function flow(stack, queue) {
    var sheets = [];
    var guard = 0;

    while (queue.length && guard++ < 300) {
      var sheet = makeSheet(sheets.length);
      var body = sheet.__body;
      /* 必须先入 DOM —— 不在文档里的元素 scrollHeight 恒为 0 */
      stack.appendChild(sheet);

      var filled = 0;
      while (queue.length) {
        var item = queue[0];
        var p = addPara(body, item.text, item.cls);

        if (!overflows(body)) {
          queue.shift();
          filled++;
          continue;
        }

        /* 放不下：量出本页还能装多少字 */
        var n = fitPrefix(body, p, item.text);

        if (n >= item.text.length) {
          /* 其实装得下（overflow 来自舍入） */
          queue.shift();
          filled++;
          continue;
        }
        if (n <= 0) {
          /* 一个字都放不下 = 本页已满 */
          body.removeChild(p);
          break;
        }

        var cut = gracefulCut(item.text, n);
        p.textContent = item.text.slice(0, cut);
        queue[0] = { text: item.text.slice(cut), cls: "is-cont" };
        filled++;
        break; /* 本页写满 */
      }

      sheets.push(sheet);
      if (!filled) { break; } /* 死循环保护 */
    }

    sheets = attachSign(stack, sheets);

    /* 正文里凡是出现仓库地址的地方，都变成可点链接。
       放在分页**之后**统一处理：分页会反复重写 p.textContent（二分查找、断句），
       中途插进去的 <a> 会被 textContent 覆盖掉，所以只能在最终文本定下来后再 linkify。 */
    var ps = stack.querySelectorAll(".letter-body p");
    for (var k = 0; k < ps.length; k++) linkifyRepo(ps[k]);

    /* 每张纸的页脚：左下角 GitHub 仓库链接，右下角页码。
       仓库链接**每一页都有**，所以正文区在 CSS 里给所有纸
       预留了一条 padding-bottom，不是只有末页。 */
    sheets.forEach(function (s, i) {
      var repo = el("a", "letter-sheet-repo");
      repo.href = REPO_URL;
      repo.target = "_blank";
      repo.rel = "noopener";
      repo.setAttribute("aria-label", "Source code on GitHub");
      repo.title = "Source code on GitHub";
      repo.innerHTML = GITHUB_SVG + '<span class="letter-sheet-repo-label">' + REPO_LABEL + "</span>";
      s.appendChild(repo);

      var num = el("div", "letter-sheet-num", (i + 1) + " / " + sheets.length);
      s.appendChild(num);
    });
    return sheets;
  }

  /* 把段落里出现的仓库地址替换成 <a>，其余文字原样保留。
     只替换第一处即可（信里一段最多提一次）。 */
  function linkifyRepo(p) {
    var txt = p.textContent;
    var at = txt.indexOf(REPO_LABEL);
    if (at === -1) return;
    var a = el("a", "letter-body-link", REPO_LABEL);
    a.href = REPO_URL;
    a.target = "_blank";
    a.rel = "noopener";
    p.textContent = "";
    p.appendChild(document.createTextNode(txt.slice(0, at)));
    p.appendChild(a);
    p.appendChild(document.createTextNode(txt.slice(at + REPO_LABEL.length)));
  }

  /* -----------------------------------------------------------------
     渲染层：按当前页给每张纸标 depth（决定旋转/位置/显隐）
       depth 0    = 顶层（正在读的那张）
       depth 1..3 = 叠在下面的纸（轻微旋转偏移，形成"一叠信"）
       depth -1/-2 = 已翻过 / 正在离场（滑到右侧外面）
     ----------------------------------------------------------------- */
  function makeRenderer(sheets) {
    return function render(cur, animate) {
      sheets.forEach(function (s, i) {
        var d = i - cur;
        var key;
        if (d === 0) key = "0";
        else if (d === -1) key = "-1";
        else if (d < -1) key = "-2";
        else if (d <= 3) key = String(d);
        else key = "hid";

        if (!animate) s.style.transition = "none";
        s.setAttribute("data-depth", key);
        s.setAttribute("aria-hidden", d === 0 ? "false" : "true");
        if (!animate) {
          void s.offsetHeight;   /* 强制回流，避免"关过渡"被合并掉 */
          s.style.transition = "";
        }
      });
    };
  }

  /* -----------------------------------------------------------------
     交互
     ----------------------------------------------------------------- */
  function wire(sheets) {
    var stack = document.getElementById("letterStack");
    var stage = document.getElementById("letterStage");
    var total = sheets.length;
    var render = makeRenderer(sheets);
    var cur = clamp(readInt(KEY_PAGE), 0, total - 1);

    var counter = document.getElementById("letterCounter");
    var prevBtn = document.getElementById("letterPrev");
    var nextBtn = document.getElementById("letterNext");
    var hint = document.getElementById("letterHint");

    function show(n, animate) {
      cur = clamp(n, 0, total - 1);
      render(cur, animate !== false);
      prevBtn.disabled = cur === 0;
      nextBtn.disabled = cur === total - 1;
      counter.textContent = (cur + 1) + " / " + total;
      if (hint) hint.classList.toggle("is-off", cur === total - 1);
      write(KEY_PAGE, String(cur));
    }

    function next() { if (cur < total - 1) show(cur + 1); }
    function prev() { if (cur > 0) show(cur - 1); }

    prevBtn.addEventListener("click", function (e) { e.stopPropagation(); prev(); });
    nextBtn.addEventListener("click", function (e) { e.stopPropagation(); next(); });

    /* 点纸面前进（参考页的整页 overlay 行为） */
    var overlay = el("div", "letter-overlay");
    overlay.setAttribute("aria-label", "下一页");
    overlay.addEventListener("click", next);
    stack.appendChild(overlay);

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === "PageDown" || e.key === " ") { next(); e.preventDefault(); }
      else if (e.key === "ArrowLeft" || e.key === "PageUp") { prev(); e.preventDefault(); }
      else if (e.key === "Escape") { goHome(); }
    });

    /* 滚轮：节流，避免一次滚过好几页 */
    var lock = false;
    stage.addEventListener("wheel", function (e) {
      if (lock || Math.abs(e.deltaY) < 12) return;
      lock = true;
      (e.deltaY > 0 ? next : prev)();
      setTimeout(function () { lock = false; }, 620);
    }, { passive: true });

    /* 触摸左右滑 */
    var sx = 0, sy = 0, tracking = false;
    stage.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (!tracking) return;
      tracking = false;
      var dx = e.changedTouches[0].clientX - sx;
      var dy = e.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 54 && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? next : prev)();
    }, { passive: true });

    show(cur, false);
  }

  function goHome() {
    /* 只记页码，不记"看过了" —— 下次进站仍然默认读这封信 */
    location.replace("../index.html?skipletter=1");
  }

  function fallback() {
    document.body.innerHTML =
      '<div class="letter-fallback">信件加载失败。<br />' +
      '<a href="../index.html?skipletter=1">返回首页</a></div>';
  }

  function boot() {
    var stack = document.getElementById("letterStack");
    var stage = document.getElementById("letterStage");
    if (!stack || !stage) { fallback(); return; }

    var paras = (data && data.paragraphs) || [];
    if (!paras.length) { fallback(); return; }

    try {
      stack.classList.add("is-building");
      var queue = paras.map(function (t) {
        return { text: t, cls: CLOSING.indexOf(t) !== -1 ? "is-closing" : null };
      });
      var sheets = flow(stack, queue);
      if (!sheets.length) { fallback(); return; }
      stack.classList.remove("is-building");

      /* 底部黑带：提示 + 控制条整块放，保证按钮落在黑底上（不在黄纸上） */
      var bottom = el("div", "letter-bottom");

      var hint = el("div", "letter-hint", "点击纸面继续");
      hint.id = "letterHint";
      bottom.appendChild(hint);

      var ctrls = el("div", "letter-controls");
      ctrls.innerHTML =
        '<button type="button" class="letter-btn" id="letterPrev">‹ 上一页</button>' +
        '<span class="letter-counter" id="letterCounter">1 / 1</span>' +
        '<button type="button" class="letter-btn" id="letterNext">下一页 ›</button>';
      bottom.appendChild(ctrls);

      stage.appendChild(bottom);

      var exit = el("a", "letter-btn letter-exit", "关闭信件，进入网站");
      exit.href = "../index.html?skipletter=1";
      stage.appendChild(exit);

      wire(sheets);
    } catch (e) {
      if (window.console) console.error(e);
      fallback();
    }
  }

  function init() {
    if (!data) { fallback(); return; }
    /* ⚠️ 必须**主动**把字体加载出来再分页，不能只等 document.fonts.ready。
       原因：fonts.ready 只等"已经在下载中"的字体。首次访问时 DOM 里还没有任何
       元素用到手写体，浏览器根本没开始下载 ⇒ fonts.ready 立刻 resolve ⇒
       我们拿回退字体（文楷）的行高去分页，字体换上后行数全变。
       症状很隐蔽：首次访问 12 页、刷新后 11 页（缓存命中时才量对）。
       所以先 fonts.load() 把真实字体拉下来，再等 ready。 */
    var fams = ['1em "Hardpen Xingshu"', '1em "LXGW WenKai Mono"', '1em "LXGW WenKai"'];
    if (document.fonts && document.fonts.load) {
      var jobs = fams.map(function (f) {
        try {
          var p = document.fonts.load(f);
          return p && p.then ? p : Promise.resolve();
        } catch (e) { return Promise.resolve(); }
      });
      Promise.all(jobs).then(function () {
        return document.fonts.ready;
      }).then(boot, boot);
    } else if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(boot, boot);
    } else {
      boot();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}());
