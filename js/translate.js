/* =================================================================
   FIVE GUYS ONE DIRECTION: Bilingual Translation Controller
   =================================================================
   - 注入一个纯文字翻译按钮到 header#sticky（左上角，logo 旁边）
   - 每页一个按钮
   - 歌词页(.panel.song-lyrics)：点击进入双语对照模式(中英堆叠)
   - 其他页面：纯中/英覆盖切换，无双语模式
   - 按钮在歌词页显示"CN/EN"，其他页显示"中文"/"EN"
   - 状态通过 localStorage 持久化，跨页保持
   ================================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "5guys1d.lang";
  var FADE_MS = 250;

  // -----------------------------------------------------------------
  // 1. Detect page type
  // -----------------------------------------------------------------
  function pageHasLyrics() {
    return !!document.querySelector(".panel.song-lyrics");
  }

  // -----------------------------------------------------------------
  // 2. Restore / persist state
  // -----------------------------------------------------------------
  function getStoredLang() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      if (v === "zh" || v === "bilingual") return v;
    } catch (e) { /* ignore */ }
    return "en";
  }

  function setStoredLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  function applyLangClass(lang) {
    var html = document.documentElement;
    html.classList.remove("lang-en", "lang-zh", "lang-bilingual", "lang-fading");
    html.classList.add("lang-" + lang);
  }

  // -----------------------------------------------------------------
  // 3. Inject ONE translate button into #sticky header (top-left)
  // -----------------------------------------------------------------
  function makeHeaderButton(isLyrics) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "translate-btn translate-btn--header";
    btn.setAttribute("aria-label", "Translate");
    btn.setAttribute("data-translate-btn", "");
    btn.setAttribute("data-mode", isLyrics ? "bilingual" : "swap");

    // Lyrics pages: static CN/EN label
    // Other pages: toggles "中文" / "EN"
    if (isLyrics) {
      btn.textContent = "CN/EN";
    } else {
      var enSpan = document.createElement("span");
      enSpan.className = "label-en";
      enSpan.textContent = "中文";
      var zhSpan = document.createElement("span");
      zhSpan.className = "label-zh";
      zhSpan.textContent = "EN";
      btn.appendChild(enSpan);
      btn.appendChild(zhSpan);
    }
    return btn;
  }

  function injectHeaderButton() {
    if (document.querySelector("[data-translate-btn]")) return;

    var sticky = document.getElementById("sticky");
    if (!sticky) return;

    var isLyrics = pageHasLyrics();
    var btn = makeHeaderButton(isLyrics);

    // Insert after the logo, before the menu button-holder
    var holder = sticky.querySelector(".button-holder");
    if (holder) {
      sticky.insertBefore(btn, holder);
    } else {
      sticky.appendChild(btn);
    }
  }

  // -----------------------------------------------------------------
  // 4. Fade transition
  // -----------------------------------------------------------------
  function fadeSwap(callback) {
    var html = document.documentElement;
    html.classList.add("lang-fading");
    setTimeout(function () {
      callback();
      html.classList.remove("lang-fading");
    }, FADE_MS);
  }

  // -----------------------------------------------------------------
  // 5. Click handler
  // -----------------------------------------------------------------
  function onClick(btn) {
    var html = document.documentElement;
    var current = "en";
    if (html.classList.contains("lang-zh")) current = "zh";
    else if (html.classList.contains("lang-bilingual")) current = "bilingual";

    var isLyrics = btn.getAttribute("data-mode") === "bilingual";
    var next;

    if (isLyrics) {
      // Lyrics: toggle en <-> bilingual only (no pure-zh mode)
      next = (current === "bilingual") ? "en" : "bilingual";
    } else {
      // Other pages: toggle en <-> zh (pure replacement)
      next = (current === "zh") ? "en" : "zh";
    }

    setStoredLang(next);
    fadeSwap(function () { applyLangClass(next); });
  }

  function bindClicks() {
    document.addEventListener("click", function (e) {
      var btn = e.target.closest && e.target.closest("[data-translate-btn]");
      if (!btn) return;
      e.preventDefault();
      onClick(btn);
    });
  }

  // -----------------------------------------------------------------
  // 6. Boot
  // -----------------------------------------------------------------
  function boot() {
    var stored = getStoredLang();
    var isLyrics = pageHasLyrics();

    // Lyrics pages: enforce en or bilingual (never pure zh)
    if (isLyrics && stored === "zh") {
      stored = "bilingual";
    }
    // Non-lyrics pages: enforce en or zh (never bilingual)
    if (!isLyrics && stored === "bilingual") {
      stored = "zh";
    }

    applyLangClass(stored);
    injectHeaderButton();
    bindClicks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
