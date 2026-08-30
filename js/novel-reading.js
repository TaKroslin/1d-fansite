/* FIVE GUYS ONE DIRECTION — novel reading interactions */
(function ($) {
  "use strict";

  if (window.__5GUYS_NOVEL_READING__) return;
  window.__5GUYS_NOVEL_READING__ = true;

  $(function () {
    // Reuse the gallery panel interaction: the panel receives a `hover`
    // class while its CTA is hovered, so the border animation follows the
    // site's established behavior instead of moving the copy itself.
    $('.novel-feature-card a.more, .novel-chapter-card a.more').on('mouseenter focus', function () {
      $(this).closest('.novel-feature-card').addClass('hover');
      $(this).closest('.novel-chapter-card').addClass('hover');
    }).on('mouseleave blur', function () {
      $(this).closest('.novel-feature-card, .novel-chapter-card').removeClass('hover');
    });

    var $page = $(document.documentElement);
    var $bar = $('.novel-progress-bar');
    var $progress = $('.novel-progress');
    var ticking = false;

    function updateProgress() {
      if (!$bar.length) return;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var value = max > 0 ? Math.round((window.pageYOffset / max) * 100) : 0;
      value = Math.max(0, Math.min(100, value));
      $bar.css('width', value + '%');
      $progress.attr('aria-valuenow', value);
      ticking = false;
    }

    $(window).on('scroll.novelReading resize.novelReading', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateProgress);
        ticking = true;
      }
    });
    updateProgress();

    $('.novel-catalog a').on('click', function () {
      $('.novel-layout').removeClass('catalog-open');
      $('.catalog-toggle').attr('aria-expanded', 'false');
    });

    $(document).on('keydown.novelReading', function (event) {
      var target = event.target;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if ($page.hasClass('lang-fading')) return;
      if (event.key === 'ArrowLeft') {
        var prev = $('.chapter-nav a:not(.disabled)').first();
        if (prev.length && prev.attr('href') !== '#') { window.location.href = prev.attr('href'); event.preventDefault(); }
      } else if (event.key === 'ArrowRight') {
        var next = $('.chapter-nav a.next:not(.disabled)').first();
        if (next.length && next.attr('href') !== '#') { window.location.href = next.attr('href'); event.preventDefault(); }
      }
    });
  });
}(jQuery));
