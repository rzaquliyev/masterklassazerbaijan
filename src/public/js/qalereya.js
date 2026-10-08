// Qalereya lightbox: klik/tap ilə açılır, klaviatura ilə (Esc, ←, →) idarə olunur.
(function () {
  'use strict';
  var frames = document.querySelectorAll('[data-lightbox-open]');
  var lightbox = document.getElementById('lightbox');
  if (!frames.length || !lightbox) return;
  var closeBtn = document.getElementById('lightbox-close');
  var prevBtn = document.getElementById('lightbox-prev');
  var nextBtn = document.getElementById('lightbox-next');
  var current = -1;
  var lastFocused = null;

  function open(i) {
    current = i;
    lastFocused = document.activeElement;
    lightbox.hidden = false;
    closeBtn.focus();
  }
  function close() {
    lightbox.hidden = true;
    if (lastFocused) lastFocused.focus();
  }
  function move(delta) {
    current = (current + delta + frames.length) % frames.length;
  }

  frames.forEach(function (btn, i) {
    btn.addEventListener('click', function () { open(i); });
  });
  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function () { move(-1); });
  nextBtn.addEventListener('click', function () { move(1); });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') move(-1);
    else if (e.key === 'ArrowRight') move(1);
  });
})();
