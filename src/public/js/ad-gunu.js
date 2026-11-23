// Ad günü: şam üfürmə oyunu (AdGunu maketindən portlanıb). Client-only, heç nə saxlanmır.
(function () {
  'use strict';
  var card = document.getElementById('cake-card');
  if (!card) return;
  var candles = card.querySelectorAll('.candle');
  var done = document.getElementById('cake-done');
  var reset = document.getElementById('cake-reset');

  function outCount() { return card.querySelectorAll('.candle.is-out').length; }

  candles.forEach(function (c) {
    c.addEventListener('click', function () {
      if (c.classList.contains('is-out')) return;
      c.classList.add('is-out');
      c.setAttribute('aria-pressed', 'true');
      if (outCount() === candles.length) {
        done.textContent = reset.getAttribute('data-done-text');
        reset.hidden = false;
        if (window.MKMotion) window.MKMotion.confetti(card, 40);
      }
    });
  });

  reset.addEventListener('click', function () {
    candles.forEach(function (c) { c.classList.remove('is-out'); c.setAttribute('aria-pressed', 'false'); });
    done.textContent = '';
    reset.hidden = true;
    candles[0].focus();
  });
})();
