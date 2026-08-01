/**
 * FIVE GUYS ONE DIRECTION — photos slideshow extras
 * ------------------------------------------------
 * 1. Belt-and-braces z-index boost: cycle2 gives the ACTIVE slide an
 *    inline z-index (100) which outranks a plain CSS z-index on the
 *    .prevControl/.nextControl buttons, hiding them under the photo.
 *    Re-assert an inline z-index here so they always sit on top.
 * 2. Keyboard navigation: Left / Right arrow keys flip slides.
 * 3. Touch swipe: horizontal swipe flips slides (cycle2's swipe
 *    plugin is NOT loaded, so this is a minimal native fallback).
 */
(function($){
  $(function(){
    // Guard: this script may be loaded more than once (duplicate <script>
    // tags), which would bind the keydown handler twice and make a single
    // arrow press flip two slides. Run the setup only once per page.
    if (window.__5GUYS_SLIDESHOW_NAV__) { return; }
    window.__5GUYS_SLIDESHOW_NAV__ = true;

    var $ss = $('#slideshow');
    if (!$ss.length || !$.fn.cycle) { return; }

    // ---- 1. force controls to the very top ----
    $('.panel.gallery .prevControl, .panel.gallery .nextControl, .panel.gallery .count')
      .css('zIndex', 9999);

    // ---- 2. keyboard navigation ----
    $(document).on('keydown', function(e){
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) { return; }
      if (e.key === 'ArrowRight' || e.keyCode === 39) {
        $ss.cycle('next');
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' || e.keyCode === 37) {
        $ss.cycle('prev');
        e.preventDefault();
      }
    });

    // ---- 3. touch swipe ----
    var startX = null, startY = null;
    $ss.on('touchstart', function(e){
      var t = e.originalEvent.touches[0];
      startX = t.clientX; startY = t.clientY;
    });
    $ss.on('touchend', function(e){
      if (startX === null) { return; }
      var t = e.originalEvent.changedTouches[0];
      var dx = t.clientX - startX;
      var dy = t.clientY - startY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) { $ss.cycle('next'); } else { $ss.cycle('prev'); }
      }
      startX = null; startY = null;
    });
  });
})(jQuery);
