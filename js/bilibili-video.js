/* FIVE GUYS ONE DIRECTION: bilibili video card loader
   - Replaces the thumbnail cover of .bilibili-card with a bilibili iframe on click
   - No autoplay: iframe loads paused until the visitor presses play inside it
   - Guarded so re-including the script never binds twice
   - Uses event delegation so it works in both .en and .zh blocks */
(function () {
  "use strict";

  if (window.__5GUYS_BILI_VIDEO__) return;
  window.__5GUYS_BILI_VIDEO__ = true;

  function embed($link) {
    var $card = $link.closest(".bilibili-card");
    if (!$card.length || $card.find("iframe").length) return;
    var src = $link.data("bilibili-src") || "";
    if (!src) return;
    var $frame = $(
      '<iframe src="' + src +
      '" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"></iframe>'
    );
    $card.find(".bilibili-play").hide();
    $card.append($frame);
    $frame.fadeIn(500);
  }

  $(document).ready(function () {
    $(document).on("click", "a.bilibili-play", function (e) {
      e.preventDefault();
      embed($(this));
    });
  });
})();
