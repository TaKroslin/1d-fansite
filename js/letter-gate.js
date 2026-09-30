/* =================================================================
   FIVE GUYS ONE DIRECTION — 信件闸门（letter gate）
   -----------------------------------------------------------------
   需求：信件页在主页"之前"显示，而且是**常驻**的 ——
   每次进站都要先看到这封信，不是"看一次以后就不再显示"。

   规则（确定性，无循环）：
     · 进入 /index.html（任何入口：直接输网址、外部链接、站点内点 Home）
       且 URL 上没有转义参数  →  replace 到 pages/letter.html；
     · 信件页点"关闭信件"或按 Esc  →  回 index.html?skipletter=1，
       带参数进站，这次不拦。
   为什么用参数而不是 sessionStorage：
     · sessionStorage 会让"同一个标签页里第二次进入"就不再显示（= 看一次就没了），
       这正是要避免的；
     · 只用 document.referrer 判断"刚从信件过来"也不可靠 —— 隐私设置会剥掉
       referrer，一旦为空就会"关闭→回首页→又被跳回信件"死循环。
     · 带一个显式参数是唯一无歧义、绝不会循环的做法。

   转义阀：任何人直接把 /index.html?skipletter=1 存成书签，就能永远跳过信件。

   全局守卫：防重复绑定（RULES §2.3）
   ================================================================= */
(function () {
  "use strict";

  if (window.__5GUYS_LETTER_GATE__) return;
  window.__5GUYS_LETTER_GATE__ = true;

  var LETTER_URL = "pages/letter.html";

  /* 已经在信件页 → 别再跳（防自跳死循环） */
  if (document.querySelector("body.letter-page")) return;
  if (location.pathname.indexOf(LETTER_URL) !== -1) return;

  /* 转义阀：本次直接进站 */
  if (/[?&]skipletter=1\b/.test(location.search)) return;

  /* 常驻：每次进首页都先看信 */
  location.replace(LETTER_URL);
}());
